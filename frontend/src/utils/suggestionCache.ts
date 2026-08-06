/**
 * The same suggestion can be cached in:
 * - the detail query
 * - embedded in one or more paginated list pages (`getListSuggestionsQueryKey`)
 * These helpers aim to maintain coherent caches.
 */
import type { QueryClient } from "@tanstack/react-query";
import { getGetSuggestionQueryKey, getListSuggestionsQueryKey } from "@/api/generated/endpoints";
import type { PaginatedSuggestionList, Suggestion } from "@/api/generated/models";

const listQueryKeyPrefix = getListSuggestionsQueryKey();

export function getCachedSuggestion(queryClient: QueryClient, id: number): Suggestion | undefined {
  const detail = queryClient.getQueryData<Suggestion>(getGetSuggestionQueryKey(id));
  if (detail) return detail;

  const listQueries = queryClient.getQueriesData<PaginatedSuggestionList>({
    queryKey: listQueryKeyPrefix,
  });
  for (const [, data] of listQueries) {
    const found = data?.results.find((s) => s.id === id);
    if (found) return found;
  }

  return undefined;
}

export async function cancelCachedSuggestionQueries(
  queryClient: QueryClient,
  id: number,
): Promise<void> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: getGetSuggestionQueryKey(id) }),
    queryClient.cancelQueries({ queryKey: listQueryKeyPrefix }),
  ]);
}

export function setCachedSuggestion(
  queryClient: QueryClient,
  id: number,
  updater: (prev: Suggestion) => Suggestion,
): void {
  queryClient.setQueryData<Suggestion>(getGetSuggestionQueryKey(id), (prev) =>
    prev ? updater(prev) : prev,
  );

  queryClient.setQueriesData<PaginatedSuggestionList>({ queryKey: listQueryKeyPrefix }, (prev) => {
    if (!prev) return prev;
    let changed = false;
    const results = prev.results.map((s) => {
      if (s.id !== id) return s;
      changed = true;
      return updater(s);
    });
    return changed ? { ...prev, results } : prev;
  });
}

export function invalidateCachedSuggestion(queryClient: QueryClient, id: number): void {
  queryClient.invalidateQueries({ queryKey: getGetSuggestionQueryKey(id) });
  queryClient.invalidateQueries({ queryKey: listQueryKeyPrefix });
}
