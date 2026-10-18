"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Bookmark, Info, TrendingUp, Menu, X } from "lucide-react";
import { InvestorPitch } from "./investor-pitch";

export function Header() {
  const [showPitch, setShowPitch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBrandClick = () => {
    window.dispatchEvent(new CustomEvent("bhraman-sarthi-brand-click"));
  };

  return (
    <>
      <header className="site-header sticky top-0 z-40 w-full border-b border-gold-line/40 bg-paper-light/95 backdrop-blur-md shadow-yatra-sm">
        <div className="refined-nav-pattern" aria-hidden="true" />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Yatra Logo & Branding */}
          <Link
            href="/"
            onClick={handleBrandClick}
            aria-label="BHRAMAN SARTHI Home"
            className="flex items-center gap-3 transition hover:opacity-90 rounded-xl p-1 group cursor-pointer"
          >
            {/* Original Yatra Compass Rose Emblem */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white transition group-hover:scale-105 shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 3V21M3 12H21" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                <polygon points="12,6 15,12 12,18 9,12" fill="#E2E8F0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-wide text-slate-900 group-hover:text-blue-900 transition">
                  Bhraman Sarthi
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 uppercase">
                  भ्रमण सारथी
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                Thoughtful journeys across India
              </p>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("bhraman-open-saved"));
              }}
              className="header-saved flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-900 cursor-pointer"
            >
              <Bookmark className="h-4 w-4 text-slate-500" />
              <span>Saved</span>
            </button>
            <a
              href="#about"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-900"
            >
              <Info className="h-4 w-4 text-slate-500" />
              <span>About</span>
            </a>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden rounded-xl border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-md">
            <button
              type="button"
              onClick={() => {
                setShowPitch(true);
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800"
            >
              <TrendingUp className="h-4 w-4 text-blue-900" />
              <span>Investor Deck</span>
            </button>

            <Link
              href="/"
              onClick={() => {
                handleBrandClick();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Compass className="h-4 w-4 text-blue-900" />
              <span>Search Corridor</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("bhraman-open-saved"));
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-left"
            >
              <Bookmark className="h-4 w-4 text-slate-500" />
              <span>Saved Section & History</span>
            </button>

            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Info className="h-4 w-4 text-slate-500" />
              <span>About</span>
            </a>
          </div>
        )}
      </header>

      {showPitch && <InvestorPitch onClose={() => setShowPitch(false)} />}
    </>
  );
}
