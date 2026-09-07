import { CollectionOptions, ListCollection, CollectionItem } from '@zag-js/collection';

declare const collection: {
    <T extends unknown>(options: CollectionOptions<T>): ListCollection<T>;
    empty(): ListCollection<CollectionItem>;
};

export { collection };
