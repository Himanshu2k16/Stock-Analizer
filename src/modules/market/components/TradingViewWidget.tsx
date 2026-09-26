"use client";

import { useEffect, useRef, useState } from "react";
import { tradingViewSymbol } from "../lib/tradingview";

export function TradingViewWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slow, setSlow] = useState(false);
  const tvSymbol = tradingViewSymbol(symbol);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !tvSymbol) return;

    setSlow(false);
    container.innerHTML = "";
    const slowTimer = window.setTimeout(() => setSlow(true), 8000);

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "calc(100% - 32px)";
    widget.style.width = "100%";

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML = `<a href="https://www.tradingview.com/symbols/${tvSymbol.replace(":", "-")}/" rel="noopener nofollow" target="_blank"><span class="blue-text">${tvSymbol} chart</span></a><span class="trademark"> by TradingView</span>`;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.onload = () => window.clearTimeout(slowTimer);
    script.onerror = () => setSlow(true);
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#061018",
      gridColor: "rgba(125, 211, 252, 0.08)",
      withdateranges: true,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: true,
      hide_volume: false,
      details: true,
      hotlist: false,
      calendar: false,
      studies: ["MASimple@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    });

    container.append(widget, copyright, script);

    return () => {
      window.clearTimeout(slowTimer);
      container.innerHTML = "";
    };
  }, [tvSymbol]);

  return (
    <div className="relative h-[680px] min-h-[520px] overflow-hidden rounded-lg border border-hairline bg-ink-950">
      <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
      {slow && (
        <div className="absolute inset-x-4 top-4 z-10 rounded-lg border border-coral/30 bg-ink-900/95 p-4 shadow-[0_18px_42px_-28px_rgba(0,0,0,0.95)]">
          <p className="text-sm font-semibold text-paper">TradingView chart is taking longer than expected.</p>
          <p className="mt-1 text-xs leading-relaxed text-paper-dim">
            Prices from the app are still loaded below. If this box stays here, the browser or network is blocking TradingView&apos;s embedded script.
          </p>
        </div>
      )}
    </div>
  );
}
