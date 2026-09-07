import { JSX } from './jsx.mjs';
export { NormalizeProps, PropTypes, createNormalizer } from './prop-types.mjs';
export { createProps } from './create-props.mjs';
import 'csstype';

type RequiredBy<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;
type Nullable<T> = T | null;
type NonNullable<T> = T extends null | undefined ? never : T;
type Required<T> = {
    [P in keyof T]-?: NonNullable<T[P]>;
};
type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type MaybeFn<T> = T | (() => T);
type MaybeElement<T extends HTMLElement = HTMLElement> = Nullable<T>;
interface OrientationProperty {
    /**
     * The orientation of the element.
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical" | undefined;
}
interface DirectionProperty {
    /**
     * The document's text/writing direction.
     * @default "ltr"
     */
    dir?: "ltr" | "rtl" | undefined;
}
interface LocaleProperties extends DirectionProperty {
    /**
     * The current locale. Based on the BCP 47 definition.
     * @default "en-US"
     */
    locale?: string | undefined;
}
interface CommonProperties {
    /**
     * The unique identifier of the machine.
     */
    id: string;
    /**
     * A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron.
     */
    getRootNode?: (() => ShadowRoot | Document | Node) | undefined;
}
type Style = JSX.CSSProperties;
type EventKey = "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight" | "Space" | "Enter" | "Comma" | "Escape" | "Backspace" | "Delete" | "Home" | "End" | "Tab" | "PageUp" | "PageDown" | (string & {});
type EventKeyMap<T extends HTMLElement = HTMLElement> = {
    [key in EventKey]?: (event: JSX.KeyboardEvent<T>) => void;
};
interface Point {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
interface Rect extends Size {
    y: number;
    x: number;
}

export { type CommonProperties, type Direction, type DirectionProperty, type EventKey, type EventKeyMap, JSX, type LocaleProperties, type MaybeElement, type MaybeFn, type NonNullable, type Nullable, type Orientation, type OrientationProperty, type Point, type Rect, type Required, type RequiredBy, type Size, type Style };
