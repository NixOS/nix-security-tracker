import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSuggestionComment } from "@/api/generated/endpoints";
import type { PatchedSuggestionComment } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import { cancelCachedSuggestionQueries, setCachedSuggestion } from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

type MutationVars = { id: number; data: PatchedSuggestionComment };

export function useCommentMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionComment({
    mutation: {
      onMutate: async ({ data }: MutationVars): Promise<void> => {
        await cancelCachedSuggestionQueries(queryClient, suggestionId);

        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          comment: data.comment || null,
        }));
      },
      onError: (error: unknown) => {
        toaster.error({
          title: "Failed to save comment",
          description: getApiErrorMessage(error),
        });
      },
      onSuccess: (data) => {
        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          comment: data.comment ?? null,
        }));
      },
    },
  });
}
