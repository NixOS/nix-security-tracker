import { FormatRelativeTime } from "@ark-ui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  InboxIcon,
  LinkIcon,
  PackageMinusIcon,
  PackagePlusIcon,
  Trash2Icon,
  UnlinkIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-preact";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { useGetSuggestionActivityLog } from "@/api/generated/endpoints";
import { type ActivityLogEntry, SuggestionStatusEnum } from "@/api/generated/models";
import { Collapsible } from "@/components/ui/Collapsible";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useTick } from "@/hooks/useTick";
import { formatTime } from "@/utils/date";
import styles from "./ActivityLog.module.css";
import { SuggestionStatusIcon } from "./SuggestionStatusIcon";

// Re-render frequency for relative-time displays updates
const TICK_INTERVAL_MS = 10_000;
// Time during which a recent update is shown as "just now"
const JUST_NOW_MS = 5_000;

type Props = {
  suggestionId: number;
  open: boolean;
  onToggle: () => void;
};

type ObjectItem = { key: string; node: ComponentChildren };

type ActionCategory =
  | { kind: "create" }
  | { kind: "package"; restored: boolean }
  | { kind: "reference"; restored: boolean }
  | { kind: "maintainer"; op: "add" | "ignore" | "delete" | "restore" }
  | { kind: "status"; value: SuggestionStatusEnum | null };

function classifyAction(entry: ActivityLogEntry): ActionCategory {
  if (entry.action === "create") return { kind: "create" };
  if (entry.action.startsWith("package.")) {
    return { kind: "package", restored: entry.action.includes("restore") };
  }
  if (entry.action.startsWith("reference.")) {
    return { kind: "reference", restored: entry.action.includes("restore") };
  }
  if (entry.action.startsWith("maintainer.")) {
    const op = entry.action.includes("add")
      ? "add"
      : entry.action.includes("ignore")
        ? "ignore"
        : entry.action.includes("delete")
          ? "delete"
          : "restore";
    return { kind: "maintainer", op };
  }
  const sv = entry.status_value ?? "";
  const statusValues = Object.values(SuggestionStatusEnum) as readonly SuggestionStatusEnum[];
  return {
    kind: "status",
    value: statusValues.includes(sv as SuggestionStatusEnum) ? (sv as SuggestionStatusEnum) : null,
  };
}

function entryIcon(entry: ActivityLogEntry) {
  const size = "1em";
  const category = classifyAction(entry);
  switch (category.kind) {
    case "create":
      return entry.rejection_reason ? <Trash2Icon size={size} /> : <InboxIcon size={size} />;
    case "package":
      return category.restored ? <PackagePlusIcon size={size} /> : <PackageMinusIcon size={size} />;
    case "reference":
      return category.restored ? <LinkIcon size={size} /> : <UnlinkIcon size={size} />;
    case "maintainer":
      return category.op === "add" ? <UserPlusIcon size={size} /> : <UserMinusIcon size={size} />;
    case "status":
      return category.value ? <SuggestionStatusIcon status={category.value} size="1em" /> : null;
  }
}

// Name of the action, for the "action name" table column.
function actionName(entry: ActivityLogEntry): string {
  const category = classifyAction(entry);
  switch (category.kind) {
    case "create":
      return entry.rejection_reason ? "created & dismissed" : "created suggestion";
    case "package":
      return category.restored ? "restored package" : "ignored package";
    case "reference":
      return category.restored ? "restored reference" : "ignored reference";
    case "maintainer":
      if (category.op === "add") return "added maintainer";
      if (category.op === "ignore") return "ignored maintainer";
      if (category.op === "delete") return "deleted maintainer";
      return "restored maintainer";
    case "status": {
      const sv = entry.status_value ?? "";
      if (sv.includes("accepted")) return "accepted";
      if (sv.includes("rejected")) return "dismissed";
      if (sv.includes("pending")) return "marked untriaged";
      if (sv.includes("published")) return "published";
      return entry.action;
    }
  }
}

// Items batched into a single entry (e.g. several packages ignored at once), along with the kind label used to describe them (e.g. "packages").
// null means the entry doesn't carry a list of objects.
function entryObjectGroup(entry: ActivityLogEntry): { kind: string; items: ObjectItem[] } | null {
  if (entry.package_names && entry.package_names.length > 0) {
    return {
      kind: "packages",
      items: entry.package_names.map((name) => ({ key: name, node: <span>{name}</span> })),
    };
  }
  if (entry.references && entry.references.length > 0) {
    return {
      kind: "references",
      items: entry.references.map((r) => ({
        key: r.url,
        node: <ExternalLink href={r.url}>{r.name || r.url}</ExternalLink>,
      })),
    };
  }
  if (entry.maintainers && entry.maintainers.length > 0) {
    return {
      kind: "maintainers",
      items: entry.maintainers.map((m) => ({
        key: String(m.github_id),
        node: <span>@{m.github}</span>,
      })),
    };
  }
  return null;
}

