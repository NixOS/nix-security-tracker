import type { ProjectReflection } from "#models";
import { type ValidationOptions } from "#node-utils";
import type { Context, Converter } from "../../converter/index.js";
import { ConverterComponent } from "../components.js";
/**
 * A plugin that resolves `{@link Foo}` tags.
 */
export declare class LinkResolverPlugin extends ConverterComponent {
    accessor validation: ValidationOptions;
    constructor(owner: Converter);
    onResolve(context: Context): void;
    resolveLinks(project: ProjectReflection): void;
}
