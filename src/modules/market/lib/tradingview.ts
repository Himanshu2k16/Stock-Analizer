export function tradingViewSymbol(symbol: string) {
  const clean = symbol.trim().toUpperCase();
  if (!clean) return "";

  if (clean.includes(":")) return clean;

  if (clean.endsWith(".NS")) return `NSE:${clean.replace(/\.NS$/, "")}`;
  if (clean.endsWith(".BO")) return `BSE:${clean.replace(/\.BO$/, "")}`;

  return clean;
}
