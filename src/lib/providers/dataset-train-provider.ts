import { TravelSegment } from "../types";
import { TrainProvider, TrainSearchParams } from "./provider-interface";
import { buildTrainDeepLink } from "../booking-links";
import stationsData from "../../../data/generated/stations.json";
import trainsData from "../../../data/generated/trains.json";
import trainClassification from "../../../data/generated/train-classification.json";
import { stationGroupFor, STATION_GROUPS } from "../station-groups";
import { INDIAN_CITIES } from "../constants";

/* ─── Station lookup ────────────────────────────────────────────── */

export interface StationData {
  code: string;
  name: string;
  state?: string;
  zone?: string;
  lat?: number;
  lng?: number;
  trainsCalling?: number;
  firstDep?: string;
  lastDep?: string;
}

const STATIONS: StationData[] = stationsData as StationData[];
const STATION_MAP = new Map<string, StationData>();
for (const s of STATIONS) {
  if (s.code) STATION_MAP.set(s.code.toUpperCase(), s);
}

export function unmatchedStationCodesForCitySearch(code: string): string[] {
  const group = stationGroupFor(code);
  return group ? group.codes.filter((stationCode) => !STATION_MAP.has(stationCode)) : [];
}

/* ─── Train schedule types ──────────────────────────────────────── */

interface TrainRecord {
  number: string;
  name: string;
  type: string;
  category: string;
  originCode: string;
  originName: string;
  destCode: string;
  destName: string;
  departureTime: string; // HH:MM in 24h
  arrivalTime: string;
  durationMinutes: number;
  distanceKm: number;
  routeStops?: string[];
  scheduleStops?: Array<{ code: string; name?: string; arrival?: string; departure?: string; day: number; distanceKm?: number }>;
  runningDays?: string[];
  scheduleSource?: string;
  typeCode?: string;
  longTypeName?: string;
  shortTypeName?: string;
  includeInSearch?: boolean;
}

type ClassificationEntry = { n: string; t: string; lt: string; tc: string; in: boolean };
const CLASSIFICATION: Record<string, ClassificationEntry> = trainClassification as Record<string, ClassificationEntry>;

function applyClassification(records: TrainRecord[]): TrainRecord[] {
  const out: TrainRecord[] = [];
  for (const raw of records) {
    const num = (raw.number || "").toString().replace(/[^0-9]/g, "");
    const entry = CLASSIFICATION[num];
    const t = { ...raw };

    if (entry) {
      if (entry.tc === "TOY") t.category = "toy-train";
      else if (entry.tc === "PAS") t.category = t.category === "passenger" ? t.category : (t.category || "passenger");
      else if (entry.tc === "EXP") t.category = t.category || "express";
      else if (entry.tc === "MEMU" || entry.tc === "EMU") t.category = entry.tc.toLowerCase();

      if (!t.type || !t.type.includes("Toy")) t.type = entry.lt || t.type || entry.t || "";
      t.typeCode = entry.tc;
      t.longTypeName = entry.lt;
      t.shortTypeName = entry.t;
      if (typeof t.includeInSearch !== "boolean") t.includeInSearch = entry.in;

      if (!t.name) t.name = entry.n;
      else if (entry.n && !t.name.toLowerCase().includes(entry.n.toLowerCase().split(/\s*-\s*/)[0] || entry.n)) {
        // Prefer the dataset name but keep the classification name as backup reference
      }
    } else {
      if (typeof t.includeInSearch !== "boolean") t.includeInSearch = true;
    }

    out.push(t);
  }
  return out;
}

const TRAINS: TrainRecord[] = applyClassification(trainsData as TrainRecord[]);

// Build lookup indices for fast search
// Key: "ORIGIN|DEST" → TrainRecord[]
const ROUTE_INDEX = new Map<string, TrainRecord[]>();
// Key: originCode → TrainRecord[] (trains departing from this station)
const ORIGIN_INDEX = new Map<string, TrainRecord[]>();
// Key: destCode → TrainRecord[] (trains arriving at this station)
const DEST_INDEX = new Map<string, TrainRecord[]>();

