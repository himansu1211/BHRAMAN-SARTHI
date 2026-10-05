/**
 * Deep Ticket Booking Link Generator
 * Creates direct checkout & search URLs with pre-filled origin, destination,
 * travel date, and flight/train identifiers across authorized carriers & OTAs.
 *
 * Avoids landing users on root homepages.
 */

export interface FlightBookingParams {
  provider:
    | "SKYSCANNER"
    | "MAKEMYTRIP"
    | "IXIGO"
    | "INDIGO"
    | "AIR_INDIA"
    | "AIR_INDIA_EXPRESS"
    | "AKASA"
    | "SPICEJET"
    | string;
  origin: string;       // 3-letter IATA code, e.g. "BLR"
  destination: string;  // 3-letter IATA code, e.g. "DEL"
  date: string;         // YYYY-MM-DD
  flightNumber?: string;
  cabinClass?: string;
  adults?: number;
}

export function buildFlightDeepLink(params: FlightBookingParams): string {
  const {
    provider,
    origin,
    destination,
    date,
    cabinClass = "Economy",
    adults = 1,
  } = params;

  const origUpper = origin.toUpperCase();
  const destUpper = destination.toUpperCase();
  const origLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();

  const [yyyy, mm, dd] = date.split("-");
  const ddmmyyyy = `${dd}${mm}${yyyy}`;
  const mmtDateFormat = `${dd}/${mm}/${yyyy}`;
  const yymmdd = `${yyyy ? yyyy.slice(2) : "26"}${mm || "10"}${dd || "15"}`;
  const skyscannerSearch = () =>
    `https://www.skyscanner.co.in/transport/flights/${origLower}/${destLower}/${yymmdd}/?adultsv2=${adults}&cabinclass=${(cabinClass || "economy").toLowerCase().replace(/\s+/g, "")}`;

  switch (provider.toUpperCase()) {
    case "SKYSCANNER": {
      const cabin = (cabinClass || "economy").toLowerCase().replace(/\s+/g, "");
      return `https://www.skyscanner.co.in/transport/flights/${origLower}/${destLower}/${yymmdd}/?adultsv2=${adults}&cabinclass=${cabin}&childrenv2=&ref=home`;
    }

    case "MAKEMYTRIP": {
      const cabinCode = cabinClass.toLowerCase().startsWith("b") ? "B" : "E";
      return `https://www.makemytrip.com/flight/search?itinerary=${origUpper}-${destUpper}-${mmtDateFormat}&tripType=O&paxType=A-${adults}_C-0_I-0&intl=false&cabinClass=${cabinCode}`;
    }

    case "IXIGO": {
      return `https://www.ixigo.com/search/result/flight?from=${origUpper}&to=${destUpper}&date=${ddmmyyyy}&adults=${adults}&children=0&infants=0&class=e&source=Search%20Form`;
    }

    case "INDIGO": {
      return `https://www.goindigo.in/booking/flight-select.html?origin=${origUpper}&destination=${destUpper}&date=${date}&adults=${adults}&tripType=one-way`;
    }

    case "AIR_INDIA": {
      return skyscannerSearch();
    }

    case "AIR_INDIA_EXPRESS": {
      return skyscannerSearch();
    }

    case "AKASA": {
      return skyscannerSearch();
    }

    case "SPICEJET": {
      return skyscannerSearch();
    }

    default: {
      return `https://www.skyscanner.co.in/transport/flights/${origLower}/${destLower}/${yymmdd}/?adultsv2=${adults}&cabinclass=economy`;
    }
  }
}

export interface TrainBookingParams {
  provider?: "IXIGO" | "IRCTC" | "CONFIRMTKT";
  trainNumber: string;
  fromCode: string;
  toCode: string;
  date?: string; // YYYY-MM-DD
}

export function buildTrainDeepLink(params: TrainBookingParams): string {
  const { provider = "IXIGO", trainNumber, fromCode, toCode, date } = params;
  const cleanNumber = trainNumber.replace(/[^0-9]/g, "");

  const [yyyy, mm, dd] = date ? date.split("-") : ["2026", "10", "15"];
  const ddmmyyyy = `${dd}${mm}${yyyy}`;

  switch (provider.toUpperCase()) {
    case "CONFIRMTKT": {
      if (cleanNumber) return `https://www.ixigo.com/trains/${cleanNumber}`;
      if (fromCode && toCode && date) {
        return `https://www.ixigo.com/trains/search?origin=${fromCode.toUpperCase()}&destination=${toCode.toUpperCase()}&date=${ddmmyyyy}`;
      }
      return "https://www.ixigo.com/trains";
    }

    case "IRCTC": {
      if (fromCode && toCode && date) {
        const [yyyy, mm, dd] = date.split("-");
        const ddmmyyyySlash = `${dd}/${mm}/${yyyy}`;
        return `https://www.irctc.co.in/nget/train-search?srcStn=${fromCode.toUpperCase()}&destStn=${toCode.toUpperCase()}&journeyDate=${ddmmyyyySlash}&jnyType=O`;
      }
      return `https://www.irctc.co.in/nget/train-search`;
    }

    case "IXIGO":
    default: {
      if (cleanNumber) {
        // Direct train schedule & booking page on ixigo for that exact train
        return `https://www.ixigo.com/trains/${cleanNumber}`;
      }
      if (fromCode && toCode && date) {
        return `https://www.ixigo.com/trains/search?origin=${fromCode.toUpperCase()}&destination=${toCode.toUpperCase()}&date=${ddmmyyyy}`;
      }
      return `https://www.ixigo.com/trains`;
    }
  }
}

export interface BusBookingParams {
  originCity: string;
  destCity: string;
  date: string; // YYYY-MM-DD
  provider?: "REDBUS" | "ABHIBUS";
}

const KNOWN_CITIES = [
  "new delhi",
  "delhi",
  "bengaluru",
  "bangalore",
  "mumbai",
  "chennai",
  "hyderabad",
  "kolkata",
  "pune",
  "ahmedabad",
  "jaipur",
  "lucknow",
  "chandigarh",
  "kochi",
  "goa",
  "varanasi",
  "amritsar",
  "agra",
  "patna",
  "bhopal",
  "indore",
  "coimbatore",
  "madurai",
  "mysuru",
  "mangalore",
  "visakhapatnam",
  "vijayawada",
];

export function extractCitySlug(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const city of KNOWN_CITIES) {
    if (lower.includes(city)) {
      return city.replace(/\s+/g, "-");
    }
  }
  const cleaned = lower
    .replace(/\(.*?\)/g, "")
    .replace(/airport|railway|station|bus|stand|terminal|junction|isbt|cmbt|central/gi, "")
    .trim();
  const firstWord = cleaned.split(/[\s-]+/).filter(Boolean)[0];
  return firstWord ? firstWord.replace(/[^a-z0-9]+/g, "") : "city";
}

export function buildBusDeepLink(params: BusBookingParams): string {
  const { originCity, destCity, date, provider = "REDBUS" } = params;
  const cleanOrigin = extractCitySlug(originCity);
  const cleanDest = extractCitySlug(destCity);

  if (provider === "ABHIBUS") {
    return `https://www.abhibus.com/bus_search/${cleanOrigin}/${cleanDest}/${date}/O`;
  }

  return `https://www.redbus.in/bus-tickets/${cleanOrigin}-to-${cleanDest}?date=${date}`;
}
