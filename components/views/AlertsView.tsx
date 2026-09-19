"use client";

import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { AlertList } from "@/components/AlertList";
import { Button, Panel, Pill, SelectField, TextField, inputClass } from "@/components/ui";
import { createAlert, parseAlertText } from "@/lib/logic/alerts";
import { displaySymbol, money } from "@/lib/logic/format";
import { useMarket } from "@/lib/market/MarketProvider";
import type { AlertOperator } from "@/types/investment";

export function AlertsView() {
  const { alerts, quotes, addAlert } = useMarket();
  const armed = alerts.filter((alert) => alert.active).length;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel
        label={`${armed} armed · ${alerts.length} total`}
        title="Rule book"
        className="lg:col-span-2 lg:order-2"
        actions={<Pill tone={armed ? "jade" : "neutral"}>{armed ? "Live" : "Silent"}</Pill>}
      >
        <AlertList />
      </Panel>

      <div className="space-y-5 lg:order-1">
        <Composer />
        <ManualForm />
      </div>
    </div>
  );
}

function Composer() {
  const { quotes, addAlert } = useMarket();
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string }>();

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseAlertText(text, quotes);
    if (!parsed) {
      setFeedback({ ok: false, message: "Couldn't find a watchlisted symbol and a number in that sentence." });
      return;
    }
    addAlert(createAlert(parsed, "AGENT"));
    setFeedback({
      ok: true,
      message: `Armed ${displaySymbol(parsed.symbol)} ${parsed.operator} ${money(parsed.threshold)}`,
    });
    setText("");
  }

  return (
    <Panel label="Plain language" title="Rule maker" actions={<Sparkles size={16} className="text-brass" />}>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder="Alert me when Tata Steel slips below 150…"
          aria-label="Describe an alert in plain language"
          className="w-full resize-none rounded-md border border-hairline bg-ink-950/70 px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-paper-faint focus:border-brass/70 focus:bg-ink-850"
        />
        {feedback && <p className={`text-xs ${feedback.ok ? "text-jade" : "text-coral"}`}>{feedback.message}</p>}
        <Button type="submit" className="w-full">
          <Plus size={13} />
          Interpret &amp; arm
        </Button>
        <p className="text-[11px] leading-relaxed text-paper-faint">
          Deterministic parsing — symbol must be on the watchlist, threshold is the first number found. “below / niche / aave” arms a ≤ rule. It
          never places trades.
        </p>
      </form>
    </Panel>
  );
}

function ManualForm() {
  const { quotes, addAlert } = useMarket();
  const [symbol, setSymbol] = useState("");
  const [operator, setOperator] = useState<AlertOperator>(">=");
  const [threshold, setThreshold] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(threshold);
    const chosen = symbol || quotes[0]?.symbol;
    if (!chosen || !(value > 0)) return;
    addAlert(createAlert({ symbol: chosen, operator, threshold: value }, "USER"));
    setThreshold("");
  }

  return (
    <Panel label="Exact thresholds" title="Manual rule">
      <form onSubmit={submit} className="space-y-3">
        <SelectField value={symbol} onChange={(event) => setSymbol(event.target.value)} aria-label="Symbol">
          {quotes.map((quote) => (
            <option key={quote.symbol} value={quote.symbol}>
              {displaySymbol(quote.symbol)} — {quote.name}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-[88px_1fr] gap-3">
          <SelectField value={operator} onChange={(event) => setOperator(event.target.value as AlertOperator)} aria-label="Operator">
            <option value=">=">≥ above</option>
            <option value="<=">≤ below</option>
          </SelectField>
          <TextField
            type="number"
            min="0"
            step="any"
            placeholder="Threshold ₹"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            className={inputClass}
          />
        </div>
        <Button type="submit" variant="secondary" className="w-full" disabled={quotes.length === 0}>
          Create rule
        </Button>
      </form>
    </Panel>
  );
}
