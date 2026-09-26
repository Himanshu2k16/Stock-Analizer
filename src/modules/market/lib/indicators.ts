import type { ChartPoint } from "@/types/market";

export function addIndicators(history: ChartPoint[]): ChartPoint[] {
  const closes = history.map((point) => point.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);
  const rsi14 = rsi(closes, 14);

  return history.map((point, index) => ({
    ...point,
    ema20: round(ema20[index]),
    ema50: round(ema50[index]),
    ema200: round(ema200[index]),
    rsi14: round(rsi14[index]),
  }));
}

export function ema(values: number[], period: number) {
  const multiplier = 2 / (period + 1);
  const output: Array<number | undefined> = [];
  let previous: number | undefined;

  values.forEach((value, index) => {
    if (index < period - 1) {
      output.push(undefined);
      return;
    }
    if (index === period - 1) {
      previous = average(values.slice(0, period));
      output.push(previous);
      return;
    }
    previous = value * multiplier + (previous ?? value) * (1 - multiplier);
    output.push(previous);
  });

  return output;
}

export function rsi(values: number[], period: number) {
  const output: Array<number | undefined> = Array(period).fill(undefined);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;
  output[period] = rsiValue(averageGain, averageLoss);

  for (let i = period + 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    output[i] = rsiValue(averageGain, averageLoss);
  }

  return output;
}

function rsiValue(gain: number, loss: number) {
  if (loss === 0) return 100;
  return 100 - 100 / (1 + gain / loss);
}

export function average(values: number[]) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

export function round(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Number(value.toFixed(2)) : undefined;
}
