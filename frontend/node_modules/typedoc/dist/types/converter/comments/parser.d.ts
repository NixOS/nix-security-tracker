import { Comment, type CommentDisplayPart, FileRegistry } from "#models";
import type { MinimalSourceFile } from "#utils";
import { type Logger } from "#utils";
import type { CommentContextOptionalChecker, CommentParserConfig } from "./index.js";
import { type Token } from "./lexer.js";
export declare function parseComment(tokens: Generator<Token, undefined, undefined>, file: MinimalSourceFile, context: CommentContextOptionalChecker): Comment;
/**
 * Intended for parsing markdown documents. This only parses code blocks and
 * inline tags outside of code blocks, everything else is text.
 *
 * If you change this, also look at blockContent, as it likely needs similar
 * modifications to ensure parsing is consistent.
 */
export declare function parseCommentString(tokens: Generator<Token, undefined, undefined>, config: CommentParserConfig, file: MinimalSourceFile, logger: Logger, files: FileRegistry): {
    content: CommentDisplayPart[];
    frontmatter: Record<string, unknown>;
};
