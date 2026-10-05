import { CityHub } from "./types";
import { INDIAN_CITIES } from "./constants";
import stationsData from "../../data/generated/stations.json";
import airportsData from "../../data/generated/airports.json";

export interface StationRecord {
  code: string;
  name: string;
  state?: string;
  zone?: string;
  trainsCalling?: number;
  lat?: number;
  lng?: number;
}

export interface AirportRecord {
  code: string;
  name: string;
  city: string;
  routesDeparting?: number;
  lat?: number;
  lng?: number;
  ident?: string;
  icaoCode?: string;
  iataCode?: string;
  scheduledService?: boolean;
  airportType?: string;
  stateCode?: string;
}

const STATIONS: StationRecord[] = stationsData as StationRecord[];
const AIRPORTS: AirportRecord[] = airportsData as AirportRecord[];

// City names and spelling variants supplied in the all-India corridor list.
// Targets are canonical city hubs or exact station codes from the local rail
// index, so every selected location retains real station coordinates.
const LOCATION_ALIASES: Record<string, string[]> = {
  bengaluru: ["BLR"], bangalore: ["BLR"], secunderabad: ["SECUNDERABAD_CITY"], hyderabad: ["HYD"],
  nagpur: ["NAG"], vijayawada: ["BZA"], visakhapatnam: ["VTZ"], vishakapatnam: ["VTZ"],
  madurai: ["IXM"], chennai: ["MAA"], coimbatore: ["CJB"], katpadi: ["KPD"],
  raipur: ["R"], bilaspur: ["BSP_CITY"], solapur: ["SUR"], pune: ["PNQ"], mumbai: ["BOM"],
  shanbhajinagar: ["AWB"], "chhatrapati sambhajinagar": ["AWB"], aurangabad: ["AWB"],
  bhubaneswar: ["BBI"], bhibaneswar: ["BBI"], brahmapur: ["BAM_CITY"], berhampur: ["BAM_CITY"],
  puri: ["PURI_CITY"], cuttack: ["CTC"], howrah: ["CCU"], guwahati: ["GAU"], dibrugarh: ["DBRG"],
  lucknow: ["LKO"], kanpur: ["KNU"], patna: ["PAT"], dhanbad: ["DHN"], tatanagar: ["TATA"], ranchi: ["IXR"],
  bhopal: ["BHO"], gwalior: ["GWL"], indore: ["IDR"], jhansi: ["JHS"], ujjain: ["UJN"],
  ahmedabad: ["AMD"], gandhinagar: ["GNC"], ganshinagar: ["GNC"], surat: ["STV"], vadodara: ["BDQ"],
  anand: ["ANND"], rajkot: ["RJT"], okha: ["OKHA"], jaipur: ["JAI"], udaipur: ["UDR"], jodhpur: ["JU"],
  chandigarh: ["IXC"], delhi: ["DEL"], ghaziabad: ["GZB"], meerut: ["MTC"], roorkee: ["RK"],
  dehradun: ["DED"], rishikesh: ["RKSH"], shimla: ["SML"], katra: ["SVDK"], amritsar: ["ATQ"],
  jalandhar: ["JUC"], jalandar: ["JUC"], rohtak: ["ROK"],
  "phulwari sharif": ["PWS"], phulera: ["FL"],
  phulwada: ["PWS"],
};
const AMBIGUOUS_LOCATION_ALIASES: Record<string, string[]> = {
  phulwada: ["PWS", "FL"],
};
const STATION_STATES: Record<string, string> = {
  BZA: "Andhra Pradesh", VSKP: "Andhra Pradesh", KPD: "Tamil Nadu", R: "Chhattisgarh", BSP: "Chhattisgarh",
  SUR: "Maharashtra", AWB: "Maharashtra", CTC: "Odisha", DBRG: "Assam", DHN: "Jharkhand", TATA: "Jharkhand",
  RNC: "Jharkhand", GWL: "Madhya Pradesh", JHS: "Uttar Pradesh", UJN: "Madhya Pradesh", ANND: "Gujarat",
  GZB: "Uttar Pradesh", RK: "Uttarakhand", PWS: "Bihar", FL: "Rajasthan", JUC: "Punjab",
};

