import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { signedPercent } from "@/lib/logic/format";

export function Panel({
  label,
  title,
  actions,
  className,
  bodyClassName,
  children,
}: {
  label?: string;
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={clsx(
        "rounded-panel border border-hairline bg-ink-900/92",
        "shadow-[0_1px_0_rgba(125,211,252,0.08)_inset,0_22px_54px_-42px_rgba(0,0,0,0.95)]",
        className,
      )}
    >
      {(label || title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            {label && <p className="label-mono">{label}</p>}
            {title && <h2 className="mt-1 truncate font-display text-lg font-semibold leading-tight text-paper">{title}</h2>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={clsx("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-4",
        "font-mono text-[11px] uppercase transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-40",
        variant === "primary" && "bg-brass text-ink-950 hover:bg-brass-bright",
        variant === "secondary" && "border border-hairline-strong bg-ink-850/70 text-paper-dim hover:border-brass/50 hover:text-brass-bright",
        variant === "ghost" && "text-paper-faint hover:text-paper",
        variant === "danger" && "text-coral hover:bg-coral-deep",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const pillTones = {
  brass: "border-brass/25 text-brass-bright bg-brass-deep",
  jade: "border-jade/30 text-jade bg-jade-deep",
  coral: "border-coral/30 text-coral bg-coral-deep",
  steel: "border-steel/30 text-steel bg-steel/10",
  neutral: "border-hairline-strong text-paper-dim",
};

export function Pill({ tone = "neutral", className, children }: { tone?: keyof typeof pillTones; className?: string; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase",
        pillTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ on, className }: { on?: boolean; className?: string }) {
  return <span className={clsx("size-1.5 rounded-full", on ? "bg-jade" : "bg-paper-faint", className)} />;
}

export function Delta({ percent, className }: { percent: number; className?: string }) {
  const up = percent >= 0;
  return (
    <span className={clsx("num text-xs", up ? "text-jade" : "text-coral", className)}>
      {up ? "▲" : "▼"} {signedPercent(percent)}
    </span>
  );
}

export function Stat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "jade" | "coral" | "brass";
}) {
  return (
    <div className="rounded-panel border border-hairline bg-ink-900/92 px-5 py-4 shadow-[0_18px_42px_-34px_rgba(0,0,0,0.85)]">
      <p className="label-mono">{label}</p>
      <p
        className={clsx(
          "mt-2 font-display text-[24px] font-semibold leading-none tabular-nums",
          tone === "jade" && "text-jade",
          tone === "coral" && "text-coral",
          tone === "brass" && "text-brass-bright",
        )}
      >
        {value}
      </p>
      {detail && <div className="mt-2 text-xs text-paper-dim">{detail}</div>}
    </div>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-hairline bg-ink-950/70 px-3 text-sm text-paper outline-none transition-colors placeholder:text-paper-faint focus:border-brass/70 focus:bg-ink-850";

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={clsx(inputClass, className)} {...rest} />;
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select className={clsx(inputClass, "appearance-none pr-8", className)} {...rest} />;
}

export function Sparkline({ values, up, width = 96, height = 28 }: { values: number[]; up: boolean; width?: number; height?: number }) {
  if (values.length < 2) return <span className="text-paper-faint">—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((value, index) => `${(index * step).toFixed(1)},${(height - ((value - min) / span) * (height - 4) - 2).toFixed(1)}`);
  const stroke = up ? "var(--color-jade)" : "var(--color-coral)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden>
      <polyline points={`0,${height} ${points.join(" ")} ${width},${height}`} fill={stroke} opacity="0.08" stroke="none" />
      <polyline points={points.join(" ")} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-hairline-strong bg-ink-850/55 px-4 py-10 text-center text-sm text-paper-faint">{children}</div>
  );
}

export function SkeletonGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={clsx("grid gap-4", className)}>
      {Array.from({ length: count }, (_, index) => index).map((index) => (
        <div key={index} className="min-h-24 animate-pulse rounded-panel border border-hairline bg-ink-850/80" />
      ))}
    </div>
  );
}
