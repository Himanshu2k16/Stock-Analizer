"use client";

import { useMemo, useState } from "react";
import { Area, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketQuote } from "@/types/investment";
import { compact, displaySymbol, price, shortDate } from "@/lib/logic/format";

const ranges = [
  { id: "1m", sessions: 21 },
  { id: "3m", sessions: 63 },
  { id: "6m", sessions: 126 },
  { id: "1y", sessions: 252 },
] as const;

type RangeId = (typeof ranges)[number]["id"];

export function PriceChart({ quote, height = 300 }: { quote?: MarketQuote; height?: number }) {
  const [range, setRange] = useState<RangeId>("6m");
  const data = useMemo(() => {
    if (!quote) return [];
    const sessions = ranges.find((item) => item.id === range)?.sessions ?? 126;
    return quote.history.slice(-sessions);
  }, [quote, range]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="label-mono">
          Simple price chart · {displaySymbol(quote?.symbol ?? "")}
        </p>
        <div className="flex gap-1 rounded-md border border-hairline bg-ink-950/70 p-1">
          {ranges.map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={
                item.id === range
                  ? "rounded bg-brass-deep px-2.5 py-1 font-mono text-[10px] uppercase text-brass-bright"
                  : "rounded px-2.5 py-1 font-mono text-[10px] uppercase text-paper-faint transition-colors hover:text-paper-dim"
              }
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="grid h-64 place-items-center rounded-lg border border-dashed border-hairline-strong text-sm text-paper-faint">
          Waiting for market data…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brass)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--color-brass)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(125,211,252,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => shortDate(value)}
              tick={{ fill: "var(--color-paper-faint)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              yAxisId="price"
              domain={[(min: number) => min * 0.985, (max: number) => max * 1.01]}
              tick={{ fill: "var(--color-paper-faint)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={62}
              tickFormatter={(value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            />
            <YAxis yAxisId="volume" hide domain={[0, (max: number) => max * 4]} />
            <Tooltip
              cursor={{ stroke: "rgba(32,199,223,0.42)", strokeDasharray: "3 3" }}
              content={<ChartTooltip currency={quote?.currency ?? "INR"} />}
            />
            <Bar yAxisId="volume" dataKey="volume" fill="rgba(125,211,252,0.14)" />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="var(--color-brass)"
              strokeWidth={1.8}
              fill="url(#price-area)"
              dot={false}
              activeDot={{ r: 3.5, fill: "var(--color-brass-bright)", strokeWidth: 0 }}
            />
            <Line yAxisId="price" type="monotone" dataKey="ema50" stroke="var(--color-steel)" strokeWidth={1.1} dot={false} connectNulls opacity={0.75} />
            <Line yAxisId="price" type="monotone" dataKey="ema200" stroke="var(--color-jade)" strokeWidth={1.1} dot={false} connectNulls opacity={0.75} />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-paper-faint">
        <LegendMark color="var(--color-brass)" label="Close" />
        <LegendMark color="var(--color-steel)" label="EMA 50" />
        <LegendMark color="var(--color-jade)" label="EMA 200" />
        <span className="num ml-auto">{compact(data.at(-1)?.rsi14)} RSI(14) · latest session</span>
      </div>
    </div>
  );
}

function LegendMark({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-0.5 w-4 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

interface TooltipEntry {
  dataKey?: string | number;
  value?: number | string;
  payload?: Record<string, number | string>;
}

function ChartTooltip({ active, payload, label, currency }: { active?: boolean; payload?: TooltipEntry[]; label?: string; currency: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};
  const rows: Array<[string, string]> = [
    ["Open", point.open !== undefined ? price(Number(point.open), currency) : "—"],
    ["High", point.high !== undefined ? price(Number(point.high), currency) : "—"],
    ["Low", point.low !== undefined ? price(Number(point.low), currency) : "—"],
    ["Close", price(Number(point.close), currency)],
    ["Volume", compact(Number(point.volume))],
  ];
  const extra = payload.find((entry) => entry.dataKey === "ema200" && entry.value !== undefined);

  return (
    <div className="rounded-lg border border-hairline-strong bg-ink-900 px-4 py-3 shadow-[0_20px_42px_-26px_rgba(0,0,0,0.9)]">
      <p className="label-mono mb-2">{label ? shortDate(label) : ""}</p>
      {rows.map(([key, value]) => (
        <p key={key} className="flex justify-between gap-8 text-xs leading-5">
          <span className="text-paper-faint">{key}</span>
          <span className="num text-paper">{value}</span>
        </p>
      ))}
      {extra && (
        <p className="flex justify-between gap-8 text-xs leading-5">
          <span className="text-paper-faint">EMA 200</span>
          <span className="num text-jade">{price(Number(extra.value), currency)}</span>
        </p>
      )}
    </div>
  );
}
