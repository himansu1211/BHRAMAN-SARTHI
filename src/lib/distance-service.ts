import distancesData from "../../data/generated/distances.json";
import stationsData from "../../data/generated/stations.json";
import airportsData from "../../data/generated/airports.json";
import { InterchangeTransit, TravelRoute, TravelSegment } from "./types";

export interface InterCityDistanceInfo {
  origin: string;
  destination: string;
  roadKm: number;
  railKm: number;
  flightKm: number;
  roadHours: number;
  railHours: number;
  flightHours: number;
  primaryHighway?: string;
  source: "google-maps-verified" | "calibrated-haversine";
}

export interface StationAirportDistanceResult {
  stationCode: string;
  stationName: string;
  airportCode: string;
  airportName: string;
  aerialDistanceKm: number;
  roadDistanceKm: number;
  driveTimeMinutes: number;
}

interface StationItem {
  code: string;
  name: string;
  lat?: number;
  lng?: number;
}

interface AirportItem {
  code: string;
  name: string;
  city?: string;
  lat?: number;
  lng?: number;
}

const STATIONS_MAP = new Map<string, StationItem>();
for (const s of (stationsData as StationItem[])) {
  if (s.code) STATIONS_MAP.set(s.code.toUpperCase(), s);
}

const AIRPORTS_MAP = new Map<string, AirportItem>();
for (const a of (airportsData as AirportItem[])) {
  if (a.code) AIRPORTS_MAP.set(a.code.toUpperCase(), a);
}

const INTRA_CITY_INDEX = distancesData.intraCityInterchanges as Record<string, InterchangeTransit[]>;

// Quick lookup index for inter-city matrix: "ORIGIN|DEST"
const INTER_CITY_INDEX = new Map<string, any>();
for (const row of distancesData.interCityDistances) {
  INTER_CITY_INDEX.set(`${row.origin}|${row.destination}`, row);
  INTER_CITY_INDEX.set(`${row.destination}|${row.origin}`, row);
}

const ROAD_CIRCUITY_RATIO = distancesData.calibrationFactors.roadCircuityRatio || 1.28;
const RAIL_TRACK_RATIO = distancesData.calibrationFactors.railTrackRatio || 1.22;
const AVG_HIGHWAY_SPEED_KMPH = distancesData.calibrationFactors.averageHighwaySpeedKmph || 72;

/**
 * High-precision Great-Circle distance in kilometers between two lat/lng points.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates road driving distance (km) based on Google Maps road circuity calibration.
 */
export function calculateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const aerial = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return Math.round(aerial * ROAD_CIRCUITY_RATIO * 10) / 10;
}

/**
 * Calculates railway track route distance (km) based on Indian Railways track curvature.
 */
export function calculateRailDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const aerial = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return Math.round(aerial * RAIL_TRACK_RATIO * 10) / 10;
}

/**
 * Retrieves intra-city terminal interchange transit route (with Google Maps road distance and transit duration)
 */
export function getIntraCityInterchange(
  cityId: string,
  fromNodeCode: string,
  toNodeCode: string
): InterchangeTransit | undefined {
  if (fromNodeCode === toNodeCode) return undefined;

  const list = INTRA_CITY_INDEX[cityId] || [];
  const found = list.find(
    (item) =>
      (item.fromNodeCode === fromNodeCode && item.toNodeCode === toNodeCode) ||
      (item.fromNodeCode === toNodeCode && item.toNodeCode === fromNodeCode)
  );

  if (found) return found;

  // If not explicitly listed, calculate based on geographical coordinates if available
  const nodeA = STATIONS_MAP.get(fromNodeCode) || AIRPORTS_MAP.get(fromNodeCode);
  const nodeB = STATIONS_MAP.get(toNodeCode) || AIRPORTS_MAP.get(toNodeCode);

  const latA = nodeA?.lat;
  const lngA = nodeA?.lng;
  const latB = nodeB?.lat;
  const lngB = nodeB?.lng;

  let roadDist = 18;
  if (latA && lngA && latB && lngB) {
    roadDist = calculateRoadDistanceKm(latA, lngA, latB, lngB);
  }

  const durationMinutes = Math.max(15, Math.round((roadDist / 32) * 60)); // ~32 km/h city traffic speed
  const estCost = Math.round(150 + roadDist * 18); // ~₹18/km city cab

  return {
    fromNodeCode,
    toNodeCode,
    cityId,
    mode: "cab",
    durationMinutes,
    distanceKm: roadDist,
    description: `City road transit / prepaid cab transfer via main arterial road (${roadDist} km)`,
    estCost,
  };
}

