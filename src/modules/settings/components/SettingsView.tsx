"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Panel, Pill, SelectField, TextField } from "@/components/ui";
import { useAuth } from "@/modules/auth";
import type { InvestmentHorizon, NotificationChannel, RiskLevel } from "@/lib/api/contracts";
import { useUserPreferences } from "../lib/preferences";

const RISK_LEVELS: Array<{ value: RiskLevel; label: string; hint: string }> = [
  { value: "CONSERVATIVE", label: "Conservative", hint: "Capital protection first, small position sizes" },
  { value: "MODERATE", label: "Moderate", hint: "Balanced growth with managed drawdowns" },
  { value: "AGGRESSIVE", label: "Aggressive", hint: "Higher volatility tolerated for compounding" },
];

const HORIZONS: Array<{ value: InvestmentHorizon; label: string }> = [
  { value: "SHORT", label: "Short term (weeks)" },
  { value: "MEDIUM", label: "Medium term (months)" },
  { value: "LONG", label: "Long term (years)" },
];

const CHANNELS: Array<{ id: NotificationChannel; label: string; ready: boolean }> = [
  { id: "IN_APP", label: "In-app", ready: true },
  { id: "EMAIL", label: "Email", ready: true },
  { id: "PUSH", label: "Web push", ready: false },
  { id: "TELEGRAM", label: "Telegram", ready: false },
];

const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export function SettingsView() {
  const { user, isDemo } = useAuth();
  const { preferences, update, save, saving } = useUserPreferences();
  const [saved, setSaved] = useState(false);

  // Sync the editable name with the loaded account without an effect
  // (setState during render is the React-recommended pattern here).
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileId, setProfileId] = useState(user?.id);
  if (user && user.id !== profileId) {
    setProfileId(user.id);
    setProfileName(user.name);
  }
  const name = profileName;

  function toggleChannel(channel: NotificationChannel) {
    const has = preferences.channels.includes(channel);
    const next = has ? preferences.channels.filter((item) => item !== channel) : [...preferences.channels, channel];
    update({ channels: next.length > 0 ? next : ["IN_APP"] });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await save();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel label="Account" title="Profile" actions={isDemo ? <Pill tone="accent">Local demo</Pill> : undefined}>
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="label-mono">Name</span>
              <TextField value={name} onChange={(event) => setProfileName(event.target.value)} placeholder="Your name" />
            </label>
            <label className="block space-y-1.5">
              <span className="label-mono">Email</span>
              <TextField value={user?.email ?? ""} readOnly className="opacity-70" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="label-mono">Timezone</span>
                <SelectField value={preferences.timezone} onChange={(event) => update({ timezone: event.target.value })}>
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </SelectField>
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Currency</span>
                <SelectField value={preferences.currency} onChange={(event) => update({ currency: event.target.value })}>
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </SelectField>
              </label>
            </div>
          </div>
        </Panel>

        <Panel label="Personalization" title="Investment preferences">
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="label-mono">Risk level</span>
              <SelectField value={preferences.riskLevel} onChange={(event) => update({ riskLevel: event.target.value as RiskLevel })}>
                {RISK_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </SelectField>
              <span className="block text-[11px] text-paper-faint">
                {RISK_LEVELS.find((level) => level.value === preferences.riskLevel)?.hint}
              </span>
            </label>
            <label className="block space-y-1.5">
              <span className="label-mono">Investment horizon</span>
              <SelectField value={preferences.horizon} onChange={(event) => update({ horizon: event.target.value as InvestmentHorizon })}>
                {HORIZONS.map((horizon) => (
                  <option key={horizon.value} value={horizon.value}>
                    {horizon.label}
                  </option>
                ))}
              </SelectField>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="label-mono">Monthly budget</span>
                <TextField
                  type="number"
                  min={0}
                  value={preferences.monthlyBudget}
                  onChange={(event) => update({ monthlyBudget: Number(event.target.value) || 0 })}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="label-mono">Max position weight %</span>
                <TextField
                  type="number"
                  min={1}
                  max={100}
                  value={preferences.maxPositionWeight}
                  onChange={(event) => update({ maxPositionWeight: Number(event.target.value) || 1 })}
                />
              </label>
            </div>
          </div>
        </Panel>
      </div>

      <Panel label="Alerts" title="Notification channels">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => {
            const active = preferences.channels.includes(channel.id);
            return (
              <button
                type="button"
                key={channel.id}
                disabled={!channel.ready}
                onClick={() => toggleChannel(channel.id)}
                className={
                  active
                    ? "flex items-center justify-between rounded-lg border border-accent/40 bg-accent-deep px-4 py-3 text-left"
                    : "flex items-center justify-between rounded-lg border border-hairline bg-ink-850/60 px-4 py-3 text-left transition-colors hover:border-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
                }
              >
                <span>
                  <span className={active ? "block text-sm font-medium text-accent-bright" : "block text-sm font-medium text-paper"}>
                    {channel.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase text-paper-faint">
                    {channel.ready ? (active ? "Enabled" : "Off") : "Planned V2"}
                  </span>
                </span>
                <span
                  className={
                    active
                      ? "size-2 rounded-full bg-accent-bright"
                      : "size-2 rounded-full border border-hairline-strong bg-transparent"
                  }
                />
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-paper-faint">
          Preferences feed the agent and the rule engine — allocation limits raise warnings (for example,
          &ldquo;Tata Steel is above your {preferences.maxPositionWeight}% limit&rdquo;) and digest timing follows your timezone.
        </p>
      </Panel>

      <div className="flex items-center justify-end gap-3">
        {saved && <Pill tone="jade">Saved</Pill>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}
