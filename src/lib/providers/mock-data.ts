import { ProviderSource, SeatAvailability, PriceTrend, TravelSegment } from "../types";
import { INDIAN_CITIES } from "../constants";
import { buildFlightDeepLink, buildTrainDeepLink, buildBusDeepLink } from "../booking-links";

export interface MockScheduleSeed {
  type: "flight" | "train" | "bus";
  operator: string;
  operatorCode: string;
  segmentNumber: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  departHour: number;
  departMin: number;
  durationMinutes: number;
  baseFare: number;
  taxes: number;
  reliabilityScore: number;
  providerSource: ProviderSource;
  seatAvailability: SeatAvailability;
  priceTrend: PriceTrend;
  zone?: string;
  latitude?: number;
  longitude?: number;
}

export const MOCK_SCHEDULE_SEEDS: MockScheduleSeed[] = [
  // =========================================================================
  // BANGALORE (BLR/SBC/MJC) <--> DELHI (DEL/NDLS/ISBT)
  // =========================================================================
  {
    type: "flight",
    operator: "IndiGo",
    operatorCode: "6E",
    segmentNumber: "6E 2134",
    fromCode: "BLR",
    fromName: "Kempegowda Intl Airport",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport (T1)",
    departHour: 6,
    departMin: 15,
    durationMinutes: 165,
    baseFare: 5650,
    taxes: 950,
    reliabilityScore: 94,
    providerSource: "Skyscanner",
    seatAvailability: { status: "available", count: 18, label: "18 seats available", travelClass: "Economy" },
    priceTrend: { label: "₹720 below 7-day average", direction: "down", difference: -720 },
    latitude: 13.1979,
    longitude: 77.7063,
  },
  {
    type: "flight",
    operator: "Air India",
    operatorCode: "AI",
    segmentNumber: "AI 506",
    fromCode: "BLR",
    fromName: "Kempegowda Intl Airport",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport (T3)",
    departHour: 10,
    departMin: 30,
    durationMinutes: 170,
    baseFare: 6800,
    taxes: 1100,
    reliabilityScore: 91,
    providerSource: "Skyscanner",
    seatAvailability: { status: "few_left", count: 4, label: "Only 4 seats left at this fare", travelClass: "Economy" },
    priceTrend: { label: "Fare steady", direction: "stable" },
    latitude: 13.1979,
    longitude: 77.7063,
  },
  {
    type: "flight",
    operator: "Air India",
    operatorCode: "AI",
    segmentNumber: "AI 2812",
    fromCode: "BLR",
    fromName: "Kempegowda Intl Airport",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport (T3)",
    departHour: 14,
    departMin: 15,
    durationMinutes: 165,
    baseFare: 7200,
    taxes: 1250,
    reliabilityScore: 94,
    providerSource: "Skyscanner",
    seatAvailability: { status: "available", count: 26, label: "26 seats available", travelClass: "Economy" },
    priceTrend: { label: "Standard dynamic fare", direction: "stable" },
    latitude: 13.1979,
    longitude: 77.7063,
  },
  {
    type: "flight",
    operator: "Akasa Air",
    operatorCode: "QP",
    segmentNumber: "QP 1352",
    fromCode: "BLR",
    fromName: "Kempegowda Intl Airport",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport (T2)",
    departHour: 18,
    departMin: 45,
    durationMinutes: 175,
    baseFare: 4850,
    taxes: 850,
    reliabilityScore: 89,
    providerSource: "Ixigo",
    seatAvailability: { status: "few_left", count: 7, label: "7 seats remaining", travelClass: "Economy" },
    priceTrend: { label: "₹450 below seasonal avg", direction: "down", difference: -450 },
    latitude: 13.1979,
    longitude: 77.7063,
  },
  {
    type: "train",
    operator: "Indian Railways (Rajdhani Exp)",
    operatorCode: "IR",
    segmentNumber: "22691",
    fromCode: "SBC",
    fromName: "KSR Bengaluru City Junction",
    toCode: "NDLS",
    toName: "New Delhi Railway Station",
    departHour: 20,
    departMin: 0,
    durationMinutes: 2010, // ~33h 30m
    baseFare: 3650,
    taxes: 200,
    reliabilityScore: 87,
    providerSource: "Ixigo",
    seatAvailability: { status: "available", count: 32, label: "AVAILABLE - 32", travelClass: "3A AC" },
    priceTrend: { label: "Standard dynamic fare", direction: "stable" },
    zone: "SWR",
    latitude: 12.977595,
    longitude: 77.568083,
  },
  {
    type: "train",
    operator: "Indian Railways (Karnataka Exp)",
    operatorCode: "IR",
    segmentNumber: "12627",
    fromCode: "SBC",
    fromName: "KSR Bengaluru City Junction",
    toCode: "NDLS",
    toName: "New Delhi Railway Station",
    departHour: 19,
    departMin: 20,
    durationMinutes: 2280,
    baseFare: 1950,
    taxes: 120,
    reliabilityScore: 79,
    providerSource: "Ixigo",
    seatAvailability: { status: "rac", count: 6, label: "RAC 6", travelClass: "3A" },
    priceTrend: { label: "Fixed regular fare", direction: "stable" },
    zone: "SWR",
    latitude: 12.977595,
    longitude: 77.568083,
  },

  // =========================================================================
  // MULTIMODAL HUBS & INTERCHANGES (BOM, HYD, MAA, PNQ)
  // =========================================================================
  // BLR -> BOM (Flight)
  {
    type: "flight",
    operator: "IndiGo",
    operatorCode: "6E",
    segmentNumber: "6E 521",
    fromCode: "BLR",
    fromName: "Kempegowda Intl Airport",
    toCode: "BOM",
    toName: "Chhatrapati Shivaji Maharaj Intl",
    departHour: 7,
    departMin: 15,
    durationMinutes: 100, // arrives 08:55
    baseFare: 2900,
    taxes: 620,
    reliabilityScore: 93,
    providerSource: "Skyscanner",
    seatAvailability: { status: "available", count: 14, label: "14 seats available", travelClass: "Economy" },
    priceTrend: { label: "₹380 cheaper than afternoon slots", direction: "down" },
    latitude: 13.1979,
    longitude: 77.7063,
  },
  // BOM -> DEL (Flight)
  {
    type: "flight",
    operator: "Air India",
    operatorCode: "AI",
    segmentNumber: "AI 688",
    fromCode: "BOM",
    fromName: "Chhatrapati Shivaji Maharaj Intl",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport",
    departHour: 11,
    departMin: 45,
    durationMinutes: 130, // arrives 13:55
    baseFare: 3500,
    taxes: 720,
    reliabilityScore: 90,
    providerSource: "Skyscanner",
    seatAvailability: { status: "available", count: 21, label: "21 seats available", travelClass: "Economy" },
    priceTrend: { label: "Normal fare trend", direction: "stable" },
    latitude: 19.0887,
    longitude: 72.8679,
  },
  // BOM -> DEL (Train Tejas Rajdhani from MMCT)
  {
    type: "train",
    operator: "Indian Railways (Mumbai Tejas Rajdhani)",
    operatorCode: "IR",
    segmentNumber: "12951",
    fromCode: "MMCT",
    fromName: "Mumbai Central",
    toCode: "NDLS",
    toName: "New Delhi Railway Station",
    departHour: 17,
    departMin: 0,
    durationMinutes: 935, // 15h 35m -> arrives next morning 08:35
    baseFare: 3150,
    taxes: 210,
    reliabilityScore: 95,
    providerSource: "Ixigo",
    seatAvailability: { status: "available", count: 48, label: "AVAILABLE - 48", travelClass: "3A AC" },
    priceTrend: { label: "High demand weekend route", direction: "up" },
    zone: "CR",
    latitude: 18.944481,
    longitude: 72.836903,
  },

  // =========================================================================
  // INTERCITY BUS TRANSPORT (Volvo / AC Sleeper / Electric)
  // =========================================================================
  // BLR (Majestic) -> HYD (MGBS) Bus
  {
    type: "bus",
    operator: "KSRTC Airavat Club Class Multi-Axle",
    operatorCode: "KSRTC",
    segmentNumber: "KA-01-F-8812",
    fromCode: "MJC",
    fromName: "Majestic Central KSRTC Bus Terminal",
    toCode: "MGBS",
    toName: "Mahatma Gandhi Bus Station (MGBS)",
    departHour: 6,
    departMin: 30,
    durationMinutes: 510, // 8h 30m -> arrives 15:00
    baseFare: 1150,
    taxes: 60,
    reliabilityScore: 92,
    providerSource: "RedBus",
    seatAvailability: { status: "available", count: 16, label: "16 sleeper/semi-sleeper seats", travelClass: "Volvo Multi-Axle AC" },
    priceTrend: { label: "State transport fixed rate", direction: "stable" },
    latitude: 12.977595,
    longitude: 77.568083,
  },
  // HYD (Airport) -> DEL (Flight)
  {
    type: "flight",
    operator: "IndiGo",
    operatorCode: "6E",
    segmentNumber: "6E 892",
    fromCode: "HYD",
    fromName: "Rajiv Gandhi Intl Airport",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport",
    departHour: 18,
    departMin: 30,
    durationMinutes: 135, // arrives 20:45
    baseFare: 3750,
    taxes: 720,
    reliabilityScore: 93,
    providerSource: "Skyscanner",
    seatAvailability: { status: "available", count: 12, label: "12 seats left", travelClass: "Economy" },
    priceTrend: { label: "₹500 below peak fare", direction: "down", difference: -500 },
    latitude: 17.2313,
    longitude: 78.4298,
  },
  // BLR (SBC) -> MAA (MAS) Fast Vande Bharat Train
  {
    type: "train",
    operator: "Indian Railways (Vande Bharat)",
    operatorCode: "IR",
    segmentNumber: "20608",
    fromCode: "SBC",
    fromName: "KSR Bengaluru City Junction",
    toCode: "MAS",
    toName: "Puratchi Thalaivar Dr. MGR Central",
    departHour: 5,
    departMin: 45,
    durationMinutes: 260, // 4h 20m -> arrives 10:05
    baseFare: 980,
    taxes: 95,
    reliabilityScore: 96,
    providerSource: "Ixigo",
    seatAvailability: { status: "available", count: 42, label: "AVAILABLE - 42", travelClass: "Chair Car (CC)" },
    priceTrend: { label: "Dynamic IRCTC price tier", direction: "stable" },
    zone: "SWR",
    latitude: 12.977595,
    longitude: 77.568083,
  },
  // MAA (Chennai Airport) -> DEL (Flight)
  {
    type: "flight",
    operator: "IndiGo",
    operatorCode: "6E",
    segmentNumber: "6E 2018",
    fromCode: "MAA",
    fromName: "Chennai Intl Airport",
    toCode: "DEL",
    toName: "Indira Gandhi Intl Airport",
    departHour: 14,
    departMin: 30,
    durationMinutes: 170, // arrives 17:20
    baseFare: 4300,
    taxes: 820,
    reliabilityScore: 92,
    providerSource: "Ixigo",
    seatAvailability: { status: "few_left", count: 5, label: "5 seats left", travelClass: "Economy" },
    priceTrend: { label: "Ixigo guaranteed cashback available", direction: "down" },
    latitude: 12.9900,
    longitude: 80.1692,
  },

  // =========================================================================
  // PUNE, MUMBAI, JAIPUR, AHMEDABAD CORRIDORS
  // =========================================================================
  // BOM -> PNQ (MSRTC Shivneri Volvo Bus)
  {
    type: "bus",
    operator: "MSRTC Shivneri AC Volvo",
    operatorCode: "MSRTC",
    segmentNumber: "MH-14-BT-4021",
    fromCode: "DDR",
    fromName: "Dadar Asiad Intercity Terminal",
    toCode: "SWG",
    toName: "Swargate Central Bus Station",
    departHour: 7,
    departMin: 0,
    durationMinutes: 210, // 3h 30m via Mumbai-Pune Expressway
    baseFare: 540,
    taxes: 35,
    reliabilityScore: 95,
    providerSource: "RedBus",
    seatAvailability: { status: "available", count: 24, label: "24 seats available", travelClass: "AC Volvo 2+2" },
    priceTrend: { label: "Standard MSRTC fixed fare", direction: "stable" },
    latitude: 19.0197,
    longitude: 72.8434,
  },
  // DEL (ISBT Kashmere Gate) -> JAI (Sindhi Camp) Electric / AC Bus
  {
    type: "bus",
    operator: "Zingbus Electric Intercity",
    operatorCode: "ZING",
    segmentNumber: "DL-01-EB-1090",
    fromCode: "ISBT",
    fromName: "Maharana Pratap ISBT Kashmere Gate",
    toCode: "SCB",
    toName: "Sindhi Camp Central Bus Station",
    departHour: 8,
    departMin: 0,
    durationMinutes: 300, // 5 hours via Delhi-Mumbai Expressway
    baseFare: 650,
    taxes: 45,
    reliabilityScore: 94,
    providerSource: "RedBus",
    seatAvailability: { status: "available", count: 28, label: "28 seats available", travelClass: "Electric AC Sleeper" },
    priceTrend: { label: "₹180 off promo applied", direction: "down", difference: -180 },
    latitude: 28.6618,
    longitude: 77.2283,
  },
  // DEL -> JAI Vande Bharat Train
  {
    type: "train",
    operator: "Indian Railways (Vande Bharat)",
    operatorCode: "IR",
    segmentNumber: "20978",
    fromCode: "NDLS",
    fromName: "New Delhi Railway Station",
    toCode: "JP",
    toName: "Jaipur Junction Railway Station",
    departHour: 6,
    departMin: 10,
    durationMinutes: 235, // 3h 55m
    baseFare: 880,
    taxes: 85,
    reliabilityScore: 97,
    providerSource: "Ixigo",
    seatAvailability: { status: "available", count: 64, label: "AVAILABLE - 64", travelClass: "Executive Chair Car" },
    priceTrend: { label: "High punctuality index (97%)", direction: "stable" },
    zone: "NR",
    latitude: 28.642314,
    longitude: 77.220004,
  },
  // DEL -> LKO (Lucknow Tejas Express)
  {
    type: "train",
    operator: "Indian Railways (Tejas Express)",
    operatorCode: "IR",
    segmentNumber: "82502",
    fromCode: "NDLS",
    fromName: "New Delhi Railway Station",
    toCode: "LKO",
    toName: "Lucknow Charbagh NR Junction",
    departHour: 15,
    departMin: 40,
    durationMinutes: 375, // 6h 15m
    baseFare: 1450,
    taxes: 120,
    reliabilityScore: 95,
    providerSource: "Ixigo",
    seatAvailability: { status: "available", count: 38, label: "AVAILABLE - 38", travelClass: "AC Chair Car" },
    priceTrend: { label: "Free delay insurance included on Tejas", direction: "stable" },
    zone: "NR",
    latitude: 28.642314,
    longitude: 77.220004,
  },
];