for (const t of TRAINS) {
  if (!t.originCode || !t.destCode) continue;
  // Classification exclude flag — don't index trains marked exclude (PAS dataset filter)
  if (t.includeInSearch === false) continue;

  const oCode = t.originCode.toUpperCase();
  const dCode = t.destCode.toUpperCase();

  // 1. Direct Terminus Route Indexing
  const termKey = `${oCode}|${dCode}`;
  if (!ROUTE_INDEX.has(termKey)) ROUTE_INDEX.set(termKey, []);
  if (!ROUTE_INDEX.get(termKey)!.some((x) => x.number === t.number)) {
    ROUTE_INDEX.get(termKey)!.push(t);
  }

  // 2. Intermediate Route Stop Pairs Indexing
  if (t.routeStops && t.routeStops.length >= 2) {
    for (let i = 0; i < t.routeStops.length; i++) {
      const stopA = t.routeStops[i].toUpperCase();
      for (let j = i + 1; j < t.routeStops.length; j++) {
        const stopB = t.routeStops[j].toUpperCase();
        const pairKey = `${stopA}|${stopB}`;
        if (!ROUTE_INDEX.has(pairKey)) ROUTE_INDEX.set(pairKey, []);
        if (!ROUTE_INDEX.get(pairKey)!.some((x) => x.number === t.number)) {
          ROUTE_INDEX.get(pairKey)!.push(t);
        }
      }
    }
  }

  if (!ORIGIN_INDEX.has(oCode)) ORIGIN_INDEX.set(oCode, []);
  ORIGIN_INDEX.get(oCode)!.push(t);

  if (!DEST_INDEX.has(dCode)) DEST_INDEX.set(dCode, []);
  DEST_INDEX.get(dCode)!.push(t);
}

/* ─── Helpers ───────────────────────────────────────────────────── */

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Convert HH:MM + date → ISO string (+05:30 IST) without local timezone skew */
function toISO(dateStr: string, timeStr: string, dayOffset = 0): string {
  if (!timeStr || !timeStr.includes(":")) {
    return `${dateStr}T08:00:00.000+05:30`;
  }
  const [hh, mm] = timeStr.split(":").map(Number);
  const [yearNum, monthNum, dayNum] = dateStr.split("-").map(Number);
  const tempDate = new Date(Date.UTC(yearNum, monthNum - 1, dayNum + dayOffset, hh, mm));
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = tempDate.getUTCFullYear();
  const m = pad(tempDate.getUTCMonth() + 1);
  const d = pad(tempDate.getUTCDate());
  const h = pad(tempDate.getUTCHours());
  const min = pad(tempDate.getUTCMinutes());
  return `${y}-${m}-${d}T${h}:${min}:00.000+05:30`;
}

/** Approximate fare based on distance, train category, and class */
function estimateFare(distKm: number, category: string): { baseFare: number; taxes: number } {
  let perKm: number;
  switch (category) {
    case "vande-bharat": perKm = 2.8; break;
    case "shatabdi": perKm = 2.5; break;
    case "rajdhani": perKm = 2.3; break;
    case "duronto": perKm = 2.2; break;
    case "garib-rath": perKm = 1.4; break;
    case "jan-shatabdi": perKm = 1.2; break;
    case "premium": perKm = 2.0; break;
    default: perKm = 1.0; break;
  }
  const baseFare = Math.round(150 + distKm * perKm);
  const taxes = Math.round(baseFare * 0.05 + 40);
  return { baseFare, taxes };
}

/** Reliability score based on train category */
function categoryReliability(category: string): number {
  switch (category) {
    case "vande-bharat": return 95;
    case "shatabdi": return 93;
    case "rajdhani": return 92;
    case "duronto": return 89;
    case "garib-rath": return 84;
    case "jan-shatabdi": return 82;
    case "premium": return 89;
    default: return 80;
  }
}

/** Find nearby station codes for a given station (within ~50km radius) */
function findNearbyStations(stationCode: string, radiusKm = 50): string[] {
  const origin = STATION_MAP.get(stationCode);
  if (!origin || !origin.lat || !origin.lng) return [stationCode];

  const nearby: string[] = [stationCode];
  for (const s of STATIONS) {
    if (s.code === stationCode || !s.lat || !s.lng) continue;
    const dist = haversineKm(origin.lat, origin.lng, s.lat, s.lng);
    if (dist <= radiusKm && (s.trainsCalling ?? 0) > 10) {
      nearby.push(s.code);
    }
    if (nearby.length >= 10) break;
  }
  return nearby;
}

/* ─── Main provider segment builder ─────────────────────────────── */

