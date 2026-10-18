# Transport data coverage and provenance

RouteWise combines static reference datasets with provider adapters. The static data helps build candidate routes; it is not a live nationwide inventory feed. Always confirm operating days, times, fares, and seats with the carrier before booking.

## Rail

- `generated/stations.json` combines the project's DataMeet station reference with the user-provided station and timetable files. It contains station codes and names for routing; some appended schedule-only stations have no coordinates or state metadata.
- `generated/trains.json` now contains 10,853 unique train numbers after merging 8,490 records from the supplied `EXP-TRAINS.json`, `PASS-TRAINS.json`, and `SF-TRAINS.json`, the project's existing train records, and additional routes from the supplied DataMeet `trains.json` / `schedules.json`.
- The supplied DataMeet repository identifies its content as a 2016 snapshot and CC0. Its station stop order and historical arrival/departure times are useful route references, but do not prove that a train still operates. The three category files do not state their publication date, so their schedules are also treated as unverified snapshots.
- Where the supplied category files include running weekdays and stop times, the planner uses those values to filter dates and calculate intermediate station times. Where running days are absent, the app must treat service as unknown and show the snapshot warning.
- This is substantially broader than the previous 738-record list, but is not a claim that it includes every current train or timetable change. Indian Railways does not provide this project an authenticated live timetable feed.

The reproducible importer is `scripts/import-attached-rail-data.mjs`. It takes the folder containing the three category files and the folder containing the DataMeet GeoJSON/JSON files, then rebuilds the generated station and train indexes.

## Air

- `generated/airports.json` has 651 airport/aerodrome records from the supplied OurAirports India export, merged with OpenFlights route references. This includes 300 heliports, 31 closed fields, and small/private aerodromes; only 164 have IATA codes and 116 of those are marked as scheduled-service airports by that export. Search suggestions use IATA airports with scheduled-service or historical route evidence. These catalogs are references and do not guarantee a flight on the selected date.
- `generated/flights.json` has 780 schedule rows across 62 airport pairs and only 18 airport codes. It is a limited snapshot, not a nationwide airline timetable. The existing flight search adapters currently read this local snapshot; live fare and seat inventory require a licensed provider integration and credentials.
- Candidate generation uses geocoded IATA airports likely to serve scheduled passengers. Only a dated live-provider response can confirm a flight is offered; no live flight API credentials are configured in this workspace.
- AAI's aerodrome lists include airports and civil enclaves with different operational categories; an airport's presence in a map does not mean scheduled passenger service is available.

## Road and bus

Bus and road options use the project's regional reference data and configured providers. Coverage and schedules vary by state. There is no single authoritative all-India live intercity bus feed configured in this workspace.

## Refreshing data

Rebuild the station/airport indexes from the checked-in raw CSV files with:

```bash
npx tsx scripts/build-data.ts
```

That command does not refresh live train or flight schedules. The included rail importer only uses the source files supplied to it; it does not contact Indian Railways.
