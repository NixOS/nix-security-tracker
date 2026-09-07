import { Scope } from '@zag-js/core';

interface Selection {
    start: number;
    end: number;
    value: string;
}
declare function recordCursor(inputEl: HTMLInputElement | null, scope: Scope): Selection | undefined;
declare function restoreCursor(inputEl: HTMLInputElement | null, selection: Selection | undefined, scope: Scope): void;
declare function getNextCursorPosition(oldValue: string, newValue: string, oldPosition: number): number;

export { getNextCursorPosition, recordCursor, restoreCursor };
