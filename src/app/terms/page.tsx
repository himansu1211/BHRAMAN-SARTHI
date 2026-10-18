import React from "react";
import Link from "next/link";
import { MandalaArt, JaaliBorder } from "@/components/indian-cultural-art";
import { ShieldCheck, FileText, ArrowLeft, Building2 } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions — BHRAMAN SARTHI",
  description: "Terms of Service and User Agreement for Bhraman Sarthi Tech Pvt. Ltd.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Search</span>
      </Link>

      <div className="rounded-3xl border border-amber-200/90 bg-white p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-800 uppercase">
                Legal & Compliance
              </span>
              <span className="text-xs text-stone-500">Effective Date: October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Terms and Conditions
            </h1>
            <p className="text-xs font-semibold text-orange-700">
              BHRAMAN SARTHI (भ्रमण सारथी) • Bhraman Sarthi Tech Pvt. Ltd.
            </p>
          </div>
          <MandalaArt className="h-16 w-16 text-amber-600 shrink-0 hidden sm:block" />
        </div>

        <JaaliBorder className="my-2 text-amber-500/30" />

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Introduction & Acceptance
            </h2>
            <p>
              Welcome to <strong>BHRAMAN SARTHI</strong> ("the Platform"), operated by Bhraman Sarthi Tech Pvt. Ltd., headquartered in Bengaluru, Karnataka, India. By accessing, browsing, or utilizing our deadline-aware multimodal routing services, you agree to be bound by these Terms and Conditions and our Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Multimodal Routing & Aggregator Disclosure
            </h2>
            <p>
              BHRAMAN SARTHI functions strictly as an intelligent travel route search and optimization platform. We aggregate schedule and fare information from official third-party carriers and authorized APIs including IRCTC, Skyscanner, Ixigo, Goibibo, and RedBus.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>BHRAMAN SARTHI is not a direct transport carrier or airline.</li>
              <li>Estimated arrival confidence values and safety buffer calculations are deterministic heuristic models designed for guidance and planning purposes.</li>
              <li>Actual transit schedules, delays, weather disruptions, or gate changes remain governed by the respective operating carriers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              3. Dynamic Pricing & Operational Corridor Fluctuations
            </h2>
            <p>
              Users explicitly acknowledge and agree that all displayed fares, prices, and travel corridor details are dynamic and subject to real-time adjustments:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Market Demand Dynamic Fares:</strong> Transport fares and ticket tariffs across airlines, railways, and bus operators fluctuate continuously based on real-time market demand, seat occupancy curves, fuel surcharges, and advance booking windows. Displayed quotes are live estimates and are finalized solely at checkout on the operating carrier's portal.</li>
              <li><strong>Corridor & Schedule Circumstances:</strong> Travel corridor details, departure/arrival schedules, layover times, aircraft/train equipment, and terminal or platform gate assignments are subject to change due to operational circumstances, including but not limited to adverse weather conditions, air traffic control (ATC) restrictions, airspace congestion, safety advisories, railway maintenance blocks, and airline fleet rotation.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              4. User Responsibilities & Data Collection
            </h2>
            <p>
              You agree to provide accurate search parameter inputs (origin, destination, date, and deadline cutoffs). BHRAMAN SARTHI collects only essential search query data necessary to fulfill your route requests. We strictly adhere to the Digital Personal Data Protection (DPDP) Act 2023 of India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              5. Intellectual Property
            </h2>
            <p>
              All trademarks, algorithms, UI designs, traditional Indian cultural art elements, and proprietary scoring models hosted on BHRAMAN SARTHI are the sole intellectual property of Bhraman Sarthi Tech Pvt. Ltd. Unauthorized scraping, reproduction, or reverse engineering is prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              6. Contact & Grievance Redressal
            </h2>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1 text-stone-800">
              <p><strong>Grievance Officer:</strong> Legal & Compliance Cell</p>
              <p><strong>Entity:</strong> Bhraman Sarthi Tech Pvt. Ltd.</p>
              <p><strong>Address:</strong> Bengaluru, Karnataka 560001, India</p>
              <p><strong>Email:</strong> grievance@bhramansarthi.in | support@bhramansarthi.in</p>
              <p className="text-[11px] text-stone-500 pt-1">
                Grievances are acknowledged within 24 hours and resolved within 15 business days under the Indian IT Act 2000 & IT Rules 2021.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
