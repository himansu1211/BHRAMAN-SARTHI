"use client";

import React, { useState } from "react";
import { formatClock, formatDuration, formatBuffer } from "@/lib/time";
import { formatInr } from "@/lib/format";
import type { TravelRoute } from "@/lib/types/travel";
import {
  FlightIcon,
  TrainIcon,
  ClockIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  BookmarkIcon,
  SparklesIcon,
} from "@/components/icons";

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

  const confidenceColor =
    route.estimatedArrivalConfidence >= 75
      ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
      : route.estimatedArrivalConfidence >= 50
      ? "text-amber-600 bg-amber-500/10 border-amber-500/30"
      : "text-rose-600 bg-rose-500/10 border-rose-500/30";

  const getHighlightBadge = () => {
    switch (isHighlight) {
      case "fastest":
        return <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-600">⚡ Fastest</span>;
      case "cheapest":
        return <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">💰 Cheapest</span>;
      case "highestConfidence":
        return <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-semibold text-teal-600">🛡️ Most Reliable</span>;
      case "bestBalance":
        return <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-600">⭐ Best Overall</span>;
      default:
        return null;
    }
  };

  return (
    <article
      className={`group relative rounded-2xl border bg-surface p-5 transition-all duration-200 hover:shadow-xl ${
        route.missesDeadline
          ? "border-red-500/30 bg-red-500/[0.02]"
          : isHighlight
          ? "border-accent/40 shadow-md ring-1 ring-accent/20"
          : "border-border hover:border-accent/40"
      }`}
    >
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          {getHighlightBadge()}
          <span className="text-xs font-medium text-muted">
            {route.transfers === 0 ? "Direct journey" : `${route.transfers} transfer (${route.segments[0].to.cityName})`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Arrival Buffer Status */}
          {route.missesDeadline ? (
            <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600">
              <AlertTriangleIcon className="h-3.5 w-3.5" />
              Misses deadline by {formatDuration(Math.abs(route.deadlineBufferMinutes))}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              {formatBuffer(route.deadlineBufferMinutes)}
            </span>
          )}

          {/* Save Button */}
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(route)}
              aria-label={isSaved ? "Remove from saved trips" : "Save trip"}
              className={`rounded-lg p-1.5 transition-colors ${
                isSaved
                  ? "bg-rose-500/15 text-rose-600"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <BookmarkIcon className="h-4 w-4" filled={isSaved} />
            </button>
          )}
        </div>
      </div>

      {/* Main card body */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr,auto]">
        {/* Journey timing and segments */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground">
                {formatClock(route.departureTime)}
              </div>
              <div className="text-xs font-medium text-muted">{first.from.name}</div>
            </div>

            <div className="flex flex-1 items-center gap-2 px-2">
              <div className="h-[2px] flex-1 bg-border group-hover:bg-accent/40 transition-colors" />
              <div className="flex items-center gap-1 text-xs font-semibold text-muted">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>{formatDuration(route.totalDurationMinutes)}</span>
              </div>
              <div className="h-[2px] flex-1 bg-border group-hover:bg-accent/40 transition-colors" />
            </div>

            <div className="text-right">
              <div className="text-xl font-bold tracking-tight text-foreground">
                {formatClock(route.arrivalTime)}
              </div>
              <div className="text-xs font-medium text-muted">{last.to.name}</div>
            </div>
          </div>

          {/* Segment badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {route.segments.map((seg, idx) => (
              <React.Fragment key={seg.id}>
                {idx > 0 && (
                  <span className="text-xs text-muted font-bold">
                    + {route.waitingMinutes}m layover →
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                  {seg.type === "flight" ? (
                    <FlightIcon className="h-3.5 w-3.5 text-sky-500" />
                  ) : (
                    <TrainIcon className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span>{seg.operator}</span>
                  <span className="text-muted">({seg.operatorId})</span>
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Confidence meter */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-medium text-muted">Arrival Confidence:</span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-border/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  route.estimatedArrivalConfidence >= 75
                    ? "bg-emerald-500"
                    : route.estimatedArrivalConfidence >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, route.estimatedArrivalConfidence))}%` }}
              />
            </div>
            <span className={`rounded-md border px-1.5 py-0.5 text-xs font-bold ${confidenceColor}`}>
              {route.estimatedArrivalConfidence}%
            </span>
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className="flex flex-col justify-between items-end border-t border-border/70 pt-3 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0">
          <div className="text-right">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatInr(route.totalPrice)}
            </div>
            <div className="text-xs font-medium text-muted">total per traveler</div>
            {route.score > 0 && (
              <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                Score: {route.score} / 10
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenDetails(route, "simulator")}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Simulate Delays
            </button>
            <button
              type="button"
              onClick={() => onOpenDetails(route, "ai")}
              className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              AI Insights
            </button>
            <button
              type="button"
              onClick={() => onOpenDetails(route, "overview")}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
