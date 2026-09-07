import { Point } from './types.js';
import '@zag-js/types';

interface PressDetails {
    /**
     * The current position of the pointer.
     */
    point: Point;
    /**
     * The event that triggered the move.
     */
    event: PointerEvent;
}
interface TrackPressOptions {
    /**
     * The element that will be used to track the pointer events.
     */
    pointerNode: Element | null;
    /**
     * The element that will be used to track the keyboard focus events.
     */
    keyboardNode?: Element | null | undefined;
    /**
     * A function that determines if the key is valid for the press event.
     */
    isValidKey?(event: KeyboardEvent): boolean;
    /**
     * A function that will be called when the pointer is pressed.
     */
    onPress?(details: PressDetails): void;
    /**
     * A function that will be called when the pointer is pressed down.
     */
    onPressStart?(details: PressDetails): void;
    /**
     * A function that will be called when the pointer is pressed up or cancelled.
     */
    onPressEnd?(details: PressDetails): void;
}
declare function trackPress(options: TrackPressOptions): () => void;

export { type PressDetails, type TrackPressOptions, trackPress };
