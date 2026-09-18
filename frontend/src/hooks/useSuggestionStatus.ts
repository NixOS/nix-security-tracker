import { useQueryClient } from "@tanstack/react-query";
import {
  getGetSuggestionActivityLogQueryKey,
  getListSuggestionsQueryKey,
  useChangeSuggestionStatus,
} from "@/api/generated/endpoints";
import type { Suggestion, SuggestionStatus as SuggestionStatusData } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  cancelCachedSuggestionQueries,
  getCachedSuggestion,
  setCachedSuggestion,
  staleQuietly,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

type MutationVars = { id: number; data: SuggestionStatusData };
type MutationContext = { previous?: Suggestion };

export function useSuggestionStatusMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useChangeSuggestionStatus({
    mutation: {
      onMutate: async ({ data }: MutationVars): Promise<MutationContext> => {
        await cancelCachedSuggestionQueries(queryClient, suggestionId);
        const previous = getCachedSuggestion(queryClient, suggestionId);

        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          status: data.status,
          rejection_reason: data.status === "rejected" ? data.rejection_reason : undefined,
          // Remove from issue draft during optimistic update
          in_issue_draft: prev.in_issue_draft && data.status === "accepted",
        }));

        return { previous };
      },
      onError: (err: unknown, _vars: MutationVars, context?: MutationContext) => {
        const description = getApiErrorMessage(err);
        if (context?.previous) {
          const snapshot = context.previous;
          setCachedSuggestion(queryClient, suggestionId, () => snapshot);
        }
        toaster.error({ title: "Failed to change status", description });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetSuggestionActivityLogQueryKey(suggestionId),
        });
        staleQuietly(queryClient, getListSuggestionsQueryKey());
      },
    },
  });
}
