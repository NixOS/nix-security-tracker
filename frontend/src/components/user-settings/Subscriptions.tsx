import { AutoSubscribeToggle } from "./AutoSubscribeToggle";
import { EmailNotificationsToggle } from "./EmailNotificationsToggle";
import { PackageSubscriptions } from "./PackageSubscriptions";

export function Subscriptions() {
  return (
    <div className="column gap-big">
      <p>
        When a new CVE is suspected to affect packages you have subscribed to, you will receive a
        notification.
      </p>
      <div className="column gap-small">
        <AutoSubscribeToggle />
        <EmailNotificationsToggle />
      </div>
      <hr className="divider" />
      <div className="column gap">
        <h2 className="text-l bold">Additional packages</h2>
        <PackageSubscriptions />
      </div>
    </div>
  );
}
