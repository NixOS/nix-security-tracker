"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
const require_IsRestoringProvider = require("./IsRestoringProvider.cjs");
const require_QueryErrorResetBoundary = require("./QueryErrorResetBoundary.cjs");
const require_errorBoundaryUtils = require("./errorBoundaryUtils.cjs");
const require_suspense = require("./suspense.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/useQueries.ts
function useQueries({ queries, ...options }, queryClient) {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	const isRestoring = require_IsRestoringProvider.useIsRestoring();
	const errorResetBoundary = require_QueryErrorResetBoundary.useQueryErrorResetBoundary();
	const subscribed = options.subscribed !== false;
	const defaultedQueries = react.useMemo(() => queries.map((opts) => {
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
		require_suspense.ensureSuspenseTimers(queryOptions);
		const query = client.getQueryCache().get(queryOptions.queryHash);
		require_errorBoundaryUtils.ensurePreventErrorBoundaryRetry(queryOptions, errorResetBoundary, query);
	});
	require_errorBoundaryUtils.useClearResetErrorBoundary(errorResetBoundary);
	const [observer] = react.useState(() => new _tanstack_query_core.QueriesObserver(client, defaultedQueries, options));
	const [optimisticResult, getCombinedResult, trackResult] = observer.getOptimisticResult(defaultedQueries, options.combine);
	const shouldSubscribe = !isRestoring && subscribed;
	react.useSyncExternalStore(react.useCallback((onStoreChange) => shouldSubscribe ? observer.subscribe(_tanstack_query_core.notifyManager.batchCalls(onStoreChange)) : _tanstack_query_core.noop, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	react.useEffect(() => {
		observer.setQueries(defaultedQueries, options);
	}, [
		defaultedQueries,
		options,
		observer
	]);
	const suspensePromises = optimisticResult.some((result, index) => require_suspense.shouldSuspend(defaultedQueries[index], result)) ? optimisticResult.flatMap((result, index) => {
		const opts = defaultedQueries[index];
		if (opts && require_suspense.shouldSuspend(opts, result)) {
			const queryObserver = new _tanstack_query_core.QueryObserver(client, opts);
			return require_suspense.fetchOptimistic(opts, queryObserver, errorResetBoundary);
		}
		return [];
	}) : [];
	if (suspensePromises.length > 0) throw Promise.all(suspensePromises);
	const firstSingleResultWhichShouldThrow = optimisticResult.find((result, index) => {
		const query = defaultedQueries[index];
		return query && require_errorBoundaryUtils.getHasError({
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
exports.useQueries = useQueries;

//# sourceMappingURL=useQueries.cjs.map