/**
 * Formats a date using the given format string as defined in:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
declare function formatDate(date: Date, format: string, locale: string, timeZone?: string): string;

export { formatDate };
