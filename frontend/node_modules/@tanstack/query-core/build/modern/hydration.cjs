Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_utils = require("./utils.cjs");
//#region src/hydration.ts
function tryResolveSync(promise) {
	let data;
	promise.then((result) => {
		data = result;
		return result;
	}, require_utils.noop)?.catch?.(require_utils.noop);
	if (data !== void 0) return { data };
}
function dehydrateMutation(mutation) {
	return {
		mutationKey: mutation.options.mutationKey,
		state: mutation.state,
		...mutation.options.scope && { scope: mutation.options.scope },
		...mutation.meta && { meta: mutation.meta }
	};
}
function dehydratePromise(query, serializeData, shouldRedactErrors) {
	const promise = query.promise?.then(serializeData).catch((error) => {
		if (shouldRedactErrors?.(error) === false) return Promise.reject(error);
		if (process.env.NODE_ENV !== "production") console.error(`A query that was dehydrated as pending ended up rejecting. [${query.queryHash}]: ${error}; The error will be redacted in production builds`);
		return Promise.reject(/* @__PURE__ */ new Error("redacted"));
	});
	promise?.catch(require_utils.noop);
	return promise;
}
function dehydrateQuery(query, serializeData, shouldRedactErrors) {
	return {
		dehydratedAt: Date.now(),
		state: {
			...query.state,
			...query.state.data !== void 0 && { data: serializeData ? serializeData(query.state.data) : query.state.data }
		},
		queryKey: query.queryKey,
		queryHash: query.queryHash,
		...query.state.status === "pending" && { promise: dehydratePromise(query, serializeData, shouldRedactErrors) },
		...query.meta && { meta: query.meta },
		...query.queryType && { queryType: query.queryType }
	};
}
function defaultShouldDehydrateMutation(mutation) {
	return mutation.state.isPaused;
}
function defaultShouldDehydrateQuery(query) {
	return query.state.status === "success";
}
function dehydrate(client, options = {}) {
	const filterMutation = options.shouldDehydrateMutation ?? client.getDefaultOptions().dehydrate?.shouldDehydrateMutation ?? defaultShouldDehydrateMutation;
	const mutations = client.getMutationCache().getAll().flatMap((mutation) => filterMutation(mutation) ? [dehydrateMutation(mutation)] : []);
	const filterQuery = options.shouldDehydrateQuery ?? client.getDefaultOptions().dehydrate?.shouldDehydrateQuery ?? defaultShouldDehydrateQuery;
	const shouldRedactErrors = options.shouldRedactErrors ?? client.getDefaultOptions().dehydrate?.shouldRedactErrors;
	const serializeData = options.serializeData ?? client.getDefaultOptions().dehydrate?.serializeData;
	return {
		mutations,
		queries: client.getQueryCache().getAll().flatMap((query) => filterQuery(query) ? [dehydrateQuery(query, serializeData, shouldRedactErrors)] : [])
	};
}
function hydrate(client, dehydratedState, options) {
	const mutationCache = client.getMutationCache();
	const queryCache = client.getQueryCache();
	const deserializeData = options?.defaultOptions?.deserializeData ?? client.getDefaultOptions().hydrate?.deserializeData;
	dehydratedState.mutations?.forEach(({ state, ...mutationOptions }) => {
		mutationCache.build(client, {
			...client.getDefaultOptions().hydrate?.mutations,
			...options?.defaultOptions?.mutations,
			...mutationOptions
		}, state);
	});
	dehydratedState.queries?.forEach(({ queryKey, state, queryHash, meta, promise, dehydratedAt, queryType }) => {
		const syncData = promise ? tryResolveSync(promise) : void 0;
		const rawData = state.data === void 0 ? syncData?.data : state.data;
		const data = rawData === void 0 ? rawData : deserializeData ? deserializeData(rawData) : rawData;
		let query = queryCache.get(queryHash);
		const existingQueryIsPending = query?.state.status === "pending";
		const existingQueryIsFetching = query?.state.fetchStatus === "fetching";
		if (query) {
			const hasNewerSyncData = syncData && dehydratedAt !== void 0 && dehydratedAt > query.state.dataUpdatedAt;
			if (state.dataUpdatedAt > query.state.dataUpdatedAt || hasNewerSyncData) {
				const { fetchStatus: _ignored, ...serializedState } = state;
				query.setState({
					...serializedState,
					data,
					...state.status === "pending" && data !== void 0 && {
						status: "success",
						dataUpdatedAt: dehydratedAt ?? Date.now(),
						...!existingQueryIsFetching && { fetchStatus: "idle" }
					}
				});
			}
		} else query = queryCache.build(client, {
			...client.getDefaultOptions().hydrate?.queries,
			...options?.defaultOptions?.queries,
			queryKey,
			queryHash,
			meta,
			_type: queryType
		}, {
			...state,
			data,
			fetchStatus: "idle",
			status: state.status === "pending" && data !== void 0 ? "success" : state.status,
			...state.status === "pending" && data !== void 0 && { dataUpdatedAt: dehydratedAt ?? Date.now() }
		});
		if (promise && !syncData && !existingQueryIsPending && !existingQueryIsFetching && (dehydratedAt === void 0 || dehydratedAt > query.state.dataUpdatedAt)) query.fetch(void 0, { initialPromise: Promise.resolve(promise).then(deserializeData) }).catch(require_utils.noop);
	});
}
//#endregion
exports.defaultShouldDehydrateMutation = defaultShouldDehydrateMutation;
exports.defaultShouldDehydrateQuery = defaultShouldDehydrateQuery;
exports.dehydrate = dehydrate;
exports.dehydrateQuery = dehydrateQuery;
exports.hydrate = hydrate;

//# sourceMappingURL=hydration.cjs.map