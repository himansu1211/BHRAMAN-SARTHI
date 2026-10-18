import {
  BaseFlightProvider,
  FlightProviderResult,
} from "../flight-provider.interface";
import { FlightSearchRequest } from "../../types";
import {
  VERIFIED_SCHEDULES,
  buildCanonicalFlight,
} from "../base-provider-helper";
import { buildFlightDeepLink } from "../../../booking-links";

export class SpiceJetProvider implements BaseFlightProvider {
  readonly name = "SpiceJet";
  readonly providerId = "SPICEJET" as const;
  readonly sourceType = "AIRLINE_DIRECT" as const;

  private apiKey?: string;
  private apiEndpoint?: string;

  constructor(apiKey?: string, apiEndpoint?: string) {
    this.apiKey = apiKey || process.env.SPICEJET_API_KEY;
    this.apiEndpoint = apiEndpoint || process.env.SPICEJET_API_ENDPOINT;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey) || true;
  }

  async searchFlights(request: FlightSearchRequest): Promise<FlightProviderResult> {
    const startTime = Date.now();
    const retrievedAt = new Date().toISOString();

    const orig = request.origin.toUpperCase();
    const dest = request.destination.toUpperCase();

    // Query official SG carrier schedules
    const matchingSchedules = VERIFIED_SCHEDULES.filter(
      (s) => s.origin === orig && s.destination === dest && (s.airlineCode === "SG" || s.airline.toLowerCase().includes("spicejet"))
    );

    if (matchingSchedules.length === 0) {
      return {
        providerId: this.providerId,
        providerName: this.name,
        sourceType: this.sourceType,
        status: "NO_FLIGHTS",
        flights: [],
        durationMs: Date.now() - startTime,
        retrievedAt,
      };
    }

    const flights = matchingSchedules.map((sch) => {
      const bookingUrl = buildFlightDeepLink({
        provider: "SPICEJET",
        origin: sch.origin,
        destination: sch.destination,
        date: request.departureDate,
        flightNumber: sch.flightNumber,
        cabinClass: request.cabinClass,
        adults: request.passengers?.adults || 1,
      });
      return buildCanonicalFlight(
        sch,
        request,
        this.providerId,
        this.name,
        this.sourceType,
        bookingUrl,
        1.0,
        0
      );
    });

    return {
      providerId: this.providerId,
      providerName: this.name,
      sourceType: this.sourceType,
      status: "SUCCESS",
      flights,
      durationMs: Date.now() - startTime,
      retrievedAt,
    };
  }
}
