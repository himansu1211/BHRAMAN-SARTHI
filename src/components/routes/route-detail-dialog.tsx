"use client";

import React, { useState, useEffect } from "react";
import { formatClock, formatDuration, formatBuffer } from "@/lib/time";
import { formatInr } from "@/lib/format";
import type { DelaySimulation, SearchInput, TravelRoute } from "@/lib/types/travel";
import { DELAY_OPTIONS_MINUTES } from "@/lib/config/app";
import {
  ClockIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  CloseIcon,
  SparklesIcon,
} from "@/components/icons";
import {
  VimanaIcon,
  RajGadiIcon,
  RathChakraIcon,
  LotusIcon,
  OrnateCorner,
  RoyalSealIcon,
  DiyaIcon,
} from "@/components/traditional-icons";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border-2 border-[#dfc89d] bg-gradient-to-b from-[#fffefc] to-[#fbf6ea] shadow-2xl overflow-hidden">
        {/* Ornate Corner Flourishes */}
        <div className="absolute top-2 left-2 pointer-events-none z-10">
          <OrnateCorner className="w-5 h-5 text-amber-600/70" />
        </div>
        <div className="absolute top-2 right-2 rotate-90 pointer-events-none z-10">
          <OrnateCorner className="w-5 h-5 text-amber-600/70" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfc89d] px-6 py-4 bg-[#fbf6ea]/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#8e1b1b] to-amber-700 text-amber-200 shadow-md">
              <RathChakraIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dialog-title" className="font-royal-title text-lg sm:text-xl font-bold tracking-tight text-[#2a1610]">
                  {route.segments[0].from.cityName} → {route.segments[route.segments.length - 1].to.cityName}
                </h2>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                  यात्रा विवरण
                </span>
              </div>
              <p className="text-xs font-semibold text-[#74584c]">
                अवधि: {formatDuration(route.totalDurationMinutes)} • व्यय: {formatInr(route.totalPrice)} • {route.estimatedArrivalConfidence}% आगमन विश्वास
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl border border-[#dfc89d] bg-white p-2 text-[#74584c] transition-colors hover:bg-amber-100 hover:text-[#8e1b1b]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#dfc89d] bg-[#fdfaf3] px-6">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "overview"
                ? "border-[#8e1b1b] text-[#8e1b1b]"
                : "border-transparent text-[#74584c] hover:text-[#2a1610]"
            }`}
          >
            <span className="font-devanagari">१. यात्रा समयरेखा</span> (Timeline)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "simulator"
                ? "border-[#8e1b1b] text-[#8e1b1b]"
                : "border-transparent text-[#74584c] hover:text-[#2a1610]"
            }`}
          >
            <span className="font-devanagari">२. विलंब काल गणना</span> (Simulator)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "ai"
                ? "border-[#8e1b1b] text-[#8e1b1b]"
                : "border-transparent text-[#74584c] hover:text-[#2a1610]"
            }`}
          >
            <SparklesIcon className="h-4 w-4 text-amber-600" />
            <span className="font-devanagari">३. सारथी परामर्श</span> (AI)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Timeline segments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-royal-sub text-xs font-bold uppercase tracking-wider text-[#6e5246]">
                    यात्रा खंड विवरण • Itinerary Legs
                  </h3>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    {route.segments.length} {route.segments.length === 1 ? "Leg (Direct)" : "Legs (Multi-segment)"}
                  </span>
                </div>

                {route.segments.map((seg, idx) => (
                  <div key={seg.id} className="relative rounded-2xl border border-[#dfc89d] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ebd8b0]">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                          {seg.type === "flight" ? (
                            <VimanaIcon className="h-5 w-5 text-[#8e1b1b]" />
                          ) : (
                            <RajGadiIcon className="h-5 w-5 text-amber-700" />
                          )}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-[#2a1610]">{seg.operator}</span>
                          <span className="ml-2 rounded bg-amber-100/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                            {seg.id}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-royal-title text-base font-bold text-[#8e1b1b]">
                          {formatInr(seg.price)}
                        </span>
                        <div className="text-[10px] text-[#74584c]">
                          मूल किराया: {formatInr(seg.baseFare)} + कर: {formatInr(seg.taxes + seg.fees)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#74584c]">प्रस्थान (Departure)</div>
                        <div className="font-royal-title text-lg font-bold text-[#2a1610]">{formatClock(seg.departure)}</div>
                        <div className="text-xs font-semibold text-[#6e5246]">{seg.from.name}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#74584c]">आगमन (Arrival)</div>
                        <div className="font-royal-title text-lg font-bold text-[#2a1610]">{formatClock(seg.arrival)}</div>
                        <div className="text-xs font-semibold text-[#6e5246]">{seg.to.name}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#ebd8b0]/60 pt-2 text-xs font-medium text-[#74584c]">
                      <span>यात्रा अवधि: {formatDuration(seg.durationMinutes)}</span>
                      <span>समय पालन विश्वसनीयता: {Math.round(seg.reliability * 100)}%</span>
                    </div>

                    {/* Layover connecting info */}
                    {idx < route.segments.length - 1 && (
                      <div className="mt-4 -mb-1 rounded-xl border border-amber-400 bg-amber-50/80 p-3 text-xs">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span>🔄 मध्य विश्राम पड़ाव: {seg.to.cityName}</span>
                          <span>{route.waitingMinutes} मिनट विश्राम समय</span>
                        </div>
                        <div className="mt-1 text-[#74584c]">
                          उपलब्ध अंतरण समय (Available Buffer): {route.transferMinutes} मिनट (न्यूनतम आवश्यक: {route.transferMinutes - route.waitingMinutes} मिनट)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Deadline buffer summary */}
              <div className="rounded-2xl border border-[#dfc89d] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RoyalSealIcon className="h-5 w-5 text-amber-700" />
                    <span className="font-royal-sub text-xs font-bold uppercase tracking-wider text-[#6e5246]">
                      आगमन सीमा मूल्यांकन • Deadline Assessment
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    लक्ष्य समय: {formatClock(searchInput.arriveBy)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#ebd8b0] pt-2">
                  <div className="flex items-center gap-2">
                    {route.missesDeadline ? (
                      <AlertTriangleIcon className="h-5 w-5 text-red-600" />
                    ) : (
                      <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                    )}
                    <span className="text-sm font-semibold text-[#2a1610]">
                      {route.missesDeadline ? "विलंब जोखिम चेतावनी (Breached)" : "सुरक्षित आगमन अंतर (Safe Cushion)"}
                    </span>
                  </div>
                  <span className={`text-base font-bold ${route.missesDeadline ? "text-red-700" : "text-emerald-700"}`}>
                    {formatBuffer(route.deadlineBufferMinutes)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-royal-title text-base font-bold text-[#2a1610]">
                  प्रथम चरण पर विलंब काल गणना (Simulate First Leg Delay)
                </h3>
                <p className="mt-1 text-xs text-[#6e5246]">
                  यदि मौसम या परिचालन कारणों से आपका पहला विमान या ट्रेन विलंबित होती है, तो क्या आपकी यात्रा समय पर पूरी होगी?
                </p>

                {/* Delay minute buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {DELAY_OPTIONS_MINUTES.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => handleSimulate(mins)}
                      className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                        delayMinutes === mins
                          ? "border-[#8e1b1b] bg-[#8e1b1b] text-white shadow-md"
                          : "border-[#dfc89d] bg-white text-[#6e5246] hover:border-amber-600 hover:text-[#8e1b1b]"
                      }`}
                    >
                      {mins === 0 ? "समय पर (0m Delay)" : `+${mins} मिनट विलंब (+${mins}m)`}
                    </button>
                  ))}
                </div>
              </div>

              {isSimulating && (
                <div className="py-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                  <p className="mt-2 text-xs font-semibold text-amber-900">
                    सारथी गणना कर रहा है... Calculating cascading connection delays
                  </p>
                </div>
              )}

              {simError && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-medium text-red-800">
                  {simError}
                </div>
              )}

              {simResult && !isSimulating && (
                <div className="space-y-4 rounded-2xl border-2 border-[#dfc89d] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#ebd8b0] pb-3">
                    <span className="text-xs font-bold text-[#6e5246]">
                      +{simResult.delayMinutes} मिनट विलंब का परिणाम:
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        simResult.status === "ok"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : simResult.status === "tight"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {simResult.status === "ok"
                        ? "सुरक्षित (Safe Connection)"
                        : simResult.status === "tight"
                        ? "अति संवेदनशील (Tight Margin)"
                        : "कनेक्शन छूटा (Connection Missed)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl bg-[#fdfaf3] p-3 border border-[#ebd8b0]">
                      <div className="text-xs text-[#74584c]">अनुमानित अंतिम आगमन</div>
                      <div className="font-royal-title text-lg font-bold text-[#2a1610]">{formatClock(simResult.arrivalTime)}</div>
                    </div>
                    <div className="rounded-xl bg-[#fdfaf3] p-3 border border-[#ebd8b0]">
                      <div className="text-xs text-[#74584c]">समय सीमा कुशन (Buffer)</div>
                      <div className={`font-royal-title text-lg font-bold ${simResult.deadlineBufferMinutes >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {formatBuffer(simResult.deadlineBufferMinutes)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#fdfaf3] p-3 border border-[#ebd8b0]">
                      <div className="text-xs text-[#74584c]">मध्य पड़ाव अंतरण स्थिति</div>
                      <div className={`text-sm font-bold ${simResult.connectionViable ? "text-emerald-700" : "text-red-700"}`}>
                        {simResult.connectionViable ? "✓ सफल (Connection Intact)" : "❌ विफल (Missed Connection)"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#fdfaf3] p-3 border border-[#ebd8b0]">
                      <div className="text-xs text-[#74584c]">अद्यतन आगमन विश्वास</div>
                      <div className="font-royal-title text-lg font-bold text-[#8e1b1b]">
                        {simResult.estimatedArrivalConfidence}%
                      </div>
                    </div>
                  </div>

                  {/* Alternative Backup Route Recommendation */}
                  {simResult.alternative && (
                    <div className="mt-4 rounded-xl border border-amber-500/60 bg-amber-50/70 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#8e1b1b] uppercase tracking-wider">
                        <DiyaIcon className="h-4 w-4 text-amber-600" />
                        <span>वैकल्पिक सुरक्षा मार्ग • Backup Route Available</span>
                      </div>
                      <p className="mt-1 text-xs text-[#6e5246]">
                        यदि आपकी पहली उड़ान या ट्रेन विलंबित होती है, तो यह विकल्प आपको समय सीमा से पूर्व पहुँचा सकता है:
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="font-royal-title text-sm font-bold text-[#2a1610]">
                            {formatClock(simResult.alternative.departureTime)} → {formatClock(simResult.alternative.arrivalTime)}
                          </div>
                          <div className="text-xs text-[#74584c]">
                            {formatInr(simResult.alternative.totalPrice)} • {formatDuration(simResult.alternative.totalDurationMinutes)}
                          </div>
                        </div>
                        {onSelectAlternative && (
                          <button
                            type="button"
                            onClick={() => onSelectAlternative(simResult.alternative!)}
                            className="rounded-lg bg-[#8e1b1b] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#711313]"
                          >
                            यह मार्ग चुनें (Switch)
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
              <div className="flex items-center justify-between border-b border-[#ebd8b0] pb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-amber-600" />
                  <div>
                    <h3 className="font-royal-title text-base font-bold text-[#2a1610]">सारथी परामर्श एवं विश्लेषण</h3>
                    <p className="text-xs text-[#74584c]">Multi-modal stability, buffer analysis & risk evaluation.</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[11px] font-bold text-amber-900">
                  स्रोत: {aiSource}
                </span>
              </div>

              {isLoadingAi ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                  <p className="mt-2 text-xs font-semibold text-amber-900">सारथी यात्रा का विश्लेषण कर रहा है...</p>
                </div>
              ) : aiError ? (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-medium text-red-800">
                  {aiError}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-[#dfc89d] bg-white p-5 text-sm leading-relaxed text-[#2a1610] shadow-sm">
                  <p className="whitespace-pre-line font-serif-royal">{aiExplanation || route.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#dfc89d] px-6 py-4 bg-[#fbf6ea]">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
            <LotusIcon className="h-4 w-4 text-amber-600" />
            <span>BHRAMAN-SARTHI • शुभस्ते पन्थानः सन्तु</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#8e1b1b] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#711313]"
          >
            संपन्न (Done)
          </button>
        </div>
      </div>
    </div>
  );
}
