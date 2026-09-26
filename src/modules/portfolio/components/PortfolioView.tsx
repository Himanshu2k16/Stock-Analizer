"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Delta, EmptyState, Panel, Stat, TextField, inputClass } from "@/components/ui";
import { displaySymbol, money, price, signedMoney, signedPercent } from "@/lib/format";
import { useMarket } from "@/modules/market";

const palette = ["#20c7df", "#26d983", "#ff5f5f", "#f4b860", "#7c5cff", "#38bdf8", "#f472b6", "#a3e635"];

export function PortfolioView() {
  const { portfolio, quotes, holdings, addHolding, removeHolding, addSymbol, selectSymbol } = useMarket();
  const unrealizedPercent = portfolio.totalCost ? (portfolio.unrealizedPnl / portfolio.totalCost) * 100 : 0;
  const quoted = quotes.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Market value" value={quoted ? money(portfolio.totalValue) : "—"} detail={`${holdings.length} positions`} />
        <Stat label="Cost basis" value={money(portfolio.totalCost)} detail="Capital deployed" />
        <Stat
          label="Unrealized P&L"
          value={quoted ? signedMoney(portfolio.unrealizedPnl) : "—"}
          tone={portfolio.unrealizedPnl >= 0 ? "jade" : "coral"}
          detail={<span className="num">{signedPercent(unrealizedPercent)} on cost</span>}
        />
        <Stat
          label="Day P&L"
          value={quoted ? signedMoney(portfolio.dayPnl) : "—"}
          tone={portfolio.dayPnl >= 0 ? "jade" : "coral"}
          detail="Based on latest price"
        />
      </div>

      <Panel label="Where your money is" title="Portfolio allocation">
        {portfolio.positions.length === 0 ? (
          <EmptyState>No holdings yet — add a position on the right.</EmptyState>
        ) : (
          <>
            <div className="flex h-3 overflow-hidden rounded-full border border-hairline">
              {portfolio.positions.map((position, index) => (
                <span
                  key={position.id}
                  title={`${displaySymbol(position.symbol)} · ${position.weight.toFixed(1)}%`}
                  style={{ width: `${position.weight}%`, background: palette[index % palette.length] }}
                  className="h-full transition-all duration-500"
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {portfolio.positions.map((position, index) => (
                <span key={position.id} className="flex items-center gap-2 text-xs text-paper-dim">
                  <span className="size-2 rounded-sm" style={{ background: palette[index % palette.length] }} />
                  {displaySymbol(position.symbol)}
                  <span className="num text-paper-faint">{position.weight.toFixed(1)}%</span>
                </span>
              ))}
            </div>
          </>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel label="Your stocks" title="Holdings" className="lg:col-span-2">
          {portfolio.positions.length === 0 ? (
            <EmptyState>The book is empty.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    {["Stock", "Qty", "Buy price", "Current", "Today", "Value", "Profit / Loss", "Chart", ""].map((heading) => (
                      <th key={heading} className="label-mono pb-3 pr-4 font-medium">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.positions.map((position) => {
                    const up = position.unrealizedPnl >= 0;
                    return (
                      <tr key={position.id} className="group border-b border-hairline/60 last:border-0 hover:bg-ink-850">
                        <td className="py-3 pr-4">
                          <p className="font-mono text-xs uppercase text-paper">{displaySymbol(position.symbol)}</p>
                          <p className="mt-0.5 max-w-56 truncate text-[11px] text-paper-faint" title={position.thesis}>
                            {position.thesis || "No thesis recorded"}
                          </p>
                        </td>
                        <td className="num py-3 pr-4 text-paper-dim">{position.quantity}</td>
                        <td className="num py-3 pr-4 text-paper-dim">{price(position.averagePrice)}</td>
                        <td className="num py-3 pr-4 text-paper">{position.quote ? price(position.quote.price, position.quote.currency) : "—"}</td>
                        <td className="py-3 pr-4">{position.quote ? <Delta percent={position.quote.changePercent} /> : <span className="text-xs text-paper-faint">—</span>}</td>
                        <td className="num py-3 pr-4 text-paper">{money(position.marketValue)}</td>
                        <td className="py-3 pr-4">
                          <p className={`num text-xs ${up ? "text-jade" : "text-coral"}`}>{signedMoney(position.unrealizedPnl)}</p>
                          <p className={`num text-[10px] ${up ? "text-jade/70" : "text-coral/70"}`}>
                            {position.costBasis ? signedPercent((position.unrealizedPnl / position.costBasis) * 100) : ""}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => selectSymbol(position.symbol)}
                            className="rounded-md border border-brass/35 bg-brass-deep px-3 py-1.5 font-mono text-[10px] uppercase text-brass-bright hover:bg-brass hover:text-ink-950"
                          >
                            View
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => removeHolding(position.id)}
                            title="Remove holding"
                            className="rounded p-1.5 text-paper-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-coral-deep hover:text-coral focus:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <AddHolding
          onSubmit={(holding) => {
            addSymbol(holding.symbol);
            addHolding(holding);
          }}
        />
      </div>
    </div>
  );
}

function AddHolding({ onSubmit }: { onSubmit: (holding: { symbol: string; quantity: number; averagePrice: number; thesis: string }) => void }) {
  const [form, setForm] = useState({ symbol: "", quantity: "", averagePrice: "", thesis: "" });
  const [error, setError] = useState<string>();

  function submit(event: FormEvent) {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const averagePrice = Number(form.averagePrice);
    if (!form.symbol.trim()) return setError("Symbol is required.");
    if (!(quantity > 0) || !(averagePrice > 0)) return setError("Quantity and average price must be positive.");
    onSubmit({ symbol: form.symbol, quantity, averagePrice, thesis: form.thesis.trim() });
    setForm({ symbol: "", quantity: "", averagePrice: "", thesis: "" });
    setError(undefined);
  }

  return (
    <Panel label="Add stock to portfolio" title="Add holding">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <p className="label-mono mb-1.5">Symbol</p>
          <input
            value={form.symbol}
            onChange={(event) => setForm({ ...form, symbol: event.target.value })}
            placeholder="e.g. INFY"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label-mono mb-1.5">Quantity</p>
            <input
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <p className="label-mono mb-1.5">Avg price ₹</p>
            <TextField
              type="number"
              min="0"
              step="any"
              value={form.averagePrice}
              onChange={(event) => setForm({ ...form, averagePrice: event.target.value })}
            />
          </div>
        </div>
        <div>
          <p className="label-mono mb-1.5">Thesis (optional)</p>
          <TextField value={form.thesis} onChange={(event) => setForm({ ...form, thesis: event.target.value })} placeholder="Why you hold" />
        </div>
        {error && <p className="text-xs text-coral">{error}</p>}
        <Button type="submit" className="w-full">
          <Plus size={13} />
          Record position
        </Button>
        <p className="text-[11px] leading-relaxed text-paper-faint">
          Stored on this device only. Replacing a symbol merges into the existing line.
        </p>
      </form>
    </Panel>
  );
}
