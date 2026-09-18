import { EyeIcon } from "lucide-preact";
import { useSearchParams } from "wouter-preact";
import { useListSuggestions } from "@/api/generated/endpoints";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { IssueDraftPanel } from "@/components/suggestions/IssueDraftPanel";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { SuggestionFilters } from "@/components/suggestions/SuggestionFilters";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  type SuggestionListFilters,
  useSuggestionListFilters,
} from "@/hooks/useSuggestionListFilters";
import { useSuggestionListViewMode } from "@/hooks/useSuggestionViewMode";
import { getApiErrorMessage } from "@/utils/apiError";

// FIXME(@florentc): Hardcoded in the API for now, we should ultimately make it a query param
const PAGE_SIZE = 10;

function parsePage(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("page"));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams);
  const { filters, setStatuses, setInIssueDraft, setPackageFilter } = useSuggestionListFilters();
  const { viewMode, setViewMode } = useSuggestionListViewMode();

  const { data, isLoading, isError, error } = useListSuggestions({
    page,
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    in_issue_draft: filters.inIssueDraft || undefined,
    package: filters.packageFilter || undefined,
    activity_log: true,
  });

  const showIssueDraftPanel =
    filters.inIssueDraft &&
    filters.statuses.length === 0 &&
    !filters.packageFilter &&
    (data?.count ?? 0) > 0;

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

  return (
    <div className="column gap-big centered">
      <div className="column gap">
        <SuggestionFilters
          filters={filters}
          setStatuses={setStatuses}
          setInIssueDraft={setInIssueDraft}
          setPackageFilter={setPackageFilter}
        />
        <IssueDraftPanel open={showIssueDraftPanel} />
        <div className="row gap centered justify-right">
          <div className="row gap-small centered">
            <EyeIcon size="1em" />
            <span>View</span>
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
                    dimmed={!matches}
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
