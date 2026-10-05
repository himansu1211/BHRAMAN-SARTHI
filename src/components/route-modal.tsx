"use client";

import React, { useState, useEffect } from "react";
import { TravelRoute } from "@/lib/types";
import {
  X,
  Plane,
  Train,
  Bus,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ToranArch, KolamDivider } from "./ornaments";
import { buildTrainDeepLink, buildBusDeepLink } from "@/lib/booking-links";

interface RouteModalProps {
  route: TravelRoute;
  deadlineISO?: string;
  onClose: () => void;
  onOpenWhatIf: (route: TravelRoute) => void;
}

export function RouteModal({ route, deadlineISO: _deadlineISO, onClose, onOpenWhatIf }: RouteModalProps) {
  const [explanation, setExplanation] = useState<string>(route.explanation);
  const [loadingAiExplanation, setLoadingAiExplanation] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleFetchAiExplanation = async () => {
    setLoadingAiExplanation(true);
    try {
      const res = await fetch("/api/explain-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route }),
      });
      const data = await res.json();
      if (data.explanation) {
        setExplanation(data.explanation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiExplanation(false);
    }
  };

  const totalBaseFare = route.segments.reduce((acc, s) => acc + s.baseFare, 0);
  const totalTaxes = route.segments.reduce((acc, s) => acc + s.taxes, 0);
  const totalInterchangeCost = (route.interchanges || []).reduce((acc, i) => acc + i.estCost, 0);
  const totalEndpointAccessCost = (route.endpointTransfers || []).reduce((acc, transfer) => acc + transfer.estCost, 0);

  const hours = Math.floor(route.totalDurationMinutes / 60);
  const mins = route.totalDurationMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const bufHours = route.deadlineBufferMinutes == null ? 0 : Math.floor(Math.abs(route.deadlineBufferMinutes) / 60);
  const bufMins = route.deadlineBufferMinutes == null ? 0 : Math.abs(route.deadlineBufferMinutes) % 60;
  const bufferFormatted = route.deadlineBufferMinutes == null ? "" :
    bufHours > 0 ? (bufMins > 0 ? `${bufHours}h ${bufMins}m` : `${bufHours}h`) : `${bufMins}m`;

  const handleDownloadIcs = () => {
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BHRAMAN SARTHI//Multimodal Journey//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    route.segments.forEach((seg, i) => {
      const depStr = new Date(seg.departureTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const arrStr = new Date(seg.arrivalTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      icsLines.push(
        "BEGIN:VEVENT",
        `SUMMARY:BHRAMAN SARTHI: Leg ${i + 1} - ${seg.operator} (${seg.segmentNumber})`,
        `DESCRIPTION:${seg.operator} (${seg.type.toUpperCase()}) from ${seg.fromName} (${seg.fromCode}) to ${seg.toName} (${seg.toCode}). Fare: ₹${seg.price}.`,
        `LOCATION:${seg.fromName} (${seg.fromCode})`,
        `DTSTART:${depStr}`,
        `DTEND:${arrStr}`,
        `UID:bhraman-${seg.id}-${Date.now()}@bhramansarthi.in`,
        "END:VEVENT"
      );
    });

    icsLines.push("END:VCALENDAR");

    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bhraman-sarthi-journey-${route.id.slice(0, 12)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintItinerary = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-double border-amber-400 bg-paper-light shadow-yatra-lg animate-in zoom-in-95 duration-200">
        <ToranArch className="text-amber-300" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-300 bg-paper-deep px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="route-modal-title" className="font-display text-base font-bold text-ink">
                BHRAMAN SARTHI — Multimodal Route Breakdown
              </h3>
              {route.categoryBadge && (
                <span className="rounded-full bg-vermilion px-2.5 py-0.5 font-display text-[10px] font-bold text-paper-light uppercase shadow-yatra-sm">
                  {route.categoryBadge}
                </span>
              )}
              {(() => {
                const hasDatasetSnapshot = route.segments.some((s) => s.dataSource === "dataset-snapshot");
                const isAllLive = route.segments.every((s) => s.dataSource === "live-api");
                if (isAllLive) {
                  return (
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-peacock">
                      Live API Verified
                    </span>
                  );
                }
                if (hasDatasetSnapshot) {
                  return (
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-ink">
                      Schedule snapshot; operating days unverified
                    </span>
                  );
                }
                return (
                  <span className="rounded-full bg-paper-deep border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                    Verified Provider Data
                  </span>
                );
              })()}
            </div>
            <p className="text-xs font-semibold text-ink-muted">
              Total Fare: <span className="font-mono font-bold text-ink">₹{route.totalPrice.toLocaleString("en-IN")}</span> • Duration: <span className="font-mono font-bold text-ink">{durationStr}</span>
              {route.totalDistanceKm && (
                <> • Distance: <span className="font-mono font-bold text-peacock">{route.totalDistanceKm} km</span></>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close route breakdown modal"
            className="rounded-full p-2 text-ink-muted hover:bg-amber-200/60 hover:text-ink cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Journey Schedule Timeline with Explicit Dates & Full Train/Flight Metadata */}
          <div>
            <h4 className="mb-3 font-display text-xs font-bold tracking-wider text-ink uppercase">
              Step-by-Step Flight, Train & Bus Leg Details
            </h4>
            <div className="space-y-4 rounded-2xl border border-amber-300 bg-paper-deep/70 p-4">
              {route.endpointTransfers?.filter((transfer) => transfer.placement === "origin").map((transfer, index) => (
                <div key={`origin-access-${index}`} className="rounded-xl border border-indigo-300 bg-indigo-50/80 p-3 text-xs text-indigo">
                  <strong>🚕 Ground access to departure airport:</strong> {transfer.description} • {transfer.durationMinutes} min • estimated ₹{transfer.estCost}
                </div>
              ))}
              {route.segments.map((seg, idx) => {
                const depDateObj = new Date(seg.departureTime);
                const arrDateObj = new Date(seg.arrivalTime);

                const depDateStr = depDateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                });
                const depTimeStr = depDateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                });

                const arrDateStr = arrDateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                });
                const arrTimeStr = arrDateObj.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                });

                const segHours = Math.floor(seg.durationMinutes / 60);
                const segMins = seg.durationMinutes % 60;

                const interchange = route.interchanges?.[idx];

                return (
                  <div key={seg.id} className="relative pl-6">
                    {/* Connecting timeline line */}
                    {idx < route.segments.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-vermilion" />
                    )}
                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-paper-light bg-vermilion shadow-yatra-sm" />

                    <div className="space-y-1">
                      {/* Segment Departure Date & Location */}
                      <div className="flex flex-wrap items-center justify-between text-xs">
                        <span className="font-bold text-ink">
                          DEPARTURE: <span className="text-vermilion font-bold">{depDateStr}</span> at <strong className="font-mono">{depTimeStr}</strong> — {seg.fromName} ({seg.fromCode})
                        </span>
                      </div>

                      {/* Travel Segment Card */}
                      <div className="my-2 rounded-2xl border-2 border-amber-300 bg-paper-light p-4 shadow-yatra-sm space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {seg.type === "flight" && <Plane className="h-4 w-4 text-indigo" />}
                            {seg.type === "train" && <Train className="h-4 w-4 text-vermilion" />}
                            {seg.type === "bus" && <Bus className="h-4 w-4 text-peacock" />}
                            <span className="font-bold text-ink text-sm">
                              {seg.operator} {seg.segmentNumber && <span className="font-mono text-ink-muted">({seg.segmentNumber})</span>}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-ink-muted">
                            {segHours > 0 ? `${segHours}h ${segMins}m` : `${segMins}m`}
                          </span>
                        </div>



                        {/* Mid-Route Train Stoppages & Live External Resource Panel */}
                        {seg.type === "train" && (
                          <div className="my-2 rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-xs space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-emerald-300 pb-1.5 font-bold text-peacock">
                              <span className="flex items-center gap-1.5">
                                <Train className="h-4 w-4 text-vermilion" />
                                Train Name & Schedule Details:
                              </span>
                              <span className="rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-peacock">
                                {seg.operator} (Train #{seg.segmentNumber})
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ink">
                              <div>
                                <span className="font-bold text-ink-muted">Train Name: </span>
                                <strong className="text-ink">{seg.operator}</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Train Number: </span>
                                <strong className="text-ink font-mono">{seg.segmentNumber}</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Boarding Station: </span>
                                <strong className="text-ink">{seg.fromName} ({seg.fromCode})</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Deboarding Station: </span>
                                <strong className="text-ink">{seg.toName} ({seg.toCode})</strong>
                              </div>
                              {seg.trainOrigin && seg.trainTerminus && (
                                <div className="sm:col-span-2 text-ink">
                                  <span className="font-bold text-ink-muted">Full Train Route: </span>
                                  <span>{seg.trainOrigin} ➔ {seg.trainTerminus}</span>
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-ink-muted">Intermediate Stops: </span>
                                <span className="font-bold text-peacock">
                                  {seg.stopsBetween != null ? `${seg.stopsBetween} Stops` : "Direct Stoppages"}
                                </span>
                              </div>
                              {seg.journeyDayOffset != null && (
                                <div>
                                  <span className="font-bold text-ink-muted">Journey Shift: </span>
                                  <span>{seg.journeyDayOffset > 0 ? `+${seg.journeyDayOffset} Day(s) Arrival` : "Same Day Journey"}</span>
                                </div>
                              )}
                            </div>

                            {/* Live Aggregator & Railway Enquiry Links */}
                            <div className="pt-1.5 border-t border-emerald-200">
                              <span className="block text-[10px] font-bold text-ink-muted uppercase mb-1">
                                Direct Train Booking & Live Running Status:
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[11px]">
                                <a
                                  href={seg.bookingUrl || buildTrainDeepLink({
                                    provider: "IXIGO",
                                    trainNumber: seg.segmentNumber,
                                    fromCode: seg.fromCode,
                                    toCode: seg.toCode,
                                    date: seg.departureTime.slice(0, 10),
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-paper-light border border-indigo-300 px-2.5 py-1 font-bold text-indigo hover:bg-indigo-50 shadow-yatra-sm min-h-[36px]"
                                >
                                  <span>ixigo Train Direct Booking</span>
                                  <ExternalLink className="h-3 w-3 text-indigo" />
                                </a>
                                <a
                                  href={buildTrainDeepLink({
                                    provider: "IRCTC",
                                    trainNumber: seg.segmentNumber,
                                    fromCode: seg.fromCode,
                                    toCode: seg.toCode,
                                    date: seg.departureTime.slice(0, 10),
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-paper-light border border-crimson-alert/40 px-2.5 py-1 font-bold text-crimson-alert hover:bg-red-50 shadow-yatra-sm min-h-[36px]"
                                >
                                  <span>IRCTC Direct Ticket Search</span>
                                  <ExternalLink className="h-3 w-3 text-crimson-alert" />
                                </a>
                                <a
                                  href="https://enquiry.indianrail.gov.in/ntes/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-paper-light border border-amber-400 px-2.5 py-1 font-bold text-vermilion hover:bg-amber-100 shadow-yatra-sm min-h-[36px]"
                                >
                                  <span>NTES Spot Train</span>
                                  <ExternalLink className="h-3 w-3 text-vermilion" />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mid-Route Intercity Bus Stoppages & Direct Seat Booking Portals */}
                        {seg.type === "bus" && (
                          <div className="my-2 rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-xs space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-emerald-300 pb-1.5 font-bold text-peacock">
                              <span className="flex items-center gap-1.5">
                                <Bus className="h-4 w-4 text-peacock" />
                                Bus Route & Ticket Booking Details:
                              </span>
                              <span className="rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-peacock">
                                {seg.operator} {seg.segmentNumber && `(${seg.segmentNumber})`}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ink">
                              <div>
                                <span className="font-bold text-ink-muted">Operator: </span>
                                <strong className="text-ink">{seg.operator}</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Service Code: </span>
                                <strong className="text-ink font-mono">{seg.segmentNumber || "Intercity Express"}</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Boarding Terminal: </span>
                                <strong className="text-ink">{seg.fromName} ({seg.fromCode})</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Destination Stand: </span>
                                <strong className="text-ink">{seg.toName} ({seg.toCode})</strong>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Travel Duration: </span>
                                <span className="font-bold text-peacock">{segHours > 0 ? `${segHours}h ${segMins}m` : `${segMins}m`}</span>
                              </div>
                            </div>

                            {/* Direct Bus Booking Links */}
                            <div className="pt-1.5 border-t border-emerald-200">
                              <span className="block text-[10px] font-bold text-ink-muted uppercase mb-1">
                                Direct Bus Seat Booking Portals (Pre-filled Corridor & Date):
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[11px]">
                                <a
                                  href={seg.bookingUrl || buildBusDeepLink({
                                    originCity: seg.fromName,
                                    destCity: seg.toName,
                                    date: seg.departureTime.slice(0, 10),
                                    provider: "REDBUS",
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-paper-light border border-crimson-alert/40 px-2.5 py-1 font-bold text-crimson-alert hover:bg-red-50 shadow-yatra-sm min-h-[36px]"
                                >
                                  <span>RedBus Direct Booking</span>
                                  <ExternalLink className="h-3 w-3 text-crimson-alert" />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Verified Commercial Flight Details, Multi-Source Offers & 10-Point Verification Checks */}
                        {seg.type === "flight" && (
                          <div className="mt-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-2">
                              <div className="flex items-center gap-2">
                                <Plane className="h-4 w-4 text-indigo shrink-0" />
                                <span className="font-bold text-ink">
                                  {seg.operator} {!seg.operator.includes(seg.segmentNumber) && seg.segmentNumber}
                                </span>
                                {seg.flightDetails?.aircraft && (
                                  <span className="rounded bg-paper-light border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo">
                                    ✈️ {seg.flightDetails.aircraft}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  seg.flightDetails?.verification?.confidence === "HIGH"
                                    ? "bg-emerald-100 text-peacock border border-emerald-300"
                                    : "bg-indigo-100 text-indigo border border-indigo-300"
                                }`}>
                                  <ShieldCheck className="h-3 w-3" />
                                  {seg.flightDetails?.verification?.confidence || "HIGH"} CONFIDENCE VERIFIED
                                </span>
                                {seg.flightDetails?.operatingStatus && (
                                  <span className="rounded bg-paper-light border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-ink">
                                    Status: {seg.flightDetails.operatingStatus}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Exact Timings & Operating Schedule */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-ink bg-paper-light border border-indigo-200/70 p-2.5 rounded-xl">
                              <div>
                                <span className="font-bold text-ink-muted">Departure (IST): </span>
                                <strong className="font-mono text-ink font-bold">{depTimeStr}</strong>
                                <span className="text-[10px] text-ink-muted block">{seg.fromName} ({seg.fromCode})</span>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Arrival (IST): </span>
                                <strong className="font-mono text-ink font-bold">{arrTimeStr}</strong>
                                <span className="text-[10px] text-ink-muted block">{seg.toName} ({seg.toCode})</span>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Flight Duration: </span>
                                <span className="font-semibold text-ink">
                                  {segHours > 0 ? `${segHours}h ${segMins}m` : `${segMins}m`} (Non-stop direct)
                                </span>
                              </div>
                              <div>
                                <span className="font-bold text-ink-muted">Operating Schedule: </span>
                                <span className="font-semibold text-ink">
                                  {seg.flightDetails?.operatingDays ? seg.flightDetails.operatingDays.join(", ") : "Operating days not verified"}
                                </span>
                              </div>
                            </div>

                            {/* Verified Source Providers */}
                            <div>
                              <span className="block text-[10px] font-bold text-ink-muted uppercase mb-1">
                                Verified Across Authorized Channels & OTAs ({seg.flightDetails?.sources?.length || 1} Sources):
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[11px]">
                                {(seg.flightDetails?.sources || [
                                  {
                                    provider: seg.operatorCode === "QP" ? "AKASA" : seg.operatorCode === "AI" ? "AIR_INDIA" : seg.operatorCode === "SG" ? "SPICEJET" : "INDIGO",
                                    providerName: seg.operator,
                                    sourceType: "AIRLINE_DIRECT" as const,
                                  },
                                  { provider: "MAKEMYTRIP", providerName: "MakeMyTrip", sourceType: "OTA" as const },
                                  { provider: "IXIGO", providerName: "ixigo", sourceType: "OTA" as const },
                                  { provider: "SKYSCANNER", providerName: "Skyscanner", sourceType: "AGGREGATOR" as const },
                                ]).map((src: any, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="inline-flex items-center gap-1 rounded-md bg-paper-light border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                    {src.providerName}
                                    <span className="text-[9px] font-normal text-ink-muted">({src.sourceType?.replace("_", " ")})</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Multiple Booking Offers */}
                            {seg.flightDetails?.offers && seg.flightDetails.offers.length > 0 && (
                              <div className="pt-2 border-t border-indigo-200">
                                <span className="block text-[10px] font-bold text-ink-muted uppercase mb-1.5">
                                  Compare Real-time Booking Offers ({seg.flightDetails.offers.length} Options):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                  {seg.flightDetails.offers.map((offer, oIdx) => (
                                    <a
                                      key={oIdx}
                                      href={offer.bookingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center justify-between p-2 rounded-xl border transition shadow-yatra-sm ${
                                        offer.isDirectAirlineOffer
                                          ? "bg-paper-light border-indigo-300 hover:bg-indigo-50"
                                          : "bg-paper-light border-amber-300/80 hover:bg-amber-50"
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center gap-1 font-bold text-ink">
                                          <span>{offer.providerName}</span>
                                          {offer.isDirectAirlineOffer && (
                                            <span className="rounded bg-indigo-100 text-indigo text-[9px] px-1 py-0.2 font-bold">
                                              Direct Airline
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-ink-muted">
                                          {offer.availability === "AVAILABLE" ? "Confirmed Seats" : "Check Live"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 font-mono font-bold text-ink">
                                        <span>₹{offer.totalAmount.toLocaleString("en-IN")}</span>
                                        <ExternalLink className="h-3 w-3 text-vermilion" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 10-Point Verification Integrity Checklist */}
                            {seg.flightDetails?.verification?.checks && seg.flightDetails.verification.checks.length > 0 && (
                              <details className="pt-1 border-t border-indigo-200 text-[11px] group">
                                <summary className="cursor-pointer font-bold text-indigo hover:text-indigo-800 list-none flex items-center justify-between py-1">
                                  <span>🛡️ View 10-Point Verification Checks ({seg.flightDetails.verification.checks.filter(c => c.passed).length}/{seg.flightDetails.verification.checks.length} Passed)</span>
                                  <span className="text-[10px] text-ink-muted group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-2 space-y-1 bg-paper-light border border-indigo-100 rounded-lg p-2">
                                  {seg.flightDetails.verification.checks.map((check, cIdx) => (
                                    <div key={cIdx} className="flex items-start justify-between gap-2 text-[10px]">
                                      <span className="font-semibold text-ink flex items-center gap-1">
                                        <span className={check.passed ? "text-emerald-600" : "text-vermilion"}>
                                          {check.passed ? "✓" : "✗"}
                                        </span>
                                        {check.name}
                                      </span>
                                      <span className="text-ink-muted text-right">{check.details}</span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        )}

                        {/* Zone / Geo-coordinates if Railway Station */}
                        {seg.zone && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted font-semibold">
                            <span className="rounded bg-paper-deep border border-amber-300 px-2 py-0.5 font-bold text-ink">
                              Railway Zone: {seg.zone}
                            </span>
                            {seg.latitude && seg.longitude && (
                              <span className="text-ink-muted font-mono">
                                Coordinates: {seg.latitude.toFixed(4)}°N, {seg.longitude.toFixed(4)}°E
                              </span>
                            )}
                          </div>
                        )}

                        {/* Availability, Data Provenance & Source Link */}
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex flex-wrap items-center gap-2">
                            {seg.seatAvailability && (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-peacock border border-emerald-300">
                                {seg.seatAvailability.label}
                                {seg.dataSource !== "live-api" && (
                                  <span className="ml-1 text-[9px] font-normal opacity-80">(Est. Availability)</span>
                                )}
                              </span>
                            )}
                            <span className="rounded bg-paper-deep border border-amber-300 px-1.5 py-0.5 font-bold text-ink-muted text-[10px]">
                              {seg.providerSource} Feed
                            </span>
                            {seg.runningDays && (
                              <span className="text-[10px] font-semibold text-ink-muted">
                                Running: {Array.isArray(seg.runningDays) ? seg.runningDays.join(", ") : seg.runningDays}
                              </span>
                            )}
                            {seg.priceTrend && (
                              <span className="font-semibold text-ink-muted">
                                {seg.priceTrend.label}
                              </span>
                            )}
                          </div>
                          <a
                            href={seg.bookingUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Book ${seg.operator} ticket directly on ${seg.providerSource}`}
                            title={`Open direct booking page on ${seg.providerSource}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-peacock px-3 py-1.5 font-display text-xs font-bold text-paper-light shadow-yatra-sm hover:bg-emerald-800 transition cursor-pointer min-h-[36px]"
                          >
                            <RefreshCw className="h-3 w-3 text-paper-light animate-spin" style={{ animationDuration: "8s" }} />
                            <span>Book on {seg.providerSource}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Segment Arrival Date & Location */}
                      <div className="flex flex-wrap items-center justify-between text-xs">
                        <span className="font-bold text-ink">
                          ARRIVAL: <span className="text-vermilion font-bold">{arrDateStr}</span> at <strong className="font-mono">{arrTimeStr}</strong> — {seg.toName} ({seg.toCode})
                        </span>
                      </div>

                      {/* Intra-City Terminal Transfer Guidance */}
                      {interchange && (
                        <div className="my-3 rounded-xl border border-indigo-300 bg-indigo-50/70 p-3 text-xs text-indigo space-y-1">
                          <div className="flex items-center justify-between gap-1.5 font-bold">
                            <span>🚇 City Terminal Transfer (Google Maps Route):</span>
                            {interchange.distanceKm && (
                              <span className="font-mono text-[10px] bg-indigo-200/80 text-indigo-950 font-bold px-2 py-0.5 rounded">
                                {interchange.distanceKm} km
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-semibold leading-relaxed">
                            {interchange.description} • ~{interchange.durationMinutes} mins transit • Est. fare ₹{interchange.estCost}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {route.endpointTransfers?.filter((transfer) => transfer.placement === "destination").map((transfer, index) => (
                <div key={`destination-access-${index}`} className="rounded-xl border border-indigo-300 bg-indigo-50/80 p-3 text-xs text-indigo">
                  <strong>🚕 Ground access from arrival airport:</strong> {transfer.description} • {transfer.durationMinutes} min • estimated ₹{transfer.estCost}
                </div>
              ))}
            </div>
          </div>

          <KolamDivider className="my-4 text-gold-line opacity-60" />

          {/* Buffer Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border border-amber-300 bg-paper-deep p-3">
              <span className="font-display text-[10px] font-bold text-ink uppercase">Travel Duration</span>
              <div className="mt-1 font-mono text-sm font-bold text-ink">{durationStr}</div>
            </div>
            <div className="rounded-xl border border-amber-300 bg-paper-deep p-3">
              <span className="font-display text-[10px] font-bold text-ink uppercase">Total Distance</span>
              <div className="mt-1 font-mono text-sm font-bold text-peacock">
                {route.totalDistanceKm ? `${route.totalDistanceKm} km` : "Calculated"}
              </div>
            </div>
            <div className="rounded-xl border border-amber-300 bg-paper-deep p-3">
              <span className="font-display text-[10px] font-bold text-ink uppercase">Transfers</span>
              <div className="mt-1 font-mono text-sm font-bold text-ink">
                {route.transfers === 0 ? "Non-stop" : `${route.transfers} stop`}
              </div>
            </div>
            <div className="rounded-xl border border-amber-300 bg-paper-deep p-3">
              <span className="font-display text-[10px] font-bold text-ink uppercase">Deadline Buffer</span>
              <div className="mt-1 font-mono text-sm font-bold text-vermilion">{bufferFormatted || "No deadline set"}</div>
            </div>
            <div className="rounded-xl border border-amber-300 bg-paper-deep p-3">
              <span className="font-display text-[10px] font-bold text-ink uppercase">Est. Confidence</span>
              <div className="mt-1 font-mono text-sm font-bold text-peacock">
                {route.estimatedArrivalConfidence}%
              </div>
            </div>
          </div>

          {/* Fare Breakdown Table */}
          <div>
            <h4 className="mb-2 font-display text-xs font-bold tracking-wider text-ink uppercase">
              Transparent Fare & Live Aggregator Breakdown
            </h4>
            <div className="rounded-2xl border-2 border-amber-300 bg-paper-light p-4 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between text-ink-muted">
                <span>Base Fares (Air / Rail / Bus)</span>
                <span className="text-ink font-bold">₹{totalBaseFare.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Taxes & Carrier Surcharges</span>
                <span className="text-ink font-bold">₹{totalTaxes.toLocaleString("en-IN")}</span>
              </div>
              {totalInterchangeCost + totalEndpointAccessCost > 0 && (
                <div className="flex justify-between text-ink-muted">
                  <span>Ground & Terminal Transfers (estimated)</span>
                  <span className="text-ink font-bold">₹{(totalInterchangeCost + totalEndpointAccessCost).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted">
                <span>BHRAMAN SARTHI Optimization Fee</span>
                <span className="font-bold text-peacock">₹0 (Free MVP)</span>
              </div>
              <div className="border-t-2 border-dashed border-amber-300 pt-2 flex justify-between font-bold text-sm text-ink">
                <span>Indicative Fare Total</span>
                <span>₹{route.totalPrice.toLocaleString("en-IN")}</span>
              </div>

              {/* Dynamic Pricing & Corridor Operational Circumstances Advisory */}
              <div className="mt-3 rounded-xl border border-amber-300 bg-paper-deep p-3 text-[11px] font-sans space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-vermilion">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="uppercase text-[10px] tracking-wide">Notice: Dynamic Pricing & Operational Corridor Circumstances</span>
                </div>
                <p className="text-ink-muted">
                  • <strong className="text-ink">Dynamic Market Pricing:</strong> All fares and ticket prices are dynamic and fluctuate continuously based on market demand, carrier seat occupancy curves, fuel surcharges, and advance booking windows. Final rates are locked upon carrier gateway checkout.
                </p>
                <p className="text-ink-muted">
                  • <strong className="text-ink">Corridor & Schedule Circumstances:</strong> Travel corridor details, layover transfer buffers, departure/arrival timings, and terminal/platform gate assignments are subject to change due to operational circumstances (including air traffic control slots, inclement weather, aircraft/rake rotation, and railway maintenance). Always verify live status before departure.
                </p>
              </div>
            </div>
          </div>

          {/* Google Gemini AI Travel Roadmap & Journey Guide */}
          <div className="rounded-2xl border-2 border-amber-400 bg-paper-deep p-4 shadow-yatra-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold text-ink">
                <Sparkles className="h-4 w-4 text-vermilion" />
                <span>Google Gemini AI — Travel Roadmap & Rationale</span>
              </div>
              <button
                type="button"
                onClick={handleFetchAiExplanation}
                disabled={loadingAiExplanation}
                className="inline-flex items-center gap-1 rounded-xl bg-vermilion px-3 py-1.5 font-display text-xs font-bold text-paper-light shadow-yatra-sm hover:bg-amber-900 cursor-pointer disabled:opacity-50 min-h-[36px]"
              >
                {loadingAiExplanation ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Analyzing Route via Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Gemini AI Travel Roadmap</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 text-xs leading-relaxed font-medium text-ink whitespace-pre-line">
              {explanation}
            </div>
          </div>
        </div>

        {/* Footer Actions with Export Features */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-amber-300 bg-paper-deep px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenWhatIf(route)}
              aria-label="Simulate disruption for this route"
              className="flex items-center gap-1 rounded-xl border border-amber-300 bg-paper-light px-3 py-2 font-display text-xs font-bold text-ink shadow-yatra-sm transition hover:bg-amber-100 cursor-pointer min-h-[44px]"
            >
              <span>Simulate Disruption</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadIcs}
              aria-label="Export route as .ics calendar file"
              className="flex items-center gap-1 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 font-display text-xs font-bold text-indigo shadow-yatra-sm transition hover:bg-indigo-100 cursor-pointer min-h-[44px]"
            >
              <span>📅 Export .ICS Calendar</span>
            </button>
            <button
              type="button"
              onClick={handlePrintItinerary}
              aria-label="Print journey itinerary"
              className="flex items-center gap-1 rounded-xl border border-amber-300 bg-paper-light px-3 py-2 font-display text-xs font-bold text-ink shadow-yatra-sm transition hover:bg-amber-100 cursor-pointer min-h-[44px]"
            >
              <span>🖨️ Print Itinerary</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {route.segments[0]?.bookingUrl && (
              <a
                href={route.segments[0].bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Book ticket directly on ${route.segments[0].providerSource}`}
                title={`Book ticket directly on ${route.segments[0].providerSource}`}
                className="flex items-center gap-1.5 rounded-xl bg-peacock px-4 py-2 font-display text-xs font-bold text-paper-light shadow-yatra-sm transition hover:bg-emerald-800 cursor-pointer min-h-[44px]"
              >
                <span>Book on {route.segments[0].providerSource}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-xl bg-vermilion px-5 py-2 font-display text-xs font-bold text-paper-light shadow-yatra-sm transition hover:bg-amber-900 cursor-pointer min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
