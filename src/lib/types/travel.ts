export type TransportType = "flight" | "train";

export type OptimizationMode =
  | "best_balance"
  | "cheapest"
  | "fastest"
  | "highest_confidence";

export type LocationKind = "airport" | "station";

export type RiskLevel = "none" | "low" | "medium" | "high";

export interface City {
  id: string;
  name: string;
}

export interface Place {
  id: string;
  cityId: string;
  cityName: string;
  name: string;
  kind: LocationKind;
}

export interface TravelSegment {
  id: string;
  type: TransportType;
  operator: string;
  operatorId: string;
  from: Place;
  to: Place;
  departure: string;
  arrival: string;
  durationMinutes: number;
  price: number;
  currency: "INR";
  baseFare: number;
  taxes: number;
  fees: number;
  reliability: number;
}

export interface TravelRoute {
  id: string;
  segments: TravelSegment[];
  totalPrice: number;
  totalDurationMinutes: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
  deadlineBufferMinutes: number;
  estimatedArrivalConfidence: number;
  score: number;
  waitingMinutes: number;
  transferMinutes: number;
  delayRisk: RiskLevel;
  connectionRisk: RiskLevel;
  missesDeadline: boolean;
  explanation: string;
}

export interface SearchInput {
  origin: string;
  destination: string;
  date: string;
  arriveBy: string;
  budget: number;
  optimization: OptimizationMode;
  includeMissedDeadline: boolean;
}

export interface SearchSummary {
  fastestId: string | null;
  cheapestId: string | null;
  highestConfidenceId: string | null;
  bestBalanceId: string | null;
}

export interface SearchResponse {
  demoData: boolean;
  search: SearchInput;
  routes: TravelRoute[];
  hiddenMissedDeadline: number;
  summary: SearchSummary;
}

export interface DelaySimulation {
  delayMinutes: number;
  arrivalTime: string;
  deadlineBufferMinutes: number;
  estimatedArrivalConfidence: number;
  connectionViable: boolean;
  status: "ok" | "tight" | "missed_connection" | "missed_deadline";
  alternative: TravelRoute | null;
}

export interface FlightSearchParams {
  originCity: string;
  destinationCity?: string;
  date: string;
}

export interface TrainSearchParams {
  originCity: string;
  destinationCity?: string;
  date: string;
}

export interface FlightProvider {
  searchFlights(params: FlightSearchParams): Promise<TravelSegment[]>;
}

export interface TrainProvider {
  searchTrains(params: TrainSearchParams): Promise<TravelSegment[]>;
}

export interface GeoCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface GeocodingProvider {
  resolveCity(query: string): Promise<GeoCity | null>;
  listCities(): Promise<GeoCity[]>;
}
