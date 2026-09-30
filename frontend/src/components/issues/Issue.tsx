import { EyeIcon, GlobeCheckIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { Link } from "wouter-preact";
import type { Issue as IssueType } from "@/api/generated/models";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import type { IssueViewMode } from "@/hooks/useIssueViewMode";
import {
  DEFAULT_SUGGESTION_VIEW_MODE,
  type SuggestionViewMode,
} from "@/hooks/useSuggestionViewMode";
import { ExternalLink } from "../ui/ExternalLink";
import { LegendCard } from "../ui/LegendCard";
import { IssueViewToggle } from "./IssueViewToggle";

type Props = {
  issue: IssueType;
  inheritedViewMode?: IssueViewMode;
  allowViewModeClear?: boolean;
  inheritedSuggestionViewMode?: SuggestionViewMode;
};

export function Issue({
  issue,
  inheritedViewMode = "expanded",
  allowViewModeClear = false,
  inheritedSuggestionViewMode = DEFAULT_SUGGESTION_VIEW_MODE,
}: Props) {
  const { code, title, github_issue_url } = issue;

  const [ownViewMode, setOwnViewMode] = useState<IssueViewMode | undefined>(undefined);
  const [ownSuggestionViewMode, setOwnSuggestionViewMode] = useState<
    SuggestionViewMode | undefined
  >(undefined);
  const viewMode = ownViewMode ?? inheritedViewMode;
  const suggestionViewMode = ownSuggestionViewMode ?? inheritedSuggestionViewMode;

  const viewToggleValue = allowViewModeClear ? ownViewMode : viewMode;
  const suggestionToggleValue = allowViewModeClear ? ownSuggestionViewMode : suggestionViewMode;

  const legend = (
    <>
      <div className="row gap-small centered">
        <GlobeCheckIcon size="1em" />
        <Link href={`/issues/${code}`}>{code}</Link>
      </div>
      {github_issue_url && (
        <div>
          (<ExternalLink href={github_issue_url}>GitHub</ExternalLink>)
        </div>
      )}
    </>
  );

  const viewToggle = (
    <IssueViewToggle
      value={viewToggleValue}
      onChange={setOwnViewMode}
      allowClear={allowViewModeClear}
      iconOnly
      currentValue={inheritedViewMode}
      onLegend
      testId={`issue-${code}-view-toggle`}
    />
  );

  return (
    <LegendCard legend={legend} viewToggle={viewToggle} testId={`issue-${code}`}>
      <div className="column gap-small">
        {viewMode === "collapsed" && title && (
          <span data-testid={`issue-${code}-title`}>{title}</span>
        )}
        {viewMode !== "collapsed" && title && (
          <div className="bold text-l" data-testid={`issue-${code}-title`}>
            {title}
          </div>
        )}
      </div>

      {viewMode === "expanded" && issue.suggestions.length > 0 && (
        <div className="column gap-big stretched">
          {issue.suggestions.length > 1 && (
            <div className="row gap centered justify-right">
              <EyeIcon size="1em" />
              <SuggestionViewToggle
                value={suggestionToggleValue}
                onChange={setOwnSuggestionViewMode}
                allowClear={allowViewModeClear}
                iconOnly
                currentValue={inheritedSuggestionViewMode}
                testId={`issue-${code}-suggestions-view-toggle`}
              />
            </div>
          )}
          {issue.suggestions.map((suggestion) =>
            typeof suggestion === "number" ? null : (
              <Suggestion
                key={suggestion.id}
                suggestion={suggestion}
                inheritedViewMode={suggestionViewMode}
                allowViewModeClear
              />
            ),
          )}
        </div>
      )}
    </LegendCard>
  );
}
