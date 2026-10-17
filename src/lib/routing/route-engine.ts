import { CITIES, getCity } from "@/lib/data/locations";
import { MAX_ROUTES_RETURNED, MAX_TRANSFERS } from "@/lib/config/app";
import { calculateArrivalConfidence } from "@/lib/routing/confidence";
import {
  availableTransferMinutes,
  isValidConnection,
  requiredTransferMinutes,
} from "@/lib/routing/connection-validator";
import {
  calculateDeadlineBuffer,
  missesDeadline,
} from "@/lib/routing/deadline-calculator";
import { explainRoute } from "@/lib/routing/explain";
import {
  calculateDeadlineScore,
  calculatePriceScore,
  calculateReliabilityScore,
  calculateTimeScore,
  calculateTransferRisk,
  combineScores,
} from "@/lib/routing/route-score";
import { minutesBetween } from "@/lib/time";
import type {
  OptimizationMode,
  RiskLevel,
  SearchInput,
  SearchResponse,
  SearchSummary,
  TravelRoute,
  TravelSegment,
} from "@/lib/types/travel";
import { getFlightProvider, getTrainProvider, useMockProviders } from "@/lib/providers";
import { AppError } from "@/lib/errors";

export async function searchRoutes(input: SearchInput): Promise<SearchResponse> {
  const originCity = getCity(input.origin);
  const destinationCity = getCity(input.destination);
  if (!originCity || !destinationCity) {
    throw new AppError("invalid_city", "Unknown city.");
  }

  const flights = getFlightProvider();
  const trains = getTrainProvider();
  const hubs = CITIES.filter(
    (city) => city.id !== input.origin && city.id !== input.destination,
  ).map((city) => city.id);

  const [directFlights, directTrains] = await Promise.all([
    flights.searchFlights({
      originCity: input.origin,
      destinationCity: input.destination,
      date: input.date,
    }),
    trains.searchTrains({
      originCity: input.origin,
      destinationCity: input.destination,
      date: input.date,
    }),
  ]);

  const candidates: TravelSegment[][] = [
    ...directFlights.map((segment) => [segment]),
    ...directTrains.map((segment) => [segment]),
  ];

  const connections = await Promise.all(
    hubs.map(async (hub) => {
      const [flightToHub, flightFromHub, trainToHub, trainFromHub] =
        await Promise.all([
          flights.searchFlights({
            originCity: input.origin,
            destinationCity: hub,
            date: input.date,
          }),
          flights.searchFlights({
            originCity: hub,
            destinationCity: input.destination,
            date: input.date,
          }),
          trains.searchTrains({
            originCity: input.origin,
            destinationCity: hub,
            date: input.date,
          }),
          trains.searchTrains({
            originCity: hub,
            destinationCity: input.destination,
            date: input.date,
          }),
        ]);

      return pairSegments(flightToHub, flightFromHub)
        .concat(pairSegments(trainToHub, trainFromHub))
        .concat(pairSegments(trainToHub, flightFromHub))
        .concat(pairSegments(flightToHub, trainFromHub));
    }),
  );

  for (const group of connections) {
    candidates.push(...group);
  }

  const built = candidates
    .filter((segments) => segments.length > 0 && segments.length <= MAX_TRANSFERS + 1)
    .map((segments) => buildRoute(segments, input.arriveBy))
    .filter((route): route is TravelRoute => route !== null);

  const scored = scoreRoutes(built, input.optimization);
  const overBudget = scored.filter((route) => route.totalPrice > input.budget);
  const inBudget = scored.filter((route) => route.totalPrice <= input.budget);
  const missed = inBudget.filter((route) => route.missesDeadline);
  const valid = inBudget.filter((route) => !route.missesDeadline);

  const visible = input.includeMissedDeadline
    ? [...valid, ...missed]
    : valid;

  const cheapestPrice = valid[0]
    ? Math.min(...valid.map((route) => route.totalPrice))
    : undefined;

  const explained = visible.map((route) => ({
    ...route,
    explanation: explainRoute(route, cheapestPrice),
  }));

  const sorted = sortByOptimization(explained, input.optimization).slice(
    0,
    MAX_ROUTES_RETURNED,
  );

  if (sorted.length === 0 && overBudget.length > 0) {
    throw new AppError(
      "no_routes_in_budget",
      "No routes fit this budget. Raise the budget and try again.",
    );
  }

  return {
    demoData: useMockProviders(),
    search: input,
    routes: sorted,
    hiddenMissedDeadline: input.includeMissedDeadline ? 0 : missed.length,
    summary: summarize(valid),
  };
}

