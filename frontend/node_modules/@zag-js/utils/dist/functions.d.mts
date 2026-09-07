type MaybeFunction<T> = T | (() => T);
type Nullable<T> = T | null | undefined;
declare const runIfFn: <T>(v: T | undefined, ...a: T extends (...a: any[]) => void ? Parameters<T> : never) => T extends (...a: any[]) => void ? NonNullable<ReturnType<T>> : NonNullable<T>;
declare const cast: <T>(v: unknown) => T;
declare const identity: (v: VoidFunction) => void;
declare const noop: () => void;
declare const callAll: <T extends (...a: any[]) => void>(...fns: (T | null | undefined)[]) => (...a: Parameters<T>) => void;
declare const uuid: () => string;
declare function match<V extends string | number = string, R = unknown>(key: V, record: Record<V, R | ((...args: any[]) => R)>, ...args: any[]): R;
declare const tryCatch: <R>(fn: () => R, fallback: () => R) => R;
declare function throttle<T extends (...args: any[]) => void>(fn: T, wait?: number): T;
declare function debounce<T extends (...args: any[]) => void>(fn: T, wait?: number): T;
declare const hash: (value: string) => string;

export { type MaybeFunction, type Nullable, callAll, cast, debounce, hash, identity, match, noop, runIfFn, throttle, tryCatch, uuid };
