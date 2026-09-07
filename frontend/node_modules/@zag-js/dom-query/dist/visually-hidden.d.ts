declare const visuallyHiddenStyle: {
    readonly border: "0";
    readonly clip: "rect(0 0 0 0)";
    readonly height: "1px";
    readonly margin: "-1px";
    readonly overflow: "hidden";
    readonly padding: "0";
    readonly position: "absolute";
    readonly width: "1px";
    readonly whiteSpace: "nowrap";
    readonly wordWrap: "normal";
};
declare function setVisuallyHidden(el: HTMLElement): void;

export { setVisuallyHidden, visuallyHiddenStyle };
