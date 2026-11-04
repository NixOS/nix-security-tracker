import { useQueryClient } from "@tanstack/react-query";
import { getListSuggestionsQueryKey, useBundleSuggestion } from "@/api/generated/endpoints";
import type { PatchedSuggestionBundle } from "@/api/generated/models";
import { optimisticSuggestionHandlers } from "@/hooks/optimisticSuggestion";
import { staleQuietly } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: PatchedSuggestionBundle };

/** Add or remove a suggestion from the issue draft (bundle/unbundle). */
export function useSuggestionBundleMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useBundleSuggestion({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data }: MutationVars) => ({
        ...prev,
        in_issue_draft: data.in_issue_draft ?? prev.in_issue_draft,
      }),
      errorTitle: ({ data }) =>
        data.in_issue_draft ? "Failed to bundle suggestion" : "Failed to unbundle suggestion",
      onSuccess: () => staleQuietly(queryClient, getListSuggestionsQueryKey()),
    }),
  });
}
