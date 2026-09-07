"use client";
import { useQueryClient } from "./QueryClientProvider.js";
import * as React from "react";
import { notifyManager } from "@tanstack/query-core";
//#region src/useIsFetching.ts
function useIsFetching(filters, queryClient) {
	const client = useQueryClient(queryClient);
	const queryCache = client.getQueryCache();
	return React.useSyncExternalStore(React.useCallback((onStoreChange) => queryCache.subscribe(notifyManager.batchCalls(onStoreChange)), [queryCache]), () => client.isFetching(filters), () => client.isFetching(filters));
}
//#endregion
export { useIsFetching };

//# sourceMappingURL=useIsFetching.js.map