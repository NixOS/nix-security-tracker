import { Link } from "wouter-preact";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { useAuth } from "@/hooks/useAuth";
import type { SuggestionViewMode } from "@/hooks/useSuggestionViewMode";
import { ActivityLog } from "./ActivityLog";
import { SeverityBadge } from "./SeverityBadge";
import { SuggestionCompactBody } from "./SuggestionCompactBody";
import { SuggestionDetailedBody } from "./SuggestionDetailedBody";
import { SuggestionStatus } from "./SuggestionStatus";
import { SuggestionTabsBody } from "./SuggestionTabsBody";
import { SuggestionViewToggle } from "./SuggestionViewToggle";

type Props = {
  suggestion: SuggestionType;
  /** Purely visual: flags a suggestion that no longer matches active list filters. Independent of `viewMode`. */
  dimmed?: boolean;
  /** Effective mode actually rendered (may fall back to "collapsed" or the list default — see `effectiveViewMode`). */
  viewMode?: SuggestionViewMode;
  /** Explicit per-suggestion override, if any. Only meaningful when `allowViewModeClear` is set — used to
   * decide what the toggle highlights (nothing, when the suggestion has no override of its own). */
  overrideViewMode?: SuggestionViewMode;
  /** Lets the toggle clear an explicit override by re-clicking the highlighted option. Set by list contexts;
   * left false for a standalone suggestion (e.g. the detail page) where the toggle is always selected. */
  allowViewModeClear?: boolean;
  onViewModeChange?: (viewMode: SuggestionViewMode | undefined) => void;
};

export function Suggestion({
  suggestion,
  dimmed = false,
  viewMode = "detailed",
  overrideViewMode,
  allowViewModeClear = false,
  onViewModeChange = () => {},
}: Props) {
  const { id, cve_id, title, description, status, rejection_reason, metrics } = suggestion;

  const { user } = useAuth();
  const userCanEdit = Boolean(user?.is_committer || user?.is_admin);

  const nvdUrl = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve_id)}`;

  const articleClassName = `box border rounded column gap-big ${dimmed ? "border-dashed" : "shadow"}`;

  // Only highlight the toggle when the suggestion has an explicit override of its own;
  // when it doesn't nothing is shown as selected (inherit from list-wide setting).
  const toggleValue = allowViewModeClear ? overrideViewMode : viewMode;

  if (viewMode === "collapsed") {
    const displayedTitle = title || description;
    return (
      <article className={articleClassName} data-testid={`suggestion-${id}-collapsed`}>
        <div className="row gap spread centered wrap">
          <div className="row gap centered wrap">
            <span data-testid={`suggestion-${id}-status`}>
              <SuggestionStatus status={status} rejectionReason={rejection_reason} iconOnly />
            </span>
            <a href={nvdUrl} target="_blank" rel="noreferrer">
              {cve_id}
            </a>
            {displayedTitle && (
              <span>
                {displayedTitle.length > 80 ? `${displayedTitle.slice(0, 80)}…` : displayedTitle}
              </span>
            )}
          </div>
          <div className="row gap centered">
            <Link href={`/ui-v2/suggestions/by-id/${id}`}>Permalink</Link>
            <SuggestionViewToggle
              value={toggleValue}
              onChange={onViewModeChange}
              iconOnly
              allowClear={allowViewModeClear}
              testId={`suggestion-${id}-view-toggle`}
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={articleClassName} data-testid={`suggestion-${id}`}>
      {/* Header */}
      <div className="column gap-small">
        <div className="row gap spread centered">
          <SuggestionStatus status={status} rejectionReason={rejection_reason} />
          <SuggestionViewToggle
            value={toggleValue}
            onChange={onViewModeChange}
            iconOnly
            allowClear={allowViewModeClear}
            testId={`suggestion-${id}-view-toggle`}
          />
        </div>

        <div className="row gap spread align-start">
          <div className="row gap">
            <Link href={`/ui-v2/suggestions/by-id/${id}`}>Permalink</Link>
            <a href={nvdUrl} target="_blank" rel="noreferrer">
              {cve_id}
            </a>
            {metrics.length > 0 && <SeverityBadge metrics={metrics} />}
          </div>
          <ActivityLog suggestionId={id} />
        </div>

        <details>
          <summary className="bold text-l">
            {title || (description ? `${description.slice(0, 80)}…` : cve_id)}
          </summary>
          {description && <p>{description}</p>}
        </details>
      </div>

      {viewMode === "compact" && (
        <SuggestionCompactBody suggestion={suggestion} userCanEdit={userCanEdit} />
      )}

      {viewMode === "tabs" && (
        <SuggestionTabsBody suggestion={suggestion} userCanEdit={userCanEdit} />
      )}

      {viewMode === "detailed" && (
        <SuggestionDetailedBody suggestion={suggestion} userCanEdit={userCanEdit} />
      )}
    </article>
  );
}
