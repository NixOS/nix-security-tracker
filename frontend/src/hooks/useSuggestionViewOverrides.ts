import { useState } from "preact/hooks";
import type { SuggestionViewMode } from "./useSuggestionViewMode";

/** Per-suggestion view mode overrides, keyed by suggestion id */
export function useSuggestionViewOverrides(): {
  getOverride: (suggestionId: number) => SuggestionViewMode | undefined;
  /** `undefined` clears the override: falls back to list-wide setting. */
  setOverride: (suggestionId: number, viewMode: SuggestionViewMode | undefined) => void;
} {
  const [overrides, setOverrides] = useState<Record<number, SuggestionViewMode>>({});

  const getOverride = (suggestionId: number) => overrides[suggestionId];

  const setOverride = (suggestionId: number, viewMode: SuggestionViewMode | undefined) => {
    setOverrides((prev) => {
      if (viewMode === undefined) {
        const { [suggestionId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [suggestionId]: viewMode };
    });
  };

  return { getOverride, setOverride };
}
