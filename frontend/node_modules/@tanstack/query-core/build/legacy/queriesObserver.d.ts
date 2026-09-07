import { t as Subscribable } from "./subscribable-CbifVTKz.js";
import { $n as Query, At as QueryObserverOptions, Pt as QueryObserverResult, on as QueryClient, rr as QueryObserver } from "./hydration-Bjs0MSgg.js";
//#region src/queriesObserver.d.ts
type QueriesObserverListener = (result: Array<QueryObserverResult>) => void;
type CombineFn<TCombinedResult> = (result: Array<QueryObserverResult>) => TCombinedResult;
interface QueriesObserverOptions<TCombinedResult = Array<QueryObserverResult>> {
  combine?: CombineFn<TCombinedResult>;
}
declare class QueriesObserver<TCombinedResult = Array<QueryObserverResult>> extends Subscribable<QueriesObserverListener> {
  #private;
  constructor(client: QueryClient, queries: Array<QueryObserverOptions<any, any, any, any, any>>, options?: QueriesObserverOptions<TCombinedResult>);
  protected onSubscribe(): void;
  protected onUnsubscribe(): void;
  destroy(): void;
  setQueries(queries: Array<QueryObserverOptions>, options?: QueriesObserverOptions<TCombinedResult>): void;
  getCurrentResult(): Array<QueryObserverResult>;
  getQueries(): Query<unknown, Error, unknown, readonly unknown[]>[];
  getObservers(): QueryObserver<unknown, Error, unknown, unknown, readonly unknown[]>[];
  getOptimisticResult(queries: Array<QueryObserverOptions>, combine: CombineFn<TCombinedResult> | undefined): [rawResult: Array<QueryObserverResult>, combineResult: (r?: Array<QueryObserverResult>) => TCombinedResult, trackResult: () => Array<QueryObserverResult>];
}
//#endregion
export { QueriesObserver, QueriesObserverOptions };
//# sourceMappingURL=queriesObserver.d.ts.map