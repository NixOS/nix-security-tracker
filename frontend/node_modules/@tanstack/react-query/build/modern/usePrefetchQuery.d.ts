import { UsePrefetchQueryOptions } from "./types.js";
import { DefaultError, QueryClient, QueryKey } from "@tanstack/query-core";
//#region src/usePrefetchQuery.d.ts
declare function usePrefetchQuery<TQueryFnData = unknown, TError = DefaultError, TData = TQueryFnData, TQueryData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UsePrefetchQueryOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>, queryClient?: QueryClient): void;
//#endregion
export { usePrefetchQuery };
//# sourceMappingURL=usePrefetchQuery.d.ts.map