"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RouteCard } from "@/components/routes/route-card";
import { RouteDetailDialog } from "@/components/routes/route-detail-dialog";
import type { SearchInput, TravelRoute } from "@/lib/types/travel";
import {
  RathChakraIcon,
  LotusIcon,
  DiyaIcon,
  OrnateCorner,
} from "@/components/traditional-icons";

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
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#dfc89d] pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <DiyaIcon className="h-4 w-4 text-amber-600" />
            <span>यात्रा संग्रह पुस्तिका • TRAVEL LEDGER</span>
          </div>
          <h1 className="mt-1 font-royal-title text-3xl font-extrabold tracking-tight text-[#2a1610] sm:text-4xl">
            संरक्षित यात्राएं
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6e5246]">
            Your bookmarked multimodal itineraries, arrival buffers, and simulated alternative journeys.
          </p>
        </div>

        {savedRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("क्या आप समस्त संरक्षित यात्राओं को हटाना चाहते हैं? (Clear all saved trips?)")) {
                localStorage.removeItem("routewise_saved_trips");
                setSavedRoutes([]);
              }
            }}
            className="rounded-xl border border-red-300 bg-white px-3.5 py-1.5 text-xs font-bold text-red-800 hover:bg-red-50 hover:border-red-400 transition-colors shadow-sm"
          >
            समस्त हटाएं (Clear All)
          </button>
        )}
      </div>

      {!isLoaded ? (
        <div className="py-16 text-center text-sm font-semibold text-amber-900">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="mt-2">संग्रहित यात्राएं लोड हो रही हैं...</p>
        </div>
      ) : savedRoutes.length === 0 ? (
        <div className="relative rounded-3xl border-2 border-[#dfc89d] bg-gradient-to-b from-white to-[#fbf6ea] p-12 text-center shadow-lg">
          <div className="absolute top-2 left-2 pointer-events-none">
            <OrnateCorner className="w-5 h-5 text-amber-600/70" />
          </div>
          <div className="absolute top-2 right-2 rotate-90 pointer-events-none">
            <OrnateCorner className="w-5 h-5 text-amber-600/70" />
          </div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <LotusIcon className="h-8 w-8 text-amber-700" />
          </div>
          <h2 className="mt-4 font-royal-title text-xl font-bold text-[#2a1610]">
            अभी कोई यात्रा संरक्षित नहीं है
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#6e5246] leading-relaxed">
            जब आप मार्ग अन्वेषक में अपनी मनपसंद उड़ान या रेल मार्ग खोजें, तो उसे यहां सुरक्षित रखने के लिए ध्वज (Bookmark) चिह्न पर क्लिक करें।
          </p>
          <div className="mt-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-[#8e1b1b] px-6 py-2.5 font-royal-sub text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#711313] transition-transform hover:scale-105"
            >
              <span>शुभ मार्ग खोजें (Explore Routes)</span>
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
