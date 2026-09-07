Object.defineProperty(exports, '__esModule', { value: true });
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let __orval_core = require("@orval/core");
__orval_core = __toESM(__orval_core);
let lodash_uniq = require("lodash.uniq");
lodash_uniq = __toESM(lodash_uniq);
require("openapi3-ts/oas30");
require("openapi3-ts/oas31");

//#region src/compatibleV4.ts
const getZodPackageVersion = (packageJson) => {
	return packageJson.dependencies?.zod ?? packageJson.devDependencies?.zod ?? packageJson.peerDependencies?.zod;
};
const isZodVersionV4 = (packageJson) => {
	const version = getZodPackageVersion(packageJson);
	if (!version) return false;
	const withoutRc = version.split("-")[0];
	return (0, __orval_core.compareVersions)(withoutRc, "4.0.0");
};
const getZodDateFormat = (isZodV4) => {
	return isZodV4 ? "iso.date" : "date";
};
const getZodTimeFormat = (isZodV4) => {
	return isZodV4 ? "iso.time" : "time";
};
const getZodDateTimeFormat = (isZodV4) => {
	return isZodV4 ? "iso.datetime" : "datetime";
};
const getParameterFunctions = (isZodV4, strict, parameters) => {
	if (isZodV4 && strict) return [["strictObject", parameters]];
	else return strict ? [["object", parameters], ["strict", void 0]] : [["object", parameters]];
};
const getObjectFunctionName = (isZodV4, strict) => {
	return isZodV4 && strict ? "strictObject" : "object";
};

