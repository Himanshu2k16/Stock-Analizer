"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AlertRule } from "@/types/alerts";
import type { Holding, PortfolioMetrics } from "@/types/portfolio";
import type { MarketQuote } from "@/types/market";
import { defaultAlerts, defaultHoldings, defaultWatchlist } from "../lib/seed";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { addIndicators } from "../lib/indicators";
import { calculatePortfolio } from "@/modules/portfolio/lib/portfolio";
import { normalizeSymbol } from "@/lib/format";

interface QuoteError {
  symbol: string;
  message: string;
}

interface QuoteResponse {
  quotes: MarketQuote[];
  errors: QuoteError[];
  fetchedAt: string;
}

interface MarketContextValue {
  watchlist: string[];
  addSymbol: (input: string) => boolean;
  removeSymbol: (symbol: string) => void;
  holdings: Holding[];
  addHolding: (holding: Omit<Holding, "id">) => void;
  removeHolding: (id: string) => void;
  alerts: AlertRule[];
  addAlert: (alert: AlertRule) => void;
  toggleAlert: (id: string) => void;
  removeAlert: (id: string) => void;
  quotes: MarketQuote[];
  errors: QuoteError[];
  loading: boolean;
  refreshing: boolean;
  fetchedAt?: string;
  refresh: () => void;
  selectedSymbol: string;
  selectSymbol: (symbol: string) => void;
  selectedQuote?: MarketQuote;
  portfolio: PortfolioMetrics;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used inside MarketProvider");
  return context;
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>("meridian.watchlist", defaultWatchlist);
  const [holdings, setHoldings] = useLocalStorage<Holding[]>("meridian.holdings", defaultHoldings);
  const [alerts, setAlerts] = useLocalStorage<AlertRule[]>("meridian.alerts", defaultAlerts);

  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [errors, setErrors] = useState<QuoteError[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string>();
  const [selectedSymbol, setSelectedSymbol] = useState(defaultWatchlist[0]);
  const firstLoad = useRef(true);

  const effectiveWatchlist = watchlist.length > 0 ? watchlist : defaultWatchlist;
  const watchlistKey = effectiveWatchlist.join(",");

  const load = useCallback(async () => {
    if (firstLoad.current) setLoading(true);
    else setRefreshing(true);
    try {
      const fetchQuotes = async (symbols: string) => {
        const response = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(symbols)}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Quote request failed (${response.status})`);
        return (await response.json()) as QuoteResponse;
      };

      let payload = await fetchQuotes(watchlistKey);
      if (payload.quotes.length === 0 && watchlistKey !== defaultWatchlist.join(",")) {
        payload = await fetchQuotes(defaultWatchlist.join(","));
        setSelectedSymbol(defaultWatchlist[0]);
      }

      const nextQuotes = payload.quotes.map((quote) => ({ ...quote, history: addIndicators(quote.history) }));
      setQuotes(nextQuotes);
      setErrors(
        nextQuotes.length === 0
          ? [{ symbol: "Watchlist", message: "No prices came back. Try a stock suggestion like Reliance, Infosys or Tata Steel." }, ...payload.errors]
          : payload.errors,
      );
      setFetchedAt(payload.fetchedAt);
    } catch (error) {
      setErrors([{ symbol: "Market data", message: error instanceof Error ? error.message : "Could not load prices." }]);
    } finally {
      firstLoad.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [watchlistKey]);

  useEffect(() => {
    firstLoad.current = true;
    queueMicrotask(() => void load());
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  const portfolio = useMemo(() => calculatePortfolio(holdings, quotes), [holdings, quotes]);
  const activeSymbol = quotes.some((quote) => quote.symbol === selectedSymbol) ? selectedSymbol : (quotes[0]?.symbol ?? selectedSymbol);
  const selectedQuote = quotes.find((quote) => quote.symbol === activeSymbol);

  const value: MarketContextValue = {
    watchlist,
    addSymbol: (input) => {
      const symbol = normalizeSymbol(input);
      if (!symbol || watchlist.includes(symbol)) return false;
      setWatchlist((items) => [...items, symbol]);
      setSelectedSymbol(symbol);
      return true;
    },
    removeSymbol: (symbol) => {
      setWatchlist((items) => items.filter((item) => item !== symbol));
    },
    holdings,
    addHolding: (holding) => {
      const symbol = normalizeSymbol(holding.symbol);
      setHoldings((items) => [{ ...holding, symbol, id: `holding-${Date.now()}` }, ...items.filter((item) => item.symbol !== symbol)]);
      setSelectedSymbol(symbol);
    },
    removeHolding: (id) => setHoldings((items) => items.filter((item) => item.id !== id)),
    alerts,
    addAlert: (alert) => setAlerts((items) => [alert, ...items]),
    toggleAlert: (id) => setAlerts((items) => items.map((alert) => (alert.id === id ? { ...alert, active: !alert.active } : alert))),
    removeAlert: (id) => setAlerts((items) => items.filter((alert) => alert.id !== id)),
    quotes,
    errors,
    loading,
    refreshing,
    fetchedAt,
    refresh: () => void load(),
    selectedSymbol: activeSymbol,
    selectSymbol: (symbol) => setSelectedSymbol(normalizeSymbol(symbol)),
    selectedQuote,
    portfolio,
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}
