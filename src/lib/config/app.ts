import type { OptimizationMode } from "@/lib/types/travel";

export const APP_TIME_ZONE = "Asia/Kolkata";

export const CONFIDENCE_DISCLAIMER =
  "Prototype estimate based on route timing, transfer count, available buffer and reliability assumptions. Actual arrival probability may differ.";

export const CONNECTION_BUFFERS_MINUTES = {
  airportToAirportSameVenue: 90,
  airportToAirport: 120,
  stationToStationSameVenue: 20,
  stationToStation: 30,
  airportToStation: 180,
  stationToAirport: 180,
} as const;

export const SCORE_WEIGHTS: Record<
  OptimizationMode,
  {
    price: number;
    time: number;
    reliability: number;
    deadline: number;
    transfer: number;
  }
> = {
  best_balance: {
    price: 0.25,
    time: 0.25,
    reliability: 0.2,
    deadline: 0.2,
    transfer: 0.1,
  },
  cheapest: {
    price: 0.55,
    time: 0.1,
    reliability: 0.1,
    deadline: 0.15,
    transfer: 0.1,
  },
  fastest: {
    price: 0.1,
    time: 0.5,
    reliability: 0.1,
    deadline: 0.2,
    transfer: 0.1,
  },
  highest_confidence: {
    price: 0.1,
    time: 0.1,
    reliability: 0.35,
    deadline: 0.3,
    transfer: 0.15,
  },
};

export const OPTIMIZATION_LABELS: Record<OptimizationMode, string> = {
  best_balance: "Best balance",
  cheapest: "Cheapest",
  fastest: "Fastest",
  highest_confidence: "Highest confidence",
};

export const DELAY_OPTIONS_MINUTES = [0, 30, 60, 120, 180] as const;

export const MAX_TRANSFERS = 1;
export const MAX_ROUTES_RETURNED = 20;
export const DEFAULT_BUDGET_INR = 25000;
