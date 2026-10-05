import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [archiveDir, railwaysDir] = process.argv.slice(2);
if (!archiveDir || !railwaysDir) {
  console.error("Usage: node scripts/import-attached-rail-data.mjs <archive-dir> <railways-master-dir>");
  process.exit(1);
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const generatedDir = path.join(projectRoot, "data", "generated");
const oldTrains = readJson(path.join(generatedDir, "trains.json"));
const trainMap = new Map(oldTrains.map((train) => [String(train.number).replace(/\D/g, ""), train]));
const archiveFiles = [
  ["EXP-TRAINS.json", "express"],
  ["PASS-TRAINS.json", "passenger"],
  ["SF-TRAINS.json", "superfast"],
];
const observedStations = new Map();

const toClock = (value) => {
  if (!value || value === "None" || value === "Source" || value === "Destination") return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
};
const parseCode = (value) => String(value || "").match(/-\s*([A-Z0-9]{2,})\s*$/i)?.[1]?.toUpperCase() || "";
const parseDistance = (value) => Number.parseFloat(String(value || "").replace(/[^\d.]/g, "")) || 0;
const daysFromFlags = (flags) => Object.entries(flags || {}).filter(([, runs]) => runs).map(([day]) => day.slice(0, 1) + day.slice(1).toLowerCase());

let archiveCount = 0;
for (const [filename, category] of archiveFiles) {
  const entries = readJson(path.join(archiveDir, filename));
  for (const entry of entries) {
    const number = String(entry.trainNumber || "").replace(/\D/g, "");
    const stops = (entry.trainRoute || []).map((stop) => ({
      code: parseCode(stop.stationName),
      name: String(stop.stationName || "").replace(/\s+-\s+[A-Z0-9]+\s*$/i, "").trim(),
      arrival: toClock(stop.arrives),
      departure: toClock(stop.departs),
      day: Number.parseInt(stop.day, 10) || 1,
      distanceKm: parseDistance(stop.distance),
    })).filter((stop) => stop.code);
    if (!number || stops.length < 2) continue;
    for (const stop of stops) {
      if (stop.name) observedStations.set(stop.code, { code: stop.code, name: stop.name });
    }

    const existing = trainMap.get(number);
    trainMap.set(number, {
      ...existing,
      number,
      name: entry.trainName || existing?.name || "Indian Railways train",
      type: existing?.type || category,
      category: existing?.category || category,
      originCode: stops[0].code,
      originName: stops[0].name,
      destCode: stops.at(-1).code,
      destName: stops.at(-1).name,
      departureTime: stops[0].departure || existing?.departureTime || "",
      arrivalTime: stops.at(-1).arrival || existing?.arrivalTime || "",
      durationMinutes: existing?.durationMinutes || 0,
      distanceKm: stops.at(-1).distanceKm || existing?.distanceKm || 0,
      routeStops: stops.map((stop) => stop.code),
      scheduleStops: stops,
      runningDays: daysFromFlags(entry.runningDays),
      includeInSearch: true,
      scheduleSource: "User-provided archived train timetable; publication date unknown",
    });
    archiveCount++;
  }
}

const railwaysDirResolved = path.resolve(railwaysDir);
const geoTrains = readJson(path.join(railwaysDirResolved, "trains.json")).features || [];
const schedules = readJson(path.join(railwaysDirResolved, "schedules.json"));
const schedulesByTrain = new Map();
for (const stop of schedules) {
  const number = String(stop.train_number || "").replace(/\D/g, "");
  if (!number || !stop.station_code) continue;
  const list = schedulesByTrain.get(number) || [];
  list.push({
    code: String(stop.station_code).toUpperCase(),
    name: String(stop.station_name || ""),
    arrival: toClock(stop.arrival),
    departure: toClock(stop.departure),
    day: Number(stop.day) || 1,
    sourceOrder: Number(stop.id) || list.length,
  });
  schedulesByTrain.set(number, list);
  if (stop.station_code && stop.station_name) {
    const code = String(stop.station_code).toUpperCase();
    observedStations.set(code, { code, name: String(stop.station_name) });
  }
}

let geoTrainCount = 0;
for (const feature of geoTrains) {
  const props = feature.properties || {};
  const number = String(props.number || "").replace(/\D/g, "");
  if (!number || trainMap.has(number)) continue;
  const stops = (schedulesByTrain.get(number) || []).sort((a, b) => a.day - b.day || a.sourceOrder - b.sourceOrder);
  const routeStops = stops.length >= 2 ? stops.map((stop) => stop.code) : [props.from_station_code, props.to_station_code].filter(Boolean);
  if (routeStops.length < 2) continue;
  const arrivalDay = stops.at(-1)?.day || 1;
  const departureDay = stops[0]?.day || 1;
  const dep = toClock(props.departure) || stops[0]?.departure || "";
  const arr = toClock(props.arrival) || stops.at(-1)?.arrival || "";
  const timeToMinutes = (clock) => {
    const [hour, minute] = clock.split(":").map(Number);
    return Number.isFinite(hour) ? hour * 60 + (minute || 0) : 0;
  };
  const durationMinutes = Number(props.duration_h || 0) * 60 + Number(props.duration_m || 0)
    || Math.max(0, (arrivalDay - departureDay) * 1440 + timeToMinutes(arr) - timeToMinutes(dep));
  trainMap.set(number, {
    number,
    name: props.name || stops[0]?.name || `Train ${number}`,
    type: props.type || "train",
    category: "express",
    originCode: routeStops[0],
    originName: props.from_station_name || stops[0]?.name || routeStops[0],
    destCode: routeStops.at(-1),
    destName: props.to_station_name || stops.at(-1)?.name || routeStops.at(-1),
    departureTime: dep,
    arrivalTime: arr,
    durationMinutes,
    distanceKm: Number(props.distance) || 0,
    routeStops,
    scheduleStops: stops.map(({ code, name, arrival, departure, day }) => ({ code, name, arrival, departure, day })),
    runningDays: [],
    scheduleSource: "DataMeet Indian Railways timetable snapshot (2016); running days unknown",
  });
  geoTrainCount++;
}

for (const train of trainMap.values()) {
  for (const code of train.routeStops || []) {
    if (observedStations.has(code)) continue;
    const name = code === train.originCode ? train.originName : code === train.destCode ? train.destName : code;
    observedStations.set(code, { code, name });
  }
}

const existingStations = readJson(path.join(generatedDir, "stations.json"));
const stationMap = new Map(existingStations.map((station) => [String(station.code).toUpperCase(), station]));
let stationAdded = 0;
for (const [code, stop] of observedStations) {
  if (!stationMap.has(code)) {
    stationMap.set(code, { ...stop, state: "", zone: "", trainsCalling: 0 });
    stationAdded++;
  }
}
const geoStations = readJson(path.join(railwaysDirResolved, "stations.json")).features || [];
let geoStationAdded = 0;
for (const feature of geoStations) {
  const props = feature.properties || {};
  const code = String(props.code || "").toUpperCase();
  if (!code || !props.name) continue;
  const coordinates = feature.geometry?.coordinates;
  const previous = stationMap.get(code);
  if (!previous) geoStationAdded++;
  stationMap.set(code, {
    ...previous,
    code,
    name: props.name || previous?.name,
    state: props.state || previous?.state || "",
    zone: props.zone || previous?.zone || "",
    lat: Number.isFinite(coordinates?.[1]) ? coordinates[1] : previous?.lat,
    lng: Number.isFinite(coordinates?.[0]) ? coordinates[0] : previous?.lng,
    trainsCalling: previous?.trainsCalling || 0,
  });
}

fs.writeFileSync(path.join(generatedDir, "trains.json"), JSON.stringify([...trainMap.values()]));
fs.writeFileSync(path.join(generatedDir, "stations.json"), JSON.stringify([...stationMap.values()]));
console.log(`Merged ${archiveCount} train records from the three attached category files.`);
console.log(`Added ${geoTrainCount} timetable train records not already present.`);
console.log(`Train index now contains ${trainMap.size} unique train numbers.`);
console.log(`Added ${stationAdded + geoStationAdded} station codes from the attached schedules/station reference.`);
console.log(`Station index now contains ${stationMap.size} unique station codes.`);
