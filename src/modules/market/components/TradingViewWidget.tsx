"use client";

import { useMemo } from "react";
import { tradingViewSymbol } from "../lib/tradingview";

/**
 * TradingView advanced-chart embed. Inline mode (default) renders at a fixed
 * card height; full mode (the /chart page) stretches edge-to-edge inside its
 * flex container. Everything stays inside Meridian — no popups, no redirect to
 * tradingview.com.
 *
 * Each instance renders inside its own srcdoc iframe so the TradingView loader
 * script can never scan and double-inject across React remounts (dev
 * StrictMode remounts every effect twice, which duplicated charts before).
 */
export function TradingViewWidget({ symbol, full = false }: { symbol: string; full?: boolean }) {
  const srcdoc = useMemo(() => buildEmbedDoc(tradingViewSymbol(symbol)), [symbol]);

  return (
    <iframe
      title={`TradingView chart · ${symbol}`}
      srcDoc={srcdoc}
      className={full ? "h-full w-full border-0" : "h-[680px] min-h-[520px] w-full rounded-lg border border-hairline"}
      allow="clipboard-write"
      allowFullScreen
    />
  );
}

function buildEmbedDoc(tvSymbol: string): string {
  const config = JSON.stringify({
    autosize: true,
    symbol: tvSymbol,
    interval: "D",
    timezone: "Asia/Kolkata",
    theme: "dark",
    style: "1",
    locale: "en",
    backgroundColor: "#0b0e14",
    gridColor: "rgba(255, 255, 255, 0.06)",
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

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #061018; overflow: hidden; }
  .tradingview-widget-container { height: calc(100% - 22px); width: 100%; }
  .tradingview-widget-container__widget { height: 100%; width: 100%; }
  .tradingview-widget-copyright { height: 22px; font-size: 11px; line-height: 22px; text-align: center; color: #5d606b; }
  .tradingview-widget-copyright a { color: #2962ff; text-decoration: none; }
</style>
</head>
<body>
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
  ${config}
  </script>
</div>
<div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/${tvSymbol.replace(":", "-")}/" rel="noopener nofollow" target="_blank">${tvSymbol} chart</a> by TradingView</div>
</body>
</html>`;
}
