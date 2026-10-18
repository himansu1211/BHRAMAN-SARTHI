import { OPTIMIZATION_WEIGHTS, ScoringWeights } from "../constants";
import { OptimizationMode, ScoreBreakdown, TravelSegment } from "../types";

/**
 * Normalizes price into a 0-100 score (lower price = higher score)
 * Base benchmark: ₹2,000 = 100, ₹15,000+ = 10
 */
export function calculatePriceScore(totalPrice: number): number {
  if (totalPrice <= 2000) return 100;
  if (totalPrice >= 15000) return 10;
  // Linear scale between 2000 and 15000
  const normalized = 100 - ((totalPrice - 2000) / (15000 - 2000)) * 90;
  return Math.round(Math.max(10, Math.min(100, normalized)));
}

/**
 * Normalizes duration into a 0-100 score (shorter duration = higher score)
 * Base benchmark: <= 120 mins = 100, >= 2400 mins (40h) = 10
 */
export function calculateTimeScore(totalDurationMinutes: number): number {
  if (totalDurationMinutes <= 120) return 100;
  if (totalDurationMinutes >= 2400) return 10;
  const normalized = 100 - ((totalDurationMinutes - 120) / (2400 - 120)) * 90;
  return Math.round(Math.max(10, Math.min(100, normalized)));
}

/**
 * Scores transfer friction & connection risk (0 transfers = 100, 1 transfer = 75-85, 2+ = 50)
 */
export function calculateTransferScore(
  segments: TravelSegment[],
  transferBuffers: number[]
): number {
  if (segments.length === 1) return 100;

  let score = 85;
  // Penalize tight connection buffers below 120 mins
  for (const buffer of transferBuffers) {
    if (buffer < 45) {
      score -= 30;
    } else if (buffer < 90) {
      score -= 15;
    }
  }

  // Multimodal transfer friction (train + flight) has slightly higher baggage/terminal friction
  const hasMixedModes = segments.some((s) => s.type === "flight") && segments.some((s) => s.type === "train");
  if (hasMixedModes) {
    score -= 10;
  }

  return Math.max(10, Math.min(100, score));
}

/**
 * Scores safety cushion before deadline (0 mins = 20, 180+ mins = 100)
 */
export function calculateDeadlineScore(deadlineBufferMinutes: number | null): number {
  if (deadlineBufferMinutes == null) return 50;
  if (deadlineBufferMinutes <= 0) return 0;
  if (deadlineBufferMinutes >= 180) return 100;
  // Linear scale 0 to 180 mins -> 20 to 100
  const score = 20 + (deadlineBufferMinutes / 180) * 80;
  return Math.round(score);
}

/**
 * Scores operator reliability and historic punctuality (0-100)
 */
export function calculateReliabilityScore(segments: TravelSegment[]): number {
  if (segments.length === 0) return 50;
  const sum = segments.reduce((acc, seg) => acc + seg.reliabilityScore, 0);
  return Math.round(sum / segments.length);
}

/**
 * Computes heuristic estimated arrival confidence (0 to 100%)
 * Factors: operator historical reliability, transfers count, transfer safety buffers, and buffer before deadline.
 */
export function calculateArrivalConfidence(
  segments: TravelSegment[],
  transferBuffers: number[],
  deadlineBufferMinutes: number | null
): number {
  if (deadlineBufferMinutes != null && deadlineBufferMinutes < 0) return 5; // Route arrives past deadline

  const avgReliability = calculateReliabilityScore(segments);

  // Transfers penalty
  let transferPenalty = 0;
  if (segments.length > 1) {
    transferPenalty = 8; // base transfer risk
    for (const buf of transferBuffers) {
      if (buf < 60) transferPenalty += 14;
      else if (buf < 120) transferPenalty += 6;
    }
  }

  // Deadline buffer bonus/penalty
  let deadlineAdjustment = 0;
  if (deadlineBufferMinutes == null) {
    deadlineAdjustment = 0;
  } else if (deadlineBufferMinutes < 30) {
    deadlineAdjustment = -28;
  } else if (deadlineBufferMinutes < 60) {
    deadlineAdjustment = -14;
  } else if (deadlineBufferMinutes >= 180) {
    deadlineAdjustment = 5;
  }

  const confidence = Math.round(avgReliability - transferPenalty + deadlineAdjustment);
  return Math.max(5, Math.min(99, confidence));
}

