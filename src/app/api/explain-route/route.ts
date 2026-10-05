import { NextRequest, NextResponse } from "next/server";
import { explainRouteWithFallback } from "@/lib/ai/explain-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { route } = body;

    if (!route) {
      return NextResponse.json(
        { error: "Route data is required to generate an explanation." },
        { status: 400 }
      );
    }

    const explanation = await explainRouteWithFallback(route);

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Explain route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate route explanation." },
      { status: 500 }
    );
  }
}
