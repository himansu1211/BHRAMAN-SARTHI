import test, { describe, beforeEach } from "node:test";
import assert from "node:assert";
import {
  saveRecentSearch,
  getRecentSearches,
  deleteRecentSearch,
  clearRecentSearches,
  saveTrip,
  getSavedTrips,
  removeSavedTrip,
  isTripSaved,
} from "../src/lib/storage";
import { SearchRequest, TravelRoute } from "../src/lib/types";

// In-memory mock localStorage for Node test environment
class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("Local Permanent Device Storage Unit Tests", () => {
  beforeEach(() => {
    // Install mock localStorage and window in global environment
    (globalThis as any).localStorage = new MockLocalStorage();
    (globalThis as any).window = {
      localStorage: (globalThis as any).localStorage,
      dispatchEvent: () => true,
    };
  });

  test("saveRecentSearch saves and retrieves item from local storage", () => {
    const req: SearchRequest = {
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-15",
      arriveBy: "2026-10-15T21:00",
      optimization: "best_balance",
    };

    saveRecentSearch(req, 8);
    const list = getRecentSearches();

    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].origin, "BLR");
    assert.strictEqual(list[0].destination, "DEL");
    assert.strictEqual(list[0].date, "2026-10-15");
    assert.strictEqual(list[0].routeCount, 8);
  });

  test("saveRecentSearch deduplicates identical corridor and date", () => {
    const req: SearchRequest = {
      origin: "BOM",
      destination: "GOA",
      date: "2026-10-20",
      arriveBy: "2026-10-20T18:00",
      optimization: "cheapest",
    };

    saveRecentSearch(req, 5);
    saveRecentSearch(req, 12); // second search of same corridor

    const list = getRecentSearches();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].routeCount, 12);
  });

  test("deleteRecentSearch removes specific item by id", () => {
    const req1: SearchRequest = {
      origin: "MAA",
      destination: "SBC",
      date: "2026-10-05",
      arriveBy: "2026-10-05T20:00",
      optimization: "fastest",
    };
    const req2: SearchRequest = {
      origin: "CCU",
      destination: "DEL",
      date: "2026-10-06",
      arriveBy: "2026-10-06T22:00",
      optimization: "best_balance",
    };

    const item1 = saveRecentSearch(req1, 4);
    saveRecentSearch(req2, 6);

    assert.strictEqual(getRecentSearches().length, 2);
    deleteRecentSearch(item1.id);

    const listAfter = getRecentSearches();
    assert.strictEqual(listAfter.length, 1);
    assert.strictEqual(listAfter[0].origin, "CCU");
  });

  test("clearRecentSearches empties the recent searches list", () => {
    saveRecentSearch({
      origin: "DEL",
      destination: "JAI",
      date: "2026-10-08",
      arriveBy: "2026-10-08T12:00",
      optimization: "best_balance",
    });

    assert.strictEqual(getRecentSearches().length, 1);
    clearRecentSearches();
    assert.strictEqual(getRecentSearches().length, 0);
  });

  test("saveTrip, isTripSaved, and removeSavedTrip manage saved itineraries", () => {
    const dummyRoute: TravelRoute = {
      id: "route_test_123",
      segments: [
        {
          id: "seg_1",
          type: "train",
          operator: "Vande Bharat Express",
          operatorCode: "IR",
          segmentNumber: "22487",
          fromCode: "DLI",
          fromName: "Delhi Jn",
          toCode: "ASR",
          toName: "Amritsar",
          departureTime: "2026-10-10T15:15:00.000+05:30",
          arrivalTime: "2026-10-10T20:45:00.000+05:30",
          durationMinutes: 330,
          price: 1350,
          baseFare: 1200,
          taxes: 150,
          reliabilityScore: 94,
          providerSource: "IRCTC",
        },
      ],
      totalPrice: 1350,
      totalDurationMinutes: 330,
      transfers: 0,
      departureTime: "2026-10-10T15:15:00.000+05:30",
      arrivalTime: "2026-10-10T20:45:00.000+05:30",
      deadlineBufferMinutes: 90,
      estimatedArrivalConfidence: 94,
      overallScore: 90,
      scoreBreakdown: {
        priceScore: 85,
        timeScore: 90,
        reliabilityScore: 94,
        deadlineScore: 92,
        transferScore: 100,
      },
      explanation: "Direct premium express train",
      isFeasible: true,
    };

    const req: SearchRequest = {
      origin: "DLI",
      destination: "ASR",
      date: "2026-10-10",
      arriveBy: "2026-10-10T22:00",
      optimization: "best_balance",
    };

    assert.strictEqual(isTripSaved(dummyRoute.id), false);

    saveTrip(dummyRoute, req);
    assert.strictEqual(isTripSaved(dummyRoute.id), true);

    const saved = getSavedTrips();
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].route.id, "route_test_123");

    removeSavedTrip(dummyRoute.id);
    assert.strictEqual(isTripSaved(dummyRoute.id), false);
    assert.strictEqual(getSavedTrips().length, 0);
  });
});
