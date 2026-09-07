"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/useMutationState.ts
function useIsMutating(filters, queryClient) {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	return useMutationState({ filters: {
		...filters,
		status: "pending"
	} }, client).length;
}
function getResult(mutationCache, options) {
	return mutationCache.findAll(options.filters).map((mutation) => options.select ? options.select(mutation) : mutation.state);
}
function useMutationState(options = {}, queryClient) {
	const mutationCache = require_QueryClientProvider.useQueryClient(queryClient).getMutationCache();
	const optionsRef = react.useRef(options);
	const result = react.useRef(null);
	if (result.current === null) result.current = getResult(mutationCache, options);
	react.useEffect(() => {
		optionsRef.current = options;
	});
	return react.useSyncExternalStore(react.useCallback((onStoreChange) => mutationCache.subscribe(() => {
		const nextResult = (0, _tanstack_query_core.replaceEqualDeep)(result.current, getResult(mutationCache, optionsRef.current));
		if (result.current !== nextResult) {
			result.current = nextResult;
			_tanstack_query_core.notifyManager.schedule(onStoreChange);
		}
	}), [mutationCache]), () => result.current, () => result.current);
}
//#endregion
exports.useIsMutating = useIsMutating;
exports.useMutationState = useMutationState;

//# sourceMappingURL=useMutationState.cjs.map