import { TravelSegment } from "../types";

export interface FlightSearchParams {
  originCode: string;
  destinationCode: string;
  date: string; // YYYY-MM-DD
}

export interface TrainSearchParams {
  originCode: string;
  destinationCode: string;
  date: string; // YYYY-MM-DD
}

export interface BusSearchParams {
  originCode: string;
  destinationCode: string;
  date: string; // YYYY-MM-DD
}

export interface FlightProvider {
  searchFlights(params: FlightSearchParams): Promise<TravelSegment[]>;
  getAllAvailableFlights(date: string): Promise<TravelSegment[]>;
}

export interface TrainProvider {
  searchTrains(params: TrainSearchParams): Promise<TravelSegment[]>;
  getAllAvailableTrains(date: string, originCodes?: string[], destinationCodes?: string[]): Promise<TravelSegment[]>;
}

export interface BusProvider {
  searchBuses(params: BusSearchParams): Promise<TravelSegment[]>;
  getAllAvailableBuses(date: string): Promise<TravelSegment[]>;
}
