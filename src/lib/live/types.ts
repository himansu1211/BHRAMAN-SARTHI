// Every value shown to a traveller must carry provenance.
export type SourceName = "ixigo" | "skyscanner" | "redbus" | "sample";
export type Mode = "train" | "flight" | "bus";

export interface Provenance {
  source: SourceName;
  fetchedAt: string; // ISO
  bookingUrl?: string;
}

export interface LiveOption extends Provenance {
  id: string;
  mode: Mode;
  number: string;      // train no. / flight no. / bus service id — exactly as the source reports it
  name: string;        // train name / airline / operator — exactly as the source reports it
  fromCode: string;    // station / IATA / bus terminal code
  toCode: string;
  fromLabel: string;
  toLabel: string;
  departISO: string;   // with +05:30 offset
  arriveISO: string;
  fare?: number;       // INR, lowest available
  availability?: { cls: string; status: string; fare?: number }[]; // e.g. {cls:"3A",status:"WL 14"}
}

export interface LiveQuery {
  fromCity: string;
  toCity: string;
  date: string; // YYYY-MM-DD
}

export interface ProviderStatus {
  provider: SourceName;
  state: "ok" | "unavailable" | "empty";
  detail?: string;
  count: number;
  ms: number;
}

export interface HubPoint {
  city: string;
  lat: number;
  lng: number;
  airport?: string;      // IATA
  stations: string[];    // railway codes
  busTerminals?: string[];
}
