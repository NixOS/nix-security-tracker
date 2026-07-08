import { BellIcon, KeyRoundIcon } from "lucide-preact";
import { useLocation } from "wouter-preact";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { ApiToken } from "@/components/user-settings/ApiToken";
import { Subscriptions } from "@/components/user-settings/Subscriptions";
import { useAuth } from "@/hooks/useAuth";

type TabValue = "subscriptions" | "tokens";

function getTabFromLocation(location: string): TabValue {
  return location.endsWith("/tokens") ? "tokens" : "subscriptions";
}

export function UserSettings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const activeTab = getTabFromLocation(location);

  return (
    <div className="column gap">
      {isLoading ? (
        <>
          <div className="row gap centered">
            <Skeleton shape="circle" width="3.5em" height="3.5em" />
            <div className="column gap-small">
              <div className="bold uppercase">User settings</div>
              <Skeleton shape="rect" width="10em" height="2em" />
            </div>
          </div>
          <div className="column gap">
            <Skeleton shape="rect" width="100%" height="3em" />
            <Skeleton shape="rect" width="100%" height="20em" />
          </div>
        </>
      ) : isAuthenticated && user ? (
        <>
          <div className="row gap centered">
            <Avatar avatarUrl={user.avatar_url} username={user.username} size="3.5em" />
            <div className="column">
              <div className="bold uppercase">User settings</div>
              <h1 className="text-xl bold">{user.username}</h1>
            </div>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setLocation(`/ui-v2/user/${value}`)}
            lazyMount
            tabs={[
              {
                value: "subscriptions",
                label: "Subscriptions",
                icon: <BellIcon size="1em" />,
                content: <Subscriptions />,
              },
              {
                value: "tokens",
                label: "API Tokens",
                icon: <KeyRoundIcon size="1em" />,
                content: <ApiToken />,
              },
            ]}
          />
        </>
      ) : (
        <p className="rounded box bg-red text-white">You are not authenticated</p>
      )}
    </div>
  );
}
