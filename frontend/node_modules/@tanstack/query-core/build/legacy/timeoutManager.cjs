Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
//#region src/timeoutManager.ts
const defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
var _provider = /* @__PURE__ */ new WeakMap();
var _providerCalled = /* @__PURE__ */ new WeakMap();
/**
* Allows customization of how timeouts are created.
*
* @tanstack/query-core makes liberal use of timeouts to implement `staleTime`
* and `gcTime`. The default TimeoutManager provider uses the platform's global
* `setTimeout` implementation, which is known to have scalability issues with
* thousands of timeouts on the event loop.
*
* If you hit this limitation, consider providing a custom TimeoutProvider that
* coalesces timeouts.
*/
var TimeoutManager = class {
	constructor() {
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _provider, defaultTimeoutProvider);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _providerCalled, false);
	}
	setTimeoutProvider(provider) {
		if (process.env.NODE_ENV !== "production") {
			if (require_classPrivateFieldSet2._classPrivateFieldGet2(_providerCalled, this) && provider !== require_classPrivateFieldSet2._classPrivateFieldGet2(_provider, this)) console.error(`[timeoutManager]: Switching provider after calls to previous provider might result in unexpected behavior.`, {
				previous: require_classPrivateFieldSet2._classPrivateFieldGet2(_provider, this),
				provider
			});
		}
		require_classPrivateFieldSet2._classPrivateFieldSet2(_provider, this, provider);
		if (process.env.NODE_ENV !== "production") require_classPrivateFieldSet2._classPrivateFieldSet2(_providerCalled, this, false);
	}
	setTimeout(callback, delay) {
		if (process.env.NODE_ENV !== "production") require_classPrivateFieldSet2._classPrivateFieldSet2(_providerCalled, this, true);
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_provider, this).setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_provider, this).clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		if (process.env.NODE_ENV !== "production") require_classPrivateFieldSet2._classPrivateFieldSet2(_providerCalled, this, true);
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_provider, this).setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_provider, this).clearInterval(intervalId);
	}
};
const timeoutManager = new TimeoutManager();
/**
* In many cases code wants to delay to the next event loop tick; this is not
* mediated by {@link timeoutManager}.
*
* This function is provided to make auditing the `tanstack/query-core` for
* incorrect use of system `setTimeout` easier.
*/
function systemSetTimeoutZero(callback) {
	setTimeout(callback, 0);
}
//#endregion
exports.TimeoutManager = TimeoutManager;
exports.defaultTimeoutProvider = defaultTimeoutProvider;
exports.systemSetTimeoutZero = systemSetTimeoutZero;
exports.timeoutManager = timeoutManager;

//# sourceMappingURL=timeoutManager.cjs.map