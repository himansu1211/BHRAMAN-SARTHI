export interface AirportTimezoneInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  utcOffsetMinutes: number; // e.g. +330 for +05:30
}

const AIRPORT_TIMEZONES: Record<string, AirportTimezoneInfo> = {
  // Indian Airports (IST = UTC+5:30)
  BLR: { code: "BLR", name: "Kempegowda Intl Airport", city: "Bengaluru", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  DEL: { code: "DEL", name: "Indira Gandhi Intl Airport", city: "Delhi", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  BOM: { code: "BOM", name: "Chhatrapati Shivaji Maharaj Intl", city: "Mumbai", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  HYD: { code: "HYD", name: "Rajiv Gandhi Intl Airport", city: "Hyderabad", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  MAA: { code: "MAA", name: "Chennai Intl Airport", city: "Chennai", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  CCU: { code: "CCU", name: "Netaji Subhash Chandra Bose Intl", city: "Kolkata", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  PNQ: { code: "PNQ", name: "Pune Intl Airport", city: "Pune", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  AMD: { code: "AMD", name: "Sardar Vallabhbhai Patel Intl", city: "Ahmedabad", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  GOI: { code: "GOI", name: "Dabolim Airport", city: "Goa (Dabolim)", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  GOX: { code: "GOX", name: "Manohar Intl Airport", city: "Goa (Mopa)", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  JAI: { code: "JAI", name: "Jaipur Intl Airport", city: "Jaipur", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  LKO: { code: "LKO", name: "Chaudhary Charan Singh Intl", city: "Lucknow", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  VNS: { code: "VNS", name: "Lal Bahadur Shastri Intl", city: "Varanasi", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  PAT: { code: "PAT", name: "Jay Prakash Narayan Airport", city: "Patna", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  COK: { code: "COK", name: "Cochin Intl Airport", city: "Kochi", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  TRV: { code: "TRV", name: "Thiruvananthapuram Intl", city: "Trivandrum", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  IXC: { code: "IXC", name: "Shaheed Bhagat Singh Intl", city: "Chandigarh", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  BBI: { code: "BBI", name: "Biju Patnaik Airport", city: "Bhubaneswar", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  GAY: { code: "GAY", name: "Gaya Airport", city: "Gaya", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  IDR: { code: "IDR", name: "Devi Ahilyabai Holkar Airport", city: "Indore", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  NAG: { code: "NAG", name: "Dr. Babasaheb Ambedkar Intl", city: "Nagpur", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  SXR: { code: "SXR", name: "Sheikh ul-Alam Intl", city: "Srinagar", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  GAU: { code: "GAU", name: "Lokpriya Gopinath Bordoloi Intl", city: "Guwahati", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  ATQ: { code: "ATQ", name: "Sri Guru Ram Dass Jee Intl", city: "Amritsar", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },
  IXB: { code: "IXB", name: "Bagdogra Airport", city: "Siliguri", country: "IN", timezone: "Asia/Kolkata", utcOffsetMinutes: 330 },

  // Key International Hubs connected with India
  DXB: { code: "DXB", name: "Dubai Intl Airport", city: "Dubai", country: "AE", timezone: "Asia/Dubai", utcOffsetMinutes: 240 },
  AUH: { code: "AUH", name: "Zayed Intl Airport", city: "Abu Dhabi", country: "AE", timezone: "Asia/Dubai", utcOffsetMinutes: 240 },
  DOH: { code: "DOH", name: "Hamad Intl Airport", city: "Doha", country: "QA", timezone: "Asia/Qatar", utcOffsetMinutes: 180 },
  SIN: { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "SG", timezone: "Asia/Singapore", utcOffsetMinutes: 480 },
  BKK: { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "TH", timezone: "Asia/Bangkok", utcOffsetMinutes: 420 },
  LHR: { code: "LHR", name: "London Heathrow Airport", city: "London", country: "GB", timezone: "Europe/London", utcOffsetMinutes: 0 },
  JFK: { code: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "US", timezone: "America/New_York", utcOffsetMinutes: -300 },
};

export function getAirportTimezone(code: string): AirportTimezoneInfo {
  const upper = code.toUpperCase();
  if (AIRPORT_TIMEZONES[upper]) {
    return AIRPORT_TIMEZONES[upper];
  }
  // Default to Indian Standard Time for domestic routes
  return {
    code: upper,
    name: `${upper} Airport`,
    city: upper,
    country: "IN",
    timezone: "Asia/Kolkata",
    utcOffsetMinutes: 330,
  };
}

/**
 * Constructs an ISO 8601 string with exact timezone offset representation
 */
export function formatIsoWithTz(dateStr: string, timeStr: string, tzOffsetMinutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");

  const sign = tzOffsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(tzOffsetMinutes);
  const offsetHours = Math.floor(absOffset / 60);
  const offsetMins = absOffset % 60;
  const offsetStr = `${sign}${pad(offsetHours)}:${pad(offsetMins)}`;

  return `${dateStr}T${pad(h)}:${pad(m)}:00${offsetStr}`;
}

/**
 * Calculates arrival ISO timestamp accounting for day rollovers (overnight flights)
 */
export function calculateArrivalIso(
  departureIso: string,
  durationMinutes: number,
  arrivalTzOffsetMinutes: number
): string {
  const depTimeMs = new Date(departureIso).getTime();
  const arrTimeMs = depTimeMs + durationMinutes * 60 * 1000;
  const arrDate = new Date(arrTimeMs);

  // Convert arrTimeMs into arrival timezone local components
  const localMs = arrTimeMs + arrivalTzOffsetMinutes * 60 * 1000;
  const localDate = new Date(localMs);

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = localDate.getUTCFullYear();
  const month = pad(localDate.getUTCMonth() + 1);
  const day = pad(localDate.getUTCDate());
  const hours = pad(localDate.getUTCHours());
  const minutes = pad(localDate.getUTCMinutes());

  const sign = arrivalTzOffsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(arrivalTzOffsetMinutes);
  const offsetH = pad(Math.floor(absOffset / 60));
  const offsetM = pad(absOffset % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:00${sign}${offsetH}:${offsetM}`;
}
