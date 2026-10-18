/**
 * Major-city station groups supplied for city-level rail searches. Codes in
 * this list are candidate station identifiers; callers must still confirm a
 * code exists in the station dataset before using or displaying its name.
 */
export interface StationGroup {
  city: string;
  codes: readonly string[];
}

export const STATION_GROUPS: readonly StationGroup[] = [
  { city: "Delhi", codes: ["NDLS", "DLI", "NZM", "ANVT", "DEE", "DEC", "DSA", "DSJ"] },
  { city: "Mumbai", codes: ["CSMT", "CSTM", "LTT", "BDTS", "BCT", "DR", "TNA", "PNVL"] },
  { city: "Kolkata", codes: ["HWH", "SDAH", "KOAA", "SHM", "SRC"] },
  { city: "Chennai", codes: ["MAS", "MS", "TBM", "PER", "MSB"] },
  { city: "Bengaluru", codes: ["SBC", "YPR", "BNC", "BYPL", "KJM"] },
  { city: "Hyderabad", codes: ["SC", "HYB", "KCG", "LPI", "CHZ"] },
  { city: "Ahmedabad", codes: ["ADI", "SBI", "MAN"] },
  { city: "Pune", codes: ["PUNE", "SVJR", "KK", "HDP"] },
  { city: "Lucknow", codes: ["LKO", "LJN", "GTNR", "AIH"] },
  { city: "Patna", codes: ["PNBE", "RJPB", "PPTA", "DNR"] },
  { city: "Jaipur", codes: ["JP", "GADJ"] },
  { city: "Varanasi", codes: ["BSB", "BSBS", "BCY"] },
  { city: "Kanpur", codes: ["CNB", "CPA"] },
  { city: "Prayagraj", codes: ["PRYJ", "PRG", "NYN", "PCOI"] },
  { city: "Agra", codes: ["AGC", "AF", "RKM"] },
  { city: "Surat", codes: ["ST", "UDN"] },
  { city: "Visakhapatnam", codes: ["VSKP", "DVD"] },
  { city: "Kochi", codes: ["ERS", "ERN"] },
  { city: "Thiruvananthapuram", codes: ["TVC", "KCVL"] },
  { city: "Guwahati", codes: ["GHY", "KYQ"] },
  { city: "Bhopal", codes: ["BPL", "RKMP"] },
  { city: "Ranchi", codes: ["RNC", "HTE"] },
  { city: "Nagpur", codes: ["NGP"] },
  { city: "Raipur", codes: ["R"] },
  { city: "Bilaspur", codes: ["BSP"] },
  { city: "Puri", codes: ["PURI"] },
  { city: "Berhampur", codes: ["BAM"] },
  { city: "Bhubaneswar", codes: ["BBS"] },
];

const GROUP_BY_CODE = new Map<string, StationGroup>();
for (const group of STATION_GROUPS) {
  for (const code of group.codes) GROUP_BY_CODE.set(code, group);
}

export function stationGroupFor(code: string): StationGroup | undefined {
  return GROUP_BY_CODE.get(code.trim().toUpperCase());
}
