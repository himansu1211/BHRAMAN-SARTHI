import { calculateArrivalConfidence } from "@/lib/routing/confidence";
import {
  availableTransferMinutes,
  requiredTransferMinutes,
} from "@/lib/routing/connection-validator";
import { calculateDeadlineBuffer } from "@/lib/routing/deadline-calculator";
import { addMinutes } from "@/lib/time";
import type { DelaySimulation, TravelRoute } from "@/lib/types/travel";

export function simulateFirstSegmentDelay(
  route: TravelRoute,
  delayMinutes: number,
  deadlineIso: string,
  alternatives: TravelRoute[],
): DelaySimulation {
  const first = route.segments[0];
  const delayedArrival = addMinutes(first.arrival, delayMinutes);

  if (route.segments.length === 1) {
    const buffer = calculateDeadlineBuffer(delayedArrival, deadlineIso);
    const confidence = calculateArrivalConfidence({
      segments: [
        {
          ...first,
          arrival: delayedArrival,
          durationMinutes: first.durationMinutes + delayMinutes,
        },
      ],
      transfers: 0,
      deadlineBufferMinutes: buffer,
      missesDeadline: buffer < 0,
    });
    const status =
      buffer < 0 ? "missed_deadline" : buffer < 30 ? "tight" : "ok";
    return {
      delayMinutes,
      arrivalTime: delayedArrival,
      deadlineBufferMinutes: buffer,
      estimatedArrivalConfidence: confidence,
      connectionViable: true,
      status,
      alternative: pickAlternative(route.id, alternatives, status),
    };
  }

  const second = route.segments[1];
  const required = requiredTransferMinutes(first.to, second.from);
  const available = availableTransferMinutes(
    { ...first, arrival: delayedArrival },
    second,
  );
  const connectionViable = available >= required;

  if (!connectionViable) {
    return {
      delayMinutes,
      arrivalTime: delayedArrival,
      deadlineBufferMinutes: calculateDeadlineBuffer(delayedArrival, deadlineIso),
      estimatedArrivalConfidence: 18,
      connectionViable: false,
      status: "missed_connection",
      alternative: pickAlternative(route.id, alternatives, "missed_connection"),
    };
  }

  const buffer = calculateDeadlineBuffer(second.arrival, deadlineIso);
  const delayedFirst = { ...first, arrival: delayedArrival };
  const confidence = calculateArrivalConfidence({
    segments: [delayedFirst, second],
    transfers: 1,
    deadlineBufferMinutes: buffer,
    missesDeadline: buffer < 0,
  });
  const status = buffer < 0 ? "missed_deadline" : available < required + 20 ? "tight" : "ok";

  return {
    delayMinutes,
    arrivalTime: second.arrival,
    deadlineBufferMinutes: buffer,
    estimatedArrivalConfidence: confidence,
    connectionViable: true,
    status,
    alternative: pickAlternative(route.id, alternatives, status),
  };
}

function pickAlternative(
  currentId: string,
  alternatives: TravelRoute[],
  status: DelaySimulation["status"],
): TravelRoute | null {
  if (status === "ok") {
    return null;
  }
  return (
    alternatives.find(
      (route) => route.id !== currentId && !route.missesDeadline,
    ) ?? null
  );
}
