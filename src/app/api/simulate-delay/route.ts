import { NextRequest, NextResponse } from "next/server";
import { simulateDelay } from "@/lib/routing/delay-simulator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { route, delayMinutes, deadline, allRoutes } = body;

    if (!route || delayMinutes === undefined || !deadline) {
      return NextResponse.json(
        { error: "Route, delayMinutes, and deadline are required parameters." },
        { status: 400 }
      );
    }

    const simulation = simulateDelay(route, Number(delayMinutes), deadline, allRoutes || []);

    return NextResponse.json(simulation);
  } catch (error: any) {
    console.error("Delay simulation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate delay." },
      { status: 500 }
    );
  }
}
