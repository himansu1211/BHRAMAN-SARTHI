import { CITIES } from "./src/lib/data/locations";
import { getTrainProvider } from "./src/lib/providers";
import { TRAIN_TEMPLATES } from "./src/lib/providers/catalog";
import { isValidConnection } from "./src/lib/routing/connection-validator";

async function main() {
  const trains = getTrainProvider();
  const date = "2026-10-18";
  const cityIds = CITIES.map((c) => c.id);

  console.log("Total train templates in catalog:", TRAIN_TEMPLATES.length);

  let directTrainPairs = 0;
  let connectingTrainPairs = 0;
  const missingPairs: { origin: string; destination: string }[] = [];

  for (const origin of cityIds) {
    for (const destination of cityIds) {
      if (origin === destination) continue;

      const direct = await trains.searchTrains({ originCity: origin, destinationCity: destination, date });
      if (direct.length > 0) {
        directTrainPairs++;
        continue;
      }

      let hasConnection = false;
      for (const hub of cityIds) {
        if (hub === origin || hub === destination) continue;
        const leg1 = await trains.searchTrains({ originCity: origin, destinationCity: hub, date });
        const leg2 = await trains.searchTrains({ originCity: hub, destinationCity: destination, date });
        for (const s1 of leg1) {
          for (const s2 of leg2) {
            if (isValidConnection(s1, s2)) {
              hasConnection = true;
              break;
            }
          }
          if (hasConnection) break;
        }
        if (hasConnection) break;
      }

      if (hasConnection) {
        connectingTrainPairs++;
      } else {
        missingPairs.push({ origin, destination });
      }
    }
  }

  console.log("Direct Train Corridors:", directTrainPairs);
  console.log("Connecting Train Corridors:", connectingTrainPairs);
  console.log("Missing Train Corridors:", missingPairs.length);
  missingPairs.forEach((p) => console.log(`  Missing: ${p.origin} -> ${p.destination}`));
}

main().catch(console.error);
