# RouteWise — project spec

Deadline-aware multimodal travel comparison (flights + trains). Buses are out of MVP scope.

## Product vision

Users enter origin, destination, date, arrive-by deadline, budget, and optimization mode. The app generates realistic flight/train combinations and ranks them by whether the traveler can arrive before the deadline — not price alone.

Arrival confidence is a **heuristic estimate**, not a scientific probability.

## Current implementation

**Phase 1 — project setup (complete)**

- Next.js App Router, TypeScript (strict), Tailwind CSS
- Shared layout, header, footer
- Routes: `/`, `/search`, `/saved`, `/about`

## Planned phases

2. Homepage search form + validation  
3. Mock flight/train providers  
4. Route engine (connections, deadline filter)  
5. Deterministic scoring  
6. Results + route details UI  
7. What-if delay simulator  
8. Supabase  
9. Real API adapters  
10. Optional OpenAI explanations  
11. Tests  
12. Deployment prep  

## Known limitations

- No search, routing, or live data yet
- No booking
- Secrets must live in env vars; never in client code
