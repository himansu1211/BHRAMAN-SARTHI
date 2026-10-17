import { jsonError } from "@/lib/http";
import {
  fetchAllCatalogSegments,
  fetchAllCityPairRoutes,
  fetchAllOldData,
  fetchCorridorRoutes,
} from "@/lib/routing/all-routes";
import { fetchSearchHistory } from "@/lib/supabase/searches";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin");
    const destination = url.searchParams.get("destination");
    const type = url.searchParams.get("type");
    const date = url.searchParams.get("date") || undefined;

    // 1. Fetch only catalog segments (all flights and trains)
    if (type === "catalog") {
      const catalog = fetchAllCatalogSegments(date);
      return Response.json(catalog);
    }

    // 2. Fetch past searches / history
    if (type === "history") {
      const history = await fetchSearchHistory(50);
      return Response.json({ history });
    }

    // 3. Specific corridor (origin & destination)
    if (origin && destination) {
      const result = await fetchCorridorRoutes(origin, destination, date);
      return Response.json(result);
    }

    // 4. Default: Fetch all old data, catalog routes, corridors, and history
    const allData = await fetchAllOldData(date);
    return Response.json(allData);
  } catch (error) {
    return jsonError(error);
  }
}
