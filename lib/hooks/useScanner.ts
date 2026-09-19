"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScannerMatch, ScannerTemplateId } from "@/types/investment";

export interface ScannerResult {
  template: ScannerTemplateId;
  universe: number;
  matches: ScannerMatch[];
  errors: Array<{ symbol: string; message: string }>;
  fetchedAt: string;
}

export function useScanner(template: ScannerTemplateId, autoRun: boolean) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ key: string; result?: ScannerResult }>();

  const run = useCallback(() => setNonce((value) => value + 1), []);
  const active = nonce > 0 || autoRun;
  const key = `${template}:${nonce}`;

  useEffect(() => {
    if (!active) return;
    let alive = true;
    fetch(`/api/scanner/run?template=${template}`, { cache: "no-store" })
      .then((response) => response.json() as Promise<ScannerResult>)
      .then((result) => {
        if (alive) setState({ key, result });
      })
      .catch(() => {
        if (alive) setState({ key });
      });
    return () => {
      alive = false;
    };
  }, [active, key, template]);

  return {
    result: state?.key === key ? state.result : undefined,
    loading: active && state?.key !== key,
    run,
  };
}

export function matchesToCsv(matches: ScannerMatch[]) {
  const head = "Symbol,Price,Change %,EMA 200,Distance %,RSI 14,Score,Signal";
  const rows = matches.map((match) =>
    [
      match.symbol,
      match.price.toFixed(2),
      match.changePercent.toFixed(2),
      match.ema200?.toFixed(2) ?? "",
      match.distanceFromEma200?.toFixed(2) ?? "",
      match.rsi14?.toFixed(1) ?? "",
      match.score,
      `"${match.signal.replace(/"/g, '""')}"`,
    ].join(","),
  );
  return [head, ...rows].join("\n");
}
