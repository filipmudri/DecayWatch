// FILE: lib/types/account.ts

export type Tier = "Diamond" | "Master" | "Grandmaster" | "Challenger";

export type Server =
  | "EUW" | "EUNE" | "NA" | "KR" | "BR" | "LAN" | "LAS"
  | "TR" | "RU" | "OCE" | "JP" | "ME" | "SEA" | "TW" | "VN";

export interface Account {
  id: string;
  riotId: string;
  server: Server;
  tier: Tier;
  decayDate: string; // ISO date string
  note?: string;
  createdAt: string;
  lastUpdated: string;
}