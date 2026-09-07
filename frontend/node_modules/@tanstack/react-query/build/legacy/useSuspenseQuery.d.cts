import { UseSuspenseQueryOptions, UseSuspenseQueryResult } from "./types.cjs";
import { DefaultError, QueryClient, QueryKey } from "@tanstack/query-core";
//#region src/useSuspenseQuery.d.ts
declare function useSuspenseQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, queryClient?: QueryClient): UseSuspenseQueryResult<TData, TError>;
//#endregion
export { useSuspenseQuery };
//# sourceMappingURL=useSuspenseQuery.d.cts.map