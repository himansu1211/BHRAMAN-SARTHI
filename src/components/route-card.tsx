"use client";

import React, { useState, useSyncExternalStore } from "react";
import { TravelRoute } from "@/lib/types";
import {
  Plane,
  Train,
  Bus,
  ArrowRight,
  ShieldCheck,
  Info,
  RefreshCw,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { isTripSaved, saveTrip, removeSavedTrip } from "@/lib/storage";

interface RouteCardProps {
  route: TravelRoute;
  onViewRoute: (route: TravelRoute) => void;
  onSimulateDelay: (route: TravelRoute) => void;
}

function subscribeToSavedTrips(onChange: () => void) {
  window.addEventListener("bhraman-storage-updated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("bhraman-storage-updated", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function RouteCard({ route, onViewRoute, onSimulateDelay }: RouteCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isSaved = useSyncExternalStore(subscribeToSavedTrips, () => isTripSaved(route.id), () => false);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeSavedTrip(route.id);
    } else {
      saveTrip(route, {
        origin: route.segments[0]?.fromCode || "ORIGIN",
        destination: route.segments[route.segments.length - 1]?.toCode || "DEST",
        date: route.departureTime.split("T")[0],
        arriveBy: route.arrivalTime,
        optimization: "best_balance",
      });
    }
  };

  const depDate = new Date(route.departureTime);
  const arrDate = new Date(route.arrivalTime);

  const depFormattedDate = depDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const depFormattedTime = depDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const arrFormattedDate = arrDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const arrFormattedTime = arrDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const hours = Math.floor(route.totalDurationMinutes / 60);
  const mins = route.totalDurationMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const bufHours = route.deadlineBufferMinutes == null ? 0 : Math.floor(Math.abs(route.deadlineBufferMinutes) / 60);
  const bufMins = route.deadlineBufferMinutes == null ? 0 : Math.abs(route.deadlineBufferMinutes) % 60;
  const bufferFormatted = route.deadlineBufferMinutes == null ? "" :
    bufHours > 0 ? (bufMins > 0 ? `${bufHours}h ${bufMins}m` : `${bufHours}h`) : `${bufMins}m`;

  const isMissed = route.deadlineBufferMinutes != null && route.deadlineBufferMinutes < 0;

  // Primary segment availability and price trend
  const primarySeg = route.segments[0];
  const endpointAccessCount = route.endpointTransfers?.length ?? 0;
  const connectionCount = Math.max(0, route.transfers - endpointAccessCount);
  const journeyTypeLabel = route.segments.length === 1
    ? `Direct ${primarySeg.type}${endpointAccessCount ? " · local access included" : ""}`
    : `${connectionCount} connection${connectionCount === 1 ? "" : "s"}${endpointAccessCount ? ` · ${endpointAccessCount} local access leg${endpointAccessCount === 1 ? "" : "s"}` : ""}`;

  const confidenceColor =
    route.estimatedArrivalConfidence >= 90
      ? "text-peacock bg-emerald-100/70 border border-emerald-300"
      : route.estimatedArrivalConfidence >= 75
      ? "text-indigo bg-indigo-100/70 border border-indigo-300"
      : "text-vermilion bg-amber-100/70 border border-amber-300";

  return (
    <div
      className={`route-card group relative overflow-hidden rounded-3xl border-2 transition shadow-yatra-sm hover:shadow-yatra-md ${
        isMissed
          ? "border-crimson-alert/40 bg-red-50/40"
          : "border-amber-300 bg-paper-light"
      }`}
    >
      {/* Top Banner with Badges & Live Aggregator Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-300/80 bg-paper-deep px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {route.categoryBadge && (
            <span className="rounded-full bg-vermilion px-2.5 py-0.5 font-display text-[10px] font-bold tracking-wider text-paper-light uppercase shadow-yatra-sm">
              {route.categoryBadge}
            </span>
          )}

          {/* Mode Operators & Service Numbers */}
          <div className="flex items-center gap-2 text-xs font-bold text-ink flex-wrap">
            {route.segments.map((seg, idx) => (
              <span key={seg.id} className="flex items-center gap-1 bg-paper-light border border-amber-300 rounded-lg px-2 py-0.5">
                {idx > 0 && <span className="text-ink-muted mr-1">+</span>}
                {seg.type === "flight" && <Plane className="h-3.5 w-3.5 text-indigo" />}
                {seg.type === "train" && <Train className="h-3.5 w-3.5 text-vermilion" />}
                {seg.type === "bus" && <Bus className="h-3.5 w-3.5 text-peacock" />}
                <span>
                  {seg.operator} {seg.segmentNumber && !seg.operator.includes(seg.segmentNumber) && <span className="font-mono text-ink-muted">({seg.segmentNumber})</span>}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Data Provenance & Aggregator Status Badges */}
        <div className="flex items-center gap-2">
          {(() => {
            const hasDatasetSnapshot = route.segments.some((s) => s.dataSource === "dataset-snapshot");
            const isAllLive = route.segments.every((s) => s.dataSource === "live-api");
            if (isAllLive) {
              return (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-peacock">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-peacock"></span>
                  </span>
                  Live API ({primarySeg.providerSource})
                </span>
              );
            }
            if (hasDatasetSnapshot) {
              return (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-ink">
                  Historical schedule snapshot; current service unverified
                </span>
              );
            }
            return (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-paper-deep px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                Curated route data; verify with provider
              </span>
            );
          })()}
          <span className="text-xs font-bold text-ink-muted">
            Score: <strong className="text-ink font-mono">{route.overallScore}</strong>/100
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.8fr_1fr_auto] md:items-center">
          {/* Timing, Dates & Segments */}
          <div className="space-y-3">
              <div className="route-timeline flex items-center gap-4">
              <div className="text-center sm:text-left">
                <div className="text-xs font-bold text-vermilion uppercase tracking-wide">
                  {depFormattedDate}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-ink">
                  {depFormattedTime}
                </div>
                <div className="text-xs font-bold text-ink uppercase">
                  {route.segments[0].fromCode} ({route.segments[0].fromName})
                </div>
              </div>

              <div className="flex flex-1 flex-col items-center px-2">
                <div className="font-mono text-[11px] font-bold text-ink flex items-center gap-1">
                  <span>{durationStr}</span>
                  {route.totalDistanceKm && (
                    <span className="text-ink-muted font-normal text-[10px]">• {route.totalDistanceKm} km</span>
                  )}
                </div>
                <div className="relative my-1 flex w-full max-w-[150px] items-center">
                  <div className="h-0.5 w-full bg-amber-400" />
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-paper-deep p-1 text-ink border border-amber-300 shadow-yatra-sm">
                    <div className="flex gap-0.5 text-[10px]">
                      {route.segments.map((s, idx) => (
                        <span key={idx}>
                          {s.type === "flight" ? "✈️" : s.type === "train" ? "🚆" : "🚌"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-ink-muted">
                  {journeyTypeLabel}
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-xs font-bold text-vermilion uppercase tracking-wide">
                  {arrFormattedDate}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-ink">
                  {arrFormattedTime}
                </div>
                <div className="text-xs font-bold text-ink uppercase">
                  {route.segments[route.segments.length - 1].toCode} ({route.segments[route.segments.length - 1].toName})
                </div>
              </div>
            </div>

            {/* Keep the main route scanable; expand for leg, transfer, and fare details. */}
            <details className="route-leg-details">
              <summary>Leg-by-leg details · {route.segments.length} {route.segments.length === 1 ? "service" : "services"}</summary>
              <div className="route-leg-content rounded-2xl border border-amber-300/80 bg-paper-deep/60 p-3 text-xs space-y-1.5">
              {route.segments.map((seg, idx) => (
                <div key={seg.id} className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    {seg.type === "flight" && <Plane className="h-3.5 w-3.5 text-indigo shrink-0" />}
                    {seg.type === "train" && <Train className="h-3.5 w-3.5 text-vermilion shrink-0" />}
                    {seg.type === "bus" && <Bus className="h-3.5 w-3.5 text-peacock shrink-0" />}
                    <span>
                      Leg {idx + 1}: <strong className="text-ink">{seg.operator}</strong> {seg.segmentNumber && !seg.operator.includes(seg.segmentNumber) && <span className="font-mono text-ink-muted">({seg.segmentNumber})</span>}
                    </span>
                    {seg.flightDetails?.verification && (
                      <span className="text-[10px] font-bold text-peacock bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {seg.flightDetails.verification.confidence} Verified
                      </span>
                    )}
                    {seg.flightDetails?.aircraft && (
                      <span className="text-[10px] font-medium text-indigo bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                        {seg.flightDetails.aircraft}
                      </span>
                    )}
                    {seg.distanceKm && (
                      <span className="text-[10px] font-mono text-peacock font-semibold bg-emerald-50 border border-emerald-200 px-1 rounded">
                        {seg.distanceKm} km
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-ink flex items-center gap-2">
                    <span className="font-mono text-ink font-bold bg-amber-100/60 border border-amber-300 px-1.5 py-0.5 rounded">
                      {new Date(seg.departureTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
                      {" ➔ "}
                      {new Date(seg.arrivalTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
                    </span>
                    <span className="text-ink-muted">
                      {seg.fromCode} ➔ {seg.toCode}
                    </span>
                    {seg.bookingUrl && (
                      <a
                        href={seg.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Book ${seg.operator} ticket directly on ${seg.providerSource}`}
                        title={`Book directly on ${seg.providerSource}`}
                        className="inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 text-[10px] font-bold text-peacock hover:bg-emerald-100 transition shadow-xs"
                      >
                        <span>Book</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Station <-> Airport <-> Bus Terminal Transfers */}
              {route.interchanges && route.interchanges.length > 0 && (
                <div className="pt-2 mt-1 border-t border-amber-300/60 space-y-1 text-[11px]">
                  {route.interchanges.map((ic, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between gap-1 text-ink-muted">
                      <span className="font-medium">
                        🔄 <strong>Transit:</strong> {ic.description}
                      </span>
                      <span className="font-mono font-bold text-ink">
                        {ic.distanceKm ? `${ic.distanceKm} km • ` : ""}{ic.durationMinutes}m • ₹{ic.estCost}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {route.endpointTransfers?.map((transfer, index) => (
                <div key={`${transfer.placement}-${index}`} className="mt-1 flex flex-wrap items-center justify-between gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2 py-1 text-[10px] text-indigo">
                  <span className="font-semibold">🚕 {transfer.placement === "origin" ? "To departure airport" : "From arrival airport"}: {transfer.description}</span>
                  <span className="font-mono font-bold">{transfer.durationMinutes}m • est. ₹{transfer.estCost}</span>
                </div>
              ))}
              </div>
            </details>

          </div>

          {/* Buffer & Estimated Confidence */}
          <div className="flex flex-col gap-2 border-t border-amber-300/80 pt-3 md:border-t-0 md:border-l md:border-amber-300/80 md:pl-5 md:pt-0">
            {/* Deadline Buffer */}
            <div className="flex items-center gap-1.5 text-xs">
              {route.deadlineBufferMinutes != null && (
                <>
              <span
                className={`font-mono font-bold ${
                  isMissed
                    ? "text-crimson-alert"
                    : route.deadlineBufferMinutes < 60
                    ? "text-amber-700"
                    : "text-vermilion"
                }`}
              >
                {bufferFormatted}
              </span>
              <span className="text-ink-muted font-semibold">
                {isMissed ? "past deadline" : "before deadline"}
              </span>
                </>
              )}
            </div>

            {/* Estimated Confidence */}
            <div className="relative flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${confidenceColor}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {route.estimatedArrivalConfidence}% estimated confidence
              </span>
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-ink-muted hover:text-ink cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Arrival confidence score explanation"
              >
                <Info className="h-4 w-4" />
              </button>

              {showTooltip && (
                <div className="absolute bottom-full left-0 z-30 mb-2 w-64 rounded-2xl border-2 border-amber-400 bg-paper-deep p-3 text-[11px] leading-relaxed text-ink shadow-yatra-lg">
                  Heuristic reliability estimate based on transport timings, transfer buffer minutes, and punctuality rules.
                </div>
              )}
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-amber-300/80 pt-3 md:border-t-0 md:flex-col md:items-end md:justify-center md:pt-0">
            <div className="text-left md:text-right">
              <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                ₹{route.totalPrice.toLocaleString("en-IN")}
              </div>
              <div className="fare-source text-[10px] font-bold text-peacock flex items-center gap-1 justify-end">
                {primarySeg.dataSource === "live-api" ? (
                  <><RefreshCw className="h-3 w-3" /> Live fare via {primarySeg.providerSource}</>
                ) : (
                  <>Schedule-based estimate · verify before booking</>
                )}
              </div>
              <div className="text-[9px] font-medium text-ink-muted text-left md:text-right mt-0.5">
                {primarySeg.dataSource === "live-api" ? "Fare may change with availability" : "Current fare and seats not checked"}
              </div>
            </div>

            <div className="route-actions flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                aria-label={isSaved ? "Remove from saved itineraries" : "Save itinerary permanently on this device"}
                title={isSaved ? "Saved on your device" : "Save itinerary permanently on this device"}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition cursor-pointer shrink-0 ${
                  isSaved
                    ? "border-turmeric bg-amber-100 text-turmeric-dark shadow-xs"
                    : "border-amber-300 bg-paper-deep text-ink-muted hover:border-turmeric hover:text-turmeric hover:bg-amber-50"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-turmeric text-turmeric" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => onSimulateDelay(route)}
                aria-label={`Simulate disruption on route ${route.id}`}
                className="rounded-xl border border-amber-300 bg-paper-deep px-3 py-2 font-display text-xs font-bold text-ink transition hover:bg-amber-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-vermilion min-h-[44px]"
              >
                Simulate Disruption
              </button>

              {primarySeg.bookingUrl && (
                <a
                  href={primarySeg.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Book ticket directly on ${primarySeg.providerSource}`}
                  title={`Book ticket directly on ${primarySeg.providerSource}`}
                  className="flex items-center gap-1.5 rounded-xl bg-peacock px-3.5 py-2 font-display text-xs font-bold text-paper-light shadow-yatra-sm transition hover:bg-emerald-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-peacock min-h-[44px]"
                >
                  <span>Book Ticket</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => onViewRoute(route)}
                aria-label={`View detailed breakdown for route ${route.id}`}
                className="flex items-center gap-1.5 rounded-xl bg-vermilion px-4 py-2 font-display text-xs font-bold text-paper-light shadow-yatra-sm transition hover:bg-amber-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-vermilion min-h-[44px]"
              >
                <span>View Route</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
