import type { ErrorObject } from 'ajv';
import type { IDiagnostic, IRange, JsonPath } from '@stoplight/types';
export declare type RulesetValidationErrorCode = 'generic-validation-error' | 'invalid-ruleset-definition' | 'invalid-parser-options-definition' | 'invalid-alias-definition' | 'invalid-extend-definition' | 'invalid-rule-definition' | 'invalid-override-definition' | 'invalid-function-options' | 'invalid-given-definition' | 'invalid-severity' | 'invalid-format' | 'undefined-function' | 'undefined-alias';
export declare type RulesetSourceContext = {
    readonly source: string;
    getLocationForJsonPath(path: JsonPath): {
        range: IRange;
    } | undefined;
};
interface IRulesetValidationSingleError extends Pick<IDiagnostic, 'message' | 'path'> {
    readonly code: RulesetValidationErrorCode;
    readonly range?: IRange;
    readonly source?: string;
}
export declare class RulesetValidationError extends Error implements IRulesetValidationSingleError {
    readonly code: RulesetValidationErrorCode;
    readonly message: string;
    readonly path: JsonPath;
    readonly range?: IRange;
    readonly source?: string;
    constructor(code: RulesetValidationErrorCode, message: string, path: JsonPath, location?: {
        range?: IRange;
        source?: string;
    });
}
export declare function convertAjvErrors(errors: ErrorObject[], sourceContext?: RulesetSourceContext): RulesetValidationError[];
export {};
