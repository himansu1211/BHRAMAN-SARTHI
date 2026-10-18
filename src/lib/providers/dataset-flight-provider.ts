import { TravelSegment } from "../types";
import { FlightProvider, FlightSearchParams } from "./provider-interface";
import airportsData from "../../../data/generated/airports.json";
import flightsData from "../../../data/generated/flights.json";

export interface AirportData {
  code: string;
  name: string;
  city: string;
  lat?: number;
  lng?: number;
  routesDeparting?: number;
  iataCode?: string;
  scheduledService?: boolean;
  airportType?: string;
}

export interface FlightScheduleData {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departTime: string; // HH:MM in IST
  arriveTime?: string;
  durationMinutes: number;
  baseFare: number;
  taxes: number;
  aircraft: string;
  terminalOrigin?: string;
  terminalDest?: string;
  days: string[];
  source?: string;
}

export interface FlightCorridorEndpoint {
  airportCode: string;
  latitude?: number;
  longitude?: number;
}

export interface FlightCorridorSearchResult {
  segments: TravelSegment[];
  originAirportCodes: string[];
  destinationAirportCodes: string[];
}

const AIRPORTS: AirportData[] = airportsData as AirportData[];
const AIRPORT_MAP = new Map<string, AirportData>();
for (const a of AIRPORTS) {
  AIRPORT_MAP.set(a.code, a);
}

// In-memory store initialized with scraped live flights
const FLIGHT_SCHEDULES: FlightScheduleData[] = [...(flightsData as FlightScheduleData[])];

// OpenFlights' route count is a historical metadata field, not an up-to-date
// indicator that an airport is operating passenger service today. Include the
// full geocoded airport catalog in candidate generation and let dated flight
// providers determine whether a usable flight actually exists.
const ROUTE_CATALOG_AIRPORT_CODES = new Set(
  FLIGHT_SCHEDULES.flatMap((schedule) => [schedule.origin, schedule.destination]),
);

function canCarryScheduledPassengers(airport: AirportData): boolean {
  return Boolean(
    airport.iataCode &&
    (airport.scheduledService || (airport.routesDeparting ?? 0) > 0 || ROUTE_CATALOG_AIRPORT_CODES.has(airport.code)),
  );
}

export class DatasetFlightProvider implements FlightProvider {
  async searchFlights(params: FlightSearchParams): Promise<TravelSegment[]> {
    const origCode = params.originCode.toUpperCase();
    const destCode = params.destinationCode.toUpperCase();

    // Use FlightSearchOrchestrator across all 6 verified sources with date-specific verification
    const { flightSearchOrchestrator } = await import("../flights/orchestrator/flight-search-orchestrator");
    const { flightToTravelSegment } = await import("../flights/bridge");

    const searchResponse = await flightSearchOrchestrator.searchFlights({
      origin: origCode,
      destination: destCode,
      departureDate: params.date,
      includeUnverified: true,
    });

    if (searchResponse.results.length === 0) {
      return [];
    }

    return searchResponse.results.map((f) => flightToTravelSegment(f));
  }


