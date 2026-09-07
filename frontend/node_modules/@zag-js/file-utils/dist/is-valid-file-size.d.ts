import { FileError } from './types.js';

declare function isValidFileSize(file: File, minSize?: number, maxSize?: number): [boolean, FileError | null];

export { isValidFileSize };
