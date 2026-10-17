import { AppError } from "@/lib/errors";
import { getGeocodingProvider } from "@/lib/providers";
import { persistSearch } from "@/lib/supabase/searches";
import { searchRoutes } from "@/lib/routing/route-engine";
import type { SearchInput, SearchResponse } from "@/lib/types/travel";

export async function runSearch(input: SearchInput): Promise<SearchResponse> {
  const geo = getGeocodingProvider();
  const origin = await geo.resolveCity(input.origin);
  const destination = await geo.resolveCity(input.destination);
  if (!origin || !destination) {
    throw new AppError("invalid_city", "Could not resolve that city.");
  }

  const result = await searchRoutes(input);
  await persistSearch(input, result.routes.length);
  return result;
}
