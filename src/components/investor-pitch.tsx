"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { IndiaTransitMarketBrief } from "./india-transit-market-brief";

interface InvestorPitchProps {
  onClose: () => void;
}

export function InvestorPitch({ onClose }: InvestorPitchProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pitch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50/80 px-6 py-5 text-stone-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                Series Seed Memo
              </span>
              <h3 id="pitch-modal-title" className="text-lg font-black tracking-tight">
                BHRAMAN SARTHI — Investor Memo
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-stone-600 font-medium">
              Transforming \$32B Indian domestic transit from price-first searching to deadline-guaranteed routing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close investor deck modal"
            className="rounded-full p-1.5 text-stone-500 hover:bg-amber-200/60 hover:text-stone-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Pitch Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-[10px] font-black text-stone-500 uppercase">Target Market (TAM)</span>
              <div className="mt-1 text-2xl font-black text-stone-900">\$32B+</div>
              <span className="text-[11px] font-semibold text-stone-600">Indian domestic transit</span>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-[10px] font-black text-stone-500 uppercase">Annual Trips</span>
              <div className="mt-1 text-2xl font-black text-indigo-700">1.2 Billion</div>
              <span className="text-[11px] font-semibold text-stone-600">Interstate travelers</span>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-[10px] font-black text-stone-500 uppercase">Core Differentiator</span>
              <div className="mt-1 text-2xl font-black text-orange-700">Deadline First</div>
              <span className="text-[11px] font-semibold text-stone-600">Buffer & Confidence engine</span>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-[10px] font-black text-stone-500 uppercase">Tech Readiness</span>
              <div className="mt-1 text-2xl font-black text-emerald-700">Production MVP</div>
              <span className="text-[11px] font-semibold text-stone-600">Multimodal routing active</span>
            </div>
          </div>

          {/* Problem vs Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-800">
                The Friction (Incumbent Gaps)
              </h4>
              <ul className="space-y-2 text-xs text-stone-800">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-black">•</span>
                  <span><strong>Siloed Platforms:</strong> Skyscanner searches flights, IRCTC does trains, RedBus does buses. No single engine stitches them realistically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-black">•</span>
                  <span><strong>Naive Sorting:</strong> Users care about reaching before meetings/events, but platforms only optimize for raw cheapest fare.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-black">•</span>
                  <span><strong>Missed Connections:</strong> Zero intelligence on intra-city transfers (e.g. Metro from Delhi T3 to New Delhi Railway Station).</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                The BHRAMAN SARTHI Moat
              </h4>
              <ul className="space-y-2 text-xs text-stone-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>Deadline-Aware Pruning:</strong> Automatically filters out journeys that arrive past the passenger&apos;s cutoff time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>Interchange Graph:</strong> Accurately models terminal transit times (Metro, Cabs, Shuttles) between airports, stations, and bus ports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-black">✓</span>
                  <span><strong>&quot;What-If&quot; Disruption Simulator:</strong> Allows travelers to simulate 30–180m delays and get immediate alternative routes.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Revenue Model */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-700">
              Monetization Streams
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-1">
                <strong className="block font-black text-stone-900">1. Aggregator Referral Revenues</strong>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Referral revenue per booking across Skyscanner, IRCTC partner APIs, and RedBus.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-1">
                <strong className="block font-black text-stone-900">2. &quot;On-Time Guarantee&quot; Buffer</strong>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  ₹149–₹299 premium protecting users if delay exceeds safe buffer, providing re-booking assistance.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-1">
                <strong className="block font-black text-stone-900">3. Corporate B2B API</strong>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Enterprise API subscription for business travel desks demanding strict arrival adherence.
                </p>
              </div>
            </div>
          </div>

          {/* Comprehensive India Travel & Transportation Market Brief */}
          <IndiaTransitMarketBrief />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-200 bg-amber-50/80 px-6 py-4">
          <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
            <span>Bhraman Sarthi Tech Pvt. Ltd. • Seed Deck 2026</span>
            <Link
              href="/investors"
              onClick={onClose}
              className="inline-flex items-center gap-1 font-bold text-orange-700 hover:text-orange-900 underline"
            >
              <span>Open Full-Screen Deck</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close investor deck modal"
            className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-black text-white transition hover:bg-orange-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            Close Deck
          </button>
        </div>
      </div>
    </div>
  );
}
