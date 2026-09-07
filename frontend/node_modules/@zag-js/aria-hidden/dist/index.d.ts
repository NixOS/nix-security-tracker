type MaybeElement = HTMLElement | null;
type Targets = Array<MaybeElement>;
type TargetsOrFn = Targets | (() => Targets);
type Options = {
    defer?: boolean | undefined;
};
declare function ariaHidden(targetsOrFn: TargetsOrFn, options?: Options): () => void;

export { ariaHidden };
