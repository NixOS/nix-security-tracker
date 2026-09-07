"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/HydrationBoundary.tsx
const HydrationBoundary = ({ children, options = {}, state, queryClient }) => {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	const optionsRef = react.useRef(options);
	react.useEffect(() => {
		optionsRef.current = options;
	});
	const hydrationQueue = react.useMemo(() => {
		if (state) {
			if (typeof state !== "object") return;
			const queryCache = client.getQueryCache();
			const queries = state.queries || [];
			const newQueries = [];
			const existingQueries = [];
			for (const dehydratedQuery of queries) {
				const existingQuery = queryCache.get(dehydratedQuery.queryHash);
				if (!existingQuery) newQueries.push(dehydratedQuery);
				else if (dehydratedQuery.state.dataUpdatedAt > existingQuery.state.dataUpdatedAt || dehydratedQuery.promise && existingQuery.state.status !== "pending" && existingQuery.state.fetchStatus !== "fetching" && dehydratedQuery.dehydratedAt !== void 0 && dehydratedQuery.dehydratedAt > existingQuery.state.dataUpdatedAt) existingQueries.push(dehydratedQuery);
			}
			if (newQueries.length > 0) (0, _tanstack_query_core.hydrate)(client, { queries: newQueries }, optionsRef.current);
			if (existingQueries.length > 0) return existingQueries;
		}
	}, [client, state]);
	react.useEffect(() => {
		if (hydrationQueue) (0, _tanstack_query_core.hydrate)(client, { queries: hydrationQueue }, optionsRef.current);
	}, [client, hydrationQueue]);
	return children;
};
//#endregion
exports.HydrationBoundary = HydrationBoundary;

//# sourceMappingURL=HydrationBoundary.cjs.map