interface FormatBytesOptions {
    /**
     * The number of significant digits to include in the formatted output.
     * @default 3
     */
    precision?: number | undefined;
    /**
     * The unit system to use for calculations.
     * - "binary": Uses 1024 as the base (e.g., 1 KiB = 1024 bytes)
     * - "decimal": Uses 1000 as the base (e.g., 1 KB = 1000 bytes)
     * @default "decimal"
     */
    unitSystem?: "binary" | "decimal" | undefined;
    /**
     * The type of unit to format the value as.
     * - "bit": Format as bits (b)
     * - "byte": Format as bytes (B)
     * @default "byte"
     */
    unit?: "bit" | "byte" | undefined;
    /**
     * The display style for the unit.
     * - "long": Full unit name (e.g., "kilobytes")
     * - "short": Abbreviated unit (e.g., "KB")
     * - "narrow": Compact unit (e.g., "K")
     * @default "short"
     */
    unitDisplay?: "long" | "short" | "narrow" | undefined;
}
declare const formatBytes: (bytes: number, locale?: string, options?: FormatBytesOptions) => string;

export { type FormatBytesOptions, formatBytes };
