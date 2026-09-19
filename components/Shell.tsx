"use client";

import clsx from "clsx";
import { Bell, Briefcase, LayoutDashboard, Newspaper, Plus, Radar, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Dot } from "@/components/ui";
import { useMarketClock } from "@/lib/hooks/useMarketClock";
import { useMarket } from "@/lib/market/MarketProvider";
import { displaySymbol, price } from "@/lib/logic/format";

const nav = [
  { href: "/", label: "Command", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/scanner", label: "Scanner", icon: Radar },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/research", label: "Research", icon: Newspaper },
];

const pageMeta: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "Session overview", title: "Command Deck" },
  "/markets": { eyebrow: "Live instruments", title: "Market Board" },
  "/scanner": { eyebrow: "Technical screens", title: "Scanner Studio" },
  "/portfolio": { eyebrow: "Book of holdings", title: "Portfolio Desk" },
  "/alerts": { eyebrow: "Price automation", title: "Alert Operations" },
  "/research": { eyebrow: "Signals & headlines", title: "Research Room" },
};

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { clock, open } = useMarketClock();
  const { quotes, refreshing, refresh, selectedSymbol, selectSymbol } = useMarket();
  const meta = pageMeta[pathname] ?? pageMeta["/"];

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline bg-ink-900/88 px-4 py-6 backdrop-blur lg:flex">
        <Link href="/" className="group flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-md border border-brass/55 bg-brass-deep font-display text-lg font-semibold text-brass-bright transition-colors group-hover:bg-brass group-hover:text-ink-950">
            M
          </span>
          <span>
            <strong className="block font-display text-base font-semibold leading-none">Meridian</strong>
            <span className="label-mono mt-1 block">Personal market desk</span>
          </span>
        </Link>

        <nav className="mt-10 flex flex-col gap-1.5" aria-label="Main">
          {nav.map((item, index) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[11px] uppercase transition-colors",
                  active ? "border border-brass/30 bg-brass-deep text-brass-bright" : "text-paper-faint hover:bg-ink-850 hover:text-paper",
                )}
              >
                <span className={clsx("w-4", active ? "text-brass-bright" : "text-paper-faint")}>{String(index + 1).padStart(2, "0")}</span>
                <item.icon size={15} strokeWidth={1.6} />
                {item.label}
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brass" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 px-2">
          <div className="flex items-center gap-2 border-t border-hairline pt-4 text-[11px] text-paper-dim">
            <ShieldCheck size={14} strokeWidth={1.6} />
            <span>No broker execution</span>
          </div>
          <p className="text-[10px] leading-relaxed text-paper-faint">
            Decision support only. Quotes delayed 0–60&nbsp;s via Yahoo Finance.
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-hairline bg-ink-950/88 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 lg:px-8">
            <div className="min-w-0">
              <p className="label-mono">{meta.eyebrow}</p>
              <h1 className="font-display text-2xl font-semibold leading-tight text-paper">{meta.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-hairline bg-ink-900 px-3 py-1.5 shadow-[0_8px_22px_-20px_rgba(0,0,0,0.9)]">
                <Dot on={open} className={clsx(open && "animate-pulse")} />
                <span className="font-mono text-[10px] uppercase text-paper-dim">{open ? "NSE open" : "NSE closed"}</span>
                <span className="num text-[11px] text-paper-dim">{clock}</span>
              </span>
              <AddSymbol />
              <button
                onClick={refresh}
                disabled={refreshing}
                className="flex h-9 items-center gap-2 rounded-md border border-hairline-strong bg-ink-850/75 px-3 font-mono text-[11px] uppercase text-paper-dim transition-colors hover:border-brass/50 hover:text-brass-bright disabled:opacity-40"
              >
                <RefreshCw size={14} className={clsx(refreshing && "animate-spin")} />
                {refreshing ? "Syncing" : "Refresh"}
              </button>
            </div>
          </div>

          <nav className="scrollbar-none flex gap-1 overflow-x-auto border-t border-hairline/60 px-3 py-1.5 lg:hidden" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 font-mono text-[10px] uppercase",
                  item.href === pathname ? "bg-brass-deep text-brass-bright" : "text-paper-faint",
                )}
              >
                <item.icon size={13} strokeWidth={1.6} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="scrollbar-none hidden gap-1 overflow-x-auto border-t border-hairline/60 bg-ink-900/45 px-3 py-1.5 lg:flex">
            {quotes.map((quote) => {
              const active = quote.symbol === selectedSymbol;
              const up = quote.changePercent >= 0;
              return (
                <button
                  key={quote.symbol}
                  onClick={() => selectSymbol(quote.symbol)}
                  className={clsx(
                    "flex shrink-0 items-baseline gap-2 rounded-md px-3 py-1.5 transition-colors",
                    active ? "bg-brass-deep text-brass-bright" : "hover:bg-ink-850",
                  )}
                >
                  <span className={clsx("font-mono text-[10px] uppercase", active ? "text-brass-bright" : "text-paper-dim")}>
                    {displaySymbol(quote.symbol)}
                  </span>
                  <span className="num text-[11px] text-paper">{price(quote.price, quote.currency)}</span>
                  <span className={clsx("num text-[10px]", up ? "text-jade" : "text-coral")}>
                    {up ? "+" : "−"}
                    {Math.abs(quote.changePercent).toFixed(2)}%
                  </span>
                </button>
              );
            })}
            {quotes.length === 0 && <span className="label-mono px-3 py-1.5">Awaiting first sync…</span>}
          </div>
        </header>

        <main className="lg:px-8">
          <div key={pathname} className="animate-fade-up mx-auto max-w-[1500px] px-4 py-6 pb-16 lg:px-0">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AddSymbol() {
  const { addSymbol } = useMarket();
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (addSymbol(value)) setValue("");
  }

  return (
    <form onSubmit={submit} className="relative">
      <Plus size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-faint" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Add symbol"
        aria-label="Add symbol to watchlist"
        className="h-9 w-40 rounded-md border border-hairline bg-ink-950/70 pl-8 pr-3 font-mono text-[11px] uppercase text-paper outline-none transition-colors placeholder:normal-case placeholder:text-paper-faint focus:w-52 focus:border-brass/70 focus:bg-ink-850"
      />
    </form>
  );
}
