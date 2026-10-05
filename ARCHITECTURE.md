# RouteWise — Architecture Overview

```
│   ├── styleguide/       # Interactive Yatra design system showcase (/styleguide)
│   ├── api/
│   │   ├── search/           # POST /api/search - Multimodal route search & scoring
│   │   └── explain-route/    # POST /api/explain-route - Deterministic / AI route summary
│   ├── layout.tsx            # Global layout with persistent navigation header & footer
│   └── page.tsx              # Main search and interactive results view
├── components/               # Modular UI components
│   ├── ornaments/            # Indian cultural art ornaments (Jaali, Kolam, Toran, Madhubani, Warli, Boota)
│   ├── header.tsx            # App header with Yatra branding and mobile navigation drawer
│   ├── search-card.tsx       # Ticket pass search form with typeahead & mode selector
│   ├── results-view.tsx      # Recommended routes, summary cards, and filters
│   ├── route-card.tsx        # Individual route summary card with mode badges
│   ├── route-modal.tsx       # Detailed route view with schedule timeline and fare breakdown
│   ├── delay-simulator.tsx   # Interactive "What-If" disruption simulator with aria-live updates
│   └── location-search-input.tsx # High-contrast paper location typeahead
├── lib/
│   ├── types.ts              # Core domain models (TravelSegment, TravelRoute, SearchParams)
│   ├── constants.ts          # Default connection buffers, city hubs, config constants
│   ├── routing/              # Deterministic routing logic
│   │   ├── connection-validator.ts # Transfer viability checking (station/airport/bus buffers)
│   │   ├── deadline-calculator.ts  # Buffer calculation & deadline qualification
│   │   ├── route-score.ts          # Transparent weighted multi-factor scoring
│   │   └── route-engine.ts         # Multimodal path generation (direct & 1-transfer)
│   ├── providers/            # Data provider adapters
│   │   ├── provider-interface.ts   # Clean interfaces for flights, trains, and buses
│   │   ├── mock-data.ts            # Realistic schedules & synthesized corridor data
│   │   ├── flight-provider.ts      # Flight adapter (Mock & Real API stub)
│   │   ├── train-provider.ts       # Train adapter (Mock & Real API stub)
│   │   └── bus-provider.ts         # Bus adapter (Mock & Real API stub)
│   └── ai/
│       └── explain-service.ts      # Deterministic explanation + optional OpenAI fallback
```

### Key Principles
1. **Server-Side Determinism**: Route synthesis, transfer validation, buffer calculations, and scores are 100% deterministic TypeScript logic on the server.
2. **Provider Decoupling**: Application relies on `FlightProvider`, `TrainProvider`, and `BusProvider` interfaces. Mock implementations are cleanly separated.
3. **No AI for Calculation**: OpenAI is isolated strictly to natural-language rationale generation and degrades gracefully to template explanations.
