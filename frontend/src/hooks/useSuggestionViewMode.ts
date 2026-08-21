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
 * URL-search-param-backed list-wide default view mode (`suggestionView`).
 * Suggestions may locally override.
 *
 * @param defaultMode - Fallback when the param is absent/invalid, and the value at which the
 * param is dropped from the URL entirely. Callers embedding this in another list (e.g. issue
 * lists, which want their nested suggestions collapsed by default) may pass a different default
 * than the standalone suggestion list.
 */
export function useSuggestionListViewMode(
  defaultMode: SuggestionViewMode = DEFAULT_SUGGESTION_VIEW_MODE,
): {
  viewMode: SuggestionViewMode;
  setViewMode: (viewMode: SuggestionViewMode) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("suggestionView");
  const viewMode = isValidViewMode(raw) ? raw : defaultMode;

  const setViewMode = (next: SuggestionViewMode) => {
    setSearchParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next === defaultMode) {
          nextParams.delete("suggestionView");
        } else {
          nextParams.set("suggestionView", next);
        }
        return nextParams;
      },
      { replace: true },
    );
  };

  return { viewMode, setViewMode };
}
