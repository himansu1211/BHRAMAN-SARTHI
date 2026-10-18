import { test, describe } from "node:test";
import assert from "node:assert";
import { calculateDeadlineBufferMinutes, evaluateDeadlineToArrival } from "../src/lib/routing/deadline-calculator";
import { validateConnection } from "../src/lib/routing/connection-validator";
import {
  calculatePriceScore,
  calculateTimeScore,
  calculateArrivalConfidence,
} from "../src/lib/routing/route-score";
import { simulateDelay } from "../src/lib/routing/delay-simulator";
import { searchRoutes } from "../src/lib/routing/route-engine";
import { CONNECTION_BUFFERS } from "../src/lib/constants";
import { TravelSegment, TravelRoute } from "../src/lib/types";

describe("Deadline Calculator Tests", () => {
  test("calculates positive buffer before deadline", () => {
    const arrival = "2026-10-02T15:00:00.000Z";
    const deadline = "2026-10-02T18:00:00.000Z";
    const buffer = calculateDeadlineBufferMinutes(arrival, deadline);
    assert.strictEqual(buffer, 180);

    const evalResult = evaluateDeadlineToArrival(arrival, deadline);
    assert.strictEqual(evalResult.isMet, true);
    assert.strictEqual(evalResult.urgency, "comfortable");
    assert.strictEqual(evalResult.formattedBuffer, "3h before deadline");
  });

  test("calculates negative buffer when deadline is missed", () => {
    const arrival = "2026-10-02T19:30:00.000Z";
    const deadline = "2026-10-02T18:00:00.000Z";
    const buffer = calculateDeadlineBufferMinutes(arrival, deadline);
    assert.strictEqual(buffer, -90);

    const evalResult = evaluateDeadlineToArrival(arrival, deadline);
    assert.strictEqual(evalResult.isMet, false);
    assert.strictEqual(evalResult.urgency, "missed");
    assert.strictEqual(evalResult.formattedBuffer, "1h 30m past deadline");
  });
});

describe("Connection Validator Tests", () => {
  const dummyFlight1: TravelSegment = {
    id: "f1",
    type: "flight",
    operator: "IndiGo",
    operatorCode: "6E",
    segmentNumber: "6E 101",
    fromCode: "BLR",
    fromName: "Bangalore",
    toCode: "BOM",
    toName: "Mumbai Airport",
    departureTime: "2026-10-02T08:00:00.000Z",
    arrivalTime: "2026-10-02T09:40:00.000Z",
    durationMinutes: 100,
    price: 3500,
    baseFare: 3000,
    taxes: 500,
    reliabilityScore: 92,
    providerSource: "Skyscanner",
  };

  test("rejects airport connection with insufficient buffer (< 120m)", () => {
    const tightFlight2: TravelSegment = {
      ...dummyFlight1,
      id: "f2",
      departureTime: "2026-10-02T10:30:00.000Z", // only 50m after 09:40
      arrivalTime: "2026-10-02T12:45:00.000Z",
    };

    const res = validateConnection(dummyFlight1, tightFlight2);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.requiredTransferMinutes, CONNECTION_BUFFERS.AIRPORT_TO_AIRPORT);
    assert.strictEqual(res.actualTransferMinutes, 50);
  });

  test("accepts airport connection with adequate buffer (>= 120m)", () => {
    const validFlight2: TravelSegment = {
      ...dummyFlight1,
      id: "f3",
      departureTime: "2026-10-02T12:00:00.000Z", // 140m buffer
      arrivalTime: "2026-10-02T14:10:00.000Z",
    };

    const res = validateConnection(dummyFlight1, validFlight2);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.actualTransferMinutes, 140);
  });

  test("requires 180m buffer for station-to-airport transfer", () => {
    const trainSeg: TravelSegment = {
      ...dummyFlight1,
      id: "t1",
      type: "train",
      arrivalTime: "2026-10-02T10:00:00.000Z",
    };
    const flightSeg: TravelSegment = {
      ...dummyFlight1,
      id: "f4",
      type: "flight",
      departureTime: "2026-10-02T13:30:00.000Z", // 210m buffer -> valid
    };

    const res = validateConnection(trainSeg, flightSeg);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.requiredTransferMinutes, 180);
    assert.strictEqual(res.actualTransferMinutes, 210);
  });

  test("validates station-to-bus transfer buffer (45m required)", () => {
    const trainSeg: TravelSegment = {
      ...dummyFlight1,
      id: "t2",
      type: "train",
      arrivalTime: "2026-10-02T10:00:00.000Z",
    };
    const busSeg: TravelSegment = {
      ...dummyFlight1,
      id: "b1",
      type: "bus",
      departureTime: "2026-10-02T11:00:00.000Z", // 60m buffer -> valid
    };

    const res = validateConnection(trainSeg, busSeg);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.requiredTransferMinutes, CONNECTION_BUFFERS.STATION_TO_BUS);
  });
});

