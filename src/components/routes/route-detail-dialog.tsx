"use client";

import React, { useState, useEffect } from "react";
import { formatClock, formatDuration, formatBuffer } from "@/lib/time";
import { formatInr } from "@/lib/format";
import type { DelaySimulation, SearchInput, TravelRoute } from "@/lib/types/travel";
import { DELAY_OPTIONS_MINUTES } from "@/lib/config/app";
import {
  FlightIcon,
  TrainIcon,
  ClockIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  CloseIcon,
  SparklesIcon,
} from "@/components/icons";

interface RouteDetailDialogProps {
  route: TravelRoute;
  searchInput: SearchInput;
  defaultTab?: "overview" | "simulator" | "ai";
  onClose: () => void;
  onSelectAlternative?: (route: TravelRoute) => void;
}

export function RouteDetailDialog({
  route,
  searchInput,
  defaultTab = "overview",
  onClose,
  onSelectAlternative,
}: RouteDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "ai">(defaultTab);

  // Delay Simulator State
  const [delayMinutes, setDelayMinutes] = useState<number>(30);
  const [simResult, setSimResult] = useState<DelaySimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [aiSource, setAiSource] = useState<string>("template");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load simulator data
  const handleSimulate = async (delay: number) => {
    setDelayMinutes(delay);
    setIsSimulating(true);
    setSimError(null);

    try {
      const res = await fetch("/api/simulate-delay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...searchInput,
          routeId: route.id,
          delayMinutes: delay,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Simulation failed");
      }

      const data = await res.json();
      setSimResult(data.simulation);
    } catch (err: any) {
      setSimError(err.message || "Failed to simulate delay");
    } finally {
      setIsSimulating(false);
    }
  };

  // Load AI Explanation
  const handleLoadAiExplanation = async () => {
    if (aiExplanation) return;
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const res = await fetch("/api/explain-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...searchInput,
          routeId: route.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to generate explanation");
      }

      const data = await res.json();
      setAiExplanation(data.explanation);
      setAiSource(data.source);
    } catch (err: any) {
      setAiError(err.message || "Could not load AI explanation");
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    if (activeTab === "simulator" && !simResult) {
      handleSimulate(30);
    }
    if (activeTab === "ai" && !aiExplanation) {
      handleLoadAiExplanation();
    }
  }, [activeTab]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id="dialog-title" className="text-xl font-bold tracking-tight text-foreground">
              {route.segments[0].from.cityName} → {route.segments[route.segments.length - 1].to.cityName}
            </h2>
            <p className="text-xs font-medium text-muted">
              {formatDuration(route.totalDurationMinutes)} • {formatInr(route.totalPrice)} • {route.estimatedArrivalConfidence}% Arrival Confidence
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl border border-border p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-background px-6">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "overview"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Journey Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "simulator"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            What-If Delay Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "ai"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            AI Route Insights
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Timeline segments */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                  Itinerary Segments
                </h3>

                {route.segments.map((seg, idx) => (
                  <div key={seg.id} className="relative rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          {seg.type === "flight" ? <FlightIcon className="h-4 w-4" /> : <TrainIcon className="h-4 w-4" />}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-foreground">{seg.operator}</span>
                          <span className="ml-2 text-xs text-muted">({seg.id})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">{formatInr(seg.price)}</span>
                        <div className="text-[11px] text-muted">Base: {formatInr(seg.baseFare)} + Tax: {formatInr(seg.taxes + seg.fees)}</div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-muted">Departure</div>
                        <div className="text-base font-bold text-foreground">{formatClock(seg.departure)}</div>
                        <div className="text-xs text-muted">{seg.from.name}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-muted">Arrival</div>
                        <div className="text-base font-bold text-foreground">{formatClock(seg.arrival)}</div>
                        <div className="text-xs text-muted">{seg.to.name}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted">
                      <span>Duration: {formatDuration(seg.durationMinutes)}</span>
                      <span>Historical On-Time Reliability: {Math.round(seg.reliability * 100)}%</span>
                    </div>

                    {/* Layover connecting info */}
                    {idx < route.segments.length - 1 && (
                      <div className="mt-4 -mb-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                        <div className="flex items-center justify-between font-semibold text-amber-700 dark:text-amber-400">
                          <span>🔄 Transfer at {seg.to.cityName}</span>
                          <span>{route.waitingMinutes} min layover</span>
                        </div>
                        <div className="mt-1 text-muted">
                          Available connection time: {route.transferMinutes}m (Minimum required buffer: {route.transferMinutes - route.waitingMinutes}m)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Deadline buffer summary */}
              <div className="rounded-2xl border border-border bg-background p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Deadline Assessment
                </h4>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {route.missesDeadline ? (
                      <AlertTriangleIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      Target Arrive-By: {formatClock(searchInput.arriveBy)}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${route.missesDeadline ? "text-red-500" : "text-emerald-500"}`}>
                    {formatBuffer(route.deadlineBufferMinutes)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Simulate Delay on First Leg
                </h3>
                <p className="mt-1 text-xs text-muted">
                  What happens if your first leg is delayed by weather, traffic, or scheduling? Test how resilient this route is.
                </p>

                {/* Delay minute buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {DELAY_OPTIONS_MINUTES.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => handleSimulate(mins)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                        delayMinutes === mins
                          ? "border-accent bg-accent text-white shadow-md shadow-accent/20"
                          : "border-border bg-background text-muted hover:border-accent hover:text-foreground"
                      }`}
                    >
                      {mins === 0 ? "On-Time (0m)" : `+${mins} min Delay`}
                    </button>
                  ))}
                </div>
              </div>

              {isSimulating && (
                <div className="py-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="mt-2 text-xs font-medium text-muted">Simulating connection margins & cascading impacts...</p>
                </div>
              )}

              {simError && (
                <div className="rounded-xl bg-red-500/10 p-4 text-xs font-medium text-red-600">
                  {simError}
                </div>
              )}

              {simResult && !isSimulating && (
                <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-semibold text-muted">Simulation Result for +{simResult.delayMinutes}m delay:</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        simResult.status === "ok"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : simResult.status === "tight"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-red-500/15 text-red-600"
                      }`}
                    >
                      {simResult.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted">Simulated Final Arrival</div>
                      <div className="text-lg font-bold text-foreground">{formatClock(simResult.arrivalTime)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Simulated Deadline Buffer</div>
                      <div className={`text-lg font-bold ${simResult.deadlineBufferMinutes >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatBuffer(simResult.deadlineBufferMinutes)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Connection Held?</div>
                      <div className={`text-base font-bold ${simResult.connectionViable ? "text-emerald-600" : "text-red-600"}`}>
                        {simResult.connectionViable ? "✓ Yes (Connection intact)" : "❌ Missed connection!"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Updated Confidence</div>
                      <div className="text-base font-bold text-foreground">
                        {simResult.estimatedArrivalConfidence}%
                      </div>
                    </div>
                  </div>

                  {/* Alternative Backup Route Recommendation */}
                  {simResult.alternative && (
                    <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                        <span>💡 Recommended Alternative Route</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        If your current flight/train gets delayed, this alternative route gets you there before your deadline:
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {formatClock(simResult.alternative.departureTime)} → {formatClock(simResult.alternative.arrivalTime)}
                          </div>
                          <div className="text-xs text-muted">
                            {formatInr(simResult.alternative.totalPrice)} • {formatDuration(simResult.alternative.totalDurationMinutes)}
                          </div>
                        </div>
                        {onSelectAlternative && (
                          <button
                            type="button"
                            onClick={() => onSelectAlternative(simResult.alternative!)}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
                          >
                            Switch to this Route
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">AI Intelligence & Trade-off Analysis</h3>
                  <p className="text-xs text-muted">Heuristic synthesis of deadline buffer, transfer risks, and multi-modal stability.</p>
                </div>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  Source: {aiSource}
                </span>
              </div>

              {isLoadingAi ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="mt-2 text-xs font-medium text-muted">Analyzing route dynamics with AI model...</p>
                </div>
              ) : aiError ? (
                <div className="rounded-xl bg-red-500/10 p-4 text-xs font-medium text-red-600">
                  {aiError}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-background p-5 text-sm leading-relaxed text-foreground">
                  <p className="whitespace-pre-line">{aiExplanation || route.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-4 bg-background">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-accent px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
