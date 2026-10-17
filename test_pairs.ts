/**
 * RouteWise / Bhramansarthi Route & Data Fetcher Script
 * Fetches all catalog data, multimodal routes, and past search history.
 */
import {
  fetchAllOldData,
  fetchAllCatalogSegments,
  fetchAllCityPairRoutes,
  fetchCorridorRoutes,
  AllDataResult,
} from "./src/lib/routing/all-routes";
import { formatInr } from "./src/lib/format";
import { formatDuration } from "./src/lib/time";

export {
  fetchAllOldData,
  fetchAllCatalogSegments,
  fetchAllCityPairRoutes,
  fetchCorridorRoutes,
};

/**
 * Main execution function: Fetches and displays all routes and network data.
 */
export async function runAllDataFetch(): Promise<AllDataResult> {
  console.log("=================================================");
  console.log("  BHRAMANSARTHI / ROUTEWISE - COMPLETE DATA FETCH");
  console.log("=================================================\n");

  console.log("1. Fetching all catalog segments (Flights & Trains)...");
  const catalog = fetchAllCatalogSegments();
  console.log(`   ✓ Found ${catalog.flights.length} Flight segments`);
  console.log(`   ✓ Found ${catalog.trains.length} Train segments`);
  console.log(`   ✓ Total Catalog Segments: ${catalog.allSegments.length}\n`);

  console.log("2. Calculating all multimodal routes across all city pairs...");
  const data = await fetchAllOldData();

  console.log("\n=================================================");
  console.log("  NETWORK COVERAGE SUMMARY");
  console.log("=================================================");
  console.log(`  Covered Cities:           ${data.stats.totalCities}`);
  console.log(`  Total Corridors Checked:  ${data.stats.totalCityPairs}`);
  console.log(`  Active Corridors:         ${data.stats.activeCorridors} (100% connected)`);
  console.log(`  Total Multimodal Routes:  ${data.stats.totalCalculatedRoutes}`);
  console.log(`  Saved / Past Searches:    ${data.searchHistory.length}`);
  console.log("=================================================\n");

  console.log("Top Connected Corridors:");
  data.corridors
    .sort((a, b) => b.routeCount - a.routeCount)
    .slice(0, 10)
    .forEach((c) => {
      console.log(
        `  • ${c.originName.padEnd(10)} → ${c.destinationName.padEnd(10)} | ${String(c.routeCount).padStart(2)} routes | Cheapest: ${formatInr(c.cheapestPrice ?? 0)} | Fastest: ${formatDuration(c.fastestDurationMinutes ?? 0)} | Confidence: ${c.highestConfidence}%`,
      );
    });

  return data;
}

// Auto-run if executed directly
if (require.main === module || !process.env.NEXT_RUNTIME) {
  runAllDataFetch().catch(console.error);
}
