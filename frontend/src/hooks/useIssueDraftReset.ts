import { useQueryClient } from "@tanstack/react-query";
import { getListSuggestionsQueryKey, useResetIssueDraft } from "@/api/generated/endpoints";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  clearCachedIssueDraftLists,
  patchCachedSuggestionsMatching,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

/** Remove all suggestions from the issue draft. */
export function useIssueDraftResetMutation() {
  const queryClient = useQueryClient();

  return useResetIssueDraft({
    mutation: {
      onMutate: () => {
        patchCachedSuggestionsMatching(
          queryClient,
          (s) => s.in_issue_draft,
          (s) => ({ ...s, in_issue_draft: false }),
        );
        clearCachedIssueDraftLists(queryClient);
      },
      onError: (err: unknown) => {
        queryClient.invalidateQueries({ queryKey: getListSuggestionsQueryKey() });
        toaster.error({
          title: "Failed to reset the issue draft",
          description: getApiErrorMessage(err),
        });
      },
    },
  });
}