function normalizeLocation(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const STATIONS_BY_CODE = new Map<string, StationRecord>();
for (const s of STATIONS) {
  STATIONS_BY_CODE.set(s.code, s);
}

const AIRPORTS_BY_CODE = new Map<string, AirportRecord>();
for (const a of AIRPORTS) {
  AIRPORTS_BY_CODE.set(a.code, a);
}

function nearestAirport(stationCode: string): AirportRecord | undefined {
  const station = STATIONS_BY_CODE.get(stationCode);
  if (station?.lat == null || station.lng == null) return undefined;
  const geocodedAirports = AIRPORTS.filter((airport) => airport.lat != null && airport.lng != null && airport.iataCode && (airport.scheduledService || (airport.routesDeparting ?? 0) > 0));
  return geocodedAirports
    .sort((a, b) => {
      // Keep historical route counts as a tie-breaker only. They are not a
      // reliable current-service flag and must not make an airport disappear.
      const distance = (airport: AirportRecord) =>
        Math.hypot((airport.lat! - station.lat!) * 111, (airport.lng! - station.lng!) * 103);
      return distance(a) - distance(b) || (b.routesDeparting ?? 0) - (a.routesDeparting ?? 0);
    })[0];
}

const NEAREST_STATION_BY_AIRPORT = new Map<string, StationRecord | undefined>();
function nearestStationForAirport(airport: AirportRecord): StationRecord | undefined {
  if (NEAREST_STATION_BY_AIRPORT.has(airport.code)) return NEAREST_STATION_BY_AIRPORT.get(airport.code);
  const station = airport.lat == null || airport.lng == null ? undefined : STATIONS
    .filter((candidate) => (candidate.trainsCalling ?? 0) > 0 && candidate.lat != null && candidate.lng != null)
    .map((candidate) => ({ candidate, distance: Math.hypot((candidate.lat! - airport.lat!) * 111, (candidate.lng! - airport.lng!) * 103) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const nearest = station && station.distance <= 50 ? station.candidate : undefined;
  NEAREST_STATION_BY_AIRPORT.set(airport.code, nearest);
  return nearest;
}

function nearbyMajorStationCodes(station: StationRecord | undefined): string[] {
  if (!station || station.lat == null || station.lng == null) return [];
  return STATIONS.filter((candidate) => candidate.code !== station.code && (candidate.trainsCalling ?? 0) >= 150 && candidate.lat != null && candidate.lng != null)
    .map((candidate) => ({
      code: candidate.code,
      distance: Math.hypot((candidate.lat! - station.lat!) * 111, (candidate.lng! - station.lng!) * 103),
    }))
    .filter((candidate) => candidate.distance <= 80)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((candidate) => candidate.code);
}

// Each regional anchor uses its real railway station and nearest airport with
// represented departures. Airport routes always add a separately displayed
// ground transfer; no regional station is treated as an airport.
const REGIONAL_HUBS: CityHub[] = [
  { id: "SECUNDERABAD_CITY", name: "Secunderabad", state: "Telangana", airportCode: "HYD", airportName: "Rajiv Gandhi Intl Airport (ground transfer required)", stationCode: "SC", stationName: "Secunderabad Junction", nearbyStationCodes: nearbyMajorStationCodes(STATIONS_BY_CODE.get("SC")), busTerminalCode: "MGBS", busTerminalName: "Mahatma Gandhi Bus Station", zone: "SCR", latitude: 17.4399, longitude: 78.4983 },
  { id: "BSP_CITY", name: "Bilaspur", state: "Chhattisgarh", airportCode: nearestAirport("BSP")?.code ?? "", airportName: nearestAirport("BSP") ? `${nearestAirport("BSP")!.name} (ground transfer required)` : "No represented airport", stationCode: "BSP", stationName: "Bilaspur Junction", nearbyStationCodes: nearbyMajorStationCodes(STATIONS_BY_CODE.get("BSP")), busTerminalCode: "", busTerminalName: "", zone: "SECR", latitude: 22.06, longitude: 82.17 },
  { id: "PURI_CITY", name: "Puri", state: "Odisha", airportCode: nearestAirport("PURI")?.code ?? "", airportName: nearestAirport("PURI") ? `${nearestAirport("PURI")!.name} (ground transfer required)` : "No represented airport", stationCode: "PURI", stationName: "Puri", nearbyStationCodes: nearbyMajorStationCodes(STATIONS_BY_CODE.get("PURI")), busTerminalCode: "", busTerminalName: "", zone: "ECoR", latitude: 19.81, longitude: 85.84 },
  { id: "BAM_CITY", name: "Berhampur", state: "Odisha", airportCode: nearestAirport("BAM")?.code ?? "", airportName: nearestAirport("BAM") ? `${nearestAirport("BAM")!.name} (ground transfer required)` : "No represented airport", stationCode: "BAM", stationName: "Brahmapur", nearbyStationCodes: nearbyMajorStationCodes(STATIONS_BY_CODE.get("BAM")), busTerminalCode: "", busTerminalName: "", zone: "ECoR", latitude: 19.30, longitude: 84.80 },
];

export function searchAllLocations(query: string, maxResults: number = 15): CityHub[] {
  const q = query.toLowerCase().trim();
  if (!q) {
    const plannedTargets = [...Object.values(LOCATION_ALIASES), ...Object.values(AMBIGUOUS_LOCATION_ALIASES)].flat();
    const plannedHubs = [...new Set(plannedTargets)].map(resolveCityHub);
    const uniqueHubs = new Map<string, CityHub>();
    for (const hub of [...INDIAN_CITIES, ...REGIONAL_HUBS, ...plannedHubs]) uniqueHubs.set(hub.id, hub);
    return [...uniqueHubs.values()];
  }

  const matchedHubs: CityHub[] = REGIONAL_HUBS.filter((hub) =>
    [hub.name, hub.stationCode, hub.state].some((value) => value.toLowerCase().includes(q))
  );
  const seenIds = new Set(matchedHubs.flatMap((hub) => [hub.id, hub.stationCode, hub.airportCode].filter(Boolean)));

  const normalizedQuery = normalizeLocation(q);
  const aliasTargets = [...new Set([...(LOCATION_ALIASES[normalizedQuery] ?? []), ...(AMBIGUOUS_LOCATION_ALIASES[normalizedQuery] ?? [])])];
  for (const target of aliasTargets) {
    const hub = resolveCityHub(target);
    if (!seenIds.has(hub.id)) {
      matchedHubs.unshift(hub);
      seenIds.add(hub.id);
      seenIds.add(hub.stationCode);
      seenIds.add(hub.airportCode);
    }
  }

  // 1. First match against primary INDIAN_CITIES
  for (const c of INDIAN_CITIES) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.airportCode.toLowerCase().includes(q) ||
      c.stationCode.toLowerCase().includes(q) ||
      c.busTerminalCode.toLowerCase().includes(q)
    ) {
      if (!seenIds.has(c.id)) matchedHubs.push(c);
      seenIds.add(c.id);
      seenIds.add(c.stationCode);
      seenIds.add(c.airportCode);
    }
  }

  // 2. Match against raw railway stations dataset (8966 stations)
  for (const s of STATIONS) {
    if (matchedHubs.length >= maxResults) break;
    if (s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
      const hubId = s.code;
      if (!seenIds.has(hubId)) {
        seenIds.add(hubId);
        const airport = nearestAirport(s.code);
        matchedHubs.push({
          id: s.code,
          name: s.name,
          state: s.state || STATION_STATES[s.code.toUpperCase()] || "India",
          airportCode: airport?.code ?? "",
          airportName: airport ? `${airport.name} (ground transfer required)` : "No airport mapped",
          stationCode: s.code,
          stationName: s.name,
          busTerminalCode: "",
          busTerminalName: "",
          zone: s.zone || "IR",
          trainsCalling: s.trainsCalling || 0,
          latitude: s.lat,
          longitude: s.lng,
          nearbyStationCodes: nearbyMajorStationCodes(s),
        });
      }
    }
  }

  // 3. Match against airports dataset (121 airports)
  for (const a of AIRPORTS) {
    if (matchedHubs.length >= maxResults) break;
    if (a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)) {
      const hubId = a.code;
      if (!seenIds.has(hubId)) {
        seenIds.add(hubId);
        matchedHubs.push({
          id: a.code,
          name: a.city || a.name,
          state: "India",
          airportCode: a.iataCode || "",
          airportName: a.name,
          stationCode: "",
          stationName: "No rail station mapped",
          busTerminalCode: "",
          busTerminalName: "",
        });
      }
    }
  }

  return matchedHubs;
}

export function resolveCityHub(codeOrId: string): CityHub {
  const normalized = normalizeLocation(codeOrId);
  const aliasTargets = LOCATION_ALIASES[normalized];
  const upper = (aliasTargets?.[0] ?? codeOrId).toUpperCase().trim();
  const regional = REGIONAL_HUBS.find((hub) => hub.id === upper || hub.stationCode === upper || hub.name.toUpperCase() === upper);
  if (regional) return regional;
  // 1. Direct match in INDIAN_CITIES
  const direct = INDIAN_CITIES.find(
    (c) =>
      c.id.toUpperCase() === upper ||
      c.airportCode.toUpperCase() === upper ||
      c.stationCode.toUpperCase() === upper ||
      c.busTerminalCode.toUpperCase() === upper
  );
  if (direct) return direct;

  // 2. Match in railway stations dataset
  const stn = STATIONS_BY_CODE.get(upper);
  if (stn) {
    const airport = nearestAirport(stn.code);
    return {
      id: stn.code,
      name: stn.name,
      state: stn.state || STATION_STATES[stn.code.toUpperCase()] || "India",
      airportCode: airport?.code ?? "",
      airportName: airport ? `${airport.name} (ground transfer required)` : "No airport mapped",
      stationCode: stn.code,
      stationName: stn.name,
      busTerminalCode: "",
      busTerminalName: "",
      zone: stn.zone || "IR",
      trainsCalling: stn.trainsCalling,
      latitude: stn.lat,
      longitude: stn.lng,
      nearbyStationCodes: nearbyMajorStationCodes(stn),
    };
  }

  // 3. Match in airports dataset
  const apt = AIRPORTS_BY_CODE.get(upper);
  if (apt) {
    const nearbyStation = nearestStationForAirport(apt);
    return {
      id: nearbyStation?.code ?? apt.code,
      name: apt.city || apt.name,
      state: nearbyStation?.state || "India",
      airportCode: apt.iataCode || "",
      airportName: apt.name,
      stationCode: nearbyStation?.code ?? "",
      stationName: nearbyStation?.name ?? "No rail station mapped",
      nearbyStationCodes: nearbyStation ? nearbyMajorStationCodes(nearbyStation) : [],
      busTerminalCode: "",
      busTerminalName: "",
      latitude: apt.lat,
      longitude: apt.lng,
    };
  }

  // Fallback fallback default Hub
  return {
    id: upper,
    name: upper,
    state: "India",
    airportCode: "",
    airportName: "No airport mapped",
    stationCode: "",
    stationName: "No rail station mapped",
    busTerminalCode: "",
    busTerminalName: "",
  };
}
