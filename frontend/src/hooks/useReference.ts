import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSuggestionReference } from "@/api/generated/endpoints";
import type { PatchedSuggestionReferenceUpdate } from "@/api/generated/models";
import { moveBetween, optimisticSuggestionHandlers } from "@/hooks/optimisticSuggestion";
import { invalidateActivityLog } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: PatchedSuggestionReferenceUpdate };

export function useReferenceMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionReference({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data: { reference_url, ignored } }: MutationVars) => ({
        ...prev,
        categorized_url_references: moveBetween(
          prev.categorized_url_references,
          ignored ? "active" : "ignored",
          ignored ? "ignored" : "active",
          (r) => r.url === reference_url,
        ),
      }),
      errorTitle: ({ data }) =>
        data.ignored ? "Failed to ignore reference" : "Failed to restore reference",
      conflictTitle: ({ data }) =>
        data.ignored ? "Reference already ignored" : "Reference already restored",
      // A new activity log entry is created server-side.
      // The suggestion cache is correct via the optimistic update.
      onSuccess: () => invalidateActivityLog(queryClient, suggestionId),
    }),
  });
}
