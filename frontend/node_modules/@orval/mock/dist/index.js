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
require("openapi3-ts/oas30");

//#region src/delay.ts
const getDelay = (override, options) => {
	const overrideDelay = override?.mock?.delay === void 0 ? options?.delay : override?.mock?.delay;
	const delayFunctionLazyExecute = override?.mock?.delayFunctionLazyExecute ?? options?.delayFunctionLazyExecute;
	switch (typeof overrideDelay) {
		case "function": return delayFunctionLazyExecute ? overrideDelay : overrideDelay();
		case "number":
		case "boolean": return overrideDelay;
		default: return 1e3;
	}
};

//#endregion
//#region src/faker/compatibleV9.ts
const getFakerPackageVersion = (packageJson) => {
	return packageJson.dependencies?.["@faker-js/faker"] ?? packageJson.devDependencies?.["@faker-js/faker"] ?? packageJson.peerDependencies?.["@faker-js/faker"];
};
const isFakerVersionV9 = (packageJson) => {
	const version = getFakerPackageVersion(packageJson);
	if (!version) return false;
	const withoutRc = version.split("-")[0];
	return (0, __orval_core.compareVersions)(withoutRc, "9.0.0");
};

//#endregion
//#region src/faker/constants.ts
const DEFAULT_FORMAT_MOCK = {
	bic: "faker.finance.bic()",
	binary: "new Blob(faker.helpers.arrayElements(faker.word.words(10).split(' ')))",
	city: "faker.location.city()",
	country: "faker.location.country()",
	date: "faker.date.past().toISOString().split('T')[0]",
	"date-time": "`${faker.date.past().toISOString().split('.')[0]}Z`",
	email: "faker.internet.email()",
	firstName: "faker.person.firstName()",
	gender: "faker.person.gender()",
	iban: "faker.finance.iban()",
	ipv4: "faker.internet.ipv4()",
	ipv6: "faker.internet.ipv6()",
	jobTitle: "faker.person.jobTitle()",
	lastName: "faker.person.lastName()",
	password: "faker.internet.password()",
	phoneNumber: "faker.phone.number()",
	streetName: "faker.location.street()",
	uri: "faker.internet.url()",
	url: "faker.internet.url()",
	userName: "faker.internet.userName()",
	uuid: "faker.string.uuid()",
	zipCode: "faker.location.zipCode()"
};
const DEFAULT_OBJECT_KEY_MOCK = "faker.string.alphanumeric(5)";

