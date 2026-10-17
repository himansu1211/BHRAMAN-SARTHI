"use client";

import React from "react";
import type { SearchSummary, TravelRoute } from "@/lib/types/travel";
import { formatInr } from "@/lib/format";
import { formatDuration } from "@/lib/time";
import { RathChakraIcon, LotusIcon } from "@/components/traditional-icons";

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
      title: "सर्वश्रेष्ठ संतुलन",
      enTitle: "Best Overall",
      route: bestBalance,
      highlight: bestBalance ? `अंक ${bestBalance.score}/१०` : "",
      sub: bestBalance ? `${formatInr(bestBalance.totalPrice)} • ${formatDuration(bestBalance.totalDurationMinutes)}` : "",
      icon: "👑",
      color: "border-purple-300 bg-gradient-to-b from-purple-50 to-white hover:border-purple-500",
      activeColor: "ring-2 ring-purple-600 border-purple-600 bg-purple-100/60 shadow-md",
    },
    {
      type: "cheapest",
      title: "अति मितव्ययी",
      enTitle: "Cheapest",
      route: cheapest,
      highlight: cheapest ? formatInr(cheapest.totalPrice) : "",
      sub: cheapest ? `${formatDuration(cheapest.totalDurationMinutes)} • ${cheapest.estimatedArrivalConfidence}% विश्वास` : "",
      icon: "💰",
      color: "border-emerald-300 bg-gradient-to-b from-emerald-50 to-white hover:border-emerald-500",
      activeColor: "ring-2 ring-emerald-600 border-emerald-600 bg-emerald-100/60 shadow-md",
    },
    {
      type: "fastest",
      title: "तीव्रगामी",
      enTitle: "Fastest Speed",
      route: fastest,
      highlight: fastest ? formatDuration(fastest.totalDurationMinutes) : "",
      sub: fastest ? `${formatInr(fastest.totalPrice)} • ${fastest.transfers === 0 ? "प्रत्यक्ष (Direct)" : "१ पड़ाव"}` : "",
      icon: "⚡",
      color: "border-blue-300 bg-gradient-to-b from-blue-50 to-white hover:border-blue-500",
      activeColor: "ring-2 ring-blue-600 border-blue-600 bg-blue-100/60 shadow-md",
    },
    {
      type: "highestConfidence",
      title: "अटल विश्वास",
      enTitle: "Most Reliable",
      route: highestConfidence,
      highlight: highestConfidence ? `${highestConfidence.estimatedArrivalConfidence}% विश्वास` : "",
      sub: highestConfidence ? `${formatInr(highestConfidence.totalPrice)} • ${formatDuration(highestConfidence.totalDurationMinutes)}` : "",
      icon: "🛡️",
      color: "border-amber-400 bg-gradient-to-b from-amber-50 to-white hover:border-amber-600",
      activeColor: "ring-2 ring-amber-600 border-amber-600 bg-amber-100/60 shadow-md",
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
            className={`flex flex-col text-left rounded-2xl border-2 p-3.5 transition-all shadow-sm ${
              isSelected ? c.activeColor : c.color
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#6e5246]">
              <div>
                <span className="font-devanagari text-xs text-[#2a1610]">{c.title}</span>
                <span className="block text-[10px] text-[#74584c] uppercase">{c.enTitle}</span>
              </div>
              <span className="text-base">{c.icon}</span>
            </div>
            <div className="mt-1 font-royal-title text-base font-bold text-[#8e1b1b]">
              {c.highlight}
            </div>
            <div className="text-[11px] font-medium text-[#74584c] truncate">
              {c.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}
