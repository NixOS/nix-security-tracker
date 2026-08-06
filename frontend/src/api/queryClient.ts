/**
 * Centralized QueryClient configuration.
 */
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { getApiErrorMessage, isRateLimited } from "@/utils/apiError";
import { toaster } from "@/utils/toaster";

const RATE_LIMIT_TOAST_ID = "rate-limited";

/**
 * Shows a single deduplicated by id "Too many requests" toast for 429s errors
 */
function notifyRateLimit(error: unknown): void {
  if (!isRateLimited(error)) return;
  if (toaster.isVisible(RATE_LIMIT_TOAST_ID)) return;

  toaster.error({
    id: RATE_LIMIT_TOAST_ID,
    title: "Too many requests",
    description: getApiErrorMessage(error),
  });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notifyRateLimit }),
  mutationCache: new MutationCache({ onError: notifyRateLimit }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Don't retry on 429s (rate limited)
      // Limit to one retry otherwise
      retry: (failureCount, error) => (isRateLimited(error) ? false : failureCount < 1),
    },
  },
});
