"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search/search-form";
import { searchInputToParams } from "@/lib/validation/search";
import { addDaysIsoDate, todayIsoDate } from "@/lib/time";
import type { SearchInput } from "@/lib/types/travel";
import {
  RathChakraIcon,
  LotusIcon,
  DiyaIcon,
  VimanaIcon,
  RajGadiIcon,
  OrnateCorner,
  RoyalSealIcon,
  ToranaDivider,
} from "@/components/traditional-icons";

const HISTORIC_CORRIDORS = [
  {
    origin: "bangalore",
    destination: "delhi",
    label: "बेंगलुरु → दिल्ली",
    enLabel: "Bangalore → Delhi",
    title: "दक्षिणापथ (Dakshinapath)",
    badge: "Fastest Multimodal",
    icon: "🏹",
  },
  {
    origin: "delhi",
    destination: "mumbai",
    label: "दिल्ली → मुंबई",
    enLabel: "Delhi → Mumbai",
    title: "राजधानी राजपथ (Capital Highway)",
    badge: "Tejas & Flights",
    icon: "👑",
  },
  {
    origin: "mumbai",
    destination: "bangalore",
    label: "मुंबई → बेंगलुरु",
    enLabel: "Mumbai → Bangalore",
    title: "पश्चिमी व्यापारिक मार्ग (Western Arterial)",
    badge: "Business Express",
    icon: "⚓",
  },
  {
    origin: "hyderabad",
    destination: "delhi",
    label: "हैदराबाद → दिल्ली",
    enLabel: "Hyderabad → Delhi",
    title: "दक्कन संगम (Deccan Nexus)",
    badge: "High Reliability",
    icon: "💎",
  },
  {
    origin: "chennai",
    destination: "bangalore",
    label: "चेन्नई → बेंगलुरु",
    enLabel: "Chennai → Bangalore",
    title: "द्रविड़ गलियारा (Dravidian Corridor)",
    badge: "Vande Bharat + Air",
    icon: "🛕",
  },
  {
    origin: "delhi",
    destination: "kolkata",
    label: "दिल्ली → कोलकाता",
    enLabel: "Delhi → Kolkata",
    title: "उत्तरापथ (The Grand Uttarapath)",
    badge: "Historic Trunk",
    icon: "🦚",
  },
];

