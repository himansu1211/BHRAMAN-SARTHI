# RouteWise — Project Specification

## 1. Product Vision
RouteWise is a deadline-aware multimodal travel comparison and route optimization web application for India.
Unlike traditional platforms that optimize solely for price or raw duration, RouteWise answers the critical travel question:
**"Can I realistically reach my destination before my deadline?"**

The platform evaluates combinations of Flights, Trains, and Buses (direct and multi-leg transfers) across Indian hubs, scoring routes transparently and estimating arrival confidence without making unsupported accuracy claims.

## 2. Core Features
- **Multimodal Route Search Across 3 Transit Modes**: Direct flights, direct trains, intercity AC express buses, and cross-modal combinations (Flight+Train, Train+Bus, Bus+Flight, Flight+Bus, Train+Flight, Flight+Flight, Train+Train, Bus+Bus, Station+Bus).
- **Comprehensive Indian Transit Network**: 35+ Indian transit hubs covering major airports, railway junctions, and central interstate bus terminals (ISBT, Majestic, Swargate, Dadar, MGBS, CMBT, Alambagh, etc.).
- **Intra-City Terminal Interchange Modeling**: Real-world transit guidance between airports, railway stations, and bus ports within transit cities (Airport Metro Express, suburban rails, feeder shuttles, and cabs).
- **Aggregator Source Attribution & Booking Links**: Segments linked and credited to Skyscanner, IRCTC, Ixigo, Goibibo, and RedBus.
- **Seat Availability & Price Insights**: Status tags (e.g., `AVAILABLE - 32 (3A)`, `RAC 6`, `WL 14`, `16 Sleeper Berths Available`) and price trend indicators.
- **Interactive "What-If" Delay Simulator**: Disruption stress-testing (0–240m delay) recalculating connection safety, deadline buffer, and confidence.

## 3. Current Implementation Status
- **Full Multimodal Network (Verified)**: Active support for Flights, Trains, and Interstate Buses with schedules across 35+ Indian city hubs.
- **Connection & Interchange Engine (Verified)**: Full validation matrix across all 9 mode combinations, plus intra-city transit calculations.
- **Aggregator & Availability Layer (Verified)**: Seat counts, booking links, and price trend heuristics from Skyscanner, IRCTC, Ixigo, Goibibo, and RedBus.
- **Automated Test Suite (Verified)**: 18 unit, engine, and API integration tests passing via `npm test`.
- **Production Build (Verified)**: Clean Next.js 16 production build passing with 0 errors via `npm run build`.

## 4. API Integrations
- `FlightProvider`, `TrainProvider`, and `BusProvider` clean adapter pattern (Mock implementation active; real provider hooks configured via env).
- Optional OpenAI API integration for natural language journey rationales.

## 5. Data Model
- **Transit Locations**: 35+ Indian Hubs with tri-modal codes (Airports, Railway Stations, Interstate Bus Terminals).
- **TravelSegment**: Operator, segment number, departure/arrival timestamps, mode (`flight` | `train` | `bus`), price, seat availability, price trend, provider source, booking URL.
- **TravelRoute**: Ordered segments, intra-city interchanges, aggregate price, total duration, buffer before deadline, estimated arrival confidence, and weighted score.

## 6. Architecture & Technology Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Deterministic Server-Side Core**: All route synthesis, scoring, deadline buffer calculations, and connection validation are 100% deterministic TypeScript on the server.
- **AI Scope**: AI is strictly restricted to natural language explanation formatting and degrades gracefully to template explanations.

## 7. Route Algorithm & Connection Rules
- Minimum Connection Buffers:
  - Airport → Airport: 120 mins
  - Station → Station: 30 mins
  - Bus → Bus: 30 mins
  - Station → Bus / Bus → Station: 45 mins
  - Airport → Station / Station → Airport: 180 mins
  - Airport → Bus / Bus → Airport: 150–180 mins
- Deadline Buffer: `deadline - arrivalTime`. If `< 0`, marked invalid.

## 8. Known Limitations (MVP)
- Buses are in scope for MVP across search, connection validation, scoring, and UI.
- Confidence scores are heuristic estimates based on timing parameters, not machine learning or live telemetry.
- Initial segment pool uses curated realistic schedules and synthesized corridors for Indian city hubs.

