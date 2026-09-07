import { ClientBuilder, ClientGeneratorsBuilder, ContextSpecs, GeneratorDependency, GeneratorMutator, ZodCoerceType } from "@orval/core";
import { SchemaObject } from "openapi3-ts/oas30";
import { SchemaObject as SchemaObject$1 } from "openapi3-ts/oas31";

//#region src/index.d.ts
declare const getZodDependencies: () => GeneratorDependency[];
type ZodValidationSchemaDefinition = {
  functions: [string, any][];
  consts: string[];
};
type DateTimeOptions = {
  offset?: boolean;
  local?: boolean;
  precision?: number;
};
type TimeOptions = {
  precision?: -1 | 0 | 1 | 2 | 3;
};
declare const generateZodValidationSchemaDefinition: (schema: SchemaObject | SchemaObject$1 | undefined, context: ContextSpecs, name: string, strict: boolean, isZodV4: boolean, rules?: {
  required?: boolean;
  dateTimeOptions?: DateTimeOptions;
  timeOptions?: TimeOptions;
}) => ZodValidationSchemaDefinition;
declare const parseZodValidationSchemaDefinition: (input: ZodValidationSchemaDefinition, context: ContextSpecs, coerceTypes: boolean | ZodCoerceType[] | undefined, strict: boolean, isZodV4: boolean, preprocess?: GeneratorMutator) => {
  zod: string;
  consts: string;
};
declare const generateZod: ClientBuilder;
declare const builder: () => () => ClientGeneratorsBuilder;
//#endregion
export { ZodValidationSchemaDefinition, builder, builder as default, generateZod, generateZodValidationSchemaDefinition, getZodDependencies, parseZodValidationSchemaDefinition };
//# sourceMappingURL=index.d.ts.map