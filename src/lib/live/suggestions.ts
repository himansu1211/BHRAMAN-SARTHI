import type { HubPoint, LiveOption } from "./types";

const R = 6371;
export const km = (a: HubPoint, b: HubPoint) => {
  const r = (x: number) => (x * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export interface Suggestion {
  kind: "nearest-airport" | "alternate-station";
  title: string;
  reason: string;
  searchPair?: { fromCity: string; toCity: string }; // re-run searchLive on this pair
  groundLegKm?: number;
}

/** No airport at origin/destination -> fly via nearest airport city, finish by train/bus. */
export function airportSuggestions(
  from: HubPoint,
  to: HubPoint,
  hubs: HubPoint[],
  maxKm = 250
): Suggestion[] {
  const out: Suggestion[] = [];
  const withAirports = hubs.filter((h) => h.airport);
  const near = (p: HubPoint) =>
    withAirports
      .filter((h) => h.city !== p.city)
      .map((h) => ({ h, d: km(p, h) }))
      .sort((a, b) => a.d - b.d)[0];

  if (!to.airport) {
    const n = near(to);
    if (n && n.d <= maxKm)
      out.push({
        kind: "nearest-airport",
        title: `Fly to ${n.h.city} (${n.h.airport}), then train/bus to ${to.city}`,
        reason: `${to.city} has no airport. ${n.h.city} is ~${Math.round(n.d)} km away.`,
        searchPair: { fromCity: from.city, toCity: n.h.city },
        groundLegKm: Math.round(n.d),
      });
  }
  if (!from.airport) {
    const n = near(from);
    if (n && n.d <= maxKm)
      out.push({
        kind: "nearest-airport",
        title: `Go to ${n.h.city} (${n.h.airport}) first, then fly to ${to.city}`,
        reason: `${from.city} has no airport. ${n.h.city} is ~${Math.round(n.d)} km away.`,
        searchPair: { fromCity: n.h.city, toCity: to.city },
        groundLegKm: Math.round(n.d),
      });
  }
  return out;
}

const SOLD_OUT = /^(REGRET|NOT AVAILABLE|WL\s*(\d+))/i;
export function directTrainsSoldOut(trains: LiveOption[], wlLimit = 40): boolean {
  if (!trains.length) return false;
  return trains.every((t) =>
    (t.availability ?? []).every((a) => {
      const m = SOLD_OUT.exec(a.status.trim());
      if (!m) return false;
      return m[2] ? Number(m[2]) >= wlLimit : true;
    })
  );
}

/** Rush season: direct trains full -> try nearby stations (<= radius) on either end. */
export function alternateStationSuggestions(
  from: HubPoint,
  to: HubPoint,
  hubs: HubPoint[],
  radiusKm = 120
): Suggestion[] {
  const nearby = (p: HubPoint) =>
    hubs.filter((h) => h.city !== p.city && h.stations.length && km(p, h) <= radiusKm);
  const out: Suggestion[] = [];
  for (const h of nearby(from))
    out.push({
      kind: "alternate-station",
      title: `Board at ${h.city} instead of ${from.city}`,
      reason: `Direct trains from ${from.city} are sold out. ${h.city} is ~${Math.round(
        km(from, h)
      )} km away and may have seats.`,
      searchPair: { fromCity: h.city, toCity: to.city },
      groundLegKm: Math.round(km(from, h)),
    });
  for (const h of nearby(to))
    out.push({
      kind: "alternate-station",
      title: `Alight at ${h.city}, then continue to ${to.city}`,
      reason: `Direct trains to ${to.city} are sold out. ${h.city} is ~${Math.round(
        km(to, h)
      )} km away.`,
      searchPair: { fromCity: from.city, toCity: h.city },
      groundLegKm: Math.round(km(to, h)),
    });
  return out.sort((a, b) => (a.groundLegKm ?? 0) - (b.groundLegKm ?? 0)).slice(0, 6);
}
