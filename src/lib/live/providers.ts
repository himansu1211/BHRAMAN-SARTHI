import { httpJsonProvider, type LiveProvider } from "./provider";
import type { LiveOption } from "./types";

const enc = encodeURIComponent;

function records(json: unknown, key: string): Record<string, unknown>[] {
  if (!json || typeof json !== "object") return [];
  const items = (json as Record<string, unknown>)[key];
  return Array.isArray(items)
    ? items.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    : [];
}

function value(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
  }
  return "";
}

function fare(record: Record<string, unknown>): number | undefined {
  const amount = record.price ?? record.fare;
  return typeof amount === "number" && Number.isFinite(amount) && amount >= 0 ? amount : undefined;
}

function availability(record: Record<string, unknown>): LiveOption["availability"] {
  if (!Array.isArray(record.availability)) return undefined;
  return record.availability.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const cls = value(row, "cls", "class");
    const status = value(row, "status");
    if (!cls || !status) return [];
    const itemFare = fare(row);
    return [{ cls, status, ...(itemFare === undefined ? {} : { fare: itemFare }) }];
  });
}

// ---- ADAPTERS: wire these to the licensed APIs you obtain. -------------------
// Each `map` must copy number/name/times VERBATIM from the vendor response.

export const skyscannerFlights = httpJsonProvider({
  name: "skyscanner",
  mode: "flight",
  urlEnv: "SKYSCANNER_API_URL",
  keyEnv: "SKYSCANNER_API_KEY",
  buildRequest: (q) => ({ path: `/flights?from=${enc(q.fromCity)}&to=${enc(q.toCity)}&date=${q.date}` }),
  map: (json): LiveOption[] => {
    const fetchedAt = new Date().toISOString();
    return records(json, "flights").map((f) => ({
        id: value(f, "id") || `skyscanner-${value(f, "flightNumber", "number")}`,
        source: "skyscanner",
        fetchedAt,
        bookingUrl: value(f, "bookingUrl") || undefined,
        mode: "flight",
        number: value(f, "flightNumber", "number"),
        name: value(f, "airlineName", "name"),
        fromCode: value(f, "fromCode"),
        toCode: value(f, "toCode"),
        fromLabel: value(f, "fromLabel"),
        toLabel: value(f, "toLabel"),
        departISO: value(f, "departISO"),
        arriveISO: value(f, "arriveISO"),
        fare: fare(f),
        availability: availability(f),
      }));
  },
});

export const ixigoTrains = httpJsonProvider({
  name: "ixigo",
  mode: "train",
  urlEnv: "TRAINS_API_URL",
  keyEnv: "TRAINS_API_KEY",
  buildRequest: (q) => ({ path: `/trains?from=${enc(q.fromCity)}&to=${enc(q.toCity)}&date=${q.date}` }),
  map: (json): LiveOption[] => {
    const fetchedAt = new Date().toISOString();
    return records(json, "trains").map((t) => ({
        id: value(t, "id") || `ixigo-${value(t, "trainNumber", "number")}`,
        source: "ixigo",
        fetchedAt,
        bookingUrl: value(t, "bookingUrl") || undefined,
        mode: "train",
        number: value(t, "trainNumber", "number"),
        name: value(t, "trainName", "name"),
        fromCode: value(t, "fromCode"),
        toCode: value(t, "toCode"),
        fromLabel: value(t, "fromLabel"),
        toLabel: value(t, "toLabel"),
        departISO: value(t, "departISO"),
        arriveISO: value(t, "arriveISO"),
        fare: fare(t),
        availability: availability(t),
      }));
  },
});

export const redbusBuses = httpJsonProvider({
  name: "redbus",
  mode: "bus",
  urlEnv: "BUS_API_URL",
  keyEnv: "BUS_API_KEY",
  buildRequest: (q) => ({ path: `/buses?from=${enc(q.fromCity)}&to=${enc(q.toCity)}&date=${q.date}` }),
  map: (json): LiveOption[] => {
    const fetchedAt = new Date().toISOString();
    return records(json, "buses").map((b) => ({
        id: value(b, "id") || `redbus-${value(b, "busNumber", "number")}`,
        source: "redbus",
        fetchedAt,
        bookingUrl: value(b, "bookingUrl") || undefined,
        mode: "bus",
        number: value(b, "busNumber", "number"),
        name: value(b, "operatorName", "name"),
        fromCode: value(b, "fromCode"),
        toCode: value(b, "toCode"),
        fromLabel: value(b, "fromLabel"),
        toLabel: value(b, "toLabel"),
        departISO: value(b, "departISO"),
        arriveISO: value(b, "arriveISO"),
        fare: fare(b),
        availability: availability(b),
      }));
  },
});

export const ALL_PROVIDERS: LiveProvider[] = [ixigoTrains, skyscannerFlights, redbusBuses];
