import { CircleCheckIcon, CircleDotIcon, CircleSlashIcon } from "lucide-preact";
import type { GithubIssueStateEnum } from "@/api/generated/models";
import { ExternalLink } from "../ui/ExternalLink";
import { InlineIcon } from "../ui/InlineIcon";
import styles from "./GitHubColors.module.css";

type Props = {
  url: string;
  number: number;
  state: readonly GithubIssueStateEnum[];
  iconTestId?: string;
};

function gitHubIssueStateLabel(state: readonly GithubIssueStateEnum[]): string {
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
    return { Icon: CircleDotIcon, className: styles["github-open"] };
  }
  if (state.includes("COMPLETED")) {
    return { Icon: CircleCheckIcon, className: styles["github-done"] };
  }
  return { Icon: CircleSlashIcon, className: styles["github-issue-not-planned"] };
}

export function GitHubIssueLink({ url, number, state, iconTestId }: Props) {
  const { Icon, className } = gitHubIssueStateIconStyle(state);
  const label = gitHubIssueStateLabel(state);
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
