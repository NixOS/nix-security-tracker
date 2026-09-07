interface WalkTreeOutsideOptions {
    parentNode: HTMLElement;
    markerName: string;
    controlAttribute: string;
    explicitBooleanValue: boolean;
    followControlledElements?: boolean;
}
declare const walkTreeOutside: (originalTarget: Element | Element[], props: WalkTreeOutsideOptions) => VoidFunction;

export { walkTreeOutside };
