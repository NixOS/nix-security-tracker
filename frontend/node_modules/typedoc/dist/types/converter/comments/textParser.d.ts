/**
 * Parser to handle plain text markdown.
 *
 * Responsible for recognizing relative paths within the text and turning
 * them into references.
 * @module
 */
import type { CommentDisplayPart, FileRegistry } from "#models";
import { type ValidationOptions } from "#node-utils";
import { type Token } from "./lexer.js";
import type { NormalizedPath, TranslatedString } from "#utils";
interface TextParserData {
    sourcePath: NormalizedPath;
    token: Token;
    pos: number;
    warning: (msg: TranslatedString, token: Token) => void;
    validationWarning: (msg: TranslatedString, token: Token) => void;
    files: FileRegistry;
    atNewLine: boolean;
    validationOptions: ValidationOptions;
}
/**
 * This is incredibly unfortunate. The comment lexer owns the responsibility
 * for splitting up text into text/code, this is totally fine for HTML links
 * but for markdown links, ``[`code`](./link)`` is valid, so we need to keep
 * track of state across calls to {@link textContent}.
 */
export declare class TextParserReentryState {
    withinLinkLabel: boolean;
    withinLinkDest: boolean;
    private lastPartWasNewline;
    checkState(token: Token): void;
}
/**
 * Look for relative links within a piece of text and add them to the {@link FileRegistry}
 * so that they can be correctly resolved during rendering.
 */
export declare function textContent(parserData: Omit<TextParserData, "pos">, outContent: CommentDisplayPart[], reentry: TextParserReentryState): void;
export {};
