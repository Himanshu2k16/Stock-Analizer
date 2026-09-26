"use client";

import clsx from "clsx";
import { Bell, Download, Play } from "lucide-react";
import { useState } from "react";
import { Button, Delta, EmptyState, Panel, Pill, SkeletonGrid } from "@/components/ui";
import { createAlert } from "@/lib/logic/alerts";
import { getScannerTemplate, scannerTemplates } from "@/lib/logic/scanner";
import { clockTime, displaySymbol, price } from "@/lib/logic/format";
import { matchesToCsv, useScanner } from "@/lib/hooks/useScanner";
import { useMarket } from "@/lib/market/MarketProvider";
import type { ScannerTemplateId } from "@/types/investment";

export function ScannerView() {
  const [template, setTemplate] = useState<ScannerTemplateId>("ema200-touch");
  const { result, loading, run } = useScanner(template, true);
  const { selectSymbol, addAlert } = useMarket();
  const active = getScannerTemplate(template);

  function exportCsv() {
    if (!result?.matches.length) return;
    const blob = new Blob([matchesToCsv(result.matches)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `meridian-${result.template}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function armAlert(symbol: string, threshold: number) {
    addAlert(createAlert({ symbol, operator: ">=", threshold }, "AGENT"));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {scannerTemplates.map((item) => (
          <button
            key={item.id}
            onClick={() => setTemplate(item.id)}
            className={clsx(
              "rounded-panel border p-4 text-left transition-all duration-200",
              item.id === template
                ? "border-brass/45 bg-brass-deep shadow-[0_0_32px_-20px_rgba(32,199,223,0.75)]"
                : "border-hairline bg-ink-900/90 hover:border-hairline-strong hover:bg-ink-850",
            )}
          >
            <div className="flex items-center justify-between">
              <p className={clsx("font-display text-lg", item.id === template ? "text-brass-bright" : "text-paper")}>{item.name}</p>
              <Pill tone={item.id === template ? "brass" : "neutral"}>{item.tagline}</Pill>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-paper-faint">{item.description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel label="How this filter works" title={active.name} className="lg:col-span-1" actions={<Pill tone="jade">Real price data</Pill>}>
          <div className="space-y-2.5">
            {active.filters.map((filter, index) => (
              <div key={filter} className="flex items-start gap-3 rounded-lg border border-hairline bg-ink-950/55 px-4 py-3">
                <span className="num mt-0.5 text-xs text-brass">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-sm leading-snug text-paper-dim">{filter}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-paper-faint">
            A symbol passes when <em className="not-italic text-brass-bright">every</em> filter holds on the latest completed session. Intraday
            candles repaint — the scan treats the last bar as provisional.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading}>
              <Play size={13} />
              {loading ? "Scanning" : "Run scan"}
            </Button>
            <Button variant="secondary" onClick={exportCsv} disabled={!result?.matches.length}>
              <Download size={13} />
              Export CSV
            </Button>
          </div>
        </Panel>

        <Panel
          label="Stocks checked"
          title={`${result?.matches.length ?? 0} match${result?.matches.length === 1 ? "" : "es"} of ${result?.universe ?? "…"}`}
          className="lg:col-span-2"
          actions={<Pill tone="brass">{result ? `Synced ${clockTime(result.fetchedAt)}` : loading ? "Running" : "Idle"}</Pill>}
        >
          {loading && !result ? (
            <SkeletonGrid count={4} className="grid-cols-1" />
          ) : !result || result.matches.length === 0 ? (
            <EmptyState>Zero matches on today’s data. The desk shows an honest empty table over a fictional one.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    {["Stock", "Price", "Today", "EMA 200", "Distance", "RSI", "Score", "Chart", ""].map((heading) => (
                      <th key={heading} className="label-mono pb-3 pr-4 font-medium">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.matches.map((match) => (
                    <tr key={match.symbol} className="group border-b border-hairline/60 transition-colors last:border-0 hover:bg-ink-850">
                      <td className="py-3 pr-4">
                        <button onClick={() => selectSymbol(match.symbol)} className="text-left">
                          <p className="font-mono text-xs uppercase text-paper group-hover:text-brass-bright">
                            {displaySymbol(match.symbol)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-paper-faint">{match.signal}</p>
                        </button>
                      </td>
                      <td className="num py-3 pr-4 text-paper">{price(match.price)}</td>
                      <td className="py-3 pr-4">
                        <Delta percent={match.changePercent} />
                      </td>
                      <td className="num py-3 pr-4 text-xs text-paper-dim">{match.ema200 ? price(match.ema200) : "—"}</td>
                      <td className={clsx("num py-3 pr-4 text-xs", (match.distanceFromEma200 ?? 0) >= 0 ? "text-jade" : "text-coral")}>
                        {match.distanceFromEma200 !== undefined ? `${match.distanceFromEma200.toFixed(1)}%` : "—"}
                      </td>
                      <td className="num py-3 pr-4 text-xs text-paper-dim">{match.rsi14?.toFixed(0) ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="h-1 w-14 overflow-hidden rounded-full bg-ink-800">
                            <span className="block h-full rounded-full bg-brass" style={{ width: `${match.score}%` }} />
                          </span>
                          <span className="num text-xs text-brass-bright">{match.score}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => selectSymbol(match.symbol)}
                          className="rounded-md border border-brass/35 bg-brass-deep px-3 py-1.5 font-mono text-[10px] uppercase text-brass-bright hover:bg-brass hover:text-ink-950"
                        >
                          View
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => armAlert(match.symbol, Number((match.ema200 ?? match.price).toFixed(2)))}
                          title="Arm alert at EMA 200"
                          className="rounded p-1.5 text-paper-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-brass-deep hover:text-brass-bright focus:opacity-100"
                        >
                          <Bell size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!!result?.errors.length && (
            <p className="mt-4 border-t border-hairline pt-3 text-xs text-paper-faint">
              {result.errors.length} symbols were skipped this run (rate limits or delistings) — never substituted.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
