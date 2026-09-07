import { t as Subscribable } from "./subscribable-CbifVTKz.js";
//#region src/onlineManager.d.ts
type Listener = (online: boolean) => void;
type SetupFn = (setOnline: Listener) => (() => void) | undefined;
declare class OnlineManager extends Subscribable<Listener> {
  #private;
  constructor();
  protected onSubscribe(): void;
  protected onUnsubscribe(): void;
  setEventListener(setup: SetupFn): void;
  setOnline(online: boolean): void;
  isOnline(): boolean;
}
declare const onlineManager: OnlineManager;
//#endregion
export { OnlineManager, onlineManager };
//# sourceMappingURL=onlineManager.d.ts.map