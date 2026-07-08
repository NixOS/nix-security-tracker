import { CircleCheckBigIcon } from "lucide-preact";

const doneFeatures = [
  "Main framework",
  "User settings: package subscriptions",
  "User settings: individual package subscription pages",
  "User settings: API token management",
];

const pendingFeatures = [
  "Suggestions: individual pages (permalinks)",
  "Viewing suggestion info: references",
  "Viewing suggestion info: affected product",
  "Viewing suggestion info: packages",
  "Viewing suggestion info: maintainers",
  "Viewing suggestion info: activity log",
  "Suggestions: package ignore/restore",
  "Suggestions: maintainer ignore/restore",
  "Suggestions: maintainer add/delete",
  "Suggestions: reference ignore/restore",
  "Suggestions: comment edit",
  "Suggestions: status change",
  "Notification center",
  "Notification pill (in navbar)",
  "Notification polling",
  "Suggestion lists: pagination / infinite scroll",
  "Suggestion lists: compact view",
  "Suggestion lists: per status",
  "Suggestion lists: by package",
  "Suggestion lists: draft issue",
  "Navigation bar",
  "Published issues list",
  "Published issues individual page",
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
