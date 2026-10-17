import { CITIES, CITY_COORDS } from "@/lib/data/locations";
import type { GeocodingProvider, GeoCity } from "@/lib/types/travel";

const CITY_ALIASES: Record<string, string> = {
  bangalore: "bangalore",
  bengaluru: "bangalore",
  blr: "bangalore",
  sbc: "bangalore",
  ypr: "bangalore",
  बेंगलुरु: "bangalore",
  बंगलौर: "bangalore",

  delhi: "delhi",
  "new delhi": "delhi",
  ndls: "delhi",
  del: "delhi",
  dli: "delhi",
  nzm: "delhi",
  दिल्ली: "delhi",
  नईदिल्ली: "delhi",
  "नई दिल्ली": "delhi",

  mumbai: "mumbai",
  bombay: "mumbai",
  bom: "mumbai",
  csmt: "mumbai",
  mmct: "mumbai",
  bdts: "mumbai",
  मुंबई: "mumbai",
  बंबई: "mumbai",

  hyderabad: "hyderabad",
  secunderabad: "hyderabad",
  hyd: "hyderabad",
  sc: "hyderabad",
  हैदराबाद: "hyderabad",

  chennai: "chennai",
  madras: "chennai",
  maa: "chennai",
  mas: "chennai",
  ms: "chennai",
  चेन्नई: "chennai",
  मद्रास: "chennai",

  pune: "pune",
  pnq: "pune",
  पुणे: "pune",

  kolkata: "kolkata",
  calcutta: "kolkata",
  ccu: "kolkata",
  hwh: "kolkata",
  sdah: "kolkata",
  कोलकाता: "kolkata",
  कलकत्ता: "kolkata",
};

export class MockGeocodingProvider implements GeocodingProvider {
  async listCities(): Promise<GeoCity[]> {
    return CITIES.map((city) => ({
      id: city.id,
      name: city.name,
      ...CITY_COORDS[city.id],
    }));
  }

  async resolveCity(query: string): Promise<GeoCity | null> {
    if (!query) return null;
    const raw = query.trim().toLowerCase();
    const clean = raw.split("—")[0].split("-")[0].trim();
    const cities = await this.listCities();

    // Direct match by id or name
    const direct = cities.find(
      (city) =>
        city.id === raw ||
        city.name.toLowerCase() === raw ||
        city.id === clean ||
        city.name.toLowerCase() === clean,
    );
    if (direct) return direct;

    // Alias lookup (station code, airport code, colloquial or Hindi name)
    const targetId = CITY_ALIASES[raw] || CITY_ALIASES[clean];
    if (targetId) {
      return cities.find((city) => city.id === targetId) ?? null;
    }

    // Substring / partial match
    return (
      cities.find(
        (city) =>
          city.id.includes(raw) ||
          city.name.toLowerCase().includes(raw) ||
          raw.includes(city.id) ||
          raw.includes(city.name.toLowerCase()),
      ) ?? null
    );
  }
}
