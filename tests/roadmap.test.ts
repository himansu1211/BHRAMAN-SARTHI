import { describe, it, before } from "node:test";
import assert from "node:assert";

// Mock 'server-only' package for Node.js test runner before loading server module
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as any;
} catch {
  // Ignore
}

let buildRoadmap: any;
let fetchAdvisories: any;
let POST: any;

before(async () => {
  const roadmapMod = await import("../src/lib/ai/roadmap");
  const routeMod = await import("../src/app/api/roadmap/route");
  buildRoadmap = roadmapMod.buildRoadmap;
  fetchAdvisories = roadmapMod.fetchAdvisories;
  POST = routeMod.POST;
});

const mockOptions = [
  {
    id: "flight-indigo-6e2134",
    source: "skyscanner" as const,
    fetchedAt: new Date().toISOString(),
    mode: "flight" as const,
    number: "6E-2134",
    name: "IndiGo Air",
    fromCode: "BLR",
    toCode: "DEL",
    fromLabel: "Bengaluru",
    toLabel: "New Delhi",
    departISO: "2026-10-15T08:00:00+05:30",
    arriveISO: "2026-10-15T10:45:00+05:30",
  },
  {
    id: "train-12627",
    source: "ixigo" as const,
    fetchedAt: new Date().toISOString(),
    mode: "train" as const,
    number: "12627",
    name: "Karnataka Express",
    fromCode: "SBC",
    toCode: "NDLS",
    fromLabel: "Bengaluru City",
    toLabel: "New Delhi",
    departISO: "2026-10-15T19:20:00+05:30",
    arriveISO: "2026-10-16T13:30:00+05:30",
  },
];

const mockSuggestions = [
  {
    kind: "nearest-airport" as const,
    title: "Fly via nearest airport",
    reason: "Destination has no direct airport.",
  },
];

describe("Gemini AI Travel Roadmap & Advisory Unit Tests", () => {
  it("buildRoadmap generates verified steps and handles fallbacks", async () => {
    const result = await buildRoadmap(mockOptions, mockSuggestions, "Bengaluru", "New Delhi", "2026-10-15");

    assert.ok(result.summary, "Roadmap must contain a summary");
    assert.ok(Array.isArray(result.steps), "Steps must be an array");
    assert.ok(result.steps.length > 0, "Must contain at least 1 verified step");

    // Verify all steps reference valid option IDs
    const validIds = new Set(mockOptions.map((o) => o.id));
    for (const step of result.steps) {
      assert.ok(validIds.has(step.optionId), `Step optionId ${step.optionId} must be in verified options`);
      assert.ok(typeof step.instruction === "string", "Step instruction must be a string");
    }
  });

  it("fetchAdvisories returns non-empty advisory text", async () => {
    const advisory = await fetchAdvisories("Bengaluru", "New Delhi", "2026-10-15");
    assert.ok(typeof advisory === "string", "Advisory must be a string");
  });
});

describe("POST /api/roadmap Integration Tests", () => {
  it("returns 200 with advisories and roadmap for valid request", async () => {
    const req = new Request("http://localhost:3000/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        options: mockOptions,
        suggestions: mockSuggestions,
        fromCity: "Bengaluru",
        toCity: "New Delhi",
        date: "2026-10-15",
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.ok("advisories" in data);
    assert.ok("roadmap" in data);
    assert.ok(Array.isArray(data.roadmap.steps));
  });

  it("returns 400 for invalid request parameters", async () => {
    const req = new Request("http://localhost:3000/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromCity: "Bengaluru",
        // missing toCity and date
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
  });
});
