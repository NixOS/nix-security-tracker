declare function warn(m: string): void;
declare function warn(c: boolean, m: string): void;
declare function invariant(m: string): void;
declare function invariant(c: boolean, m: string): void;
declare function ensure<T>(c: T | null | undefined, m: () => string): asserts c is T;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
declare function ensureProps<T, K extends keyof T>(props: T, keys: K[], scope?: string): asserts props is T & RequiredBy<T, K>;

export { ensure, ensureProps, invariant, warn };