describe("Scoring and Arrival Confidence Tests", () => {
  test("price score prefers lower fare", () => {
    const cheapScore = calculatePriceScore(3000);
    const expensiveScore = calculatePriceScore(14000);
    assert.ok(cheapScore > expensiveScore);
  });

  test("time score prefers shorter duration", () => {
    const fastScore = calculateTimeScore(150);
    const slowScore = calculateTimeScore(1800);
    assert.ok(fastScore > slowScore);
  });

  test("arrival confidence stays within 0-100 and rewards buffer", () => {
    const dummySeg: TravelSegment = {
      id: "s1",
      type: "flight",
      operator: "Vistara",
      operatorCode: "UK",
      segmentNumber: "UK 101",
      fromCode: "BLR",
      fromName: "Bangalore",
      toCode: "DEL",
      toName: "Delhi",
      departureTime: "2026-10-02T10:00:00.000Z",
      arrivalTime: "2026-10-02T12:45:00.000Z",
      durationMinutes: 165,
      price: 7000,
      baseFare: 6000,
      taxes: 1000,
      reliabilityScore: 95,
      providerSource: "Skyscanner",
    };

    const confWithHighBuffer = calculateArrivalConfidence([dummySeg], [], 240);
    const confWithTightBuffer = calculateArrivalConfidence([dummySeg], [], 20);

    assert.ok(confWithHighBuffer > confWithTightBuffer);
    assert.ok(confWithHighBuffer <= 100 && confWithHighBuffer >= 0);
  });
});

describe("What-If Disruption Simulator Tests", () => {
  const baseRoute: TravelRoute = {
    id: "route_test_1",
    segments: [
      {
        id: "s1",
        type: "flight",
        operator: "IndiGo",
        operatorCode: "6E",
        segmentNumber: "6E 2134",
        fromCode: "BLR",
        fromName: "Kempegowda Intl",
        toCode: "DEL",
        toName: "Indira Gandhi Intl",
        departureTime: "2026-10-02T10:00:00.000Z",
        arrivalTime: "2026-10-02T12:45:00.000Z",
        durationMinutes: 165,
        price: 6800,
        baseFare: 5800,
        taxes: 1000,
        reliabilityScore: 93,
        providerSource: "Skyscanner",
      },
    ],
    totalPrice: 6800,
    totalDurationMinutes: 165,
    transfers: 0,
    departureTime: "2026-10-02T10:00:00.000Z",
    arrivalTime: "2026-10-02T12:45:00.000Z",
    deadlineBufferMinutes: 195, // 3h 15m before 16:00
    estimatedArrivalConfidence: 94,
    overallScore: 90,
    scoreBreakdown: {
      priceScore: 75,
      timeScore: 92,
      reliabilityScore: 93,
      deadlineScore: 100,
      transferScore: 100,
    },
    explanation: "Direct test flight",
    isFeasible: true,
  };

  const deadline = "2026-10-02T16:00:00.000Z";

  test("0 minute delay preserves scheduled status", () => {
    const sim = simulateDelay(baseRoute, 0, deadline);
    assert.strictEqual(sim.isViable, true);
    assert.strictEqual(sim.newConfidence, 94);
    assert.strictEqual(sim.newBufferMinutes, 195);
  });

  test("120 minute delay reduces buffer and confidence deterministically", () => {
    const sim = simulateDelay(baseRoute, 120, deadline);
    assert.strictEqual(sim.newBufferMinutes, 75); // 195 - 120 = 75 mins remaining
    assert.ok(sim.newConfidence < baseRoute.estimatedArrivalConfidence);
  });

  test("240 minute delay causes deadline failure", () => {
    const tightRoute = { ...baseRoute, deadlineBufferMinutes: 60 };
    const sim = simulateDelay(tightRoute, 120, "2026-10-02T13:45:00.000Z");
    assert.strictEqual(sim.missesDeadline, true);
    assert.strictEqual(sim.isViable, false);
    assert.strictEqual(sim.riskLevel, "critical");
  });
});

