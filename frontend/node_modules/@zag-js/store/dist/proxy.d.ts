type AsRef = {
    $$valtioRef: true;
};
type Path = (string | symbol)[];
type Op = [op: "set", path: Path, value: unknown, prevValue: unknown] | [op: "delete", path: Path, prevValue: unknown];
type Snapshot<T> = T;
declare function proxy<T extends object>(initialObject?: T): T;
declare function getVersion(proxyObject: unknown): number | undefined;
declare function subscribe<T extends object>(proxyObject: T, callback: (ops: Op[]) => void, notifyInSync?: boolean): () => void;
declare function snapshot<T extends object>(proxyObject: T): T;
declare function ref<T extends object>(obj: T): Ref<T>;
type Ref<T> = T & AsRef;

export { type Ref, type Snapshot, getVersion, proxy, ref, snapshot, subscribe };
