// test_routes.ts
// Script to fetch and log route information between all major cities defined in CITIES.
// Uses the internal `runSearch` function (air & rail routes) for every city pair.

import { runSearch } from "./src/lib/search/run-search.ts";
import { CITIES } from "./src/lib/data/locations.ts";
import type { SearchInput, SearchResponse } from "./src/lib/types/travel.ts";

/** Create a SearchInput for a given origin & destination city. */
function createInput(originId: string, destinationId: string): SearchInput {
  return {
    origin: originId,
    destination: destinationId,
  } as unknown as SearchInput; // Cast to satisfy the type definition.
}

/** Main test runner. */
async function testAllCityPairs() {
  const total = CITIES.length;
  console.log(`Testing routes for ${total} cities (${total * total} pairs)...`);

  for (let i = 0; i < total; i++) {
    for (let j = 0; j < total; j++) {
      const origin = CITIES[i].id;
      const destination = CITIES[j].id;
      const input = createInput(origin, destination);
      try {
        const result: SearchResponse = await runSearch(input);
        console.log(`🛣️ ${origin} → ${destination}: ${result.routes?.length ?? 0} routes`);
      } catch (err) {
        console.error(`Error ${origin} → ${destination}:`, err);
      }
    }
  }
  console.log("Completed testing all city pairs.");
}

if (require.main === module) {
  testAllCityPairs().catch((e) => console.error("Unexpected error:", e));
}
