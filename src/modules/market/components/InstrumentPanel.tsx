"use client";

import { Panel, Pill } from "@/components/ui";
import { PriceChart } from "./PriceChart";
import { TradingViewWidget } from "./TradingViewWidget";
import type { MarketQuote } from "@/types/market";
import { clockTime, compact, price, signedPercent } from "@/lib/format";
import { tradingViewSymbol } from "../lib/tradingview";

export function InstrumentPanel({ quote }: { quote?: MarketQuote }) {
  if (!quote) {
    return (
      <Panel label="Stock chart" title="Choose a stock">
        <PriceChart quote={undefined} />
      </Panel>
    );
  }

  const up = quote.changePercent >= 0;
  const dayPosition = rangePosition(quote.price, quote.dayLow, quote.dayHigh);
  const yearPosition = rangePosition(quote.price, quote.fiftyTwoWeekLow, quote.fiftyTwoWeekHigh);

  return (
    <Panel
      label={`${quote.exchange} · ${quote.symbol}`}
      title={quote.name}
      actions={
        <>
          <Pill tone="brass">Updated {clockTime(quote.timestamp)}</Pill>
          <Pill tone={up ? "jade" : "coral"}>{signedPercent(quote.changePercent)} today</Pill>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brass/30 bg-brass-deep px-4 py-3">
        <div>
          <p className="label-mono">Full TradingView chart inside this app</p>
          <p className="mt-1 text-sm text-paper-dim">Candles, drawing tools, indicators, volume and zoom for {tradingViewSymbol(quote.symbol)}.</p>
        </div>
        <Pill tone="brass">Live widget</Pill>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <p className="num text-4xl leading-none text-paper">
            {price(quote.price, quote.currency)}
            <span className={up ? "ml-3 text-base text-jade" : "ml-3 text-base text-coral"}>
              {up ? "▲" : "▼"} {price(Math.abs(quote.change), quote.currency)}
            </span>
          </p>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-x-8 gap-y-3">
          <RangeBar label="Day range" low={quote.dayLow} high={quote.dayHigh} position={dayPosition} currency={quote.currency} />
          <RangeBar label="52-week range" low={quote.fiftyTwoWeekLow} high={quote.fiftyTwoWeekHigh} position={yearPosition} currency={quote.currency} />
        </div>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-4">
        <Metric term="Prev close" value={price(quote.previousClose, quote.currency)} />
        <Metric term="Day low" value={quote.dayLow !== undefined ? price(quote.dayLow, quote.currency) : "—"} />
        <Metric term="Day high" value={quote.dayHigh !== undefined ? price(quote.dayHigh, quote.currency) : "—"} />
        <Metric term="Volume" value={compact(quote.volume)} />
      </dl>

      <div className="mb-6">
        <TradingViewWidget symbol={quote.symbol} />
      </div>

      <PriceChart quote={quote} />
    </Panel>
  );
}

function Metric({ term, value }: { term: string; value: string }) {
  return (
    <div className="bg-ink-950/55 px-4 py-3">
      <dt className="label-mono">{term}</dt>
      <dd className="num mt-1.5 text-sm text-paper">{value}</dd>
    </div>
  );
}

function rangePosition(value: number, low?: number, high?: number) {
  if (low === undefined || high === undefined || high <= low) return undefined;
  return Math.min(1, Math.max(0, (value - low) / (high - low)));
}

function RangeBar({
  label,
  low,
  high,
  position,
  currency,
}: {
  label: string;
  low?: number;
  high?: number;
  position?: number;
  currency: string;
}) {
  return (
    <div>
      <p className="label-mono mb-2">{label}</p>
      <div className="relative h-1 rounded-full bg-ink-800">
        <span className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border border-ink-950 bg-brass shadow-[0_0_14px_rgba(32,199,223,0.45)]" style={{ left: `calc(${(position ?? 0) * 100}% - 5px)` }} />
      </div>
      <p className="num mt-1.5 flex justify-between text-[10px] text-paper-faint">
        <span>{low !== undefined ? price(low, currency) : "—"}</span>
        <span>{high !== undefined ? price(high, currency) : "—"}</span>
      </p>
    </div>
  );
}
