import { GitMergeIcon, GitPullRequestClosedIcon, GitPullRequestIcon } from "lucide-preact";
import type { GithubPullRequestStateEnum } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { InlineIcon } from "@/components/ui/InlineIcon";
import styles from "./GitHubColors.module.css";

type Props = {
  url: string;
  number: number;
  state: GithubPullRequestStateEnum;
  iconTestId?: string;
};

function gitHubPullRequestStateLabel(state: GithubPullRequestStateEnum): string {
  switch (state) {
    case "PULL_REQUEST_OPENED":
      return "Open";
    case "PULL_REQUEST_MERGED":
      return "Merged";
    case "PULL_REQUEST_CLOSED":
      return "Closed";
  }
}

function gitHubPullRequestStateIconStyle(state: GithubPullRequestStateEnum) {
  switch (state) {
    case "PULL_REQUEST_OPENED":
      return { Icon: GitPullRequestIcon, className: styles["github-open"] };
    case "PULL_REQUEST_MERGED":
      return { Icon: GitMergeIcon, className: styles["github-done"] };
    case "PULL_REQUEST_CLOSED":
      return { Icon: GitPullRequestClosedIcon, className: styles["github-pull-request-closed"] };
  }
}

export function GitHubPullRequestLink({ url, number, state, iconTestId }: Props) {
  const { Icon, className } = gitHubPullRequestStateIconStyle(state);
  const label = gitHubPullRequestStateLabel(state);
  return (
    <span>
      <InlineIcon
        icon={Icon}
        className={className}
        aria-label={label}
        data-color-mode="light"
        data-light-theme="light"
        data-testid={iconTestId}
        label={label}
      />
      <ExternalLink href={url}>#{number}</ExternalLink>
    </span>
  );
}
