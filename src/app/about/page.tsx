import type { Metadata } from "next";
import {
  CONNECTION_BUFFERS_MINUTES,
  CONFIDENCE_DISCLAIMER,
} from "@/lib/config/app";
import {
  RathChakraIcon,
  LotusIcon,
  DiyaIcon,
  RoyalSealIcon,
  ToranaDivider,
  VimanaIcon,
  RajGadiIcon,
} from "@/components/traditional-icons";

export const metadata: Metadata = {
  title: "सारथी गाथा (About BHRAMAN-SARTHI) — Indian Travel Companion",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-16">
      {/* Title Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
          <DiyaIcon className="h-3.5 w-3.5 text-amber-600" />
          <span>सारथी गाथा एवं कार्यविधि • PHILOSOPHY & METHODOLOGY</span>
        </div>
        <h1 className="font-royal-title text-3xl font-extrabold tracking-tight text-[#2a1610] sm:text-5xl">
          BHRAMAN-SARTHI
          <span className="block font-devanagari text-2xl sm:text-4xl text-[#8e1b1b] mt-1">
            भ्रमण-सारथी — आपका दिव्य यात्रा साथी
          </span>
        </h1>
        <p className="font-serif-royal text-base sm:text-lg leading-relaxed text-[#6e5246]">
          Re-engineering travel planning across Bharat around a single sacred commitment:{" "}
          <strong className="text-[#8e1b1b]">reaching your destination safely before your appointed hour</strong>.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {/* Ethos of the Sarthi */}
        <section className="relative rounded-3xl border-2 border-[#dfc89d] bg-gradient-to-b from-white to-[#fbf7ee] p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 border-b border-[#ebd8b0] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
              <RathChakraIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-royal-title text-lg sm:text-xl font-bold text-[#2a1610]">
                सारथी की प्राचीन परम्परा (The Eternal Ethos of the Sarthi)
              </h2>
              <span className="text-xs font-semibold text-amber-800">
                Inspired by the Parthasarthi Tradition
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#6e5246]">
            <p>
              In classical Indian literature, a <strong className="text-[#2a1610]">Sarthi (सारथी)</strong> is never a mere driver. A Sarthi is a strategic guide, a protector, and a master of timing. When Lord Krishna took the reins of Arjuna&apos;s chariot at Kurukshetra, he steered the warrior past insurmountable odds with flawless foresight.
            </p>
            <p>
              In our modern era, travellers cross immense distances across the Indian subcontinent—from the Himalayas of Delhi to the Silicon Plateau of Bengaluru, and the bustling coasts of Mumbai and Chennai. Whether you must reach a wedding ceremony (मुहूर्त), a crucial council meeting, or an international flight connection, <strong className="text-[#8e1b1b]">BHRAMAN-SARTHI</strong> evaluates every delay risk so you never miss your moment.
            </p>
          </div>
        </section>

        {/* Confidence Model */}
        <section className="rounded-3xl border-2 border-[#dfc89d] bg-white p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 border-b border-[#ebd8b0] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-800">
              <RoyalSealIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-royal-title text-lg sm:text-xl font-bold text-[#2a1610]">
                आगमन विश्वास गणना (How Arrival Confidence is Calculated)
              </h2>
              <span className="text-xs font-semibold text-emerald-800">
                Composite Multi-factor Scoring
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#6e5246]">
            Unlike commercial booking portals that advertise optimistic schedules regardless of real-world delays, BHRAMAN-SARTHI runs an uncompromising temporal risk model:
          </p>

          <ul className="mt-4 space-y-3 text-sm text-[#6e5246]">
            <li className="flex items-start gap-2.5 rounded-xl bg-amber-50/60 p-3 border border-amber-200/70">
              <span className="font-bold text-[#8e1b1b]">१.</span>
              <div>
                <strong className="text-[#2a1610]">समय सीमा अंतर (Deadline Cushion):</strong> We evaluate the precise spare minutes between landing or station arrival and your requested deadline. Routes with narrow buffers are penalized or flagged.
              </div>
            </li>
            <li className="flex items-start gap-2.5 rounded-xl bg-amber-50/60 p-3 border border-amber-200/70">
              <span className="font-bold text-[#8e1b1b]">२.</span>
              <div>
                <strong className="text-[#2a1610]">मध्य अंतरण जोखिम (Transfer Risk):</strong> Direct flights and non-stop trains minimize cascading breakdowns. For connecting itineraries, strict hub-specific transfer thresholds are enforced.
              </div>
            </li>
            <li className="flex items-start gap-2.5 rounded-xl bg-amber-50/60 p-3 border border-amber-200/70">
              <span className="font-bold text-[#8e1b1b]">३.</span>
              <div>
                <strong className="text-[#2a1610]">परिचालक विश्वसनीयता (Historical Carrier Reliability):</strong> Punctuality track records of IndiGo, Air India, Vistara, Vande Bharat, and Rajdhani express trains are factored directly into the confidence quotient.
              </div>
            </li>
          </ul>
        </section>

        {/* Transfer Buffers */}
        <section className="rounded-3xl border-2 border-[#dfc89d] bg-white p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 border-b border-[#ebd8b0] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
              <LotusIcon className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h2 className="font-royal-title text-lg sm:text-xl font-bold text-[#2a1610]">
                न्यूनतम अंतरण समय (Minimum Transfer Buffers)
              </h2>
              <span className="text-xs font-semibold text-amber-800">
                Realistic Hub Transit Standards Across Indian Metros
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#6e5246]">
            Indian transit hubs require realistic buffers to handle baggage transfers, terminal shuttles, and urban traffic:
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-[#dfc89d] bg-[#fdfaf3] p-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#2a1610]">
                <VimanaIcon className="h-4 w-4 text-[#8e1b1b]" />
                <span>विमानपत्तन अंतरण (Same Airport)</span>
              </div>
              <div className="mt-1 text-xs text-[#74584c]">
                न्यूनतम {CONNECTION_BUFFERS_MINUTES.airportToAirportSameVenue} मिनट (Airport-to-Airport Same Venue)
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfc89d] bg-[#fdfaf3] p-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#2a1610]">
                <VimanaIcon className="h-4 w-4 text-[#8e1b1b]" />
                <span>नगर पार विमानपत्तन (Across Town)</span>
              </div>
              <div className="mt-1 text-xs text-[#74584c]">
                न्यूनतम {CONNECTION_BUFFERS_MINUTES.airportToAirport} मिनट (Airport-to-Airport Cross City)
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfc89d] bg-[#fdfaf3] p-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#2a1610]">
                <RajGadiIcon className="h-4 w-4 text-amber-700" />
                <span>रेलवे स्टेशन अंतरण (Same Station)</span>
              </div>
              <div className="mt-1 text-xs text-[#74584c]">
                न्यूनतम {CONNECTION_BUFFERS_MINUTES.stationToStationSameVenue} मिनट (Station-to-Station Same Venue)
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfc89d] bg-[#fdfaf3] p-4 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#2a1610]">
                <div className="flex gap-1">
                  <VimanaIcon className="h-3.5 w-3.5 text-[#8e1b1b]" />
                  <RajGadiIcon className="h-3.5 w-3.5 text-amber-700" />
                </div>
                <span>विमान से रेलवे अंतरण (Air-to-Rail)</span>
              </div>
              <div className="mt-1 text-xs text-[#74584c]">
                न्यूनतम {CONNECTION_BUFFERS_MINUTES.airportToStation} मिनट (Airport to Railway Station)
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-3xl border-2 border-amber-300 bg-amber-50/70 p-6 sm:p-7 text-xs text-[#6e5246]">
          <div className="flex items-center gap-2">
            <DiyaIcon className="h-4 w-4 text-amber-700" />
            <h3 className="font-royal-title text-sm font-bold text-amber-900">
              राजकीय उद्घोषणा • DISCLAIMER & NOTICE
            </h3>
          </div>
          <p className="mt-2 leading-relaxed">
            {CONFIDENCE_DISCLAIMER}
          </p>
        </section>
      </div>
    </main>
  );
}
