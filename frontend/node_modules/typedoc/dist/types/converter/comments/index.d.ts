import type { FileRegistry } from "#models";
import { Comment, ReflectionKind } from "#models";
import type { CommentStyle, JsDocCompatibility, ValidationOptions } from "#node-utils";
import { Logger } from "#utils";
import ts from "typescript";
import type { Context } from "../context.js";
export interface CommentParserConfig {
    blockTags: Set<string>;
    inlineTags: Set<string>;
    modifierTags: Set<string>;
    preservedTypeAnnotationTags: Set<string>;
    jsDocCompatibility: JsDocCompatibility;
    suppressCommentWarningsInDeclarationFiles: boolean;
    useTsLinkResolution: boolean;
    commentStyle: CommentStyle;
    validationOptions: ValidationOptions;
}
export interface CommentContext {
    config: CommentParserConfig;
    logger: Logger;
    checker: ts.TypeChecker;
    files: FileRegistry;
    createSymbolId: Context["createSymbolId"];
}
export interface CommentContextOptionalChecker {
    config: CommentParserConfig;
    logger: Logger;
    checker?: ts.TypeChecker | undefined;
    files: FileRegistry;
    createSymbolId: Context["createSymbolId"];
}
export declare function clearCommentCache(): void;
export declare function getComment(symbol: ts.Symbol, kind: ReflectionKind, context: CommentContext): Comment | undefined;
export declare function getNodeComment(node: ts.Node, moduleComment: boolean, context: CommentContext): Comment | undefined;
export declare function getFileComment(file: ts.SourceFile, context: CommentContext): Comment | undefined;
export declare function getSignatureComment(declaration: ts.SignatureDeclaration | ts.JSDocSignature, context: CommentContext): Comment | undefined;
export declare function getJsDocComment(declaration: ts.JSDocPropertyLikeTag | ts.JSDocCallbackTag | ts.JSDocTypedefTag | ts.JSDocTemplateTag | ts.JSDocEnumTag, context: CommentContext): Comment | undefined;
