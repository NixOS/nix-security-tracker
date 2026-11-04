import { useQueryClient } from "@tanstack/react-query";
import { getListSuggestionsQueryKey, useChangeSuggestionStatus } from "@/api/generated/endpoints";
import type { SuggestionStatus as SuggestionStatusData } from "@/api/generated/models";
import { optimisticSuggestionHandlers } from "@/hooks/optimisticSuggestion";
import { invalidateActivityLog, staleQuietly } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: SuggestionStatusData };

export function useSuggestionStatusMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useChangeSuggestionStatus({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data }: MutationVars) => ({
        ...prev,
        status: data.status,
        rejection_reason: data.status === "rejected" ? data.rejection_reason : undefined,
        // Remove from issue draft if necessary during optimistic update
        in_issue_draft: prev.in_issue_draft && data.status === "accepted",
      }),
      errorTitle: () => "Failed to change status",
      onSuccess: () => {
        invalidateActivityLog(queryClient, suggestionId);
        staleQuietly(queryClient, getListSuggestionsQueryKey());
      },
    }),
  });
}
