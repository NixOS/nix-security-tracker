declare const REGEX: {
    numeric: RegExp;
    alphabetic: RegExp;
    alphanumeric: RegExp;
};
type PinInputType = keyof typeof REGEX;
declare function isValidType(type: string, value: string): boolean;
declare function isValidValue(value: string, type: PinInputType, pattern?: string): boolean;

export { isValidType, isValidValue };
