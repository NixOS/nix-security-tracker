import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  getGetSuggestionActivityLogQueryKey,
  getListSuggestionsQueryKey,
  useUpdateSuggestionPackage,
} from "@/api/generated/endpoints";
import type {
  PatchedSuggestionPackageUpdate,
  Suggestion,
  SuggestionCategorizedMaintainers,
  SuggestionPackage,
} from "@/api/generated/models";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  cancelCachedSuggestionQueries,
  getCachedSuggestion,
  invalidateCachedSuggestion,
  setCachedSuggestion,
  staleQuietly,
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
          const { package_id, ignored } = data;
          if (package_id === undefined) return prev;

          const fromKey = ignored ? "packages" : "ignored_packages";
          const toKey = ignored ? "ignored_packages" : "packages";
          const moving = prev[fromKey].find((pkg) => pkg.id === package_id);
          if (!moving) return prev;

          const newPackages = {
            ...prev,
            [fromKey]: prev[fromKey].filter((pkg) => pkg.id !== package_id),
            // Same order as the server, so the list doesn't jump when the suggestion is refetched.
            [toKey]: [...prev[toKey], moving].sort(compareSuggestionPackages),
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
        queryClient.invalidateQueries({
          queryKey: getGetSuggestionActivityLogQueryKey(suggestionId),
        });
        // A package moving in/out of `active` can affect the "with package" list filter.
        staleQuietly(queryClient, getListSuggestionsQueryKey());
      },
    },
  });
}

/**
 * Client-side port of `categorize_maintainers`
 * Used to give instant feedback (in the maintainer section) to the user when a package is ignored/restored.
 */
function recomputeCategorizedMaintainers(
  activePackages: readonly SuggestionPackage[],
  previous: SuggestionCategorizedMaintainers,
): SuggestionCategorizedMaintainers {
  const activePackageMaintainerIds = new Set(
    activePackages.flatMap((pkg) => pkg.maintainers.map((m) => m.github_id)),
  );

  return {
    ...previous,
    orphan: previous.original.filter((m) => !activePackageMaintainerIds.has(m.github_id)),
  };
}

/** Order of packages in a suggestion, as sorted by the server: by name, then by id. */
function compareSuggestionPackages(a: SuggestionPackage, b: SuggestionPackage): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : a.id - b.id;
}
