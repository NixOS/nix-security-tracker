import { CollectionItem } from './types.js';

interface SelectionMapCollection<T extends CollectionItem = CollectionItem> {
    find: (value: string | null | undefined) => T | null;
    getItemValue: (item: T | null | undefined) => string | null;
}
declare function resolveSelectedItems<T extends CollectionItem>({ values, collection, selectedItemMap, }: {
    values: string[];
    collection: SelectionMapCollection<T>;
    selectedItemMap: Map<string, T>;
}): T[];
declare function updateSelectedItemMap<T extends CollectionItem>({ selectedItemMap, values, selectedItems, collection, }: {
    selectedItemMap: Map<string, T>;
    values: string[];
    selectedItems: T[];
    collection: SelectionMapCollection<T>;
}): Map<string, T>;
declare function deriveSelectionState<T extends CollectionItem>({ values, collection, selectedItemMap, }: {
    values: string[];
    collection: SelectionMapCollection<T>;
    selectedItemMap: Map<string, T>;
}): {
    selectedItems: T[];
    nextSelectedItemMap: Map<string, T>;
};
declare function createSelectedItemMap<T extends CollectionItem>({ selectedItems, collection, }: {
    selectedItems: T[];
    collection: SelectionMapCollection<T>;
}): Map<string, T>;

export { type SelectionMapCollection, createSelectedItemMap, deriveSelectionState, resolveSelectedItems, updateSelectedItemMap };
