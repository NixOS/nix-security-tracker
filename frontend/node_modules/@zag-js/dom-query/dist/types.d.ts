import { JSX, Nullable, MaybeFn } from '@zag-js/types';

interface VirtualElement {
    getBoundingClientRect(): DOMRect;
    contextElement?: Element | undefined;
}
type MeasurableElement = Element | VirtualElement;
type Booleanish = boolean | "true" | "false";
interface Point {
    x: number;
    y: number;
}
interface EventKeyOptions {
    dir?: "ltr" | "rtl" | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
}
type NativeEvent<E> = JSX.ChangeEvent<any> extends E ? InputEvent : E extends JSX.SyntheticEvent<any, infer T> ? T : never;
type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent;
type MaybeElement = Nullable<HTMLElement>;
type MaybeElementOrFn = MaybeFn<MaybeElement>;
type HTMLElementWithValue = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type { AnyPointerEvent, Booleanish, EventKeyOptions, HTMLElementWithValue, MaybeElement, MaybeElementOrFn, MeasurableElement, NativeEvent, Point };
