import { GitMergeIcon, GitPullRequestClosedIcon, GitPullRequestIcon } from "lucide-preact";
import type { StateEnum } from "@/api/generated/models";
import styles from "./GitHubIssueState.module.css";

type Props = {
  state: readonly StateEnum[];
};

function gitHubPullRequestStateLabel(state: readonly StateEnum[]): string {
  if (!state.includes("CLOSED")) {
    return "Open";
  }
  if (state.includes("MERGED")) {
    return "Merged";
  }
  return "Closed";
}

function GitHubPullRequestStateIcon({ state }: Props) {
  if (!state.includes("CLOSED")) {
    return <GitPullRequestIcon size="1em" className={styles["github-issue-open"]} />;
  }
  if (state.includes("MERGED")) {
    return <GitMergeIcon size="1em" className={styles["github-issue-done"]} />;
  }
  return <GitPullRequestClosedIcon size="1em" className={styles["github-pull-request-closed"]} />;
}

export function GitHubPullRequestState({ state }: Props) {
  const label = gitHubPullRequestStateLabel(state);
  return (
    <span
      className="row centered"
      role="img"
      title={label}
      aria-label={label}
      data-color-mode="light"
      data-light-theme="light"
    >
      <GitHubPullRequestStateIcon state={state} />
    </span>
  );
}
