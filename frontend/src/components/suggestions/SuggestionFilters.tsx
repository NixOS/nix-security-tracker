import { LayersIcon, PackageIcon } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import type { ListSuggestionsStatusItem } from "@/api/generated/models";
import { ListSuggestionsStatusItem as Status } from "@/api/generated/models";
import { ToggleGroup, type ToggleGroupOption } from "@/components/ui/ToggleGroup";
import type { SuggestionListFilters } from "@/hooks/useSuggestionListFilters";
import { statusLabel } from "./SuggestionStatus";
import { SuggestionStatusIcon } from "./SuggestionStatusIcon";

const STATUS_OPTIONS: ToggleGroupOption[] = [
  Status.rejected,
  Status.pending,
  Status.accepted,
  Status.published,
].map((status) => ({
  value: status,
  label: (
    <span className="row gap-small centered">
      <SuggestionStatusIcon status={status} size="1em" />
      {statusLabel(status)}
    </span>
  ),
}));

// "in issue draft" is a flag, not status, but presented as an extra toggle alongside
const ISSUE_DRAFT_VALUE = "issue_draft";

// NOTE(@florentc): ugly hardcoded insertion in 4rth position so that "Issue draft" appears before "Published"
const TOGGLE_OPTIONS: ToggleGroupOption[] = [
  ...STATUS_OPTIONS.slice(0, 3),
  {
    value: ISSUE_DRAFT_VALUE,
    label: (
      <span className="row gap-small centered">
        <LayersIcon size="1em" />
        Issue draft
      </span>
    ),
  },
  STATUS_OPTIONS[3],
];

const DEBOUNCE_PACKAGE_MS = 500;

type Props = {
  filters: SuggestionListFilters;
  setStatuses: (statuses: ListSuggestionsStatusItem[]) => void;
  setInIssueDraft: (inIssueDraft: boolean) => void;
  setPackageFilter: (packageFilter: string) => void;
};

/**
 * Determine the next toggle selection after a click:
 * - Shift/Ctrl/Meta+click adds/removes `clicked` from the current multi-selection.
 * - Single click solo-selects or clears
 */
function nextToggleSelection(current: string[], clicked: string, event: MouseEvent): string[] {
  const additive = event.shiftKey || event.ctrlKey || event.metaKey;

  if (additive) {
    return current.includes(clicked) ? current.filter((s) => s !== clicked) : [...current, clicked];
  }

  const isOnlySelected = current.length === 1 && current[0] === clicked;
  return isOnlySelected ? [] : [clicked];
}

function PackageFilterInput({
  packageFilter,
  setPackageFilter,
}: {
  packageFilter: string;
  setPackageFilter: (value: string) => void;
}) {
  const [local, setLocal] = useState(packageFilter);

  // Re-sync from the URL (e.g. back/forward navigation, external link).
  useEffect(() => setLocal(packageFilter), [packageFilter]);

  useEffect(() => {
    if (local === packageFilter) return;
    const timeout = setTimeout(() => setPackageFilter(local), DEBOUNCE_PACKAGE_MS);
    return () => clearTimeout(timeout);
  }, [local]);

  return (
    <div className="row gap-small centered">
      <PackageIcon size="1em" />
      <input
        type="text"
        placeholder="Filter by package…"
        value={local}
        onInput={(e) => setLocal(e.currentTarget.value)}
        className="rounded border box compact"
        aria-label="Filter by package"
      />
    </div>
  );
}

export function SuggestionFilters({
  filters,
  setStatuses,
  setInIssueDraft,
  setPackageFilter,
}: Props) {
  const toggleValue = filters.inIssueDraft
    ? [...filters.statuses, ISSUE_DRAFT_VALUE]
    : filters.statuses;

  return (
    <div className="row gap row-gap-big wrap align-center" data-testid="suggestion-filters">
      <ToggleGroup
        value={toggleValue}
        options={TOGGLE_OPTIONS}
        onItemClick={(value, event) => {
          const next = nextToggleSelection(toggleValue, value, event);
          setInIssueDraft(next.includes(ISSUE_DRAFT_VALUE));
          setStatuses(next.filter((v) => v !== ISSUE_DRAFT_VALUE) as ListSuggestionsStatusItem[]);
        }}
      />
      <PackageFilterInput
        packageFilter={filters.packageFilter}
        setPackageFilter={setPackageFilter}
      />
    </div>
  );
}
