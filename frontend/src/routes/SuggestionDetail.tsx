import { useParams } from "wouter-preact";
import { ApiError } from "@/api/client";
import { useGetSuggestion } from "@/api/generated/endpoints";
import { Suggestion } from "@/components/suggestions/Suggestion";
import { Skeleton } from "@/components/ui/Skeleton";

export function SuggestionDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isLoading, isError, error } = useGetSuggestion(id, {
    query: { enabled: !Number.isNaN(id) },
  });

  if (Number.isNaN(id)) {
    return <p className="rounded box bg-red-light">Invalid suggestion ID.</p>;
  }

  if (isLoading) {
    return (
      <div className="column gap">
        <Skeleton width="100%" height="40em" />
      </div>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <p className="rounded box bg-red-light">Suggestion not found.</p>;
    }
    return <p className="rounded box bg-red-light">Failed to load suggestion.</p>;
  }

  if (!data) {
    return null;
  }

  return <Suggestion suggestion={data} />;
}
