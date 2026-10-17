import { AppError } from "@/lib/errors";
import { MockGeocodingProvider } from "@/lib/providers/maps/mock-geocoding-provider";
import type { GeocodingProvider, GeoCity } from "@/lib/types/travel";

export class RealGeocodingProvider implements GeocodingProvider {
  private readonly fallback = new MockGeocodingProvider();

  async listCities(): Promise<GeoCity[]> {
    return this.fallback.listCities();
  }

  async resolveCity(query: string): Promise<GeoCity | null> {
    if (!process.env.MAPS_API_KEY) {
      return this.fallback.resolveCity(query);
    }

    throw new AppError(
      "provider_unavailable",
      "Live geocoding is not wired yet.",
      503,
    );
  }
}
