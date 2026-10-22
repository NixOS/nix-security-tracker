import { CircleCheckIcon, CircleDotIcon, CircleSlashIcon } from "lucide-preact";
import type { GithubIssueStateEnum } from "@/api/generated/models";
import styles from "./GitHubIssueState.module.css";

type Props = {
  state: readonly GithubIssueStateEnum[];
  testId?: string;
};

export function gitHubIssueStateLabel(state: readonly GithubIssueStateEnum[]): string {
  if (!state.includes("CLOSED")) {
    return "Open";
  }
  if (state.includes("COMPLETED")) {
    return "Closed (completed)";
  }
  if (state.includes("NOT_PLANNED")) {
    return "Closed (not planned)";
  }
  if (state.includes("DUPLICATE")) {
    return "Closed (duplicate)";
  }
  return "Closed";
}

function GitHubIssueStateIcon({ state }: { state: readonly GithubIssueStateEnum[] }) {
  if (!state.includes("CLOSED")) {
    return <CircleDotIcon size="1em" className={styles["github-issue-open"]} />;
  }
  if (state.includes("COMPLETED")) {
    return <CircleCheckIcon size="1em" className={styles["github-issue-done"]} />;
  }
  return <CircleSlashIcon size="1em" className={styles["github-issue-not-planned"]} />;
}

export function GitHubIssueState({ state, testId }: Props) {
  const label = gitHubIssueStateLabel(state);
  return (
    <span
      className="row centered"
      role="img"
      title={label}
      aria-label={label}
      data-testid={testId}
      data-color-mode="light"
      data-light-theme="light"
    >
      <GitHubIssueStateIcon state={state} />
    </span>
  );
}
