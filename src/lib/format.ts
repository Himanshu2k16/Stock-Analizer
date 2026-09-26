export function price(value: number, code = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function money(value: number, code = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: Math.abs(value) >= 100000 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function signedMoney(value: number, code = "INR") {
  return `${value >= 0 ? "+" : "−"}${money(Math.abs(value), code)}`;
}

export function signedPercent(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe >= 0 ? "+" : "−"}${Math.abs(safe).toFixed(2)}%`;
}

export function compact(value?: number) {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function timeAgo(iso?: string) {
  if (!iso) return "—";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function clockTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function sessionDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function displaySymbol(symbol: string) {
  return symbol.replace(/\.(NS|BO)$/, "");
}

export function normalizeSymbol(input: string) {
  const clean = input.trim().toUpperCase().replace(/[^A-Z0-9.&-]/g, "");
  if (!clean) return "";
  return clean.includes(".") ? clean : `${clean}.NS`;
}