// Haversine distance calculator in kilometers between two lat/lng points
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
  * Helper to construct exact Date object for specified Indian Standard Time (IST = UTC+5:30)
  */
function createIstTimestamp(dateStr: string, istHour: number, istMin: number): Date {
  const pad = (n: number) => String(n).padStart(2, "0");
  return new Date(`${dateStr}T${pad(istHour)}:${pad(istMin)}:00+05:30`);
}

/**
 * Accurate flight duration in minutes calibrated to commercial Indian airline routes
 */
function getAccurateFlightDuration(distKm: number): number {
  if (distKm < 300) return Math.round(55 + distKm * 0.04);
  if (distKm < 700) return Math.round(65 + (distKm - 300) * 0.06);
  if (distKm < 1300) return Math.round(90 + (distKm - 700) * 0.06);
  return Math.round(125 + (distKm - 1300) * 0.05);
}

/**
 * Dynamically synthesizes active transport corridor segments for any pair of cities in INDIAN_CITIES
 */
function synthesizeDynamicCorridors(dateStr: string): TravelSegment[] {
  const dynamicSegments: TravelSegment[] = [];

  for (let i = 0; i < INDIAN_CITIES.length; i++) {
    for (let j = 0; j < INDIAN_CITIES.length; j++) {
      if (i === j) continue;

      const origin = INDIAN_CITIES[i];
      const dest = INDIAN_CITIES[j];

      const dist = haversineKm(
        origin.latitude || 20.5937,
        origin.longitude || 78.9629,
        dest.latitude || 28.6139,
        dest.longitude || 77.209
      );

      // (Flight segments are supplied exclusively by DatasetFlightProvider using authentic commercial airline schedules from Google Flights, Skyscanner, MakeMyTrip, and active airlines)
      // (Train segments are supplied exclusively by DatasetTrainProvider with authentic RailRadar numbers and routes)

      // 3. BUS SEGMENTS (Intercity AC Volvo Timetables in IST)
      if (dist < 950) {
        const depB1 = createIstTimestamp(dateStr, 7, 30);
        const busDuration = Math.round(dist * 1.35 + 30);
        const arrB1 = new Date(depB1.getTime() + busDuration * 60 * 1000);
        const busFare = Math.round(220 + dist * 0.95);
        const busTax = 40;

        dynamicSegments.push({
          id: `dyn_bus_${origin.busTerminalCode}_${dest.busTerminalCode}`,
          type: "bus",
          operator: "State Transport / RedBus Intercity Volvo AC",
          operatorCode: "REDBUS",
          segmentNumber: `${origin.id.slice(0, 2)}-01-EX-${Math.floor(1000 + dist % 9000)}`,
          fromCode: origin.busTerminalCode,
          fromName: origin.busTerminalName,
          toCode: dest.busTerminalCode,
          toName: dest.busTerminalName,
          departureTime: depB1.toISOString(),
          arrivalTime: arrB1.toISOString(),
          durationMinutes: busDuration,
          price: busFare + busTax,
          baseFare: busFare,
          taxes: busTax,
          reliabilityScore: 91,
          providerSource: "RedBus",
          seatAvailability: { status: "available", count: 18, label: "18 seats available", travelClass: "AC Sleeper 2+1" },
          priceTrend: { label: "RedBus live active route", direction: "stable" },
          latitude: origin.latitude,
          longitude: origin.longitude,
          bookingUrl: buildBusDeepLink({
            originCity: origin.busTerminalName || origin.name || origin.id,
            destCity: dest.busTerminalName || dest.name || dest.id,
            date: dateStr,
          }),
          dataSource: "mock",
          dataAsOf: "2026-03-01T00:00:00.000Z",
          runningDays: "daily",
        });
      }
    }
  }

  return dynamicSegments;
}

