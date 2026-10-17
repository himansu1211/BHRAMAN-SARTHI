import React from "react";
import Link from "next/link";
import { RathChakraIcon, LotusIcon, DiyaIcon } from "@/components/traditional-icons";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#dfc89d] bg-[#fbf6ea] relative overflow-hidden">
      {/* Top Auspicious Border with Lotus Motifs */}
      <div className="flex items-center justify-center gap-3 py-2 bg-[#2a130d] text-amber-300 text-xs tracking-widest font-serif-royal">
        <LotusIcon className="h-3.5 w-3.5 text-amber-400" />
        <span>सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः • शुभं करोति कल्याणम्</span>
        <LotusIcon className="h-3.5 w-3.5 text-amber-400" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand & Sanskrit Ethos */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-red-800 text-amber-200">
                <RathChakraIcon className="h-5 w-5" />
              </div>
              <span className="font-royal-title text-xl font-bold tracking-wider text-[#8e1b1b]">
                BHRAMAN-SARTHI
              </span>
            </div>
            <p className="font-devanagari text-base font-semibold text-amber-900">
              भ्रमण-सारथी — आपका विश्वसनीय भारतीय यात्रा साथी
            </p>
            <p className="max-w-md text-sm leading-relaxed text-[#6e5246]">
              Inspired by the eternal wisdom of the Charioteer (*Sarthi*), seamlessly navigating the ancient trade corridors and modern transport arteries of Bharatvarsha. Delivering deadline-aware confidence across skies and railways.
            </p>
          </div>

          {/* Col 2: Quick Yatra Links */}
          <div className="space-y-3">
            <h3 className="font-royal-sub text-sm font-bold uppercase tracking-wider text-[#8e1b1b]">
              मार्ग एवं सेवाएँ (Services)
            </h3>
            <ul className="space-y-2 text-sm text-[#6e5246]">
              <li>
                <Link href="/search" className="transition-colors hover:text-[#8e1b1b] hover:underline">
                  मार्ग अन्वेषण (Route Finder)
                </Link>
              </li>
              <li>
                <Link href="/saved" className="transition-colors hover:text-[#8e1b1b] hover:underline">
                  संरक्षित यात्राएं (Saved Itineraries)
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-[#8e1b1b] hover:underline">
                  सारथी कार्यविधि (Methodology)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Traditional Corridors */}
          <div className="space-y-3">
            <h3 className="font-royal-sub text-sm font-bold uppercase tracking-wider text-[#8e1b1b]">
              प्राचीन महामार्ग (Historic Corridors)
            </h3>
            <ul className="space-y-1.5 text-xs text-[#6e5246]">
              <li>• उत्तरापथ (Uttarapath: Delhi – Kolkata)</li>
              <li>• दक्षिणापथ (Dakshinapath: Delhi – Bengaluru)</li>
              <li>• पश्चिमी वाणिज्य मार्ग (Mumbai – Pune Corridor)</li>
              <li>• दक्कन राजपथ (Hyderabad – Delhi Nexus)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#dfc89d]/70 pt-6 text-xs text-[#74584c] sm:flex-row">
          <div className="flex items-center gap-2">
            <DiyaIcon className="h-4 w-4 text-amber-600" />
            <span>
              BHRAMAN-SARTHI (Travel Companion) • Multimodal Transit Engine
            </span>
          </div>
          <div>
            <span>May every traveller reach their destination in auspicious time.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
