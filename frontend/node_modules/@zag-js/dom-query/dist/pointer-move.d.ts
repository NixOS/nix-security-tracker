import { Point } from './types.js';
import '@zag-js/types';

interface PointerMoveDetails {
    /**
     * The current position of the pointer.
     */
    point: Point;
    /**
     * The event that triggered the move.
     */
    event: PointerEvent;
}
interface PointerUpDetails {
    /**
     * The current position of the pointer.
     */
    point: Point;
    /**
     * The event that triggered the move.
     */
    event: PointerEvent;
}
interface PointerMoveHandlers {
    /**
     * Called when the pointer is released.
     */
    onPointerUp: (details: PointerUpDetails) => void;
    /**
     * Called when the pointer moves.
     */
    onPointerMove: (details: PointerMoveDetails) => void;
}
declare function trackPointerMove(doc: Document, handlers: PointerMoveHandlers): () => void;

export { type PointerMoveDetails, type PointerMoveHandlers, type PointerUpDetails, trackPointerMove };
