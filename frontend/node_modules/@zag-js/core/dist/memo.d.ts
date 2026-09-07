type NoInfer<T> = [T][T extends any ? 0 : never];
declare function memo<TDeps extends any[], TDepArgs, TResult>(getDeps: (depArgs: TDepArgs) => [...TDeps], fn: (args: NoInfer<[...TDeps]>, deps: TDepArgs) => TResult, opts?: {
    onChange?: ((result: TResult) => void) | undefined;
}): (depArgs: TDepArgs) => TResult;

export { memo };
