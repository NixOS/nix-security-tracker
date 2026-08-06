import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  getGetSuggestionActivityLogQueryKey,
  useUpdateSuggestionMaintainer,
} from "@/api/generated/endpoints";
import type { PatchedSuggestionMaintainerUpdate, Suggestion } from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  cancelCachedSuggestionQueries,
  getCachedSuggestion,
  invalidateCachedSuggestion,
  setCachedSuggestion,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

type MutationVars = { id: number; data: PatchedSuggestionMaintainerUpdate };
type MutationContext = { previous?: Suggestion };

export function useMaintainerMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionMaintainer({
    mutation: {
      onMutate: async ({ data }: MutationVars): Promise<MutationContext> => {
        await cancelCachedSuggestionQueries(queryClient, suggestionId);
        const previous = getCachedSuggestion(queryClient, suggestionId);

        setCachedSuggestion(queryClient, suggestionId, (prev) => {
          const { github_id, ignored } = data;
          const maintainers = prev.categorized_maintainers;
          const fromKey = ignored ? "active" : "ignored";
          const toKey = ignored ? "ignored" : "active";
          const moving = maintainers[fromKey].find((m) => m.github_id === github_id);
          if (!moving) return prev;

          return {
            ...prev,
            categorized_maintainers: {
              ...maintainers,
              [fromKey]: maintainers[fromKey].filter((m) => m.github_id !== github_id),
              [toKey]: [...maintainers[toKey], moving],
            },
          };
        });

        return { previous };
      },
      onError: (err: unknown, vars: MutationVars, context?: MutationContext) => {
        const description = getApiErrorMessage(err);
        if (err instanceof ApiError && err.status === 400) {
          // Likely a stale-state conflict (e.g. another user already ignored/restored this maintainer).
          // The cached `previous` snapshot is stale too, so refetch instead of rolling back to it.
          const title = vars.data.ignored
            ? "Maintainer already ignored"
            : "Maintainer already restored";
          const description =
            "The suggestion might have been stale. It has been re-synchronized with the server.";
          invalidateCachedSuggestion(queryClient, suggestionId);
          toaster.warning({ title, description });
        } else if (context?.previous) {
          const title = vars.data.ignored
            ? "Failed to ignore maintainer"
            : "Failed to restore maintainer";
          const snapshot = context.previous;
          setCachedSuggestion(queryClient, suggestionId, () => snapshot);
          toaster.error({ title, description });
        }
      },
      onSuccess: () => {
        // A new activity log entry is created server-side.
        // The suggestion cache is correct via the optimistic update above.
        // We only refresh the activity log.
        queryClient.invalidateQueries({
          queryKey: getGetSuggestionActivityLogQueryKey(suggestionId),
        });
      },
    },
  });
}
