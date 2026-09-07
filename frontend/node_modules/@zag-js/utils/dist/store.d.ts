type StoreListener = VoidFunction;
type StoreCompareFn<T> = (a: T, b: T) => boolean;
declare function createStore<T extends Record<string, any>>(initialState: T, compare?: StoreCompareFn<T>): Store<T>;
interface Store<T extends Record<string, any>> {
    subscribe: (listener: StoreListener) => () => void;
    get: <K extends keyof T>(key: K) => T[K];
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    update: (updates: Partial<T>) => void;
    snapshot: () => T;
}

export { type Store, type StoreCompareFn, type StoreListener, createStore };
