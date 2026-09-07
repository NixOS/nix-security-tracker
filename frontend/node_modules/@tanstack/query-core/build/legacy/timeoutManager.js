import { i as _classPrivateFieldInitSpec, n as _classPrivateFieldGet2, t as _classPrivateFieldSet2 } from "./classPrivateFieldSet2-CV7wyte-.js";
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
		_classPrivateFieldInitSpec(this, _provider, defaultTimeoutProvider);
		_classPrivateFieldInitSpec(this, _providerCalled, false);
	}
	setTimeoutProvider(provider) {
		if (process.env.NODE_ENV !== "production") {
			if (_classPrivateFieldGet2(_providerCalled, this) && provider !== _classPrivateFieldGet2(_provider, this)) console.error(`[timeoutManager]: Switching provider after calls to previous provider might result in unexpected behavior.`, {
				previous: _classPrivateFieldGet2(_provider, this),
				provider
			});
		}
		_classPrivateFieldSet2(_provider, this, provider);
		if (process.env.NODE_ENV !== "production") _classPrivateFieldSet2(_providerCalled, this, false);
	}
	setTimeout(callback, delay) {
		if (process.env.NODE_ENV !== "production") _classPrivateFieldSet2(_providerCalled, this, true);
		return _classPrivateFieldGet2(_provider, this).setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		_classPrivateFieldGet2(_provider, this).clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		if (process.env.NODE_ENV !== "production") _classPrivateFieldSet2(_providerCalled, this, true);
		return _classPrivateFieldGet2(_provider, this).setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		_classPrivateFieldGet2(_provider, this).clearInterval(intervalId);
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
export { TimeoutManager, defaultTimeoutProvider, systemSetTimeoutZero, timeoutManager };

//# sourceMappingURL=timeoutManager.js.map