import type { ChartPoint } from "./market";

export type ScannerTemplateId = "ema200-touch" | "golden-cross" | "volume-breakout" | "rsi-reversal";

export interface ScannerTemplate {
  id: ScannerTemplateId;
  name: string;
  tagline: string;
  description: string;
  filters: string[];
}

export interface ScannerMatch {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  ema200?: number;
  ema50?: number;
  rsi14?: number;
  distanceFromEma200?: number;
  signal: string;
  score: number;
  source: string;
  timestamp: string;
  history: ChartPoint[];
}
