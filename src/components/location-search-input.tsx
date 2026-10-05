"use client";

import React, { useState, useRef, useEffect } from "react";
import { CityHub } from "@/lib/types";
import { searchAllLocations, resolveCityHub } from "@/lib/data-lookup";
import { MapPin, Plane, Train, Bus, Search, X, Check } from "lucide-react";

interface LocationSearchInputProps {
  id: string;
  label: string;
  value: string; // selected city id or code
  onChange: (cityId: string) => void;
  placeholder?: string;
  iconColor?: string;
}

export function LocationSearchInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Search city, airport, or station...",
  iconColor = "text-vermilion",
}: LocationSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Selected city object resolved dynamically
  const selectedCity = value ? resolveCityHub(value) : undefined;
  const initialQuery = selectedCity ? `${selectedCity.name} (${selectedCity.state})` : "";
  const [query, setQuery] = useState(initialQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync query when value prop changes externally
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (selectedCity) {
      setQuery(`${selectedCity.name} (${selectedCity.state})`);
    }
  }

  // Filter cities dynamically across all 8,966 stations + 121 airports + city hubs
  const filteredCities = searchAllLocations(query, 15);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedCity) {
          setQuery(`${selectedCity.name} (${selectedCity.state})`);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCity]);

  const handleSelect = (city: CityHub) => {
    onChange(city.id);
    setQuery(`${city.name} (${city.state})`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 font-display text-xs font-bold tracking-wider text-ink uppercase"
      >
        <MapPin className={`h-4 w-4 ${iconColor}`} />
        {label}
      </label>

      <div className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={`${id}-popup`}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full min-h-[44px] rounded-2xl border-2 border-amber-300 bg-paper-light pl-4 pr-10 py-3 text-sm font-bold text-ink transition focus:border-vermilion focus:outline-none focus:ring-2 focus:ring-vermilion/20 shadow-yatra-sm placeholder:text-ink-muted/60 placeholder:font-normal"
          />

          {query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location search"
              className="absolute right-3 p-1.5 text-ink-muted hover:text-ink cursor-pointer rounded-full transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Search className="absolute right-3.5 h-4 w-4 text-ink-muted pointer-events-none" />
          )}
        </div>

        {/* Selected city transport context */}
        {selectedCity && !isOpen && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1.5 text-[10px] font-semibold text-ink-muted">
            <span className="inline-flex items-center gap-1"><Plane className="h-3 w-3 text-indigo" />{selectedCity.airportCode || "No airport"}</span>
            <span aria-hidden="true" className="text-gold-line">·</span>
            <span className="inline-flex items-center gap-1"><Train className="h-3 w-3 text-vermilion" />{selectedCity.stationCode || "No station"}</span>
            <span aria-hidden="true" className="text-gold-line">·</span>
            <span className="inline-flex items-center gap-1"><Bus className="h-3 w-3 text-peacock" />Bus</span>
          </div>
        )}

        {/* Dynamic Dropdown List */}
        {isOpen && (
          <div
            id={`${id}-popup`}
            role="listbox"
            className="absolute z-50 mt-1.5 max-h-72 w-full overflow-y-auto rounded-2xl border-2 border-amber-400 bg-paper-light p-2 shadow-yatra-lg transition-all"
          >
            {filteredCities.length === 0 ? (
              <div className="p-4 text-center text-xs text-ink-muted font-medium">
                No matching Indian transport hubs found for &quot;{query}&quot;.
                <br />
                Try typing a city name, airport code (e.g. BLR, DEL, VNS) or station code.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCities.map((city) => {
                  const isSelected = selectedCity?.id === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(city)}
                      className={`flex w-full min-h-[48px] flex-col gap-1 rounded-xl p-3 text-left transition cursor-pointer ${
                        isSelected
                          ? "bg-paper-deep border-2 border-amber-400 text-ink font-bold"
                          : "hover:bg-paper-deep/60 text-ink"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                          {city.name}
                          <span className="text-xs font-semibold text-ink-muted">({city.state})</span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-vermilion font-bold" />}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted font-medium pt-0.5">
                        <span className="inline-flex items-center gap-1 text-indigo bg-indigo-100/50 px-1.5 py-0.5 rounded border border-indigo-200">
                          <Plane className="h-3 w-3 text-indigo" /> {city.airportCode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-vermilion bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-300">
                          <Train className="h-3 w-3 text-vermilion" /> {city.stationCode} ({city.zone || "IR"})
                        </span>
                        <span className="inline-flex items-center gap-1 text-peacock bg-emerald-100/50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <Bus className="h-3 w-3 text-peacock" /> {city.busTerminalCode}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