/**
 * Builds concrete TravelSegments for a given calendar date with simulated live aggregator data
 */
export function generateSegmentsForDate(dateStr: string): TravelSegment[] {
  const seedSegments = MOCK_SCHEDULE_SEEDS.map((seed, index) => {
    const departure = createIstTimestamp(dateStr, seed.departHour, seed.departMin);
    const arrival = new Date(departure.getTime() + seed.durationMinutes * 60 * 1000);

    return {
      id: `seg_${seed.type}_${seed.operatorCode}_${seed.fromCode}_${seed.toCode}_${index}`,
      type: seed.type,
      operator: seed.operator,
      operatorCode: seed.operatorCode,
      segmentNumber: seed.segmentNumber,
      fromCode: seed.fromCode,
      fromName: seed.fromName,
      toCode: seed.toCode,
      toName: seed.toName,
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      durationMinutes: seed.durationMinutes,
      price: seed.baseFare + seed.taxes,
      baseFare: seed.baseFare,
      taxes: seed.taxes,
      reliabilityScore: seed.reliabilityScore,
      providerSource: seed.providerSource,
      seatAvailability: seed.seatAvailability,
      priceTrend: seed.priceTrend,
      zone: seed.zone,
      latitude: seed.latitude,
      longitude: seed.longitude,
      bookingUrl:
        seed.type === "train"
          ? buildTrainDeepLink({
              provider: "IXIGO",
              trainNumber: seed.segmentNumber,
              fromCode: seed.fromCode,
              toCode: seed.toCode,
              date: dateStr,
            })
          : seed.type === "flight"
          ? buildFlightDeepLink({
              provider: "SKYSCANNER",
              origin: seed.fromCode,
              destination: seed.toCode,
              date: dateStr,
              flightNumber: seed.segmentNumber,
            })
          : buildBusDeepLink({
              originCity: seed.fromName,
              destCity: seed.toName,
              date: dateStr,
            }),
      dataSource: "mock" as const,
      dataAsOf: "2026-03-01T00:00:00.000Z",
      runningDays: "daily" as const,
    };
  });

  const dynamicSegments = synthesizeDynamicCorridors(dateStr);

  return [...seedSegments, ...dynamicSegments];
}

