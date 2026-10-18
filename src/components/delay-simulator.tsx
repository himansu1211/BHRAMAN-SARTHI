"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TravelRoute } from "@/lib/types";
import { simulateDelay } from "@/lib/routing/delay-simulator";
import { AlertTriangle, CheckCircle2, Clock, X, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

interface DelaySimulatorProps {
  route: TravelRoute;
  deadlineISO: string;
  allRoutes: TravelRoute[];
  onClose: () => void;
  onSelectAlternative: (alternativeRoute: TravelRoute) => void;
}

export function DelaySimulator({
  route,
  deadlineISO,
  allRoutes,
  onClose,
  onSelectAlternative,
}: DelaySimulatorProps) {
  const [delayMinutes, setDelayMinutes] = useState<number>(60);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const simulation = useMemo(() => {
    return simulateDelay(route, delayMinutes, deadlineISO, allRoutes);
  }, [route, delayMinutes, deadlineISO, allRoutes]);

  const alternativeRoute = useMemo(() => {
    if (!simulation.suggestedAlternativeRouteId) return undefined;
    return allRoutes.find((r) => r.id === simulation.suggestedAlternativeRouteId);
  }, [simulation.suggestedAlternativeRouteId, allRoutes]);

  const delayOptions = [0, 30, 60, 120, 180];

  const formatBuffer = (mins: number) => {
    const isNeg = mins < 0;
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const str = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
    return isNeg ? `${str} past deadline` : `${str} before deadline`;
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulator-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border-2 border-double border-amber-400 bg-paper-light shadow-yatra-lg animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-300 bg-paper-deep px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-light border border-amber-300 text-vermilion shadow-yatra-sm">
                <Clock className="h-4 w-4" />
              </span>
              <h3 id="simulator-title" className="font-display text-base font-bold text-ink">
                &quot;What-If?&quot; Disruption Simulator
              </h3>
            </div>
            <p className="text-xs font-semibold text-ink-muted">
              Stress-test your multimodal arrival time against simulated delay scenarios.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close disruption simulator"
            className="rounded-full p-2 text-ink-muted hover:bg-amber-200/60 hover:text-ink cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Delay Selector Buttons */}
          <div>
            <label className="mb-2 block font-display text-xs font-bold tracking-wider text-ink uppercase">
              Simulated Delay on First Leg ({route.segments[0].operator}):
            </label>
            <div className="flex flex-wrap gap-2">
              {delayOptions.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDelayMinutes(mins)}
                  aria-label={`Simulate ${mins === 0 ? "on time" : mins + " minutes"} delay`}
                  className={`flex-1 rounded-xl py-2.5 px-3 font-display text-xs font-bold transition cursor-pointer min-h-[44px] ${
                    delayMinutes === mins
                      ? "bg-vermilion text-paper-light shadow-yatra-sm border-2 border-amber-400"
                      : "border border-amber-300 bg-paper-deep text-ink hover:bg-amber-100"
                  }`}
                >
                  {mins === 0 ? "0 min (On-time)" : `+${mins} min`}
                </button>
              ))}
            </div>
          </div>

          {/* ARIA Live Region for Screen Readers */}
          <div className="sr-only" aria-live="polite">
            Simulated delay set to {delayMinutes} minutes. Updated arrival time is {formatTime(simulation.newArrivalTime)} with {simulation.newConfidence}% confidence.
          </div>

          {/* Comparison Grid: Scheduled vs Simulated Delay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scheduled */}
            <div className="rounded-2xl border border-amber-300 bg-paper-deep/70 p-4">
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Scheduled (0 min delay)
              </span>
              <div className="mt-2 font-mono text-xl font-bold text-ink">
                {formatTime(simulation.originalArrivalTime)}
              </div>
              <div className="mt-1 text-xs font-bold text-peacock">
                {simulation.originalConfidence}% confidence
              </div>
              <div className="mt-1 text-xs font-semibold text-ink-muted">
                {deadlineISO ? formatBuffer(simulation.originalBufferMinutes) : "No arrival deadline set"}
              </div>
            </div>

            {/* After Delay */}
            <div
              className={`rounded-2xl border-2 p-4 ${
                simulation.riskLevel === "critical"
                  ? "border-crimson-alert/50 bg-red-50"
                  : simulation.riskLevel === "high"
                  ? "border-amber-400 bg-paper-deep"
                  : "border-indigo-300 bg-indigo-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[10px] font-bold uppercase tracking-wider text-ink">
                  After +{delayMinutes}m delay
                </span>
                {simulation.transferBroken && (
                  <span className="rounded-full bg-crimson-alert px-2 py-0.5 text-[9px] font-bold text-paper-light uppercase shadow-yatra-sm">
                    Transfer Missed
                  </span>
                )}
              </div>

              <div className="mt-2 font-mono text-xl font-bold text-ink">
                {formatTime(simulation.newArrivalTime)}
              </div>
              <div
                className={`mt-1 text-xs font-bold ${
                  simulation.newConfidence < 50 ? "text-crimson-alert" : "text-amber-800"
                }`}
              >
                {simulation.newConfidence}% estimated confidence
              </div>
              <div
                className={`mt-1 text-xs font-semibold ${
                  simulation.newBufferMinutes < 0 ? "text-crimson-alert font-bold" : "text-ink-muted"
                }`}
              >
                {deadlineISO ? formatBuffer(simulation.newBufferMinutes) : "No arrival deadline set"}
              </div>
            </div>
          </div>

          {/* Risk Alert Banner */}
          <div>
            {simulation.riskLevel === "critical" && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-crimson-alert border-2 border-crimson-alert/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-crimson-alert mt-0.5" />
                <div>
                  <strong className="block font-display font-bold">⚠️ Critical Deadline Failure</strong>
                  {simulation.transferBroken
                    ? "The incoming delay violates the required interchange transfer buffer. You will miss your connecting segment!"
                    : "This delay pushes arrival past your specified deadline."}
                </div>
              </div>
            )}

            {simulation.riskLevel === "high" && (
              <div className="flex items-start gap-3 rounded-2xl bg-paper-deep p-4 text-xs font-bold text-ink border-2 border-amber-400">
                <ShieldAlert className="h-5 w-5 shrink-0 text-vermilion mt-0.5" />
                <div>
                  <strong className="block font-display font-bold text-vermilion">⚠️ High Deadline Risk</strong>
                  Safety buffer reduced to {Math.max(0, simulation.newBufferMinutes)} mins. Minor congestion on arrival will cause deadline failure.
                </div>
              </div>
            )}

            {simulation.riskLevel === "low" && (
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-peacock border-2 border-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-peacock mt-0.5" />
                <div>
                  <strong className="block font-display font-bold">Resilient Corridor Schedule</strong>
                  Even with a {delayMinutes}m delay, you maintain an adequate buffer before your deadline.
                </div>
              </div>
            )}
          </div>

          {/* Alternative Route Suggestion */}
          {alternativeRoute && (
            <div className="rounded-2xl border-2 border-amber-400 bg-paper-deep p-4 space-y-2 shadow-yatra-sm">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold text-vermilion">
                <Sparkles className="h-4 w-4 text-vermilion" />
                Recommended Safer Alternative Corridor:
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-sm font-bold text-ink">
                    {alternativeRoute.segments.map((s) => s.operator).join(" + ")}
                  </div>
                  <div className="font-mono text-xs font-bold text-ink-muted">
                    ₹{alternativeRoute.totalPrice.toLocaleString("en-IN")} • {alternativeRoute.estimatedArrivalConfidence}% confidence
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectAlternative(alternativeRoute)}
                  aria-label="Switch to safer alternative route"
                  className="flex items-center gap-1.5 rounded-xl bg-vermilion px-3.5 py-2 font-display text-xs font-bold text-paper-light shadow-yatra-sm transition hover:bg-amber-900 cursor-pointer min-h-[44px]"
                >
                  <span>Switch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t-2 border-amber-300 bg-paper-deep px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close disruption simulator modal"
            className="rounded-xl bg-ink px-5 py-2 font-display text-xs font-bold text-paper-light transition hover:bg-amber-950 cursor-pointer focus-visible:ring-2 focus-visible:ring-vermilion min-h-[44px]"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
