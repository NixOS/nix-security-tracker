/**
 * Computes which packages in a notification match the user (maintainer or subscriber).
 * The server already provides the info at fetch time.
 * This locally reimplements for local live updates.
 */
import type { Suggestion, SuggestionPackage } from "@/api/generated/models";

/** Packages in `suggestion.packages` (active, non-ignored) maintained by `username`. */
export function getMatchingMaintainedPackages(
  suggestion: Suggestion,
  username: string | undefined,
): readonly SuggestionPackage[] {
  if (!username) return [];
  return suggestion.packages.filter((pkg) => pkg.maintainers.some((m) => m.github === username));
}

/** Packages in `suggestion.packages` (active, non-ignored) with an attribute path the user is subscribed to. */
export function getMatchingSubscribedPackages(
  suggestion: Suggestion,
  subscribedPackages: string[] | undefined,
): readonly SuggestionPackage[] {
  if (!subscribedPackages || subscribedPackages.length === 0) return [];
  const subscribedAttrs = new Set(subscribedPackages);
  return suggestion.packages.filter((pkg) =>
    pkg.attrpaths.some((a) => subscribedAttrs.has(a.attrpath)),
  );
}

/** A notification is obsolete once it no longer matches any package the user follows or maintains. */
export function isNotificationObsolete(
  matchingMaintainedPackages: readonly SuggestionPackage[],
  matchingSubscribedPackages: readonly SuggestionPackage[],
): boolean {
  return matchingMaintainedPackages.length === 0 && matchingSubscribedPackages.length === 0;
}
