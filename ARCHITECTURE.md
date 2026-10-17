# Architecture

TypeScript Next.js app. Route math stays on the server. UI does not own scoring.

## Modules (target)

| Area | Path | Role |
| --- | --- | --- |
| App routes | `src/app` | Pages and API routes |
| Layout UI | `src/components/layout` | Header, footer, shell |
| Routing engine | `src/lib/routing` | Combine segments, validate connections, deadlines, scores |
| Providers | `src/lib/providers` | Flight/train/maps adapters (interface + mock, later real) |
| AI | `src/lib/ai` | Optional explanations from structured route data only |

## Data

Supabase/PostgreSQL later. Until then, typed mock providers behind interfaces.

## Config

Connection buffers, scoring weights, and env-backed secrets live in config — not in UI.
