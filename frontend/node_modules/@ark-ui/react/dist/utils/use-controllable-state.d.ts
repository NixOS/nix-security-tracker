export interface UseControllableStateProps<T> {
    value?: T | undefined;
    defaultValue?: T | undefined;
    onChange?: ((value: T) => void) | undefined;
}
export declare function useControllableState<T>(props: UseControllableStateProps<T>): readonly [T, (value: T) => void | undefined];
