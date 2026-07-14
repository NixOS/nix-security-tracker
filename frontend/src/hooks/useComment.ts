import { useQueryClient } from "@tanstack/react-query";
import { getGetSuggestionQueryKey, useUpdateSuggestionComment } from "@/api/generated/endpoints";
import type { Suggestion } from "@/api/generated/models";

export function useCommentMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionComment({
    mutation: {
      onSuccess: (data) => {
        const queryKey = getGetSuggestionQueryKey(suggestionId);
        queryClient.setQueryData<Suggestion>(queryKey, (prev) => {
          if (!prev) return prev;
          return { ...prev, comment: data.comment ?? null };
        });
      },
    },
  });
}