//#endregion
//#region src/faker/getters/object.ts
const overrideVarName = "overrideResponse";
const getMockObject = ({ item, mockOptions, operationId, tags, combine, context, imports, existingReferencedProperties, splitMockImplementations, allowOverride = false }) => {
	if ((0, __orval_core.isReference)(item)) return resolveMockValue({
		schema: {
			...item,
			name: item.name,
			path: item.path ? `${item.path}.${item.name}` : item.name
		},
		mockOptions,
		operationId,
		tags,
		context,
		imports,
		existingReferencedProperties,
		splitMockImplementations
	});
	if (item.allOf || item.oneOf || item.anyOf) {
		const separator = item.allOf ? "allOf" : item.oneOf ? "oneOf" : "anyOf";
		return combineSchemasMock({
			item,
			separator,
			mockOptions,
			operationId,
			tags,
			combine,
			context,
			imports,
			existingReferencedProperties,
			splitMockImplementations
		});
	}
	if (Array.isArray(item.type)) return combineSchemasMock({
		item: {
			anyOf: item.type.map((type) => ({ type })),
			name: item.name
		},
		separator: "anyOf",
		mockOptions,
		operationId,
		tags,
		combine,
		context,
		imports,
		existingReferencedProperties,
		splitMockImplementations
	});
	if (item.properties) {
		let value = !combine || combine?.separator === "oneOf" || combine?.separator === "anyOf" ? "{" : "";
		const imports$1 = [];
		const includedProperties = [];
		const entries = Object.entries(item.properties);
		if (context.output.propertySortOrder === __orval_core.PropertySortOrder.ALPHABETICAL) entries.sort((a, b) => {
			return a[0].localeCompare(b[0]);
		});
		const properyScalars = entries.map(([key, prop]) => {
			if (combine?.includedProperties.includes(key)) return;
			const isRequired = mockOptions?.required || (Array.isArray(item.required) ? item.required : []).includes(key);
			if ("$ref" in prop && existingReferencedProperties.includes((0, __orval_core.pascal)(prop.$ref.split("/").pop()))) return;
			const resolvedValue = resolveMockValue({
				schema: {
					...prop,
					name: key,
					path: item.path ? `${item.path}.${key}` : `#.${key}`
				},
				mockOptions,
				operationId,
				tags,
				context,
				imports: imports$1,
				existingReferencedProperties,
				splitMockImplementations
			});
			imports$1.push(...resolvedValue.imports);
			includedProperties.push(key);
			const keyDefinition = (0, __orval_core.getKey)(key);
			if (!isRequired && !resolvedValue.overrided) return `${keyDefinition}: faker.helpers.arrayElement([${resolvedValue.value}, undefined])`;
			return `${keyDefinition}: ${resolvedValue.value}`;
		}).filter(Boolean);
		if (allowOverride) properyScalars.push(`...${overrideVarName}`);
		value += properyScalars.join(", ");
		value += !combine || combine?.separator === "oneOf" || combine?.separator === "anyOf" ? "}" : "";
		return {
			value,
			imports: imports$1,
			name: item.name,
			includedProperties
		};
	}
	if (item.additionalProperties) {
		if ((0, __orval_core.isBoolean)(item.additionalProperties)) return {
			value: `{}`,
			imports: [],
			name: item.name
		};
		if ((0, __orval_core.isReference)(item.additionalProperties) && existingReferencedProperties.includes(item.additionalProperties.$ref.split("/").pop())) return {
			value: `{}`,
			imports: [],
			name: item.name
		};
		const resolvedValue = resolveMockValue({
			schema: {
				...item.additionalProperties,
				name: item.name,
				path: item.path ? `${item.path}.#` : "#"
			},
			mockOptions,
			operationId,
			tags,
			context,
			imports,
			existingReferencedProperties,
			splitMockImplementations
		});
		return {
			...resolvedValue,
			value: `{
        [${DEFAULT_OBJECT_KEY_MOCK}]: ${resolvedValue.value}
      }`
		};
	}
	return {
		value: "{}",
		imports: [],
		name: item.name
	};
};

