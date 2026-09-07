declare function globalRef<T>(key: string, value: () => T): T;
declare const refSet: WeakSet<WeakKey>;

export { globalRef, refSet };
