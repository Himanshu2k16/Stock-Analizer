import type { AlertRule, Holding } from "@/types/investment";

export const defaultWatchlist = [
  "TATASTEEL.NS",
  "INFY.NS",
  "RELIANCE.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "TCS.NS",
  "LT.NS",
  "SBIN.NS",
];

export const defaultHoldings: Holding[] = [
  {
    id: "holding-tata-steel",
    symbol: "TATASTEEL.NS",
    quantity: 120,
    averagePrice: 172,
    thesis: "Steel cycle recovery with balance-sheet discipline.",
  },
  {
    id: "holding-infy",
    symbol: "INFY.NS",
    quantity: 18,
    averagePrice: 1370,
    thesis: "Long-horizon IT services compounder; monitor discretionary demand.",
  },
  {
    id: "holding-reliance",
    symbol: "RELIANCE.NS",
    quantity: 12,
    averagePrice: 2440,
    thesis: "Diversified energy, telecom and retail cash-flow engine.",
  },
];

export const defaultAlerts: AlertRule[] = [
  {
    id: "alert-tata-200",
    symbol: "TATASTEEL.NS",
    operator: ">=",
    threshold: 200,
    active: true,
    createdBy: "USER",
    createdAt: new Date("2026-09-01T10:00:00+05:30").toISOString(),
  },
];
