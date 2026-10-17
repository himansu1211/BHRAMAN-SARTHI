import type { TravelRoute, TravelSegment } from "@/lib/types/travel";
import {
  availableTransferMinutes,
  requiredTransferMinutes,
} from "@/lib/routing/connection-validator";

export function calculateArrivalConfidence(route: {
  segments: TravelSegment[];
  transfers: number;
  deadlineBufferMinutes: number;
  missesDeadline: boolean;
}): number {
  if (route.missesDeadline) {
    return 12;
  }

  const meanReliability =
    route.segments.reduce((sum, segment) => sum + segment.reliability, 0) /
    route.segments.length;

  let score = 38 + meanReliability * 50;
  score -= route.transfers * 9;

  if (route.segments.length > 1) {
    const first = route.segments[0];
    const second = route.segments[1];
    const spare =
      availableTransferMinutes(first, second) -
      requiredTransferMinutes(first.to, second.from);
    if (spare < 15) {
      score -= 22;
    } else if (spare < 45) {
      score -= 12;
    } else if (spare > 180) {
      score += 3;
    }
  }

  if (route.deadlineBufferMinutes < 30) {
    score -= 20;
  } else if (route.deadlineBufferMinutes < 60) {
    score -= 10;
  } else if (route.deadlineBufferMinutes > 180) {
    score += 4;
  }

  const hasTrain = route.segments.some((segment) => segment.type === "train");
  const hasFlight = route.segments.some((segment) => segment.type === "flight");
  if (hasTrain && hasFlight) {
    score -= 4;
  }

  return Math.round(Math.min(99, Math.max(15, score)));
}

export function confidenceFromRoute(route: TravelRoute): number {
  return calculateArrivalConfidence(route);
}
