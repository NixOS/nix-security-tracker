Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_timeoutManager = require("./timeoutManager.cjs");
const require_utils = require("./utils.cjs");
const require_environmentManager = require("./environmentManager.cjs");
const require_subscribable = require("./subscribable.cjs");
const require_focusManager = require("./focusManager.cjs");
const require_notifyManager = require("./notifyManager.cjs");
const require_classPrivateMethodInitSpec = require("./classPrivateMethodInitSpec-DVhcLejn.cjs");
const require_query = require("./query.cjs");
//#region src/queryObserver.ts
var _client = /* @__PURE__ */ new WeakMap();
var _currentQuery = /* @__PURE__ */ new WeakMap();
var _currentQueryInitialState = /* @__PURE__ */ new WeakMap();
var _currentResult = /* @__PURE__ */ new WeakMap();
var _currentResultState = /* @__PURE__ */ new WeakMap();
var _currentResultOptions = /* @__PURE__ */ new WeakMap();
var _selectError = /* @__PURE__ */ new WeakMap();
var _selectFn = /* @__PURE__ */ new WeakMap();
var _selectResult = /* @__PURE__ */ new WeakMap();
var _lastQueryWithDefinedData = /* @__PURE__ */ new WeakMap();
var _staleTimeoutId = /* @__PURE__ */ new WeakMap();
var _refetchIntervalId = /* @__PURE__ */ new WeakMap();
var _currentRefetchInterval = /* @__PURE__ */ new WeakMap();
var _trackedProps = /* @__PURE__ */ new WeakMap();
var _QueryObserver_brand = /* @__PURE__ */ new WeakSet();
var QueryObserver = class extends require_subscribable.Subscribable {
	constructor(client, options) {
		super();
		this.options = options;
		require_classPrivateMethodInitSpec._classPrivateMethodInitSpec(this, _QueryObserver_brand);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _client, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentQuery, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentQueryInitialState, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentResult, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentResultState, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentResultOptions, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _selectError, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _selectFn, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _selectResult, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _lastQueryWithDefinedData, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _staleTimeoutId, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _refetchIntervalId, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentRefetchInterval, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _trackedProps, /* @__PURE__ */ new Set());
		require_classPrivateFieldSet2._classPrivateFieldSet2(_client, this, client);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_selectError, this, null);
		this.bindMethods();
		this.setOptions(options);
	}
	bindMethods() {
		this.refetch = this.refetch.bind(this);
	}
	onSubscribe() {
		if (this.listeners.size === 1) {
			require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this).addObserver(this);
			if (shouldFetchOnMount(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this), this.options)) require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this);
			else this.updateResult();
			require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateTimers).call(this);
		}
	}
	onUnsubscribe() {
		if (!this.hasListeners()) this.destroy();
	}
	shouldFetchOnReconnect() {
		return shouldFetchOn(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this), this.options, this.options.refetchOnReconnect);
	}
	shouldFetchOnWindowFocus() {
		return shouldFetchOn(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this), this.options, this.options.refetchOnWindowFocus);
	}
	destroy() {
		this.listeners = /* @__PURE__ */ new Set();
		require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _clearStaleTimeout).call(this);
		require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _clearRefetchInterval).call(this);
		require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this).removeObserver(this);
	}
	setOptions(options) {
		const prevOptions = this.options;
		const prevQuery = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this);
		this.options = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).defaultQueryOptions(options);
		if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof require_utils.resolveQueryValue(this.options.enabled, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
		require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateQuery).call(this);
		require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this).setOptions(this.options);
		if (prevOptions._defaulted && !require_utils.shallowEqualObjects(this.options, prevOptions)) require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache().notify({
			type: "observerOptionsUpdated",
			query: require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this),
			observer: this
		});
		const mounted = this.hasListeners();
		if (mounted && shouldFetchOptionally(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this), prevQuery, this.options, prevOptions)) require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this);
		this.updateResult();
		if (mounted && (require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this) !== prevQuery || require_utils.resolveQueryValue(this.options.enabled, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) !== require_utils.resolveQueryValue(prevOptions.enabled, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) || require_utils.resolveQueryValue(this.options.staleTime, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) !== require_utils.resolveQueryValue(prevOptions.staleTime, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)))) require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateStaleTimeout).call(this);
		const nextRefetchInterval = require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _computeRefetchInterval).call(this);
		if (mounted && (require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this) !== prevQuery || require_utils.resolveQueryValue(this.options.enabled, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) !== require_utils.resolveQueryValue(prevOptions.enabled, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) || nextRefetchInterval !== require_classPrivateFieldSet2._classPrivateFieldGet2(_currentRefetchInterval, this))) require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateRefetchInterval).call(this, nextRefetchInterval);
	}
	getOptimisticResult(options) {
		const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache().build(require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this), options);
		const result = this.createResult(query, options);
		if (!require_utils.shallowEqualObjects(this.getCurrentResult(), result)) {
			require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResult, this, result);
			require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResultOptions, this, this.options);
			require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResultState, this, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this).state);
		}
		return result;
	}
	getCurrentResult() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this);
	}
	trackResult(result, onPropTracked) {
		return new Proxy(result, { get: (target, key) => {
			this.trackProp(key);
			onPropTracked === null || onPropTracked === void 0 || onPropTracked(key);
			return Reflect.get(target, key);
		} });
	}
	trackProp(key) {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_trackedProps, this).add(key);
	}
	getCurrentQuery() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this);
	}
	refetch({ ...options } = {}) {
		return this.fetch({ ...options });
	}
	fetchOptimistic(options) {
		const defaultedOptions = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).defaultQueryOptions(options);
		const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache().build(require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this), defaultedOptions);
		let unsubscribe = () => {};
		let resolveEarly;
		const cachePromise = new Promise((resolve) => {
			resolveEarly = resolve;
			unsubscribe = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache().subscribe((event) => {
				if (event.type === "updated" && event.query.queryHash === query.queryHash && query.state.data !== void 0) {
					unsubscribe();
					resolve(this.createResult(query, defaultedOptions));
				}
			});
		});
		return Promise.race([query.fetch().then(() => {
			const result = this.createResult(query, defaultedOptions);
			resolveEarly === null || resolveEarly === void 0 || resolveEarly(result);
			return result;
		}).finally(() => {
			unsubscribe();
		}), cachePromise]);
	}
	fetch(fetchOptions) {
		return require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this, {
			...fetchOptions,
			cancelRefetch: fetchOptions.cancelRefetch ?? true
		}).then(() => {
			this.updateResult();
			return require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this);
		});
	}
	createResult(query, options) {
		const prevQuery = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this);
		const prevOptions = this.options;
		const prevResult = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this);
		const prevResultState = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResultState, this);
		const prevResultOptions = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResultOptions, this);
		const queryInitialState = query !== prevQuery ? query.state : require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQueryInitialState, this);
		const { state } = query;
		let newState = { ...state };
		let isPlaceholderData = false;
		let data;
		if (options._optimisticResults) {
			const mounted = this.hasListeners();
			const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
			const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
			if (fetchOnMount || fetchOptionally) newState = {
				...newState,
				...require_query.fetchState(state.data, query.options)
			};
			if (options._optimisticResults === "isRestoring") newState.fetchStatus = "idle";
		}
		let { error, errorUpdatedAt, status } = newState;
		data = newState.data;
		let skipSelect = false;
		if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
			let placeholderData;
			if ((prevResult === null || prevResult === void 0 ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions === null || prevResultOptions === void 0 ? void 0 : prevResultOptions.placeholderData)) {
				placeholderData = prevResult.data;
				skipSelect = true;
			} else {
				var _classPrivateFieldGet2$1;
				placeholderData = typeof options.placeholderData === "function" ? options.placeholderData((_classPrivateFieldGet2$1 = require_classPrivateFieldSet2._classPrivateFieldGet2(_lastQueryWithDefinedData, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.state.data, require_classPrivateFieldSet2._classPrivateFieldGet2(_lastQueryWithDefinedData, this)) : options.placeholderData;
			}
			if (placeholderData !== void 0) {
				status = "success";
				data = require_utils.replaceData(prevResult === null || prevResult === void 0 ? void 0 : prevResult.data, placeholderData, options);
				isPlaceholderData = true;
			}
		}
		if (options.select && data !== void 0 && !skipSelect) {
			if (prevResult && data === (prevResultState === null || prevResultState === void 0 ? void 0 : prevResultState.data) && options.select === require_classPrivateFieldSet2._classPrivateFieldGet2(_selectFn, this)) data = require_classPrivateFieldSet2._classPrivateFieldGet2(_selectResult, this);
			else try {
				require_classPrivateFieldSet2._classPrivateFieldSet2(_selectFn, this, options.select);
				data = options.select(data);
				data = require_utils.replaceData(prevResult === null || prevResult === void 0 ? void 0 : prevResult.data, data, options);
				require_classPrivateFieldSet2._classPrivateFieldSet2(_selectResult, this, data);
				require_classPrivateFieldSet2._classPrivateFieldSet2(_selectError, this, null);
			} catch (selectError) {
				require_classPrivateFieldSet2._classPrivateFieldSet2(_selectError, this, selectError);
			}
		} else if (data === void 0) require_classPrivateFieldSet2._classPrivateFieldSet2(_selectError, this, null);
		if (require_classPrivateFieldSet2._classPrivateFieldGet2(_selectError, this)) {
			error = require_classPrivateFieldSet2._classPrivateFieldGet2(_selectError, this);
			data = require_classPrivateFieldSet2._classPrivateFieldGet2(_selectResult, this);
			errorUpdatedAt = Date.now();
			status = "error";
			isPlaceholderData = false;
		}
		const isFetching = newState.fetchStatus === "fetching";
		const isPending = status === "pending";
		const isError = status === "error";
		const isLoading = isPending && isFetching;
		const hasData = data !== void 0;
		return {
			status,
			fetchStatus: newState.fetchStatus,
			isPending,
			isSuccess: status === "success",
			isError,
			isInitialLoading: isLoading,
			isLoading,
			data,
			dataUpdatedAt: newState.dataUpdatedAt,
			error,
			errorUpdatedAt,
			failureCount: newState.fetchFailureCount,
			failureReason: newState.fetchFailureReason,
			errorUpdateCount: newState.errorUpdateCount,
			isFetched: query.isFetched(),
			isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
			isFetching,
			isRefetching: isFetching && !isPending,
			isLoadingError: isError && !hasData,
			isPaused: newState.fetchStatus === "paused",
			isPlaceholderData,
			isRefetchError: isError && hasData,
			isStale: isStale(query, options),
			refetch: this.refetch,
			isEnabled: require_utils.resolveQueryValue(options.enabled, query) !== false
		};
	}
	updateResult() {
		const prevResult = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this);
		const nextResult = this.createResult(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this), this.options);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResultState, this, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this).state);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResultOptions, this, this.options);
		if (require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResultState, this).data !== void 0) require_classPrivateFieldSet2._classPrivateFieldSet2(_lastQueryWithDefinedData, this, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this));
		if (require_utils.shallowEqualObjects(nextResult, prevResult)) return;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResult, this, nextResult);
		const shouldNotifyListeners = () => {
			if (!prevResult) return true;
			const { notifyOnChangeProps } = this.options;
			const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
			if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !require_classPrivateFieldSet2._classPrivateFieldGet2(_trackedProps, this).size) return true;
			const includedProps = new Set(notifyOnChangePropsValue ?? require_classPrivateFieldSet2._classPrivateFieldGet2(_trackedProps, this));
			if (this.options.throwOnError) includedProps.add("error");
			return Object.keys(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this)).some((key) => {
				const typedKey = key;
				return require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this)[typedKey] !== prevResult[typedKey] && includedProps.has(typedKey);
			});
		};
		const notifyListeners = shouldNotifyListeners();
		require_notifyManager.notifyManager.batch(() => {
			if (notifyListeners) this.listeners.forEach((listener) => {
				listener(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this));
			});
			require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache().notify({
				query: require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this),
				type: "observerResultsUpdated"
			});
		});
	}
	onQueryUpdate() {
		this.updateResult();
		if (this.hasListeners()) require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateTimers).call(this);
	}
};
function _executeFetch(fetchOptions) {
	require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateQuery).call(this);
	let promise = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this).fetch(this.options, fetchOptions);
	if (!(fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.throwOnError)) promise = promise.catch(require_utils.noop);
	return promise;
}
function _shouldScheduleTimer(timeout) {
	return !require_environmentManager.isServer() && require_utils.resolveQueryValue(this.options.enabled, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) !== false && require_utils.isValidTimeout(timeout);
}
function _updateStaleTimeout() {
	require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _clearStaleTimeout).call(this);
	const staleTime = require_utils.resolveQueryValue(this.options.staleTime, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this));
	if (require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this).isStale || !require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _shouldScheduleTimer).call(this, staleTime)) return;
	const timeout = require_utils.timeUntilStale(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this).dataUpdatedAt, staleTime) + 1;
	require_classPrivateFieldSet2._classPrivateFieldSet2(_staleTimeoutId, this, require_timeoutManager.timeoutManager.setTimeout(() => {
		if (!require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this).isStale) this.updateResult();
	}, timeout));
}
function _computeRefetchInterval() {
	return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) : this.options.refetchInterval) ?? false;
}
function _updateRefetchInterval(nextInterval) {
	require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _clearRefetchInterval).call(this);
	require_classPrivateFieldSet2._classPrivateFieldSet2(_currentRefetchInterval, this, nextInterval);
	if (require_classPrivateFieldSet2._classPrivateFieldGet2(_currentRefetchInterval, this) === 0 || !require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _shouldScheduleTimer).call(this, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentRefetchInterval, this))) return;
	require_classPrivateFieldSet2._classPrivateFieldSet2(_refetchIntervalId, this, require_timeoutManager.timeoutManager.setInterval(() => {
		if (this.options.refetchIntervalInBackground || require_focusManager.focusManager.isFocused()) require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this);
	}, require_classPrivateFieldSet2._classPrivateFieldGet2(_currentRefetchInterval, this)));
}
function _updateTimers() {
	require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateStaleTimeout).call(this);
	require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _updateRefetchInterval).call(this, require_classPrivateFieldSet2._assertClassBrand(_QueryObserver_brand, this, _computeRefetchInterval).call(this));
}
function _clearStaleTimeout() {
	if (require_classPrivateFieldSet2._classPrivateFieldGet2(_staleTimeoutId, this) !== void 0) {
		require_timeoutManager.timeoutManager.clearTimeout(require_classPrivateFieldSet2._classPrivateFieldGet2(_staleTimeoutId, this));
		require_classPrivateFieldSet2._classPrivateFieldSet2(_staleTimeoutId, this, void 0);
	}
}
function _clearRefetchInterval() {
	if (require_classPrivateFieldSet2._classPrivateFieldGet2(_refetchIntervalId, this) !== void 0) {
		require_timeoutManager.timeoutManager.clearInterval(require_classPrivateFieldSet2._classPrivateFieldGet2(_refetchIntervalId, this));
		require_classPrivateFieldSet2._classPrivateFieldSet2(_refetchIntervalId, this, void 0);
	}
}
function _updateQuery() {
	const query = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache().build(require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this), this.options);
	if (query === require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this)) return;
	const prevQuery = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentQuery, this);
	require_classPrivateFieldSet2._classPrivateFieldSet2(_currentQuery, this, query);
	require_classPrivateFieldSet2._classPrivateFieldSet2(_currentQueryInitialState, this, query.state);
	if (this.hasListeners()) {
		prevQuery === null || prevQuery === void 0 || prevQuery.removeObserver(this);
		query.addObserver(this);
	}
}
function shouldLoadOnMount(query, options) {
	return require_utils.resolveQueryValue(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && require_utils.resolveQueryValue(options.retryOnMount, query) === false);
}
function shouldFetchOnMount(query, options) {
	return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
	if (require_utils.resolveQueryValue(options.enabled, query) !== false && require_utils.resolveQueryValue(options.staleTime, query) !== "static") {
		const value = typeof field === "function" ? field(query) : field;
		return value === "always" || value !== false && isStale(query, options);
	}
	return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
	return (query !== prevQuery || require_utils.resolveQueryValue(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
	return require_utils.resolveQueryValue(options.enabled, query) !== false && query.isStaleByTime(require_utils.resolveQueryValue(options.staleTime, query));
}
//#endregion
exports.QueryObserver = QueryObserver;

//# sourceMappingURL=queryObserver.cjs.map