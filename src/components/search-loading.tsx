"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { WarliFigure } from "./ornaments";

const STEPS = [
  "Finding available flights (Indigo, Air India), trains (Vande Bharat, Rajdhani) & buses...",
  "Stitching multi-leg transfers & inter-city Metro connections...",
  "Calculating arrival safety buffers against your cutoff deadline...",
  "Ranking optimal corridors by price, time & arrival confidence...",
];

export function SearchLoading() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-300 max-w-3xl mx-auto space-y-6">
      {/* Compass / Traveler Spinner */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-vermilion/10" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-deep border-2 border-amber-400 text-vermilion shadow-yatra-md">
          <WarliFigure type="compass" size={44} className="text-vermilion animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-lg font-bold text-ink">
          BHRAMAN SARTHI — Analyzing Multimodal Corridors
        </h3>
        <p className="text-xs font-bold text-vermilion min-h-[20px]">
          {STEPS[stepIndex]}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx <= stepIndex ? "w-8 bg-vermilion" : "w-2 bg-amber-300/60"
            }`}
          />
        ))}
      </div>

      {/* Skeleton Loaders */}
      <div className="w-full space-y-4 pt-6">
        <div className="font-display text-xs font-bold text-ink-muted uppercase tracking-wider text-left flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-vermilion" />
          Preparing Route Options...
        </div>

        {/* Skeleton Card 1 */}
        <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-4 shadow-yatra-sm">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded-lg bg-paper-deep animate-pulse" />
            <div className="h-4 w-20 rounded-lg bg-paper-deep animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="h-8 w-24 rounded-xl bg-paper-deep animate-pulse" />
            <div className="h-2 flex-1 rounded-full bg-amber-200 animate-pulse" />
            <div className="h-8 w-24 rounded-xl bg-paper-deep animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-5 w-40 rounded-lg bg-paper-deep animate-pulse" />
            <div className="h-9 w-28 rounded-xl bg-paper-deep animate-pulse" />
          </div>
        </div>

        {/* Skeleton Card 2 */}
        <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-4 shadow-yatra-sm opacity-70">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded-lg bg-paper-deep animate-pulse" />
            <div className="h-4 w-16 rounded-lg bg-paper-deep animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="h-8 w-20 rounded-xl bg-paper-deep animate-pulse" />
            <div className="h-2 flex-1 rounded-full bg-amber-200 animate-pulse" />
            <div className="h-8 w-20 rounded-xl bg-paper-deep animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

