"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import { tradingViewSymbol, tradingViewUrl } from "@/lib/logic/tradingview";

export function TradingViewLink({
  symbol,
  compact,
  featured,
  className,
}: {
  symbol: string;
  compact?: boolean;
  featured?: boolean;
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
        "inline-flex items-center justify-center gap-2 rounded-md border border-brass/35 bg-brass-deep",
        "font-mono uppercase text-brass-bright transition-colors hover:border-brass/70 hover:bg-brass hover:text-ink-950",
        featured ? "h-11 px-5 text-[12px] shadow-[0_0_28px_-14px_rgba(32,199,223,0.9)]" : "h-8 px-3 text-[10px]",
        compact && "size-8 px-0",
        className,
      )}
    >
      {!compact && <span>{featured ? `Open TradingView · ${tvSymbol}` : "Open TradingView"}</span>}
      <ExternalLink size={13} strokeWidth={1.8} />
    </a>
  );
}
