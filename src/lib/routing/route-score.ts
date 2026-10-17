import { SCORE_WEIGHTS } from "@/lib/config/app";
import type { OptimizationMode } from "@/lib/types/travel";

export function calculatePriceScore(
  price: number,
  minPrice: number,
  maxPrice: number,
): number {
  if (maxPrice === minPrice) {
    return 100;
  }
  return 100 * (1 - (price - minPrice) / (maxPrice - minPrice));
}

export function calculateTimeScore(
  durationMinutes: number,
  minDuration: number,
  maxDuration: number,
): number {
  if (maxDuration === minDuration) {
    return 100;
  }
  return (
    100 *
    (1 - (durationMinutes - minDuration) / (maxDuration - minDuration))
  );
}

export function calculateTransferRisk(transfers: number): number {
  if (transfers <= 0) {
    return 100;
  }
  if (transfers === 1) {
    return 62;
  }
  return 28;
}

export function calculateDeadlineScore(bufferMinutes: number): number {
  if (bufferMinutes < 0) {
    return 0;
  }
  if (bufferMinutes >= 240) {
    return 100;
  }
  return (bufferMinutes / 240) * 100;
}

export function calculateReliabilityScore(confidence: number): number {
  return Math.min(100, Math.max(0, confidence));
}

export function combineScores(
  parts: {
    price: number;
    time: number;
    reliability: number;
    deadline: number;
    transfer: number;
  },
  mode: OptimizationMode,
): number {
  const weights = SCORE_WEIGHTS[mode];
  return (
    weights.price * parts.price +
    weights.time * parts.time +
    weights.reliability * parts.reliability +
    weights.deadline * parts.deadline +
    weights.transfer * parts.transfer
  );
}
