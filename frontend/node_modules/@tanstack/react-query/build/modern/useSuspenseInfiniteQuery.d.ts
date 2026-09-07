import { UseSuspenseInfiniteQueryOptions, UseSuspenseInfiniteQueryResult } from "./types.js";
import { DefaultError, InfiniteData, QueryClient, QueryKey } from "@tanstack/query-core";
//#region src/useSuspenseInfiniteQuery.d.ts
declare function useSuspenseInfiniteQuery<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, queryClient?: QueryClient): UseSuspenseInfiniteQueryResult<TData, TError>;
//#endregion
export { useSuspenseInfiniteQuery };
//# sourceMappingURL=useSuspenseInfiniteQuery.d.ts.map