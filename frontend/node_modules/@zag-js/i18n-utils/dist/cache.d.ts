type FormatOptions<T> = T extends Intl.NumberFormat ? Intl.NumberFormatOptions : T extends Intl.DateTimeFormat ? Intl.DateTimeFormatOptions : T extends Intl.RelativeTimeFormat ? Intl.RelativeTimeFormatOptions : T extends Intl.ListFormat ? Intl.ListFormatOptions : T extends Intl.PluralRules ? Intl.PluralRulesOptions : T extends Intl.Collator ? Intl.CollatorOptions : never;
declare function i18nCache<T extends abstract new (...args: any) => any>(Ins: T): (locale: string, options?: FormatOptions<InstanceType<T>>) => InstanceType<T>;

export { i18nCache };