//#endregion
//#region src/faker/getters/scalar.ts
const getMockScalar = ({ item, imports, mockOptions, operationId, tags, combine, context, existingReferencedProperties, splitMockImplementations, allowOverride = false }) => {
	if (item.isRef) existingReferencedProperties = [...existingReferencedProperties, item.name];
	const operationProperty = resolveMockOverride(mockOptions?.operations?.[operationId]?.properties, item);
	if (operationProperty) return operationProperty;
	const overrideTag = Object.entries(mockOptions?.tags ?? {}).sort((a, b) => {
		return a[0].localeCompare(b[0]);
	}).reduce((acc, [tag, options]) => tags.includes(tag) ? (0, __orval_core.mergeDeep)(acc, options) : acc, {});
	const tagProperty = resolveMockOverride(overrideTag?.properties, item);
	if (tagProperty) return tagProperty;
	const property = resolveMockOverride(mockOptions?.properties, item);
	if (property) return property;
	if ((context.output.override?.mock?.useExamples || mockOptions?.useExamples) && item.example !== void 0) return {
		value: JSON.stringify(item.example),
		imports: [],
		name: item.name,
		overrided: true
	};
	const ALL_FORMAT = {
		...DEFAULT_FORMAT_MOCK,
		...mockOptions?.format
	};
	if (item.format && ALL_FORMAT[item.format]) {
		let value = ALL_FORMAT[item.format];
		if (["date", "date-time"].includes(item.format) && context.output.override.useDates) value = `new Date(${value})`;
		return {
			value: getNullable(value, item.nullable),
			imports: [],
			name: item.name,
			overrided: false
		};
	}
	const type = getItemType(item);
	const isFakerV9 = !!context.output.packageJson && isFakerVersionV9(context.output.packageJson);
	switch (type) {
		case "number":
		case "integer": {
			const intFunction = context.output.override.useBigInt && (item.format === "int64" || item.format === "uint64") ? "bigInt" : "int";
			let value = getNullable(`faker.number.${intFunction}({min: ${item.minimum ?? mockOptions?.numberMin}, max: ${item.maximum ?? mockOptions?.numberMax}${isFakerV9 && item.multipleOf !== void 0 ? `, multipleOf: ${item.multipleOf}` : ""}})`, item.nullable);
			if (type === "number") value = getNullable(`faker.number.float({min: ${item.minimum ?? mockOptions?.numberMin}, max: ${item.maximum ?? mockOptions?.numberMax}${isFakerV9 && item.multipleOf !== void 0 ? `, multipleOf: ${item.multipleOf}` : `, fractionDigits: ${mockOptions?.fractionDigits}`}})`, item.nullable);
			const numberImports = [];
			if (item.enum) value = getEnum(item, numberImports, context, existingReferencedProperties, "number");
			else if ("const" in item) value = "" + JSON.stringify(item.const);
			return {
				value,
				enums: item.enum,
				imports: numberImports,
				name: item.name
			};
		}
		case "boolean": {
			let value = "faker.datatype.boolean()";
			if ("const" in item) value = "" + JSON.stringify(item.const);
			return {
				value,
				imports: [],
				name: item.name
			};
		}
		case "array": {
			if (!item.items) return {
				value: "[]",
				imports: [],
				name: item.name
			};
			if ("$ref" in item.items && existingReferencedProperties.includes((0, __orval_core.pascal)(item.items.$ref.split("/").pop()))) return {
				value: "[]",
				imports: [],
				name: item.name
			};
			const { value, enums, imports: resolvedImports } = resolveMockValue({
				schema: {
					...item.items,
					name: item.name,
					path: item.path ? `${item.path}.[]` : "#.[]"
				},
				combine,
				mockOptions,
				operationId,
				tags,
				context,
				imports,
				existingReferencedProperties,
				splitMockImplementations
			});
			if (enums) return {
				value,
				imports: resolvedImports,
				name: item.name
			};
			let mapValue = value;
			if (combine && !value.startsWith("faker") && !value.startsWith("{") && !value.startsWith("Array.from")) mapValue = `{${value}}`;
			return {
				value: `Array.from({ length: faker.number.int({ min: ${item.minItems ?? mockOptions?.arrayMin}, max: ${item.maxItems ?? mockOptions?.arrayMax} }) }, (_, i) => i + 1).map(() => (${mapValue}))`,
				imports: resolvedImports,
				name: item.name
			};
		}
		case "string": {
			let value = `faker.string.alpha(${`{length: {min: ${item.minLength ?? mockOptions?.stringMin}, max: ${item.maxLength ?? mockOptions?.stringMax}}}`})`;
			const stringImports = [];
			if (item.enum) value = getEnum(item, stringImports, context, existingReferencedProperties, "string");
			else if (item.pattern) value = `faker.helpers.fromRegExp('${item.pattern}')`;
			else if ("const" in item) value = JSON.stringify(item.const);
			return {
				value: getNullable(value, item.nullable),
				enums: item.enum,
				name: item.name,
				imports: stringImports
			};
		}
		case "null": return {
			value: "null",
			imports: [],
			name: item.name
		};
		default:
			if (item.enum) {
				const enumImports = [];
				return {
					value: getEnum(item, enumImports, context, existingReferencedProperties),
					enums: item.enum,
					imports: enumImports,
					name: item.name
				};
			}
			return getMockObject({
				item,
				mockOptions,
				operationId,
				tags,
				combine: combine ? {
					separator: combine.separator,
					includedProperties: []
				} : void 0,
				context,
				imports,
				existingReferencedProperties,
				splitMockImplementations,
				allowOverride
			});
	}
};
function getItemType(item) {
	if (item.type) return item.type;
	if (!item.enum) return;
	const uniqTypes = new Set(item.enum.map((value) => typeof value));
	if (uniqTypes.size > 1) return;
	const type = [...uniqTypes.values()].at(0);
	if (!type) return;
	return ["string", "number"].includes(type) ? type : void 0;
}
const getEnum = (item, imports, context, existingReferencedProperties, type) => {
	if (!item.enum) return "";
	let enumValue = `[${item.enum.filter((e) => e !== null).map((e) => type === "string" || type === void 0 && typeof e === "string" ? `'${(0, __orval_core.escape)(e)}'` : e).join(",")}]`;
	if (context.output.override.enumGenerationType === __orval_core.EnumGeneration.ENUM) if (item.isRef || existingReferencedProperties.length === 0) {
		enumValue += ` as ${item.name}${item.name.endsWith("[]") ? "" : "[]"}`;
		imports.push({
			name: item.name,
			...(0, __orval_core.isRootKey)(context.specKey, context.target) ? {} : { specKey: context.specKey }
		});
	} else {
		enumValue += ` as ${existingReferencedProperties[existingReferencedProperties.length - 1]}['${item.name}']`;
		if (!item.path?.endsWith("[]")) enumValue += "[]";
		imports.push({
			name: existingReferencedProperties[existingReferencedProperties.length - 1],
			...(0, __orval_core.isRootKey)(context.specKey, context.target) ? {} : { specKey: context.specKey }
		});
	}
	else enumValue += " as const";
	if (item.isRef && type === "string") {
		enumValue = `Object.values(${item.name})`;
		imports.push({
			name: item.name,
			values: true,
			...(0, __orval_core.isRootKey)(context.specKey, context.target) ? {} : { specKey: context.specKey }
		});
	}
	return item.path?.endsWith("[]") ? `faker.helpers.arrayElements(${enumValue})` : `faker.helpers.arrayElement(${enumValue})`;
};

