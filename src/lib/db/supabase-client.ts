export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

// Minimal clean client interface ready for @supabase/supabase-js
export class SupabaseAdapter {
  private url?: string;
  private anonKey?: string;

  constructor() {
    this.url = process.env.SUPABASE_URL;
    this.anonKey = process.env.SUPABASE_ANON_KEY;
  }

  async saveSearch(searchParams: Record<string, unknown>, _routesCount: number) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    // Phase 8 live persistence logic
    console.log("Saving search log to Supabase:", searchParams.origin, "->", searchParams.destination);
    return { id: "simulated_search_uuid" };
  }

  async saveTrip(_userId: string, _route: Record<string, unknown>) {
    if (!isSupabaseConfigured()) {
      return { success: false, reason: "Supabase credentials not configured in .env" };
    }
    return { success: true, id: "simulated_saved_trip_id" };
  }
}

export const supabaseAdapter = new SupabaseAdapter();
