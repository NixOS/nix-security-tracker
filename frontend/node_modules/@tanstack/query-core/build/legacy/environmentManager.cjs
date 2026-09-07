Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_utils = require("./utils.cjs");
//#region src/environmentManager.ts
let isServerFn = () => require_utils.isServer;
/**
* Returns whether the current runtime should be treated as a server environment.
*/
const isServer = () => isServerFn();
/**
* Manages environment detection used by TanStack Query internals.
*/
const environmentManager = {
	isServer,
	/**
	* Overrides the server check globally.
	*/
	setIsServer(isServerValue) {
		isServerFn = isServerValue;
	}
};
//#endregion
exports.environmentManager = environmentManager;
exports.isServer = isServer;

//# sourceMappingURL=environmentManager.cjs.map