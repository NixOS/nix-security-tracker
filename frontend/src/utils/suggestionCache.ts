/**
 * The same suggestion can be cached in:
 * - the detail query
 * - embedded in one or more paginated list pages (`getListSuggestionsQueryKey`)
 * - embedded in an issue list page, or an issue detail query (`suggestions`)
 * - embedded in a notification list page, or a notification detail query (`suggestion`)
 * These helpers aim to maintain coherent caches across all of the above.
 */
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  getGetSuggestionActivityLogQueryKey,
  getGetSuggestionQueryKey,
  getListIssuesQueryKey,
  getListNotificationsQueryKey,
  getListSuggestionsQueryKey,
} from "@/api/generated/endpoints";
import type {
  Issue,
  ListSuggestionsParams,
  Notification,
  PaginatedIssueList,
  PaginatedNotificationList,
  PaginatedSuggestionList,
  Suggestion,
} from "@/api/generated/models";

const listQueryKeyPrefix = getListSuggestionsQueryKey();
const listIssuesUrl = getListIssuesQueryKey()[0];
const listNotificationsUrl = getListNotificationsQueryKey()[0];

// Matches only the suggestion detail endpoint
// Not sub-resources under it such as `/api/v1/suggestions/42/activity_log`.
const detailUrlPattern = new RegExp(`^${listQueryKeyPrefix[0]}/\\d+$`);

// Matches only the issue detail endpoint (`/api/v1/issues/<code>`)
// Not sub-resources under it.
const issueDetailUrlPattern = new RegExp(`^${listIssuesUrl}/[^/]+$`);

// Matches only the notification detail endpoint (`/api/v1/notifications/<id>`)
// Not sub-resources/actions under it (e.g. `/api/v1/notifications/mark-all-read`).
const notificationDetailUrlPattern = new RegExp(`^${listNotificationsUrl}/\\d+$`);

// Common query key prefix regardless of query params (e.g. activity log)
function detailQueryKeyPrefix(id: number) {
  return getGetSuggestionQueryKey(id);
}

/** Looks up a suggestion wherever it may be cached: detail/list, or embedded in issues/notifications. */
export function getCachedSuggestion(queryClient: QueryClient, id: number): Suggestion | undefined {
  for (const query of queryClient.getQueryCache().getAll()) {
    const found = extractEmbeddedSuggestions(query.queryKey, query.state.data).find(
      (s) => s.id === id,
    );
    if (found) return found;
  }
  return undefined;
}

function isIssueDetailQuery(queryKey: QueryKey): boolean {
  return typeof queryKey[0] === "string" && issueDetailUrlPattern.test(queryKey[0]);
}

function isNotificationDetailQuery(queryKey: QueryKey): boolean {
  return typeof queryKey[0] === "string" && notificationDetailUrlPattern.test(queryKey[0]);
}

export async function cancelCachedSuggestionQueries(
  queryClient: QueryClient,
  id: number,
): Promise<void> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: detailQueryKeyPrefix(id) }),
    queryClient.cancelQueries({ queryKey: listQueryKeyPrefix }),
    queryClient.cancelQueries({ queryKey: getListIssuesQueryKey() }),
    queryClient.cancelQueries({ predicate: (query) => isIssueDetailQuery(query.queryKey) }),
    queryClient.cancelQueries({ queryKey: getListNotificationsQueryKey() }),
    queryClient.cancelQueries({ predicate: (query) => isNotificationDetailQuery(query.queryKey) }),
  ]);
}

/** Patches a single suggestion (by id) wherever it may be cached, by id equality. */
export function setCachedSuggestion(
  queryClient: QueryClient,
  id: number,
  updater: (prev: Suggestion) => Suggestion,
): void {
  patchCachedSuggestionsMatching(queryClient, (s) => s.id === id, updater);
}

export function invalidateCachedSuggestion(queryClient: QueryClient, id: number): void {
  queryClient.invalidateQueries({ queryKey: detailQueryKeyPrefix(id) });
  queryClient.invalidateQueries({ queryKey: listQueryKeyPrefix });
  queryClient.invalidateQueries({ queryKey: getListIssuesQueryKey() });
  queryClient.invalidateQueries({ predicate: (query) => isIssueDetailQuery(query.queryKey) });
  queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
  queryClient.invalidateQueries({
    predicate: (query) => isNotificationDetailQuery(query.queryKey),
  });
}

/**
 * Mark queries under stale refresh when component is mounted again in the future without refetching fresh data right now.
 * Used when a mutation may move a suggestion in/out of a filtered list to keep showing the old suggestion in faded form.
 */
export function staleQuietly(queryClient: QueryClient, queryKeyPrefix: QueryKey): void {
  queryClient.invalidateQueries({ queryKey: queryKeyPrefix, refetchType: "none" });
}

/** Empty every cached suggestion list page filtered to the issue draft (`in_issue_draft: true`). */
export function clearCachedIssueDraftLists(queryClient: QueryClient): void {
  const draftListQueries = queryClient.getQueryCache().findAll({
    queryKey: listQueryKeyPrefix,
    predicate: (query) =>
      (query.queryKey[1] as ListSuggestionsParams | undefined)?.in_issue_draft === true,
  });
  for (const query of draftListQueries) {
    queryClient.setQueryData<PaginatedSuggestionList>(query.queryKey, (prev) =>
      prev ? { ...prev, results: [], count: 0, next: null, previous: null } : prev,
    );
  }
}

