import { useQueryClient } from "@tanstack/react-query";
import { getListSuggestionsQueryKey, useUpdateSuggestionPackage } from "@/api/generated/endpoints";
import type {
  PatchedSuggestionPackageUpdate,
  SuggestionCategorizedMaintainers,
  SuggestionPackages,
} from "@/api/generated/models";
import { optimisticSuggestionHandlers } from "@/hooks/optimisticSuggestion";
import { invalidateActivityLog, staleQuietly } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: PatchedSuggestionPackageUpdate };

export function usePackageMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionPackage({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data: { package_attribute, ignored } }: MutationVars) => {
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
      },
      errorTitle: ({ data }) =>
        data.ignored ? "Failed to ignore package" : "Failed to restore package",
      conflictTitle: ({ data }) =>
        data.ignored ? "Package already ignored" : "Package already restored",
      onSuccess: () => {
        // A new activity log entry is created server-side.
        // The suggestion cache is correct via the optimistic update.
        invalidateActivityLog(queryClient, suggestionId);
        // A package moving in/out of `active` can affect the "with package" list filter.
        staleQuietly(queryClient, getListSuggestionsQueryKey());
      },
    }),
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