//#endregion
//#region src/faker/resolvers/value.ts
const isRegex = (key) => key.startsWith("/") && key.endsWith("/");
const resolveMockOverride = (properties = {}, item) => {
	const path = item.path ? item.path : `#.${item.name}`;
	const property = Object.entries(properties).find(([key]) => {
		if (isRegex(key)) {
			const regex = new RegExp(key.slice(1, -1));
			if (regex.test(item.name) || regex.test(path)) return true;
		}
		if (`#.${key}` === path) return true;
		return false;
	});
	if (!property) return;
	return {
		value: getNullable(property[1], item.nullable),
		imports: [],
		name: item.name,
		overrided: true
	};
};
const getNullable = (value, nullable) => nullable ? `faker.helpers.arrayElement([${value}, null])` : value;
const resolveMockValue = ({ schema, mockOptions, operationId, tags, combine, context, imports, existingReferencedProperties, splitMockImplementations, allowOverride }) => {
	if ((0, __orval_core.isReference)(schema)) {
		const { originalName, specKey = context.specKey, refPaths } = (0, __orval_core.getRefInfo)(schema.$ref, context);
		const schemaRef = Array.isArray(refPaths) ? refPaths.reduce((obj, key) => obj && typeof obj === "object" ? obj[key] : void 0, context.specs[specKey]) : void 0;
		const newSchema = {
			...schemaRef,
			name: (0, __orval_core.pascal)(originalName),
			path: schema.path,
			isRef: true,
			required: [...schemaRef?.required ?? [], ...schema?.required ?? []]
		};
		const newSeparator = newSchema.allOf ? "allOf" : newSchema.oneOf ? "oneOf" : "anyOf";
		const scalar = getMockScalar({
			item: newSchema,
			mockOptions,
			operationId,
			tags,
			combine: combine ? {
				separator: combine.separator === "anyOf" ? newSeparator : combine.separator,
				includedProperties: newSeparator === "allOf" ? [] : combine.includedProperties
			} : void 0,
			context: {
				...context,
				specKey
			},
			imports,
			existingReferencedProperties,
			splitMockImplementations,
			allowOverride
		});
		if (scalar.value && (newSchema.type === "object" || newSchema.allOf) && combine?.separator === "oneOf") {
			const funcName = `get${(0, __orval_core.pascal)(operationId)}Response${(0, __orval_core.pascal)(newSchema.name)}Mock`;
			if (!splitMockImplementations?.some((f) => f.includes(`export const ${funcName}`))) {
				const discriminatedProperty = newSchema.discriminator?.propertyName;
				let type = `Partial<${newSchema.name}>`;
				if (discriminatedProperty) type = `Omit<${type}, '${discriminatedProperty}'>`;
				const args = `${overrideVarName}: ${type} = {}`;
				const func = `export const ${funcName} = (${args}): ${newSchema.name} => ({${scalar.value.startsWith("...") ? "" : "..."}${scalar.value}, ...${overrideVarName}});`;
				splitMockImplementations?.push(func);
			}
			scalar.value = newSchema.nullable ? `${funcName}()` : `{...${funcName}()}`;
			scalar.imports.push({
				name: newSchema.name,
				specKey: (0, __orval_core.isRootKey)(specKey, context.target) ? void 0 : specKey
			});
		}
		return {
			...scalar,
			type: getType(newSchema)
		};
	}
	return {
		...getMockScalar({
			item: schema,
			mockOptions,
			operationId,
			tags,
			combine,
			context,
			imports,
			existingReferencedProperties,
			splitMockImplementations,
			allowOverride
		}),
		type: getType(schema)
	};
};
const getType = (schema) => {
	return schema.type ?? (schema.properties ? "object" : schema.items ? "array" : void 0);
};

