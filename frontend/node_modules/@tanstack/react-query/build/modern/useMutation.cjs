"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/useMutation.ts
function useMutation(options, queryClient) {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	const [observer] = react.useState(() => new _tanstack_query_core.MutationObserver(client, options));
	react.useEffect(() => {
		observer.setOptions(options);
	}, [observer, options]);
	const result = react.useSyncExternalStore(react.useCallback((onStoreChange) => observer.subscribe(_tanstack_query_core.notifyManager.batchCalls(onStoreChange)), [observer]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	const mutate = react.useCallback((...args) => {
		observer.mutate(args[0], args[1]).catch(_tanstack_query_core.noop);
	}, [observer]);
	if (result.error && (0, _tanstack_query_core.shouldThrowError)(observer.options.throwOnError, [result.error])) throw result.error;
	return {
		...result,
		mutate,
		mutateAsync: result.mutate
	};
}
//#endregion
exports.useMutation = useMutation;

//# sourceMappingURL=useMutation.cjs.map