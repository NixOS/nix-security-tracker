import { useQueryClient } from "@tanstack/react-query";
import {
  useAddSuggestionMaintainer,
  useDeleteSuggestionMaintainer,
  useUpdateSuggestionMaintainer,
} from "@/api/generated/endpoints";
import type {
  DeleteSuggestionMaintainerParams,
  PatchedSuggestionMaintainerUpdate,
} from "@/api/generated/models";
import { optimisticSuggestionHandlers, withStatus } from "@/hooks/optimisticSuggestion";
import { invalidateActivityLog, setCachedSuggestion } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: PatchedSuggestionMaintainerUpdate };

export function useMaintainerMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionMaintainer({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data: { github_id, ignored } }: MutationVars) => ({
        ...prev,
        maintainers: withStatus(
          prev.maintainers,
          github_id?.toString(),
          ignored ? "ignored" : "active",
        ),
      }),
      errorTitle: ({ data }) =>
        data.ignored ? "Failed to ignore maintainer" : "Failed to restore maintainer",
      conflictTitle: ({ data }) =>
        data.ignored ? "Maintainer already ignored" : "Maintainer already restored",
      // A new activity log entry is created server-side.
      // The suggestion cache is correct via the optimistic update.
      onSuccess: () => invalidateActivityLog(queryClient, suggestionId),
    }),
  });
}

export function useAddMaintainerMutation(suggestionId: number) {
  // No optimistic update: we need to check the provided user handle is valid.

  const queryClient = useQueryClient();

  return useAddSuggestionMaintainer({
    mutation: {
      onSuccess: (maintainer) => {
        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          maintainers: {
            ...prev.maintainers,
            [String(maintainer.github_id)]: { maintainer, status: "added", orphan: false },
          },
        }));
        invalidateActivityLog(queryClient, suggestionId);
      },
    },
  });
}

type DeleteMutationVars = { id: number; params: DeleteSuggestionMaintainerParams };

export function useDeleteMaintainerMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useDeleteSuggestionMaintainer({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { params }: DeleteMutationVars) => {
        const { [String(params.github_id)]: _deleted, ...maintainers } = prev.maintainers;
        return { ...prev, maintainers };
      },
      errorTitle: () => "Failed to delete maintainer",
      conflictTitle: () => "Maintainer already removed",
      onSuccess: () => invalidateActivityLog(queryClient, suggestionId),
    }),
  });
}
