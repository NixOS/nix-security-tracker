import { BindableParams, Bindable } from '@zag-js/core';

declare function useBindable<T>(props: () => BindableParams<T>): Bindable<T>;
declare namespace useBindable {
    var cleanup: (fn: VoidFunction) => void;
    var ref: <T>(defaultValue: T) => {
        get: () => T;
        set: (next: T) => void;
    };
}

export { useBindable };
