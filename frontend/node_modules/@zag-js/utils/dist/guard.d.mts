type AnyFunction = (...args: any[]) => any;
declare const isDev: () => boolean;
declare const isArray: (v: any) => v is any[];
declare const isBoolean: (v: any) => v is boolean;
declare const isObjectLike: (v: any) => v is Record<string, any>;
declare const isObject: (v: any) => v is Record<string, any>;
declare const isNumber: (v: any) => v is number;
declare const isString: (v: any) => v is string;
declare const isFunction: (v: any) => v is AnyFunction;
declare const isNull: (v: any) => v is null | undefined;
declare const hasProp: <T extends string>(obj: any, prop: T) => obj is Record<T, any>;
declare const isPlainObject: (v: any) => boolean;

export { hasProp, isArray, isBoolean, isDev, isFunction, isNull, isNumber, isObject, isObjectLike, isPlainObject, isString };
