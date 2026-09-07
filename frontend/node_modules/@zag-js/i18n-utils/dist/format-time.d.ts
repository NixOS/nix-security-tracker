type TimeFormat = "12h" | "24h";
interface FormatTimeOptions {
    format?: TimeFormat;
    amLabel?: string;
    pmLabel?: string;
    withSeconds?: boolean;
}
declare function formatTime(value: string | Date, locale: string, options?: FormatTimeOptions): string | null;

export { type FormatTimeOptions, type TimeFormat, formatTime };
