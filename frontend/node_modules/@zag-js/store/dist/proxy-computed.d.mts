import { Snapshot } from './proxy.mjs';

declare function proxyWithComputed<T extends object, U extends object>(initialObject: T, computedFns: {
    [K in keyof U]: ((snap: Snapshot<T>) => U[K]) | {
        get: (snap: Snapshot<T>) => U[K];
        set?: ((state: T, newValue: U[K]) => void) | undefined;
    };
}): T & U;

export { proxyWithComputed };
