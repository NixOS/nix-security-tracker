import { FileMimeType } from './types.mjs';

declare function getFileMimeType(name: string): FileMimeType | null;

export { getFileMimeType };
