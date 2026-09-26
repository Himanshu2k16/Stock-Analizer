"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Bell, CandlestickChart, Radar, ShieldCheck, TrendingUp, Wallet, LineChart } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeroBackdrop } from "./HeroBackdrop";
import { useMarket } from "@/modules/market";
import { displaySymbol, price } from "@/lib/format";

type HistoryPoint = { close: number; date: string };
type QuoteWithHistory = { history?: HistoryPoint[] };

/* ── helpers ──────────────────────────────────────────────────────────── */

function sparkPath(values: number[], w: number, h: number, pad = 6): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(pad + i * step).toFixed(1)},${(h - pad - ((v - min) / span) * (h - pad * 2)).toFixed(1)}`)
    .join(" ");
}

/** Scroll reveal: observes every `.reveal` node once and stamps `is-visible`. */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
}

/** Odometer number that counts up the first time it scrolls into view. */
function CountUp({ to, suffix = "", duration = 1500 }: { to: number; suffix?: string; duration?: number }) {
  const setRef = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            node.textContent = `${Math.round(to * eased).toLocaleString("en-IN")}${suffix}`;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        },
        { threshold: 0.5 },
      );
      io.observe(node);
    },
    [to, suffix, duration],
  );
  return <span ref={setRef}>{`0${suffix}`}</span>;
}

/* ── hero terminal card ───────────────────────────────────────────────── */

function TerminalCard() {
  const { quotes } = useMarket();
  const quote = quotes[0];
  const closes = useMemo(() => {
    const history = (quote as unknown as QuoteWithHistory | undefined)?.history ?? [];
    return history.slice(-64).map((point) => point.close);
  }, [quote]);

  const path = useMemo(() => sparkPath(closes, 320, 104), [closes]);
  const areaPath = path ? `${path} L314,104 L6,104 Z` : "";
  const up = (quote?.changePercent ?? 0) >= 0;

  return (
    <div className="relative w-full max-w-[400px]">
      {/* floating chip — alert fired */}
      <div className="animate-bob absolute -top-9 right-2 z-10 hidden items-center gap-2.5 rounded-lg border border-hairline-strong bg-ink-900/95 px-3.5 py-2.5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur sm:flex">
        <span className="relative flex size-7 items-center justify-center rounded-md bg-jade-deep text-jade">
          <Bell size={13} strokeWidth={2} />
          <span className="animate-ring-pulse absolute inset-0 rounded-md border border-jade/60" />
        </span>
        <span>
          <span className="block text-[11px] font-semibold text-paper">Alert fired</span>
          <span className="block text-[10px] text-paper-faint">{quote ? displaySymbol(quote.symbol) : "TATASTEEL"} crossed your line</span>
        </span>
      </div>

      {/* the terminal */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-900/85 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-semibold text-paper">{quote ? displaySymbol(quote.symbol) : "NSE"}</span>
            <span className="text-[10px] text-paper-faint">{quote?.exchange ?? "National Stock Exchange"}</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-jade/25 bg-jade-deep px-2 py-0.5 text-[10px] font-medium text-jade">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-jade opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-jade" />
            </span>
            Live
          </span>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="num text-[30px] font-semibold leading-none text-paper">
                {quote ? price(quote.price, quote.currency) : "—"}
              </p>
              <p className="mt-2 text-[11px] text-paper-faint">{quote?.name ?? "Syncing your watchlist…"}</p>
            </div>
            {quote && (
              <span
                className={clsx(
                  "num rounded-md px-2 py-1 text-[12px] font-semibold",
                  up ? "bg-jade-deep text-jade" : "bg-coral-deep text-coral",
                )}
              >
                {up ? "▲" : "▼"} {Math.abs(quote.changePercent).toFixed(2)}%
              </span>
            )}
          </div>

          <svg viewBox="0 0 320 104" className="mt-4 h-24 w-full" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#2962ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaPath && <path d={areaPath} fill="url(#hero-spark)" />}
            {path && (
              <path
                d={path}
                fill="none"
                stroke="#7aa5ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                style={{ animation: "draw-line 2.2s cubic-bezier(0.65, 0, 0.35, 1) 0.4s forwards" }}
              />
            )}
            {path && (
              <circle cx="314" cy="52" r="3.5" fill="#7aa5ff">
                <animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>

          <div className="mt-4 space-y-2.5">
            {[
              ["Day range", quote ? `${price(quote.dayLow ?? quote.price, quote.currency)} — ${price(quote.dayHigh ?? quote.price, quote.currency)}` : "—"],
              ["Volume", quote ? new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 2 }).format(quote.volume ?? 0) : "—"],
            ].map(([term, val]) => (
              <div key={term} className="flex items-center justify-between text-[11px]">
                <span className="text-paper-faint">{term}</span>
                <span className="num font-medium text-paper-dim">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* floating chip — screener */}
      <div className="animate-float-y absolute -bottom-8 left-0 z-10 hidden items-center gap-2.5 rounded-lg border border-hairline-strong bg-ink-900/95 px-3.5 py-2.5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur sm:flex" style={{ animationDelay: "1.2s" }}>
        <span className="flex size-7 items-center justify-center rounded-md bg-accent-deep text-accent-bright">
          <Radar size={13} strokeWidth={2} />
        </span>
        <span>
          <span className="block text-[11px] font-semibold text-paper">Screener ran 2 min ago</span>
          <span className="block text-[10px] text-paper-faint">6 fresh matches on your universe</span>
        </span>
      </div>
    </div>
  );
}

/* ── bento demo widgets ───────────────────────────────────────────────── */

const SCREENER_ROWS = [
  { symbol: "TATASTEEL", signal: "EMA-200 touch + volume", score: 92 },
  { symbol: "INFY", signal: "RSI recovering from 40", score: 87 },
  { symbol: "SBIN", signal: "20-day breakout", score: 84 },
  { symbol: "LT", signal: "Above 200 EMA", score: 81 },
];

function ScreenerDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % SCREENER_ROWS.length), 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-1.5">
      {SCREENER_ROWS.map((row, i) => (
        <div
          key={row.symbol}
          className={clsx(
            "flex items-center justify-between rounded-md border px-3 py-2 transition-all duration-500",
            i === active ? "border-accent/40 bg-accent-deep" : "border-transparent bg-white/[0.02]",
          )}
        >
          <span className={clsx("font-mono text-[11px] font-medium", i === active ? "text-accent-bright" : "text-paper-dim")}>{row.symbol}</span>
          <span className="num text-[10px] text-paper-faint">{row.score}</span>
        </div>
      ))}
    </div>
  );
}

function ChartBarsDemo() {
  const bars = [34, 52, 40, 66, 48, 78, 58, 88, 62, 74, 55, 92, 70, 84];
  return (
    <div className="flex h-20 items-end gap-1.5">
      {bars.map((h, i) => (
        <span
          key={i}
          className={clsx("animate-bar-dance w-full origin-bottom rounded-sm", i % 3 === 0 ? "bg-coral/70" : "bg-jade/70")}
          style={{ height: `${h}%`, animationDelay: `${i * 0.14}s` }}
        />
      ))}
    </div>
  );
}

function AllocationDemo() {
  const rows = [
    { symbol: "TATASTEEL", pct: 46 },
    { symbol: "INFY", pct: 32 },
    { symbol: "RELIANCE", pct: 22 },
  ];
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.symbol}>
          <div className="mb-1 flex justify-between text-[10px]">
            <span className="font-mono text-paper-dim">{row.symbol}</span>
            <span className="num text-paper-faint">{row.pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="animate-grow-x h-full origin-left rounded-full bg-accent"
              style={{ width: `${row.pct}%`, animationDelay: `${i * 0.18}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertDemo() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-2">
      <span className="relative flex size-12 items-center justify-center rounded-xl bg-jade-deep text-jade">
        <span className="animate-ring-pulse absolute inset-0 rounded-xl border border-jade/50" />
        <span className="animate-ring-pulse absolute inset-0 rounded-xl border border-jade/40" style={{ animationDelay: "0.9s" }} />
        <Bell size={20} strokeWidth={1.8} />
      </span>
      <p className="text-center text-[11px] leading-relaxed text-paper-faint">
        Above · below · percent-move —
        <br />
        the desk watches while you don&apos;t.
      </p>
    </div>
  );
}

