import { ListCollection } from './list-collection.js';
import './types.js';

/**
 * The mode of the selection.
 *
 * - `none`: A user can't select items.
 * - `single`: A user can select a single item.
 * - `multiple`: The user can select multiple items without using modifier keys.
 * - `extended`: The user can select multiple items by using modifier keys.
 */
type SelectionMode = "single" | "multiple" | "none" | "extended";
declare class Selection extends Set<string> {
    selectionMode: SelectionMode;
    deselectable: boolean;
    constructor(values?: Iterable<string>);
    copy: () => Selection;
    private sync;
    isEmpty: () => boolean;
    isSelected: (value: string | null) => boolean;
    canSelect: (collection: ListCollection, value: string) => boolean;
    firstSelectedValue: (collection: ListCollection) => string | null;
    lastSelectedValue: (collection: ListCollection) => string | null;
    extendSelection: (collection: ListCollection, anchorValue: string, targetValue: string) => Selection;
    toggleSelection: (collection: ListCollection, value: string) => Selection;
    replaceSelection: (collection: ListCollection, value: string | null) => Selection;
    setSelection: (values: Iterable<string>) => Selection;
    clearSelection: () => Selection;
    select: (collection: ListCollection, value: string, forceToggle?: boolean) => Selection;
    deselect: (value: string) => Selection;
    isEqual: (other: Selection) => boolean;
}

export { Selection, type SelectionMode };
