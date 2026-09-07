Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_utils = require("./utils.cjs");
const require_focusManager = require("./focusManager.cjs");
const require_notifyManager = require("./notifyManager.cjs");
const require_onlineManager = require("./onlineManager.cjs");
const require_mutationCache = require("./mutationCache.cjs");
const require_queryCache = require("./queryCache.cjs");
//#region src/queryClient.ts
var _queryCache = /* @__PURE__ */ new WeakMap();
var _mutationCache = /* @__PURE__ */ new WeakMap();
var _defaultOptions = /* @__PURE__ */ new WeakMap();
var _queryDefaults = /* @__PURE__ */ new WeakMap();
var _mutationDefaults = /* @__PURE__ */ new WeakMap();
var _mountCount = /* @__PURE__ */ new WeakMap();
var _unsubscribeFocus = /* @__PURE__ */ new WeakMap();
var _unsubscribeOnline = /* @__PURE__ */ new WeakMap();
var QueryClient = class {
	constructor(config = {}) {
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _queryCache, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _mutationCache, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _defaultOptions, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _queryDefaults, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _mutationDefaults, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _mountCount, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _unsubscribeFocus, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _unsubscribeOnline, void 0);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_queryCache, this, config.queryCache || new require_queryCache.QueryCache());
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mutationCache, this, config.mutationCache || new require_mutationCache.MutationCache());
		require_classPrivateFieldSet2._classPrivateFieldSet2(_defaultOptions, this, config.defaultOptions || {});
		require_classPrivateFieldSet2._classPrivateFieldSet2(_queryDefaults, this, /* @__PURE__ */ new Map());
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mutationDefaults, this, /* @__PURE__ */ new Map());
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mountCount, this, 0);
	}
	mount() {
		var _this$mountCount;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mountCount, this, (_this$mountCount = require_classPrivateFieldSet2._classPrivateFieldGet2(_mountCount, this), _this$mountCount++, _this$mountCount));
		if (require_classPrivateFieldSet2._classPrivateFieldGet2(_mountCount, this) !== 1) return;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_unsubscribeFocus, this, require_focusManager.focusManager.subscribe(async (focused) => {
			if (focused) {
				await this.resumePausedMutations();
				require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).onFocus();
			}
		}));
		require_classPrivateFieldSet2._classPrivateFieldSet2(_unsubscribeOnline, this, require_onlineManager.onlineManager.subscribe(async (online) => {
			if (online) {
				await this.resumePausedMutations();
				require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).onOnline();
			}
		}));
	}
	unmount() {
		var _this$mountCount3, _classPrivateFieldGet2$1, _classPrivateFieldGet3;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mountCount, this, (_this$mountCount3 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mountCount, this), _this$mountCount3--, _this$mountCount3));
		if (require_classPrivateFieldSet2._classPrivateFieldGet2(_mountCount, this) !== 0) return;
		(_classPrivateFieldGet2$1 = require_classPrivateFieldSet2._classPrivateFieldGet2(_unsubscribeFocus, this)) === null || _classPrivateFieldGet2$1 === void 0 || _classPrivateFieldGet2$1.call(this);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_unsubscribeFocus, this, void 0);
		(_classPrivateFieldGet3 = require_classPrivateFieldSet2._classPrivateFieldGet2(_unsubscribeOnline, this)) === null || _classPrivateFieldGet3 === void 0 || _classPrivateFieldGet3.call(this);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_unsubscribeOnline, this, void 0);
	}
	isFetching(filters) {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).findAll({
			...filters,
			fetchStatus: "fetching"
		}).length;
	}
	isMutating(filters) {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).findAll({
			...filters,
			status: "pending"
		}).length;
	}
	/**
	* Imperative (non-reactive) way to retrieve data for a QueryKey.
	* Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
	*
	* Hint: Do not use this function inside a component, because it won't receive updates.
	* Use `useQuery` to create a `QueryObserver` that subscribes to changes.
	*/
	getQueryData(queryKey) {
		var _classPrivateFieldGet4;
		const options = this.defaultQueryOptions({ queryKey });
		return (_classPrivateFieldGet4 = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).get(options.queryHash)) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.state.data;
	}
	/**
	* @deprecated Use queryClient.query({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
	*/
	ensureQueryData(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).build(this, defaultedOptions);
		const cachedData = query.state.data;
		if (cachedData === void 0) return this.fetchQuery(options);
		if (options.revalidateIfStale && query.isStaleByTime(require_utils.resolveQueryValue(defaultedOptions.staleTime, query))) this.prefetchQuery(defaultedOptions);
		return Promise.resolve(cachedData);
	}
	getQueriesData(filters) {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).findAll(filters).map(({ queryKey, state }) => {
			return [queryKey, state.data];
		});
	}
	setQueryData(queryKey, updater, options) {
		const defaultedOptions = this.defaultQueryOptions({ queryKey });
		const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).get(defaultedOptions.queryHash);
		const prevData = query === null || query === void 0 ? void 0 : query.state.data;
		const data = require_utils.functionalUpdate(updater, prevData);
		if (data === void 0) return;
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).build(this, defaultedOptions).setData(data, {
			...options,
			manual: true
		});
	}
	setQueriesData(filters, updater, options) {
		return require_notifyManager.notifyManager.batch(() => require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).findAll(filters).map(({ queryKey }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
	}
	getQueryState(queryKey) {
		var _classPrivateFieldGet5;
		const options = this.defaultQueryOptions({ queryKey });
		return (_classPrivateFieldGet5 = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).get(options.queryHash)) === null || _classPrivateFieldGet5 === void 0 ? void 0 : _classPrivateFieldGet5.state;
	}
	removeQueries(filters) {
		const queryCache = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this);
		require_notifyManager.notifyManager.batch(() => {
			queryCache.findAll(filters).forEach((query) => {
				queryCache.remove(query);
			});
		});
	}
	resetQueries(filters, options) {
		const queryCache = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this);
		return require_notifyManager.notifyManager.batch(() => {
			const matched = queryCache.findAll(filters);
			const queriesToRefetch = new Set(matched);
			matched.forEach((query) => {
				query.reset();
			});
			return this.refetchQueries({
				type: "active",
				predicate: (query) => queriesToRefetch.has(query)
			}, options);
		});
	}
	cancelQueries(filters, cancelOptions = {}) {
		const defaultedCancelOptions = {
			revert: true,
			...cancelOptions
		};
		const promises = require_notifyManager.notifyManager.batch(() => require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).findAll(filters).map((query) => query.cancel(defaultedCancelOptions)));
		return Promise.all(promises).then(require_utils.noop).catch(require_utils.noop);
	}
	invalidateQueries(filters, options = {}) {
		return require_notifyManager.notifyManager.batch(() => {
			require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).findAll(filters).forEach((query) => {
				query.invalidate();
			});
			if ((filters === null || filters === void 0 ? void 0 : filters.refetchType) === "none") return Promise.resolve();
			return this.refetchQueries({
				...filters,
				type: (filters === null || filters === void 0 ? void 0 : filters.refetchType) ?? (filters === null || filters === void 0 ? void 0 : filters.type) ?? "active"
			}, options);
		});
	}
	refetchQueries(filters, options = {}) {
		const fetchOptions = {
			...options,
			cancelRefetch: options.cancelRefetch ?? true
		};
		const promises = require_notifyManager.notifyManager.batch(() => require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
			let promise = query.fetch(void 0, fetchOptions);
			if (!fetchOptions.throwOnError) promise = promise.catch(require_utils.noop);
			return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
		}));
		return Promise.all(promises).then(require_utils.noop);
	}
	async query(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
		const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).build(this, defaultedOptions);
		const queryData = query.isStaleByTime(require_utils.resolveQueryValue(defaultedOptions.staleTime, query)) ? await query.fetch(defaultedOptions) : query.state.data;
		const select = defaultedOptions.select;
		if (select) return select(queryData);
		return queryData;
	}
	/**
	* @deprecated Use queryClient.query(options) instead. This method will be removed in the next major version.
	*/
	fetchQuery(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
		const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).build(this, defaultedOptions);
		return query.isStaleByTime(require_utils.resolveQueryValue(defaultedOptions.staleTime, query)) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
	}
	/**
	* @deprecated Use queryClient.query(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
	*/
	prefetchQuery(options) {
		return this.fetchQuery(options).then(require_utils.noop).catch(require_utils.noop);
	}
	infiniteQuery(options) {
		options._type = "infinite";
		return this.query(options);
	}
	/**
	* @deprecated Use queryClient.infiniteQuery(options) instead. This method will be removed in the next major version.
	*/
	fetchInfiniteQuery(options) {
		options._type = "infinite";
		return this.fetchQuery(options);
	}
	/**
	* @deprecated Use queryClient.infiniteQuery(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
	*/
	prefetchInfiniteQuery(options) {
		return this.fetchInfiniteQuery(options).then(require_utils.noop).catch(require_utils.noop);
	}
	/**
	* @deprecated Use queryClient.infiniteQuery({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
	*/
	ensureInfiniteQueryData(options) {
		options._type = "infinite";
		return this.ensureQueryData(options);
	}
	resumePausedMutations() {
		if (require_onlineManager.onlineManager.isOnline()) return require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).resumePausedMutations();
		return Promise.resolve();
	}
	getQueryCache() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this);
	}
	getMutationCache() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this);
	}
	getDefaultOptions() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_defaultOptions, this);
	}
	setDefaultOptions(options) {
		require_classPrivateFieldSet2._classPrivateFieldSet2(_defaultOptions, this, options);
	}
	setQueryDefaults(queryKey, options) {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_queryDefaults, this).set(require_utils.hashKey(queryKey), {
			queryKey,
			defaultOptions: options
		});
	}
	getQueryDefaults(queryKey) {
		const defaults = [...require_classPrivateFieldSet2._classPrivateFieldGet2(_queryDefaults, this).values()];
		const result = {};
		defaults.forEach((queryDefault) => {
			if (require_utils.partialMatchKey(queryKey, queryDefault.queryKey)) Object.assign(result, queryDefault.defaultOptions);
		});
		return result;
	}
	setMutationDefaults(mutationKey, options) {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationDefaults, this).set(require_utils.hashKey(mutationKey), {
			mutationKey,
			defaultOptions: options
		});
	}
	getMutationDefaults(mutationKey) {
		const defaults = [...require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationDefaults, this).values()];
		const result = {};
		defaults.forEach((queryDefault) => {
			if (require_utils.partialMatchKey(mutationKey, queryDefault.mutationKey)) Object.assign(result, queryDefault.defaultOptions);
		});
		return result;
	}
	defaultQueryOptions(options) {
		if (options._defaulted) return options;
		const defaultedOptions = {
			...require_classPrivateFieldSet2._classPrivateFieldGet2(_defaultOptions, this).queries,
			...this.getQueryDefaults(options.queryKey),
			...options,
			_defaulted: true
		};
		if (!defaultedOptions.queryHash) defaultedOptions.queryHash = require_utils.hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
		if (defaultedOptions.refetchOnReconnect === void 0) defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
		if (defaultedOptions.throwOnError === void 0) defaultedOptions.throwOnError = !!defaultedOptions.suspense;
		if (!defaultedOptions.networkMode && defaultedOptions.persister) defaultedOptions.networkMode = "offlineFirst";
		if (defaultedOptions.queryFn === require_utils.skipToken) defaultedOptions.enabled = false;
		return defaultedOptions;
	}
	defaultMutationOptions(options) {
		if (options === null || options === void 0 ? void 0 : options._defaulted) return options;
		return {
			...require_classPrivateFieldSet2._classPrivateFieldGet2(_defaultOptions, this).mutations,
			...(options === null || options === void 0 ? void 0 : options.mutationKey) && this.getMutationDefaults(options.mutationKey),
			...options,
			_defaulted: true
		};
	}
	clear() {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_queryCache, this).clear();
		require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).clear();
	}
};
//#endregion
exports.QueryClient = QueryClient;

//# sourceMappingURL=queryClient.cjs.map