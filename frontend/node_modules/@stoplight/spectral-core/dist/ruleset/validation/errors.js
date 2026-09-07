"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAjvErrors = exports.RulesetValidationError = void 0;
const isAggregateError_1 = require("../../guards/isAggregateError");
class RulesetValidationError extends Error {
    constructor(code, message, path, location) {
        super(message);
        this.code = code;
        this.message = message;
        this.path = path;
        this.range = location === null || location === void 0 ? void 0 : location.range;
        this.source = location === null || location === void 0 ? void 0 : location.source;
    }
}
exports.RulesetValidationError = RulesetValidationError;
const RULE_INSTANCE_PATH = /^\/rules\/[^/]+/;
const GENERIC_INSTANCE_PATH = /^\/(?:aliases|extends|overrides(?:\/\d+\/extends)?)/;
function convertAjvErrors(errors, sourceContext) {
    const sortedErrors = [...errors]
        .sort((errorA, errorB) => {
        const diff = errorA.instancePath.length - errorB.instancePath.length;
        return diff === 0 ? (errorA.keyword === 'errorMessage' && errorB.keyword !== 'errorMessage' ? -1 : 0) : diff;
    })
        .filter((error, i, sortedErrors) => i === 0 || sortedErrors[i - 1].instancePath !== error.instancePath);
    const filteredErrors = [];
    l: for (let i = 0; i < sortedErrors.length; i++) {
        const error = sortedErrors[i];
        const prevError = filteredErrors.length === 0 ? null : filteredErrors[filteredErrors.length - 1];
        if (error.keyword === 'if')
            continue;
        if (GENERIC_INSTANCE_PATH.test(error.instancePath)) {
            let x = 1;
            while (i + x < sortedErrors.length) {
                if (sortedErrors[i + x].instancePath.startsWith(error.instancePath) ||
                    !GENERIC_INSTANCE_PATH.test(sortedErrors[i + x].instancePath)) {
                    continue l;
                }
                x++;
            }
        }
        else if (prevError === null) {
            filteredErrors.push(error);
            continue;
        }
        else {
            const match = RULE_INSTANCE_PATH.exec(error.instancePath);
            if (match !== null && match[0] !== match.input && match[0] === prevError.instancePath) {
                filteredErrors.pop();
            }
        }
        filteredErrors.push(error);
    }
    return filteredErrors.flatMap(error => {
        var _a;
        if (error.keyword === 'x-spectral-runtime') {
            const flat = flatErrors(error.params.errors);
            const list = Array.isArray(flat) ? flat : [flat];
            return list.map(e => enrichWithLocation(e, sourceContext));
        }
        const path = error.instancePath.slice(1).split('/');
        return new RulesetValidationError(inferErrorCode(path, error.keyword), (_a = error.message) !== null && _a !== void 0 ? _a : 'unknown error', path, resolveLocation(path, sourceContext));
    });
}
exports.convertAjvErrors = convertAjvErrors;
function flatErrors(error) {
    if ((0, isAggregateError_1.isAggregateError)(error)) {
        return error.errors.flatMap(flatErrors);
    }
    return error;
}
function resolveLocation(path, sourceContext) {
    var _a;
    if (sourceContext === undefined) {
        return undefined;
    }
    return {
        source: sourceContext.source,
        range: (_a = sourceContext.getLocationForJsonPath(path)) === null || _a === void 0 ? void 0 : _a.range,
    };
}
function enrichWithLocation(error, sourceContext) {
    if (sourceContext === undefined || error.source !== undefined || error.range !== undefined) {
        return error;
    }
    return new RulesetValidationError(error.code, error.message, error.path, resolveLocation(error.path, sourceContext));
}
function inferErrorCode(path, keyword) {
    if (path.length === 0) {
        return 'generic-validation-error';
    }
    if (path.length === 1 && keyword !== 'errorMessage') {
        return 'invalid-ruleset-definition';
    }
    switch (path[0]) {
        case 'rules':
            return inferErrorCodeFromRulesError(path);
        case 'parserOptions':
            return 'invalid-parser-options-definition';
        case 'aliases':
            return inferErrorCodeFromAliasesError(path);
        case 'extends':
            return 'invalid-extend-definition';
        case 'overrides':
            return inferErrorCodeFromOverrideError(path, keyword);
        case 'formats':
            if (path.length === 1) {
                return 'invalid-ruleset-definition';
            }
            return 'invalid-format';
        default:
            return 'generic-validation-error';
    }
}
function inferErrorCodeFromRulesError(path) {
    if (path.length === 3 && path[2] === 'severity') {
        return 'invalid-severity';
    }
    if (path.length === 4 && path[2] === 'formats') {
        return 'invalid-format';
    }
    if (path.length === 4 && path[2] === 'given') {
        return 'invalid-given-definition';
    }
    return 'invalid-rule-definition';
}
function inferErrorCodeFromOverrideError(path, keyword) {
    if (path.length >= 3) {
        return inferErrorCode(path.slice(2), keyword);
    }
    return 'invalid-override-definition';
}
function inferErrorCodeFromAliasesError(path) {
    if (path.length === 6) {
        if (path[4] === 'given') {
            return 'invalid-given-definition';
        }
        if (path[4] === 'formats') {
            return 'invalid-format';
        }
    }
    return 'invalid-alias-definition';
}
//# sourceMappingURL=errors.js.map