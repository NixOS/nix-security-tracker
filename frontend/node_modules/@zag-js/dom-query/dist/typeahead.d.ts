import { ItemToId } from './query.js';
import { SearchableItem } from './searchable.js';

interface TypeaheadState {
    keysSoFar: string;
    timer: number;
}
interface TypeaheadOptions<T> {
    state: TypeaheadState;
    activeId: string | null;
    key: string;
    timeout?: number | undefined;
    itemToId?: ItemToId<T> | undefined;
}
declare function getByTypeaheadImpl<T extends SearchableItem>(baseItems: T[], options: TypeaheadOptions<T>): T | undefined;
declare const getByTypeahead: typeof getByTypeaheadImpl & {
    defaultOptions: {
        keysSoFar: string;
        timer: number;
    };
    isValidEvent: typeof isValidTypeaheadEvent;
};
declare function isValidTypeaheadEvent(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">): boolean;

export { type TypeaheadOptions, type TypeaheadState, getByTypeahead };
