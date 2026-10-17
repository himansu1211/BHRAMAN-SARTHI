import { jsonError } from "@/lib/http";
import { runSearch } from "@/lib/search/run-search";
import { parseSearchInput } from "@/lib/validation/search";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const input = parseSearchInput(Object.fromEntries(url.searchParams.entries()));
    const result = await runSearch(input);
    return Response.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseSearchInput(body);
    const result = await runSearch(input);
    return Response.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
