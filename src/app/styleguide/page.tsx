"use client";

import React, { useState } from "react";
import {
  JaaliBorder,
  KolamDivider,
  ToranArch,
  MadhubaniBorder,
  WarliFigure,
  BootaPattern,
} from "@/components/ornaments";
import { Plane, Train, Bus, Clock, ShieldCheck, Search, Tag, Sparkles } from "lucide-react";

export default function StyleguidePage() {
  const [selectedCity, setSelectedCity] = useState("BLR");
  const [showModalSample, setShowModalSample] = useState(false);

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16 min-h-screen">
      <BootaPattern className="top-12 -left-12 opacity-15" />
      <BootaPattern className="top-96 -right-12 opacity-15 rotate-180" />

      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-paper-deep px-4 py-1 text-xs font-bold text-vermilion uppercase tracking-wider shadow-yatra-sm">
          <span>Yatra Design System Specification</span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          RouteWise &quot;Yatra&quot; Visual Identity Guide
        </h1>
        <p className="text-sm font-medium text-ink-muted leading-relaxed">
          A hand-crafted Indian travel journal design language inspired by Madhubani double-line framing, South Indian Kolam floor art, Warli tribal line art, and Rajput Toran gateways. Strictly Light Mode ONLY.
        </p>
        <KolamDivider className="my-6 text-gold-line opacity-70" />
      </div>

      {/* Section 1: Color Palette Tokens */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink border-b-2 border-amber-300 pb-2">
          1. Color Palette Tokens & Contrast AA Matrix
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {[
            { name: "Paper Light", hex: "#FBF3E4", class: "bg-paper-light text-ink", border: "border-amber-300" },
            { name: "Paper Deep", hex: "#F5E8CF", class: "bg-paper-deep text-ink", border: "border-amber-300" },
            { name: "Ink Primary", hex: "#2B1B14", class: "bg-ink text-paper-light", border: "border-ink" },
            { name: "Vermilion", hex: "#C8321E", class: "bg-vermilion text-paper-light", border: "border-vermilion" },
            { name: "Peacock Green", hex: "#1F7A5C", class: "bg-peacock text-paper-light", border: "border-peacock" },
            { name: "Royal Indigo", hex: "#2E3A87", class: "bg-indigo text-paper-light", border: "border-indigo" },
            { name: "Gold Line Accent", hex: "#C9A24B", class: "bg-gold-line text-ink", border: "border-gold-line" },
          ].map((c) => (
            <div key={c.name} className={`rounded-2xl border-2 ${c.border} ${c.class} p-4 space-y-2 shadow-yatra-sm`}>
              <div className="font-display font-bold text-xs">{c.name}</div>
              <div className="font-mono text-[11px] opacity-90">{c.hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Typography */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink border-b-2 border-amber-300 pb-2">
          2. Typography Hierarchy (Yatra One Serif + Mukta Sans)
        </h2>
        <div className="rounded-3xl border-2 border-double border-amber-300 bg-paper-light p-6 space-y-6 shadow-yatra-sm">
          <div>
            <span className="text-xs font-bold text-vermilion uppercase font-display">Display Heading 1</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Plan Your Multimodal Yatra (यात्रा)
            </h1>
          </div>
          <div>
            <span className="text-xs font-bold text-vermilion uppercase font-display">Display Heading 2</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
              Arrive On Time, Every Time — Multimodal Corridors
            </h2>
          </div>
          <div>
            <span className="text-xs font-bold text-vermilion uppercase font-display">Body Text (Mukta)</span>
            <p className="text-sm font-medium text-ink-muted leading-relaxed">
              India&apos;s premier deadline-aware multimodal journey search engine. We calculate optimal flight, train, and bus combinations with intelligent arrival buffers.
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-vermilion uppercase font-display">Tabular Numbers (Monospace)</span>
            <div className="font-mono text-xl font-bold text-ink">
              ₹14,250 • 06h 45m duration • 94% arrival confidence
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Cultural Ornament Component Family */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink border-b-2 border-amber-300 pb-2">
          3. Cultural Ornament Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-4 shadow-yatra-sm">
            <h3 className="font-display text-sm font-bold text-ink">1. Toran Gateway Arch Header</h3>
            <ToranArch className="text-amber-200" title="Sample Toran Arch" />
          </div>

          <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-4 shadow-yatra-sm">
            <h3 className="font-display text-sm font-bold text-ink">2. Kolam Geometric Section Divider</h3>
            <KolamDivider />
          </div>

          <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-4 shadow-yatra-sm">
            <h3 className="font-display text-sm font-bold text-ink">3. Jaali Stone Lattice Border</h3>
            <JaaliBorder className="text-gold-line opacity-70" />
          </div>

          <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-4 shadow-yatra-sm">
            <h3 className="font-display text-sm font-bold text-ink">4. Warli Tribal Line Art Figures</h3>
            <div className="flex flex-wrap items-center justify-around gap-4 pt-2">
              <div className="text-center space-y-1">
                <WarliFigure type="traveler" size={48} className="text-vermilion mx-auto" />
                <span className="text-[10px] font-bold text-ink-muted">Traveler</span>
              </div>
              <div className="text-center space-y-1">
                <WarliFigure type="train" size={48} className="text-vermilion mx-auto" />
                <span className="text-[10px] font-bold text-ink-muted">Train</span>
              </div>
              <div className="text-center space-y-1">
                <WarliFigure type="flight" size={48} className="text-indigo mx-auto" />
                <span className="text-[10px] font-bold text-ink-muted">Flight</span>
              </div>
              <div className="text-center space-y-1">
                <WarliFigure type="bus" size={48} className="text-peacock mx-auto" />
                <span className="text-[10px] font-bold text-ink-muted">Bus</span>
              </div>
              <div className="text-center space-y-1">
                <WarliFigure type="empty_state" size={48} className="text-amber-700 mx-auto" />
                <span className="text-[10px] font-bold text-ink-muted">Empty State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-sm font-bold text-ink mb-3">5. Madhubani Double Border Ticket Framing</h3>
          <MadhubaniBorder className="ticket-edge-left border-amber-400">
            <div className="p-4 text-center font-display font-bold text-ink">
              Madhubani Double Line Ticket Pass Container
            </div>
          </MadhubaniBorder>
        </div>
      </section>

      {/* Section 4: Interactive UI Elements & Buttons */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink border-b-2 border-amber-300 pb-2">
          4. Buttons, Badges, and Mode Badges (WCAG AA Contrast Compliant)
        </h2>

        <div className="rounded-3xl border-2 border-amber-300 bg-paper-light p-6 space-y-6 shadow-yatra-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-ink mb-3">Primary & Secondary Buttons</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 min-h-[48px] px-6 rounded-2xl bg-vermilion font-display text-sm font-bold text-paper-light shadow-yatra-md hover:bg-amber-900 transition cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>Primary Action (Vermilion)</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 min-h-[48px] px-6 rounded-2xl border-2 border-amber-400 bg-paper-deep font-display text-sm font-bold text-ink shadow-yatra-sm hover:bg-amber-100 transition cursor-pointer"
              >
                <span>Secondary Action (Paper Deep)</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 min-h-[48px] px-6 rounded-2xl border border-indigo-300 bg-indigo-50 font-display text-sm font-bold text-indigo shadow-yatra-sm hover:bg-indigo-100 transition cursor-pointer"
              >
                <span>Export ICS Calendar</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-ink mb-3">Transport Mode Badges</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 border border-indigo-300 px-3 py-1 text-xs font-bold text-indigo">
                <Plane className="h-4 w-4 text-indigo" /> Flight (Indigo #2E3A87)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 border border-amber-300 px-3 py-1 text-xs font-bold text-vermilion">
                <Train className="h-4 w-4 text-vermilion" /> Train (Vermilion #C8321E)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 px-3 py-1 text-xs font-bold text-peacock">
                <Bus className="h-4 w-4 text-peacock" /> Bus (Peacock #1F7A5C)
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-ink mb-3">Data Provenance Badges</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-peacock">
                Live API (Skyscanner / IRCTC)
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold text-ink">
                Schedule snapshot from 2016, verify before travel
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-paper-deep px-2.5 py-1 text-xs font-bold text-ink-muted">
                Demo data
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="pt-8 border-t-2 border-amber-300 text-center font-display text-xs text-ink-muted">
        BHRAMAN SARTHI (भ्रमण सारथी) Design System • Pure Light Mode • WCAG 2.2 AA Compliant
      </footer>
    </div>
  );
}
