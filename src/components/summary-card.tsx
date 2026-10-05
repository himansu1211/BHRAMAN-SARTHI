"use client";

import React from "react";
import { TravelRoute } from "@/lib/types";
import { Plane, Train, Bus, Clock, ShieldCheck, Zap, TrendingUp } from "lucide-react";

interface SummaryCardProps {
  title: string;
  category: "best_balance" | "fastest" | "cheapest" | "safest";
  route?: TravelRoute;
  onSelect: (route: TravelRoute) => void;
  isSelected: boolean;
}

export function SummaryCard({ title, category, route, onSelect, isSelected }: SummaryCardProps) {
  if (!route) return null;

  const hours = Math.floor(route.totalDurationMinutes / 60);
  const mins = route.totalDurationMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const categoryConfig = {
    best_balance: {
      icon: TrendingUp,
      borderColor: "border-vermilion",
      bgBadge: "bg-vermilion text-paper-light",
      highlightText: "Balanced Choice",
    },
    fastest: {
      icon: Zap,
      borderColor: "border-amber-600",
      bgBadge: "bg-amber-700 text-paper-light",
      highlightText: "Quickest Arrival",
    },
    cheapest: {
      icon: Clock,
      borderColor: "border-peacock",
      bgBadge: "bg-peacock text-paper-light",
      highlightText: "Lowest Fare",
    },
    safest: {
      icon: ShieldCheck,
      borderColor: "border-indigo",
      bgBadge: "bg-indigo text-paper-light",
      highlightText: "Max Buffer",
    },
  }[category];

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Select ${title} option: ₹${route.totalPrice.toLocaleString("en-IN")}, ${timeStr}, ${route.estimatedArrivalConfidence}% confidence`}
      onClick={() => onSelect(route)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(route);
        }
      }}
      className={`summary-card group relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition shadow-yatra-sm hover:shadow-yatra-md focus-visible:ring-2 focus-visible:ring-vermilion min-h-[160px] ${
        isSelected
          ? `ring-2 ${categoryConfig.borderColor} bg-paper-deep border-vermilion`
          : "border-amber-300/80 bg-paper-light hover:border-amber-400"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className={`rounded-lg px-2.5 py-1 font-display text-[11px] font-bold tracking-wider uppercase shadow-yatra-sm ${categoryConfig.bgBadge}`}>
            {title}
          </span>
          <div className="flex items-center gap-1 text-ink-muted">
            {route.segments.some((s) => s.type === "flight") && <Plane className="h-4 w-4 text-indigo" />}
            {route.segments.some((s) => s.type === "train") && <Train className="h-4 w-4 text-vermilion" />}
            {route.segments.some((s) => s.type === "bus") && <Bus className="h-4 w-4 text-peacock" />}
          </div>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between">
          <div className="font-mono text-2xl font-bold tracking-tight text-ink">
            ₹{route.totalPrice.toLocaleString("en-IN")}
          </div>
          <div className="font-mono text-sm font-bold text-ink-muted">
            {timeStr}
          </div>
        </div>
        <div className="text-[10px] text-ink-muted font-medium mt-0.5">
          {route.segments.every((segment) => segment.dataSource === "live-api") ? "Live fare · provider availability" : "Indicative fare · current price not checked"}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="font-bold text-peacock">
            {route.estimatedArrivalConfidence}% confidence
          </span>
          <span className="font-semibold text-ink-muted">
            {route.transfers === 0 ? "Non-stop" : `${route.transfers} transfer`}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-amber-300/60 pt-3 text-[11px] font-bold text-ink-muted">
        {route.deadlineBufferMinutes == null ? "No arrival deadline applied" : <><span className="text-vermilion font-bold">{Math.round(route.deadlineBufferMinutes / 60)}h buffer</span> before deadline</>}
      </div>
    </div>
  );
}
