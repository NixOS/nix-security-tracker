import { useSearchParams } from "wouter-preact";
import { setParam } from "@/utils/searchParams";

function parsePage(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("page"));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

/** URL-search-param-backed current page of a paginated list (`page`). */
export function usePageParam(): [number, (page: number) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams);
  const setPage = (newPage: number) => {
    setSearchParams(setParam("page", newPage > 1 ? String(newPage) : ""));
    // Changing page scrolls back to the top.
    window.scrollTo({ top: 0 });
  };

  return [page, setPage];
}
