import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildFlightDeepLink,
  buildTrainDeepLink,
  buildBusDeepLink,
} from "../src/lib/booking-links";
import { SkyscannerProvider } from "../src/lib/flights/providers/skyscanner/skyscanner-provider";
import { MakeMyTripProvider } from "../src/lib/flights/providers/makemytrip/makemytrip-provider";
import { IxigoProvider } from "../src/lib/flights/providers/ixigo/ixigo-provider";
import { IndigoProvider } from "../src/lib/flights/providers/indigo/indigo-provider";
import { AirIndiaProvider } from "../src/lib/flights/providers/airindia/airindia-provider";
import { AkasaProvider } from "../src/lib/flights/providers/akasa/akasa-provider";
import { SpiceJetProvider } from "../src/lib/flights/providers/spicejet/spicejet-provider";
import { DatasetTrainProvider } from "../src/lib/providers/dataset-train-provider";

describe("Direct Ticket Booking Links Verification", () => {
  const req = {
    origin: "BLR",
    destination: "DEL",
    departureDate: "2026-10-15",
  };

  it("Skyscanner produces a deep flight search link with date and airports", () => {
    const link = buildFlightDeepLink({
      provider: "SKYSCANNER",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });

    assert.ok(link.includes("skyscanner.co.in/transport/flights/blr/del/261015/"));
    assert.ok(link.includes("adultsv2=1"));
    assert.notEqual(link, "https://www.skyscanner.co.in/");
    assert.notEqual(link, "https://www.skyscanner.co.in");
  });

  it("MakeMyTrip produces a deep flight search link with DD/MM/YYYY itinerary", () => {
    const link = buildFlightDeepLink({
      provider: "MAKEMYTRIP",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });

    assert.ok(link.includes("makemytrip.com/flight/search?itinerary=BLR-DEL-15/10/2026"));
    assert.ok(link.includes("paxType=A-1_C-0_I-0"));
    assert.notEqual(link, "https://www.makemytrip.com/");
    assert.notEqual(link, "https://www.makemytrip.com");
  });

  it("ixigo produces a deep flight search link with DDMMYYYY date parameter", () => {
    const link = buildFlightDeepLink({
      provider: "IXIGO",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });

    assert.ok(link.includes("ixigo.com/search/result/flight?from=BLR&to=DEL&date=15102026"));
    assert.ok(link.includes("adults=1"));
    assert.notEqual(link, "https://www.ixigo.com/");
    assert.notEqual(link, "https://www.ixigo.com");
  });

  it("IndiGo produces direct flight booking selection link", () => {
    const link = buildFlightDeepLink({
      provider: "INDIGO",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });

    assert.ok(link.includes("goindigo.in/booking/flight-select.html"));
    assert.ok(link.includes("origin=BLR"));
    assert.ok(link.includes("destination=DEL"));
    assert.ok(link.includes("date=2026-10-15"));
    assert.notEqual(link, "https://www.goindigo.in/");
  });

  it("Air India & Air India Express produce direct search links", () => {
    const linkAi = buildFlightDeepLink({
      provider: "AIR_INDIA",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });
    assert.ok(linkAi.includes("airindia.com/in/en/book.html?from=BLR&to=DEL"));
    assert.ok(linkAi.includes("departureDate=2026-10-15"));

    const linkIx = buildFlightDeepLink({
      provider: "AIR_INDIA_EXPRESS",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });
    assert.ok(linkIx.includes("airindiaexpress.com/home"));
    assert.ok(linkIx.includes("from=BLR&to=DEL"));
    assert.ok(linkIx.includes("departureDate=2026-10-15"));
  });

  it("Akasa Air produces deep flight-booking route URL", () => {
    const link = buildFlightDeepLink({
      provider: "AKASA",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });

    assert.ok(link.includes("akasaair.com/flight-booking/blr-to-del"));
    assert.ok(link.includes("departureDate=2026-10-15"));
  });

  it("SpiceJet produces direct book.spicejet.com search URL", () => {
    const link = buildFlightDeepLink({
      provider: "SPICEJET",
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
    });

    assert.ok(link.includes("book.spicejet.com/?from=BLR&to=DEL"));
    assert.ok(link.includes("from=BLR"));
    assert.ok(link.includes("to=DEL"));
    assert.ok(link.includes("DepartureDate=2026-10-15"));
    assert.ok(link.includes("adult=1"));
  });

  it("Train links target exact train schedules and IRCTC/ConfirmTkt booking search", () => {
    const ixigoTrain = buildTrainDeepLink({
      provider: "IXIGO",
      trainNumber: "12627",
      fromCode: "SBC",
      toCode: "NDLS",
      date: "2026-10-15",
    });
    assert.equal(ixigoTrain, "https://www.ixigo.com/trains/12627");

    const confirmTkt = buildTrainDeepLink({
      provider: "CONFIRMTKT",
      trainNumber: "12627",
      fromCode: "SBC",
      toCode: "NDLS",
      date: "2026-10-15",
    });
    assert.ok(confirmTkt.includes("confirmtkt.com/rbooking/?source=SBC&destination=NDLS&doj=15-10-2026"));

    const irctc = buildTrainDeepLink({
      provider: "IRCTC",
      trainNumber: "12627",
      fromCode: "SBC",
      toCode: "NDLS",
      date: "2026-10-15",
    });
    assert.ok(irctc.includes("irctc.co.in/nget/train-search"));
    assert.ok(irctc.includes("srcStn=SBC"));
    assert.ok(irctc.includes("destStn=NDLS"));
    assert.ok(irctc.includes("journeyDate=15%2F10%2F2026") || irctc.includes("journeyDate=15/10/2026"));
  });

  it("Bus links target deep RedBus and AbhiBus booking pages", () => {
    const redbus = buildBusDeepLink({
      originCity: "Bengaluru Kempegowda Bus Station",
      destCity: "Chennai CMBT Koyambedu",
      date: "2026-10-15",
      provider: "REDBUS",
    });
    assert.ok(redbus.includes("redbus.in/bus-tickets/bengaluru-to-chennai?date=2026-10-15"));

    const abhibus = buildBusDeepLink({
      originCity: "Bengaluru",
      destCity: "Chennai",
      date: "2026-10-15",
      provider: "ABHIBUS",
    });
    assert.ok(abhibus.includes("abhibus.com/bus_search/bengaluru/chennai/2026-10-15/O"));
  });

  it("All flight providers return flights with pre-filled deep booking URLs", async () => {
    const providers = [
      new SkyscannerProvider(),
      new MakeMyTripProvider(),
      new IxigoProvider(),
      new IndigoProvider(),
      new AirIndiaProvider(),
      new AkasaProvider(),
      new SpiceJetProvider(),
    ];

    for (const p of providers) {
      const res = await p.searchFlights(req);
      if (res.status === "SUCCESS") {
        for (const f of res.flights) {
          assert.ok(f.bookingUrl, `Provider ${p.name} returned a flight without bookingUrl`);
          assert.ok(
            f.bookingUrl.startsWith("http"),
            `Provider ${p.name} bookingUrl must be a valid http(s) URL`
          );
          assert.notEqual(
            f.bookingUrl,
            "https://www.skyscanner.co.in/",
            "Skyscanner bookingUrl must not be root homepage"
          );
          assert.notEqual(
            f.bookingUrl,
            "https://www.ixigo.com/",
            "ixigo bookingUrl must not be root homepage"
          );
          // Check offers inside flight
          for (const offer of f.offers) {
            assert.ok(offer.bookingUrl, `Offer from ${offer.providerName} missing bookingUrl`);
            assert.ok(offer.bookingUrl.startsWith("http"));
          }
        }
      }
    }
  });

  it("DatasetTrainProvider sets deep bookingUrl for all trains", async () => {
    const trainProvider = new DatasetTrainProvider();
    const trains = await trainProvider.searchTrains({
      originCode: "SBC",
      destinationCode: "NDLS",
      date: "2026-10-15",
    });

    assert.ok(trains.length > 0);
    for (const t of trains) {
      assert.ok(t.bookingUrl, `Train ${t.operator} missing bookingUrl`);
      assert.ok(
        t.bookingUrl.includes("ixigo.com/trains/"),
        `Train bookingUrl must point directly to train booking/status page, got: ${t.bookingUrl}`
      );
    }
  });
});
