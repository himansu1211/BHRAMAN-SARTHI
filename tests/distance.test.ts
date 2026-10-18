import test, { describe } from "node:test";
import assert from "node:assert";
import {
  calculateHaversineDistanceKm,
  calculateRoadDistanceKm,
  calculateRailDistanceKm,
  getIntraCityInterchange,
  getInterCityDistance,
  findNearestAirportToStation,
  calculateRouteTotalDistance,
} from "../src/lib/distance-service";
import { TravelRoute } from "../src/lib/types";

describe("Distance Service & Google Maps Calibration Unit Tests", () => {
  test("calculateHaversineDistanceKm computes accurate great-circle aerial distance", () => {
    // Bangalore Kempegowda (13.1986° N, 77.7066° E) to Delhi IGI (28.5562° N, 77.1000° E)
    const dist = calculateHaversineDistanceKm(13.1986, 77.7066, 28.5562, 77.1);
    assert.ok(dist >= 1700 && dist <= 1750, `Distance ${dist}km should be ~1740km`);
  });

  test("calculateRoadDistanceKm applies Google Maps highway circuity ratio (~1.28x)", () => {
    const aerial = calculateHaversineDistanceKm(12.97, 77.59, 13.08, 80.27); // BLR to Chennai (~290km)
    const road = calculateRoadDistanceKm(12.97, 77.59, 13.08, 80.27);
    assert.ok(road > aerial, "Road driving distance must be strictly greater than straight line aerial");
    const ratio = road / aerial;
    assert.ok(ratio >= 1.25 && ratio <= 1.32, `Circuity ratio ${ratio} must be within 1.25-1.32`);
  });

  test("calculateRailDistanceKm applies Indian Railways track curvature ratio (~1.22x)", () => {
    const aerial = calculateHaversineDistanceKm(18.94, 72.83, 28.64, 77.22); // Mumbai to Delhi
    const rail = calculateRailDistanceKm(18.94, 72.83, 28.64, 77.22);
    assert.ok(rail > aerial);
    const ratio = rail / aerial;
    assert.ok(ratio >= 1.18 && ratio <= 1.26);
  });

  test("getIntraCityInterchange retrieves Google Maps verified transfers for major Indian cities", () => {
    // Delhi Airport T3 to New Delhi Railway Station
    const delTransfer = getIntraCityInterchange("DEL", "DEL", "NDLS");
    assert.ok(delTransfer, "Must find Delhi Airport to NDLS transfer");
    assert.strictEqual(delTransfer.mode, "metro");
    assert.strictEqual(delTransfer.durationMinutes, 22);
    assert.strictEqual(delTransfer.distanceKm, 15.6);
    assert.strictEqual(delTransfer.estCost, 60);

    // Bangalore Airport to KSR Bengaluru (SBC)
    const blrTransfer = getIntraCityInterchange("BLR", "BLR", "SBC");
    assert.ok(blrTransfer);
    assert.strictEqual(blrTransfer.distanceKm, 34.8);
    assert.ok(blrTransfer.durationMinutes >= 60);

    // Mumbai Airport T2 to CSMT
    const bomTransfer = getIntraCityInterchange("BOM", "BOM", "CSMT");
    assert.ok(bomTransfer);
    assert.strictEqual(bomTransfer.distanceKm, 22.4);
    assert.strictEqual(bomTransfer.mode, "cab");

    // Chennai Airport to MGR Central (MAS)
    const maaTransfer = getIntraCityInterchange("MAA", "MAA", "MAS");
    assert.ok(maaTransfer);
    assert.strictEqual(maaTransfer.distanceKm, 21.2);
    assert.strictEqual(maaTransfer.mode, "metro");
  });

  test("getInterCityDistance retrieves highway, rail, and flight metrics for city pairs", () => {
    const dist = getInterCityDistance("BLR", "DEL");
    assert.strictEqual(dist.origin, "BLR");
    assert.strictEqual(dist.destination, "DEL");
    assert.strictEqual(dist.roadKm, 2165);
    assert.strictEqual(dist.railKm, 2367);
    assert.strictEqual(dist.flightKm, 1740);
    assert.strictEqual(dist.source, "google-maps-verified");
    assert.ok(dist.primaryHighway?.includes("NH44"));

    // Symmetry test: DEL -> BLR returns identical metrics
    const reverseDist = getInterCityDistance("DEL", "BLR");
    assert.strictEqual(reverseDist.roadKm, 2165);
  });

  test("findNearestAirportToStation locates commercial airport with driving distance", () => {
    const res = findNearestAirportToStation("SBC");
    assert.ok(res, "Must locate airport for major station SBC");
    assert.strictEqual(res.airportCode, "BLR");
    assert.ok(res.roadDistanceKm >= 30);
    assert.ok(res.driveTimeMinutes >= 45);
  });

  test("calculateRouteTotalDistance sums segments and transfer distances", () => {
    const dummyRoute: TravelRoute = {
      id: "test_dist_route",
      segments: [
        {
          id: "s1",
          type: "flight",
          operator: "IndiGo",
          operatorCode: "6E",
          segmentNumber: "6E 2134",
          fromCode: "BLR",
          fromName: "Bangalore",
          toCode: "DEL",
          toName: "Delhi",
          departureTime: "2026-10-15T06:00:00Z",
          arrivalTime: "2026-10-15T08:45:00Z",
          durationMinutes: 165,
          distanceKm: 1740,
          price: 5400,
          baseFare: 4800,
          taxes: 600,
          reliabilityScore: 92,
          providerSource: "Skyscanner",
        },
      ],
      interchanges: [
        {
          fromNodeCode: "DEL",
          toNodeCode: "NDLS",
          cityId: "DEL",
          mode: "metro",
          durationMinutes: 22,
          distanceKm: 15.6,
          description: "Airport Express",
          estCost: 60,
        },
      ],
      totalPrice: 5460,
      totalDurationMinutes: 187,
      transfers: 0,
      departureTime: "2026-10-15T06:00:00Z",
      arrivalTime: "2026-10-15T09:07:00Z",
      deadlineBufferMinutes: 120,
      estimatedArrivalConfidence: 94,
      overallScore: 90,
      scoreBreakdown: { priceScore: 80, timeScore: 95, reliabilityScore: 92, deadlineScore: 90, transferScore: 100 },
      explanation: "Fastest route",
      isFeasible: true,
    };

    const totalDist = calculateRouteTotalDistance(dummyRoute.segments, dummyRoute.interchanges);
    assert.strictEqual(totalDist, 1755.6);
  });
});
