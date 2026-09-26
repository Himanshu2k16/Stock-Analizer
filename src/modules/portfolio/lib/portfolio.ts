import type { MarketQuote } from "@/types/market";
import type { Holding, PortfolioMetrics } from "@/types/portfolio";

export function calculatePortfolio(holdings: Holding[], quotes: MarketQuote[]): PortfolioMetrics {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const totalValueSeed = holdings.reduce((sum, holding) => {
    const quote = quoteMap.get(holding.symbol);
    return sum + (quote ? quote.price * holding.quantity : 0);
  }, 0);

  const positions = holdings.map((holding) => {
    const quote = quoteMap.get(holding.symbol);
    const marketValue = quote ? quote.price * holding.quantity : 0;
    const costBasis = holding.averagePrice * holding.quantity;
    return {
      ...holding,
      quote,
      marketValue,
      costBasis,
      unrealizedPnl: marketValue - costBasis,
      dayPnl: quote ? quote.change * holding.quantity : 0,
      weight: totalValueSeed ? (marketValue / totalValueSeed) * 100 : 0,
    };
  });

  const totalValue = positions.reduce((sum, position) => sum + position.marketValue, 0);
  const totalCost = positions.reduce((sum, position) => sum + position.costBasis, 0);
  const dayPnl = positions.reduce((sum, position) => sum + position.dayPnl, 0);
  const topPosition = positions.reduce((top, position) => (!top || position.marketValue > top.marketValue ? position : top), undefined as PortfolioMetrics["topPosition"]);

  return {
    totalValue,
    totalCost,
    unrealizedPnl: totalValue - totalCost,
    dayPnl,
    positions,
    topPosition,
  };
}
