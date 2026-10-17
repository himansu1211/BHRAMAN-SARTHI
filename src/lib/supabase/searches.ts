import type { SearchInput, TravelRoute } from "@/lib/types/travel";

export interface PastSearchRecord {
  id?: string;
  origin: string;
  destination: string;
  travel_date: string;
  arrive_by: string;
  budget: number;
  optimization: string;
  route_count: number;
  created_at?: string;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// In-memory cache for fallback when Supabase is not configured
const inMemoryPastSearches: PastSearchRecord[] = [];

export async function persistSearch(
  input: SearchInput,
  routeCount: number,
): Promise<void> {
  const record: PastSearchRecord = {
    origin: input.origin,
    destination: input.destination,
    travel_date: input.date,
    arrive_by: input.arriveBy,
    budget: input.budget,
    optimization: input.optimization,
    route_count: routeCount,
    created_at: new Date().toISOString(),
  };

  inMemoryPastSearches.unshift(record);
  if (inMemoryPastSearches.length > 50) {
    inMemoryPastSearches.pop();
  }

  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("searches").insert(record as unknown as Record<string, unknown>);

    if (error) {
      console.error("Failed to persist search to Supabase:", error.message);
    }
  } catch (err) {
    console.error("Error persisting search:", err);
  }
}

export async function fetchSearchHistory(limit: number = 20): Promise<PastSearchRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("searches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as PastSearchRecord[];
      }
    } catch (err) {
      console.warn("Failed to fetch search history from Supabase, using fallback:", err);
    }
  }

  return inMemoryPastSearches.slice(0, limit);
}
