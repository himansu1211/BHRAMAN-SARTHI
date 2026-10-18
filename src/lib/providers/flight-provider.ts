import { TravelSegment } from "../types";
import { FlightProvider, FlightSearchParams } from "./provider-interface";
import { generateSegmentsForDate } from "./mock-data";

export class MockFlightProvider implements FlightProvider {
  async searchFlights(params: FlightSearchParams): Promise<TravelSegment[]> {
    const all = await this.getAllAvailableFlights(params.date);
    return all.filter(
      (seg) =>
        seg.type === "flight" &&
        seg.fromCode === params.originCode &&
        seg.toCode === params.destinationCode
    );
  }

  async getAllAvailableFlights(date: string): Promise<TravelSegment[]> {
    const segments = generateSegmentsForDate(date);
    return segments.filter((s) => s.type === "flight");
  }
}



import { ProviderCache, fetchWithTimeoutAndRetry, validateSegmentBoundary } from "./api-adapter-utils";

const flightCache = new ProviderCache<TravelSegment[]>(5 * 60 * 1000);

export class RealFlightProvider implements FlightProvider {
  private apiKey?: string;
  private apiEndpoint?: string;

  constructor(apiKey?: string, apiEndpoint?: string) {
    this.apiKey = apiKey || process.env.FLIGHT_API_KEY;
    this.apiEndpoint = apiEndpoint || process.env.FLIGHT_API_ENDPOINT || "https://api.skyscanner.net/flights/v1";
  }

  async searchFlights(params: FlightSearchParams): Promise<TravelSegment[]> {
    if (!this.apiKey) {
      const fallback = new MockFlightProvider();
      return fallback.searchFlights(params);
    }

    const cacheKey = `flt_${params.originCode}_${params.destinationCode}_${params.date}`;
    const cached = flightCache.get(cacheKey);
    if (cached) return cached;

    try {
      const rawData = await fetchWithTimeoutAndRetry<TravelSegment[]>(
        `${this.apiEndpoint}/search?origin=${params.originCode}&dest=${params.destinationCode}&date=${params.date}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeoutMs: 5000,
          retries: 2,
        }
      );

      const validSegments: TravelSegment[] = (rawData || [])
        .filter(validateSegmentBoundary)
        .map((s) => ({
          ...s,
          providerSource: "Skyscanner" as const,
          dataSource: "live-api" as const,
        }));

      flightCache.set(cacheKey, validSegments);
      return validSegments;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[RealFlightProvider] External API failed: ${errMsg}. Falling back to mock dataset.`);
      const fallback = new MockFlightProvider();
      return fallback.searchFlights(params);
    }
  }

  async getAllAvailableFlights(date: string): Promise<TravelSegment[]> {
    if (!this.apiKey) {
      const fallback = new MockFlightProvider();
      return fallback.getAllAvailableFlights(date);
    }
    const fallback = new MockFlightProvider();
    return fallback.getAllAvailableFlights(date);
  }
}

// Factory function
export function getFlightProvider(): FlightProvider {
  if (process.env.FLIGHT_API_KEY) {
    return new RealFlightProvider(process.env.FLIGHT_API_KEY);
  }
  return new MockFlightProvider();
}