// Single, non-batched object of the action (e.g. a rejection reason), for entries that don't carry a list of objects.
function entryObject(entry: ActivityLogEntry): ComponentChildren {
  if (entry.action === "create") {
    return entry.rejection_reason ?? null;
  }
  const sv = entry.status_value ?? "";
  if (sv.includes("rejected")) return entry.rejection_reason ?? null;
  return null;
}

function Timestamp({ iso, short = false }: { iso: string; short?: boolean }) {
  const date = new Date(iso);
  const msAgo = Date.now() - date.getTime();

  return (
    <time datetime={iso} title={formatTime(iso)}>
      {msAgo < JUST_NOW_MS ? (
        "just now"
      ) : msAgo < 60_000 ? (
        short ? (
          "last min."
        ) : (
          "last minute"
        )
      ) : (
        <FormatRelativeTime value={date} style={short ? "short" : "long"} />
      )}
    </time>
  );
}

function EntryRow({ entry }: { entry: ActivityLogEntry }) {
  const group = entryObjectGroup(entry);
  const items = group?.items ?? null;
  const expandable = !!items && items.length > 1;
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    if (expandable) setExpanded((v) => !v);
  }

  const objectCell = items ? (
    items.length > 1 ? (
      <span className="row gap-small centered">
        {expanded ? <ChevronDownIcon size="1em" /> : <ChevronRightIcon size="1em" />}
        {items.length} {group?.kind}
      </span>
    ) : (
      items[0].node
    )
  ) : (
    entryObject(entry)
  );

  return (
    <>
      <tr
        className={expandable ? `${styles.entryRow} ${styles.expandable}` : styles.entryRow}
        onClick={expandable ? toggle : undefined}
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? expanded : undefined}
        onKeyDown={
          expandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
      >
        <td>
          <Timestamp iso={entry.timestamp} short />
        </td>
        <td>
          {entry.username ? <strong>@{entry.username}</strong> : <span>security tracker</span>}
        </td>
        <td>{entryIcon(entry)}</td>
        <td>{actionName(entry)}</td>
        <td>{objectCell}</td>
      </tr>
      {expandable &&
        expanded &&
        items?.map((item) => (
          <tr key={item.key} className={styles.objectRow}>
            <td />
            <td />
            <td />
            <td />
            <td>{item.node}</td>
          </tr>
        ))}
    </>
  );
}

/** Compact single-line reminder of the last activity log event, used to toggle the full panel. */
export function ActivityLogToggle({ suggestionId, open, onToggle }: Props) {
  const { data, isLoading, isFetching } = useGetSuggestionActivityLog(suggestionId, undefined, {
    query: {
      // No automatic refetches unless specifically invalidated (e.g. after suggestion mutation).
      staleTime: Infinity,
    },
  });

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
    <button
      type="button"
      className={`row gap-small align-end cursor-pointer ${styles.reminder} ${open ? styles.reminderOpen : ""}`}
      onClick={onToggle}
      aria-expanded={open}
      data-testid={`suggestion-${suggestionId}-activity-log-toggle`}
    >
      {open ? <ChevronDownIcon size="1em" /> : <ChevronRightIcon size="1em" />}
      {isFetching && <Spinner />}
      {open ? (
        <span>Activity log</span>
      ) : (
        <>
          <span>
            {summaryVerb} <Timestamp iso={last.timestamp} />
          </span>
          {last.username && (
            <>
              by&nbsp;<strong>@{last.username}</strong>
            </>
          )}
        </>
      )}
    </button>
  );
}

/** Full-width, collapsible activity log table. */
export function ActivityLogPanel({ suggestionId, open }: Omit<Props, "onToggle">) {
  const { data } = useGetSuggestionActivityLog(suggestionId, undefined, {
    query: {
      staleTime: Infinity,
    },
  });

  if (!data || data.length === 0) return null;

  // Most recent event first.
  const entries = [...data].reverse();

  return (
    <Collapsible open={open}>
      <div
        className={`${styles.container} ${open ? styles.containerOpen : ""}`}
        data-testid={`suggestion-${suggestionId}-activity-log`}
      >
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colTime} />
            <col className={styles.colAuthor} />
            <col className={styles.colIcon} />
            <col className={styles.colAction} />
            <col className={styles.colObject} />
          </colgroup>
          <tbody>
            {entries.map((entry, i) => (
              <EntryRow key={i} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </Collapsible>
  );
}