/**
 * Patches every cached copy of a suggestion matching `predicate`, wherever it may be cached or
 * embedded: the suggestion detail query, the standalone suggestion list, embedded in an issue
 * list/detail, and embedded in a notification list/detail.
 */
export function patchCachedSuggestionsMatching(
  queryClient: QueryClient,
  predicate: (suggestion: Suggestion) => boolean,
  updater: (suggestion: Suggestion) => Suggestion,
): void {
  // Suggestion detail
  queryClient.setQueriesData<Suggestion>(
    {
      predicate: (query) =>
        typeof query.queryKey[0] === "string" && detailUrlPattern.test(query.queryKey[0]),
    },
    (prev) => (prev && predicate(prev) ? updater(prev) : prev),
  );

  // Standalone suggestion list
  queryClient.setQueriesData<PaginatedSuggestionList>({ queryKey: listQueryKeyPrefix }, (prev) => {
    if (!prev) return prev;
    let changed = false;
    const results = prev.results.map((s) => {
      if (!predicate(s)) return s;
      changed = true;
      return updater(s);
    });
    return changed ? { ...prev, results } : prev;
  });

  // Embedded in issue list pages
  queryClient.setQueriesData<PaginatedIssueList>({ queryKey: getListIssuesQueryKey() }, (prev) => {
    if (!prev) return prev;
    let listChanged = false;
    const results = prev.results.map((issue) => {
      let issueChanged = false;
      const suggestions = issue.suggestions.map((s) => {
        if (!isEmbeddedSuggestion(s) || !predicate(s)) return s;
        issueChanged = true;
        return updater(s);
      });
      if (!issueChanged) return issue;
      listChanged = true;
      return { ...issue, suggestions };
    });
    return listChanged ? { ...prev, results } : prev;
  });

  // Embedded in an issue detail query
  queryClient.setQueriesData<Issue>(
    { predicate: (query) => isIssueDetailQuery(query.queryKey) },
    (prev) => {
      if (!prev) return prev;
      let changed = false;
      const suggestions = prev.suggestions.map((s) => {
        if (!isEmbeddedSuggestion(s) || !predicate(s)) return s;
        changed = true;
        return updater(s);
      });
      return changed ? { ...prev, suggestions } : prev;
    },
  );

  // Embedded in notification list pages
  queryClient.setQueriesData<PaginatedNotificationList>(
    { queryKey: getListNotificationsQueryKey() },
    (prev) => {
      if (!prev) return prev;
      let changed = false;
      const results = prev.results.map((n) => {
        if (!n.suggestion || !predicate(n.suggestion)) return n;
        changed = true;
        return { ...n, suggestion: updater(n.suggestion) };
      });
      return changed ? { ...prev, results } : prev;
    },
  );

  // Embedded in a notification detail query
  queryClient.setQueriesData<Notification>(
    { predicate: (query) => isNotificationDetailQuery(query.queryKey) },
    (prev) =>
      prev?.suggestion && predicate(prev.suggestion)
        ? { ...prev, suggestion: updater(prev.suggestion) }
        : prev,
  );
}

/**
 * Extract suggestions embedded in a query response (suggestion list/detail, or issue list/detail).
 */
function extractEmbeddedSuggestions(queryKey: QueryKey, data: unknown): Suggestion[] {
  const url = typeof queryKey[0] === "string" ? queryKey[0] : undefined;
  if (!url || !data) return [];

  if (url === listQueryKeyPrefix[0]) {
    return (data as PaginatedSuggestionList).results ?? [];
  }
  if (detailUrlPattern.test(url)) {
    return [data as Suggestion];
  }
  if (url === listIssuesUrl) {
    const issues = (data as PaginatedIssueList).results ?? [];
    return issues.flatMap((issue) => issue.suggestions.filter(isEmbeddedSuggestion));
  }
  if (issueDetailUrlPattern.test(url)) {
    return (data as Issue).suggestions.filter(isEmbeddedSuggestion);
  }
  if (url === listNotificationsUrl) {
    const notifications = (data as PaginatedNotificationList).results ?? [];
    return notifications.map((n) => n.suggestion).filter((s): s is Suggestion => s != null);
  }
  if (notificationDetailUrlPattern.test(url)) {
    const suggestion = (data as Notification).suggestion;
    return suggestion ? [suggestion] : [];
  }

  return [];
}

function isEmbeddedSuggestion(item: number | Suggestion): item is Suggestion {
  return typeof item === "object";
}

/**
 * Seeds the activity-log query cache for suggestion embedded in a successful query response, as soon as that response is cached.
 *
 * Avoids firing a redundant activity log refetches on component mount.
 */
export function syncEmbeddedActivityLogs(
  queryClient: QueryClient,
  queryKey: QueryKey,
  data: unknown,
): void {
  for (const suggestion of extractEmbeddedSuggestions(queryKey, data)) {
    if (!suggestion.activity_log) continue;
    queryClient.setQueryData(getGetSuggestionActivityLogQueryKey(suggestion.id), [
      ...suggestion.activity_log,
    ]);
  }
}
