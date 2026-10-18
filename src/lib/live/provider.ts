import type { LiveOption, LiveQuery, Mode, SourceName } from "./types";

export interface LiveProvider {
  name: SourceName;
  mode: Mode;
  fetch(q: LiveQuery, signal: AbortSignal): Promise<LiveOption[]>;
}

// Rejects anything that could produce a wrong timeline. Called on EVERY provider result.
export function validate(o: LiveOption): string | null {
  if (!o.number || !o.name) return "missing number/name";
  if (!o.fromCode || !o.toCode || !o.fromLabel || !o.toLabel) return "missing provider station/airport details";
  const d = Date.parse(o.departISO), a = Date.parse(o.arriveISO);
  if (Number.isNaN(d) || Number.isNaN(a)) return "unparseable time";
  if (!/[+-]\d\d:\d\d$|Z$/.test(o.departISO)) return "departure has no timezone offset";
  if (a <= d) return "arrival not after departure";
  if (a - d > 72 * 3600_000) return "implausible duration";
  if (o.fare !== undefined && (!Number.isFinite(o.fare) || o.fare < 0)) return "invalid fare";
  return null;
}

function getSampleOptions(name: SourceName, mode: Mode, q: LiveQuery): LiveOption[] {
  const fetchedAt = new Date().toISOString();
  const from = q.fromCity.substring(0, 3).toUpperCase();
  const to = q.toCity.substring(0, 3).toUpperCase();
  const nextDate = new Date(Date.parse(q.date) + 86400000).toISOString().split("T")[0];

  if (mode === "flight") {
    return [
      {
        id: `sample-fl-${q.fromCity.toLowerCase()}-${q.toCity.toLowerCase()}-6e2134`,
        source: "sample",
        fetchedAt,
        mode: "flight",
        number: "6E-2134",
        name: "IndiGo Air (Sample)",
        fromCode: from,
        toCode: to,
        fromLabel: q.fromCity,
        toLabel: q.toCity,
        departISO: `${q.date}T08:00:00+05:30`,
        arriveISO: `${q.date}T10:45:00+05:30`,
        fare: 4850,
        availability: [{ cls: "ECONOMY", status: "AVAILABLE" }],
      },
    ];
  } else if (mode === "train") {
    return [
      {
        id: `sample-tr-${q.fromCity.toLowerCase()}-${q.toCity.toLowerCase()}-12627`,
        source: "sample",
        fetchedAt,
        mode: "train",
        number: "12627",
        name: "Karnataka Express (Sample)",
        fromCode: from,
        toCode: to,
        fromLabel: q.fromCity,
        toLabel: q.toCity,
        departISO: `${q.date}T19:20:00+05:30`,
        arriveISO: `${nextDate}T13:30:00+05:30`,
        fare: 1850,
        availability: [{ cls: "3A", status: "AVAILABLE-0042" }],
      },
    ];
  } else {
    return [
      {
        id: `sample-bs-${q.fromCity.toLowerCase()}-${q.toCity.toLowerCase()}-8821`,
        source: "sample",
        fetchedAt,
        mode: "bus",
        number: "VRL-8821",
        name: "VRL Travels (Sample)",
        fromCode: from,
        toCode: to,
        fromLabel: q.fromCity,
        toLabel: q.toCity,
        departISO: `${q.date}T21:00:00+05:30`,
        arriveISO: `${nextDate}T06:30:00+05:30`,
        fare: 1250,
        availability: [{ cls: "SLEEPER", status: "AVAILABLE-0012" }],
      },
    ];
  }
}

/**
 * Generic JSON adapter. You supply the endpoint + key via env and a `map` function
 * that converts the vendor's response to LiveOption[]. Nothing is invented here.
 * Fill in per vendor docs: SKYSCANNER_*, TRAINS_*, BUS_* variables.
 * Sample data only appears if ALLOW_SAMPLE=true or in test env, labelled "sample".
 */
export function httpJsonProvider(cfg: {
  name: SourceName;
  mode: Mode;
  urlEnv: string;
  keyEnv: string;
  buildRequest: (q: LiveQuery) => { path: string; init?: RequestInit };
  map: (json: unknown, q: LiveQuery) => LiveOption[];
}): LiveProvider {
  return {
    name: cfg.name,
    mode: cfg.mode,
    async fetch(q, signal) {
      const base = process.env[cfg.urlEnv];
      const key = process.env[cfg.keyEnv];
      if (!base || !key) {
        if (process.env.ALLOW_SAMPLE === "true" || process.env.NODE_ENV === "test") {
          return getSampleOptions(cfg.name, cfg.mode, q);
        }
        throw new Error(`${cfg.urlEnv}/${cfg.keyEnv} not configured`);
      }
      const { path, init } = cfg.buildRequest(q);
      const res = await fetch(base + path, {
        ...init,
        signal,
        headers: { ...(init?.headers ?? {}), "x-api-key": key, accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${cfg.name} HTTP ${res.status}`);
      const fetchedAt = new Date().toISOString();
      return cfg.map(await res.json(), q).map((o) => ({ ...o, source: cfg.name, fetchedAt }));
    },
  };
}
