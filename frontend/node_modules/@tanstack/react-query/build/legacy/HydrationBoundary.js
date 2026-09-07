"use client";
import { useQueryClient } from "./QueryClientProvider.js";
import * as React from "react";
import { hydrate } from "@tanstack/query-core";
//#region src/HydrationBoundary.tsx
const HydrationBoundary = ({ children, options = {}, state, queryClient }) => {
	const client = useQueryClient(queryClient);
	const optionsRef = React.useRef(options);
	React.useEffect(() => {
		optionsRef.current = options;
	});
	const hydrationQueue = React.useMemo(() => {
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
			if (newQueries.length > 0) hydrate(client, { queries: newQueries }, optionsRef.current);
			if (existingQueries.length > 0) return existingQueries;
		}
	}, [client, state]);
	React.useEffect(() => {
		if (hydrationQueue) hydrate(client, { queries: hydrationQueue }, optionsRef.current);
	}, [client, hydrationQueue]);
	return children;
};
//#endregion
export { HydrationBoundary };

//# sourceMappingURL=HydrationBoundary.js.map