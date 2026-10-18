import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRAINS_FILE = path.join(__dirname, '..', 'data', 'generated', 'trains.json');

const trains = JSON.parse(fs.readFileSync(TRAINS_FILE, 'utf8'));

// Common Indian Railway Corridor Station Sequences (Mainline Trunks)
const CORRIDORS = {
  // Chennai - Bangalore Trunk (via Katpadi & Arakkonam)
  MAS_SBC: ["MYS", "SBC", "BNC", "KJM", "BWT", "KPN", "JTJ", "VN", "AB", "KPD", "WJR", "SHU", "AJJ", "TRL", "PER", "MAS"],
  // Chennai - Coimbatore Trunk (via Arakkonam, Katpadi, Salem, Erode)
  MAS_CBE: ["MAS", "PER", "AJJ", "SHU", "WJR", "KPD", "AB", "VN", "JTJ", "TPT", "SA", "ED", "TUP", "CBE"],
  // Delhi - Mumbai Trunk (via Mathura, Kota, Ratlam, Vadodara, Surat, Borivali)
  NDLS_MMCT: ["NDLS", "NZM", "MTJ", "BTE", "SWM", "KOTA", "RMA", "BWM", "SGZ", "NAD", "RTM", "MGN", "DHD", "GDA", "BRC", "BH", "AKV", "ST", "NVS", "BL", "VAPI", "PLG", "VR", "BVI", "ADH", "MMCT", "CSMT"],
  // Delhi - Mumbai Central Line (via Agra, Gwalior, Jhansi, Bhopal, Itarsi, Bhusawal, Manmad, Kalyan)
  NDLS_CSMT: ["NDLS", "NZM", "FDB", "MTJ", "AGC", "DHO", "MRA", "GWL", "DBA", "DAA", "VGLJ", "BINA", "BPL", "RKMP", "HBJ", "NDPM", "ET", "HD", "KNW", "BAU", "BSL", "JL", "CSN", "MMR", "NK", "IGP", "KSRA", "KYN", "TNA", "DR", "CSMT"],
  // Delhi - Howrah Mainline (via Kanpur, Prayagraj, Pt. Deen Dayal Upadhyaya, Gaya, Dhanbad, Asansol)
  NDLS_HWH: ["NDLS", "GZB", "ALJN", "TDL", "ETW", "CNB", "FTP", "PRYJ", "MZP", "DDU", "BBU", "SSM", "DOS", "GAYA", "KQR", "GMO", "DHN", "KMME", "ASN", "RNG", "DGR", "PAN", "BWN", "BDC", "HWH", "SDAH"],
  // Delhi - Varanasi (via Kanpur, Prayagraj)
  NDLS_BSB: ["NDLS", "GZB", "ALJN", "CNB", "PRYJ", "JNH", "BOY", "BSB", "BNRS"],
  // Delhi - Bangalore (Karnataka Exp / Rajdhani route)
  NDLS_SBC: ["NDLS", "NZM", "FDB", "MTJ", "AGC", "GWL", "VGLJ", "BINA", "BPL", "RKMP", "ET", "KNW", "BSL", "MMR", "ANG", "DD", "KWV", "SUR", "WADI", "YG", "SADP", "RC", "MALM", "AD", "GTL", "GY", "ATP", "DMM", "PKD", "HUP", "GBD", "DBU", "YNK", "YPR", "SBC"],
  // Delhi - Chennai (Tamil Nadu / Grand Trunk / Rajdhani route)
  NDLS_MAS: ["NDLS", "NZM", "MTJ", "AGC", "DHO", "GWL", "VGLJ", "BINA", "BPL", "RKMP", "ET", "GDYA", "BZU", "AMLA", "PAR", "NRKR", "KATL", "NGP", "SEGM", "HGT", "WRR", "CD", "BPQ", "MAGH", "SKZR", "BPA", "MCI", "RDM", "PDPL", "KZJ", "WL", "KMT", "MDR", "BZA", "TEL", "CLX", "BPP", "OGL", "SKM", "KVZ", "NLR", "GDR", "SPE", "MAS"],
  // Delhi - Amritsar Mainline
  NDLS_ASR: ["NDLS", "DLI", "SZM", "SNP", "PNP", "KUN", "KKDE", "UMB", "UBC", "RPJ", "KNN", "LDH", "PHR", "PGW", "JRC", "JUC", "BEAS", "ASR"],
  // Delhi - Jammu / Katra
  NDLS_SVDK: ["NDLS", "DLI", "UMB", "LDH", "JUC", "PTKC", "KTHU", "JAT", "UHP", "SVDK"],
  // Delhi - Lucknow Mainline
  NDLS_LKO: ["NDLS", "GZB", "ALJN", "TDL", "ETW", "PHD", "RURA", "CNB", "ON", "AJN", "MKG", "LKO", "LJN"],
  // Mumbai - Ahmedabad - Gandhinagar Corridor
  MMCT_GNC: ["MMCT", "BVI", "PLG", "VAPI", "BL", "NVS", "ST", "BH", "BRC", "ANND", "ND", "MAN", "ADI", "SBIB", "GNC"],
  // Mumbai - Pune Mainline
  CSMT_PUNE: ["CSMT", "DR", "TNA", "KYN", "KJT", "LNL", "KK", "SVJR", "PUNE"],
  // Bangalore - Hyderabad (via Dharmavaram, Anantapur, Guntakal/Dhone, Kurnool, Mahbubnagar)
  SBC_HYD: ["SBC", "YPR", "YNK", "DBU", "HUP", "PKD", "DMM", "ATP", "GY", "GTL", "DHNE", "KRNT", "GWD", "MBNR", "JCL", "SHNR", "UR", "KCG", "HYB", "SC"],
  // Kolkata - Bhubaneswar - Chennai Coastal Line
  HWH_MAS: ["HWH", "KGP", "BLS", "BHC", "JJKR", "CTC", "BBS", "KUR", "BALU", "BAM", "PSA", "CHE", "VZM", "VSKP", "DVD", "AKP", "TUNI", "ANV", "SLO", "RJY", "TDD", "EE", "BZA", "TEL", "BPP", "CLX", "OGL", "KVZ", "NLR", "GDR", "NYP", "SPE", "MAS"],
};

