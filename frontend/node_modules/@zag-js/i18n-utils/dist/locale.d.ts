type Direction = "rtl" | "ltr";
interface Locale {
    locale: string;
    dir: Direction;
}
declare global {
    interface Navigator {
        userLanguage?: string | undefined;
    }
}
declare function getDefaultLocale(): Locale;

export { type Direction, type Locale, getDefaultLocale };
