interface CreateContextOptions<T> {
    strict?: boolean | undefined;
    hookName?: string | undefined;
    providerName?: string | undefined;
    errorMessage?: string | undefined;
    name?: string | undefined;
    defaultValue?: T | undefined;
}
type CreateContextReturn<T> = [React.Provider<T>, () => T, React.Context<T>];
export declare function createContext<T>(options?: CreateContextOptions<T>): CreateContextReturn<T>;
export {};
