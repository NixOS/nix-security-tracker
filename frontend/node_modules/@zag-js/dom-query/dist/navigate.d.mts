interface NavigateOptions {
    key?: string;
    orientation?: "both" | "vertical" | "horizontal";
    loop?: boolean;
    dir?: "ltr" | "rtl";
}
declare function navigate<T extends HTMLElement>(items: T[], current: T | null, options?: NavigateOptions): T | null;
declare function clickIfLink(el: HTMLAnchorElement): void;

export { type NavigateOptions, clickIfLink, navigate };
