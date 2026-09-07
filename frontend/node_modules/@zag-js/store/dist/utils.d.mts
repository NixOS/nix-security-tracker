declare const isObject: (x: unknown) => x is object;
declare const canProxy: (x: unknown) => boolean;
declare const isDev: () => boolean;

export { canProxy, isDev, isObject };
