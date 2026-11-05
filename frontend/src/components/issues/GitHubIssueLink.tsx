import { CircleCheckIcon, CircleDotIcon, CircleSlashIcon } from "lucide-preact";
import type { GithubIssueStateEnum } from "@/api/generated/models";
import { ExternalLink } from "../ui/ExternalLink";
import { InlineIcon } from "../ui/InlineIcon";
import styles from "./GitHubColors.module.css";

type Props = {
  url: string;
  number: number;
  state: GithubIssueStateEnum;
  iconTestId?: string;
};

function gitHubIssueStateLabel(state: GithubIssueStateEnum): string {
  switch (state) {
    case "ISSUE_OPENED":
      return "Open";
    case "ISSUE_COMPLETED":
      return "Closed (completed)";
    case "ISSUE_NOT_PLANNED":
      return "Closed (not planned)";
    case "ISSUE_DUPLICATE":
      return "Closed (duplicate)";
  }
}

function gitHubIssueStateIconStyle(state: GithubIssueStateEnum) {
  switch (state) {
    case "ISSUE_OPENED":
      return { Icon: CircleDotIcon, className: styles["github-open"] };
    case "ISSUE_COMPLETED":
      return { Icon: CircleCheckIcon, className: styles["github-done"] };
    case "ISSUE_NOT_PLANNED":
    case "ISSUE_DUPLICATE":
      return { Icon: CircleSlashIcon, className: styles["github-issue-not-planned"] };
  }
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
