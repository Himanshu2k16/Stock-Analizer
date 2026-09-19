export type AlertOperator = ">=" | "<=";

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  thesis: string;
}

export interface AlertRule {
  id: string;
  symbol: string;
  operator: AlertOperator;
  threshold: number;
  active: boolean;
  createdBy: "USER" | "AGENT";
  createdAt: string;
}

export interface ChartPoint {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi14?: number;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  timestamp: string;
  source: string;
  history: ChartPoint[];
}

export interface PortfolioPosition extends Holding {
  quote?: MarketQuote;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  dayPnl: number;
  weight: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedPnl: number;
  dayPnl: number;
  positions: PortfolioPosition[];
  topPosition?: PortfolioPosition;
}

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  query: string;
}

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
