"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/data/locations";
import { OPTIMIZATION_LABELS } from "@/lib/config/app";
import { formatInr } from "@/lib/format";
import { addDaysIsoDate, todayIsoDate } from "@/lib/time";
import type { OptimizationMode, SearchInput } from "@/lib/types/travel";
import { searchInputToParams } from "@/lib/validation/search";
import { SwapIcon } from "@/components/icons";
import {
  RathChakraIcon,
  OrnateCorner,
  LotusIcon,
  DiyaIcon,
  VimanaIcon,
  RajGadiIcon,
} from "@/components/traditional-icons";

interface SearchFormProps {
  initialValues?: Partial<SearchInput>;
  onSearch?: (input: SearchInput) => void;
  isLoading?: boolean;
  className?: string;
  navigateOnSubmit?: boolean;
}

// Traditional Hindi-Sanskrit labels for Indian Cities
const CITY_HINDI_NAMES: Record<string, string> = {
  bangalore: "बेंगलुरु (Kalyan Nagar)",
  delhi: "दिल्ली (Indraprastha)",
  mumbai: "मुंबई (Mayapuri)",
  hyderabad: "हैदराबाद (Bhagyanagar)",
  chennai: "चेन्नई (Madraspatnam)",
  pune: "पुणे (Punawadi)",
  kolkata: "कोलकाता (Kalikata)",
};

const TRADITIONAL_OPTIMIZATION_MAP: Record<OptimizationMode, { hi: string; en: string; icon: string }> = {
  best_balance: { hi: "संतुलित मार्ग", en: "Best Balance", icon: "⚖️" },
  fastest: { hi: "तीव्रगामी", en: "Fastest Speed", icon: "⚡" },
  cheapest: { hi: "मितव्ययी", en: "Pocket Friendly", icon: "💰" },
  highest_confidence: { hi: "परम विश्वास", en: "Highest Safety", icon: "🛡️" },
};

