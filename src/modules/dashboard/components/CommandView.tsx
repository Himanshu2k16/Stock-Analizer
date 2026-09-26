"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertList, triggeredAlerts } from "@/modules/alerts";
import { InstrumentPanel, NewsList, useMarket } from "@/modules/market";
import { Button, Delta, Panel, SkeletonGrid, Stat } from "@/components/ui";
import { displaySymbol, money, price, signedMoney, signedPercent } from "@/lib/format";
import { useScanner } from "@/modules/scanner";

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

  const stagger = (delay: number, extra = "") => ({
    className: `animate-fade-up${extra ? ` ${extra}` : ""}`,
    style: { animationDelay: `${delay}ms` },
  });

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-y-10 border-y border-hairline py-9 xl:grid-cols-4 xl:divide-x xl:divide-hairline">
        {firstSync ? (
          <SkeletonGrid count={4} className="col-span-2 xl:col-span-4" />
        ) : (
          <>
            <div {...stagger(0, "xl:pr-10")}>
              <Stat label="Portfolio value" value={money(portfolio.totalValue)} detail={`${portfolio.positions.length} tracked holdings`} />
            </div>
            <div {...stagger(70, "xl:px-10")}>
              <Stat
                label="Day P&L"
                value={signedMoney(portfolio.dayPnl)}
                tone={portfolio.dayPnl >= 0 ? "jade" : "coral"}
                detail={<Delta percent={portfolioValuePercent(portfolio.totalValue, portfolio.dayPnl)} />}
              />
            </div>
            <div {...stagger(140, "xl:px-10")}>
              <Stat
                label="Unrealized P&L"
                value={signedMoney(portfolio.unrealizedPnl)}
                tone={portfolio.unrealizedPnl >= 0 ? "jade" : "coral"}
                detail={<span className="num">{signedPercent(unrealizedPercent)} on cost</span>}
              />
            </div>
            <div {...stagger(210, "xl:px-10")}>
              <Stat
                label="Alert desk"
                value={`${fired.length} fired`}
                tone={fired.length ? "accent" : undefined}
                detail={`${armed} of ${alerts.length} rules armed`}
              />
            </div>
          </>
        )}
      </div>

      <div {...stagger(260, "grid gap-5 lg:grid-cols-3")}>
        <div className="lg:col-span-2">{firstSync ? <SkeletonGrid className="h-[540px]" /> : <InstrumentPanel quote={selectedQuote} />}</div>

        <div className="space-y-5">
          <Panel
            label="Alert operations"
            title="Price alerts"
            actions={
              <Link href="/alerts">
                <Button variant="secondary">Manage</Button>
              </Link>
            }
          >
            <AlertList limit={4} />
          </Panel>

          <Panel
            label="Stock ideas"
            title="Latest screener matches"
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
                    <span className="num w-9 text-right text-sm text-accent-bright">{match.score}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div {...stagger(330, "lg:col-span-1")}>
        <NewsList label="Google News · last 7 days" title="Latest market news" url={newsUrl} />
      </div>
    </div>
  );
}

function portfolioValuePercent(total: number, dayPnl: number) {
  const base = total - dayPnl;
  return base ? (dayPnl / base) * 100 : 0;
}
