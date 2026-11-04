/**
 * The unread notification count is cached in two places:
 * - every cached paginated list page (`unread_count` field, convenient for the notification center page itself)
 * - the dedicated `getGetNotificationsUnreadCountQueryKey` query (source of truth for the header bell badge, which is mounted on every page regardless of which list page is loaded)
 * These helpers keep both in sync after mutations, and provide list-page snapshot/rollback for optimistic updates.
 */
import type { QueryClient, QueryFilters, QueryKey } from "@tanstack/react-query";
import {
  getGetNotificationsUnreadCountQueryKey,
  getListNotificationsQueryKey,
} from "@/api/generated/endpoints";
import type {
  Notification,
  NotificationUnreadCount,
  PaginatedNotificationList,
} from "@/api/generated/models";
import { mapPreservingIdentity } from "@/utils/array";

const listUrl = getListNotificationsQueryKey()[0];

// Matches every cached notification list page, whatever its query params.
const listFilter: QueryFilters = { predicate: (query) => query.queryKey[0] === listUrl };

export type NotificationListSnapshot = Array<[QueryKey, PaginatedNotificationList | undefined]>;

/** Snapshot every cached notification list page, for rollback on mutation error. */
export function snapshotNotificationLists(queryClient: QueryClient): NotificationListSnapshot {
  return queryClient.getQueriesData<PaginatedNotificationList>(listFilter);
}

export function restoreNotificationLists(
  queryClient: QueryClient,
  snapshot: NotificationListSnapshot,
): void {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}

export async function cancelNotificationListQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries(listFilter);
}

/** Patches a single notification wherever it's cached across list pages. */
export function setCachedNotification(
  queryClient: QueryClient,
  id: number,
  updater: (prev: Notification) => Notification,
): void {
  queryClient.setQueriesData<PaginatedNotificationList>(listFilter, (prev) => {
    if (!prev) return prev;
    const results = mapPreservingIdentity(prev.results, (n) => (n.id === id ? updater(n) : n));
    return results === prev.results ? prev : { ...prev, results };
  });
}

/** Adjusts the unread count everywhere it's cached (dedicated badge endpoint + every list page). */
export function adjustCachedUnreadCount(queryClient: QueryClient, delta: number): void {
  queryClient.setQueriesData<NotificationUnreadCount>(
    { queryKey: getGetNotificationsUnreadCountQueryKey() },
    (prev) => (prev ? { ...prev, unread_count: Math.max(0, prev.unread_count + delta) } : prev),
  );
  queryClient.setQueriesData<PaginatedNotificationList>(listFilter, (prev) =>
    prev ? { ...prev, unread_count: Math.max(0, prev.unread_count + delta) } : prev,
  );
}

/** Marks every cached notification read and zeroes the unread count everywhere it's cached. */
export function markAllCachedNotificationsRead(queryClient: QueryClient): void {
  queryClient.setQueriesData<PaginatedNotificationList>(listFilter, (prev) =>
    prev
      ? {
          ...prev,
          unread_count: 0,
          results: prev.results.map((n) => ({ ...n, is_read: true })),
        }
      : prev,
  );
  queryClient.setQueriesData<NotificationUnreadCount>(
    { queryKey: getGetNotificationsUnreadCountQueryKey() },
    (prev) => (prev ? { ...prev, unread_count: 0 } : prev),
  );
}
