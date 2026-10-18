import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchRoutes } from "../lib/routing/route-engine";

const server = new McpServer({
  name: "routewise-india-travel",
  version: "1.0.0",
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
const iataSchema = z.string().trim().length(3).transform((value) => value.toUpperCase());

function result(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function toolError(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

async function tripjackPost<T>(endpointEnv: string, body: unknown): Promise<T> {
  const endpoint = process.env[endpointEnv];
  const apiKey = process.env.TRIPJACK_API_KEY;
  if (!endpoint || !apiKey) {
    throw new Error(`${endpointEnv} and TRIPJACK_API_KEY must be configured on the server.`);
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error(`${endpointEnv} must be a full HTTPS URL.`);
  }
  if (url.protocol !== "https:") throw new Error(`${endpointEnv} must use HTTPS.`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`TripJack returned HTTP ${response.status}.`);
  return (await response.json()) as T;
}

server.tool(
  "search_indian_routes",
  "Find direct and connecting train, flight, and bus itineraries between Indian cities using RouteWise route data. Snapshot schedules and estimated fares are clearly identified in the result.",
  {
    origin: z.string().trim().min(2).describe("Origin city or supported RouteWise transit hub."),
    destination: z.string().trim().min(2).describe("Destination city or supported RouteWise transit hub."),
    date: dateSchema.describe("Departure date in YYYY-MM-DD format."),
    arriveBy: z.string().datetime({ offset: true }).optional().describe("Optional arrival deadline as an ISO 8601 timestamp with timezone offset."),
    optimization: z.enum(["best_balance", "fastest", "cheapest", "highest_confidence"]).default("fastest"),
    budget: z.number().positive().optional(),
  },
  async ({ origin, destination, date, arriveBy, optimization, budget }) => {
    try {
      const data = await searchRoutes({
        origin,
        destination,
        date,
        arriveBy,
        optimization,
        budget,
      });
      return result(data);
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "Route search failed.");
    }
  },
);

server.tool(
  "get_flight_data",
  "Search TripJack for flight options on a route and date. Requires a TripJack partner key and the full flight-search API URL configured on the server; no sample or invented fares are returned.",
  {
    departureCity: iataSchema.describe("Three-letter origin airport IATA code, such as BLR."),
    arrivalCity: iataSchema.describe("Three-letter destination airport IATA code, such as HYD."),
    travelDate: dateSchema.describe("Departure date in YYYY-MM-DD format."),
    adults: z.number().int().min(1).max(9).default(1),
  },
  async ({ departureCity, arrivalCity, travelDate, adults }) => {
    try {
      if (departureCity === arrivalCity) return toolError("Origin and destination airports must differ.");
      const data = await tripjackPost("TRIPJACK_FLIGHT_SEARCH_URL", {
        departureCity,
        arrivalCity,
        travelDate,
        adults,
      });
      return result(data);
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "TripJack flight search failed.");
    }
  },
);

server.tool(
  "book_best_flight",
  "Submit a selected TripJack flight offer for booking. Booking is a real purchase: it is disabled unless the server operator enables it, and this tool additionally requires explicit human confirmation in the request.",
  {
    priceId: z.string().trim().min(1),
    passengers: z.object({
      adults: z.array(z.object({
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().min(1),
        title: z.string().trim().min(1),
      })).min(1),
    }),
    contactInfo: z.object({
      email: z.string().email(),
      phone: z.string().trim().regex(/^\+?[\d\s()-]{8,20}$/),
    }),
    confirmBooking: z.literal(true).describe("Must be true only after the traveler has reviewed the final itinerary and price and directly authorized this booking."),
  },
  async ({ priceId, passengers, contactInfo, confirmBooking }) => {
    if (!confirmBooking) return toolError("Booking requires explicit human confirmation.");
    if (process.env.TRIPJACK_ENABLE_BOOKING !== "true") {
      return toolError("Booking is disabled. The server operator must configure and enable TripJack booking after completing partner API setup.");
    }
    try {
      const data = await tripjackPost("TRIPJACK_BOOK_URL", { priceId, passengers, contactInfo });
      return result(data);
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "TripJack booking failed.");
    }
  },
);

server.tool(
  "get_ticket_info",
  "Retrieve a TripJack booking or ticket status by booking ID. Requires a TripJack partner key and booking-details URL configured on the server.",
  { bookingId: z.string().trim().min(1) },
  async ({ bookingId }) => {
    try {
      return result(await tripjackPost("TRIPJACK_TICKET_INFO_URL", { bookingId }));
    } catch (error) {
      return toolError(error instanceof Error ? error.message : "TripJack ticket lookup failed.");
    }
  },
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error("RouteWise MCP server connected over stdio.");
}

main().catch((error: unknown) => {
  console.error("RouteWise MCP startup failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
