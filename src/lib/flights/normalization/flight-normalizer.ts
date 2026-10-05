import { Flight, ProviderSourceType } from "../types";

export function generateCanonicalFlightKey(flight: {
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
}): string {
  const cleanAirline = flight.airlineCode.trim().toUpperCase();
  const cleanNumber = flight.flightNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const cleanOrigin = flight.origin.trim().toUpperCase();
  const cleanDest = flight.destination.trim().toUpperCase();
  const cleanDate = flight.departureDate.trim();
  const cleanTime = flight.departureTime.slice(0, 5); // HH:MM

  return `${cleanAirline}|${cleanNumber}|${cleanOrigin}|${cleanDest}|${cleanDate}|${cleanTime}`;
}

const SOURCE_TYPE_PRIORITY: Record<ProviderSourceType, number> = {
  DATASET_SNAPSHOT: 4,
  AIRLINE_DIRECT: 1,
  NDC: 1,
  OTA: 2,
  AGGREGATOR: 3,
};

/**
 * Deduplicates raw flights from multiple providers into canonical flights with multiple offers
 */
export function normalizeAndDeduplicateFlights(rawFlights: Flight[]): Flight[] {
  const flightMap = new Map<string, Flight>();

  for (const candidate of rawFlights) {
    const key = candidate.id;

    if (!flightMap.has(key)) {
      flightMap.set(key, {
        ...candidate,
        sources: [...candidate.sources],
        offers: [...candidate.offers],
      });
      continue;
    }

    const existing = flightMap.get(key)!;

    // Merge sources (deduplicating by provider)
    for (const src of candidate.sources) {
      if (!existing.sources.some((s) => s.provider === src.provider)) {
        existing.sources.push(src);
      }
    }

    // Merge offers (deduplicating by provider)
    for (const off of candidate.offers) {
      if (!existing.offers.some((o) => o.provider === off.provider)) {
        existing.offers.push(off);
      }
    }

    // Conflict Resolution:
    // If incoming candidate has a higher-priority source type (e.g. direct airline over OTA/aggregator),
    // update schedule, aircraft, and operating status from the direct airline.
    const candidateSourceType = candidate.sources[0]?.sourceType || "AGGREGATOR";
    const existingSourceType = existing.sources[0]?.sourceType || "AGGREGATOR";

    if (SOURCE_TYPE_PRIORITY[candidateSourceType] < SOURCE_TYPE_PRIORITY[existingSourceType]) {
      existing.departure = candidate.departure;
      existing.arrival = candidate.arrival;
      existing.durationMinutes = candidate.durationMinutes;
      existing.aircraft = candidate.aircraft || existing.aircraft;
      existing.operatingStatus = candidate.operatingStatus;
      existing.bookingUrl = candidate.bookingUrl;
      existing.fare = candidate.fare;
      existing.availability = candidate.availability;
    }

    // Sort offers: direct airline offers first, then lowest price among OTAs
    existing.offers.sort((a, b) => {
      if (a.isDirectAirlineOffer && !b.isDirectAirlineOffer) return -1;
      if (!a.isDirectAirlineOffer && b.isDirectAirlineOffer) return 1;
      return a.totalAmount - b.totalAmount;
    });

    // Update primary bookingUrl and lowest available fare
    const bestOffer = existing.offers[0];
    if (bestOffer) {
      existing.bookingUrl = bestOffer.bookingUrl;
    }
  }

  return Array.from(flightMap.values());
}
