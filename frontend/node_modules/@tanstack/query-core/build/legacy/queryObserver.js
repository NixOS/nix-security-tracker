import { i as _classPrivateFieldInitSpec, n as _classPrivateFieldGet2, r as _assertClassBrand, t as _classPrivateFieldSet2 } from "./classPrivateFieldSet2-CV7wyte-.js";
import { timeoutManager } from "./timeoutManager.js";
import { isValidTimeout, noop, replaceData, resolveQueryValue, shallowEqualObjects, timeUntilStale } from "./utils.js";
import { isServer } from "./environmentManager.js";
import { Subscribable } from "./subscribable.js";
import { focusManager } from "./focusManager.js";
import { notifyManager } from "./notifyManager.js";
import { t as _classPrivateMethodInitSpec } from "./classPrivateMethodInitSpec-CBwa_Y7C.js";
import { fetchState } from "./query.js";
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
var QueryObserver = class extends Subscribable {
	constructor(client, options) {
		super();
		this.options = options;
		_classPrivateMethodInitSpec(this, _QueryObserver_brand);
		_classPrivateFieldInitSpec(this, _client, void 0);
		_classPrivateFieldInitSpec(this, _currentQuery, void 0);
		_classPrivateFieldInitSpec(this, _currentQueryInitialState, void 0);
		_classPrivateFieldInitSpec(this, _currentResult, void 0);
		_classPrivateFieldInitSpec(this, _currentResultState, void 0);
		_classPrivateFieldInitSpec(this, _currentResultOptions, void 0);
		_classPrivateFieldInitSpec(this, _selectError, void 0);
		_classPrivateFieldInitSpec(this, _selectFn, void 0);
		_classPrivateFieldInitSpec(this, _selectResult, void 0);
		_classPrivateFieldInitSpec(this, _lastQueryWithDefinedData, void 0);
		_classPrivateFieldInitSpec(this, _staleTimeoutId, void 0);
		_classPrivateFieldInitSpec(this, _refetchIntervalId, void 0);
		_classPrivateFieldInitSpec(this, _currentRefetchInterval, void 0);
		_classPrivateFieldInitSpec(this, _trackedProps, /* @__PURE__ */ new Set());
		_classPrivateFieldSet2(_client, this, client);
		_classPrivateFieldSet2(_selectError, this, null);
		this.bindMethods();
		this.setOptions(options);
	}
	bindMethods() {
		this.refetch = this.refetch.bind(this);
	}
	onSubscribe() {
		if (this.listeners.size === 1) {
			_classPrivateFieldGet2(_currentQuery, this).addObserver(this);
			if (shouldFetchOnMount(_classPrivateFieldGet2(_currentQuery, this), this.options)) _assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this);
			else this.updateResult();
			_assertClassBrand(_QueryObserver_brand, this, _updateTimers).call(this);
		}
	}
	onUnsubscribe() {
		if (!this.hasListeners()) this.destroy();
	}
	shouldFetchOnReconnect() {
		return shouldFetchOn(_classPrivateFieldGet2(_currentQuery, this), this.options, this.options.refetchOnReconnect);
	}
	shouldFetchOnWindowFocus() {
		return shouldFetchOn(_classPrivateFieldGet2(_currentQuery, this), this.options, this.options.refetchOnWindowFocus);
	}
	destroy() {
		this.listeners = /* @__PURE__ */ new Set();
		_assertClassBrand(_QueryObserver_brand, this, _clearStaleTimeout).call(this);
		_assertClassBrand(_QueryObserver_brand, this, _clearRefetchInterval).call(this);
		_classPrivateFieldGet2(_currentQuery, this).removeObserver(this);
	}
	setOptions(options) {
		const prevOptions = this.options;
		const prevQuery = _classPrivateFieldGet2(_currentQuery, this);
		this.options = _classPrivateFieldGet2(_client, this).defaultQueryOptions(options);
		if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveQueryValue(this.options.enabled, _classPrivateFieldGet2(_currentQuery, this)) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
		_assertClassBrand(_QueryObserver_brand, this, _updateQuery).call(this);
		_classPrivateFieldGet2(_currentQuery, this).setOptions(this.options);
		if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) _classPrivateFieldGet2(_client, this).getQueryCache().notify({
			type: "observerOptionsUpdated",
			query: _classPrivateFieldGet2(_currentQuery, this),
			observer: this
		});
		const mounted = this.hasListeners();
		if (mounted && shouldFetchOptionally(_classPrivateFieldGet2(_currentQuery, this), prevQuery, this.options, prevOptions)) _assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this);
		this.updateResult();
		if (mounted && (_classPrivateFieldGet2(_currentQuery, this) !== prevQuery || resolveQueryValue(this.options.enabled, _classPrivateFieldGet2(_currentQuery, this)) !== resolveQueryValue(prevOptions.enabled, _classPrivateFieldGet2(_currentQuery, this)) || resolveQueryValue(this.options.staleTime, _classPrivateFieldGet2(_currentQuery, this)) !== resolveQueryValue(prevOptions.staleTime, _classPrivateFieldGet2(_currentQuery, this)))) _assertClassBrand(_QueryObserver_brand, this, _updateStaleTimeout).call(this);
		const nextRefetchInterval = _assertClassBrand(_QueryObserver_brand, this, _computeRefetchInterval).call(this);
		if (mounted && (_classPrivateFieldGet2(_currentQuery, this) !== prevQuery || resolveQueryValue(this.options.enabled, _classPrivateFieldGet2(_currentQuery, this)) !== resolveQueryValue(prevOptions.enabled, _classPrivateFieldGet2(_currentQuery, this)) || nextRefetchInterval !== _classPrivateFieldGet2(_currentRefetchInterval, this))) _assertClassBrand(_QueryObserver_brand, this, _updateRefetchInterval).call(this, nextRefetchInterval);
	}
	getOptimisticResult(options) {
		const query = _classPrivateFieldGet2(_client, this).getQueryCache().build(_classPrivateFieldGet2(_client, this), options);
		const result = this.createResult(query, options);
		if (!shallowEqualObjects(this.getCurrentResult(), result)) {
			_classPrivateFieldSet2(_currentResult, this, result);
			_classPrivateFieldSet2(_currentResultOptions, this, this.options);
			_classPrivateFieldSet2(_currentResultState, this, _classPrivateFieldGet2(_currentQuery, this).state);
		}
		return result;
	}
	getCurrentResult() {
		return _classPrivateFieldGet2(_currentResult, this);
	}
	trackResult(result, onPropTracked) {
		return new Proxy(result, { get: (target, key) => {
			this.trackProp(key);
			onPropTracked === null || onPropTracked === void 0 || onPropTracked(key);
			return Reflect.get(target, key);
		} });
	}
	trackProp(key) {
		_classPrivateFieldGet2(_trackedProps, this).add(key);
	}
	getCurrentQuery() {
		return _classPrivateFieldGet2(_currentQuery, this);
	}
	refetch({ ...options } = {}) {
		return this.fetch({ ...options });
	}
	fetchOptimistic(options) {
		const defaultedOptions = _classPrivateFieldGet2(_client, this).defaultQueryOptions(options);
		const query = _classPrivateFieldGet2(_client, this).getQueryCache().build(_classPrivateFieldGet2(_client, this), defaultedOptions);
		let unsubscribe = () => {};
		let resolveEarly;
		const cachePromise = new Promise((resolve) => {
			resolveEarly = resolve;
			unsubscribe = _classPrivateFieldGet2(_client, this).getQueryCache().subscribe((event) => {
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
		return _assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this, {
			...fetchOptions,
			cancelRefetch: fetchOptions.cancelRefetch ?? true
		}).then(() => {
			this.updateResult();
			return _classPrivateFieldGet2(_currentResult, this);
		});
	}
	createResult(query, options) {
		const prevQuery = _classPrivateFieldGet2(_currentQuery, this);
		const prevOptions = this.options;
		const prevResult = _classPrivateFieldGet2(_currentResult, this);
		const prevResultState = _classPrivateFieldGet2(_currentResultState, this);
		const prevResultOptions = _classPrivateFieldGet2(_currentResultOptions, this);
		const queryInitialState = query !== prevQuery ? query.state : _classPrivateFieldGet2(_currentQueryInitialState, this);
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
				...fetchState(state.data, query.options)
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
				placeholderData = typeof options.placeholderData === "function" ? options.placeholderData((_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_lastQueryWithDefinedData, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.state.data, _classPrivateFieldGet2(_lastQueryWithDefinedData, this)) : options.placeholderData;
			}
			if (placeholderData !== void 0) {
				status = "success";
				data = replaceData(prevResult === null || prevResult === void 0 ? void 0 : prevResult.data, placeholderData, options);
				isPlaceholderData = true;
			}
		}
		if (options.select && data !== void 0 && !skipSelect) {
			if (prevResult && data === (prevResultState === null || prevResultState === void 0 ? void 0 : prevResultState.data) && options.select === _classPrivateFieldGet2(_selectFn, this)) data = _classPrivateFieldGet2(_selectResult, this);
			else try {
				_classPrivateFieldSet2(_selectFn, this, options.select);
				data = options.select(data);
				data = replaceData(prevResult === null || prevResult === void 0 ? void 0 : prevResult.data, data, options);
				_classPrivateFieldSet2(_selectResult, this, data);
				_classPrivateFieldSet2(_selectError, this, null);
			} catch (selectError) {
				_classPrivateFieldSet2(_selectError, this, selectError);
			}
		} else if (data === void 0) _classPrivateFieldSet2(_selectError, this, null);
		if (_classPrivateFieldGet2(_selectError, this)) {
			error = _classPrivateFieldGet2(_selectError, this);
			data = _classPrivateFieldGet2(_selectResult, this);
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
			isEnabled: resolveQueryValue(options.enabled, query) !== false
		};
	}
	updateResult() {
		const prevResult = _classPrivateFieldGet2(_currentResult, this);
		const nextResult = this.createResult(_classPrivateFieldGet2(_currentQuery, this), this.options);
		_classPrivateFieldSet2(_currentResultState, this, _classPrivateFieldGet2(_currentQuery, this).state);
		_classPrivateFieldSet2(_currentResultOptions, this, this.options);
		if (_classPrivateFieldGet2(_currentResultState, this).data !== void 0) _classPrivateFieldSet2(_lastQueryWithDefinedData, this, _classPrivateFieldGet2(_currentQuery, this));
		if (shallowEqualObjects(nextResult, prevResult)) return;
		_classPrivateFieldSet2(_currentResult, this, nextResult);
		const shouldNotifyListeners = () => {
			if (!prevResult) return true;
			const { notifyOnChangeProps } = this.options;
			const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
			if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !_classPrivateFieldGet2(_trackedProps, this).size) return true;
			const includedProps = new Set(notifyOnChangePropsValue ?? _classPrivateFieldGet2(_trackedProps, this));
			if (this.options.throwOnError) includedProps.add("error");
			return Object.keys(_classPrivateFieldGet2(_currentResult, this)).some((key) => {
				const typedKey = key;
				return _classPrivateFieldGet2(_currentResult, this)[typedKey] !== prevResult[typedKey] && includedProps.has(typedKey);
			});
		};
		const notifyListeners = shouldNotifyListeners();
		notifyManager.batch(() => {
			if (notifyListeners) this.listeners.forEach((listener) => {
				listener(_classPrivateFieldGet2(_currentResult, this));
			});
			_classPrivateFieldGet2(_client, this).getQueryCache().notify({
				query: _classPrivateFieldGet2(_currentQuery, this),
				type: "observerResultsUpdated"
			});
		});
	}
	onQueryUpdate() {
		this.updateResult();
		if (this.hasListeners()) _assertClassBrand(_QueryObserver_brand, this, _updateTimers).call(this);
	}
};
function _executeFetch(fetchOptions) {
	_assertClassBrand(_QueryObserver_brand, this, _updateQuery).call(this);
	let promise = _classPrivateFieldGet2(_currentQuery, this).fetch(this.options, fetchOptions);
	if (!(fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.throwOnError)) promise = promise.catch(noop);
	return promise;
}
function _shouldScheduleTimer(timeout) {
	return !isServer() && resolveQueryValue(this.options.enabled, _classPrivateFieldGet2(_currentQuery, this)) !== false && isValidTimeout(timeout);
}
function _updateStaleTimeout() {
	_assertClassBrand(_QueryObserver_brand, this, _clearStaleTimeout).call(this);
	const staleTime = resolveQueryValue(this.options.staleTime, _classPrivateFieldGet2(_currentQuery, this));
	if (_classPrivateFieldGet2(_currentResult, this).isStale || !_assertClassBrand(_QueryObserver_brand, this, _shouldScheduleTimer).call(this, staleTime)) return;
	const timeout = timeUntilStale(_classPrivateFieldGet2(_currentResult, this).dataUpdatedAt, staleTime) + 1;
	_classPrivateFieldSet2(_staleTimeoutId, this, timeoutManager.setTimeout(() => {
		if (!_classPrivateFieldGet2(_currentResult, this).isStale) this.updateResult();
	}, timeout));
}
function _computeRefetchInterval() {
	return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(_classPrivateFieldGet2(_currentQuery, this)) : this.options.refetchInterval) ?? false;
}
function _updateRefetchInterval(nextInterval) {
	_assertClassBrand(_QueryObserver_brand, this, _clearRefetchInterval).call(this);
	_classPrivateFieldSet2(_currentRefetchInterval, this, nextInterval);
	if (_classPrivateFieldGet2(_currentRefetchInterval, this) === 0 || !_assertClassBrand(_QueryObserver_brand, this, _shouldScheduleTimer).call(this, _classPrivateFieldGet2(_currentRefetchInterval, this))) return;
	_classPrivateFieldSet2(_refetchIntervalId, this, timeoutManager.setInterval(() => {
		if (this.options.refetchIntervalInBackground || focusManager.isFocused()) _assertClassBrand(_QueryObserver_brand, this, _executeFetch).call(this);
	}, _classPrivateFieldGet2(_currentRefetchInterval, this)));
}
function _updateTimers() {
	_assertClassBrand(_QueryObserver_brand, this, _updateStaleTimeout).call(this);
	_assertClassBrand(_QueryObserver_brand, this, _updateRefetchInterval).call(this, _assertClassBrand(_QueryObserver_brand, this, _computeRefetchInterval).call(this));
}
function _clearStaleTimeout() {
	if (_classPrivateFieldGet2(_staleTimeoutId, this) !== void 0) {
		timeoutManager.clearTimeout(_classPrivateFieldGet2(_staleTimeoutId, this));
		_classPrivateFieldSet2(_staleTimeoutId, this, void 0);
	}
}
function _clearRefetchInterval() {
	if (_classPrivateFieldGet2(_refetchIntervalId, this) !== void 0) {
		timeoutManager.clearInterval(_classPrivateFieldGet2(_refetchIntervalId, this));
		_classPrivateFieldSet2(_refetchIntervalId, this, void 0);
	}
}
function _updateQuery() {
	const query = _classPrivateFieldGet2(_client, this).getQueryCache().build(_classPrivateFieldGet2(_client, this), this.options);
	if (query === _classPrivateFieldGet2(_currentQuery, this)) return;
	const prevQuery = _classPrivateFieldGet2(_currentQuery, this);
	_classPrivateFieldSet2(_currentQuery, this, query);
	_classPrivateFieldSet2(_currentQueryInitialState, this, query.state);
	if (this.hasListeners()) {
		prevQuery === null || prevQuery === void 0 || prevQuery.removeObserver(this);
		query.addObserver(this);
	}
}
function shouldLoadOnMount(query, options) {
	return resolveQueryValue(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && resolveQueryValue(options.retryOnMount, query) === false);
}
function shouldFetchOnMount(query, options) {
	return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
	if (resolveQueryValue(options.enabled, query) !== false && resolveQueryValue(options.staleTime, query) !== "static") {
		const value = typeof field === "function" ? field(query) : field;
		return value === "always" || value !== false && isStale(query, options);
	}
	return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
	return (query !== prevQuery || resolveQueryValue(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
	return resolveQueryValue(options.enabled, query) !== false && query.isStaleByTime(resolveQueryValue(options.staleTime, query));
}
//#endregion
export { QueryObserver };

//# sourceMappingURL=queryObserver.js.map