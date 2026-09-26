# Meridian — Personal Market Desk

Live NSE watchlists, technical scanners, portfolio analytics and price alerts.
Decision support only — no broker execution.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Recharts

## Project structure

```
src/
├── app/                    # Routing layer only (thin pages + API route handlers)
│   ├── layout.tsx          # Root layout: fonts, MarketProvider, Shell
│   ├── page.tsx            # Dashboard
│   ├── alerts/ markets/ portfolio/ research/ scanner/
│   └── api/
│       ├── market/{quotes,news,ipo}/route.ts
│       └── scanner/run/route.ts
│
├── modules/                # Feature modules — each owns its components, hooks and logic
│   ├── market/             # Core market-data domain (the only module others depend on)
│   │   ├── components/     # MarketProvider (global store), InstrumentPanel, NewsList, PriceChart, TradingViewWidget
│   │   ├── hooks/          # useLocalStorage, useMarketClock, useNewsFeed
│   │   ├── lib/            # yahoo, news, indicators, seed, symbols, tradingview
│   │   └── index.ts        # Public API
│   ├── dashboard/          # Home / command deck view
│   ├── alerts/             # Alert rules: view, shared AlertList, alert logic
│   ├── markets/            # Watchlist view
│   ├── portfolio/          # Holdings view + portfolio math
│   ├── research/           # News research view
│   └── scanner/            # Scanner view, useScanner hook, scanner engine
│
├── components/             # Cross-module shared UI (Shell, ui primitives)
├── lib/                    # Cross-module shared utilities (format)
└── types/                  # Domain types split by area (market, portfolio, alerts, scanner)
```

## Module rules

- Each module exposes its surface through its `index.ts` — import `@/modules/<name>`, not deep paths.
- **Exception:** server code (API route handlers) and pure libs import deep paths of `lib/` files
  (e.g. `@/modules/market/lib/yahoo`) so client components never end up in server bundles.
- Inside a module, use relative imports (`./`, `../`).
- Feature modules may depend on `modules/market` (core) and each other's public API;
  the core market module never imports feature views (its one lib dependency is
  `modules/portfolio/lib/portfolio`, imported directly by MarketProvider).
- Shared primitives live in `components/` + `lib/`; domain types in `types/` by area.

## Commands

```bash
npm run dev     # Dev server on 127.0.0.1
npm run build   # Production build
npm run lint    # ESLint
```
