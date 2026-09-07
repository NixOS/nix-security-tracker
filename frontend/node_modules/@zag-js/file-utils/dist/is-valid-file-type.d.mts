import { FileError } from './types.mjs';

declare function isValidFileType(file: File, accept: string | undefined): [boolean, FileError | null];

export { isValidFileType };
