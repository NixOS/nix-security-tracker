interface DownloadFileOptions {
    /**
     * The name of the file
     */
    name?: string | undefined;
    /**
     * The MIME type of the file
     */
    type: string;
    /**
     * The file contents
     */
    file: File | Blob | string;
    /**
     * The window environment
     */
    win?: typeof window | undefined;
    /**
     * Whether to add a BOM (Byte Order Mark) to the file.
     * Useful for CSV files.
     */
    appendBOM?: boolean | undefined;
    /**
     * The timeout in milliseconds to revoke the object URL.
     * This is a safeguard for when the browser has not finished reading the
     * file data from memory before the URL is revoked.
     * @default 0
     */
    revokeTimeout?: number | undefined;
}
declare function downloadFile(options: DownloadFileOptions): void;

export { type DownloadFileOptions, downloadFile };
