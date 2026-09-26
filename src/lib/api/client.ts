/**
 * Typed fetch wrapper for the Meridian backend (TRD section 9 conventions).
 *
 * NEXT_PUBLIC_API_MODE=local (default) keeps the app fully browser-local: the
 * existing Next.js route proxies + localStorage act as the mock backend.
 * NEXT_PUBLIC_API_MODE=rest sends every call to the Spring Boot API with a
 * bearer token, so screens never change when the backend lands.
 */
import type { ApiError } from "./contracts";

export type ApiMode = "local" | "rest";

export const API_MODE: ApiMode = process.env.NEXT_PUBLIC_API_MODE === "rest" ? "rest" : "local";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const TOKEN_KEY = "meridian.auth.token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ApiError,
  ) {
    super(problem.detail || problem.title || `Request failed (${status})`);
    this.name = "ApiRequestError";
  }
}

export function apiUrl(path: string): string {
  return `${BASE_URL}/api/v1${path}`;
}

export async function apiFetch<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body !== undefined) headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  if (!response.ok) {
    let problem: ApiError = {
      title: response.statusText || "Request failed",
      status: response.status,
    };
    try {
      problem = (await response.json()) as ApiError;
    } catch {
      // non-JSON error body: keep the status-based fallback
    }
    throw new ApiRequestError(response.status, problem);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
