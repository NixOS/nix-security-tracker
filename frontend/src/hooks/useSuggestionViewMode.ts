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

export const SUGGESTION_VIEW_MODES: readonly SuggestionViewMode[] = [
  "detailed",
  "collapsed",
  "compact",
  "tabs",
];

/**
 * Search param holding the list-wide default suggestion view mode.
 * Suggestions may locally override.
 */
export const SUGGESTION_VIEW_PARAM = "suggestionView";
