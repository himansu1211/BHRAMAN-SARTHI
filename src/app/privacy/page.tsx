import React from "react";
import Link from "next/link";
import { MandalaArt, JaaliBorder } from "@/components/indian-cultural-art";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy (DPDP Act Compliant) — BHRAMAN SARTHI",
  description: "Privacy Policy and Data Protection standards for Bhraman Sarthi Tech Pvt. Ltd.",
};

export default function PrivacyPage() {
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
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase">
                DPDP Act 2023 Compliant
              </span>
              <span className="text-xs text-stone-500">Updated: October 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Privacy Policy
            </h1>
            <p className="text-xs font-semibold text-orange-700">
              BHRAMAN SARTHI (भ्रमण सारथी) • Minimal Data Collection Guarantee
            </p>
          </div>
          <MandalaArt className="h-16 w-16 text-amber-600 shrink-0 hidden sm:block" />
        </div>

        <JaaliBorder className="my-2 text-amber-500/30" />

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Strict Data Minimization Principle
            </h2>
            <p>
              At <strong>BHRAMAN SARTHI</strong>, we collect <strong>only the necessary data required to calculate your deadline-aware multimodal trip options</strong>. We do not require personal identification, phone numbers, or credit card information to perform route searches.
            </p>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <h3 className="font-bold text-emerald-900">Data We Process for Search:</h3>
              <ul className="list-disc pl-5 space-y-1 text-emerald-800">
                <li>Selected origin hub and destination hub choices</li>
                <li>Target travel date and deadline arrival timestamp</li>
                <li>Optional maximum budget preference and optimization priorities</li>
              </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Analytical Tracking & Third-Party Embed Audit
            </h2>
            <p>
              We conduct periodic privacy audits on our tracking and embed mechanisms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>No Third-Party Ad Trackers:</strong> We do not host Facebook Pixels, Google Remarketing Tags, or cross-site fingerprinting scripts.</li>
              <li><strong>Privacy-Preserving Analytics:</strong> Aggregate visit counts are logged in an anonymized fashion without storing individual IP identifiers.</li>
              <li><strong>Third-Party Booking Redirects:</strong> When you click outward to complete a booking on partner platforms (IRCTC, Skyscanner, RedBus), you interact directly with their secure booking gateways.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              3. Data Retention & Security
            </h2>
            <p>
              Transient route parameters are cached in your browser's local memory (`localStorage`) for quick session recovery and are never sold or rented to third-party data brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              4. Data Principal Rights & Contact
            </h2>
            <p>
              Under India's DPDP Act 2023, you have the right to request information on stored data or request immediate deletion of browser preferences. Contact our Privacy Officer at <strong>privacy@bhramansarthi.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
