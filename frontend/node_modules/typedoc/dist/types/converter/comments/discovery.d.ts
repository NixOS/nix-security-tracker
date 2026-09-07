import { ReflectionKind } from "#models";
import { CommentStyle } from "#node-utils";
import { type Logger } from "#utils";
import ts from "typescript";
export interface DiscoveredComment {
    file: ts.SourceFile;
    ranges: ts.CommentRange[];
    jsDoc: ts.JSDoc | undefined;
    inheritedFromParentDeclaration: boolean;
}
export declare function discoverFileComments(node: ts.SourceFile, commentStyle: CommentStyle): DiscoveredComment[];
export declare function discoverNodeComment(node: ts.Node, commentStyle: CommentStyle): DiscoveredComment | undefined;
export declare function discoverComment(symbol: ts.Symbol, kind: ReflectionKind, logger: Logger, commentStyle: CommentStyle, checker: ts.TypeChecker, declarationWarnings: boolean): DiscoveredComment | undefined;
export declare function discoverSignatureComment(declaration: ts.SignatureDeclaration | ts.JSDocSignature, checker: ts.TypeChecker, commentStyle: CommentStyle): DiscoveredComment | undefined;
