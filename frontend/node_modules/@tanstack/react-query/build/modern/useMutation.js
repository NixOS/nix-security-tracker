"use client";
import { useQueryClient } from "./QueryClientProvider.js";
import * as React from "react";
import { MutationObserver, noop, notifyManager, shouldThrowError } from "@tanstack/query-core";
//#region src/useMutation.ts
function useMutation(options, queryClient) {
	const client = useQueryClient(queryClient);
	const [observer] = React.useState(() => new MutationObserver(client, options));
	React.useEffect(() => {
		observer.setOptions(options);
	}, [observer, options]);
	const result = React.useSyncExternalStore(React.useCallback((onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)), [observer]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	const mutate = React.useCallback((...args) => {
		observer.mutate(args[0], args[1]).catch(noop);
	}, [observer]);
	if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) throw result.error;
	return {
		...result,
		mutate,
		mutateAsync: result.mutate
	};
}
//#endregion
export { useMutation };

//# sourceMappingURL=useMutation.js.map