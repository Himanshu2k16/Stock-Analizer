import type { ChartPoint, MarketQuote } from "@/types/investment";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        currency?: string;
        symbol?: string;
        exchangeName?: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketChangePercent?: number;
        regularMarketTime?: number;
        longName?: string;
        shortName?: string;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        regularMarketVolume?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: { description?: string };
  };
};

export async function getYahooChart(symbol: string, range = "6mo", interval = "1d"): Promise<MarketQuote> {
  const encoded = encodeURIComponent(symbol.trim().toUpperCase());
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=${range}&interval=${interval}`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: { "user-agent": "Mozilla/5.0 PersonalAIInvestmentAgent/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned ${response.status}`);
  }

  const payload = (await response.json()) as YahooChartResponse;
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  if (!result || !meta) {
    throw new Error(payload.chart?.error?.description || `No market data for ${symbol}`);
  }

  const series = result.indicators?.quote?.[0];
  const opens = series?.open || [];
  const highs = series?.high || [];
  const lows = series?.low || [];
  const closes = series?.close || [];
  const volumes = series?.volume || [];
  const timestamps = result.timestamp || [];
  const history: ChartPoint[] = timestamps
    .map((time, index) => {
      const close = closes[index];
      if (!close) return undefined;
      const point: ChartPoint = {
        date: new Date(time * 1000).toISOString(),
        close: Number(close.toFixed(2)),
        volume: volumes[index] || 0,
      };
      if (opens[index]) point.open = Number(opens[index]?.toFixed(2));
      if (highs[index]) point.high = Number(highs[index]?.toFixed(2));
      if (lows[index]) point.low = Number(lows[index]?.toFixed(2));
      return point;
    })
    .filter((point): point is ChartPoint => Boolean(point));

  const price = meta.regularMarketPrice || history.at(-1)?.close || 0;
  const liveChangePercent = meta.regularMarketChangePercent;
  const previousClose =
    typeof liveChangePercent === "number" && liveChangePercent !== -100
      ? price / (1 + liveChangePercent / 100)
      : history.at(-2)?.close || meta.chartPreviousClose || price;
  const change = price - previousClose;
  const changePercent = typeof liveChangePercent === "number" ? liveChangePercent : previousClose ? (change / previousClose) * 100 : 0;

  return {
    symbol: meta.symbol || symbol,
    name: meta.longName || meta.shortName || symbol,
    exchange: meta.exchangeName || "Market",
    currency: meta.currency || "INR",
    price,
    previousClose,
    change,
    changePercent,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    source: "Yahoo Finance chart API",
    history,
  };
}
