"use client";

import clsx from "clsx";
import { Pause, Play, Trash2 } from "lucide-react";
import { Dot, Pill } from "@/components/ui";
import { isAlertTriggered } from "../lib/alerts";
import { displaySymbol, money, price, sessionDate } from "@/lib/format";
import { useMarket } from "@/modules/market";

export function AlertList({ limit }: { limit?: number }) {
  const { alerts, quotes, toggleAlert, removeAlert, selectSymbol } = useMarket();
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const visible = limit ? alerts.slice(0, limit) : alerts;

  if (visible.length === 0) {
    return <p className="py-8 text-center text-sm text-paper-faint">No alert rules yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {visible.map((alert) => {
        const quote = quoteMap.get(alert.symbol);
        const triggered = isAlertTriggered(alert, quote);
        const distance = quote ? ((quote.price - alert.threshold) / alert.threshold) * 100 : undefined;
        return (
          <li
            key={alert.id}
            className={clsx(
              "group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
              triggered ? "border-brass/45 bg-brass-deep shadow-[0_0_30px_-24px_rgba(32,199,223,0.8)]" : "border-hairline bg-ink-900/90 hover:border-hairline-strong hover:bg-ink-850",
            )}
          >
            <Dot on={triggered} className={clsx(triggered && "animate-pulse")} />
            <button
              onClick={() => selectSymbol(alert.symbol)}
              className="min-w-0 flex-1 text-left"
              title="Open chart"
            >
              <p className="font-mono text-xs uppercase text-paper">
                {displaySymbol(alert.symbol)} <span className="text-paper-faint">{alert.operator}</span> {money(alert.threshold)}
              </p>
              <p className="num mt-1 text-[11px] text-paper-faint">
                {quote ? `Live ${price(quote.price, quote.currency)}` : "Awaiting quote"}
                {distance !== undefined && ` · ${(distance >= 0 ? "+" : "") + distance.toFixed(1)}% from line`}
              </p>
            </button>
            <span className="hidden text-[10px] text-paper-faint sm:block">{sessionDate(alert.createdAt)}</span>
            <Pill tone={alert.active ? (triggered ? "brass" : "steel") : "neutral"}>{alert.active ? (triggered ? "Fired" : "Armed") : "Paused"}</Pill>
            <span className="hidden text-[10px] uppercase tracking-wider text-paper-faint md:block">{alert.createdBy}</span>
            <button
              onClick={() => selectSymbol(alert.symbol)}
              className="rounded-md border border-brass/35 bg-brass-deep px-3 py-1.5 font-mono text-[10px] uppercase text-brass-bright hover:bg-brass hover:text-ink-950"
            >
              Chart
            </button>
            <div className="flex items-center gap-1 opacity-40 transition-opacity group-hover:opacity-100">
              <button onClick={() => toggleAlert(alert.id)} title={alert.active ? "Pause" : "Resume"} className="rounded p-1.5 text-paper-dim hover:bg-ink-800 hover:text-paper">
                {alert.active ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button onClick={() => removeAlert(alert.id)} title="Delete" className="rounded p-1.5 text-paper-dim hover:bg-coral-deep hover:text-coral">
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
