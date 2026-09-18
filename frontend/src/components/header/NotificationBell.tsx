import { BellIcon, BellRingIcon } from "lucide-preact";
import styles from "./NotificationBell.module.css";

type NotificationBellProps = {
  unreadCount: number;
};

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  return (
    <div className="contents" data-testid="notification-bell">
      {unreadCount > 0 ? (
        // The key forces re-rendering when the count changes, so the bell rings again (animation)
        <div className={styles.bell}>
          <BellRingIcon
            key={unreadCount}
            size="1.5em"
            className={styles.ringing}
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
          />
          <span
            className={`circle bg-red text-white bold ${styles.badge}`}
            data-testid="notification-bell-count"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </div>
      ) : (
        <BellIcon size="1.5em" />
      )}
    </div>
  );
}
