"use client";

import React from "react";
import { formatClock, formatDuration, formatBuffer } from "@/lib/time";
import { formatInr } from "@/lib/format";
import type { TravelRoute } from "@/lib/types/travel";
import {
  ClockIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  BookmarkIcon,
  SparklesIcon,
} from "@/components/icons";
import {
  VimanaIcon,
  RajGadiIcon,
  RoyalSealIcon,
  LotusIcon,
  RathChakraIcon,
} from "@/components/traditional-icons";

interface RouteCardProps {
  route: TravelRoute;
  isSaved?: boolean;
  onToggleSave?: (route: TravelRoute) => void;
  onOpenDetails: (route: TravelRoute, defaultTab?: "overview" | "simulator" | "ai") => void;
  isHighlight?: string; // "fastest" | "cheapest" | "highestConfidence" | "bestBalance"
}

export function RouteCard({
  route,
  isSaved = false,
  onToggleSave,
  onOpenDetails,
  isHighlight,
}: RouteCardProps) {
  const first = route.segments[0];
  const last = route.segments[route.segments.length - 1];

  const confidenceBadge =
    route.estimatedArrivalConfidence >= 75
      ? { text: "परम विश्वास (High Trust)", color: "text-emerald-800 bg-emerald-100/80 border-emerald-300" }
      : route.estimatedArrivalConfidence >= 50
      ? { text: "मध्यम विश्वास (Moderate)", color: "text-amber-800 bg-amber-100/80 border-amber-300" }
      : { text: "सावधानी अपेक्षित (High Risk)", color: "text-red-800 bg-red-100/80 border-red-300" };

  const getHighlightBadge = () => {
    switch (isHighlight) {
      case "fastest":
        return (
          <span className="flex items-center gap-1 rounded-full border border-blue-400 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 shadow-sm">
            <span>⚡ द्रुतगामी</span>
            <span className="text-[10px] font-normal text-blue-600">(Fastest)</span>
          </span>
        );
      case "cheapest":
        return (
          <span className="flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-sm">
            <span>💰 मितव्ययी</span>
            <span className="text-[10px] font-normal text-emerald-600">(Cheapest)</span>
          </span>
        );
      case "highestConfidence":
        return (
          <span className="flex items-center gap-1 rounded-full border border-amber-500 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow-sm">
            <span>🛡️ परम विश्वास</span>
            <span className="text-[10px] font-normal text-amber-700">(Most Reliable)</span>
          </span>
        );
      case "bestBalance":
        return (
          <span className="flex items-center gap-1 rounded-full border border-purple-400 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-900 shadow-sm">
            <span>👑 सर्वश्रेष्ठ मार्ग</span>
            <span className="text-[10px] font-normal text-purple-700">(Best Overall)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article
      className={`group relative rounded-2xl border-2 transition-all duration-200 hover:shadow-xl ${
        route.missesDeadline
          ? "border-red-300 bg-red-50/30"
          : isHighlight
          ? "border-amber-500 bg-gradient-to-b from-[#fffefc] to-[#fbf6ea] shadow-md ring-2 ring-amber-400/30"
          : "border-[#dfc89d] bg-white hover:border-amber-600 hover:bg-[#fffdf9]"
      } p-5 sm:p-6`}
    >
      {/* Top Header Row with Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ebd8b0] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {getHighlightBadge()}
          <span className="text-xs font-semibold text-[#6e5246]">
            {route.transfers === 0 ? (
              <span className="flex items-center gap-1 text-emerald-800">
                <LotusIcon className="h-3.5 w-3.5" />
                प्रत्यक्ष यात्रा (Direct Route)
              </span>
            ) : (
              <span>
                {route.transfers} पड़ाव (Transfer via {route.segments[0].to.cityName})
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Arrival Buffer Status */}
          {route.missesDeadline ? (
            <span className="flex items-center gap-1 rounded-full border border-red-300 bg-red-100/90 px-3 py-1 text-xs font-bold text-red-800">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-red-600" />
              समय सीमा उल्लंघन ({formatDuration(Math.abs(route.deadlineBufferMinutes))} Late)
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/90 px-3 py-1 text-xs font-bold text-emerald-900">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-700" />
              {formatBuffer(route.deadlineBufferMinutes)} पूर्व आगमन
            </span>
          )}

          {/* Save Button */}
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(route)}
              aria-label={isSaved ? "Remove from saved trips" : "Save trip"}
              title={isSaved ? "संरक्षित से हटाएं" : "यात्रा संरक्षित करें"}
              className={`rounded-lg p-1.5 transition-colors ${
                isSaved
                  ? "bg-red-100 text-[#8e1b1b]"
                  : "text-[#74584c] hover:bg-amber-100 hover:text-[#8e1b1b]"
              }`}
            >
              <BookmarkIcon className="h-4 w-4" filled={isSaved} />
            </button>
          )}
        </div>
      </div>

      {/* Main card body */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-[1fr,auto]">
        {/* Journey timing, carriers & transit timeline */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <div>
              <div className="font-royal-title text-2xl font-bold tracking-tight text-[#2a1610]">
                {formatClock(route.departureTime)}
              </div>
              <div className="text-xs font-semibold text-[#6e5246]">{first.from.name}</div>
            </div>

            <div className="flex flex-1 items-center gap-2 px-2">
              <div className="h-[2px] flex-1 bg-[#dfc89d] group-hover:bg-amber-600 transition-colors" />
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
                <ClockIcon className="h-3 w-3 text-amber-700" />
                <span>{formatDuration(route.totalDurationMinutes)}</span>
              </div>
              <div className="h-[2px] flex-1 bg-[#dfc89d] group-hover:bg-amber-600 transition-colors" />
            </div>

            <div className="text-right">
              <div className="font-royal-title text-2xl font-bold tracking-tight text-[#2a1610]">
                {formatClock(route.arrivalTime)}
              </div>
              <div className="text-xs font-semibold text-[#6e5246]">{last.to.name}</div>
            </div>
          </div>

          {/* Segment badges with Vimana & Rajgadi icons */}
          <div className="flex flex-wrap items-center gap-2">
            {route.segments.map((seg, idx) => (
              <React.Fragment key={seg.id}>
                {idx > 0 && (
                  <span className="flex items-center gap-1 rounded-md bg-amber-100/80 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                    + {route.waitingMinutes} मिनट विश्राम / Layover
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfc89d] bg-white px-2.5 py-1 text-xs font-semibold text-[#2a1610] shadow-sm">
                  {seg.type === "flight" ? (
                    <VimanaIcon className="h-4 w-4 text-[#8e1b1b]" />
                  ) : (
                    <RajGadiIcon className="h-4 w-4 text-amber-700" />
                  )}
                  <span>{seg.operator}</span>
                  <span className="text-[10px] text-[#74584c]">({seg.operatorId})</span>
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Confidence Meter with Royal Seal */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1 text-xs font-bold text-[#6e5246]">
              <RoyalSealIcon className="h-4 w-4 text-amber-700" />
              <span>आगमन विश्वास (Confidence):</span>
            </div>
            <div className="h-2.5 w-32 overflow-hidden rounded-full bg-[#ebd8b0]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  route.estimatedArrivalConfidence >= 75
                    ? "bg-emerald-600"
                    : route.estimatedArrivalConfidence >= 50
                    ? "bg-amber-600"
                    : "bg-red-600"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, route.estimatedArrivalConfidence))}%` }}
              />
            </div>
            <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${confidenceBadge.color}`}>
              {route.estimatedArrivalConfidence}% • {confidenceBadge.text}
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex flex-col justify-between items-end border-t border-[#ebd8b0] pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <div className="text-right">
            <div className="font-royal-title text-3xl font-extrabold tracking-tight text-[#8e1b1b]">
              {formatInr(route.totalPrice)}
            </div>
            <div className="text-xs font-medium text-[#74584c]">प्रति यात्री व्यय (Total Fare)</div>
            {route.score > 0 && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100/90 px-2 py-0.5 text-xs font-bold text-amber-900">
                <RathChakraIcon className="h-3 w-3 text-amber-700" />
                <span>सारथी अंक: {route.score}/१०</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenDetails(route, "simulator")}
              className="rounded-lg border border-[#dfc89d] bg-white px-3 py-1.5 text-xs font-bold text-[#6e5246] transition-colors hover:border-amber-600 hover:bg-amber-50 hover:text-[#8e1b1b]"
            >
              विलंब गणना (Delays)
            </button>
            <button
              type="button"
              onClick={() => onOpenDetails(route, "ai")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100"
            >
              <SparklesIcon className="h-3.5 w-3.5 text-amber-600" />
              सारथी दृष्टि (AI)
            </button>
            <button
              type="button"
              onClick={() => onOpenDetails(route, "overview")}
              className="rounded-lg bg-gradient-to-r from-[#8e1b1b] to-amber-800 px-4 py-1.5 text-xs font-bold text-amber-50 shadow-sm transition-all hover:scale-105 hover:shadow-md"
            >
              विवरण (Details)
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
