import { CollectionOptions, ListCollection, CollectionItem, GridCollectionOptions, GridCollection } from '@zag-js/collection';

declare const collection: {
    <T extends unknown>(options: CollectionOptions<T>): ListCollection<T>;
    empty(): ListCollection<CollectionItem>;
};
declare const gridCollection: {
    <T extends unknown>(options: GridCollectionOptions<T>): GridCollection<T>;
    empty(): GridCollection<CollectionItem>;
};

export { collection, gridCollection };
