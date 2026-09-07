interface FilterReturn {
    startsWith(string: string, substring: string): boolean;
    endsWith(string: string, substring: string): boolean;
    contains(string: string, substring: string): boolean;
}
interface FilterOptions extends Intl.CollatorOptions {
    locale?: string | undefined;
}
declare function createFilter(options?: FilterOptions): FilterReturn;

export { type FilterOptions, type FilterReturn, createFilter };
