import { GitMergeIcon, GitPullRequestClosedIcon, GitPullRequestIcon } from "lucide-preact";
import type { GithubPullRequestStateEnum } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { InlineIcon } from "@/components/ui/InlineIcon";
import styles from "./GitHubColors.module.css";

type Props = {
  url: string;
  number: number;
  state: readonly GithubPullRequestStateEnum[];
  iconTestId?: string;
};

function gitHubPullRequestStateLabel(state: readonly GithubPullRequestStateEnum[]): string {
  if (!state.includes("CLOSED")) {
    return "Open";
  }
  if (state.includes("MERGED")) {
    return "Merged";
  }
  return "Closed";
}

function gitHubPullRequestStateIconStyle(state: readonly GithubPullRequestStateEnum[]) {
  if (!state.includes("CLOSED")) {
    return { Icon: GitPullRequestIcon, className: styles["github-open"] };
  }
  if (state.includes("MERGED")) {
    return { Icon: GitMergeIcon, className: styles["github-done"] };
  }
  return { Icon: GitPullRequestClosedIcon, className: styles["github-pull-request-closed"] };
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
