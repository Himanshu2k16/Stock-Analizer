import { NextResponse } from "next/server";
import { getYahooChart } from "@/lib/market/yahoo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") || "TATASTEEL.NS,INFY.NS,RELIANCE.NS")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 16);

  const settled = await Promise.allSettled(symbols.map((symbol) => getYahooChart(symbol)));
  const quotes = settled.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  const errors = settled.flatMap((result, index) => (result.status === "rejected" ? [{ symbol: symbols[index], message: result.reason instanceof Error ? result.reason.message : "Unknown error" }] : []));

  return NextResponse.json({ quotes, errors, fetchedAt: new Date().toISOString() });
}
