export function tradingViewSymbol(symbol: string) {
  const clean = symbol.trim().toUpperCase();
  if (!clean) return "";

  // Already exchange-qualified (e.g. "NSE:INFY").
  if (clean.includes(":")) return clean;

  // TradingView's embed does not carry NSE/BSE candle data under the NSE:/BSE:
  // namespace ("symbol not available"), but its symbol search resolves a bare
  // ticker to the working BSE listing with full data — so strip the suffix
  // and let TradingView resolve it.
  return clean.replace(/\.(NS|BO)$/, "");
}
