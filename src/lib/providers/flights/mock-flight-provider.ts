import { FLIGHT_TEMPLATES } from "@/lib/providers/catalog";
import { instantiateTemplate, sanitizeSegment } from "@/lib/providers/instantiate";
import type { FlightProvider, FlightSearchParams, TravelSegment } from "@/lib/types/travel";

export class MockFlightProvider implements FlightProvider {
  async searchFlights(params: FlightSearchParams): Promise<TravelSegment[]> {
    return FLIGHT_TEMPLATES.map((template) =>
      instantiateTemplate(template, params.date),
    )
      .map(sanitizeSegment)
      .filter((segment): segment is TravelSegment => segment !== null)
      .filter((segment) => segment.from.cityId === params.originCity)
      .filter((segment) =>
        params.destinationCity
          ? segment.to.cityId === params.destinationCity
          : true,
      );
  }
}
