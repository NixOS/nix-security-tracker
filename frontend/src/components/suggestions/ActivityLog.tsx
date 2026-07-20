import { FormatRelativeTime } from "@ark-ui/react";
import {
  FolderMinusIcon,
  FolderPlusIcon,
  InboxIcon,
  Link2Icon,
  Link2OffIcon,
  Trash2Icon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-preact";
import { useGetSuggestionActivityLog } from "@/api/generated/endpoints";
import { type ActivityLogEntry, StatusEnum } from "@/api/generated/models";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useTick } from "@/hooks/useTick";
import { formatTime } from "@/utils/date";
import { SuggestionStatusIcon } from "./SuggestionStatusIcon";

// Re-render frequency for relative-time displays updates
const TICK_INTERVAL_MS = 10_000;
// Time during which a recent update is shown as "just now"
const JUST_NOW_MS = 5_000;

type Props = {
  suggestionId: number;
};

function entryIcon(entry: ActivityLogEntry) {
  const size = "1em";
  if (entry.action === "create") {
    return entry.rejection_reason ? <Trash2Icon size={size} /> : <InboxIcon size={size} />;
  }
  if (entry.action.startsWith("package.")) {
    return entry.action.includes("restore") ? (
      <FolderPlusIcon size={size} />
    ) : (
      <FolderMinusIcon size={size} />
    );
  }
  if (entry.action.startsWith("reference.")) {
    return entry.action.includes("restore") ? (
      <Link2Icon size={size} />
    ) : (
      <Link2OffIcon size={size} />
    );
  }
  if (entry.action.startsWith("maintainer.")) {
    return entry.action.includes("add") ? (
      <UserPlusIcon size={size} />
    ) : (
      <UserMinusIcon size={size} />
    );
  }
  // Status events
  const sv = entry.status_value ?? "";
  const statusValues = Object.values(StatusEnum) as readonly StatusEnum[];
  if (statusValues.includes(sv as StatusEnum)) {
    return <SuggestionStatusIcon status={sv as StatusEnum} size="1em" />;
  }
  return null;
}

function entryDescription(entry: ActivityLogEntry) {
  if (entry.action === "create") {
    if (entry.rejection_reason) {
      return `Created & dismissed (${entry.rejection_reason}) suggestion`;
    }
    return "Created suggestion";
  }

  if (entry.action.startsWith("package.")) {
    const verb = entry.action.includes("restore") ? "restored" : "ignored";
    const names = entry.package_names ?? [];
    if (names.length === 1) {
      return (
        <span>
          {verb} package <strong>{names[0]}</strong>
        </span>
      );
    }
    return (
      <details>
        <summary>
          {verb} {names.length} packages
        </summary>
        <ul className="column">
          {names.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </details>
    );
  }

  if (entry.action.startsWith("reference.")) {
    const verb = entry.action.includes("restore") ? "restored" : "ignored";
    const refs = entry.references ?? [];
    if (refs.length === 1) {
      return (
        <span>
          {verb} reference{" "}
          <a href={refs[0].url} target="_blank" rel="noreferrer">
            {refs[0].name || refs[0].url.slice(0, 40)}
          </a>
        </span>
      );
    }
    return (
      <details>
        <summary>
          {verb} {refs.length} references
        </summary>
        <ul className="column">
          {refs.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.name || r.url}
              </a>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  if (entry.action.startsWith("maintainer.")) {
    const verb = entry.action.includes("add")
      ? "added"
      : entry.action.includes("ignore")
        ? "ignored"
        : entry.action.includes("delete")
          ? "deleted"
          : "restored";
    const ms = entry.maintainers ?? [];
    if (ms.length === 1) {
      return (
        <span>
          {verb} maintainer <strong>@{ms[0].github}</strong>
        </span>
      );
    }
    return (
      <details>
        <summary>
          {verb} {ms.length} maintainers
        </summary>
        <ul className="column">
          {ms.map((m) => (
            <li key={m.github_id}>@{m.github}</li>
          ))}
        </ul>
      </details>
    );
  }

  // Status change
  const sv = entry.status_value ?? "";
  if (sv.includes("accepted")) return <span>accepted</span>;
  if (sv.includes("rejected")) {
    return <span>dismissed{entry.rejection_reason ? ` (${entry.rejection_reason})` : ""}</span>;
  }
  if (sv.includes("pending")) return <span>marked as untriaged</span>;
  if (sv.includes("published")) return <span>published on GitHub</span>;
  return <span>{entry.action}</span>;
}

function Timestamp({ iso }: { iso: string }) {
  const date = new Date(iso);
  const msAgo = Date.now() - date.getTime();

  return (
    <time datetime={iso} title={formatTime(iso)}>
      {msAgo < JUST_NOW_MS ? (
        "just now"
      ) : msAgo < 60_000 ? (
        "less than a minute ago"
      ) : (
        <FormatRelativeTime value={date} />
      )}
    </time>
  );
}

export function ActivityLog({ suggestionId }: Props) {
  const { data, isLoading, isFetching } = useGetSuggestionActivityLog(suggestionId);
  // Single shared tick driving re-renders for every Timestamp in this log,
  // instead of each Timestamp instance running its own interval.
  useTick(TICK_INTERVAL_MS);

  if (isLoading) {
    return <Skeleton width="12em" height="1.2em" />;
  }

  if (!data || data.length === 0) return null;

  const last = data[data.length - 1];
  const summaryVerb = last.action === "create" ? "created" : "updated";

  return (
    <details
      className="column gap-small align-end"
      data-testid={`suggestion-${suggestionId}-activity-log`}
    >
      <summary>
        <span className="details-closed inline-row gap-small baseline">
          {isFetching && <Spinner />}
          <span>
            {summaryVerb} <Timestamp iso={last.timestamp} />
          </span>
          {last.username && (
            <>
              by&nbsp;<strong>@{last.username}</strong>
            </>
          )}
        </span>
        <strong className="details-open">Activity log</strong>
      </summary>
      <ul className="column align-end">
        {data.map((entry, i) => (
          <li key={i} className="row gap-small baseline">
            {entry.username && <strong>@{entry.username}</strong>}
            {entryDescription(entry)}
            <Timestamp iso={entry.timestamp} />
            {entryIcon(entry)}
          </li>
        ))}
      </ul>
    </details>
  );
}