/**
 * Retrieves inter-city distance details across Highway, Rail, and Flight modes.
 */
export function getInterCityDistance(
  originId: string,
  destId: string,
  originCoords?: { lat: number; lng: number },
  destCoords?: { lat: number; lng: number }
): InterCityDistanceInfo {
  const o = originId.toUpperCase();
  const d = destId.toUpperCase();

  const hit = INTER_CITY_INDEX.get(`${o}|${d}`);
  if (hit) {
    return {
      origin: o,
      destination: d,
      roadKm: hit.roadKm,
      railKm: hit.railKm,
      flightKm: hit.flightKm,
      roadHours: hit.roadHours,
      railHours: hit.railHours,
      flightHours: hit.flightHours,
      primaryHighway: hit.primaryHighway,
      source: "google-maps-verified",
    };
  }

  // Calculate from coordinates
  let lat1 = originCoords?.lat;
  let lon1 = originCoords?.lng;
  let lat2 = destCoords?.lat;
  let lon2 = destCoords?.lng;

  if (!lat1 || !lon1) {
    const s = STATIONS_MAP.get(o);
    const a = AIRPORTS_MAP.get(o);
    lat1 = s?.lat ?? a?.lat ?? 12.97;
    lon1 = s?.lng ?? a?.lng ?? 77.59;
  }

  if (!lat2 || !lon2) {
    const s = STATIONS_MAP.get(d);
    const a = AIRPORTS_MAP.get(d);
    lat2 = s?.lat ?? a?.lat ?? 28.61;
    lon2 = s?.lng ?? a?.lng ?? 77.20;
  }

  const flightKm = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  const roadKm = Math.round(flightKm * ROAD_CIRCUITY_RATIO);
  const railKm = Math.round(flightKm * RAIL_TRACK_RATIO);

  const roadHours = Math.round((roadKm / AVG_HIGHWAY_SPEED_KMPH) * 10) / 10;
  const railHours = Math.round((railKm / 68) * 10) / 10;
  const flightHours = Math.round((flightKm / 600 + 0.5) * 10) / 10;

  return {
    origin: o,
    destination: d,
    roadKm,
    railKm,
    flightKm,
    roadHours,
    railHours,
    flightHours,
    source: "calibrated-haversine",
  };
}

/**
 * Finds the nearest commercial airport to a given railway station.
 */
export function findNearestAirportToStation(
  stationCode: string
): StationAirportDistanceResult | null {
  const station = STATIONS_MAP.get(stationCode.toUpperCase());
  if (!station || !station.lat || !station.lng) return null;

  let nearestAirport: AirportItem | null = null;
  let minDistance = Infinity;

  for (const airport of AIRPORTS_MAP.values()) {
    if (!airport.lat || !airport.lng) continue;
    const dist = calculateHaversineDistanceKm(
      station.lat,
      station.lng,
      airport.lat,
      airport.lng
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestAirport = airport;
    }
  }

  if (!nearestAirport) return null;

  const roadDist = Math.round(minDistance * ROAD_CIRCUITY_RATIO * 10) / 10;
  const driveTime = Math.max(10, Math.round((roadDist / 40) * 60));

  return {
    stationCode: station.code,
    stationName: station.name,
    airportCode: nearestAirport.code,
    airportName: nearestAirport.name,
    aerialDistanceKm: minDistance,
    roadDistanceKm: roadDist,
    driveTimeMinutes: driveTime,
  };
}

/**
 * Calculates total route distance in km across all segments and transfers.
 */
export function calculateRouteTotalDistance(
  segments: TravelSegment[],
  interchanges?: InterchangeTransit[]
): number {
  let totalKm = 0;

  for (const seg of segments) {
    if (seg.distanceKm) {
      totalKm += seg.distanceKm;
    } else {
      // Calculate from codes
      const distInfo = getInterCityDistance(seg.fromCode, seg.toCode);
      const segKm = seg.type === "flight" ? distInfo.flightKm : distInfo.railKm;
      totalKm += segKm;
      seg.distanceKm = segKm;
    }
  }

  if (interchanges) {
    for (const item of interchanges) {
      totalKm += item.distanceKm || 15;
    }
  }

  return Math.round(totalKm * 10) / 10;
}
