import { TravelSegment } from "../types";
import { BusProvider, BusSearchParams } from "./provider-interface";
import { generateSegmentsForDate } from "./mock-data";

export class MockBusProvider implements BusProvider {
  async searchBuses(params: BusSearchParams): Promise<TravelSegment[]> {
    const all = await this.getAllAvailableBuses(params.date);
    return all.filter(
      (seg) =>
        seg.type === "bus" &&
        seg.fromCode === params.originCode &&
        seg.toCode === params.destinationCode
    );
  }

  async getAllAvailableBuses(date: string): Promise<TravelSegment[]> {
    const segments = generateSegmentsForDate(date);
    return segments.filter((s) => s.type === "bus");
  }
}

import { ProviderCache, fetchWithTimeoutAndRetry, validateSegmentBoundary } from "./api-adapter-utils";

const busCache = new ProviderCache<TravelSegment[]>(5 * 60 * 1000);

export class RealBusProvider implements BusProvider {
  private apiKey?: string;
  private apiEndpoint?: string;

  constructor(apiKey?: string, apiEndpoint?: string) {
    this.apiKey = apiKey || process.env.BUS_API_KEY;
    this.apiEndpoint = apiEndpoint || process.env.BUS_API_ENDPOINT || "https://api.redbus.in/v1";
  }

  async searchBuses(params: BusSearchParams): Promise<TravelSegment[]> {
    if (!this.apiKey) {
      const fallback = new MockBusProvider();
      return fallback.searchBuses(params);
    }

    const cacheKey = `bus_${params.originCode}_${params.destinationCode}_${params.date}`;
    const cached = busCache.get(cacheKey);
    if (cached) return cached;

    try {
      const rawData = await fetchWithTimeoutAndRetry<TravelSegment[]>(
        `${this.apiEndpoint}/search?from=${params.originCode}&to=${params.destinationCode}&date=${params.date}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeoutMs: 5000,
          retries: 2,
        }
      );

      const validSegments: TravelSegment[] = (rawData || [])
        .filter(validateSegmentBoundary)
        .map((s) => ({
          ...s,
          providerSource: "RedBus" as const,
          dataSource: "live-api" as const,
        }));

      busCache.set(cacheKey, validSegments);
      return validSegments;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[RealBusProvider] External API failed: ${errMsg}. Falling back to mock dataset.`);
      const fallback = new MockBusProvider();
      return fallback.searchBuses(params);
    }
  }

  async getAllAvailableBuses(date: string): Promise<TravelSegment[]> {
    const fallback = new MockBusProvider();
    return fallback.getAllAvailableBuses(date);
  }
}

export function getBusProvider(): BusProvider {
  if (process.env.BUS_API_KEY) {
    return new RealBusProvider(process.env.BUS_API_KEY);
  }
  return new MockBusProvider();
}
