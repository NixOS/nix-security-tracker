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

function gitHubIssueStateIconStyle(state: readonly GithubIssueStateEnum[]) {
  if (!state.includes("CLOSED")) {
    return { Icon: CircleDotIcon, className: styles["github-issue-open"] };
  }
  if (state.includes("COMPLETED")) {
    return { Icon: CircleCheckIcon, className: styles["github-issue-done"] };
  }
  return { Icon: CircleSlashIcon, className: styles["github-issue-not-planned"] };
}

export function GitHubIssueStateIcon({ state, testId }: Props) {
  const label = gitHubIssueStateLabel(state);
  const { Icon, className } = gitHubIssueStateIconStyle(state);
  return (
    <Icon
      className={className}
      role="img"
      aria-label={label}
      data-testid={testId}
      data-color-mode="light"
      data-light-theme="light"
    >
      <title>{label}</title>
    </Icon>
  );
}
