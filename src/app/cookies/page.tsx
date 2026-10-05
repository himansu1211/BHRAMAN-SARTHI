import React from "react";
import Link from "next/link";
import { MandalaArt, JaaliBorder } from "@/components/indian-cultural-art";
import { Cookie, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cookie Policy — BHRAMAN SARTHI",
  description: "Cookie Policy and Browser Storage Statement for Bhraman Sarthi.",
};

export default function CookiePolicyPage() {
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
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 uppercase">
                Cookies & Storage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Cookie & Local Storage Policy
            </h1>
            <p className="text-xs font-semibold text-orange-700">
              BHRAMAN SARTHI (भ्रमण सारथी) • Transparent Browser Storage
            </p>
          </div>
          <MandalaArt className="h-16 w-16 text-amber-600 shrink-0 hidden sm:block" />
        </div>

        <JaaliBorder className="my-2 text-amber-500/30" />

        <div className="space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. What Are Cookies & Local Storage?
            </h2>
            <p>
              Cookies and browser LocalStorage are small data files placed on your device to help web applications remember your preferences and ensure smooth navigation across pages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. How BHRAMAN SARTHI Uses Storage
            </h2>
            <div className="space-y-3">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5">
                <strong className="block font-bold text-stone-900">Essential Session Storage:</strong>
                <p className="mt-1 text-stone-600">
                  Used to save your cookie consent choice (`bhraman_cookie_consent`) so you are not repeatedly prompted on every page load.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5">
                <strong className="block font-bold text-stone-900">Search Preference Cache (Optional):</strong>
                <p className="mt-1 text-stone-600">
                  Stores your recently selected origin and destination corridor presets so you don't have to re-enter them during a single browsing session.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              3. Managing Cookie Preferences
            </h2>
            <p>
              You can clear or block cookies at any time via your web browser settings. Clearing browser data will reset your cookie consent banner preferences on your next visit.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
