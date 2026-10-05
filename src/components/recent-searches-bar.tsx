"use client";

import React, { useSyncExternalStore } from "react";
import { Clock, ArrowRight, Bookmark } from "lucide-react";
import { RecentSearchItem, getRecentSearches } from "@/lib/storage";
import { SearchRequest } from "@/lib/types";

interface RecentSearchesBarProps {
  onSelectSearch: (request: SearchRequest) => void;
  onOpenSavedModal: () => void;
}

const EMPTY_RECENT_SEARCHES: RecentSearchItem[] = [];
let recentSnapshot: RecentSearchItem[] | null = null;

function getRecentSnapshot() {
  recentSnapshot ??= getRecentSearches();
  return recentSnapshot;
}

function subscribeToRecentSearches(onChange: () => void) {
  const handleUpdate = () => {
    recentSnapshot = getRecentSearches();
    onChange();
  };
  window.addEventListener("bhraman-storage-updated", handleUpdate);
  window.addEventListener("storage", handleUpdate);
  return () => {
    window.removeEventListener("bhraman-storage-updated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

export function RecentSearchesBar({
  onSelectSearch,
  onOpenSavedModal,
}: RecentSearchesBarProps) {
  const recentList = useSyncExternalStore(subscribeToRecentSearches, getRecentSnapshot, () => EMPTY_RECENT_SEARCHES);

  if (recentList.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl pt-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e6e1d6] bg-white/75 px-3 py-2.5">
        <div className="flex shrink-0 items-center gap-1.5 pr-1 text-[11px] font-bold text-ink-muted">
          <Clock className="h-3.5 w-3.5 text-peacock" /> Recent
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {recentList.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onSelectSearch({
                  origin: item.origin,
                  destination: item.destination,
                  date: item.date,
                  arriveBy: item.arriveBy,
                  budget: item.budget,
                  optimization: item.optimization,
                  showMissedDeadlines: item.showMissedDeadlines,
                })
              }
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#e6e1d6] bg-[#faf9f5] px-2.5 py-1 text-[11px] font-semibold text-ink transition hover:border-peacock hover:bg-[#eef5f0] hover:text-peacock shrink-0 cursor-pointer"
            >
              <span className="font-bold">{item.origin}</span>
              <ArrowRight className="h-3 w-3 text-amber-600" />
              <span className="font-bold">{item.destination}</span>
              <span className="text-[10px] text-ink-muted">
                ({item.date.split("-").slice(1).join("/")})
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={onOpenSavedModal}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#e6e1d6] bg-white px-2.5 py-1 text-[11px] font-bold text-peacock transition hover:border-peacock shrink-0 cursor-pointer"
          >
            <Bookmark className="h-3 w-3 text-turmeric" />
            <span>Saved trips</span>
          </button>
        </div>
      </div>
    </div>
  );
}
