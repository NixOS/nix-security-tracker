import { useLocation, useSearchParams } from "wouter-preact";
import type { ListSuggestionsStatusItem } from "@/api/generated/models";
import { ListSuggestionsStatusItem as Status } from "@/api/generated/models";
import { paths } from "@/routes/paths";

/** URL-search-param-backed suggestion list filters. */
export type SuggestionListFilters = {
  statuses: ListSuggestionsStatusItem[];
  inIssueDraft: boolean;
  packageFilter: string;
  affectedProduct: string;
  affectedProductVersion: string;
  createdAtAfter: string;
  createdAtBefore: string;
};

const VALID_STATUSES = new Set<string>(Object.values(Status));

function isValidStatus(value: string): value is ListSuggestionsStatusItem {
  return VALID_STATUSES.has(value);
}

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The API rejects malformed dates with a 400, so a hand-edited URL is dropped rather than forwarded.
function parseDay(value: string | null): string {
  return value && DAY_PATTERN.test(value) ? value : "";
}

function parseFilters(searchParams: URLSearchParams): SuggestionListFilters {
  const affectedProduct = searchParams.get("affected_product") ?? "";
  return {
    statuses: searchParams.getAll("status").filter(isValidStatus),
    inIssueDraft: searchParams.get("in_issue_draft") === "true",
    packageFilter: searchParams.get("package") ?? "",
    affectedProduct,
    // The API rejects a version without a product with a 400, so a hand-edited URL drops it.
    affectedProductVersion: affectedProduct
      ? (searchParams.get("affected_product_version") ?? "")
      : "",
    createdAtAfter: parseDay(searchParams.get("created_at_after")),
    createdAtBefore: parseDay(searchParams.get("created_at_before")),
  };
}

/** A pure change to the URL search params. */
export type ParamsUpdate = (params: URLSearchParams) => URLSearchParams;

// An empty value removes the parameter.
const setParam =
  (key: string, value: string): ParamsUpdate =>
  (params) => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    return next;
  };

const pipe =
  (...updates: ParamsUpdate[]): ParamsUpdate =>
  (params) =>
    updates.reduce((acc, update) => update(acc), params);

// Invalidate the current page: jump back to page 1.
const resetPage = setParam("page", "");

export const withPackageFilter = (packageFilter: string): ParamsUpdate =>
  setParam("package", packageFilter.trim());

// The product and its version are written at once, since the version is meaningless without the product.
// Omitting the version drops one belonging to a previous product.
export const withAffectedProductFilter = (product: string, version = ""): ParamsUpdate => {
  const trimmedProduct = product.trim();
  return pipe(
    setParam("affected_product", trimmedProduct),
    setParam("affected_product_version", trimmedProduct ? version.trim() : ""),
  );
};

const withStatuses =
  (statuses: ListSuggestionsStatusItem[]): ParamsUpdate =>
  (params) => {
    const next = new URLSearchParams(params);
    next.delete("status");
    for (const status of statuses) next.append("status", status);
    return next;
  };

// Both bounds are written at once.
// It should be a single browser history entry.
const withCreatedAtRange = (after: string, before: string): ParamsUpdate =>
  pipe(
    setParam("created_at_after", parseDay(after)),
    setParam("created_at_before", parseDay(before)),
  );

/**
 * Builds links to the suggestion list with a filter change applied.
 * On the suggestion list, the other active filters are kept; elsewhere, the link starts from no filter.
 */
export function useSuggestionListFilterHref(): (update: ParamsUpdate) => string {
  const [location] = useLocation();
  const [searchParams] = useSearchParams();
  const base = location === paths.suggestions ? searchParams : new URLSearchParams();
  return (update) => `${paths.suggestions}?${pipe(update, resetPage)(base)}`;
}

export function useSuggestionListFilters(): {
  filters: SuggestionListFilters;
  setStatuses: (statuses: ListSuggestionsStatusItem[]) => void;
  setInIssueDraft: (inIssueDraft: boolean) => void;
  setPackageFilter: (packageFilter: string) => void;
  setAffectedProductFilter: (product: string, version: string) => void;
  setCreatedAtRange: (after: string, before: string) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);

  // Uses `replace` so typing in the package filter doesn't spam browser history.
  const updateParams = (update: ParamsUpdate) => {
    setSearchParams(pipe(update, resetPage), { replace: true });
  };

  return {
    filters,
    setStatuses: (statuses) => updateParams(withStatuses(statuses)),
    setInIssueDraft: (inIssueDraft) =>
      updateParams(setParam("in_issue_draft", inIssueDraft ? "true" : "")),
    setPackageFilter: (packageFilter) => updateParams(withPackageFilter(packageFilter)),
    setAffectedProductFilter: (product, version) =>
      updateParams(withAffectedProductFilter(product, version)),
    setCreatedAtRange: (after, before) => updateParams(withCreatedAtRange(after, before)),
  };
}
