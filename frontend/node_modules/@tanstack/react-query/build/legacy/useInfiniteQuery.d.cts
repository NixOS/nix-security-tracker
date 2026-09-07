import { DefinedUseInfiniteQueryResult, UseInfiniteQueryOptions, UseInfiniteQueryResult } from "./types.cjs";
import { DefinedInitialDataInfiniteOptions, UndefinedInitialDataInfiniteOptions } from "./infiniteQueryOptions.cjs";
import { DefaultError, InfiniteData, QueryClient, QueryKey } from "@tanstack/query-core";
//#region src/useInfiniteQuery.d.ts
declare function useInfiniteQuery<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, queryClient?: QueryClient): DefinedUseInfiniteQueryResult<TData, TError>;
declare function useInfiniteQuery<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, queryClient?: QueryClient): UseInfiniteQueryResult<TData, TError>;
declare function useInfiniteQuery<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, queryClient?: QueryClient): UseInfiniteQueryResult<TData, TError>;
//#endregion
export { useInfiniteQuery };
//# sourceMappingURL=useInfiniteQuery.d.cts.map