export default function HomePage() {
  const router = useRouter();
  const tomorrow = addDaysIsoDate(todayIsoDate(), 1);

  const handleQuickRoute = (origin: string, destination: string) => {
    const input: SearchInput = {
      origin,
      destination,
      date: tomorrow,
      arriveBy: `${tomorrow}T22:00:00+05:30`,
      budget: 25000,
      optimization: "best_balance",
      includeMissedDeadline: false,
    };
    const params = searchInputToParams(input);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
      {/* Hero Presentation */}
      <section className="relative text-center">
        {/* Sanskrit Blessing Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#8e1b1b] shadow-sm backdrop-blur">
          <DiyaIcon className="h-4 w-4 text-amber-600" />
          <span className="font-devanagari text-sm">शुभस्ते पन्थानः सन्तु</span>
          <span className="text-amber-500 font-bold">•</span>
          <span className="text-[11px] font-serif-royal">May Your Paths Be Auspicious</span>
        </div>

        {/* Grand Medieval Heading */}
        <h1 className="mt-6 font-royal-title text-4xl font-extrabold tracking-wide text-[#2a1610] sm:text-6xl md:text-7xl">
          BHRAMAN-SARTHI
          <span className="mt-2 block font-devanagari text-3xl sm:text-5xl md:text-6xl text-[#8e1b1b]">
            भ्रमण-सारथी
          </span>
        </h1>

        <p className="font-serif-royal mx-auto mt-4 max-w-2xl text-lg sm:text-xl font-semibold text-amber-900">
          The Ancient Journey Reimagined with Modern Temporal Precision
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[#6e5246]">
          Like Lord Krishna guiding Arjuna&apos;s chariot through every challenging turn,{" "}
          <strong className="text-[#8e1b1b]">BHRAMAN-SARTHI</strong> steers you across Bharatvarsha. We compare flights and express trains side-by-side, calculating reliable transfer buffers and delay resilience so you arrive safely before your sacred commitment.
        </p>

        {/* Hero Medieval Artwork Frame */}
        <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border-4 border-[#dfc89d] bg-[#1a0e0a] shadow-2xl">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/bhraman-hero.jpg"
              alt="Bhraman-Sarthi Royal Procession through Ancient India"
              fill
              priority
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {/* Elegant Vintage Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f100b] via-transparent to-transparent opacity-60" />
            
            {/* Inscription Banner on artwork */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-amber-300/40 bg-[#2a130d]/85 px-4 py-2 text-xs backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:px-6 sm:py-3">
              <div className="flex items-center gap-2.5 text-left text-amber-200">
                <RathChakraIcon className="h-5 w-5 text-amber-400" />
                <div>
                  <div className="font-royal-title text-xs sm:text-sm font-bold text-amber-300">
                    यात्रा चक्र • THE WHEEL OF JOURNEYS
                  </div>
                  <div className="text-[11px] text-amber-100/80 hidden sm:block">
                    Navigating ancient trade routes and modern high-speed corridors with unwavering confidence
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/40">
                  भारतवर्ष • Bharatvarsha
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Historic Corridors Chips */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
            <LotusIcon className="h-3.5 w-3.5 text-amber-600" />
            <span>ऐतिहासिक महामार्ग (Historic Travel Corridors)</span>
            <LotusIcon className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
            {HISTORIC_CORRIDORS.map((route) => (
              <button
                key={route.enLabel}
                type="button"
                onClick={() => handleQuickRoute(route.origin, route.destination)}
                className="group flex items-center gap-2 rounded-xl border border-[#dfc89d] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2a1610] shadow-sm transition-all hover:border-[#8e1b1b] hover:bg-amber-50 hover:text-[#8e1b1b] hover:shadow-md"
              >
                <span>{route.icon}</span>
                <span className="font-devanagari">{route.label}</span>
                <span className="text-[10px] text-amber-800">({route.title})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Search Form */}
      <section className="mt-12">
        <SearchForm navigateOnSubmit={true} />
      </section>

      {/* Cultural Pillars / Value Propositions */}
      <section className="mt-20 border-t-2 border-[#dfc89d] pt-16">
        <div className="text-center">
          <ToranaDivider className="mb-4" />
          <span className="font-devanagari text-sm font-bold text-amber-800 uppercase tracking-widest">
            सारथी के तीन स्तम्भ
          </span>
          <h2 className="mt-1 font-royal-title text-2xl font-bold tracking-wide text-[#2a1610] sm:text-4xl">
            Why Traditional Wisdom Guides Every Route
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#6e5246]">
            In ancient times, a traveller never set out without knowing seasonal hazards and transit delays. We apply that timeless prudence to modern aviation and railways.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Pillar 1 */}
          <div className="relative rounded-3xl border border-[#dfc89d] bg-gradient-to-b from-white to-[#fbf7ee] p-7 shadow-md transition-all hover:-translate-y-1 hover:border-amber-600 hover:shadow-xl">
            <div className="absolute top-3 right-3 text-amber-400/40">
              <LotusIcon className="h-6 w-6" />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8e1b1b]/10 text-[#8e1b1b]">
              <DiyaIcon className="h-7 w-7 text-[#8e1b1b]" />
            </div>
            <h3 className="mt-5 font-royal-title text-lg font-bold text-[#2a1610]">
              १. निश्चित आगमन समय
            </h3>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Deadline-First Intelligence
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#6e5246]">
              A journey completed ten minutes too late is a failure. We rank every itinerary strictly against your wedding, conference, or connecting departure deadline.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="relative rounded-3xl border border-[#dfc89d] bg-gradient-to-b from-white to-[#fbf7ee] p-7 shadow-md transition-all hover:-translate-y-1 hover:border-amber-600 hover:shadow-xl">
            <div className="absolute top-3 right-3 text-amber-400/40">
              <LotusIcon className="h-6 w-6" />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800">
              <div className="flex items-center gap-1">
                <VimanaIcon className="h-5 w-5" />
                <RajGadiIcon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-5 font-royal-title text-lg font-bold text-[#2a1610]">
              २. गगन व लोह मार्ग संगम
            </h3>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Multimodal Synchrony
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#6e5246]">
              Harmonize IndiGo, Air India, and Vistara flights with Vande Bharat and Rajdhani express trains to craft routes ordinary travel websites can never conceive.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="relative rounded-3xl border border-[#dfc89d] bg-gradient-to-b from-white to-[#fbf7ee] p-7 shadow-md transition-all hover:-translate-y-1 hover:border-amber-600 hover:shadow-xl">
            <div className="absolute top-3 right-3 text-amber-400/40">
              <LotusIcon className="h-6 w-6" />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-800">
              <RoyalSealIcon className="h-7 w-7 text-emerald-700" />
            </div>
            <h3 className="mt-5 font-royal-title text-lg font-bold text-[#2a1610]">
              ३. काल गति पूर्वाभास
            </h3>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Delay Stress Simulation
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#6e5246]">
              Simulate 30, 60, or 90-minute delays before you book. Inspect cascading impact on connecting trains or airports and explore fallback paths instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Royal Proclamation CTA */}
      <section className="relative mt-20 overflow-hidden rounded-3xl border-2 border-[#dfc89d] bg-gradient-to-br from-[#2a130d] via-[#3a1b12] to-[#200d08] p-8 text-center text-amber-100 shadow-2xl sm:p-14">
        {/* Ornate corner flourishes in gold */}
        <div className="absolute top-3 left-3 text-amber-400/60">
          <OrnateCorner className="w-6 h-6" />
        </div>
        <div className="absolute top-3 right-3 rotate-90 text-amber-400/60">
          <OrnateCorner className="w-6 h-6" />
        </div>
        <div className="absolute bottom-3 left-3 -rotate-90 text-amber-400/60">
          <OrnateCorner className="w-6 h-6" />
        </div>
        <div className="absolute bottom-3 right-3 rotate-180 text-amber-400/60">
          <OrnateCorner className="w-6 h-6" />
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
          <RathChakraIcon className="h-8 w-8" />
        </div>

        <h2 className="mt-4 font-royal-title text-2xl font-bold tracking-wide text-amber-200 sm:text-4xl">
          आरंभ करें अपनी मंगलमय यात्रा
        </h2>
        <p className="font-serif-royal mt-1 text-sm sm:text-base text-amber-300/90 font-medium">
          Ready to embark with confidence and timely arrival across all Indian hubs?
        </p>

        <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-amber-100/70 leading-relaxed">
          Specify your destination, your sacred arrive-by deadline, and let the Sarthi calculate the best routes across 7 major metro crossroads.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/search"
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-9 py-3.5 font-royal-sub text-sm font-bold text-[#2a130d] shadow-lg shadow-amber-900/40 transition-all hover:scale-105 hover:bg-amber-400 active:scale-95"
          >
            <span>मार्ग अन्वेषक खोलें • OPEN ROUTE FINDER</span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
