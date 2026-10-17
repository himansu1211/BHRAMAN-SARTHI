export interface SegmentTemplate {
  id: string;
  type: "flight" | "train";
  operator: string;
  operatorId: string;
  from: string;
  to: string;
  depart: string;
  durationMinutes: number;
  plusDays?: number;
  baseFare: number;
  taxes: number;
  fees: number;
  reliability: number;
}

export const FLIGHT_TEMPLATES: SegmentTemplate[] = [
  // BLR <-> DEL
  { id: "6E-201", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "DEL", depart: "06:00", durationMinutes: 170, baseFare: 8200, taxes: 1200, fees: 400, reliability: 0.88 },
  { id: "AI-803", type: "flight", operator: "Air India", operatorId: "AI", from: "BLR", to: "DEL", depart: "08:15", durationMinutes: 175, baseFare: 5900, taxes: 950, fees: 300, reliability: 0.82 },
  { id: "UK-811", type: "flight", operator: "Vistara", operatorId: "UK", from: "BLR", to: "DEL", depart: "10:30", durationMinutes: 175, baseFare: 5600, taxes: 900, fees: 350, reliability: 0.9 },
  { id: "QP-1101", type: "flight", operator: "Akasa Air", operatorId: "QP", from: "BLR", to: "DEL", depart: "14:05", durationMinutes: 180, baseFare: 4100, taxes: 800, fees: 250, reliability: 0.84 },
  { id: "6E-890", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "DEL", depart: "18:40", durationMinutes: 180, baseFare: 3600, taxes: 750, fees: 220, reliability: 0.86 },
  { id: "6E-550", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "BLR", depart: "07:20", durationMinutes: 170, baseFare: 6100, taxes: 980, fees: 320, reliability: 0.87 },
  { id: "AI-804", type: "flight", operator: "Air India", operatorId: "AI", from: "DEL", to: "BLR", depart: "11:00", durationMinutes: 175, baseFare: 5400, taxes: 900, fees: 300, reliability: 0.82 },
  { id: "UK-812", type: "flight", operator: "Vistara", operatorId: "UK", from: "DEL", to: "BLR", depart: "17:15", durationMinutes: 175, baseFare: 5800, taxes: 920, fees: 310, reliability: 0.89 },
  { id: "QP-1102", type: "flight", operator: "Akasa Air", operatorId: "QP", from: "DEL", to: "BLR", depart: "20:30", durationMinutes: 175, baseFare: 4300, taxes: 810, fees: 250, reliability: 0.85 },

  // DEL <-> BOM (Busiest corridor)
  { id: "6E-5001", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "BOM", depart: "06:30", durationMinutes: 130, baseFare: 3600, taxes: 650, fees: 220, reliability: 0.88 },
  { id: "UK-975", type: "flight", operator: "Vistara", operatorId: "UK", from: "DEL", to: "BOM", depart: "10:15", durationMinutes: 130, baseFare: 4200, taxes: 720, fees: 260, reliability: 0.91 },
  { id: "AI-665", type: "flight", operator: "Air India", operatorId: "AI", from: "DEL", to: "BOM", depart: "14:40", durationMinutes: 135, baseFare: 3800, taxes: 680, fees: 240, reliability: 0.83 },
  { id: "6E-5007", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "BOM", depart: "18:50", durationMinutes: 130, baseFare: 4500, taxes: 750, fees: 280, reliability: 0.87 },
  { id: "UK-930", type: "flight", operator: "Vistara", operatorId: "UK", from: "BOM", to: "DEL", depart: "10:50", durationMinutes: 125, baseFare: 3200, taxes: 600, fees: 200, reliability: 0.89 },
  { id: "6E-118", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BOM", to: "DEL", depart: "13:15", durationMinutes: 130, baseFare: 2700, taxes: 540, fees: 180, reliability: 0.85 },
  { id: "AI-887", type: "flight", operator: "Air India", operatorId: "AI", from: "BOM", to: "DEL", depart: "07:15", durationMinutes: 125, baseFare: 3900, taxes: 670, fees: 230, reliability: 0.84 },
  { id: "6E-2054", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BOM", to: "DEL", depart: "19:30", durationMinutes: 130, baseFare: 3500, taxes: 630, fees: 210, reliability: 0.87 },

  // BLR <-> BOM
  { id: "6E-412", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "BOM", depart: "06:30", durationMinutes: 100, baseFare: 2400, taxes: 480, fees: 160, reliability: 0.86 },
  { id: "AI-618", type: "flight", operator: "Air India", operatorId: "AI", from: "BLR", to: "BOM", depart: "12:15", durationMinutes: 105, baseFare: 2600, taxes: 500, fees: 170, reliability: 0.82 },
  { id: "6E-418", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "BOM", depart: "19:00", durationMinutes: 100, baseFare: 2800, taxes: 520, fees: 180, reliability: 0.87 },
  { id: "UK-820", type: "flight", operator: "Vistara", operatorId: "UK", from: "BOM", to: "BLR", depart: "09:00", durationMinutes: 100, baseFare: 2500, taxes: 470, fees: 150, reliability: 0.88 },
  { id: "6E-415", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BOM", to: "BLR", depart: "15:20", durationMinutes: 105, baseFare: 2450, taxes: 470, fees: 155, reliability: 0.86 },
  { id: "QP-1120", type: "flight", operator: "Akasa Air", operatorId: "QP", from: "BOM", to: "BLR", depart: "21:10", durationMinutes: 100, baseFare: 2200, taxes: 430, fees: 140, reliability: 0.85 },

  // BLR <-> HYD
  { id: "6E-221", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "HYD", depart: "07:10", durationMinutes: 75, baseFare: 2200, taxes: 450, fees: 150, reliability: 0.87 },
  { id: "AI-516", type: "flight", operator: "Air India", operatorId: "AI", from: "BLR", to: "HYD", depart: "09:45", durationMinutes: 80, baseFare: 2100, taxes: 420, fees: 140, reliability: 0.8 },
  { id: "6E-245", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "HYD", depart: "18:20", durationMinutes: 75, baseFare: 2300, taxes: 460, fees: 150, reliability: 0.88 },
  { id: "6E-301", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "BLR", depart: "16:10", durationMinutes: 75, baseFare: 2000, taxes: 400, fees: 130, reliability: 0.86 },
  { id: "AI-517", type: "flight", operator: "Air India", operatorId: "AI", from: "HYD", to: "BLR", depart: "08:15", durationMinutes: 80, baseFare: 2150, taxes: 430, fees: 140, reliability: 0.81 },

  // HYD <-> DEL
  { id: "6E-330", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "DEL", depart: "11:40", durationMinutes: 130, baseFare: 2800, taxes: 520, fees: 180, reliability: 0.85 },
  { id: "AI-440", type: "flight", operator: "Air India", operatorId: "AI", from: "HYD", to: "DEL", depart: "14:20", durationMinutes: 135, baseFare: 2600, taxes: 500, fees: 160, reliability: 0.81 },
  { id: "6E-381", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "DEL", depart: "18:10", durationMinutes: 130, baseFare: 2500, taxes: 490, fees: 160, reliability: 0.86 },
  { id: "6E-654", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "HYD", depart: "06:30", durationMinutes: 135, baseFare: 2750, taxes: 510, fees: 175, reliability: 0.87 },
  { id: "AI-542", type: "flight", operator: "Air India", operatorId: "AI", from: "DEL", to: "HYD", depart: "13:15", durationMinutes: 140, baseFare: 2700, taxes: 500, fees: 170, reliability: 0.82 },
  { id: "UK-873", type: "flight", operator: "Vistara", operatorId: "UK", from: "DEL", to: "HYD", depart: "18:20", durationMinutes: 135, baseFare: 3200, taxes: 580, fees: 200, reliability: 0.9 },

  // BOM <-> HYD
  { id: "QP-221", type: "flight", operator: "Akasa Air", operatorId: "QP", from: "BOM", to: "HYD", depart: "08:20", durationMinutes: 90, baseFare: 2100, taxes: 410, fees: 140, reliability: 0.83 },
  { id: "6E-404", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "BOM", depart: "12:30", durationMinutes: 95, baseFare: 2200, taxes: 430, fees: 145, reliability: 0.86 },
  { id: "AI-631", type: "flight", operator: "Air India", operatorId: "AI", from: "BOM", to: "HYD", depart: "16:45", durationMinutes: 90, baseFare: 2300, taxes: 440, fees: 150, reliability: 0.82 },
  { id: "6E-409", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "BOM", depart: "20:00", durationMinutes: 95, baseFare: 2150, taxes: 420, fees: 140, reliability: 0.85 },

  // BLR <-> MAA
  { id: "AI-607", type: "flight", operator: "Air India", operatorId: "AI", from: "BLR", to: "MAA", depart: "07:50", durationMinutes: 70, baseFare: 1800, taxes: 380, fees: 120, reliability: 0.83 },
  { id: "6E-432", type: "flight", operator: "IndiGo", operatorId: "6E", from: "MAA", to: "BLR", depart: "11:30", durationMinutes: 65, baseFare: 1750, taxes: 370, fees: 120, reliability: 0.87 },
  { id: "6E-436", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "MAA", depart: "17:40", durationMinutes: 70, baseFare: 1900, taxes: 390, fees: 130, reliability: 0.86 },
  { id: "AI-553", type: "flight", operator: "Air India", operatorId: "AI", from: "MAA", to: "BLR", depart: "19:00", durationMinutes: 70, baseFare: 1850, taxes: 380, fees: 125, reliability: 0.82 },

  // MAA <-> DEL
  { id: "6E-705", type: "flight", operator: "IndiGo", operatorId: "6E", from: "MAA", to: "DEL", depart: "12:10", durationMinutes: 165, baseFare: 3400, taxes: 620, fees: 210, reliability: 0.86 },
  { id: "AI-430", type: "flight", operator: "Air India", operatorId: "AI", from: "MAA", to: "DEL", depart: "07:00", durationMinutes: 170, baseFare: 3600, taxes: 650, fees: 220, reliability: 0.82 },
  { id: "6E-204", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "MAA", depart: "06:10", durationMinutes: 170, baseFare: 3300, taxes: 610, fees: 200, reliability: 0.87 },
  { id: "AI-439", type: "flight", operator: "Air India", operatorId: "AI", from: "DEL", to: "MAA", depart: "15:45", durationMinutes: 175, baseFare: 3500, taxes: 640, fees: 215, reliability: 0.83 },

  // DEL <-> PNQ
  { id: "6E-918", type: "flight", operator: "IndiGo", operatorId: "6E", from: "PNQ", to: "DEL", depart: "15:40", durationMinutes: 140, baseFare: 3100, taxes: 580, fees: 190, reliability: 0.84 },
  { id: "AI-848", type: "flight", operator: "Air India", operatorId: "AI", from: "PNQ", to: "DEL", depart: "08:00", durationMinutes: 140, baseFare: 3300, taxes: 600, fees: 200, reliability: 0.81 },
  { id: "6E-2115", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "PNQ", depart: "07:45", durationMinutes: 130, baseFare: 3200, taxes: 590, fees: 195, reliability: 0.88 },
  { id: "AI-851", type: "flight", operator: "Air India", operatorId: "AI", from: "DEL", to: "PNQ", depart: "18:00", durationMinutes: 135, baseFare: 3400, taxes: 620, fees: 205, reliability: 0.83 },

  // BLR <-> PNQ
  { id: "AI-650", type: "flight", operator: "Air India", operatorId: "AI", from: "BLR", to: "PNQ", depart: "11:20", durationMinutes: 85, baseFare: 1900, taxes: 390, fees: 130, reliability: 0.8 },
  { id: "6E-451", type: "flight", operator: "IndiGo", operatorId: "6E", from: "PNQ", to: "BLR", depart: "07:00", durationMinutes: 90, baseFare: 2100, taxes: 410, fees: 140, reliability: 0.87 },
  { id: "6E-454", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "PNQ", depart: "16:40", durationMinutes: 85, baseFare: 2200, taxes: 430, fees: 145, reliability: 0.86 },
  { id: "AI-651", type: "flight", operator: "Air India", operatorId: "AI", from: "PNQ", to: "BLR", depart: "14:15", durationMinutes: 90, baseFare: 2000, taxes: 400, fees: 135, reliability: 0.82 },

  // DEL <-> CCU
  { id: "6E-772", type: "flight", operator: "IndiGo", operatorId: "6E", from: "CCU", to: "DEL", depart: "13:00", durationMinutes: 150, baseFare: 3600, taxes: 640, fees: 200, reliability: 0.85 },
  { id: "AI-701", type: "flight", operator: "Air India", operatorId: "AI", from: "CCU", to: "DEL", depart: "07:15", durationMinutes: 150, baseFare: 3800, taxes: 670, fees: 220, reliability: 0.82 },
  { id: "6E-512", type: "flight", operator: "IndiGo", operatorId: "6E", from: "DEL", to: "CCU", depart: "06:40", durationMinutes: 135, baseFare: 3500, taxes: 630, fees: 210, reliability: 0.88 },
  { id: "AI-764", type: "flight", operator: "Air India", operatorId: "AI", from: "DEL", to: "CCU", depart: "14:30", durationMinutes: 140, baseFare: 3700, taxes: 660, fees: 215, reliability: 0.83 },

  // BLR <-> CCU
  { id: "AI-773", type: "flight", operator: "Air India", operatorId: "AI", from: "BLR", to: "CCU", depart: "06:45", durationMinutes: 155, baseFare: 3300, taxes: 610, fees: 190, reliability: 0.81 },
  { id: "6E-623", type: "flight", operator: "IndiGo", operatorId: "6E", from: "CCU", to: "BLR", depart: "09:15", durationMinutes: 155, baseFare: 3400, taxes: 620, fees: 200, reliability: 0.86 },
  { id: "6E-628", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BLR", to: "CCU", depart: "17:50", durationMinutes: 155, baseFare: 3600, taxes: 650, fees: 210, reliability: 0.87 },
  { id: "AI-774", type: "flight", operator: "Air India", operatorId: "AI", from: "CCU", to: "BLR", depart: "18:20", durationMinutes: 160, baseFare: 3350, taxes: 610, fees: 195, reliability: 0.82 },

  // BOM <-> CCU
  { id: "6E-392", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BOM", to: "CCU", depart: "07:30", durationMinutes: 160, baseFare: 3800, taxes: 670, fees: 220, reliability: 0.86 },
  { id: "6E-393", type: "flight", operator: "IndiGo", operatorId: "6E", from: "CCU", to: "BOM", depart: "12:00", durationMinutes: 165, baseFare: 3700, taxes: 650, fees: 215, reliability: 0.85 },
  { id: "AI-675", type: "flight", operator: "Air India", operatorId: "AI", from: "BOM", to: "CCU", depart: "16:15", durationMinutes: 165, baseFare: 3900, taxes: 680, fees: 225, reliability: 0.81 },

  // BOM <-> MAA
  { id: "6E-5341", type: "flight", operator: "IndiGo", operatorId: "6E", from: "BOM", to: "MAA", depart: "06:45", durationMinutes: 115, baseFare: 2600, taxes: 510, fees: 170, reliability: 0.87 },
  { id: "6E-5342", type: "flight", operator: "IndiGo", operatorId: "6E", from: "MAA", to: "BOM", depart: "11:00", durationMinutes: 115, baseFare: 2650, taxes: 520, fees: 175, reliability: 0.86 },
  { id: "AI-671", type: "flight", operator: "Air India", operatorId: "AI", from: "BOM", to: "MAA", depart: "17:20", durationMinutes: 120, baseFare: 2800, taxes: 530, fees: 180, reliability: 0.82 },

  // HYD <-> MAA
  { id: "6E-711", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "MAA", depart: "07:20", durationMinutes: 75, baseFare: 1950, taxes: 390, fees: 130, reliability: 0.87 },
  { id: "6E-712", type: "flight", operator: "IndiGo", operatorId: "6E", from: "MAA", to: "HYD", depart: "10:15", durationMinutes: 75, baseFare: 1900, taxes: 380, fees: 130, reliability: 0.86 },
  { id: "AI-543", type: "flight", operator: "Air India", operatorId: "AI", from: "HYD", to: "MAA", depart: "18:30", durationMinutes: 80, baseFare: 2050, taxes: 410, fees: 140, reliability: 0.82 },

  // HYD <-> CCU
  { id: "6E-455", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "CCU", depart: "08:00", durationMinutes: 125, baseFare: 3100, taxes: 580, fees: 190, reliability: 0.86 },
  { id: "6E-456", type: "flight", operator: "IndiGo", operatorId: "6E", from: "CCU", to: "HYD", depart: "12:30", durationMinutes: 125, baseFare: 3000, taxes: 570, fees: 185, reliability: 0.85 },

  // HYD <-> PNQ
  { id: "6E-344", type: "flight", operator: "IndiGo", operatorId: "6E", from: "HYD", to: "PNQ", depart: "07:15", durationMinutes: 80, baseFare: 2100, taxes: 410, fees: 140, reliability: 0.86 },
  { id: "6E-345", type: "flight", operator: "IndiGo", operatorId: "6E", from: "PNQ", to: "HYD", depart: "10:30", durationMinutes: 80, baseFare: 2050, taxes: 400, fees: 135, reliability: 0.85 },

  // MAA <-> CCU
  { id: "6E-901", type: "flight", operator: "IndiGo", operatorId: "6E", from: "MAA", to: "CCU", depart: "08:45", durationMinutes: 140, baseFare: 3200, taxes: 590, fees: 195, reliability: 0.86 },
  { id: "6E-902", type: "flight", operator: "IndiGo", operatorId: "6E", from: "CCU", to: "MAA", depart: "12:30", durationMinutes: 140, baseFare: 3150, taxes: 580, fees: 190, reliability: 0.85 },

  // MAA <-> PNQ
  { id: "6E-671", type: "flight", operator: "IndiGo", operatorId: "6E", from: "MAA", to: "PNQ", depart: "08:15", durationMinutes: 105, baseFare: 2400, taxes: 470, fees: 155, reliability: 0.85 },
  { id: "6E-672", type: "flight", operator: "IndiGo", operatorId: "6E", from: "PNQ", to: "MAA", depart: "12:00", durationMinutes: 105, baseFare: 2450, taxes: 480, fees: 160, reliability: 0.86 },

  // CCU <-> PNQ
  { id: "6E-851", type: "flight", operator: "IndiGo", operatorId: "6E", from: "PNQ", to: "CCU", depart: "07:30", durationMinutes: 150, baseFare: 3500, taxes: 630, fees: 210, reliability: 0.85 },
  { id: "6E-852", type: "flight", operator: "IndiGo", operatorId: "6E", from: "CCU", to: "PNQ", depart: "12:00", durationMinutes: 150, baseFare: 3450, taxes: 620, fees: 205, reliability: 0.84 },
];

export const TRAIN_TEMPLATES: SegmentTemplate[] = [
  // BLR <-> NDLS
  { id: "22691", type: "train", operator: "Rajdhani Express", operatorId: "IRCTC", from: "SBC", to: "NDLS", depart: "20:00", durationMinutes: 2040, plusDays: 1, baseFare: 3400, taxes: 200, fees: 150, reliability: 0.83 },
  { id: "12627", type: "train", operator: "Karnataka Express", operatorId: "IRCTC", from: "SBC", to: "NDLS", depart: "19:20", durationMinutes: 2160, plusDays: 1, baseFare: 2100, taxes: 150, fees: 100, reliability: 0.74 },
  { id: "12649", type: "train", operator: "Sampark Kranti", operatorId: "IRCTC", from: "YPR", to: "NDLS", depart: "17:50", durationMinutes: 2100, plusDays: 1, baseFare: 2300, taxes: 160, fees: 90, reliability: 0.75 },
  { id: "22692", type: "train", operator: "Rajdhani Express", operatorId: "IRCTC", from: "NDLS", to: "SBC", depart: "20:00", durationMinutes: 2045, plusDays: 1, baseFare: 3400, taxes: 200, fees: 150, reliability: 0.83 },

  // BLR <-> SC (Hyderabad)
  { id: "12785", type: "train", operator: "Kacheguda Express", operatorId: "IRCTC", from: "SBC", to: "SC", depart: "18:20", durationMinutes: 680, plusDays: 1, baseFare: 900, taxes: 80, fees: 40, reliability: 0.76 },
  { id: "17311", type: "train", operator: "Chennai Express", operatorId: "IRCTC", from: "SBC", to: "SC", depart: "06:15", durationMinutes: 510, baseFare: 850, taxes: 70, fees: 40, reliability: 0.77 },
  { id: "12736", type: "train", operator: "Garib Rath", operatorId: "IRCTC", from: "YPR", to: "SC", depart: "16:45", durationMinutes: 540, baseFare: 620, taxes: 50, fees: 30, reliability: 0.72 },
  { id: "12786", type: "train", operator: "Kacheguda Express", operatorId: "IRCTC", from: "SC", to: "SBC", depart: "19:05", durationMinutes: 675, plusDays: 1, baseFare: 900, taxes: 80, fees: 40, reliability: 0.76 },

  // BLR <-> MAS (Chennai)
  { id: "12007", type: "train", operator: "Shatabdi Express", operatorId: "IRCTC", from: "SBC", to: "MAS", depart: "06:00", durationMinutes: 300, baseFare: 1450, taxes: 120, fees: 60, reliability: 0.88 },
  { id: "12640", type: "train", operator: "Brindavan Express", operatorId: "IRCTC", from: "SBC", to: "MAS", depart: "13:40", durationMinutes: 360, baseFare: 480, taxes: 50, fees: 30, reliability: 0.8 },
  { id: "20607", type: "train", operator: "Vande Bharat", operatorId: "IRCTC", from: "SBC", to: "MAS", depart: "14:00", durationMinutes: 240, baseFare: 1800, taxes: 140, fees: 70, reliability: 0.91 },
  { id: "20608", type: "train", operator: "Vande Bharat", operatorId: "IRCTC", from: "MAS", to: "SBC", depart: "05:50", durationMinutes: 245, baseFare: 1800, taxes: 140, fees: 70, reliability: 0.91 },
  { id: "12008", type: "train", operator: "Shatabdi Express", operatorId: "IRCTC", from: "MAS", to: "SBC", depart: "06:00", durationMinutes: 305, baseFare: 1450, taxes: 120, fees: 60, reliability: 0.88 },

  // SC <-> NDLS
  { id: "12723", type: "train", operator: "Telangana Express", operatorId: "IRCTC", from: "SC", to: "NDLS", depart: "06:25", durationMinutes: 1470, plusDays: 1, baseFare: 2200, taxes: 160, fees: 90, reliability: 0.78 },
  { id: "12721", type: "train", operator: "Dakshin Express", operatorId: "IRCTC", from: "SC", to: "NDLS", depart: "22:35", durationMinutes: 1620, plusDays: 1, baseFare: 1600, taxes: 120, fees: 70, reliability: 0.73 },
  { id: "12724", type: "train", operator: "Telangana Express", operatorId: "IRCTC", from: "NDLS", to: "SC", depart: "17:25", durationMinutes: 1475, plusDays: 1, baseFare: 2200, taxes: 160, fees: 90, reliability: 0.78 },

  // PUNE <-> SC
  { id: "12025", type: "train", operator: "Shatabdi Express", operatorId: "IRCTC", from: "PUNE", to: "SC", depart: "05:50", durationMinutes: 480, baseFare: 1100, taxes: 90, fees: 50, reliability: 0.86 },
  { id: "12026", type: "train", operator: "Shatabdi Express", operatorId: "IRCTC", from: "SC", to: "PUNE", depart: "14:45", durationMinutes: 480, baseFare: 1100, taxes: 90, fees: 50, reliability: 0.87 },

  // CSMT <-> PUNE
  { id: "12123", type: "train", operator: "Deccan Queen", operatorId: "IRCTC", from: "CSMT", to: "PUNE", depart: "17:10", durationMinutes: 210, baseFare: 420, taxes: 40, fees: 20, reliability: 0.89 },
  { id: "12124", type: "train", operator: "Deccan Queen", operatorId: "IRCTC", from: "PUNE", to: "CSMT", depart: "07:15", durationMinutes: 205, baseFare: 420, taxes: 40, fees: 20, reliability: 0.9 },
  { id: "22225", type: "train", operator: "Vande Bharat", operatorId: "IRCTC", from: "CSMT", to: "PUNE", depart: "06:25", durationMinutes: 190, baseFare: 980, taxes: 80, fees: 40, reliability: 0.93 },
  { id: "22226", type: "train", operator: "Vande Bharat", operatorId: "IRCTC", from: "PUNE", to: "CSMT", depart: "14:05", durationMinutes: 190, baseFare: 980, taxes: 80, fees: 40, reliability: 0.93 },

  // CSMT <-> NDLS
  { id: "12951", type: "train", operator: "Mumbai Rajdhani", operatorId: "IRCTC", from: "CSMT", to: "NDLS", depart: "16:35", durationMinutes: 940, plusDays: 1, baseFare: 3200, taxes: 220, fees: 140, reliability: 0.84 },
  { id: "22221", type: "train", operator: "Mumbai CSMT–NZM Rajdhani", operatorId: "IRCTC", from: "CSMT", to: "NDLS", depart: "16:00", durationMinutes: 1020, plusDays: 1, baseFare: 3000, taxes: 200, fees: 130, reliability: 0.82 },
  { id: "12952", type: "train", operator: "Mumbai Rajdhani", operatorId: "IRCTC", from: "NDLS", to: "CSMT", depart: "16:55", durationMinutes: 940, plusDays: 1, baseFare: 3200, taxes: 220, fees: 140, reliability: 0.84 },
  { id: "22222", type: "train", operator: "NZM–CSMT Rajdhani", operatorId: "IRCTC", from: "NDLS", to: "CSMT", depart: "17:15", durationMinutes: 1010, plusDays: 1, baseFare: 3000, taxes: 200, fees: 130, reliability: 0.83 },

  // HWH <-> NDLS
  { id: "12301", type: "train", operator: "Howrah Rajdhani", operatorId: "IRCTC", from: "HWH", to: "NDLS", depart: "16:50", durationMinutes: 1025, plusDays: 1, baseFare: 3100, taxes: 210, fees: 130, reliability: 0.84 },
  { id: "12302", type: "train", operator: "Howrah Rajdhani", operatorId: "IRCTC", from: "NDLS", to: "HWH", depart: "16:55", durationMinutes: 1020, plusDays: 1, baseFare: 3100, taxes: 210, fees: 130, reliability: 0.85 },

  // MAS <-> HWH
  { id: "12841", type: "train", operator: "Coromandel Express", operatorId: "IRCTC", from: "MAS", to: "HWH", depart: "08:45", durationMinutes: 1470, plusDays: 1, baseFare: 1700, taxes: 130, fees: 70, reliability: 0.75 },
  { id: "12842", type: "train", operator: "Coromandel Express", operatorId: "IRCTC", from: "HWH", to: "MAS", depart: "15:30", durationMinutes: 1470, plusDays: 1, baseFare: 1700, taxes: 130, fees: 70, reliability: 0.76 },

  // MAS <-> NDLS
  { id: "12621", type: "train", operator: "Tamil Nadu Express", operatorId: "IRCTC", from: "MAS", to: "NDLS", depart: "22:00", durationMinutes: 1980, plusDays: 1, baseFare: 2000, taxes: 150, fees: 80, reliability: 0.76 },
  { id: "12622", type: "train", operator: "Tamil Nadu Express", operatorId: "IRCTC", from: "NDLS", to: "MAS", depart: "21:05", durationMinutes: 1980, plusDays: 1, baseFare: 2000, taxes: 150, fees: 80, reliability: 0.77 },

  // MAS <-> SC
  { id: "12712", type: "train", operator: "Pinakini Express", operatorId: "IRCTC", from: "MAS", to: "SC", depart: "06:10", durationMinutes: 420, baseFare: 780, taxes: 60, fees: 35, reliability: 0.79 },
  { id: "12711", type: "train", operator: "Pinakini Express", operatorId: "IRCTC", from: "SC", to: "MAS", depart: "14:20", durationMinutes: 420, baseFare: 780, taxes: 60, fees: 35, reliability: 0.79 },

  // CSMT <-> SBC
  { id: "11301", type: "train", operator: "Udyan Express", operatorId: "IRCTC", from: "CSMT", to: "SBC", depart: "08:10", durationMinutes: 1420, plusDays: 1, baseFare: 1600, taxes: 120, fees: 70, reliability: 0.76 },
  { id: "11302", type: "train", operator: "Udyan Express", operatorId: "IRCTC", from: "SBC", to: "CSMT", depart: "20:45", durationMinutes: 1410, plusDays: 1, baseFare: 1600, taxes: 120, fees: 70, reliability: 0.76 },

  // CSMT <-> SC
  { id: "12701", type: "train", operator: "Hussain Sagar Express", operatorId: "IRCTC", from: "CSMT", to: "SC", depart: "21:50", durationMinutes: 840, plusDays: 1, baseFare: 1200, taxes: 100, fees: 50, reliability: 0.81 },
  { id: "12702", type: "train", operator: "Hussain Sagar Express", operatorId: "IRCTC", from: "SC", to: "CSMT", depart: "14:50", durationMinutes: 850, plusDays: 1, baseFare: 1200, taxes: 100, fees: 50, reliability: 0.81 },

  // CSMT <-> MAS (Mumbai - Chennai)
  { id: "22159", type: "train", operator: "Mumbai Chennai Mail", operatorId: "IRCTC", from: "CSMT", to: "MAS", depart: "12:45", durationMinutes: 1380, plusDays: 1, baseFare: 1750, taxes: 130, fees: 70, reliability: 0.78 },
  { id: "22160", type: "train", operator: "Chennai Mumbai Express", operatorId: "IRCTC", from: "MAS", to: "CSMT", depart: "13:25", durationMinutes: 1390, plusDays: 1, baseFare: 1750, taxes: 130, fees: 70, reliability: 0.78 },

  // CSMT <-> HWH (Mumbai - Kolkata)
  { id: "12809", type: "train", operator: "Mumbai Howrah Mail", operatorId: "IRCTC", from: "CSMT", to: "HWH", depart: "21:10", durationMinutes: 1960, plusDays: 1, baseFare: 2400, taxes: 170, fees: 90, reliability: 0.76 },
  { id: "12810", type: "train", operator: "Howrah Mumbai Mail", operatorId: "IRCTC", from: "HWH", to: "CSMT", depart: "19:45", durationMinutes: 1970, plusDays: 1, baseFare: 2400, taxes: 170, fees: 90, reliability: 0.76 },
  { id: "12261", type: "train", operator: "Howrah Duronto Express", operatorId: "IRCTC", from: "CSMT", to: "HWH", depart: "17:15", durationMinutes: 1560, plusDays: 1, baseFare: 2900, taxes: 200, fees: 120, reliability: 0.85 },
  { id: "12262", type: "train", operator: "Mumbai Duronto Express", operatorId: "IRCTC", from: "HWH", to: "CSMT", depart: "05:45", durationMinutes: 1570, plusDays: 1, baseFare: 2900, taxes: 200, fees: 120, reliability: 0.85 },

  // BLR <-> PUNE (Bangalore - Pune)
  { id: "11006", type: "train", operator: "Chalukya Express", operatorId: "IRCTC", from: "SBC", to: "PUNE", depart: "04:30", durationMinutes: 1020, baseFare: 850, taxes: 70, fees: 40, reliability: 0.81 },
  { id: "11005", type: "train", operator: "Chalukya Express", operatorId: "IRCTC", from: "PUNE", to: "SBC", depart: "22:00", durationMinutes: 1020, plusDays: 1, baseFare: 850, taxes: 70, fees: 40, reliability: 0.81 },
  { id: "16508", type: "train", operator: "Jodhpur Express", operatorId: "IRCTC", from: "SBC", to: "PUNE", depart: "22:20", durationMinutes: 980, plusDays: 1, baseFare: 900, taxes: 80, fees: 40, reliability: 0.8 },
  { id: "16507", type: "train", operator: "Bangalore Express", operatorId: "IRCTC", from: "PUNE", to: "SBC", depart: "18:45", durationMinutes: 990, plusDays: 1, baseFare: 900, taxes: 80, fees: 40, reliability: 0.8 },

  // BLR <-> HWH (Bangalore - Kolkata)
  { id: "12246", type: "train", operator: "Duronto Express", operatorId: "IRCTC", from: "YPR", to: "HWH", depart: "11:20", durationMinutes: 1740, plusDays: 1, baseFare: 2800, taxes: 190, fees: 110, reliability: 0.85 },
  { id: "12245", type: "train", operator: "Duronto Express", operatorId: "IRCTC", from: "HWH", to: "YPR", depart: "10:50", durationMinutes: 1750, plusDays: 1, baseFare: 2800, taxes: 190, fees: 110, reliability: 0.85 },
  { id: "12864", type: "train", operator: "Howrah Express", operatorId: "IRCTC", from: "SBC", to: "HWH", depart: "10:35", durationMinutes: 1920, plusDays: 1, baseFare: 2100, taxes: 150, fees: 80, reliability: 0.77 },
  { id: "12863", type: "train", operator: "Bangalore Express", operatorId: "IRCTC", from: "HWH", to: "SBC", depart: "22:55", durationMinutes: 1930, plusDays: 1, baseFare: 2100, taxes: 150, fees: 80, reliability: 0.76 },

  // NDLS <-> PUNE (Delhi - Pune)
  { id: "12264", type: "train", operator: "Pune Duronto Express", operatorId: "IRCTC", from: "NDLS", to: "PUNE", depart: "06:15", durationMinutes: 1180, baseFare: 2600, taxes: 180, fees: 100, reliability: 0.86 },
  { id: "12263", type: "train", operator: "Delhi Duronto Express", operatorId: "IRCTC", from: "PUNE", to: "NDLS", depart: "11:10", durationMinutes: 1185, baseFare: 2600, taxes: 180, fees: 100, reliability: 0.86 },
  { id: "12780", type: "train", operator: "Goa Express", operatorId: "IRCTC", from: "NDLS", to: "PUNE", depart: "15:15", durationMinutes: 1540, plusDays: 1, baseFare: 1900, taxes: 140, fees: 80, reliability: 0.78 },
  { id: "12779", type: "train", operator: "Goa Express", operatorId: "IRCTC", from: "PUNE", to: "NDLS", depart: "04:30", durationMinutes: 1530, plusDays: 1, baseFare: 1900, taxes: 140, fees: 80, reliability: 0.78 },

  // SC <-> HWH (Hyderabad - Kolkata)
  { id: "12704", type: "train", operator: "Falaknuma Express", operatorId: "IRCTC", from: "SC", to: "HWH", depart: "15:55", durationMinutes: 1540, plusDays: 1, baseFare: 1850, taxes: 140, fees: 80, reliability: 0.79 },
  { id: "12703", type: "train", operator: "Falaknuma Express", operatorId: "IRCTC", from: "HWH", to: "SC", depart: "08:35", durationMinutes: 1550, plusDays: 1, baseFare: 1850, taxes: 140, fees: 80, reliability: 0.79 },
  { id: "12286", type: "train", operator: "Secunderabad Duronto", operatorId: "IRCTC", from: "SC", to: "HWH", depart: "04:40", durationMinutes: 1300, baseFare: 2400, taxes: 170, fees: 90, reliability: 0.86 },
  { id: "12285", type: "train", operator: "Howrah Duronto", operatorId: "IRCTC", from: "HWH", to: "SC", depart: "17:45", durationMinutes: 1310, plusDays: 1, baseFare: 2400, taxes: 170, fees: 90, reliability: 0.86 },

  // PUNE <-> HWH (Pune - Kolkata)
  { id: "12129", type: "train", operator: "Azad Hind Express", operatorId: "IRCTC", from: "PUNE", to: "HWH", depart: "18:35", durationMinutes: 2010, plusDays: 1, baseFare: 2200, taxes: 160, fees: 90, reliability: 0.75 },
  { id: "12130", type: "train", operator: "Azad Hind Express", operatorId: "IRCTC", from: "HWH", to: "PUNE", depart: "21:45", durationMinutes: 2020, plusDays: 1, baseFare: 2200, taxes: 160, fees: 90, reliability: 0.75 },
  { id: "12221", type: "train", operator: "Howrah Duronto", operatorId: "IRCTC", from: "PUNE", to: "HWH", depart: "15:15", durationMinutes: 1640, plusDays: 1, baseFare: 2700, taxes: 190, fees: 110, reliability: 0.84 },
  { id: "12222", type: "train", operator: "Pune Duronto", operatorId: "IRCTC", from: "HWH", to: "PUNE", depart: "08:20", durationMinutes: 1650, plusDays: 1, baseFare: 2700, taxes: 190, fees: 110, reliability: 0.84 },

  // PUNE <-> MAS (Pune - Chennai)
  { id: "12163", type: "train", operator: "Chennai Express", operatorId: "IRCTC", from: "PUNE", to: "MAS", depart: "00:10", durationMinutes: 1180, baseFare: 1400, taxes: 110, fees: 60, reliability: 0.8 },
  { id: "12164", type: "train", operator: "Pune Express", operatorId: "IRCTC", from: "MAS", to: "PUNE", depart: "18:25", durationMinutes: 1175, plusDays: 1, baseFare: 1400, taxes: 110, fees: 60, reliability: 0.8 },
];