/**
 * Combines metrics into an overall weighted score based on optimization preference
 */
export function computeRouteScore(
  price: number,
  durationMinutes: number,
  segments: TravelSegment[],
  transferBuffers: number[],
  deadlineBufferMinutes: number | null,
  mode: OptimizationMode
): { overallScore: number; scoreBreakdown: ScoreBreakdown; confidence: number } {
  const priceScore = calculatePriceScore(price);
  const timeScore = calculateTimeScore(durationMinutes);
  const reliabilityScore = calculateReliabilityScore(segments);
  const deadlineScore = calculateDeadlineScore(deadlineBufferMinutes);
  const transferScore = calculateTransferScore(segments, transferBuffers);

  const confidence = calculateArrivalConfidence(segments, transferBuffers, deadlineBufferMinutes);

  const weights: ScoringWeights = OPTIMIZATION_WEIGHTS[mode] || OPTIMIZATION_WEIGHTS.best_balance;

  const rawOverall =
    weights.priceWeight * priceScore +
    weights.timeWeight * timeScore +
    weights.reliabilityWeight * reliabilityScore +
    weights.deadlineWeight * deadlineScore +
    weights.transferWeight * transferScore;

  // Heavily penalize invalid routes that miss deadline
  const finalScore = deadlineBufferMinutes != null && deadlineBufferMinutes < 0 ? Math.round(rawOverall * 0.2) : Math.round(rawOverall);

  return {
    overallScore: finalScore,
    scoreBreakdown: {
      priceScore,
      timeScore,
      reliabilityScore,
      deadlineScore,
      transferScore,
    },
    confidence,
  };
}

/**
 * Generates concise deterministic explanation for why the route is qualified
 */
export function generateDeterministicExplanation(route: {
  totalPrice: number;
  totalDurationMinutes: number;
  transfers: number;
  deadlineBufferMinutes: number | null;
  estimatedArrivalConfidence: number;
  categoryBadge?: string;
}): string {
  const hours = Math.floor(route.totalDurationMinutes / 60);
  const mins = route.totalDurationMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  if (route.deadlineBufferMinutes == null) {
    return route.transfers === 0
      ? `Direct journey taking ${timeStr} at ₹${route.totalPrice.toLocaleString("en-IN")}; no arrival deadline applied.`
      : `Optimized ${route.transfers}-stop journey taking ${timeStr} at ₹${route.totalPrice.toLocaleString("en-IN")}; no arrival deadline applied.`;
  }

  const bufHours = Math.floor(Math.abs(route.deadlineBufferMinutes) / 60);
  const bufMins = Math.abs(route.deadlineBufferMinutes) % 60;
  const bufStr = bufHours > 0 ? `${bufHours}h ${bufMins}m` : `${bufMins}m`;

  if (route.deadlineBufferMinutes < 0) {
    return `Warning: This journey arrives ${bufStr} after your target deadline. Included for schedule reference only.`;
  }

  if (route.transfers === 0) {
    return `Direct journey taking ${timeStr} with ₹${route.totalPrice.toLocaleString("en-IN")} fare. Provides a safe ${bufStr} buffer before your deadline with ${route.estimatedArrivalConfidence}% estimated arrival confidence.`;
  }

  if (route.categoryBadge === "NEAREST AIRPORT COMBO") {
    return `Smart Airport Transfer Combo (${timeStr}): Takes train or bus to the nearest major airport hub to catch a flight, maximizing speed to arrive ${bufStr} before your deadline with ${route.estimatedArrivalConfidence}% arrival confidence.`;
  }

  return `Optimized ${route.transfers}-stop route (${timeStr}) at ₹${route.totalPrice.toLocaleString("en-IN")}, leaving ${bufStr} arrival buffer before your deadline.`;
}
