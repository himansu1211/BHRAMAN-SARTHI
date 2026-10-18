import { test, describe } from "node:test";
import assert from "node:assert";
import {
  km,
  airportSuggestions,
  directTrainsSoldOut,
  alternateStationSuggestions,
} from "../src/lib/live/suggestions";
import { HubPoint, LiveOption } from "../src/lib/live/types";

describe("Live Smart Suggestions Engine", () => {
  const blr: HubPoint = {
    city: "Bangalore",
    lat: 12.9716,
    lng: 77.5946,
    airport: "BLR",
    stations: ["SBC", "YPR"],
  };

  const del: HubPoint = {
    city: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    airport: "DEL",
    stations: ["NDLS", "NZM"],
  };

  const vns: HubPoint = {
    city: "Varanasi",
    lat: 25.3176,
    lng: 82.9739,
    airport: "VNS",
    stations: ["BSB"],
  };

  const kpd: HubPoint = {
    city: "Katpadi",
    lat: 12.9789,
    lng: 79.1373,
    stations: ["KPD"],
  };

  const maa: HubPoint = {
    city: "Chennai",
    lat: 13.0827,
    lng: 80.2707,
    airport: "MAA",
    stations: ["MAS", "MS"],
  };

  const hubs = [blr, del, vns, kpd, maa];

  test("km calculates Haversine distance correctly", () => {
    const dist = km(blr, del);
    assert.ok(dist > 1600 && dist < 1800);
  });

  test("airportSuggestions identifies nearest airport for non-airport city", () => {
    const suggestions = airportSuggestions(blr, kpd, hubs);
    assert.ok(suggestions.length > 0);
    assert.strictEqual(suggestions[0].kind, "nearest-airport");
    assert.ok(suggestions[0].title.includes("Chennai"));
    assert.strictEqual(suggestions[0].searchPair?.toCity, "Chennai");
  });

  test("directTrainsSoldOut detects sold out and high waitlist status", () => {
    const availableTrains: LiveOption[] = [
      {
        id: "t1",
        provider: "ixigo",
        category: "train",
        fromCode: "SBC",
        toCode: "NDLS",
        departureTime: "10:00",
        arrivalTime: "20:00",
        availability: [{ classCode: "3A", status: "AVAILABLE-0025" }],
      },
    ];

    const soldOutTrains: LiveOption[] = [
      {
        id: "t2",
        provider: "ixigo",
        category: "train",
        fromCode: "SBC",
        toCode: "NDLS",
        departureTime: "10:00",
        arrivalTime: "20:00",
        availability: [{ classCode: "3A", status: "WL 55" }],
      },
    ];

    assert.strictEqual(directTrainsSoldOut(availableTrains), false);
    assert.strictEqual(directTrainsSoldOut(soldOutTrains), true);
  });

  test("alternateStationSuggestions recommends nearby boarding/alighting stations", () => {
    const suggestions = alternateStationSuggestions(kpd, del, hubs, 130);
    assert.ok(suggestions.length > 0);
    assert.strictEqual(suggestions[0].kind, "alternate-station");
    assert.ok(suggestions[0].title.includes("Chennai"));
  });
});