/* ── landing page ─────────────────────────────────────────────────────── */

const stats = [
  { value: 110, suffix: "+", label: "Drawing tools in the built-in TradingView chart" },
  { value: 100, suffix: "+", label: "Technical indicators, one click away" },
  { value: 13, suffix: "", label: "Chart types — candles, heikin-ashi, renko and more" },
  { value: 0, suffix: "", label: "Orders placed. Meridian never touches your money" },
];

const principles = [
  {
    title: "Decision support, not execution",
    body: "Meridian reads the market with you and never places an order. Your capital stays at your broker, under your hand.",
  },
  {
    title: "Real data or nothing",
    body: "Live NSE feeds with a 0–60 second delay, real screener matches, real news. If there is nothing to show, the desk says so.",
  },
  {
    title: "Calm is a feature",
    body: "One dark, quiet interface instead of five shouting tabs. Signal first, chrome last — the desk should disappear.",
  },
];

export function LandingView() {
  const { quotes } = useMarket();
  useReveal();

  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onHeroMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(1100px) rotateY(${dx * 7}deg) rotateX(${dy * -6}deg) translate3d(${dx * 14}px, ${dy * 10}px, 0)`;
    });
  }, []);

  const onHeroLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1100px) rotateY(0deg) rotateX(0deg) translate3d(0,0,0)";
  }, []);

  const tickerQuotes = quotes.slice(0, 12);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink-950 text-paper">
      {/* ── nav ── */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="block">
            <Image src="/meridian-logo-v3.png" alt="Meridian" width={1489} height={362} priority unoptimized className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            <a href="#inside" className="hidden text-[13px] font-medium text-paper-dim transition-colors hover:text-paper sm:block">
              What&apos;s inside
            </a>
            <a href="#principles" className="hidden text-[13px] font-medium text-paper-dim transition-colors hover:text-paper sm:block">
              Principles
            </a>
            <Link
              href="/dashboard"
              className="flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-semibold text-white transition-colors hover:bg-accent-bright"
            >
              Open the desk
            </Link>
          </nav>
        </div>
      </header>

      {/* ── hero ── */}
      <section
        className="relative flex min-h-[100vh] items-center overflow-hidden"
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
      >
        <HeroBackdrop />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-16 px-6 pb-28 pt-36 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="reveal flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] text-paper-dim">
              <span className="size-1.5 animate-pulse rounded-full bg-accent-bright" />
              PERSONAL MARKET DESK · NSE INDIA
            </p>

            <h1 className="reveal mt-6 font-display text-[52px] font-semibold leading-[0.98] tracking-tight text-paper sm:text-[76px] lg:text-[88px]" style={{ transitionDelay: "80ms" }}>
              The whole market.
              <br />
              <span className="font-serif italic text-accent-bright">One quiet desk.</span>
            </h1>

            <p className="reveal mt-7 max-w-xl text-[15px] leading-relaxed text-paper-dim sm:text-[17px]" style={{ transitionDelay: "160ms" }}>
              Live NSE quotes, a full TradingView charting engine, a technical screener and price
              alerts — composed into one calm, dark interface. Built like a terminal, priced like nothing.
            </p>

            <div className="reveal mt-10 flex flex-wrap items-center gap-3.5" style={{ transitionDelay: "240ms" }}>
              <Link
                href="/dashboard"
                className="animate-glow-pulse group flex h-12 items-center gap-2.5 rounded-md bg-accent px-7 text-[15px] font-semibold text-white transition-colors hover:bg-accent-bright"
              >
                Launch your desk
                <TrendingUp size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="#inside"
                className="flex h-12 items-center rounded-md border border-hairline-strong px-7 text-[15px] font-medium text-paper-dim transition-colors hover:border-white/25 hover:text-paper"
              >
                See what&apos;s inside
              </a>
            </div>

            <p className="reveal mt-9 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-paper-faint" style={{ transitionDelay: "320ms" }}>
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> No broker execution</span>
              <span className="flex items-center gap-1.5"><LineChart size={12} /> Quotes delayed 0–60 s</span>
              <span className="flex items-center gap-1.5"><Wallet size={12} /> Portfolio stays on your device</span>
            </p>
          </div>

          <div className="reveal lg:col-span-5" style={{ transitionDelay: "200ms" }}>
            <div ref={cardRef} className="mx-auto flex justify-center transition-transform duration-300 ease-out will-change-transform lg:justify-end">
              <TerminalCard />
            </div>
          </div>
        </div>

        {/* live marquee */}
        {tickerQuotes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-hairline bg-ink-950/75 backdrop-blur">
            <div className="scrollbar-none relative flex overflow-hidden py-3">
              <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
                {[...tickerQuotes, ...tickerQuotes].map((q, i) => {
                  const isUp = q.changePercent >= 0;
                  return (
                    <span key={`${q.symbol}-${i}`} className="flex shrink-0 items-baseline gap-2.5">
                      <span className="font-mono text-[12px] font-medium text-paper-dim">{displaySymbol(q.symbol)}</span>
                      <span className="num text-[13px] text-paper">{price(q.price, q.currency)}</span>
                      <span className={clsx("num text-[11px] font-medium", isUp ? "text-jade" : "text-coral")}>
                        {isUp ? "▲" : "▼"} {Math.abs(q.changePercent).toFixed(2)}%
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-ink-950 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-ink-950 to-transparent" />
            </div>
          </div>
        )}
      </section>

      {/* ── bento: what's inside ── */}
      <section id="inside" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <div className="reveal max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.18em] text-paper-faint">WHAT&apos;S INSIDE</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
            Not cards in a grid.
            <span className="font-serif italic text-paper-dim"> Instruments on a desk.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          {/* live quotes — big cell */}
          <article className="reveal group relative overflow-hidden rounded-panel border border-hairline bg-ink-900/70 p-6 transition-colors duration-300 hover:border-accent/35 lg:col-span-4 lg:row-span-2">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgba(41,98,255,0.12),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-paper">Live quotes, always fresh</h3>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-paper-dim">
                  Your watchlist refreshes itself every minute while the market runs. Prices, ranges and volume — no refresh-button mashing.
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-ink-850 text-accent-bright">
                <TrendingUp size={18} strokeWidth={1.7} />
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {quotes.slice(0, 3).map((q) => {
                const isUp = q.changePercent >= 0;
                return (
                  <div key={q.symbol} className="rounded-lg border border-hairline bg-ink-950/60 px-3.5 py-3">
                    <p className="font-mono text-[10px] text-paper-faint">{displaySymbol(q.symbol)}</p>
                    <p className="num mt-1 text-[15px] font-semibold text-paper">{price(q.price, q.currency)}</p>
                    <p className={clsx("num mt-0.5 text-[11px] font-medium", isUp ? "text-jade" : "text-coral")}>
                      {isUp ? "▲" : "▼"} {Math.abs(q.changePercent).toFixed(2)}%
                    </p>
                  </div>
                );
              })}
            </div>
            <BigSpark />
          </article>

          {/* tradingview charting */}
          <article className="reveal group rounded-panel border border-hairline bg-ink-900/70 p-6 transition-colors duration-300 hover:border-accent/35 lg:col-span-2" style={{ transitionDelay: "90ms" }}>
            <div className="flex items-start justify-between">
              <h3 className="font-display text-[17px] font-semibold text-paper">Full TradingView engine</h3>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-ink-850 text-accent-bright">
                <CandlestickChart size={16} strokeWidth={1.7} />
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-paper-dim">Candles, drawing tools, indicators — full page, inside Meridian.</p>
            <div className="mt-5">
              <ChartBarsDemo />
            </div>
          </article>

          {/* alerts */}
          <article className="reveal rounded-panel border border-hairline bg-ink-900/70 p-6 transition-colors duration-300 hover:border-jade/35 lg:col-span-2" style={{ transitionDelay: "160ms" }}>
            <h3 className="font-display text-[17px] font-semibold text-paper">Alerts that watch for you</h3>
            <AlertDemo />
          </article>

          {/* screener */}
          <article className="reveal rounded-panel border border-hairline bg-ink-900/70 p-6 transition-colors duration-300 hover:border-accent/35 lg:col-span-2" style={{ transitionDelay: "100ms" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[17px] font-semibold text-paper">Screener, real matches</h3>
              <Radar size={16} className="text-accent-bright" />
            </div>
            <p className="mb-4 mt-2 text-[13px] text-paper-dim">Scanned live across your universe.</p>
            <ScreenerDemo />
          </article>

          {/* portfolio */}
          <article className="reveal rounded-panel border border-hairline bg-ink-900/70 p-6 transition-colors duration-300 hover:border-accent/35 lg:col-span-2" style={{ transitionDelay: "180ms" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[17px] font-semibold text-paper">Portfolio, weighed live</h3>
              <Wallet size={16} className="text-accent-bright" />
            </div>
            <p className="mb-5 mt-2 text-[13px] text-paper-dim">Allocation against today&apos;s prices.</p>
            <AllocationDemo />
          </article>
        </div>
      </section>

      {/* ── stats band ── */}
      <section className="border-y border-hairline bg-ink-900/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="reveal text-center sm:text-left">
              <p className="num font-display text-[44px] font-semibold leading-none text-accent-bright">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-paper-dim">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── principles ── */}
      <section id="principles" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <p className="reveal font-mono text-[11px] tracking-[0.18em] text-paper-faint">PRINCIPLES</p>
        <h2 className="reveal mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl" style={{ transitionDelay: "70ms" }}>
          Three rules the desk <span className="font-serif italic text-accent-bright">never breaks.</span>
        </h2>

        <div className="mt-14">
          {principles.map((p, i) => (
            <div
              key={p.title}
              className="reveal group flex flex-col gap-3 border-t border-hairline py-8 transition-colors last:border-b hover:border-hairline-strong sm:flex-row sm:items-baseline sm:gap-10"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="num font-display text-[40px] font-semibold leading-none text-white/10 transition-colors duration-300 group-hover:text-accent/70 sm:w-24">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-10">
                <h3 className="font-display text-2xl font-semibold text-paper transition-transform duration-300 sm:shrink-0 sm:group-hover:-translate-x-1">
                  {p.title}
                </h3>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-paper-dim sm:mt-0">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── final CTA ── */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(41,98,255,0.14),transparent_65%)] blur-3xl" />
        <h2 className="reveal relative font-display text-4xl font-semibold tracking-tight text-paper sm:text-6xl">
          The market opens at nine.
          <br />
          <span className="font-serif italic text-accent-bright">Your desk is ready now.</span>
        </h2>
        <Link
          href="/dashboard"
          className="reveal relative mt-10 inline-flex h-12 items-center gap-2.5 rounded-md bg-accent px-8 text-[15px] font-semibold text-white transition-colors hover:bg-accent-bright"
          style={{ transitionDelay: "120ms" }}
        >
          Start with Meridian
        </Link>
      </section>

      {/* ── footer ── */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Image src="/meridian-logo-v3.png" alt="Meridian" width={1489} height={362} unoptimized className="h-6 w-auto opacity-80" />
          <p className="text-center text-[11px] leading-relaxed text-paper-faint sm:text-right">
            Quotes delayed 0–60 s via Yahoo Finance. Decision support only — no broker execution.
            <br />
            © 2026 Meridian. Built for personal research.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Big sparkline for the quotes bento cell — real history when available. */
function BigSpark() {
  const { quotes } = useMarket();
  const quote = quotes[0];
  const closes = useMemo(() => {
    const history = (quote as unknown as QuoteWithHistory | undefined)?.history ?? [];
    return history.slice(-90).map((point) => point.close);
  }, [quote]);
  const path = useMemo(() => sparkPath(closes, 640, 140, 8), [closes]);

  return (
    <div className="mt-6">
      <svg viewBox="0 0 640 140" className="h-32 w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="bento-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2962ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2962ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {path && (
          <>
            <path d={`${path} L632,140 L8,140 Z`} fill="url(#bento-spark)" />
            <path d={path} fill="none" stroke="#7aa5ff" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
      <p className="mt-2 text-right text-[10px] text-paper-faint">
        {quote ? `${displaySymbol(quote.symbol)} · recent closes` : "waiting for first sync"}
      </p>
    </div>
  );
}
