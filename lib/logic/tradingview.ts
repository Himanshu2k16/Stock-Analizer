export function tradingViewSymbol(symbol: string) {
  const clean = symbol.trim().toUpperCase();
  if (!clean) return "";

  if (clean.includes(":")) return clean;

  if (clean.endsWith(".NS")) return `NSE:${clean.replace(/\.NS$/, "")}`;
  if (clean.endsWith(".BO")) return `BSE:${clean.replace(/\.BO$/, "")}`;

  return clean;
}

export function tradingViewUrl(symbol: string) {
  const tvSymbol = tradingViewSymbol(symbol);
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;
}
