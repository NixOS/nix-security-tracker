import { Link } from "wouter-preact";
import { useGetNotificationsUnreadCount } from "@/api/generated/endpoints";
import { NotificationBell } from "./NotificationBell";

// Poll for new notifications while the bell is mounted (i.e. on every page)
// Paused while the tab is hidden
const POLL_INTERVAL_MS = 120_000;

export function NotificationLink() {
  const { data } = useGetNotificationsUnreadCount({ query: { refetchInterval: POLL_INTERVAL_MS } });
  const unreadCount = data?.unread_count ?? 0;

  return (
    <Link href="/ui-v2/notifications" className={`row centered text-white cursor-pointer`}>
      <NotificationBell unreadCount={unreadCount} />
    </Link>
  );
}
