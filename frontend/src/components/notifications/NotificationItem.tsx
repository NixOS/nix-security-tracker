import { BellCheckIcon, BellRingIcon } from "lucide-preact";
import { useListPackageSubscriptions } from "@/api/generated/endpoints";
import type { Notification, SuggestionPackage } from "@/api/generated/models";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { useAuth } from "@/hooks/useAuth";
import { useToggleNotificationReadMutation } from "@/hooks/useNotificationMutations";
import type { SuggestionViewMode } from "@/hooks/useSuggestionViewMode";
import { formatTime } from "@/utils/date";
import {
  getMatchingMaintainedPackages,
  getMatchingSubscribedPackages,
  isNotificationObsolete,
} from "@/utils/notificationMatching";

type Props = {
  notification: Notification;
  suggestionViewMode?: SuggestionViewMode;
};

function MatchingPackages({
  title,
  packages,
  testId,
}: {
  title: string;
  packages: Record<string, SuggestionPackage>;
  testId: string;
}) {
  const entries = Object.entries(packages);
  if (entries.length === 0) return null;

  return (
    <div className="column gap-small" data-testid={testId}>
      <h3 className="bold text-l text-gray">{title}</h3>
      <ul className="row gap wrap">
        {entries.map(([attr, _]) => (
          <li key={attr}>
            <span className="bold">{attr}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotificationItem({ notification, suggestionViewMode = "collapsed" }: Props) {
  const { id, title, message, created_at, is_read, suggestion, type } = notification;

  const { user } = useAuth();
  const { data: subscriptions } = useListPackageSubscriptions();
  const toggleReadMutation = useToggleNotificationReadMutation();

  // NOTE(@florenc): Recomputed from the live suggestion + subscriptions instead of static server info to get live update as the suggestion is modified.
  const matchingMaintainedPackages = suggestion
    ? getMatchingMaintainedPackages(suggestion, user?.username)
    : notification.matching_maintained_packages;
  const matchingSubscribedPackages = suggestion
    ? getMatchingSubscribedPackages(suggestion, subscriptions?.packages)
    : notification.matching_subscribed_packages;
  const isObsolete = suggestion
    ? isNotificationObsolete(matchingMaintainedPackages, matchingSubscribedPackages)
    : notification.is_obsolete;

  const suggestionDimmed = isObsolete || is_read;

  return (
    <article
      className={`box border rounded column gap-big ${is_read ? "border-dashed" : "shadow"}`}
      data-testid={`notification-${id}`}
    >
      <header className="row gap spread centered wrap">
        <h2 className="bold text-l" data-testid={`notification-${id}-title`}>
          {title}
        </h2>
        <time dateTime={created_at}>{formatTime(created_at)}</time>
      </header>

      {type === "text" && message && <p data-testid={`notification-${id}-message`}>{message}</p>}

      {type === "suggestion" && suggestion && (
        <div className="column gap" data-testid={`notification-${id}-suggestion`}>
          <Suggestion
            suggestion={suggestion}
            dimmed={suggestionDimmed}
            inheritedViewMode={suggestionViewMode}
            allowViewModeClear
          />

          <MatchingPackages
            title="Matching packages you follow"
            packages={matchingSubscribedPackages}
            testId={`notification-${id}-matching-subscribed-packages`}
          />
          <MatchingPackages
            title="Matching packages you maintain"
            packages={matchingMaintainedPackages}
            testId={`notification-${id}-matching-maintained-packages`}
          />

          {isObsolete && (
            <details
              className="rounded box bg-yellow-light prose"
              data-testid={`notification-${id}-obsolete`}
            >
              <summary className="bold">This notification is obsolete</summary>
              <p>
                The suggestion was initially matched to packages you either follow or maintain.
                These packages were later set as irrelevant, or you unsubscribed.
              </p>
            </details>
          )}
        </div>
      )}

      <div className="row-reverse gap-small">
        <button
          type="button"
          className="btn btn-gray row gap-small centered"
          onClick={() => toggleReadMutation.mutate({ id: String(id), data: { is_read: !is_read } })}
          disabled={toggleReadMutation.isPending}
          data-testid={`notification-${id}-toggle-read`}
        >
          {is_read ? <BellRingIcon size="1em" /> : <BellCheckIcon size="1em" />}
          Mark {is_read ? "unread" : "read"}
        </button>
      </div>
    </article>
  );
}
