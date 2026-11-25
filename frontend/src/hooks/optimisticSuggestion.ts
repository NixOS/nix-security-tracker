import type { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import type { Suggestion } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  cancelCachedSuggestionQueries,
  getCachedSuggestion,
  invalidateCachedSuggestion,
  setCachedSuggestion,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

const STALE_CONFLICT_DESCRIPTION =
  "The suggestion might have been stale. It has been re-synchronized with the server.";

type MutationContext = { previous?: Suggestion };

type Options<TData, TVars> = {
  /** Optimistic change applied to every cached copy of the suggestion. */
  patch: (prev: Suggestion, vars: TVars) => Suggestion;
  errorTitle: (vars: TVars) => string;
  /**
   * Title of the warning shown when the server rejects the change with a 400.
   * Leaving it out handles a 400 like any other error.
   */
  conflictTitle?: (vars: TVars) => string;
  /** Restore the cached suggestion on error. */
  rollback?: boolean;
  onSuccess?: (data: TData, vars: TVars) => void;
};

/**
 * Callbacks for a mutation that optimistically patches a suggestion wherever it is cached.
 * Spread the result into the `mutation` options of a generated mutation hook.
 */
export function optimisticSuggestionHandlers<TData, TVars>(
  queryClient: QueryClient,
  suggestionId: number,
  { patch, errorTitle, conflictTitle, rollback = true, onSuccess }: Options<TData, TVars>,
) {
  return {
    onMutate: async (vars: TVars): Promise<MutationContext> => {
      await cancelCachedSuggestionQueries(queryClient, suggestionId);
      const previous = rollback ? getCachedSuggestion(queryClient, suggestionId) : undefined;
      setCachedSuggestion(queryClient, suggestionId, (prev) => patch(prev, vars));
      return { previous };
    },
    onError: (err: unknown, vars: TVars, context?: MutationContext) => {
      if (conflictTitle && err instanceof ApiError && err.status === 400) {
        // Likely a stale-state conflict, e.g. another user already made the same change.
        // The cached snapshot is stale too, so refetch instead of rolling back to it.
        invalidateCachedSuggestion(queryClient, suggestionId);
        toaster.warning({ title: conflictTitle(vars), description: STALE_CONFLICT_DESCRIPTION });
        return;
      }
      const snapshot = context?.previous;
      if (snapshot) setCachedSuggestion(queryClient, suggestionId, () => snapshot);
      toaster.error({ title: errorTitle(vars), description: getApiErrorMessage(err) });
    },
    onSuccess: (data: TData, vars: TVars) => onSuccess?.(data, vars),
  };
}

/**
 * Sets the status of the entry under `key` in a record of items with a status, e.g. an ignored reference back to active.
 * Returns `entries` untouched when there is no such entry.
 */
export function withStatus<E extends { status: string }>(
  entries: Record<string, E>,
  key: string | undefined,
  status: E["status"],
): Record<string, E> {
  if (key === undefined) return entries;
  const entry = entries[key];
  if (entry === undefined) return entries;
  return { ...entries, [key]: { ...entry, status } };
}
