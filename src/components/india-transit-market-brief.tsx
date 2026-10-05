"use client";

import React, { useState } from "react";
import { Train, Plane, Bus, BarChart3, AlertCircle, TrendingUp, ShieldAlert, Layers, CheckCircle2 } from "lucide-react";
import { KolamDivider } from "./ornaments";

export function IndiaTransitMarketBrief() {
  const [activeTab, setActiveTab] = useState<"snapshot" | "rail" | "aviation" | "bus" | "economics" | "architecture">("snapshot");

  return (
    <div className="rounded-3xl border-2 border-double border-amber-400 bg-paper-light p-5 sm:p-6 shadow-yatra-sm space-y-6">
      {/* Section Header */}
      <div className="border-b-2 border-amber-300/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-vermilion px-2.5 py-0.5 font-display text-[10px] font-bold text-paper-light uppercase tracking-wider shadow-yatra-sm">
              Market Intelligence 2026
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink">
              🇮🇳 India Travel & Transportation Market Brief
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-peacock bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
            PIB • DGCA • VIDEC Data
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
          Comprehensive market sizing across Indian Railways, Domestic Aviation, and Intercity Buses with daily/monthly passenger volumes, revenue vs. net profit bifurcation, and ticket economics.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-amber-300/60 pb-3">
        {[
          { id: "snapshot", label: "Executive Snapshot", icon: BarChart3 },
          { id: "rail", label: "🚆 Indian Railways", icon: Train },
          { id: "aviation", label: "✈️ Domestic Aviation", icon: Plane },
          { id: "bus", label: "🚌 Intercity Buses", icon: Bus },
          { id: "economics", label: "💰 Revenue vs Profit", icon: TrendingUp },
          { id: "architecture", label: "🧭 Search Engine Architecture", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer min-h-[36px] ${
                isActive
                  ? "bg-vermilion text-paper-light shadow-yatra-sm"
                  : "bg-paper-deep text-ink-muted hover:bg-amber-100 hover:text-ink border border-amber-300/70"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE SNAPSHOT & SIDE-BY-SIDE MATRIX */}
      {activeTab === "snapshot" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top 3 Pillar Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-vermilion/30 bg-orange-50/60 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-vermilion uppercase">
                <Train className="h-4 w-4" />
                <span>Indian Railways</span>
              </div>
              <div className="font-mono text-2xl font-black text-ink">741 Cr</div>
              <div className="text-[11px] font-semibold text-ink-muted">
                Annual passenger journeys (~2.03 Cr/day)
              </div>
              <div className="mt-2 pt-2 border-t border-vermilion/20 text-[11px] font-bold text-vermilion">
                ₹80,000 Cr passenger revenue (~₹6,667 Cr/mo)
              </div>
            </div>

            <div className="rounded-2xl border border-indigo/30 bg-indigo-50/60 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo uppercase">
                <Plane className="h-4 w-4" />
                <span>Domestic Aviation</span>
              </div>
              <div className="font-mono text-2xl font-black text-ink">16.55 Cr</div>
              <div className="text-[11px] font-semibold text-ink-muted">
                Departing air passengers (~4.53 Lakh/day)
              </div>
              <div className="mt-2 pt-2 border-t border-indigo/20 text-[11px] font-bold text-indigo">
                ₹1.706 Lakh Cr operating revenue (~₹14,215 Cr/mo)
              </div>
            </div>

            <div className="rounded-2xl border border-peacock/30 bg-emerald-50/60 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-peacock uppercase">
                <Bus className="h-4 w-4" />
                <span>Intercity Buses</span>
              </div>
              <div className="font-mono text-2xl font-black text-ink">₹51,144 Cr</div>
              <div className="text-[11px] font-semibold text-ink-muted">
                FY25P market value (₹55,235 Cr FY26P)
              </div>
              <div className="mt-2 pt-2 border-t border-peacock/20 text-[11px] font-bold text-peacock">
                ~₹140 Cr/day • ~100k daily intercity routes
              </div>
            </div>
          </div>

          {/* Side-by-Side Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-amber-300 bg-paper-deep/50 shadow-yatra-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-300 bg-paper-deep text-ink uppercase tracking-wider font-display text-[10px]">
                  <th className="p-3">Metric</th>
                  <th className="p-3">🚆 Indian Railways</th>
                  <th className="p-3">✈️ Domestic Aviation</th>
                  <th className="p-3">🚌 Intercity Buses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-300/60 text-ink">
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Annual Volume</td>
                  <td className="p-3 font-mono font-bold text-vermilion">741 crore journeys</td>
                  <td className="p-3 font-mono font-bold text-indigo">16.55 crore departures</td>
                  <td className="p-3 text-ink-muted italic">Fragmented (no national count)</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Daily Volume</td>
                  <td className="p-3 font-mono font-bold">~2.03 crore / day</td>
                  <td className="p-3 font-mono font-bold">~4.53 lakh / day</td>
                  <td className="p-3 text-ink-muted">~100,000 services / day</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Monthly Volume</td>
                  <td className="p-3 font-mono">~61.75 crore / month</td>
                  <td className="p-3 font-mono">~1.38 crore / month</td>
                  <td className="p-3 text-ink-muted">—</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Annual Market / Revenue</td>
                  <td className="p-3 font-mono font-bold text-vermilion">₹80,000 Cr passenger rev</td>
                  <td className="p-3 font-mono font-bold text-indigo">₹1.706 Lakh Cr airline op rev*</td>
                  <td className="p-3 font-mono font-bold text-peacock">₹51,144 Cr (FY25P) / ₹55,235 Cr (FY26P)</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Monthly Run Rate</td>
                  <td className="p-3 font-mono">~₹6,667 crore</td>
                  <td className="p-3 font-mono">~₹14,215 crore*</td>
                  <td className="p-3 font-mono">~₹4,262 crore</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Daily Run Rate</td>
                  <td className="p-3 font-mono">~₹219 crore / day</td>
                  <td className="p-3 font-mono">~₹466 crore / day*</td>
                  <td className="p-3 font-mono">~₹140 crore / day</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Typical Pricing Behavior</td>
                  <td className="p-3">Distance & class based (₹1080 avg rev)</td>
                  <td className="p-3">Highly dynamic yield management</td>
                  <td className="p-3">Distance & bus tier (Seater/AC/Sleeper)</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">Online Penetration</td>
                  <td className="p-3 font-semibold text-peacock">Very High (IRCTC dominant)</td>
                  <td className="p-3 font-semibold text-peacock">Very High (&gt;90% OTA/Direct)</td>
                  <td className="p-3 font-semibold text-amber-700">24.3% (FY24 ₹11,523 Cr online)</td>
                </tr>
                <tr className="hover:bg-amber-100/50">
                  <td className="p-3 font-bold text-ink-muted">National Passenger DB</td>
                  <td className="p-3 text-peacock font-bold">Strong (CRIS / NTES)</td>
                  <td className="p-3 text-peacock font-bold">Strong (DGCA / AAI)</td>
                  <td className="p-3 text-amber-700 font-bold">Fragmented (4,500+ private + 25 RTCs)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-ink-muted leading-normal">
            *Note: Airline operating revenue covers all scheduled airline operations (including ancillary services, international ops, and cargo), and is not solely domestic passenger tickets. Data sourced from Ministry of Railways FY26 announcements, Civil Aviation Statistics FY25, and VIDEC India Travel Market Report.
          </p>
        </div>
      )}

      {/* TAB 2: INDIAN RAILWAYS IN-DEPTH */}
      {activeTab === "rail" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-vermilion/30 bg-orange-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-vermilion uppercase tracking-wide">
                Volume & Passenger Economics (FY2025-26)
              </span>
              <span className="text-[10px] font-bold text-ink-muted">Ministry of Railways Official Data</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Annual Volume</span>
                <div className="font-mono text-xl font-bold text-ink">741 Crore</div>
                <span className="text-[10px] text-emerald-700 font-bold">+3.54% YoY (716 Cr prior)</span>
              </div>
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Daily Passengers</span>
                <div className="font-mono text-xl font-bold text-vermilion">2.03 Crore / day</div>
                <span className="text-[10px] text-ink-muted font-mono">~20.3 million/day</span>
              </div>
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Passenger Revenue</span>
                <div className="font-mono text-xl font-bold text-ink">₹80,000 Crore</div>
                <span className="text-[10px] text-emerald-700 font-bold">~₹219 Cr/day (~₹9.13 Cr/hr)</span>
              </div>
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Implied Revenue / Pax</span>
                <div className="font-mono text-xl font-bold text-peacock">≈ ₹1,080</div>
                <span className="text-[10px] text-ink-muted">Across all reserved & unreserved</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-paper-deep p-4 space-y-2 text-xs leading-relaxed">
            <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
              Important Distinction: Passenger Revenue ≠ Operating Profit
            </h4>
            <p className="text-ink-muted">
              ₹80,000 crore represents <strong>passenger earnings</strong> across all passenger categories. In FY2024-25, Indian Railways recorded total <strong>Gross Traffic Receipts of ₹2,65,114 crore</strong> (including freight, parcels, catering, and advertising) with an <strong>Operating Ratio of 98.22%</strong> and an overall surplus of approximately ₹2,660 crore. Massive infrastructure, maintenance, traction energy, and pension commitments absorb most passenger gross earnings.
            </p>
            <div className="pt-2">
              <span className="font-bold text-ink block mb-1">Ticket Class Hierarchy in India:</span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-paper-light border border-amber-300 font-semibold">Unreserved/General (Very Low)</span>
                <span className="px-2 py-0.5 rounded bg-paper-light border border-amber-300 font-semibold">Sleeper SL (Low)</span>
                <span className="px-2 py-0.5 rounded bg-paper-light border border-amber-300 font-semibold">AC 3-Tier 3A (Mid-Range)</span>
                <span className="px-2 py-0.5 rounded bg-paper-light border border-amber-300 font-semibold">AC 2-Tier 2A (Higher)</span>
                <span className="px-2 py-0.5 rounded bg-paper-light border border-amber-300 font-semibold">AC 1-Tier 1A (Premium)</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-400 font-bold text-vermilion">Vande Bharat / Rajdhani / Shatabdi (Premium)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOMESTIC AVIATION */}
      {activeTab === "aviation" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-indigo/30 bg-indigo-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-indigo uppercase tracking-wide">
                India Domestic Civil Aviation (FY2024-25)
              </span>
              <span className="text-[10px] font-bold text-ink-muted">Civil Aviation Statistics</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-indigo-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Annual Departures</span>
                <div className="font-mono text-xl font-bold text-indigo">16.55 Crore</div>
                <span className="text-[10px] text-emerald-700 font-bold">+7.7% YoY (153.7M prior)</span>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Daily Passengers</span>
                <div className="font-mono text-xl font-bold text-indigo">~4.53 Lakh / day</div>
                <span className="text-[10px] text-ink-muted font-mono">453,425 avg/day</span>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Monthly Volume</span>
                <div className="font-mono text-xl font-bold text-ink">~1.38 Crore / mo</div>
                <span className="text-[10px] text-ink-muted font-mono">13.79 million/month</span>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">International Traffic</span>
                <div className="font-mono text-xl font-bold text-ink">7.39 Crore</div>
                <span className="text-[10px] text-ink-muted">23.94 Cr combined total</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-paper-deep p-4 space-y-2 text-xs leading-relaxed">
            <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
              Airline Financial Reality: Operating Revenue vs Net Margin
            </h4>
            <p className="text-ink-muted">
              Scheduled Indian airlines collectively reported <strong>₹1,70,585 crore in operating revenue</strong> against <strong>₹1,67,248 crore in operating expenses</strong>, generating an aggregate operating result of approximately <strong>₹3,337 crore</strong>. However, due to extraordinary items, aircraft leases, and currency fluctuations, the sector posted an <strong>aggregate net loss of approximately -₹5,290 crore</strong> for FY2024-25.
            </p>
            <div className="rounded-xl border border-indigo-200 bg-paper-light p-3 text-[11px] text-ink space-y-1">
              <strong className="text-indigo block">✈️ Airline Ticket Price Composition:</strong>
              <p className="text-ink-muted">
                Base Fare + Airline Fees + Airport Charges (UDF/PSF) + GST & Aviation Fuel Taxes. Domestic airfares are completely market-determined; algorithms continuously shift prices based on seat inventory, booking horizon, time of day, and corridor demand.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERCITY BUSES */}
      {activeTab === "bus" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-peacock/30 bg-emerald-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-peacock uppercase tracking-wide">
                India Intercity Bus Market (VIDEC Research)
              </span>
              <span className="text-[10px] font-bold text-ink-muted">Connecting 150km+ Corridors</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">FY25 Market Value</span>
                <div className="font-mono text-xl font-bold text-peacock">₹51,144 Crore</div>
                <span className="text-[10px] text-ink-muted">~₹140 Cr/day (~₹4,262 Cr/mo)</span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">FY26 Projected</span>
                <div className="font-mono text-xl font-bold text-peacock">₹55,235 Crore</div>
                <span className="text-[10px] text-emerald-700 font-bold">~₹151 Cr/day (~₹4,603 Cr/mo)</span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Daily Services</span>
                <div className="font-mono text-xl font-bold text-ink">~100,000</div>
                <span className="text-[10px] text-ink-muted">4,500+ private operators</span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-paper-light p-3">
                <span className="text-[10px] font-bold text-ink-muted uppercase">Online Penetration</span>
                <div className="font-mono text-xl font-bold text-peacock">24.3%</div>
                <span className="text-[10px] text-ink-muted">₹11,523 Cr online in FY24</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-paper-deep p-4 space-y-2 text-xs leading-relaxed">
            <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
              The Fragmentation Challenge & Massive Aggregation Upside
            </h4>
            <p className="text-ink-muted">
              Unlike Rail (CRIS/IRCTC) and Aviation (DGCA/AAI), India has no single consolidated national passenger census for intercity buses. Over 25 State Road Transport Corporations (KSRTC, MSRTC, APSRTC, TSRTC, TNSTC, UPSRTC, GSRTC, etc.) operate alongside 4,500+ private fleet owners. The online booking penetration (24.3%) is accelerating swiftly towards 40%+, making intercity bus integration the highest-margin greenfield opportunity for multimodal booking engines.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: REVENUE VS PROFIT VS GBV */}
      {activeTab === "economics" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-vermilion uppercase">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Critical Financial Definitions for Travel Tech</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              In investor discussions, never conflate <strong>Gross Booking Value (GBV)</strong>, <strong>Operating Revenue</strong>, and <strong>Net Profit</strong>. Each transit segment behaves fundamentally differently:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3 space-y-1">
                <strong className="text-ink font-bold block">1. Gross Booking Value (GBV)</strong>
                <p className="text-ink-muted text-[11px]">
                  Total currency value of tickets booked across platforms. In India: ₹80k Cr (rail passenger), ₹1.7L Cr (aviation operating), ₹51k Cr (intercity bus GBV).
                </p>
              </div>
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3 space-y-1">
                <strong className="text-ink font-bold block">2. Platform Net Revenue</strong>
                <p className="text-ink-muted text-[11px]">
                  Take-rate commission + convenience fees + ancillary travel insurance minus gateway costs and discounts (e.g. 10 lakh bookings × ₹2,500 ticket @ 3% take rate = ₹7.5 Cr net revenue).
                </p>
              </div>
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3 space-y-1">
                <strong className="text-ink font-bold block">3. Carrier Operating Revenue</strong>
                <p className="text-ink-muted text-[11px]">
                  Total operational earnings recognized by carriers (e.g. airlines recognized ₹1,70,585 Cr operating revenue in FY25).
                </p>
              </div>
              <div className="rounded-xl border border-amber-300 bg-paper-light p-3 space-y-1">
                <strong className="text-ink font-bold block">4. Operating Profit vs Net Profit</strong>
                <p className="text-ink-muted text-[11px]">
                  Operating profit = Operating revenue minus operating costs. Net profit = after taxes, depreciation, and interest (e.g. airlines made +₹3,337 Cr operating profit but -₹5,290 Cr net loss).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SEARCH ENGINE ARCHITECTURE */}
      {activeTab === "architecture" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 space-y-2 text-xs leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-peacock uppercase text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Operational Booking Engine vs Macro Market Statistics</span>
            </div>
            <p className="text-ink-muted">
              While annual macroeconomic statistics prove the massive market opportunity, an operational search engine requires granular, date-specific, and verified corridor records rather than high-level averages.
            </p>
            <div className="rounded-xl border border-amber-300 bg-paper-light p-3 text-[11px] font-mono space-y-1">
              <div className="text-ink-muted">Operational Search Data Model (BHRAMAN SARTHI Core):</div>
              <div className="text-vermilion font-bold">
                Origin (BLR) ➔ Destination (DEL) | Date: 2026-10-15 | Airline: Akasa QP 1823 | Fare: ₹10,877 | Status: Verified
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-paper-deep p-4 space-y-2 text-xs">
            <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
              Official Data Sources & Carrier Coverage
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="rounded-xl border border-amber-200 bg-paper-light p-2.5 space-y-1">
                <strong className="text-vermilion font-bold block">🚆 Railways Ecosystem</strong>
                <p className="text-ink-muted">Indian Railways, IRCTC, NTES Real-Time Train Status, 16 Railway Zones, CRIS schedule snapshots.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-paper-light p-2.5 space-y-1">
                <strong className="text-indigo font-bold block">✈️ Domestic Airlines</strong>
                <p className="text-ink-muted">IndiGo, Air India, Akasa Air, SpiceJet, Air India Express, Alliance Air, Star Air, Skyscanner API.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-paper-light p-2.5 space-y-1">
                <strong className="text-peacock font-bold block">🚌 Intercity Road Transit</strong>
                <p className="text-ink-muted">KSRTC, MSRTC, APSRTC, TSRTC, TNSTC, Kerala RTC, UPSRTC, GSRTC, RedBus, AbhiBus aggregators.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <KolamDivider className="text-gold-line opacity-50" />

      {/* Bottom Citation & Methodology */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-muted">
        <span>Citations: Ministry of Railways FY26 Data • DGCA Handbook 2024-25 • VIDEC India Travel Market Report</span>
        <span className="font-bold text-ink">BHRAMAN SARTHI Tech Pvt. Ltd. Market Intelligence</span>
      </div>
    </div>
  );
}
