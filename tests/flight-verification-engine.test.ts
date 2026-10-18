import { test, describe } from "node:test";
import assert from "node:assert";
import { FlightSearchOrchestrator } from "../src/lib/flights/orchestrator/flight-search-orchestrator";
import { FlightVerificationService } from "../src/lib/flights/verification/flight-verification-service";
import { normalizeAndDeduplicateFlights, generateCanonicalFlightKey } from "../src/lib/flights/normalization/flight-normalizer";
import { BaseFlightProvider, FlightProviderResult } from "../src/lib/flights/providers/flight-provider.interface";
import { Flight, FlightSearchRequest } from "../src/lib/flights/types";
import { buildCanonicalFlight } from "../src/lib/flights/providers/base-provider-helper";

describe("Flight Search & Verification Engine — Multi-Source & Integrity Tests", () => {
  const orchestrator = new FlightSearchOrchestrator();
  const verificationService = new FlightVerificationService();

  test("1. Default search returns bundled schedules as unverified references", async () => {
    const res = await orchestrator.searchFlights({
      origin: "BLR",
      destination: "DEL",
      departureDate: "2026-10-15",
      includeUnverified: true,
    });

    assert.ok(res.results.length > 0, "Must return bundled schedule references for BLR -> DEL");
    assert.strictEqual(res.diagnostics.origin, "BLR");
    assert.strictEqual(res.diagnostics.destination, "DEL");

    const diag = res.diagnostics.providerDiagnostics;
    assert.equal(diag.DATASET.flightsFound, res.results.length);
    assert.ok(res.results.every((flight) => flight.availability.status === "UNKNOWN"));
    assert.ok(res.results.every((flight) => flight.sources.every((source) => source.provider === "DATASET")));
  });

  test("2. Snapshot results are deduplicated without inventing provider offers", async () => {
    const res = await orchestrator.searchFlights({
      origin: "BLR",
      destination: "DEL",
      departureDate: "2026-10-15",
      includeUnverified: true,
    });

    // Check unique flight numbers
    const flightNumbers = res.results.map((f) => f.flightNumber);
    const uniqueNumbers = new Set(flightNumbers);
    assert.strictEqual(
      flightNumbers.length,
      uniqueNumbers.size,
      "No duplicate flight cards should appear for the same flight number and route"
    );

    assert.ok(res.results.length > 0);
    assert.ok(res.results.every((flight) => flight.sources.length === 1));
    assert.ok(res.results.every((flight) => flight.offers.length === 1));
    assert.ok(res.results.every((flight) => flight.offers[0].availability === "UNKNOWN"));
  });

  test("3. Day-of-week schedule validation blocks flights not operating on requested day", () => {
    // 2026-10-13 is a Tuesday
    // 2026-10-14 is a Wednesday
    const schedule = {
      flightNumber: "AI 888",
      airline: "Air India",
      airlineCode: "AI",
      origin: "BLR",
      destination: "DEL",
      departTime: "07:00",
      arriveTime: "09:45",
      durationMinutes: 165,
      baseFare: 5500,
      taxes: 800,
      aircraft: "Airbus A321neo",
      days: ["Mon", "Wed", "Fri"], // Only operates Mon/Wed/Fri
    };

    // Test Tuesday search (Should FAIL verification)
    const tuesdayReq: FlightSearchRequest = {
      origin: "BLR",
      destination: "DEL",
      departureDate: "2026-10-13", // Tuesday
    };
    const tuesdayFlight = buildCanonicalFlight(
      schedule,
      tuesdayReq,
      "AIR_INDIA",
      "Air India",
      "AIRLINE_DIRECT",
      "https://www.airindia.com",
      1.0,
      0
    );

    const tuesdayEval = verificationService.verifyFlight(tuesdayFlight, tuesdayReq);
    assert.strictEqual(
      tuesdayEval.passed,
      false,
      "AI 888 operating Mon/Wed/Fri must NOT pass verification on Tuesday"
    );
    assert.ok(
      tuesdayEval.failureReasons.some((r) => r.includes("does not operate on Tue")),
      "Failure reason must state day-of-week non-operation"
    );

    // Test Wednesday search (Should PASS verification)
    const wednesdayReq: FlightSearchRequest = {
      origin: "BLR",
      destination: "DEL",
      departureDate: "2026-10-14", // Wednesday
    };
    const wednesdayFlight = buildCanonicalFlight(
      schedule,
      wednesdayReq,
      "AIR_INDIA",
      "Air India",
      "AIRLINE_DIRECT",
      "https://www.airindia.com",
      1.0,
      0
    );

    const wednesdayEval = verificationService.verifyFlight(wednesdayFlight, wednesdayReq);
    assert.strictEqual(
      wednesdayEval.passed,
      true,
      "AI 888 operating Mon/Wed/Fri must PASS verification on Wednesday"
    );
  });

  test("4. Conflict resolution prioritizes AIRLINE_DIRECT source for schedule and status", () => {
    const otaFlight: Flight = {
      id: "6E|2134|BLR|DEL|2026-10-15|06:15",
      airline: { code: "6E", name: "IndiGo" },
      flightNumber: "6E 2134",
      departure: { airportCode: "BLR", scheduledTime: "2026-10-15T06:15:00+05:30", timezone: "Asia/Kolkata" },
      arrival: { airportCode: "DEL", scheduledTime: "2026-10-15T09:05:00+05:30", timezone: "Asia/Kolkata" },
      durationMinutes: 170, // Discrepant duration from OTA
      stops: 0,
      fare: { baseFare: 5000, taxes: 800, totalAmount: 5800, currency: "INR" },
      availability: { status: "AVAILABLE" },
      operatingStatus: "UNKNOWN",
      sources: [
        {
          provider: "MAKEMYTRIP",
          providerName: "MakeMyTrip",
          retrievedAt: new Date().toISOString(),
          sourceType: "OTA",
          price: 5800,
        },
      ],
      offers: [
        {
          id: "mmt_1",
          provider: "MAKEMYTRIP",
          providerName: "MakeMyTrip",
          sourceType: "OTA",
          baseFare: 5000,
          taxes: 800,
          totalAmount: 5800,
          currency: "INR",
          availability: "AVAILABLE",
          retrievedAt: new Date().toISOString(),
          bookingUrl: "https://www.makemytrip.com",
          isDirectAirlineOffer: false,
        },
      ],
      verification: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        confidence: "MEDIUM",
        summary: "OTA verified",
        checks: [],
      },
      bookingUrl: "https://www.makemytrip.com",
    };

    const directFlight: Flight = {
      id: "6E|2134|BLR|DEL|2026-10-15|06:15",
      airline: { code: "6E", name: "IndiGo" },
      flightNumber: "6E 2134",
      departure: { airportCode: "BLR", scheduledTime: "2026-10-15T06:15:00+05:30", timezone: "Asia/Kolkata" },
      arrival: { airportCode: "DEL", scheduledTime: "2026-10-15T09:00:00+05:30", timezone: "Asia/Kolkata" },
      durationMinutes: 165, // Authoritative airline schedule
      stops: 0,
      fare: { baseFare: 5100, taxes: 800, totalAmount: 5900, currency: "INR" },
      availability: { status: "AVAILABLE", seatsRemaining: 9 },
      operatingStatus: "OPERATING",
      sources: [
        {
          provider: "INDIGO",
          providerName: "IndiGo",
          retrievedAt: new Date().toISOString(),
          sourceType: "AIRLINE_DIRECT",
          price: 5900,
        },
      ],
      offers: [
        {
          id: "6e_direct_1",
          provider: "INDIGO",
          providerName: "IndiGo",
          sourceType: "AIRLINE_DIRECT",
          baseFare: 5100,
          taxes: 800,
          totalAmount: 5900,
          currency: "INR",
          availability: "AVAILABLE",
          retrievedAt: new Date().toISOString(),
          bookingUrl: "https://www.goindigo.in",
          isDirectAirlineOffer: true,
        },
      ],
      verification: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        confidence: "HIGH",
        summary: "Airline direct verified",
        checks: [],
      },
      bookingUrl: "https://www.goindigo.in",
    };

    const merged = normalizeAndDeduplicateFlights([otaFlight, directFlight]);
    assert.strictEqual(merged.length, 1);
    const flight = merged[0];

    // Authoritative schedule must win
    assert.strictEqual(flight.durationMinutes, 165, "Duration should match direct airline (165m vs OTA 170m)");
    assert.strictEqual(flight.operatingStatus, "OPERATING", "Operating status should take direct airline status");
    assert.strictEqual(flight.sources.length, 2, "Both sources should be preserved");
    assert.strictEqual(flight.offers.length, 2, "Both offers should be available");
  });

  test("5. Timetable sanity check catches corrupt arrival time or negative duration", () => {
    const corruptFlight: Flight = {
      id: "TEST|999|BLR|DEL|2026-10-15|10:00",
      airline: { code: "AI", name: "Air India" },
      flightNumber: "AI 999",
      departure: { airportCode: "BLR", scheduledTime: "2026-10-15T10:00:00+05:30", timezone: "Asia/Kolkata" },
      arrival: { airportCode: "DEL", scheduledTime: "2026-10-15T08:00:00+05:30", timezone: "Asia/Kolkata" }, // Arrives before departure!
      durationMinutes: -120,
      stops: 0,
      fare: { baseFare: 4000, taxes: 600, totalAmount: 4600, currency: "INR" },
      availability: { status: "AVAILABLE" },
      operatingStatus: "SCHEDULED",
      sources: [{ provider: "AIR_INDIA", providerName: "Air India", retrievedAt: new Date().toISOString(), sourceType: "AIRLINE_DIRECT" }],
      offers: [],
      verification: { verified: false, verifiedAt: new Date().toISOString(), confidence: "LOW", summary: "", checks: [] },
      bookingUrl: "https://www.airindia.com",
    };

    const req: FlightSearchRequest = { origin: "BLR", destination: "DEL", departureDate: "2026-10-15" };
    const result = verificationService.verifyFlight(corruptFlight, req);

    assert.strictEqual(result.passed, false, "Corrupt timetable must fail verification");
    assert.ok(result.failureReasons.some((r) => r.includes("negative duration") || r.includes("timetable")));
  });

  test("6. Non-operating corridor (PNQ -> BOM) returns ZERO flights (strictly no synthetic fabrication)", async () => {
    const res = await orchestrator.searchFlights({
      origin: "PNQ",
      destination: "BOM",
      departureDate: "2026-10-15",
    });

    assert.strictEqual(
      res.results.length,
      0,
      "No flights must be returned for corridor with zero commercial airline flights"
    );
  });

  test("7. Provider fault tolerance: graceful execution when a provider fails or times out", async () => {
    const failingProvider: BaseFlightProvider = {
      name: "Failing Provider",
      providerId: "MAKEMYTRIP",
      sourceType: "OTA",
      isConfigured: () => true,
      searchFlights: async () => {
        throw new Error("503 Service Unavailable");
      },
    };

    const healthyProvider: BaseFlightProvider = {
      name: "Healthy Provider",
      providerId: "INDIGO",
      sourceType: "AIRLINE_DIRECT",
      isConfigured: () => true,
      searchFlights: async (req) => {
        return {
          providerId: "INDIGO",
          providerName: "IndiGo",
          sourceType: "AIRLINE_DIRECT",
          status: "SUCCESS",
          flights: [
            buildCanonicalFlight(
              {
                flightNumber: "6E 555",
                airline: "IndiGo",
                airlineCode: "6E",
                origin: req.origin,
                destination: req.destination,
                departTime: "08:00",
                arriveTime: "10:30",
                durationMinutes: 150,
                baseFare: 4500,
                taxes: 700,
                aircraft: "Airbus A320neo",
                days: ["Daily"],
              },
              req,
              "INDIGO",
              "IndiGo",
              "AIRLINE_DIRECT",
              "https://www.goindigo.in",
              1.0,
              0
            ),
          ],
          durationMs: 40,
          retrievedAt: new Date().toISOString(),
        };
      },
    };

    const resilientOrchestrator = new FlightSearchOrchestrator([failingProvider, healthyProvider]);
    const res = await resilientOrchestrator.searchFlights({
      origin: "BLR",
      destination: "DEL",
      departureDate: "2026-10-15",
    });

    assert.strictEqual(res.results.length, 1, "Should succeed with results from the healthy provider");
    assert.strictEqual(res.providers.MAKEMYTRIP, "ERROR", "Failing provider should be marked as ERROR");
    assert.strictEqual(res.providers.INDIGO, "SUCCESS", "Healthy provider should be marked as SUCCESS");
  });
});
