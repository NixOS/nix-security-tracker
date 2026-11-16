import { EyeIcon } from "lucide-preact";
import { useListSuggestions } from "@/api/generated/endpoints";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { IssueDraftPanel } from "@/components/suggestions/IssueDraftPanel";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { SuggestionFilters } from "@/components/suggestions/SuggestionFilters";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePageParam } from "@/hooks/usePageParam";
import {
  type SuggestionListFilters,
  useSuggestionListFilters,
} from "@/hooks/useSuggestionListFilters";
import {
  DEFAULT_SUGGESTION_VIEW_MODE,
  SUGGESTION_VIEW_MODES,
  SUGGESTION_VIEW_PARAM,
} from "@/hooks/useSuggestionViewMode";
import { useViewModeParam } from "@/hooks/useViewModeParam";
import { getApiErrorMessage } from "@/utils/apiError";

// FIXME(@florentc): Hardcoded in the API for now, we should ultimately make it a query param
const PAGE_SIZE = 10;

function suggestionMatchesFilters(
  suggestion: SuggestionType,
  filters: SuggestionListFilters,
): boolean {
  if (filters.statuses.length > 0 && !filters.statuses.includes(suggestion.status)) {
    return false;
  }

  if (filters.inIssueDraft && !suggestion.in_issue_draft) {
    return false;
  }

  if (filters.packageFilter && !(filters.packageFilter in suggestion.packages)) {
    return false;
  }

  return true;
}

export function SuggestionList() {
  const [page, handlePageChange] = usePageParam();
  const {
    filters,
    setStatuses,
    setInIssueDraft,
    setPackageFilter,
    setAffectedProductFilter,
    setCreatedAtRange,
  } = useSuggestionListFilters();
  const { viewMode, setViewMode } = useViewModeParam(
    SUGGESTION_VIEW_PARAM,
    SUGGESTION_VIEW_MODES,
    DEFAULT_SUGGESTION_VIEW_MODE,
  );

  const { data, isLoading, isError, error } = useListSuggestions({
    page,
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    in_issue_draft: filters.inIssueDraft || undefined,
    package: filters.packageFilter || undefined,
    affected_product: filters.affectedProduct || undefined,
    affected_product_version: filters.affectedProductVersion || undefined,
    created_at_after: filters.createdAtAfter || undefined,
    created_at_before: filters.createdAtBefore || undefined,
    activity_log: true,
  });

  const showIssueDraftPanel =
    filters.inIssueDraft &&
    filters.statuses.length === 0 &&
    !filters.packageFilter &&
    !filters.affectedProduct &&
    !filters.createdAtAfter &&
    !filters.createdAtBefore &&
    (data?.count ?? 0) > 0;

  return (
    <div className="column gap-big centered">
      <div className="column gap-big full-width">
        <SuggestionFilters
          filters={filters}
          setStatuses={setStatuses}
          setInIssueDraft={setInIssueDraft}
          setPackageFilter={setPackageFilter}
          setAffectedProductFilter={setAffectedProductFilter}
          setCreatedAtRange={setCreatedAtRange}
        />
        <IssueDraftPanel open={showIssueDraftPanel} />
        <div className="row gap centered grow justify-right">
          <div>
            <InlineIcon icon={EyeIcon} />
            View
          </div>
          <SuggestionViewToggle
            value={viewMode}
            onChange={(mode) => mode && setViewMode(mode)}
            testId="suggestion-view-toggle"
          />
        </div>
      </div>

      {isLoading && (
        <div className="column gap-big full-width">
          <div className="column gap">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} width="100%" height="20em" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <p className="rounded box bg-red-light">
          Failed to load suggestions: {getApiErrorMessage(error)}
        </p>
      )}

      {data && (
        <>
          {data.results.length === 0 ? (
            <p>No suggestions found.</p>
          ) : (
            <div className="column gap-big stretched full-width">
              {data.results.map((suggestion) => {
                const matches = suggestionMatchesFilters(suggestion, filters);
                return (
                  <Suggestion
                    key={suggestion.id}
                    suggestion={suggestion}
                    dimmedReason={matches ? undefined : "No longer matches the filters"}
                    inheritedViewMode={matches ? viewMode : "collapsed"}
                    allowViewModeClear
                  />
                );
              })}
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
