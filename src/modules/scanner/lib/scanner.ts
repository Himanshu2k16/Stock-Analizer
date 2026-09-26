import type { MarketQuote } from "@/types/market";
import type { ScannerMatch, ScannerTemplate, ScannerTemplateId } from "@/types/scanner";
import { addIndicators, average, round } from "@/modules/market/lib/indicators";

export const scannerTemplates: ScannerTemplate[] = [
  {
    id: "ema200-touch",
    name: "EMA 200 Retest",
    tagline: "Mean reversion",
    description: "Price opens at or below the 200-day average and closes back above it — a reclaimed level worth watching.",
    filters: ["Daily open ≤ EMA(close, 200)", "Daily close ≥ EMA(close, 200)"],
  },
  {
    id: "golden-cross",
    name: "Golden Cross",
    tagline: "Trend change",
    description: "The 50-day average crosses above the 200-day average on the daily chart — the classic regime-shift signal.",
    filters: ["Yesterday EMA(50) ≤ EMA(200)", "Today EMA(50) > EMA(200)"],
  },
  {
    id: "volume-breakout",
    name: "Volume Breakout",
    tagline: "Momentum",
    description: "A close through the 55-session high backed by volume well above its 20-day average.",
    filters: ["Close ≥ 55-session high", "Volume ≥ 1.5× 20-session average"],
  },
  {
    id: "rsi-reversal",
    name: "RSI Reversal",
    tagline: "Oversold bounce",
    description: "RSI(14) turning up from the weak zone while the day prints a green candle.",
    filters: ["Yesterday RSI(14) ≤ 35", "RSI(14) rising", "Close > Open"],
  },
];

export function getScannerTemplate(id: ScannerTemplateId) {
  return scannerTemplates.find((template) => template.id === id) ?? scannerTemplates[0];
}

export function evaluateScannerQuote(quote: MarketQuote, template: ScannerTemplateId): ScannerMatch | undefined {
  const history = addIndicators(quote.history);
  const latest = history.at(-1);
  const previous = history.at(-2);
  if (!latest || !previous) return undefined;

  const volumeAverage = average(history.slice(-21, -1).map((point) => point.volume));
  const distance = latest.ema200 ? ((latest.close - latest.ema200) / latest.ema200) * 100 : undefined;
  const base: Omit<ScannerMatch, "signal" | "score"> = {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    changePercent: quote.changePercent,
    volume: quote.volume ?? latest.volume,
    ema200: latest.ema200,
    ema50: latest.ema50,
    rsi14: latest.rsi14,
    distanceFromEma200: round(distance),
    source: quote.source,
    timestamp: quote.timestamp,
    history,
  };
  const score = signalScore(distance, quote.changePercent, latest.volume, volumeAverage);

  const openedBelowEma = typeof latest.open === "number" && typeof latest.ema200 === "number" && latest.open <= latest.ema200;
  if (template === "ema200-touch") {
    if (!openedBelowEma || !latest.ema200 || latest.close < latest.ema200) return undefined;
    return { ...base, signal: "Reclaimed the 200-day average", score };
  }

  if (template === "golden-cross") {
    const crossed =
      typeof previous.ema50 === "number" &&
      typeof previous.ema200 === "number" &&
      typeof latest.ema50 === "number" &&
      typeof latest.ema200 === "number" &&
      previous.ema50 <= previous.ema200 &&
      latest.ema50 > latest.ema200;
    if (!crossed) return undefined;
    return { ...base, signal: "EMA 50 crossed above EMA 200", score };
  }

  if (template === "volume-breakout") {
    const rangeHigh = Math.max(...history.slice(-55, -1).map((point) => point.high ?? point.close));
    if (!(latest.close >= rangeHigh && volumeAverage > 0 && latest.volume >= volumeAverage * 1.5)) return undefined;
    return { ...base, signal: "55-session high on expanded volume", score };
  }

  const reversed =
    typeof previous.rsi14 === "number" &&
    typeof latest.rsi14 === "number" &&
    previous.rsi14 <= 35 &&
    latest.rsi14 > previous.rsi14 &&
    latest.close > (latest.open ?? latest.close);
  if (!reversed) return undefined;
  return { ...base, signal: "RSI recovery from the weak zone", score };
}

function signalScore(distance: number | undefined, changePercent: number, volume: number, volumeAverage: number) {
  const proximity = typeof distance === "number" ? Math.max(0, 30 - Math.abs(distance) * 6) : 0;
  const momentum = Math.max(0, Math.min(28, changePercent * 4));
  const participation = volumeAverage ? Math.min(32, (volume / volumeAverage) * 16) : 12;
  return Math.round(Math.min(99, 36 + proximity + momentum + participation));
}
