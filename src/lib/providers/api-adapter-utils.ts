import { TravelSegment } from "../types";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class ProviderCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export interface ApiFetchOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export async function fetchWithTimeoutAndRetry<T>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs || 5000;
  const retries = options.retries || 2;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: options.headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        // Backoff delay before retry
        await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(`Provider API Request Failed after ${retries + 1} attempts: ${lastError?.message || "Unknown error"}`);
}

export function validateSegmentBoundary(raw: unknown): raw is TravelSegment {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.fromCode !== "string" || !obj.fromCode) return false;
  if (typeof obj.toCode !== "string" || !obj.toCode) return false;
  if (typeof obj.departureTime !== "string" || !obj.departureTime) return false;
  if (typeof obj.arrivalTime !== "string" || !obj.arrivalTime) return false;
  if (typeof obj.price !== "number" || isNaN(obj.price as number) || (obj.price as number) < 0) return false;
  return true;
}
