"use client";

import { useMemo } from "react";
import { Brain } from "lucide-react";
import { NewsList } from "@/components/NewsList";
import { Panel, Pill } from "@/components/ui";
import { money, price, signedMoney } from "@/lib/logic/format";
import { useMarket } from "@/lib/market/MarketProvider";

export function ResearchView() {
  const { quotes, selectedQuote, portfolio } = useMarket();

  const newsUrl = useMemo(() => {
    const query = quotes.slice(0, 3).map((quote) => quote.name).join(" OR ") || "NSE stock market India";
    return `/api/market/news?query=${encodeURIComponent(`${query} stock`)}`;
  }, [quotes]);

  const top = portfolio.topPosition;
  const rsi = selectedQuote?.history.at(-1)?.rsi14;

  return (
    <div className="space-y-5">
      <Panel label="Evidence chain" title="Decision log" actions={<Brain size={16} className="text-brass" />}>
        <div className="grid gap-3 lg:grid-cols-3">
          <Entry tone="steel" label="Fact">
            {selectedQuote
              ? `${selectedQuote.name} last traded at ${price(selectedQuote.price, selectedQuote.currency)} on ${selectedQuote.exchange}, sourced from ${selectedQuote.source}.`
              : "Awaiting the first quote sync of the session."}
          </Entry>
          <Entry tone="jade" label="Calculation">
            Book value {money(portfolio.totalValue)} against a cost basis of {money(portfolio.totalCost)} — day movement{" "}
            {signedMoney(portfolio.dayPnl)}, unrealized {signedMoney(portfolio.unrealizedPnl)}.
            {rsi !== undefined && ` RSI(14) on the latest close is ${rsi.toFixed(0)}.`}
          </Entry>
          <Entry tone="brass" label="Interpretation">
            {top
              ? `${top.symbol.replace(".NS", "")} carries ${top.weight.toFixed(1)}% of the book${top.weight > 35 ? " — concentration above a balanced profile." : " — inside a balanced concentration band."}`
              : "Add holdings to unlock risk commentary."}
          </Entry>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <NewsList label="Watchlist coverage" title="Market headlines" url={newsUrl} />
        <NewsList label="Primary markets" title="IPO wire" url="/api/market/ipo" />
      </div>
    </div>
  );
}

function Entry({ tone, label, children }: { tone: "steel" | "jade" | "brass"; label: string; children: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-hairline bg-ink-850/70 p-4">
      <Pill tone={tone} className="mb-3">
        {label}
      </Pill>
      <p className="text-sm leading-relaxed text-paper-dim">{children}</p>
    </article>
  );
}
