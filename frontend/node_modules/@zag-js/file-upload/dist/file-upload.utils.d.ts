import { Params } from '@zag-js/core';
import { FileUploadSchema, FileRejection } from './file-upload.types.js';
import '@zag-js/file-utils';
import '@zag-js/types';

declare function isEventWithFiles(event: Pick<DragEvent, "dataTransfer" | "target">): boolean;
declare function isFilesWithinRange(ctx: Params<FileUploadSchema>, incomingCount: number, currentAcceptedFiles: File[]): boolean;
declare function getEventFiles(ctx: Params<FileUploadSchema>, files: File[], currentAcceptedFiles?: File[], currentRejectedFiles?: FileRejection[]): {
    acceptedFiles: File[];
    rejectedFiles: FileRejection[];
};
declare function setInputFiles(inputEl: HTMLInputElement, files: File[]): void;

export { getEventFiles, isEventWithFiles, isFilesWithinRange, setInputFiles };
