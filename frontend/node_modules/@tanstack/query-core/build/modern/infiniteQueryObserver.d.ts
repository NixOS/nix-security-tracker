import { t as Subscribable } from "./subscribable-CbifVTKz.js";
import { $n as Query, A as InfiniteData, C as FetchPreviousPageOptions, Ct as QueryKey, F as InfiniteQueryObserverOptions, S as FetchNextPageOptions, f as DefaultError, m as DefaultedInfiniteQueryObserverOptions, on as QueryClient, rr as QueryObserver, z as InfiniteQueryObserverResult } from "./hydration-Bjs0MSgg.js";
//#region src/infiniteQueryObserver.d.ts
type InfiniteQueryObserverListener<TData, TError> = (result: InfiniteQueryObserverResult<TData, TError>) => void;
declare class InfiniteQueryObserver<TQueryFnData = unknown, TError = DefaultError, TData = InfiniteData<TQueryFnData>, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown> extends QueryObserver<TQueryFnData, TError, TData, InfiniteData<TQueryFnData, TPageParam>, TQueryKey> {
  subscribe: Subscribable<InfiniteQueryObserverListener<TData, TError>>['subscribe'];
  getCurrentResult: ReplaceReturnType<QueryObserver<TQueryFnData, TError, TData, InfiniteData<TQueryFnData, TPageParam>, TQueryKey>['getCurrentResult'], InfiniteQueryObserverResult<TData, TError>>;
  protected fetch: ReplaceReturnType<QueryObserver<TQueryFnData, TError, TData, InfiniteData<TQueryFnData, TPageParam>, TQueryKey>['fetch'], Promise<InfiniteQueryObserverResult<TData, TError>>>;
  constructor(client: QueryClient, options: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>);
  protected bindMethods(): void;
  setOptions(options: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>): void;
  getOptimisticResult(options: DefaultedInfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>): InfiniteQueryObserverResult<TData, TError>;
  fetchNextPage(options?: FetchNextPageOptions): Promise<InfiniteQueryObserverResult<TData, TError>>;
  fetchPreviousPage(options?: FetchPreviousPageOptions): Promise<InfiniteQueryObserverResult<TData, TError>>;
  protected createResult(query: Query<TQueryFnData, TError, InfiniteData<TQueryFnData, TPageParam>, TQueryKey>, options: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>): InfiniteQueryObserverResult<TData, TError>;
}
type ReplaceReturnType<TFunction extends (...args: Array<any>) => unknown, TReturn> = (...args: Parameters<TFunction>) => TReturn;
//#endregion
export { InfiniteQueryObserver };
//# sourceMappingURL=infiniteQueryObserver.d.ts.map