import { DefinedUseQueryResult, UseQueryOptions, UseQueryResult } from "./types.cjs";
import { DefinedInitialDataOptions, UndefinedInitialDataOptions } from "./queryOptions.cjs";
import { DefaultError, QueryClient, QueryKey } from "@tanstack/query-core";
//#region src/useQuery.d.ts
declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError>;
declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryResult<TData, TError>;
declare function useQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseQueryResult<TData, TError>;
//#endregion
export { useQuery };
//# sourceMappingURL=useQuery.d.cts.map