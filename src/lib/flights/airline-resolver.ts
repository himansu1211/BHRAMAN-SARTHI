export interface AirlineInfo {
  code: string;
  name: string;
  logo?: string;
}

export const CANONICAL_AIRLINES: Record<string, AirlineInfo> = {
  "6E": { code: "6E", name: "IndiGo" },
  "AI": { code: "AI", name: "Air India" },
  "IX": { code: "IX", name: "Air India Express" },
  "QP": { code: "QP", name: "Akasa Air" },
  "SG": { code: "SG", name: "SpiceJet" },
  "9I": { code: "9I", name: "Alliance Air" },
  "S5": { code: "S5", name: "Star Air" },
  "I5": { code: "I5", name: "Air India Express" },
  "UK": { code: "AI", name: "Air India" }, // Vistara merged into Air India
};

/**
 * Resolves canonical airline name and code with bulletproof fallback
 */
export function getCanonicalAirline(code?: string, rawName?: string, flightNumber?: string): AirlineInfo {
  let cleanCode = (code || "").toUpperCase().trim();

  // If code is not provided or looks like "AIR", extract from flight number (e.g. "AI 2418" -> "AI")
  if ((!cleanCode || cleanCode.length > 3) && flightNumber) {
    const parts = flightNumber.trim().split(/\s+/);
    if (parts.length > 0 && parts[0].length <= 3) {
      cleanCode = parts[0].toUpperCase();
    }
  }

  if (cleanCode && CANONICAL_AIRLINES[cleanCode]) {
    return CANONICAL_AIRLINES[cleanCode];
  }

  // Fallback by airline name keyword
  if (rawName) {
    const fn = rawName.toLowerCase();
    if (fn.includes("indigo")) return CANONICAL_AIRLINES["6E"];
    if (fn.includes("express")) return CANONICAL_AIRLINES["IX"];
    if (fn.includes("air india")) return CANONICAL_AIRLINES["AI"];
    if (fn.includes("akasa")) return CANONICAL_AIRLINES["QP"];
    if (fn.includes("spicejet")) return CANONICAL_AIRLINES["SG"];
    if (fn.includes("alliance")) return CANONICAL_AIRLINES["9I"];
    if (fn.includes("star air")) return CANONICAL_AIRLINES["S5"];
  }

  return {
    code: cleanCode || "AIR",
    name: rawName || "Commercial Airline",
  };
}
