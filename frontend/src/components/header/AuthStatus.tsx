import { BellIcon, KeyRoundIcon, LogInIcon, LogOutIcon } from "lucide-preact";
import { useLocation } from "wouter-preact";
import { Avatar } from "@/components/ui/Avatar";
import { Menu } from "@/components/ui/Menu";
import { Skeleton } from "@/components/ui/Skeleton";
import { LOGIN_URL, logout, useAuth } from "@/hooks/useAuth";

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
      <div className="row gap-small centered">
        <LogInIcon />
        <a href={LOGIN_URL}>Login with GitHub</a>
      </div>
    );
  }

  return (
    <Menu
      trigger={
        <div className="row box compact centered gap-small">
          <div>User settings</div>
          <Avatar avatarUrl={user.avatar_url} username={user.username} />
        </div>
      }
      label={user.username}
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
