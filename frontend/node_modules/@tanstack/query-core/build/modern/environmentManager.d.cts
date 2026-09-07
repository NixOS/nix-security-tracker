//#region src/environmentManager.d.ts
type IsServerValue = () => boolean;
/**
 * Returns whether the current runtime should be treated as a server environment.
 */
declare const isServer: () => boolean;
/**
 * Manages environment detection used by TanStack Query internals.
 */
declare const environmentManager: {
  isServer: () => boolean;
  /**
   * Overrides the server check globally.
   */
  setIsServer(isServerValue: IsServerValue): void;
};
//#endregion
export { IsServerValue, environmentManager, isServer };
//# sourceMappingURL=environmentManager.d.cts.map