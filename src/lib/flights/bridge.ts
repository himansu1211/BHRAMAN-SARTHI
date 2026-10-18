import { TravelSegment } from "../types";
import { Flight } from "./types";
import { getCanonicalAirline } from "./airline-resolver";

export function flightToTravelSegment(flight: Flight): TravelSegment {
  const isSnapshot = flight.sources.some((source) => source.sourceType === "DATASET_SNAPSHOT");
  const isAvailable = flight.availability.status === "AVAILABLE";
  const isSoldOut = flight.availability.status === "SOLD_OUT";

  const availLabel = isAvailable
    ? flight.availability.seatsRemaining
      ? `${flight.availability.seatsRemaining} seats left`
      : "Available"
    : isSoldOut
    ? "Sold Out"
    : "Check Availability";

  const reliability =
    flight.verification.confidence === "HIGH"
      ? 96
      : flight.verification.confidence === "MEDIUM"
      ? 92
      : 84;

  const canonicalAirline = getCanonicalAirline(
    flight.airline?.code,
    flight.airline?.name,
    flight.flightNumber
  );

  return {
    id: `flt_seg_${flight.id.replace(/[^A-Za-z0-9_-]/g, "_")}`,
    type: "flight",
    operator: canonicalAirline.name,
    operatorCode: canonicalAirline.code,
    segmentNumber: flight.flightNumber,
    fromCode: flight.departure.airportCode,
    fromName: flight.departure.airportName
      ? `${flight.departure.airportName}${flight.departure.terminal ? ` (${flight.departure.terminal})` : ""}`
      : `${flight.departure.airportCode} Airport`,
    toCode: flight.arrival.airportCode,
    toName: flight.arrival.airportName
      ? `${flight.arrival.airportName}${flight.arrival.terminal ? ` (${flight.arrival.terminal})` : ""}`
      : `${flight.arrival.airportCode} Airport`,
    departureTime: flight.departure.scheduledTime,
    arrivalTime: flight.arrival.scheduledTime,
    durationMinutes: flight.durationMinutes,
    price: flight.fare.totalAmount,
    baseFare: flight.fare.baseFare,
    taxes: flight.fare.taxes,
    reliabilityScore: reliability,
    providerSource: isSnapshot ? "Dataset snapshot" : "Skyscanner",
    bookingUrl: flight.bookingUrl,
    dataSource: isSnapshot ? "dataset-snapshot" : "live-api",
    dataAsOf: flight.verification.verifiedAt,
    runningDays: flight.operatingDays || "daily",
    seatAvailability: {
      status: isAvailable ? "available" : isSoldOut ? "waitlist" : "unknown",
      count: flight.availability.seatsRemaining,
      label: availLabel,
      travelClass: flight.cabinClass || "Economy",
    },
    flightDetails: flight,
  };
}