//#endregion
//#region src/index.ts
const ZOD_DEPENDENCIES = [{
	exports: [{
		default: false,
		name: "zod",
		syntheticDefaultImport: false,
		namespaceImport: true,
		values: true
	}],
	dependency: "zod"
}];
const getZodDependencies = () => ZOD_DEPENDENCIES;
/**
* values that may appear in "type". Equals SchemaObjectType
*/
const possibleSchemaTypes = new Set([
	"integer",
	"number",
	"string",
	"boolean",
	"object",
	"strictObject",
	"null",
	"array"
]);
const resolveZodType = (schema) => {
	const schemaTypeValue = schema.type;
	if (Array.isArray(schemaTypeValue)) {
		const nonNullTypes = schemaTypeValue.filter((t) => t !== "null" && possibleSchemaTypes.has(t)).map((t) => t === "integer" ? "number" : t);
		if (nonNullTypes.length > 1) return { multiType: nonNullTypes };
		const type$1 = nonNullTypes[0];
		if (type$1 === "array" && "prefixItems" in schema) return "tuple";
		return type$1;
	}
	const type = schemaTypeValue;
	if (schema.type === "array" && "prefixItems" in schema) return "tuple";
	switch (type) {
		case "integer": return "number";
		default: return type ?? "unknown";
	}
};
const constsUniqueCounter = {};
const COERCIBLE_TYPES = new Set([
	"string",
	"number",
	"boolean",
	"bigint",
	"date"
]);
const minAndMaxTypes = new Set([
	"number",
	"string",
	"array"
]);
const removeReadOnlyProperties = (schema) => {
	if (schema.properties) return {
		...schema,
		properties: Object.entries(schema.properties).reduce((acc, [key, value]) => {
			if ("readOnly" in value && value.readOnly) return acc;
			acc[key] = value;
			return acc;
		}, {})
	};
	if (schema.items && "properties" in schema.items) return {
		...schema,
		items: removeReadOnlyProperties(schema.items)
	};
	return schema;
};
const generateZodValidationSchemaDefinition = (schema, context, name, strict, isZodV4, rules) => {
	if (!schema) return {
		functions: [],
		consts: []
	};
	const consts = [];
	const constsCounter = typeof constsUniqueCounter[name] === "number" ? constsUniqueCounter[name] + 1 : 0;
	const constsCounterValue = constsCounter ? (0, __orval_core.pascal)((0, __orval_core.getNumberWord)(constsCounter)) : "";
	constsUniqueCounter[name] = constsCounter;
	const functions = [];
	const type = resolveZodType(schema);
	const required = rules?.required ?? false;
	const nullable = "nullable" in schema && schema.nullable || Array.isArray(schema.type) && schema.type.includes("null");
	const min = schema.minimum ?? schema.minLength ?? schema.minItems;
	const max = schema.maximum ?? schema.maxLength ?? schema.maxItems;
	const multipleOf = schema.multipleOf;
	const matches = schema.pattern ?? void 0;
	let defaultVarName;
	if (schema.default !== void 0) {
		defaultVarName = `${name}Default${constsCounterValue}`;
		let defaultValue;
		if (schema.type === "string" && (schema.format === "date" || schema.format === "date-time") && context.output.override.useDates) defaultValue = `new Date("${(0, __orval_core.escape)(schema.default)}")`;
		else if ((0, __orval_core.isObject)(schema.default)) defaultValue = `{ ${Object.entries(schema.default).map(([key, value]) => {
			if ((0, __orval_core.isString)(value)) return `${key}: "${(0, __orval_core.escape)(value)}"`;
			if (Array.isArray(value)) {
				const arrayItems = value.map((item) => (0, __orval_core.isString)(item) ? `"${(0, __orval_core.escape)(item)}"` : `${item}`);
				return `${key}: [${arrayItems.join(", ")}]`;
			}
			return `${key}: ${value}`;
		}).join(", ")} }`;
		else {
			const rawStringified = (0, __orval_core.stringify)(schema.default);
			defaultValue = rawStringified === void 0 ? "null" : rawStringified.replaceAll("'", "\"");
		}
		consts.push(`export const ${defaultVarName} = ${defaultValue};`);
	}
	if (typeof type === "object" && "multiType" in type) {
		const types = type.multiType;
		functions.push(["oneOf", types.map((t) => generateZodValidationSchemaDefinition({
			...schema,
			type: t
		}, context, name, strict, isZodV4, { required: true }))]);
		if (!required && nullable) functions.push(["nullish", void 0]);
		else if (nullable) functions.push(["nullable", void 0]);
		else if (!required) functions.push(["optional", void 0]);
		return {
			functions,
			consts
		};
	}
	switch (type) {
		case "tuple":
			/**
			*
			* > 10.3.1.1. prefixItems
			* > The value of "prefixItems" MUST be a non-empty array of valid JSON Schemas.
			* >
			* > Validation succeeds if each element of the instance validates against the schema at the same position, if any.
			* > This keyword does not constrain the length of the array. If the array is longer than this keyword's value,
			* > this keyword validates only the prefix of matching length.
			* >
			* > This keyword produces an annotation value which is the largest index to which this keyword applied a subschema.
			* > The value MAY be a boolean true if a subschema was applied to every index of the instance, such as is produced by the "items" keyword.
			* > This annotation affects the behavior of "items" and "unevaluatedItems".
			* >
			* > Omitting this keyword has the same assertion behavior as an empty array.
			*/
			if ("prefixItems" in schema) {
				const schema31 = schema;
				if (schema31.prefixItems && schema31.prefixItems.length > 0) {
					functions.push(["tuple", schema31.prefixItems.map((item, idx) => generateZodValidationSchemaDefinition(deference(item, context), context, (0, __orval_core.camel)(`${name}-${idx}-item`), isZodV4, strict, { required: true }))]);
					if (schema.items && (max || Number.POSITIVE_INFINITY) > schema31.prefixItems.length) functions.push(["rest", generateZodValidationSchemaDefinition(schema.items, context, (0, __orval_core.camel)(`${name}-item`), strict, isZodV4, { required: true })]);
				}
			}
			break;
		case "array":
			functions.push(["array", generateZodValidationSchemaDefinition(schema.items, context, (0, __orval_core.camel)(`${name}-item`), strict, isZodV4, { required: true })]);
			break;
		case "string":
			if (schema.enum && type === "string") break;
			if (context.output.override.useDates && (schema.format === "date" || schema.format === "date-time")) {
				functions.push(["date", void 0]);
				break;
			}
			if (schema.format === "binary") {
				functions.push(["instanceof", "File"]);
				break;
			}
			if (isZodV4) {
				if (![
					"date",
					"time",
					"date-time",
					"email",
					"uri",
					"hostname",
					"uuid"
				].includes(schema.format || "")) {
					if ("const" in schema) functions.push(["literal", `"${schema.const}"`]);
					else functions.push([type, void 0]);
					break;
				}
			} else if ("const" in schema) functions.push(["literal", `"${schema.const}"`]);
			else functions.push([type, void 0]);
			if (schema.format === "date") {
				const formatAPI = getZodDateFormat(isZodV4);
				functions.push([formatAPI, void 0]);
				break;
			}
			if (schema.format === "time") {
				const options = context.output.override.zod?.timeOptions;
				const formatAPI = getZodTimeFormat(isZodV4);
				functions.push([formatAPI, options ? JSON.stringify(options) : void 0]);
				break;
			}
			if (schema.format === "date-time") {
				const options = context.output.override.zod?.dateTimeOptions;
				const formatAPI = getZodDateTimeFormat(isZodV4);
				functions.push([formatAPI, options ? JSON.stringify(options) : void 0]);
				break;
			}
			if (schema.format === "email") {
				functions.push(["email", void 0]);
				break;
			}
			if (schema.format === "uri" || schema.format === "hostname") {
				functions.push(["url", void 0]);
				break;
			}
			if (schema.format === "uuid") {
				functions.push(["uuid", void 0]);
				break;
			}
			break;
		case "object":
		default:
			if (schema.allOf || schema.oneOf || schema.anyOf) {
				const separator = schema.allOf ? "allOf" : schema.oneOf ? "oneOf" : "anyOf";
				const schemas = schema.allOf ?? schema.oneOf ?? schema.anyOf;
				functions.push([separator, schemas.map((schema$1) => generateZodValidationSchemaDefinition(schema$1, context, (0, __orval_core.camel)(name), strict, isZodV4, { required: true }))]);
				break;
			}
			if (schema.properties) {
				const objectType = getObjectFunctionName(isZodV4, strict);
				functions.push([objectType, Object.keys(schema.properties).map((key) => ({ [key]: generateZodValidationSchemaDefinition(schema.properties?.[key], context, (0, __orval_core.camel)(`${name}-${key}`), strict, isZodV4, { required: schema.required?.includes(key) }) })).reduce((acc, curr) => ({
					...acc,
					...curr
				}), {})]);
				if (strict && !isZodV4) functions.push(["strict", void 0]);
				break;
			}
			if (schema.additionalProperties) {
				functions.push(["additionalProperties", generateZodValidationSchemaDefinition((0, __orval_core.isBoolean)(schema.additionalProperties) ? {} : schema.additionalProperties, context, name, strict, isZodV4, { required: true })]);
				break;
			}
			if (schema.enum) break;
			functions.push([type, void 0]);
			break;
	}
	if (minAndMaxTypes.has(type)) {
		if (min !== void 0) if (min === 1) functions.push(["min", `${min}`]);
		else {
			consts.push(`export const ${name}Min${constsCounterValue} = ${min};`);
			functions.push(["min", `${name}Min${constsCounterValue}`]);
		}
		if (max !== void 0) {
			consts.push(`export const ${name}Max${constsCounterValue} = ${max};`);
			functions.push(["max", `${name}Max${constsCounterValue}`]);
		}
		if (multipleOf !== void 0) {
			consts.push(`export const ${name}MultipleOf${constsCounterValue} = ${multipleOf.toString()};`);
			functions.push(["multipleOf", `${name}MultipleOf${constsCounterValue}`]);
		}
		if (min !== void 0 || multipleOf !== void 0 || max !== void 0) consts.push(`\n`);
	}
	if (matches) {
		const isStartWithSlash = matches.startsWith("/");
		const isEndWithSlash = matches.endsWith("/");
		const regexp = `new RegExp('${(0, __orval_core.jsStringEscape)(matches.slice(isStartWithSlash ? 1 : 0, isEndWithSlash ? -1 : void 0))}')`;
		consts.push(`export const ${name}RegExp${constsCounterValue} = ${regexp};\n`);
		functions.push(["regex", `${name}RegExp${constsCounterValue}`]);
	}
	if (schema.enum) if (schema.enum.every((value) => (0, __orval_core.isString)(value))) functions.push(["enum", `[${schema.enum.map((value) => `'${(0, __orval_core.escape)(value)}'`).join(", ")}]`]);
	else functions.push(["oneOf", schema.enum.map((value) => ({
		functions: [["literal", (0, __orval_core.isString)(value) ? `'${(0, __orval_core.escape)(value)}'` : value]],
		consts: []
	}))]);
	if (!required && schema.default) functions.push(["default", defaultVarName]);
	else if (!required && nullable) functions.push(["nullish", void 0]);
	else if (nullable) functions.push(["nullable", void 0]);
	else if (!required) functions.push(["optional", void 0]);
	if (schema.description) functions.push(["describe", `'${(0, __orval_core.jsStringEscape)(schema.description)}'`]);
	return {
		functions,
		consts: (0, lodash_uniq.default)(consts)
	};
};
const parseZodValidationSchemaDefinition = (input, context, coerceTypes = false, strict, isZodV4, preprocess) => {
	if (input.functions.length === 0) return {
		zod: "",
		consts: ""
	};
	let consts = "";
	const parseProperty = (property) => {
		const [fn, args = ""] = property;
		if (fn === "allOf") return args.reduce((acc, { functions, consts: argConsts }) => {
			const value$1 = functions.map(parseProperty).join("");
			const valueWithZod = `${value$1.startsWith(".") ? "zod" : ""}${value$1}`;
			if (argConsts.length > 0) consts += argConsts.join("\n");
			if (!acc) {
				acc += valueWithZod;
				return acc;
			}
			acc += `.and(${valueWithZod})`;
			return acc;
		}, "");
		if (fn === "oneOf" || fn === "anyOf") {
			if (args.length === 1) return args[0].functions.map(parseProperty).join("");
			return `.union([${args.map(({ functions, consts: argConsts }) => {
				const value$1 = functions.map(parseProperty).join("");
				const valueWithZod = `${value$1.startsWith(".") ? "zod" : ""}${value$1}`;
				consts += argConsts?.join("\n");
				return valueWithZod;
			})}])`;
		}
		if (fn === "additionalProperties") {
			const value$1 = args.functions.map(parseProperty).join("");
			const valueWithZod = `${value$1.startsWith(".") ? "zod" : ""}${value$1}`;
			consts += args.consts;
			return `zod.record(zod.string(), ${valueWithZod})`;
		}
		if (fn === "object" || fn === "strictObject") return `zod.${getObjectFunctionName(isZodV4, strict)}({
${Object.entries(args).map(([key, schema$1]) => {
			const value$1 = schema$1.functions.map(parseProperty).join("");
			consts += schema$1.consts.join("\n");
			return `  "${key}": ${value$1.startsWith(".") ? "zod" : ""}${value$1}`;
		}).join(",\n")}
})`;
		if (fn === "array") {
			const value$1 = args.functions.map(parseProperty).join("");
			if (typeof args.consts === "string") consts += args.consts;
			else if (Array.isArray(args.consts)) consts += args.consts.join("\n");
			return `.array(${value$1.startsWith(".") ? "zod" : ""}${value$1})`;
		}
		if (fn === "strict" && !isZodV4) return ".strict()";
		if (fn === "tuple") return `zod.tuple([${args.map((x) => {
			const value$1 = x.functions.map(parseProperty).join("");
			return `${value$1.startsWith(".") ? "zod" : ""}${value$1}`;
		}).join(",\n")}])`;
		if (fn === "rest") return `.rest(zod${args.functions.map(parseProperty)})`;
		const shouldCoerceType = coerceTypes && (Array.isArray(coerceTypes) ? coerceTypes.includes(fn) : COERCIBLE_TYPES.has(fn));
		if (fn !== "date" && shouldCoerceType || fn === "date" && shouldCoerceType && context.output.override.useDates) return `.coerce.${fn}(${args})`;
		return `.${fn}(${args})`;
	};
	consts += input.consts.join("\n");
	const schema = input.functions.map(parseProperty).join("");
	const value = preprocess ? `.preprocess(${preprocess.name}, ${schema.startsWith(".") ? "zod" : ""}${schema})` : schema;
	const zod = `${value.startsWith(".") ? "zod" : ""}${value}`;
	if (consts?.includes(",export")) consts = consts.replaceAll(",export", "\nexport");
	return {
		zod,
		consts
	};
};
const deferenceScalar = (value, context) => {
	if ((0, __orval_core.isObject)(value)) return deference(value, context);
	else if (Array.isArray(value)) return value.map((item) => deferenceScalar(item, context));
	else return value;
};
const deference = (schema, context) => {
	const refName = "$ref" in schema ? schema.$ref : void 0;
	if (refName && context.parents?.includes(refName)) return {};
	const childContext = {
		...context,
		...refName ? { parents: [...context.parents || [], refName] } : void 0
	};
	const { schema: resolvedSchema } = (0, __orval_core.resolveRef)(schema, childContext);
	const resolvedSpecKey = refName ? (0, __orval_core.getRefInfo)(refName, context).specKey : void 0;
	const resolvedContext = {
		...childContext,
		specKey: resolvedSpecKey ?? childContext.specKey
	};
	return Object.entries(resolvedSchema).reduce((acc, [key, value]) => {
		if (key === "properties" && (0, __orval_core.isObject)(value)) acc[key] = Object.entries(value).reduce((props, [propKey, propSchema]) => {
			props[propKey] = deference(propSchema, resolvedContext);
			return props;
		}, {});
		else if (key === "default" || key === "example" || key === "examples") acc[key] = value;
		else acc[key] = deferenceScalar(value, resolvedContext);
		return acc;
	}, {});
};
const parseBodyAndResponse = ({ data, context, name, strict, generate, isZodV4, parseType }) => {
	if (!data || !generate) return {
		input: {
			functions: [],
			consts: []
		},
		isArray: false
	};
	const resolvedRef = (0, __orval_core.resolveRef)(data, context).schema;
	const schema = resolvedRef.content?.["application/json"]?.schema || resolvedRef.content?.["multipart/form-data"]?.schema;
	if (!schema) return {
		input: {
			functions: [],
			consts: []
		},
		isArray: false
	};
	const resolvedJsonSchema = deference(schema, context);
	if (resolvedJsonSchema.items) {
		const min = resolvedJsonSchema.minimum ?? resolvedJsonSchema.minLength ?? resolvedJsonSchema.minItems;
		const max = resolvedJsonSchema.maximum ?? resolvedJsonSchema.maxLength ?? resolvedJsonSchema.maxItems;
		return {
			input: generateZodValidationSchemaDefinition(parseType === "body" ? removeReadOnlyProperties(resolvedJsonSchema.items) : resolvedJsonSchema.items, context, name, strict, isZodV4, { required: true }),
			isArray: true,
			rules: {
				...min === void 0 ? {} : { min },
				...max === void 0 ? {} : { max }
			}
		};
	}
	return {
		input: generateZodValidationSchemaDefinition(parseType === "body" ? removeReadOnlyProperties(resolvedJsonSchema) : resolvedJsonSchema, context, name, strict, isZodV4, { required: true }),
		isArray: false
	};
};
const parseParameters = ({ data, context, operationName, isZodV4, strict, generate }) => {
	if (!data) return {
		headers: {
			functions: [],
			consts: []
		},
		queryParams: {
			functions: [],
			consts: []
		},
		params: {
			functions: [],
			consts: []
		}
	};
	const defintionsByParameters = data.reduce((acc, val) => {
		const { schema: parameter } = (0, __orval_core.resolveRef)(val, context);
		if (!parameter.schema) return acc;
		const schema = deference(parameter.schema, context);
		schema.description = parameter.description;
		const mapStrict = {
			path: strict.param,
			query: strict.query,
			header: strict.header
		};
		const mapGenerate = {
			path: generate.param,
			query: generate.query,
			header: generate.header
		};
		const definition = generateZodValidationSchemaDefinition(schema, context, (0, __orval_core.camel)(`${operationName}-${parameter.in}-${parameter.name}`), mapStrict[parameter.in] ?? false, isZodV4, { required: parameter.required });
		if (parameter.in === "header" && mapGenerate.header) return {
			...acc,
			headers: {
				...acc.headers,
				[parameter.name]: definition
			}
		};
		if (parameter.in === "query" && mapGenerate.query) return {
			...acc,
			queryParams: {
				...acc.queryParams,
				[parameter.name]: definition
			}
		};
		if (parameter.in === "path" && mapGenerate.path) return {
			...acc,
			params: {
				...acc.params,
				[parameter.name]: definition
			}
		};
		return acc;
	}, {
		headers: {},
		queryParams: {},
		params: {}
	});
	const headers = {
		functions: [],
		consts: []
	};
	if (Object.keys(defintionsByParameters.headers).length > 0) {
		const parameterFunctions = getParameterFunctions(isZodV4, strict.header, defintionsByParameters.headers);
		headers.functions.push(...parameterFunctions);
	}
	const queryParams = {
		functions: [],
		consts: []
	};
	if (Object.keys(defintionsByParameters.queryParams).length > 0) {
		const parameterFunctions = getParameterFunctions(isZodV4, strict.query, defintionsByParameters.queryParams);
		queryParams.functions.push(...parameterFunctions);
	}
	const params = {
		functions: [],
		consts: []
	};
	if (Object.keys(defintionsByParameters.params).length > 0) {
		const parameterFunctions = getParameterFunctions(isZodV4, strict.param, defintionsByParameters.params);
		params.functions.push(...parameterFunctions);
	}
	return {
		headers,
		queryParams,
		params
	};
};
const generateZodRoute = async ({ operationName, verb, override }, { pathRoute, context, output }) => {
	const isZodV4 = !!context.output.packageJson && isZodVersionV4(context.output.packageJson);
	const spec = context.specs[context.specKey].paths[pathRoute];
	if (spec == void 0) throw new Error(`No such path ${pathRoute} in ${context.specKey}`);
	const parameters = [...spec.parameters ?? [], ...spec[verb]?.parameters ?? []];
	const parsedParameters = parseParameters({
		data: parameters,
		context,
		operationName,
		isZodV4,
		strict: override.zod.strict,
		generate: override.zod.generate
	});
	const requestBody = spec[verb]?.requestBody;
	const parsedBody = parseBodyAndResponse({
		data: requestBody,
		context,
		name: (0, __orval_core.camel)(`${operationName}-body`),
		strict: override.zod.strict.body,
		generate: override.zod.generate.body,
		isZodV4,
		parseType: "body"
	});
	const responses = context.output.override.zod.generateEachHttpStatus ? Object.entries(spec[verb]?.responses ?? {}) : [["", spec[verb]?.responses[200]]];
	const parsedResponses = responses.map(([code, response]) => parseBodyAndResponse({
		data: response,
		context,
		name: (0, __orval_core.camel)(`${operationName}-${code}-response`),
		strict: override.zod.strict.response,
		generate: override.zod.generate.response,
		isZodV4,
		parseType: "response"
	}));
	const preprocessParams = override.zod.preprocess?.param ? await (0, __orval_core.generateMutator)({
		output,
		mutator: override.zod.preprocess.response,
		name: `${operationName}PreprocessParams`,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const inputParams = parseZodValidationSchemaDefinition(parsedParameters.params, context, override.zod.coerce.param, override.zod.strict.param, isZodV4, preprocessParams);
	if (override.coerceTypes) console.warn("override.coerceTypes is deprecated, please use override.zod.coerce instead.");
	const preprocessQueryParams = override.zod.preprocess?.query ? await (0, __orval_core.generateMutator)({
		output,
		mutator: override.zod.preprocess.response,
		name: `${operationName}PreprocessQueryParams`,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const inputQueryParams = parseZodValidationSchemaDefinition(parsedParameters.queryParams, context, override.zod.coerce.query ?? override.coerceTypes, override.zod.strict.query, isZodV4, preprocessQueryParams);
	const preprocessHeader = override.zod.preprocess?.header ? await (0, __orval_core.generateMutator)({
		output,
		mutator: override.zod.preprocess.response,
		name: `${operationName}PreprocessHeader`,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const inputHeaders = parseZodValidationSchemaDefinition(parsedParameters.headers, context, override.zod.coerce.header, override.zod.strict.header, isZodV4, preprocessHeader);
	const preprocessBody = override.zod.preprocess?.body ? await (0, __orval_core.generateMutator)({
		output,
		mutator: override.zod.preprocess.response,
		name: `${operationName}PreprocessBody`,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const inputBody = parseZodValidationSchemaDefinition(parsedBody.input, context, override.zod.coerce.body, override.zod.strict.body, isZodV4, preprocessBody);
	const preprocessResponse = override.zod.preprocess?.response ? await (0, __orval_core.generateMutator)({
		output,
		mutator: override.zod.preprocess.response,
		name: `${operationName}PreprocessResponse`,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const inputResponses = parsedResponses.map((parsedResponse) => parseZodValidationSchemaDefinition(parsedResponse.input, context, override.zod.coerce.response, override.zod.strict.response, isZodV4, preprocessResponse));
	if (!inputParams.zod && !inputQueryParams.zod && !inputHeaders.zod && !inputBody.zod && !inputResponses.some((inputResponse) => inputResponse.zod)) return {
		implemtation: "",
		mutators: []
	};
	return {
		implementation: [
			...inputParams.consts ? [inputParams.consts] : [],
			...inputParams.zod ? [`export const ${operationName}Params = ${inputParams.zod}`] : [],
			...inputQueryParams.consts ? [inputQueryParams.consts] : [],
			...inputQueryParams.zod ? [`export const ${operationName}QueryParams = ${inputQueryParams.zod}`] : [],
			...inputHeaders.consts ? [inputHeaders.consts] : [],
			...inputHeaders.zod ? [`export const ${operationName}Header = ${inputHeaders.zod}`] : [],
			...inputBody.consts ? [inputBody.consts] : [],
			...inputBody.zod ? [parsedBody.isArray ? `export const ${operationName}BodyItem = ${inputBody.zod}
export const ${operationName}Body = zod.array(${operationName}BodyItem)${parsedBody.rules?.min ? `.min(${parsedBody.rules?.min})` : ""}${parsedBody.rules?.max ? `.max(${parsedBody.rules?.max})` : ""}` : `export const ${operationName}Body = ${inputBody.zod}`] : [],
			...inputResponses.flatMap((inputResponse, index) => {
				const operationResponse = (0, __orval_core.camel)(`${operationName}-${responses[index][0]}-response`);
				return [...inputResponse.consts ? [inputResponse.consts] : [], ...inputResponse.zod ? [parsedResponses[index].isArray ? `export const ${operationResponse}Item = ${inputResponse.zod}
export const ${operationResponse} = zod.array(${operationResponse}Item)${parsedResponses[index].rules?.min ? `.min(${parsedResponses[index].rules?.min})` : ""}${parsedResponses[index].rules?.max ? `.max(${parsedResponses[index].rules?.max})` : ""}` : `export const ${operationResponse} = ${inputResponse.zod}`] : []];
			})
		].join("\n\n"),
		mutators: preprocessResponse ? [preprocessResponse] : []
	};
};
const generateZod = async (verbOptions, options) => {
	const { implementation, mutators } = await generateZodRoute(verbOptions, options);
	return {
		implementation: implementation ? `${implementation}\n\n` : "",
		imports: [],
		mutators
	};
};
const zodClientBuilder = {
	client: generateZod,
	dependencies: getZodDependencies
};
const builder = () => () => zodClientBuilder;
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateZod = generateZod;
exports.generateZodValidationSchemaDefinition = generateZodValidationSchemaDefinition;
exports.getZodDependencies = getZodDependencies;
exports.parseZodValidationSchemaDefinition = parseZodValidationSchemaDefinition;
//# sourceMappingURL=index.js.map