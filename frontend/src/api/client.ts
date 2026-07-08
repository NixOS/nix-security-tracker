/**
 * Orval custom mutator — delegates all generated API hooks to a single fetch function.
 * Mostly needed because of Django CSRF requirements.
 *
 * - Serializes query params into the URL
 * - Injects `X-CSRFToken` header on unsafe methods (Django CSRF requirement)
 * - Serializes JSON request bodies
 * - Throws `ApiError` on non-2xx (TanStack Query marks the query as failed). `ApiError.status` lets consumers discriminate errors (e.g. treat 401 as "not logged in").
 *
 */
import { getCsrfToken } from "@/utils/csrf";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`API error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  config: {
    url: string;
    method: string;
    params?: Record<string, unknown>;
    data?: unknown;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  },
  options?: RequestInit,
): Promise<T> {
  const { url, method, params, data, signal, headers: configHeaders } = config;

  // Orval passes query params as an object — serialize them into the URL.
  const target = new URL(url, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      if (Array.isArray(value)) {
        for (const v of value) target.searchParams.append(key, String(v));
      } else {
        target.searchParams.append(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = { ...configHeaders };

  // Django CSRF: read token from cookie, send as header on unsafe methods
  if (UNSAFE_METHODS.has(method.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(target, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
    signal,
    ...options,
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      // Response body isn't JSON
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return response.json();
}
