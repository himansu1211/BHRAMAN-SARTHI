import { NextRequest, NextResponse } from "next/server";
import { flightSearchOrchestrator } from "@/lib/flights/orchestrator/flight-search-orchestrator";
import { FlightSearchRequest } from "@/lib/flights/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
      directOnly,
      preferredAirlines,
      maxStops,
      sortPreference,
      includeUnverified,
    } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination airport IATA codes are required." },
        { status: 400 }
      );
    }

    if (origin.toUpperCase() === destination.toUpperCase()) {
      return NextResponse.json(
        { error: "Origin and destination airports cannot be the same." },
        { status: 400 }
      );
    }

    if (!departureDate || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
      return NextResponse.json(
        { error: "Valid departureDate in YYYY-MM-DD format is required." },
        { status: 400 }
      );
    }

    const searchRequest: FlightSearchRequest = {
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      returnDate,
      passengers: passengers || { adults: 1 },
      cabinClass: cabinClass || "Economy",
      directOnly: Boolean(directOnly),
      preferredAirlines,
      maxStops,
      sortPreference: sortPreference || "recommended",
      includeUnverified: Boolean(includeUnverified),
    };

    const response = await flightSearchOrchestrator.searchFlights(searchRequest);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Flight Search Engine error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while searching verified flights." },
      { status: 500 }
    );
  }
}
