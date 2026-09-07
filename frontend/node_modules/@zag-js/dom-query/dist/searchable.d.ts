import { ItemToId } from './query.js';

interface SearchableItem {
    id: string;
    textContent: string | null;
    dataset?: any | undefined;
}
declare function getByText<T extends SearchableItem>(v: T[], text: string, currentId?: string | null, itemToId?: ItemToId<T>): T | undefined;

export { type SearchableItem, getByText };
