import { Locale } from './locale.js';

interface LocaleOptions {
    locale?: string | undefined;
    getRootNode?: (() => ShadowRoot | Document | Node) | undefined;
    onLocaleChange?: ((locale: Locale) => void) | undefined;
}
declare function trackLocale(options?: LocaleOptions): () => void;

export { type LocaleOptions, trackLocale };
