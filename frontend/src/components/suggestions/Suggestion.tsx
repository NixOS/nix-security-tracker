import { ShieldIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { Link } from "wouter-preact";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { LegendCard } from "@/components/ui/LegendCard";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_SUGGESTION_VIEW_MODE,
  type SuggestionViewMode,
} from "@/hooks/useSuggestionViewMode";
import { ActivityLogPanel, ActivityLogToggle } from "./ActivityLog";
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
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  const nvdUrl = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve_id)}`;

  const cveLegend = (
    <>
      <div className="row gap-small centered">
        <ShieldIcon size="1em" />
        <Link href={`/suggestions/by-id/${id}`}>{cve_id}</Link>
      </div>
      <div>
        (<ExternalLink href={nvdUrl}>NVD</ExternalLink>)
      </div>
    </>
  );

  // Only highlight the toggle when the suggestion has an explicit override of its own
  const toggleValue = allowViewModeClear ? ownViewMode : viewMode;

  const viewToggleLegend = (
    <SuggestionViewToggle
      value={toggleValue}
      onChange={setOwnViewMode}
      iconOnly
      allowClear={allowViewModeClear}
      currentValue={inheritedViewMode}
      onLegend
      testId={`suggestion-${id}-view-toggle`}
    />
  );

  if (viewMode === "collapsed") {
    const displayedTitle = title || description;
    return (
      <LegendCard
        legend={cveLegend}
        viewToggle={viewToggleLegend}
        dashed={dimmed}
        testId={`suggestion-${id}-collapsed`}
      >
        <div className="row gap centered">
          <div data-testid={`suggestion-${id}-status`} className="contents">
            <SuggestionStatus status={status} rejectionReason={rejection_reason} iconOnly />
          </div>
          {displayedTitle && <div>{displayedTitle}</div>}
        </div>
      </LegendCard>
    );
  }

  return (
    <LegendCard
      legend={cveLegend}
      viewToggle={viewToggleLegend}
      dashed={dimmed}
      testId={`suggestion-${id}`}
    >
      {/* Header */}
      <div className="column gap">
        <div className="column full-width">
          <div className="row gap spread align-start">
            <SuggestionStatus
              status={status}
              rejectionReason={rejection_reason}
              issueCode={issue_code}
            />
            <ActivityLogToggle
              suggestionId={id}
              open={activityLogOpen}
              onToggle={() => setActivityLogOpen((v) => !v)}
            />
          </div>
          <ActivityLogPanel suggestionId={id} open={activityLogOpen} />
        </div>

        <details>
          <summary>
            {metrics.length > 0 && <SeverityBadge metrics={metrics} />}
            <span className="bold text-l">
              {title || (description ? `${description.slice(0, 80)}…` : cve_id)}
            </span>
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
    </LegendCard>
  );
}
