import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  getGetSuggestionActivityLogQueryKey,
  getGetSuggestionQueryKey,
  useUpdateSuggestionReference,
} from "@/api/generated/endpoints";
import type { PatchedSuggestionReferenceUpdate, Suggestion } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import { toaster } from "@/utils/toaster";

type MutationVars = { id: number; data: PatchedSuggestionReferenceUpdate };
type MutationContext = { previous?: Suggestion };

export function useReferenceMutation(suggestionId: number) {
  const queryClient = useQueryClient();
  const queryKey = getGetSuggestionQueryKey(suggestionId);

  return useUpdateSuggestionReference({
    mutation: {
      onMutate: async ({ data }: MutationVars): Promise<MutationContext> => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<Suggestion>(queryKey);

        queryClient.setQueryData<Suggestion>(queryKey, (prev) => {
          if (!prev) return prev;
          const { reference_url, ignored } = data;
          const refs = prev.categorized_url_references;
          const fromKey = ignored ? "active" : "ignored";
          const toKey = ignored ? "ignored" : "active";
          const moving = refs[fromKey].find((r) => r.url === reference_url);
          if (!moving) return prev;

          return {
            ...prev,
            categorized_url_references: {
              ...refs,
              [fromKey]: refs[fromKey].filter((r) => r.url !== reference_url),
              [toKey]: [...refs[toKey], moving],
            },
          };
        });

        return { previous };
      },
      onError: (err: unknown, vars: MutationVars, context?: MutationContext) => {
        const description = getApiErrorMessage(err);
        if (err instanceof ApiError && err.status === 400) {
          // Likely a stale-state conflict (e.g. another user already ignored/restored this reference).
          // The cached `previous` snapshot is stale too, so refetch instead of rolling back to it.
          const title = vars.data.ignored
            ? "Reference already ignored"
            : "Reference already restored";
          const description =
            "The suggestion might have been stale. It has been re-synchronized with the server.";
          queryClient.invalidateQueries({ queryKey });
          toaster.warning({ title, description });
        } else if (context?.previous) {
          const title = vars.data.ignored
            ? "Failed to ignore reference"
            : "Failed to restore reference";
          queryClient.setQueryData(queryKey, context.previous);
          toaster.error({ title, description });
        }
      },
      onSuccess: () => {
        // A new activity log entry is created server-side.
        // The suggestion cache is correct via the optimistic update above.
        // We only refresh the activity log.
        queryClient.invalidateQueries({
          queryKey: getGetSuggestionActivityLogQueryKey(suggestionId),
        });
      },
    },
  });
}
