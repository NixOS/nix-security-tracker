/**
 * Computes which packages in a notification match the user (maintainer or subscriber).
 * The server already provides the info at fetch time.
 * This locally reimplements for local live updates.
 */
import type { Suggestion, SuggestionPackages } from "@/api/generated/models";

/** Packages in `suggestion.packages` (active, non-ignored) maintained by `username`. */
export function getMatchingMaintainedPackages(
  suggestion: Suggestion,
  username: string | undefined,
): SuggestionPackages {
  if (!username) return {};
  return Object.fromEntries(
    Object.entries(suggestion.packages).filter(([, pkg]) =>
      pkg.maintainers.some((m) => m.github === username),
    ),
  );
}

/** Packages in `suggestion.packages` (active, non-ignored) the user is subscribed to. */
export function getMatchingSubscribedPackages(
  suggestion: Suggestion,
  subscribedPackages: string[] | undefined,
): SuggestionPackages {
  if (!subscribedPackages || subscribedPackages.length === 0) return {};
  const subscribedAttrs = new Set(subscribedPackages);
  return Object.fromEntries(
    Object.entries(suggestion.packages).filter(([attr]) => subscribedAttrs.has(attr)),
  );
}

/** A notification is obsolete once it no longer matches any package the user follows or maintains. */
export function isNotificationObsolete(
  matchingMaintainedPackages: SuggestionPackages,
  matchingSubscribedPackages: SuggestionPackages,
): boolean {
  return (
    Object.keys(matchingMaintainedPackages).length === 0 &&
    Object.keys(matchingSubscribedPackages).length === 0
  );
}