export function buildRoute(
  segments: TravelSegment[],
  deadlineIso: string,
): TravelRoute | null {
  const ordered = [...segments].sort(
    (a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime(),
  );

  for (let index = 1; index < ordered.length; index += 1) {
    if (!isValidConnection(ordered[index - 1], ordered[index])) {
      return null;
    }
  }

  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const transferMinutes = ordered.slice(1).reduce((sum, segment, index) => {
    return sum + availableTransferMinutes(ordered[index], segment);
  }, 0);
  const waitingMinutes = Math.max(
    0,
    transferMinutes -
      ordered.slice(1).reduce((sum, segment, index) => {
        return sum + requiredTransferMinutes(ordered[index].to, segment.from);
      }, 0),
  );
  const totalPrice = ordered.reduce((sum, segment) => sum + segment.price, 0);
  const totalDurationMinutes = minutesBetween(first.departure, last.arrival);
  const missed = missesDeadline(last.arrival, deadlineIso);
  const deadlineBufferMinutes = calculateDeadlineBuffer(last.arrival, deadlineIso);
  const transfers = ordered.length - 1;

  const draft = {
    segments: ordered,
    transfers,
    deadlineBufferMinutes,
    missesDeadline: missed,
  };
  const estimatedArrivalConfidence = calculateArrivalConfidence(draft);

  return {
    id: ordered.map((segment) => segment.id).join("__"),
    segments: ordered,
    totalPrice,
    totalDurationMinutes,
    transfers,
    departureTime: first.departure,
    arrivalTime: last.arrival,
    deadlineBufferMinutes,
    estimatedArrivalConfidence,
    score: 0,
    waitingMinutes,
    transferMinutes,
    delayRisk: toDelayRisk(deadlineBufferMinutes, estimatedArrivalConfidence),
    connectionRisk: toConnectionRisk(ordered, transfers),
    missesDeadline: missed,
    explanation: "",
  };
}

export function findRouteById(
  routes: TravelRoute[],
  routeId: string,
): TravelRoute | undefined {
  return routes.find((route) => route.id === routeId);
}

function pairSegments(
  firstLegs: TravelSegment[],
  secondLegs: TravelSegment[],
): TravelSegment[][] {
  const pairs: TravelSegment[][] = [];
  for (const first of firstLegs) {
    for (const second of secondLegs) {
      if (isValidConnection(first, second)) {
        pairs.push([first, second]);
      }
    }
  }
  return pairs;
}

function scoreRoutes(
  routes: TravelRoute[],
  mode: OptimizationMode,
): TravelRoute[] {
  if (routes.length === 0) {
    return [];
  }
  const prices = routes.map((route) => route.totalPrice);
  const durations = routes.map((route) => route.totalDurationMinutes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  return routes.map((route) => {
    const score = combineScores(
      {
        price: calculatePriceScore(route.totalPrice, minPrice, maxPrice),
        time: calculateTimeScore(
          route.totalDurationMinutes,
          minDuration,
          maxDuration,
        ),
        reliability: calculateReliabilityScore(route.estimatedArrivalConfidence),
        deadline: calculateDeadlineScore(route.deadlineBufferMinutes),
        transfer: calculateTransferRisk(route.transfers),
      },
      mode,
    );
    return { ...route, score: Math.round(score * 10) / 10 };
  });
}

function sortByOptimization(
  routes: TravelRoute[],
  mode: OptimizationMode,
): TravelRoute[] {
  const copy = [...routes];
  copy.sort((a, b) => {
    if (a.missesDeadline !== b.missesDeadline) {
      return a.missesDeadline ? 1 : -1;
    }
    if (mode === "cheapest") {
      return a.totalPrice - b.totalPrice;
    }
    if (mode === "fastest") {
      return a.totalDurationMinutes - b.totalDurationMinutes;
    }
    if (mode === "highest_confidence") {
      return b.estimatedArrivalConfidence - a.estimatedArrivalConfidence;
    }
    return b.score - a.score;
  });
  return copy;
}

function summarize(valid: TravelRoute[]): SearchSummary {
  if (valid.length === 0) {
    return {
      fastestId: null,
      cheapestId: null,
      highestConfidenceId: null,
      bestBalanceId: null,
    };
  }

  const fastest = [...valid].sort(
    (a, b) => a.totalDurationMinutes - b.totalDurationMinutes,
  )[0];
  const cheapest = [...valid].sort((a, b) => a.totalPrice - b.totalPrice)[0];
  const highestConfidence = [...valid].sort(
    (a, b) => b.estimatedArrivalConfidence - a.estimatedArrivalConfidence,
  )[0];
  const bestBalance = scoreRoutes(valid, "best_balance").sort(
    (a, b) => b.score - a.score,
  )[0];

  return {
    fastestId: fastest.id,
    cheapestId: cheapest.id,
    highestConfidenceId: highestConfidence.id,
    bestBalanceId: bestBalance.id,
  };
}

function toDelayRisk(buffer: number, confidence: number): RiskLevel {
  if (buffer < 20 || confidence < 45) {
    return "high";
  }
  if (buffer < 60 || confidence < 70) {
    return "medium";
  }
  return "low";
}

function toConnectionRisk(
  segments: TravelSegment[],
  transfers: number,
): RiskLevel {
  if (transfers === 0) {
    return "none";
  }
  const spare =
    availableTransferMinutes(segments[0], segments[1]) -
    requiredTransferMinutes(segments[0].to, segments[1].from);
  if (spare < 20) {
    return "high";
  }
  if (spare < 60) {
    return "medium";
  }
  return "low";
}
