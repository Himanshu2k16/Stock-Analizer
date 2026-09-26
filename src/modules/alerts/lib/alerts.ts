import type { AlertOperator, AlertRule } from "@/types/alerts";
import type { MarketQuote } from "@/types/market";
import { normalizeSymbol } from "@/lib/format";

export function isAlertTriggered(alert: AlertRule, quote?: MarketQuote) {
  if (!alert.active || !quote) return false;
  return alert.operator === ">=" ? quote.price >= alert.threshold : quote.price <= alert.threshold;
}

export function triggeredAlerts(alerts: AlertRule[], quotes: MarketQuote[]) {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  return alerts.filter((alert) => isAlertTriggered(alert, quoteMap.get(alert.symbol)));
}

export interface ParsedAlert {
  symbol: string;
  operator: AlertOperator;
  threshold: number;
}

export function parseAlertText(text: string, quotes: MarketQuote[]): ParsedAlert | null {
  const haystack = text.toUpperCase();
  const quote = quotes.find((item) => haystack.includes(item.symbol.replace(".NS", "")) || haystack.includes(item.name.toUpperCase()));
  if (!quote) return null;

  const threshold = Number(text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)?.[1]);
  if (!Number.isFinite(threshold) || threshold <= 0) return null;

  const falling = /\b(below|under|bounce|niche|neeche|aave|pare)\b/i.test(text);
  return {
    symbol: normalizeSymbol(quote.symbol),
    operator: falling ? "<=" : ">=",
    threshold,
  };
}

export function createAlert(parsed: ParsedAlert, createdBy: AlertRule["createdBy"]): AlertRule {
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    symbol: parsed.symbol,
    operator: parsed.operator,
    threshold: parsed.threshold,
    active: true,
    createdBy,
    createdAt: new Date().toISOString(),
  };
}
