import { EyeIcon, GlobeCheckIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { Link } from "wouter-preact";
import type { Issue as IssueType } from "@/api/generated/models";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { SuggestionViewToggle } from "@/components/suggestions/SuggestionViewToggle";
import { InlineIcon } from "@/components/ui/InlineIcon";
import type { IssueViewMode } from "@/hooks/useIssueViewMode";
import {
  DEFAULT_SUGGESTION_VIEW_MODE,
  type SuggestionViewMode,
} from "@/hooks/useSuggestionViewMode";
import { issuePath } from "@/routes/paths";
import { LegendCard } from "../ui/LegendCard";
import { GitHubIssueLink } from "./GitHubIssueLink";
import { GitHubPullRequestLink } from "./GitHubPullRequestState";
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
  const { code, title, github_issue } = issue;

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
      <div>
        <InlineIcon icon={GlobeCheckIcon} />
        <Link href={issuePath(code)}>{code}</Link>
      </div>
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
      {/* Collapsed view: one line with link to GitHub issue + issue title */}

      {viewMode === "collapsed" && (
        <div class="row gap">
          {github_issue && (
            <GitHubIssueLink
              url={github_issue.url}
              number={github_issue.number}
              state={github_issue.state}
              iconTestId={`issue-${code}-github-state`}
            />
          )}
          <span data-testid={`issue-${code}-title`}>{title}</span>
        </div>
      )}

      {/* Expanded view: GitHub issue link with closing pull requests + title + contained suggestions */}

      {viewMode === "expanded" && (
        <div className="column gap">
          <div className="row gap-small wrap">
            {github_issue && (
              <>
                <GitHubIssueLink
                  url={github_issue.url}
                  number={github_issue.number}
                  state={github_issue.state}
                  iconTestId={`issue-${code}-github-state`}
                />
                {github_issue.closed_by.length > 0 && <>closed by</>}
                {github_issue.closed_by.map((pullRequest) => (
                  <GitHubPullRequestLink
                    key={pullRequest.url}
                    url={pullRequest.url}
                    number={pullRequest.number}
                    state={pullRequest.state}
                  />
                ))}
                on GitHub
              </>
            )}
          </div>

          <div className="column gap-big">
            <div className="column gap">
              <div className="bold text-l" data-testid={`issue-${code}-title`}>
                {title}
              </div>
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
            </div>
            {viewMode === "expanded" && issue.suggestions.length > 0 && (
              <div className="column gap-big stretched">
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
          </div>
        </div>
      )}
    </LegendCard>
  );
}
