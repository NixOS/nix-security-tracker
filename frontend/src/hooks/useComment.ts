import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSuggestionComment } from "@/api/generated/endpoints";
import { setCachedSuggestion } from "@/utils/suggestionCache";

export function useCommentMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionComment({
    mutation: {
      onSuccess: (data) => {
        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          comment: data.comment ?? null,
        }));
      },
    },
  });
}
