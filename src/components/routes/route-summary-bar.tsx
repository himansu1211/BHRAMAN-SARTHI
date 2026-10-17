"use client";

import React from "react";
import type { SearchSummary, TravelRoute } from "@/lib/types/travel";
import { formatInr } from "@/lib/format";
import { formatDuration } from "@/lib/time";

interface RouteSummaryBarProps {
  summary: SearchSummary;
  routes: TravelRoute[];
  selectedId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export function RouteSummaryBar({
  summary,
  routes,
  selectedId,
  onSelectRoute,
}: RouteSummaryBarProps) {
  const fastest = routes.find((r) => r.id === summary.fastestId);
  const cheapest = routes.find((r) => r.id === summary.cheapestId);
  const highestConfidence = routes.find((r) => r.id === summary.highestConfidenceId);
  const bestBalance = routes.find((r) => r.id === summary.bestBalanceId);

  const cards = [
    {
      type: "bestBalance",
      title: "Best Overall",
      route: bestBalance,
      highlight: bestBalance ? `Score ${bestBalance.score}/10` : "",
      sub: bestBalance ? `${formatInr(bestBalance.totalPrice)} • ${formatDuration(bestBalance.totalDurationMinutes)}` : "",
      icon: "⭐",
      color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500",
      activeColor: "ring-2 ring-purple-500 border-purple-500 bg-purple-500/10",
    },
    {
      type: "cheapest",
      title: "Cheapest",
      route: cheapest,
      highlight: cheapest ? formatInr(cheapest.totalPrice) : "",
      sub: cheapest ? `${formatDuration(cheapest.totalDurationMinutes)} • ${cheapest.estimatedArrivalConfidence}% conf.` : "",
      icon: "💰",
      color: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500",
      activeColor: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10",
    },
    {
      type: "fastest",
      title: "Fastest",
      route: fastest,
      highlight: fastest ? formatDuration(fastest.totalDurationMinutes) : "",
      sub: fastest ? `${formatInr(fastest.totalPrice)} • ${fastest.transfers === 0 ? "Direct" : "1 transfer"}` : "",
      icon: "⚡",
      color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500",
      activeColor: "ring-2 ring-blue-500 border-blue-500 bg-blue-500/10",
    },
    {
      type: "highestConfidence",
      title: "Most Reliable",
      route: highestConfidence,
      highlight: highestConfidence ? `${highestConfidence.estimatedArrivalConfidence}% conf.` : "",
      sub: highestConfidence ? `${formatInr(highestConfidence.totalPrice)} • ${formatDuration(highestConfidence.totalDurationMinutes)}` : "",
      icon: "🛡️",
      color: "border-teal-500/30 bg-teal-500/5 hover:border-teal-500",
      activeColor: "ring-2 ring-teal-500 border-teal-500 bg-teal-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => {
        if (!c.route) return null;
        const isSelected = selectedId === c.route.id;

        return (
          <button
            key={c.type}
            type="button"
            onClick={() => onSelectRoute(c.route!.id)}
            className={`flex flex-col text-left rounded-xl border p-3.5 transition-all ${
              isSelected ? c.activeColor : c.color
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>{c.title}</span>
              <span className="text-sm">{c.icon}</span>
            </div>
            <div className="mt-1 text-base font-bold text-foreground">
              {c.highlight}
            </div>
            <div className="text-[11px] font-medium text-muted truncate">
              {c.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}
