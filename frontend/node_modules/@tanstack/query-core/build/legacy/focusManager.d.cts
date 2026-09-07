import { t as Subscribable } from "./subscribable-CbifVTKz.cjs";
//#region src/focusManager.d.ts
type Listener = (focused: boolean) => void;
type SetupFn = (setFocused: (focused?: boolean) => void) => (() => void) | undefined;
declare class FocusManager extends Subscribable<Listener> {
  #private;
  constructor();
  protected onSubscribe(): void;
  protected onUnsubscribe(): void;
  setEventListener(setup: SetupFn): void;
  setFocused(focused?: boolean): void;
  onFocus(): void;
  isFocused(): boolean;
}
declare const focusManager: FocusManager;
//#endregion
export { FocusManager, focusManager };
//# sourceMappingURL=focusManager.d.cts.map