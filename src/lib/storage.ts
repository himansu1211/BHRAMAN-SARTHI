import { OptimizationMode, SearchRequest, TravelRoute } from "./types";
import { resolveCityHub } from "./data-lookup";

export interface RecentSearchItem {
  id: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  date: string;
  arriveBy?: string;
  budget?: number;
  optimization: OptimizationMode;
  showMissedDeadlines?: boolean;
  searchedAt: string;
  routeCount?: number;
}

export interface SavedTripItem {
  id: string;
  savedAt: string;
  route: TravelRoute;
  searchRequest: SearchRequest;
}

const RECENT_SEARCHES_KEY = "bhraman_recent_searches_v1";
const SAVED_TRIPS_KEY = "bhraman_saved_trips_v1";
const MAX_RECENT_SEARCHES = 30;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyStorageChange() {
  if (isBrowser()) {
    try {
      window.dispatchEvent(new CustomEvent("bhraman-storage-updated"));
    } catch {
      // ignore
    }
  }
}

function getHubName(idOrCode: string): string {
  try {
    const hub = resolveCityHub(idOrCode);
    return hub.name || idOrCode;
  } catch {
    return idOrCode;
  }
}

/* ─── Recent Searches (Permanent Local Storage) ─────────────────── */

export function getRecentSearches(): RecentSearchItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read recent searches from localStorage", err);
    return [];
  }
}

export function saveRecentSearch(request: SearchRequest, routeCount?: number): RecentSearchItem {
  const originName = getHubName(request.origin);
  const destinationName = getHubName(request.destination);

  const newItem: RecentSearchItem = {
    id: `srch_${Date.now()}_${request.origin}_${request.destination}`,
    origin: request.origin,
    originName,
    destination: request.destination,
    destinationName,
    date: request.date,
    arriveBy: request.arriveBy,
    budget: request.budget,
    optimization: request.optimization,
    showMissedDeadlines: request.showMissedDeadlines,
    searchedAt: new Date().toISOString(),
    routeCount,
  };

  if (!isBrowser()) return newItem;

  try {
    const existing = getRecentSearches();

    // Deduplicate: remove previous search with exact same origin, destination, and date
    const filtered = existing.filter(
      (item) =>
        !(
          item.origin.toUpperCase() === request.origin.toUpperCase() &&
          item.destination.toUpperCase() === request.destination.toUpperCase() &&
          item.date === request.date
        )
    );

    // Prepend new search at top
    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    notifyStorageChange();
  } catch (err) {
    console.warn("Failed to save recent search to localStorage", err);
  }

  return newItem;
}

export function deleteRecentSearch(id: string): void {
  if (!isBrowser()) return;
  try {
    const existing = getRecentSearches();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    notifyStorageChange();
  } catch (err) {
    console.warn("Failed to delete recent search from localStorage", err);
  }
}

export function clearRecentSearches(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    notifyStorageChange();
  } catch (err) {
    console.warn("Failed to clear recent searches from localStorage", err);
  }
}

/* ─── Saved Trips (Permanent Local Storage) ─────────────────────── */

export function getSavedTrips(): SavedTripItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read saved trips from localStorage", err);
    return [];
  }
}

export function saveTrip(route: TravelRoute, searchRequest: SearchRequest): SavedTripItem {
  const newItem: SavedTripItem = {
    id: route.id,
    savedAt: new Date().toISOString(),
    route,
    searchRequest,
  };

  if (!isBrowser()) return newItem;

  try {
    const existing = getSavedTrips();
    const filtered = existing.filter((item) => item.id !== route.id);
    const updated = [newItem, ...filtered];
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updated));
    notifyStorageChange();
  } catch (err) {
    console.warn("Failed to save trip to localStorage", err);
  }

  return newItem;
}

export function removeSavedTrip(id: string): void {
  if (!isBrowser()) return;
  try {
    const existing = getSavedTrips();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updated));
    notifyStorageChange();
  } catch (err) {
    console.warn("Failed to remove saved trip from localStorage", err);
  }
}

export function isTripSaved(routeId: string): boolean {
  if (!isBrowser()) return false;
  try {
    const existing = getSavedTrips();
    return existing.some((item) => item.id === routeId);
  } catch {
    return false;
  }
}
