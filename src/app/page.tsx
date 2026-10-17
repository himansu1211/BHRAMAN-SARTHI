"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search/search-form";
import { searchInputToParams } from "@/lib/validation/search";
import { addDaysIsoDate, todayIsoDate } from "@/lib/time";
import type { SearchInput } from "@/lib/types/travel";
import { FlightIcon, TrainIcon, ShieldCheckIcon, ClockIcon, SparklesIcon } from "@/components/icons";

const POPULAR_ROUTES = [
  { origin: "bangalore", destination: "delhi", label: "Bangalore → Delhi", badge: "Most Popular" },
  { origin: "delhi", destination: "mumbai", label: "Delhi → Mumbai", badge: "High Speed Corridor" },
  { origin: "mumbai", destination: "bangalore", label: "Mumbai → Bangalore", badge: "Business Direct" },
  { origin: "hyderabad", destination: "delhi", label: "Hyderabad → Delhi", badge: "Fastest Combos" },
  { origin: "chennai", destination: "bangalore", label: "Chennai → Bangalore", badge: "Vande Bharat + Flights" },
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
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-20">
      {/* Hero Section */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
          <SparklesIcon className="h-3.5 w-3.5" />
          <span>Deadline-Aware Multimodal Travel</span>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Get there on time.
          <br />
          <span className="bg-gradient-to-r from-accent to-teal-500 bg-clip-text text-transparent">
            We&apos;ll find the smartest route.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Compare flights and trains side-by-side. Rank options by your arrival deadline,
          layover buffers, and realistic confidence — not price alone.
        </p>

        {/* Popular Route Chips */}
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-muted mr-1">Popular corridors:</span>
          {POPULAR_ROUTES.map((route) => (
            <button
              key={route.label}
              type="button"
              onClick={() => handleQuickRoute(route.origin, route.destination)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition-all hover:border-accent hover:bg-accent/5 hover:text-accent"
            >
              <span>{route.label}</span>
              <span className="text-[10px] text-muted">({route.badge})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Interactive Search Form */}
      <section className="mt-10">
        <SearchForm navigateOnSubmit={true} />
      </section>

      {/* Value Pillars / Feature Grid */}
      <section className="mt-20 border-t border-border pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why Deadline-Aware Routing Matters
          </h2>
          <p className="mt-2 text-sm text-muted">
            Cheap tickets are useless if you miss the wedding, the conference, or your connecting flight.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/40 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ClockIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              Arrive-By Deadlines
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Specify your event time. We prioritize routes that offer a safe cushion before your deadline, highlighting risky or tight layovers.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/40 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <div className="flex gap-1">
                <FlightIcon className="h-5 w-5" />
                <TrainIcon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              Flights + Trains Combined
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Intelligently connect IndiGo, Air India, Vistara with Vande Bharat and Rajdhani express trains to unlock options other search engines miss.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/40 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              What-If Delay Simulator
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Stress-test routes before you commit. See what happens if your first leg is delayed by 30 or 60 minutes, and view pre-computed alternative routes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 rounded-3xl border border-accent/20 bg-gradient-to-r from-accent/10 via-surface to-teal-500/10 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ready to plan with confidence?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          Select your destination and deadline to view optimized itineraries across all 7 Indian metro hubs.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/search"
            className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-xl"
          >
            Open Route Finder →
          </Link>
        </div>
      </section>
    </main>
  );
}