//#endregion
//#region src/faker/getters/combine.ts
const combineSchemasMock = ({ item, separator, mockOptions, operationId, tags, combine, context, imports, existingReferencedProperties, splitMockImplementations }) => {
	const combineImports = [];
	const includedProperties = [...combine?.includedProperties ?? []];
	const itemResolvedValue = (0, __orval_core.isReference)(item) && !existingReferencedProperties.includes(item.name) || item.properties ? resolveMockValue({
		schema: Object.fromEntries(Object.entries(item).filter(([key]) => key !== separator)),
		combine: {
			separator: "allOf",
			includedProperties: []
		},
		mockOptions,
		operationId,
		tags,
		context,
		imports,
		existingReferencedProperties,
		splitMockImplementations
	}) : void 0;
	includedProperties.push(...itemResolvedValue?.includedProperties ?? []);
	combineImports.push(...itemResolvedValue?.imports ?? []);
	let containsOnlyPrimitiveValues = true;
	const value = (item[separator] ?? []).reduce((acc, val, _, arr) => {
		if ("$ref" in val && existingReferencedProperties.includes((0, __orval_core.pascal)(val.$ref.split("/").pop()))) {
			if (arr.length === 1) return "undefined";
			return acc;
		}
		if (separator === "allOf" && item.required) val = (0, __orval_core.isSchema)(val) && val.required ? {
			...val,
			required: [...item.required, ...val.required]
		} : {
			...val,
			required: item.required
		};
		const resolvedValue = resolveMockValue({
			schema: {
				...val,
				name: item.name,
				path: item.path ? item.path : "#"
			},
			combine: {
				separator,
				includedProperties: separator === "oneOf" ? itemResolvedValue?.includedProperties ?? [] : includedProperties
			},
			mockOptions,
			operationId,
			tags,
			context,
			imports,
			existingReferencedProperties,
			splitMockImplementations
		});
		combineImports.push(...resolvedValue.imports);
		includedProperties.push(...resolvedValue.includedProperties ?? []);
		if (resolvedValue.value === "{}") {
			containsOnlyPrimitiveValues = false;
			return acc;
		}
		if (separator === "allOf") {
			if (resolvedValue.value.startsWith("{") || !resolvedValue.type) {
				containsOnlyPrimitiveValues = false;
				return `${acc}...${resolvedValue.value},`;
			} else if (resolvedValue.type === "object") {
				containsOnlyPrimitiveValues = false;
				return resolvedValue.value.startsWith("faker") ? `${acc}...${resolvedValue.value},` : `${acc}...{${resolvedValue.value}},`;
			}
		}
		return `${acc}${resolvedValue.value},`;
	}, separator === "allOf" ? "" : "faker.helpers.arrayElement([");
	let finalValue = value === "undefined" ? value : `${separator === "allOf" && !containsOnlyPrimitiveValues ? "{" : ""}${value}${separator === "allOf" ? containsOnlyPrimitiveValues ? "" : "}" : "])"}`;
	if (itemResolvedValue) finalValue = finalValue.startsWith("...") ? `...{${finalValue}, ${itemResolvedValue.value}}` : `{...${finalValue}, ${itemResolvedValue.value}}`;
	if (finalValue.endsWith(",")) finalValue = finalValue.slice(0, Math.max(0, finalValue.length - 1));
	return {
		value: finalValue,
		imports: combineImports,
		name: item.name,
		includedProperties
	};
};

