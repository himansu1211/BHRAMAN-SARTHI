import { CITIES, CITY_COORDS } from "@/lib/data/locations";
import type { GeocodingProvider, GeoCity } from "@/lib/types/travel";

export class MockGeocodingProvider implements GeocodingProvider {
  async listCities(): Promise<GeoCity[]> {
    return CITIES.map((city) => ({
      id: city.id,
      name: city.name,
      ...CITY_COORDS[city.id],
    }));
  }

  async resolveCity(query: string): Promise<GeoCity | null> {
    const normalized = query.trim().toLowerCase();
    const cities = await this.listCities();
    return (
      cities.find(
        (city) =>
          city.id === normalized || city.name.toLowerCase() === normalized,
      ) ?? null
    );
  }
}
