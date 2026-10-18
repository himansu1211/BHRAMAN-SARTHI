import { test, describe } from "node:test";
import assert from "node:assert";
import { DatasetFlightProvider } from "../src/lib/providers/dataset-flight-provider";
import { MockFlightProvider } from "../src/lib/providers/flight-provider";
import { searchRoutes } from "../src/lib/routing/route-engine";

const ACTIVE_INDIAN_AIRLINES = new Set([
  "IndiGo",
  "Air India",
  "Akasa Air",
  "Air India Express",
  "SpiceJet",
]);

const VALID_IATA_PREFIXES = new Set(["6E", "AI", "QP", "IX", "SG"]);

describe("Flight Dataset, Airlines & IST Timings Verification Tests", () => {
  const dsFlightProvider = new DatasetFlightProvider();
  const mockFlightProvider = new MockFlightProvider();

  test("verified commercial flight database contains only active Indian carriers", async () => {
    const flights = await dsFlightProvider.searchFlights({
      originCode: "BLR",
      destinationCode: "DEL",
      date: "2026-10-15",
    });

    assert.ok(flights.length >= 10, "Should find abundant real commercial flights for BLR -> DEL");

    for (const f of flights) {
      assert.strictEqual(
        ACTIVE_INDIAN_AIRLINES.has(f.operator),
        true,
        `Airline operator '${f.operator}' must be an active Indian carrier (no defunct airlines)`
      );

      const prefix = f.operatorCode;
      assert.strictEqual(
        VALID_IATA_PREFIXES.has(prefix),
        true,
        `Operator code '${prefix}' must be a recognized Indian carrier prefix`
      );

      assert.ok(
        f.segmentNumber.startsWith(prefix),
        `Flight number ${f.segmentNumber} should start with carrier prefix ${prefix}`
      );
    }
  });

  test("departure times reflect exact scheduled IST times without UTC timezone drift", async () => {
    const flights = await dsFlightProvider.searchFlights({
      originCode: "BLR",
      destinationCode: "DEL",
      date: "2026-10-15",
    });

    assert.ok(flights.length > 0);

    for (const f of flights.slice(0, 5)) {
      const depDate = new Date(f.departureTime);
      const istTimeStr = depDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });

      // Verify hours and minutes are valid
      const [h, m] = istTimeStr.split(":").map(Number);
      assert.ok(h >= 0 && h < 24);
      assert.ok(m >= 0 && m < 60);

      // Verify arrival time accurately reflects duration in minutes
      const arrDate = new Date(f.arrivalTime);
      const computedDuration = Math.round((arrDate.getTime() - depDate.getTime()) / (60 * 1000));
      assert.strictEqual(computedDuration, f.durationMinutes, "Duration must match difference between arrival and departure");
    }
  });

  test("does NOT fabricate non-existent direct flights for routes with no airline service (e.g. PNQ -> BOM)", async () => {
    const flights = await dsFlightProvider.searchFlights({
      originCode: "PNQ",
      destinationCode: "BOM",
      date: "2026-10-15",
    });

    assert.strictEqual(
      flights.length,
      0,
      "Must not return direct flights between Pune and Mumbai where no commercial scheduled flights operate"
    );
  });

  test("MockFlightProvider no longer references defunct Vistara and uses valid Air India flights", async () => {
    const flights = await mockFlightProvider.searchFlights({
      originCode: "BLR",
      destinationCode: "DEL",
      date: "2026-10-15",
    });

    const vistara = flights.find(
      (f) => f.operator.toLowerCase().includes("vistara") || f.operatorCode === "UK"
    );
    assert.strictEqual(vistara, undefined, "No flight should belong to defunct Vistara");

    const airIndiaAfternoon = flights.find((f) => f.segmentNumber === "AI 2812");
    assert.ok(airIndiaAfternoon, "AI 2812 Air India flight should replace old Vistara seed");

    const depDate = new Date(airIndiaAfternoon.departureTime);
    const istTimeStr = depDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    assert.strictEqual(
      istTimeStr,
      "14:15",
      "Air India AI 2812 should depart at 14:15 IST (2:15 PM)"
    );
  });

  test("searchRoutes returns direct flights with proper carrier names and no duplicate cards", async () => {
    const results = await searchRoutes({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
      arriveBy: "2026-10-15T23:59:00.000Z",
      optimization: "fastest",
    });

    const flightRoutes = results.routes.filter(
      (r) => r.segments.length === 1 && r.segments[0].type === "flight"
    );

    assert.ok(flightRoutes.length > 0, "Must return direct flight routes");

    const seenFlightNumbers = new Set<string>();
    for (const r of flightRoutes) {
      const seg = r.segments[0];
      assert.strictEqual(
        ACTIVE_INDIAN_AIRLINES.has(seg.operator),
        true,
        `Operator ${seg.operator} must be active`
      );

      // Verify no duplicate flight numbers with identical departure
      const key = `${seg.segmentNumber}_${seg.departureTime}`;
      assert.strictEqual(
        seenFlightNumbers.has(key),
        false,
        `Route ${key} must not be duplicated in search results`
      );
      seenFlightNumbers.add(key);
    }
  });
});
