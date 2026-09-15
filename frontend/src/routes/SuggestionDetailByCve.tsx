import { useEffect } from "preact/hooks";
import { useLocation, useParams } from "wouter-preact";
import { ApiError } from "@/api/client";
import { useGetSuggestionByCve } from "@/api/generated/endpoints";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Resolves a suggestion by its CVE ID and redirects to the canonical `by-id` detail page.
 */
export function SuggestionDetailByCve() {
  const params = useParams<{ cveId: string }>();
  const [, setLocation] = useLocation();

  const { data, isLoading, isError, error } = useGetSuggestionByCve(params.cveId, {
    activity_log: true,
  });

  useEffect(() => {
    if (data) {
      setLocation(`/ui-v2/suggestions/by-id/${data.id}`, { replace: true });
    }
  }, [data, setLocation]);

  if (isLoading || data) {
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

  return null;
}
