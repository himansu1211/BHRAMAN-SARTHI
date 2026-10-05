import { TravelSegment } from "../types";
import { TrainProvider, TrainSearchParams } from "./provider-interface";
import { DatasetTrainProvider } from "./dataset-train-provider";

export class MockTrainProvider implements TrainProvider {
  private dsProvider = new DatasetTrainProvider();

  async searchTrains(params: TrainSearchParams): Promise<TravelSegment[]> {
    return this.dsProvider.searchTrains(params);
  }

  async getAllAvailableTrains(date: string, originCodes?: string[], destinationCodes?: string[]): Promise<TravelSegment[]> {
    return this.dsProvider.getAllAvailableTrains(date, originCodes, destinationCodes);
  }
}

import { ProviderCache, fetchWithTimeoutAndRetry, validateSegmentBoundary } from "./api-adapter-utils";

const trainCache = new ProviderCache<TravelSegment[]>(5 * 60 * 1000);

export class RealTrainProvider implements TrainProvider {
  private apiKey?: string;
  private apiEndpoint?: string;

  constructor(apiKey?: string, apiEndpoint?: string) {
    this.apiKey = apiKey || process.env.TRAIN_API_KEY;
    this.apiEndpoint = apiEndpoint || process.env.TRAIN_API_ENDPOINT || "https://api.railwayapi.com/v2";
  }

  async searchTrains(params: TrainSearchParams): Promise<TravelSegment[]> {
    if (!this.apiKey) {
      const fallback = new MockTrainProvider();
      return fallback.searchTrains(params);
    }

    const cacheKey = `trn_${params.originCode}_${params.destinationCode}_${params.date}`;
    const cached = trainCache.get(cacheKey);
    if (cached) return cached;

    try {
      const rawData = await fetchWithTimeoutAndRetry<TravelSegment[]>(
        `${this.apiEndpoint}/between/source/${params.originCode}/dest/${params.destinationCode}/date/${params.date}/apikey/${this.apiKey}`,
        { timeoutMs: 5000, retries: 2 }
      );

      const validSegments: TravelSegment[] = (rawData || [])
        .filter(validateSegmentBoundary)
        .map((s) => ({
          ...s,
          providerSource: "Ixigo" as const,
          dataSource: "live-api" as const,
        }));

      trainCache.set(cacheKey, validSegments);
      return validSegments;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[RealTrainProvider] External API failed: ${errMsg}. Falling back to dataset.`);
      const fallback = new MockTrainProvider();
      return fallback.searchTrains(params);
    }
  }

  async getAllAvailableTrains(date: string, originCodes?: string[], destinationCodes?: string[]): Promise<TravelSegment[]> {
    const fallback = new MockTrainProvider();
    return fallback.getAllAvailableTrains(date, originCodes, destinationCodes);
  }
}

// Factory function
export function getTrainProvider(): TrainProvider {
  if (process.env.TRAIN_API_KEY) {
    return new RealTrainProvider(process.env.TRAIN_API_KEY);
  }
  return new MockTrainProvider();
}
