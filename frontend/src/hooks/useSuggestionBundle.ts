import { useQueryClient } from "@tanstack/react-query";
import { getListSuggestionsQueryKey, useBundleSuggestion } from "@/api/generated/endpoints";
import type { PatchedSuggestionBundle, Suggestion } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  cancelCachedSuggestionQueries,
  getCachedSuggestion,
  setCachedSuggestion,
  staleQuietly,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

type MutationVars = { id: number; data: PatchedSuggestionBundle };
type MutationContext = { previous?: Suggestion };

/** Add or remove a suggestion from the issue draft (bundle/unbundle). */
export function useSuggestionBundleMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useBundleSuggestion({
    mutation: {
      onMutate: async ({ data }: MutationVars): Promise<MutationContext> => {
        await cancelCachedSuggestionQueries(queryClient, suggestionId);
        const previous = getCachedSuggestion(queryClient, suggestionId);

        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          in_issue_draft: data.in_issue_draft ?? prev.in_issue_draft,
        }));

        return { previous };
      },
      onSuccess: () => {
        staleQuietly(queryClient, getListSuggestionsQueryKey());
      },
      onError: (err: unknown, vars: MutationVars, context?: MutationContext) => {
        const description = getApiErrorMessage(err);
        if (context?.previous) {
          const snapshot = context.previous;
          setCachedSuggestion(queryClient, suggestionId, () => snapshot);
        }
        const title = vars.data.in_issue_draft
          ? "Failed to bundle suggestion"
          : "Failed to unbundle suggestion";
        toaster.error({ title, description });
      },
    },
  });
}
