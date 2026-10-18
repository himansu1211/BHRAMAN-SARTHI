import {
  Flight,
  FlightProviderId,
  FlightSearchRequest,
  ProviderStatusCode,
  ProviderSourceType,
} from "../types";

export interface FlightProviderResult {
  providerId: FlightProviderId;
  providerName: string;
  sourceType: ProviderSourceType;
  status: ProviderStatusCode;
  flights: Flight[];
  durationMs: number;
  errorMessage?: string;
  retrievedAt: string;
}

export interface BaseFlightProvider {
  readonly name: string;
  readonly providerId: FlightProviderId;
  readonly sourceType: ProviderSourceType;
  isConfigured(): boolean;
  searchFlights(request: FlightSearchRequest): Promise<FlightProviderResult>;
}
