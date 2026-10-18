import React from "react";
import Link from "next/link";
import { MandalaArt, JaaliBorder } from "@/components/indian-cultural-art";
import { CreditCard, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Payment Terms & Gateway Policy — BHRAMAN SARTHI",
  description: "Payment Gateway Policy and Fare Transparency for Bhraman Sarthi.",
};

export default function PaymentPolicyPage() {
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
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-800 uppercase">
                Payment Security
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Payment Terms & Gateway Policy
            </h1>
            <p className="text-xs font-semibold text-orange-700">
              BHRAMAN SARTHI (भ्रमण सारथी) • Fare Transparency Standard
            </p>
          </div>
          <MandalaArt className="h-16 w-16 text-amber-600 shrink-0 hidden sm:block" />
        </div>

        <JaaliBorder className="my-2 text-amber-500/30" />

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Transparent Fare Display
            </h2>
            <p>
              <strong>BHRAMAN SARTHI</strong> presents comprehensive fare breakdowns including carrier base fares, applicable taxes, convenience charges, and estimated intra-city transit costs (e.g. Metro or Prepaid Taxi).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Payment Security & Compliance
            </h2>
            <p>
              All payment transactions processed on referral partner gateways comply with Reserve Bank of India (RBI) regulations, PCI-DSS standards, and mandatory Two-Factor Authentication (2FA) for Indian credit/debit cards, UPI, and Net Banking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              3. Currency & Pricing
            </h2>
            <p>
              All fares displayed on BHRAMAN SARTHI are denominated in Indian National Rupees (INR / ₹) inclusive of GST where mandated by operating carriers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
