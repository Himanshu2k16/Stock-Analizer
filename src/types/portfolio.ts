import type { MarketQuote } from "./market";

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  thesis: string;
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
