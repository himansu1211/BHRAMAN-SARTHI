import React from "react";
import Link from "next/link";
import { MandalaArt, JaaliBorder } from "@/components/indian-cultural-art";
import { ArrowLeft, TrendingUp, ShieldCheck, Zap, Layers, Sparkles, Building2, Mail, Download } from "lucide-react";
import { IndiaTransitMarketBrief } from "@/components/india-transit-market-brief";

export const metadata = {
  title: "Investor Relations & India Transportation Market — BHRAMAN SARTHI",
  description: "Comprehensive Market Analysis, Transit Economics, and Series Seed Deck for Bhraman Sarthi Tech Pvt. Ltd.",
};

export default function InvestorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Live Route Search</span>
        </Link>
        <span className="rounded-full bg-orange-100 border border-amber-300 px-3 py-1 text-xs font-black text-orange-800 uppercase">
          Confidential • Series Seed Memo 2026
        </span>
      </div>

      {/* Main Investor Deck Hero */}
      <div className="rounded-3xl border-2 border-double border-amber-400 bg-white p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-stone-200 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-vermilion px-3 py-0.5 text-xs font-black text-white uppercase tracking-wider">
                BHRAMAN SARTHI
              </span>
              <span className="text-xs text-stone-500 font-semibold">Bhraman Sarthi Tech Pvt. Ltd.</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900">
              India Transportation Market & Investor Brief
            </h1>
            <p className="text-sm font-medium text-stone-600 max-w-2xl leading-relaxed">
              Transitioning India&apos;s \$32B+ domestic travel ecosystem from naive price-first searching to deadline-guaranteed multimodal journeys with intelligent arrival confidence buffers.
            </p>
          </div>
          <MandalaArt className="h-20 w-20 text-amber-600 shrink-0 hidden sm:block" />
        </div>

        <JaaliBorder className="my-2 text-amber-500/30" />

        {/* Executive Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="text-[10px] font-black text-stone-500 uppercase">Domestic TAM</span>
            <div className="text-2xl font-black text-stone-900">\$32B+</div>
            <span className="text-[11px] font-semibold text-stone-600">Rail, Air & Intercity Bus</span>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="text-[10px] font-black text-stone-500 uppercase">Annual Rail Journeys</span>
            <div className="text-2xl font-black text-orange-700">7.41 Billion</div>
            <span className="text-[11px] font-semibold text-stone-600">FY26 Ministry of Railways</span>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="text-[10px] font-black text-stone-500 uppercase">Domestic Air Departures</span>
            <div className="text-2xl font-black text-indigo-700">165.5 Million</div>
            <span className="text-[11px] font-semibold text-stone-600">FY25 DGCA Official Data</span>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="text-[10px] font-black text-stone-500 uppercase">Intercity Bus GBV</span>
            <div className="text-2xl font-black text-emerald-700">₹51,144 Cr</div>
            <span className="text-[11px] font-semibold text-stone-600">FY25 Projected (VIDEC)</span>
          </div>
        </div>

        {/* Incumbent Gaps vs The BHRAMAN SARTHI Moat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-red-900 flex items-center gap-2">
              <span>⚠️ Incumbent Friction (Market Gaps)</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-800 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-black">•</span>
                <span><strong>Siloed Modal Monopolies:</strong> Skyscanner indexes flights, IRCTC does trains, RedBus aggregates buses. None stitch cross-modal connections intelligently.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-black">•</span>
                <span><strong>Flawed Optimization:</strong> 72% of domestic business and event travelers require arriving before a hard deadline; existing OTAs only sort by raw base price.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-black">•</span>
                <span><strong>Unmodelled Interchange Risk:</strong> Zero transit awareness for station-to-airport transfers (e.g. Metro from Delhi T3 to NDLS, or Cab from BLR Airport to Majestic).</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <span>🛡️ The BHRAMAN SARTHI Moat</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-800 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-black">✓</span>
                <span><strong>Deadline-Pruned Graph:</strong> Heuristic engine automatically excludes itineraries failing the traveler&apos;s arrival cutoff, calculating dynamic buffer minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-black">✓</span>
                <span><strong>Calibrated Interchange Matrix:</strong> Integrates Google Maps distance models and metro transit times across all Tier-1 and Tier-2 Indian transit hubs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-black">✓</span>
                <span><strong>Disruption Simulator & What-If Engine:</strong> Empowers travelers to simulate 30m–180m delays and instantaneously generate resilient fallback routes.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Reusable Comprehensive Market Brief Component */}
        <IndiaTransitMarketBrief />

        {/* Business Model & Monetization Architecture */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
              Monetization Streams & Platform Unit Economics
            </h3>
            <span className="text-xs font-bold text-orange-700">3-Tier Revenue Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2">
              <strong className="block font-black text-stone-900 text-sm">1. Aggregator Commission</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                2.5% to 5.0% take-rate on booking redirects across airline direct portals, IRCTC authorized channels, and private bus operators.
              </p>
              <div className="pt-2 border-t border-stone-100 font-mono text-[11px] font-bold text-emerald-700">
                ₹250 Cr GBV @ 3% = ₹7.5 Cr Rev
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2">
              <strong className="block font-black text-stone-900 text-sm">2. &quot;On-Time Guarantee&quot; Micro-Fee</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                ₹149–₹299 optional traveler insurance protecting against missed connections with automated emergency re-booking compensation.
              </p>
              <div className="pt-2 border-t border-stone-100 font-mono text-[11px] font-bold text-orange-700">
                High Margin (~82% Gross Margin)
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2">
              <strong className="block font-black text-stone-900 text-sm">3. Enterprise B2B Routing API</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Recurring SaaS API subscription for corporate travel desks, meeting organizers, and wedding logistics planners demanding strict arrival compliance.
              </p>
              <div className="pt-2 border-t border-stone-100 font-mono text-[11px] font-bold text-indigo-700">
                ₹40,000–₹1,50,000 / month MRR
              </div>
            </div>
          </div>
        </div>

        {/* Corporate & Investor Contact Card */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-700" />
              <strong className="text-stone-900 text-sm font-black">Bhraman Sarthi Tech Pvt. Ltd.</strong>
            </div>
            <p className="text-xs text-stone-600">
              Incorporated in Bengaluru, Karnataka, India • Series Seed Funding Enquiries
            </p>
            <p className="text-xs font-mono font-bold text-orange-800">
              investors@bhramansarthi.in • founders@bhramansarthi.in
            </p>
          </div>
          <a
            href="mailto:investors@bhramansarthi.in?subject=Bhraman%20Sarthi%20Series%20Seed%20Enquiry"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-black text-white shadow-sm hover:bg-orange-700 transition"
          >
            <Mail className="h-4 w-4" />
            <span>Request Full Seed Model</span>
          </a>
        </div>
      </div>
    </div>
  );
}
