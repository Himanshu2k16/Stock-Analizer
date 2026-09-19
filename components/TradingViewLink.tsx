"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import { tradingViewSymbol, tradingViewUrl } from "@/lib/logic/tradingview";

export function TradingViewLink({
  symbol,
  compact,
  className,
}: {
  symbol: string;
  compact?: boolean;
  className?: string;
}) {
  const tvSymbol = tradingViewSymbol(symbol);

  return (
    <a
      href={tradingViewUrl(symbol)}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${tvSymbol} in TradingView`}
      aria-label={`Open ${tvSymbol} in TradingView`}
      onClick={(event) => event.stopPropagation()}
      className={clsx(
        "inline-flex h-8 items-center justify-center gap-2 rounded-md border border-brass/35 bg-brass-deep px-3",
        "font-mono text-[10px] uppercase text-brass-bright transition-colors hover:border-brass/70 hover:bg-brass hover:text-ink-950",
        compact && "size-8 px-0",
        className,
      )}
    >
      {!compact && <span>Open TradingView</span>}
      <ExternalLink size={13} strokeWidth={1.8} />
    </a>
  );
}
