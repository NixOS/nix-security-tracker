interface Props {
    [key: string | symbol]: any;
}
type TupleTypes<T extends any[]> = T[number];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
declare function mergeProps<T extends Props>(...args: Array<T | undefined>): UnionToIntersection<TupleTypes<T[]>>;

export { mergeProps };
