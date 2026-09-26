import { useCallback, useState } from "react";
import { API_MODE, apiFetch } from "@/lib/api/client";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import type { NotificationChannel, RiskLevel, InvestmentHorizon, UserPreferencesDto } from "@/lib/api/contracts";

export interface UserPreferences extends UserPreferencesDto {
  timezone: string;
  currency: string;
}

export const defaultPreferences: UserPreferences = {
  riskLevel: "MODERATE" as RiskLevel,
  horizon: "LONG" as InvestmentHorizon,
  monthlyBudget: 25000,
  maxPositionWeight: 15,
  channels: ["IN_APP"] as NotificationChannel[],
  timezone: "Asia/Kolkata",
  currency: "INR",
};

const PREFERENCES_KEY = "meridian.preferences";

/**
 * Local-mode preferences persist to localStorage; rest-mode saves also hit
 * PUT /api/v1/profile/preferences (TRD section 9). The hook is shared so the
 * agent later reads the same personalization inputs.
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(PREFERENCES_KEY, defaultPreferences);
  const [saving, setSaving] = useState(false);

  const update = useCallback(
    (patch: Partial<UserPreferences>) => {
      setPreferences((current) => ({ ...current, ...patch }));
    },
    [setPreferences],
  );

  const save = useCallback(async () => {
    if (API_MODE === "local") return;
    setSaving(true);
    try {
      const { timezone: _tz, currency: _cur, ...dto } = preferences;
      void _tz;
      void _cur;
      await apiFetch<void>("/profile/preferences", { method: "PUT", body: dto });
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  return { preferences, update, save, saving };
}
