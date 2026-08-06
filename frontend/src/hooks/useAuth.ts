import { ApiError } from "@/api/client";
import { useV1MeRetrieve } from "@/api/generated/endpoints";
import type { CurrentUser } from "@/api/generated/models";
import { getCsrfToken } from "@/utils/csrf";

export function useAuth() {
  const { data, isLoading, error } = useV1MeRetrieve({
    query: {
      staleTime: 5 * 60_000, // user info rarely changes
      retry: false,
    },
  });

  // Treat 401 as "not authenticated" rather than an error
  const isUnauthenticated = error instanceof ApiError && error.status === 401;

  return {
    user: (data as CurrentUser | undefined) ?? null,
    isAuthenticated: data != null,
    isLoading: isLoading && !isUnauthenticated,
    error: isUnauthenticated ? null : error,
  };
}

/** Builds and submits a hidden POST form (handles the CSRF token + server-side redirect). */
function submitForm(action: string, fields: Record<string, string>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;

  const csrfInput = document.createElement("input");
  csrfInput.type = "hidden";
  csrfInput.name = "csrfmiddlewaretoken";
  csrfInput.value = getCsrfToken() ?? "";
  form.appendChild(csrfInput);

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

/**
 * Initiates GitHub login via allauth's headless API.
 * https://docs.allauth.org/en/latest/headless/index.html
 */
export function login(): void {
  submitForm("/_allauth/browser/v1/auth/provider/redirect", {
    provider: "github",
    process: "login",
    callback_url: "/ui-v2/",
  });
}

export function logout(): void {
  // Form submission to allauth's logout endpoint (handles redirect server-side)
  submitForm("/accounts/logout/", { next: "/ui-v2/" });
}
