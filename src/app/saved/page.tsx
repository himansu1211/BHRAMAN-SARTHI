"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RouteCard } from "@/components/routes/route-card";
import { RouteDetailDialog } from "@/components/routes/route-detail-dialog";
import type { SearchInput, TravelRoute } from "@/lib/types/travel";

export default function SavedTripsPage() {
  const [savedRoutes, setSavedRoutes] = useState<TravelRoute[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TravelRoute | null>(null);
  const [modalDefaultTab, setModalDefaultTab] = useState<"overview" | "simulator" | "ai">("overview");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("routewise_saved_trips");
      if (stored) {
        setSavedRoutes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved routes", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleToggleSave = (route: TravelRoute) => {
    try {
      const updated = savedRoutes.filter((r) => r.id !== route.id);
      localStorage.setItem("routewise_saved_trips", JSON.stringify(updated));
      setSavedRoutes(updated);
    } catch (e) {
      console.error("Failed to remove route", e);
    }
  };

  const handleOpenDetails = (route: TravelRoute, defaultTab: "overview" | "simulator" | "ai" = "overview") => {
    setSelectedRoute(route);
    setModalDefaultTab(defaultTab);
  };

  // Construct a dummy SearchInput for the detail dialog if needed
  const fallbackSearchInput: SearchInput = selectedRoute
    ? {
        origin: selectedRoute.segments[0].from.cityId,
        destination: selectedRoute.segments[selectedRoute.segments.length - 1].to.cityId,
        date: selectedRoute.departureTime.slice(0, 10),
        arriveBy: selectedRoute.arrivalTime,
        budget: 50000,
        optimization: "best_balance",
        includeMissedDeadline: true,
      }
    : {
        origin: "bangalore",
        destination: "delhi",
        date: "2026-10-18",
        arriveBy: "2026-10-18T22:00:00+05:30",
        budget: 50000,
        optimization: "best_balance",
        includeMissedDeadline: true,
      };

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Saved Trips
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your bookmarked routes, timing buffers, and multimodal comparisons.
          </p>
        </div>

        {savedRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear all saved trips?")) {
                localStorage.removeItem("routewise_saved_trips");
                setSavedRoutes([]);
              }
            }}
            className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:border-red-500 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {!isLoaded ? (
        <div className="py-12 text-center text-sm text-muted">Loading saved trips...</div>
      ) : savedRoutes.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent text-xl">
            🔖
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">No saved trips yet</h2>
          <p className="mt-1 text-sm text-muted">
            When you find a flight or train route you like in search results, click the bookmark icon to save it here for later.
          </p>
          <div className="mt-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
            >
              <span>Explore Routes</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savedRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isSaved={true}
              onToggleSave={handleToggleSave}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      {selectedRoute && (
        <RouteDetailDialog
          route={selectedRoute}
          searchInput={fallbackSearchInput}
          defaultTab={modalDefaultTab}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </main>
  );
}
