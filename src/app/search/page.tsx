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
import {
  RathChakraIcon,
  LotusIcon,
  DiyaIcon,
  ToranaDivider,
  OrnateCorner,
} from "@/components/traditional-icons";

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
        throw new Error(data.message || "मार्ग खोजने में त्रुटि (Failed to load routes)");
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
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end border-b border-[#dfc89d] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <DiyaIcon className="h-4 w-4 text-amber-600" />
            <span>सारथी मार्ग अन्वेषण • MULTIMODAL ROUTE FINDER</span>
          </div>
          <h1 className="mt-1 font-royal-title text-3xl font-extrabold tracking-tight text-[#2a1610] sm:text-4xl">
            शुभ व समयबद्ध यात्रा मार्ग
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6e5246]">
            Deadline-aware itineraries prioritized by arrival certainty, transfer buffers, and realistic confidence.
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
        <div className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-center">
          <div className="font-royal-title text-base font-bold text-red-900">
            {searchError}
          </div>
          <p className="mt-1 text-xs text-[#74584c]">
            कृपया यात्रा समय बढ़ाएँ, भिन्न नगर चुनें या व्यय सीमा को समायोजित करें।
          </p>
        </div>
      )}

      {/* Summary Highlight Bar */}
      {searchResponse && searchResponse.routes.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-royal-sub text-xs font-bold uppercase tracking-wider text-[#6e5246]">
              <LotusIcon className="h-3.5 w-3.5 text-amber-600" />
              <span>सारथी श्रेष्ठ मार्ग चयन • Route Highlights</span>
            </h2>
            <span className="text-[11px] font-semibold text-amber-900">
              Click a card to highlight
            </span>
          </div>
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfc89d] pb-4">
            <div className="text-sm font-bold text-[#2a1610]">
              <span className="font-royal-title">{filteredRoutes.length}</span>{" "}
              {filteredRoutes.length === 1 ? "मार्ग उपलब्ध (Option)" : "मार्ग उपलब्ध (Options Available)"}
              {searchResponse.hiddenMissedDeadline > 0 && !searchInput.includeMissedDeadline && (
                <span className="ml-2 text-xs font-normal text-amber-900">
                  ({searchResponse.hiddenMissedDeadline} मार्ग समय सीमा उपरांत होने के कारण छिपे हैं)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#6e5246] mr-1">फ़िल्टर (Filter):</span>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterMode === "all"
                    ? "bg-[#8e1b1b] text-white shadow-sm"
                    : "bg-white text-[#6e5246] hover:text-[#8e1b1b] border border-[#dfc89d]"
                }`}
              >
                समस्त (All)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("direct")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterMode === "direct"
                    ? "bg-[#8e1b1b] text-white shadow-sm"
                    : "bg-white text-[#6e5246] hover:text-[#8e1b1b] border border-[#dfc89d]"
                }`}
              >
                प्रत्यक्ष मात्र (Direct)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("within_deadline")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterMode === "within_deadline"
                    ? "bg-[#8e1b1b] text-white shadow-sm"
                    : "bg-white text-[#6e5246] hover:text-[#8e1b1b] border border-[#dfc89d]"
                }`}
              >
                समय पूर्व मात्र (Beats Deadline)
              </button>
            </div>
          </div>
        )}

        {/* Loading state skeleton */}
        {isLoading && (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 border-2 border-amber-300">
                <RathChakraIcon className="h-8 w-8 animate-spin" />
              </div>
              <p className="mt-3 font-royal-title text-base font-bold text-[#8e1b1b]">
                सारथी शुभ मार्गों का संकलन कर रहा है...
              </p>
              <p className="text-xs text-[#74584c]">
                Calculating realistic arrival buffers across Indian aviation & railways
              </p>
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-[#dfc89d] bg-white p-6 space-y-4 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-40 rounded bg-amber-100" />
                  <div className="h-4 w-28 rounded bg-amber-100" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-48 rounded bg-amber-100" />
                  <div className="h-8 w-24 rounded bg-amber-100" />
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
          <div className="rounded-3xl border-2 border-[#dfc89d] bg-gradient-to-b from-white to-[#fbf6ea] p-12 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              <LotusIcon className="h-7 w-7 text-amber-700" />
            </div>
            <h3 className="mt-4 font-royal-title text-lg font-bold text-[#2a1610]">
              इस मानदण्ड पर कोई मार्ग प्राप्त नहीं हुआ
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#6e5246]">
              कृपया अपनी पहुँचने की समय सीमा (Arrive-by Deadline) को बढ़ाएं, अथवा &ldquo;विलंबित मार्ग भी दिखाएं&rdquo; का विकल्प चुनें।
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
              className="mt-6 rounded-xl bg-[#8e1b1b] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#711313]"
            >
              खोज सीमा विस्तृत करें (Expand Search)
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
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            <p className="mt-3 font-royal-title text-sm font-bold text-[#8e1b1b]">
              सारथी मार्ग लोड कर रहा है...
            </p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
