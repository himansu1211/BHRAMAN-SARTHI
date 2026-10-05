import { searchLive } from "@/lib/live/orchestrator";
import { ALL_PROVIDERS } from "@/lib/live/providers";

export const dynamic = "force-dynamic";

// POST { fromCity, toCity, date } -> NDJSON stream: one JSON event per line.
export async function POST(req: Request) {
  try {
    const q = await req.json();
    const fromCity = q?.fromCity || q?.origin;
    const toCity = q?.toCity || q?.destination;
    const date = q?.date;

    const parsedDate = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : null;
    if (!fromCity || !toCity || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
      return new Response(
        JSON.stringify({ error: "Bad request. Requires fromCity, toCity, and date in YYYY-MM-DD format." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const query = { fromCity: String(fromCity).trim(), toCity: String(toCity).trim(), date };
    if (!query.fromCity || !query.toCity || query.fromCity === query.toCity) {
      return Response.json({ error: "Origin and destination must be different locations." }, { status: 400 });
    }

    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(ctl) {
        for await (const ev of searchLive(query, ALL_PROVIDERS)) {
          ctl.enqueue(enc.encode(JSON.stringify(ev) + "\n"));
        }
        ctl.close();
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "application/x-ndjson",
        "cache-control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
