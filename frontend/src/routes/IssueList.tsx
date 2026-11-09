import { CircleCheckIcon, CircleDotIcon, EyeIcon } from "lucide-preact";
import { useSearchParams } from "wouter-preact";
import { useListIssues } from "@/api/generated/endpoints";
import { ListIssuesState } from "@/api/generated/models";
import { Issue } from "@/components/issues/Issue";
import { IssueViewToggle } from "@/components/issues/IssueViewToggle";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import { Collapsible } from "@/components/ui/Collapsible";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { Pagination } from "@/components/ui/Pagination";
import { PillToggleGroup, type ToggleGroupOption } from "@/components/ui/PillToggleGroup";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useIssueListViewMode } from "@/hooks/useIssueViewMode";
import { useSuggestionListViewMode } from "@/hooks/useSuggestionViewMode";
import { getApiErrorMessage } from "@/utils/apiError";
import { setParam } from "@/utils/searchParams";

// FIXME(@florentc): Hardcoded in the API for now, we should ultimately make it a query param
const PAGE_SIZE = 10;

function parsePage(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("page"));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

const STATE_OPTIONS: ToggleGroupOption[] = [
  {
    value: ListIssuesState.open,
    label: (
      <>
        <InlineIcon icon={CircleDotIcon} />
        Open
      </>
    ),
  },
  {
    value: ListIssuesState.closed,
    label: (
      <>
        <InlineIcon icon={CircleCheckIcon} />
        Closed
      </>
    ),
  },
];

function parseState(searchParams: URLSearchParams): ListIssuesState | undefined {
  const raw = searchParams.get("state");
  return Object.values(ListIssuesState).find((state) => state === raw);
}

export function IssueList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterParams, updateFilterParams] = useFilterParams();
  const page = parsePage(searchParams);
  const state = parseState(filterParams);
  const { viewMode: issueViewMode, setViewMode: setIssueViewMode } = useIssueListViewMode();
  // Nested suggestions default to collapsed in issue lists (unlike the standalone suggestion list).
  const { viewMode: suggestionViewMode, setViewMode: setSuggestionViewMode } =
    useSuggestionListViewMode("collapsed");

  // Always fetch suggestions regardless of view mode, so toggling an issue's own view mode
  // (or the list-wide one) never changes the query key and re-triggers a full list reload.
  const { data, isLoading, isError, error } = useListIssues({
    page,
    state,
    expand: "suggestions",
    activity_log: true,
  });

  const handleStateClick = (clicked: string) => {
    updateFilterParams(setParam("state", clicked === state ? "" : clicked));
  };

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
      <div className="column gap full-width">
        <div data-testid="issue-filters">
          <PillToggleGroup
            value={state ? [state] : []}
            options={STATE_OPTIONS}
            onItemClick={handleStateClick}
          />
        </div>
        <div className="row gap centered justify-right">
          <div>
            <InlineIcon icon={EyeIcon} />
            Issues view mode
          </div>
          <IssueViewToggle
            value={issueViewMode}
            onChange={(mode) => mode && setIssueViewMode(mode)}
            testId="issue-view-toggle"
          />
        </div>

        <Collapsible open={issueViewMode === "expanded"}>
          <div className="row gap centered justify-right">
            <div>
              <InlineIcon icon={EyeIcon} />
              Suggestions view mode
            </div>
            <SuggestionViewToggle
              value={suggestionViewMode}
              onChange={(mode) => mode && setSuggestionViewMode(mode)}
              testId="suggestion-view-toggle"
            />
          </div>
        </Collapsible>
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
          Failed to load issues: {getApiErrorMessage(error)}
        </p>
      )}

      {data && (
        <>
          {data.results.length === 0 ? (
            <p>No issues found.</p>
          ) : (
            <div className="column gap-big stretched full-width">
              {data.results.map((issue) => (
                <Issue
                  key={issue.id}
                  issue={issue}
                  inheritedViewMode={issueViewMode}
                  allowViewModeClear
                  inheritedSuggestionViewMode={suggestionViewMode}
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
