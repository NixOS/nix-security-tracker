import { BellIcon, KeyRoundIcon, LogInIcon, LogOutIcon } from "lucide-preact";
import { useLocation } from "wouter-preact";
import { Avatar } from "@/components/ui/Avatar";
import { Menu } from "@/components/ui/Menu";
import { Skeleton } from "@/components/ui/Skeleton";
import { login, logout, useAuth } from "@/hooks/useAuth";
import styles from "./AuthStatus.module.css";

export function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="row box compact centered gap-small">
        <Skeleton width="6em" height="1em" />
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
        Login with GitHub
      </button>
    );
  }

  return (
    <Menu
      trigger={
        <button
          className={`row centered gap-small cursor-pointer text-white ${styles.menuTrigger}`}
          type="button"
        >
          <div>User settings</div>
          <div className={`circle ${styles.avatar}`}>
            <Avatar size="2em" avatarUrl={user.avatar_url} username={user.username} />
          </div>
        </button>
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
  );
}
