import { CONNECTION_BUFFERS_MINUTES } from "@/lib/config/app";
import { minutesBetween } from "@/lib/time";
import type { Place, TravelSegment } from "@/lib/types/travel";

export function requiredTransferMinutes(from: Place, to: Place): number {
  if (from.kind === "airport" && to.kind === "airport") {
    return from.id === to.id
      ? CONNECTION_BUFFERS_MINUTES.airportToAirportSameVenue
      : CONNECTION_BUFFERS_MINUTES.airportToAirport;
  }
  if (from.kind === "station" && to.kind === "station") {
    return from.id === to.id
      ? CONNECTION_BUFFERS_MINUTES.stationToStationSameVenue
      : CONNECTION_BUFFERS_MINUTES.stationToStation;
  }
  if (from.kind === "airport" && to.kind === "station") {
    return CONNECTION_BUFFERS_MINUTES.airportToStation;
  }
  return CONNECTION_BUFFERS_MINUTES.stationToAirport;
}

export function isValidConnection(
  previous: TravelSegment,
  next: TravelSegment,
): boolean {
  if (previous.to.cityId !== next.from.cityId) {
    return false;
  }
  const required = requiredTransferMinutes(previous.to, next.from);
  const available = minutesBetween(previous.arrival, next.departure);
  return next.departure > previous.arrival && available >= required;
}

export function availableTransferMinutes(
  previous: TravelSegment,
  next: TravelSegment,
): number {
  return minutesBetween(previous.arrival, next.departure);
}
