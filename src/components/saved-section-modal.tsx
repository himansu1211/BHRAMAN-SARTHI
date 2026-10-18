"use client";

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Clock,
  Trash2,
  ArrowRight,
  X,
  Search,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Plane,
  Train,
  Bus,
} from "lucide-react";
import {
  RecentSearchItem,
  SavedTripItem,
  getRecentSearches,
  getSavedTrips,
  deleteRecentSearch,
  clearRecentSearches,
  removeSavedTrip,
} from "@/lib/storage";
import { SearchRequest, TravelRoute } from "@/lib/types";

interface SavedSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSearch: (request: SearchRequest) => void;
  onViewRoute?: (route: TravelRoute) => void;
}

export function SavedSectionModal({
  isOpen,
  onClose,
  onSelectSearch,
  onViewRoute,
}: SavedSectionModalProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "saved">("recent");
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTripItem[]>([]);

  const loadData = () => {
    setRecentSearches(getRecentSearches());
    setSavedTrips(getSavedTrips());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Listen for storage events (e.g. when a trip is saved or deleted elsewhere)
  useEffect(() => {
    const handleStorageUpdate = () => {
      loadData();
    };

    window.addEventListener("bhraman-storage-updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("bhraman-storage-updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDeleteRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRecentSearch(id);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecent = () => {
    if (window.confirm("Clear all your recent journey searches from this device?")) {
      clearRecentSearches();
      setRecentSearches([]);
    }
  };

  const handleRemoveSavedTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedTrip(id);
    setSavedTrips(getSavedTrips());
  };

  const handleApplySearch = (item: RecentSearchItem) => {
    onSelectSearch({
      origin: item.origin,
      destination: item.destination,
      date: item.date,
      arriveBy: item.arriveBy,
      budget: item.budget,
      optimization: item.optimization,
      showMissedDeadlines: item.showMissedDeadlines,
    });
    onClose();
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = Date.now();
      const time = new Date(isoString).getTime();
      const diffMinutes = Math.round((now - time) / 60000);

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.round(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(isoString).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-gold-line bg-paper-light shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold-line/40 bg-paper-deep px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-vermilion border border-amber-300 shadow-yatra-sm">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
                Saved Section & History
              </h2>
              <p className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                <span>Permanently stored on your device only</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-line text-ink hover:bg-paper-light hover:text-vermilion transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gold-line/30 bg-paper-light px-5 sm:px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-display font-bold border-b-2 transition cursor-pointer ${
              activeTab === "recent"
                ? "border-vermilion text-vermilion"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Recent Searches</span>
            {recentSearches.length > 0 && (
              <span className="rounded-full bg-vermilion/10 text-vermilion px-2 py-0.5 text-[10px] font-bold">
                {recentSearches.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-display font-bold border-b-2 transition cursor-pointer ${
              activeTab === "saved"
                ? "border-vermilion text-vermilion"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Bookmark className="h-4 w-4 text-turmeric" />
            <span>Saved Itineraries</span>
            {savedTrips.length > 0 && (
              <span className="rounded-full bg-turmeric/15 text-turmeric-dark px-2 py-0.5 text-[10px] font-bold">
                {savedTrips.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: RECENT SEARCHES */}
          {activeTab === "recent" && (
            <div className="space-y-3">
              {recentSearches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-ink-muted border border-gold-line/40">
                    <Search className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">No recent searches yet</p>
                    <p className="text-xs max-w-sm mt-1">
                      Search any Indian corridor above. Your searches are permanently kept here on your device for instant 1-click re-searching.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-ink-muted">
                      Click any journey to load and search instantly
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllRecent}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-muted hover:text-crimson-alert transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="grid gap-2.5">
                    {recentSearches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleApplySearch(item)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gold-line/60 bg-paper-deep/70 p-3.5 transition hover:border-vermilion hover:bg-paper-deep hover:shadow-yatra-sm cursor-pointer"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold text-ink">
                              {item.originName}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-vermilion bg-vermilion/10 px-1.5 py-0.5 rounded">
                              {item.origin}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span className="font-display text-sm font-bold text-ink">
                              {item.destinationName}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-vermilion bg-vermilion/10 px-1.5 py-0.5 rounded">
                              {item.destination}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Calendar className="h-3 w-3 text-amber-600" />
                              {item.date}
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Clock className="h-3 w-3 text-amber-600" />
                              By {item.arriveBy?.split("T")[1] || "21:00"}
                            </span>
                            {item.routeCount !== undefined && (
                              <span className="text-forest font-semibold">
                                • {item.routeCount} routes found
                              </span>
                            )}
                            <span className="text-[11px] text-ink-muted/80">
                              • {formatRelativeTime(item.searchedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApplySearch(item)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gold-line bg-vermilion px-3 py-1.5 font-display text-xs font-bold text-paper-light transition hover:bg-vermilion-dark shadow-xs"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Search</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRecent(item.id, e)}
                            title="Remove this search"
                            aria-label="Remove search"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gold-line/40 text-ink-muted hover:border-crimson-alert/40 hover:bg-red-50 hover:text-crimson-alert transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: SAVED TRIPS */}
          {activeTab === "saved" && (
            <div className="space-y-3">
              {savedTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-ink-muted space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-ink-muted border border-gold-line/40">
                    <Bookmark className="h-6 w-6 text-turmeric" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">No saved itineraries</p>
                    <p className="text-xs max-w-sm mt-1">
                      When browsing search results, click the bookmark icon on any itinerary card to save it permanently on your device for offline review.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedTrips.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-gold-line/60 bg-paper-deep/70 p-4 space-y-3 transition hover:border-turmeric hover:shadow-yatra-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold text-ink">
                              {item.route.segments[0]?.fromName || item.searchRequest.origin}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-turmeric" />
                            <span className="font-display text-sm font-bold text-ink">
                              {item.route.segments[item.route.segments.length - 1]?.toName ||
                                item.searchRequest.destination}
                            </span>
                            {item.route.categoryBadge && (
                              <span className="rounded-full bg-turmeric/20 text-turmeric-dark px-2 py-0.5 text-[10px] font-bold">
                                {item.route.categoryBadge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-ink-muted">
                            <span>₹{item.route.totalPrice.toLocaleString("en-IN")}</span>
                            <span>•</span>
                            <span>
                              {Math.floor(item.route.totalDurationMinutes / 60)}h{" "}
                              {item.route.totalDurationMinutes % 60}m
                            </span>
                            <span>•</span>
                            <span>
                              {item.route.segments.length === 1
                                ? "Direct"
                                : `${item.route.segments.length - 1} transfer(s)`}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRemoveSavedTrip(item.id, e)}
                          title="Remove saved itinerary"
                          aria-label="Remove saved itinerary"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-gold-line/40 text-ink-muted hover:border-crimson-alert/40 hover:bg-red-50 hover:text-crimson-alert transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Segments mini badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gold-line/30">
                        {item.route.segments.map((seg, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-paper-light border border-gold-line/40 px-2 py-1 text-[11px] font-semibold text-ink"
                          >
                            {seg.type === "flight" && <Plane className="h-3 w-3 text-sky-600" />}
                            {seg.type === "train" && <Train className="h-3 w-3 text-vermilion" />}
                            {seg.type === "bus" && <Bus className="h-3 w-3 text-emerald-600" />}
                            <span>{seg.operator}</span>
                            <span className="font-mono text-ink-muted">({seg.fromCode}➔{seg.toCode})</span>
                          </div>
                        ))}

                        {onViewRoute && (
                          <button
                            type="button"
                            onClick={() => {
                              onViewRoute(item.route);
                              onClose();
                            }}
                            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-vermilion hover:underline cursor-pointer"
                          >
                            <span>View Full Details</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="border-t border-gold-line/30 bg-paper-deep px-5 sm:px-6 py-3 flex items-center justify-between text-[11px] font-medium text-ink-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-forest shrink-0" />
            <span>Encrypted local storage • No third-party data tracking</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-ink hover:text-vermilion transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
