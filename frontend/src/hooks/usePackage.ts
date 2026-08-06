import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  getGetSuggestionActivityLogQueryKey,
  useUpdateSuggestionPackage,
} from "@/api/generated/endpoints";
import type {
  PatchedSuggestionPackageUpdate,
  Suggestion,
  SuggestionCategorizedMaintainers,
  SuggestionPackages,
} from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  cancelCachedSuggestionQueries,
  getCachedSuggestion,
  invalidateCachedSuggestion,
  setCachedSuggestion,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

type MutationVars = { id: number; data: PatchedSuggestionPackageUpdate };
type MutationContext = { previous?: Suggestion };

// TODO(@florentc): Deduplicate shared code structure between the references and maintainers counterparts
export function usePackageMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionPackage({
    mutation: {
      onMutate: async ({ data }: MutationVars): Promise<MutationContext> => {
        await cancelCachedSuggestionQueries(queryClient, suggestionId);
        const previous = getCachedSuggestion(queryClient, suggestionId);

        setCachedSuggestion(queryClient, suggestionId, (prev) => {
          const { package_attribute, ignored } = data;
          if (!package_attribute) return prev;

          const fromKey = ignored ? "packages" : "ignored_packages";
          const toKey = ignored ? "ignored_packages" : "packages";
          const moving = prev[fromKey][package_attribute];
          if (!moving) return prev;

          const { [package_attribute]: _removed, ...fromRest } = prev[fromKey];
          const newPackages = {
            ...prev,
            [fromKey]: fromRest,
            [toKey]: { ...prev[toKey], [package_attribute]: moving },
          };

          // Packages moving in/out of `active` change which maintainers count as active (auto ignore/restore maintainers).
          // The alternative is to invalidate the whole suggestion to fetch it back from the server.
          // Doing it quickly here in the frontend makes it possible to have instant optimistic update.
          const categorized_maintainers = recomputeCategorizedMaintainers(
            newPackages.packages,
            prev.categorized_maintainers,
          );

          return { ...newPackages, categorized_maintainers };
        });

        return { previous };
      },
      onError: (err: unknown, vars: MutationVars, context?: MutationContext) => {
        const description = getApiErrorMessage(err);
        if (err instanceof ApiError && err.status === 400) {
          // Likely a stale-state conflict (e.g. another user already ignored/restored this package).
          // The cached `previous` snapshot is stale too, so refetch instead of rolling back to it.
          const title = vars.data.ignored ? "Package already ignored" : "Package already restored";
          const description =
            "The suggestion might have been stale. It has been re-synchronized with the server.";
          invalidateCachedSuggestion(queryClient, suggestionId);
          toaster.warning({ title, description });
        } else if (context?.previous) {
          const title = vars.data.ignored
            ? "Failed to ignore package"
            : "Failed to restore package";
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

/**
 * Client-side port of `categorize_maintainers`
 * Used to give instant feedback (in the maintainer section) to the user when a package is ignored/restored.
 */
function recomputeCategorizedMaintainers(
  activePackages: SuggestionPackages,
  previous: SuggestionCategorizedMaintainers,
): SuggestionCategorizedMaintainers {
  const activePackageMaintainerIds = new Set(
    Object.values(activePackages).flatMap((pkg) => pkg.maintainers.map((m) => m.github_id)),
  );

  return {
    ...previous,
    orphan: previous.original.filter((m) => !activePackageMaintainerIds.has(m.github_id)),
  };
}
