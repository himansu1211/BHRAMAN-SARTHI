import { AppError } from "@/lib/errors";
import { jsonError } from "@/lib/http";
import { simulateFirstSegmentDelay } from "@/lib/routing/delay-simulator";
import { findRouteById } from "@/lib/routing/route-engine";
import { runSearch } from "@/lib/search/run-search";
import { parseSearchInput } from "@/lib/validation/search";
import { DELAY_OPTIONS_MINUTES } from "@/lib/config/app";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const delayMinutes = Number(body.delayMinutes);
    if (!DELAY_OPTIONS_MINUTES.includes(delayMinutes as (typeof DELAY_OPTIONS_MINUTES)[number])) {
      throw new AppError("invalid_delay", "Choose a supported delay option.");
    }
    if (typeof body.routeId !== "string") {
      throw new AppError("invalid_input", "Missing route.");
    }

    const input = parseSearchInput(body);
    const result = await runSearch({ ...input, includeMissedDeadline: true });
    const route = findRouteById(result.routes, body.routeId);
    if (!route) {
      throw new AppError("route_not_found", "That route is no longer available.", 404);
    }

    const simulation = simulateFirstSegmentDelay(
      route,
      delayMinutes,
      input.arriveBy,
      result.routes,
    );
    return Response.json({ demoData: result.demoData, simulation });
  } catch (error) {
    return jsonError(error);
  }
}
