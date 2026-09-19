"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { InstrumentPanel } from "@/components/InstrumentPanel";
import { TradingViewLink } from "@/components/TradingViewLink";
import { Delta, EmptyState, Panel, Sparkline } from "@/components/ui";
import { compact, displaySymbol, price } from "@/lib/logic/format";
import { useMarket } from "@/lib/market/MarketProvider";

export function MarketsView() {
  const { quotes, errors, loading, selectedSymbol, selectSymbol, removeSymbol } = useMarket();

  return (
    <div className="space-y-5">
      <InstrumentPanel quote={quotes.find((quote) => quote.symbol === selectedSymbol)} />

      <Panel label={`${quotes.length} instruments`} title="Watchlist board">
        {quotes.length === 0 && loading ? (
          <p className="py-8 text-center text-sm text-paper-faint">Pulling the first sync from Yahoo Finance…</p>
        ) : quotes.length === 0 ? (
          <EmptyState>Watchlist is empty — add a symbol from the search above.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  {["Instrument", "LTP", "Session", "Trend 10d", "Volume", "TradingView", ""].map((heading) => (
                    <th key={heading} className="label-mono pb-3 pr-4 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => {
                  const active = quote.symbol === selectedSymbol;
                  const trend = quote.history.slice(-10).map((point) => point.close);
                  return (
                    <tr
                      key={quote.symbol}
                      onClick={() => selectSymbol(quote.symbol)}
                      className={clsx(
                        "group cursor-pointer border-b border-hairline/60 transition-colors last:border-0",
                        active ? "bg-brass-deep/70" : "hover:bg-ink-850",
                      )}
                    >
                      <td className="py-3 pr-4">
                        <p className={clsx("font-mono text-xs uppercase", active ? "text-brass-bright" : "text-paper")}>
                          {displaySymbol(quote.symbol)}
                        </p>
                        <p className="mt-0.5 max-w-52 truncate text-[11px] text-paper-faint">{quote.name}</p>
                      </td>
                      <td className="num py-3 pr-4 text-paper">{price(quote.price, quote.currency)}</td>
                      <td className="py-3 pr-4">
                        <Delta percent={quote.changePercent} />
                      </td>
                      <td className="py-3 pr-4">
                        <Sparkline values={trend} up={quote.changePercent >= 0} />
                      </td>
                      <td className="num py-3 pr-4 text-xs text-paper-dim">{compact(quote.volume)}</td>
                      <td className="py-3 pr-4">
                        <TradingViewLink symbol={quote.symbol} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            removeSymbol(quote.symbol);
                          }}
                          title="Remove from watchlist"
                          className="rounded p-1.5 text-paper-faint opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:bg-coral-deep hover:text-coral"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {errors.length > 0 && (
          <p className="mt-4 border-t border-hairline pt-3 text-xs text-coral">
            Unresolved: {errors.map((error) => displaySymbol(error.symbol)).join(", ")} — missing data is never invented.
          </p>
        )}
      </Panel>
    </div>
  );
}
