import fs from "fs";
import path from "path";

interface RawStation {
  station_code: string;
  station_name: string;
  state?: string;
  zone?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  trains_calling?: string;
  first_departure?: string;
  last_departure?: string;
}

interface RawAirport {
  airport_id: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  latitude: string;
  longitude: string;
  altitude_ft: string;
  tz_offset: string;
  dst: string;
  tz_database: string;
  type: string;
  source: string;
  routes_departing: string;
}

interface RawOurAirport {
  ident: string;
  type: string;
  name: string;
  latitude_deg: string;
  longitude_deg: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  icao_code: string;
  iata_code: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || "";
    }
    rows.push(obj as unknown as T);
  }

  return rows;
}

export function buildData() {
  const rawDir = path.join(process.cwd(), "data", "raw");
  const genDir = path.join(process.cwd(), "data", "generated");

  if (!fs.existsSync(genDir)) {
    fs.mkdirSync(genDir, { recursive: true });
  }

  console.log("🔨 Processing Raw Indian Railways Stations...");
  const stationFile = path.join(rawDir, "rail_stations.csv");
  const stationsRaw = parseCsv<RawStation>(stationFile);

  const stationsFromCsv = stationsRaw
    .filter((s) => s.station_code && s.station_name)
    .map((s) => ({
      code: s.station_code.trim().toUpperCase(),
      name: s.station_name.trim(),
      state: s.state ? s.state.trim() : "",
      zone: s.zone ? s.zone.trim() : "",
      lat: s.latitude ? parseFloat(s.latitude) || undefined : undefined,
      lng: s.longitude ? parseFloat(s.longitude) || undefined : undefined,
      trainsCalling: s.trains_calling ? parseInt(s.trains_calling, 10) || 0 : 0,
      firstDep: s.first_departure ? s.first_departure.trim() : undefined,
      lastDep: s.last_departure ? s.last_departure.trim() : undefined,
    }));

  const stationsByCode = new Map(stationsFromCsv.map((station) => [station.code, station]));
  const existingStationFile = path.join(genDir, "stations.json");
  if (fs.existsSync(existingStationFile)) {
    const existingStations = JSON.parse(fs.readFileSync(existingStationFile, "utf-8")) as typeof stationsFromCsv;
    for (const station of existingStations) {
      if (!stationsByCode.has(station.code)) stationsByCode.set(station.code, station);
    }
  }
  const stationsProcessed = [...stationsByCode.values()];

  fs.writeFileSync(
    path.join(genDir, "stations.json"),
    JSON.stringify(stationsProcessed),
    "utf-8"
  );
  console.log(`✅ Exported ${stationsProcessed.length} railway stations to data/generated/stations.json`);

  console.log("🔨 Processing Raw Indian Airports...");
  const airportFile = path.join(rawDir, "air_airports.csv");
  const airportsRaw = parseCsv<RawAirport>(airportFile);
  const airportByIata = new Map<string, {
    code: string; name: string; city: string; lat?: number; lng?: number; routesDeparting: number;
    ident?: string; icaoCode?: string; iataCode?: string; scheduledService?: boolean; airportType?: string; stateCode?: string;
  }>();

  for (const a of airportsRaw.filter((row) => row.iata && row.name && row.iata !== "\\N" && row.iata.length === 3)) {
    airportByIata.set(a.iata.trim().toUpperCase(), {
      code: a.iata.trim().toUpperCase(),
      name: a.name.trim(),
      city: a.city ? a.city.trim() : "",
      lat: a.latitude ? parseFloat(a.latitude) || undefined : undefined,
      lng: a.longitude ? parseFloat(a.longitude) || undefined : undefined,
      routesDeparting: a.routes_departing ? parseFloat(a.routes_departing) || 0 : 0,
      iataCode: a.iata.trim().toUpperCase(),
    });
  }

  const ourAirportsFile = path.join(rawDir, "ourairports-india.csv");
  if (fs.existsSync(ourAirportsFile)) {
    const ourAirports = parseCsv<RawOurAirport>(ourAirportsFile);
    for (const a of ourAirports) {
      const iata = a.iata_code?.trim().toUpperCase();
      const ident = a.ident?.trim().toUpperCase();
      const code = iata && iata.length === 3 ? iata : ident;
      if (!code || !a.name) continue;
      const previous = iata && iata.length === 3 ? airportByIata.get(iata) : undefined;
      const record = {
        code,
        name: a.name.trim(),
        city: a.municipality?.trim() || previous?.city || "",
        lat: a.latitude_deg ? parseFloat(a.latitude_deg) || undefined : undefined,
        lng: a.longitude_deg ? parseFloat(a.longitude_deg) || undefined : undefined,
        routesDeparting: previous?.routesDeparting || 0,
        ident,
        icaoCode: (a.icao_code || a.gps_code || "").trim().toUpperCase() || undefined,
        iataCode: iata && iata.length === 3 ? iata : undefined,
        scheduledService: a.scheduled_service === "1" || a.scheduled_service?.toLowerCase() === "yes",
        airportType: a.type?.trim(),
        stateCode: a.iso_region?.trim(),
      };
      if (iata && iata.length === 3) airportByIata.set(iata, record);
      else airportByIata.set(`OA:${code}`, record);
    }
  }

  const airportsProcessed = [...airportByIata.values()];

  fs.writeFileSync(
    path.join(genDir, "airports.json"),
    JSON.stringify(airportsProcessed),
    "utf-8"
  );
  console.log(`✅ Exported ${airportsProcessed.length} airports to data/generated/airports.json`);

  console.log("🎉 Data build completed successfully!");
}

if (require.main === module) {
  buildData();
}
