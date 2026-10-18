import React from "react";
import { ShieldCheck, Clock, Zap, Scale } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-12 border-t border-slate-200">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-1 text-xs font-bold text-blue-900 uppercase tracking-wider shadow-xs">
            <span>Thoughtful travel, from start to finish</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            See the whole journey clearly.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Compare direct services with practical connections, then open each leg to see the stations, times, transfers, and booking options.
            <strong className="text-slate-900"> Bhraman Sarthi</strong> brings the details together in a plan that is easier to scan and compare.
          </p>
        </div>

        {/* Value Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-blue-900 border border-slate-200">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Compare every mode
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Review direct flights, trains, buses, and mixed journeys together. Sort around speed, fare, or a balanced trip.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Connections with context
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              See where a change is needed, how much time it takes, and when a station-to-airport transfer is part of the route.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Clear data labels
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
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