//#endregion
//#region src/faker/getters/route.ts
const hasParam = (path) => /[^{]*{[\w*_-]*}.*/.test(path);
const getRoutePath = (path) => {
	const matches = /([^{]*){?([\w*_-]*)}?(.*)/.exec(path);
	if (!matches?.length) return path;
	const prev = matches[1];
	const param = (0, __orval_core.sanitize)((0, __orval_core.camel)(matches[2]), {
		es5keyword: true,
		underscore: true,
		dash: true,
		dot: true
	});
	const next = hasParam(matches[3]) ? getRoutePath(matches[3]) : matches[3];
	return hasParam(path) ? `${prev}:${param}${next}` : `${prev}${param}${next}`;
};
const getRouteMSW = (route, baseUrl = "*") => {
	route = route.replaceAll(":", "\\:");
	return route.split("/").reduce((acc, path, i) => {
		if (!path && !i) return acc;
		if (!path.includes("{")) return `${acc}/${path}`;
		return `${acc}/${getRoutePath(path)}`;
	}, baseUrl);
};

//#endregion
//#region src/msw/mocks.ts
const getMockPropertiesWithoutFunc = (properties, spec) => Object.entries((0, __orval_core.isFunction)(properties) ? properties(spec) : properties).reduce((acc, [key, value]) => {
	acc[key] = ((0, __orval_core.isFunction)(value) ? `(${value})()` : (0, __orval_core.stringify)(value))?.replaceAll(/import_faker\.defaults|import_faker\.faker|_faker\.faker/g, "faker");
	return acc;
}, {});
const getMockWithoutFunc = (spec, override) => ({
	arrayMin: override?.mock?.arrayMin,
	arrayMax: override?.mock?.arrayMax,
	stringMin: override?.mock?.stringMin,
	stringMax: override?.mock?.stringMax,
	numberMin: override?.mock?.numberMin,
	numberMax: override?.mock?.numberMax,
	required: override?.mock?.required,
	fractionDigits: override?.mock?.fractionDigits,
	...override?.mock?.properties ? { properties: getMockPropertiesWithoutFunc(override.mock.properties, spec) } : {},
	...override?.mock?.format ? { format: getMockPropertiesWithoutFunc(override.mock.format, spec) } : {},
	...override?.operations ? { operations: Object.entries(override.operations).reduce((acc, [key, value]) => {
		if (value.mock?.properties) acc[key] = { properties: getMockPropertiesWithoutFunc(value.mock.properties, spec) };
		return acc;
	}, {}) } : {},
	...override?.tags ? { tags: Object.entries(override.tags).reduce((acc, [key, value]) => {
		if (value.mock?.properties) acc[key] = { properties: getMockPropertiesWithoutFunc(value.mock.properties, spec) };
		return acc;
	}, {}) } : {}
});
const getMockScalarJsTypes = (definition, mockOptionsWithoutFunc) => {
	const isArray = definition.endsWith("[]");
	switch (isArray ? definition.slice(0, -2) : definition) {
		case "number": return isArray ? `Array.from({length: faker.number.int({min: ${mockOptionsWithoutFunc.arrayMin}, max: ${mockOptionsWithoutFunc.arrayMax}})}, () => faker.number.int())` : "faker.number.int()";
		case "string": return isArray ? `Array.from({length: faker.number.int({min: ${mockOptionsWithoutFunc?.arrayMin},max: ${mockOptionsWithoutFunc?.arrayMax}})}, () => faker.word.sample())` : "faker.word.sample()";
		default: return "undefined";
	}
};
const getResponsesMockDefinition = ({ operationId, tags, returnType, responses, imports: responseImports, mockOptionsWithoutFunc, transformer, context, mockOptions, splitMockImplementations }) => {
	return responses.reduce((acc, { value: definition, originalSchema, example, examples, imports, isRef }) => {
		if (context.output.override?.mock?.useExamples || mockOptions?.useExamples) {
			let exampleValue = example || originalSchema?.example || Object.values(examples || {})[0] || originalSchema?.examples?.[0];
			exampleValue = exampleValue?.value ?? exampleValue;
			if (exampleValue) {
				acc.definitions.push(transformer ? transformer(exampleValue, returnType) : JSON.stringify(exampleValue));
				return acc;
			}
		}
		if (!definition || __orval_core.generalJSTypesWithArray.includes(definition)) {
			const value = getMockScalarJsTypes(definition, mockOptionsWithoutFunc);
			acc.definitions.push(transformer ? transformer(value, returnType) : value);
			return acc;
		}
		if (!originalSchema) return acc;
		const resolvedRef = (0, __orval_core.resolveRef)(originalSchema, context);
		const scalar = getMockScalar({
			item: {
				name: definition,
				...resolvedRef.schema
			},
			imports,
			mockOptions: mockOptionsWithoutFunc,
			operationId,
			tags,
			context: isRef ? {
				...context,
				specKey: responseImports[0]?.specKey ?? context.specKey
			} : context,
			existingReferencedProperties: [],
			splitMockImplementations,
			allowOverride: true
		});
		acc.imports.push(...scalar.imports);
		acc.definitions.push(transformer ? transformer(scalar.value, returnType) : scalar.value.toString());
		return acc;
	}, {
		definitions: [],
		imports: []
	});
};
const getMockDefinition = ({ operationId, tags, returnType, responses, imports: responseImports, override, transformer, context, mockOptions, splitMockImplementations }) => {
	const mockOptionsWithoutFunc = getMockWithoutFunc(context.specs[context.specKey], override);
	const { definitions, imports } = getResponsesMockDefinition({
		operationId,
		tags,
		returnType,
		responses,
		imports: responseImports,
		mockOptionsWithoutFunc,
		transformer,
		context,
		mockOptions,
		splitMockImplementations
	});
	return {
		definition: "[" + definitions.join(", ") + "]",
		definitions,
		imports
	};
};
const getMockOptionsDataOverride = (operationTags, operationId, override) => {
	const responseOverride = override?.operations?.[operationId]?.mock?.data || operationTags.map((operationTag) => override?.tags?.[operationTag]?.mock?.data).find((e) => e !== void 0);
	return ((0, __orval_core.isFunction)(responseOverride) ? `(${responseOverride})()` : (0, __orval_core.stringify)(responseOverride))?.replaceAll(/import_faker\.defaults|import_faker\.faker|_faker\.faker/g, "faker");
};

//#endregion
//#region src/msw/index.ts
const getMSWDependencies = (options) => {
	const hasDelay = options?.delay !== false;
	const locale = options?.locale;
	const exports$1 = [
		{
			name: "http",
			values: true
		},
		{
			name: "HttpResponse",
			values: true
		},
		{
			name: "RequestHandlerOptions",
			values: false
		}
	];
	if (hasDelay) exports$1.push({
		name: "delay",
		values: true
	});
	return [{
		exports: exports$1,
		dependency: "msw"
	}, {
		exports: [{
			name: "faker",
			values: true
		}],
		dependency: locale ? `@faker-js/faker/locale/${locale}` : "@faker-js/faker"
	}];
};
const generateMSWImports = ({ implementation, imports, specsName, hasSchemaDir, isAllowSyntheticDefaultImports, options }) => {
	return (0, __orval_core.generateDependencyImports)(implementation, [...getMSWDependencies(options), ...imports], specsName, hasSchemaDir, isAllowSyntheticDefaultImports);
};
const generateDefinition = (name, route, getResponseMockFunctionNameBase, handlerNameBase, { operationId, response, verb, tags }, { override, context, mock }, returnType, status, responseImports, responses, contentTypes, splitMockImplementations) => {
	const oldSplitMockImplementations = [...splitMockImplementations];
	const { definitions, definition, imports } = getMockDefinition({
		operationId,
		tags,
		returnType,
		responses,
		imports: responseImports,
		override,
		context,
		mockOptions: (0, __orval_core.isFunction)(mock) ? void 0 : mock,
		splitMockImplementations
	});
	const mockData = getMockOptionsDataOverride(tags, operationId, override);
	let value = "";
	if (mockData) value = mockData;
	else if (definitions.length > 1) value = `faker.helpers.arrayElement(${definition})`;
	else if (definitions[0]) value = definitions[0];
	const isResponseOverridable = value.includes(overrideVarName);
	const isTextPlain = contentTypes.includes("text/plain");
	const isReturnHttpResponse = value && value !== "undefined";
	const getResponseMockFunctionName = `${getResponseMockFunctionNameBase}${(0, __orval_core.pascal)(name)}`;
	const handlerName = `${handlerNameBase}${(0, __orval_core.pascal)(name)}`;
	const addedSplitMockImplementations = splitMockImplementations.slice(oldSplitMockImplementations.length);
	splitMockImplementations.push(...addedSplitMockImplementations);
	const mockImplementations = addedSplitMockImplementations.length > 0 ? `${addedSplitMockImplementations.join("\n\n")}\n\n` : "";
	const mockImplementation = isReturnHttpResponse ? `${mockImplementations}export const ${getResponseMockFunctionName} = (${isResponseOverridable ? `overrideResponse: Partial< ${returnType} > = {}` : ""})${mockData ? "" : `: ${returnType}`} => (${value})\n\n` : mockImplementations;
	const delay = getDelay(override, (0, __orval_core.isFunction)(mock) ? void 0 : mock);
	const infoParam = "info";
	const overrideResponse = `overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(${infoParam}) : overrideResponse)
    : ${getResponseMockFunctionName}()`;
	const handlerImplementation = `
export const ${handlerName} = (overrideResponse?: ${returnType} | ((${infoParam}: Parameters<Parameters<typeof http.${verb}>[1]>[0]) => Promise<${returnType}> | ${returnType}), options?: RequestHandlerOptions) => {
  return http.${verb}('${route}', async (${infoParam}) => {${delay === false ? "" : `await delay(${(0, __orval_core.isFunction)(delay) ? `(${delay})()` : delay});`}
  ${isReturnHttpResponse ? "" : `if (typeof overrideResponse === 'function') {await overrideResponse(info); }`}
    return new HttpResponse(${isReturnHttpResponse ? isTextPlain ? overrideResponse : `JSON.stringify(${overrideResponse})` : null},
      { status: ${status === "default" ? 200 : status.replace(/XX$/, "00")},
        ${isReturnHttpResponse ? `headers: { 'Content-Type': ${isTextPlain ? "'text/plain'" : "'application/json'"} }` : ""}
      })
  }, options)
}\n`;
	const includeResponseImports = isTextPlain ? imports : [...imports, ...response.imports.filter((r) => {
		const reg = /* @__PURE__ */ new RegExp(`\\b${r.name}\\b`);
		return reg.test(handlerImplementation) || reg.test(mockImplementation);
	})];
	return {
		implementation: {
			function: mockImplementation,
			handlerName,
			handler: handlerImplementation
		},
		imports: includeResponseImports
	};
};
const generateMSW = (generatorVerbOptions, generatorOptions) => {
	const { pathRoute, override, mock } = generatorOptions;
	const { operationId, response } = generatorVerbOptions;
	const route = getRouteMSW(pathRoute, override?.mock?.baseUrl ?? ((0, __orval_core.isFunction)(mock) ? void 0 : mock?.baseUrl));
	const handlerName = `get${(0, __orval_core.pascal)(operationId)}MockHandler`;
	const getResponseMockFunctionName = `get${(0, __orval_core.pascal)(operationId)}ResponseMock`;
	const splitMockImplementations = [];
	const baseDefinition = generateDefinition("", route, getResponseMockFunctionName, handlerName, generatorVerbOptions, generatorOptions, response.definition.success, response.types.success[0]?.key ?? "200", response.imports, response.types.success, response.contentTypes, splitMockImplementations);
	const mockImplementations = [baseDefinition.implementation.function];
	const handlerImplementations = [baseDefinition.implementation.handler];
	const imports = [...baseDefinition.imports];
	if (generatorOptions.mock && (0, __orval_core.isObject)(generatorOptions.mock) && generatorOptions.mock.generateEachHttpStatus) for (const statusResponse of [...response.types.success, ...response.types.errors]) {
		const definition = generateDefinition(statusResponse.key, route, getResponseMockFunctionName, handlerName, generatorVerbOptions, generatorOptions, statusResponse.value, statusResponse.key, response.imports, [statusResponse], [statusResponse.contentType], splitMockImplementations);
		mockImplementations.push(definition.implementation.function);
		handlerImplementations.push(definition.implementation.handler);
		imports.push(...definition.imports);
	}
	return {
		implementation: {
			function: mockImplementations.join("\n"),
			handlerName,
			handler: handlerImplementations.join("\n")
		},
		imports
	};
};

//#endregion
//#region src/index.ts
const DEFAULT_MOCK_OPTIONS = {
	type: "msw",
	useExamples: false
};
const generateMockImports = (importOptions) => {
	switch (importOptions.options?.type) {
		default: return generateMSWImports(importOptions);
	}
};
const generateMock = (generatorVerbOptions, generatorOptions) => {
	switch (generatorOptions.mock.type) {
		default: return generateMSW(generatorVerbOptions, generatorOptions);
	}
};

//#endregion
exports.DEFAULT_MOCK_OPTIONS = DEFAULT_MOCK_OPTIONS;
exports.generateMock = generateMock;
exports.generateMockImports = generateMockImports;
//# sourceMappingURL=index.js.map