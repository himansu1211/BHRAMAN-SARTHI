import { generateAiExplanation } from "@/lib/ai/explain-route";
import { AppError } from "@/lib/errors";
import { jsonError } from "@/lib/http";
import { findRouteById } from "@/lib/routing/route-engine";
import { runSearch } from "@/lib/search/run-search";
import { parseSearchInput } from "@/lib/validation/search";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.routeId !== "string") {
      throw new AppError("invalid_input", "Missing route.");
    }
    const input = parseSearchInput(body);
    const result = await runSearch({ ...input, includeMissedDeadline: true });
    const route = findRouteById(result.routes, body.routeId);
    if (!route) {
      throw new AppError("route_not_found", "That route is no longer available.", 404);
    }
    const explanation = await generateAiExplanation(route);
    return Response.json({ explanation, source: process.env.OPENAI_API_KEY ? "openai" : "template" });
  } catch (error) {
    return jsonError(error);
  }
}
