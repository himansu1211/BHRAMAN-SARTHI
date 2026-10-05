import { validate, type LiveProvider } from "./provider";
import type { LiveOption, LiveQuery, ProviderStatus } from "./types";

export type StreamEvent =
  | { type: "options"; provider: string; options: LiveOption[] }
  | { type: "status"; status: ProviderStatus }
  | { type: "done" };

const TIMEOUT_MS = 12_000;
const cache = new Map<string, { at: number; opts: LiveOption[] }>();
const TTL = 120_000; // 2 min: schedules/availability must stay fresh

/** Skyscanner-style fan-out: all providers in parallel, each result emitted the moment it arrives. */
export async function* searchLive(q: LiveQuery, providers: LiveProvider[]): AsyncGenerator<StreamEvent> {
  const queue: StreamEvent[] = [];
  let wake: (() => void) | null = null;
  const push = (e: StreamEvent) => { queue.push(e); wake?.(); };

  const jobs = providers.map(async (p) => {
    const t0 = Date.now();
    const key = `${p.name}|${q.fromCity}|${q.toCity}|${q.date}`;
    try {
      const hit = cache.get(key);
      let opts: LiveOption[];
      if (hit && Date.now() - hit.at < TTL) opts = hit.opts;
      else {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
        try { opts = await p.fetch(q, ctl.signal); } finally { clearTimeout(timer); }
        opts = opts.filter((o) => validate(o) === null);
        cache.set(key, { at: Date.now(), opts });
      }
      if (opts.length) push({ type: "options", provider: p.name, options: opts });
      push({ type: "status", status: { provider: p.name, state: opts.length ? "ok" : "empty", count: opts.length, ms: Date.now() - t0 } });
    } catch (e) {
      push({ type: "status", status: { provider: p.name, state: "unavailable", detail: (e as Error).message, count: 0, ms: Date.now() - t0 } });
    }
  });

  let finished = false;
  Promise.allSettled(jobs).then(() => { finished = true; wake?.(); });
  while (!finished || queue.length) {
    if (!queue.length) await new Promise<void>((r) => (wake = r));
    while (queue.length) yield queue.shift()!;
  }
  yield { type: "done" };
}
