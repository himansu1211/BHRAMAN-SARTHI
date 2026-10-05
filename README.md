# Bhraman Sarthi

> A multimodal travel planner for journeys across India.

**Live website:** [bhramansarthi.netlify.app](https://bhramansarthi.netlify.app/)

Bhraman Sarthi brings flight, train, bus, and selected mixed-mode journey options into one search. Compare direct services with connections, sort by travel time or estimated cost, and review route legs before following a booking link.

## What it does

- Search supported Indian city and station corridors by travel date.
- Compare direct flights, trains, and buses with connecting and mixed-mode itineraries where route data is available.
- Filter results to **Direct only** or by transport mode.
- Sort and review routes by criteria such as fastest, cheapest, or best balance.
- Set an arrival deadline and inspect estimated buffer and confidence information.
- Expand an itinerary for leg-by-leg details, save it on the device, and simulate delays.
- Open rail, flight, and bus booking or operator information links when available.
- View rail, airport, and roadway map references and data notes.

### Data and availability

Route schedules and fares may come from bundled snapshots, sample data, or configured provider integrations. Snapshot schedules can be historical, and snapshot fares are estimates. They do not confirm current operating days, seat availability, or live prices. Check details with the operator before booking. A live provider integration appears only when its authorized API is configured; provider names in the interface do not by themselves mean live availability has been checked.

## Technology

- **Next.js 16** with the App Router
- **React 19** and **TypeScript**
- **Tailwind CSS 4** for styling
- **Lucide React** for interface icons
- Server route handlers for route search and optional provider-backed features
- A small **Model Context Protocol (MCP)** server for route search and optional TripJack flight operations
- **Netlify** for the hosted website

## Run locally

Requirements: Node.js and npm.

```bash
git clone <repository-url>
cd routewise
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create a production build locally:

```bash
npm run build
npm run start
```

## Configuration

Copy `.env.example` to `.env.local` and add credentials only for providers you are authorized to use. The app can run without provider credentials, using available local route data and sample or snapshot results.

Optional environment variables include:

| Variable | Purpose |
| --- | --- |
| `FLIGHT_API_KEY`, `FLIGHT_API_ENDPOINT` | Flight provider adapter |
| `TRAIN_API_KEY`, `TRAIN_API_ENDPOINT` | Train provider adapter |
| `BUS_API_KEY`, `BUS_API_ENDPOINT` | Bus provider adapter |
| `SKYSCANNER_API_KEY`, `SKYSCANNER_API_URL` | Authorized Skyscanner gateway, if available |
| `GEMINI_API_KEY` | Optional AI-generated route explanations and roadmap features |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Optional Supabase-backed features |

Keep secrets in server-side environment variables. Do not commit `.env.local` or expose provider keys in client-side code.

## Netlify deployment

The repository includes [`netlify.toml`](netlify.toml). It runs `npm run build`, publishes `.next`, and sets `NODE_OPTIONS=--max-old-space-size=4096` to give Node more heap during the production build. Netlify should deploy the branch that contains this configuration.

## Useful commands

```bash
npm run dev          # Start the local development server
npm run build        # Build for production
npm run start        # Serve the production build
npm run lint         # Run ESLint
npm test             # Run the test suite
npm run mcp:routewise # Start the RouteWise MCP server over stdio
```

## MCP server (optional)

Start the MCP server with `npm run mcp:routewise`. It exposes `search_indian_routes`, `get_flight_data`, `book_best_flight`, and `get_ticket_info` over stdio.

TripJack operations require server-side `TRIPJACK_API_KEY` and the corresponding `TRIPJACK_FLIGHT_SEARCH_URL`, `TRIPJACK_BOOK_URL`, and `TRIPJACK_TICKET_INFO_URL` values. Booking is disabled by default; enabling it requires `TRIPJACK_ENABLE_BOOKING=true` and an explicit confirmation in each booking request. Use the exact endpoints and request format supplied by your TripJack partner integration.

## Project references

- [Architecture](ARCHITECTURE.md)
- [Project specification](PROJECT_SPEC.md)
- [Design notes](DESIGN.md)
- [UI style guide](https://bhramansarthi.netlify.app/styleguide)
