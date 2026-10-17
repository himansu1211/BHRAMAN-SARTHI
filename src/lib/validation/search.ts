import { CITIES } from "@/lib/data/locations";
import { AppError } from "@/lib/errors";
import { combineDateAndTime, todayIsoDate } from "@/lib/time";
import type { OptimizationMode, SearchInput } from "@/lib/types/travel";

const OPTIMIZATION_MODES: OptimizationMode[] = [
  "best_balance",
  "cheapest",
  "fastest",
  "highest_confidence",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export interface SearchFormValues {
  origin: string;
  destination: string;
  date: string;
  arriveByTime: string;
  budget: string;
  optimization: OptimizationMode;
  includeMissedDeadline: boolean;
}

export function defaultSearchFormValues(): SearchFormValues {
  return {
    origin: "bangalore",
    destination: "delhi",
    date: todayIsoDate(),
    arriveByTime: "20:00",
    budget: "25000",
    optimization: "best_balance",
    includeMissedDeadline: false,
  };
}

export function parseSearchInput(raw: Record<string, unknown>): SearchInput {
  const origin = readString(raw.origin ?? "bangalore", "origin");
  const destination = readString(raw.destination ?? "delhi", "destination");
  const date = readString(raw.date ?? todayIsoDate(), "date");
  const arriveByTime = normalizeArriveByTime(raw);
  const budget = raw.budget !== undefined && raw.budget !== null && raw.budget !== "" ? readBudget(raw.budget) : 25000;
  const optimization = raw.optimization ? readOptimization(raw.optimization) : "best_balance";
  const includeMissedDeadline = readBoolean(raw.includeMissedDeadline);

  if (!CITIES.some((city) => city.id === origin)) {
    throw new AppError("invalid_origin", "Choose a supported origin city.");
  }
  if (!CITIES.some((city) => city.id === destination)) {
    throw new AppError(
      "invalid_destination",
      "Choose a supported destination city.",
    );
  }
  if (origin === destination) {
    throw new AppError(
      "same_city",
      "Origin and destination must be different.",
    );
  }
  if (!DATE_PATTERN.test(date)) {
    throw new AppError("invalid_date", "Enter a valid travel date.");
  }
  if (date < todayIsoDate()) {
    throw new AppError("invalid_date", "Travel date cannot be in the past.");
  }
  if (!TIME_PATTERN.test(arriveByTime)) {
    throw new AppError("invalid_deadline", "Enter a valid arrive-by time.");
  }

  const arriveBy = combineDateAndTime(date, arriveByTime);
  const departStart = combineDateAndTime(date, "00:00");
  if (new Date(arriveBy).getTime() <= new Date(departStart).getTime()) {
    throw new AppError(
      "deadline_before_departure",
      "Arrive-by must be after the start of your travel date.",
    );
  }

  if (!Number.isFinite(budget) || budget < 500) {
    throw new AppError("invalid_budget", "Enter a budget of at least ₹500.");
  }
  if (budget > 500_000) {
    throw new AppError("invalid_budget", "Budget is too large for this demo.");
  }

  return {
    origin,
    destination,
    date,
    arriveBy,
    budget,
    optimization,
    includeMissedDeadline,
  };
}

export function searchInputToParams(input: SearchInput): URLSearchParams {
  const arriveByTime = formatTimeFromIso(input.arriveBy);
  return new URLSearchParams({
    origin: input.origin,
    destination: input.destination,
    date: input.date,
    arriveByTime,
    budget: String(input.budget),
    optimization: input.optimization,
    includeMissedDeadline: input.includeMissedDeadline ? "1" : "0",
  });
}

export function paramsToSearchInput(
  params: URLSearchParams,
): SearchInput {
  return parseSearchInput({
    origin: params.get("origin"),
    destination: params.get("destination"),
    date: params.get("date"),
    arriveByTime: params.get("arriveByTime"),
    budget: params.get("budget"),
    optimization: params.get("optimization"),
    includeMissedDeadline: params.get("includeMissedDeadline") === "1",
  });
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("invalid_input", `Missing ${field}.`);
  }
  return value.trim();
}

function readBudget(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value.replace(/,/g, ""));
  }
  throw new AppError("invalid_budget", "Enter a budget.");
}

function readOptimization(value: unknown): OptimizationMode {
  if (typeof value === "string" && OPTIMIZATION_MODES.includes(value as OptimizationMode)) {
    return value as OptimizationMode;
  }
  throw new AppError("invalid_optimization", "Choose an optimization mode.");
}

function readBoolean(value: unknown): boolean {
  return value === true || value === "1" || value === "true";
}

function normalizeArriveByTime(raw: Record<string, unknown>): string {
  if (typeof raw.arriveByTime === "string" && raw.arriveByTime.trim()) {
    return raw.arriveByTime.trim();
  }
  if (typeof raw.arriveBy === "string" && raw.arriveBy.includes("T")) {
    return formatTimeFromIso(raw.arriveBy);
  }
  if (typeof raw.arriveBy === "string" && raw.arriveBy.trim()) {
    return raw.arriveBy.trim();
  }
  return "22:00";
}

function formatTimeFromIso(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "20";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}
