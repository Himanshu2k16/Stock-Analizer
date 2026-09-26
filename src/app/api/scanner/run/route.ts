import { NextResponse } from "next/server";
import { defaultWatchlist } from "@/modules/market/lib/seed";
import { evaluateScannerQuote, scannerTemplates } from "@/modules/scanner/lib/scanner";
import { getYahooChart } from "@/modules/market/lib/yahoo";
import type { ScannerTemplateId } from "@/types/scanner";

const universe = [
  ...defaultWatchlist,
  "AXISBANK.NS",
  "BAJFINANCE.NS",
  "BHARTIARTL.NS",
  "HINDALCO.NS",
  "HINDUNILVR.NS",
  "ITC.NS",
  "KOTAKBANK.NS",
  "MARUTI.NS",
  "NTPC.NS",
  "SUNPHARMA.NS",
  "TITAN.NS",
  "ULTRACEMCO.NS",
  "WIPRO.NS",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("template") as ScannerTemplateId | null;
  const template = scannerTemplates.some((item) => item.id === requested) ? requested! : "ema200-touch";
  const symbols = (searchParams.get("symbols") || universe.join(","))
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 28);

  const settled = await Promise.allSettled(symbols.map((symbol) => getYahooChart(symbol, "1y", "1d")));
  const quotes = settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  const matches = quotes
    .map((quote) => evaluateScannerQuote(quote, template))
    .filter((match): match is NonNullable<typeof match> => Boolean(match))
    .sort((left, right) => right.score - left.score);

  const errors = settled.flatMap((result, index) =>
    result.status === "rejected"
      ? [{ symbol: symbols[index], message: result.reason instanceof Error ? result.reason.message : "Unknown error" }]
      : [],
  );

  return NextResponse.json({ template, universe: symbols.length, matches, errors, fetchedAt: new Date().toISOString() });
}
