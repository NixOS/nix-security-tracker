declare function useRefs<T>(refs: T): {
    get<K extends keyof T>(key: K): T[K];
    set<K extends keyof T>(key: K, value: T[K]): void;
};

export { useRefs };