describe("Route Engine Integration Search Tests", () => {
  test("generates feasible direct and multimodal routes for BLR -> DEL", async () => {
    const results = await searchRoutes({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-02",
      arriveBy: "2026-10-02T22:00:00.000Z",
      optimization: "best_balance",
    });

    assert.ok(results.routes.length > 0, "Should generate at least one feasible route");
    assert.ok(results.summary.bestBalance !== undefined, "Should designate a Best Balance route");

    for (const r of results.routes) {
      assert.strictEqual(r.isFeasible, true, "All returned routes in main list must be feasible");
      assert.ok(r.deadlineBufferMinutes >= 0, "Buffer must be non-negative");
    }
  });

  test("respects budget constraint if provided", async () => {
    const budget = 5000;
    const results = await searchRoutes({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-02",
      arriveBy: "2026-10-02T22:00:00.000Z",
      budget,
      optimization: "cheapest",
    });

    for (const r of results.routes) {
      assert.ok(r.totalPrice <= budget, `Route price ${r.totalPrice} exceeds budget ${budget}`);
    }
  });

  test("golden test: mid-route boarding search for Katpadi (KPD) to Arakkonam (AJJ)", async () => {
    const results = await searchRoutes({
      origin: "KPD",
      destination: "AJJ",
      date: "2026-10-02",
      arriveBy: "2026-10-02T23:59:00.000Z",
      optimization: "best_balance",
    });

    assert.ok(results.routes.length > 0, "Should find mid-route train connections between KPD and AJJ");
    const trainRoute = results.routes.find((r) => r.segments.some((s) => s.type === "train"));
    assert.ok(trainRoute, "Should contain train segment for Katpadi to Arakkonam");
    const seg = trainRoute.segments[0];
    assert.strictEqual(seg.fromCode, "KPD");
    assert.strictEqual(seg.toCode, "AJJ");
    assert.ok(seg.dataSource !== undefined, "Should specify data provenance");
  });

  test("midnight crossing journey calculation preserves date continuity and exact multi-day arrival", async () => {
    const results = await searchRoutes({
      origin: "SBC",
      destination: "NDLS",
      date: "2026-10-02",
      arriveBy: "2026-10-04T23:59:00.000Z",
      optimization: "best_balance",
    });

    assert.ok(results.routes.length > 0);
    const longTrain = results.routes.find((r) => r.totalDurationMinutes > 1000);
    assert.ok(longTrain, "Should find long-distance multi-day train from Bangalore to Delhi");

    const depDate = new Date(longTrain.departureTime).getTime();
    const arrDate = new Date(longTrain.arrivalTime).getTime();
    const computedDurationMinutes = Math.round((arrDate - depDate) / (60 * 1000));

    // Verify arrival timestamp matches duration EXACTLY (no 24h/48h truncation)
    assert.strictEqual(
      computedDurationMinutes,
      longTrain.totalDurationMinutes,
      `Arrival time must be exactly ${longTrain.totalDurationMinutes}m after departure, got ${computedDurationMinutes}m`
    );

    // Verify full official train name
    const trainSeg = longTrain.segments.find((s) => s.type === "train");
    assert.ok(trainSeg, "Must contain train segment");
    assert.ok(
      trainSeg.operator.includes("Express") || trainSeg.operator.includes("Rajdhani"),
      `Train operator name '${trainSeg.operator}' must be the full official train name`
    );
    assert.ok(
      trainSeg.operator.startsWith(trainSeg.segmentNumber),
      `Full train name '${trainSeg.operator}' should include official train number ${trainSeg.segmentNumber}`
    );
  });

  test("2-transfer search runs under 300ms execution runtime cap", async () => {
    const t0 = performance.now();
    const results = await searchRoutes({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-02",
      arriveBy: "2026-10-02T23:59:00.000Z",
      optimization: "best_balance",
    });
    const elapsed = performance.now() - t0;

    assert.ok(elapsed < 300, `Search execution took ${elapsed.toFixed(2)}ms, exceeding 300ms budget`);
    assert.ok(results.routes.length > 0);
  });
});
