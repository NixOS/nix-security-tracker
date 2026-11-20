import { useSearchParams } from "wouter-preact";
import { type ParamsUpdate, pipe, resetPage } from "@/utils/searchParams";

export function useFilterParams(): [URLSearchParams, (update: ParamsUpdate) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Uses `replace` so changing filters doesn't spam browser history.
  const updateParams = (update: ParamsUpdate) => {
    setSearchParams(pipe(update, resetPage), { replace: true });
  };

  return [searchParams, updateParams];
}
