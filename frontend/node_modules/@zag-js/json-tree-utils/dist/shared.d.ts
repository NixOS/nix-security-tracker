declare function hash(str: string): string;
declare function hasProp(value: any, key: string): boolean;
declare function getProp(value: object, key: string): unknown;
declare function defu<T>(a: T, b: Partial<T>): T;
declare const isObj: (v: unknown) => v is Record<string, unknown>;
declare const typeOf: (value: any) => string;

export { defu, getProp, hasProp, hash, isObj, typeOf };
