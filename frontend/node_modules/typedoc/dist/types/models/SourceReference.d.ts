import type { Deserializer, JSONOutput } from "#serialization";
import type { NormalizedPath } from "#utils";
/**
 * Represents references of reflections to their defining source files.
 *
 * @see {@link DeclarationReflection.sources}
 */
export declare class SourceReference {
    /**
     * The filename of the source file.
     * This will initially be absolute before being overwritten with a base path relative path during resolution.
     */
    fileName: NormalizedPath;
    /**
     * The absolute filename of the source file.
     * @internal
     */
    fullFileName: NormalizedPath;
    /**
     * The one based number of the line that emitted the declaration.
     */
    line: number;
    /**
     * The index of the character that emitted the declaration.
     */
    character: number;
    /**
     * URL for displaying the source file.
     */
    url?: string;
    constructor(fileName: NormalizedPath, line: number, character: number);
    equals(other: SourceReference): boolean;
    toObject(): JSONOutput.SourceReference;
    fromObject(_de: Deserializer, obj: JSONOutput.SourceReference): void;
}
