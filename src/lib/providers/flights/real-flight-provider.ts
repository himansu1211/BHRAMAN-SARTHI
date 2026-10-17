import { AppError } from "@/lib/errors";
import type { FlightProvider, FlightSearchParams, TravelSegment } from "@/lib/types/travel";

export class RealFlightProvider implements FlightProvider {
  async searchFlights(_params: FlightSearchParams): Promise<TravelSegment[]> {
    if (!process.env.FLIGHT_API_KEY) {
      throw new AppError(
        "missing_api_key",
        "Flight API is not configured.",
        503,
      );
    }

    throw new AppError(
      "provider_unavailable",
      "Live flight search is not wired yet. Demo data is used instead.",
      503,
    );
  }
}
