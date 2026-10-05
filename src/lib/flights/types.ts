export type FlightProviderId =
  | "DATASET"
  | "AKASA"
  | "AIR_INDIA"
  | "INDIGO"
  | "SPICEJET"
  | "MAKEMYTRIP"
  | "IXIGO"
  | "SKYSCANNER";

export type ProviderSourceType =
  | "DATASET_SNAPSHOT"
  | "AIRLINE_DIRECT"
  | "NDC"
  | "OTA"
  | "AGGREGATOR";

export type OperatingStatus =
  | "SCHEDULED"
  | "OPERATING"
  | "CANCELLED"
  | "UNKNOWN";

export type AvailabilityStatus =
  | "AVAILABLE"
  | "SOLD_OUT"
  | "UNKNOWN";

export type VerificationConfidence = "HIGH" | "MEDIUM" | "LOW";

export type ProviderStatusCode =
  | "SUCCESS"
  | "NO_FLIGHTS"
  | "ERROR"
  | "TIMEOUT"
  | "UNCONFIGURED"
  | "RATE_LIMITED";

export interface FlightSource {
  provider: FlightProviderId;
  providerName: string;
  retrievedAt: string; // ISO 8601
  sourceType: ProviderSourceType;
  price?: number;
  currency?: string;
  availabilityChecked?: boolean;
  referenceUrl?: string;
}

export interface FlightOffer {
  id: string;
  provider: FlightProviderId;
  providerName: string;
  sourceType: ProviderSourceType;
  baseFare: number;
  taxes: number;
  totalAmount: number;
  currency: string;
  fareFamily?: string;
  availability: AvailabilityStatus;
  seatsRemaining?: number;
  retrievedAt: string; // ISO 8601
  bookingUrl: string;
  isDirectAirlineOffer: boolean;
}

export interface VerificationCheck {
  checkId: string;
  name: string;
  passed: boolean;
  details: string;
}

export interface FlightVerification {
  verified: boolean;
  verifiedAt: string; // ISO 8601
  confidence: VerificationConfidence;
  summary: string;
  operatingDays?: string[];
  checks: VerificationCheck[];
}

export interface FlightStopDetail {
  airportCode: string;
  airportName?: string;
  durationMinutes?: number;
}

export interface Flight {
  id: string; // Canonical key
  airline: {
    code: string; // 6E, AI, QP, IX, SG
    name: string; // IndiGo, Air India, Akasa Air, etc.
    logo?: string;
  };
  flightNumber: string; // e.g. "6E 2134"
  departure: {
    airportCode: string;
    airportName?: string;
    terminal?: string;
    scheduledTime: string; // ISO 8601 with local timezone offset, e.g. "2026-10-15T06:15:00+05:30"
    timezone: string; // e.g. "Asia/Kolkata"
  };
  arrival: {
    airportCode: string;
    airportName?: string;
    terminal?: string;
    scheduledTime: string; // ISO 8601 with local timezone offset
    timezone: string; // e.g. "Asia/Kolkata"
  };
  durationMinutes: number;
  stops: number;
  stopDetails?: FlightStopDetail[];
  aircraft?: string; // e.g. "Airbus A321neo", "Boeing 737 MAX 8"
  cabinClass?: string;
  fare: {
    baseFare: number;
    taxes: number;
    totalAmount: number;
    currency: string;
    fareType?: string;
  };
  availability: {
    status: AvailabilityStatus;
    seatsRemaining?: number;
    verifiedAt?: string;
  };
  operatingStatus: OperatingStatus;
  operatingDays?: string[]; // e.g. ["Mon", "Wed", "Fri"] or ["Daily"]
  sources: FlightSource[];
  offers: FlightOffer[];
  verification: FlightVerification;
  bookingUrl: string;
}

export interface FlightSearchRequest {
  origin: string; // 3-letter IATA code, e.g. "BLR"
  destination: string; // 3-letter IATA code, e.g. "DEL"
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD for round-trip
  passengers?: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabinClass?: "Economy" | "Premium Economy" | "Business" | "First";
  directOnly?: boolean;
  preferredAirlines?: string[];
  maxStops?: number;
  sortPreference?:
    | "recommended"
    | "price_low_high"
    | "departure_earliest"
    | "arrival_earliest"
    | "duration_shortest";
  includeUnverified?: boolean;
}

export interface ProviderDiagnostic {
  providerId: FlightProviderId;
  providerName: string;
  status: ProviderStatusCode;
  durationMs: number;
  flightsFound: number;
  errorMessage?: string;
}

export interface FlightSearchDiagnostics {
  searchId: string;
  timestamp: string;
  origin: string;
  destination: string;
  date: string;
  totalRawFlightsReceived: number;
  afterNormalizationCount: number;
  afterDeduplicationCount: number;
  afterDateValidationCount: number;
  afterCancellationFilteringCount: number;
  afterAvailabilityVerificationCount: number;
  finalVerifiedFlightsCount: number;
  providerDiagnostics: Record<FlightProviderId, ProviderDiagnostic>;
}

export interface FlightSearchResponse {
  searchId: string;
  request: FlightSearchRequest;
  results: Flight[];
  providers: Record<FlightProviderId, ProviderStatusCode>;
  diagnostics: FlightSearchDiagnostics;
}