export function SearchForm({
  initialValues,
  onSearch,
  isLoading = false,
  className = "",
  navigateOnSubmit = false,
}: SearchFormProps) {
  const router = useRouter();

  const today = todayIsoDate();
  const tomorrow = addDaysIsoDate(today, 1);
  const dayAfter = addDaysIsoDate(today, 2);

  const [origin, setOrigin] = useState(initialValues?.origin ?? "bangalore");
  const [destination, setDestination] = useState(
    initialValues?.destination ?? "delhi",
  );
  const [date, setDate] = useState(initialValues?.date ?? tomorrow);
  const [arriveByTime, setArriveByTime] = useState(() => {
    if (initialValues?.arriveBy && initialValues.arriveBy.includes("T")) {
      const match = initialValues.arriveBy.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
    }
    return "22:00";
  });
  const [budget, setBudget] = useState(initialValues?.budget ?? 25000);
  const [optimization, setOptimization] = useState<OptimizationMode>(
    initialValues?.optimization ?? "best_balance",
  );
  const [includeMissedDeadline, setIncludeMissedDeadline] = useState(
    initialValues?.includeMissedDeadline ?? false,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (origin === destination) {
      setFormError("प्रारंभ स्थल और गंतव्य स्थल भिन्न होने चाहिए (Origin and destination must be different).");
      return;
    }

    const arriveByIso = `${date}T${arriveByTime}:00+05:30`;

    const searchInput: SearchInput = {
      origin,
      destination,
      date,
      arriveBy: arriveByIso,
      budget: Number(budget),
      optimization,
      includeMissedDeadline,
    };

    if (onSearch) {
      onSearch(searchInput);
    }

    if (navigateOnSubmit) {
      const params = searchInputToParams(searchInput);
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative rounded-3xl border-2 border-[#dfc89d] bg-gradient-to-b from-[#fffefc] to-[#fbf6ea] p-6 shadow-2xl transition-all sm:p-8 ${className}`}
      aria-label="Travel Route Search Form"
    >
      {/* Ornate Corner Flourishes */}
      <div className="absolute top-2 left-2 pointer-events-none">
        <OrnateCorner className="w-5 h-5 text-amber-600/70" />
      </div>
      <div className="absolute top-2 right-2 rotate-90 pointer-events-none">
        <OrnateCorner className="w-5 h-5 text-amber-600/70" />
      </div>
      <div className="absolute bottom-2 left-2 -rotate-90 pointer-events-none">
        <OrnateCorner className="w-5 h-5 text-amber-600/70" />
      </div>
      <div className="absolute bottom-2 right-2 rotate-180 pointer-events-none">
        <OrnateCorner className="w-5 h-5 text-amber-600/70" />
      </div>

      {/* Form Header Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#ebd8b0] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
            <RathChakraIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-royal-title text-base font-bold text-[#8e1b1b] sm:text-lg">
              यात्रा फ़रमान • YATRA FARMAN
            </h2>
            <p className="text-[11px] font-medium text-[#74584c]">
              Select your departure and arrival deadline for an auspicious multimodal journey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs text-amber-900">
          <VimanaIcon className="h-4 w-4 text-[#8e1b1b]" />
          <span>विमान (Sky)</span>
          <span className="text-amber-400 font-bold">+</span>
          <RajGadiIcon className="h-4 w-4 text-amber-700" />
          <span>रेल (Railway)</span>
        </div>
      </div>

      {formError && (
        <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm font-medium text-red-800">
          {formError}
        </div>
      )}

      {/* Origin, Destination & Swap */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,auto,1fr]">
        <div className="space-y-1.5">
          <label
            htmlFor="origin-city"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6e5246]"
          >
            <span>प्रस्थान स्थल (From)</span>
            <span className="text-[10px] text-amber-700 font-serif-royal">आरंभ धाम</span>
          </label>
          <div className="relative">
            <select
              id="origin-city"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#dfc89d] bg-white px-4 py-3 text-sm font-semibold text-[#2a1610] shadow-inner transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-400/40 focus:outline-none"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} — {CITY_HINDI_NAMES[city.id] || city.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-700">
              ▼
            </div>
          </div>
        </div>

        <div className="flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            title="स्थान अदल-बदल (Swap cities)"
            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfc89d] bg-[#fbf6ea] text-amber-800 shadow-sm transition-all hover:border-amber-600 hover:bg-amber-100 hover:text-[#8e1b1b] active:scale-95"
          >
            <SwapIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="destination-city"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6e5246]"
          >
            <span>गंतव्य स्थल (To)</span>
            <span className="text-[10px] text-amber-700 font-serif-royal">लक्ष्य धाम</span>
          </label>
          <div className="relative">
            <select
              id="destination-city"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#dfc89d] bg-white px-4 py-3 text-sm font-semibold text-[#2a1610] shadow-inner transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-400/40 focus:outline-none"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} — {CITY_HINDI_NAMES[city.id] || city.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-700">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Date, Arrive-By Deadline & Budget */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Travel Date */}
        <div className="space-y-1.5 rounded-2xl border border-[#ebd8b0] bg-white/80 p-3.5 shadow-sm">
          <label
            htmlFor="travel-date"
            className="block text-xs font-bold uppercase tracking-wider text-[#6e5246]"
          >
            यात्रा तिथि (Travel Date)
          </label>
          <input
            id="travel-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-[#dfc89d] bg-[#fdfaf4] px-3 py-2 text-sm font-semibold text-[#2a1610] focus:border-amber-600 focus:outline-none"
          />
          <div className="flex gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setDate(today)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                date === today
                  ? "bg-[#8e1b1b] text-white"
                  : "bg-amber-100/70 text-amber-900 hover:bg-amber-200"
              }`}
            >
              आज (Today)
            </button>
            <button
              type="button"
              onClick={() => setDate(tomorrow)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                date === tomorrow
                  ? "bg-[#8e1b1b] text-white"
                  : "bg-amber-100/70 text-amber-900 hover:bg-amber-200"
              }`}
            >
              कल (Tmrw)
            </button>
            <button
              type="button"
              onClick={() => setDate(dayAfter)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                date === dayAfter
                  ? "bg-[#8e1b1b] text-white"
                  : "bg-amber-100/70 text-amber-900 hover:bg-amber-200"
              }`}
            >
              +२ दिन (+2D)
            </button>
          </div>
        </div>

        {/* Must Arrive By Deadline */}
        <div className="space-y-1.5 rounded-2xl border border-[#ebd8b0] bg-white/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <label
              htmlFor="arrive-by-time"
              className="block text-xs font-bold uppercase tracking-wider text-[#6e5246]"
            >
              पहुँचने की अंतिम सीमा (Deadline)
            </label>
            <span className="text-[10px] font-bold text-[#8e1b1b]">अति महत्वपूर्ण</span>
          </div>
          <input
            id="arrive-by-time"
            type="time"
            value={arriveByTime}
            onChange={(e) => setArriveByTime(e.target.value)}
            className="w-full rounded-lg border border-[#dfc89d] bg-[#fdfaf4] px-3 py-2 text-sm font-semibold text-[#2a1610] focus:border-amber-600 focus:outline-none"
          />
          <div className="flex gap-1.5 pt-1">
            {["18:00", "20:00", "22:00", "23:59"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setArriveByTime(preset)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                  arriveByTime === preset
                    ? "bg-[#8e1b1b] text-white"
                    : "bg-amber-100/70 text-amber-900 hover:bg-amber-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="space-y-1.5 rounded-2xl border border-[#ebd8b0] bg-white/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <label
              htmlFor="budget-input"
              className="block text-xs font-bold uppercase tracking-wider text-[#6e5246]"
            >
              अधिकतम व्यय (Max Budget)
            </label>
            <span className="font-royal-title text-sm font-bold text-[#8e1b1b]">
              {formatInr(Number(budget))}
            </span>
          </div>
          <input
            id="budget-input"
            type="range"
            min={1500}
            max={50000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-[#8e1b1b]"
          />
          <div className="flex justify-between text-[11px] font-semibold text-[#74584c]">
            <span>₹१,५००</span>
            <span>₹२५,०००</span>
            <span>₹५०,०००</span>
          </div>
        </div>
      </div>

      {/* Optimization Mode Pills */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6e5246]">
            सारथी प्राथमिकता (Sarthi Guidance Priority)
          </label>
          <span className="text-[11px] text-[#74584c]">Choose your journey ethos</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(OPTIMIZATION_LABELS) as OptimizationMode[]).map((mode) => {
            const trad = TRADITIONAL_OPTIMIZATION_MAP[mode];
            const isSelected = optimization === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setOptimization(mode)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                  isSelected
                    ? "border-[#8e1b1b] bg-[#8e1b1b]/10 text-[#8e1b1b] ring-2 ring-[#8e1b1b]/30 font-bold shadow-sm"
                    : "border-[#dfc89d] bg-white text-[#5e4338] hover:border-amber-500 hover:bg-amber-50/50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{trad.icon}</span>
                  <span className="font-devanagari text-xs font-semibold">{trad.hi}</span>
                </div>
                <span className="text-[10px] text-[#74584c]">{trad.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deadline Filter Checkbox & Submit Button */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#ebd8b0] pt-5 sm:flex-row">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#5e4338] hover:text-[#2a1610]">
          <input
            type="checkbox"
            checked={includeMissedDeadline}
            onChange={(e) => setIncludeMissedDeadline(e.target.checked)}
            className="h-4 w-4 rounded border-[#dfc89d] text-[#8e1b1b] accent-[#8e1b1b] focus:ring-[#8e1b1b]"
          />
          <span className="text-xs sm:text-sm">
            विलंबित मार्ग भी दिखाएं (Show routes that arrive after deadline)
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          id="search-routes-btn"
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#8e1b1b] via-amber-700 to-[#8e1b1b] px-8 py-3.5 text-base font-bold text-amber-50 shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? (
            <>
              <svg className="h-5 w-5 animate-spin text-amber-200" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>सारथी गणना कर रहा है...</span>
            </>
          ) : (
            <>
              <DiyaIcon className="h-4 w-4 text-amber-300" />
              <span className="font-royal-sub tracking-wider">
                शुभ मार्ग अन्वेषण करें • FIND ROUTES
              </span>
              <span className="text-amber-300 transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
