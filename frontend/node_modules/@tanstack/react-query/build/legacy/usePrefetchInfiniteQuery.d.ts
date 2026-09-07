import { UsePrefetchInfiniteQueryOptions } from "./types.js";
import { DefaultError, InfiniteData, QueryClient, QueryKey } from "@tanstack/query-core";
//#region src/usePrefetchInfiniteQuery.d.ts
declare function usePrefetchInfiniteQuery<TQueryFnData = unknown, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: UsePrefetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, queryClient?: QueryClient): void;
//#endregion
export { usePrefetchInfiniteQuery };
//# sourceMappingURL=usePrefetchInfiniteQuery.d.ts.map