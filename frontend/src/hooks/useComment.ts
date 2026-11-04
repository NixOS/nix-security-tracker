import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSuggestionComment } from "@/api/generated/endpoints";
import type { PatchedSuggestionComment, SuggestionComment } from "@/api/generated/models";
import { optimisticSuggestionHandlers } from "@/hooks/optimisticSuggestion";
import { setCachedSuggestion } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: PatchedSuggestionComment };

export function useCommentMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionComment({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data }: MutationVars) => ({ ...prev, comment: data.comment || null }),
      // NOTE(@florentc): The comment box keeps the unsaved text and flags the error, so the cache isn't rolled back.
      rollback: false,
      errorTitle: () => "Failed to save comment",
      onSuccess: (data: SuggestionComment) =>
        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          comment: data.comment ?? null,
        })),
    }),
  });
}
