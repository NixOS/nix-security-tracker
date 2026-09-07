import { FileError } from './types.mjs';

declare function isValidFileSize(file: File, minSize?: number, maxSize?: number): [boolean, FileError | null];

export { isValidFileSize };
