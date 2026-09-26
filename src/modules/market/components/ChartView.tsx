"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Pill } from "@/components/ui";
import { displaySymbol, price, signedPercent } from "@/lib/format";
import { useMarket } from "./MarketProvider";
import { PriceChart } from "./PriceChart";
import { TradingViewWidget } from "./TradingViewWidget";
import { tradingViewSymbol } from "../lib/tradingview";

/**
 * Full-page chart, rendered inside the app. Opens from the "TradingView chart"
 * button on the instrument panel and the CHART button on alert rows via
 * /chart?symbol=NSE_SYMBOL. The TradingView engine (full tools) is the
 * default; the Meridian engine is the app's own Yahoo-fed chart fallback.
 */
export function ChartView() {
  const params = useSearchParams();
  const { quotes, selectedSymbol, selectSymbol } = useMarket();
  const [engine, setEngine] = useState<"tradingview" | "meridian">("tradingview");

  const requested = params.get("symbol");
  useEffect(() => {
    if (requested) selectSymbol(requested);
  }, [requested, selectSymbol]);

  const symbol = requested ?? selectedSymbol ?? quotes[0]?.symbol ?? "";
  const quote = quotes.find((item) => item.symbol === symbol);
  const up = (quote?.changePercent ?? 0) >= 0;

  return (
    <div className="flex h-screen flex-col bg-ink-950">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-hairline px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-hairline px-3 text-[12px] font-medium text-paper-dim transition-colors hover:border-accent/50 hover:text-accent-bright"
          >
            <ArrowLeft size={13} strokeWidth={1.6} />
            Desk
          </Link>
          <div className="min-w-0">
            <p className="flex items-baseline gap-3 truncate font-display text-base font-semibold leading-tight text-paper">
              {symbol ? displaySymbol(symbol) : "Chart"}
              {quote && (
                <span className={up ? "num text-xs text-jade" : "num text-xs text-coral"}>
                  {price(quote.price, quote.currency)} {signedPercent(quote.changePercent)}
                </span>
              )}
            </p>
            <p className="label-mono truncate">{symbol ? tradingViewSymbol(symbol) : "No symbol selected"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md border border-hairline bg-ink-950/70 p-1">
            {(
              [
                { id: "tradingview", label: "TradingView" },
                { id: "meridian", label: "Meridian" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setEngine(item.id)}
                className={
                  item.id === engine
                    ? "rounded bg-accent-deep px-3 py-1 text-[12px] font-medium text-accent-bright"
                    : "rounded px-3 py-1 text-[11px] font-medium text-paper-faint transition-colors hover:text-paper-dim"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <Pill tone="accent" className="hidden sm:inline-flex">
            Full page · in-app
          </Pill>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        {!symbol ? (
          <div className="grid h-full place-items-center text-sm text-paper-faint">
            Pick a stock from the desk first, then open its chart here.
          </div>
        ) : engine === "tradingview" ? (
          <TradingViewWidget symbol={symbol} full />
        ) : (
          <div className="h-full overflow-hidden px-4 py-4">
            <PriceChart quote={quote} fill />
          </div>
        )}
      </div>
    </div>
  );
}