// Helper: check if a train connects end-to-end or runs along a known corridor
function findMatchingCorridor(originCode, destCode) {
  const o = originCode.toUpperCase();
  const d = destCode.toUpperCase();

  for (const [name, stops] of Object.entries(CORRIDORS)) {
    const oIdx = stops.indexOf(o);
    const dIdx = stops.indexOf(d);

    if (oIdx !== -1 && dIdx !== -1 && oIdx < dIdx) {
      // Forward direction along this corridor
      return stops.slice(oIdx, dIdx + 1);
    } else if (oIdx !== -1 && dIdx !== -1 && oIdx > dIdx) {
      // Reverse direction along this corridor
      const rev = [...stops].reverse();
      const revO = rev.indexOf(o);
      const revD = rev.indexOf(d);
      return rev.slice(revO, revD + 1);
    }
  }
  return null;
}

let enrichedCount = 0;

for (const train of trains) {
  const corridorStops = findMatchingCorridor(train.originCode, train.destCode);
  if (corridorStops && corridorStops.length >= 2) {
    train.routeStops = corridorStops;
    enrichedCount++;
  } else {
    train.routeStops = [train.originCode, train.destCode];
  }
}

// Add verified key Indian mainline express trains if not already present
const EXTRA_VERIFIED_TRAINS = [
  // 12608 / 12607 Lalbagh Express (SBC <-> MAS via Katpadi & Arakkonam)
  {
    number: "12608",
    name: "Lalbagh SF Express",
    type: "Superfast Express",
    category: "express",
    originCode: "SBC",
    originName: "KSR Bengaluru",
    destCode: "MAS",
    destName: "MGR Chennai Central",
    departureTime: "06:20",
    arrivalTime: "12:15",
    durationMinutes: 355,
    distanceKm: 362,
    routeStops: ["SBC", "BNC", "KJM", "BWT", "KPN", "JTJ", "VN", "AB", "KPD", "MCN", "SHU", "AJJ", "PER", "MAS"],
  },
  {
    number: "12607",
    name: "Lalbagh SF Express",
    type: "Superfast Express",
    category: "express",
    originCode: "MAS",
    originName: "MGR Chennai Central",
    destCode: "SBC",
    destName: "KSR Bengaluru",
    departureTime: "15:30",
    arrivalTime: "21:35",
    durationMinutes: 365,
    distanceKm: 362,
    routeStops: ["MAS", "PER", "AJJ", "SHU", "MCN", "KPD", "AB", "VN", "JTJ", "KPN", "BWT", "KJM", "BNC", "SBC"],
  },
  // 12640 / 12639 Brindavan Express (SBC <-> MAS via Katpadi & Arakkonam)
  {
    number: "12640",
    name: "Brindavan Express",
    type: "Superfast Express",
    category: "express",
    originCode: "SBC",
    originName: "KSR Bengaluru",
    destCode: "MAS",
    destName: "MGR Chennai Central",
    departureTime: "15:10",
    arrivalTime: "21:10",
    durationMinutes: 360,
    distanceKm: 362,
    routeStops: ["SBC", "BNC", "KJM", "BWT", "KPN", "JTJ", "VN", "AB", "KPD", "WJR", "SHU", "AJJ", "TRL", "PER", "MAS"],
  },
  {
    number: "12639",
    name: "Brindavan Express",
    type: "Superfast Express",
    category: "express",
    originCode: "MAS",
    originName: "MGR Chennai Central",
    destCode: "SBC",
    destName: "KSR Bengaluru",
    departureTime: "07:40",
    arrivalTime: "13:40",
    durationMinutes: 360,
    distanceKm: 362,
    routeStops: ["MAS", "PER", "TRL", "AJJ", "SHU", "WJR", "KPD", "AB", "VN", "JTJ", "KPN", "BWT", "KJM", "BNC", "SBC"],
  },
  // 12627 / 12628 Karnataka Express (SBC <-> NDLS)
  {
    number: "12627",
    name: "Karnataka Express",
    type: "Superfast Express",
    category: "express",
    originCode: "SBC",
    originName: "KSR Bengaluru",
    destCode: "NDLS",
    destName: "New Delhi",
    departureTime: "19:20",
    arrivalTime: "09:00",
    durationMinutes: 2260,
    distanceKm: 2367,
    routeStops: CORRIDORS.NDLS_SBC.slice().reverse(),
  },
  {
    number: "12628",
    name: "Karnataka Express",
    type: "Superfast Express",
    category: "express",
    originCode: "NDLS",
    originName: "New Delhi",
    destCode: "SBC",
    destName: "KSR Bengaluru",
    departureTime: "20:20",
    arrivalTime: "12:00",
    durationMinutes: 2380,
    distanceKm: 2367,
    routeStops: CORRIDORS.NDLS_SBC,
  },
  // 12951 / 12952 Mumbai Tejas Rajdhani Express (MMCT <-> NDLS)
  {
    number: "12951",
    name: "Mumbai Central - New Delhi Tejas Rajdhani Express",
    type: "Rajdhani Express",
    category: "rajdhani",
    originCode: "MMCT",
    originName: "Mumbai Central",
    destCode: "NDLS",
    destName: "New Delhi",
    departureTime: "17:00",
    arrivalTime: "08:32",
    durationMinutes: 932,
    distanceKm: 1384,
    routeStops: ["MMCT", "BVI", "ST", "BRC", "RTM", "KOTA", "NDLS"],
  },
  {
    number: "12952",
    name: "New Delhi - Mumbai Central Tejas Rajdhani Express",
    type: "Rajdhani Express",
    category: "rajdhani",
    originCode: "NDLS",
    originName: "New Delhi",
    destCode: "MMCT",
    destName: "Mumbai Central",
    departureTime: "16:55",
    arrivalTime: "08:35",
    durationMinutes: 940,
    distanceKm: 1384,
    routeStops: ["NDLS", "KOTA", "RTM", "BRC", "ST", "BVI", "MMCT"],
  },
  // 12621 / 12622 Tamil Nadu Express (MAS <-> NDLS)
  {
    number: "12621",
    name: "Tamil Nadu Express",
    type: "Superfast Express",
    category: "express",
    originCode: "MAS",
    originName: "MGR Chennai Central",
    destCode: "NDLS",
    destName: "New Delhi",
    departureTime: "22:00",
    arrivalTime: "06:30",
    durationMinutes: 1950,
    distanceKm: 2180,
    routeStops: CORRIDORS.NDLS_MAS.slice().reverse(),
  },
  {
    number: "12622",
    name: "Tamil Nadu Express",
    type: "Superfast Express",
    category: "express",
    originCode: "NDLS",
    originName: "New Delhi",
    destCode: "MAS",
    destName: "MGR Chennai Central",
    departureTime: "21:05",
    arrivalTime: "06:35",
    durationMinutes: 2010,
    distanceKm: 2180,
    routeStops: CORRIDORS.NDLS_MAS,
  },
  // 12615 / 12616 Grand Trunk Express (MAS <-> NDLS)
  {
    number: "12615",
    name: "Grand Trunk Express",
    type: "Superfast Express",
    category: "express",
    originCode: "MAS",
    originName: "MGR Chennai Central",
    destCode: "NDLS",
    destName: "New Delhi",
    departureTime: "18:50",
    arrivalTime: "06:35",
    durationMinutes: 2145,
    distanceKm: 2180,
    routeStops: CORRIDORS.NDLS_MAS.slice().reverse(),
  },
  {
    number: "12616",
    name: "Grand Trunk Express",
    type: "Superfast Express",
    category: "express",
    originCode: "NDLS",
    originName: "New Delhi",
    destCode: "MAS",
    destName: "MGR Chennai Central",
    departureTime: "16:10",
    arrivalTime: "04:30",
    durationMinutes: 2180,
    distanceKm: 2180,
    routeStops: CORRIDORS.NDLS_MAS,
  },
  // 22691 / 22692 Bangalore Rajdhani Express (SBC <-> NZM/NDLS)
  {
    number: "22691",
    name: "KSR Bengaluru - Hazrat Nizamuddin Rajdhani Express",
    type: "Rajdhani Express",
    category: "rajdhani",
    originCode: "SBC",
    originName: "KSR Bengaluru",
    destCode: "NDLS",
    destName: "New Delhi",
    departureTime: "20:00",
    arrivalTime: "05:30",
    durationMinutes: 2010,
    distanceKm: 2367,
    routeStops: ["SBC", "YPR", "SSPN", "DMM", "ATP", "DHNE", "KRNT", "MBNR", "KCG", "SC", "KZJ", "BPQ", "NGP", "BPL", "VGLJ", "GWL", "AGC", "NZM", "NDLS"],
  },
  {
    number: "22692",
    name: "Hazrat Nizamuddin - KSR Bengaluru Rajdhani Express",
    type: "Rajdhani Express",
    category: "rajdhani",
    originCode: "NDLS",
    originName: "New Delhi",
    destCode: "SBC",
    destName: "KSR Bengaluru",
    departureTime: "20:45",
    arrivalTime: "06:40",
    durationMinutes: 2035,
    distanceKm: 2367,
    routeStops: ["NDLS", "NZM", "AGC", "GWL", "VGLJ", "BPL", "NGP", "BPQ", "KZJ", "SC", "KCG", "MBNR", "KRNT", "DHNE", "ATP", "DMM", "SSPN", "YPR", "SBC"],
  },
];

// Deduplicate and merge
const seenNumbers = new Set(trains.map(t => t.number));
for (const extra of EXTRA_VERIFIED_TRAINS) {
  if (!seenNumbers.has(extra.number)) {
    trains.push(extra);
    seenNumbers.add(extra.number);
  } else {
    // Update existing train with detailed routeStops
    const existing = trains.find(t => t.number === extra.number);
    if (existing) {
      existing.routeStops = extra.routeStops;
      existing.name = extra.name;
    }
  }
}

fs.writeFileSync(TRAINS_FILE, JSON.stringify(trains, null, 2));
console.log(`Updated trains dataset at ${TRAINS_FILE}`);
console.log(`Total trains: ${trains.length}`);
console.log(`Enriched with multi-stop mainline corridors: ${enrichedCount + EXTRA_VERIFIED_TRAINS.length}`);
