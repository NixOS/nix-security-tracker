import { useParams } from "wouter-preact";
import { ApiError } from "@/api/client";
import { useGetIssue } from "@/api/generated/endpoints";
import { Issue } from "@/components/issues/Issue";
import { Skeleton } from "@/components/ui/Skeleton";

export function IssueDetail() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";

  const { data, isLoading, isError, error } = useGetIssue(
    code,
    { expand: "suggestions", activity_log: true },
    { query: { enabled: Boolean(code) } },
  );

  if (isLoading) {
    return (
      <div className="column gap">
        <Skeleton width="100%" height="40em" />
      </div>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <p className="rounded box bg-red-light">Issue not found.</p>;
    }
    return <p className="rounded box bg-red-light">Failed to load issue.</p>;
  }

  if (!data) {
    return null;
  }

  return <Issue issue={data} />;
}
