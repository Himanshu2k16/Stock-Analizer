"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { API_MODE, apiFetch, setAuthToken } from "@/lib/api/client";
import type { UserProfileDto } from "@/lib/api/contracts";

interface AuthContextValue {
  user: UserProfileDto | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "meridian.auth.user";

/** Mock account used in local mode so screens work before the backend ships. */
const DEMO_USER: UserProfileDto = {
  id: "demo-user",
  email: "demo@meridian.local",
  name: "Demo Investor",
  timezone: "Asia/Kolkata",
  currency: "INR",
};

function readStoredUser(): UserProfileDto | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfileDto) : null;
  } catch {
    return null;
  }
}

function storeUser(user: UserProfileDto | null) {
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (API_MODE === "local") {
        if (!active) return;
        setUser(readStoredUser() ?? DEMO_USER);
        storeUser(readStoredUser() ?? DEMO_USER);
        setLoading(false);
        return;
      }
      setAuthToken(window.localStorage.getItem("meridian.auth.token"));
      if (!window.localStorage.getItem("meridian.auth.token")) {
        setLoading(false);
        return;
      }
      try {
        const profile = await apiFetch<UserProfileDto>("/profile");
        if (active) setUser(profile);
      } catch {
        setAuthToken(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (API_MODE === "local") {
      const clean = email.trim().toLowerCase();
      const stored = readStoredUser();
      const next: UserProfileDto = {
        ...(stored && stored.email === clean ? stored : DEMO_USER),
        email: clean,
      };
      storeUser(next);
      setUser(next);
      return;
    }
    const result = await apiFetch<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: { email: email.trim().toLowerCase(), password },
    });
    setAuthToken(result.accessToken);
    setUser(await apiFetch<UserProfileDto>("/profile"));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split("@")[0] || "Investor";
    if (API_MODE === "local") {
      const next: UserProfileDto = { ...DEMO_USER, id: `local-${Date.now()}`, email: cleanEmail, name: cleanName };
      storeUser(next);
      setUser(next);
      return;
    }
    await apiFetch<{ id: string }>("/auth/register", {
      method: "POST",
      body: { name: cleanName, email: cleanEmail, password },
    });
    await login(cleanEmail, password);
  }, [login]);

  const logout = useCallback(() => {
    setAuthToken(null);
    if (API_MODE === "local") {
      window.localStorage.removeItem(USER_KEY);
      setUser(null);
      return;
    }
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isDemo: API_MODE === "local",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
