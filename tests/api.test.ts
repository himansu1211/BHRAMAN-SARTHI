import { test, describe } from "node:test";
import assert from "node:assert";
import { POST as searchHandler } from "../src/app/api/search/route";
import { POST as delayHandler } from "../src/app/api/simulate-delay/route";
import { POST as explainHandler } from "../src/app/api/explain-route/route";
import { NextRequest } from "next/server";

function createMockRequest(body: Record<string, unknown>, url: string = "http://localhost:3000/api/search"): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API Route Handlers Integration", () => {
  test("POST /api/search returns valid multimodal routes", async () => {
    const req = createMockRequest({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-02",
      arriveBy: "2026-10-02T22:00:00.000Z",
      optimization: "best_balance",
    });

    const res = await searchHandler(req);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.ok(data.routes);
    assert.ok(data.routes.length > 0);
    assert.ok(data.summary.bestBalance);
    assert.strictEqual(data.isDemoData, true);
  });

  test("POST /api/search rejects identical origin and destination", async () => {
    const req = createMockRequest({
      origin: "BLR",
      destination: "BLR",
      date: "2026-10-02",
      arriveBy: "2026-10-02T22:00:00.000Z",
    });

    const res = await searchHandler(req);
    assert.strictEqual(res.status, 400);

    const data = await res.json();
    assert.match(data.error, /cannot be identical/i);
  });

  test("POST /api/simulate-delay computes impact accurately", async () => {
    // Generate a quick search to obtain a realistic route
    const searchReq = createMockRequest({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-02",
      arriveBy: "2026-10-02T22:00:00.000Z",
    });
    const searchRes = await searchHandler(searchReq);
    const searchData = await searchRes.json();
    const route = searchData.routes[0];

    const delayReq = createMockRequest(
      {
        route,
        delayMinutes: 60,
        deadline: "2026-10-02T22:00:00.000Z",
        allRoutes: searchData.routes,
      },
      "http://localhost:3000/api/simulate-delay"
    );

    const delayRes = await delayHandler(delayReq);
    assert.strictEqual(delayRes.status, 200);

    const delayData = await delayRes.json();
    assert.strictEqual(delayData.delayMinutes, 60);
    assert.ok(delayData.newBufferMinutes !== undefined);
  });

  test("POST /api/explain-route generates concise deterministic rationale", async () => {
    const searchReq = createMockRequest({
      origin: "BLR",
      destination: "DEL",
      date: "2026-10-02",
      arriveBy: "2026-10-02T22:00:00.000Z",
    });
    const searchRes = await searchHandler(searchReq);
    const searchData = await searchRes.json();
    const route = searchData.routes[0];

    const explainReq = createMockRequest(
      { route },
      "http://localhost:3000/api/explain-route"
    );

    const explainRes = await explainHandler(explainReq);
    assert.strictEqual(explainRes.status, 200);

    const data = await explainRes.json();
    assert.ok(data.explanation);
    assert.ok(data.explanation.length > 10);
  });

  test("POST /api/search-live streams NDJSON live search events", async () => {
    const { POST: liveHandler } = await import("../src/app/api/search-live/route");
    const req = new Request("http://localhost:3000/api/search-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromCity: "BLR",
        toCity: "DEL",
        date: "2026-10-02",
      }),
    });

    const res = await liveHandler(req);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "application/x-ndjson");

    const reader = res.body?.getReader();
    assert.ok(reader);

    const { value } = await reader.read();
    assert.ok(value);
    const text = new TextDecoder().decode(value);
    const lines = text.trim().split("\n");
    assert.ok(lines.length > 0);

    const firstEvent = JSON.parse(lines[0]);
    assert.ok(firstEvent.type);
  });
});
