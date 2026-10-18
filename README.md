# Bhraman Sarthi (भ्रमण सारथी)

> A deadline-aware multimodal travel planner for journeys across India.

**Live website:** [bhramansarthii.netlify.app](https://bhramansarthii.netlify.app/)  
**Developer:** [Himansu Kumar Sahu](https://www.linkedin.com/in/himansu-kumar-sahu-377916334?utm_source=share_via&utm_content=profile&utm_medium=member_android)

Bhraman Sarthi brings Indian flights, trains, intercity buses, and selected mixed-mode journeys together into one clear, scannable plan. Compare direct options with connection itineraries, evaluate arrival buffers against strict cutoff deadlines, sort by speed or cost, and access direct booking search links across Indian travel aggregators and operators.

## What it does

- **India-wide Corridor Search:** Search across 8,966+ railway stations, 121+ commercial airports, and major intercity bus terminals.
- **Multimodal Routing Engine:** Compare direct flights, trains, and buses alongside connecting itineraries.
- **Direct Only Filtering:** Instant toggle to view only non-stop, single-service routes when no vehicle change is desired.
- **Arrival Deadline & Buffer Calculation:** Set an arrival cutoff time and evaluate estimated arrival buffers and confidence ratings.
- **Disruption Simulator:** Run what-if delay simulations (+30m, +60m, +120m, +180m) to see if connections hold or alternate routes are required.
- **Direct Deep Booking Links:** Jump straight to prefilled booking search pages for IRCTC, ConfirmTkt, ixigo, IndiGo, Air India, Akasa Air, SpiceJet, RedBus, and AbhiBus.
- **Device-Local Storage:** Save favorite routes and recent search history directly in the browser with full offline persistence.

### Data and availability

Route schedules and fares come from bundled snapshots, calibrated Indian transit datasets, and optional live provider APIs. Snapshot schedules and fares provide estimates and do not guarantee live seat availability. Users should verify details directly with the carrier or authorized booking portal before travel.

## Technology & Design System

- **Framework:** Next.js 16 with the App Router (Turbopack)
- **UI & Runtime:** React 19, TypeScript
- **Styling:** Vanilla CSS & Tailwind CSS 4 with a calm, non-neon architectural palette (deep slate `#1E293B`, architectural navy `#1E3A8A`, and neutral stone `#F8F9FA`)
- **Icons:** Lucide React
- **Protocol:** Model Context Protocol (MCP) server for route planning tools over stdio
- **Hosting & CI/CD:** Netlify

## Run locally

Requirements: Node.js (v18+) and npm.

```bash
git clone https://github.com/himansu1211/BHRAMAN-SARTHI.git
cd Bhramansarthi
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build and run the production bundle locally:

```bash
npm run build
npm run start
```

## Useful Commands

```bash
npm run dev          # Start the local development server
npm run build        # Build optimized production bundle
npm run start        # Serve the production build
npm test             # Run the full 65-test verification suite
npm run lint         # Run ESLint validation
npm run mcp:routewise # Launch the MCP server over stdio
```

## Configuration

Copy `.env.example` to `.env.local` to configure optional external APIs:

| Variable | Purpose |
| --- | --- |
| `FLIGHT_API_KEY`, `FLIGHT_API_ENDPOINT` | Flight provider adapter |
| `TRAIN_API_KEY`, `TRAIN_API_ENDPOINT` | Train provider adapter |
| `BUS_API_KEY`, `BUS_API_ENDPOINT` | Bus provider adapter |
| `SKYSCANNER_API_KEY`, `SKYSCANNER_API_URL` | Skyscanner integration gateway |
| `GEMINI_API_KEY` | AI-generated route explanations and regional advisories |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Supabase storage backend |

## Netlify Deployment

The repository includes [`netlify.toml`](netlify.toml). It builds the Next.js application with `NODE_OPTIONS=--max-old-space-size=4096` to guarantee ample memory allocation during Turbopack compilation.

## Author & Credits

- **Creator & Lead Developer:** [Himansu Kumar Sahu](https://www.linkedin.com/in/himansu-kumar-sahu-377916334?utm_source=share_via&utm_content=profile&utm_medium=member_android)
- **Project:** BHRAMAN SARTHI (Bhraman Sarthi Tech Pvt. Ltd.)

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Project Specification](PROJECT_SPEC.md)
- [Design Notes](DESIGN.md)
- [UI Style Guide](https://bhramansarthii.netlify.app/styleguide)
