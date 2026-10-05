"use client";

import React, { useState } from "react";
import { SearchResponse, TravelRoute } from "@/lib/types";
import { SummaryCard } from "./summary-card";
import { RouteCard } from "./route-card";
import { RouteModal } from "./route-modal";
import { DelaySimulator } from "./delay-simulator";
import { AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { WarliFigure } from "./ornaments";

interface ResultsViewProps {
  results: SearchResponse;
  onNewSearch: () => void;
}

export function ResultsView({ results, onNewSearch }: ResultsViewProps) {
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<TravelRoute | null>(null);
  const [selectedRouteForWhatIf, setSelectedRouteForWhatIf] = useState<TravelRoute | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "direct_only" | "flights" | "trains" | "buses" | "multimodal">("all");
  const [showMissed, setShowMissed] = useState(false);

  const { search, summary, routes, unfeasibleRoutes, isDemoData, stationWarnings = [], networkMaps } = results;

  // Format travel date nicely
  const searchDateObj = new Date(search.date);
  const formattedSearchDate = searchDateObj.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Format deadline
  const formattedDeadline = search.arriveBy
    ? new Date(search.arriveBy).toLocaleString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : undefined;

  // Filter routes
  const filteredFeasible = routes.filter((r) => {
    // Airport access legs are shown in the itinerary, but they do not make a
    // single flight/train/bus service a connecting journey.
    if (activeFilter === "direct_only") return r.segments.length === 1;
    if (activeFilter === "flights") return r.segments.every((s) => s.type === "flight");
    if (activeFilter === "trains") return r.segments.every((s) => s.type === "train");
    if (activeFilter === "buses") return r.segments.every((s) => s.type === "bus");
    if (activeFilter === "multimodal") {
      const types = new Set(r.segments.map((s) => s.type));
      return types.size > 1; // Mixed transport modes
    }
    return true;
  });
  const directOnlyCount = routes.filter((route) => route.segments.length === 1).length;

  const recommendationChoices = [
    { title: "Best Balance", category: "best_balance" as const, route: summary.bestBalance },
    { title: "Fastest", category: "fastest" as const, route: summary.fastest },
    { title: "Cheapest", category: "cheapest" as const, route: summary.cheapest },
  ];
  const recommendations = [...recommendationChoices].sort((a, b) => {
    const order = [search.optimization, "best_balance", "fastest", "cheapest"];
    return order.indexOf(a.category) - order.indexOf(b.category);
  }).filter((item, index, items) =>
    item.route && items.findIndex((candidate) => candidate.route?.id === item.route?.id) === index
  );

  return (
    <div className="results-page space-y-8 animate-in fade-in duration-300">
      <section className="journey-summary flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[#ded8ca] bg-white p-5 shadow-yatra-sm sm:p-6">
        <div>
          <p className="mb-1 text-xs font-bold tracking-wide text-peacock">YOUR JOURNEY · {formattedSearchDate}</p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{search.origin}</h2>
            <ArrowRight className="h-4 w-4 text-vermilion" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{search.destination}</h2>
            {isDemoData && <span className="rounded-full bg-paper-deep px-2.5 py-1 text-[10px] font-bold text-ink-muted">Route estimates</span>}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            {search.budget ? `Under ₹${search.budget.toLocaleString("en-IN")} · ` : ""}
            {formattedDeadline ? `Arrive by ${formattedDeadline}` : "Fastest routes · no arrival deadline"}
          </p>
        </div>
        <button type="button" onClick={onNewSearch} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#ded8ca] px-4 py-2.5 text-sm font-bold text-ink transition hover:border-peacock hover:text-peacock">
          <RefreshCw className="h-4 w-4" /> Change search
        </button>
      </section>

      <div className="data-note flex items-start gap-2.5 rounded-xl bg-[#f1f4ef] px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-peacock" />
        <p>Schedules and fares are estimates. Check current availability with the operator before booking.</p>
      </div>

      {stationWarnings.length > 0 && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-ink">
          Some rail stations could not be matched: {stationWarnings.join(", ")}.
        </div>
      )}

      {(networkMaps || routes.length > 0) && (
        <details className="group rounded-xl border border-[#e6e1d6] bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-ink">
            <span>Map references & data notes</span><span className="text-xs font-semibold text-ink-muted group-open:hidden">View</span><span className="hidden text-xs font-semibold text-ink-muted group-open:inline">Close</span>
          </summary>
          <div className="border-t border-[#eeeae2] p-4 text-xs leading-relaxed text-ink-muted">
            <p>Displayed fares are estimates and schedules may be historical. Confirm times, fares, and availability with the operator.</p>
            {networkMaps && <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { title: "Rail network", map: networkMaps.rail },
                { title: "Airports", map: networkMaps.airports },
                { title: "Roadways", map: networkMaps.roads },
              ].map(({ title, map }) => (
                <a key={title} href={map.routeUrl || map.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-[#e6e1d6] bg-[#faf9f5] p-3 text-ink transition hover:border-peacock">
                  <span>{title}</span><span className="text-peacock">Open ↗</span>
                </a>
              ))}
            </div>}
          </div>
        </details>
      )}

      {/* Three quick picks surface the most useful choices first. */}
      <div className="quick-picks">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="section-kicker">A GOOD PLACE TO START</p>
            <h3 className="font-display text-lg font-bold text-ink">Recommended journeys</h3>
          </div>
          <span className="text-xs text-ink-muted">{routes.length} options</span>
        </div>
        <div className={`grid grid-cols-1 gap-3 ${recommendations.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-1"}`}>
          {recommendations.map((item) => (
            <SummaryCard
              key={item.route?.id}
              title={item.title}
              category={item.category}
              route={item.route}
              isSelected={selectedRouteForModal?.id === item.route?.id}
              onSelect={(r) => setSelectedRouteForModal(r)}
            />
          ))}
        </div>
      </div>

      {/* Compact filters */}
      <div className="journey-filters flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e1d6] pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `All (${routes.length})` },
            { id: "direct_only", label: `Direct only (${directOnlyCount})` },
            { id: "flights", label: "Flight" },
            { id: "trains", label: "Train" },
            { id: "buses", label: "Bus" },
            { id: "multimodal", label: "Mixed modes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as "all" | "direct_only" | "flights" | "trains" | "buses" | "multimodal")}
              aria-pressed={activeFilter === tab.id}
              title={tab.id === "direct_only" ? "Show single-service journeys with no interchange" : undefined}
              className={`rounded-full px-3.5 py-2 font-sans text-xs font-bold transition whitespace-nowrap cursor-pointer min-h-[38px] ${
                activeFilter === tab.id
                  ? "bg-peacock text-white shadow-yatra-sm"
                  : "bg-white text-ink-soft border border-[#e6e1d6] hover:border-peacock hover:text-peacock"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {search.arriveBy && unfeasibleRoutes && unfeasibleRoutes.length > 0 && (
          <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={showMissed}
              onChange={(e) => setShowMissed(e.target.checked)}
              className="h-4 w-4 rounded border-amber-400 text-vermilion focus:ring-vermilion"
            />
            <span>Show {unfeasibleRoutes.length} {search.arriveBy ? "missed-deadline routes" : "routes that don’t connect safely"}</span>
          </label>
        )}
      </div>

      {/* Recommended Routes Section */}
      <div className="space-y-4">
        <div className="journey-list-heading flex items-center justify-between">
          <h3 className="font-display text-base font-bold tracking-tight text-ink">
            {activeFilter === "all" ? "All journeys" : `Journeys · ${activeFilter === "direct_only" ? "Direct only" : activeFilter === "multimodal" ? "Mixed modes" : activeFilter}`} <span className="font-sans text-sm font-semibold text-ink-muted">({filteredFeasible.length})</span>
          </h3>
          <span className="hidden text-xs text-ink-muted sm:inline">Best arrival time first</span>
        </div>

        {filteredFeasible.length === 0 ? (
          <div className="rounded-3xl border-2 border-double border-amber-300 bg-paper-light p-8 text-center space-y-4">
            <WarliFigure type="empty_state" size={64} className="mx-auto text-amber-700 opacity-80" />
            <div className="space-y-1">
              <p className="font-display text-sm font-bold text-ink">
                No routes match the selected filter criterion.
              </p>
              <p className="text-xs text-ink-muted">
                Choose another filter or show all journeys to include connecting options.
              </p>
            </div>
          </div>
        ) : (
          filteredFeasible.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onViewRoute={(r) => setSelectedRouteForModal(r)}
              onSimulateDelay={(r) => setSelectedRouteForWhatIf(r)}
            />
          ))
        )}
      </div>

      {/* Missed Deadline Routes (Reference Section) */}
      {showMissed && unfeasibleRoutes && unfeasibleRoutes.length > 0 && (
        <div className="space-y-4 pt-6 border-t-2 border-dashed border-crimson-alert/30">
          <div className="flex items-center gap-2 text-crimson-alert">
            <AlertCircle className="h-5 w-5" />
            <h4 className="font-display text-sm font-bold tracking-tight">
              Routes Arriving Past Your Deadline ({unfeasibleRoutes.length})
            </h4>
          </div>
          <div className="opacity-80 space-y-4">
            {unfeasibleRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onViewRoute={(r) => setSelectedRouteForModal(r)}
                onSimulateDelay={(r) => setSelectedRouteForWhatIf(r)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Route Details Modal */}
      {selectedRouteForModal && (
        <RouteModal
          route={selectedRouteForModal}
          deadlineISO={search.arriveBy || ""}
          onClose={() => setSelectedRouteForModal(null)}
          onOpenWhatIf={(r) => {
            setSelectedRouteForModal(null);
            setSelectedRouteForWhatIf(r);
          }}
        />
      )}

      {/* What-If Simulator Modal */}
      {selectedRouteForWhatIf && (
        <DelaySimulator
          route={selectedRouteForWhatIf}
          deadlineISO={search.arriveBy || ""}
          allRoutes={routes}
          onClose={() => setSelectedRouteForWhatIf(null)}
          onSelectAlternative={(alt) => {
            setSelectedRouteForWhatIf(null);
            setSelectedRouteForModal(alt);
          }}
        />
      )}
    </div>
  );
}
