import { MockFlightProvider } from "@/lib/providers/flights/mock-flight-provider";
import { RealFlightProvider } from "@/lib/providers/flights/real-flight-provider";
import { MockGeocodingProvider } from "@/lib/providers/maps/mock-geocoding-provider";
import { RealGeocodingProvider } from "@/lib/providers/maps/geocoding-provider";
import { MockTrainProvider } from "@/lib/providers/trains/mock-train-provider";
import { RealTrainProvider } from "@/lib/providers/trains/real-train-provider";
import type {
  FlightProvider,
  GeocodingProvider,
  TrainProvider,
} from "@/lib/types/travel";

export function useMockProviders(): boolean {
  return process.env.USE_MOCK_PROVIDERS !== "false";
}

export function getFlightProvider(): FlightProvider {
  if (useMockProviders()) {
    return new MockFlightProvider();
  }
  return new RealFlightProvider();
}

export function getTrainProvider(): TrainProvider {
  if (useMockProviders()) {
    return new MockTrainProvider();
  }
  return new RealTrainProvider();
}

export function getGeocodingProvider(): GeocodingProvider {
  if (useMockProviders()) {
    return new MockGeocodingProvider();
  }
  return new RealGeocodingProvider();
}
