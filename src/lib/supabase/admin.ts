import { AppError } from "@/lib/errors";

export interface SupabaseQueryBuilder {
  insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  select: (columns?: string) => {
    order: (column: string, opts?: { ascending?: boolean }) => {
      limit: (count: number) => Promise<{ data: any[] | null; error: { message: string } | null }>;
    } & Promise<{ data: any[] | null; error: { message: string } | null }>;
    limit: (count: number) => Promise<{ data: any[] | null; error: { message: string } | null }>;
  } & Promise<{ data: any[] | null; error: { message: string } | null }>;
}

export interface SupabaseClientLike {
  from: (table: string) => SupabaseQueryBuilder;
}

export function getSupabaseAdmin(): SupabaseClientLike {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new AppError(
      "missing_api_key",
      "Supabase is not configured.",
      503,
    );
  }

  return {
    from(table: string) {
      return {
        async insert(values: Record<string, unknown>) {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify(values),
          });
          if (!response.ok) {
            return { error: { message: "insert_failed" } };
          }
          return { error: null };
        },

        select(columns: string = "*") {
          let orderClause = "";
          let limitClause = "";

          const execute = async () => {
            const queryParams = new URLSearchParams({ select: columns });
            if (orderClause) queryParams.append("order", orderClause);
            if (limitClause) queryParams.append("limit", limitClause);

            try {
              const res = await fetch(`${url}/rest/v1/${table}?${queryParams.toString()}`, {
                headers: {
                  apikey: key,
                  Authorization: `Bearer ${key}`,
                  "Content-Type": "application/json",
                },
              });
              if (!res.ok) {
                return { data: null, error: { message: "fetch_failed" } };
              }
              const data = await res.json();
              return { data, error: null };
            } catch (err: any) {
              return { data: null, error: { message: err.message || "network_error" } };
            }
          };

          const promise = execute() as any;

          promise.order = (col: string, opts?: { ascending?: boolean }) => {
            const direction = opts?.ascending ? "asc" : "desc";
            orderClause = `${col}.${direction}`;
            const orderPromise = execute() as any;
            orderPromise.limit = (count: number) => {
              limitClause = String(count);
              return execute();
            };
            return orderPromise;
          };

          promise.limit = (count: number) => {
            limitClause = String(count);
            return execute();
          };

          return promise;
        },
      };
    },
  };
}
