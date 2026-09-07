"use client";
import { useQueryClient } from "./QueryClientProvider.js";
import { useIsRestoring } from "./IsRestoringProvider.js";
import { useQueryErrorResetBoundary } from "./QueryErrorResetBoundary.js";
import { ensurePreventErrorBoundaryRetry, getHasError, useClearResetErrorBoundary } from "./errorBoundaryUtils.js";
import { ensureSuspenseTimers, fetchOptimistic, shouldSuspend } from "./suspense.js";
import * as React from "react";
import { QueriesObserver, QueryObserver, noop, notifyManager } from "@tanstack/query-core";
//#region src/useQueries.ts
function useQueries({ queries, ...options }, queryClient) {
	const client = useQueryClient(queryClient);
	const isRestoring = useIsRestoring();
	const errorResetBoundary = useQueryErrorResetBoundary();
	const subscribed = options.subscribed !== false;
	const defaultedQueries = React.useMemo(() => queries.map((opts) => {
		const defaultedOptions = client.defaultQueryOptions(opts);
		defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
		return defaultedOptions;
	}), [
		queries,
		client,
		isRestoring,
		subscribed
	]);
	defaultedQueries.forEach((queryOptions) => {
		ensureSuspenseTimers(queryOptions);
		const query = client.getQueryCache().get(queryOptions.queryHash);
		ensurePreventErrorBoundaryRetry(queryOptions, errorResetBoundary, query);
	});
	useClearResetErrorBoundary(errorResetBoundary);
	const [observer] = React.useState(() => new QueriesObserver(client, defaultedQueries, options));
	const [optimisticResult, getCombinedResult, trackResult] = observer.getOptimisticResult(defaultedQueries, options.combine);
	const shouldSubscribe = !isRestoring && subscribed;
	React.useSyncExternalStore(React.useCallback((onStoreChange) => shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	React.useEffect(() => {
		observer.setQueries(defaultedQueries, options);
	}, [
		defaultedQueries,
		options,
		observer
	]);
	const suspensePromises = optimisticResult.some((result, index) => shouldSuspend(defaultedQueries[index], result)) ? optimisticResult.flatMap((result, index) => {
		const opts = defaultedQueries[index];
		if (opts && shouldSuspend(opts, result)) {
			const queryObserver = new QueryObserver(client, opts);
			return fetchOptimistic(opts, queryObserver, errorResetBoundary);
		}
		return [];
	}) : [];
	if (suspensePromises.length > 0) throw Promise.all(suspensePromises);
	const firstSingleResultWhichShouldThrow = optimisticResult.find((result, index) => {
		const query = defaultedQueries[index];
		return query && getHasError({
			result,
			errorResetBoundary,
			throwOnError: query.throwOnError,
			query: client.getQueryCache().get(query.queryHash),
			suspense: query.suspense
		});
	});
	if (firstSingleResultWhichShouldThrow) throw firstSingleResultWhichShouldThrow.error;
	return getCombinedResult(trackResult());
}
//#endregion
export { useQueries };

//# sourceMappingURL=useQueries.js.map