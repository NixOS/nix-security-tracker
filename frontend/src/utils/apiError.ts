import { ApiError } from "@/api/client";

/**
 * Extracts a human-readable message from an error thrown by `apiFetch`.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body;
    if (body && typeof body === "object") {
      if ("detail" in body && typeof body.detail === "string") {
        return body.detail;
      }

      const [field, messages] = Object.entries(body)[0] ?? [];
      if (field && Array.isArray(messages) && typeof messages[0] === "string") {
        return `${field}: ${messages[0]}`;
      }
    }
  }

  return "Check your connection and try again";
}
