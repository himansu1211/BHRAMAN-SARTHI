"use client";

import React, { useState, useEffect } from "react";
import { SearchCard } from "@/components/search-card";
import { ResultsView } from "@/components/results-view";
import { SearchLoading } from "@/components/search-loading";
import { AboutSection } from "@/components/about-section";
import { SearchRequest, SearchResponse } from "@/lib/types";
import { Clock, AlertCircle, ArrowLeft, RotateCcw, Plane, Train, Bus } from "lucide-react";
import { saveRecentSearch } from "@/lib/storage";
import { SavedSectionModal } from "@/components/saved-section-modal";
import { RecentSearchesBar } from "@/components/recent-searches-bar";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<SearchRequest | undefined>(undefined);

  // Listen for brand name click in Header to return home while retaining active search results
  useEffect(() => {
    const handleBrandClick = () => {
      setShowResults(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenSaved = () => {
      setIsSavedModalOpen(true);
    };

    window.addEventListener("bhraman-sarthi-brand-click", handleBrandClick);
    window.addEventListener("bhraman-open-saved", handleOpenSaved);
    return () => {
      window.removeEventListener("bhraman-sarthi-brand-click", handleBrandClick);
      window.removeEventListener("bhraman-open-saved", handleOpenSaved);
    };
  }, []);

  const handleSearch = async (params: SearchRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveRequest(params);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search routes.");
      }

      setSearchResults(data);
      setShowResults(true);

      // Permanently save recent search locally on user's device
      saveRecentSearch(params, data.routes?.length || 0);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Search failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "An error occurred while finding routes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecentSearch = (params: SearchRequest) => {
    setActiveRequest(params);
    handleSearch(params);
  };

  const handleModifySearch = () => {
    setShowResults(false);
    setTimeout(() => {
      const el = document.getElementById("search-form-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="app-shell relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-8 min-h-screen">

      {/* Hero Section */}
      {!showResults && (
        <div className="hero-intro max-w-6xl mx-auto relative">
          <div className="hero-copy space-y-3">
            <div className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-[#D8CEBB] bg-paper-light px-3 py-1 text-[11px] font-bold text-peacock">
              <Clock className="h-3.5 w-3.5" />
              <span>One itinerary · every way there</span>
            </div>

            <div>
              <p className="mb-1 font-display text-sm font-semibold tracking-wide text-vermilion">यात्रा, सहज और समझदारी से</p>
              <h1 className="font-display text-4xl sm:text-[2.85rem] font-bold tracking-tight text-ink leading-[1.04]">
                A better way to get there.
                <span className="mt-1 block text-indigo">Across India.</span>
              </h1>
            </div>

            <p className="max-w-xl text-sm sm:text-base font-medium text-ink-soft leading-relaxed">
              Compare direct journeys and thoughtful connections by air, rail, and road in one clear plan.
            </p>
            <div className="cultural-rule" aria-hidden="true" />
          </div>

          <div className="hero-art hidden sm:flex" aria-hidden="true">
            <span className="hero-art-caption">THE INDIAN WAY TO GO</span>
            <div className="hero-art-route">
              <span className="hero-route-stop" />
              <span className="hero-route-line" />
              <span className="hero-route-stop is-middle" />
              <span className="hero-route-line hero-route-line-last" />
              <span className="hero-route-stop is-end" />
            </div>
            <div className="hero-mode-list">
              <span><Plane /> Flight</span><span><Train /> Train</span><span><Bus /> Bus</span>
            </div>
            <p className="hero-art-note">One search. Every sensible route.</p>
          </div>
        </div>
      )}

      {/* Persistent Back to Search Results Banner if active search exists and currently editing form */}
      {!showResults && searchResults && (
      <div className="home-search-area max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-amber-400 bg-amber-50/90 p-4 sm:p-5 shadow-yatra-sm">
            <div className="flex items-center gap-3 text-ink">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vermilion text-paper-light shrink-0 shadow-yatra-sm">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold">
                  Modifying Search: {searchResults.search.origin} ➔ {searchResults.search.destination}
                </p>
                <p className="text-xs font-semibold text-ink-muted">
                  Travel Date: {searchResults.search.date} • {searchResults.routes.length} route options
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowResults(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 rounded-xl border border-gold-line bg-vermilion px-5 py-2.5 font-display text-xs font-bold text-paper-light transition hover:bg-vermilion-dark cursor-pointer shadow-yatra-sm whitespace-nowrap min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Current Results ({searchResults.routes.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Search or Results View */}
      {isLoading ? (
        <SearchLoading />
      ) : showResults && searchResults ? (
        <ResultsView results={searchResults} onNewSearch={handleModifySearch} />
      ) : (
        <div className="max-w-5xl mx-auto">
          {errorMessage && (
            <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-crimson-alert/30 bg-red-50 p-4 text-xs font-bold text-crimson-alert">
              <AlertCircle className="h-5 w-5 shrink-0 text-crimson-alert" />
              <span>{errorMessage}</span>
            </div>
          )}

          <SearchCard
            onSearch={handleSearch}
            isLoading={isLoading}
            initialRequest={activeRequest || searchResults?.search}
          />

          <RecentSearchesBar
            onSelectSearch={handleSelectRecentSearch}
            onOpenSavedModal={() => setIsSavedModalOpen(true)}
          />
        </div>
      )}

      {/* About & Value Pillars */}
      {!showResults && <AboutSection />}

      {/* Saved Section & Recent Searches Modal */}
      <SavedSectionModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onSelectSearch={handleSelectRecentSearch}
      />
    </div>
  );
}
