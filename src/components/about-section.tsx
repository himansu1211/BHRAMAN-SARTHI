import React from "react";
import { ShieldCheck, Clock, Zap, Scale } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-12 border-t border-amber-300/80">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-paper-deep px-4 py-1 text-xs font-bold text-vermilion uppercase tracking-wider shadow-yatra-sm">
            <span>Thoughtful travel, from start to finish</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            See the whole journey clearly.
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Compare direct services with practical connections, then open each leg to see the stations, times, transfers, and booking options.
            <strong className="text-ink"> Bhraman Sarthi</strong> brings the details together in a plan that is easier to scan and compare.
          </p>
        </div>

        {/* Value Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border-2 border-double border-amber-400/70 bg-paper-light p-6 shadow-yatra-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-vermilion border border-amber-300">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              Compare every mode
            </h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              Review direct flights, trains, buses, and mixed journeys together. Sort around speed, fare, or a balanced trip.
            </p>
          </div>

          <div className="rounded-3xl border-2 border-double border-amber-400/70 bg-paper-light p-6 shadow-yatra-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-peacock border border-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              Connections with context
            </h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              See where a change is needed, how much time it takes, and when a station-to-airport transfer is part of the route.
            </p>
          </div>

          <div className="rounded-3xl border-2 border-double border-amber-400/70 bg-paper-light p-6 shadow-yatra-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo border border-indigo-300">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              Clear data labels
            </h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              Stored timetables and estimated fares are identified clearly. Check the operator for current schedules, fares, and seat availability.
            </p>
          </div>
        </div>

        {/* Corporate Transparency & Privacy Notice */}
        <div className="rounded-3xl border border-amber-300 bg-paper-deep/80 p-6 text-xs text-ink space-y-3 shadow-yatra-sm">
          <div className="flex items-center gap-2 font-display font-bold text-ink uppercase tracking-wider">
            <Scale className="h-4 w-4 text-vermilion" />
            <span>Built for Indian journeys</span>
          </div>
          <p className="leading-relaxed text-ink-muted">
            Search across the places and transport networks that make up a real trip in India. We show the route information available in our data and link out to providers so you can confirm the latest details before booking.
          </p>
        </div>
      </div>
    </section>
  );
}
