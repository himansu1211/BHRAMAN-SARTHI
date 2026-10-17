import type { Metadata } from "next";
import {
  CONNECTION_BUFFERS_MINUTES,
  CONFIDENCE_DISCLAIMER,
} from "@/lib/config/app";

export const metadata: Metadata = {
  title: "About RouteWise — Deadline-Aware Travel",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="space-y-4">
        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          Architecture & Methodology
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          About RouteWise
        </h1>
        <p className="text-base leading-relaxed text-muted">
          RouteWise re-engineers Indian travel planning around a single critical parameter:
          <strong className="text-foreground"> arriving before your scheduled commitment</strong>.
          Whether it&apos;s a high-stakes board meeting, a connecting flight, or a family wedding, we calculate realistic multi-modal options across Indian aviation and railways.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold text-foreground">
            How Arrival Confidence is Calculated
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Rather than relying solely on airline-published on-time percentages, RouteWise runs a composite scoring model:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span><strong>Deadline Buffer:</strong> We evaluate how many spare minutes you have between landing/train arrival and your requested arrive-by deadline.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span><strong>Transfer Risk:</strong> Direct connections minimize cascading delays. Connecting flights or train transfers require strict transfer minimums.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span><strong>Historical Operator Reliability:</strong> Individual carrier reliability scores are factored into overall route confidence.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold text-foreground">
            Minimum Transfer Buffers
          </h2>
          <p className="mt-2 text-sm text-muted">
            Realistic transfer thresholds ensure you don&apos;t get stranded during city or venue changes:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="font-semibold text-foreground">Airport-to-Airport (Same venue)</div>
              <div className="text-xs text-muted">{CONNECTION_BUFFERS_MINUTES.airportToAirportSameVenue} minutes</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="font-semibold text-foreground">Airport-to-Airport (Across town)</div>
              <div className="text-xs text-muted">{CONNECTION_BUFFERS_MINUTES.airportToAirport} minutes</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="font-semibold text-foreground">Station-to-Station (Same station)</div>
              <div className="text-xs text-muted">{CONNECTION_BUFFERS_MINUTES.stationToStationSameVenue} minutes</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="font-semibold text-foreground">Airport to Railway Station</div>
              <div className="text-xs text-muted">{CONNECTION_BUFFERS_MINUTES.airportToStation} minutes</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-accent/20 bg-accent/5 p-6 text-xs text-muted">
          <h3 className="font-bold uppercase tracking-wider text-accent">Disclaimer</h3>
          <p className="mt-1 leading-relaxed">
            {CONFIDENCE_DISCLAIMER}
          </p>
        </section>
      </div>
    </main>
  );
}
