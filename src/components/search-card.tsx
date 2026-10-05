"use client";

import React, { useEffect, useState } from "react";
import { OptimizationMode, SearchRequest } from "@/lib/types";
import { ArrowRightLeft, CalendarDays, ChevronDown, Clock3, Search, SlidersHorizontal } from "lucide-react";
import { LocationSearchInput } from "./location-search-input";

interface SearchCardProps {
  onSearch: (params: SearchRequest) => void;
  isLoading: boolean;
  initialRequest?: SearchRequest;
}

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const corridorPresets = [
  { from: "BLR", to: "RPR", label: "Bengaluru → Raipur" },
  { from: "BBI", to: "BLR", label: "Bhubaneswar → Bengaluru" },
  { from: "HYD", to: "MAA", label: "Hyderabad → Chennai" },
];

export function SearchCard({ onSearch, isLoading, initialRequest }: SearchCardProps) {
  const [origin, setOrigin] = useState(initialRequest?.origin ?? "BLR");
  const [destination, setDestination] = useState(initialRequest?.destination ?? "DEL");
  const [date, setDate] = useState(initialRequest?.date ?? "");
  const [arriveBy, setArriveBy] = useState(initialRequest?.arriveBy ?? "");
  const [budget, setBudget] = useState(initialRequest?.budget ? String(initialRequest.budget) : "");
  const [optimization, setOptimization] = useState<OptimizationMode>(initialRequest?.optimization ?? "fastest");
  const [showMissedDeadlines, setShowMissedDeadlines] = useState(initialRequest?.showMissedDeadlines ?? false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRequest) return;
    const params = new URLSearchParams(window.location.search);
    const today = localDate(new Date());
    const queryDate = params.get("date") || today;

    if (params.has("origin") && params.has("destination")) {
      onSearch({
        origin: params.get("origin")!,
        destination: params.get("destination")!,
        date: queryDate,
        arriveBy: params.get("arriveBy") || undefined,
        budget: params.get("budget") ? Number(params.get("budget")) : undefined,
        optimization: (params.get("optimization") as OptimizationMode) || "fastest",
        showMissedDeadlines: params.get("showMissedDeadlines") === "true",
      });
      return;
    }
    // Initialize the current local day after hydration to keep server and client markup identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(queryDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (origin === destination) {
      setError("Choose two different places to travel between.");
      return;
    }
    if (!date) {
      setError("Choose your travel date to see available route options.");
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("date", date);
    if (arriveBy) url.searchParams.set("arriveBy", arriveBy);
    else url.searchParams.delete("arriveBy");
    if (budget) url.searchParams.set("budget", budget);
    else url.searchParams.delete("budget");
    url.searchParams.set("optimization", optimization);
    if (showMissedDeadlines) url.searchParams.set("showMissedDeadlines", "true");
    else url.searchParams.delete("showMissedDeadlines");
    window.history.replaceState({}, "", url.toString());

    onSearch({
      origin,
      destination,
      date,
      arriveBy: arriveBy || undefined,
      budget: budget ? Number(budget) : undefined,
      optimization,
      showMissedDeadlines,
    });
  };

  const chooseCorridor = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
  };

  return (
    <section id="search-form-card" className="search-panel">
      <div className="search-panel-heading">
        <div>
          <p className="search-kicker">यात्रा की शुरुआत · START YOUR JOURNEY</p>
          <h2>Where would you like to go?</h2>
          <p>We’ll compare direct and connecting journeys across India.</p>
        </div>
        <div className="search-mode-note" aria-label="Search includes all travel modes">
          <span className="mode-dot flight-dot" /> Air
          <span className="mode-dot rail-dot" /> Rail
          <span className="mode-dot road-dot" /> Road
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="search-route-fields">
          <LocationSearchInput
            id="origin-search"
            label="FROM"
            value={origin}
            onChange={setOrigin}
            placeholder="Choose a city or station"
            iconColor="text-peacock"
          />
          <button
            type="button"
            onClick={() => { setOrigin(destination); setDestination(origin); }}
            aria-label="Swap origin and destination"
            className="search-swap"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <LocationSearchInput
            id="dest-search"
            label="TO"
            value={destination}
            onChange={setDestination}
            placeholder="Choose your destination"
            iconColor="text-vermilion"
          />
        </div>

        <div className="search-date-row">
          <label className="search-field search-date-field" htmlFor="date-input">
            <span><CalendarDays className="h-4 w-4" /> TRAVEL DATE</span>
            <input
              id="date-input"
              type="date"
              value={date}
              min={localDate(new Date())}
              onChange={(event) => {
                const nextDate = event.target.value;
                setDate(nextDate);
                if (arriveBy && arriveBy.startsWith(date)) {
                  setArriveBy(`${nextDate}${arriveBy.slice(date.length)}`);
                }
              }}
              required
            />
          </label>
          <button type="submit" disabled={isLoading} className="search-submit">
            <Search className="h-4 w-4" />
            {isLoading ? "Finding routes…" : "Find my routes"}
          </button>
        </div>

        <details className="search-preferences">
          <summary><SlidersHorizontal className="h-4 w-4" /> More preferences <ChevronDown className="h-4 w-4 search-preferences-chevron" /></summary>
          <div className="search-preferences-grid">
            <label className="search-field" htmlFor="arrive-by-input">
              <span><Clock3 className="h-4 w-4" /> ARRIVE BY <em>optional</em></span>
              <input id="arrive-by-input" type="datetime-local" value={arriveBy} onChange={(event) => setArriveBy(event.target.value)} />
              <small>Leave blank to compare routes without an arrival deadline.</small>
            </label>
            <label className="search-field" htmlFor="budget-input">
              <span>MAX BUDGET <em>optional</em></span>
              <input id="budget-input" type="number" min="500" step="100" placeholder="Any budget" value={budget} onChange={(event) => setBudget(event.target.value)} />
            </label>
            <label className="search-field" htmlFor="priority-input">
              <span>SHOW ME</span>
              <select id="priority-input" value={optimization} onChange={(event) => setOptimization(event.target.value as OptimizationMode)}>
                <option value="fastest">Fastest journeys</option>
                <option value="best_balance">Best overall balance</option>
                <option value="cheapest">Lowest estimated fare</option>
                <option value="highest_confidence">Most arrival buffer</option>
              </select>
            </label>
            <label className="search-checkbox">
              <input type="checkbox" checked={showMissedDeadlines} onChange={(event) => setShowMissedDeadlines(event.target.checked)} />
              Include journeys arriving after my deadline
            </label>
          </div>
        </details>

        {error && <p role="alert" className="search-error">{error}</p>}
      </form>

      <div className="search-popular">
        <span>Popular journeys</span>
        {corridorPresets.map((corridor) => (
          <button key={`${corridor.from}-${corridor.to}`} type="button" onClick={() => chooseCorridor(corridor.from, corridor.to)}>
            {corridor.label}
          </button>
        ))}
      </div>
    </section>
  );
}
