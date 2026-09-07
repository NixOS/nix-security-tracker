import { CollectionItem, CollectionOptions, ListCollection } from '@zag-js/collection';
export declare const createListCollection: <T extends CollectionItem>(options: CollectionOptions<T>) => ListCollection<T>;
export type { ListCollection, CollectionOptions, CollectionItem };
