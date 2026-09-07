import { FileError } from './types.js';

declare function isValidFileType(file: File, accept: string | undefined): [boolean, FileError | null];

export { isValidFileType };
