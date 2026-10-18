export type TransportType = "flight" | "train" | "bus";

export type OptimizationMode =
  | "best_balance"
  | "cheapest"
  | "fastest"
  | "highest_confidence";

export type ProviderSource =
  | "IRCTC"
  | "Skyscanner"
  | "Ixigo"
  | "Goibibo"
  | "RedBus"
  | "Dataset snapshot";

export interface SeatAvailability {
  status: "available" | "rac" | "waitlist" | "few_left" | "unknown";
  count?: number;
  label: string; // e.g. "Available - 28 Seats", "WL 14", "RAC 6", "4 seats left"
  travelClass?: string; // e.g. "Economy", "3A", "2A", "CC", "Sleeper AC"
}

export interface PriceTrend {
  label: string; // e.g. "₹520 below historical average", "Price likely to rise in 12h"
  direction: "down" | "stable" | "up";
  difference?: number; // e.g. -520
}

export interface CityHub {
  id: string;
  name: string;
  state: string;
  airportCode: string;
  airportName: string;
  stationCode: string;
  stationName: string;
  nearbyStationCodes?: string[];
  busTerminalCode: string;
  busTerminalName: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  trainsCalling?: number;
  firstDeparture?: string;
  lastDeparture?: string;
}

export interface InterchangeTransit {
  fromNodeCode: string;
  toNodeCode: string;
  cityId: string;
  mode: "metro" | "cab" | "shuttle" | "walk";
  durationMinutes: number;
  description: string;
  estCost: number;
  distanceKm?: number;
}

export interface RouteEndpointTransfer extends InterchangeTransit {
  placement: "origin" | "destination";
}

export type SegmentDataSource = "mock" | "dataset-snapshot" | "live-api";

export interface TravelSegment {
  id: string;
  type: TransportType;
  operator: string;
  operatorCode: string;
  segmentNumber: string; // e.g. "6E 2134", "12658", or "KA-01-F-9921"
  fromCode: string;      // Airport, Station, or Bus terminal code
  fromName: string;
  toCode: string;        // Airport, Station, or Bus terminal code
  toName: string;
  departureTime: string; // ISO string
  arrivalTime: string;   // ISO string
  durationMinutes: number;
  price: number;
  baseFare: number;
  taxes: number;
  reliabilityScore: number; // 0-100 heuristic historical punctuality
  providerSource: ProviderSource;
  seatAvailability?: SeatAvailability;
  priceTrend?: PriceTrend;
  bookingUrl?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  // Train mid-route boarding/deboarding details
  trainOrigin?: string;
  trainTerminus?: string;
  stopsBetween?: number;
  journeyDayOffset?: number;
  distanceKm?: number;
  // Data provenance & honesty attributes
  dataSource?: SegmentDataSource;
  dataAsOf?: string;
  runningDays?: "daily" | string[] | "unknown";
  flightDetails?: import("./flights/types").Flight;
}

export interface ScoreBreakdown {
  priceScore: number;
  timeScore: number;
  reliabilityScore: number;
  deadlineScore: number;
  transferScore: number;
}

export interface DelaySimulationImpact {
  delayMinutes: number;
  originalArrivalTime: string;
  newArrivalTime: string;
  originalBufferMinutes: number;
  newBufferMinutes: number;
  originalConfidence: number;
  newConfidence: number;
  isViable: boolean;
  transferBroken: boolean;
  missesDeadline: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  suggestedAlternativeRouteId?: string;
}

export interface TravelRoute {
  id: string;
  segments: TravelSegment[];
  interchanges?: InterchangeTransit[];
  endpointTransfers?: RouteEndpointTransfer[];
  totalPrice: number;
  totalDurationMinutes: number;
  totalDistanceKm?: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
  deadlineBufferMinutes: number | null;
  estimatedArrivalConfidence: number;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  explanation: string;
  isFeasible: boolean;
  disqualificationReason?: string;
  categoryBadge?: "BEST BALANCE" | "FASTEST" | "CHEAPEST" | "SAFEST" | "FESTIVAL RUSH INTERCHANGE" | "NEAREST AIRPORT COMBO";
}

export interface SearchRequest {
  origin: string;        // City hub id
  destination: string;   // City hub id
  date: string;          // YYYY-MM-DD
  arriveBy?: string;     // YYYY-MM-DDTHH:mm; omitted means no arrival deadline
  budget?: number;
  optimization: OptimizationMode;
  showMissedDeadlines?: boolean;
}

export interface RouteSummary {
  bestBalance?: TravelRoute;
  fastest?: TravelRoute;
  cheapest?: TravelRoute;
  highestConfidence?: TravelRoute;
  totalRoutesFound: number;
  feasibleRoutesCount: number;
  directRoutesCount?: number;
  connectingRoutesCount?: number;
  dynamicPricingAdvisory?: string;
  corridorCircumstancesAdvisory?: string;
}

export interface SearchResponse {
  search: SearchRequest;
  summary: RouteSummary;
  routes: TravelRoute[];
  unfeasibleRoutes: TravelRoute[];
  isDemoData: boolean;
  stationWarnings?: string[];
  networkMaps?: {
    rail: { imageUrl: string; sourceUrl: string; sourceLabel: string; routeUrl?: string };
    airports: { imageUrl: string; sourceUrl: string; sourceLabel: string; routeUrl?: string };
    roads: { imageUrl: string; sourceUrl: string; sourceLabel: string; routeUrl?: string };
  };
}
