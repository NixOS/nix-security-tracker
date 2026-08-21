import { useSearchParams } from "wouter-preact";

/**
 * How much detail an issue card shows.
 *
 * - `expanded`: full issue summary plus its suggestions section
 * - `collapsed`: only status, code, and title (suggestions hidden)
 */
export type IssueViewMode = "expanded" | "collapsed";

export const DEFAULT_ISSUE_VIEW_MODE: IssueViewMode = "collapsed";

const VALID_VIEW_MODES = new Set<string>(["expanded", "collapsed"] satisfies IssueViewMode[]);

function isValidViewMode(value: string | null): value is IssueViewMode {
  return value !== null && VALID_VIEW_MODES.has(value);
}

/**
 * URL-search-param-backed issue-list-wide view mode (`issueView`): whether issues show
 * their suggestions section at all.
 */
export function useIssueListViewMode(): {
  viewMode: IssueViewMode;
  setViewMode: (viewMode: IssueViewMode) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("issueView");
  const viewMode = isValidViewMode(raw) ? raw : DEFAULT_ISSUE_VIEW_MODE;

  const setViewMode = (next: IssueViewMode) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next === DEFAULT_ISSUE_VIEW_MODE) {
          nextParams.delete("issueView");
        } else {
          nextParams.set("issueView", next);
        }
        return nextParams;
      },
      { replace: true },
    );
  };

  return { viewMode, setViewMode };
}
