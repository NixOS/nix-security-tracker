import { useQueryClient } from "@tanstack/react-query";
import { getListSuggestionsQueryKey, useUpdateSuggestionPackage } from "@/api/generated/endpoints";
import type {
  PatchedSuggestionPackageUpdate,
  SuggestionMaintainers,
  SuggestionPackages,
} from "@/api/generated/models";
import { optimisticSuggestionHandlers, withStatus } from "@/hooks/optimisticSuggestion";
import { invalidateActivityLog, staleQuietly } from "@/utils/suggestionCache";

type MutationVars = { id: number; data: PatchedSuggestionPackageUpdate };

export function usePackageMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return useUpdateSuggestionPackage({
    mutation: optimisticSuggestionHandlers(queryClient, suggestionId, {
      patch: (prev, { data: { package_attributes, ignored } }: MutationVars) => {
        if (!package_attributes?.length) return prev;

        let packages = prev.packages;
        for (const attr of package_attributes) {
          packages = withStatus(packages, attr, ignored ? "ignored" : "active");
        }

        // Packages becoming active or ignored change which maintainers are orphans.
        // The alternative is to invalidate the whole suggestion to fetch it back from the server.
        // Doing it quickly here in the frontend makes it possible to have instant optimistic update.
        const maintainers = recomputeOrphans(packages, prev.maintainers);

        return { ...prev, packages, maintainers };
      },
      errorTitle: ({ data }) =>
        `Failed to ${data.ignored ? "ignore" : "restore"} ${(data.package_attributes?.length ?? 0) > 1 ? "packages" : "package"}`,
      conflictTitle: ({ data }) =>
        `${(data.package_attributes?.length ?? 0) > 1 ? "Packages" : "Package"} already ${data.ignored ? "ignored" : "restored"}`,
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
 * Client-side port of the orphan rule of `categorize_maintainers`.
 * Used to give instant feedback (in the maintainer section) to the user when a package is ignored/restored.
 */
function recomputeOrphans(
  packages: SuggestionPackages,
  maintainers: SuggestionMaintainers,
): SuggestionMaintainers {
  const activePackageMaintainerIds = new Set(
    Object.values(packages)
      .filter(({ status }) => status === "active")
      .flatMap(({ package: pkg }) => pkg.maintainers.map((m) => String(m.github_id))),
  );
  return Object.fromEntries(
    Object.entries(maintainers).map(([githubId, entry]) => [
      githubId,
      { ...entry, orphan: entry.status !== "added" && !activePackageMaintainerIds.has(githubId) },
    ]),
  );
}
