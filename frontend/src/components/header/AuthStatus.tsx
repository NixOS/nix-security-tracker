import { BellIcon, KeyRoundIcon, LogInIcon, LogOutIcon, SettingsIcon } from "lucide-preact";
import { useLocation } from "wouter-preact";
import { Avatar } from "@/components/ui/Avatar";
import { Menu } from "@/components/ui/Menu";
import { Skeleton } from "@/components/ui/Skeleton";
import { login, logout, useAuth } from "@/hooks/useAuth";
import styles from "./AuthStatus.module.css";
import { NotificationLink } from "./NotificationLink";

export function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="row box compact centered gap-small">
        <Skeleton shape="circle" width="2em" height="2em" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        className="row gap-small centered text-white cursor-pointer"
        onClick={login}
      >
        <LogInIcon />
        <span className="hide-below-breakpoint">Login with GitHub</span>
      </button>
    );
  }

  return (
    <div className="row gap centered">
      <NotificationLink />
      <Menu
        trigger={
          <div className={`row centered gap-small cursor-pointer text-white ${styles.menuTrigger}`}>
            <div className={`circle ${styles.avatar}`}>
              <Avatar size="2em" avatarUrl={user.avatar_url} username={user.username} />
            </div>
            <SettingsIcon className={`bg-black text-white circle ${styles.settingsBadge}`} />
          </div>
        }
        items={[
          {
            value: "subscriptions",
            label: "Subscriptions",
            icon: <BellIcon size="1em" />,
            onSelect: () => setLocation("/ui-v2/user/subscriptions"),
          },
          {
            value: "tokens",
            label: "API Tokens",
            icon: <KeyRoundIcon size="1em" />,
            onSelect: () => setLocation("/ui-v2/user/tokens"),
          },
          { type: "separator" },
          {
            value: "logout",
            label: "Logout",
            icon: <LogOutIcon size="1em" />,
            onSelect: logout,
          },
        ]}
      />
    </div>
  );
}
