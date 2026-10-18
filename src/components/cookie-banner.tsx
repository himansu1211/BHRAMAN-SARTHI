"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(!localStorage.getItem("bhraman_cookie_consent"));
  }, []);

  const handleAccept = () => {
    if (!mounted) return;
    localStorage.setItem("bhraman_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    if (!mounted) return;
    localStorage.setItem("bhraman_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-3xl border-2 border-amber-300 bg-white/98 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs">
            <Cookie className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-stone-900">
                BHRAMAN SARTHI — Privacy & Essential Cookie Notice
              </h4>
              <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-900 uppercase">
                DPDP Act 2023 Compliant
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 font-medium">
              BHRAMAN SARTHI collects only essential search inputs needed to calculate your deadline-aware multimodal trip options. We do not use cross-site trackers or sell user data. Read our{" "}
              <Link href="/cookies" className="font-extrabold text-orange-700 underline hover:text-orange-900">
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-extrabold text-orange-700 underline hover:text-orange-900">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleDecline}
            aria-label="Decline optional cookies and accept only essential cookies"
            className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs font-black text-stone-800 transition hover:bg-stone-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            Only Essential
          </button>
          <button
            type="button"
            onClick={handleAccept}
            aria-label="Accept all cookies and session preferences"
            className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-orange-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
