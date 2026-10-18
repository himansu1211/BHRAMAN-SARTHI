import React from "react";
import Link from "next/link";
import { MandalaArt, JaaliBorder } from "@/components/indian-cultural-art";
import { RefreshCw, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy — BHRAMAN SARTHI",
  description: "Refund & Cancellation Policy for Bhraman Sarthi Tech Pvt. Ltd.",
};

export default function RefundPolicyPage() {
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
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800 uppercase">
                Aggregator Policy
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs font-semibold text-orange-700">
              BHRAMAN SARTHI (भ्रमण सारथी) • Transparent Carrier Processing
            </p>
          </div>
          <MandalaArt className="h-16 w-16 text-amber-600 shrink-0 hidden sm:block" />
        </div>

        <JaaliBorder className="my-2 text-amber-500/30" />

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Multimodal Referral & Booking Model
            </h2>
            <p>
              <strong>BHRAMAN SARTHI</strong> currently provides free search optimization and multimodal route recommendation. When you decide to purchase tickets, you are redirected to the respective official operator platforms (e.g. IRCTC for Indian Railways, Indigo/Air India/Skyscanner for flights, and RedBus/KSRTC for interstate buses).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Cancellation & Refund Rules
            </h2>
            <p>
              Since ticket transactions occur directly on carrier and partner booking engines, all ticket cancellations, date changes, seat re-allocations, and refund amounts are governed strictly by the respective carrier's tariff rules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Indian Railway Tickets (IRCTC):</strong> Cancelled according to Railway Passengers Rules (TDR filing rules & cancellation charges based on chart preparation timing).</li>
              <li><strong>Airline Tickets:</strong> Managed via airline portal or aggregator terms (e.g. zero-penalty cancellation windows or airline credit vouchers).</li>
              <li><strong>Interstate Bus Tickets:</strong> Subject to operator-specific cancellation slabs (e.g. 24h prior vs 4h prior refund percentages).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              3. Support Assistance
            </h2>
            <p>
              For guidance on locating your PNR or ticket booking reference, reach out to our helpdesk at <strong>support@bhramansarthi.in</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
