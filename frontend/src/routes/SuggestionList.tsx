import { EyeIcon } from "lucide-preact";
import { useSearchParams } from "wouter-preact";
import { useListSuggestions } from "@/api/generated/endpoints";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { SuggestionFilters } from "@/components/suggestions/SuggestionFilters";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  type SuggestionListFilters,
  useSuggestionListFilters,
} from "@/hooks/useSuggestionListFilters";
import { type SuggestionViewMode, useSuggestionListViewMode } from "@/hooks/useSuggestionViewMode";
import { useSuggestionViewOverrides } from "@/hooks/useSuggestionViewOverrides";
import { getApiErrorMessage } from "@/utils/apiError";

// FIXME(@florentc): Hardcoded in the API for now, we should ultimately make it a query param
const PAGE_SIZE = 10;

function parsePage(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("page"));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

function effectiveViewMode({
  override,
  matchesFilters,
  listViewMode,
}: {
  override: SuggestionViewMode | undefined;
  matchesFilters: boolean;
  listViewMode: SuggestionViewMode;
}): SuggestionViewMode {
  if (override) {
    return override;
  }
  return matchesFilters ? listViewMode : "collapsed";
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
  const { getOverride, setOverride } = useSuggestionViewOverrides();

  const { data, isLoading, isError, error } = useListSuggestions({
    page,
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    in_issue_draft: filters.inIssueDraft || undefined,
    package: filters.packageFilter || undefined,
  });

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
                    viewMode={effectiveViewMode({
                      override: getOverride(suggestion.id),
                      matchesFilters: matches,
                      listViewMode: viewMode,
                    })}
                    overrideViewMode={getOverride(suggestion.id)}
                    allowViewModeClear
                    onViewModeChange={(mode) => setOverride(suggestion.id, mode)}
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
