import { useSearchParams } from "wouter-preact";

/**
 * How much detail is shown for a suggestion card.
 *
 * - `detailed`: all sections expanded
 * - `compact`: no "matching packages" nor "maintainers", compact presentation
 * - `collapsed`: only status icon, CVE id, and title
 * - `tabs`: all sections, each in a given tab
 */
export type SuggestionViewMode = "detailed" | "collapsed" | "compact" | "tabs";

export const DEFAULT_SUGGESTION_VIEW_MODE: SuggestionViewMode = "detailed";

const VALID_VIEW_MODES = new Set<string>([
  "detailed",
  "collapsed",
  "compact",
  "tabs",
] satisfies SuggestionViewMode[]);

function isValidViewMode(value: string | null): value is SuggestionViewMode {
  return value !== null && VALID_VIEW_MODES.has(value);
}

/**
 * URL-search-param-backed list-wide default view mode (`view`).
 * Suggestions may locally override.
 */
export function useSuggestionListViewMode(): {
  viewMode: SuggestionViewMode;
  setViewMode: (viewMode: SuggestionViewMode) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("view");
  const viewMode = isValidViewMode(raw) ? raw : DEFAULT_SUGGESTION_VIEW_MODE;

  const setViewMode = (next: SuggestionViewMode) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next === DEFAULT_SUGGESTION_VIEW_MODE) {
          nextParams.delete("view");
        } else {
          nextParams.set("view", next);
        }
        return nextParams;
      },
      { replace: true },
    );
  };

  return { viewMode, setViewMode };
}
