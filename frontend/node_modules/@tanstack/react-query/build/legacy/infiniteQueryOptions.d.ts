import { UseInfiniteQueryOptions } from "./types.js";
import { DefaultError, InfiniteData, InitialDataFunction, NonUndefinedGuard, OmitKeyof, QueryKey, QueryKeyWithDataTag, SkipToken } from "@tanstack/query-core";
//#region src/infiniteQueryOptions.d.ts
type UndefinedInitialDataInfiniteOptions<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown> = UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
  initialData?: undefined | NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>> | InitialDataFunction<NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>>;
};
type UnusedSkipTokenInfiniteOptions<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown> = OmitKeyof<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, 'queryFn'> & {
  queryFn?: Exclude<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>['queryFn'], SkipToken | undefined>;
};
type DefinedInitialDataInfiniteOptions<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown> = UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
  initialData: NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>> | (() => NonUndefinedGuard<InfiniteData<TQueryFnData, TPageParam>>) | undefined;
};
declare function infiniteQueryOptions<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>): DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & QueryKeyWithDataTag<TQueryKey, InfiniteData<TQueryFnData>, TError>;
declare function infiniteQueryOptions<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: UnusedSkipTokenInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>): UnusedSkipTokenInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & QueryKeyWithDataTag<TQueryKey, InfiniteData<TQueryFnData>, TError>;
declare function infiniteQueryOptions<TQueryFnData, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown>(options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>): UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & QueryKeyWithDataTag<TQueryKey, InfiniteData<TQueryFnData>, TError>;
//#endregion
export { DefinedInitialDataInfiniteOptions, UndefinedInitialDataInfiniteOptions, UnusedSkipTokenInfiniteOptions, infiniteQueryOptions };
//# sourceMappingURL=infiniteQueryOptions.d.ts.map