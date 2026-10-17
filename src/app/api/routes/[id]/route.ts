import { AppError } from "@/lib/errors";
import { jsonError } from "@/lib/http";
import { findRouteById } from "@/lib/routing/route-engine";
import { runSearch } from "@/lib/search/run-search";
import { parseSearchInput } from "@/lib/validation/search";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const input = parseSearchInput(Object.fromEntries(url.searchParams.entries()));
    const result = await runSearch(input);
    const route = findRouteById(result.routes, id);
    if (!route) {
      throw new AppError("route_not_found", "That route is no longer available.", 404);
    }
    return Response.json({ demoData: result.demoData, search: result.search, route });
  } catch (error) {
    return jsonError(error);
  }
}
