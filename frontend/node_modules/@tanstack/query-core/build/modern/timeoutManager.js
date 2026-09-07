//#region src/timeoutManager.ts
const defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
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
	#provider = defaultTimeoutProvider;
	#providerCalled = false;
	setTimeoutProvider(provider) {
		if (process.env.NODE_ENV !== "production") {
			if (this.#providerCalled && provider !== this.#provider) console.error(`[timeoutManager]: Switching provider after calls to previous provider might result in unexpected behavior.`, {
				previous: this.#provider,
				provider
			});
		}
		this.#provider = provider;
		if (process.env.NODE_ENV !== "production") this.#providerCalled = false;
	}
	setTimeout(callback, delay) {
		if (process.env.NODE_ENV !== "production") this.#providerCalled = true;
		return this.#provider.setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		this.#provider.clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		if (process.env.NODE_ENV !== "production") this.#providerCalled = true;
		return this.#provider.setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		this.#provider.clearInterval(intervalId);
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