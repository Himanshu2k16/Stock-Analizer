"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Panel, Pill, TextField } from "@/components/ui";
import { useAuth } from "./AuthProvider";

type Mode = "login" | "register";

export function LoginView() {
  const { login, register, isDemo } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-md">
        <Panel
          label="Account access"
          title={mode === "login" ? "Sign in to Meridian" : "Create your Meridian account"}
          actions={isDemo ? <Pill tone="accent">Local demo</Pill> : undefined}
        >
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <label className="block space-y-1.5">
                <span className="label-mono">Name</span>
                <TextField value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" />
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="label-mono">Email</span>
              <TextField
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="label-mono">Password</span>
              <TextField
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 4 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {error && <p className="text-xs text-coral">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>

            <p className="text-center text-xs text-paper-faint">
              {mode === "login" ? "New to Meridian?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                }}
                className="font-medium text-accent-bright hover:underline"
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </form>
        </Panel>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-paper-faint">
          Decision support only — no broker execution. Your portfolio and rules stay isolated to your account.
        </p>
      </div>
    </div>
  );
}
