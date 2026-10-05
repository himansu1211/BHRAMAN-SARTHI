import {
  Flight,
  FlightProviderId,
  FlightSearchDiagnostics,
  FlightSearchRequest,
  FlightSearchResponse,
  ProviderDiagnostic,
  ProviderStatusCode,
} from "../types";
import { BaseFlightProvider } from "../providers/flight-provider.interface";
import { ScheduleSnapshotProvider } from "../providers/schedule-snapshot-provider";
import { normalizeAndDeduplicateFlights } from "../normalization/flight-normalizer";
import { FlightVerificationService } from "../verification/flight-verification-service";

interface CacheEntry {
  response: FlightSearchResponse;
  expiresAt: number;
}

export class FlightSearchOrchestrator {
  private providers: BaseFlightProvider[];
  private verificationService: FlightVerificationService;
  private cache = new Map<string, CacheEntry>();

  // TTL Segregation:
  // Cached search results expire after five minutes. Bundled timetable matches
  // are snapshots and never imply live fare or seat availability.
  private static readonly AVAILABILITY_PRICE_CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(providers?: BaseFlightProvider[]) {
    this.verificationService = new FlightVerificationService();
    this.providers = providers || [new ScheduleSnapshotProvider()];
  }

  /**
   * Generates a cache key based on route, date, cabin class and passenger counts
   */
  private getCacheKey(req: FlightSearchRequest): string {
    const adults = req.passengers?.adults ?? 1;
    const cabin = req.cabinClass || "Economy";
    return `${req.origin.toUpperCase()}_${req.destination.toUpperCase()}_${req.departureDate}_${cabin}_${adults}`;
  }

