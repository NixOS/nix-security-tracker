declare const hideOthers: (originalTarget: Element | Element[], parentNode?: HTMLElement | null, markerName?: string, followControlledElements?: boolean) => VoidFunction | undefined;
declare const inertOthers: (originalTarget: Element | Element[], parentNode?: HTMLElement | null, markerName?: string, followControlledElements?: boolean) => VoidFunction | undefined;
declare const suppressOthers: (originalTarget: Element | Element[], parentNode?: HTMLElement, markerName?: string, followControlledElements?: boolean) => VoidFunction | undefined;

export { hideOthers, inertOthers, suppressOthers };
