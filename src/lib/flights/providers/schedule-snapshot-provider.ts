import flightsData from "../../../../data/generated/flights.json";
import { buildFlightDeepLink } from "../../booking-links";
import { BaseFlightProvider, FlightProviderResult } from "./flight-provider.interface";
import { buildCanonicalFlight, RawFlightSchedule } from "./base-provider-helper";
import { FlightSearchRequest } from "../types";

const schedules = flightsData as RawFlightSchedule[];

/** Local timetable reference only; never represents live inventory or fares. */
export class ScheduleSnapshotProvider implements BaseFlightProvider {
  readonly name = "Bundled flight schedule snapshot";
  readonly providerId = "DATASET" as const;
  readonly sourceType = "DATASET_SNAPSHOT" as const;

  isConfigured(): boolean {
    return schedules.length > 0;
  }

  async searchFlights(request: FlightSearchRequest): Promise<FlightProviderResult> {
    const startedAt = Date.now();
    const retrievedAt = new Date().toISOString();
    const origin = request.origin.toUpperCase();
    const destination = request.destination.toUpperCase();
    const matchingSchedules = schedules.filter(
      (schedule) => schedule.origin === origin && schedule.destination === destination,
    );

    const flights = matchingSchedules.map((schedule) =>
      buildCanonicalFlight(
        schedule,
        request,
        this.providerId,
        this.name,
        this.sourceType,
        buildFlightDeepLink({
          provider: "SKYSCANNER",
          origin: schedule.origin,
          destination: schedule.destination,
          date: request.departureDate,
          flightNumber: schedule.flightNumber,
          cabinClass: request.cabinClass,
          adults: request.passengers?.adults ?? 1,
        }),
      ),
    );

    return {
      providerId: this.providerId,
      providerName: this.name,
      sourceType: this.sourceType,
      status: flights.length ? "SUCCESS" : "NO_FLIGHTS",
      flights,
      durationMs: Date.now() - startedAt,
      retrievedAt,
    };
  }
}
