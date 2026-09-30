import { LayersIcon } from "lucide-preact";
import type { ListSuggestionsStatusItem } from "@/api/generated/models";
import { ListSuggestionsStatusItem as Status } from "@/api/generated/models";
import { PillToggleGroup, type ToggleGroupOption } from "@/components/ui/PillToggleGroup";
import type { SuggestionListFilters } from "@/hooks/useSuggestionListFilters";
import { PackageFilterInput } from "./PackageFilterInput";
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
      <PillToggleGroup
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
