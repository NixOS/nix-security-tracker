import { useQueryClient } from "@tanstack/react-query";
import {
  getGetNotificationsUnreadCountQueryKey,
  getListNotificationsQueryKey,
  useClearReadNotifications,
  useMarkAllNotificationsRead,
  useUpdateNotification,
} from "@/api/generated/endpoints";
import type { PatchedNotificationUpdate } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  adjustCachedUnreadCount,
  cancelNotificationListQueries,
  markAllCachedNotificationsRead,
  type NotificationListSnapshot,
  restoreNotificationLists,
  setCachedNotification,
  snapshotNotificationLists,
} from "@/utils/notificationCache";
import { toaster } from "@/utils/toaster";

type MutationContext = { snapshot: NotificationListSnapshot };

/** Marks a single notification read or unread. */
export function useToggleNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useUpdateNotification({
    mutation: {
      onMutate: async ({
        id,
        data,
      }: {
        id: string;
        data: PatchedNotificationUpdate;
      }): Promise<MutationContext> => {
        await cancelNotificationListQueries(queryClient);
        const snapshot = snapshotNotificationLists(queryClient);
        const isRead = data.is_read ?? true;

        setCachedNotification(queryClient, Number(id), (n) => ({ ...n, is_read: isRead }));
        adjustCachedUnreadCount(queryClient, isRead ? -1 : 1);

        return { snapshot };
      },
      onError: (err: unknown, _vars, context?: MutationContext) => {
        if (context?.snapshot) restoreNotificationLists(queryClient, context.snapshot);
        queryClient.invalidateQueries({ queryKey: getGetNotificationsUnreadCountQueryKey() });
        toaster.error({
          title: "Failed to update notification",
          description: getApiErrorMessage(err),
        });
      },
    },
  });
}

/** Marks every notification of the authenticated user as read. */
export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMarkAllNotificationsRead({
    mutation: {
      onMutate: async (): Promise<MutationContext> => {
        await cancelNotificationListQueries(queryClient);
        const snapshot = snapshotNotificationLists(queryClient);

        markAllCachedNotificationsRead(queryClient);

        return { snapshot };
      },
      onError: (err: unknown, _vars, context?: MutationContext) => {
        if (context?.snapshot) restoreNotificationLists(queryClient, context.snapshot);
        queryClient.invalidateQueries({ queryKey: getGetNotificationsUnreadCountQueryKey() });
        toaster.error({
          title: "Failed to mark all notifications as read",
          description: getApiErrorMessage(err),
        });
      },
    },
  });
}

/**
 * Deletes every read notification of the authenticated user.
 *
 * Unlike the other mutations, this doesn't optimistically patch cached list pages.
 * Pagination must be redone and new notifications fetched to fill the gaps.
 * We invalidate the query and send back to page 1.
 */
export function useClearReadNotificationsMutation() {
  const queryClient = useQueryClient();

  return useClearReadNotifications({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
      onError: (err: unknown) => {
        toaster.error({
          title: "Failed to clear read notifications",
          description: getApiErrorMessage(err),
        });
      },
    },
  });
}
