"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertList } from "@/components/AlertList";
import { InstrumentPanel } from "@/components/InstrumentPanel";
import { NewsList } from "@/components/NewsList";
import { Button, Delta, Panel, SkeletonGrid, Stat } from "@/components/ui";
import { triggeredAlerts } from "@/lib/logic/alerts";
import { displaySymbol, money, price, signedMoney, signedPercent } from "@/lib/logic/format";
import { useScanner } from "@/lib/hooks/useScanner";
import { useMarket } from "@/lib/market/MarketProvider";

export function CommandView() {
  const { quotes, loading, portfolio, alerts, selectedQuote } = useMarket();
  const { result, loading: scanning } = useScanner("ema200-touch", true);

  const fired = triggeredAlerts(alerts, quotes);
  const armed = alerts.filter((alert) => alert.active).length;
  const unrealizedPercent = portfolio.totalCost ? (portfolio.unrealizedPnl / portfolio.totalCost) * 100 : 0;

  const newsUrl = useMemo(() => {
    const query = quotes.slice(0, 3).map((quote) => quote.name).join(" OR ") || "NSE stock market India";
    return `/api/market/news?query=${encodeURIComponent(`${query} stock`)}`;
  }, [quotes]);

  const firstSync = loading && quotes.length === 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {firstSync ? (
          <SkeletonGrid count={4} className="col-span-2 xl:col-span-4" />
        ) : (
          <>
            <Stat label="Portfolio value" value={money(portfolio.totalValue)} detail={`${portfolio.positions.length} tracked holdings`} />
            <Stat
              label="Day P&L"
              value={signedMoney(portfolio.dayPnl)}
              tone={portfolio.dayPnl >= 0 ? "jade" : "coral"}
              detail={<Delta percent={portfolioValuePercent(portfolio.totalValue, portfolio.dayPnl)} />}
            />
            <Stat
              label="Unrealized P&L"
              value={signedMoney(portfolio.unrealizedPnl)}
              tone={portfolio.unrealizedPnl >= 0 ? "jade" : "coral"}
              detail={<span className="num">{signedPercent(unrealizedPercent)} on cost</span>}
            />
            <Stat
              label="Alert desk"
              value={`${fired.length} fired`}
              tone={fired.length ? "brass" : undefined}
              detail={`${armed} of ${alerts.length} rules armed`}
            />
          </>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">{firstSync ? <SkeletonGrid className="h-[540px]" /> : <InstrumentPanel quote={selectedQuote} />}</div>

        <div className="space-y-5">
          <Panel
            label="Alert operations"
            title="Desk signals"
            actions={
              <Link href="/alerts">
                <Button variant="secondary">Manage</Button>
              </Link>
            }
          >
            <AlertList limit={4} />
          </Panel>

          <Panel
            label="EMA 200 retest"
            title="Scanner snapshot"
            actions={
              <Link href="/scanner">
                <Button variant="secondary">Studio</Button>
              </Link>
            }
          >
            {scanning && !result ? (
              <SkeletonGrid count={4} />
            ) : !result || result.matches.length === 0 ? (
              <p className="py-6 text-center text-sm text-paper-faint">
                No live matches across {result?.universe ?? "the"} screened names. Real results, never placeholders.
              </p>
            ) : (
              <ul className="divide-y divide-hairline">
                {result.matches.slice(0, 4).map((match) => (
                  <li key={match.symbol} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-mono text-xs uppercase text-paper">{displaySymbol(match.symbol)}</p>
                      <p className="mt-0.5 truncate text-[11px] text-paper-faint">{match.signal}</p>
                    </div>
                    <div className="text-right">
                      <p className="num text-xs text-paper">{price(match.price)}</p>
                      <Delta percent={match.changePercent} />
                    </div>
                    <span className="num w-9 text-right text-sm text-brass-bright">{match.score}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="lg:col-span-1">
        <NewsList label="Google News · last 7 days" title="Market headlines" url={newsUrl} />
      </div>
    </div>
  );
}

function portfolioValuePercent(total: number, dayPnl: number) {
  const base = total - dayPnl;
  return base ? (dayPnl / base) * 100 : 0;
}
