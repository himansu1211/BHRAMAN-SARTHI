import { NextResponse } from "next/server";
import { buildRoadmap, fetchAdvisories } from "@/lib/ai/roadmap";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { options = [], suggestions = [], fromCity, toCity, date, deadlineISO } = body ?? {};

    if (!fromCity || !toCity || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    // Run advisories lookup and roadmap generation concurrently
    const [advisories, roadmap] = await Promise.all([
      fetchAdvisories(fromCity, toCity, date),
      buildRoadmap(options, suggestions, fromCity, toCity, date, deadlineISO),
    ]);

    return NextResponse.json({
      advisories,
      roadmap,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