function parseClockToMinutes(hhmm: string): number {
  if (!hhmm || !hhmm.includes(":")) return 8 * 60;
  const [h, m] = hhmm.split(":").map(Number);
  return (isNaN(h) ? 8 : h) * 60 + (isNaN(m) ? 0 : m);
}

function minutesToClockStr(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function shiftIsoDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function runsOnDate(train: TrainRecord, date: string, boardingCode?: string): boolean {
  if (!train.runningDays?.length) return true;
  const boardIndex = boardingCode
    ? train.routeStops?.indexOf(boardingCode.toUpperCase()) ?? 0
    : 0;
  const boardStop = boardIndex >= 0 ? train.scheduleStops?.[boardIndex] : undefined;
  const runDate = shiftIsoDate(date, -Math.max(0, (boardStop?.day ?? 1) - 1));
  const weekday = new Date(`${runDate}T00:00:00Z`).getUTCDay();
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return train.runningDays.some((day) => day.slice(0, 3).toLowerCase() === weekdayNames[weekday].toLowerCase());
}

function trainToSegment(
  t: TrainRecord,
  date: string,
  queryFrom?: string,
  queryTo?: string
): TravelSegment {
  const fromCode = (queryFrom || t.originCode).toUpperCase();
  const toCode = (queryTo || t.destCode).toUpperCase();
  const originCode = t.originCode.toUpperCase();
  const destCode = t.destCode.toUpperCase();
  const isDirectTerminus = fromCode === originCode && toCode === destCode;

  const fromStation = STATION_MAP.get(fromCode);
  const toStation = STATION_MAP.get(toCode);
  const fromName = fromStation?.name || (fromCode === originCode ? t.originName : fromCode);
  const toName = toStation?.name || (toCode === destCode ? t.destName : toCode);

  const totalDuration = t.durationMinutes || 360;
  const totalDistance = t.distanceKm || 500;
  const originDepMins = parseClockToMinutes(t.departureTime || "08:00");

  let distKm = totalDistance;
  let durationMinutes = totalDuration;
  let stops = Math.max(1, Math.round(distKm / 80));

  // Fraction along the route for intermediate station pair (0=origin, 1=terminus)
  let fromFrac = 0;
  let toFrac = 1;
  let exactDeparture: { time: string; day: number; distanceKm?: number } | undefined;
  let exactArrival: { time: string; day: number; distanceKm?: number } | undefined;

  if (t.routeStops && t.routeStops.length >= 2) {
    const stopsUpper = t.routeStops.map((s) => s.toUpperCase());
    const idxA = stopsUpper.indexOf(fromCode);
    const idxB = stopsUpper.indexOf(toCode);
    const n = stopsUpper.length;
    if (idxA !== -1 && idxB !== -1 && idxA < idxB) {
      stops = Math.max(1, idxB - idxA);
      fromFrac = idxA / (n - 1);
      toFrac = idxB / (n - 1);
      exactDeparture = t.scheduleStops?.[idxA] && {
        time: t.scheduleStops[idxA].departure || t.scheduleStops[idxA].arrival || "",
        day: t.scheduleStops[idxA].day,
        distanceKm: t.scheduleStops[idxA].distanceKm,
      };
      exactArrival = t.scheduleStops?.[idxB] && {
        time: t.scheduleStops[idxB].arrival || t.scheduleStops[idxB].departure || "",
        day: t.scheduleStops[idxB].day,
        distanceKm: t.scheduleStops[idxB].distanceKm,
      };
    } else if (idxA !== -1 && idxB === -1) {
      fromFrac = idxA / (n - 1);
      toFrac = 1;
    } else if (idxA === -1 && idxB !== -1) {
      fromFrac = 0;
      toFrac = idxB / (n - 1);
    }
  }

  if (isDirectTerminus) {
    distKm = totalDistance;
    durationMinutes = totalDuration;
  } else {
    const fracDiff = Math.max(0.05, toFrac - fromFrac);
    const estDist = totalDistance * fracDiff;
    if (fromStation?.lat && fromStation?.lng && toStation?.lat && toStation?.lng) {
      const hv = haversineKm(fromStation.lat, fromStation.lng, toStation.lat, toStation.lng) * 1.22;
      distKm = Math.max(20, Math.round(Math.min(hv, estDist > 0 ? estDist : hv)));
    } else {
      distKm = Math.max(20, Math.round(estDist || totalDistance * 0.4));
    }
    const avgSpeed = t.category === "vande-bharat" || t.category === "shatabdi" ? 75 : 58;
    durationMinutes = Math.max(25, Math.min(
      Math.round(totalDuration * fracDiff),
      Math.round((distKm / avgSpeed) * 60) + 10
    ));
    durationMinutes = Math.max(25, durationMinutes);
  }

  const hasExactTimes = Boolean(exactDeparture?.time && exactArrival?.time);
  if (hasExactTimes) {
    const fromDistance = exactDeparture?.distanceKm;
    const toDistance = exactArrival?.distanceKm;
    if (fromDistance != null && toDistance != null && toDistance >= fromDistance) {
      distKm = toDistance - fromDistance;
    }
    durationMinutes = Math.max(1,
      ((exactArrival!.day - exactDeparture!.day) * 1440) +
      parseClockToMinutes(exactArrival!.time) - parseClockToMinutes(exactDeparture!.time),
    );
  }

  // Intermediate boarding offset from origin departure (in minutes of clock)
  const boardingOffsetFromOrigin = Math.round((totalDuration || durationMinutes) * fromFrac);
  const segmentDepTotalMins = hasExactTimes ? parseClockToMinutes(exactDeparture!.time) : originDepMins + boardingOffsetFromOrigin;
  const segmentArrTotalMins = hasExactTimes
    ? parseClockToMinutes(exactArrival!.time) + (exactArrival!.day - exactDeparture!.day) * 1440
    : segmentDepTotalMins + durationMinutes;

  const departureDayOffset = hasExactTimes ? 0 : Math.floor(segmentDepTotalMins / 1440);
  const dayOffset = hasExactTimes ? Math.max(0, exactArrival!.day - exactDeparture!.day) : Math.floor(segmentArrTotalMins / 1440);
  const depTimeStr = hasExactTimes ? exactDeparture!.time : minutesToClockStr(segmentDepTotalMins);
  const arrTimeStr = hasExactTimes ? exactArrival!.time : minutesToClockStr(segmentArrTotalMins);

  const { baseFare, taxes } = estimateFare(distKm, t.category);

  // Build the display name — prefer classification name if present and specific
  const classifNum = (t.number || "").toString().replace(/[^0-9]/g, "");
  const classifEntry = CLASSIFICATION[classifNum];
  const baseName =
    classifEntry?.n && classifEntry.n.length >= t.name.length
      ? classifEntry.n
      : t.name || (classifEntry?.n || "Indian Railways Train");
  // Full official Indian Railways train name: "{number} {name}", deduplicated
  const strippedBase = baseName.replace(/^\s*\d{4,5}\s*/, "").trim();
  const officialTrainName = classifNum
    ? `${classifNum} ${strippedBase || (t.longTypeName || t.shortTypeName || "Train")}`
    : baseName;

  return {
    id: `rr_${t.number}_${fromCode}_${toCode}`,
    type: "train",
    operator: officialTrainName, // Full official train name
    operatorCode: "IR",
    segmentNumber: t.number, // The real official train number
    fromCode,
    fromName,
    toCode,
    toName,
    departureTime: toISO(date, depTimeStr, departureDayOffset),
    arrivalTime: toISO(date, arrTimeStr, dayOffset),
    durationMinutes,
    distanceKm: distKm,
    price: baseFare + taxes,
    baseFare,
    taxes,
    reliabilityScore: categoryReliability(t.category),
    providerSource: "Dataset snapshot",
    // The static schedule dataset contains neither current inventory nor
    // authoritative fare quotes. Do not manufacture either as live data.
    seatAvailability: undefined,
    priceTrend: { label: "Indicative fare estimate; verify with booking provider", direction: "stable" },
    zone: fromStation?.zone || "IR",
    latitude: fromStation?.lat,
    longitude: fromStation?.lng,
    trainOrigin: t.originName,
    trainTerminus: t.destName,
    stopsBetween: stops,
    journeyDayOffset: dayOffset,
    bookingUrl: buildTrainDeepLink({
      provider: "IXIGO",
      trainNumber: t.number,
      fromCode,
      toCode,
      date,
    }),
    dataSource: "dataset-snapshot",
    runningDays: t.runningDays?.length ? t.runningDays : "unknown",
  };
}

export class DatasetTrainProvider implements TrainProvider {
  async searchTrains(params: TrainSearchParams): Promise<TravelSegment[]> {
    const { originCode, destinationCode, date } = params;
    const oc = originCode.toUpperCase();
    const dc = destinationCode.toUpperCase();

    // 1) Direct route or intermediate stop pair lookup
    const directKey = `${oc}|${dc}`;
    const directTrains = (ROUTE_INDEX.get(directKey) || []).filter((train) => runsOnDate(train, date, oc));

    if (directTrains.length > 0 && !stationGroupFor(oc) && !stationGroupFor(dc)) {
      return directTrains.map((t) => trainToSegment(t, date, oc, dc));
    }

    // City-level searches include every supplied station in that city which
    // is present in our station dataset. Explicit unmatched codes are not guessed.
    const originGroup = stationGroupFor(oc);
    const destGroup = stationGroupFor(dc);
    const nearbyOrigins = originGroup
      ? originGroup.codes.filter((code) => STATION_MAP.has(code))
      : findNearbyStations(oc, 50);
    const nearbyDests = destGroup
      ? destGroup.codes.filter((code) => STATION_MAP.has(code))
      : findNearbyStations(dc, 50);

    const results: TravelSegment[] = [];
    const seen = new Set<string>();

    // Keep the exact requested pair first, then include the other verified
    // station pairs in each city group. Every result retains its actual codes.
    for (const t of directTrains) {
      seen.add(`${t.number}|${oc}|${dc}`);
      results.push(trainToSegment(t, date, oc, dc));
    }

    for (const no of nearbyOrigins) {
      for (const nd of nearbyDests) {
        if (no === oc && nd === dc) continue;
        const key = `${no}|${nd}`;
        const trains = (ROUTE_INDEX.get(key) || []).filter((train) => runsOnDate(train, date, no));
        for (const t of trains) {
          const resultKey = `${t.number}|${no}|${nd}`;
          if (!seen.has(resultKey)) {
            seen.add(resultKey);
            results.push(trainToSegment(t, date, no, nd));
          }
        }
      }
    }

    return results;
  }

  async getAllAvailableTrains(date: string, originCodes: string[] = [], destinationCodes: string[] = []): Promise<TravelSegment[]> {
    // Expand each train into adjacent major-station legs from its supplied stop
    // sequence. Terminus-only segments hid useful through-service links such as
    // Bengaluru → Nagpur → Bilaspur and prevented airport/rail interchanges.
    const majorCodes = new Set<string>([
      ...STATION_GROUPS.flatMap((group) => [...group.codes]),
      ...INDIAN_CITIES.map((city) => city.stationCode),
      ...originCodes.map((code) => code.toUpperCase()),
      ...destinationCodes.map((code) => code.toUpperCase()),
    ]);
    const segments: TravelSegment[] = [];
    for (const train of TRAINS) {
      if (train.includeInSearch === false) continue;
      const rawStops = train.routeStops?.length ? train.routeStops.map((code) => code.toUpperCase()) : [train.originCode.toUpperCase(), train.destCode.toUpperCase()];
      if (!rawStops.includes(train.originCode.toUpperCase())) rawStops.unshift(train.originCode.toUpperCase());
      if (!rawStops.includes(train.destCode.toUpperCase())) rawStops.push(train.destCode.toUpperCase());
      const stops = rawStops.filter((code, index) => majorCodes.has(code) || index === 0 || index === rawStops.length - 1);
      const waypoints: string[] = [];
      for (const code of stops) {
        const previous = waypoints.at(-1);
        const previousGroup = previous ? stationGroupFor(previous)?.city : undefined;
        const currentGroup = stationGroupFor(code)?.city;
        if (previous && previousGroup && currentGroup && previousGroup === currentGroup) {
          if (code === train.destCode.toUpperCase()) waypoints[waypoints.length - 1] = code;
          continue;
        }
        if (previous !== code) waypoints.push(code);
      }
      // A through-train serves every ordered pair of the selected major stops,
      // so boarding at Bengaluru and alighting at Nagpur stays one train leg.
      for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
        const serviceDate = shiftIsoDate(date, dayOffset);
        for (let from = 0; from < waypoints.length - 1; from++) {
          if (!runsOnDate(train, serviceDate, waypoints[from])) continue;
          for (let to = from + 1; to < waypoints.length; to++) {
            segments.push(trainToSegment(train, serviceDate, waypoints[from], waypoints[to]));
          }
        }
      }
    }
    return segments;
  }
}
