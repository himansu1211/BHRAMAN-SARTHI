"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchForm } from "@/components/search/search-form";
import { RouteCard } from "@/components/routes/route-card";
import { RouteSummaryBar } from "@/components/routes/route-summary-bar";
import { RouteDetailDialog } from "@/components/routes/route-detail-dialog";
import {
  defaultSearchFormValues,
  paramsToSearchInput,
  searchInputToParams,
} from "@/lib/validation/search";
import type { SearchInput, SearchResponse, TravelRoute } from "@/lib/types/travel";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState<SearchInput>(() => {
    try {
      if (searchParams.size > 0) {
        return paramsToSearchInput(searchParams);
      }
    } catch {
      // Fallback
    }
    const def = defaultSearchFormValues();
    return {
      origin: def.origin,
      destination: def.destination,
      date: def.date,
      arriveBy: `${def.date}T${def.arriveByTime}:00+05:30`,
      budget: Number(def.budget),
      optimization: def.optimization,
      includeMissedDeadline: def.includeMissedDeadline,
    };
  });

  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Selected route for modal
  const [selectedRoute, setSelectedRoute] = useState<TravelRoute | null>(null);
  const [modalDefaultTab, setModalDefaultTab] = useState<"overview" | "simulator" | "ai">("overview");

  // Selected highlight filter
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Filter state
  const [filterMode, setFilterMode] = useState<"all" | "direct" | "within_deadline">("all");

  // Saved trips
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("routewise_saved_trips");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedRouteIds(parsed.map((r: TravelRoute) => r.id));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleSave = (route: TravelRoute) => {
    try {
      const stored = localStorage.getItem("routewise_saved_trips");
      const list: TravelRoute[] = stored ? JSON.parse(stored) : [];
      const exists = list.some((r) => r.id === route.id);

      let updated: TravelRoute[];
      if (exists) {
        updated = list.filter((r) => r.id !== route.id);
      } else {
        updated = [...list, route];
      }

      localStorage.setItem("routewise_saved_trips", JSON.stringify(updated));
      setSavedRouteIds(updated.map((r) => r.id));
    } catch (e) {
      console.error("Failed to toggle save", e);
    }
  };

  const executeSearch = async (input: SearchInput) => {
    setIsLoading(true);
    setSearchError(null);
    setSearchInput(input);

    // Update browser URL
    const params = searchInputToParams(input);
    router.replace(`/search?${params.toString()}`);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load routes");
      }

      setSearchResponse(data);
    } catch (err: any) {
      setSearchError(err.message || "An unexpected error occurred while finding routes.");
      setSearchResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search on mount
  useEffect(() => {
    executeSearch(searchInput);
  }, []);

  const openDetails = (route: TravelRoute, defaultTab: "overview" | "simulator" | "ai" = "overview") => {
    setSelectedRoute(route);
    setModalDefaultTab(defaultTab);
  };

  const handleSelectAlternative = (altRoute: TravelRoute) => {
    setSelectedRoute(altRoute);
    setModalDefaultTab("overview");
  };

  // Filter routes
  const filteredRoutes = (searchResponse?.routes || []).filter((r) => {
    if (filterMode === "direct" && r.transfers > 0) return false;
    if (filterMode === "within_deadline" && r.missesDeadline) return false;
    return true;
  });

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      {/* Title */}
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Find Optimal Routes
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ranked intelligently by your deadline, reliability confidence, and overall travel value.
          </p>
        </div>
      </div>

      {/* Interactive Search Form */}
      <SearchForm
        initialValues={searchInput}
        onSearch={executeSearch}
        isLoading={isLoading}
        className="mb-8"
      />

      {/* Error Alert */}
      {searchError && (
        <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <div className="text-base font-bold text-red-600 dark:text-red-400">
            {searchError}
          </div>
          <p className="mt-1 text-xs text-muted">
            Try adjusting your travel time, switching cities, or raising your budget.
          </p>
        </div>
      )}

      {/* Summary Highlight Bar */}
      {searchResponse && searchResponse.routes.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            Route Highlights
          </h2>
          <RouteSummaryBar
            summary={searchResponse.summary}
            routes={searchResponse.routes}
            selectedId={highlightedId}
            onSelectRoute={(id) => {
              setHighlightedId(id === highlightedId ? null : id);
              const cardElement = document.getElementById(`route-${id}`);
              if (cardElement) {
                cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          />
        </div>
      )}

      {/* Routes List Area */}
      <div className="space-y-4">
        {/* Filter bar */}
        {searchResponse && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="text-sm font-semibold text-foreground">
              {filteredRoutes.length} {filteredRoutes.length === 1 ? "route option" : "route options"} available
              {searchResponse.hiddenMissedDeadline > 0 && !searchInput.includeMissedDeadline && (
                <span className="ml-2 text-xs font-normal text-muted">
                  ({searchResponse.hiddenMissedDeadline} routes hidden because they arrive after deadline)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  filterMode === "all"
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:text-foreground border border-border"
                }`}
              >
                All Routes
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("direct")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  filterMode === "direct"
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:text-foreground border border-border"
                }`}
              >
                Direct Only
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("within_deadline")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  filterMode === "within_deadline"
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted hover:text-foreground border border-border"
                }`}
              >
                Beats Deadline Only
              </button>
            </div>
          </div>
        )}

        {/* Loading state skeleton */}
        {isLoading && (
          <div className="space-y-4 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-surface p-6 space-y-4"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-40 rounded bg-muted/20" />
                  <div className="h-4 w-28 rounded bg-muted/20" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-48 rounded bg-muted/20" />
                  <div className="h-8 w-24 rounded bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && filteredRoutes.length > 0 && (
          <div className="space-y-4">
            {filteredRoutes.map((route) => {
              let isHighlight: string | undefined;
              if (route.id === searchResponse?.summary.bestBalanceId) isHighlight = "bestBalance";
              else if (route.id === searchResponse?.summary.fastestId) isHighlight = "fastest";
              else if (route.id === searchResponse?.summary.cheapestId) isHighlight = "cheapest";
              else if (route.id === searchResponse?.summary.highestConfidenceId) isHighlight = "highestConfidence";

              return (
                <div key={route.id} id={`route-${route.id}`}>
                  <RouteCard
                    route={route}
                    isSaved={savedRouteIds.includes(route.id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={openDetails}
                    isHighlight={highlightedId === route.id ? isHighlight : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !searchError && searchResponse && filteredRoutes.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              🔍
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              No routes found matching your criteria
            </h3>
            <p className="mt-1 text-sm text-muted">
              Try extending your arrive-by deadline time, enabling &ldquo;Show routes that arrive after deadline&rdquo;, or increasing your budget.
            </p>
            <button
              type="button"
              onClick={() => {
                executeSearch({
                  ...searchInput,
                  includeMissedDeadline: true,
                  budget: Math.max(searchInput.budget, 35000),
                });
              }}
              className="mt-4 rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-hover"
            >
              Expand Search Filters
            </button>
          </div>
        )}
      </div>

      {/* Route Detail Modal */}
      {selectedRoute && (
        <RouteDetailDialog
          route={selectedRoute}
          searchInput={searchInput}
          defaultTab={modalDefaultTab}
          onClose={() => setSelectedRoute(null)}
          onSelectAlternative={handleSelectAlternative}
        />
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="mt-3 text-sm text-muted">Loading route search...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
