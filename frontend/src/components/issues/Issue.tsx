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
import { GitHubIssueState } from "./GitHubIssueState";
import { GitHubPullRequestState } from "./GitHubPullRequestState";
import { IssueViewToggle } from "./IssueViewToggle";

function gitHubNumber(url: string): string {
  return `#${url.split("/").pop()}`;
}

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
  const { code, title, github_issue_url, github_issue_state, github_closing_pull_requests } = issue;

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
      <div className="column gap">
        {viewMode !== "collapsed" && github_issue_url && (
          <div className="row centered gap-small wrap">
            <span>GitHub:</span>
            <span className="row centered gap-tiny">
              {github_issue_state && (
                <GitHubIssueState
                  state={github_issue_state}
                  testId={`issue-${code}-github-state`}
                />
              )}
              <ExternalLink href={github_issue_url}>{gitHubNumber(github_issue_url)}</ExternalLink>
            </span>
            {github_closing_pull_requests.length > 0 && <span>closed by</span>}
            {github_closing_pull_requests.map((pullRequest) => (
              <span key={pullRequest.url} className="row centered gap-tiny">
                <GitHubPullRequestState state={pullRequest.state} />
                <ExternalLink href={pullRequest.url}>{gitHubNumber(pullRequest.url)}</ExternalLink>
              </span>
            ))}
          </div>
        )}
        {viewMode === "collapsed" && (
          <div className="row gap centered">
            <div className="row gap-small">
              {github_issue_state && (
                <GitHubIssueState
                  state={github_issue_state}
                  testId={`issue-${code}-github-state`}
                />
              )}
              {github_issue_url && (
                <ExternalLink href={github_issue_url}>
                  {gitHubNumber(github_issue_url)}
                </ExternalLink>
              )}
            </div>
            {title && <span data-testid={`issue-${code}-title`}>{title}</span>}
          </div>
        )}
        {viewMode === "expanded" && (
          <div className="row gap centered spread">
            {title && (
              <div className="bold text-l" data-testid={`issue-${code}-title`}>
                {title}
              </div>
            )}
            {issue.suggestions.length > 1 && (
              <div className="row gap centered">
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
    </LegendCard>
  );
}
