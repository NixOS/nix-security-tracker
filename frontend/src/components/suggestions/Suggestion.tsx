import { useState } from "preact/hooks";
import { Link } from "wouter-preact";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_SUGGESTION_VIEW_MODE,
  type SuggestionViewMode,
} from "@/hooks/useSuggestionViewMode";
import { truncate } from "@/utils/text";
import { ActivityLog } from "./ActivityLog";
import { SeverityBadge } from "./SeverityBadge";
import { SuggestionCompactBody } from "./SuggestionCompactBody";
import { SuggestionDetailedBody } from "./SuggestionDetailedBody";
import { SuggestionStatus } from "./SuggestionStatus";
import { SuggestionTabsBody } from "./SuggestionTabsBody";
import { SuggestionViewToggle } from "./SuggestionViewToggle";

type Props = {
  suggestion: SuggestionType;
  /** Purely visual: flags a suggestion that no longer matches active list filters. Independent of the view mode. */
  dimmed?: boolean;
  inheritedViewMode?: SuggestionViewMode;
  allowViewModeClear?: boolean;
};

export function Suggestion({
  suggestion,
  dimmed = false,
  inheritedViewMode = DEFAULT_SUGGESTION_VIEW_MODE,
  allowViewModeClear = false,
}: Props) {
  const { id, cve_id, title, description, status, rejection_reason, issue_code, metrics } =
    suggestion;

  const { user } = useAuth();
  const userCanEdit = Boolean(user?.is_committer || user?.is_admin);

  const [ownViewMode, setOwnViewMode] = useState<SuggestionViewMode | undefined>(undefined);
  const viewMode = ownViewMode ?? inheritedViewMode;

  const nvdUrl = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve_id)}`;

  const articleClassName = `box border rounded column gap-big ${dimmed ? "border-dashed" : "shadow"}`;

  // Only highlight the toggle when the suggestion has an explicit override of its own
  const toggleValue = allowViewModeClear ? ownViewMode : viewMode;

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
            {displayedTitle && <span>{truncate(displayedTitle)}</span>}
          </div>
          <div className="row gap centered">
            <Link href={`/ui-v2/suggestions/by-id/${id}`}>Permalink</Link>
            <SuggestionViewToggle
              value={toggleValue}
              onChange={setOwnViewMode}
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
          <SuggestionStatus
            status={status}
            rejectionReason={rejection_reason}
            issueCode={issue_code}
          />
          <SuggestionViewToggle
            value={toggleValue}
            onChange={setOwnViewMode}
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
