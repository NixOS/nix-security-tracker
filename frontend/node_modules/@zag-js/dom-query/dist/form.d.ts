import { HTMLElementWithValue } from './types.js';
import '@zag-js/types';

declare function setElementValue(el: HTMLElementWithValue | null, value: string, property?: "value" | "checked"): void;
declare function setElementChecked(el: HTMLInputElement | null, checked: boolean): void;
interface InputValueEventOptions {
    value: string | number;
    bubbles?: boolean | undefined;
}
declare function dispatchInputValueEvent(el: HTMLElementWithValue | null, options: InputValueEventOptions): void;
interface CheckedEventOptions {
    checked: boolean;
    bubbles?: boolean | undefined;
}
declare function dispatchInputCheckedEvent(el: HTMLInputElement | null, options: CheckedEventOptions): void;
interface TrackFormControlOptions {
    onFieldsetDisabledChange: (disabled: boolean) => void;
    onFormReset: VoidFunction;
}
declare function trackFormControl(el: HTMLElement | null, options: TrackFormControlOptions): (() => void) | undefined;
declare const INTERNAL_CHANGE_EVENT: unique symbol;
type InternalChangeEventProps = {
    [INTERNAL_CHANGE_EVENT]?: boolean;
};
declare function isInternalChangeEvent<T extends Event>(e: T): e is T & InternalChangeEventProps;
declare function markAsInternalChangeEvent<T extends Event>(event: T): T & InternalChangeEventProps;

export { type CheckedEventOptions, type InputValueEventOptions, type TrackFormControlOptions, dispatchInputCheckedEvent, dispatchInputValueEvent, isInternalChangeEvent, markAsInternalChangeEvent, setElementChecked, setElementValue, trackFormControl };
