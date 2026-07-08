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

export const LOGIN_URL = "/accounts/github/login/?process=login&next=/ui-v2/";

export function logout(): void {
  const csrfToken = getCsrfToken() ?? "";

  // Form submission to allauth's logout endpoint (handles redirect server-side)
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/accounts/logout/";

  const csrfInput = document.createElement("input");
  csrfInput.type = "hidden";
  csrfInput.name = "csrfmiddlewaretoken";
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  const nextInput = document.createElement("input");
  nextInput.type = "hidden";
  nextInput.name = "next";
  nextInput.value = "/ui-v2/";
  form.appendChild(nextInput);

  document.body.appendChild(form);
  form.submit();
}
