"use client";

import clsx from "clsx";
import { LogOut, Menu, Plus, RefreshCw, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { stockSuggestions, useMarket } from "@/modules/market";
import { useAuth } from "@/modules/auth";
import { displaySymbol, price } from "@/lib/format";

const nav = [
  { href: "/dashboard", label: "Home" },
  { href: "/markets", label: "Stocks" },
  { href: "/scanner", label: "Screener" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/alerts", label: "Alerts" },
  { href: "/research", label: "News" },
  { href: "/settings", label: "Settings" },
];

const pageMeta: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Overview", title: "Home" },
  "/markets": { eyebrow: "Live prices and charts", title: "Stocks" },
  "/scanner": { eyebrow: "Find opportunities", title: "Stock Screener" },
  "/portfolio": { eyebrow: "Your holdings", title: "My Portfolio" },
  "/alerts": { eyebrow: "Price reminders", title: "Price Alerts" },
  "/research": { eyebrow: "Market updates", title: "News" },
  "/settings": { eyebrow: "Profile and preferences", title: "Settings" },
};

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { quotes, refreshing, refresh, selectedSymbol, selectSymbol } = useMarket();
  const meta = pageMeta[pathname] ?? pageMeta["/dashboard"];
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function logoutAndGo() {
    setProfileOpen(false);
    setMenuOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-hairline bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="shrink-0" aria-label="Meridian home">
            <Image src="/meridian-logo-v3.png" alt="Meridian" width={1376} height={315} priority unoptimized className="h-8 w-auto" />
          </Link>

          <AddSymbol />

          <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Main">
            {nav.map((item) => {
              const active = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "text-[14px] transition-colors",
                    active ? "font-semibold text-paper" : "font-medium text-paper-dim hover:text-paper",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Open profile menu"
                className="flex size-9 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white transition-transform hover:scale-105"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </button>
              {profileOpen && (
                <>
                  <button aria-hidden className="fixed inset-0 z-40 cursor-default" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-hairline-strong bg-ink-900 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)]">
                    <div className="border-b border-hairline px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-paper">{user.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-paper-faint">{user.email}</p>
                    </div>
                    <button
                      onClick={refresh}
                      disabled={refreshing}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-medium text-paper-dim transition-colors hover:bg-white/[0.04] hover:text-paper disabled:opacity-40"
                    >
                      <RefreshCw size={14} className={clsx(refreshing && "animate-spin")} />
                      {refreshing ? "Updating…" : "Refresh prices"}
                    </button>
                    <button
                      onClick={logoutAndGo}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-medium text-coral transition-colors hover:bg-coral-deep"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-md text-paper-dim transition-colors hover:text-paper lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-hairline bg-ink-950/95 px-4 pb-5 pt-2 backdrop-blur-xl lg:hidden">
            <nav className="grid gap-0.5" aria-label="Mobile">
              {nav.map((item) => {
                const active = item.href === pathname;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={clsx(
                      "rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                      active ? "bg-white/[0.06] text-paper" : "text-paper-dim hover:bg-white/[0.03] hover:text-paper",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <button
                onClick={logoutAndGo}
                className="mt-3 flex w-full items-center gap-2.5 border-t border-hairline px-3 pt-3.5 text-[13px] font-medium text-coral"
              >
                <LogOut size={14} /> Log out ({user.name})
              </button>
            )}
          </div>
        )}

        <div className="scrollbar-none hidden gap-1 overflow-x-auto border-t border-hairline/60 px-4 py-1.5 sm:flex lg:px-8">
          {quotes.map((quote) => {
            const active = quote.symbol === selectedSymbol;
            const up = quote.changePercent >= 0;
            return (
              <button
                key={quote.symbol}
                onClick={() => selectSymbol(quote.symbol)}
                className={clsx(
                  "flex shrink-0 items-baseline gap-2 rounded-md px-3 py-1.5 transition-colors",
                  active ? "bg-white/[0.05]" : "hover:bg-white/[0.03]",
                )}
              >
                <span className={clsx("font-mono text-[11px]", active ? "text-accent-bright" : "text-paper-dim")}>
                  {displaySymbol(quote.symbol)}
                </span>
                <span className="num text-[12px] text-paper">{price(quote.price, quote.currency)}</span>
                <span className={clsx("num text-[11px] font-medium", up ? "text-jade" : "text-coral")}>
                  {up ? "+" : "−"}
                  {Math.abs(quote.changePercent).toFixed(2)}%
                </span>
              </button>
            );
          })}
          {quotes.length === 0 && <span className="px-3 py-1.5 text-[12px] text-paper-faint">Awaiting first sync…</span>}
        </div>
      </header>

      <main className="flex-1">
        <div key={pathname} className="animate-fade-up mx-auto max-w-[1500px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-[12px] font-medium text-paper-faint">{meta.eyebrow}</p>
            <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight text-paper">{meta.title}</h1>
          </div>
          {children}
        </div>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[11px] text-paper-faint">Decision support only. Quotes delayed 0–60 s via Yahoo Finance.</p>
          <p className="text-[11px] text-paper-faint">© 2026 Meridian</p>
        </div>
      </footer>
    </div>
  );
}

function AddSymbol() {
  const { addSymbol } = useMarket();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => {
    const query = value.trim().toUpperCase();
    if (query.length < 1) return [];
    return stockSuggestions
      .filter((item) => item.symbol.includes(query) || item.name.toUpperCase().includes(query))
      .slice(0, 6);
  }, [value]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (matches[0]) {
      choose(matches[0].symbol);
      return;
    }
    if (addSymbol(value)) setValue("");
  }

  function choose(symbol: string) {
    if (addSymbol(symbol)) setValue("");
    setFocused(false);
  }

  return (
    <form onSubmit={submit} className="relative hidden sm:block">
      <Plus size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-faint" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="Search stock"
        aria-label="Search and add stock"
        className="h-10 w-44 rounded-md border border-hairline bg-ink-950/70 pl-8 pr-3 text-sm text-paper outline-none transition-colors placeholder:text-paper-faint focus:w-56 focus:border-accent/70 focus:bg-ink-850 lg:w-52"
      />
      {focused && value.trim() && (
        <div className="absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-lg border border-hairline-strong bg-ink-900 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]">
          {matches.map((item) => (
            <button
              type="button"
              key={item.symbol}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(item.symbol);
              }}
              className="flex w-full items-center justify-between gap-4 border-b border-hairline px-4 py-3 text-left last:border-0 hover:bg-ink-850"
            >
              <span>
                <span className="block text-sm font-medium text-paper">{item.name}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-paper-faint">{item.exchange}</span>
              </span>
              <span className="font-mono text-xs text-accent-bright">{displaySymbol(item.symbol)}</span>
            </button>
          ))}
          {matches.length === 0 && (
            <button type="submit" className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-ink-850">
              <span>
                <span className="block text-sm font-medium text-paper">Add typed symbol</span>
                <span className="mt-0.5 block text-xs text-paper-faint">Press Enter for the exact NSE symbol.</span>
              </span>
              <span className="font-mono text-xs text-accent-bright">{value.trim().toUpperCase()}</span>
            </button>
          )}
        </div>
      )}
    </form>
  );
}
