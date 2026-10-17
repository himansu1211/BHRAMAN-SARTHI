import { CITIES } from "@/lib/data/locations";
import { FLIGHT_TEMPLATES, TRAIN_TEMPLATES, SegmentTemplate } from "@/lib/providers/catalog";
import { instantiateTemplate, sanitizeSegment } from "@/lib/providers/instantiate";
import { searchRoutes } from "@/lib/routing/route-engine";
import { addDaysIsoDate, todayIsoDate } from "@/lib/time";
import { parseSearchInput } from "@/lib/validation/search";
import { fetchSearchHistory, PastSearchRecord } from "@/lib/supabase/searches";
import type { OptimizationMode, SearchResponse, TravelRoute, TravelSegment } from "@/lib/types/travel";

export interface CorridorSummary {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  routeCount: number;
  cheapestPrice?: number;
  fastestDurationMinutes?: number;
  highestConfidence?: number;
  routes: TravelRoute[];
}

export interface AllDataResult {
  stats: {
    totalCities: number;
    totalCityPairs: number;
    activeCorridors: number;
    totalFlightTemplates: number;
    totalTrainTemplates: number;
    totalCatalogSegments: number;
    totalCalculatedRoutes: number;
  };
  catalog: {
    flights: TravelSegment[];
    trains: TravelSegment[];
    allSegments: TravelSegment[];
  };
  corridors: CorridorSummary[];
  searchHistory: PastSearchRecord[];
}

/**
 * Instantiates and returns all catalog flight and train segments for a given date.
 */
export function fetchAllCatalogSegments(date: string = addDaysIsoDate(todayIsoDate(), 1)): {
  flights: TravelSegment[];
  trains: TravelSegment[];
  allSegments: TravelSegment[];
} {
  const flights = FLIGHT_TEMPLATES.map((t) => instantiateTemplate(t, date))
    .map(sanitizeSegment)
    .filter((s): s is TravelSegment => s !== null);

  const trains = TRAIN_TEMPLATES.map((t) => instantiateTemplate(t, date))
    .map(sanitizeSegment)
    .filter((s): s is TravelSegment => s !== null);

  return {
    flights,
    trains,
    allSegments: [...flights, ...trains],
  };
}

/**
 * Searches and returns all multimodal routes for a specific corridor.
 */
export async function fetchCorridorRoutes(
  origin: string,
  destination: string,
  date: string = addDaysIsoDate(todayIsoDate(), 1),
  optimization: OptimizationMode = "best_balance",
): Promise<SearchResponse> {
  const input = parseSearchInput({
    origin,
    destination,
    date,
    arriveByTime: "23:59",
    budget: 50000,
    optimization,
    includeMissedDeadline: true,
  });

  return await searchRoutes(input);
}

/**
 * Computes and returns routes across all 42 city pairs in the network.
 */
export async function fetchAllCityPairRoutes(options?: {
  date?: string;
  optimization?: OptimizationMode;
  maxBudget?: number;
}): Promise<CorridorSummary[]> {
  const date = options?.date ?? addDaysIsoDate(todayIsoDate(), 1);
  const optimization = options?.optimization ?? "best_balance";
  const budget = options?.maxBudget ?? 50000;

  const cityMap = new Map(CITIES.map((c) => [c.id, c.name]));
  const cityIds = CITIES.map((c) => c.id);
  const pairs: [string, string][] = [];

  for (const o of cityIds) {
    for (const d of cityIds) {
      if (o !== d) pairs.push([o, d]);
    }
  }

  const results = await Promise.all(
    pairs.map(async ([origin, destination]) => {
      try {
        const input = parseSearchInput({
          origin,
          destination,
          date,
          arriveByTime: "23:59",
          budget,
          optimization,
          includeMissedDeadline: true,
        });

        const res = await searchRoutes(input);
        const routes = res.routes;

        const cheapestPrice = routes.length > 0
          ? Math.min(...routes.map((r) => r.totalPrice))
          : undefined;
        const fastestDurationMinutes = routes.length > 0
          ? Math.min(...routes.map((r) => r.totalDurationMinutes))
          : undefined;
        const highestConfidence = routes.length > 0
          ? Math.max(...routes.map((r) => r.estimatedArrivalConfidence))
          : undefined;

        return {
          origin,
          destination,
          originName: cityMap.get(origin) || origin,
          destinationName: cityMap.get(destination) || destination,
          routeCount: routes.length,
          cheapestPrice,
          fastestDurationMinutes,
          highestConfidence,
          routes,
        };
      } catch (err) {
        return {
          origin,
          destination,
          originName: cityMap.get(origin) || origin,
          destinationName: cityMap.get(destination) || destination,
          routeCount: 0,
          routes: [],
        };
      }
    }),
  );

  return results;
}

/**
 * Fetches all old data, previous search history, catalog segments, and calculated routes.
 */
export async function fetchAllOldData(date?: string): Promise<AllDataResult> {
  const catalog = fetchAllCatalogSegments(date);
  const [corridors, searchHistory] = await Promise.all([
    fetchAllCityPairRoutes({ date }),
    fetchSearchHistory(50),
  ]);

  const totalCalculatedRoutes = corridors.reduce((sum, c) => sum + c.routeCount, 0);
  const activeCorridors = corridors.filter((c) => c.routeCount > 0).length;

  return {
    stats: {
      totalCities: CITIES.length,
      totalCityPairs: corridors.length,
      activeCorridors,
      totalFlightTemplates: FLIGHT_TEMPLATES.length,
      totalTrainTemplates: TRAIN_TEMPLATES.length,
      totalCatalogSegments: catalog.allSegments.length,
      totalCalculatedRoutes,
    },
    catalog,
    corridors,
    searchHistory,
  };
}
