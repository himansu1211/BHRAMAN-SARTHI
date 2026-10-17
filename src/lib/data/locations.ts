import type { City, GeoCity, Place } from "@/lib/types/travel";

export const CITIES: City[] = [
  { id: "bangalore", name: "Bangalore" },
  { id: "delhi", name: "Delhi" },
  { id: "mumbai", name: "Mumbai" },
  { id: "hyderabad", name: "Hyderabad" },
  { id: "chennai", name: "Chennai" },
  { id: "pune", name: "Pune" },
  { id: "kolkata", name: "Kolkata" },
];

export const CITY_COORDS: Record<string, Omit<GeoCity, "id" | "name">> = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  pune: { lat: 18.5204, lng: 73.8567 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

export const PLACES: Record<string, Place> = {
  BLR: {
    id: "BLR",
    cityId: "bangalore",
    cityName: "Bangalore",
    name: "Kempegowda Intl (BLR)",
    kind: "airport",
  },
  SBC: {
    id: "SBC",
    cityId: "bangalore",
    cityName: "Bangalore",
    name: "KSR Bengaluru (SBC)",
    kind: "station",
  },
  YPR: {
    id: "YPR",
    cityId: "bangalore",
    cityName: "Bangalore",
    name: "Yesvantpur (YPR)",
    kind: "station",
  },
  DEL: {
    id: "DEL",
    cityId: "delhi",
    cityName: "Delhi",
    name: "Indira Gandhi Intl (DEL)",
    kind: "airport",
  },
  NDLS: {
    id: "NDLS",
    cityId: "delhi",
    cityName: "Delhi",
    name: "New Delhi (NDLS)",
    kind: "station",
  },
  DLI: {
    id: "DLI",
    cityId: "delhi",
    cityName: "Delhi",
    name: "Delhi Jn (DLI)",
    kind: "station",
  },
  BOM: {
    id: "BOM",
    cityId: "mumbai",
    cityName: "Mumbai",
    name: "Chhatrapati Shivaji Intl (BOM)",
    kind: "airport",
  },
  CSMT: {
    id: "CSMT",
    cityId: "mumbai",
    cityName: "Mumbai",
    name: "CSMT",
    kind: "station",
  },
  HYD: {
    id: "HYD",
    cityId: "hyderabad",
    cityName: "Hyderabad",
    name: "Rajiv Gandhi Intl (HYD)",
    kind: "airport",
  },
  SC: {
    id: "SC",
    cityId: "hyderabad",
    cityName: "Hyderabad",
    name: "Secunderabad (SC)",
    kind: "station",
  },
  MAA: {
    id: "MAA",
    cityId: "chennai",
    cityName: "Chennai",
    name: "Chennai Intl (MAA)",
    kind: "airport",
  },
  MAS: {
    id: "MAS",
    cityId: "chennai",
    cityName: "Chennai",
    name: "Chennai Central (MAS)",
    kind: "station",
  },
  PNQ: {
    id: "PNQ",
    cityId: "pune",
    cityName: "Pune",
    name: "Pune Intl (PNQ)",
    kind: "airport",
  },
  PUNE: {
    id: "PUNE",
    cityId: "pune",
    cityName: "Pune",
    name: "Pune Jn (PUNE)",
    kind: "station",
  },
  CCU: {
    id: "CCU",
    cityId: "kolkata",
    cityName: "Kolkata",
    name: "Netaji Subhas Chandra Bose (CCU)",
    kind: "airport",
  },
  HWH: {
    id: "HWH",
    cityId: "kolkata",
    cityName: "Kolkata",
    name: "Howrah (HWH)",
    kind: "station",
  },
};

export function getPlace(id: string): Place {
  const place = PLACES[id];
  if (!place) {
    throw new Error(`Unknown place: ${id}`);
  }
  return place;
}

export function getCity(id: string): City | undefined {
  return CITIES.find((city) => city.id === id);
}
