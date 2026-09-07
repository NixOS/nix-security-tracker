import { isServer as isServer$1 } from "./utils.js";
//#region src/environmentManager.ts
let isServerFn = () => isServer$1;
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
export { environmentManager, isServer };

//# sourceMappingURL=environmentManager.js.map