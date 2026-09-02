import { BellCheckIcon, BellMinusIcon, EyeIcon } from "lucide-preact";
import { useSearchParams } from "wouter-preact";
import { useListNotifications } from "@/api/generated/endpoints";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useClearReadNotificationsMutation,
  useMarkAllNotificationsReadMutation,
} from "@/hooks/useNotificationMutations";
import { useSuggestionListViewMode } from "@/hooks/useSuggestionViewMode";
import { getApiErrorMessage } from "@/utils/apiError";

// Must match the page size in `src/api/notifications/views.py`.
const PAGE_SIZE = 10;

function parsePage(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("page"));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

export function NotificationCenter() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams);
  const { viewMode: suggestionViewMode, setViewMode: setSuggestionViewMode } =
    useSuggestionListViewMode("collapsed");

  // We inline the suggestions and their activity logs in the response
  const { data, isLoading, isError, error } = useListNotifications(
    { page, expand: "suggestion", activity_log: true },
    { query: { enabled: isAuthenticated } },
  );

  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const clearReadMutation = useClearReadNotificationsMutation();

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
    window.scrollTo({ top: 0 });
  };

  const handleClearRead = () => {
    if (window.confirm("Delete all of your read notifications? This cannot be undone.")) {
      // Always go back to page 1: the list may have shrunk and the current page might no longer exist
      clearReadMutation.mutate(undefined, { onSuccess: () => handlePageChange(1) });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="column gap full-width">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} width="100%" height="6em" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <p className="rounded box bg-red text-white">You are not authenticated</p>;
  }

  return (
    <div className="column gap-big centered">
      <div className="row gap spread centered full-width wrap">
        <h1 className="text-xl bold">Notifications</h1>
        <div className="row gap-small">
          <button
            type="button"
            className="btn btn-gray row gap-small centered"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || isLoading || !data}
            data-testid="notifications-mark-all-read"
          >
            <BellCheckIcon size="1em" />
            Mark all as read
          </button>
          <button
            type="button"
            className="btn btn-red row gap-small centered"
            onClick={handleClearRead}
            disabled={clearReadMutation.isPending}
            data-testid="notifications-clear-read"
          >
            <BellMinusIcon size="1em" />
            Clear read
          </button>
        </div>
      </div>

      <div className="row gap centered justify-right full-width">
        <div className="row gap-small centered">
          <EyeIcon size="1em" />
          <span>Suggestions view mode</span>
        </div>
        <SuggestionViewToggle
          value={suggestionViewMode}
          onChange={(mode) => mode && setSuggestionViewMode(mode)}
          testId="suggestion-view-toggle"
        />
      </div>

      {isLoading && (
        <div className="column gap full-width">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} width="100%" height="6em" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded box bg-red-light">
          Failed to load notifications: {getApiErrorMessage(error)}
        </p>
      )}

      {data && (
        <>
          {data.results.length === 0 ? (
            <p>You don't have any notifications yet.</p>
          ) : (
            <div className="column gap-big stretched full-width">
              {data.results.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  suggestionViewMode={suggestionViewMode}
                />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            count={data.count}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
