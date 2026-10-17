"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RathChakraIcon, LotusIcon } from "@/components/traditional-icons";

const navItems = [
  { href: "/search", label: "मार्ग खोज", sub: "Route Finder" },
  { href: "/saved", label: "संग्रहीत यात्रा", sub: "Saved Trips" },
  { href: "/about", label: "सारथी गाथा", sub: "Chronicle" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#dfc89d] bg-[#fdfaf3]/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Identity */}
        <Link
          href="/"
          className="group flex items-center gap-3.5 rounded-lg py-1 transition-transform hover:scale-[1.01]"
          aria-label="BHRAMAN-SARTHI Home"
        >
          {/* Royal Sarthi Emblem */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 via-amber-500 to-red-800 p-0.5 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2a130d] text-amber-300">
              <RathChakraIcon className="h-7 w-7 transition-transform duration-700 group-hover:rotate-180" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] text-[#2a130d]">
              ★
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-royal-title text-xl font-bold tracking-wider text-[#8e1b1b] sm:text-2xl">
                BHRAMAN-SARTHI
              </span>
              <span className="hidden rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300/60 sm:inline-block">
                भ्रमण-सारथी
              </span>
            </div>
            <span className="text-[11px] font-medium tracking-widest text-[#74584c] uppercase">
              The Royal Travel Companion • शुभस्ते पन्थानः सन्तु
            </span>
          </div>
        </Link>

        {/* Traditional Nav Menu */}
        <nav aria-label="Primary Navigation">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative flex flex-col items-center rounded-xl px-3 py-1.5 transition-all ${
                      isActive
                        ? "bg-amber-600/10 text-[#8e1b1b] border border-amber-400/50 shadow-inner"
                        : "text-[#5e4338] hover:bg-amber-100/60 hover:text-[#8e1b1b]"
                    }`}
                  >
                    <span className="font-devanagari text-sm font-semibold tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#846b5f] group-hover:text-[#8e1b1b]">
                      {item.sub}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-amber-500 to-red-700" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Decorative Gold Filigree Hairline */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
    </header>
  );
}