  /**
   * Search configured providers concurrently. The default provider is a
   * timetable snapshot and is deliberately marked unverified.
   */
  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
    const searchId = `FLIGHT_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const cacheKey = this.getCacheKey(request);

    // Check availability cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        ...cached.response,
        searchId,
      };
    }

    const providerDiagnostics: Record<FlightProviderId, ProviderDiagnostic> = {
      DATASET: { providerId: "DATASET", providerName: "Bundled flight schedule snapshot", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      INDIGO: { providerId: "INDIGO", providerName: "IndiGo", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      AIR_INDIA: { providerId: "AIR_INDIA", providerName: "Air India", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      AKASA: { providerId: "AKASA", providerName: "Akasa Air", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      SPICEJET: { providerId: "SPICEJET", providerName: "SpiceJet", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      MAKEMYTRIP: { providerId: "MAKEMYTRIP", providerName: "MakeMyTrip", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      IXIGO: { providerId: "IXIGO", providerName: "ixigo", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
      SKYSCANNER: { providerId: "SKYSCANNER", providerName: "Skyscanner", status: "UNCONFIGURED", durationMs: 0, flightsFound: 0 },
    };

    const providerStatusMap: Record<FlightProviderId, ProviderStatusCode> = {
      DATASET: "UNCONFIGURED",
      INDIGO: "UNCONFIGURED",
      AIR_INDIA: "UNCONFIGURED",
      AKASA: "UNCONFIGURED",
      SPICEJET: "UNCONFIGURED",
      MAKEMYTRIP: "UNCONFIGURED",
      IXIGO: "UNCONFIGURED",
      SKYSCANNER: "UNCONFIGURED",
    };

    // Query all providers concurrently with a 3-second timeout per provider
    const timeoutMs = 3000;
    const providerPromises = this.providers.map(async (provider) => {
      const startTime = Date.now();
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Provider timeout exceeded")), timeoutMs)
        );

        const result = await Promise.race([provider.searchFlights(request), timeoutPromise]);
        const duration = Date.now() - startTime;

        providerDiagnostics[provider.providerId] = {
          providerId: provider.providerId,
          providerName: provider.name,
          status: result.status,
          durationMs: duration,
          flightsFound: result.flights.length,
          errorMessage: result.errorMessage,
        };
        providerStatusMap[provider.providerId] = result.status;

        return result.flights;
      } catch (err: unknown) {
        const duration = Date.now() - startTime;
        const msg = err instanceof Error ? err.message : "Provider failure";
        const isTimeout = msg.includes("timeout");

        providerDiagnostics[provider.providerId] = {
          providerId: provider.providerId,
          providerName: provider.name,
          status: isTimeout ? "TIMEOUT" : "ERROR",
          durationMs: duration,
          flightsFound: 0,
          errorMessage: msg,
        };
        providerStatusMap[provider.providerId] = isTimeout ? "TIMEOUT" : "ERROR";

        return [] as Flight[];
      }
    });

    const settledResults = await Promise.allSettled(providerPromises);
    const rawFlights: Flight[] = [];

    for (const settled of settledResults) {
      if (settled.status === "fulfilled") {
        rawFlights.push(...settled.value);
      }
    }

    const totalRawCount = rawFlights.length;

    // Step 1: Normalization & Deduplication across all 6 providers
    const deduplicatedFlights = normalizeAndDeduplicateFlights(rawFlights);
    const afterDeduplicationCount = deduplicatedFlights.length;

    // Step 2: Verification Engine & Date-Specific Validation
    const verifiedFlights: Flight[] = [];
    let afterDateValidationCount = 0;
    let afterCancellationFilteringCount = 0;
    let afterAvailabilityCount = 0;

    for (const fl of deduplicatedFlights) {
      const evaluation = this.verificationService.verifyFlight(fl, request);

      // Check operating days
      const depDayCheck = evaluation.flight.verification.checks.find((c) => c.checkId === "OPERATING_DAY");
      if (depDayCheck?.passed) {
        afterDateValidationCount++;
      }

      // Check cancellation
      if (evaluation.flight.operatingStatus !== "CANCELLED") {
        afterCancellationFilteringCount++;
      }

      // Check seat availability
      if (evaluation.flight.availability.status !== "SOLD_OUT") {
        afterAvailabilityCount++;
      }

      // Filter: only pass flights that satisfy critical operational integrity
      if (evaluation.passed || request.includeUnverified) {
        verifiedFlights.push(evaluation.flight);
      }
    }

    // Step 3: Apply User Filters (direct only, max stops, preferred airlines)
    let filteredResults = verifiedFlights;

    if (request.directOnly) {
      filteredResults = filteredResults.filter((f) => f.stops === 0);
    } else if (typeof request.maxStops === "number") {
      filteredResults = filteredResults.filter((f) => f.stops <= request.maxStops!);
    }

    if (request.preferredAirlines && request.preferredAirlines.length > 0) {
      const allowed = new Set(request.preferredAirlines.map((a) => a.toUpperCase()));
      filteredResults = filteredResults.filter((f) => allowed.has(f.airline.code.toUpperCase()));
    }

    // Step 4: Sorting
    const sort = request.sortPreference || "recommended";
    filteredResults.sort((a, b) => {
      if (sort === "price_low_high") {
        return a.fare.totalAmount - b.fare.totalAmount;
      }
      if (sort === "departure_earliest") {
        return a.departure.scheduledTime.localeCompare(b.departure.scheduledTime);
      }
      if (sort === "arrival_earliest") {
        return a.arrival.scheduledTime.localeCompare(b.arrival.scheduledTime);
      }
      if (sort === "duration_shortest") {
        return a.durationMinutes - b.durationMinutes;
      }

      // Recommended default sort:
      // 1. High confidence verification first
      const confRank: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const rankA = confRank[a.verification.confidence] || 0;
      const rankB = confRank[b.verification.confidence] || 0;
      if (rankA !== rankB) return rankB - rankA;

      // 2. Direct flights first
      if (a.stops !== b.stops) return a.stops - b.stops;

      // 3. Lowest total fare
      return a.fare.totalAmount - b.fare.totalAmount;
    });

    const diagnostics: FlightSearchDiagnostics = {
      searchId,
      timestamp,
      origin: request.origin,
      destination: request.destination,
      date: request.departureDate,
      totalRawFlightsReceived: totalRawCount,
      afterNormalizationCount: totalRawCount,
      afterDeduplicationCount,
      afterDateValidationCount,
      afterCancellationFilteringCount,
      afterAvailabilityVerificationCount: afterAvailabilityCount,
      finalVerifiedFlightsCount: filteredResults.length,
      providerDiagnostics,
    };

    const response: FlightSearchResponse = {
      searchId,
      request,
      results: filteredResults,
      providers: providerStatusMap,
      diagnostics,
    };

    // Cache result if we found flights or valid response
    this.cache.set(cacheKey, {
      response,
      expiresAt: Date.now() + FlightSearchOrchestrator.AVAILABILITY_PRICE_CACHE_TTL_MS,
    });

    return response;
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const flightSearchOrchestrator = new FlightSearchOrchestrator();
