import { DelaySimulationImpact, TravelRoute } from "../types";
import { validateConnection } from "./connection-validator";
import { calculateDeadlineBufferMinutes } from "./deadline-calculator";

/**
 * Deterministically simulates disruption delay on the first segment of a route
 */
export function simulateDelay(
  route: TravelRoute,
  delayMinutes: number,
  deadlineISO: string,
  allFeasibleRoutes: TravelRoute[] = []
): DelaySimulationImpact {
  if (delayMinutes === 0) {
    return {
      delayMinutes: 0,
      originalArrivalTime: route.arrivalTime,
      newArrivalTime: route.arrivalTime,
      originalBufferMinutes: route.deadlineBufferMinutes ?? 0,
      newBufferMinutes: route.deadlineBufferMinutes ?? 0,
      originalConfidence: route.estimatedArrivalConfidence,
      newConfidence: route.estimatedArrivalConfidence,
      isViable: route.isFeasible,
      transferBroken: false,
      missesDeadline: route.deadlineBufferMinutes != null && route.deadlineBufferMinutes < 0,
      riskLevel: route.deadlineBufferMinutes != null && route.deadlineBufferMinutes < 45 ? "high" : "low",
    };
  }

  const firstSeg = route.segments[0];
  const delayedSeg1Arrival = new Date(
    new Date(firstSeg.arrivalTime).getTime() + delayMinutes * 60 * 1000
  ).toISOString();

  let transferBroken = false;
  let finalArrivalISO = route.arrivalTime;

  if (route.segments.length > 1) {
    const secondSeg = route.segments[1];
    // Check if delayed arrival breaks the required connection buffer to segment 2
    const simulatedLeg1 = { ...firstSeg, arrivalTime: delayedSeg1Arrival };
    const connectionCheck = validateConnection(simulatedLeg1, secondSeg);

    if (!connectionCheck.isValid) {
      transferBroken = true;
      // If transfer is broken, arrival cascades by at least next flight/train window (~4 hours)
      finalArrivalISO = new Date(
        new Date(secondSeg.arrivalTime).getTime() + (delayMinutes + 240) * 60 * 1000
      ).toISOString();
    } else {
      // Transfer holds, second segment departs on original schedule
      finalArrivalISO = secondSeg.arrivalTime;
    }
  } else {
    // Direct journey: entire arrival time shifts directly by delay minutes
    finalArrivalISO = new Date(
      new Date(route.arrivalTime).getTime() + delayMinutes * 60 * 1000
    ).toISOString();
  }

  const newBufferMinutes = deadlineISO ? calculateDeadlineBufferMinutes(finalArrivalISO, deadlineISO) : 0;
  const missesDeadline = Boolean(deadlineISO) && newBufferMinutes < 0;

  // Recalculate confidence heuristically under delay pressure
  let newConfidence = route.estimatedArrivalConfidence;
  if (transferBroken) {
    newConfidence = Math.max(5, Math.round(newConfidence * 0.25));
  } else if (delayMinutes >= 120) {
    newConfidence = Math.max(10, Math.round(newConfidence * 0.45));
  } else if (delayMinutes >= 60) {
    newConfidence = Math.max(20, Math.round(newConfidence * 0.65));
  } else if (delayMinutes >= 30) {
    newConfidence = Math.max(30, Math.round(newConfidence * 0.82));
  }

  // Determine risk level
  let riskLevel: DelaySimulationImpact["riskLevel"] = "low";
  if (missesDeadline || transferBroken) {
    riskLevel = "critical";
  } else if (newBufferMinutes < 45 || newConfidence < 50) {
    riskLevel = "high";
  } else if (newBufferMinutes < 90 || newConfidence < 70) {
    riskLevel = "medium";
  }

  const isViable = !transferBroken && !missesDeadline;

  // Find recommended alternative if this route becomes compromised
  let suggestedAlternativeRouteId: string | undefined;
  if (!isViable || riskLevel === "high" || riskLevel === "critical") {
    const alternative = allFeasibleRoutes.find(
      (r) => r.id !== route.id && r.isFeasible && (r.deadlineBufferMinutes == null || r.deadlineBufferMinutes > 60)
    );
    if (alternative) {
      suggestedAlternativeRouteId = alternative.id;
    }
  }

  return {
    delayMinutes,
    originalArrivalTime: route.arrivalTime,
    newArrivalTime: finalArrivalISO,
    originalBufferMinutes: route.deadlineBufferMinutes ?? 0,
    newBufferMinutes,
    originalConfidence: route.estimatedArrivalConfidence,
    newConfidence,
    isViable,
    transferBroken,
    missesDeadline,
    riskLevel,
    suggestedAlternativeRouteId,
  };
}
