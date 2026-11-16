import { useSearchParams } from "wouter-preact";
import { setParam } from "@/utils/searchParams";

/**
 * URL-search-param-backed list-wide view mode.
 *
 * @param key - The search param holding the view mode.
 * @param validModes - Values accepted from the URL. Anything else falls back to the default.
 * @param defaultMode - Fallback when the param is absent/invalid and which param is not shown in the URL.
 */
export function useViewModeParam<Mode extends string>(
  key: string,
  validModes: readonly Mode[],
  defaultMode: Mode,
): {
  viewMode: Mode;
  setViewMode: (viewMode: Mode) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(key);
  const viewMode = validModes.find((mode) => mode === raw) ?? defaultMode;

  const setViewMode = (next: Mode) => {
    setSearchParams(setParam(key, next === defaultMode ? "" : next), { replace: true });
  };

  return { viewMode, setViewMode };
}
