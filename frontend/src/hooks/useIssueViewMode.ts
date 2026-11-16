/**
 * How much detail an issue card shows.
 *
 * - `expanded`: full issue summary plus its suggestions section
 * - `collapsed`: only status, code, and title (suggestions hidden)
 */
export type IssueViewMode = "expanded" | "collapsed";

export const DEFAULT_ISSUE_VIEW_MODE: IssueViewMode = "collapsed";

export const ISSUE_VIEW_MODES: readonly IssueViewMode[] = ["expanded", "collapsed"];

export const ISSUE_VIEW_PARAM = "issueView";
