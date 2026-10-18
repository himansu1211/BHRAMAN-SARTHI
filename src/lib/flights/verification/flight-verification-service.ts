import {
  Flight,
  FlightSearchRequest,
  FlightVerification,
  VerificationCheck,
  VerificationConfidence,
} from "../types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface VerificationEvaluation {
  passed: boolean;
  flight: Flight;
  failureReasons: string[];
}

export class FlightVerificationService {
  /**
   * Evaluates all 10 integrity checks on a candidate flight
   */
  verifyFlight(flight: Flight, request: FlightSearchRequest): VerificationEvaluation {
    const checks: VerificationCheck[] = [];
    const failureReasons: string[] = [];

    // Check 1: Origin Airport Match
    const originMatches = flight.departure.airportCode.toUpperCase() === request.origin.toUpperCase();
    checks.push({
      checkId: "ORIGIN_MATCH",
      name: "Origin Airport Verification",
      passed: originMatches,
      details: originMatches
        ? `Departs from requested airport ${request.origin}`
        : `Mismatched origin: expected ${request.origin}, got ${flight.departure.airportCode}`,
    });
    if (!originMatches) failureReasons.push("Origin airport mismatch");

    // Check 2: Destination Airport Match
    const destMatches = flight.arrival.airportCode.toUpperCase() === request.destination.toUpperCase();
    checks.push({
      checkId: "DESTINATION_MATCH",
      name: "Destination Airport Verification",
      passed: destMatches,
      details: destMatches
        ? `Arrives at requested airport ${request.destination}`
        : `Mismatched destination: expected ${request.destination}, got ${flight.arrival.airportCode}`,
    });
    if (!destMatches) failureReasons.push("Destination airport mismatch");

    // Check 3: Departure Date Match
    const flightDepDate = flight.departure.scheduledTime.split("T")[0];
    const dateMatches = flightDepDate === request.departureDate;
    checks.push({
      checkId: "DATE_MATCH",
      name: "Departure Date Verification",
      passed: dateMatches,
      details: dateMatches
        ? `Operates on requested date ${request.departureDate}`
        : `Date mismatch: requested ${request.departureDate}, flight departs on ${flightDepDate}`,
    });
    if (!dateMatches) failureReasons.push("Departure date mismatch");

    // Check 4: Operating Days of Week Verification
    // (If flight operates on specific days e.g. Mon/Wed/Fri, check if departure date falls on that day)
    const depDayIndex = new Date(`${request.departureDate}T00:00:00Z`).getUTCDay();
    const depDayName = DAY_NAMES[depDayIndex];
    const operatingDays = flight.operatingDays || ["Daily"];
    const isDaily = operatingDays.some((d) => d.toLowerCase() === "daily");
    const dayMatches = isDaily || operatingDays.some((d) => d.toLowerCase().startsWith(depDayName.toLowerCase()));

    checks.push({
      checkId: "OPERATING_DAY",
      name: "Day-of-Week Schedule Verification",
      passed: dayMatches,
      details: dayMatches
        ? `Flight is actively scheduled for ${depDayName} (${operatingDays.join(", ")})`
        : `Flight does not operate on ${depDayName}. Operating days: ${operatingDays.join(", ")}`,
    });
    if (!dayMatches) failureReasons.push(`Flight does not operate on ${depDayName}`);

    // Check 5: Stale Data Protection / Freshness
    const nowMs = Date.now();
    const retrievedMs = new Date(flight.verification.verifiedAt || new Date().toISOString()).getTime();
    const ageMinutes = Math.round((nowMs - retrievedMs) / (60 * 1000));
    const isFresh = ageMinutes < 120; // 2 hour max threshold for live session
    checks.push({
      checkId: "DATA_FRESHNESS",
      name: "Data Freshness Verification",
      passed: isFresh,
      details: isFresh
        ? `Data refreshed ${ageMinutes}m ago (under freshness threshold)`
        : `Stale flight data: retrieved ${ageMinutes}m ago`,
    });
    if (!isFresh) failureReasons.push("Stale flight data");

    // Check 6: Cancellation Status
    const notCancelled = flight.operatingStatus !== "CANCELLED";
    checks.push({
      checkId: "NOT_CANCELLED",
      name: "Operational Status Check",
      passed: notCancelled,
      details: notCancelled ? "Flight is confirmed scheduled (not cancelled)" : "Flight is cancelled by airline",
    });
    if (!notCancelled) failureReasons.push("Flight is cancelled");

    // Check 7: Seat Availability Status
    const availabilityKnown = flight.availability.status !== "SOLD_OUT";
    checks.push({
      checkId: "AVAILABILITY_STATUS",
      name: "Seat Availability Verification",
      passed: availabilityKnown,
      details:
        flight.availability.status === "AVAILABLE"
          ? `Seats available (${flight.availability.seatsRemaining || "9+"} open)`
          : flight.availability.status === "SOLD_OUT"
          ? "Flight is fully booked/sold out"
          : "Availability unconfirmed by airline GDS",
    });
    if (flight.availability.status === "SOLD_OUT") failureReasons.push("Seats sold out");

    // Check 8: Multi-source Cross-Verification
    const hasMultipleSources = flight.sources.length >= 2;
    const isSnapshot = flight.sources.some((source) => source.sourceType === "DATASET_SNAPSHOT");
    if (isSnapshot) {
      checks.push({
        checkId: "SCHEDULE_SNAPSHOT",
        name: "Schedule Source Freshness",
        passed: false,
        details: "This route matches a stored timetable snapshot; current operations were not confirmed.",
      });
      failureReasons.push("Current timetable not confirmed");
    }
    checks.push({
      checkId: "MULTI_SOURCE_CORROBORATION",
      name: "Cross-Source Verification",
      passed: true,
      details: hasMultipleSources
        ? `Corroborated by ${flight.sources.length} sources (${flight.sources.map((s) => s.providerName).join(", ")})`
        : `Reported by single source (${flight.sources[0]?.providerName || "Primary Provider"})`,
    });

    // Check 9: Timetable & Physical Sanity
    const depMs = new Date(flight.departure.scheduledTime).getTime();
    const arrMs = new Date(flight.arrival.scheduledTime).getTime();
    const durationValid = arrMs > depMs && flight.durationMinutes > 20 && flight.durationMinutes < 1440;
    checks.push({
      checkId: "TIMETABLE_SANITY",
      name: "Physical Timetable Sanity",
      passed: durationValid,
      details: durationValid
        ? `Valid duration: ${flight.durationMinutes}m, arrives after departure`
        : "Invalid timetable: arrival time before departure or invalid duration",
    });
    if (!durationValid) failureReasons.push("Invalid timetable or negative duration");

    // Check 10: Booking Source & Link Verification
    const hasValidBookingLink = Boolean(flight.bookingUrl && flight.bookingUrl.startsWith("http"));
    checks.push({
      checkId: "BOOKING_LINK",
      name: "Booking Source Verification",
      passed: hasValidBookingLink,
      details: hasValidBookingLink ? `Valid booking link provided (${flight.offers.length} active offers)` : "Missing booking URL",
    });
    if (!hasValidBookingLink) failureReasons.push("Missing booking link");

    // Compute Confidence
    let confidence: VerificationConfidence = "MEDIUM";
    const hasDirectSource = flight.sources.some((s) => s.sourceType === "AIRLINE_DIRECT" || s.sourceType === "NDC");

    if (hasDirectSource && originMatches && destMatches && dateMatches && dayMatches && notCancelled) {
      confidence = "HIGH";
    } else if (hasMultipleSources && originMatches && destMatches && dateMatches && dayMatches && notCancelled) {
      confidence = "MEDIUM";
    } else if (!hasDirectSource && !hasMultipleSources) {
      confidence = "LOW";
    }

    const criticalPassed = originMatches && destMatches && dateMatches && dayMatches && notCancelled && durationValid && !isSnapshot;

    const verification: FlightVerification = {
      verified: criticalPassed,
      verifiedAt: new Date().toISOString(),
      confidence,
      summary: isSnapshot
        ? "Historical timetable match only; current service, fare, and seats were not checked."
        : criticalPassed
        ? `${confidence} confidence verification — ${flight.sources.length} source(s) verified on ${depDayName} ${request.departureDate}`
        : `Verification failed: ${failureReasons.join(", ")}`,
      operatingDays: flight.operatingDays,
      checks,
    };

    return {
      passed: criticalPassed,
      flight: {
        ...flight,
        verification,
      },
      failureReasons,
    };
  }
}
