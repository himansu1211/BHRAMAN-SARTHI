import React from "react";
import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { KolamDivider } from "./ornaments";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-amber-300/80 bg-paper-deep text-ink">
      {/* Top Banner with Indian Cultural Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-vermilion via-gold-line to-indigo" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vermilion to-amber-700 text-paper-light shadow-md shadow-amber-900/10">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-tight text-ink">
                  BHRAMAN SARTHI
                </span>
                <span className="block text-[11px] font-bold text-vermilion">
                  भ्रमण सारथी • Your Journey Navigator
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-ink-muted">
              India&apos;s premier deadline-aware multimodal journey optimizer. Sticking to your cutoff times across Air, Rail & Interstate Bus corridors with intelligent arrival buffers.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
              <MapPin className="h-4 w-4 text-vermilion shrink-0" />
              <span>Bengaluru, Karnataka 560001, India</span>
            </div>
          </div>

          {/* Legal Policies */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold tracking-wider text-ink uppercase">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/terms" className="text-ink-muted hover:text-vermilion transition">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-ink-muted hover:text-vermilion transition">
                  Privacy Policy (DPDP 2023)
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-ink-muted hover:text-vermilion transition">
                  Cookie & Tracking Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-ink-muted hover:text-vermilion transition">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/payment-policy" className="text-ink-muted hover:text-vermilion transition">
                  Payment Terms & Gateway Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Aggregator Disclaimer */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold tracking-wider text-ink uppercase">
              Fair Aggregator & Data Provenance
            </h4>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              BHRAMAN SARTHI distinguishes stored timetable snapshots from live provider data. Snapshot routes, fares, and operating days may be out of date; verify the current service with the operator before travel:
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <a
                href="https://enquiry.indianrail.gov.in/ntes/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-vermilion underline hover:text-amber-900"
              >
                NTES Live Train Tracking ↗
              </a>
              <span className="text-amber-400">•</span>
              <a
                href="https://www.irctc.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-vermilion underline hover:text-amber-900"
              >
                IRCTC Official Booking ↗
              </a>
            </div>
          </div>
        </div>

        <KolamDivider className="my-4 text-gold-line opacity-60" />

        {/* Bottom Attribution Line */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-ink-muted font-semibold">
            © {new Date().getFullYear()} BHRAMAN SARTHI (Bhraman Sarthi Tech Pvt. Ltd.). All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-ink font-bold">
            <span>Built in India with</span>
            <span className="text-vermilion text-base" aria-label="love emoji">❤️</span>
            <span>by</span>
            <a
              href="https://www.linkedin.com/in/shreeyam-yadav-10652a38a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shreeyam Yadav LinkedIn Profile"
              className="text-vermilion underline hover:text-amber-900 transition px-1 font-extrabold"
            >
              Shreeyam Yadav
            </a>
            <span>&</span>
            <a
              href="https://www.linkedin.com/in/himansu-kumar-sahu-377916334?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Himansu Kumar Sahu LinkedIn Profile"
              className="text-vermilion underline hover:text-amber-900 transition px-1 font-extrabold"
            >
              Himansu Kumar Sahu
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
