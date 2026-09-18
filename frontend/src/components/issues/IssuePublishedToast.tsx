import { Link } from "wouter-preact";
import type { Issue } from "@/api/generated/models";
import { ExternalLink } from "../ui/ExternalLink";

type Props = {
  issue: Issue;
};

export function IssuePublishedToast({ issue }: Props) {
  return (
    <div className="column gap-small">
      <p>{issue.title}</p>
      <Link href={`/ui-v2/issues/${issue.code}`}>Issue detail on the tracker</Link>
      {issue.github_issue_url && (
        <ExternalLink href={issue.github_issue_url}>GitHub issue</ExternalLink>
      )}
    </div>
  );
}
