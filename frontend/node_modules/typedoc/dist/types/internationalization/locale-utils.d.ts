import type { BuiltinTranslatableStringConstraints } from "./translatable.js";
export declare function buildTranslation<const T extends BuiltinTranslatableStringConstraints>(translations: T): T;
export declare function buildIncompleteTranslation<const T extends Partial<BuiltinTranslatableStringConstraints>>(translations: T): T;
