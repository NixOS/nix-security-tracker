/**
 * The unread notification count is cached in two places:
 * - every cached paginated list page (`unread_count` field, convenient for the notification center page itself)
 * - the dedicated `getGetNotificationsUnreadCountQueryKey` query (source of truth for the header bell badge, which is mounted on every page regardless of which list page is loaded)
 * These helpers keep both in sync after mutations, and provide list-page snapshot/rollback for optimistic updates.
 */
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  getGetNotificationsUnreadCountQueryKey,
  getListNotificationsQueryKey,
} from "@/api/generated/endpoints";
import type {
  Notification,
  NotificationUnreadCount,
  PaginatedNotificationList,
} from "@/api/generated/models";

const listUrl = getListNotificationsQueryKey()[0];

function isNotificationListQueryKey(queryKey: QueryKey): boolean {
  return queryKey[0] === listUrl;
}

export type NotificationListSnapshot = Array<[QueryKey, PaginatedNotificationList | undefined]>;

/** Snapshot every cached notification list page, for rollback on mutation error. */
export function snapshotNotificationLists(queryClient: QueryClient): NotificationListSnapshot {
  return queryClient.getQueriesData<PaginatedNotificationList>({
    predicate: (query) => isNotificationListQueryKey(query.queryKey),
  });
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
  await queryClient.cancelQueries({
    predicate: (query) => isNotificationListQueryKey(query.queryKey),
  });
}

/** Patches a single notification wherever it's cached across list pages. */
export function setCachedNotification(
  queryClient: QueryClient,
  id: number,
  updater: (prev: Notification) => Notification,
): void {
  queryClient.setQueriesData<PaginatedNotificationList>(
    { predicate: (query) => isNotificationListQueryKey(query.queryKey) },
    (prev) => {
      if (!prev) return prev;
      let changed = false;
      const results = prev.results.map((n) => {
        if (n.id !== id) return n;
        changed = true;
        return updater(n);
      });
      return changed ? { ...prev, results } : prev;
    },
  );
}

/** Adjusts the unread count everywhere it's cached (dedicated badge endpoint + every list page). */
export function adjustCachedUnreadCount(queryClient: QueryClient, delta: number): void {
  queryClient.setQueriesData<NotificationUnreadCount>(
    { queryKey: getGetNotificationsUnreadCountQueryKey() },
    (prev) => (prev ? { ...prev, unread_count: Math.max(0, prev.unread_count + delta) } : prev),
  );
  queryClient.setQueriesData<PaginatedNotificationList>(
    { predicate: (query) => isNotificationListQueryKey(query.queryKey) },
    (prev) => (prev ? { ...prev, unread_count: Math.max(0, prev.unread_count + delta) } : prev),
  );
}

/** Marks every cached notification read and zeroes the unread count everywhere it's cached. */
export function markAllCachedNotificationsRead(queryClient: QueryClient): void {
  queryClient.setQueriesData<PaginatedNotificationList>(
    { predicate: (query) => isNotificationListQueryKey(query.queryKey) },
    (prev) =>
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
