import { useSearchParams } from "wouter-preact";
import type { ListSuggestionsStatusItem } from "@/api/generated/models";
import { ListSuggestionsStatusItem as Status } from "@/api/generated/models";

/** URL-search-param-backed suggestion list filters. */
export type SuggestionListFilters = {
  statuses: ListSuggestionsStatusItem[];
  inIssueDraft: boolean;
  packageFilter: string;
};

const VALID_STATUSES = new Set<string>(Object.values(Status));

function isValidStatus(value: string): value is ListSuggestionsStatusItem {
  return VALID_STATUSES.has(value);
}

function parseFilters(searchParams: URLSearchParams): SuggestionListFilters {
  return {
    statuses: searchParams.getAll("status").filter(isValidStatus),
    inIssueDraft: searchParams.get("in_issue_draft") === "true",
    packageFilter: searchParams.get("package") ?? "",
  };
}

export function useSuggestionListFilters(): {
  filters: SuggestionListFilters;
  setStatuses: (statuses: ListSuggestionsStatusItem[]) => void;
  setInIssueDraft: (inIssueDraft: boolean) => void;
  setPackageFilter: (packageFilter: string) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);

  // Any filter change invalidates the current page, so we jump back to page 1.
  // Uses `replace` so typing in the package filter doesn't spam browser history.
  const updateParams = (mutate: (next: URLSearchParams) => void) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  const setStatuses = (statuses: ListSuggestionsStatusItem[]) => {
    updateParams((next) => {
      next.delete("status");
      for (const status of statuses) next.append("status", status);
    });
  };

  const setInIssueDraft = (inIssueDraft: boolean) => {
    updateParams((next) => {
      if (inIssueDraft) {
        next.set("in_issue_draft", "true");
      } else {
        next.delete("in_issue_draft");
      }
    });
  };

  const setPackageFilter = (packageFilter: string) => {
    updateParams((next) => {
      const trimmed = packageFilter.trim();
      if (trimmed) {
        next.set("package", trimmed);
      } else {
        next.delete("package");
      }
    });
  };

  return { filters, setStatuses, setInIssueDraft, setPackageFilter };
}
