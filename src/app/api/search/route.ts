import { NextRequest, NextResponse } from "next/server";
import { searchRoutes } from "@/lib/routing/route-engine";
import { SearchRequest } from "@/lib/types";
import { unmatchedStationCodesForCitySearch } from "@/lib/providers/dataset-train-provider";
import { resolveCityHub } from "@/lib/data-lookup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, date, arriveBy, budget, optimization, showMissedDeadlines } = body;

    // Validation
    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required transit locations." },
        { status: 400 }
      );
    }

    if (origin.toUpperCase() === destination.toUpperCase()) {
      return NextResponse.json(
        { error: "Origin and destination cannot be identical." },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Travel date is required." },
        { status: 400 }
      );
    }

    const searchParams: SearchRequest = {
      origin,
      destination,
      date,
      arriveBy,
      budget: budget ? Number(budget) : undefined,
      optimization: optimization || "best_balance",
      showMissedDeadlines: Boolean(showMissedDeadlines),
    };

    const results = await searchRoutes(searchParams);

    const originHub = resolveCityHub(origin);
    const destinationHub = resolveCityHub(destination);
    const stationWarnings = [
      ...(originHub.stationCode ? unmatchedStationCodesForCitySearch(originHub.stationCode) : []),
      ...(destinationHub.stationCode ? unmatchedStationCodesForCitySearch(destinationHub.stationCode) : []),
    ];
    const uniqueStationWarnings = [...new Set(stationWarnings)];
    const roadRoute = originHub.latitude && originHub.longitude && destinationHub.latitude && destinationHub.longitude
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originHub.latitude}%2C${originHub.longitude}%3B${destinationHub.latitude}%2C${destinationHub.longitude}`
      : "https://www.openstreetmap.org/";

    return NextResponse.json({
      ...results,
      stationWarnings: uniqueStationWarnings,
      networkMaps: {
        rail: {
          imageUrl: "/network-maps/railway-schematic.webp",
          sourceUrl: "https://nr.indianrailways.gov.in/uploads/files/1754046481980-IR%20MAP%202025-A1.pdf",
          sourceLabel: "Indian Railways • network map corrected to 31 March 2025",
        },
        airports: {
          imageUrl: "/network-maps/airports-india.webp",
          sourceUrl: "https://ourairports.com/countries/IN/",
          sourceLabel: "OurAirports • interactive India airport map",
        },
        roads: {
          imageUrl: "/network-maps/highways-india.jpg",
          sourceUrl: "https://www.openstreetmap.org/",
          sourceLabel: "User-supplied map with 2010 highway renumbering reference • route preview via OpenStreetMap",
          routeUrl: roadRoute,
        },
      },
    });
    } catch (error: unknown) {
      console.error("Search API error:", error);
      return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred while calculating routes." },
      { status: 500 }
    );
  }
}
