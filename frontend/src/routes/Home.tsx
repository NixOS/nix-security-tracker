import { CircleCheckBigIcon } from "lucide-preact";

const doneFeatures = [
  "Main framework",
  "User settings: package subscriptions",
  "User settings: individual package subscription pages",
  "User settings: API token management",
  "Suggestions: individual pages (permalinks)",
  "Viewing suggestion info: references",
  "Viewing suggestion info: affected product",
  "Viewing suggestion info: packages",
  "Viewing suggestion info: maintainers",
  "Viewing suggestion info: activity log",
  "Viewing suggestion info: comments",
  "Suggestions: comment edit",
  "Suggestions: reference ignore/restore",
  "Suggestions: maintainer ignore/restore",
  "Suggestions: status change (publication excluded)",
  "Suggestion lists: pagination",
  "Suggestion lists: per status",
  "Suggestion lists: by package",
  "Suggestion lists: draft issue",
  "Suggestion lists: compact view",
  "Suggestion lists: collapsed view",
  "Suggestion lists: tabs view",
  "Suggestion lists: list and per-suggestion override view modes",
  "Suggestion lists: visual feedback for 'out of search critera' suggestions",
  "Published issues list",
  "Published issues individual page",
  "Navigation bar",
];

const pendingFeatures = [
  "Suggestions: maintainer add/delete",
  "Notification center",
  "Notification pill (in navbar)",
  "Suggestion lists: optimized batch activity log queries",
  "Suggestions: publication and batch publication",
  "Suggestions: section icons (like in tab view)",
  "Homepage",
  "Help messages (tooltip info about statuses, view modes)",
];

function DoneItem({ label }: { label: string }) {
  return (
    <li className="rounded box compact row gap-small centered bg-green-light">
      <CircleCheckBigIcon size="1em" />
      {label}
    </li>
  );
}

function PendingItem({ label }: { label: string }) {
  return <li className="rounded box compact">{label}</li>;
}

export function Home() {
  return (
    <div className="column gap-big">
      <h1 className="text-xl bold">Nixpkgs security tracker</h1>
      <p>
        New UI under construction. Features are gradually ported and improved from the legacy UI.
        You may continue to use the <a href="/">legacy UI</a>.
      </p>
      <div className="column gap">
        <h2 className="text-l bold">Features</h2>
        <ul className="column gap-small">
          {doneFeatures.map((label) => (
            <DoneItem key={label} label={label} />
          ))}
          {pendingFeatures.map((label) => (
            <PendingItem key={label} label={label} />
          ))}
        </ul>
      </div>
    </div>
  );
}