  /** Build a small, geography-aware flight graph for this search. Airport
   * candidates are selected around both entered cities and along their corridor,
   * rather than querying the national schedule table indiscriminately. */
  async searchCorridorFlights(origin: FlightCorridorEndpoint, destination: FlightCorridorEndpoint, date: string): Promise<FlightCorridorSearchResult> {
    const nearby = (endpoint: FlightCorridorEndpoint, maxKm: number) => {
      const point = endpoint.latitude == null || endpoint.longitude == null
        ? undefined
        : { lat: endpoint.latitude, lng: endpoint.longitude };
      const airportCandidates = AIRPORTS.filter((a) => canCarryScheduledPassengers(a) && a.lat != null && a.lng != null)
        .map((a) => ({ code: a.code, distance: point ? haversineKm(point.lat, point.lng, a.lat!, a.lng!) : Infinity }))
        .sort((a, b) => {
          const aHasRouteEvidence = ROUTE_CATALOG_AIRPORT_CODES.has(a.code) || (AIRPORT_MAP.get(a.code)?.routesDeparting ?? 0) > 0;
          const bHasRouteEvidence = ROUTE_CATALOG_AIRPORT_CODES.has(b.code) || (AIRPORT_MAP.get(b.code)?.routesDeparting ?? 0) > 0;
          return Number(bHasRouteEvidence) - Number(aHasRouteEvidence) || a.distance - b.distance;
        });
      const airports = airportCandidates.filter((a) => a.distance <= maxKm).slice(0, 3);
      // Even airports without historical route metadata remain searchable;
      // the dated provider response, rather than this static catalog, decides
      // whether a flight is offered.
      if (!airports.length && airportCandidates.length) airports.push(airportCandidates[0]);
      const selectedCodes = airports
        .map((a) => a.code);
      if (endpoint.airportCode) selectedCodes.unshift(endpoint.airportCode);
      return [...new Set(selectedCodes)];
    };

    const originAirports = nearby(origin, 300);
    const destinationAirports = nearby(destination, 300);
    if (!originAirports.length || !destinationAirports.length) {
      return { segments: [], originAirportCodes: originAirports, destinationAirportCodes: destinationAirports };
    }

    const originPoint = origin.latitude == null || origin.longitude == null ? undefined : { lat: origin.latitude, lng: origin.longitude };
    const destinationPoint = destination.latitude == null || destination.longitude == null ? undefined : { lat: destination.latitude, lng: destination.longitude };
    const candidates = AIRPORTS.filter((a) => canCarryScheduledPassengers(a) && a.lat != null && a.lng != null)
      .filter((a) => !originAirports.includes(a.code) && !destinationAirports.includes(a.code))
      .map((a) => ({ code: a.code, progress: originPoint && destinationPoint ? corridorProgress(originPoint, destinationPoint, a.lat!, a.lng!) : -1,
        offset: originPoint && destinationPoint ? corridorOffsetKm(originPoint, destinationPoint, a.lat!, a.lng!) : Infinity }))
      // Keep only forward-moving transfer airports reasonably close to the
      // straight corridor. A northern detour such as Delhi cannot enter a
      // south-central or east-west corridor simply due to flight volume.
      .filter((a) => a.progress > 0.12 && a.progress < 0.9 && a.offset <= 280)
      .sort((a, b) => a.offset - b.offset)
      .slice(0, 6)
      .map((a) => a.code);

    const viaAirports = new Set(candidates);
    const pairs = new Set<string>();
    // Always ask for city-to-city airport pairs, even when the bundled schedule
    // snapshot has no edge: configured live providers may know a newer route.
    for (const from of originAirports) {
      for (const to of destinationAirports) {
        if (from !== to) pairs.add(`${from}|${to}`);
      }
      for (const to of viaAirports) {
        if (from !== to) pairs.add(`${from}|${to}`);
      }
    }
    for (const from of viaAirports) {
      for (const to of destinationAirports) {
        if (from !== to) pairs.add(`${from}|${to}`);
      }
    }
    for (const schedule of FLIGHT_SCHEDULES) {
      if ((originAirports.includes(schedule.origin) && (destinationAirports.includes(schedule.destination) || viaAirports.has(schedule.destination))) ||
          (viaAirports.has(schedule.origin) && destinationAirports.includes(schedule.destination))) {
        pairs.add(`${schedule.origin}|${schedule.destination}`);
      }
    }

    const results = await Promise.all([...pairs].map(async (pair) => {
      const [originCode, destinationCode] = pair.split("|");
      return this.searchFlights({ originCode, destinationCode, date });
    }));
    return {
      segments: results.flat(),
      originAirportCodes: originAirports,
      destinationAirportCodes: destinationAirports,
    };
  }

  async getAllAvailableFlights(): Promise<TravelSegment[]> {
    // Route searches use searchCorridorFlights so every request stays scoped to
    // the entered cities and their plausible interchange airports.
    return [];
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (n: number) => n * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function corridorProgress(a: {lat:number;lng:number}, b: {lat:number;lng:number}, lat:number, lng:number): number {
  const dx = (b.lng - a.lng) * Math.cos((a.lat + b.lat) * Math.PI / 360), dy = b.lat - a.lat;
  const px = (lng - a.lng) * Math.cos((a.lat + b.lat) * Math.PI / 360), py = lat - a.lat;
  const lengthSq = dx * dx + dy * dy;
  return lengthSq ? (px * dx + py * dy) / lengthSq : -1;
}

function corridorOffsetKm(a: {lat:number;lng:number}, b: {lat:number;lng:number}, lat:number, lng:number): number {
  const progress = Math.max(0, Math.min(1, corridorProgress(a, b, lat, lng)));
  const nearestLat = a.lat + (b.lat - a.lat) * progress;
  const nearestLng = a.lng + (b.lng - a.lng) * progress;
  return haversineKm(nearestLat, nearestLng, lat, lng);
}
