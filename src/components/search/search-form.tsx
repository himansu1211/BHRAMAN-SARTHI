"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/data/locations";
import { OPTIMIZATION_LABELS } from "@/lib/config/app";
import { formatInr } from "@/lib/format";
import { addDaysIsoDate, todayIsoDate } from "@/lib/time";
import type { OptimizationMode, SearchInput } from "@/lib/types/travel";
import { searchInputToParams } from "@/lib/validation/search";
import { SwapIcon } from "@/components/icons";

interface SearchFormProps {
  initialValues?: Partial<SearchInput>;
  onSearch?: (input: SearchInput) => void;
  isLoading?: boolean;
  className?: string;
  navigateOnSubmit?: boolean;
}

export function SearchForm({
  initialValues,
  onSearch,
  isLoading = false,
  className = "",
  navigateOnSubmit = false,
}: SearchFormProps) {
  const router = useRouter();

  const today = todayIsoDate();
  const tomorrow = addDaysIsoDate(today, 1);
  const dayAfter = addDaysIsoDate(today, 2);

  const [origin, setOrigin] = useState(initialValues?.origin ?? "bangalore");
  const [destination, setDestination] = useState(
    initialValues?.destination ?? "delhi",
  );
  const [date, setDate] = useState(initialValues?.date ?? tomorrow);
  const [arriveByTime, setArriveByTime] = useState(() => {
    if (initialValues?.arriveBy && initialValues.arriveBy.includes("T")) {
      const match = initialValues.arriveBy.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
    }
    return "22:00";
  });
  const [budget, setBudget] = useState(initialValues?.budget ?? 25000);
  const [optimization, setOptimization] = useState<OptimizationMode>(
    initialValues?.optimization ?? "best_balance",
  );
  const [includeMissedDeadline, setIncludeMissedDeadline] = useState(
    initialValues?.includeMissedDeadline ?? false,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (origin === destination) {
      setFormError("Origin and destination must be different cities.");
      return;
    }

    const arriveByIso = `${date}T${arriveByTime}:00+05:30`;

    const searchInput: SearchInput = {
      origin,
      destination,
      date,
      arriveBy: arriveByIso,
      budget: Number(budget),
      optimization,
      includeMissedDeadline,
    };

    if (onSearch) {
      onSearch(searchInput);
    }

    if (navigateOnSubmit) {
      const params = searchInputToParams(searchInput);
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-border bg-surface p-6 shadow-xl transition-all ${className}`}
      aria-label="Travel Route Search Form"
    >
      {formError && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm font-medium text-red-600 dark:text-red-400">
          {formError}
        </div>
      )}

      {/* Origin, Destination & Swap */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,auto,1fr]">
        <div className="space-y-1.5">
          <label htmlFor="origin-city" className="block text-xs font-semibold uppercase tracking-wider text-muted">
            From (Origin)
          </label>
          <select
            id="origin-city"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-foreground transition-colors focus:border-accent focus:ring-2 focus:ring-ring focus:outline-none"
          >
            {CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-muted transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
          >
            <SwapIcon className="h-5 w-5 transition-transform group-hover:rotate-180" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="destination-city" className="block text-xs font-semibold uppercase tracking-wider text-muted">
            To (Destination)
          </label>
          <select
            id="destination-city"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-foreground transition-colors focus:border-accent focus:ring-2 focus:ring-ring focus:outline-none"
          >
            {CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date, Arrive-By Deadline & Budget */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="travel-date" className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Travel Date
          </label>
          <input
            id="travel-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors focus:border-accent focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <div className="flex gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setDate(today)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${date === today ? "bg-accent text-white" : "bg-muted/10 text-muted hover:bg-muted/20"}`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDate(tomorrow)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${date === tomorrow ? "bg-accent text-white" : "bg-muted/10 text-muted hover:bg-muted/20"}`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setDate(dayAfter)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${date === dayAfter ? "bg-accent text-white" : "bg-muted/10 text-muted hover:bg-muted/20"}`}
            >
              +2 Days
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="arrive-by-time" className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Must Arrive By (Deadline)
          </label>
          <input
            id="arrive-by-time"
            type="time"
            value={arriveByTime}
            onChange={(e) => setArriveByTime(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors focus:border-accent focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <div className="flex gap-1.5 pt-1">
            {["18:00", "20:00", "22:00", "23:59"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setArriveByTime(preset)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${arriveByTime === preset ? "bg-accent text-white" : "bg-muted/10 text-muted hover:bg-muted/20"}`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-input" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Max Budget
            </label>
            <span className="text-sm font-semibold text-accent">{formatInr(Number(budget))}</span>
          </div>
          <input
            id="budget-input"
            type="range"
            min={1500}
            max={50000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[11px] text-muted">
            <span>₹1,500</span>
            <span>₹25,000</span>
            <span>₹50,000</span>
          </div>
        </div>
      </div>

      {/* Optimization Mode Pills */}
      <div className="mt-5 space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Priority & Optimization
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(OPTIMIZATION_LABELS) as OptimizationMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setOptimization(mode)}
              className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                optimization === mode
                  ? "border-accent bg-accent/10 text-accent ring-1 ring-accent"
                  : "border-border bg-background text-muted hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {OPTIMIZATION_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline Filter Checkbox & Submit Button */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted hover:text-foreground">
          <input
            type="checkbox"
            checked={includeMissedDeadline}
            onChange={(e) => setIncludeMissedDeadline(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent accent-accent focus:ring-accent"
          />
          <span>Show routes that arrive after deadline</span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          id="search-routes-btn"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-xl active:scale-[0.99] disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Calculating Smart Routes...</span>
            </>
          ) : (
            <>
              <span>Find Best Routes</span>
              <span aria-hidden>→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
