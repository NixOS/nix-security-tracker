declare function requestPointerLock(doc: Document, fn?: (locked: boolean) => void): (() => void) | undefined;

export { requestPointerLock };
