declare const getFileEntries: (items: DataTransferItemList, traverseDirectories: boolean | undefined) => Promise<(File | (File | null)[] | null | undefined)[]>;

export { getFileEntries };
