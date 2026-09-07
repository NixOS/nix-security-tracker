var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member2, msg) => member2.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member2, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member2.has(obj);
var __privateGet = (obj, member2, getter) => (__accessCheck(obj, member2, "read from private field"), getter ? getter.call(obj) : member2.get(obj));
var __privateAdd = (obj, member2, value) => member2.has(obj) ? __typeError("Cannot add the same private member more than once") : member2 instanceof WeakSet ? member2.add(obj) : member2.set(obj, value);
var __privateSet = (obj, member2, value, setter) => (__accessCheck(obj, member2, "write to private field"), setter ? setter.call(obj, value) : member2.set(obj, value), value);
var __privateMethod = (obj, member2, method) => (__accessCheck(obj, member2, "access private method"), method);

// src/lib/application.ts
import * as Path7 from "path";
import ts17 from "typescript";
import { ReflectionSymbolId as ReflectionSymbolId4 } from "#models";
import {
  AbstractComponent as AbstractComponent5,
  diagnostic,
  diagnostics,
  EntryPointStrategy,
  FancyConsoleLogger,
  getCommonDirectory as getCommonDirectory2,
  getEntryPoints,
  getLoadedPaths,
  getPackageDirectories,
  getWatchEntryPoints,
  hasBeenLoadedMultipleTimes,
  inferEntryPoints,
  isDebugging,
  loadPlugins,
  nicePath as nicePath6,
  normalizePath as normalizePath8,
  Option as Option16,
  Options,
  PackageJsonReader,
  rootPackageOptions,
  SUPPORTED_TYPESCRIPT_VERSIONS,
  TSConfigReader,
  TYPEDOC_VERSION,
  TypeDocReader,
  TYPESCRIPT_ROOT,
  ValidatingFileRegistry,
  writeFile as writeFile7
} from "#node-utils";
import { Deserializer, Serializer } from "#serialization";

// src/lib/converter/context.ts
import { ok as assert2 } from "assert";
import ts7 from "typescript";
import {
  Comment as Comment3,
  ContainerReflection,
  DeclarationReflection,
  ReferenceType,
  ReflectionFlag,
  ReflectionKind as ReflectionKind3
} from "#models";

// src/lib/converter/utilities/nodes.ts
import ts from "typescript";
function isNamedNode(node) {
  const name = node.name;
  return !!name && (ts.isMemberName(name) || ts.isComputedPropertyName(name));
}
function getHeritageTypes(declarations, kind) {
  const exprs = declarations.flatMap(
    (d) => (d.heritageClauses ?? []).filter((hc) => hc.token === kind).flatMap(
      (hc) => hc.types
    )
  );
  const seenTexts = /* @__PURE__ */ new Set();
  return exprs.filter((expr) => {
    const text = expr.getText();
    if (seenTexts.has(text)) {
      return false;
    }
    seenTexts.add(text);
    return true;
  });
}
function isObjectType(type2) {
  return typeof type2.objectFlags === "number";
}
function isTypeReference(type2) {
  return isObjectType(type2) && (type2.objectFlags & ts.ObjectFlags.Reference) !== 0;
}

// src/lib/converter/converter-events.ts
var ConverterEvents = {
  BEGIN: "begin",
  END: "end",
  CREATE_PROJECT: "createProject",
  CREATE_DECLARATION: "createDeclaration",
  CREATE_DOCUMENT: "createDocument",
  CREATE_SIGNATURE: "createSignature",
  CREATE_PARAMETER: "createParameter",
  CREATE_TYPE_PARAMETER: "createTypeParameter",
  RESOLVE_BEGIN: "resolveBegin",
  RESOLVE: "resolveReflection",
  RESOLVE_END: "resolveEnd"
};

// src/lib/converter/utilities/symbols.ts
import ts2 from "typescript";
function resolveAliasedSymbol(symbol, checker) {
  const seen = /* @__PURE__ */ new Set();
  while (ts2.SymbolFlags.Alias & symbol.flags) {
    symbol = checker.getAliasedSymbol(symbol);
    if (seen.has(symbol)) return symbol;
    seen.add(symbol);
  }
  return symbol;
}

// src/lib/converter/comments/index.ts
import { Comment as Comment2, ReflectionKind as ReflectionKind2 } from "#models";
import { assertNever as assertNever3, i18n as i18n4, Logger, setUnion } from "#utils";
import ts5 from "typescript";

// src/lib/converter/comments/blockLexer.ts
import ts3 from "typescript";
function* lexBlockComment(file, pos = 0, end = file.length, createSymbolId = () => {
  throw new Error("unreachable");
}, jsDoc, checker) {
  let textToken;
  for (const token of lexBlockComment2(
    file,
    pos,
    end,
    getLinkTags(jsDoc),
    checker,
    createSymbolId
  )) {
    if (token.kind === "text" /* Text */) {
      if (textToken) {
        textToken.text += token.text;
      } else {
        textToken = token;
      }
    } else {
      if (textToken) {
        yield textToken;
        textToken = void 0;
      }
      yield token;
    }
  }
  if (textToken) {
    yield textToken;
  }
  return;
}
function getLinkTags(jsDoc) {
  const result = [];
  if (jsDoc?.comment && typeof jsDoc.comment !== "string") {
    for (const part of jsDoc.comment) {
      switch (part.kind) {
        case ts3.SyntaxKind.JSDocLink:
        case ts3.SyntaxKind.JSDocLinkCode:
        case ts3.SyntaxKind.JSDocLinkPlain:
          result.push(part);
      }
    }
  }
  for (const block of jsDoc?.tags || []) {
    if (!block.comment || typeof block.comment === "string") continue;
    for (const part of block.comment) {
      switch (part.kind) {
        case ts3.SyntaxKind.JSDocLink:
        case ts3.SyntaxKind.JSDocLinkCode:
        case ts3.SyntaxKind.JSDocLinkPlain:
          result.push(part);
      }
    }
  }
  return result;
}
function* lexBlockComment2(file, pos, end, linkTags2, checker, createSymbolId) {
  pos += 2;
  end -= 2;
  if (pos < end && file[pos] === "*") {
    pos++;
  }
  const [commentHasStars, indent2] = discoverIndent(file, pos, end);
  while (pos < end && /\s/.test(file[pos])) {
    pos++;
  }
  while (pos < end && /\s/.test(file[end - 1])) {
    end--;
  }
  let lineStart = true;
  let braceStartsType = false;
  let linkTagIndex = 0;
  for (; ; ) {
    if (pos >= end) {
      return;
    }
    if (lineStart) {
      pos = skipIndent(pos);
      if (commentHasStars && file[pos] === "*") {
        pos++;
        if (file[pos] === " ") {
          pos++;
        }
      }
      lineStart = false;
    }
    switch (file[pos]) {
      case "\n":
        yield makeToken("new_line" /* NewLine */, 1);
        lineStart = true;
        break;
      case "{":
        if (braceStartsType && nextNonWs(pos + 1) !== "@") {
          yield makeToken(
            "type" /* TypeAnnotation */,
            findEndOfType(pos) - pos
          );
          braceStartsType = false;
        } else {
          yield makeToken("open_brace" /* OpenBrace */, 1);
        }
        break;
      case "}":
        yield makeToken("close_brace" /* CloseBrace */, 1);
        braceStartsType = false;
        break;
      case "`": {
        braceStartsType = false;
        let tickCount = 1;
        let lookahead = pos - 1;
        let atNewline = true;
        while (lookahead > 0 && file[lookahead] !== "\n") {
          if (/\S/.test(file[lookahead])) {
            if (!commentHasStars || file[lookahead] !== "*") {
              atNewline = false;
              break;
            }
          }
          --lookahead;
        }
        lookahead = pos;
        while (lookahead + 1 < end && file[lookahead + 1] === "`") {
          tickCount++;
          lookahead++;
        }
        const isCodeBlock = atNewline && tickCount >= 3;
        let lookaheadStart = pos;
        const codeText = [];
        lookahead++;
        while (lookahead < end) {
          if (lookaheadExactlyNTicks(lookahead, tickCount)) {
            lookahead += tickCount;
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            const codeTextStr = codeText.join("");
            if (isCodeBlock || !/\n\s*\n/.test(codeTextStr)) {
              yield {
                kind: "code" /* Code */,
                text: codeTextStr,
                pos
              };
              pos = lookahead;
            } else {
              yield makeToken("text" /* Text */, tickCount);
            }
            break;
          } else if (file[lookahead] === "`") {
            while (lookahead < end && file[lookahead] === "`") {
              lookahead++;
            }
          } else if (file[lookahead] === "\\" && lookahead + 1 < end && file[lookahead + 1] === "/") {
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            lookaheadStart = lookahead + 1;
            lookahead += 2;
          } else if (file[lookahead] === "\\" && lookahead + 1 < end && file[lookahead + 1] !== "\n") {
            lookahead += 2;
          } else if (file[lookahead] === "\n") {
            lookahead++;
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            lookahead = skipIndent(lookahead);
            if (commentHasStars && file[lookahead] === "*") {
              lookahead++;
              if (file[lookahead] === " ") {
                lookahead++;
              }
            }
            lookaheadStart = lookahead;
          } else {
            lookahead++;
          }
        }
        if (lookahead >= end && pos !== lookahead) {
          if (isCodeBlock && file.substring(pos, end).includes("\n")) {
            codeText.push(file.substring(lookaheadStart, end));
            yield {
              kind: "code" /* Code */,
              text: codeText.join(""),
              pos
            };
            pos = lookahead;
          } else {
            yield makeToken("text" /* Text */, tickCount);
          }
        }
        break;
      }
      case "@": {
        let lookahead = pos + 1;
        while (lookahead < end && /[a-z]/i.test(file[lookahead])) {
          lookahead++;
        }
        if (lookahead !== pos + 1) {
          while (lookahead < end && /[a-z0-9-]/i.test(file[lookahead])) {
            lookahead++;
          }
        }
        if (lookahead !== pos + 1 && (lookahead === end || /[\s}]/.test(file[lookahead]))) {
          braceStartsType = true;
          const token = makeToken(
            "tag" /* Tag */,
            lookahead - pos
          );
          attachLinkTagResult(token);
          yield token;
          break;
        }
      }
      // fall through if we didn't find something that looks like a tag
      default: {
        const textParts = [];
        let lookaheadStart = pos;
        let lookahead = pos;
        while (lookahead < end) {
          if ("{}\n`".includes(file[lookahead])) break;
          if (lookahead !== pos && file[lookahead] === "@" && /\s/.test(file[lookahead - 1])) {
            break;
          }
          if (file[lookahead] === "\\" && lookahead + 1 < end && "{}@/`".includes(file[lookahead + 1])) {
            textParts.push(
              file.substring(lookaheadStart, lookahead),
              file[lookahead + 1]
            );
            lookahead++;
            lookaheadStart = lookahead + 1;
          }
          lookahead++;
        }
        textParts.push(file.substring(lookaheadStart, lookahead));
        if (textParts.some((part) => /\S/.test(part))) {
          braceStartsType = false;
        }
        yield {
          kind: "text" /* Text */,
          text: textParts.join(""),
          pos
        };
        pos = lookahead;
        break;
      }
    }
  }
  function attachLinkTagResult(token) {
    while (linkTagIndex < linkTags2.length && linkTags2[linkTagIndex].pos < token.pos - 1) {
      linkTagIndex++;
    }
    if (linkTagIndex < linkTags2.length && linkTags2[linkTagIndex].pos === token.pos - 1) {
      const link = linkTags2[linkTagIndex];
      if (link.name) {
        const tsTarget = checker?.getSymbolAtLocation(
          getRightmostName(link.name)
        );
        if (tsTarget) {
          token.tsLinkTarget = createSymbolId(
            resolveAliasedSymbol(tsTarget, checker)
          );
          token.tsLinkText = link.text.replace(/^\s*\|\s*/, "");
        }
      }
    }
  }
  function makeToken(kind, size) {
    const start = pos;
    pos += size;
    return {
      kind,
      text: file.substring(start, pos),
      pos: start
    };
  }
  function skipIndent(pos2) {
    let taken = indent2;
    let lookahead = pos2;
    while (taken > 0 && lookahead < end && file[lookahead] !== "\n" && /\s/.test(file[lookahead])) {
      taken--;
      lookahead++;
    }
    return lookahead;
  }
  function lookaheadExactlyNTicks(pos2, n) {
    if (pos2 + n > end) {
      return false;
    }
    return file.startsWith("`".repeat(n), pos2) && file[pos2 + n] !== "`";
  }
  function findEndOfType(pos2) {
    let openBraces = 0;
    while (pos2 < end) {
      if (file[pos2] === "{") {
        openBraces++;
      } else if (file[pos2] === "}") {
        if (--openBraces === 0) {
          break;
        }
      } else if ("`'\"".includes(file[pos2])) {
        pos2 = findEndOfString(pos2);
      }
      pos2++;
    }
    if (pos2 < end && file[pos2] === "}") {
      pos2++;
    }
    return pos2;
  }
  function findEndOfString(pos2) {
    const endOfString = file[pos2];
    pos2++;
    while (pos2 < end) {
      if (file[pos2] === endOfString) {
        break;
      } else if (file[pos2] === "\\") {
        pos2++;
      } else if (endOfString === "`" && file[pos2] === "$" && file[pos2 + 1] === "{") {
        while (pos2 < end && file[pos2] !== "}") {
          if ("`'\"".includes(file[pos2])) {
            pos2 = findEndOfString(pos2) + 1;
          } else {
            pos2++;
          }
        }
      }
      pos2++;
    }
    return pos2;
  }
  function nextNonWs(pos2) {
    while (pos2 < end && /\s/.test(file[pos2])) {
      pos2++;
    }
    return file[pos2];
  }
}
function discoverIndent(file, pos, end) {
  let indent2 = 0;
  while (pos < end && file[pos] !== "\n") {
    pos++;
  }
  outer: while (pos < end) {
    pos++;
    const lineStart = pos;
    while (pos < end && file[pos] !== "\n") {
      if (/\S/.test(file[pos])) {
        indent2 = pos - lineStart;
        break outer;
      }
      pos++;
    }
  }
  const commentHasStars = pos < end && file[pos] === "*";
  return [commentHasStars, indent2];
}
function getRightmostName(name) {
  if (ts3.isJSDocMemberName(name)) {
    return name.right;
  }
  if (ts3.isQualifiedName(name)) {
    return name.right;
  }
  return name;
}

// src/lib/converter/comments/discovery.ts
import { ReflectionKind } from "#models";
import { CommentStyle, nicePath } from "#node-utils";
import { assertNever, filter, firstDefined, i18n } from "#utils";
import { ok } from "assert";
import ts4 from "typescript";
var variablePropertyKinds = [
  ts4.SyntaxKind.PropertyDeclaration,
  ts4.SyntaxKind.PropertySignature,
  ts4.SyntaxKind.BinaryExpression,
  ts4.SyntaxKind.PropertyAssignment,
  ts4.SyntaxKind.ShorthandPropertyAssignment,
  // class X { constructor(/** Comment */ readonly z: string) }
  ts4.SyntaxKind.Parameter,
  // Variable values
  ts4.SyntaxKind.VariableDeclaration,
  ts4.SyntaxKind.BindingElement,
  ts4.SyntaxKind.ExportAssignment,
  ts4.SyntaxKind.PropertyAccessExpression
];
var wantedKinds = {
  [ReflectionKind.Project]: [
    ts4.SyntaxKind.SourceFile,
    ts4.SyntaxKind.ModuleDeclaration
  ],
  [ReflectionKind.Module]: [
    ts4.SyntaxKind.SourceFile,
    ts4.SyntaxKind.ModuleDeclaration
  ],
  [ReflectionKind.Namespace]: [
    ts4.SyntaxKind.ModuleDeclaration,
    ts4.SyntaxKind.SourceFile,
    ts4.SyntaxKind.BindingElement,
    ts4.SyntaxKind.ExportSpecifier,
    ts4.SyntaxKind.NamespaceExport
  ],
  [ReflectionKind.Enum]: [
    ts4.SyntaxKind.EnumDeclaration
  ],
  [ReflectionKind.EnumMember]: [
    ts4.SyntaxKind.EnumMember
  ],
  [ReflectionKind.Variable]: variablePropertyKinds,
  [ReflectionKind.Function]: [
    ts4.SyntaxKind.FunctionDeclaration,
    ts4.SyntaxKind.BindingElement,
    ts4.SyntaxKind.VariableDeclaration,
    ts4.SyntaxKind.ExportAssignment,
    ts4.SyntaxKind.PropertyAccessExpression,
    ts4.SyntaxKind.PropertyDeclaration,
    ts4.SyntaxKind.PropertyAssignment,
    ts4.SyntaxKind.ShorthandPropertyAssignment
  ],
  [ReflectionKind.Class]: [
    ts4.SyntaxKind.ClassDeclaration,
    ts4.SyntaxKind.BindingElement
  ],
  [ReflectionKind.Interface]: [
    ts4.SyntaxKind.InterfaceDeclaration
  ],
  [ReflectionKind.Constructor]: [ts4.SyntaxKind.Constructor],
  [ReflectionKind.Property]: variablePropertyKinds,
  [ReflectionKind.Method]: [
    ts4.SyntaxKind.FunctionDeclaration,
    ts4.SyntaxKind.MethodDeclaration
  ],
  [ReflectionKind.CallSignature]: [
    ts4.SyntaxKind.FunctionDeclaration,
    ts4.SyntaxKind.VariableDeclaration,
    ts4.SyntaxKind.MethodDeclaration,
    ts4.SyntaxKind.MethodDeclaration,
    ts4.SyntaxKind.PropertyDeclaration,
    ts4.SyntaxKind.PropertySignature,
    ts4.SyntaxKind.CallSignature
  ],
  [ReflectionKind.IndexSignature]: [ts4.SyntaxKind.IndexSignature],
  [ReflectionKind.ConstructorSignature]: [ts4.SyntaxKind.ConstructSignature],
  [ReflectionKind.Parameter]: [ts4.SyntaxKind.Parameter],
  [ReflectionKind.TypeLiteral]: [ts4.SyntaxKind.TypeLiteral],
  [ReflectionKind.TypeParameter]: [ts4.SyntaxKind.TypeParameter],
  [ReflectionKind.Accessor]: [ts4.SyntaxKind.PropertyDeclaration],
  [ReflectionKind.GetSignature]: [ts4.SyntaxKind.GetAccessor],
  [ReflectionKind.SetSignature]: [ts4.SyntaxKind.SetAccessor],
  [ReflectionKind.TypeAlias]: [
    ts4.SyntaxKind.TypeAliasDeclaration
  ],
  [ReflectionKind.Reference]: [
    ts4.SyntaxKind.NamespaceExport,
    ts4.SyntaxKind.ExportSpecifier
  ],
  // Non-TS kind, will never have comments.
  [ReflectionKind.Document]: []
};
var backupWantedKinds = {
  [ReflectionKind.Project]: [],
  [ReflectionKind.Module]: [],
  [ReflectionKind.Namespace]: [
    // @namespace support
    ts4.SyntaxKind.VariableDeclaration,
    ts4.SyntaxKind.BindingElement,
    ts4.SyntaxKind.ExportAssignment,
    ts4.SyntaxKind.PropertyAccessExpression,
    ts4.SyntaxKind.PropertyDeclaration,
    ts4.SyntaxKind.PropertyAssignment,
    ts4.SyntaxKind.ShorthandPropertyAssignment
  ],
  [ReflectionKind.Enum]: [
    ts4.SyntaxKind.VariableDeclaration
  ],
  [ReflectionKind.EnumMember]: [
    // These here so that @enum gets comments
    ts4.SyntaxKind.PropertyAssignment,
    ts4.SyntaxKind.PropertySignature
  ],
  [ReflectionKind.Variable]: [],
  [ReflectionKind.Function]: [
    ts4.SyntaxKind.FunctionDeclaration,
    ts4.SyntaxKind.BindingElement,
    ts4.SyntaxKind.VariableDeclaration,
    ts4.SyntaxKind.ExportAssignment,
    ts4.SyntaxKind.PropertyAccessExpression,
    ts4.SyntaxKind.PropertyDeclaration,
    ts4.SyntaxKind.PropertyAssignment,
    ts4.SyntaxKind.ShorthandPropertyAssignment
  ],
  [ReflectionKind.Class]: [
    // If marked with @class
    ts4.SyntaxKind.VariableDeclaration,
    ts4.SyntaxKind.ExportAssignment,
    ts4.SyntaxKind.FunctionDeclaration
  ],
  [ReflectionKind.Interface]: [
    ts4.SyntaxKind.TypeAliasDeclaration,
    ts4.SyntaxKind.ClassDeclaration
    // type only exports
  ],
  [ReflectionKind.Constructor]: [],
  [ReflectionKind.Property]: [],
  [ReflectionKind.Method]: [],
  [ReflectionKind.CallSignature]: [],
  [ReflectionKind.IndexSignature]: [],
  [ReflectionKind.ConstructorSignature]: [],
  [ReflectionKind.Parameter]: [],
  [ReflectionKind.TypeLiteral]: [],
  [ReflectionKind.TypeParameter]: [],
  [ReflectionKind.Accessor]: [],
  [ReflectionKind.GetSignature]: [],
  [ReflectionKind.SetSignature]: [],
  [ReflectionKind.TypeAlias]: [
    ts4.SyntaxKind.FunctionDeclaration,
    // type only exports
    ts4.SyntaxKind.VariableDeclaration
    // type only exports
  ],
  [ReflectionKind.Reference]: [],
  // Non-TS kind, will never have comments.
  [ReflectionKind.Document]: []
};
function discoverFileComments(node, commentStyle) {
  const text = node.text;
  const comments = collectCommentRanges(
    ts4.getLeadingCommentRanges(text, node.pos)
  );
  const selectedDocComments = comments.filter((ranges) => permittedRange(text, ranges, commentStyle));
  return selectedDocComments.map((ranges) => {
    return {
      file: node,
      ranges,
      jsDoc: findJsDocForComment(node, ranges),
      inheritedFromParentDeclaration: false
    };
  });
}
function discoverNodeComment(node, commentStyle) {
  const text = node.getSourceFile().text;
  const comments = collectCommentRanges(
    ts4.getLeadingCommentRanges(text, node.pos)
  );
  comments.reverse();
  const selectedDocComment = comments.find((ranges) => permittedRange(text, ranges, commentStyle));
  if (selectedDocComment) {
    return {
      file: node.getSourceFile(),
      ranges: selectedDocComment,
      jsDoc: findJsDocForComment(node, selectedDocComment),
      inheritedFromParentDeclaration: false
    };
  }
}
function checkCommentDeclarations(commentNodes, reverse, commentStyle) {
  const discovered = [];
  for (const { node, inheritedFromParentDeclaration } of commentNodes) {
    const text = node.getSourceFile().text;
    const comments = collectCommentRanges(
      ts4.getLeadingCommentRanges(text, node.pos)
    );
    if (reverse) {
      comments.reverse();
    }
    const selectedDocComment = comments.find((ranges) => permittedRange(text, ranges, commentStyle));
    if (selectedDocComment) {
      discovered.push({
        file: node.getSourceFile(),
        ranges: selectedDocComment,
        jsDoc: findJsDocForComment(node, selectedDocComment),
        inheritedFromParentDeclaration
      });
    }
  }
  return discovered;
}
function discoverComment(symbol, kind, logger, commentStyle, checker, declarationWarnings) {
  const discovered = discoverCommentWorker(
    symbol,
    kind,
    logger,
    commentStyle,
    checker,
    declarationWarnings,
    wantedKinds[kind]
  );
  if (discovered) {
    return discovered;
  }
  return discoverCommentWorker(
    symbol,
    kind,
    logger,
    commentStyle,
    checker,
    declarationWarnings,
    backupWantedKinds[kind]
  );
}
function discoverCommentWorker(symbol, kind, logger, commentStyle, checker, declarationWarnings, wanted) {
  if (wanted.length === 0) {
    return;
  }
  const reverse = !symbol.declarations?.some(ts4.isSourceFile);
  const wantedDeclarations = filter(symbol.declarations, (decl) => wanted.includes(decl.kind));
  const commentNodes = wantedDeclarations.flatMap((decl) => declarationToCommentNodes(decl, checker));
  if (kind & ReflectionKind.ContainsCallSignatures) {
    const canHaveOverloads = wantedDeclarations.some(
      (node) => [
        ts4.SyntaxKind.FunctionDeclaration,
        ts4.SyntaxKind.MethodDeclaration,
        ts4.SyntaxKind.Constructor
      ].includes(node.kind)
    );
    const isOverloaded = canHaveOverloads && wantedDeclarations.length > 1;
    if (isOverloaded) {
      commentNodes.length = 0;
      const implementationNode = wantedDeclarations.find(
        (node) => node.body
      );
      if (implementationNode) {
        commentNodes.push({
          node: implementationNode,
          inheritedFromParentDeclaration: false
        });
      }
    } else if (canHaveOverloads) {
      commentNodes.length = 0;
    } else {
    }
  }
  const discovered = checkCommentDeclarations(
    commentNodes,
    reverse,
    commentStyle
  );
  switch (discovered.length) {
    case 0:
      return void 0;
    case 1:
      return discovered[0];
    default: {
      if (discovered.filter((n) => !n.inheritedFromParentDeclaration).length > 1 && (declarationWarnings || discovered.some((dc) => !dc.file.isDeclarationFile))) {
        logger.warn(
          i18n.symbol_0_has_multiple_declarations_with_comment(
            symbol.name
          )
        );
        const locations = discovered.map(
          ({ file, ranges: [{ pos }] }) => {
            const path3 = nicePath(file.fileName);
            const line2 = ts4.getLineAndCharacterOfPosition(file, pos).line + 1;
            return `${path3}:${line2}`;
          }
        );
        logger.info(
          i18n.comments_for_0_are_declared_at_1(
            symbol.name,
            locations.join("\n	")
          )
        );
      }
      return discovered[0];
    }
  }
}
function discoverSignatureComment(declaration, checker, commentStyle) {
  for (const {
    node,
    inheritedFromParentDeclaration
  } of declarationToCommentNodes(declaration, checker)) {
    if (ts4.isJSDocSignature(node)) {
      const comment2 = node.parent.parent;
      ok(ts4.isJSDoc(comment2));
      return {
        file: node.getSourceFile(),
        ranges: [
          {
            kind: ts4.SyntaxKind.MultiLineCommentTrivia,
            pos: comment2.pos,
            end: comment2.end
          }
        ],
        jsDoc: comment2,
        inheritedFromParentDeclaration
      };
    }
    const text = node.getSourceFile().text;
    const comments = collectCommentRanges(
      ts4.getLeadingCommentRanges(text, node.pos)
    );
    comments.reverse();
    const comment = comments.find((ranges) => permittedRange(text, ranges, commentStyle));
    if (comment) {
      return {
        file: node.getSourceFile(),
        ranges: comment,
        jsDoc: findJsDocForComment(node, comment),
        inheritedFromParentDeclaration
      };
    }
  }
}
function findJsDocForComment(node, ranges) {
  if (ranges[0].kind === ts4.SyntaxKind.MultiLineCommentTrivia) {
    const jsDocs = ts4.getJSDocCommentsAndTags(node).map((doc) => ts4.findAncestor(doc, ts4.isJSDoc));
    if (ts4.isSourceFile(node)) {
      if (node.statements.length) {
        jsDocs.push(...node.statements[0].getChildren().filter(ts4.isJSDoc));
      }
    }
    return jsDocs.find((doc) => doc.pos === ranges[0].pos);
  }
}
function isTopmostModuleDeclaration(node) {
  return node.getChildren().some(ts4.isModuleBlock);
}
function getRootModuleDeclaration(node) {
  while (node.parent.kind === ts4.SyntaxKind.ModuleDeclaration) {
    const parent = node.parent;
    if (node.name.pos === parent.name.end + 1) {
      node = parent;
    } else {
      break;
    }
  }
  return node;
}
function declarationToCommentNodeIgnoringParents(node) {
  if (!node.parent) return node;
  if (node.kind === ts4.SyntaxKind.Parameter) {
    return node;
  }
  if (node.parent.kind === ts4.SyntaxKind.VariableDeclarationList) {
    return node.parent.parent;
  }
  if (node.parent.kind === ts4.SyntaxKind.VariableDeclaration) {
    return node.parent.parent.parent;
  }
  if ([
    ts4.SyntaxKind.PropertyDeclaration,
    ts4.SyntaxKind.BinaryExpression,
    ts4.SyntaxKind.ExportAssignment
  ].includes(node.parent.kind)) {
    return node.parent;
  }
  if (ts4.isModuleDeclaration(node)) {
    if (!isTopmostModuleDeclaration(node)) {
      return;
    } else {
      return getRootModuleDeclaration(node);
    }
  }
  if (node.kind === ts4.SyntaxKind.ExportSpecifier) {
    return node.parent.parent;
  }
  if (ts4.SyntaxKind.NamespaceExport === node.kind) {
    return node.parent;
  }
}
function declarationToCommentNodes(node, checker) {
  const commentNode = declarationToCommentNodeIgnoringParents(node);
  if (commentNode) {
    return [
      {
        node: commentNode,
        inheritedFromParentDeclaration: false
      }
    ];
  }
  const result = [
    {
      node,
      inheritedFromParentDeclaration: false
    }
  ];
  let overloadIndex = void 0;
  if (ts4.isMethodDeclaration(node)) {
    const symbol = checker.getSymbolAtLocation(node.name || node);
    if (symbol) {
      overloadIndex = symbol.declarations?.filter((d) => d.kind === node.kind).indexOf(node);
      ok(overloadIndex !== -1, "Should always find declaration");
    }
  }
  const seenSymbols = /* @__PURE__ */ new Set();
  const bases = findBaseOfDeclaration(checker, node, (symbol) => {
    if (!seenSymbols.has(symbol)) {
      seenSymbols.add(symbol);
      if (overloadIndex === void 0) {
        return symbol.declarations?.map(
          (node2) => declarationToCommentNodeIgnoringParents(node2) || node2
        );
      } else if (symbol.declarations?.[overloadIndex]) {
        const parentSigNode = symbol.declarations[overloadIndex];
        return [
          declarationToCommentNodeIgnoringParents(parentSigNode) || parentSigNode
        ];
      }
    }
  });
  for (const parentCommentNode of bases || []) {
    result.push({
      node: parentCommentNode,
      inheritedFromParentDeclaration: true
    });
  }
  if (ts4.isShorthandPropertyAssignment(node)) {
    const sourceSymbol = checker.getShorthandAssignmentValueSymbol(node);
    if (sourceSymbol?.valueDeclaration) {
      const commentNode2 = declarationToCommentNodeIgnoringParents(sourceSymbol.valueDeclaration);
      if (commentNode2) {
        result.push(
          {
            node: commentNode2,
            inheritedFromParentDeclaration: true
          }
        );
      }
    }
    const originalSymbol = sourceSymbol && resolveAliasedSymbol(sourceSymbol, checker);
    if (originalSymbol !== sourceSymbol && originalSymbol?.valueDeclaration) {
      const commentNode2 = declarationToCommentNodeIgnoringParents(originalSymbol?.valueDeclaration);
      if (commentNode2) {
        result.push(
          {
            node: commentNode2,
            inheritedFromParentDeclaration: true
          }
        );
      }
    }
  }
  if ((ts4.isFunctionDeclaration(node) || ts4.isMethodDeclaration(node)) && node.name) {
    const symbol = checker.getSymbolAtLocation(node.name);
    if (symbol && symbol.declarations[0] !== node) {
      result.push({
        node: symbol.declarations[0],
        inheritedFromParentDeclaration: true
      });
    }
  }
  return result;
}
function findBaseOfDeclaration(checker, declaration, cb) {
  const classOrInterfaceDeclaration = declaration.parent?.kind === ts4.SyntaxKind.Constructor ? declaration.parent.parent : declaration.parent;
  if (!classOrInterfaceDeclaration) return;
  const isStaticMember = ts4.getCombinedModifierFlags(declaration) & ts4.ModifierFlags.Static;
  return firstDefined(
    ts4.getAllSuperTypeNodes(classOrInterfaceDeclaration),
    (superTypeNode) => {
      const baseType = checker.getTypeAtLocation(superTypeNode);
      const type2 = isStaticMember && baseType.symbol ? checker.getTypeOfSymbol(baseType.symbol) : baseType;
      const symbol = checker.getPropertyOfType(
        type2,
        declaration.symbol.name
      );
      return symbol ? cb(symbol) : void 0;
    }
  );
}
function collectCommentRanges(ranges) {
  const result = [];
  let collect = [];
  for (const range of ranges || []) {
    collect.push(range);
    switch (range.kind) {
      case ts4.SyntaxKind.MultiLineCommentTrivia:
        if (collect.length) {
          result.push(collect);
          collect = [];
        }
        result.push([range]);
        break;
      case ts4.SyntaxKind.SingleLineCommentTrivia:
        collect.push(range);
        break;
      /* istanbul ignore next */
      default:
        assertNever(range.kind);
    }
  }
  if (collect.length) {
    result.push(collect);
  }
  return result;
}
function permittedRange(text, ranges, commentStyle) {
  switch (commentStyle) {
    case CommentStyle.All:
      return true;
    case CommentStyle.Block:
      return ranges[0].kind === ts4.SyntaxKind.MultiLineCommentTrivia;
    case CommentStyle.Line:
      return ranges[0].kind === ts4.SyntaxKind.SingleLineCommentTrivia;
    case CommentStyle.TripleSlash:
      return ranges[0].kind === ts4.SyntaxKind.SingleLineCommentTrivia && text[ranges[0].pos + 2] === "/" && text[ranges[0].pos + 3] !== "/";
    case CommentStyle.JSDoc:
      return ranges[0].kind === ts4.SyntaxKind.MultiLineCommentTrivia && text[ranges[0].pos] === "/" && text[ranges[0].pos + 1] === "*" && text[ranges[0].pos + 2] === "*";
  }
}

// src/lib/converter/comments/lineLexer.ts
function* lexLineComments(file, ranges) {
  let textToken;
  for (const token of lexLineComments2(
    file,
    ranges[0].pos,
    ranges[ranges.length - 1].end
  )) {
    if (token.kind === "text" /* Text */) {
      if (textToken) {
        textToken.text += token.text;
      } else {
        textToken = token;
      }
    } else {
      if (textToken) {
        yield textToken;
        textToken = void 0;
      }
      yield token;
    }
  }
  if (textToken) {
    yield textToken;
  }
  return;
}
function* lexLineComments2(file, pos, end) {
  while (pos < end && /\s/.test(file[end - 1])) {
    end--;
  }
  let lineStart = true;
  let braceStartsType = false;
  for (; ; ) {
    if (lineStart) {
      pos = skipLeadingLineTrivia(pos);
      lineStart = false;
    }
    if (pos >= end) {
      return;
    }
    switch (file[pos]) {
      case "\n":
        yield makeToken("new_line" /* NewLine */, 1);
        lineStart = true;
        break;
      case "{":
        if (braceStartsType && nextNonWs(pos + 1) !== "@") {
          yield makeToken(
            "type" /* TypeAnnotation */,
            findEndOfType(pos) - pos
          );
          braceStartsType = false;
        } else {
          yield makeToken("open_brace" /* OpenBrace */, 1);
        }
        break;
      case "}":
        yield makeToken("close_brace" /* CloseBrace */, 1);
        braceStartsType = false;
        break;
      case "`": {
        braceStartsType = false;
        let tickCount = 1;
        let lookahead = pos - 1;
        let atNewline = true;
        while (lookahead > 0 && file[lookahead] !== "\n") {
          if (/\S/.test(file[lookahead])) {
            atNewline = false;
            break;
          }
          --lookahead;
        }
        lookahead = pos;
        while (lookahead + 1 < end && file[lookahead + 1] === "`") {
          tickCount++;
          lookahead++;
        }
        const isCodeBlock = atNewline && tickCount >= 3;
        let lookaheadStart = pos;
        const codeText = [];
        lookahead++;
        while (lookahead < end) {
          if (lookaheadExactlyNTicks(lookahead, tickCount)) {
            lookahead += tickCount;
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            const codeTextStr = codeText.join("");
            if (isCodeBlock || !/\n\s*\n/.test(codeTextStr)) {
              yield {
                kind: "code" /* Code */,
                text: codeTextStr,
                pos
              };
              pos = lookahead;
            } else {
              yield makeToken("text" /* Text */, tickCount);
            }
            break;
          } else if (file[lookahead] === "`") {
            while (lookahead < end && file[lookahead] === "`") {
              lookahead++;
            }
          } else if (file[lookahead] === "\\" && lookahead + 1 < end && file[lookahead + 1] !== "\n") {
            lookahead += 2;
          } else if (file[lookahead] === "\n") {
            lookahead++;
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            lookahead = skipLeadingLineTrivia(lookahead);
            lookaheadStart = lookahead;
          } else {
            lookahead++;
          }
        }
        if (lookahead >= end && pos !== lookahead) {
          if (tickCount === 3 && file.substring(pos, end).includes("\n")) {
            codeText.push(file.substring(lookaheadStart, end));
            yield {
              kind: "code" /* Code */,
              text: codeText.join(""),
              pos
            };
            pos = lookahead;
          } else {
            yield makeToken("text" /* Text */, tickCount);
          }
        }
        break;
      }
      case "@": {
        let lookahead = pos + 1;
        while (lookahead < end && /[a-z]/i.test(file[lookahead])) {
          lookahead++;
        }
        if (lookahead !== pos + 1) {
          while (lookahead < end && /[a-z0-9-]/i.test(file[lookahead])) {
            lookahead++;
          }
        }
        if (lookahead !== pos + 1 && (lookahead === end || /[\s}]/.test(file[lookahead]))) {
          braceStartsType = true;
          yield makeToken("tag" /* Tag */, lookahead - pos);
          break;
        }
      }
      // fall through if we didn't find something that looks like a tag
      default: {
        const textParts = [];
        let lookaheadStart = pos;
        let lookahead = pos;
        while (lookahead < end) {
          if ("{}\n`".includes(file[lookahead])) break;
          if (lookahead !== pos && file[lookahead] === "@" && /\s/.test(file[lookahead - 1])) {
            break;
          }
          if (file[lookahead] === "\\" && lookahead + 1 < end && "{}@`".includes(file[lookahead + 1])) {
            textParts.push(
              file.substring(lookaheadStart, lookahead),
              file[lookahead + 1]
            );
            lookahead++;
            lookaheadStart = lookahead + 1;
          }
          lookahead++;
        }
        textParts.push(file.substring(lookaheadStart, lookahead));
        if (textParts.some((part) => /\S/.test(part))) {
          braceStartsType = false;
        }
        yield {
          kind: "text" /* Text */,
          text: textParts.join(""),
          pos
        };
        pos = lookahead;
        break;
      }
    }
  }
  function makeToken(kind, size) {
    const start = pos;
    pos += size;
    return {
      kind,
      text: file.substring(start, pos),
      pos: start
    };
  }
  function skipLeadingLineTrivia(pos2) {
    let lookahead = pos2;
    while (lookahead < end && /\s/.test(file[lookahead])) {
      lookahead++;
    }
    while (lookahead < end && file[lookahead] === "/") {
      lookahead++;
    }
    if (lookahead < end && file[lookahead] === " ") {
      lookahead++;
    }
    return lookahead;
  }
  function lookaheadExactlyNTicks(pos2, n) {
    if (pos2 + n > end) {
      return false;
    }
    return file.startsWith("`".repeat(n), pos2) && file[pos2 + n] !== "`";
  }
  function findEndOfType(pos2) {
    let openBraces = 0;
    while (pos2 < end) {
      if (file[pos2] === "{") {
        openBraces++;
      } else if (file[pos2] === "}") {
        if (--openBraces === 0) {
          break;
        }
      } else if ("`'\"".includes(file[pos2])) {
        pos2 = findEndOfString(pos2);
      }
      pos2++;
    }
    if (pos2 < end && file[pos2] === "}") {
      pos2++;
    }
    return pos2;
  }
  function findEndOfString(pos2) {
    const endOfString = file[pos2];
    pos2++;
    while (pos2 < end) {
      if (file[pos2] === endOfString) {
        break;
      } else if (file[pos2] === "\\") {
        pos2++;
      } else if (endOfString === "`" && file[pos2] === "$" && file[pos2 + 1] === "{") {
        while (pos2 < end && file[pos2] !== "}") {
          if ("`'\"".includes(file[pos2])) {
            pos2 = findEndOfString(pos2) + 1;
          } else {
            pos2++;
          }
        }
      }
      pos2++;
    }
    return pos2;
  }
  function nextNonWs(pos2) {
    while (pos2 < end && /\s/.test(file[pos2])) {
      pos2++;
    }
    return file[pos2];
  }
}

// src/lib/converter/comments/parser.ts
import { Comment, CommentTag, FileRegistry } from "#models";
import { hasDeclarationFileExtension, nicePath as nicePath2 } from "#node-utils";
import { assertNever as assertNever2, i18n as i18n3, removeIf } from "#utils";
import assert, { ok as ok2 } from "assert";
import { parseDocument as parseYamlDoc } from "yaml";

// src/lib/converter/comments/tagName.ts
function extractTagName(text) {
  let pos = skipWs(text, 0);
  let nameStart = pos;
  let bracketDepth = 0;
  let stringChar = "";
  while (pos < text.length && (bracketDepth > 0 || /\S/.test(text[pos]))) {
    if (stringChar) {
      if (text[pos] == stringChar) {
        stringChar = "";
        ++pos;
      } else if (text[pos] == "\\") {
        pos += 2;
      } else {
        ++pos;
      }
    } else {
      if ("\"'`".includes(text[pos])) {
        stringChar = text[pos];
      } else if (text[pos] == "[") {
        ++bracketDepth;
      } else if (text[pos] == "]") {
        --bracketDepth;
      }
      ++pos;
    }
  }
  let nameEnd = pos;
  if (text[nameStart] === "[") {
    nameStart = skipWs(text, nameStart + 1);
    nameEnd = skipWith(text, nameStart, /[^\s=\]]/);
  }
  pos = skipWith(text, pos, /[\s-]/);
  return {
    name: text.substring(nameStart, nameEnd),
    newText: text.substring(pos)
  };
}
function skipWs(text, pos) {
  return skipWith(text, pos, /\s/);
}
function skipWith(text, pos, reg) {
  while (pos < text.length && reg.test(text[pos])) {
    ++pos;
  }
  return pos;
}

// src/lib/converter/comments/textParser.ts
import { HtmlAttributeParser, ParserState } from "#node-utils";
import { i18n as i18n2 } from "#utils";
import MarkdownIt from "markdown-it";
var MdHelpers = new MarkdownIt().helpers;
var TextParserReentryState = class {
  withinLinkLabel = false;
  withinLinkDest = false;
  lastPartWasNewline = false;
  checkState(token) {
    switch (token.kind) {
      case "code" /* Code */:
        if (/\n\s*\n/.test(token.text)) {
          this.withinLinkLabel = false;
          this.withinLinkDest = false;
        }
        break;
      case "new_line" /* NewLine */:
        if (this.lastPartWasNewline) {
          this.withinLinkLabel = false;
          this.withinLinkDest = false;
        }
        break;
    }
    this.lastPartWasNewline = token.kind === "new_line" /* NewLine */;
  }
};
function textContent(parserData, outContent, reentry) {
  let lastPartEnd = 0;
  let canEndMarkdownLink = true;
  const data = {
    ...parserData,
    pos: 0
    // relative to the token
  };
  function addRef(ref) {
    canEndMarkdownLink = true;
    outContent.push({
      kind: "text",
      text: data.token.text.slice(lastPartEnd, ref.pos)
    });
    const link = {
      kind: "relative-link",
      text: data.token.text.slice(ref.pos, ref.end),
      target: ref.target,
      targetAnchor: ref.targetAnchor
    };
    outContent.push(link);
    lastPartEnd = ref.end;
    data.pos = ref.end;
    if (!ref.target && data.validationOptions.invalidPath) {
      data.validationWarning(
        i18n2.relative_path_0_is_not_a_file_and_will_not_be_copied_to_output(
          data.token.text.slice(ref.pos, ref.end)
        ),
        {
          kind: "text" /* Text */,
          // ref.pos is relative to the token, but this pos is relative to the file.
          pos: data.token.pos + ref.pos,
          text: data.token.text.slice(ref.pos, ref.end)
        }
      );
    }
  }
  while (data.pos < data.token.text.length) {
    if (canEndMarkdownLink) {
      const link = checkMarkdownLink(data, reentry);
      if (link) {
        addRef(link);
        continue;
      }
      canEndMarkdownLink = !reentry.withinLinkLabel && !reentry.withinLinkDest;
    }
    const reference = checkReference(data);
    if (reference) {
      addRef(reference);
      continue;
    }
    const tagLinks = checkTagLink(data);
    if (tagLinks.length) {
      for (const tagLink of tagLinks) {
        addRef(tagLink);
      }
      continue;
    }
    const atNewLine = data.token.text[data.pos] === "\n";
    data.atNewLine = atNewLine;
    if (atNewLine && !reentry.withinLinkDest) canEndMarkdownLink = true;
    ++data.pos;
  }
  if (lastPartEnd !== data.token.text.length) {
    outContent.push({ kind: "text", text: data.token.text.slice(lastPartEnd) });
  }
}
function checkMarkdownLink(data, reentry) {
  const { token, sourcePath, files } = data;
  let searchStart;
  if (reentry.withinLinkLabel || reentry.withinLinkDest) {
    searchStart = data.pos;
  } else if (token.text[data.pos] === "[") {
    searchStart = data.pos + 1;
  } else {
    return;
  }
  if (!reentry.withinLinkDest) {
    const labelEnd = findLabelEnd(token.text, searchStart);
    if (labelEnd === -1 || token.text[labelEnd] === "\n") {
      reentry.withinLinkLabel = labelEnd !== data.pos || !data.atNewLine;
      return;
    }
    reentry.withinLinkLabel = false;
    if (!token.text.startsWith("](", labelEnd)) return;
    searchStart = labelEnd + 2;
  }
  const end = token.text.length;
  let lookahead = searchStart;
  for (let newlines = 0; ; ++lookahead) {
    if (lookahead === end) {
      reentry.withinLinkDest = true;
      return;
    }
    switch (token.text[lookahead]) {
      case "\n":
        if (++newlines === 2) {
          reentry.withinLinkDest = false;
          return;
        }
        continue;
      case " ":
      case "	":
        continue;
    }
    break;
  }
  reentry.withinLinkDest = false;
  const link = MdHelpers.parseLinkDestination(token.text, lookahead, end);
  if (link.ok) {
    const decoded = decodeURI(link.str);
    if (isRelativePath(decoded)) {
      const { target, anchor } = files.register(
        sourcePath,
        decoded
      ) || { target: void 0, anchor: void 0 };
      return {
        pos: lookahead,
        end: link.pos,
        target,
        targetAnchor: anchor
      };
    }
    data.pos = link.pos - 1;
  }
}
function checkReference(data) {
  const { atNewLine, pos, token, files, sourcePath } = data;
  if (atNewLine) {
    let lookahead = pos;
    while (/[ \t]/.test(token.text[lookahead])) {
      ++lookahead;
    }
    if (token.text[lookahead] === "[" && token.text[lookahead + 1] !== "^") {
      while (lookahead < token.text.length && /[^\n\]]/.test(token.text[lookahead])) {
        ++lookahead;
      }
      if (token.text.startsWith("]:", lookahead)) {
        lookahead += 2;
        while (/[ \t]/.test(token.text[lookahead])) {
          ++lookahead;
        }
        const link = MdHelpers.parseLinkDestination(
          token.text,
          lookahead,
          token.text.length
        );
        if (link.ok) {
          const decoded = decodeURI(link.str);
          if (isRelativePath(decoded)) {
            const { target, anchor } = files.register(
              sourcePath,
              decoded
            ) || { target: void 0, anchor: void 0 };
            return {
              pos: lookahead,
              end: link.pos,
              target,
              targetAnchor: anchor
            };
          }
          data.pos = link.pos - 1;
        }
      }
    }
  }
}
function checkTagLink(data) {
  const { pos, token } = data;
  if (token.text.startsWith("<img ", pos)) {
    data.pos += 4;
    return checkAttributes(data, {
      src: checkAttributeDirectPath,
      srcset: checkAttributeSrcSet
    });
  }
  if (token.text.startsWith("<link ", pos)) {
    data.pos += 4;
    return checkAttributes(data, {
      // cspell:words imagesrcset
      imagesrcset: checkAttributeSrcSet
    });
  }
  if (token.text.startsWith("<a ", pos)) {
    data.pos += 3;
    return checkAttributes(data, { href: checkAttributeDirectPath });
  }
  if (token.text.startsWith("<source ", pos)) {
    data.pos += 8;
    return checkAttributes(data, {
      src: checkAttributeDirectPath,
      srcset: checkAttributeSrcSet
    });
  }
  return [];
}
function checkAttributes(data, attributes) {
  const links = [];
  const parser = new HtmlAttributeParser(data.token.text, data.pos);
  while (parser.state !== ParserState.END) {
    if (parser.state === ParserState.BeforeAttributeValue && Object.prototype.hasOwnProperty.call(attributes, parser.currentAttributeName)) {
      parser.step();
      links.push(...attributes[parser.currentAttributeName](
        data,
        parser.currentAttributeValue,
        parser.currentAttributeValueStart,
        parser.currentAttributeValueEnd
      ));
    }
    parser.step();
  }
  return links;
}
function checkAttributeDirectPath(data, text, pos, end) {
  const decoded = decodeURI(text.trim());
  if (isRelativePath(decoded)) {
    const { target, anchor } = data.files.register(
      data.sourcePath,
      decoded
    ) || { target: void 0, anchor: void 0 };
    return [{
      pos,
      end,
      target,
      targetAnchor: anchor
    }];
  }
  return [];
}
function checkAttributeSrcSet(data, text, pos, _end) {
  const result = [];
  let textPos = 0;
  parseImageCandidate();
  while (textPos < text.length && text[textPos] == ",") {
    ++textPos;
    parseImageCandidate();
  }
  return result;
  function parseImageCandidate() {
    while (textPos < text.length && /[\t\r\f\n ]/.test(text[textPos])) ++textPos;
    const url = text.slice(textPos).match(/^[^\t\r\f\n ,]+/);
    const decoded = url && decodeURI(url[0]);
    if (decoded && isRelativePath(decoded)) {
      const { target, anchor } = data.files.register(
        data.sourcePath,
        decoded
      ) || { target: void 0, anchor: void 0 };
      result.push({
        pos: pos + textPos,
        end: pos + textPos + url[0].length,
        target,
        targetAnchor: anchor
      });
    }
    textPos += url ? url[0].length : 0;
    while (textPos < text.length && /[\t\r\f\n ]/.test(text[textPos])) ++textPos;
    {
      const w = text.slice(textPos).match(/^\+?\d+\s*w/);
      textPos += w ? w[0].length : 0;
      if (!w) {
        const x = text.slice(textPos).match(/^\+?\d+(\.\d+)?([eE][+-]\d+)?\s*x/);
        textPos += x ? x[0].length : 0;
      }
    }
    while (textPos < text.length && /[\t\r\f\n ]/.test(text[textPos])) ++textPos;
  }
}
function isRelativePath(link) {
  return !/^[a-z]+:|^\/|^#/i.test(link);
}
function findLabelEnd(text, pos) {
  while (pos < text.length) {
    switch (text[pos]) {
      case "\\":
        ++pos;
        if (pos < text.length && text[pos] === "\n") return pos;
        break;
      case "\n":
      case "]":
      case "[":
        return pos;
    }
    ++pos;
  }
  return -1;
}

// src/lib/converter/comments/parser.ts
function makeLookaheadGenerator(gen) {
  let trackHistory = false;
  const history = [];
  const next = [gen.next()];
  return {
    done() {
      return !!next[0].done;
    },
    peek() {
      ok2(!next[0].done);
      return next[0].value;
    },
    take() {
      const thisItem = next.shift();
      if (trackHistory) {
        history.push(thisItem);
      }
      ok2(!thisItem.done);
      next.push(gen.next());
      return thisItem.value;
    },
    mark() {
      ok2(
        !trackHistory,
        "Can only mark one location for backtracking at a time"
      );
      trackHistory = true;
    },
    release() {
      trackHistory = false;
      next.unshift(...history);
      history.length = 0;
    }
  };
}
function parseComment(tokens, file, context) {
  const lexer = makeLookaheadGenerator(tokens);
  const tok = lexer.done() || lexer.peek();
  const comment = new Comment();
  comment.sourcePath = file.fileName;
  comment.summary = blockContent(
    comment,
    lexer,
    context.config,
    warningImpl,
    validationWarningImpl,
    context.files
  );
  while (!lexer.done()) {
    comment.blockTags.push(
      blockTag(comment, lexer, context.config, warningImpl, validationWarningImpl, context.files)
    );
  }
  const tok2 = tok;
  postProcessComment(
    comment,
    () => `${nicePath2(file.fileName)}:${file.getLineAndCharacterOfPosition(tok2.pos).line + 1}`,
    (message) => context.logger.warn(message)
  );
  return comment;
  function warningImpl(message, token) {
    if (context.config.suppressCommentWarningsInDeclarationFiles && hasDeclarationFileExtension(file.fileName)) {
      return;
    }
    context.logger.warn(message, token.pos, file);
  }
  function validationWarningImpl(message, token) {
    if (context.config.suppressCommentWarningsInDeclarationFiles && hasDeclarationFileExtension(file.fileName)) {
      return;
    }
    context.logger.validationWarning(message, token.pos, file);
  }
}
function parseCommentString(tokens, config, file, logger, files) {
  const suppressWarningsConfig = {
    ...config,
    jsDocCompatibility: {
      defaultTag: true,
      exampleTag: true,
      ignoreUnescapedBraces: true,
      inheritDocTag: true
    },
    suppressCommentWarningsInDeclarationFiles: true
  };
  const reentry = new TextParserReentryState();
  const content = [];
  const lexer = makeLookaheadGenerator(tokens);
  let atNewLine = false;
  while (!lexer.done()) {
    let consume = true;
    const next = lexer.peek();
    reentry.checkState(next);
    switch (next.kind) {
      case "type" /* TypeAnnotation */:
        assert(false, "Should be unreachable");
        break;
      case "new_line" /* NewLine */:
      case "text" /* Text */:
      case "tag" /* Tag */:
      case "close_brace" /* CloseBrace */:
        textContent(
          {
            sourcePath: file.fileName,
            token: next,
            warning: (msg, token) => logger.warn(msg, token.pos, file),
            validationWarning: (msg, token) => logger.validationWarning(msg, token.pos, file),
            files,
            atNewLine,
            validationOptions: config.validationOptions
          },
          /* out */
          content,
          reentry
        );
        break;
      case "code" /* Code */:
        content.push({ kind: "code", text: next.text });
        break;
      case "open_brace" /* OpenBrace */:
        inlineTag(
          lexer,
          content,
          suppressWarningsConfig,
          (message, token) => logger.warn(message, token.pos, file)
        );
        consume = false;
        break;
      default:
        assertNever2(next.kind);
    }
    atNewLine = next.kind === "new_line" /* NewLine */;
    if (consume) {
      lexer.take();
    }
  }
  let frontmatterData = {};
  const firstBlock = content.at(0);
  if (firstBlock?.text.startsWith("---\n")) {
    const end = firstBlock.text.indexOf("\n---\n");
    if (end !== -1) {
      const yamlText = firstBlock.text.slice("---\n".length, end);
      firstBlock.text = firstBlock.text.slice(end + "\n---\n".length).trimStart();
      const frontmatter = parseYamlDoc(yamlText, { prettyErrors: false });
      for (const warning of frontmatter.warnings) {
        logger.warn(
          warning.message,
          warning.pos[0] + "---\n".length,
          file
        );
      }
      for (const error of frontmatter.errors) {
        logger.error(
          error.message,
          error.pos[0] + "---\n".length,
          file
        );
      }
      if (frontmatter.errors.length === 0) {
        const data = frontmatter.toJS();
        if (typeof data === "object") {
          frontmatterData = data;
        } else {
          logger.error(
            i18n3.yaml_frontmatter_not_an_object(),
            5,
            file
          );
        }
      }
    }
  }
  return { content, frontmatter: frontmatterData };
}
var HAS_USER_IDENTIFIER = [
  "@callback",
  "@param",
  "@prop",
  "@property",
  "@template",
  "@typedef",
  "@typeParam",
  "@inheritDoc"
];
function makeCodeBlock(text) {
  return "```ts\n" + text + "\n```";
}
function postProcessComment(comment, getPosition, warning) {
  for (const tag of comment.blockTags) {
    if (HAS_USER_IDENTIFIER.includes(tag.tag) && tag.content.length) {
      const first = tag.content[0];
      if (first.kind === "text") {
        const { name, newText } = extractTagName(first.text);
        tag.name = name;
        if (newText) {
          first.text = newText;
        } else {
          tag.content.shift();
        }
      }
    }
    if (tag.content.some(
      (part) => part.kind === "inline-tag" && part.tag === "@inheritDoc"
    )) {
      warning(
        i18n3.inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0(
          getPosition()
        )
      );
    }
  }
  const remarks = comment.blockTags.filter((tag) => tag.tag === "@remarks");
  if (remarks.length > 1) {
    warning(
      i18n3.at_most_one_remarks_tag_expected_in_comment_at_0(
        getPosition()
      )
    );
    removeIf(comment.blockTags, (tag) => remarks.indexOf(tag) > 0);
  }
  const returns = comment.blockTags.filter((tag) => tag.tag === "@returns");
  if (remarks.length > 1) {
    warning(
      i18n3.at_most_one_returns_tag_expected_in_comment_at_0(
        getPosition()
      )
    );
    removeIf(comment.blockTags, (tag) => returns.indexOf(tag) > 0);
  }
  const inheritDoc = comment.blockTags.filter(
    (tag) => tag.tag === "@inheritDoc"
  );
  const inlineInheritDoc = comment.summary.filter(
    (part) => part.kind === "inline-tag" && part.tag === "@inheritDoc"
  );
  if (inlineInheritDoc.length + inheritDoc.length > 1) {
    warning(
      i18n3.at_most_one_inheritdoc_tag_expected_in_comment_at_0(
        getPosition()
      )
    );
    const allInheritTags = [...inlineInheritDoc, ...inheritDoc];
    removeIf(comment.summary, (part) => allInheritTags.indexOf(part) > 0);
    removeIf(comment.blockTags, (tag) => allInheritTags.indexOf(tag) > 0);
  }
  if ((inlineInheritDoc.length || inheritDoc.length) && comment.summary.some(
    (part) => part.kind !== "inline-tag" && /\S/.test(part.text)
  )) {
    warning(
      i18n3.content_in_summary_overwritten_by_inheritdoc_in_comment_at_0(
        getPosition()
      )
    );
  }
  if ((inlineInheritDoc.length || inheritDoc.length) && remarks.length) {
    warning(
      i18n3.content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0(
        getPosition()
      )
    );
  }
  if ((inlineInheritDoc.length || inheritDoc.length) && returns.length) {
    warning(
      i18n3.content_in_returns_block_overwritten_by_inheritdoc_in_comment_at_0(
        getPosition()
      )
    );
  }
}
var aliasedTags = /* @__PURE__ */ new Map([["@return", "@returns"]]);
function blockTag(comment, lexer, config, warning, validationWarning, files) {
  const blockTag2 = lexer.take();
  ok2(
    blockTag2.kind === "tag" /* Tag */,
    "blockTag called not at the start of a block tag."
  );
  if (!config.blockTags.has(blockTag2.text)) {
    warning(i18n3.unknown_block_tag_0(blockTag2.text), blockTag2);
  }
  const tagName = aliasedTags.get(blockTag2.text) || blockTag2.text;
  let content;
  if (tagName === "@example") {
    return exampleBlock(comment, lexer, config, warning, validationWarning, files);
  }
  let typeAnnotation;
  if (!lexer.done() && config.preservedTypeAnnotationTags.has(tagName)) {
    if (lexer.peek().kind === "text" /* Text */ && /^\s+$/.test(lexer.peek().text)) {
      lexer.take();
    }
    if (lexer.peek().kind === "type" /* TypeAnnotation */) {
      typeAnnotation = lexer.take().text;
    }
  }
  if (["@default", "@defaultValue"].includes(tagName) && config.jsDocCompatibility.defaultTag) {
    content = defaultBlockContent(
      comment,
      lexer,
      config,
      warning,
      validationWarning,
      files
    );
  } else {
    content = blockContent(comment, lexer, config, warning, validationWarning, files);
  }
  const tag = new CommentTag(tagName, content);
  if (typeAnnotation) {
    tag.typeAnnotation = typeAnnotation;
  }
  return tag;
}
function defaultBlockContent(comment, lexer, config, warning, validationWarning, files) {
  lexer.mark();
  const tempRegistry = new FileRegistry();
  const content = blockContent(
    comment,
    lexer,
    config,
    () => {
    },
    () => {
    },
    tempRegistry
  );
  const end = lexer.done() || lexer.peek();
  lexer.release();
  if (content.some(
    (part) => part.kind === "code" || part.kind === "inline-tag"
  )) {
    return blockContent(comment, lexer, config, warning, validationWarning, files);
  }
  const tokens = [];
  while ((lexer.done() || lexer.peek()) !== end) {
    tokens.push(lexer.take());
  }
  const blockText = tokens.map((tok) => tok.text).join("").trim();
  return [
    {
      kind: "code",
      text: makeCodeBlock(blockText)
    }
  ];
}
function exampleBlock(comment, lexer, config, warning, validationWarning, files) {
  lexer.mark();
  const tempRegistry = new FileRegistry();
  const content = blockContent(
    comment,
    lexer,
    config,
    () => {
    },
    () => {
    },
    tempRegistry
  );
  const end = lexer.done() || lexer.peek();
  lexer.release();
  if (!config.jsDocCompatibility.exampleTag || content.some(
    (part) => part.kind === "code" && part.text.startsWith("```")
  )) {
    let exampleName = "";
    let warnedAboutRichNameContent = false;
    outer: while ((lexer.done() || lexer.peek()) !== end) {
      const next = lexer.peek();
      switch (next.kind) {
        case "new_line" /* NewLine */:
          lexer.take();
          break outer;
        case "text" /* Text */: {
          const newline = next.text.indexOf("\n");
          if (newline !== -1) {
            exampleName += next.text.substring(0, newline);
            next.pos += newline + 1;
            break outer;
          } else {
            exampleName += lexer.take().text;
          }
          break;
        }
        case "code" /* Code */:
        case "tag" /* Tag */:
        case "type" /* TypeAnnotation */:
        case "close_brace" /* CloseBrace */:
        case "open_brace" /* OpenBrace */:
          if (!warnedAboutRichNameContent) {
            warning(i18n3.example_tag_literal_name(), lexer.peek());
            warnedAboutRichNameContent = true;
          }
          exampleName += lexer.take().text;
          break;
        default:
          assertNever2(next.kind);
      }
    }
    const content2 = blockContent(
      comment,
      lexer,
      config,
      warning,
      validationWarning,
      files
    );
    const tag = new CommentTag("@example", content2);
    if (exampleName.trim()) {
      tag.name = exampleName.trim();
    }
    return tag;
  }
  const tokens = [];
  while ((lexer.done() || lexer.peek()) !== end) {
    tokens.push(lexer.take());
  }
  const blockText = tokens.map((tok) => tok.text).join("").trim();
  const caption = blockText.match(/^\s*<caption>(.*?)<\/caption>\s*(\n|$)/);
  if (caption) {
    const tag = new CommentTag("@example", [
      {
        kind: "code",
        text: makeCodeBlock(blockText.slice(caption[0].length))
      }
    ]);
    tag.name = caption[1];
    return tag;
  } else {
    return new CommentTag("@example", [
      {
        kind: "code",
        text: makeCodeBlock(blockText)
      }
    ]);
  }
}
function blockContent(comment, lexer, config, warning, validationWarning, files) {
  const content = [];
  let atNewLine = true;
  const reentry = new TextParserReentryState();
  loop: while (!lexer.done()) {
    const next = lexer.peek();
    reentry.checkState(next);
    let consume = true;
    switch (next.kind) {
      case "new_line" /* NewLine */:
        content.push({ kind: "text", text: next.text });
        break;
      case "text" /* Text */:
        textContent(
          {
            sourcePath: comment.sourcePath,
            token: next,
            files,
            atNewLine,
            warning,
            validationWarning,
            validationOptions: config.validationOptions
          },
          /*out*/
          content,
          reentry
        );
        break;
      case "code" /* Code */:
        content.push({ kind: "code", text: next.text });
        break;
      case "tag" /* Tag */:
        if (next.text === "@inheritdoc") {
          if (!config.jsDocCompatibility.inheritDocTag) {
            warning(
              i18n3.inheritdoc_tag_properly_capitalized(),
              next
            );
          }
          next.text = "@inheritDoc";
        }
        if (config.modifierTags.has(next.text)) {
          comment.modifierTags.add(next.text);
          break;
        } else if (!atNewLine && !config.blockTags.has(next.text)) {
          comment.modifierTags.add(next.text);
          warning(
            i18n3.treating_unrecognized_tag_0_as_modifier(next.text),
            next
          );
          break;
        } else {
          break loop;
        }
      case "type" /* TypeAnnotation */:
        break;
      case "close_brace" /* CloseBrace */:
        if (!config.jsDocCompatibility.ignoreUnescapedBraces) {
          warning(i18n3.unmatched_closing_brace(), next);
        }
        content.push({ kind: "text", text: next.text });
        break;
      case "open_brace" /* OpenBrace */:
        inlineTag(lexer, content, config, warning);
        consume = false;
        break;
      default:
        assertNever2(next.kind);
    }
    if (consume && lexer.take().kind === "new_line" /* NewLine */) {
      atNewLine = true;
    }
  }
  for (let i = 0; i < content.length - 1; ) {
    if (content[i].kind === "text" && content[i + 1].kind === "text") {
      content[i].text += content[i + 1].text;
      content.splice(i + 1, 1);
    } else {
      i++;
    }
  }
  for (let i = 0; i < content.length; ) {
    if (i === 0 || content[i].kind === "inline-tag") {
      content[i].text = content[i].text.trimStart();
    }
    if (i === content.length - 1 || content[i].kind === "inline-tag") {
      content[i].text = content[i].text.trimEnd();
    }
    if (!content[i].text && content[i].kind === "text") {
      content.splice(i, 1);
    } else {
      i++;
    }
  }
  return content;
}
function inlineTag(lexer, block, config, warning) {
  const openBrace = lexer.take();
  if (lexer.done() || !["text" /* Text */, "tag" /* Tag */].includes(lexer.peek().kind)) {
    if (!config.jsDocCompatibility.ignoreUnescapedBraces) {
      warning(i18n3.unescaped_open_brace_without_inline_tag(), openBrace);
    }
    block.push({ kind: "text", text: openBrace.text });
    return;
  }
  let tagName = lexer.take();
  if (lexer.done() || tagName.kind === "text" /* Text */ && (!/^\s+$/.test(tagName.text) || lexer.peek().kind != "tag" /* Tag */)) {
    if (!config.jsDocCompatibility.ignoreUnescapedBraces) {
      warning(i18n3.unescaped_open_brace_without_inline_tag(), openBrace);
    }
    block.push({ kind: "text", text: openBrace.text + tagName.text });
    return;
  }
  if (tagName.kind !== "tag" /* Tag */) {
    tagName = lexer.take();
  }
  if (!config.inlineTags.has(tagName.text)) {
    warning(i18n3.unknown_inline_tag_0(tagName.text), tagName);
  }
  const content = [];
  while (!lexer.done() && lexer.peek().kind !== "close_brace" /* CloseBrace */) {
    const token = lexer.take();
    if (token.kind === "open_brace" /* OpenBrace */) {
      warning(i18n3.open_brace_within_inline_tag(), token);
    }
    content.push(token.kind === "new_line" /* NewLine */ ? " " : token.text);
  }
  if (lexer.done()) {
    warning(i18n3.inline_tag_not_closed(), openBrace);
  } else {
    lexer.take();
  }
  const inlineTag2 = {
    kind: "inline-tag",
    tag: tagName.text,
    text: content.join("")
  };
  if (tagName.tsLinkTarget) {
    inlineTag2.target = tagName.tsLinkTarget;
  }
  if (tagName.tsLinkText) {
    inlineTag2.tsLinkText = tagName.tsLinkText;
  }
  block.push(inlineTag2);
}

// src/lib/converter/comments/index.ts
var jsDocCommentKinds = [
  ts5.SyntaxKind.JSDocPropertyTag,
  ts5.SyntaxKind.JSDocCallbackTag,
  ts5.SyntaxKind.JSDocTypedefTag,
  ts5.SyntaxKind.JSDocTemplateTag,
  ts5.SyntaxKind.JSDocEnumTag
];
var commentDiscoveryId = 0;
var commentCache = /* @__PURE__ */ new WeakMap();
function clearCommentCache() {
  commentCache = /* @__PURE__ */ new WeakMap();
  commentDiscoveryId = 0;
}
function getCommentIgnoringCacheNoDiscoveryId(discovered, context) {
  if (!discovered) return;
  const { file, ranges, jsDoc } = discovered;
  let comment;
  switch (ranges[0].kind) {
    case ts5.SyntaxKind.MultiLineCommentTrivia:
      comment = parseComment(
        lexBlockComment(
          file.text,
          ranges[0].pos,
          ranges[0].end,
          context.createSymbolId,
          jsDoc,
          context.checker
        ),
        file,
        context
      );
      break;
    case ts5.SyntaxKind.SingleLineCommentTrivia:
      comment = parseComment(
        lexLineComments(file.text, ranges),
        file,
        context
      );
      break;
    default:
      assertNever3(ranges[0].kind);
  }
  comment.inheritedFromParentDeclaration = discovered.inheritedFromParentDeclaration;
  return comment;
}
function getCommentWithCache(discovered, context) {
  if (!discovered) return;
  const { file, ranges } = discovered;
  const cache = commentCache.get(file) || /* @__PURE__ */ new Map();
  if (cache.has(ranges[0].pos)) {
    const clone = cache.get(ranges[0].pos).clone();
    clone.inheritedFromParentDeclaration = discovered.inheritedFromParentDeclaration;
    return clone;
  }
  const comment = getCommentIgnoringCacheNoDiscoveryId(discovered, context);
  if (!comment) return;
  comment.discoveryId = ++commentDiscoveryId;
  cache.set(ranges[0].pos, comment);
  commentCache.set(file, cache);
  return comment.clone();
}
function getCommentImpl(commentSource, moduleComment, context) {
  const comment = getCommentWithCache(
    commentSource,
    {
      ...context,
      checker: context.config.useTsLinkResolution ? context.checker : void 0
    }
  );
  if (comment?.getTag("@import") || comment?.getTag("@license")) {
    return;
  }
  if (moduleComment && comment) {
    if (!comment.hasModifier("@packageDocumentation") && !comment.getTag("@module")) {
      return;
    }
  }
  if (!moduleComment && comment) {
    if (comment.hasModifier("@packageDocumentation") || comment.getTag("@module")) {
      return;
    }
  }
  return comment;
}
function getComment(symbol, kind, context) {
  const declarations = symbol.declarations || [];
  if (declarations.length && declarations.every((d) => jsDocCommentKinds.includes(d.kind))) {
    return getJsDocComment(
      declarations[0],
      context
    );
  }
  const sf = declarations.find(ts5.isSourceFile);
  if (sf) {
    return getFileComment(sf, context);
  }
  const isModule = declarations.some((decl) => {
    if (ts5.isModuleDeclaration(decl) && ts5.isStringLiteral(decl.name)) {
      return true;
    }
    return false;
  });
  const comment = getCommentImpl(
    discoverComment(
      symbol,
      kind,
      context.logger,
      context.config.commentStyle,
      context.checker,
      !context.config.suppressCommentWarningsInDeclarationFiles
    ),
    isModule,
    context
  );
  if (!comment && kind === ReflectionKind2.Property) {
    return getConstructorParamPropertyComment(
      symbol,
      context
    );
  }
  return comment;
}
function getNodeComment(node, moduleComment, context) {
  return getCommentImpl(
    discoverNodeComment(node, context.config.commentStyle),
    moduleComment,
    context
  );
}
function getFileComment(file, context) {
  const quietContext = {
    ...context,
    logger: new Logger()
  };
  for (const commentSource of discoverFileComments(
    file,
    context.config.commentStyle
  )) {
    const comment = getCommentIgnoringCacheNoDiscoveryId(
      commentSource,
      quietContext
    );
    if (comment?.getTag("@license") || comment?.getTag("@import")) {
      continue;
    }
    if (comment?.getTag("@module") || comment?.hasModifier("@packageDocumentation")) {
      return getCommentWithCache(commentSource, context);
    }
    return;
  }
}
function getConstructorParamPropertyComment(symbol, context) {
  const decl = symbol.declarations?.find(ts5.isParameter);
  if (!decl) return;
  const ctor = decl.parent;
  const comment = getSignatureComment(ctor, context);
  const paramTag = comment?.getIdentifiedTag(symbol.name, "@param");
  if (paramTag) {
    const result = new Comment2(paramTag.content);
    result.sourcePath = comment.sourcePath;
    return result;
  }
}
function getSignatureComment(declaration, context) {
  return getCommentImpl(
    discoverSignatureComment(declaration, context.checker, context.config.commentStyle),
    false,
    context
  );
}
function buildJsDocCommentFromParts(declaration, parts, sourceComment, context) {
  if (!parts) {
    return void 0;
  }
  const comment = new Comment2(Comment2.cloneDisplayParts(parts));
  comment.sourcePath = sourceComment.sourcePath;
  for (let i = 0; i < comment.summary.length; ) {
    const part = comment.summary[i];
    if (part.kind === "inline-tag" && !part.text.trim() && context.config.modifierTags.has(part.tag)) {
      comment.modifierTags.add(part.tag);
      comment.summary.splice(i, 1);
    } else if (part.kind === "inline-tag" && part.text.trim() && context.config.modifierTags.has(part.tag) && !context.config.inlineTags.has(part.tag)) {
      context.logger.warn(
        i18n4.inline_tag_0_not_parsed_as_modifier_tag_1(part.tag, part.text.trim()),
        declaration
      );
      ++i;
    } else {
      ++i;
    }
  }
  return comment;
}
function getJsDocComment(declaration, context) {
  const file = declaration.getSourceFile();
  let parent = declaration.parent;
  while (!ts5.isJSDoc(parent)) {
    parent = parent.parent;
  }
  const contextWithInline = {
    ...context,
    config: {
      ...context.config,
      inlineTags: setUnion(context.config.inlineTags, context.config.modifierTags)
    }
  };
  const comment = getCommentWithCache(
    {
      file,
      ranges: [
        {
          kind: ts5.SyntaxKind.MultiLineCommentTrivia,
          pos: parent.pos,
          end: parent.end
        }
      ],
      jsDoc: parent,
      inheritedFromParentDeclaration: false
    },
    contextWithInline
  );
  if (ts5.isJSDocEnumTag(declaration)) {
    return buildJsDocCommentFromParts(declaration, comment.getTag("@enum")?.content, comment, context);
  }
  if (ts5.isJSDocTemplateTag(declaration) && declaration.comment && declaration.typeParameters.length > 1) {
    context.logger.warn(
      i18n4.multiple_type_parameters_on_template_tag_unsupported(),
      declaration
    );
    return;
  }
  let name;
  if (ts5.isJSDocTemplateTag(declaration)) {
    name = declaration.typeParameters[0].name.text;
  } else {
    name = declaration.name?.getText();
  }
  if (!name) {
    return;
  }
  const tag = comment.getIdentifiedTag(name, `@${declaration.tagName.text}`);
  if (!tag) {
    if (!ts5.isJSDocTemplateTag(declaration)) {
      context.logger.error(
        i18n4.failed_to_find_jsdoc_tag_for_name_0(name),
        declaration
      );
    }
  } else {
    return buildJsDocCommentFromParts(declaration, tag.content, comment, context);
  }
}

// src/lib/converter/context.ts
import { getHumanName, getQualifiedName as getQualifiedName2 } from "#node-utils";
import { findPackageForPath as findPackageForPath2, normalizePath as normalizePath2 } from "#node-utils";

// src/lib/converter/factories/symbol-id.ts
import { ReflectionSymbolId } from "#models";
import { findPackageForPath, getQualifiedName, normalizePath, resolveDeclarationMaps } from "#node-utils";
import "#utils";
import { relative } from "node:path";
import ts6 from "typescript";
var transientCount = 0;
var transientIds = /* @__PURE__ */ new WeakMap();
var symbolIdCache = /* @__PURE__ */ new WeakMap();
function createSymbolIdImpl(symbol, declaration) {
  const shouldCache = declaration === void 0;
  if (shouldCache) {
    const cached = symbolIdCache.get(symbol);
    if (cached) {
      return cached;
    }
  }
  declaration ??= symbol.declarations?.[0];
  const tsSource = declaration?.getSourceFile().fileName ?? "";
  const sourceFileName = resolveDeclarationMaps(tsSource);
  let packageName;
  let packagePath;
  const packageInfo = findPackageForPath(tsSource);
  if (packageInfo) {
    let packageDir;
    [packageName, packageDir] = packageInfo;
    packagePath = normalizePath(relative(packageDir, sourceFileName));
  } else {
    packageName = ReflectionSymbolId.UNKNOWN_PACKAGE;
    packagePath = normalizePath(sourceFileName);
  }
  let qualifiedName;
  if (symbol.declarations?.some(ts6.isSourceFile)) {
    qualifiedName = "";
  } else {
    qualifiedName = getQualifiedName(symbol, symbol.name);
  }
  const pos = declaration?.getStart() ?? Infinity;
  let transientId = NaN;
  if (symbol.flags & ts6.SymbolFlags.Transient && declaration?.kind !== ts6.SyntaxKind.SourceFile) {
    transientId = transientIds.get(symbol) ?? ++transientCount;
    transientIds.set(symbol, transientId);
  }
  const id = new ReflectionSymbolId(
    {
      packageName,
      packagePath,
      qualifiedName
    },
    pos,
    transientId,
    normalizePath(sourceFileName)
  );
  if (shouldCache) {
    symbolIdCache.set(symbol, id);
  }
  return id;
}

// src/lib/converter/context.ts
import { removeIf as removeIf2 } from "#utils";
var Context = class _Context {
  /**
   * The converter instance that has created the context.
   */
  converter;
  /**
   * The TypeChecker instance returned by the TypeScript compiler.
   */
  get checker() {
    return this.program.getTypeChecker();
  }
  /**
   * The program currently being converted.
   * Accessing this property will throw if a source file is not currently being converted.
   */
  get program() {
    assert2(
      this._program,
      "Tried to access Context.program when not converting a source file"
    );
    return this._program;
  }
  _program;
  /**
   * All programs being converted.
   */
  programs;
  /**
   * The project that is currently processed.
   */
  project;
  /**
   * The scope or parent reflection that is currently processed.
   */
  scope;
  convertingTypeNode = false;
  // Inherited by withScope
  convertingClassOrInterface = false;
  // Not inherited
  shouldBeStatic = false;
  // Not inherited
  inlineType = /* @__PURE__ */ new Set();
  // Inherited by withScope
  preventInline = /* @__PURE__ */ new Set();
  // Inherited by withScope
  reflectionIdToSymbolMap = /* @__PURE__ */ new Map();
  /**
   * Create a new Context instance.
   *
   * @param converter  The converter instance that has created the context.
   * @internal
   */
  constructor(converter, programs, project, scope = project) {
    this.converter = converter;
    this.programs = programs;
    this.project = project;
    this.scope = scope;
  }
  /** @internal */
  get logger() {
    return this.converter.application.logger;
  }
  /**
   * Return the type declaration of the given node.
   *
   * @param node  The TypeScript node whose type should be resolved.
   * @returns The type declaration of the given node.
   */
  getTypeAtLocation(node) {
    let nodeType;
    try {
      nodeType = this.checker.getTypeAtLocation(node);
    } catch {
    }
    if (!nodeType) {
      if (node.symbol) {
        nodeType = this.checker.getDeclaredTypeOfSymbol(node.symbol);
      } else if (node.parent?.symbol) {
        nodeType = this.checker.getDeclaredTypeOfSymbol(
          node.parent.symbol
        );
      } else if (node.parent?.parent?.symbol) {
        nodeType = this.checker.getDeclaredTypeOfSymbol(
          node.parent.parent.symbol
        );
      }
    }
    return nodeType;
  }
  getSymbolAtLocation(node) {
    let symbol = this.checker.getSymbolAtLocation(node);
    if (!symbol && isNamedNode(node)) {
      symbol = this.checker.getSymbolAtLocation(node.name);
    }
    return symbol;
  }
  expectSymbolAtLocation(node) {
    const symbol = this.getSymbolAtLocation(node);
    if (!symbol) {
      const { line: line2 } = ts7.getLineAndCharacterOfPosition(
        node.getSourceFile(),
        node.pos
      );
      throw new Error(
        `Expected a symbol for node with kind ${ts7.SyntaxKind[node.kind]} at ${node.getSourceFile().fileName}:${line2 + 1}`
      );
    }
    return symbol;
  }
  resolveAliasedSymbol(symbol) {
    return resolveAliasedSymbol(symbol, this.checker);
  }
  createDeclarationReflection(kind, symbol, exportSymbol, nameOverride) {
    const name = getHumanName(
      nameOverride ?? exportSymbol?.name ?? symbol?.name ?? "unknown"
    );
    if (this.convertingClassOrInterface) {
      if (kind === ReflectionKind3.Function) {
        kind = ReflectionKind3.Method;
      }
      if (kind === ReflectionKind3.Variable) {
        kind = ReflectionKind3.Property;
      }
    }
    const reflection = new DeclarationReflection(name, kind, this.scope);
    this.postReflectionCreation(reflection, symbol, exportSymbol);
    return reflection;
  }
  postReflectionCreation(reflection, symbol, exportSymbol) {
    if (!reflection.comment && exportSymbol && reflection.kind & (ReflectionKind3.SomeModule | ReflectionKind3.Reference)) {
      reflection.comment = this.getComment(exportSymbol, reflection.kind);
    }
    if (symbol && !reflection.comment) {
      reflection.comment = this.getComment(symbol, reflection.kind);
    }
    if (exportSymbol && !reflection.comment) {
      reflection.comment = this.getComment(exportSymbol, ReflectionKind3.Reference);
    }
    if (this.shouldBeStatic) {
      reflection.setFlag(ReflectionFlag.Static);
    }
    if (reflection instanceof DeclarationReflection) {
      reflection.escapedName = symbol?.escapedName ? String(symbol.escapedName) : void 0;
      this.addChild(reflection);
    }
    if (symbol && this.converter.isExternal(symbol, this.checker)) {
      reflection.setFlag(ReflectionFlag.External);
    }
    if (exportSymbol) {
      this.registerReflection(reflection, exportSymbol, void 0);
    }
    const path3 = reflection.kindOf(
      ReflectionKind3.Namespace | ReflectionKind3.Module
    ) ? symbol?.declarations?.find(ts7.isSourceFile)?.fileName : void 0;
    if (path3) {
      this.registerReflection(reflection, symbol, normalizePath2(path3));
    } else {
      this.registerReflection(reflection, symbol, void 0);
    }
  }
  finalizeDeclarationReflection(reflection) {
    this.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      this,
      reflection
    );
    if (reflection.kindOf(ReflectionKind3.MayContainDocuments)) {
      this.converter.processDocumentTags(reflection, reflection);
    }
  }
  /**
   * Create a {@link ReferenceType} which points to the provided symbol.
   *
   * @privateRemarks
   * This is available on Context so that it can be monkey-patched by typedoc-plugin-missing-exports
   */
  createSymbolReference(symbol, context, name) {
    const ref = ReferenceType.createUnresolvedReference(
      name ?? symbol.name,
      this.createSymbolId(symbol),
      context.project,
      getQualifiedName2(symbol, name ?? symbol.name)
    );
    ref.refersToTypeParameter = !!(symbol.flags & ts7.SymbolFlags.TypeParameter);
    const symbolPath = symbol.declarations?.[0]?.getSourceFile().fileName;
    if (!symbolPath) return ref;
    ref.package = findPackageForPath2(symbolPath)?.[0];
    return ref;
  }
  /**
   * Create a stable {@link ReflectionSymbolId} for the provided symbol,
   * optionally targeting a specific declaration.
   *
   * @privateRemarks
   * This is available on Context so that it can be monkey-patched by typedoc-plugin-missing-exports
   * It might also turn out to be generally useful for other plugin users.
   */
  createSymbolId(symbol, declaration) {
    return createSymbolIdImpl(symbol, declaration);
  }
  addChild(reflection) {
    if (this.scope instanceof ContainerReflection) {
      this.scope.addChild(reflection);
    }
  }
  shouldIgnore(symbol) {
    return this.converter.shouldIgnore(symbol, this.checker);
  }
  /**
   * Register a newly generated reflection. All created reflections should be
   * passed to this method to ensure that the project helper functions work correctly.
   *
   * @param reflection  The reflection that should be registered.
   * @param symbol  The symbol the given reflection was resolved from.
   */
  registerReflection(reflection, symbol, filePath) {
    if (symbol) {
      this.reflectionIdToSymbolMap.set(reflection.id, symbol);
      const id = this.createSymbolId(symbol);
      if (reflection.parent?.kindOf(ReflectionKind3.ClassOrInterface) && reflection.kindOf(ReflectionKind3.SomeMember)) {
        const saved = this.project["symbolToReflectionIdMap"].get(id);
        const parentSymbolReflection = symbol.parent && this.getReflectionFromSymbol(symbol.parent);
        if (typeof saved === "object" && saved.length > 1 && parentSymbolReflection) {
          removeIf2(
            saved,
            (item) => this.project.getReflectionById(item)?.parent !== parentSymbolReflection
          );
        }
      }
      this.project.registerReflection(reflection, id, filePath);
    } else {
      this.project.registerReflection(reflection, void 0, filePath);
    }
  }
  getReflectionFromSymbol(symbol) {
    return this.project.getReflectionFromSymbolId(this.createSymbolId(symbol));
  }
  getSymbolFromReflection(reflection) {
    return this.reflectionIdToSymbolMap.get(reflection.id);
  }
  /** @internal */
  setActiveProgram(program) {
    this._program = program;
  }
  createCommentContext() {
    return {
      config: this.converter.config,
      logger: this.logger,
      checker: this.checker,
      files: this.project.files,
      createSymbolId: (s, d) => this.createSymbolId(s, d)
    };
  }
  getComment(symbol, kind) {
    return getComment(
      symbol,
      kind,
      this.createCommentContext()
    );
  }
  getNodeComment(node, moduleComment) {
    return getNodeComment(
      node,
      moduleComment,
      this.createCommentContext()
    );
  }
  getFileComment(node) {
    return getFileComment(
      node,
      this.createCommentContext()
    );
  }
  getJsDocComment(declaration) {
    return getJsDocComment(
      declaration,
      this.createCommentContext()
    );
  }
  getSignatureComment(declaration) {
    return getSignatureComment(
      declaration,
      this.createCommentContext()
    );
  }
  shouldInline(symbol, name) {
    if (this.preventInline.has(name)) return false;
    if (this.inlineType.has(name)) return true;
    return this.getComment(symbol, ReflectionKind3.Interface)?.hasModifier("@inline") ?? false;
  }
  withScope(scope) {
    assert2(scope.parent === this.scope || scope === this.scope, "Incorrect context used for withScope");
    const context = new _Context(
      this.converter,
      this.programs,
      this.project,
      scope
    );
    context.convertingTypeNode = this.convertingTypeNode;
    context.setActiveProgram(this._program);
    context.reflectionIdToSymbolMap = this.reflectionIdToSymbolMap;
    context.preventInline = new Set(this.preventInline);
    context.inlineType = new Set(this.inlineType);
    for (const tag of scope.comment?.blockTags || []) {
      if (tag.tag === "@preventInline") {
        context.preventInline.add(Comment3.combineDisplayParts(tag.content));
      } else if (tag.tag === "@inlineType") {
        context.inlineType.add(Comment3.combineDisplayParts(tag.content));
      }
    }
    return context;
  }
};

// src/lib/converter/convert-expression.ts
import ts8 from "typescript";
function convertDefaultValue(node) {
  const anyNode = node;
  if (anyNode?.initializer) {
    return convertExpression(anyNode.initializer);
  } else {
    return void 0;
  }
}
function convertExpression(expression) {
  switch (expression.kind) {
    case ts8.SyntaxKind.StringLiteral:
    case ts8.SyntaxKind.TrueKeyword:
    case ts8.SyntaxKind.FalseKeyword:
    case ts8.SyntaxKind.NullKeyword:
    case ts8.SyntaxKind.NumericLiteral:
    case ts8.SyntaxKind.BigIntLiteral:
    case ts8.SyntaxKind.Identifier:
      return expression.getText();
  }
  if (ts8.isPrefixUnaryExpression(expression)) {
    const inner = convertExpression(expression.operand);
    if (inner != "...") {
      return expression.getText();
    }
  }
  if (ts8.isArrayLiteralExpression(expression) && expression.elements.length === 0) {
    return "[]";
  }
  if (ts8.isObjectLiteralExpression(expression) && expression.properties.length === 0) {
    return "{}";
  }
  if (ts8.isPropertyAccessExpression(expression)) {
    const parts = [expression.name.getText()];
    let iter = expression.expression;
    while (ts8.isPropertyAccessExpression(iter)) {
      parts.unshift(iter.name.getText());
      iter = iter.expression;
    }
    if (ts8.isIdentifier(iter)) {
      parts.unshift(iter.text);
      return parts.join(".");
    }
  }
  return "...";
}

// src/lib/converter/converter.ts
import { ok as ok6 } from "assert";
import ts16 from "typescript";
import {
  Comment as Comment9,
  DocumentReflection,
  ProjectReflection,
  Reflection as Reflection2,
  ReflectionKind as ReflectionKind19
} from "#models";
import {
  AbstractComponent as AbstractComponent2,
  getDocumentEntryPoints,
  MinimatchSet,
  nicePath as nicePath4,
  normalizePath as normalizePath6,
  Option as Option8,
  readFile as readFile3
} from "#node-utils";
import {
  hasAllFlags as hasAllFlags2,
  hasAnyFlag as hasAnyFlag2,
  i18n as i18n14,
  meaningToString,
  MinimalSourceFile as MinimalSourceFile3,
  NormalizedPathUtils as NormalizedPathUtils2,
  partition as partition3,
  unique as unique2
} from "#utils";
import { basename, dirname as dirname2, resolve as resolve2 } from "path";

// src/lib/converter/comments/linkResolver.ts
import ts9 from "typescript";
import {
  makeRecursiveVisitor,
  Reflection,
  ReflectionKind as ReflectionKind5,
  ReflectionSymbolId as ReflectionSymbolId2
} from "#models";

// src/lib/converter/comments/declarationReferenceResolver.ts
import { ok as ok3 } from "assert";
import {
  ContainerReflection as ContainerReflection2,
  DeclarationReflection as DeclarationReflection2,
  ReferenceReflection,
  ReflectionKind as ReflectionKind4
} from "#models";
import { assertNever as assertNever4, filterMap } from "#utils";
function resolveReferenceReflection(ref) {
  if (ref instanceof ReferenceReflection) {
    return ref.getTargetReflectionDeep();
  }
  return ref;
}
function resolveDeclarationReference(reflection, ref) {
  let high = [];
  let low = [];
  if (ref.moduleSource) {
    high = reflection.project.children?.filter(
      (c) => c.kindOf(ReflectionKind4.SomeModule) && c.name === ref.moduleSource
    ) || [];
    if (!high.length && reflection.project.packageName === ref.moduleSource) {
      high.push(reflection.project);
    }
  } else if (ref.resolutionStart === "global") {
    high.push(reflection.project);
    if (reflection.project.children?.length === 1) {
      high.push(reflection.project.children[0]);
    }
  } else {
    ok3(
      ref.resolutionStart.startsWith("local") && ref.resolutionStart.length === 5
    );
    let refl = reflection;
    if (refl.kindOf(ReflectionKind4.ExportContainer)) {
      high.push(refl);
    }
    while (refl.parent) {
      refl = refl.parent;
      if (refl.kindOf(ReflectionKind4.ExportContainer)) {
        high.push(refl);
      } else {
        low.push(refl);
      }
      if (refl.kindOf(ReflectionKind4.Project) && refl.children?.length === 1) {
        high.push(refl.children[0]);
      }
    }
    if (reflection.kindOf(ReflectionKind4.SomeMember)) {
      high.push(reflection.parent);
    } else if (reflection.kindOf(ReflectionKind4.SomeSignature) && reflection.parent.kindOf(ReflectionKind4.SomeMember)) {
      high.push(reflection.parent.parent);
    } else if (high[0] !== reflection) {
      if (reflection.parent instanceof ContainerReflection2) {
        high.push(
          ...reflection.parent.childrenIncludingDocuments?.filter(
            (c) => c.name === reflection.name
          ) || []
        );
      } else {
        high.push(reflection);
      }
    }
  }
  if (ref.symbolReference) {
    for (const part of ref.symbolReference.path || []) {
      const high2 = high;
      high = [];
      const low2 = low;
      low = [];
      for (const refl of high2) {
        const resolved = resolveSymbolReferencePart(refl, part);
        high.push(...resolved.high.map(resolveReferenceReflection));
        low.push(...resolved.low.map(resolveReferenceReflection));
      }
      for (const refl of low2) {
        const resolved = resolveSymbolReferencePart(refl, part);
        low.push(...resolved.high.map(resolveReferenceReflection));
        low.push(...resolved.low.map(resolveReferenceReflection));
      }
    }
    if (ref.symbolReference.meaning) {
      high = filterMapByMeaning(high, ref.symbolReference.meaning);
      low = filterMapByMeaning(low, ref.symbolReference.meaning);
    }
  }
  return high[0] || low[0];
}
function filterMapByMeaning(reflections, meaning) {
  return filterMap(reflections, (refl) => {
    const kwResolved = resolveKeyword(refl, meaning.keyword) || [];
    if (meaning.label) {
      return kwResolved.find((r) => r.comment?.label === meaning.label);
    }
    return kwResolved[meaning.index || 0];
  });
}
function resolveKeyword(refl, kw) {
  switch (kw) {
    case void 0:
      return refl instanceof DeclarationReflection2 && refl.signatures ? refl.signatures : [refl];
    case "class":
      if (refl.kindOf(ReflectionKind4.Class)) return [refl];
      break;
    case "interface":
      if (refl.kindOf(ReflectionKind4.Interface)) return [refl];
      break;
    case "type":
      if (refl.kindOf(ReflectionKind4.SomeType)) return [refl];
      break;
    case "enum":
      if (refl.kindOf(ReflectionKind4.Enum)) return [refl];
      break;
    case "namespace":
      if (refl.kindOf(ReflectionKind4.SomeModule)) return [refl];
      break;
    case "function":
      if (refl.kindOf(ReflectionKind4.FunctionOrMethod)) {
        return refl.signatures;
      }
      break;
    case "var":
      if (refl.kindOf(ReflectionKind4.Variable)) return [refl];
      break;
    case "new":
    case "constructor":
      if (refl.kindOf(
        ReflectionKind4.ClassOrInterface | ReflectionKind4.TypeLiteral
      )) {
        const ctor = refl.children?.find((c) => c.kindOf(ReflectionKind4.Constructor));
        return ctor.signatures;
      }
      break;
    case "member":
      if (refl.kindOf(ReflectionKind4.SomeMember)) return [refl];
      break;
    case "event":
      break;
    case "call":
      return refl.signatures;
    case "index":
      if (refl.indexSignatures) {
        return refl.indexSignatures;
      }
      break;
    case "complex":
      if (refl.kindOf(ReflectionKind4.SomeType)) return [refl];
      break;
    case "getter":
      if (refl.getSignature) {
        return [refl.getSignature];
      }
      break;
    case "setter":
      if (refl.setSignature) {
        return [refl.setSignature];
      }
      break;
    default:
      assertNever4(kw);
  }
}
function resolveSymbolReferencePart(refl, path3) {
  let high = [];
  let low = [];
  let children;
  if (refl instanceof ContainerReflection2) {
    children = refl.childrenIncludingDocuments;
  }
  if (!children && refl.isDeclaration() && refl.type?.type === "reflection") {
    children = refl.type.declaration.childrenIncludingDocuments;
  }
  if (!children) {
    return { high, low };
  }
  switch (path3.navigation) {
    // Grammar says resolve via "exports"... as always, reality is more complicated.
    // Check exports first, but also allow this as a general purpose "some child" operator
    // so that resolution doesn't behave very poorly with projects using JSDoc style resolution.
    // Also is more consistent with how TypeScript resolves link tags.
    case ".":
      high = children.filter(
        (r) => r.name === path3.path && (r.kindOf(ReflectionKind4.SomeExport) || r.flags.isStatic)
      );
      low = children.filter(
        (r) => r.name === path3.path && (!r.kindOf(ReflectionKind4.SomeExport) || !r.flags.isStatic)
      );
      break;
    // Resolve via "members", interface children, class instance properties/accessors/methods,
    // enum members, type literal properties
    case "#":
      high = children?.filter((r) => {
        return r.name === path3.path && r.kindOf(ReflectionKind4.SomeMember) && !r.flags.isStatic;
      }) || [];
      break;
    // Resolve via "locals"... treat this as a stricter `.` which only supports traversing
    // module/namespace exports since TypeDoc doesn't support documenting locals.
    case "~":
      if (refl.kindOf(ReflectionKind4.SomeModule | ReflectionKind4.Project)) {
        high = children?.filter((r) => r.name === path3.path) || [];
      }
      break;
  }
  return { high, low };
}

// src/lib/converter/comments/linkResolver.ts
import { maxElementByScore, parseDeclarationReference } from "#utils";
var urlPrefix = /^(http|ftp)s?:\/\//;
function resolveLinks(reflection, externalResolver, options) {
  if (reflection.comment) {
    reflection.comment.summary = resolvePartLinks(
      reflection,
      reflection.comment.summary,
      externalResolver,
      options
    );
    for (const tag of reflection.comment.blockTags) {
      tag.content = resolvePartLinks(
        reflection,
        tag.content,
        externalResolver,
        options
      );
    }
  }
  if ((reflection.isDeclaration() || reflection.isProject()) && reflection.readme) {
    reflection.readme = resolvePartLinks(
      reflection,
      reflection.readme,
      externalResolver,
      options
    );
  }
  if (reflection.isDeclaration()) {
    reflection.type?.visit(
      makeRecursiveVisitor({
        union: (type2) => {
          type2.elementSummaries = type2.elementSummaries?.map(
            (parts) => resolvePartLinks(reflection, parts, externalResolver, options)
          );
        }
      })
    );
  }
  if (reflection.isDocument()) {
    reflection.content = resolvePartLinks(
      reflection,
      reflection.content,
      externalResolver,
      options
    );
  }
  if (reflection.isParameter() && reflection.type?.type === "reference" && reflection.type.highlightedProperties) {
    const resolved = new Map(
      Array.from(
        reflection.type.highlightedProperties,
        ([name, parts]) => {
          return [
            name,
            resolvePartLinks(reflection, parts, externalResolver, options)
          ];
        }
      )
    );
    reflection.type.highlightedProperties = resolved;
  }
  if (reflection.isContainer()) {
    if (reflection.groups) {
      for (const group2 of reflection.groups) {
        if (group2.description) {
          group2.description = resolvePartLinks(
            reflection,
            group2.description,
            externalResolver,
            options
          );
        }
        if (group2.categories) {
          for (const cat of group2.categories) {
            if (cat.description) {
              cat.description = resolvePartLinks(reflection, cat.description, externalResolver, options);
            }
          }
        }
      }
    }
    if (reflection.categories) {
      for (const cat of reflection.categories) {
        if (cat.description) {
          cat.description = resolvePartLinks(reflection, cat.description, externalResolver, options);
        }
      }
    }
  }
}
function resolvePartLinks(reflection, parts, externalResolver, options) {
  return parts.flatMap((part) => processPart(reflection, part, externalResolver, options));
}
function processPart(reflection, part, externalResolver, options) {
  if (part.kind === "inline-tag") {
    if (part.tag === "@link" || part.tag === "@linkcode" || part.tag === "@linkplain") {
      return resolveLinkTag(reflection, part, externalResolver, options);
    }
  }
  return part;
}
function resolveLinkTag(reflection, part, externalResolver, options) {
  if (typeof part.target === "string" || part.target instanceof Reflection) {
    return part;
  }
  let defaultDisplayText = "";
  let pos = 0;
  const end = part.text.length;
  while (pos < end && ts9.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
    pos++;
  }
  let target;
  const declRef = parseDeclarationReference(part.text, pos, end);
  if (part.target instanceof ReflectionSymbolId2) {
    const tsTargets = reflection.project.getReflectionsFromSymbolId(
      part.target
    );
    if (tsTargets.length) {
      target = maxElementByScore(tsTargets, (r) => {
        if (r.kindOf(ReflectionKind5.SomeExport)) {
          return 4;
        }
        if (r.kindOf(ReflectionKind5.SomeMember) && r.parent?.kindOf(ReflectionKind5.SomeExport)) {
          return 3;
        }
        if (r.kindOf(ReflectionKind5.SomeMember) && r.parent?.kindOf(ReflectionKind5.TypeLiteral) && r.parent.parent?.kindOf(
          ReflectionKind5.TypeAlias | ReflectionKind5.Variable
        )) {
          return 2;
        }
        return 1;
      });
      pos = end;
      defaultDisplayText = part.tsLinkText || (options.preserveLinkText ? part.text : target.name);
    } else {
      if (declRef) {
        pos = declRef[1];
      }
      const externalResolveResult = externalResolver(
        declRef?.[0] ?? part.target.toDeclarationReference(),
        reflection,
        part,
        part.target
      );
      defaultDisplayText = part.tsLinkText || (options.preserveLinkText ? part.text : part.text.substring(0, pos));
      switch (typeof externalResolveResult) {
        case "string":
          target = externalResolveResult;
          break;
        case "object":
          target = externalResolveResult.target;
          defaultDisplayText = externalResolveResult.caption || defaultDisplayText;
      }
    }
  }
  if (!target && declRef) {
    target = resolveDeclarationReference(reflection, declRef[0]);
    pos = declRef[1];
    if (target) {
      defaultDisplayText = options.preserveLinkText ? part.text : target.name;
    } else {
      const externalResolveResult = externalResolver(
        declRef[0],
        reflection,
        part,
        part.target instanceof ReflectionSymbolId2 ? part.target : void 0
      );
      defaultDisplayText = options.preserveLinkText ? part.text : part.text.substring(0, pos);
      switch (typeof externalResolveResult) {
        case "string":
          target = externalResolveResult;
          break;
        case "object":
          target = externalResolveResult.target;
          defaultDisplayText = externalResolveResult.caption || defaultDisplayText;
      }
    }
  }
  if (!target && urlPrefix.test(part.text)) {
    const wsIndex = part.text.search(/\s/);
    target = wsIndex === -1 ? part.text : part.text.substring(0, wsIndex);
    pos = target.length;
    defaultDisplayText = target;
  }
  while (pos < end && ts9.isWhiteSpaceLike(part.text.charCodeAt(pos))) {
    pos++;
  }
  if (pos < end && part.text[pos] === "|") {
    pos++;
  }
  if (!target) {
    return part;
  }
  part.target = target;
  part.text = part.text.substring(pos).trim() || defaultDisplayText || part.text;
  return part;
}

// src/lib/converter/comments/rawLexer.ts
function* lexCommentString(file) {
  let textToken;
  for (const token of lexCommentString2(file)) {
    if (token.kind === "text" /* Text */ || token.kind === "new_line" /* NewLine */) {
      if (textToken) {
        textToken.text += token.text;
      } else {
        token.kind = "text" /* Text */;
        textToken = token;
      }
    } else {
      if (textToken) {
        yield textToken;
        textToken = void 0;
      }
      yield token;
    }
  }
  if (textToken) {
    yield textToken;
  }
  return;
}
function* lexCommentString2(file) {
  let pos = 0;
  let end = file.length;
  while (pos < end && /\s/.test(file[pos])) {
    pos++;
  }
  while (pos < end && /\s/.test(file[end - 1])) {
    end--;
  }
  let expectingTag = false;
  for (; ; ) {
    if (pos >= end) {
      return;
    }
    switch (file[pos]) {
      case "\n":
        yield makeToken("new_line" /* NewLine */, 1);
        expectingTag = false;
        break;
      case "{":
        yield makeToken("open_brace" /* OpenBrace */, 1);
        expectingTag = true;
        break;
      case "}":
        yield makeToken("close_brace" /* CloseBrace */, 1);
        expectingTag = false;
        break;
      case "`": {
        let tickCount = 1;
        let lookahead = pos - 1;
        let atNewline = true;
        while (lookahead > 0 && file[lookahead] !== "\n") {
          if (/\S/.test(file[lookahead])) {
            atNewline = false;
            break;
          }
          --lookahead;
        }
        lookahead = pos;
        while (lookahead + 1 < end && file[lookahead + 1] === "`") {
          tickCount++;
          lookahead++;
        }
        const isCodeBlock = atNewline && tickCount >= 3;
        let lookaheadStart = pos;
        const codeText = [];
        lookahead++;
        while (lookahead < end) {
          if (lookaheadExactlyNTicks(lookahead, tickCount)) {
            lookahead += tickCount;
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            const codeTextStr = codeText.join("");
            if (isCodeBlock || !/\n\s*\n/.test(codeTextStr)) {
              yield {
                kind: "code" /* Code */,
                text: codeTextStr,
                pos
              };
              expectingTag = false;
              pos = lookahead;
            } else {
              yield makeToken("text" /* Text */, tickCount);
              expectingTag = false;
            }
            break;
          } else if (file[lookahead] === "`") {
            while (lookahead < end && file[lookahead] === "`") {
              lookahead++;
            }
          } else if (file[lookahead] === "\\" && lookahead + 1 < end && file[lookahead + 1] !== "\n") {
            lookahead += 2;
          } else if (file[lookahead] === "\n") {
            lookahead++;
            codeText.push(
              file.substring(lookaheadStart, lookahead)
            );
            lookaheadStart = lookahead;
          } else {
            lookahead++;
          }
        }
        if (lookahead >= end && pos !== lookahead) {
          if (isCodeBlock && file.substring(pos, end).includes("\n")) {
            codeText.push(file.substring(lookaheadStart, end));
            yield {
              kind: "code" /* Code */,
              text: codeText.join(""),
              pos
            };
            expectingTag = false;
            pos = lookahead;
          } else {
            yield makeToken("text" /* Text */, tickCount);
            expectingTag = false;
          }
        }
        break;
      }
      case "@": {
        let lookahead = pos + 1;
        while (lookahead < end && /[a-z]/i.test(file[lookahead])) {
          lookahead++;
        }
        if (lookahead !== pos + 1) {
          while (lookahead < end && /[a-z0-9-]/i.test(file[lookahead])) {
            lookahead++;
          }
        }
        if (expectingTag && lookahead !== pos + 1 && (lookahead === end || /[\s}]/.test(file[lookahead]))) {
          yield makeToken("tag" /* Tag */, lookahead - pos);
          break;
        }
      }
      // fall through if we didn't find something that looks like a tag
      default: {
        const textParts = [];
        let lookaheadStart = pos;
        let lookahead = pos;
        while (lookahead < end) {
          if ("{}\n`".includes(file[lookahead])) break;
          if (lookahead !== pos && file[lookahead] === "@" && /\s/.test(file[lookahead - 1])) {
            break;
          }
          if (file[lookahead] === "\\" && lookahead + 1 < end && "{}@`".includes(file[lookahead + 1])) {
            textParts.push(
              file.substring(lookaheadStart, lookahead),
              file[lookahead + 1]
            );
            lookahead++;
            lookaheadStart = lookahead + 1;
          }
          lookahead++;
        }
        textParts.push(file.substring(lookaheadStart, lookahead));
        if (textParts.some((part) => /\S/.test(part))) {
          expectingTag = false;
        }
        yield {
          kind: "text" /* Text */,
          text: textParts.join(""),
          pos
        };
        pos = lookahead;
        break;
      }
    }
  }
  function makeToken(kind, size) {
    const start = pos;
    pos += size;
    return {
      kind,
      text: file.substring(start, pos),
      pos: start
    };
  }
  function lookaheadExactlyNTicks(pos2, n) {
    if (pos2 + n > end) {
      return false;
    }
    return file.startsWith("`".repeat(n), pos2) && file[pos2 + n] !== "`";
  }
}

// src/lib/converter/symbols.ts
import assert5 from "assert";
import ts12 from "typescript";
import {
  DeclarationReflection as DeclarationReflection6,
  IntrinsicType as IntrinsicType4,
  LiteralType,
  ReferenceReflection as ReferenceReflection2,
  ReflectionFlag as ReflectionFlag4,
  ReflectionKind as ReflectionKind9
} from "#models";
import { getEnumFlags, hasAllFlags, hasAnyFlag, i18n as i18n6, removeFlag } from "#utils";

// src/lib/converter/factories/index-signature.ts
import assert3 from "assert";
import {
  DeclarationReflection as DeclarationReflection3,
  ParameterReflection,
  ReflectionFlag as ReflectionFlag2,
  ReflectionKind as ReflectionKind6,
  SignatureReflection,
  UnionType
} from "#models";
function convertIndexSignatures(context, type2) {
  assert3(context.scope instanceof DeclarationReflection3);
  const seenByDeclaration = /* @__PURE__ */ new Map();
  const createdSignatures = [];
  for (const indexInfo of context.checker.getIndexInfosOfType(type2)) {
    if (indexInfo.declaration && seenByDeclaration.has(indexInfo.declaration)) {
      const createdSig = seenByDeclaration.get(indexInfo.declaration);
      if (createdSig.parameters[0].type?.type !== "union") {
        createdSig.parameters[0].type = new UnionType([
          createdSig.parameters[0].type
        ]);
      }
      createdSig.parameters[0].type.types.push(
        context.converter.convertType(
          context.withScope(createdSig),
          indexInfo.keyType
        )
      );
      continue;
    }
    const index2 = new SignatureReflection(
      "__index",
      ReflectionKind6.IndexSignature,
      context.scope
    );
    const ic = context.withScope(index2);
    if (indexInfo.isReadonly) {
      index2.setFlag(ReflectionFlag2.Readonly);
    }
    createdSignatures.push([indexInfo.declaration, index2]);
    if (indexInfo.declaration) {
      seenByDeclaration.set(indexInfo.declaration, index2);
      index2.comment = context.getNodeComment(
        indexInfo.declaration,
        /* moduleComment */
        false
      );
    }
    index2.parameters = [
      new ParameterReflection(
        indexInfo.declaration?.parameters[0].name.getText() ?? "key",
        ReflectionKind6.Parameter,
        index2
      )
    ];
    index2.parameters[0].type = context.converter.convertType(
      ic.withScope(index2.parameters[0]),
      indexInfo.keyType
    );
    index2.type = context.converter.convertType(
      ic,
      indexInfo.type
    );
    context.registerReflection(index2, indexInfo.declaration?.symbol);
    context.scope.indexSignatures ||= [];
    context.scope.indexSignatures.push(index2);
  }
  for (const [declaration, index2] of createdSignatures) {
    context.converter.trigger(
      ConverterEvents.CREATE_SIGNATURE,
      context,
      index2,
      declaration
    );
  }
}

// src/lib/converter/factories/signature.ts
import ts10 from "typescript";
import assert4 from "assert";
import {
  DeclarationReflection as DeclarationReflection4,
  IntrinsicType as IntrinsicType2,
  ParameterReflection as ParameterReflection2,
  PredicateType,
  ReferenceType as ReferenceType2,
  ReflectionFlag as ReflectionFlag3,
  ReflectionKind as ReflectionKind7,
  SignatureReflection as SignatureReflection2,
  TypeParameterReflection,
  VarianceModifier
} from "#models";

// src/lib/converter/utilities/reflections.ts
import { IntrinsicType, UnionType as UnionType2 } from "#models";
function removeUndefined(type2) {
  if (type2 instanceof UnionType2) {
    const types = type2.types.filter((t) => {
      if (t instanceof IntrinsicType) {
        return t.name !== "undefined";
      }
      return true;
    });
    if (types.length === 1) {
      return types[0];
    }
    type2.types = types;
    return type2;
  }
  return type2;
}

// src/lib/converter/factories/signature.ts
function convertConstructSignatures(context, symbol) {
  const type2 = context.checker.getDeclaredTypeOfSymbol(symbol);
  const constructSignatures = context.checker.getSignaturesOfType(
    type2,
    ts10.SignatureKind.Construct
  );
  if (constructSignatures.length) {
    const constructMember = new DeclarationReflection4(
      "constructor",
      ReflectionKind7.Constructor,
      context.scope
    );
    context.postReflectionCreation(constructMember, symbol, void 0);
    context.finalizeDeclarationReflection(constructMember);
    const constructContext = context.withScope(constructMember);
    constructSignatures.forEach(
      (sig) => createSignature(
        constructContext,
        ReflectionKind7.ConstructorSignature,
        sig,
        symbol
      )
    );
  }
}
function createSignature(context, kind, signature, symbol, declaration) {
  assert4(context.scope instanceof DeclarationReflection4);
  declaration ||= signature.getDeclaration();
  const sigRef = new SignatureReflection2(
    kind == ReflectionKind7.ConstructorSignature ? context.scope.parent.name : context.scope.name,
    kind,
    context.scope
  );
  if (context.shouldBeStatic) {
    sigRef.setFlag(ReflectionFlag3.Static);
  }
  if (symbol && declaration) {
    context.project.registerSymbolId(
      sigRef,
      context.createSymbolId(symbol, declaration)
    );
  }
  let parentReflection = context.scope;
  if (parentReflection.kindOf(ReflectionKind7.TypeLiteral) && parentReflection.parent instanceof DeclarationReflection4) {
    parentReflection = parentReflection.parent;
  }
  if (declaration) {
    const sigComment = context.getSignatureComment(declaration);
    if (parentReflection.comment?.discoveryId !== sigComment?.discoveryId) {
      sigRef.comment = sigComment;
      if (parentReflection.kindOf(ReflectionKind7.MayContainDocuments)) {
        context.converter.processDocumentTags(sigRef, parentReflection);
      }
    }
  }
  const sigRefCtx = context.withScope(sigRef);
  sigRef.typeParameters = convertTypeParameters(
    sigRefCtx,
    sigRef,
    signature.typeParameters
  );
  const parameterSymbols = signature.thisParameter ? [signature.thisParameter, ...signature.parameters] : signature.parameters;
  sigRef.parameters = convertParameters(
    sigRefCtx,
    sigRef,
    parameterSymbols,
    declaration?.parameters
  );
  const predicate = context.checker.getTypePredicateOfSignature(signature);
  if (predicate) {
    sigRef.type = convertPredicate(predicate, sigRefCtx);
  } else if (kind == ReflectionKind7.SetSignature) {
    sigRef.type = new IntrinsicType2("void");
  } else if (declaration?.type?.kind === ts10.SyntaxKind.ThisType) {
    sigRef.type = new IntrinsicType2("this");
  } else {
    let typeNode = declaration?.type;
    if (typeNode && ts10.isJSDocReturnTag(typeNode)) {
      typeNode = typeNode.typeExpression?.type;
    }
    sigRef.type = context.converter.convertType(
      sigRefCtx,
      signature.getReturnType(),
      typeNode
    );
  }
  context.registerReflection(sigRef, void 0);
  switch (kind) {
    case ReflectionKind7.GetSignature:
      context.scope.getSignature = sigRef;
      break;
    case ReflectionKind7.SetSignature:
      context.scope.setSignature = sigRef;
      break;
    case ReflectionKind7.CallSignature:
    case ReflectionKind7.ConstructorSignature:
      context.scope.signatures ??= [];
      context.scope.signatures.push(sigRef);
      break;
  }
  context.converter.trigger(
    ConverterEvents.CREATE_SIGNATURE,
    context,
    sigRef,
    declaration,
    signature
  );
}
function createConstructSignatureWithType(context, signature, classType) {
  assert4(context.scope instanceof DeclarationReflection4);
  const declaration = signature.getDeclaration();
  const sigRef = new SignatureReflection2(
    context.scope.parent.name,
    ReflectionKind7.ConstructorSignature,
    context.scope
  );
  const sigRefCtx = context.withScope(sigRef);
  if (declaration) {
    sigRef.comment = context.getSignatureComment(declaration);
    if (sigRef.comment?.discoveryId === context.scope.parent?.comment?.discoveryId) {
      delete sigRef.comment;
    }
  }
  const parameterSymbols = signature.thisParameter ? [signature.thisParameter, ...signature.parameters] : [...signature.parameters];
  if (parameterSymbols[0]?.name === "this") {
    parameterSymbols.shift();
  }
  sigRef.parameters = convertParameters(
    sigRefCtx,
    sigRef,
    parameterSymbols,
    declaration?.parameters
  );
  sigRef.parameters = convertParameters(sigRefCtx, sigRef, parameterSymbols, void 0);
  sigRef.type = ReferenceType2.createResolvedReference(
    context.scope.parent.name,
    classType,
    context.project
  );
  context.registerReflection(sigRef, void 0);
  context.scope.signatures ??= [];
  context.scope.signatures.push(sigRef);
  context.converter.trigger(
    ConverterEvents.CREATE_SIGNATURE,
    context,
    sigRef,
    declaration,
    signature
  );
}
function convertParameters(context, sigRef, parameters, parameterNodes) {
  const parameterNodeOffset = parameterNodes?.length !== parameters.length ? -1 : 0;
  return parameters.map((param, i) => {
    const declaration = param.valueDeclaration;
    assert4(
      !declaration || ts10.isParameter(declaration) || ts10.isJSDocParameterTag(declaration)
    );
    const paramRefl = new ParameterReflection2(
      /^__\d+$/.test(param.name) ? "__namedParameters" : param.name,
      ReflectionKind7.Parameter,
      sigRef
    );
    if (declaration && ts10.isJSDocParameterTag(declaration)) {
      paramRefl.comment = context.getJsDocComment(declaration);
    }
    paramRefl.comment ||= context.getComment(param, paramRefl.kind);
    if (declaration && ts10.getCombinedModifierFlags(declaration) & (ts10.ModifierFlags.Public | ts10.ModifierFlags.Private | ts10.ModifierFlags.Protected | ts10.ModifierFlags.Readonly)) {
      paramRefl.comment?.removeModifier("@hidden");
      paramRefl.comment?.removeModifier("@ignore");
      paramRefl.comment?.removeModifier("@internal");
    }
    context.registerReflection(paramRefl, param);
    context.converter.trigger(
      ConverterEvents.CREATE_PARAMETER,
      context,
      paramRefl
    );
    let type2;
    let typeNode;
    if (declaration) {
      type2 = context.checker.getTypeOfSymbolAtLocation(
        param,
        declaration
      );
      if (ts10.isParameter(declaration)) {
        typeNode = declaration.type;
      } else {
        typeNode = declaration.typeExpression?.type;
      }
    } else {
      type2 = context.checker.getTypeOfSymbol(param);
    }
    if (declaration && ts10.isParameter(declaration) && declaration.type?.kind === ts10.SyntaxKind.ThisType) {
      paramRefl.type = new IntrinsicType2("this");
    } else {
      paramRefl.type = context.converter.convertType(
        context.withScope(paramRefl),
        type2,
        typeNode
      );
    }
    let isOptional = false;
    if (declaration) {
      isOptional = ts10.isParameter(declaration) ? !!declaration.questionToken || ts10.getJSDocParameterTags(declaration).some((tag) => tag.isBracketed) : declaration.isBracketed;
    }
    if (isOptional) {
      paramRefl.type = removeUndefined(paramRefl.type);
    }
    paramRefl.defaultValue = convertDefaultValue(
      parameterNodes?.[i + parameterNodeOffset]
    );
    paramRefl.setFlag(ReflectionFlag3.Optional, isOptional);
    let isRest = param.name !== "this";
    if (declaration) {
      isRest = ts10.isParameter(declaration) ? !!declaration.dotDotDotToken : !!declaration.typeExpression && ts10.isJSDocVariadicType(declaration.typeExpression.type);
    }
    paramRefl.setFlag(ReflectionFlag3.Rest, isRest);
    checkForDestructuredParameterDefaults(
      paramRefl,
      parameterNodes?.[i + parameterNodeOffset]
    );
    return paramRefl;
  });
}
function convertParameterNodes(context, sigRef, parameters) {
  return parameters.map((param) => {
    const paramRefl = new ParameterReflection2(
      /__\d+/.test(param.name.getText()) ? "__namedParameters" : param.name.getText(),
      ReflectionKind7.Parameter,
      sigRef
    );
    if (ts10.isJSDocParameterTag(param)) {
      paramRefl.comment = context.getJsDocComment(param);
    }
    context.registerReflection(
      paramRefl,
      context.getSymbolAtLocation(param)
    );
    context.converter.trigger(
      ConverterEvents.CREATE_PARAMETER,
      context,
      paramRefl
    );
    paramRefl.type = context.converter.convertType(
      context.withScope(paramRefl),
      ts10.isParameter(param) ? param.type : param.typeExpression?.type
    );
    const isOptional = ts10.isParameter(param) ? !!param.questionToken : param.isBracketed;
    if (isOptional) {
      paramRefl.type = removeUndefined(paramRefl.type);
    }
    paramRefl.defaultValue = convertDefaultValue(param);
    paramRefl.setFlag(ReflectionFlag3.Optional, isOptional);
    paramRefl.setFlag(
      ReflectionFlag3.Rest,
      ts10.isParameter(param) ? !!param.dotDotDotToken : !!param.typeExpression && ts10.isJSDocVariadicType(param.typeExpression.type)
    );
    checkForDestructuredParameterDefaults(paramRefl, param);
    return paramRefl;
  });
}
function checkForDestructuredParameterDefaults(param, decl) {
  if (!decl || !ts10.isParameter(decl)) return;
  if (param.name !== "__namedParameters") return;
  if (!ts10.isObjectBindingPattern(decl.name)) return;
  if (param.type?.type !== "reflection") return;
  for (const child of param.type.declaration.children || []) {
    const tsChild = decl.name.elements.find(
      (el) => (el.propertyName || el.name).getText() === child.name
    );
    if (tsChild) {
      child.defaultValue = convertDefaultValue(tsChild);
    }
  }
}
function convertTypeParameters(context, parent, parameters) {
  return parameters?.map((param) => {
    const constraintT = param.getConstraint();
    const defaultT = param.getDefault();
    const declaration = param.getSymbol()?.declarations?.find(ts10.isTypeParameterDeclaration);
    const variance = getVariance(declaration?.modifiers);
    const paramRefl = new TypeParameterReflection(
      param.symbol.name,
      parent,
      variance
    );
    const paramCtx = context.withScope(paramRefl);
    paramRefl.type = constraintT ? context.converter.convertType(paramCtx, constraintT) : void 0;
    paramRefl.default = defaultT ? context.converter.convertType(paramCtx, defaultT) : void 0;
    if (declaration?.modifiers?.some(
      (m) => m.kind === ts10.SyntaxKind.ConstKeyword
    )) {
      paramRefl.flags.setFlag(ReflectionFlag3.Const, true);
    }
    context.registerReflection(paramRefl, param.getSymbol());
    context.converter.trigger(
      ConverterEvents.CREATE_TYPE_PARAMETER,
      context,
      paramRefl
    );
    return paramRefl;
  });
}
function convertTypeParameterNodes(context, parameters) {
  return parameters?.map((param) => createTypeParamReflection(param, context));
}
function createTypeParamReflection(param, context) {
  const paramRefl = new TypeParameterReflection(
    param.name.text,
    context.scope,
    getVariance(param.modifiers)
  );
  const paramScope = context.withScope(paramRefl);
  if (ts10.isJSDocTemplateTag(param.parent)) {
    if (param.parent.typeParameters[0].name.text === param.name.text && param.parent.constraint) {
      paramRefl.type = context.converter.convertType(paramScope, param.parent.constraint);
    }
  } else {
    paramRefl.type = param.constraint ? context.converter.convertType(paramScope, param.constraint) : void 0;
  }
  paramRefl.default = param.default ? context.converter.convertType(paramScope, param.default) : void 0;
  if (param.modifiers?.some((m) => m.kind === ts10.SyntaxKind.ConstKeyword)) {
    paramRefl.flags.setFlag(ReflectionFlag3.Const, true);
  }
  context.registerReflection(paramRefl, param.symbol);
  if (ts10.isJSDocTemplateTag(param.parent)) {
    paramRefl.comment = context.getJsDocComment(param.parent);
  }
  context.converter.trigger(
    ConverterEvents.CREATE_TYPE_PARAMETER,
    context,
    paramRefl,
    param
  );
  return paramRefl;
}
function convertTemplateParameterNodes(context, nodes2) {
  return nodes2?.flatMap((node) => {
    return node.typeParameters.map((param, index2) => {
      const paramRefl = new TypeParameterReflection(
        param.name.text,
        context.scope,
        getVariance(param.modifiers)
      );
      const paramScope = context.withScope(paramRefl);
      paramRefl.type = index2 || !node.constraint ? void 0 : context.converter.convertType(
        paramScope,
        node.constraint.type
      );
      paramRefl.default = param.default ? context.converter.convertType(paramScope, param.default) : void 0;
      if (param.modifiers?.some(
        (m) => m.kind === ts10.SyntaxKind.ConstKeyword
      )) {
        paramRefl.flags.setFlag(ReflectionFlag3.Const, true);
      }
      context.registerReflection(paramRefl, param.symbol);
      if (ts10.isJSDocTemplateTag(param.parent)) {
        paramRefl.comment = context.getJsDocComment(param.parent);
      }
      context.converter.trigger(
        ConverterEvents.CREATE_TYPE_PARAMETER,
        context,
        paramRefl,
        param
      );
      return paramRefl;
    });
  });
}
function getVariance(modifiers) {
  const hasIn = modifiers?.some(
    (mod) => mod.kind === ts10.SyntaxKind.InKeyword
  );
  const hasOut = modifiers?.some(
    (mod) => mod.kind === ts10.SyntaxKind.OutKeyword
  );
  if (hasIn && hasOut) {
    return VarianceModifier.inOut;
  }
  if (hasIn) {
    return VarianceModifier.in;
  }
  if (hasOut) {
    return VarianceModifier.out;
  }
}
function convertPredicate(predicate, context) {
  let name;
  switch (predicate.kind) {
    case ts10.TypePredicateKind.This:
    case ts10.TypePredicateKind.AssertsThis:
      name = "this";
      break;
    case ts10.TypePredicateKind.Identifier:
    case ts10.TypePredicateKind.AssertsIdentifier:
      name = predicate.parameterName;
      break;
  }
  let asserts;
  switch (predicate.kind) {
    case ts10.TypePredicateKind.This:
    case ts10.TypePredicateKind.Identifier:
      asserts = false;
      break;
    case ts10.TypePredicateKind.AssertsThis:
    case ts10.TypePredicateKind.AssertsIdentifier:
      asserts = true;
      break;
  }
  return new PredicateType(
    name,
    asserts,
    predicate.type ? context.converter.convertType(context, predicate.type) : void 0
  );
}

// src/lib/converter/jsdoc.ts
import { ok as ok4 } from "assert";
import ts11 from "typescript";
import { DeclarationReflection as DeclarationReflection5, IntrinsicType as IntrinsicType3, ReflectionKind as ReflectionKind8, ReflectionType, SignatureReflection as SignatureReflection3 } from "#models";
import { i18n as i18n5 } from "#utils";
function convertJsDocAliasAsInterface(context, symbol, exportSymbol, declaration) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind8.Interface,
    symbol,
    exportSymbol
  );
  context.finalizeDeclarationReflection(reflection);
  const rc = context.withScope(reflection);
  const type2 = context.checker.getTypeAtLocation(declaration);
  if (type2.getFlags() & ts11.TypeFlags.Union) {
    context.logger.warn(
      i18n5.converting_union_as_interface(),
      declaration
    );
  }
  for (const prop of type2.getProperties()) {
    context.converter.convertSymbol(rc, prop);
  }
  convertTemplateParameters(rc, declaration.parent);
  context.checker.getSignaturesOfType(type2, ts11.SignatureKind.Call).forEach((sig) => createSignature(rc, ReflectionKind8.CallSignature, sig, symbol));
  convertConstructSignatures(rc, symbol);
  convertIndexSignatures(rc, type2);
}
function convertJsDocAlias(context, symbol, declaration, exportSymbol) {
  if (declaration.typeExpression && ts11.isJSDocTypeLiteral(declaration.typeExpression)) {
    convertJsDocInterface(context, declaration, symbol, exportSymbol);
    return;
  }
  const comment = context.getJsDocComment(declaration);
  if (comment?.hasModifier("@interface")) {
    return convertJsDocAliasAsInterface(
      context,
      symbol,
      exportSymbol,
      declaration
    );
  }
  const aliasedSymbol = getTypedefReExportTarget(context, declaration);
  if (aliasedSymbol) {
    context.converter.convertSymbol(
      context,
      aliasedSymbol,
      exportSymbol ?? symbol
    );
    return;
  }
  const reflection = context.createDeclarationReflection(
    ReflectionKind8.TypeAlias,
    symbol,
    exportSymbol
  );
  reflection.comment = comment;
  reflection.type = context.converter.convertType(
    context.withScope(reflection),
    declaration.typeExpression?.type
  );
  convertTemplateParameters(
    context.withScope(reflection),
    declaration.parent
  );
  context.finalizeDeclarationReflection(reflection);
}
function convertJsDocCallback(context, symbol, declaration, exportSymbol) {
  const alias = context.createDeclarationReflection(
    ReflectionKind8.TypeAlias,
    symbol,
    exportSymbol
  );
  alias.comment = context.getJsDocComment(declaration);
  context.finalizeDeclarationReflection(alias);
  const ac = context.withScope(alias);
  alias.type = convertJsDocSignature(ac, declaration.typeExpression);
  convertTemplateParameters(ac, declaration.parent);
}
function convertJsDocInterface(context, declaration, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind8.Interface,
    symbol,
    exportSymbol
  );
  reflection.comment = context.getJsDocComment(declaration);
  context.finalizeDeclarationReflection(reflection);
  const rc = context.withScope(reflection);
  const type2 = context.checker.getDeclaredTypeOfSymbol(symbol);
  for (const s of type2.getProperties()) {
    context.converter.convertSymbol(rc, s);
  }
  convertTemplateParameters(rc, declaration.parent);
}
function convertJsDocSignature(context, node) {
  const symbol = context.getSymbolAtLocation(node) ?? node.symbol;
  const type2 = context.getTypeAtLocation(node);
  if (!symbol || !type2) {
    return new IntrinsicType3("Function");
  }
  const reflection = new DeclarationReflection5(
    "__type",
    ReflectionKind8.TypeLiteral,
    context.scope
  );
  const rc = context.withScope(reflection);
  context.registerReflection(reflection, symbol);
  context.converter.trigger(
    ConverterEvents.CREATE_DECLARATION,
    context,
    reflection
  );
  const signature = new SignatureReflection3(
    "__type",
    ReflectionKind8.CallSignature,
    reflection
  );
  context.project.registerSymbolId(
    signature,
    context.createSymbolId(symbol, node)
  );
  context.registerReflection(signature, void 0);
  const signatureCtx = rc.withScope(signature);
  reflection.signatures = [signature];
  signature.type = context.converter.convertType(
    signatureCtx,
    node.type?.typeExpression?.type
  );
  signature.parameters = convertParameterNodes(
    signatureCtx,
    signature,
    node.parameters
  );
  signature.typeParameters = convertTemplateParameterNodes(
    context.withScope(reflection),
    node.typeParameters
  );
  return new ReflectionType(reflection);
}
function convertTemplateParameters(context, node) {
  ok4(context.scope instanceof DeclarationReflection5);
  context.scope.typeParameters = convertTemplateParameterNodes(
    context,
    node.tags?.filter(ts11.isJSDocTemplateTag)
  );
}
function getTypedefReExportTarget(context, declaration) {
  const typeExpression = declaration.typeExpression;
  if (!ts11.isJSDocTypedefTag(declaration) || !typeExpression || ts11.isJSDocTypeLiteral(typeExpression) || !ts11.isImportTypeNode(typeExpression.type) || !typeExpression.type.qualifier || !ts11.isIdentifier(typeExpression.type.qualifier)) {
    return;
  }
  const targetSymbol = context.expectSymbolAtLocation(
    typeExpression.type.qualifier
  );
  const decl = targetSymbol.declarations?.[0];
  if (!decl || !(ts11.isTypeAliasDeclaration(decl) || ts11.isInterfaceDeclaration(decl) || ts11.isJSDocTypedefTag(decl) || ts11.isJSDocCallbackTag(decl))) {
    return;
  }
  const targetParams = ts11.getEffectiveTypeParameterDeclarations(decl);
  const localParams = ts11.getEffectiveTypeParameterDeclarations(declaration);
  const localArgs = typeExpression.type.typeArguments || [];
  if (targetParams.length !== localParams.length || localArgs.some(
    (arg, i) => !ts11.isTypeReferenceNode(arg) || !ts11.isIdentifier(arg.typeName) || arg.typeArguments || localParams[i]?.name.text !== arg.typeName.text
  )) {
    return;
  }
  return targetSymbol;
}

// src/lib/converter/symbols.ts
var symbolConverters = {
  [ts12.SymbolFlags.RegularEnum]: convertEnum,
  [ts12.SymbolFlags.ConstEnum]: convertEnum,
  [ts12.SymbolFlags.EnumMember]: convertEnumMember,
  [ts12.SymbolFlags.ValueModule]: convertNamespace,
  [ts12.SymbolFlags.NamespaceModule]: convertNamespace,
  [ts12.SymbolFlags.TypeAlias]: convertTypeAlias,
  [ts12.SymbolFlags.Function]: convertFunctionOrMethod,
  [ts12.SymbolFlags.Method]: convertFunctionOrMethod,
  [ts12.SymbolFlags.Interface]: convertClassOrInterface,
  [ts12.SymbolFlags.Property]: convertProperty,
  [ts12.SymbolFlags.Class]: convertClassOrInterface,
  [ts12.SymbolFlags.Constructor]: convertConstructor,
  [ts12.SymbolFlags.Alias]: convertAlias,
  [ts12.SymbolFlags.BlockScopedVariable]: convertVariable,
  [ts12.SymbolFlags.FunctionScopedVariable]: convertVariable,
  [ts12.SymbolFlags.ExportValue]: convertVariable,
  [ts12.SymbolFlags.GetAccessor]: convertAccessor,
  [ts12.SymbolFlags.SetAccessor]: convertAccessor
};
var allConverterFlags = Object.keys(symbolConverters).reduce(
  (v, k) => v | +k,
  0
);
var conversionOrder = [
  // Do enums before namespaces so that @hidden on a namespace
  // merged with an enum works properly.
  ts12.SymbolFlags.RegularEnum,
  ts12.SymbolFlags.ConstEnum,
  ts12.SymbolFlags.EnumMember,
  // Before type alias
  ts12.SymbolFlags.BlockScopedVariable,
  ts12.SymbolFlags.FunctionScopedVariable,
  ts12.SymbolFlags.ExportValue,
  ts12.SymbolFlags.Function,
  // Before NamespaceModule
  ts12.SymbolFlags.TypeAlias,
  ts12.SymbolFlags.Method,
  ts12.SymbolFlags.Interface,
  ts12.SymbolFlags.Property,
  ts12.SymbolFlags.Class,
  ts12.SymbolFlags.Constructor,
  ts12.SymbolFlags.Alias,
  ts12.SymbolFlags.GetAccessor,
  ts12.SymbolFlags.SetAccessor,
  ts12.SymbolFlags.ValueModule,
  ts12.SymbolFlags.NamespaceModule
];
for (const key of Object.keys(symbolConverters)) {
  assert5(
    Number.isInteger(Math.log2(+key)),
    `Symbol converter for key ${ts12.SymbolFlags[+key]} does not specify a valid flag value.`
  );
  assert5(
    conversionOrder.includes(+key),
    `Symbol converter for key ${ts12.SymbolFlags[+key]} is not specified in conversionOrder`
  );
}
assert5(
  conversionOrder.reduce((a, b) => a | b, 0) === allConverterFlags,
  "conversionOrder contains a symbol flag that converters do not."
);
function _convertSymbolNow(context, symbol, exportSymbol) {
  if (context.shouldIgnore(resolveAliasedSymbol(symbol, context.checker))) {
    return;
  }
  const previous = context.getReflectionFromSymbol(symbol);
  if (previous && previous.parent?.kindOf(
    ReflectionKind9.SomeModule | ReflectionKind9.Project
  )) {
    createAlias(previous, context, symbol, exportSymbol);
    return;
  }
  let flags = removeFlag(
    symbol.flags,
    ts12.SymbolFlags.Transient | ts12.SymbolFlags.Assignment | ts12.SymbolFlags.Optional | ts12.SymbolFlags.Prototype
  );
  if (hasAllFlags(symbol.flags, ts12.SymbolFlags.Class)) {
    flags = removeFlag(
      flags,
      ts12.SymbolFlags.Interface | ts12.SymbolFlags.Function
    );
  }
  if (hasAllFlags(symbol.flags, ts12.SymbolFlags.GetAccessor)) {
    flags = removeFlag(flags, ts12.SymbolFlags.SetAccessor);
  }
  if (hasAllFlags(symbol.flags, ts12.SymbolFlags.NamespaceModule)) {
    flags = removeFlag(flags, ts12.SymbolFlags.ValueModule);
  }
  if (hasAnyFlag(
    symbol.flags,
    ts12.SymbolFlags.Method | ts12.SymbolFlags.Interface | ts12.SymbolFlags.Class | ts12.SymbolFlags.Variable
  )) {
    flags = removeFlag(flags, ts12.SymbolFlags.Property);
  }
  for (const flag of getEnumFlags(flags & ~allConverterFlags)) {
    context.logger.verbose(
      `Missing converter for symbol: ${symbol.name} with flag ${ts12.SymbolFlags[flag]}`
    );
  }
  const selectedConverters = conversionOrder.filter((flag) => flag & flags);
  let skip = 0;
  for (const flag of selectedConverters) {
    if (skip & flag) continue;
    skip |= symbolConverters[flag]?.(context, symbol, exportSymbol) || 0;
  }
}
function convertSymbol(context, symbol, exportSymbol) {
  if ((exportSymbol?.name ?? symbol.name) === "default" && context.scope.kindOf(ReflectionKind9.ExportContainer)) {
    context.converter.deferConversion(() => {
      _convertSymbolNow(context, symbol, exportSymbol);
    });
    return;
  }
  _convertSymbolNow(context, symbol, exportSymbol);
}
function convertSymbols(context, symbols) {
  for (const symbol of symbols) {
    convertSymbol(context, symbol);
  }
}
function convertEnum(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Enum,
    symbol,
    exportSymbol
  );
  if (symbol.flags & ts12.SymbolFlags.ConstEnum) {
    reflection.setFlag(ReflectionFlag4.Const);
  }
  context.finalizeDeclarationReflection(reflection);
  convertSymbols(
    context.withScope(reflection),
    context.checker.getExportsOfModule(symbol).filter((s) => s.flags & ts12.SymbolFlags.EnumMember)
  );
}
function convertEnumMember(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.EnumMember,
    symbol,
    exportSymbol
  );
  const defaultValue = context.checker.getConstantValue(
    symbol.getDeclarations()[0]
  );
  if (defaultValue !== void 0) {
    reflection.type = new LiteralType(defaultValue);
  } else {
    reflection.type = new IntrinsicType4("number");
  }
  context.finalizeDeclarationReflection(reflection);
}
function convertNamespace(context, symbol, exportSymbol) {
  let exportFlags = ts12.SymbolFlags.ModuleMember;
  if (symbol.getDeclarations()?.some((d) => ts12.isModuleDeclaration(d) || ts12.isSourceFile(d)) !== true) {
    exportFlags = ts12.SymbolFlags.ClassMember;
    if (hasAnyFlag(symbol.flags, ts12.SymbolFlags.Class)) {
      return;
    }
  }
  if (symbol.declarations?.some(ts12.isFunctionDeclaration)) {
    exportFlags |= ts12.SymbolFlags.PropertyOrAccessor;
  }
  const existingReflection = context.getReflectionFromSymbol(
    exportSymbol || symbol
  );
  let reflection;
  if (existingReflection?.kind === ReflectionKind9.Namespace) {
    reflection = existingReflection;
  } else {
    let kind = ReflectionKind9.Namespace;
    let nameOverride;
    const declareModule = symbol.declarations?.find(
      (mod) => ts12.isModuleDeclaration(mod) && ts12.isStringLiteral(mod.name)
    );
    if (declareModule) {
      kind = ReflectionKind9.Module;
      nameOverride = declareModule.name.text;
    }
    reflection = context.createDeclarationReflection(
      kind,
      symbol,
      exportSymbol,
      nameOverride
    );
    context.finalizeDeclarationReflection(reflection);
  }
  convertSymbols(
    context.withScope(reflection),
    context.checker.getExportsOfModule(symbol).filter((s) => s.flags & exportFlags)
  );
}
function convertTypeAlias(context, symbol, exportSymbol) {
  const declaration = symbol.getDeclarations()?.find(
    (d) => ts12.isTypeAliasDeclaration(d) || ts12.isJSDocTypedefTag(d) || ts12.isJSDocCallbackTag(d) || ts12.isJSDocEnumTag(d)
  );
  assert5(declaration);
  if (ts12.isTypeAliasDeclaration(declaration)) {
    const comment = context.getComment(symbol, ReflectionKind9.TypeAlias);
    if (comment?.hasModifier("@reexport")) {
      if (ts12.isTypeReferenceNode(declaration.type)) {
        const type2 = context.getTypeAtLocation(declaration.type.typeName);
        const aliasedSymbol = type2?.aliasSymbol ?? type2?.getSymbol() ?? declaration.type.typeName.symbol;
        if (aliasedSymbol) {
          convertSymbol(context, aliasedSymbol, exportSymbol || symbol);
          return;
        } else {
          context.logger.warn(
            i18n6.failed_to_convert_0_as_reexport(exportSymbol?.name ?? symbol.name),
            declaration
          );
        }
      } else {
        context.logger.warn(
          i18n6.failed_to_convert_0_as_reexport(exportSymbol?.name ?? symbol.name),
          declaration
        );
      }
    }
    if (comment?.hasModifier("@interface")) {
      return convertTypeAliasAsInterface(
        context,
        symbol,
        exportSymbol,
        declaration
      );
    }
    const reflection = context.createDeclarationReflection(
      ReflectionKind9.TypeAlias,
      symbol,
      exportSymbol
    );
    context.finalizeDeclarationReflection(reflection);
    if (reflection.comment?.hasModifier("@useDeclaredType")) {
      reflection.comment.removeModifier("@useDeclaredType");
      reflection.type = context.converter.convertType(
        context.withScope(reflection),
        context.checker.getDeclaredTypeOfSymbol(symbol)
      );
    } else {
      reflection.type = context.converter.convertType(
        context.withScope(reflection),
        declaration.type
      );
    }
    if (reflection.type.type === "union") {
      attachUnionComments(context, declaration, reflection.type);
    } else if (reflection.type.type === "reflection" && reflection.type.declaration.children) {
      const typeDecl = reflection.type.declaration;
      reflection.project.mergeReflections(typeDecl, reflection);
      delete reflection.type;
      for (const sig of reflection.signatures || []) {
        sig.name = reflection.name;
      }
    }
    reflection.typeParameters = declaration.typeParameters?.map(
      (param) => createTypeParamReflection(param, context.withScope(reflection))
    );
  } else if (ts12.isJSDocTypedefTag(declaration) || ts12.isJSDocEnumTag(declaration)) {
    convertJsDocAlias(context, symbol, declaration, exportSymbol);
  } else {
    convertJsDocCallback(context, symbol, declaration, exportSymbol);
  }
}
function convertTypeAliasFromValueDeclaration(context, symbol, exportSymbol, valueKind) {
  const comment = context.getComment(symbol, valueKind);
  const reflection = new DeclarationReflection6(
    exportSymbol?.name || symbol.name,
    ReflectionKind9.TypeAlias,
    context.scope
  );
  reflection.comment = comment;
  context.postReflectionCreation(reflection, symbol, exportSymbol);
  context.finalizeDeclarationReflection(reflection);
  reflection.type = context.converter.convertType(
    context.withScope(reflection),
    context.checker.getTypeOfSymbol(symbol)
  );
  if (reflection.type.type === "reflection" && reflection.type.declaration.children) {
    const typeDecl = reflection.type.declaration;
    reflection.project.mergeReflections(typeDecl, reflection);
    delete reflection.type;
    for (const sig of reflection.signatures || []) {
      sig.name = reflection.name;
    }
  }
}
function attachUnionComments(context, declaration, union) {
  const list = declaration.type.getChildAt(0);
  if (list.kind !== ts12.SyntaxKind.SyntaxList) return;
  let unionIndex = 0;
  for (const child of list.getChildren()) {
    const comment = context.getNodeComment(child, false);
    if (comment?.modifierTags.size || comment?.blockTags.length) {
      context.logger.warn(
        i18n6.comment_for_0_should_not_contain_block_or_modifier_tags(
          `${context.scope.getFriendlyFullName()}.${unionIndex}`
        ),
        child
      );
    }
    if (comment) {
      union.elementSummaries ||= Array.from(
        { length: union.types.length },
        () => []
      );
      union.elementSummaries[unionIndex] = comment.summary;
    }
    if (child.kind !== ts12.SyntaxKind.BarToken) {
      ++unionIndex;
    }
  }
}
function convertTypeAliasAsInterface(context, symbol, exportSymbol, declaration) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Interface,
    symbol,
    exportSymbol
  );
  context.finalizeDeclarationReflection(reflection);
  const rc = context.withScope(reflection);
  const type2 = context.checker.getTypeAtLocation(declaration);
  if (type2.getFlags() & ts12.TypeFlags.Union) {
    context.logger.warn(
      i18n6.converting_union_as_interface(),
      declaration
    );
  }
  convertSymbols(rc, type2.getProperties());
  if (declaration.typeParameters) {
    reflection.typeParameters = declaration.typeParameters.map((param) => {
      const declaration2 = param.symbol?.declarations?.[0];
      assert5(declaration2 && ts12.isTypeParameterDeclaration(declaration2));
      return createTypeParamReflection(declaration2, rc);
    });
  }
  context.checker.getSignaturesOfType(type2, ts12.SignatureKind.Call).forEach((sig) => createSignature(rc, ReflectionKind9.CallSignature, sig, symbol));
  convertConstructSignatures(rc, symbol);
  convertIndexSignatures(rc, type2);
}
function convertFunctionOrMethod(context, symbol, exportSymbol) {
  if (isTypeOnlyExport(exportSymbol)) {
    return convertTypeAliasFromValueDeclaration(context, symbol, exportSymbol, ReflectionKind9.Function);
  }
  const isMethod = !!(symbol.flags & (ts12.SymbolFlags.Property | ts12.SymbolFlags.Method));
  if (!isMethod) {
    const comment = context.getComment(symbol, ReflectionKind9.Function);
    if (comment?.hasModifier("@class")) {
      return convertSymbolAsClass(context, symbol, exportSymbol);
    }
  }
  const declarations = symbol.getDeclarations()?.filter(ts12.isFunctionLike) ?? [];
  if (isMethod && isInherited(context, symbol) && declarations.length > 0 && hasAllFlags(
    ts12.getCombinedModifierFlags(declarations[0]),
    ts12.ModifierFlags.Private
  )) {
    return;
  }
  const locationDeclaration = symbol.parent?.getDeclarations()?.find(
    (d) => ts12.isClassDeclaration(d) || ts12.isInterfaceDeclaration(d)
  ) ?? symbol.parent?.getDeclarations()?.[0]?.getSourceFile() ?? symbol.getDeclarations()?.[0]?.getSourceFile();
  assert5(locationDeclaration, "Missing declaration context");
  const type2 = context.checker.getTypeOfSymbolAtLocation(
    symbol,
    locationDeclaration
  );
  const signatures = type2.getNonNullableType().getCallSignatures();
  const reflection = context.createDeclarationReflection(
    context.scope.kindOf(ReflectionKind9.MethodContainer) ? ReflectionKind9.Method : ReflectionKind9.Function,
    symbol,
    exportSymbol,
    void 0
  );
  if (symbol.declarations?.length && isMethod) {
    setModifiers(symbol, symbol.declarations[0], reflection);
  }
  context.finalizeDeclarationReflection(reflection);
  const scope = context.withScope(reflection);
  for (const sig of signatures) {
    createSignature(scope, ReflectionKind9.CallSignature, sig, symbol);
  }
  return convertFunctionProperties(scope, symbol, type2);
}
function convertClassOrInterface(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ts12.SymbolFlags.Class & symbol.flags && !isTypeOnlyExport(exportSymbol) ? ReflectionKind9.Class : ReflectionKind9.Interface,
    symbol,
    exportSymbol,
    void 0
  );
  const classDeclaration = symbol.getDeclarations()?.find((d) => ts12.isClassDeclaration(d) || ts12.isFunctionDeclaration(d));
  if (classDeclaration) setModifiers(symbol, classDeclaration, reflection);
  const reflectionContext = context.withScope(reflection);
  reflectionContext.convertingClassOrInterface = true;
  const instanceType = context.checker.getDeclaredTypeOfSymbol(symbol);
  assert5(instanceType.isClassOrInterface());
  const declarations = symbol.getDeclarations()?.filter(
    (d) => ts12.isInterfaceDeclaration(d) || ts12.isClassDeclaration(d)
  ) ?? [];
  const extendedTypes = getHeritageTypes(
    declarations,
    ts12.SyntaxKind.ExtendsKeyword
  ).map((t) => context.converter.convertType(reflectionContext, t));
  if (extendedTypes.length) {
    reflection.extendedTypes = extendedTypes;
  }
  const implementedTypes = getHeritageTypes(
    declarations,
    ts12.SyntaxKind.ImplementsKeyword
  ).map((t) => context.converter.convertType(reflectionContext, t));
  if (implementedTypes.length) {
    reflection.implementedTypes = implementedTypes;
  }
  context.finalizeDeclarationReflection(reflection);
  if (instanceType.typeParameters) {
    reflection.typeParameters = instanceType.typeParameters.map((param) => {
      const declaration = param.symbol.declarations?.[0];
      assert5(declaration && ts12.isTypeParameterDeclaration(declaration));
      return createTypeParamReflection(declaration, reflectionContext);
    });
  }
  if (classDeclaration && reflection.kind === ReflectionKind9.Class) {
    const staticType = context.checker.getTypeOfSymbolAtLocation(
      symbol,
      classDeclaration
    );
    reflectionContext.shouldBeStatic = true;
    for (const prop of context.checker.getPropertiesOfType(staticType)) {
      if (prop.flags & (ts12.SymbolFlags.ModuleMember | ts12.SymbolFlags.Prototype)) {
        continue;
      }
      convertSymbol(reflectionContext, prop);
    }
    reflectionContext.shouldBeStatic = false;
    const ctors = staticType.getConstructSignatures();
    const constructMember = reflectionContext.createDeclarationReflection(
      ReflectionKind9.Constructor,
      ctors[0]?.declaration?.symbol,
      void 0,
      "constructor"
    );
    if (ctors.length && ctors[0].declaration) {
      setModifiers(symbol, ctors[0].declaration, constructMember);
    }
    context.finalizeDeclarationReflection(constructMember);
    const constructContext = reflectionContext.withScope(constructMember);
    ctors.forEach((sig) => {
      createSignature(
        constructContext,
        ReflectionKind9.ConstructorSignature,
        sig,
        symbol
      );
    });
  }
  convertSymbols(
    reflectionContext,
    context.checker.getPropertiesOfType(instanceType)
  );
  context.checker.getSignaturesOfType(instanceType, ts12.SignatureKind.Call).forEach(
    (sig) => createSignature(
      reflectionContext,
      ReflectionKind9.CallSignature,
      sig,
      symbol
    )
  );
  convertConstructSignatures(reflectionContext, symbol);
  convertIndexSignatures(reflectionContext, instanceType);
  return ts12.SymbolFlags.Alias;
}
function convertProperty(context, symbol, exportSymbol) {
  if (context.scope.kindOf(ReflectionKind9.VariableContainer)) {
    return convertVariable(context, symbol, exportSymbol);
  }
  const declarations = symbol.getDeclarations() ?? [];
  if (isInherited(context, symbol) && declarations.length > 0 && hasAllFlags(
    ts12.getCombinedModifierFlags(declarations[0]),
    ts12.ModifierFlags.Private
  )) {
    return;
  }
  const type2 = context.checker.getTypeOfSymbol(symbol);
  if (type2.getCallSignatures().length && declarations.length && declarations.every(
    (decl) => ts12.isMethodSignature(decl) || ts12.isMethodDeclaration(decl)
  )) {
    return convertFunctionOrMethod(context, symbol, exportSymbol);
  }
  if (declarations.length === 1) {
    const declaration2 = declarations[0];
    if (ts12.isPropertyDeclaration(declaration2) && !declaration2.type && declaration2.initializer && ts12.isArrowFunction(declaration2.initializer)) {
      return convertArrowAsMethod(
        context,
        symbol,
        declaration2.initializer,
        exportSymbol
      );
    }
  }
  const reflection = context.createDeclarationReflection(
    context.scope.kindOf(ReflectionKind9.VariableContainer) ? ReflectionKind9.Variable : ReflectionKind9.Property,
    symbol,
    exportSymbol
  );
  const declaration = symbol.getDeclarations()?.[0];
  let parameterTypeNode;
  if (declaration && (ts12.isPropertyDeclaration(declaration) || ts12.isPropertySignature(declaration) || ts12.isParameter(declaration) || ts12.isPropertyAccessExpression(declaration) || ts12.isPropertyAssignment(declaration))) {
    if (!ts12.isPropertyAccessExpression(declaration) && !ts12.isPropertyAssignment(declaration)) {
      parameterTypeNode = declaration.type;
    }
    setModifiers(symbol, declaration, reflection);
  } else {
    setSymbolModifiers(symbol, reflection);
  }
  reflection.defaultValue = declaration && convertDefaultValue(declaration);
  if (context.convertingTypeNode && parameterTypeNode) {
    reflection.type = context.converter.convertType(
      context.withScope(reflection),
      parameterTypeNode
    );
  } else {
    reflection.type = context.converter.convertType(
      context.withScope(reflection),
      context.checker.getTypeOfSymbol(symbol),
      parameterTypeNode
    );
  }
  if (reflection.flags.isOptional) {
    reflection.type = removeUndefined(reflection.type);
  }
  context.finalizeDeclarationReflection(reflection);
}
function convertArrowAsMethod(context, symbol, arrow, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Method,
    symbol,
    exportSymbol,
    void 0
  );
  setModifiers(symbol, arrow.parent, reflection);
  context.finalizeDeclarationReflection(reflection);
  const rc = context.withScope(reflection);
  const locationDeclaration = symbol.parent?.getDeclarations()?.find(
    (d) => ts12.isClassDeclaration(d) || ts12.isInterfaceDeclaration(d)
  ) ?? symbol.parent?.getDeclarations()?.[0]?.getSourceFile() ?? symbol.getDeclarations()?.[0]?.getSourceFile();
  assert5(locationDeclaration, "Missing declaration context");
  const type2 = context.checker.getTypeOfSymbolAtLocation(
    symbol,
    locationDeclaration
  );
  const signatures = type2.getNonNullableType().getCallSignatures();
  assert5(signatures.length, "Missing signatures");
  createSignature(
    rc,
    ReflectionKind9.CallSignature,
    signatures[0],
    symbol,
    arrow
  );
}
function convertConstructor(context, symbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Constructor,
    symbol,
    void 0,
    "constructor"
  );
  context.finalizeDeclarationReflection(reflection);
  const reflectionContext = context.withScope(reflection);
  const declarations = symbol.getDeclarations()?.filter(ts12.isConstructorDeclaration) ?? [];
  const signatures = declarations.map((decl) => {
    const sig = context.checker.getSignatureFromDeclaration(decl);
    assert5(sig);
    return sig;
  });
  for (const sig of signatures) {
    createSignature(
      reflectionContext,
      ReflectionKind9.ConstructorSignature,
      sig,
      symbol
    );
  }
}
function convertAlias(context, symbol, exportSymbol) {
  if (context.scope.comment?.hasModifier("@primaryExport") || context.getComment(exportSymbol || symbol, ReflectionKind9.Namespace)?.hasModifier("@primaryExport")) {
    _convertAlias();
  } else {
    context.converter.deferConversion(_convertAlias);
  }
  function _convertAlias() {
    const reflection = context.getReflectionFromSymbol(
      context.resolveAliasedSymbol(symbol)
    );
    if (!reflection || reflection && !reflection.parent?.kindOf(
      ReflectionKind9.Project | ReflectionKind9.SomeModule
    )) {
      convertSymbol(
        context,
        context.resolveAliasedSymbol(symbol),
        exportSymbol ?? symbol
      );
    } else {
      createAlias(reflection, context, symbol, exportSymbol);
    }
  }
}
function createAlias(target, context, symbol, exportSymbol) {
  if (context.converter.excludeReferences) return;
  const ref = new ReferenceReflection2(
    exportSymbol?.name ?? symbol.name,
    target.isReference() ? target.getTargetReflection() : target,
    context.scope
  );
  context.postReflectionCreation(ref, symbol, exportSymbol);
  context.finalizeDeclarationReflection(ref);
}
function convertVariable(context, symbol, exportSymbol) {
  if (isTypeOnlyExport(exportSymbol)) {
    return convertTypeAliasFromValueDeclaration(context, symbol, exportSymbol, ReflectionKind9.Variable);
  }
  const declaration = symbol.getDeclarations()?.[0];
  const comment = context.getComment(symbol, ReflectionKind9.Variable);
  const type2 = declaration ? context.checker.getTypeOfSymbolAtLocation(symbol, declaration) : context.checker.getTypeOfSymbol(symbol);
  if (comment?.hasModifier("@reexport")) {
    if (declaration && ts12.isVariableDeclaration(declaration) && declaration.initializer && (ts12.isIdentifier(declaration.initializer) || ts12.isPropertyAccessExpression(declaration.initializer))) {
      const aliasedSymbol = context.expectSymbolAtLocation(declaration.initializer);
      convertSymbol(context, aliasedSymbol, exportSymbol || symbol);
      return ts12.SymbolFlags.Property | ts12.SymbolFlags.ValueModule | ts12.SymbolFlags.TypeAlias;
    } else {
      context.logger.warn(i18n6.failed_to_convert_0_as_reexport(exportSymbol?.name ?? symbol.name), declaration);
    }
  }
  if (isEnumLike(context.checker, type2, declaration) && comment?.hasModifier("@enum")) {
    return convertVariableAsEnum(context, symbol, exportSymbol);
  }
  if (comment?.hasModifier("@namespace")) {
    return convertVariableAsNamespace(context, symbol, exportSymbol);
  }
  if (comment?.hasModifier("@class")) {
    return convertSymbolAsClass(context, symbol, exportSymbol);
  }
  if (type2.getCallSignatures().length && !type2.getConstructSignatures().length) {
    if (comment?.hasModifier("@function") || declaration && shouldAutomaticallyConvertAsFunction(declaration)) {
      return convertVariableAsFunction(context, symbol, exportSymbol);
    }
  }
  const reflection = context.createDeclarationReflection(
    context.scope.kindOf(ReflectionKind9.VariableContainer) ? ReflectionKind9.Variable : ReflectionKind9.Property,
    symbol,
    exportSymbol
  );
  let typeNode;
  if (declaration && ts12.isVariableDeclaration(declaration)) {
    typeNode = declaration.type;
  }
  if (typeNode) {
    reflection.type = context.converter.convertType(
      context.withScope(reflection),
      typeNode
    );
  } else {
    reflection.type = context.converter.convertType(
      context.withScope(reflection),
      type2,
      typeNode
    );
  }
  setModifiers(symbol, declaration, reflection);
  reflection.defaultValue = convertDefaultValue(declaration);
  context.finalizeDeclarationReflection(reflection);
  return ts12.SymbolFlags.Property | ts12.SymbolFlags.ValueModule;
}
function isEnumLike(checker, type2, location) {
  if (!location || !hasAllFlags(type2.flags, ts12.TypeFlags.Object)) {
    return false;
  }
  return type2.getProperties().every((prop) => {
    const propType = checker.getTypeOfSymbolAtLocation(prop, location);
    return isValidEnumProperty(propType);
  });
}
function isValidEnumProperty(type2) {
  return hasAnyFlag(
    type2.flags,
    ts12.TypeFlags.NumberLike | ts12.TypeFlags.StringLike
  );
}
function convertVariableAsEnum(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Enum,
    symbol,
    exportSymbol
  );
  context.finalizeDeclarationReflection(reflection);
  const rc = context.withScope(reflection);
  const declaration = symbol.valueDeclaration;
  if (!declaration) {
    context.logger.error(
      i18n6.converting_0_as_enum_requires_value_declaration(
        symbol.name
      ),
      symbol.declarations?.[0]
    );
    return;
  }
  const type2 = context.checker.getTypeAtLocation(declaration);
  for (const prop of type2.getProperties()) {
    const reflection2 = rc.createDeclarationReflection(
      ReflectionKind9.EnumMember,
      prop,
      void 0
    );
    const propType = context.checker.getTypeOfSymbolAtLocation(
      prop,
      declaration
    );
    reflection2.type = context.converter.convertType(
      rc.withScope(reflection2),
      propType
    );
    rc.finalizeDeclarationReflection(reflection2);
  }
  return ts12.SymbolFlags.TypeAlias;
}
function convertVariableAsNamespace(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Namespace,
    symbol,
    exportSymbol
  );
  context.finalizeDeclarationReflection(reflection);
  const rc = context.withScope(reflection);
  const type2 = context.checker.getTypeOfSymbol(symbol);
  convertSymbols(rc, type2.getProperties());
  return ts12.SymbolFlags.Property;
}
function convertVariableAsFunction(context, symbol, exportSymbol) {
  const declaration = symbol.getDeclarations()?.find(ts12.isVariableDeclaration);
  const accessDeclaration = declaration ?? symbol.valueDeclaration;
  const type2 = accessDeclaration ? context.checker.getTypeOfSymbolAtLocation(symbol, accessDeclaration) : context.checker.getDeclaredTypeOfSymbol(symbol);
  const reflection = context.createDeclarationReflection(
    context.scope.kindOf(ReflectionKind9.MethodContainer) ? ReflectionKind9.Method : ReflectionKind9.Function,
    symbol,
    exportSymbol
  );
  setModifiers(symbol, accessDeclaration, reflection);
  context.finalizeDeclarationReflection(reflection);
  const reflectionContext = context.withScope(reflection);
  reflection.signatures ??= [];
  for (const signature of type2.getCallSignatures()) {
    createSignature(
      reflectionContext,
      ReflectionKind9.CallSignature,
      signature,
      symbol
    );
  }
  reflection.comment?.removeModifier("@function");
  if (reflection.signatures.length === 1 && !reflection.signatures[0].comment && reflection.comment) {
    reflection.signatures[0].comment = reflection.comment;
    delete reflection.comment;
  }
  return convertFunctionProperties(context.withScope(reflection), symbol, type2) | ts12.SymbolFlags.Property;
}
function convertFunctionProperties(context, symbol, type2) {
  const nsFlags = ts12.SymbolFlags.ValueModule | ts12.SymbolFlags.NamespaceModule;
  if (type2.getProperties().length && (hasAllFlags(symbol.flags, nsFlags) || !hasAnyFlag(symbol.flags, nsFlags)) && !symbol.declarations?.some(ts12.isModuleDeclaration)) {
    convertSymbols(context, type2.getProperties());
    return ts12.SymbolFlags.NamespaceModule;
  }
  return ts12.SymbolFlags.None;
}
function convertSymbolAsClass(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Class,
    symbol,
    exportSymbol
  );
  const rc = context.withScope(reflection);
  context.finalizeDeclarationReflection(reflection);
  if (!symbol.valueDeclaration) {
    context.logger.error(
      i18n6.converting_0_as_class_requires_value_declaration(
        symbol.name
      ),
      symbol.declarations?.[0]
    );
    return;
  }
  const type2 = context.checker.getTypeOfSymbolAtLocation(
    symbol,
    symbol.valueDeclaration
  );
  rc.shouldBeStatic = true;
  convertSymbols(
    rc,
    // Prototype is implicitly this class, don't document it.
    type2.getProperties().filter((prop) => prop.name !== "prototype")
  );
  for (const sig of type2.getCallSignatures()) {
    createSignature(rc, ReflectionKind9.CallSignature, sig, void 0);
  }
  rc.shouldBeStatic = false;
  const ctors = type2.getConstructSignatures();
  if (ctors.length) {
    const constructMember = rc.createDeclarationReflection(
      ReflectionKind9.Constructor,
      ctors[0]?.declaration?.symbol,
      void 0,
      "constructor"
    );
    if (ctors.length && ctors[0].declaration) {
      setModifiers(symbol, ctors[0].declaration, constructMember);
    }
    context.finalizeDeclarationReflection(constructMember);
    const constructContext = rc.withScope(constructMember);
    for (const sig of ctors) {
      createConstructSignatureWithType(constructContext, sig, reflection);
    }
    reflection.typeParameters = convertTypeParameters(rc, reflection, ctors[0].getTypeParameters());
    const instType = ctors[0].getReturnType();
    convertSymbols(rc, instType.getProperties());
    for (const sig of instType.getCallSignatures()) {
      createSignature(rc, ReflectionKind9.CallSignature, sig, void 0);
    }
  } else {
    context.logger.warn(
      i18n6.converting_0_as_class_without_construct_signatures(
        reflection.getFriendlyFullName()
      ),
      symbol.valueDeclaration
    );
  }
  return ts12.SymbolFlags.TypeAlias | ts12.SymbolFlags.Interface | ts12.SymbolFlags.Namespace;
}
function convertAccessor(context, symbol, exportSymbol) {
  const reflection = context.createDeclarationReflection(
    ReflectionKind9.Accessor,
    symbol,
    exportSymbol
  );
  const rc = context.withScope(reflection);
  const declaration = symbol.getDeclarations()?.[0];
  if (declaration) {
    setModifiers(symbol, declaration, reflection);
    if (ts12.isPropertyDeclaration(declaration) && declaration.modifiers?.some((n) => n.kind === ts12.SyntaxKind.AccessorKeyword)) {
      reflection.type = context.converter.convertType(
        context.withScope(reflection),
        context.checker.getTypeOfSymbol(symbol),
        declaration.type
      );
    }
  }
  context.finalizeDeclarationReflection(reflection);
  const getDeclaration = symbol.getDeclarations()?.find(ts12.isGetAccessor);
  if (getDeclaration) {
    const signature = context.checker.getSignatureFromDeclaration(getDeclaration);
    if (signature) {
      createSignature(
        rc,
        ReflectionKind9.GetSignature,
        signature,
        symbol,
        getDeclaration
      );
    }
  }
  const setDeclaration = symbol.getDeclarations()?.find(ts12.isSetAccessor);
  if (setDeclaration) {
    const signature = context.checker.getSignatureFromDeclaration(setDeclaration);
    if (signature) {
      createSignature(
        rc,
        ReflectionKind9.SetSignature,
        signature,
        symbol,
        setDeclaration
      );
    }
  }
}
function isInherited(context, symbol) {
  const parentSymbol = context.getSymbolFromReflection(context.scope);
  if (!parentSymbol) return false;
  const parents = parentSymbol.declarations?.slice() || [];
  const constructorDecls = parents.flatMap(
    (parent) => ts12.isClassDeclaration(parent) ? parent.members.filter(ts12.isConstructorDeclaration) : []
  );
  parents.push(...constructorDecls);
  return parents.some((d) => symbol.getDeclarations()?.some((d2) => d2.parent === d)) === false;
}
function setModifiers(symbol, declaration, reflection) {
  setSymbolModifiers(symbol, reflection);
  if (!declaration) {
    return;
  }
  const modifiers = ts12.getCombinedModifierFlags(declaration);
  if (ts12.isMethodDeclaration(declaration) || ts12.isPropertyDeclaration(declaration) || ts12.isAccessor(declaration)) {
    if (ts12.isPrivateIdentifier(declaration.name)) {
      reflection.setFlag(ReflectionFlag4.Private);
    }
  }
  if (hasAllFlags(modifiers, ts12.ModifierFlags.Private)) {
    reflection.setFlag(ReflectionFlag4.Private);
  }
  if (hasAllFlags(modifiers, ts12.ModifierFlags.Protected)) {
    reflection.setFlag(ReflectionFlag4.Protected);
  }
  if (hasAllFlags(modifiers, ts12.ModifierFlags.Public)) {
    reflection.setFlag(ReflectionFlag4.Public);
  }
  reflection.setFlag(
    ReflectionFlag4.Optional,
    hasAllFlags(symbol.flags, ts12.SymbolFlags.Optional)
  );
  reflection.setFlag(
    ReflectionFlag4.Readonly,
    hasAllFlags(ts12.getCheckFlags(symbol), ts12.CheckFlags.Readonly) || hasAllFlags(modifiers, ts12.ModifierFlags.Readonly)
  );
  reflection.setFlag(
    ReflectionFlag4.Abstract,
    hasAllFlags(modifiers, ts12.ModifierFlags.Abstract)
  );
  if (reflection.kindOf(ReflectionKind9.Variable) && hasAllFlags(symbol.flags, ts12.SymbolFlags.BlockScopedVariable)) {
    reflection.setFlag(
      ReflectionFlag4.Const,
      hasAllFlags(declaration.parent.flags, ts12.NodeFlags.Const)
    );
  }
}
function setSymbolModifiers(symbol, reflection) {
  reflection.setFlag(
    ReflectionFlag4.Optional,
    hasAllFlags(symbol.flags, ts12.SymbolFlags.Optional)
  );
}
function shouldAutomaticallyConvertAsFunction(node) {
  if (ts12.isVariableDeclaration(node)) {
    if (node.type || !node.initializer) return false;
    return isFunctionLikeInitializer(node.initializer);
  }
  if (ts12.isPropertyAssignment(node)) {
    return isFunctionLikeInitializer(node.initializer);
  }
  if (ts12.isPropertyAccessExpression(node)) {
    if (ts12.isBinaryExpression(node.parent) && [ts12.SyntaxKind.EqualsToken, ts12.SyntaxKind.BarBarEqualsToken, ts12.SyntaxKind.QuestionQuestionEqualsToken].includes(node.parent.operatorToken.kind)) {
      return isFunctionLikeInitializer(node.parent.right);
    }
  }
  return false;
}
function isFunctionLikeInitializer(node) {
  if (ts12.isFunctionExpression(node) || ts12.isArrowFunction(node)) {
    return true;
  }
  if (ts12.isSatisfiesExpression(node)) {
    return isFunctionLikeInitializer(node.expression);
  }
  if (ts12.isAsExpression(node)) {
    return isFunctionLikeInitializer(node.expression);
  }
  return false;
}
function isTypeOnlyExport(symbol) {
  if (!symbol) return false;
  const declaration = symbol.declarations?.[0];
  if (!declaration) return false;
  if (!ts12.isExportSpecifier(declaration)) return false;
  return declaration.isTypeOnly || declaration.parent.parent.isTypeOnly;
}

// src/lib/converter/types.ts
import assert6 from "assert";
import ts13 from "typescript";
import {
  ArrayType,
  ConditionalType,
  DeclarationReflection as DeclarationReflection7,
  IndexedAccessType,
  InferredType,
  IntersectionType,
  IntrinsicType as IntrinsicType5,
  LiteralType as LiteralType2,
  MappedType,
  NamedTupleMember,
  OptionalType,
  PredicateType as PredicateType2,
  QueryType,
  ReferenceType as ReferenceType3,
  ReflectionFlag as ReflectionFlag5,
  ReflectionKind as ReflectionKind10,
  ReflectionType as ReflectionType2,
  RestType,
  SignatureReflection as SignatureReflection4,
  TemplateLiteralType,
  TupleType,
  TypeOperatorType,
  UnionType as UnionType3,
  UnknownType
} from "#models";
import { zip } from "#utils";
var converters = /* @__PURE__ */ new Map();
function loadConverters() {
  if (converters.size) return;
  for (const actor of [
    arrayConverter,
    conditionalConverter,
    constructorConverter,
    exprWithTypeArgsConverter,
    functionTypeConverter,
    importType,
    indexedAccessConverter,
    inferredConverter,
    intersectionConverter,
    intrinsicConverter,
    jsDocVariadicTypeConverter,
    keywordConverter,
    optionalConverter,
    parensConverter,
    predicateConverter,
    queryConverter,
    typeLiteralConverter,
    referenceConverter,
    restConverter,
    namedTupleMemberConverter,
    mappedConverter,
    literalTypeConverter,
    templateLiteralConverter,
    thisConverter,
    tupleConverter,
    typeOperatorConverter,
    unionConverter,
    jSDocTypeExpressionConverter,
    // Only used if skipLibCheck: true
    jsDocNullableTypeConverter,
    jsDocNonNullableTypeConverter,
    jsDocAllTypeConverter
  ]) {
    for (const key of actor.kind) {
      if (key === void 0) {
        continue;
      }
      assert6(!converters.has(key));
      converters.set(key, actor);
    }
  }
}
var seenTypes = /* @__PURE__ */ new Set();
function maybeConvertType(context, typeOrNode) {
  if (!typeOrNode) {
    return;
  }
  return convertType(context, typeOrNode);
}
var typeConversionDepth = 0;
function convertType(context, typeOrNode, maybeNode) {
  if (!typeOrNode) {
    return new IntrinsicType5("any");
  }
  if (typeConversionDepth > context.converter.maxTypeConversionDepth) {
    return new UnknownType("...");
  }
  loadConverters();
  if ("kind" in typeOrNode) {
    const converter2 = converters.get(typeOrNode.kind);
    if (converter2) {
      ++typeConversionDepth;
      const result = converter2.convert(context, typeOrNode);
      --typeConversionDepth;
      return result;
    }
    return requestBugReport(context, typeOrNode);
  }
  if (typeOrNode.isUnion() && typeOrNode.origin && !typeOrNode.aliasSymbol) {
    return convertType(context, typeOrNode.origin);
  }
  const node = context.checker.typeToTypeNode(
    typeOrNode,
    void 0,
    ts13.NodeBuilderFlags.IgnoreErrors
  );
  assert6(node);
  if (seenTypes.has(typeOrNode.id)) {
    const typeString = context.checker.typeToString(typeOrNode);
    context.logger.verbose(
      `Refusing to recurse when converting type: ${typeString}`
    );
    return new UnknownType(typeString);
  }
  let converter = converters.get(node.kind);
  if (converter) {
    if (converter === intersectionConverter && !typeOrNode.isIntersection()) {
      converter = typeLiteralConverter;
    }
    seenTypes.add(typeOrNode.id);
    ++typeConversionDepth;
    const result = converter.convertType(
      context,
      typeOrNode,
      node,
      maybeNode
    );
    --typeConversionDepth;
    seenTypes.delete(typeOrNode.id);
    return result;
  }
  return requestBugReport(context, typeOrNode);
}
var arrayConverter = {
  kind: [ts13.SyntaxKind.ArrayType],
  convert(context, node) {
    return new ArrayType(convertType(context, node.elementType));
  },
  convertType(context, type2) {
    const params = type2.aliasTypeArguments || context.checker.getTypeArguments(type2);
    assert6(params.length > 0);
    return new ArrayType(convertType(context, params[0]));
  }
};
var conditionalConverter = {
  kind: [ts13.SyntaxKind.ConditionalType],
  convert(context, node) {
    return new ConditionalType(
      convertType(context, node.checkType),
      convertType(context, node.extendsType),
      convertType(context, node.trueType),
      convertType(context, node.falseType)
    );
  },
  convertType(context, type2) {
    return new ConditionalType(
      convertType(context, type2.checkType),
      convertType(context, type2.extendsType),
      convertType(context, type2.resolvedTrueType),
      convertType(context, type2.resolvedFalseType)
    );
  }
};
var constructorConverter = {
  kind: [ts13.SyntaxKind.ConstructorType],
  convert(context, node) {
    const symbol = context.getSymbolAtLocation(node) ?? node.symbol;
    const type2 = context.getTypeAtLocation(node);
    if (!symbol || !type2) {
      return new IntrinsicType5("Function");
    }
    const reflection = new DeclarationReflection7(
      "__type",
      ReflectionKind10.Constructor,
      context.scope
    );
    const rc = context.withScope(reflection);
    rc.convertingTypeNode = true;
    context.registerReflection(reflection, symbol);
    context.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      context,
      reflection
    );
    const signature = new SignatureReflection4(
      "__type",
      ReflectionKind10.ConstructorSignature,
      reflection
    );
    if (node.modifiers?.some(
      (m) => m.kind === ts13.SyntaxKind.AbstractKeyword
    )) {
      signature.setFlag(ReflectionFlag5.Abstract);
    }
    context.project.registerSymbolId(
      signature,
      context.createSymbolId(symbol, node)
    );
    context.registerReflection(signature, void 0);
    const signatureCtx = rc.withScope(signature);
    reflection.signatures = [signature];
    signature.type = convertType(signatureCtx, node.type);
    signature.parameters = convertParameterNodes(
      signatureCtx,
      signature,
      node.parameters
    );
    signature.typeParameters = convertTypeParameterNodes(
      signatureCtx,
      node.typeParameters
    );
    return new ReflectionType2(reflection);
  },
  convertType(context, type2) {
    const symbol = type2.getSymbol();
    if (!symbol) {
      return new IntrinsicType5("Function");
    }
    const reflection = new DeclarationReflection7(
      "__type",
      ReflectionKind10.Constructor,
      context.scope
    );
    context.registerReflection(reflection, symbol);
    context.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      context,
      reflection
    );
    createSignature(
      context.withScope(reflection),
      ReflectionKind10.ConstructorSignature,
      type2.getConstructSignatures()[0],
      symbol
    );
    return new ReflectionType2(reflection);
  }
};
var exprWithTypeArgsConverter = {
  kind: [ts13.SyntaxKind.ExpressionWithTypeArguments],
  convert(context, node) {
    const targetSymbol = context.getSymbolAtLocation(node.expression);
    if (!targetSymbol) {
      return convertType(
        context,
        context.checker.getTypeAtLocation(node)
      );
    }
    const parameters = node.typeArguments?.map((type2) => convertType(context, type2)) ?? [];
    const ref = context.createSymbolReference(
      context.resolveAliasedSymbol(targetSymbol),
      context
    );
    ref.typeArguments = parameters;
    return ref;
  },
  convertType: requestBugReport
};
var functionTypeConverter = {
  kind: [ts13.SyntaxKind.FunctionType],
  convert(context, node) {
    const symbol = context.getSymbolAtLocation(node) ?? node.symbol;
    const type2 = context.getTypeAtLocation(node);
    if (!symbol || !type2) {
      return new IntrinsicType5("Function");
    }
    const reflection = new DeclarationReflection7(
      "__type",
      ReflectionKind10.TypeLiteral,
      context.scope
    );
    const rc = context.withScope(reflection);
    context.registerReflection(reflection, symbol);
    context.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      context,
      reflection
    );
    const signature = new SignatureReflection4(
      "__type",
      ReflectionKind10.CallSignature,
      reflection
    );
    context.project.registerSymbolId(
      signature,
      context.createSymbolId(symbol, node)
    );
    context.registerReflection(signature, void 0);
    const signatureCtx = rc.withScope(signature);
    reflection.signatures = [signature];
    signature.type = convertType(signatureCtx, node.type);
    signature.parameters = convertParameterNodes(
      signatureCtx,
      signature,
      node.parameters
    );
    signature.typeParameters = convertTypeParameterNodes(
      signatureCtx,
      node.typeParameters
    );
    return new ReflectionType2(reflection);
  },
  convertType(context, type2) {
    const symbol = type2.getSymbol();
    if (!symbol) {
      return new IntrinsicType5("Function");
    }
    const reflection = new DeclarationReflection7(
      "__type",
      ReflectionKind10.TypeLiteral,
      context.scope
    );
    context.registerReflection(reflection, symbol);
    context.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      context,
      reflection
    );
    createSignature(
      context.withScope(reflection),
      ReflectionKind10.CallSignature,
      type2.getCallSignatures()[0],
      type2.getSymbol()
    );
    return new ReflectionType2(reflection);
  }
};
var importType = {
  kind: [ts13.SyntaxKind.ImportType],
  convert(context, node) {
    const name = node.qualifier?.getText() ?? "__module";
    const symbol = context.getSymbolAtLocation(node.qualifier || node);
    if (!symbol) {
      return new IntrinsicType5("any");
    }
    return context.createSymbolReference(
      context.resolveAliasedSymbol(symbol),
      context,
      name
    );
  },
  convertType(context, type2) {
    const symbol = type2.getSymbol();
    assert6(symbol, "Missing symbol when converting import type");
    return context.createSymbolReference(
      context.resolveAliasedSymbol(symbol),
      context,
      "__module"
    );
  }
};
var indexedAccessConverter = {
  kind: [ts13.SyntaxKind.IndexedAccessType],
  convert(context, node) {
    return new IndexedAccessType(
      convertType(context, node.objectType),
      convertType(context, node.indexType)
    );
  },
  convertType(context, type2) {
    return new IndexedAccessType(
      convertType(context, type2.objectType),
      convertType(context, type2.indexType)
    );
  }
};
var inferredConverter = {
  kind: [ts13.SyntaxKind.InferType],
  convert(context, node) {
    return new InferredType(
      node.typeParameter.name.text,
      maybeConvertType(context, node.typeParameter.constraint)
    );
  },
  convertType(context, type2) {
    return new InferredType(
      type2.getSymbol().name,
      maybeConvertType(context, type2.getConstraint())
    );
  }
};
var intersectionConverter = {
  kind: [ts13.SyntaxKind.IntersectionType],
  convert(context, node) {
    return new IntersectionType(
      node.types.map((type2) => convertType(context, type2))
    );
  },
  convertType(context, type2) {
    return new IntersectionType(
      type2.types.map((type3) => convertType(context, type3))
    );
  }
};
var intrinsicConverter = {
  kind: [ts13.SyntaxKind.IntrinsicKeyword],
  convert() {
    return new IntrinsicType5("intrinsic");
  },
  convertType() {
    return new IntrinsicType5("intrinsic");
  }
};
var jsDocVariadicTypeConverter = {
  kind: [ts13.SyntaxKind.JSDocVariadicType],
  convert(context, node) {
    return new ArrayType(convertType(context, node.type));
  },
  convertType(context, type2, _node, origNode) {
    assert6(isTypeReference(type2));
    return arrayConverter.convertType(context, type2, null, origNode);
  }
};
var keywordNames = {
  [ts13.SyntaxKind.AnyKeyword]: "any",
  [ts13.SyntaxKind.BigIntKeyword]: "bigint",
  [ts13.SyntaxKind.BooleanKeyword]: "boolean",
  [ts13.SyntaxKind.NeverKeyword]: "never",
  [ts13.SyntaxKind.NumberKeyword]: "number",
  [ts13.SyntaxKind.ObjectKeyword]: "object",
  [ts13.SyntaxKind.StringKeyword]: "string",
  [ts13.SyntaxKind.SymbolKeyword]: "symbol",
  [ts13.SyntaxKind.UndefinedKeyword]: "undefined",
  [ts13.SyntaxKind.UnknownKeyword]: "unknown",
  [ts13.SyntaxKind.VoidKeyword]: "void",
  [ts13.SyntaxKind.IntrinsicKeyword]: "intrinsic"
};
var keywordConverter = {
  kind: [
    ts13.SyntaxKind.AnyKeyword,
    ts13.SyntaxKind.BigIntKeyword,
    ts13.SyntaxKind.BooleanKeyword,
    ts13.SyntaxKind.NeverKeyword,
    ts13.SyntaxKind.NumberKeyword,
    ts13.SyntaxKind.ObjectKeyword,
    ts13.SyntaxKind.StringKeyword,
    ts13.SyntaxKind.SymbolKeyword,
    ts13.SyntaxKind.UndefinedKeyword,
    ts13.SyntaxKind.UnknownKeyword,
    ts13.SyntaxKind.VoidKeyword
  ],
  convert(_context, node) {
    return new IntrinsicType5(keywordNames[node.kind]);
  },
  convertType(_context, _type, node) {
    return new IntrinsicType5(keywordNames[node.kind]);
  }
};
var optionalConverter = {
  kind: [ts13.SyntaxKind.OptionalType],
  convert(context, node) {
    return new OptionalType(
      removeUndefined(convertType(context, node.type))
    );
  },
  // Handled by the tuple converter
  convertType: requestBugReport
};
var parensConverter = {
  kind: [ts13.SyntaxKind.ParenthesizedType],
  convert(context, node) {
    return convertType(context, node.type);
  },
  // TS strips these out too... shouldn't run into this.
  convertType: requestBugReport
};
var predicateConverter = {
  kind: [ts13.SyntaxKind.TypePredicate],
  convert(context, node) {
    const name = ts13.isThisTypeNode(node.parameterName) ? "this" : node.parameterName.getText();
    const asserts = !!node.assertsModifier;
    const targetType = node.type ? convertType(context, node.type) : void 0;
    return new PredicateType2(name, asserts, targetType);
  },
  // Never inferred by TS 4.0, could potentially change in a future TS version.
  convertType: requestBugReport
};
var typeLiteralConverter = {
  kind: [ts13.SyntaxKind.TypeLiteral],
  convert(context, node) {
    const symbol = context.getSymbolAtLocation(node) ?? node.symbol;
    const type2 = context.getTypeAtLocation(node);
    if (!symbol || !type2) {
      return new IntrinsicType5("Object");
    }
    const reflection = new DeclarationReflection7(
      "__type",
      ReflectionKind10.TypeLiteral,
      context.scope
    );
    const rc = context.withScope(reflection);
    rc.convertingTypeNode = true;
    context.registerReflection(reflection, symbol);
    context.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      context,
      reflection
    );
    for (const prop of context.checker.getPropertiesOfType(type2)) {
      convertSymbol(rc, prop);
    }
    for (const signature of type2.getCallSignatures()) {
      createSignature(
        rc,
        ReflectionKind10.CallSignature,
        signature,
        symbol
      );
    }
    for (const signature of type2.getConstructSignatures()) {
      createSignature(
        rc,
        ReflectionKind10.ConstructorSignature,
        signature,
        symbol
      );
    }
    convertIndexSignatures(rc, type2);
    return new ReflectionType2(reflection);
  },
  convertType(context, type2) {
    const symbol = type2.getSymbol();
    const reflection = new DeclarationReflection7(
      "__type",
      ReflectionKind10.TypeLiteral,
      context.scope
    );
    context.registerReflection(reflection, symbol);
    context.converter.trigger(
      ConverterEvents.CREATE_DECLARATION,
      context,
      reflection
    );
    for (const prop of context.checker.getPropertiesOfType(type2)) {
      convertSymbol(context.withScope(reflection), prop);
    }
    for (const signature of type2.getCallSignatures()) {
      createSignature(
        context.withScope(reflection),
        ReflectionKind10.CallSignature,
        signature,
        symbol
      );
    }
    for (const signature of type2.getConstructSignatures()) {
      createSignature(
        context.withScope(reflection),
        ReflectionKind10.ConstructorSignature,
        signature,
        symbol
      );
    }
    if (symbol) {
      convertIndexSignatures(context.withScope(reflection), type2);
    }
    return new ReflectionType2(reflection);
  }
};
var queryConverter = {
  kind: [ts13.SyntaxKind.TypeQuery],
  convert(context, node) {
    const querySymbol = context.getSymbolAtLocation(node.exprName);
    if (!querySymbol) {
      return new QueryType(
        ReferenceType3.createBrokenReference(
          node.exprName.getText(),
          context.project,
          void 0
        )
      );
    }
    const ref = context.createSymbolReference(
      context.resolveAliasedSymbol(querySymbol),
      context,
      node.exprName.getText()
    );
    ref.preferValues = true;
    return new QueryType(ref);
  },
  convertType(context, type2, node) {
    const symbol = context.getSymbolAtLocation(node.exprName) || type2.getSymbol();
    assert6(
      symbol,
      `Query type failed to get a symbol for: ${context.checker.typeToString(
        type2
      )}. This is a bug.`
    );
    const ref = context.createSymbolReference(
      context.resolveAliasedSymbol(symbol),
      context
    );
    ref.preferValues = true;
    return new QueryType(ref);
  }
};
var referenceConverter = {
  kind: [ts13.SyntaxKind.TypeReference],
  convert(context, node) {
    const type2 = context.checker.getTypeAtLocation(node.typeName);
    const isArray = context.checker.typeToTypeNode(
      type2,
      void 0,
      ts13.NodeBuilderFlags.IgnoreErrors
    )?.kind === ts13.SyntaxKind.ArrayType;
    if (isArray) {
      return new ArrayType(convertType(context, node.typeArguments?.[0]));
    }
    const symbol = context.expectSymbolAtLocation(node.typeName);
    const name = node.typeName.getText();
    if (!node.typeArguments && context.shouldInline(symbol, name)) {
      return convertTypeInlined(context, type2);
    }
    const ref = context.createSymbolReference(
      context.resolveAliasedSymbol(symbol),
      context,
      name
    );
    ref.typeArguments = node.typeArguments?.map((type3) => convertType(context, type3));
    return ref;
  },
  convertType(context, type2, node, originalNode) {
    const symbol = type2.aliasSymbol ?? type2.getSymbol() ?? node.typeName.symbol;
    if (!symbol) {
      const ref2 = ReferenceType3.createBrokenReference(
        context.checker.typeToString(type2),
        context.project,
        void 0
      );
      ref2.refersToTypeParameter = true;
      return ref2;
    }
    if (originalNode && ts13.isTypeReferenceNode(originalNode) && isObjectType(type2) && type2.objectFlags & ts13.ObjectFlags.Mapped) {
      return referenceConverter.convert(context, originalNode);
    }
    let name;
    if (ts13.isIdentifier(node.typeName)) {
      name = node.typeName.text;
    } else {
      name = node.typeName.right.text;
    }
    if (context.shouldInline(symbol, name)) {
      return convertTypeInlined(context, type2);
    }
    const ref = context.createSymbolReference(
      context.resolveAliasedSymbol(symbol),
      context,
      name
    );
    if (type2.flags & ts13.TypeFlags.Substitution && name === "NoInfer" && ref.package === "typescript") {
      ref.typeArguments = [
        convertType(context, type2.baseType)
      ];
    } else if (type2.flags & ts13.TypeFlags.StringMapping) {
      ref.typeArguments = [
        convertType(context, type2.type)
      ];
    } else {
      const args = type2.aliasSymbol ? type2.aliasTypeArguments : type2.typeArguments;
      const maxArgLength = originalNode && ts13.isTypeReferenceNode(originalNode) ? originalNode.typeArguments?.length ?? 0 : args?.length;
      ref.typeArguments = args?.slice(0, maxArgLength).map((ref2) => convertType(context, ref2));
    }
    return ref;
  }
};
var restConverter = {
  kind: [ts13.SyntaxKind.RestType],
  convert(context, node) {
    return new RestType(convertType(context, node.type));
  },
  // This is handled in the tuple converter
  convertType: requestBugReport
};
var namedTupleMemberConverter = {
  kind: [ts13.SyntaxKind.NamedTupleMember],
  convert(context, node) {
    const innerType = convertType(context, node.type);
    return new NamedTupleMember(
      node.name.getText(),
      !!node.questionToken,
      innerType
    );
  },
  // This ought to be impossible.
  convertType: requestBugReport
};
var mappedConverter = {
  kind: [ts13.SyntaxKind.MappedType],
  convert(context, node) {
    const optionalModifier = kindToModifier(node.questionToken?.kind);
    const templateType = convertType(context, node.type);
    return new MappedType(
      node.typeParameter.name.text,
      convertType(context, node.typeParameter.constraint),
      optionalModifier === "+" ? removeUndefined(templateType) : templateType,
      kindToModifier(node.readonlyToken?.kind),
      optionalModifier,
      node.nameType ? convertType(context, node.nameType) : void 0
    );
  },
  convertType(context, type2, node) {
    const optionalModifier = kindToModifier(node.questionToken?.kind);
    const templateType = convertType(context, type2.templateType);
    return new MappedType(
      type2.typeParameter.symbol.name || "__type",
      convertType(context, type2.typeParameter.getConstraint()),
      optionalModifier === "+" ? removeUndefined(templateType) : templateType,
      kindToModifier(node.readonlyToken?.kind),
      optionalModifier,
      type2.nameType ? convertType(context, type2.nameType) : void 0
    );
  }
};
var literalTypeConverter = {
  kind: [ts13.SyntaxKind.LiteralType],
  convert(context, node) {
    switch (node.literal.kind) {
      case ts13.SyntaxKind.TrueKeyword:
      case ts13.SyntaxKind.FalseKeyword:
        return new LiteralType2(
          node.literal.kind === ts13.SyntaxKind.TrueKeyword
        );
      case ts13.SyntaxKind.StringLiteral:
        return new LiteralType2(node.literal.text);
      case ts13.SyntaxKind.NumericLiteral:
        return new LiteralType2(Number(node.literal.text));
      case ts13.SyntaxKind.NullKeyword:
        return new LiteralType2(null);
      case ts13.SyntaxKind.PrefixUnaryExpression: {
        const operand = node.literal.operand;
        switch (operand.kind) {
          case ts13.SyntaxKind.NumericLiteral:
            return new LiteralType2(
              Number(node.literal.getText())
            );
          case ts13.SyntaxKind.BigIntLiteral:
            return new LiteralType2(
              BigInt(node.literal.getText().replace("n", ""))
            );
          default:
            return requestBugReport(context, node.literal);
        }
      }
      case ts13.SyntaxKind.BigIntLiteral:
        return new LiteralType2(
          BigInt(node.literal.getText().replace("n", ""))
        );
      case ts13.SyntaxKind.NoSubstitutionTemplateLiteral:
        return new LiteralType2(node.literal.text);
    }
    return requestBugReport(context, node.literal);
  },
  convertType(_context, type2, node) {
    switch (node.literal.kind) {
      case ts13.SyntaxKind.StringLiteral:
        return new LiteralType2(node.literal.text);
      case ts13.SyntaxKind.NumericLiteral:
        return new LiteralType2(+node.literal.text);
      case ts13.SyntaxKind.TrueKeyword:
      case ts13.SyntaxKind.FalseKeyword:
        return new LiteralType2(
          node.literal.kind === ts13.SyntaxKind.TrueKeyword
        );
      case ts13.SyntaxKind.NullKeyword:
        return new LiteralType2(null);
    }
    if (typeof type2.value === "object") {
      return new LiteralType2(
        BigInt(
          `${type2.value.negative ? "-" : ""}${type2.value.base10Value}`
        )
      );
    }
    return new LiteralType2(type2.value);
  }
};
var templateLiteralConverter = {
  kind: [ts13.SyntaxKind.TemplateLiteralType],
  convert(context, node) {
    return new TemplateLiteralType(
      node.head.text,
      node.templateSpans.map((span) => {
        return [convertType(context, span.type), span.literal.text];
      })
    );
  },
  convertType(context, type2) {
    assert6(type2.texts.length === type2.types.length + 1);
    const parts = [];
    for (const [a, b] of zip(type2.types, type2.texts.slice(1))) {
      parts.push([convertType(context, a), b]);
    }
    return new TemplateLiteralType(type2.texts[0], parts);
  }
};
var thisConverter = {
  kind: [ts13.SyntaxKind.ThisType],
  convert() {
    return new IntrinsicType5("this");
  },
  convertType() {
    return new IntrinsicType5("this");
  }
};
var tupleConverter = {
  kind: [ts13.SyntaxKind.TupleType],
  convert(context, node) {
    const elements = node.elements.map((node2) => convertType(context, node2));
    return new TupleType(elements);
  },
  convertType(context, type2, node) {
    const types = type2.typeArguments?.slice(0, node.elements.length);
    let elements = types?.map((type3) => convertType(context, type3));
    if (type2.target.labeledElementDeclarations) {
      const namedDeclarations = type2.target.labeledElementDeclarations;
      elements = elements?.map((el, i) => {
        const namedDecl = namedDeclarations[i];
        return namedDecl ? new NamedTupleMember(
          namedDecl.name.getText(),
          !!namedDecl.questionToken,
          removeUndefined(el)
        ) : el;
      });
    }
    elements = elements?.map((el, i) => {
      if (type2.target.elementFlags[i] & ts13.ElementFlags.Variable) {
        if (el instanceof NamedTupleMember) {
          return new RestType(
            new NamedTupleMember(
              el.name,
              el.isOptional,
              new ArrayType(el.element)
            )
          );
        }
        return new RestType(new ArrayType(el));
      }
      if (type2.target.elementFlags[i] & ts13.ElementFlags.Optional && !(el instanceof NamedTupleMember)) {
        return new OptionalType(removeUndefined(el));
      }
      return el;
    });
    return new TupleType(elements ?? []);
  }
};
var supportedOperatorNames = {
  [ts13.SyntaxKind.KeyOfKeyword]: "keyof",
  [ts13.SyntaxKind.UniqueKeyword]: "unique",
  [ts13.SyntaxKind.ReadonlyKeyword]: "readonly"
};
var typeOperatorConverter = {
  kind: [ts13.SyntaxKind.TypeOperator],
  convert(context, node) {
    return new TypeOperatorType(
      convertType(context, node.type),
      supportedOperatorNames[node.operator]
    );
  },
  convertType(context, type2, node) {
    if (node.operator === ts13.SyntaxKind.ReadonlyKeyword) {
      const resolved = resolveReference(type2);
      assert6(isObjectType(resolved));
      const args = context.checker.getTypeArguments(type2).map((type3) => convertType(context, type3));
      const inner = resolved.objectFlags & ts13.ObjectFlags.Tuple ? new TupleType(args) : new ArrayType(args[0]);
      return new TypeOperatorType(inner, "readonly");
    }
    if (node.operator === ts13.SyntaxKind.KeyOfKeyword) {
      const targetType = type2.type;
      return new TypeOperatorType(
        convertType(context, targetType),
        "keyof"
      );
    }
    return requestBugReport(context, type2);
  }
};
var unionConverter = {
  kind: [ts13.SyntaxKind.UnionType],
  convert(context, node) {
    return new UnionType3(
      node.types.map((type2) => convertType(context, type2))
    );
  },
  convertType(context, type2) {
    const types = type2.types.map((type3) => convertType(context, type3));
    normalizeUnion(types);
    sortUnion(types);
    return new UnionType3(types);
  }
};
var jSDocTypeExpressionConverter = {
  kind: [ts13.SyntaxKind.JSDocTypeExpression],
  convert(context, node) {
    return convertType(context, node.type);
  },
  convertType: requestBugReport
};
var jsDocNullableTypeConverter = {
  kind: [ts13.SyntaxKind.JSDocNullableType],
  convert(context, node) {
    return new UnionType3([
      convertType(context, node.type),
      new LiteralType2(null)
    ]);
  },
  // Should be a UnionType
  convertType: requestBugReport
};
var jsDocNonNullableTypeConverter = {
  kind: [ts13.SyntaxKind.JSDocNonNullableType],
  convert(context, node) {
    return convertType(context, node.type);
  },
  // Should be a UnionType
  convertType: requestBugReport
};
var jsDocAllTypeConverter = {
  kind: [ts13.SyntaxKind.JSDocAllType],
  convert() {
    return new IntrinsicType5("any");
  },
  // Should be a UnionType
  convertType: requestBugReport
};
function requestBugReport(context, nodeOrType) {
  if ("kind" in nodeOrType) {
    const kindName = ts13.SyntaxKind[nodeOrType.kind];
    context.logger.warn(
      `Failed to convert type node with kind: ${kindName} and text ${nodeOrType.getText()}. Please report a bug.`,
      nodeOrType
    );
    return new UnknownType(nodeOrType.getText());
  } else {
    const typeString = context.checker.typeToString(nodeOrType);
    context.logger.warn(
      `Failed to convert type: ${typeString} when converting ${context.scope.getFullName()}. Please report a bug.`
    );
    return new UnknownType(typeString);
  }
}
function resolveReference(type2) {
  if (isObjectType(type2) && type2.objectFlags & ts13.ObjectFlags.Reference) {
    return type2.target;
  }
  return type2;
}
function kindToModifier(kind) {
  switch (kind) {
    case ts13.SyntaxKind.ReadonlyKeyword:
    case ts13.SyntaxKind.QuestionToken:
    case ts13.SyntaxKind.PlusToken:
      return "+";
    case ts13.SyntaxKind.MinusToken:
      return "-";
    default:
      return void 0;
  }
}
function sortUnion(types) {
  if (types.every((t) => t.type === "literal" && typeof t.value === "number")) {
    types.sort((a, b) => {
      const aLit = a;
      const bLit = b;
      return aLit.value - bLit.value;
    });
    return;
  }
  types.sort((a, b) => {
    const aIsNull = a.type === "literal" && a.value === null;
    const aIsUndef = a.type === "intrinsic" && a.name === "undefined";
    const bIsNull = b.type === "literal" && b.value === null;
    const bIsUndef = b.type === "intrinsic" && b.name === "undefined";
    const aWeight = aIsNull ? 1 : aIsUndef ? 2 : 0;
    const bWeight = bIsNull ? 1 : bIsUndef ? 2 : 0;
    return aWeight - bWeight;
  });
}
function normalizeUnion(types) {
  let trueIndex = -1;
  let falseIndex = -1;
  for (let i = 0; i < types.length && (trueIndex === -1 || falseIndex === -1); i++) {
    const t = types[i];
    if (t instanceof LiteralType2) {
      if (t.value === true) {
        trueIndex = i;
      }
      if (t.value === false) {
        falseIndex = i;
      }
    }
  }
  if (trueIndex !== -1 && falseIndex !== -1) {
    types.splice(Math.max(trueIndex, falseIndex), 1);
    types.splice(
      Math.min(trueIndex, falseIndex),
      1,
      new IntrinsicType5("boolean")
    );
  }
}
function convertTypeInlined(context, type2) {
  if (type2.isUnion()) {
    const types = type2.types.map((type3) => convertType(context, type3));
    return new UnionType3(types);
  }
  if (type2.isIntersection()) {
    const types = type2.types.map((type3) => convertType(context, type3));
    return new IntersectionType(types);
  }
  if (type2.isLiteral()) {
    return new LiteralType2(
      typeof type2.value === "object" ? BigInt(type2.value.base10Value) * (type2.value.negative ? -1n : 1n) : type2.value
    );
  }
  if (context.checker.isArrayType(type2)) {
    const elementType = convertType(context, context.checker.getTypeArguments(type2)[0]);
    return new ArrayType(elementType);
  }
  if (isTypeReference(type2) && context.checker.isTupleType(type2)) {
    const tupleNode = context.checker.typeToTypeNode(type2.target, void 0, ts13.NodeBuilderFlags.IgnoreErrors);
    if (ts13.isTupleTypeNode(tupleNode)) {
      return tupleConverter.convertType(context, type2, tupleNode);
    }
  }
  return typeLiteralConverter.convertType(
    context,
    type2
  );
}

// src/lib/converter/plugins/CategoryPlugin.ts
import {
  Comment as Comment4,
  ContainerReflection as ContainerReflection3,
  ReflectionCategory,
  ReflectionKind as ReflectionKind11
} from "#models";
import { getSortFunction, isValidSortStrategy, Option } from "#node-utils";
import { i18n as i18n7 } from "#utils";
import assert7 from "assert";

// src/lib/application-events.ts
var ApplicationEvents = {
  BOOTSTRAP_END: "bootstrapEnd",
  REVIVE: "reviveProject",
  VALIDATE_PROJECT: "validateProject",
  GENERATE_OUTPUTS_BEGIN: "generateOutputsBegin",
  GENERATE_OUTPUTS_END: "generateOutputsEnd"
};

// src/lib/converter/components.ts
import { AbstractComponent } from "#node-utils";
var ConverterComponent = class extends AbstractComponent {
};

// src/lib/converter/plugins/CategoryPlugin.ts
var _categorizeByGroup_dec, _categoryOrder_dec, _defaultCategory_dec, _a, _init, _defaultCategory, _categoryOrder, _categorizeByGroup;
var _CategoryPlugin = class _CategoryPlugin extends (_a = ConverterComponent, _defaultCategory_dec = [Option("defaultCategory")], _categoryOrder_dec = [Option("categoryOrder")], _categorizeByGroup_dec = [Option("categorizeByGroup")], _a) {
  constructor(owner) {
    super(owner);
    __publicField(this, "defaultSortFunction");
    __privateAdd(this, _defaultCategory, __runInitializers(_init, 8, this)), __runInitializers(_init, 11, this);
    __privateAdd(this, _categoryOrder, __runInitializers(_init, 12, this)), __runInitializers(_init, 15, this);
    __privateAdd(this, _categorizeByGroup, __runInitializers(_init, 16, this)), __runInitializers(_init, 19, this);
    this.owner.on(
      ConverterEvents.RESOLVE_END,
      this.onEndResolve.bind(this),
      -200
    );
    this.application.on(
      ApplicationEvents.REVIVE,
      this.onRevive.bind(this),
      -200
    );
  }
  onRevive(project) {
    this.setup();
    this.categorize(project);
    for (const refl of project.getReflectionsByKind(
      ReflectionKind11.SomeModule
    )) {
      assert7(refl.isDeclaration());
      this.categorize(refl);
    }
  }
  /**
   * Triggered when the converter begins converting a project.
   */
  setup() {
    this.defaultSortFunction = getSortFunction(this.application.options);
    if (this.defaultCategory) {
      _CategoryPlugin.defaultCategory = this.defaultCategory;
    }
    _CategoryPlugin.WEIGHTS = this.categoryOrder;
  }
  /**
   * Triggered when the converter has finished resolving a project.
   *
   * @param context  The context object describing the current state the converter is in.
   */
  onEndResolve(context) {
    this.setup();
    const project = context.project;
    this.categorize(project);
    for (const id in project.reflections) {
      const reflection = project.reflections[id];
      if (reflection instanceof ContainerReflection3) {
        this.categorize(reflection);
      }
    }
  }
  categorize(obj) {
    if (this.categorizeByGroup && obj.groups) {
      this.groupCategorize(obj);
    } else {
      this.lumpCategorize(obj);
    }
  }
  groupCategorize(obj) {
    if (!obj.groups || obj.groups.length === 0) {
      return;
    }
    obj.groups.forEach((group2) => {
      if (group2.categories) return;
      group2.categories = this.getReflectionCategories(
        obj,
        group2.children
      );
      if (group2.categories.length > 1) {
        group2.categories.sort(_CategoryPlugin.sortCatCallback);
      } else if (group2.categories.length === 1 && group2.categories[0].title === _CategoryPlugin.defaultCategory) {
        group2.categories = void 0;
      }
    });
  }
  lumpCategorize(obj) {
    if (!obj.childrenIncludingDocuments || obj.categories) {
      return;
    }
    obj.categories = this.getReflectionCategories(
      obj,
      obj.childrenIncludingDocuments
    );
    if (obj.categories.length > 1) {
      obj.categories.sort(_CategoryPlugin.sortCatCallback);
    } else if (obj.categories.length === 1 && obj.categories[0].title === _CategoryPlugin.defaultCategory) {
      obj.categories = void 0;
    }
  }
  /**
   * Create a categorized representation of the given list of reflections.
   *
   * @param reflections  The reflections that should be categorized.
   * @returns An array containing all children of the given reflection categorized
   */
  getReflectionCategories(parent, reflections) {
    const categories = /* @__PURE__ */ new Map();
    for (const child of reflections) {
      const childCategories = _CategoryPlugin.getCategories(child);
      if (childCategories.size === 0) {
        childCategories.add(_CategoryPlugin.defaultCategory);
      }
      for (const childCat of childCategories) {
        const category = categories.get(childCat);
        if (category) {
          category.children.push(child);
        } else {
          const cat = new ReflectionCategory(childCat);
          cat.children.push(child);
          categories.set(childCat, cat);
        }
      }
    }
    if (parent.comment) {
      for (const tag of parent.comment.blockTags) {
        if (tag.tag === "@categoryDescription") {
          const { header: header2, body } = Comment4.splitPartsToHeaderAndBody(
            tag.content
          );
          const cat = categories.get(header2);
          if (cat) {
            cat.description = body;
          } else {
            this.application.logger.warn(
              i18n7.comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group(
                parent.getFriendlyFullName(),
                header2
              )
            );
          }
        }
      }
    }
    for (const cat of categories.values()) {
      this.getSortFunction(parent)(cat.children);
    }
    return Array.from(categories.values());
  }
  getSortFunction(reflection) {
    const tag = reflection.comment?.getTag("@sortStrategy");
    if (tag) {
      const text = Comment4.combineDisplayParts(tag.content);
      const strategies = text.split(/[,\s]+/).filter(isValidSortStrategy);
      return getSortFunction(this.application.options, strategies);
    }
    return this.defaultSortFunction;
  }
  /**
   * Callback used to sort categories by name.
   *
   * @param a The left reflection to sort.
   * @param b The right reflection to sort.
   * @returns The sorting weight.
   */
  static sortCatCallback(a, b) {
    let aWeight = _CategoryPlugin.WEIGHTS.indexOf(a.title);
    let bWeight = _CategoryPlugin.WEIGHTS.indexOf(b.title);
    if (aWeight === -1 || bWeight === -1) {
      let asteriskIndex = _CategoryPlugin.WEIGHTS.indexOf("*");
      if (asteriskIndex === -1) {
        asteriskIndex = _CategoryPlugin.WEIGHTS.length;
      }
      if (aWeight === -1) {
        aWeight = asteriskIndex;
      }
      if (bWeight === -1) {
        bWeight = asteriskIndex;
      }
    }
    if (aWeight === bWeight) {
      return a.title.localeCompare(b.title);
    }
    return aWeight - bWeight;
  }
  static getCategories(reflection) {
    const categories = /* @__PURE__ */ new Set();
    function discoverCategories(comment) {
      if (!comment) return;
      for (const tag of comment.blockTags) {
        if (tag.tag === "@category") {
          categories.add(
            Comment4.combineDisplayParts(tag.content).trim()
          );
        }
      }
    }
    discoverCategories(reflection.comment);
    if (reflection.isDeclaration()) {
      for (const sig of reflection.getNonIndexSignatures()) {
        discoverCategories(sig.comment);
      }
      if (reflection.type?.type === "reflection") {
        discoverCategories(reflection.type.declaration.comment);
        for (const sig of reflection.type.declaration.getNonIndexSignatures()) {
          discoverCategories(sig.comment);
        }
      }
    }
    if (reflection.isDocument() && "category" in reflection.frontmatter) {
      categories.add(String(reflection.frontmatter["category"]));
    }
    categories.delete("");
    return categories;
  }
};
_init = __decoratorStart(_a);
_defaultCategory = new WeakMap();
_categoryOrder = new WeakMap();
_categorizeByGroup = new WeakMap();
__decorateElement(_init, 4, "defaultCategory", _defaultCategory_dec, _CategoryPlugin, _defaultCategory);
__decorateElement(_init, 4, "categoryOrder", _categoryOrder_dec, _CategoryPlugin, _categoryOrder);
__decorateElement(_init, 4, "categorizeByGroup", _categorizeByGroup_dec, _CategoryPlugin, _categorizeByGroup);
__decoratorMetadata(_init, _CategoryPlugin);
// For use in static methods
__publicField(_CategoryPlugin, "defaultCategory", "Other");
__publicField(_CategoryPlugin, "WEIGHTS", []);
var CategoryPlugin = _CategoryPlugin;

// src/lib/converter/plugins/CommentPlugin.ts
import {
  Comment as Comment5,
  CommentTag as CommentTag2,
  DeclarationReflection as DeclarationReflection8,
  ParameterReflection as ParameterReflection3,
  ReflectionFlag as ReflectionFlag6,
  ReflectionKind as ReflectionKind12,
  ReflectionType as ReflectionType3,
  SignatureReflection as SignatureReflection5
} from "#models";
import { Option as Option2 } from "#node-utils";
import {
  filterMap as filterMap2,
  i18n as i18n8,
  partition,
  removeIf as removeIf3,
  removeIfPresent,
  setIntersection,
  unique
} from "#utils";
var NEVER_RENDERED = [
  "@augments",
  "@callback",
  "@class",
  "@constructor",
  "@enum",
  "@extends",
  "@type",
  "@typedef",
  "@jsx"
];
var MUTUALLY_EXCLUSIVE_MODIFIERS = [
  /* @__PURE__ */ new Set([
    "@alpha",
    "@beta",
    "@experimental",
    "@internal",
    "@public"
  ])
];
var _suppressCommentWarningsInDeclarationFiles_dec, _defaultCategory_dec2, _excludeCategories_dec, _excludeNotDocumented_dec, _excludeProtected_dec, _excludePrivateClassFields_dec, _excludePrivate_dec, _excludeInternal_dec, _cascadedModifierTags_dec, _excludeTags_dec, _a2, _init2, _excludeTags, _cascadedModifierTags, _excludeInternal, _excludePrivate, _excludePrivateClassFields, _excludeProtected, _excludeNotDocumented, _excludeCategories, _defaultCategory2, _suppressCommentWarningsInDeclarationFiles;
var CommentPlugin = class extends (_a2 = ConverterComponent, _excludeTags_dec = [Option2("excludeTags")], _cascadedModifierTags_dec = [Option2("cascadedModifierTags")], _excludeInternal_dec = [Option2("excludeInternal")], _excludePrivate_dec = [Option2("excludePrivate")], _excludePrivateClassFields_dec = [Option2("excludePrivateClassFields")], _excludeProtected_dec = [Option2("excludeProtected")], _excludeNotDocumented_dec = [Option2("excludeNotDocumented")], _excludeCategories_dec = [Option2("excludeCategories")], _defaultCategory_dec2 = [Option2("defaultCategory")], _suppressCommentWarningsInDeclarationFiles_dec = [Option2("suppressCommentWarningsInDeclarationFiles")], _a2) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _excludeTags, __runInitializers(_init2, 8, this)), __runInitializers(_init2, 11, this);
    __privateAdd(this, _cascadedModifierTags, __runInitializers(_init2, 12, this)), __runInitializers(_init2, 15, this);
    __privateAdd(this, _excludeInternal, __runInitializers(_init2, 16, this)), __runInitializers(_init2, 19, this);
    __privateAdd(this, _excludePrivate, __runInitializers(_init2, 20, this)), __runInitializers(_init2, 23, this);
    __privateAdd(this, _excludePrivateClassFields, __runInitializers(_init2, 24, this)), __runInitializers(_init2, 27, this);
    __privateAdd(this, _excludeProtected, __runInitializers(_init2, 28, this)), __runInitializers(_init2, 31, this);
    __privateAdd(this, _excludeNotDocumented, __runInitializers(_init2, 32, this)), __runInitializers(_init2, 35, this);
    __privateAdd(this, _excludeCategories, __runInitializers(_init2, 36, this)), __runInitializers(_init2, 39, this);
    __privateAdd(this, _defaultCategory2, __runInitializers(_init2, 40, this)), __runInitializers(_init2, 43, this);
    __privateAdd(this, _suppressCommentWarningsInDeclarationFiles, __runInitializers(_init2, 44, this)), __runInitializers(_init2, 47, this);
    __publicField(this, "_excludeKinds");
    this.owner.on(
      ConverterEvents.CREATE_DECLARATION,
      this.onDeclaration.bind(this)
    );
    this.owner.on(
      ConverterEvents.CREATE_SIGNATURE,
      this.onDeclaration.bind(this)
    );
    this.owner.on(
      ConverterEvents.CREATE_TYPE_PARAMETER,
      this.onCreateTypeParameter.bind(this)
    );
    this.owner.on(
      ConverterEvents.RESOLVE_BEGIN,
      this.onBeginResolve.bind(this)
    );
    this.owner.on(ConverterEvents.RESOLVE, this.onResolve.bind(this));
    this.owner.on(ConverterEvents.END, () => {
      this._excludeKinds = void 0;
    });
  }
  get excludeNotDocumentedKinds() {
    this._excludeKinds ??= this.application.options.getValue("excludeNotDocumentedKinds").reduce((a, b) => a | ReflectionKind12[b], 0);
    return this._excludeKinds;
  }
  /**
   * Apply all comment tag modifiers to the given reflection.
   *
   * @param reflection  The reflection the modifiers should be applied to.
   * @param comment  The comment that should be searched for modifiers.
   */
  applyModifiers(reflection, comment) {
    if (reflection.kindOf(ReflectionKind12.SomeModule)) {
      comment.removeModifier("@namespace");
    }
    if (reflection.kindOf(ReflectionKind12.Interface)) {
      comment.removeModifier("@interface");
    }
    if (comment.hasModifier("@abstract")) {
      if (reflection.kindOf(ReflectionKind12.SomeSignature)) {
        reflection.parent.setFlag(ReflectionFlag6.Abstract);
      } else {
        reflection.setFlag(ReflectionFlag6.Abstract);
      }
      comment.removeModifier("@abstract");
    }
    if (comment.hasModifier("@private")) {
      reflection.setFlag(ReflectionFlag6.Private);
      if (reflection.kindOf(ReflectionKind12.CallSignature)) {
        reflection.parent?.setFlag(ReflectionFlag6.Private);
      }
      comment.removeModifier("@private");
    }
    if (comment.hasModifier("@protected")) {
      reflection.setFlag(ReflectionFlag6.Protected);
      if (reflection.kindOf(ReflectionKind12.CallSignature)) {
        reflection.parent?.setFlag(ReflectionFlag6.Protected);
      }
      comment.removeModifier("@protected");
    }
    if (comment.hasModifier("@public")) {
      reflection.setFlag(ReflectionFlag6.Public);
      if (reflection.kindOf(ReflectionKind12.CallSignature)) {
        reflection.parent?.setFlag(ReflectionFlag6.Public);
      }
      comment.removeModifier("@public");
    }
    if (comment.hasModifier("@readonly")) {
      const target = reflection.kindOf(ReflectionKind12.GetSignature) ? reflection.parent : reflection;
      target.setFlag(ReflectionFlag6.Readonly);
      comment.removeModifier("@readonly");
    }
    if (comment.hasModifier("@event") || comment.hasModifier("@eventProperty")) {
      comment.blockTags.push(
        new CommentTag2("@group", [{ kind: "text", text: "Events" }])
      );
      comment.removeModifier("@event");
      comment.removeModifier("@eventProperty");
    }
    if (reflection.kindOf(
      ReflectionKind12.Project | ReflectionKind12.SomeModule
    )) {
      comment.removeTags("@module");
      comment.removeModifier("@packageDocumentation");
    }
  }
  /**
   * Triggered when the converter has created a type parameter reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   */
  onCreateTypeParameter(_context, reflection) {
    if (reflection.comment) return;
    const comment = reflection.parent?.comment;
    if (comment) {
      let tag = comment.getIdentifiedTag(reflection.name, "@typeParam");
      if (!tag) {
        tag = comment.getIdentifiedTag(reflection.name, "@template");
      }
      if (!tag) {
        tag = comment.getIdentifiedTag(
          `<${reflection.name}>`,
          "@param"
        );
      }
      if (!tag) {
        tag = comment.getIdentifiedTag(reflection.name, "@param");
      }
      if (tag) {
        reflection.comment = new Comment5(tag.content);
        reflection.comment.sourcePath = comment.sourcePath;
        removeIfPresent(comment.blockTags, tag);
        return;
      }
    }
    if (reflection.parent?.kindOf(ReflectionKind12.ConstructorSignature) && reflection.parent.parent?.kindOf(ReflectionKind12.Constructor)) {
      const cls = reflection.parent.parent.parent;
      const typeParam = cls.typeParameters?.find((param) => param.name === reflection.name);
      if (typeParam?.comment) {
        reflection.comment = typeParam.comment.clone();
      }
    }
  }
  /**
   * Triggered when the converter has created a declaration or signature reflection.
   *
   * Invokes the comment parser.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  onDeclaration(_context, reflection) {
    this.cascadeModifiers(reflection);
    const comment = reflection.comment;
    if (!comment) return;
    if (reflection.kindOf(ReflectionKind12.SomeModule)) {
      const tag = comment.getTag("@module");
      if (tag) {
        const newName = Comment5.combineDisplayParts(tag.content).trim();
        if (newName.length && !newName.includes("\n")) {
          reflection.name = newName;
        }
        removeIfPresent(comment.blockTags, tag);
      }
    }
    this.applyModifiers(reflection, comment);
    this.removeExcludedTags(comment);
  }
  /**
   * Triggered when the converter begins resolving a project.
   *
   * @param context  The context object describing the current state the converter is in.
   */
  onBeginResolve(context) {
    if (context.project.comment) {
      this.applyModifiers(context.project, context.project.comment);
      this.removeExcludedTags(context.project.comment);
    }
    const project = context.project;
    const reflections = Object.values(project.reflections);
    const hidden = /* @__PURE__ */ new Set();
    for (const ref of reflections) {
      if (ref.kindOf(ReflectionKind12.Accessor) && ref.flags.isReadonly) {
        const decl = ref;
        if (decl.setSignature) {
          hidden.add(decl.setSignature);
        }
        ref.setFlag(ReflectionFlag6.Readonly, false);
      }
      if (this.isHidden(ref)) {
        hidden.add(ref);
      }
    }
    hidden.forEach((reflection) => project.removeReflection(reflection));
    const [allRemoved, someRemoved] = partition(
      unique(
        filterMap2(hidden, (reflection) => reflection.parent?.kindOf(ReflectionKind12.SignatureContainer) ? reflection.parent : void 0)
      ),
      (method) => method.getNonIndexSignatures().length === 0
    );
    allRemoved.forEach((reflection) => {
      project.removeReflection(reflection);
    });
    someRemoved.forEach((reflection) => {
      reflection.sources = reflection.getNonIndexSignatures().flatMap((s) => s.sources ?? []);
    });
  }
  /**
   * Triggered when the converter resolves a reflection.
   *
   * Cleans up comment tags related to signatures like `@param` or `@returns`
   * and moves their data to the corresponding parameter reflections.
   *
   * This hook also copies over the comment of function implementations to their
   * signatures.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently resolved.
   */
  onResolve(context, reflection) {
    if (reflection.comment) {
      if (reflection.comment.label && !/[A-Z_][A-Z0-9_]/.test(reflection.comment.label) && !this.suppressCommentWarnings(reflection.comment)) {
        context.logger.warn(
          i18n8.label_0_for_1_cannot_be_referenced(
            reflection.comment.label,
            reflection.getFriendlyFullName()
          )
        );
      }
      for (const group2 of MUTUALLY_EXCLUSIVE_MODIFIERS) {
        const intersect = setIntersection(
          group2,
          reflection.comment.modifierTags
        );
        if (intersect.size > 1 && !this.suppressCommentWarnings(reflection.comment)) {
          const [a, b] = intersect;
          context.logger.warn(
            i18n8.modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2(
              a,
              b,
              reflection.getFriendlyFullName()
            )
          );
        }
      }
      mergeSeeTags(reflection.comment);
      movePropertyTags(reflection.comment, reflection);
      if (reflection.kindOf(ReflectionKind12.Class)) {
        reflection.comment.removeModifier("@hideconstructor");
      }
      reflection.comment.removeModifier("@primaryExport");
    }
    if ((reflection instanceof DeclarationReflection8 || reflection instanceof ParameterReflection3) && reflection.comment) {
      let sigs = [];
      if (reflection.type instanceof ReflectionType3) {
        sigs = reflection.type.declaration.getNonIndexSignatures();
      } else if (reflection instanceof DeclarationReflection8) {
        sigs = reflection.getNonIndexSignatures();
      }
      if (sigs.length === 1 && !sigs[0].comment) {
        this.moveSignatureParamComments(sigs[0], reflection.comment);
        const returnsTag = reflection.comment.getTag("@returns");
        if (returnsTag) {
          sigs[0].comment = new Comment5();
          sigs[0].comment.sourcePath = reflection.comment.sourcePath;
          sigs[0].comment.blockTags.push(returnsTag);
          reflection.comment.removeTags("@returns");
        }
      }
      if (sigs.length && reflection.type?.type !== "reflection") {
        for (const mod of this.cascadedModifierTags) {
          reflection.comment.modifierTags.delete(mod);
        }
      }
    }
    if (reflection instanceof SignatureReflection5) {
      this.moveSignatureParamComments(reflection);
    }
  }
  moveSignatureParamComments(signature, comment = signature.comment) {
    if (!comment) return;
    const unusedCommentParams = comment.blockTags.filter(
      (tag) => tag.tag === "@param" && tag.name && !tag.name.includes(".") && !signature.parameters?.some((p) => p.name === tag.name)
    );
    signature.parameters?.forEach((parameter) => {
      if (parameter.name === "__namedParameters" && unusedCommentParams.length) {
        parameter.name = unusedCommentParams[0].name;
        unusedCommentParams.splice(0, 1);
      }
      const tag = comment.getIdentifiedTag(parameter.name, "@param");
      if (tag) {
        parameter.comment = new Comment5(Comment5.cloneDisplayParts(tag.content));
        parameter.comment.sourcePath = comment.sourcePath;
      } else if (parameter.name === "this") {
        const thisTag = comment.getTag("@this");
        if (thisTag) {
          parameter.comment = new Comment5(Comment5.cloneDisplayParts(thisTag.content));
          parameter.comment.sourcePath = comment.sourcePath;
        }
      }
    });
    for (const parameter of signature.typeParameters || []) {
      const tag = comment.getIdentifiedTag(parameter.name, "@typeParam") || comment.getIdentifiedTag(parameter.name, "@template") || comment.getIdentifiedTag(`<${parameter.name}>`, "@param");
      if (tag) {
        parameter.comment = new Comment5(
          Comment5.cloneDisplayParts(tag.content)
        );
        parameter.comment.sourcePath = comment.sourcePath;
      }
    }
    this.validateParamTags(signature, comment, signature.parameters || []);
    comment.removeTags("@this");
    comment.removeTags("@param");
    comment.removeTags("@typeParam");
    comment.removeTags("@template");
  }
  removeExcludedTags(comment) {
    for (const tag of NEVER_RENDERED) {
      comment.removeTags(tag);
      comment.removeModifier(tag);
    }
    for (const tag of this.excludeTags) {
      comment.removeTags(tag);
      comment.removeModifier(tag);
    }
  }
  cascadeModifiers(reflection) {
    const parentComment = reflection.parent?.comment;
    if (!parentComment || reflection.kindOf(ReflectionKind12.TypeLiteral)) {
      return;
    }
    const childMods = reflection.comment?.modifierTags ?? /* @__PURE__ */ new Set();
    for (const mod of this.cascadedModifierTags) {
      if (parentComment.hasModifier(mod)) {
        const exclusiveSet = MUTUALLY_EXCLUSIVE_MODIFIERS.find((tags) => tags.has(mod));
        if (!exclusiveSet || Array.from(exclusiveSet).every((tag) => !childMods.has(tag))) {
          reflection.comment ||= new Comment5();
          reflection.comment.modifierTags.add(mod);
        }
      }
    }
  }
  /**
   * Determines whether or not a reflection has been hidden
   *
   * @param reflection Reflection to check if hidden
   */
  isHidden(reflection) {
    const comment = reflection.comment;
    if (reflection.flags.hasFlag(ReflectionFlag6.Private) && this.excludePrivate) {
      return true;
    }
    if (reflection.flags.hasFlag(ReflectionFlag6.Private) && reflection.name.startsWith("#") && this.excludePrivateClassFields) {
      return true;
    }
    if (reflection.flags.hasFlag(ReflectionFlag6.Protected) && this.excludeProtected) {
      return true;
    }
    if (this.excludedByCategory(reflection)) {
      return true;
    }
    if (reflection.kindOf(
      ReflectionKind12.ConstructorSignature | ReflectionKind12.Constructor
    )) {
      if (comment?.hasModifier("@hideconstructor")) return true;
      const cls = reflection.parent?.kindOf(ReflectionKind12.Class) ? reflection.parent : reflection.parent?.parent?.kindOf(ReflectionKind12.Class) ? reflection.parent.parent : void 0;
      if (cls?.comment?.hasModifier("@hideconstructor")) {
        return true;
      }
    }
    if (!comment) {
      if (reflection.kindOf(
        ReflectionKind12.CallSignature | ReflectionKind12.ConstructorSignature
      ) && reflection.parent?.comment) {
        return false;
      }
      if (this.excludeNotDocumented) {
        if (!(reflection instanceof DeclarationReflection8) && !(reflection instanceof SignatureReflection5)) {
          return false;
        }
        if (!reflection.kindOf(this.excludeNotDocumentedKinds)) {
          return false;
        }
        if (reflection.kindOf(ReflectionKind12.SomeModule)) {
          if (!reflection.children) {
            return true;
          }
          return reflection.children.every((child) => this.isHidden(child));
        }
        if (reflection.kindOf(ReflectionKind12.SignatureContainer)) {
          return reflection.getAllSignatures().every((child) => this.isHidden(child));
        }
        return inTypeLiteral(reflection) === false;
      }
      return false;
    }
    const isHidden = comment.hasModifier("@hidden") || comment.hasModifier("@ignore") || comment.hasModifier("@internal") && this.excludeInternal;
    if (!isHidden && reflection.kindOf(ReflectionKind12.ContainsCallSignatures)) {
      return reflection.getNonIndexSignatures().every((sig) => this.isHidden(sig));
    }
    return isHidden;
  }
  excludedByCategory(reflection) {
    const excludeCategories = this.excludeCategories;
    let target;
    if (reflection instanceof DeclarationReflection8) {
      target = reflection;
    } else if (reflection instanceof SignatureReflection5) {
      target = reflection.parent;
    }
    if (!target || !excludeCategories.length) return false;
    const categories = CategoryPlugin.getCategories(target);
    if (categories.size === 0) {
      categories.add(this.defaultCategory);
    }
    return excludeCategories.some((cat) => categories.has(cat));
  }
  validateParamTags(signature, comment, params) {
    const paramTags = comment.blockTags.filter(
      (tag) => tag.tag === "@param"
    );
    removeIf3(paramTags, (tag) => params.some((param) => param.name === tag.name));
    moveNestedParamTags(
      /* in-out */
      paramTags,
      params,
      comment.sourcePath
    );
    if (!comment.inheritedFromParentDeclaration && !this.suppressCommentWarnings(comment)) {
      for (const tag of paramTags) {
        this.application.logger.warn(
          i18n8.signature_0_has_unused_param_with_name_1(
            signature.getFriendlyFullName(),
            tag.name ?? "(missing)"
          )
        );
      }
    }
  }
  suppressCommentWarnings(comment) {
    return this.suppressCommentWarningsInDeclarationFiles && /\.d\.(ts|mts|cts)$/.test(comment.sourcePath || "");
  }
};
_init2 = __decoratorStart(_a2);
_excludeTags = new WeakMap();
_cascadedModifierTags = new WeakMap();
_excludeInternal = new WeakMap();
_excludePrivate = new WeakMap();
_excludePrivateClassFields = new WeakMap();
_excludeProtected = new WeakMap();
_excludeNotDocumented = new WeakMap();
_excludeCategories = new WeakMap();
_defaultCategory2 = new WeakMap();
_suppressCommentWarningsInDeclarationFiles = new WeakMap();
__decorateElement(_init2, 4, "excludeTags", _excludeTags_dec, CommentPlugin, _excludeTags);
__decorateElement(_init2, 4, "cascadedModifierTags", _cascadedModifierTags_dec, CommentPlugin, _cascadedModifierTags);
__decorateElement(_init2, 4, "excludeInternal", _excludeInternal_dec, CommentPlugin, _excludeInternal);
__decorateElement(_init2, 4, "excludePrivate", _excludePrivate_dec, CommentPlugin, _excludePrivate);
__decorateElement(_init2, 4, "excludePrivateClassFields", _excludePrivateClassFields_dec, CommentPlugin, _excludePrivateClassFields);
__decorateElement(_init2, 4, "excludeProtected", _excludeProtected_dec, CommentPlugin, _excludeProtected);
__decorateElement(_init2, 4, "excludeNotDocumented", _excludeNotDocumented_dec, CommentPlugin, _excludeNotDocumented);
__decorateElement(_init2, 4, "excludeCategories", _excludeCategories_dec, CommentPlugin, _excludeCategories);
__decorateElement(_init2, 4, "defaultCategory", _defaultCategory_dec2, CommentPlugin, _defaultCategory2);
__decorateElement(_init2, 4, "suppressCommentWarningsInDeclarationFiles", _suppressCommentWarningsInDeclarationFiles_dec, CommentPlugin, _suppressCommentWarningsInDeclarationFiles);
__decoratorMetadata(_init2, CommentPlugin);
function inTypeLiteral(refl) {
  while (refl) {
    if (refl.kind === ReflectionKind12.TypeLiteral) {
      return true;
    }
    refl = refl.parent;
  }
  return false;
}
function validHighlightedName(ref, name) {
  const refl = ref.reflection;
  if (!refl) return true;
  if (refl.getChildByName([name])) return true;
  if (refl.isDeclaration() && refl.type?.type === "reflection") {
    if (refl.type.declaration.getChildByName([name])) {
      return true;
    }
  }
  return false;
}
function moveNestedParamTags(paramTags, parameters, sourcePath) {
  const used = /* @__PURE__ */ new Set();
  for (const param of parameters) {
    const visitor = {
      reflection(target) {
        const tags = paramTags.filter((t) => t.name?.startsWith(`${param.name}.`));
        for (const tag of tags) {
          const path3 = tag.name.split(".");
          path3.shift();
          const child = target.declaration.getChildOrTypePropertyByName(path3);
          if (child && !child.comment) {
            child.comment = new Comment5(
              Comment5.cloneDisplayParts(tag.content)
            );
            child.comment.sourcePath = sourcePath;
            used.add(paramTags.indexOf(tag));
          }
        }
      },
      // #1876, also do this for unions/intersections.
      union(u) {
        u.types.forEach((t) => t.visit(visitor));
      },
      intersection(i) {
        i.types.forEach((t) => t.visit(visitor));
      },
      // #2147, support highlighting parts of a referenced type
      reference(ref) {
        for (let i = 0; i < paramTags.length; ++i) {
          const tag = paramTags[i];
          if (tag.name?.startsWith(`${param.name}.`)) {
            const childName = tag.name.substring(
              param.name.length + 1
            );
            if (!validHighlightedName(ref, childName)) {
              continue;
            }
            ref.highlightedProperties ??= /* @__PURE__ */ new Map();
            ref.highlightedProperties.set(
              childName,
              paramTags[i].content
            );
            used.add(i);
          }
        }
      }
    };
    param.type?.visit(visitor);
  }
  const toRemove = Array.from(used).sort((a, b) => a - b).reverse();
  for (const index2 of toRemove) {
    paramTags.splice(index2, 1);
  }
}
function movePropertyTags(comment, container) {
  const propTags = comment.blockTags.filter(
    (tag) => tag.tag === "@prop" || tag.tag === "@property"
  );
  comment.removeTags("@prop");
  comment.removeTags("@property");
  for (const prop of propTags) {
    if (!prop.name) continue;
    const child = container.getChildByName(prop.name);
    if (child) {
      child.comment = new Comment5(
        Comment5.cloneDisplayParts(prop.content)
      );
      child.comment.sourcePath = comment.sourcePath;
      if (child instanceof DeclarationReflection8 && child.signatures) {
        for (const sig of child.signatures) {
          sig.comment = new Comment5(
            Comment5.cloneDisplayParts(prop.content)
          );
          sig.comment.sourcePath = comment.sourcePath;
        }
      }
    }
  }
}
function mergeSeeTags(comment) {
  const see = comment.getTags("@see");
  if (see.length < 2) return;
  const index2 = comment.blockTags.indexOf(see[0]);
  comment.removeTags("@see");
  see[0].content = see.flatMap((part) => [
    { kind: "text", text: " - " },
    ...part.content,
    { kind: "text", text: "\n" }
  ]);
  comment.blockTags.splice(index2, 0, see[0]);
}

// src/lib/converter/plugins/GroupPlugin.ts
import {
  Comment as Comment6,
  ContainerReflection as ContainerReflection4,
  ReferenceReflection as ReferenceReflection3,
  ReflectionGroup,
  ReflectionKind as ReflectionKind13
} from "#models";
import { getSortFunction as getSortFunction2, isValidSortStrategy as isValidSortStrategy2, Option as Option3, SORT_STRATEGIES } from "#node-utils";
import { i18n as i18n9, partition as partition2 } from "#utils";
import assert8 from "assert";
var defaultGroupOrder = [
  ReflectionKind13.Document,
  // project is never a child so never added to a group
  ReflectionKind13.Module,
  ReflectionKind13.Namespace,
  ReflectionKind13.Enum,
  ReflectionKind13.EnumMember,
  ReflectionKind13.Class,
  ReflectionKind13.Interface,
  ReflectionKind13.TypeAlias,
  ReflectionKind13.Constructor,
  ReflectionKind13.Property,
  ReflectionKind13.Variable,
  ReflectionKind13.Function,
  ReflectionKind13.Accessor,
  ReflectionKind13.Method,
  ReflectionKind13.Reference
  // others are never added to groups
];
var _groupReferencesByType_dec, _sortEntryPoints_dec, _groupOrder_dec, _a3, _init3, _groupOrder, _sortEntryPoints, _groupReferencesByType;
var _GroupPlugin = class _GroupPlugin extends (_a3 = ConverterComponent, _groupOrder_dec = [Option3("groupOrder")], _sortEntryPoints_dec = [Option3("sortEntryPoints")], _groupReferencesByType_dec = [Option3("groupReferencesByType")], _a3) {
  constructor(owner) {
    super(owner);
    __publicField(this, "defaultSortFunction");
    __privateAdd(this, _groupOrder, __runInitializers(_init3, 8, this)), __runInitializers(_init3, 11, this);
    __privateAdd(this, _sortEntryPoints, __runInitializers(_init3, 12, this)), __runInitializers(_init3, 15, this);
    __privateAdd(this, _groupReferencesByType, __runInitializers(_init3, 16, this)), __runInitializers(_init3, 19, this);
    this.owner.on(
      ConverterEvents.RESOLVE_END,
      this.onEndResolve.bind(this),
      -100
    );
    this.application.on(
      ApplicationEvents.REVIVE,
      this.onRevive.bind(this),
      -100
    );
  }
  /**
   * Triggered when the converter has finished resolving a project.
   *
   * @param context  The context object describing the current state the converter is in.
   */
  onEndResolve(context) {
    this.setup();
    this.group(context.project);
    for (const id in context.project.reflections) {
      const reflection = context.project.reflections[id];
      if (reflection instanceof ContainerReflection4) {
        this.group(reflection);
      }
    }
  }
  onRevive(project) {
    this.setup();
    this.group(project);
    for (const refl of project.getReflectionsByKind(
      ReflectionKind13.SomeModule
    )) {
      assert8(refl.isDeclaration());
      this.group(refl);
    }
  }
  setup() {
    this.defaultSortFunction = getSortFunction2(this.application.options);
    _GroupPlugin.WEIGHTS = this.groupOrder;
    if (_GroupPlugin.WEIGHTS.length === 0) {
      _GroupPlugin.WEIGHTS = defaultGroupOrder.map((kind) => ReflectionKind13.pluralString(kind));
    }
  }
  group(reflection) {
    const sortFunction = this.getSortFunction(reflection);
    if (reflection.childrenIncludingDocuments && !reflection.groups) {
      if (reflection.children) {
        if (this.sortEntryPoints || !reflection.children.some((c) => c.kindOf(ReflectionKind13.Module))) {
          sortFunction(reflection.children);
          sortFunction(reflection.documents || []);
          sortFunction(reflection.childrenIncludingDocuments);
        }
      } else if (reflection.documents) {
        sortFunction(reflection.documents);
        sortFunction(reflection.childrenIncludingDocuments);
      }
      if (reflection.comment?.hasModifier("@disableGroups")) {
        return;
      }
      reflection.groups = this.getReflectionGroups(
        reflection,
        reflection.childrenIncludingDocuments
      );
    }
  }
  /**
   * Extracts the groups for a given reflection.
   *
   * @privateRemarks
   * If you change this, also update extractCategories in CategoryPlugin accordingly.
   */
  getGroups(reflection) {
    return _GroupPlugin.getGroups(
      reflection,
      this.groupReferencesByType
    );
  }
  static getGroups(reflection, groupReferencesByType) {
    const groups = /* @__PURE__ */ new Set();
    function extractGroupTags(comment) {
      if (!comment) return;
      for (const tag of comment.blockTags) {
        if (tag.tag === "@group") {
          groups.add(Comment6.combineDisplayParts(tag.content).trim());
        }
      }
    }
    if (reflection.isDeclaration()) {
      extractGroupTags(reflection.comment);
      for (const sig of reflection.getNonIndexSignatures()) {
        extractGroupTags(sig.comment);
      }
      if (reflection.type?.type === "reflection") {
        extractGroupTags(reflection.type.declaration.comment);
        for (const sig of reflection.type.declaration.getNonIndexSignatures()) {
          extractGroupTags(sig.comment);
        }
      }
    }
    if (reflection.isDocument() && "group" in reflection.frontmatter) {
      groups.add(String(reflection.frontmatter["group"]));
    }
    groups.delete("");
    if (groups.size === 0) {
      if (reflection instanceof ReferenceReflection3 && groupReferencesByType) {
        groups.add(
          ReflectionKind13.pluralString(
            reflection.getTargetReflectionDeep().kind
          )
        );
      } else {
        groups.add(
          ReflectionKind13.pluralString(reflection.kind)
        );
      }
    }
    return groups;
  }
  /**
   * Create a grouped representation of the given list of reflections.
   *
   * Reflections are grouped by kind and sorted by weight and name.
   *
   * @param reflections  The reflections that should be grouped.
   * @returns An array containing all children of the given reflection grouped by their kind.
   */
  getReflectionGroups(parent, reflections) {
    const groups = /* @__PURE__ */ new Map();
    reflections.forEach((child) => {
      for (const name of this.getGroups(child)) {
        let group2 = groups.get(name);
        if (!group2) {
          group2 = new ReflectionGroup(name, child);
          groups.set(name, group2);
        }
        group2.children.push(child);
      }
    });
    if (parent.comment) {
      for (const tag of parent.comment.blockTags) {
        if (tag.tag === "@groupDescription") {
          const { header: header2, body } = Comment6.splitPartsToHeaderAndBody(
            tag.content
          );
          const cat = groups.get(header2);
          if (cat) {
            cat.description = body;
          } else {
            this.application.logger.warn(
              i18n9.comment_for_0_includes_groupDescription_for_1_but_no_child_in_group(
                parent.getFriendlyFullName(),
                header2
              )
            );
          }
        }
      }
    }
    return Array.from(groups.values()).sort(_GroupPlugin.sortGroupCallback);
  }
  getSortFunction(reflection) {
    const tag = reflection.comment?.getTag("@sortStrategy");
    if (tag) {
      const text = Comment6.combineDisplayParts(tag.content);
      const strategies = text.split(/[,\s]+/);
      const [valid, invalid] = partition2(strategies, isValidSortStrategy2);
      for (const inv of invalid) {
        this.application.logger.warn(i18n9.comment_for_0_specifies_1_as_sort_strategy_but_only_2_is_valid(
          reflection.getFriendlyFullName(),
          inv,
          SORT_STRATEGIES.join("\n	")
        ));
      }
      return getSortFunction2(this.application.options, valid);
    }
    return this.defaultSortFunction;
  }
  /**
   * Callback used to sort groups by name.
   */
  static sortGroupCallback(a, b) {
    let aWeight = _GroupPlugin.WEIGHTS.indexOf(a.title);
    let bWeight = _GroupPlugin.WEIGHTS.indexOf(b.title);
    if (aWeight === -1 || bWeight === -1) {
      let asteriskIndex = _GroupPlugin.WEIGHTS.indexOf("*");
      if (asteriskIndex === -1) {
        asteriskIndex = _GroupPlugin.WEIGHTS.length;
      }
      if (aWeight === -1) {
        aWeight = asteriskIndex;
      }
      if (bWeight === -1) {
        bWeight = asteriskIndex;
      }
    }
    if (aWeight === bWeight) {
      return a.title.localeCompare(b.title);
    }
    return aWeight - bWeight;
  }
};
_init3 = __decoratorStart(_a3);
_groupOrder = new WeakMap();
_sortEntryPoints = new WeakMap();
_groupReferencesByType = new WeakMap();
__decorateElement(_init3, 4, "groupOrder", _groupOrder_dec, _GroupPlugin, _groupOrder);
__decorateElement(_init3, 4, "sortEntryPoints", _sortEntryPoints_dec, _GroupPlugin, _sortEntryPoints);
__decorateElement(_init3, 4, "groupReferencesByType", _groupReferencesByType_dec, _GroupPlugin, _groupReferencesByType);
__decoratorMetadata(_init3, _GroupPlugin);
__publicField(_GroupPlugin, "WEIGHTS", []);
var GroupPlugin = _GroupPlugin;

// src/lib/converter/plugins/ImplementsPlugin.ts
import {
  DeclarationReflection as DeclarationReflection9,
  ReferenceType as ReferenceType4,
  ReflectionFlag as ReflectionFlag7,
  ReflectionKind as ReflectionKind14,
  ReflectionType as ReflectionType4,
  SignatureReflection as SignatureReflection6
} from "#models";
import { findPackageForPath as findPackageForPath3, getHumanName as getHumanName2 } from "#node-utils";
import { filterMap as filterMap3, zip as zip2 } from "#utils";
import ts14 from "typescript";
var ImplementsPlugin = class extends ConverterComponent {
  resolved = /* @__PURE__ */ new WeakSet();
  postponed = /* @__PURE__ */ new WeakMap();
  revivingSerialized = false;
  constructor(owner) {
    super(owner);
    this.owner.on(
      ConverterEvents.RESOLVE_END,
      this.onResolveEnd.bind(this)
    );
    this.owner.on(
      ConverterEvents.CREATE_DECLARATION,
      this.onDeclaration.bind(this),
      -1e3
    );
    this.owner.on(
      ConverterEvents.CREATE_SIGNATURE,
      this.onSignature.bind(this),
      1e3
    );
    this.application.on(ApplicationEvents.REVIVE, this.onRevive.bind(this));
  }
  /**
   * Mark all members of the given class to be the implementation of the matching interface member.
   */
  analyzeImplements(project, classReflection, interfaceReflection) {
    this.handleInheritedComments(classReflection, interfaceReflection);
    if (!interfaceReflection.children) {
      return;
    }
    interfaceReflection.children.forEach((interfaceMember) => {
      const classMember = findMatchingMember(
        interfaceMember,
        classReflection
      );
      if (!classMember) {
        return;
      }
      const interfaceMemberName = interfaceReflection.name + "." + interfaceMember.name;
      classMember.implementationOf = ReferenceType4.createResolvedReference(
        interfaceMemberName,
        interfaceMember,
        project
      );
      const intSigs = interfaceMember.signatures || interfaceMember.type?.visit({
        reflection: (r) => r.declaration.signatures
      });
      const clsSigs = classMember.signatures || classMember.type?.visit({
        reflection: (r) => r.declaration.signatures
      });
      if (intSigs && clsSigs) {
        for (const [clsSig, intSig] of zip2(clsSigs, intSigs)) {
          if (clsSig.implementationOf) {
            const target = intSig.parent.kindOf(
              ReflectionKind14.FunctionOrMethod
            ) ? intSig : intSig.parent.parent;
            clsSig.implementationOf = ReferenceType4.createResolvedReference(
              clsSig.implementationOf.name,
              target,
              project
            );
          }
        }
      }
      this.handleInheritedComments(classMember, interfaceMember);
    });
  }
  analyzeInheritance(project, reflection) {
    if (!reflection.extendedTypes) return;
    const extendedTypes = filterMap3(
      reflection.extendedTypes,
      (type2) => {
        return type2 instanceof ReferenceType4 && type2.reflection instanceof DeclarationReflection9 ? type2 : void 0;
      }
    );
    for (const parent of extendedTypes) {
      this.handleInheritedComments(reflection, parent.reflection);
      for (const parentMember of parent.reflection.children ?? []) {
        const child = findMatchingMember(parentMember, reflection);
        if (child) {
          const key = child.overwrites ? "overwrites" : "inheritedFrom";
          for (const [childSig, parentSig] of zip2(
            child.signatures ?? [],
            parentMember.signatures ?? []
          )) {
            if (!childSig[key]?.reflection) {
              childSig[key] = ReferenceType4.createResolvedReference(
                `${parent.name}.${parentMember.name}`,
                parentSig,
                project
              );
            }
          }
          if (!child[key]?.reflection) {
            child[key] = ReferenceType4.createResolvedReference(
              `${parent.name}.${parentMember.name}`,
              parentMember,
              project
            );
          }
          this.handleInheritedComments(child, parentMember);
        }
      }
    }
    for (const child of reflection.children || []) {
      if (child.inheritedFrom && !isValidRef(child.inheritedFrom)) {
        child.inheritedFrom = ReferenceType4.createBrokenReference(
          child.inheritedFrom.name,
          project,
          child.inheritedFrom.package
        );
      }
      if (child.overwrites && !isValidRef(child.overwrites)) {
        child.overwrites = ReferenceType4.createBrokenReference(
          child.overwrites.name,
          project,
          child.overwrites.package
        );
      }
      for (const childSig of child.getAllSignatures()) {
        if (childSig.inheritedFrom && !isValidRef(childSig.inheritedFrom)) {
          childSig.inheritedFrom = ReferenceType4.createBrokenReference(
            childSig.inheritedFrom.name,
            project,
            childSig.inheritedFrom.package
          );
        }
        if (childSig.overwrites && !isValidRef(childSig.overwrites)) {
          childSig.overwrites = ReferenceType4.createBrokenReference(
            childSig.overwrites.name,
            project,
            childSig.overwrites.package
          );
        }
      }
    }
  }
  cleanUpImplements(project, reflection) {
    for (const child of reflection.children || []) {
      if (child.implementationOf && !isValidRef(child.implementationOf)) {
        child.implementationOf = ReferenceType4.createBrokenReference(
          child.implementationOf.name,
          project,
          child.implementationOf.package
        );
      }
      for (const childSig of child.getAllSignatures()) {
        if (childSig.implementationOf && !isValidRef(childSig.implementationOf)) {
          childSig.implementationOf = ReferenceType4.createBrokenReference(
            childSig.implementationOf.name,
            project,
            childSig.implementationOf.package
          );
        }
      }
    }
  }
  onResolveEnd(context) {
    this.resolve(context.project);
  }
  onRevive(project) {
    this.revivingSerialized = true;
    this.resolve(project);
    this.revivingSerialized = false;
  }
  resolve(project) {
    for (const id in project.reflections) {
      const refl = project.reflections[id];
      if (refl instanceof DeclarationReflection9) {
        this.tryResolve(project, refl);
      }
    }
  }
  tryResolve(project, reflection) {
    const requirements = filterMap3(
      [
        ...reflection.implementedTypes ?? [],
        ...reflection.extendedTypes ?? []
      ],
      (type2) => {
        return type2 instanceof ReferenceType4 ? type2.reflection : void 0;
      }
    );
    if (requirements.every((req) => this.resolved.has(req))) {
      this.doResolve(project, reflection);
      this.resolved.add(reflection);
      for (const refl of this.postponed.get(reflection) ?? []) {
        this.tryResolve(project, refl);
      }
      this.postponed.delete(reflection);
    } else {
      for (const req of requirements) {
        const future = this.postponed.get(req) ?? /* @__PURE__ */ new Set();
        future.add(reflection);
        this.postponed.set(req, future);
      }
    }
  }
  doResolve(project, reflection) {
    if (reflection.kindOf(ReflectionKind14.Class) && reflection.implementedTypes) {
      reflection.implementedTypes.forEach((type2) => {
        if (!(type2 instanceof ReferenceType4)) {
          return;
        }
        if (type2.reflection && type2.reflection.kindOf(ReflectionKind14.ClassOrInterface)) {
          this.analyzeImplements(
            project,
            reflection,
            type2.reflection
          );
        }
      });
    }
    if (reflection.kindOf(ReflectionKind14.ClassOrInterface)) {
      const notHiddenType = (t) => !(t instanceof ReferenceType4) || !t.symbolId || !project.symbolIdHasBeenRemoved(t.symbolId);
      reflection.implementedTypes = reflection.implementedTypes?.filter(notHiddenType);
      if (!reflection.implementedTypes?.length) delete reflection.implementedTypes;
      reflection.extendedTypes = reflection.extendedTypes?.filter(notHiddenType);
      if (!reflection.extendedTypes?.length) delete reflection.extendedTypes;
    }
    if (reflection.kindOf(ReflectionKind14.ClassOrInterface) && reflection.extendedTypes) {
      this.analyzeInheritance(project, reflection);
    }
    if (reflection.kindOf(ReflectionKind14.ClassOrInterface) && (reflection.extendedTypes || reflection.implementedTypes)) {
      this.cleanUpImplements(project, reflection);
    }
  }
  getExtensionInfo(context, reflection) {
    if (!reflection || !reflection.kindOf(ReflectionKind14.Inheritable)) {
      return;
    }
    if (!reflection.parent?.kindOf(ReflectionKind14.ClassOrInterface)) {
      return;
    }
    const symbol = context.getSymbolFromReflection(
      reflection.parent
    );
    if (!symbol) {
      return;
    }
    const declaration = symbol.getDeclarations()?.find(
      (n) => ts14.isClassDeclaration(n) || ts14.isInterfaceDeclaration(n)
    );
    if (!declaration) {
      return;
    }
    return { symbol, declaration };
  }
  onSignature(context, reflection) {
    this.onDeclaration(context, reflection.parent);
  }
  /**
   * Responsible for setting the {@link DeclarationReflection.inheritedFrom},
   * {@link DeclarationReflection.overwrites}, and {@link DeclarationReflection.implementationOf}
   * properties on the provided reflection temporarily, these links will be replaced
   * during the resolve step with links which actually point to the right place.
   */
  onDeclaration(context, reflection) {
    const info = this.getExtensionInfo(context, reflection);
    if (!info) {
      return;
    }
    if (reflection.kind === ReflectionKind14.Constructor) {
      const ctor = info.declaration.members.find(ts14.isConstructorDeclaration);
      constructorInheritance(context, reflection, info.declaration, ctor);
      return;
    }
    const childType = reflection.flags.isStatic ? context.checker.getTypeOfSymbolAtLocation(
      info.symbol,
      info.declaration
    ) : context.checker.getDeclaredTypeOfSymbol(info.symbol);
    const property = findProperty(reflection, childType);
    if (!property) {
      context.logger.warn(
        `Failed to retrieve${reflection.flags.isStatic ? " static" : ""} member "${reflection.escapedName ?? reflection.name}" of "${reflection.parent?.name}" for inheritance analysis. Please report a bug.`
      );
      return;
    }
    out: for (const clause of info.declaration.heritageClauses ?? []) {
      if (reflection.flags.isStatic && clause.token === ts14.SyntaxKind.ImplementsKeyword) {
        continue;
      }
      for (const expr of clause.types) {
        const parentType = context.checker.getTypeAtLocation(
          reflection.flags.isStatic ? expr.expression : expr
        );
        const parentProperty = findProperty(reflection, parentType);
        if (parentProperty) {
          const isInherit = property.getDeclarations()?.some((d) => d.parent !== info.declaration) ?? true;
          createLink(
            context,
            reflection,
            clause,
            expr,
            parentProperty,
            isInherit
          );
          if (clause.token === ts14.SyntaxKind.ImplementsKeyword) {
            break out;
          }
        }
      }
    }
  }
  /**
   * Responsible for copying comments from "parent" reflections defined
   * in either a base class or implemented interface to the child class.
   */
  handleInheritedComments(child, parent) {
    this.copyComment(child, parent);
    if (parent.kindOf(ReflectionKind14.Property) && child.kindOf(ReflectionKind14.Accessor)) {
      if (child.getSignature) {
        this.copyComment(child.getSignature, parent);
        child.getSignature.implementationOf = child.implementationOf;
      }
      if (child.setSignature) {
        this.copyComment(child.setSignature, parent);
        child.setSignature.implementationOf = child.implementationOf;
      }
    }
    if (parent.kindOf(ReflectionKind14.Accessor) && child.kindOf(ReflectionKind14.Accessor)) {
      if (parent.getSignature && child.getSignature) {
        this.copyComment(child.getSignature, parent.getSignature);
      }
      if (parent.setSignature && child.setSignature) {
        this.copyComment(child.setSignature, parent.setSignature);
      }
    }
    if (parent.kindOf(ReflectionKind14.FunctionOrMethod) && parent.signatures && child.signatures) {
      for (const [cs, ps] of zip2(child.signatures, parent.signatures)) {
        this.copyComment(cs, ps);
      }
    } else if (parent.kindOf(ReflectionKind14.Property) && parent.type instanceof ReflectionType4 && parent.type.declaration.signatures && child.signatures) {
      for (const [cs, ps] of zip2(
        child.signatures,
        parent.type.declaration.signatures
      )) {
        this.copyComment(cs, ps);
      }
    }
  }
  /**
   * Copy the comment of the source reflection to the target reflection with a JSDoc style copy
   * function. The TSDoc copy function is in the InheritDocPlugin.
   */
  copyComment(target, source) {
    if (!shouldCopyComment(target, source, this.revivingSerialized)) {
      return;
    }
    target.comment = source.comment.clone();
    if (target instanceof DeclarationReflection9 && source instanceof DeclarationReflection9) {
      for (const [tt, ts18] of zip2(
        target.typeParameters || [],
        source.typeParameters || []
      )) {
        this.copyComment(tt, ts18);
      }
    }
    if (target instanceof SignatureReflection6 && source instanceof SignatureReflection6) {
      for (const [tt, ts18] of zip2(
        target.typeParameters || [],
        source.typeParameters || []
      )) {
        this.copyComment(tt, ts18);
      }
      for (const [pt, ps] of zip2(
        target.parameters || [],
        source.parameters || []
      )) {
        this.copyComment(pt, ps);
      }
    }
  }
};
function getConstructorPackagePath(context, clause) {
  const symbol = context.getSymbolAtLocation(clause.expression);
  if (!symbol) return void 0;
  const resolvedSymbol = context.resolveAliasedSymbol(symbol);
  const symbolPath = resolvedSymbol?.declarations?.[0]?.getSourceFile().fileName;
  if (!symbolPath) return void 0;
  return findPackageForPath3(symbolPath)?.[0];
}
function constructorInheritance(context, reflection, childDecl, constructorDecl) {
  const extendsClause = childDecl.heritageClauses?.find(
    (cl) => cl.token === ts14.SyntaxKind.ExtendsKeyword
  );
  if (!extendsClause) return;
  const extendsType = extendsClause.types[0];
  const refPackage = getConstructorPackagePath(context, extendsType);
  const name = `${extendsType.getText()}.constructor`;
  const key = constructorDecl ? "overwrites" : "inheritedFrom";
  reflection[key] ??= ReferenceType4.createBrokenReference(
    name,
    context.project,
    refPackage
  );
  for (const sig of reflection.signatures ?? []) {
    sig[key] ??= ReferenceType4.createBrokenReference(name, context.project, refPackage);
  }
}
function findProperty(reflection, parent) {
  return parent.getProperties().find((prop) => {
    return reflection.escapedName ? prop.escapedName === reflection.escapedName : prop.name === reflection.name;
  });
}
function createLink(context, reflection, clause, expr, symbol, isInherit) {
  const name = `${expr.expression.getText()}.${getHumanName2(symbol.name)}`;
  const rootSymbols = context.checker.getRootSymbols(symbol);
  const ref = rootSymbols.length && rootSymbols[0] != symbol ? context.createSymbolReference(rootSymbols[0], context, name) : ReferenceType4.createBrokenReference(name, context.project, void 0);
  link(reflection);
  link(reflection.getSignature);
  link(reflection.setSignature);
  for (const sig of reflection.indexSignatures || []) {
    link(sig);
  }
  for (const sig of reflection.signatures ?? []) {
    link(sig);
  }
  function link(target) {
    if (!target) return;
    if (clause.token === ts14.SyntaxKind.ImplementsKeyword) {
      target.implementationOf ??= ref;
      return;
    }
    if (isInherit) {
      target.setFlag(ReflectionFlag7.Inherited);
      target.inheritedFrom ??= ref;
    } else {
      target.overwrites ??= ref;
    }
  }
}
function shouldCopyComment(target, source, revivingSerialized) {
  if (!source.comment) {
    return false;
  }
  if (target.comment) {
    if (revivingSerialized && source.comment.similarTo(target.comment)) {
      return true;
    }
    const tag = target.comment.getTag("@inheritDoc");
    if (!tag || tag.name) {
      return false;
    }
  }
  return true;
}
function findMatchingMember(toMatch, container) {
  return container.children?.find(
    (child) => child.name == toMatch.name && child.flags.isStatic === toMatch.flags.isStatic
  );
}
function isValidRef(ref) {
  return !!ref.reflection?.parent?.kindOf(
    ReflectionKind14.ClassOrInterface | ReflectionKind14.Method | ReflectionKind14.Constructor
  );
}

// src/lib/converter/plugins/IncludePlugin.ts
import path from "path";
import { isFile, normalizePath as normalizePath3, readFile } from "#node-utils";
import { dedent, escapeRegExp, i18n as i18n10, MinimalSourceFile } from "#utils";
var IncludePlugin = class extends ConverterComponent {
  get logger() {
    return this.application.logger;
  }
  constructor(owner) {
    super(owner);
    const onCreate = this.onCreate.bind(this);
    owner.on(ConverterEvents.CREATE_PROJECT, onCreate);
    owner.on(ConverterEvents.CREATE_DOCUMENT, onCreate);
    owner.on(ConverterEvents.CREATE_DECLARATION, onCreate);
    owner.on(ConverterEvents.CREATE_PARAMETER, onCreate);
    owner.on(ConverterEvents.CREATE_SIGNATURE, onCreate);
    owner.on(ConverterEvents.CREATE_TYPE_PARAMETER, onCreate);
  }
  onCreate(_context, refl) {
    if (refl.isDocument()) {
      const relative5 = this.application.files.getReflectionPath(refl);
      this.checkIncludeTagsParts(
        refl,
        path.dirname(relative5),
        refl.content
      );
    }
    if (!refl.comment?.sourcePath) return;
    const relative4 = path.dirname(refl.comment.sourcePath);
    this.checkIncludeTagsParts(refl, relative4, refl.comment.summary);
    for (const tag of refl.comment.blockTags) {
      this.checkIncludeTagsParts(refl, relative4, tag.content);
    }
  }
  checkIncludeTagsParts(refl, relative4, parts, included = []) {
    for (let i = 0; i < parts.length; ++i) {
      const part = parts[i];
      if (part.kind !== "inline-tag" || !["@include", "@includeCode"].includes(part.tag)) {
        continue;
      }
      const { filename, regionTarget, requestedLines } = parseIncludeCodeTextPart(part.text);
      const file = normalizePath3(path.resolve(relative4, filename));
      this.application.watchFile(file);
      if (included.includes(file) && part.tag === "@include") {
        this.logger.error(
          i18n10.include_0_in_1_specified_2_circular_include_3(
            part.tag,
            refl.getFriendlyFullName(),
            part.text,
            included.join("\n	")
          )
        );
      } else if (isFile(file)) {
        const text = readFile(file).replaceAll("\r\n", "\n");
        const ext = path.extname(file).substring(1);
        const includedText = regionTarget ? this.getRegions(
          refl,
          file,
          ext,
          part.text,
          text,
          regionTarget,
          part.tag,
          part.tag === "@includeCode"
        ) : requestedLines ? this.getLines(
          refl,
          file,
          part.text,
          text,
          requestedLines,
          part.tag
        ) : text;
        if (part.tag === "@include") {
          const sf = new MinimalSourceFile(includedText, file);
          const { content } = this.owner.parseRawComment(
            sf,
            refl.project.files
          );
          this.checkIncludeTagsParts(
            refl,
            path.dirname(file),
            content,
            [...included, file]
          );
          parts.splice(i, 1, ...content);
        } else {
          parts[i] = {
            kind: "code",
            text: makeCodeBlock2(ext, includedText)
          };
        }
      } else {
        this.logger.error(
          i18n10.include_0_in_1_specified_2_resolved_to_3_does_not_exist(
            part.tag,
            refl.getFriendlyFullName(),
            part.text,
            file
          )
        );
      }
    }
  }
  getRegions(refl, file, ext, textPart, text, regionTargets, tag, ignoreIndent) {
    const regionTagsList = regionTagREsByExt[ext];
    if (!regionTagsList) {
      this.logger.error(
        i18n10.include_0_tag_in_1_region_2_region_not_supported(
          tag,
          refl.getFriendlyFullName(),
          textPart
        )
      );
      return "";
    }
    const targets = regionTargets.split(",").map((s) => s.trim());
    let content = "";
    for (const target of targets) {
      let found = false;
      for (const [startTag, endTag] of regionTagsList) {
        const safeTarget = escapeRegExp(target);
        const start = text.match(startTag(safeTarget));
        const end = text.match(endTag(safeTarget));
        const foundStart = start && start.length > 0;
        const foundEnd = end && end.length > 0;
        if (foundStart && !foundEnd) {
          this.logger.error(
            i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_close_not_found(
              tag,
              refl.getFriendlyFullName(),
              textPart,
              file,
              target
            )
          );
          return "";
        }
        if (!foundStart && foundEnd) {
          this.logger.error(
            i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_open_not_found(
              tag,
              refl.getFriendlyFullName(),
              textPart,
              file,
              target
            )
          );
          return "";
        }
        if (foundStart && foundEnd) {
          if (start.length > 1) {
            this.logger.error(
              i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_open_found_multiple_times(
                tag,
                refl.getFriendlyFullName(),
                textPart,
                file,
                target
              )
            );
            return "";
          }
          if (end.length > 1) {
            this.logger.error(
              i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_close_found_multiple_times(
                tag,
                refl.getFriendlyFullName(),
                textPart,
                file,
                target
              )
            );
            return "";
          }
          if (found) {
            this.logger.error(
              i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_found_multiple_times(
                tag,
                refl.getFriendlyFullName(),
                textPart,
                file,
                target
              )
            );
            return "";
          }
          found = text.substring(
            text.indexOf(start[0]) + start[0].length,
            text.indexOf(end[0])
          );
        }
      }
      if (found === false) {
        this.logger.error(
          i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_not_found(
            tag,
            refl.getFriendlyFullName(),
            textPart,
            file,
            target
          )
        );
        return "";
      }
      if (found.trim() === "") {
        this.logger.warn(
          i18n10.include_0_tag_in_1_specified_2_file_3_region_4_region_empty(
            tag,
            refl.getFriendlyFullName(),
            textPart,
            file,
            target
          )
        );
      }
      content += ignoreIndent ? dedent(found) + "\n" : found;
    }
    return content;
  }
  getLines(refl, file, textPart, text, requestedLines, tag) {
    let output = "";
    const lines = text.split(/\r\n|\r|\n/);
    requestedLines.split(",").forEach((requestedLineString) => {
      if (requestedLineString.includes("-")) {
        const [start, end] = requestedLineString.split("-").map(Number);
        if (start > end) {
          this.logger.error(
            i18n10.include_0_tag_in_1_specified_2_file_3_lines_4_invalid_range(
              tag,
              refl.getFriendlyFullName(),
              textPart,
              file,
              requestedLines
            )
          );
          return "";
        }
        if (start > lines.length || end > lines.length) {
          this.logger.error(
            i18n10.include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines(
              tag,
              refl.getFriendlyFullName(),
              textPart,
              file,
              requestedLines,
              lines.length.toString()
            )
          );
          return "";
        }
        output += lines.slice(start - 1, end).join("\n") + "\n";
      } else {
        const requestedLine = Number(requestedLineString);
        if (requestedLine > lines.length) {
          this.logger.error(
            i18n10.include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines(
              tag,
              refl.getFriendlyFullName(),
              textPart,
              file,
              requestedLines,
              lines.length.toString()
            )
          );
          return "";
        }
        output += lines[requestedLine - 1] + "\n";
      }
    });
    return output;
  }
};
function makeCodeBlock2(lang, code) {
  const escaped = code.replace(/`(?=`)/g, "`\u200B");
  return "\n\n```" + lang + "\n" + escaped.trimEnd() + "\n```";
}
function parseIncludeCodeTextPart(text) {
  let filename = text.trim();
  let regionTarget;
  let requestedLines;
  if (filename.includes("#")) {
    const parsed = filename.split("#");
    filename = parsed[0];
    regionTarget = parsed[1];
  } else if (filename.includes(":")) {
    const parsed = filename.split(":");
    filename = parsed[0];
    requestedLines = parsed[1];
  }
  return { filename, regionTarget, requestedLines };
}
var regionTagREsByExt = {
  bat: [
    [
      (regionName) => new RegExp(`:: *#region  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`:: *#endregion  *${regionName} *
`, "g")
    ],
    [
      (regionName) => new RegExp(`REM  *#region  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`REM  *#endregion  *${regionName} *
`, "g")
    ]
  ],
  cs: [
    [
      (regionName) => new RegExp(`#region  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`#endregion  *${regionName} *
`, "g")
    ]
  ],
  c: [
    [
      (regionName) => new RegExp(`#pragma  *region  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`#pragma  *endregion  *${regionName} *
`, "g")
    ]
  ],
  css: [
    [
      (regionName) => new RegExp(`/\\* *#region *\\*/  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`/\\* *#endregion *\\*/  *${regionName} *
`, "g")
    ]
  ],
  md: [
    [
      (regionName) => new RegExp(`<!--  *#region  *${regionName} *--> *
`, "g"),
      (regionName) => new RegExp(`<!--  *#endregion  *${regionName} *--> *
`, "g")
    ]
  ],
  ts: [
    [
      (regionName) => new RegExp(`// *#region  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`// *#endregion  *${regionName} *
`, "g")
    ]
  ],
  vb: [
    [
      (regionName) => new RegExp(`#Region  *${regionName} *
`, "g"),
      (regionName) => new RegExp(`#End Region  *${regionName} *
`, "g")
    ]
  ]
};
regionTagREsByExt["fs"] = [
  ...regionTagREsByExt["ts"],
  [
    (regionName) => new RegExp(`(#_region)  *${regionName} *
`, "g"),
    (regionName) => new RegExp(`(#_endregion)  *${regionName} *
`, "g")
  ]
];
regionTagREsByExt["java"] = [
  ...regionTagREsByExt["ts"],
  [
    (regionName) => new RegExp(`// *<editor-fold>  *${regionName} *
`, "g"),
    (regionName) => new RegExp(`// *</editor-fold>  *${regionName} *
`, "g")
  ]
];
regionTagREsByExt["cpp"] = regionTagREsByExt["c"];
regionTagREsByExt["less"] = regionTagREsByExt["css"];
regionTagREsByExt["scss"] = regionTagREsByExt["css"];
regionTagREsByExt["coffee"] = regionTagREsByExt["cs"];
regionTagREsByExt["php"] = regionTagREsByExt["cs"];
regionTagREsByExt["ps1"] = regionTagREsByExt["cs"];
regionTagREsByExt["py"] = regionTagREsByExt["cs"];
regionTagREsByExt["js"] = regionTagREsByExt["ts"];
regionTagREsByExt["mjs"] = regionTagREsByExt["ts"];
regionTagREsByExt["mts"] = regionTagREsByExt["ts"];
regionTagREsByExt["cjs"] = regionTagREsByExt["ts"];
regionTagREsByExt["cts"] = regionTagREsByExt["ts"];
regionTagREsByExt["jsx"] = regionTagREsByExt["ts"];
regionTagREsByExt["tsx"] = regionTagREsByExt["ts"];

// src/lib/converter/plugins/InheritDocPlugin.ts
import {
  Comment as Comment7,
  DeclarationReflection as DeclarationReflection10,
  ReflectionKind as ReflectionKind15,
  ReflectionType as ReflectionType5,
  SignatureReflection as SignatureReflection7
} from "#models";
import { Option as Option4 } from "#node-utils";
import { DefaultMap, i18n as i18n11, parseDeclarationReference as parseDeclarationReference2, zip as zip3 } from "#utils";
var _validation_dec, _a4, _init4, _validation;
var InheritDocPlugin = class extends (_a4 = ConverterComponent, _validation_dec = [Option4("validation")], _a4) {
  /**
   * Create a new InheritDocPlugin instance.
   */
  constructor(owner) {
    super(owner);
    __privateAdd(this, _validation, __runInitializers(_init4, 8, this)), __runInitializers(_init4, 11, this);
    // Key is depended on by Values
    __publicField(this, "dependencies", new DefaultMap(() => []));
    this.owner.on(ConverterEvents.RESOLVE_END, (context) => this.processInheritDoc(context.project));
    this.application.on(
      ApplicationEvents.REVIVE,
      this.processInheritDoc.bind(this)
    );
  }
  /**
   * Traverse through reflection descendant to check for `inheritDoc` tag.
   * If encountered, the parameter of the tag is used to determine a source reflection
   * that will provide actual comment.
   */
  processInheritDoc(project) {
    for (const id in project.reflections) {
      const reflection = project.reflections[id];
      const source = extractInheritDocTagReference(reflection);
      if (!source) continue;
      const declRef = parseDeclarationReference2(source, 0, source.length);
      if (!declRef || /\S/.test(source.substring(declRef[1]))) {
        this.application.logger.warn(
          i18n11.declaration_reference_in_inheritdoc_for_0_not_fully_parsed(
            reflection.getFriendlyFullName()
          )
        );
      }
      let sourceRefl = declRef && resolveDeclarationReference(reflection, declRef[0]);
      if (reflection instanceof SignatureReflection7) {
        if (sourceRefl instanceof DeclarationReflection10) {
          const index2 = reflection.parent.getAllSignatures().indexOf(reflection);
          sourceRefl = sourceRefl.getAllSignatures()[index2] || sourceRefl;
        }
      }
      if (sourceRefl instanceof DeclarationReflection10 && sourceRefl.kindOf(ReflectionKind15.Accessor)) {
        sourceRefl = sourceRefl.getSignature || sourceRefl.setSignature;
      }
      if (!sourceRefl) {
        if (this.validation.invalidLink) {
          this.application.logger.warn(
            i18n11.failed_to_find_0_to_inherit_comment_from_in_1(
              source,
              reflection.getFriendlyFullName()
            )
          );
        }
        continue;
      }
      this.copyComment(sourceRefl, reflection);
    }
    this.createCircularDependencyWarnings();
    this.dependencies.clear();
  }
  copyComment(source, target) {
    if (!target.comment) return;
    if (!source.comment && source instanceof DeclarationReflection10 && source.signatures) {
      source = source.signatures[0];
    }
    if (!source.comment && source instanceof DeclarationReflection10 && source.type instanceof ReflectionType5 && source.type.declaration.signatures) {
      source = source.type.declaration.signatures[0];
    }
    if (!source.comment) {
      this.application.logger.warn(
        i18n11.reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment(
          target.getFullName(),
          source.getFullName()
        )
      );
      return;
    }
    if (extractInheritDocTagReference(source)) {
      this.dependencies.get(source).push(target);
      return;
    }
    target.comment.removeTags("@inheritDoc");
    target.comment.removeTags("@remarks");
    target.comment.removeTags("@returns");
    target.comment.summary = Comment7.cloneDisplayParts(
      source.comment.summary
    );
    const remarks = source.comment.getTag("@remarks");
    if (remarks) {
      target.comment.blockTags.unshift(remarks.clone());
    }
    const returns = source.comment.getTag("@returns");
    if (returns) {
      target.comment.blockTags.push(returns.clone());
    }
    if (source instanceof SignatureReflection7 && target instanceof SignatureReflection7) {
      copySummaries(source.parameters, target.parameters);
      copySummaries(source.typeParameters, target.typeParameters);
    } else if (source instanceof DeclarationReflection10 && target instanceof DeclarationReflection10) {
      copySummaries(source.typeParameters, target.typeParameters);
    }
    const dependent = this.dependencies.get(target);
    this.dependencies.delete(target);
    for (const target2 of dependent) {
      this.copyComment(target, target2);
    }
  }
  createCircularDependencyWarnings() {
    const unwarned = new Set(this.dependencies.keys());
    const generateWarning = (orig) => {
      const parts = [orig.name];
      unwarned.delete(orig);
      let work = orig;
      do {
        work = this.dependencies.get(work)[0];
        unwarned.delete(work);
        parts.push(work.name);
      } while (!this.dependencies.get(work).includes(orig));
      parts.push(orig.name);
      this.application.logger.warn(
        i18n11.inheritdoc_circular_inheritance_chain_0(
          parts.reverse().join(" -> ")
        )
      );
    };
    for (const orig of this.dependencies.keys()) {
      if (unwarned.has(orig)) {
        generateWarning(orig);
      }
    }
  }
};
_init4 = __decoratorStart(_a4);
_validation = new WeakMap();
__decorateElement(_init4, 4, "validation", _validation_dec, InheritDocPlugin, _validation);
__decoratorMetadata(_init4, InheritDocPlugin);
function copySummaries(source, target) {
  for (const [s, t] of zip3(source || [], target || [])) {
    t.comment = new Comment7(s.comment?.summary);
    t.comment.sourcePath = s.comment?.sourcePath;
  }
}
function extractInheritDocTagReference(reflection) {
  const comment = reflection.comment;
  if (!comment) return;
  const blockTag2 = comment.blockTags.find((tag) => tag.tag === "@inheritDoc");
  if (blockTag2) {
    return blockTag2.name;
  }
  const inlineTag2 = comment.summary.find(
    (part) => part.kind === "inline-tag" && part.tag === "@inheritDoc"
  );
  if (inlineTag2) {
    return inlineTag2.text;
  }
}

// src/lib/converter/plugins/LinkResolverPlugin.ts
import { discoverAllReferenceTypes, Option as Option5 } from "#node-utils";
var _validation_dec2, _a5, _init5, _validation2;
var LinkResolverPlugin = class extends (_a5 = ConverterComponent, _validation_dec2 = [Option5("validation")], _a5) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _validation2, __runInitializers(_init5, 8, this)), __runInitializers(_init5, 11, this);
    this.owner.on(
      ConverterEvents.RESOLVE_END,
      this.onResolve.bind(this),
      -300
    );
    this.application.on(
      ApplicationEvents.REVIVE,
      this.resolveLinks.bind(this),
      -300
    );
  }
  onResolve(context) {
    this.resolveLinks(context.project);
  }
  resolveLinks(project) {
    for (const id in project.reflections) {
      const reflection = project.reflections[id];
      this.owner.resolveLinks(reflection);
    }
    for (const { type: type2, owner } of discoverAllReferenceTypes(
      project,
      false
    )) {
      if (!type2.reflection) {
        const resolveResult = this.owner.resolveExternalLink(
          type2.toDeclarationReference(),
          owner,
          void 0,
          type2.symbolId
        );
        switch (typeof resolveResult) {
          case "string":
            type2.externalUrl = resolveResult;
            break;
          case "object":
            type2.externalUrl = resolveResult.target;
            break;
        }
      }
    }
  }
};
_init5 = __decoratorStart(_a5);
_validation2 = new WeakMap();
__decorateElement(_init5, 4, "validation", _validation_dec2, LinkResolverPlugin, _validation2);
__decoratorMetadata(_init5, LinkResolverPlugin);

// src/lib/converter/plugins/MergeModuleWithPlugin.ts
import { ok as ok5 } from "assert";
import { Comment as Comment8, ReflectionKind as ReflectionKind16 } from "#models";
import { i18n as i18n12 } from "#utils";
var MergeModuleWithPlugin = class extends ConverterComponent {
  constructor(owner) {
    super(owner);
    this.owner.on(
      ConverterEvents.RESOLVE_BEGIN,
      this.onResolveBegin.bind(this),
      1e4
    );
    this.application.on(
      ApplicationEvents.REVIVE,
      this.onRevive.bind(this),
      1e4
    );
  }
  onResolveBegin(context) {
    this.onRevive(context.project);
  }
  onRevive(project) {
    const mods = project.getReflectionsByKind(ReflectionKind16.SomeModule);
    for (const refl of mods) {
      this.checkAndMerge(refl);
    }
  }
  checkAndMerge(refl) {
    ok5(refl.isDeclaration());
    const tag = refl.comment?.getTag("@mergeModuleWith");
    if (!tag) return;
    const project = refl.project;
    const targetStr = Comment8.combineDisplayParts(tag.content);
    const target = targetStr === "<project>" ? project : project.getChildByName(targetStr);
    if (!target?.isDeclaration() && !target?.isProject()) {
      return;
    }
    let tempRefl = refl;
    while (tempRefl !== project) {
      if (tempRefl === target) {
        this.application.logger.warn(
          i18n12.reflection_0_tried_to_merge_into_child_1(
            refl.getFriendlyFullName(),
            target.getFriendlyFullName()
          )
        );
      }
      tempRefl = tempRefl.parent;
    }
    this.application.logger.verbose(
      `Merging ${refl.getFullName()} into ${target.getFullName()}`
    );
    project.mergeReflections(refl, target);
  }
};

// src/lib/converter/plugins/PackagePlugin.ts
import * as Path from "path";
import { i18n as i18n13, MinimalSourceFile as MinimalSourceFile2, NormalizedPathUtils } from "#utils";
import {
  deriveRootDir,
  discoverPackageJson,
  nicePath as nicePath3,
  normalizePath as normalizePath4,
  Option as Option6,
  readFile as readFile2
} from "#node-utils";
import { existsSync } from "fs";
var _includeVersion_dec, _entryPoints_dec, _entryPointStrategy_dec, _readme_dec, _a6, _init6, _readme, _entryPointStrategy, _entryPoints, _includeVersion;
var PackagePlugin = class extends (_a6 = ConverterComponent, _readme_dec = [Option6("readme")], _entryPointStrategy_dec = [Option6("entryPointStrategy")], _entryPoints_dec = [Option6("entryPoints")], _includeVersion_dec = [Option6("includeVersion")], _a6) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _readme, __runInitializers(_init6, 8, this)), __runInitializers(_init6, 11, this);
    __privateAdd(this, _entryPointStrategy, __runInitializers(_init6, 12, this)), __runInitializers(_init6, 15, this);
    __privateAdd(this, _entryPoints, __runInitializers(_init6, 16, this)), __runInitializers(_init6, 19, this);
    __privateAdd(this, _includeVersion, __runInitializers(_init6, 20, this)), __runInitializers(_init6, 23, this);
    /**
     * The file name of the found readme.md file.
     */
    __publicField(this, "readmeFile");
    /**
     * Contents of the readme.md file discovered, if any
     */
    __publicField(this, "readmeContents");
    /**
     * Contents of package.json for the active project
     */
    __publicField(this, "packageJson");
    this.owner.on(ConverterEvents.BEGIN, this.onBegin.bind(this));
    this.owner.on(
      ConverterEvents.RESOLVE_BEGIN,
      this.onBeginResolve.bind(this)
    );
    this.owner.on(ConverterEvents.END, () => {
      delete this.readmeFile;
      delete this.readmeContents;
      delete this.packageJson;
    });
    this.application.on(ApplicationEvents.REVIVE, this.onRevive.bind(this));
  }
  onRevive(project) {
    this.onBegin();
    this.addEntries(project);
    delete this.readmeFile;
    delete this.packageJson;
    delete this.readmeContents;
  }
  onBegin() {
    this.readmeFile = void 0;
    this.readmeContents = void 0;
    this.packageJson = void 0;
    const dirName = this.application.options.packageDir ?? Path.resolve(deriveRootDir(this.entryPoints));
    this.application.logger.verbose(
      `Begin package.json search at ${nicePath3(dirName)}`
    );
    const packageJson = discoverPackageJson(dirName);
    this.packageJson = packageJson?.content;
    if (this.readme.endsWith("none")) {
      return;
    }
    if (this.readme) {
      this.application.watchFile(this.readme);
      try {
        this.readmeContents = readFile2(this.readme);
        this.readmeFile = normalizePath4(this.readme);
      } catch {
        this.application.logger.error(
          i18n13.provided_readme_at_0_could_not_be_read(
            nicePath3(this.readme)
          )
        );
      }
    } else if (packageJson) {
      const possibleReadmePaths = [
        "README.md",
        "readme.md",
        "Readme.md"
      ].map((name) => Path.join(Path.dirname(packageJson.file), name));
      const readmePath = possibleReadmePaths.find((path3) => {
        this.application.watchFile(path3);
        return existsSync(path3);
      });
      if (readmePath) {
        this.readmeFile = normalizePath4(readmePath);
        this.readmeContents = readFile2(readmePath);
        this.application.watchFile(this.readmeFile);
      }
    }
  }
  onBeginResolve(context) {
    this.addEntries(context.project);
  }
  addEntries(project) {
    if (this.readmeFile && this.readmeContents) {
      const { content } = this.application.converter.parseRawComment(
        new MinimalSourceFile2(this.readmeContents, this.readmeFile),
        project.files
      );
      project.readme = content;
      project.files.registerReflectionPath(this.readmeFile, project);
      project.files.registerReflectionPath(NormalizedPathUtils.dirname(this.readmeFile), project);
      this.owner.includePlugin.checkIncludeTagsParts(
        project,
        Path.dirname(this.readmeFile),
        content
      );
    }
    if (this.packageJson) {
      project.packageName = this.packageJson.name;
      if (!project.name) {
        project.name = project.packageName || "Documentation";
      }
      if (this.includeVersion) {
        project.packageVersion = this.packageJson.version?.replace(
          /^v/,
          ""
        );
      }
    } else if (!project.name) {
      this.application.logger.warn(
        i18n13.defaulting_project_name()
      );
      project.name = "Documentation";
    }
  }
};
_init6 = __decoratorStart(_a6);
_readme = new WeakMap();
_entryPointStrategy = new WeakMap();
_entryPoints = new WeakMap();
_includeVersion = new WeakMap();
__decorateElement(_init6, 4, "readme", _readme_dec, PackagePlugin, _readme);
__decorateElement(_init6, 4, "entryPointStrategy", _entryPointStrategy_dec, PackagePlugin, _entryPointStrategy);
__decorateElement(_init6, 4, "entryPoints", _entryPoints_dec, PackagePlugin, _entryPoints);
__decorateElement(_init6, 4, "includeVersion", _includeVersion_dec, PackagePlugin, _includeVersion);
__decoratorMetadata(_init6, PackagePlugin);

// src/lib/converter/plugins/SourcePlugin.ts
import ts15 from "typescript";
import { DeclarationReflection as DeclarationReflection11, ReflectionKind as ReflectionKind17, SignatureReflection as SignatureReflection8, SourceReference } from "#models";
import { getCommonDirectory, normalizePath as normalizePath5, Option as Option7 } from "#node-utils";
import { relative as relative2 } from "path";
var _sourceLinkTemplate_dec, _disableGit_dec, _gitRemote_dec, _gitRevision_dec, _disableSources_dec, _a7, _init7, _disableSources, _gitRevision, _gitRemote, _disableGit, _sourceLinkTemplate;
var SourcePlugin = class extends (_a7 = ConverterComponent, _disableSources_dec = [Option7("disableSources")], _gitRevision_dec = [Option7("gitRevision")], _gitRemote_dec = [Option7("gitRemote")], _disableGit_dec = [Option7("disableGit")], _sourceLinkTemplate_dec = [Option7("sourceLinkTemplate")], _a7) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _disableSources, __runInitializers(_init7, 8, this)), __runInitializers(_init7, 11, this);
    __privateAdd(this, _gitRevision, __runInitializers(_init7, 12, this)), __runInitializers(_init7, 15, this);
    __privateAdd(this, _gitRemote, __runInitializers(_init7, 16, this)), __runInitializers(_init7, 19, this);
    __privateAdd(this, _disableGit, __runInitializers(_init7, 20, this)), __runInitializers(_init7, 23, this);
    __privateAdd(this, _sourceLinkTemplate, __runInitializers(_init7, 24, this)), __runInitializers(_init7, 27, this);
    /**
     * All file names to find the base path from.
     */
    __publicField(this, "fileNames", /* @__PURE__ */ new Set());
    this.owner.on(ConverterEvents.END, this.onEnd.bind(this));
    this.owner.on(
      ConverterEvents.CREATE_DECLARATION,
      this.onDeclaration.bind(this)
    );
    this.owner.on(
      ConverterEvents.CREATE_SIGNATURE,
      this.onSignature.bind(this)
    );
    this.owner.on(
      ConverterEvents.RESOLVE_BEGIN,
      this.onBeginResolve.bind(this)
    );
  }
  get displayBasePath() {
    return this.application.options.getValue("displayBasePath") || this.application.options.getValue("basePath");
  }
  onEnd() {
    this.fileNames.clear();
  }
  /**
   * Triggered when the converter has created a declaration reflection.
   *
   * Attach the current source file to the {@link DeclarationReflection.sources} array.
   *
   * @param _context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   */
  onDeclaration(context, reflection) {
    if (this.disableSources || reflection.kindOf(ReflectionKind17.TypeLiteral)) return;
    const symbol = context.getSymbolFromReflection(reflection);
    for (const node of symbol?.declarations || []) {
      const sourceFile = node.getSourceFile();
      const fileName = normalizePath5(sourceFile.fileName);
      this.fileNames.add(fileName);
      let position;
      if (ts15.isSourceFile(node)) {
        position = { character: 0, line: 0 };
      } else {
        position = ts15.getLineAndCharacterOfPosition(
          sourceFile,
          getLocationNode(node).getStart()
        );
      }
      reflection.sources ||= [];
      reflection.sources.push(
        new SourceReference(
          fileName,
          position.line + 1,
          position.character
        )
      );
    }
  }
  onSignature(_context, reflection, sig) {
    if (this.disableSources || !sig || reflection.parent.kindOf(ReflectionKind17.TypeLiteral)) return;
    const sourceFile = sig.getSourceFile();
    const fileName = normalizePath5(sourceFile.fileName);
    this.fileNames.add(fileName);
    const position = ts15.getLineAndCharacterOfPosition(
      sourceFile,
      getLocationNode(sig).getStart()
    );
    reflection.sources ||= [];
    reflection.sources.push(
      new SourceReference(
        fileName,
        position.line + 1,
        position.character
      )
    );
  }
  /**
   * Triggered when the converter begins resolving a project.
   *
   * @param context  The context object describing the current state the converter is in.
   */
  onBeginResolve(context) {
    const basePath = this.displayBasePath || getCommonDirectory([...this.fileNames]);
    const repos = this.application.repositories;
    for (const id in context.project.reflections) {
      const refl = context.project.reflections[id];
      if (!(refl instanceof DeclarationReflection11 || refl instanceof SignatureReflection8)) {
        continue;
      }
      if (replaceSourcesWithParentSources(context, refl)) {
        refl.sources = refl.parent.sources;
      }
      for (const source of refl.sources || []) {
        source.fileName = normalizePath5(
          relative2(basePath, source.fullFileName)
        );
        source.url = repos?.getURL(source.fullFileName, source.line);
      }
    }
  }
};
_init7 = __decoratorStart(_a7);
_disableSources = new WeakMap();
_gitRevision = new WeakMap();
_gitRemote = new WeakMap();
_disableGit = new WeakMap();
_sourceLinkTemplate = new WeakMap();
__decorateElement(_init7, 4, "disableSources", _disableSources_dec, SourcePlugin, _disableSources);
__decorateElement(_init7, 4, "gitRevision", _gitRevision_dec, SourcePlugin, _gitRevision);
__decorateElement(_init7, 4, "gitRemote", _gitRemote_dec, SourcePlugin, _gitRemote);
__decorateElement(_init7, 4, "disableGit", _disableGit_dec, SourcePlugin, _disableGit);
__decorateElement(_init7, 4, "sourceLinkTemplate", _sourceLinkTemplate_dec, SourcePlugin, _sourceLinkTemplate);
__decoratorMetadata(_init7, SourcePlugin);
function getLocationNode(node) {
  if (isNamedNode(node)) return node.name;
  return node;
}
function replaceSourcesWithParentSources(context, refl) {
  if (refl instanceof DeclarationReflection11 || !refl.sources) {
    return false;
  }
  const symbol = context.getSymbolFromReflection(refl.parent);
  if (!symbol?.declarations) {
    return false;
  }
  for (const decl of symbol.declarations) {
    const file = decl.getSourceFile();
    const pos = file.getLineAndCharacterOfPosition(decl.pos);
    const end = file.getLineAndCharacterOfPosition(decl.end);
    if (refl.sources.some(
      (src) => src.fullFileName === file.fileName && pos.line <= src.line - 1 && src.line - 1 <= end.line
    )) {
      return false;
    }
  }
  return true;
}

// src/lib/converter/plugins/TypePlugin.ts
import {
  DeclarationReflection as DeclarationReflection12,
  ReferenceType as ReferenceType5,
  ReflectionKind as ReflectionKind18
} from "#models";
var TypePlugin = class extends ConverterComponent {
  reflections = /* @__PURE__ */ new Set();
  constructor(owner) {
    super(owner);
    this.owner.on(ConverterEvents.RESOLVE, this.onResolve.bind(this));
    this.owner.on(
      ConverterEvents.RESOLVE_END,
      this.onResolveEnd.bind(this)
    );
    this.owner.on(ConverterEvents.END, () => this.reflections.clear());
    this.application.on(
      ApplicationEvents.REVIVE,
      this.onRevive.bind(this),
      100
    );
  }
  onRevive(project) {
    for (const id in project.reflections) {
      this.resolve(project, project.reflections[id]);
    }
    this.finishResolve(project);
    this.reflections.clear();
  }
  onResolve(context, reflection) {
    this.resolve(context.project, reflection);
  }
  resolve(project, reflection) {
    if (!(reflection instanceof DeclarationReflection12)) return;
    if (reflection.kindOf(ReflectionKind18.ClassOrInterface)) {
      this.postpone(reflection);
      walk(reflection.implementedTypes, (target) => {
        this.postpone(target);
        target.implementedBy ||= [];
        if (!target.implementedBy.some(
          (t) => t.reflection === reflection
        )) {
          target.implementedBy.push(
            ReferenceType5.createResolvedReference(
              reflection.name,
              reflection,
              project
            )
          );
        }
      });
      walk(reflection.extendedTypes, (target) => {
        this.postpone(target);
        target.extendedBy ||= [];
        if (!target.extendedBy.some((t) => t.reflection === reflection)) {
          target.extendedBy.push(
            ReferenceType5.createResolvedReference(
              reflection.name,
              reflection,
              project
            )
          );
        }
      });
    }
    function walk(types, callback) {
      if (!types) {
        return;
      }
      types.forEach((type2) => {
        if (!(type2 instanceof ReferenceType5)) {
          return;
        }
        if (!type2.reflection || !(type2.reflection instanceof DeclarationReflection12)) {
          return;
        }
        callback(type2.reflection);
      });
    }
  }
  postpone(reflection) {
    this.reflections.add(reflection);
  }
  onResolveEnd(context) {
    this.finishResolve(context.project);
  }
  finishResolve(project) {
    this.reflections.forEach((reflection) => {
      if (reflection.implementedBy) {
        reflection.implementedBy.sort((a, b) => {
          if (a.name === b.name) {
            return 0;
          }
          return a.name > b.name ? 1 : -1;
        });
      }
      let root;
      let hierarchy2;
      function push(types) {
        const level = { types };
        if (hierarchy2) {
          hierarchy2.next = level;
          hierarchy2 = level;
        } else {
          root = hierarchy2 = level;
        }
      }
      if (reflection.extendedTypes) {
        push(reflection.extendedTypes);
      }
      push([
        ReferenceType5.createResolvedReference(
          reflection.name,
          reflection,
          project
        )
      ]);
      hierarchy2.isTarget = true;
      if (reflection.extendedBy) {
        push(reflection.extendedBy);
      }
      if (root.next) {
        reflection.typeHierarchy = root;
      }
    });
  }
};

// src/lib/converter/converter.ts
var _maxTypeConversionDepth_dec, _preserveLinkText_dec, _externalSymbolLinkMappings_dec, _validation_dec3, _commentStyle_dec, _excludeReferences_dec, _excludeProtected_dec2, _excludePrivate_dec2, _excludeExternals_dec, _externalPattern_dec, _a8, _init8, _externalPattern, _excludeExternals, _excludePrivate2, _excludeProtected2, _excludeReferences, _commentStyle, _validation3, _externalSymbolLinkMappings, _preserveLinkText, _maxTypeConversionDepth;
var _Converter = class _Converter extends (_a8 = AbstractComponent2, _externalPattern_dec = [Option8("externalPattern")], _excludeExternals_dec = [Option8("excludeExternals")], _excludePrivate_dec2 = [Option8("excludePrivate")], _excludeProtected_dec2 = [Option8("excludeProtected")], _excludeReferences_dec = [Option8("excludeReferences")], _commentStyle_dec = [Option8("commentStyle")], _validation_dec3 = [Option8("validation")], _externalSymbolLinkMappings_dec = [Option8("externalSymbolLinkMappings")], _preserveLinkText_dec = [Option8("preserveLinkText")], _maxTypeConversionDepth_dec = [Option8("maxTypeConversionDepth")], _a8) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _externalPattern, __runInitializers(_init8, 8, this)), __runInitializers(_init8, 11, this);
    __publicField(this, "externalPatternCache");
    __publicField(this, "excludeCache");
    __privateAdd(this, _excludeExternals, __runInitializers(_init8, 12, this)), __runInitializers(_init8, 15, this);
    __privateAdd(this, _excludePrivate2, __runInitializers(_init8, 16, this)), __runInitializers(_init8, 19, this);
    __privateAdd(this, _excludeProtected2, __runInitializers(_init8, 20, this)), __runInitializers(_init8, 23, this);
    __privateAdd(this, _excludeReferences, __runInitializers(_init8, 24, this)), __runInitializers(_init8, 27, this);
    __privateAdd(this, _commentStyle, __runInitializers(_init8, 28, this)), __runInitializers(_init8, 31, this);
    __privateAdd(this, _validation3, __runInitializers(_init8, 32, this)), __runInitializers(_init8, 35, this);
    __privateAdd(this, _externalSymbolLinkMappings, __runInitializers(_init8, 36, this)), __runInitializers(_init8, 39, this);
    __privateAdd(this, _preserveLinkText, __runInitializers(_init8, 40, this)), __runInitializers(_init8, 43, this);
    __privateAdd(this, _maxTypeConversionDepth, __runInitializers(_init8, 44, this)), __runInitializers(_init8, 47, this);
    __publicField(this, "_config");
    __publicField(this, "_externalSymbolResolvers", []);
    // We try to document symbols which are exported from multiple locations
    // in modules/namespaces which declare them, rather than those which re-export them.
    // To do this, when converting a symbol, that might be re-exported, we first defer it
    // to the second conversion pass.
    __publicField(this, "_deferPermitted", false);
    __publicField(this, "_defer", []);
    /** @internal @hidden */
    __publicField(this, "includePlugin");
    const userConfiguredSymbolResolver = (ref, refl, _part, symbolId) => {
      if (symbolId) {
        return userConfiguredSymbolResolver(
          symbolId.toDeclarationReference(),
          refl,
          void 0,
          void 0
        );
      }
      if (ref.resolutionStart !== "global" || !ref.symbolReference) {
        return;
      }
      const modLinks = this.externalSymbolLinkMappings[ref.moduleSource ?? "global"];
      if (typeof modLinks !== "object") {
        return;
      }
      let name = "";
      if (ref.symbolReference.path) {
        name += ref.symbolReference.path.map((p) => p.path).join(".");
      }
      if (ref.symbolReference.meaning) {
        name += meaningToString(ref.symbolReference.meaning);
      }
      if (typeof modLinks[name] === "string") {
        return modLinks[name];
      }
      if (typeof modLinks["*"] === "string") {
        return modLinks["*"];
      }
    };
    this.addUnknownSymbolResolver(userConfiguredSymbolResolver);
    new CategoryPlugin(this);
    new CommentPlugin(this);
    new GroupPlugin(this);
    new ImplementsPlugin(this);
    new InheritDocPlugin(this);
    new LinkResolverPlugin(this);
    new PackagePlugin(this);
    new SourcePlugin(this);
    new TypePlugin(this);
    this.includePlugin = new IncludePlugin(this);
    new MergeModuleWithPlugin(this);
  }
  get config() {
    return this._config || this._buildCommentParserConfig();
  }
  /**
   * Compile the given source files and create a project reflection for them.
   */
  convert(entryPoints) {
    const programs = unique2(entryPoints.map((e) => e.program));
    this.externalPatternCache = void 0;
    const project = new ProjectReflection(
      this.application.options.getValue("name"),
      this.application.files
    );
    if (this.owner.options.packageDir) {
      project.files.registerReflectionPath(normalizePath6(this.owner.options.packageDir), project);
    }
    const context = new Context(this, programs, project);
    this.trigger(_Converter.EVENT_BEGIN, context);
    this.addProjectDocuments(project);
    this.compile(entryPoints, context);
    this.resolve(context);
    this.trigger(_Converter.EVENT_END, context);
    delete this._config;
    delete this.excludeCache;
    delete this.externalPatternCache;
    clearCommentCache();
    return project;
  }
  /** @internal */
  addProjectDocuments(project) {
    const projectDocuments = getDocumentEntryPoints(
      this.application.logger,
      this.application.options
    );
    for (const { displayName, path: path3 } of projectDocuments) {
      let file;
      try {
        file = new MinimalSourceFile3(readFile3(path3), path3);
      } catch (error) {
        this.application.logger.error(
          i18n14.failed_to_read_0_when_processing_project_document(
            path3
          )
        );
        continue;
      }
      this.addDocument(project, file, displayName);
    }
  }
  /** @internal */
  convertSymbol(context, symbol, exportSymbol) {
    convertSymbol(context, symbol, exportSymbol);
  }
  convertType(context, typeOrNode, maybeNode) {
    return convertType(context, typeOrNode, maybeNode);
  }
  /**
   * Parse the given file into a comment. Intended to be used with markdown files.
   */
  parseRawComment(file, files) {
    return parseCommentString(
      lexCommentString(file.text),
      this.config,
      file,
      this.application.logger,
      files
    );
  }
  /**
   * Adds a new resolver that the theme can use to try to figure out how to link to a symbol declared
   * by a third-party library which is not included in the documentation.
   *
   * The resolver function will be passed a declaration reference which it can attempt to resolve. If
   * resolution fails, the function should return undefined.
   *
   * Note: This will be used for both references to types declared in node_modules (in which case the
   * reference passed will have the `moduleSource` set and the `symbolReference` will navigate via `.`)
   * and user defined \{\@link\} tags which cannot be resolved. If the link being resolved is inferred
   * from a type, then no `part` will be passed to the resolver function.
   */
  addUnknownSymbolResolver(resolver) {
    this._externalSymbolResolvers.push(resolver);
  }
  /** @internal */
  resolveExternalLink(ref, refl, part, symbolId) {
    for (const resolver of this._externalSymbolResolvers) {
      const resolved = resolver(ref, refl, part, symbolId);
      if (resolved) return resolved;
    }
  }
  resolveLinks(comment, owner) {
    if (comment instanceof Reflection2) {
      resolveLinks(
        comment,
        (ref, part, refl, id) => this.resolveExternalLink(ref, part, refl, id),
        { preserveLinkText: this.preserveLinkText }
      );
    } else if (comment instanceof Comment9) {
      resolveLinks(
        owner,
        (ref, part, refl, id) => this.resolveExternalLink(ref, part, refl, id),
        { preserveLinkText: this.preserveLinkText }
      );
    } else {
      return resolvePartLinks(
        owner,
        comment,
        (ref, part, refl, id) => this.resolveExternalLink(ref, part, refl, id),
        { preserveLinkText: this.preserveLinkText }
      );
    }
  }
  /**
   * Permit deferred conversion steps to take place. Until this is called, {@link deferConversion}
   * will throw if used.
   * @since 0.28.1
   */
  permitDeferredConversion() {
    ok6(!this._deferPermitted, "Attempted to allow deferred conversion when already permitted");
    this._deferPermitted = true;
  }
  /**
   * Finalize deferred conversion, must be called by the caller of {@link permitDeferredConversion}
   * @since 0.28.1
   */
  finalizeDeferredConversion() {
    this.application.logger.verbose(`Have ${this._defer.length} initial deferred tasks`);
    let count = 0;
    while (this._defer.length) {
      ++count;
      const first = this._defer.shift();
      first();
    }
    this.application.logger.verbose(`Ran ${count} total deferred tasks`);
    this._deferPermitted = false;
  }
  /**
   * Defer a conversion step until later. This may only be called during conversion.
   * @since 0.28.0
   */
  deferConversion(cb) {
    ok6(this._deferPermitted, "Attempted to defer conversion when not permitted");
    this._defer.push(cb);
  }
  /**
   * Compile the files within the given context and convert the compiler symbols to reflections.
   *
   * @param context  The context object describing the current state the converter is in.
   * @returns An array containing all errors generated by the TypeScript compiler.
   */
  compile(entryPoints, context) {
    this.permitDeferredConversion();
    let createModuleReflections = entryPoints.length > 1;
    if (!createModuleReflections) {
      const opts = this.application.options;
      createModuleReflections = opts.isSet("alwaysCreateEntryPointModule") ? opts.getValue("alwaysCreateEntryPointModule") : !!context.scope.documents;
    }
    if (createModuleReflections) {
      this.trigger(
        ConverterEvents.CREATE_PROJECT,
        context,
        context.project
      );
    }
    for (const entry of entryPoints) {
      const entryContext = context.withScope(context.scope);
      entryContext.setActiveProgram(entry.program);
      this.convertExports(entryContext, entry, createModuleReflections);
    }
    this.finalizeDeferredConversion();
  }
  convertExports(context, entryPoint, createModuleReflections) {
    const node = entryPoint.sourceFile;
    const entryName = entryPoint.displayName;
    const symbol = getSymbolForModuleLike(context, node);
    let moduleContext;
    if (createModuleReflections === false) {
      context.registerReflection(
        context.project,
        symbol,
        normalizePath6(entryPoint.sourceFile.fileName)
      );
      context.project.comment = symbol ? context.getComment(symbol, context.project.kind) : context.getFileComment(node);
      this.processDocumentTags(context.project, context.project);
      this.trigger(
        ConverterEvents.CREATE_PROJECT,
        context,
        context.project
      );
      moduleContext = context;
    } else {
      const reflection = context.createDeclarationReflection(
        ReflectionKind19.Module,
        symbol,
        void 0,
        entryName
      );
      if (!reflection.comment && !symbol) {
        reflection.comment = context.getFileComment(node);
      }
      context.finalizeDeclarationReflection(reflection);
      moduleContext = context.withScope(reflection);
    }
    const allExports = getExports(context, node, symbol);
    const [directExport, indirectExports] = partition3(
      allExports,
      (exp) => isDirectExport(context.resolveAliasedSymbol(exp), node)
    );
    for (const exp of directExport) {
      this.convertSymbol(moduleContext, exp);
    }
    if (indirectExports.length) {
      this.deferConversion(() => {
        for (const exp of indirectExports) {
          this.convertSymbol(moduleContext, exp);
        }
      });
    }
  }
  /**
   * Resolve the project within the given context.
   *
   * @param context  The context object describing the current state the converter is in.
   * @returns The final project reflection.
   */
  resolve(context) {
    this.trigger(_Converter.EVENT_RESOLVE_BEGIN, context);
    const project = context.project;
    for (const id in project.reflections) {
      this.trigger(
        _Converter.EVENT_RESOLVE,
        context,
        project.reflections[id]
      );
    }
    this.trigger(_Converter.EVENT_RESOLVE_END, context);
  }
  /**
   * Used to determine if we should immediately bail when creating a reflection.
   * Note: This should not be used for excludeNotDocumented because we don't have enough
   * information at this point since comment discovery hasn't happened.
   * @internal
   */
  shouldIgnore(symbol, checker) {
    symbol = resolveAliasedSymbol(symbol, checker);
    if (this.isExcluded(symbol)) {
      return true;
    }
    return this.excludeExternals && this.isExternal(symbol, checker);
  }
  isExcluded(symbol) {
    this.excludeCache ??= new MinimatchSet(
      this.application.options.getValue("exclude")
    );
    const cache = this.excludeCache;
    return (symbol.getDeclarations() ?? []).some((node) => cache.matchesAny(node.getSourceFile().fileName));
  }
  /** @internal */
  isExternal(symbol, checker) {
    this.externalPatternCache ??= new MinimatchSet(this.externalPattern);
    const cache = this.externalPatternCache;
    const declarations = resolveAliasedSymbol(symbol, checker).getDeclarations();
    if (!declarations?.length) {
      return false;
    }
    return declarations.every((node) => cache.matchesAny(node.getSourceFile().fileName));
  }
  processDocumentTags(reflection, parent) {
    let relativeTo = reflection.comment?.sourcePath;
    if (relativeTo) {
      relativeTo = NormalizedPathUtils2.dirname(relativeTo);
      const tags = reflection.comment?.getTags("@document") || [];
      reflection.comment?.removeTags("@document");
      for (const tag of tags) {
        const path3 = Comment9.combineDisplayParts(tag.content);
        let file;
        try {
          const resolved = normalizePath6(resolve2(relativeTo, path3));
          file = new MinimalSourceFile3(readFile3(resolved), resolved);
        } catch {
          this.application.logger.warn(
            i18n14.failed_to_read_0_when_processing_document_tag_in_1(
              nicePath4(path3),
              nicePath4(reflection.comment.sourcePath)
            )
          );
          continue;
        }
        this.addDocument(
          parent,
          file,
          basename(file.fileName).replace(/\.[^.]+$/, "")
        );
      }
    }
  }
  addDocument(parent, file, displayName) {
    const { content, frontmatter } = this.parseRawComment(
      file,
      parent.project.files
    );
    const children = frontmatter["children"];
    delete frontmatter["children"];
    const docRefl = new DocumentReflection(
      displayName,
      parent,
      content,
      frontmatter
    );
    this.application.watchFile(file.fileName);
    parent.addChild(docRefl);
    parent.project.registerReflection(docRefl, void 0, file.fileName);
    this.trigger(ConverterEvents.CREATE_DOCUMENT, void 0, docRefl);
    const childrenToAdd = [];
    if (children && typeof children === "object") {
      if (Array.isArray(children)) {
        for (const child of children) {
          if (typeof child === "string") {
            childrenToAdd.push([
              basename(child).replace(/\.[^.]+$/, ""),
              child
            ]);
          } else {
            this.application.logger.error(
              i18n14.frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values(
                nicePath4(file.fileName)
              )
            );
            return;
          }
        }
      } else {
        for (const [name, path3] of Object.entries(children)) {
          if (typeof path3 === "string") {
            childrenToAdd.push([name, path3]);
          } else {
            this.application.logger.error(
              i18n14.frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values(
                nicePath4(file.fileName)
              )
            );
            return;
          }
        }
      }
    }
    for (const [displayName2, path3] of childrenToAdd) {
      const absPath = normalizePath6(resolve2(dirname2(file.fileName), path3));
      let childFile;
      try {
        childFile = new MinimalSourceFile3(readFile3(absPath), absPath);
      } catch (error) {
        this.application.logger.error(
          i18n14.failed_to_read_0_when_processing_document_child_in_1(
            path3,
            nicePath4(file.fileName)
          )
        );
        continue;
      }
      this.addDocument(docRefl, childFile, displayName2);
    }
  }
  _buildCommentParserConfig() {
    this._config = {
      blockTags: new Set(this.application.options.getValue("blockTags")),
      inlineTags: new Set(this.application.options.getValue("inlineTags")),
      modifierTags: new Set(this.application.options.getValue("modifierTags")),
      preservedTypeAnnotationTags: new Set(this.application.options.getValue("preservedTypeAnnotationTags")),
      jsDocCompatibility: this.application.options.getValue("jsDocCompatibility"),
      suppressCommentWarningsInDeclarationFiles: this.application.options.getValue(
        "suppressCommentWarningsInDeclarationFiles"
      ),
      useTsLinkResolution: this.application.options.getValue(
        "useTsLinkResolution"
      ),
      commentStyle: this.application.options.getValue("commentStyle"),
      validationOptions: this.application.options.getValue("validation")
    };
    this._config.blockTags.add("@inheritDoc");
    return this._config;
  }
};
_init8 = __decoratorStart(_a8);
_externalPattern = new WeakMap();
_excludeExternals = new WeakMap();
_excludePrivate2 = new WeakMap();
_excludeProtected2 = new WeakMap();
_excludeReferences = new WeakMap();
_commentStyle = new WeakMap();
_validation3 = new WeakMap();
_externalSymbolLinkMappings = new WeakMap();
_preserveLinkText = new WeakMap();
_maxTypeConversionDepth = new WeakMap();
__decorateElement(_init8, 4, "externalPattern", _externalPattern_dec, _Converter, _externalPattern);
__decorateElement(_init8, 4, "excludeExternals", _excludeExternals_dec, _Converter, _excludeExternals);
__decorateElement(_init8, 4, "excludePrivate", _excludePrivate_dec2, _Converter, _excludePrivate2);
__decorateElement(_init8, 4, "excludeProtected", _excludeProtected_dec2, _Converter, _excludeProtected2);
__decorateElement(_init8, 4, "excludeReferences", _excludeReferences_dec, _Converter, _excludeReferences);
__decorateElement(_init8, 4, "commentStyle", _commentStyle_dec, _Converter, _commentStyle);
__decorateElement(_init8, 4, "validation", _validation_dec3, _Converter, _validation3);
__decorateElement(_init8, 4, "externalSymbolLinkMappings", _externalSymbolLinkMappings_dec, _Converter, _externalSymbolLinkMappings);
__decorateElement(_init8, 4, "preserveLinkText", _preserveLinkText_dec, _Converter, _preserveLinkText);
__decorateElement(_init8, 4, "maxTypeConversionDepth", _maxTypeConversionDepth_dec, _Converter, _maxTypeConversionDepth);
__decoratorMetadata(_init8, _Converter);
/**
 * General events
 */
/**
 * Triggered when the converter begins converting a project.
 * The listener will be given a {@link Context} object.
 * @event
 */
__publicField(_Converter, "EVENT_BEGIN", ConverterEvents.BEGIN);
/**
 * Triggered when the converter has finished converting a project.
 * The listener will be given a {@link Context} object.
 * @event
 */
__publicField(_Converter, "EVENT_END", ConverterEvents.END);
/**
 * Factory events
 */
/**
 * Triggered when the converter has created a project reflection.
 * The listener will be given {@link Context} and a {@link Models.ProjectReflection}.
 * @event
 */
__publicField(_Converter, "EVENT_CREATE_PROJECT", ConverterEvents.CREATE_PROJECT);
/**
 * Triggered when the converter has created a declaration reflection.
 * The listener will be given {@link Context} and a {@link Models.DeclarationReflection}.
 * @event
 */
__publicField(_Converter, "EVENT_CREATE_DECLARATION", ConverterEvents.CREATE_DECLARATION);
/**
 * Triggered when the converter has created a document reflection.
 * The listener will be given `undefined` (for consistency with the
 * other create events) and a {@link Models.DocumentReflection}.
 * @event
 */
__publicField(_Converter, "EVENT_CREATE_DOCUMENT", ConverterEvents.CREATE_DOCUMENT);
/**
 * Triggered when the converter has created a signature reflection.
 * The listener will be given {@link Context}, {@link Models.SignatureReflection} | {@link Models.ProjectReflection} the declaration,
 * `ts.SignatureDeclaration | ts.IndexSignatureDeclaration | ts.JSDocSignature | undefined`,
 * and `ts.Signature | undefined`. The signature will be undefined if the created signature is an index signature.
 * @event
 */
__publicField(_Converter, "EVENT_CREATE_SIGNATURE", ConverterEvents.CREATE_SIGNATURE);
/**
 * Triggered when the converter has created a parameter reflection.
 * The listener will be given {@link Context}, {@link Models.ParameterReflection} and a `ts.Node?`
 * @event
 */
__publicField(_Converter, "EVENT_CREATE_PARAMETER", ConverterEvents.CREATE_PARAMETER);
/**
 * Triggered when the converter has created a type parameter reflection.
 * The listener will be given {@link Context} and a {@link Models.TypeParameterReflection}
 * @event
 */
__publicField(_Converter, "EVENT_CREATE_TYPE_PARAMETER", ConverterEvents.CREATE_TYPE_PARAMETER);
/**
 * Resolve events
 */
/**
 * Triggered when the converter begins resolving a project.
 * The listener will be given {@link Context}.
 * @event
 */
__publicField(_Converter, "EVENT_RESOLVE_BEGIN", ConverterEvents.RESOLVE_BEGIN);
/**
 * Triggered when the converter resolves a reflection.
 * The listener will be given {@link Context} and a {@link Reflection}.
 * @event
 */
__publicField(_Converter, "EVENT_RESOLVE", ConverterEvents.RESOLVE);
/**
 * Triggered when the converter has finished resolving a project.
 * The listener will be given {@link Context}.
 * @event
 */
__publicField(_Converter, "EVENT_RESOLVE_END", ConverterEvents.RESOLVE_END);
var Converter = _Converter;
function getSymbolForModuleLike(context, node) {
  const symbol = context.checker.getSymbolAtLocation(node) ?? node.symbol;
  if (symbol) {
    return symbol;
  }
  const sourceFile = node.getSourceFile();
  const globalSymbols = context.checker.getSymbolsInScope(node, ts16.SymbolFlags.ModuleMember).filter((s) => s.getDeclarations()?.some((d) => d.getSourceFile() === sourceFile));
  if (globalSymbols.length === 1 && globalSymbols[0].getDeclarations()?.every(
    (declaration) => ts16.isModuleDeclaration(declaration) && ts16.isStringLiteral(declaration.name)
  )) {
    return globalSymbols[0];
  }
}
function getExports(context, node, symbol) {
  let result;
  const exportEq = symbol?.exports?.get("export=");
  if (exportEq) {
    result = [exportEq].concat(
      context.checker.getExportsOfModule(symbol).filter(
        (s) => !hasAnyFlag2(
          s.flags,
          ts16.SymbolFlags.Prototype | ts16.SymbolFlags.Value
        )
      )
    );
  } else if (symbol) {
    result = context.checker.getExportsOfModule(symbol).filter((s) => !hasAllFlags2(s.flags, ts16.SymbolFlags.Prototype));
    if (result.length === 0) {
      const globalDecl = node.statements.find(
        (s) => ts16.isModuleDeclaration(s) && s.flags & ts16.NodeFlags.GlobalAugmentation
      );
      if (globalDecl) {
        const globalSymbol = context.getSymbolAtLocation(globalDecl);
        if (globalSymbol) {
          result = context.checker.getExportsOfModule(globalSymbol).filter(
            (exp) => exp.declarations?.some(
              (d) => d.getSourceFile() === node
            )
          ).map((s) => context.checker.getMergedSymbol(s));
        }
      }
    }
  } else {
    const sourceFile = node.getSourceFile();
    result = context.checker.getSymbolsInScope(node, ts16.SymbolFlags.ModuleMember).filter(
      (s) => s.getDeclarations()?.some((d) => d.getSourceFile() === sourceFile)
    );
  }
  result.sort((a, b) => {
    if (a.name === "default") {
      return 1;
    } else if (b.name === "default") {
      return -1;
    }
    return 0;
  });
  return result;
}
function isDirectExport(symbol, file) {
  return symbol.getDeclarations()?.every((decl) => decl.getSourceFile() === file) ?? false;
}

// src/lib/converter/utilities/repository.ts
import { normalizePath as normalizePath7 } from "#node-utils";
import { i18n as i18n15, NonEnumerable, NormalizedPathUtils as NormalizedPathUtils3 } from "#utils";
import { stat } from "node:fs/promises";
import { join as join2 } from "path";
import { spawn, spawnSync } from "node:child_process";
import { relative as relative3 } from "node:path";
var gitIsInstalled = void 0;
function gitAsync(...args) {
  const child = spawn("git", args, { windowsHide: true });
  const promise = new Promise((resolve3) => {
    const stdout = [];
    const stderr = [];
    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");
    child.stdout.on("data", (chunk) => {
      stdout.push(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr.push(chunk);
    });
    child.once("error", (err) => {
      resolve3({
        status: null,
        stdout: stdout.join(""),
        stderr: stderr.join(""),
        errorCode: err.code ?? "EUNKNOWN"
      });
    });
    child.once("close", (code) => {
      resolve3({ status: code, stdout: stdout.join(""), stderr: stderr.join("") });
    });
  });
  return { child, promise };
}
var AssumedRepository = class {
  constructor(path3, gitRevision, sourceLinkTemplate) {
    this.path = path3;
    this.gitRevision = gitRevision;
    this.sourceLinkTemplate = sourceLinkTemplate;
  }
  path;
  gitRevision;
  sourceLinkTemplate;
  getURL(fileName, line2) {
    const replacements = {
      gitRevision: this.gitRevision,
      "gitRevision:short": this.gitRevision.substring(0, 8),
      path: relative3(this.path, fileName).replaceAll("\\", "/"),
      line: line2
    };
    return this.sourceLinkTemplate.replace(
      /\{(gitRevision|gitRevision:short|path|line)\}/g,
      (_, key) => replacements[key]
    );
  }
};
var _files_dec, _init9;
_files_dec = [NonEnumerable];
var _GitRepository = class _GitRepository {
  /**
   * Create a new Repository instance.
   *
   * @param path  The root path of the repository.
   */
  constructor(path3, gitRevision, urlTemplate) {
    /**
     * The path of this repository on disk.
     */
    __publicField(this, "path");
    __publicField(this, "files", __runInitializers(_init9, 8, this, /* @__PURE__ */ new Set())), __runInitializers(_init9, 11, this);
    __publicField(this, "urlTemplate");
    __publicField(this, "gitRevision");
    this.path = path3;
    this.gitRevision = gitRevision;
    this.urlTemplate = urlTemplate;
  }
  /**
   * Get the URL of the given file on GitHub or Bitbucket.
   *
   * @param fileName  The file whose URL should be determined.
   * @returns A URL pointing to the web preview of the given file or undefined.
   */
  getURL(fileName, line2) {
    if (!this.files.has(fileName)) {
      return;
    }
    const replacements = {
      gitRevision: this.gitRevision,
      "gitRevision:short": this.gitRevision.substring(0, 8),
      path: fileName.substring(this.path.length + 1),
      line: line2
    };
    return this.urlTemplate.replace(
      /\{(gitRevision|gitRevision:short|path|line)\}/g,
      (_, key) => replacements[key]
    );
  }
  /**
   * Try to create a new repository instance.
   *
   * Checks whether the given path is the root of a valid repository and if so
   * creates a new instance of {@link GitRepository}.
   *
   * @param path  The potential repository root.
   * @returns A promise resolving to {@link GitRepository} or undefined.
   */
  static async tryCreateRepository(path3, sourceLinkTemplate, gitRevision, gitRemote, logger) {
    const branchPromise = gitRevision === "{branch}" ? gitAsync("-C", path3, "branch", "--show-current").promise : Promise.resolve({ status: 0, stdout: "", stderr: "" });
    const headPromise = gitRevision === "" || gitRevision === "{branch}" ? gitAsync("-C", path3, "rev-parse", "HEAD").promise : Promise.resolve({ status: 0, stdout: gitRevision, stderr: "" });
    const getUrlCall = sourceLinkTemplate ? void 0 : gitAsync("-C", path3, "remote", "get-url", gitRemote);
    const lsFilesCall = gitAsync("-C", path3, "ls-files", "-z");
    const [branchOut, headOut] = await Promise.all([branchPromise, headPromise]);
    let rev = gitRevision;
    if (rev === "{branch}") rev = branchOut.stdout.trim();
    if (!rev) rev = headOut.stdout.trim();
    if (rev === "HEAD") {
      if (getUrlCall?.child.exitCode == null) {
        getUrlCall?.child.kill();
      }
      if (lsFilesCall.child.exitCode == null) {
        lsFilesCall.child.kill();
      }
      await getUrlCall?.promise;
      await lsFilesCall.promise;
      return;
    }
    const remotesOut = await getUrlCall?.promise;
    let urlTemplate;
    if (sourceLinkTemplate) {
      urlTemplate = sourceLinkTemplate;
    } else if (remotesOut.status === 0) {
      urlTemplate = guessSourceUrlTemplate(remotesOut.stdout.split("\n"));
    } else {
      logger.warn(i18n15.git_remote_0_not_valid(gitRemote));
    }
    if (!urlTemplate) {
      if (lsFilesCall.child.exitCode == null) {
        lsFilesCall.child.kill();
      }
      await lsFilesCall.promise;
      return;
    }
    const lsFilesOut = await lsFilesCall.promise;
    const repo = new _GitRepository(normalizePath7(path3), rev, urlTemplate);
    if (lsFilesOut.status === 0) {
      for (const file of lsFilesOut.stdout.split("\0")) {
        if (file !== "") {
          repo.files.add(normalizePath7(path3 + "/" + file));
        }
      }
    }
    return repo;
  }
};
_init9 = __decoratorStart(null);
__decorateElement(_init9, 5, "files", _files_dec, _GitRepository);
__decoratorMetadata(_init9, _GitRepository);
var GitRepository = _GitRepository;
var RepositoryManager = class {
  constructor(basePath, gitRevision, gitRemote, sourceLinkTemplate, disableGit, logger) {
    this.basePath = basePath;
    this.gitRevision = gitRevision;
    this.gitRemote = gitRemote;
    this.sourceLinkTemplate = sourceLinkTemplate;
    this.disableGit = disableGit;
    this.logger = logger;
    this.assumedRepo = new AssumedRepository(
      this.basePath,
      this.gitRevision,
      this.sourceLinkTemplate
    );
  }
  basePath;
  gitRevision;
  gitRemote;
  sourceLinkTemplate;
  disableGit;
  logger;
  repositories = /* @__PURE__ */ new Map();
  assumedRepo;
  async discoverPossibleGitDirs(dirs) {
    let queue = dirs;
    const checkedDirs = /* @__PURE__ */ new Set();
    const possibleGitDirs = [];
    while (queue.length) {
      const dirCouldBeGitDir = await Promise.all(queue.map(async (dir) => {
        checkedDirs.add(dir);
        try {
          const gitStats = await stat(join2(dir, ".git"));
          return gitStats.isDirectory();
        } catch {
          return false;
        }
      }));
      const nextQueue = /* @__PURE__ */ new Set();
      for (let i = 0; i < queue.length; ++i) {
        if (dirCouldBeGitDir[i]) {
          possibleGitDirs.push(queue[i]);
        } else {
          const parent = NormalizedPathUtils3.dirname(queue[i]);
          if (!checkedDirs.has(parent) && parent !== queue[i]) {
            nextQueue.add(NormalizedPathUtils3.dirname(queue[i]));
          }
        }
      }
      queue = Array.from(nextQueue);
    }
    return possibleGitDirs;
  }
  async initializeRepositoriesForDirs(dirs) {
    if (gitIsInstalled === void 0) {
      gitIsInstalled = spawnSync("git", ["--version"]).status === 0;
    }
    if (!gitIsInstalled) {
      return;
    }
    const possibleGitDirs = await this.discoverPossibleGitDirs(dirs.map(normalizePath7));
    const symlinkedGitDirs = /* @__PURE__ */ new Map();
    const topLevelGitDirs = /* @__PURE__ */ new Set();
    await Promise.all(possibleGitDirs.map(async (dir) => {
      const topLevel = await gitAsync("-C", dir, "rev-parse", "--show-toplevel").promise;
      if (topLevel.status !== 0) return;
      const repoDir = normalizePath7(topLevel.stdout.replace("\n", ""));
      topLevelGitDirs.add(repoDir);
      if (repoDir !== dir) {
        symlinkedGitDirs.set(dir, repoDir);
      }
    }));
    await Promise.all(Array.from(topLevelGitDirs, async (repoDir) => {
      const repo = await GitRepository.tryCreateRepository(
        repoDir,
        this.sourceLinkTemplate,
        this.gitRevision,
        this.gitRemote,
        this.logger
      );
      this.repositories.set(repoDir, repo);
    }));
    for (const [source, target] of symlinkedGitDirs) {
      this.repositories.set(source, this.repositories.get(target));
    }
  }
  getURL(fileName, line2) {
    return this.getRepository(fileName)?.getURL(fileName, line2);
  }
  getRepository(fileName) {
    if (this.disableGit) {
      return this.assumedRepo;
    }
    const expectedDir = NormalizedPathUtils3.dirname(fileName);
    if (this.repositories.has(expectedDir)) {
      return this.repositories.get(expectedDir);
    }
    let working = expectedDir;
    let parent = NormalizedPathUtils3.dirname(working);
    while (parent !== working) {
      if (this.repositories.has(parent)) {
        const result = this.repositories.get(parent);
        this.repositories.set(expectedDir, result);
        return result;
      }
      working = parent;
      parent = NormalizedPathUtils3.dirname(working);
    }
    this.repositories.set(expectedDir, void 0);
    return void 0;
  }
};
var repoExpressions = [
  /(github(?!.us)(?:\.[a-z]+)*\.[a-z]{2,})[:/]([^/]+)\/(.*)/,
  /(\w+\.githubprivate.com)[:/]([^/]+)\/(.*)/,
  // GitHub enterprise
  /(\w+\.ghe.com)[:/]([^/]+)\/(.*)/,
  // GitHub enterprise
  /(\w+\.github.us)[:/]([^/]+)\/(.*)/,
  // GitHub enterprise
  /(bitbucket.org)[:/]([^/]+)\/(.*)/,
  /(gitlab.com)[:/]([^/]+)\/(.*)/
];
function guessSourceUrlTemplate(remotes) {
  let hostname = "";
  let user = "";
  let project = "";
  outer: for (const repoLink of remotes) {
    for (const regex of repoExpressions) {
      const match = regex.exec(repoLink);
      if (match) {
        hostname = match[1];
        user = match[2];
        project = match[3];
        break outer;
      }
    }
  }
  if (!hostname) return;
  if (project.endsWith(".git")) {
    project = project.slice(0, -4);
  }
  let sourcePath = "blob";
  let anchorPrefix = "L";
  if (hostname.includes("gitlab")) {
    sourcePath = "-/blob";
  } else if (hostname.includes("bitbucket")) {
    sourcePath = "src";
    anchorPrefix = "lines-";
  }
  return `https://${hostname}/${user}/${project}/${sourcePath}/{gitRevision}/{path}#${anchorPrefix}{line}`;
}

// src/lib/output/renderer.ts
import * as fs from "fs";
import * as path2 from "path";
import { AbstractComponent as AbstractComponent4, Option as Option15, writeFile as writeFile6 } from "#node-utils";
import { EventHooks, i18n as i18n32, JSX as JSX34 } from "#utils";

// src/lib/output/events.ts
import {
  Reflection as Reflection3
} from "#models";

// src/lib/output/themes/default/partials/icon.tsx
import assert9 from "assert";
import { ReflectionKind as ReflectionKind20 } from "#models";
import { i18n as i18n16, JSX } from "#utils";
var kindIcon = (letterPath, color, label, circular = false) => /* @__PURE__ */ JSX.createElement("svg", { class: "tsd-kind-icon", viewBox: "0 0 24 24", "aria-label": label }, /* @__PURE__ */ JSX.createElement(
  "rect",
  {
    fill: "var(--color-icon-background)",
    stroke: color,
    "stroke-width": "1.5",
    x: "1",
    y: "1",
    width: "22",
    height: "22",
    rx: circular ? "12" : "6"
  }
), letterPath);
var textIcon = (letter, color, label, circular = false) => kindIcon(
  /* @__PURE__ */ JSX.createElement("text", { fill: "var(--color-icon-text)", x: "50%", y: "50%", dy: "0.35em", "text-anchor": "middle" }, letter),
  color,
  label,
  circular
);
function buildRefIcons(icons, context) {
  const refs = {};
  for (const [name, builder] of Object.entries(icons)) {
    const jsx = builder.call(icons);
    assert9(jsx.tag === "svg", "TypeDoc's frontend assumes that icons are written as svg elements");
    if (name === "checkbox") {
      refs[name] = () => jsx;
      continue;
    }
    const ref = /* @__PURE__ */ JSX.createElement("svg", { ...jsx.props, id: void 0 }, /* @__PURE__ */ JSX.createElement("use", { href: `${context.relativeURL("assets/icons.svg")}#icon-${name}` }));
    refs[name] = () => ref;
  }
  return refs;
}
function getIcons() {
  return {
    [ReflectionKind20.Accessor]: () => textIcon("A", "var(--color-ts-accessor)", i18n16.kind_accessor(), true),
    [ReflectionKind20.CallSignature]() {
      return this[ReflectionKind20.Function]();
    },
    [ReflectionKind20.Class]: () => textIcon("C", "var(--color-ts-class)", i18n16.kind_class()),
    [ReflectionKind20.Constructor]: () => textIcon("C", "var(--color-ts-constructor)", i18n16.kind_constructor(), true),
    [ReflectionKind20.ConstructorSignature]() {
      return this[ReflectionKind20.Constructor]();
    },
    [ReflectionKind20.Enum]: () => textIcon("E", "var(--color-ts-enum)", i18n16.kind_enum()),
    [ReflectionKind20.EnumMember]: () => textIcon("P", "var(--color-ts-property)", i18n16.kind_enum_member(), true),
    [ReflectionKind20.Function]: () => textIcon("F", "var(--color-ts-function)", i18n16.kind_function()),
    [ReflectionKind20.GetSignature]() {
      return this[ReflectionKind20.Accessor]();
    },
    [ReflectionKind20.IndexSignature]: () => textIcon("P", "var(--color-ts-property)", i18n16.kind_index_signature(), true),
    [ReflectionKind20.Interface]: () => textIcon("I", "var(--color-ts-interface)", i18n16.kind_interface()),
    [ReflectionKind20.Method]: () => textIcon("M", "var(--color-ts-method)", i18n16.kind_method(), true),
    [ReflectionKind20.Module]: () => textIcon("M", "var(--color-ts-module)", i18n16.kind_module()),
    [ReflectionKind20.Namespace]: () => textIcon("N", "var(--color-ts-namespace)", i18n16.kind_namespace()),
    [ReflectionKind20.Parameter]() {
      return this[ReflectionKind20.Property]();
    },
    [ReflectionKind20.Project]() {
      return this[ReflectionKind20.Module]();
    },
    [ReflectionKind20.Property]: () => textIcon("P", "var(--color-ts-property)", i18n16.kind_property(), true),
    [ReflectionKind20.Reference]: () => textIcon("R", "var(--color-ts-reference)", i18n16.kind_reference(), true),
    [ReflectionKind20.SetSignature]() {
      return this[ReflectionKind20.Accessor]();
    },
    [ReflectionKind20.TypeAlias]: () => textIcon("T", "var(--color-ts-type-alias)", i18n16.kind_type_alias()),
    [ReflectionKind20.TypeLiteral]() {
      return this[ReflectionKind20.TypeAlias]();
    },
    [ReflectionKind20.TypeParameter]() {
      return this[ReflectionKind20.TypeAlias]();
    },
    [ReflectionKind20.Variable]: () => textIcon("V", "var(--color-ts-variable)", i18n16.kind_variable()),
    [ReflectionKind20.Document]: () => kindIcon(
      /* @__PURE__ */ JSX.createElement("g", { stroke: "var(--color-icon-text)", fill: "none", "stroke-width": "1.5" }, /* @__PURE__ */ JSX.createElement("polygon", { points: "6,5 6,19 18,19, 18,10 13,5" }), /* @__PURE__ */ JSX.createElement("line", { x1: "9", y1: "9", x2: "13", y2: "9" }), /* @__PURE__ */ JSX.createElement("line", { x1: "9", y1: "12", x2: "15", y2: "12" }), /* @__PURE__ */ JSX.createElement("line", { x1: "9", y1: "15", x2: "15", y2: "15" })),
      "var(--color-document)",
      i18n16.kind_document()
    ),
    folder: () => kindIcon(
      /* @__PURE__ */ JSX.createElement("g", { stroke: "var(--color-icon-text)", fill: "none", "stroke-width": "1.5" }, /* @__PURE__ */ JSX.createElement("polygon", { points: "5,5 10,5 12,8 19,8 19,18 5,18" })),
      "var(--color-document)",
      i18n16.theme_folder()
    ),
    chevronDown: () => /* @__PURE__ */ JSX.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        d: "M4.93896 8.531L12 15.591L19.061 8.531L16.939 6.409L12 11.349L7.06098 6.409L4.93896 8.531Z",
        fill: "var(--color-icon-text)"
      }
    )),
    chevronSmall: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        d: "M1.5 5.50969L8 11.6609L14.5 5.50969L12.5466 3.66086L8 7.96494L3.45341 3.66086L1.5 5.50969Z",
        fill: "var(--color-icon-text)"
      }
    )),
    checkbox: () => /* @__PURE__ */ JSX.createElement("svg", { width: "32", height: "32", viewBox: "0 0 32 32", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement("rect", { class: "tsd-checkbox-background", width: "30", height: "30", x: "1", y: "1", rx: "6", fill: "none" }), /* @__PURE__ */ JSX.createElement(
      "path",
      {
        class: "tsd-checkbox-checkmark",
        d: "M8.35422 16.8214L13.2143 21.75L24.6458 10.25",
        stroke: "none",
        "stroke-width": "3.5",
        "stroke-linejoin": "round",
        fill: "none"
      }
    )),
    menu: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, ["3", "7", "11"].map((y) => /* @__PURE__ */ JSX.createElement("rect", { x: "1", y, width: "14", height: "2", fill: "var(--color-icon-text)" }))),
    search: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        d: "M15.7824 13.833L12.6666 10.7177C12.5259 10.5771 12.3353 10.499 12.1353 10.499H11.6259C12.4884 9.39596 13.001 8.00859 13.001 6.49937C13.001 2.90909 10.0914 0 6.50048 0C2.90959 0 0 2.90909 0 6.49937C0 10.0896 2.90959 12.9987 6.50048 12.9987C8.00996 12.9987 9.39756 12.4863 10.5008 11.6239V12.1332C10.5008 12.3332 10.5789 12.5238 10.7195 12.6644L13.8354 15.7797C14.1292 16.0734 14.6042 16.0734 14.8948 15.7797L15.7793 14.8954C16.0731 14.6017 16.0731 14.1267 15.7824 13.833ZM6.50048 10.499C4.29094 10.499 2.50018 8.71165 2.50018 6.49937C2.50018 4.29021 4.28781 2.49976 6.50048 2.49976C8.71001 2.49976 10.5008 4.28708 10.5008 6.49937C10.5008 8.70852 8.71314 10.499 6.50048 10.499Z",
        fill: "var(--color-icon-text)"
      }
    )),
    anchor: () => /* @__PURE__ */ JSX.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement("g", { "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, /* @__PURE__ */ JSX.createElement("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), /* @__PURE__ */ JSX.createElement("path", { d: "M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" }), /* @__PURE__ */ JSX.createElement("path", { d: "M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" }))),
    alertNote: () => /* @__PURE__ */ JSX.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        fill: "var(--color-alert-note)",
        d: "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      }
    )),
    alertTip: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        fill: "var(--color-alert-tip)",
        d: "M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"
      }
    )),
    alertImportant: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        fill: "var(--color-alert-important)",
        d: "M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      }
    )),
    alertWarning: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        fill: "var(--color-alert-warning)",
        d: "M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
      }
    )),
    alertCaution: () => /* @__PURE__ */ JSX.createElement("svg", { width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ JSX.createElement(
      "path",
      {
        fill: "var(--color-alert-caution)",
        d: "M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      }
    ))
  };
}

// src/lib/output/events.ts
var RendererEvent = class {
  /**
   * The project the renderer is currently processing.
   */
  project;
  /**
   * The path of the directory the documentation should be written to.
   */
  outputDirectory;
  /**
   * A list of all pages that will be generated.
   */
  pages;
  /**
   * Triggered before the renderer starts rendering a project.
   * @event
   */
  static BEGIN = "beginRender";
  /**
   * Triggered after the renderer has written all documents.
   * @event
   */
  static END = "endRender";
  constructor(outputDirectory, project, pages) {
    this.outputDirectory = outputDirectory;
    this.project = project;
    this.pages = pages;
  }
};
var PageEvent = class {
  /**
   * The project the renderer is currently processing.
   */
  project;
  /**
   * The filename the page will be written to.
   */
  filename;
  /**
   * The url this page will be located at.
   */
  url;
  /**
   * The type of page this is.
   */
  pageKind;
  /**
   * The model that should be rendered on this page.
   */
  model;
  /**
   * The final html content of this page.
   *
   * Should be rendered by layout templates and can be modified by plugins.
   */
  contents;
  /**
   * Links to content within this page that should be rendered in the page navigation.
   * This is built when rendering the document content.
   */
  pageHeadings = [];
  /**
   * Sections of the page, generally set by `@group`s
   */
  pageSections = [
    {
      title: "",
      headings: this.pageHeadings
    }
  ];
  /**
   * Start a new section of the page. Sections are collapsible within
   * the "On This Page" sidebar.
   */
  startNewSection(title) {
    this.pageHeadings = [];
    this.pageSections.push({
      title,
      headings: this.pageHeadings
    });
  }
  /**
   * Triggered before a document will be rendered.
   * @event
   */
  static BEGIN = "beginPage";
  /**
   * Triggered after a document has been rendered, just before it is written to disc.
   * @event
   */
  static END = "endPage";
  constructor(model) {
    this.model = model;
  }
  isReflectionEvent() {
    return this.model instanceof Reflection3;
  }
};
var MarkdownEvent = class {
  /**
   * The unparsed original text.
   */
  originalText;
  /**
   * The parsed output.
   */
  parsedText;
  /**
   * The page that this markdown is being parsed for.
   */
  page;
  /**
   * Triggered on the renderer when this plugin parses a markdown string.
   * @event
   */
  static PARSE = "parseMarkdown";
  constructor(page, originalText, parsedText) {
    this.page = page;
    this.originalText = originalText;
    this.parsedText = parsedText;
  }
};
var IndexEvent = class {
  /**
   * Triggered on the renderer when the search index is being prepared.
   * @event
   */
  static PREPARE_INDEX = "prepareIndex";
  /**
   * May be filtered by plugins to reduce the results available.
   * Additional items *should not* be added to this array.
   *
   * If you remove an index from this array, you must also remove the
   * same index from {@link searchFields}. The {@link removeResult} helper
   * will do this for you.
   */
  searchResults;
  /**
   * Additional search fields to be used when creating the search index.
   * `name`, `comment` and `document` may be specified to overwrite TypeDoc's search fields.
   *
   * Do not use `id` as a custom search field.
   */
  searchFields;
  /**
   * Weights for the fields defined in `searchFields`. The default will weight
   * `name` as 10x more important than comment and document content.
   *
   * If a field added to {@link searchFields} is not added to this object, it
   * will **not** be searchable.
   *
   * Do not replace this object, instead, set new properties on it for custom search
   * fields added by your plugin.
   */
  searchFieldWeights = {
    name: 10,
    comment: 1,
    document: 1
  };
  /**
   * Remove a search result by index.
   */
  removeResult(index2) {
    this.searchResults.splice(index2, 1);
    this.searchFields.splice(index2, 1);
  }
  constructor(searchResults) {
    this.searchResults = searchResults;
    this.searchFields = Array.from(
      { length: this.searchResults.length },
      () => ({})
    );
  }
};

// src/lib/output/components.ts
import * as Path2 from "path";
import { AbstractComponent as AbstractComponent3, Option as Option9 } from "#node-utils";
var RendererComponent = class extends AbstractComponent3 {
};
var _useHostedBaseUrlForAbsoluteLinks_dec, _a9, _init10, _useHostedBaseUrlForAbsoluteLinks;
var ContextAwareRendererComponent = class extends (_a9 = RendererComponent, _useHostedBaseUrlForAbsoluteLinks_dec = [Option9("useHostedBaseUrlForAbsoluteLinks")], _a9) {
  constructor(owner) {
    super(owner);
    /**
     * The project that is currently processed.
     */
    __publicField(this, "project");
    /**
     * The reflection that is currently processed.
     */
    __publicField(this, "page");
    /**
     * The url of the document that is being currently generated.
     * Set when a page begins rendering.
     *
     * Defaulted to '.' so that tests don't have to set up events.
     */
    __publicField(this, "location", ".");
    /**
     * Regular expression to test if a string looks like an external url.
     */
    __publicField(this, "urlPrefix", /^(http|ftp)s?:\/\//);
    __privateAdd(this, _useHostedBaseUrlForAbsoluteLinks, __runInitializers(_init10, 8, this)), __runInitializers(_init10, 11, this);
    __publicField(this, "absoluteToRelativePathMap", /* @__PURE__ */ new Map());
    this.owner.on(RendererEvent.BEGIN, this.onBeginRenderer.bind(this));
    this.owner.on(PageEvent.BEGIN, this.onBeginPage.bind(this));
    this.owner.on(RendererEvent.END, () => this.absoluteToRelativePathMap.clear());
  }
  get hostedBaseUrl() {
    const url = this.application.options.getValue("hostedBaseUrl");
    return !url || url.endsWith("/") ? url : url + "/";
  }
  /**
   * Transform the given absolute path into a relative path.
   *
   * @param absolute  The absolute path to transform.
   * @returns A path relative to the document currently processed.
   */
  getRelativeUrl(absolute) {
    if (this.urlPrefix.test(absolute)) {
      return absolute;
    } else {
      const key = `${this.location}:${absolute}`;
      let path3 = this.absoluteToRelativePathMap.get(key);
      if (path3) return path3;
      if (this.useHostedBaseUrlForAbsoluteLinks) {
        path3 = new URL(absolute, this.hostedBaseUrl).toString();
      } else {
        path3 = Path2.posix.relative(this.location, absolute) || ".";
      }
      this.absoluteToRelativePathMap.set(key, path3);
      return path3;
    }
  }
  /**
   * Triggered before the renderer starts rendering a project.
   *
   * @param event  An event object describing the current render operation.
   */
  onBeginRenderer(event) {
    this.project = event.project;
  }
  /**
   * Triggered before a document will be rendered.
   *
   * @param page  An event object describing the current render operation.
   */
  onBeginPage(page) {
    this.location = Path2.posix.dirname(page.url);
    this.page = page;
  }
};
_init10 = __decoratorStart(_a9);
_useHostedBaseUrlForAbsoluteLinks = new WeakMap();
__decorateElement(_init10, 4, "useHostedBaseUrlForAbsoluteLinks", _useHostedBaseUrlForAbsoluteLinks_dec, ContextAwareRendererComponent, _useHostedBaseUrlForAbsoluteLinks);
__decoratorMetadata(_init10, ContextAwareRendererComponent);

// src/lib/output/theme.ts
var Theme = class extends RendererComponent {
  /**
   * Optional hook to call pre-render jobs
   */
  async preRender(_event) {
  }
  /**
   * Optional hook to call post-render jobs
   */
  async postRender(_event) {
  }
};

// src/lib/output/themes/default/DefaultTheme.tsx
import {
  ReferenceReflection as ReferenceReflection6,
  ReflectionCategory as ReflectionCategory2,
  ReflectionGroup as ReflectionGroup2,
  ReflectionKind as ReflectionKind30
} from "#models";

// src/lib/output/themes/default/DefaultThemeRenderContext.ts
import "#node-utils";

// src/lib/output/themes/default/layouts/default.tsx
import { JSX as JSX3 } from "#utils";

// src/lib/output/themes/lib.tsx
import {
  DeclarationReflection as DeclarationReflection13,
  ProjectReflection as ProjectReflection2,
  ReferenceReflection as ReferenceReflection4,
  ReflectionKind as ReflectionKind21,
  SignatureReflection as SignatureReflection9
} from "#models";
import { DefaultMap as DefaultMap2, filterMap as filterMap4, JSX as JSX2 } from "#utils";
function stringify(data) {
  if (typeof data === "bigint") {
    return data.toString() + "n";
  }
  return JSON.stringify(data);
}
function getDisplayName(refl) {
  let version = "";
  if ((refl instanceof DeclarationReflection13 || refl instanceof ProjectReflection2) && refl.packageVersion) {
    version = ` - v${refl.packageVersion}`;
  }
  return `${refl.name}${version}`;
}
function toStyleClass(str) {
  return str.replace(/(\w)([A-Z])/g, (_m, m1, m2) => m1 + "-" + m2).toLowerCase();
}
function getKindClass(refl) {
  if (refl instanceof ReferenceReflection4) {
    return getKindClass(refl.getTargetReflectionDeep());
  }
  return ReflectionKind21.classString(refl.kind);
}
function wbr(str) {
  const parts = str.split(/(?<=[^A-Z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[_-])(?=[^_-])/);
  return parts.flatMap((p) => [p, /* @__PURE__ */ JSX2.createElement("wbr", null)]).slice(0, -1);
}
function join3(joiner, list, cb) {
  const result = [];
  for (const item of list) {
    if (result.length > 0) {
      result.push(joiner);
    }
    result.push(cb(item));
  }
  return /* @__PURE__ */ JSX2.createElement(JSX2.Fragment, null, result);
}
function classNames(names, extraCss) {
  const css = Object.keys(names).filter((key) => names[key]).concat(extraCss || "").join(" ").trim().replace(/\s+/g, " ");
  return css.length ? css : void 0;
}
function hasTypeParameters(reflection) {
  return (reflection instanceof DeclarationReflection13 || reflection instanceof SignatureReflection9) && reflection.typeParameters != null && reflection.typeParameters.length > 0;
}
function renderName(refl) {
  if (refl.flags.isOptional) {
    return /* @__PURE__ */ JSX2.createElement(JSX2.Fragment, null, wbr(refl.name), "?");
  }
  return wbr(refl.name);
}
var rootsCache = /* @__PURE__ */ new WeakMap();
function getHierarchyRoots(project) {
  const cached = rootsCache.get(project);
  if (cached) return cached;
  const allClasses = project.getReflectionsByKind(ReflectionKind21.ClassOrInterface);
  const roots = allClasses.filter((refl) => {
    if (!refl.implementedBy && !refl.extendedBy) {
      return false;
    }
    if (!refl.implementedTypes && !refl.extendedTypes) {
      return true;
    }
    const types = [...refl.implementedTypes || [], ...refl.extendedTypes || []];
    return types.every(
      (type2) => !type2.visit({
        reference(ref) {
          return ref.reflection !== void 0;
        }
      })
    );
  });
  const result = roots.sort((a, b) => a.name.localeCompare(b.name));
  rootsCache.set(project, result);
  return result;
}
function isNoneSection(section) {
  return section.title.toLocaleLowerCase() === "none";
}
function sortNoneSectionFirst(a, b) {
  if (isNoneSection(a)) {
    return -1;
  }
  if (isNoneSection(b)) {
    return 1;
  }
  return 0;
}
function getMemberSections(parent, childFilter = () => true) {
  if (parent.categories?.length) {
    return filterMap4(parent.categories, (cat) => {
      const children = cat.children.filter(childFilter);
      if (!children.length) return;
      return {
        title: cat.title,
        description: cat.description,
        children
      };
    }).sort(sortNoneSectionFirst);
  }
  if (parent.groups?.length) {
    return parent.groups.flatMap((group2) => {
      if (group2.categories?.length) {
        return filterMap4(group2.categories.slice().sort(sortNoneSectionFirst), (cat) => {
          const children2 = cat.children.filter(childFilter);
          if (!children2.length) return;
          return {
            title: isNoneSection(cat) ? group2.title : `${group2.title} - ${cat.title}`,
            description: cat.description,
            children: children2
          };
        });
      }
      const children = group2.children.filter(childFilter);
      if (!children.length) return [];
      return {
        title: group2.title,
        description: group2.description,
        children
      };
    }).sort(sortNoneSectionFirst);
  }
  if (parent.children?.length) {
    return [{
      title: "none",
      children: parent.children || []
    }];
  }
  return [];
}
var nameCollisionCache = /* @__PURE__ */ new WeakMap();
function getNameCollisionCount(project, name) {
  let collisions = nameCollisionCache.get(project);
  if (collisions === void 0) {
    collisions = new DefaultMap2(() => 0);
    for (const reflection of project.getReflectionsByKind(ReflectionKind21.SomeExport)) {
      collisions.set(reflection.name, collisions.get(reflection.name) + 1);
    }
    nameCollisionCache.set(project, collisions);
  }
  return collisions.get(name);
}
function getNamespacedPath(reflection) {
  const path3 = [reflection];
  let parent = reflection.parent;
  while (parent?.kindOf(ReflectionKind21.Namespace)) {
    path3.unshift(parent);
    parent = parent.parent;
  }
  return path3;
}
function getUniquePath(reflection) {
  if (reflection.kindOf(ReflectionKind21.SomeExport)) {
    if (getNameCollisionCount(reflection.project, reflection.name) >= 2) {
      return getNamespacedPath(reflection);
    }
  }
  return [reflection];
}

// src/lib/output/themes/default/layouts/default.tsx
import { extname } from "path";
function favicon(context) {
  const fav = context.options.getValue("favicon");
  if (!fav) return null;
  if (/^https?:\/\//i.test(fav)) {
    return /* @__PURE__ */ JSX3.createElement("link", { rel: "icon", href: fav });
  }
  switch (extname(fav)) {
    case ".ico":
      return /* @__PURE__ */ JSX3.createElement("link", { rel: "icon", href: context.relativeURL("assets/favicon.ico", true) });
    case ".png":
      return /* @__PURE__ */ JSX3.createElement("link", { rel: "icon", href: context.relativeURL("assets/favicon.png", true), type: "image/png" });
    case ".svg":
      return /* @__PURE__ */ JSX3.createElement("link", { rel: "icon", href: context.relativeURL("assets/favicon.svg", true), type: "image/svg+xml" });
    default:
      return null;
  }
}
function buildSiteMetadata(context) {
  try {
    const url = new URL(context.options.getValue("hostedBaseUrl"));
    if (url.pathname !== "/") {
      return null;
    }
    return /* @__PURE__ */ JSX3.createElement("script", { type: "application/ld+json" }, /* @__PURE__ */ JSX3.createElement(
      JSX3.Raw,
      {
        html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: context.model.project.name,
          url: url.toString()
        })
      }
    ));
  } catch {
    return null;
  }
}
var defaultLayout = (context, template, props) => /* @__PURE__ */ JSX3.createElement("html", { class: "default", lang: context.options.getValue("lang"), "data-base": context.relativeURL("./") }, /* @__PURE__ */ JSX3.createElement("head", null, /* @__PURE__ */ JSX3.createElement("meta", { charset: "utf-8" }), context.hook("head.begin", context), /* @__PURE__ */ JSX3.createElement("meta", { "http-equiv": "x-ua-compatible", content: "IE=edge" }), /* @__PURE__ */ JSX3.createElement("title", null, props.model.isProject() ? getDisplayName(props.model) : `${getDisplayName(props.model)} | ${getDisplayName(props.project)}`), favicon(context), props.url === "index.html" && buildSiteMetadata(context), /* @__PURE__ */ JSX3.createElement("meta", { name: "description", content: "Documentation for " + props.project.name }), /* @__PURE__ */ JSX3.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), /* @__PURE__ */ JSX3.createElement("link", { rel: "stylesheet", href: context.relativeURL("assets/style.css", true) }), /* @__PURE__ */ JSX3.createElement("link", { rel: "stylesheet", href: context.relativeURL("assets/highlight.css", true) }), context.options.getValue("customCss") && /* @__PURE__ */ JSX3.createElement("link", { rel: "stylesheet", href: context.relativeURL("assets/custom.css", true) }), /* @__PURE__ */ JSX3.createElement("script", { defer: true, src: context.relativeURL("assets/main.js", true) }), context.options.getValue("customJs") && /* @__PURE__ */ JSX3.createElement("script", { defer: true, src: context.relativeURL("assets/custom.js", true) }), /* @__PURE__ */ JSX3.createElement("script", { async: true, src: context.relativeURL("assets/icons.js", true), id: "tsd-icons-script" }), /* @__PURE__ */ JSX3.createElement("script", { async: true, src: context.relativeURL("assets/search.js", true), id: "tsd-search-script" }), /* @__PURE__ */ JSX3.createElement("script", { async: true, src: context.relativeURL("assets/navigation.js", true), id: "tsd-nav-script" }), !!getHierarchyRoots(props.project).length && /* @__PURE__ */ JSX3.createElement("script", { async: true, src: context.relativeURL("assets/hierarchy.js", true), id: "tsd-hierarchy-script" }), context.hook("head.end", context)), /* @__PURE__ */ JSX3.createElement("body", null, context.hook("body.begin", context), /* @__PURE__ */ JSX3.createElement("script", null, /* @__PURE__ */ JSX3.createElement(JSX3.Raw, { html: 'document.documentElement.dataset.theme = localStorage.getItem("tsd-theme") || "os";' }), /* @__PURE__ */ JSX3.createElement(JSX3.Raw, { html: 'document.body.style.display="none";' }), /* @__PURE__ */ JSX3.createElement(JSX3.Raw, { html: 'setTimeout(() => window.app?app.showPage():document.body.style.removeProperty("display"),500)' })), context.toolbar(props), /* @__PURE__ */ JSX3.createElement("div", { class: "container container-main" }, /* @__PURE__ */ JSX3.createElement("div", { class: "col-content" }, context.hook("content.begin", context), context.header(props), template(props), context.hook("content.end", context)), /* @__PURE__ */ JSX3.createElement("div", { class: "col-sidebar" }, /* @__PURE__ */ JSX3.createElement("div", { class: "page-menu" }, context.hook("pageSidebar.begin", context), context.pageSidebar(props), context.hook("pageSidebar.end", context)), /* @__PURE__ */ JSX3.createElement("div", { class: "site-menu" }, context.hook("sidebar.begin", context), context.sidebar(props), context.hook("sidebar.end", context)))), context.footer(), /* @__PURE__ */ JSX3.createElement("div", { class: "overlay" }), context.hook("body.end", context)));

// src/lib/output/themes/default/partials/index.tsx
import { i18n as i18n18, JSX as JSX5 } from "#utils";

// src/lib/output/themes/default/partials/anchor-icon.tsx
import { i18n as i18n17, JSX as JSX4 } from "#utils";
function anchorIcon(context, anchor) {
  if (!anchor) return /* @__PURE__ */ JSX4.createElement(JSX4.Fragment, null);
  return /* @__PURE__ */ JSX4.createElement("a", { href: `#${anchor}`, "aria-label": i18n17.theme_permalink(), class: "tsd-anchor-icon" }, context.icons.anchor());
}
function anchorTargetIfPresent(context, refl) {
  return context.router.hasUrl(refl) ? context.router.getAnchor(refl) : void 0;
}

// src/lib/output/themes/default/partials/index.tsx
function renderSection(context, item) {
  const { urlTo, reflectionIcon, getReflectionClasses: getReflectionClasses2, markdown, slugger } = context;
  const sectionAnchor = !isNoneSection(item) ? slugger.slug(item.title) : void 0;
  return /* @__PURE__ */ JSX5.createElement("section", { class: "tsd-index-section" }, !isNoneSection(item) && /* @__PURE__ */ JSX5.createElement("h3", { class: "tsd-index-heading tsd-anchor-link", id: sectionAnchor }, item.title, anchorIcon(context, sectionAnchor)), item.description && /* @__PURE__ */ JSX5.createElement("div", { class: "tsd-comment tsd-typography" }, /* @__PURE__ */ JSX5.createElement(JSX5.Raw, { html: markdown(item.description) })), /* @__PURE__ */ JSX5.createElement("div", { class: "tsd-index-list" }, item.children.map((item2) => /* @__PURE__ */ JSX5.createElement(JSX5.Fragment, null, /* @__PURE__ */ JSX5.createElement(
    "a",
    {
      href: urlTo(item2),
      class: classNames(
        { "tsd-index-link": true, deprecated: item2.isDeprecated() },
        getReflectionClasses2(item2)
      )
    },
    reflectionIcon(item2),
    /* @__PURE__ */ JSX5.createElement("span", null, renderName(item2))
  ), "\n"))));
}
function index(context, props) {
  const sections = getMemberSections(props);
  return /* @__PURE__ */ JSX5.createElement(JSX5.Fragment, null, /* @__PURE__ */ JSX5.createElement("section", { class: "tsd-panel-group tsd-index-group" }, /* @__PURE__ */ JSX5.createElement("section", { class: "tsd-panel tsd-index-panel" }, /* @__PURE__ */ JSX5.createElement("details", { class: "tsd-index-content tsd-accordion", open: true }, /* @__PURE__ */ JSX5.createElement("summary", { class: "tsd-accordion-summary tsd-index-summary" }, context.icons.chevronDown(), /* @__PURE__ */ JSX5.createElement("h5", { class: "tsd-index-heading uppercase" }, i18n18.theme_index())), /* @__PURE__ */ JSX5.createElement("div", { class: "tsd-accordion-details" }, sections.map((s) => renderSection(context, s)))))));
}

// src/lib/output/themes/default/partials/breadcrumb.tsx
import { JSX as JSX6 } from "#utils";
function breadcrumbs(context, props) {
  const path3 = [];
  let refl = props;
  while (refl.parent) {
    path3.push(refl);
    refl = refl.parent;
  }
  return /* @__PURE__ */ JSX6.createElement("ul", { class: "tsd-breadcrumb", "aria-label": "Breadcrumb" }, path3.reverse().map((r, index2) => /* @__PURE__ */ JSX6.createElement("li", null, /* @__PURE__ */ JSX6.createElement("a", { href: context.urlTo(r), "aria-current": index2 === path3.length - 1 ? "page" : void 0 }, r.name))));
}

// src/lib/output/themes/default/partials/comment.tsx
import { JSX as JSX7, translateTagName } from "#utils";
import { ReflectionKind as ReflectionKind22 } from "#models";
function renderDisplayParts({ markdown }, parts) {
  if (!parts?.length) return;
  return /* @__PURE__ */ JSX7.createElement("div", { class: "tsd-comment tsd-typography" }, /* @__PURE__ */ JSX7.createElement(JSX7.Raw, { html: markdown(parts) }));
}
function commentShortSummary(context, props) {
  let shortSummary;
  if (props.isDocument()) {
    if (typeof props.frontmatter["summary"] === "string") {
      shortSummary = [{ kind: "text", text: props.frontmatter["summary"] }];
    }
  } else {
    shortSummary = props.comment?.getShortSummary(context.options.getValue("useFirstParagraphOfCommentAsSummary"));
  }
  if (!shortSummary?.length && props.isDeclaration() && props.signatures?.length) {
    return commentShortSummary(context, props.signatures[0]);
  }
  if (!shortSummary?.some((part) => part.text)) return;
  return context.displayParts(shortSummary);
}
function commentSummary(context, props) {
  if (props.comment?.summary.some((part) => part.text)) {
    return context.displayParts(props.comment.summary);
  }
  const target = (props.isDeclaration() || props.isParameter()) && props.type?.type === "reference" ? props.type.reflection : void 0;
  if (target?.comment?.hasModifier("@expand") && target?.comment?.summary.some((part) => part.text)) {
    return context.displayParts(target.comment.summary);
  }
}
function commentTags(context, props) {
  if (!props.comment) return;
  const skipSave = props.comment.blockTags.map((tag) => tag.skipRendering);
  const skippedTags = context.options.getValue("notRenderedTags");
  const beforeTags = context.hook("comment.beforeTags", context, props.comment, props);
  const afterTags = context.hook("comment.afterTags", context, props.comment, props);
  const tags = props.kindOf(ReflectionKind22.SomeSignature) ? props.comment.blockTags.filter(
    (tag) => tag.tag !== "@returns" && !tag.skipRendering && !skippedTags.includes(tag.tag)
  ) : props.comment.blockTags.filter((tag) => !tag.skipRendering && !skippedTags.includes(tag.tag));
  skipSave.forEach((skip, i) => props.comment.blockTags[i].skipRendering = skip);
  const tagsContents = tags.map((item) => {
    const name = item.name ? `${translateTagName(item.tag)}: ${item.name}` : translateTagName(item.tag);
    const anchor = context.slugger.slug(name);
    return /* @__PURE__ */ JSX7.createElement(JSX7.Fragment, null, /* @__PURE__ */ JSX7.createElement("div", { class: `tsd-tag-${item.tag.substring(1)}` }, /* @__PURE__ */ JSX7.createElement("h4", { class: "tsd-anchor-link", id: anchor }, name, anchorIcon(context, anchor)), item.typeAnnotation && /* @__PURE__ */ JSX7.createElement("span", { class: "tsd-type-annotation" }, item.typeAnnotation), /* @__PURE__ */ JSX7.createElement(JSX7.Raw, { html: context.markdown(item.content) })));
  });
  return /* @__PURE__ */ JSX7.createElement(JSX7.Fragment, null, beforeTags, tagsContents.length > 0 && /* @__PURE__ */ JSX7.createElement("div", { class: "tsd-comment tsd-typography" }, tagsContents), afterTags);
}
function reflectionFlags(context, props) {
  const flagsNotRendered = context.options.getValue("notRenderedTags");
  const allFlags = props.flags.getFlagStrings();
  if (props.comment) {
    for (const tag of props.comment.modifierTags) {
      if (!flagsNotRendered.includes(tag)) {
        allFlags.push(translateTagName(tag));
      }
    }
  }
  return join3(" ", allFlags, (item) => /* @__PURE__ */ JSX7.createElement("code", { class: "tsd-tag" }, item));
}

// src/lib/output/themes/default/partials/footer.tsx
import { i18n as i18n19, JSX as JSX8 } from "#utils";
function footer(context) {
  const hideGenerator = context.options.getValue("hideGenerator");
  let generatorDisplay = /* @__PURE__ */ JSX8.createElement(JSX8.Fragment, null);
  if (!hideGenerator) {
    const message = i18n19.theme_generated_using_typedoc();
    const index2 = message.indexOf("TypeDoc");
    if (index2 == -1) {
      generatorDisplay = /* @__PURE__ */ JSX8.createElement("p", { class: "tsd-generator" }, message);
    } else {
      const pre = message.substring(0, index2);
      const post = message.substring(index2 + "TypeDoc".length);
      generatorDisplay = /* @__PURE__ */ JSX8.createElement("p", { class: "tsd-generator" }, pre, /* @__PURE__ */ JSX8.createElement("a", { href: "https://typedoc.org/", target: "_blank" }, "TypeDoc"), post);
    }
  }
  const customFooterHtml = context.options.getValue("customFooterHtml");
  let customFooterDisplay = /* @__PURE__ */ JSX8.createElement(JSX8.Fragment, null);
  if (customFooterHtml) {
    if (context.options.getValue("customFooterHtmlDisableWrapper")) {
      customFooterDisplay = /* @__PURE__ */ JSX8.createElement(JSX8.Raw, { html: customFooterHtml });
    } else {
      customFooterDisplay = /* @__PURE__ */ JSX8.createElement("p", null, /* @__PURE__ */ JSX8.createElement(JSX8.Raw, { html: customFooterHtml }));
    }
  }
  return /* @__PURE__ */ JSX8.createElement("footer", null, context.hook("footer.begin", context), generatorDisplay, customFooterDisplay, context.hook("footer.end", context));
}

// src/lib/output/themes/default/partials/header.tsx
import { JSX as JSX9 } from "#utils";
import { ReflectionKind as ReflectionKind23 } from "#models";
var header = (context, props) => {
  const opts = context.options.getValue("headings");
  const renderBreadcrumbs = props.url !== "index.html" && props.url !== "hierarchy.html";
  let renderTitle;
  let titleKindString = "";
  if (props.model.isProject()) {
    if (props.url === "index.html" && props.model.readme?.length) {
      renderTitle = opts.readme;
    } else {
      renderTitle = true;
    }
  } else if (props.model.isDocument()) {
    renderTitle = opts.document;
  } else {
    renderTitle = true;
    titleKindString = ReflectionKind23.singularString(props.model.kind) + " ";
  }
  return /* @__PURE__ */ JSX9.createElement("div", { class: "tsd-page-title" }, renderBreadcrumbs && context.breadcrumbs(props.model), renderTitle && /* @__PURE__ */ JSX9.createElement("h1", { class: classNames({ deprecated: props.model.isDeprecated() }) }, titleKindString, getDisplayName(props.model), hasTypeParameters(props.model) && /* @__PURE__ */ JSX9.createElement(JSX9.Fragment, null, "<", join3(", ", props.model.typeParameters, (item) => item.name), ">"), context.reflectionFlags(props.model)));
};

// src/lib/output/themes/default/partials/hierarchy.tsx
import { i18n as i18n20, JSX as JSX10 } from "#utils";
var isLinkedReferenceType = (type2) => type2.visit({
  reference: (ref) => ref.reflection !== void 0
}) ?? false;
function hasAnyLinkedReferenceType(h) {
  if (!h) return false;
  if (!h.isTarget && h.types.some(isLinkedReferenceType)) return true;
  return hasAnyLinkedReferenceType(h.next);
}
function hierarchy(context, typeHierarchy) {
  if (!typeHierarchy) return;
  const summaryLink = context.options.getValue("includeHierarchySummary") && hasAnyLinkedReferenceType(typeHierarchy) ? /* @__PURE__ */ JSX10.createElement(JSX10.Fragment, null, " ", "(", /* @__PURE__ */ JSX10.createElement("a", { href: context.relativeURL("hierarchy.html") + "#" + context.model.getFullName() }, i18n20.theme_hierarchy_view_summary()), ")") : /* @__PURE__ */ JSX10.createElement(JSX10.Fragment, null);
  return /* @__PURE__ */ JSX10.createElement("section", { class: "tsd-panel tsd-hierarchy", "data-refl": context.model.id }, /* @__PURE__ */ JSX10.createElement("h4", null, i18n20.theme_hierarchy(), summaryLink), hierarchyList(context, typeHierarchy));
}
function hierarchyList(context, props) {
  return /* @__PURE__ */ JSX10.createElement("ul", { class: "tsd-hierarchy" }, props.types.map((item, i, l) => /* @__PURE__ */ JSX10.createElement("li", { class: "tsd-hierarchy-item" }, props.isTarget ? /* @__PURE__ */ JSX10.createElement("span", { class: "tsd-hierarchy-target" }, item.toString()) : context.type(item), i === l.length - 1 && !!props.next && hierarchyList(context, props.next))));
}

// src/lib/output/themes/default/partials/member.tsx
import { JSX as JSX11 } from "#utils";
import "#models";
function member(context, props) {
  const anchor = context.getAnchor(props);
  context.page.pageHeadings.push({
    link: `#${anchor}`,
    text: getDisplayName(props),
    kind: props.kind,
    classes: context.getReflectionClasses(props),
    icon: context.theme.getReflectionIcon(props)
  });
  if (props.isDocument()) {
    return /* @__PURE__ */ JSX11.createElement("section", { class: classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props)) }, !!props.name && /* @__PURE__ */ JSX11.createElement("h3", { class: "tsd-anchor-link", id: anchor }, context.reflectionFlags(props), /* @__PURE__ */ JSX11.createElement("span", { class: classNames({ deprecated: props.isDeprecated() }) }, wbr(props.name)), anchorIcon(context, anchor)), /* @__PURE__ */ JSX11.createElement("div", { class: "tsd-comment tsd-typography" }, /* @__PURE__ */ JSX11.createElement(JSX11.Raw, { html: context.markdown(props.content) })));
  }
  return /* @__PURE__ */ JSX11.createElement("section", { class: classNames({ "tsd-panel": true, "tsd-member": true }, context.getReflectionClasses(props)) }, !!props.name && /* @__PURE__ */ JSX11.createElement("h3", { class: "tsd-anchor-link", id: anchor }, context.reflectionFlags(props), /* @__PURE__ */ JSX11.createElement("span", { class: classNames({ deprecated: props.isDeprecated() }) }, wbr(props.name)), anchorIcon(context, anchor)), props.signatures ? context.memberSignatures(props) : props.hasGetterOrSetter() ? context.memberGetterSetter(props) : context.memberDeclaration(props), props.groups?.map(
    (item) => item.children.map((item2) => !context.router.hasOwnDocument(item2) && context.member(item2))
  ));
}

// src/lib/output/themes/default/partials/member.declaration.tsx
import { JSX as JSX13 } from "#utils";

// src/lib/output/formatter.tsx
import {
  LiteralType as LiteralType3,
  ReferenceType as ReferenceType6,
  ReflectionKind as ReflectionKind24,
  TypeContext
} from "#models";
import { aggregate, assertNever as assertNever5, JSX as JSX12 } from "#utils";
import { ok as ok7 } from "assert";
var INDENT = "\xA0\xA0\xA0\xA0";
var emptyNode = textNode("");
function space() {
  return textNode(" ");
}
function textNode(content) {
  return { type: "text", content };
}
function simpleElement(element) {
  ok7(element.children.length === 1);
  ok7(typeof element.children[0] === "string");
  return {
    type: "element",
    content: element,
    length: element.children[0].length
  };
}
function line() {
  return { type: "line" };
}
function spaceOrLine() {
  return { type: "space_or_line" };
}
function indent(content) {
  return { type: "indent", content };
}
function group(id, content) {
  return { type: "group", id, content };
}
function nodes(...content) {
  return { type: "nodes", content };
}
function ifWrap(id, trueBranch, falseBranch = emptyNode) {
  return { type: "if_wrap", id, true: trueBranch, false: falseBranch };
}
function join4(joiner, list, cb) {
  const content = [];
  for (const item of list) {
    if (content.length > 0) {
      content.push(joiner);
    }
    content.push(cb(item));
  }
  return { type: "nodes", content };
}
function nodeWidth(node, wrapped) {
  switch (node.type) {
    case "text":
      return node.content.length;
    case "element":
      return node.length;
    case "line":
      return 0;
    case "space_or_line":
      return 1;
    case "indent":
    case "group":
    case "nodes":
      return aggregate(node.content, (n) => nodeWidth(n, wrapped));
    case "if_wrap":
      return wrapped.has(node.id) ? nodeWidth(node.true, wrapped) : nodeWidth(node.false, wrapped);
  }
}
var FormattedCodeGenerator = class {
  buffer = [];
  /** Indentation level, not number of chars */
  indent = 0;
  /** The number of characters on the current line */
  size;
  /** Maximum number of characters allowed per line */
  max;
  /** Groups which need to be wrapped */
  wrapped = /* @__PURE__ */ new Set();
  constructor(maxWidth = 80, startWidth = 0) {
    this.max = maxWidth;
    this.size = startWidth;
  }
  forceWrap(wrapped) {
    for (const id of wrapped) {
      this.wrapped.add(id);
    }
  }
  toElement() {
    return /* @__PURE__ */ JSX12.createElement(JSX12.Fragment, null, this.buffer);
  }
  node(node, wrap) {
    switch (node.type) {
      case "nodes": {
        for (const n of node.content) {
          this.node(n, wrap);
        }
        break;
      }
      case "group": {
        const width = aggregate(node.content, (n) => nodeWidth(n, this.wrapped));
        let wrap2;
        if (this.size + width > this.max || this.wrapped.has(node.id)) {
          this.wrapped.add(node.id);
          wrap2 = 1 /* Enable */;
        } else {
          wrap2 = 0 /* Detect */;
        }
        for (const n of node.content) {
          this.node(n, wrap2);
        }
        break;
      }
      case "if_wrap": {
        if (this.wrapped.has(node.id)) {
          this.node(node.true, 1 /* Enable */);
        } else {
          this.node(node.false, wrap);
        }
        break;
      }
      case "text": {
        this.text(node.content, node.content.length);
        break;
      }
      case "element": {
        this.text(node.content, node.length);
        break;
      }
      case "line": {
        if (wrap == 1 /* Enable */) {
          this.newLine();
        }
        break;
      }
      case "space_or_line": {
        if (wrap === 1 /* Enable */) {
          this.newLine();
        } else {
          this.text(" ", 1);
        }
        break;
      }
      case "indent": {
        if (wrap === 1 /* Enable */) {
          this.size += INDENT.length;
          this.indent += 1;
          this.buffer.push(INDENT);
          for (const n of node.content) {
            this.node(n, wrap);
          }
          this.indent -= 1;
        } else {
          for (const n of node.content) {
            this.node(n, wrap);
          }
        }
        break;
      }
      default:
        assertNever5(node);
    }
  }
  text(value, chars) {
    this.size += chars;
    this.buffer.push(value);
  }
  newLine() {
    this.size = INDENT.length + this.indent;
    const last = this.buffer[this.buffer.length - 1];
    if (typeof last === "string") {
      this.buffer[this.buffer.length - 1] = last.trimEnd();
    }
    this.buffer.push(/* @__PURE__ */ JSX12.createElement("br", null));
    this.buffer.push(INDENT.repeat(this.indent));
  }
};
var typeBuilder = {
  array(type2, builder) {
    return nodes(
      builder.type(type2.elementType, TypeContext.arrayElement),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "[]"))
    );
  },
  conditional(type2, builder) {
    const id = builder.newId();
    return group(id, [
      builder.type(type2.checkType, TypeContext.conditionalCheck),
      space(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "extends")),
      space(),
      builder.type(type2.extendsType, TypeContext.conditionalExtends),
      spaceOrLine(),
      indent([
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "?")),
        space(),
        builder.type(type2.trueType, TypeContext.conditionalTrue),
        spaceOrLine(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ":")),
        space(),
        builder.type(type2.falseType, TypeContext.conditionalFalse)
      ])
    ]);
  },
  indexedAccess(type2, builder) {
    let indexType = builder.type(type2.indexType, TypeContext.indexedIndex);
    if (type2.objectType instanceof ReferenceType6 && type2.objectType.reflection && type2.indexType instanceof LiteralType3 && typeof type2.indexType.value === "string") {
      const childReflection = type2.objectType.reflection.getChildByName([
        type2.indexType.value
      ]);
      if (childReflection) {
        const displayed = stringify(type2.indexType.value);
        if (builder.router.hasUrl(childReflection)) {
          indexType = {
            type: "element",
            content: /* @__PURE__ */ JSX12.createElement("a", { href: builder.urlTo(childReflection) }, /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, displayed)),
            length: displayed.length
          };
        } else {
          indexType = {
            type: "element",
            content: /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, displayed),
            length: displayed.length
          };
        }
      }
    }
    return nodes(
      builder.type(type2.objectType, TypeContext.indexedObject),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "[")),
      indexType,
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "]"))
    );
  },
  inferred(type2, builder) {
    const simple = nodes(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "infer")),
      space(),
      simpleElement(
        /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-kind-type-parameter" }, type2.name)
      )
    );
    if (type2.constraint) {
      const id = builder.newId();
      return group(id, [
        simple,
        space(),
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "extends")
        ),
        spaceOrLine(),
        indent([
          builder.type(
            type2.constraint,
            TypeContext.inferredConstraint
          )
        ])
      ]);
    }
    return simple;
  },
  intersection(type2, builder) {
    return join4(
      nodes(
        space(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "&")),
        space()
      ),
      type2.types,
      (type3) => builder.type(type3, TypeContext.intersectionElement)
    );
  },
  intrinsic(type2) {
    return simpleElement(
      /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, type2.name)
    );
  },
  literal(type2) {
    return simpleElement(
      /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, stringify(type2.value))
    );
  },
  mapped(type2, builder) {
    const parts = [];
    switch (type2.readonlyModifier) {
      case "+":
        parts.push(
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "readonly")
          ),
          space()
        );
        break;
      case "-":
        parts.push(
          simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "-")),
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "readonly")
          ),
          space()
        );
        break;
    }
    parts.push(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "[")),
      simpleElement(
        /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-kind-type-parameter" }, type2.parameter)
      ),
      space(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "in")),
      space(),
      builder.type(type2.parameterType, TypeContext.mappedParameter)
    );
    if (type2.nameType) {
      parts.push(
        space(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "as")),
        space(),
        builder.type(type2.nameType, TypeContext.mappedName)
      );
    }
    parts.push(simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "]")));
    switch (type2.optionalModifier) {
      case "+":
        parts.push(
          simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "?:"))
        );
        break;
      case "-":
        parts.push(
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "-?:")
          )
        );
        break;
      default:
        parts.push(
          simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ":"))
        );
    }
    parts.push(
      space(),
      builder.type(type2.templateType, TypeContext.mappedTemplate)
    );
    return group(builder.newId(), [
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "{")),
      spaceOrLine(),
      indent(parts),
      spaceOrLine(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "}"))
    ]);
  },
  namedTupleMember(type2, builder) {
    return nodes(
      textNode(type2.name),
      type2.isOptional ? simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "?:")) : simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ":")),
      space(),
      builder.type(type2.element, TypeContext.none)
    );
  },
  optional(type2, builder) {
    return nodes(
      builder.type(type2.elementType, TypeContext.optionalElement),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "?"))
    );
  },
  predicate(type2, builder) {
    const content = [];
    if (type2.asserts) {
      content.push(
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "asserts")
        ),
        space()
      );
    }
    content.push(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-kind-parameter" }, type2.name))
    );
    if (type2.targetType) {
      content.push(
        space(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "is")),
        space(),
        builder.type(type2.targetType, TypeContext.predicateTarget)
      );
    }
    return nodes(...content);
  },
  query(type2, builder) {
    return nodes(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "typeof")),
      space(),
      builder.type(type2.queryType, TypeContext.queryTypeTarget)
    );
  },
  reference(type2, builder) {
    const reflection = type2.reflection;
    let name;
    if (reflection) {
      if (reflection.kindOf(ReflectionKind24.TypeParameter)) {
        if (builder.router.hasUrl(reflection)) {
          name = simpleElement(
            /* @__PURE__ */ JSX12.createElement(
              "a",
              {
                class: "tsd-signature-type tsd-kind-type-parameter",
                href: builder.urlTo(reflection)
              },
              reflection.name
            )
          );
        } else {
          name = simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type tsd-kind-type-parameter" }, reflection.name)
          );
        }
      } else {
        name = join4(
          simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ".")),
          getUniquePath(reflection),
          (item) => {
            if (builder.router.hasUrl(item)) {
              return simpleElement(
                /* @__PURE__ */ JSX12.createElement(
                  "a",
                  {
                    href: builder.urlTo(item),
                    class: "tsd-signature-type " + getKindClass(item)
                  },
                  item.name
                )
              );
            }
            return simpleElement(
              /* @__PURE__ */ JSX12.createElement(
                "span",
                {
                  class: "tsd-signature-type " + getKindClass(item)
                },
                item.name
              )
            );
          }
        );
      }
    } else if (type2.externalUrl) {
      if (type2.externalUrl === "#") {
        name = simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type external" }, type2.name)
        );
      } else {
        name = simpleElement(
          /* @__PURE__ */ JSX12.createElement(
            "a",
            {
              href: type2.externalUrl,
              class: "tsd-signature-type external",
              target: "_blank"
            },
            type2.name
          )
        );
      }
    } else if (type2.refersToTypeParameter) {
      name = simpleElement(
        /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type tsd-kind-type-parameter" }, type2.name)
      );
    } else {
      name = simpleElement(
        /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, type2.name)
      );
    }
    if (type2.typeArguments?.length) {
      const id = builder.newId();
      return group(id, [
        name,
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "<")),
        line(),
        indent([
          join4(
            nodes(
              simpleElement(
                /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ",")
              ),
              spaceOrLine()
            ),
            type2.typeArguments,
            (item) => builder.type(
              item,
              TypeContext.referenceTypeArgument
            )
          ),
          ifWrap(
            id,
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ",")
            )
          )
        ]),
        line(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ">"))
      ]);
    }
    return name;
  },
  reflection(type2, builder, options) {
    return builder.reflection(type2.declaration, options);
  },
  rest(type2, builder) {
    return nodes(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "...")),
      builder.type(type2.elementType, TypeContext.restElement)
    );
  },
  templateLiteral(type2, builder) {
    const content = [];
    content.push(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "`"))
    );
    if (type2.head) {
      content.push(
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, type2.head)
        )
      );
    }
    for (const item of type2.tail) {
      content.push(
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "${")),
        builder.type(item[0], TypeContext.templateLiteralElement),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "}"))
      );
      if (item[1]) {
        content.push(
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, item[1])
          )
        );
      }
    }
    content.push(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "`"))
    );
    return nodes(...content);
  },
  tuple(type2, builder) {
    const id = builder.newId();
    return group(id, [
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "[")),
      line(),
      indent([
        join4(
          nodes(
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ",")
            ),
            spaceOrLine()
          ),
          type2.elements,
          (item) => builder.type(item, TypeContext.tupleElement)
        )
      ]),
      ifWrap(
        id,
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ","))
      ),
      line(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "]"))
    ]);
  },
  typeOperator(type2, builder) {
    return nodes(
      simpleElement(
        /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, type2.operator)
      ),
      space(),
      builder.type(type2.target, TypeContext.typeOperatorTarget)
    );
  },
  union(type2, builder) {
    const parentId = builder.id;
    const id = builder.newId();
    const pipe = simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "|"));
    const elements = type2.types.flatMap((type3, i) => [
      i == 0 ? ifWrap(id, nodes(pipe, space())) : space(),
      builder.type(type3, TypeContext.unionElement),
      spaceOrLine(),
      pipe
    ]);
    elements.pop();
    elements.pop();
    return group(id, [
      ifWrap(parentId, emptyNode, line()),
      ifWrap(parentId, nodes(...elements), indent(elements))
    ]);
  },
  unknown(type2) {
    return textNode(type2.name);
  }
};
var FormattedCodeBuilder = class {
  constructor(router, relativeReflection) {
    this.router = router;
    this.relativeReflection = relativeReflection;
  }
  router;
  relativeReflection;
  forceWrap = /* @__PURE__ */ new Set();
  id = 0;
  urlTo(refl) {
    return this.router.relativeUrl(this.relativeReflection, refl);
  }
  newId() {
    return ++this.id;
  }
  type(type2, where, options = { topLevelLinks: false }) {
    if (!type2) {
      return simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type" }, "any"));
    }
    if (type2.needsParenthesis(where)) {
      const id = this.newId();
      return group(id, [
        textNode("("),
        line(),
        indent([type2.visit(typeBuilder, this, options)]),
        line(),
        textNode(")")
      ]);
    }
    return type2.visit(typeBuilder, this, options);
  }
  reflection(reflection, options) {
    const members2 = [];
    const children = reflection.getProperties();
    for (const item of children) {
      this.member(members2, item, options);
    }
    if (reflection.indexSignatures) {
      for (const index2 of reflection.indexSignatures) {
        members2.push(
          nodes(
            ...index2.flags.isReadonly ? [
              simpleElement(
                /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "readonly")
              ),
              space()
            ] : [],
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "[")
            ),
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: getKindClass(index2) }, index2.parameters[0].name)
            ),
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ":")
            ),
            space(),
            this.type(index2.parameters[0].type, TypeContext.none),
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "]:")
            ),
            space(),
            this.type(index2.type, TypeContext.none)
          )
        );
      }
    }
    if (!members2.length && reflection.signatures?.length === 1) {
      return this.signature(reflection.signatures[0], {
        hideName: true,
        arrowStyle: true
      });
    }
    for (const item of reflection.signatures || []) {
      members2.push(this.signature(item, { hideName: true }));
    }
    if (members2.length) {
      const id = this.newId();
      if (options.topLevelLinks) {
        this.forceWrap.add(id);
      }
      return group(id, [
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "{")),
        spaceOrLine(),
        indent([
          join4(
            nodes(
              simpleElement(
                /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ";")
              ),
              spaceOrLine()
            ),
            members2,
            (node) => node
          )
        ]),
        ifWrap(
          id,
          simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ";"))
        ),
        spaceOrLine(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "}"))
      ]);
    }
    return simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "{}"));
  }
  typeAlias(item) {
    return nodes(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "type")),
      space(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: getKindClass(item) }, item.name)),
      this.typeParameters(item),
      space(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "=")),
      space(),
      this.reflection(item, { topLevelLinks: true })
    );
  }
  interface(item) {
    return nodes(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "interface")),
      space(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: getKindClass(item) }, item.name)),
      this.typeParameters(item),
      space(),
      this.reflection(item, { topLevelLinks: true })
    );
  }
  member(members2, item, options) {
    if (item.getSignature && item.setSignature) {
      members2.push(
        this.signature(item.getSignature, options),
        this.signature(item.setSignature, options)
      );
      return;
    }
    if (item.getSignature) {
      members2.push(this.signature(item.getSignature, options));
      return;
    }
    if (item.setSignature) {
      members2.push(this.signature(item.setSignature, options));
      return;
    }
    if (item.signatures) {
      members2.push(
        ...item.signatures.map((sig) => this.signature(sig, options))
      );
      return;
    }
    members2.push(
      nodes(
        this.propertyName(item, options),
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, item.flags.isOptional ? "?:" : ":")
        ),
        space(),
        this.type(item.type, TypeContext.none)
      )
    );
  }
  signature(sig, options) {
    let name = options.hideName ? emptyNode : this.propertyName(sig, options);
    switch (sig.kind) {
      case ReflectionKind24.ConstructorSignature: {
        let label = emptyNode;
        if (sig.flags.isAbstract) {
          label = nodes(
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "abstract")
            ),
            space()
          );
        }
        label = nodes(
          label,
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "new")
          ),
          space()
        );
        name = nodes(label, name);
        break;
      }
      case ReflectionKind24.GetSignature: {
        name = nodes(
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "get")
          ),
          space(),
          name
        );
        break;
      }
      case ReflectionKind24.SetSignature: {
        name = nodes(
          simpleElement(
            /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "set")
          ),
          space(),
          name
        );
        break;
      }
    }
    const id = this.newId();
    return group(id, [
      name,
      sig.parent.flags.isOptional ? simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "?")) : emptyNode,
      this.typeParameters(sig),
      ...this.parameters(sig, id),
      nodes(
        options.arrowStyle ? space() : emptyNode,
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, options.arrowStyle ? "=>" : ":")
        ),
        space(),
        this.type(sig.type, TypeContext.none)
      )
    ]);
  }
  typeParameters(sig) {
    if (!sig.typeParameters?.length) {
      return emptyNode;
    }
    const id = this.newId();
    return group(id, [
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "<")),
      line(),
      indent([
        join4(
          nodes(
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ",")
            ),
            spaceOrLine()
          ),
          sig.typeParameters,
          (item) => this.typeParameter(item)
        )
      ]),
      ifWrap(
        id,
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ","))
      ),
      line(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ">"))
    ]);
  }
  typeParameter(param) {
    let prefix = emptyNode;
    if (param.flags.isConst) {
      prefix = nodes(
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "const")),
        space()
      );
    }
    if (param.varianceModifier) {
      prefix = nodes(
        prefix,
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, param.varianceModifier)
        ),
        space()
      );
    }
    const content = [prefix];
    if (this.router.hasUrl(param)) {
      content.push(
        simpleElement(
          /* @__PURE__ */ JSX12.createElement(
            "a",
            {
              class: "tsd-signature-type tsd-kind-type-parameter",
              href: this.urlTo(param)
            },
            param.name
          )
        )
      );
    } else {
      content.push(
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-type tsd-kind-type-parameter" }, param.name)
        )
      );
    }
    if (param.type) {
      content.push(
        space(),
        simpleElement(
          /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-keyword" }, "extends")
        ),
        spaceOrLine(),
        indent([this.type(param.type, TypeContext.none)])
      );
    }
    if (param.default) {
      content.push(
        space(),
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "=")),
        space(),
        this.type(param.default, TypeContext.none)
      );
    }
    return group(this.newId(), content);
  }
  parameters(sig, id) {
    if (!sig.parameters?.length) {
      return [
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "()"))
      ];
    }
    return [
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "(")),
      line(),
      indent([
        join4(
          nodes(
            simpleElement(
              /* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ",")
            ),
            spaceOrLine()
          ),
          sig.parameters,
          (item) => this.parameter(item)
        )
      ]),
      ifWrap(
        id,
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ","))
      ),
      line(),
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ")"))
    ];
  }
  parameter(param) {
    const content = [];
    if (param.flags.isRest) {
      content.push(
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "..."))
      );
    }
    content.push(
      simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-kind-parameter" }, param.name))
    );
    if (param.flags.isOptional || param.defaultValue) {
      content.push(
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, "?:"))
      );
    } else {
      content.push(
        simpleElement(/* @__PURE__ */ JSX12.createElement("span", { class: "tsd-signature-symbol" }, ":"))
      );
    }
    const id = this.newId();
    content.push(ifWrap(id, emptyNode, space()));
    content.push(this.type(param.type, TypeContext.none));
    return nodes(...content);
  }
  propertyName(reflection, options) {
    const entityName = /^[A-Z_$][\w$]*$/i.test(reflection.name) ? reflection.name : JSON.stringify(reflection.name);
    if (options.topLevelLinks) {
      return simpleElement(
        /* @__PURE__ */ JSX12.createElement(
          "a",
          {
            class: getKindClass(reflection),
            href: this.urlTo(reflection)
          },
          entityName
        )
      );
    }
    return simpleElement(
      /* @__PURE__ */ JSX12.createElement("span", { class: getKindClass(reflection) }, entityName)
    );
  }
};

// src/lib/output/themes/default/partials/member.declaration.tsx
function shouldRenderDefaultValue(props) {
  const defaultValue = props.defaultValue;
  if (defaultValue === void 0) {
    return false;
  }
  if (props.type && props.type.type === "literal") {
    const reflectionTypeString = props.type.toString();
    if (reflectionTypeString === defaultValue) {
      return false;
    }
  }
  return true;
}
function memberDeclaration(context, props) {
  const builder = new FormattedCodeBuilder(context.router, context.model);
  const content = [];
  builder.member(content, props, { topLevelLinks: false });
  const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
  generator.node({ type: "nodes", content }, 0 /* Detect */);
  return /* @__PURE__ */ JSX13.createElement(JSX13.Fragment, null, /* @__PURE__ */ JSX13.createElement("div", { class: "tsd-signature" }, generator.toElement(), shouldRenderDefaultValue(props) && /* @__PURE__ */ JSX13.createElement("span", { class: "tsd-signature-symbol" }, " = ", props.defaultValue)), context.commentSummary(props), hasTypeParameters(props) && context.typeParameters(props.typeParameters), props.type && context.typeDeclaration(props, props.type), context.commentTags(props), context.memberSources(props));
}

// src/lib/output/themes/default/partials/member.getterSetter.tsx
import { JSX as JSX14 } from "#utils";
var memberGetterSetter = (context, props) => /* @__PURE__ */ JSX14.createElement(JSX14.Fragment, null, /* @__PURE__ */ JSX14.createElement(
  "ul",
  {
    class: classNames(
      {
        "tsd-signatures": true
      },
      context.getReflectionClasses(props)
    )
  },
  !!props.getSignature && /* @__PURE__ */ JSX14.createElement("li", null, /* @__PURE__ */ JSX14.createElement("div", { class: "tsd-signature", id: context.getAnchor(props.getSignature) }, context.memberSignatureTitle(props.getSignature)), /* @__PURE__ */ JSX14.createElement("div", { class: "tsd-description" }, context.memberSignatureBody(props.getSignature))),
  !!props.setSignature && /* @__PURE__ */ JSX14.createElement("li", null, /* @__PURE__ */ JSX14.createElement("div", { class: "tsd-signature", id: context.getAnchor(props.setSignature) }, context.memberSignatureTitle(props.setSignature)), /* @__PURE__ */ JSX14.createElement("div", { class: "tsd-description" }, context.memberSignatureBody(props.setSignature)))
));

// src/lib/output/themes/default/partials/member.signature.body.tsx
import { i18n as i18n21, JSX as JSX15 } from "#utils";
function memberSignatureBody(context, props, { hideSources = false } = {}) {
  const returnsTag = props.comment?.getTag("@returns");
  return /* @__PURE__ */ JSX15.createElement(JSX15.Fragment, null, context.reflectionFlags(props), context.commentSummary(props), hasTypeParameters(props) && context.typeParameters(props.typeParameters), props.parameters && props.parameters.length > 0 && /* @__PURE__ */ JSX15.createElement("div", { class: "tsd-parameters" }, /* @__PURE__ */ JSX15.createElement("h4", { class: "tsd-parameters-title" }, i18n21.kind_plural_parameter()), /* @__PURE__ */ JSX15.createElement("ul", { class: "tsd-parameter-list" }, props.parameters.map((item) => /* @__PURE__ */ JSX15.createElement("li", null, /* @__PURE__ */ JSX15.createElement("span", null, context.reflectionFlags(item), item.flags.isRest && /* @__PURE__ */ JSX15.createElement("span", { class: "tsd-signature-symbol" }, "..."), /* @__PURE__ */ JSX15.createElement("span", { class: "tsd-kind-parameter" }, item.name), ": ", context.type(item.type), item.defaultValue != null && /* @__PURE__ */ JSX15.createElement("span", { class: "tsd-signature-symbol" }, " = ", item.defaultValue)), context.commentSummary(item), context.commentTags(item), context.typeDetailsIfUseful(item, item.type))))), props.type && /* @__PURE__ */ JSX15.createElement(JSX15.Fragment, null, /* @__PURE__ */ JSX15.createElement("h4", { class: "tsd-returns-title" }, i18n21.theme_returns(), " ", context.type(props.type)), returnsTag && /* @__PURE__ */ JSX15.createElement(JSX15.Raw, { html: context.markdown(returnsTag.content) }), context.typeDetailsIfUseful(props, props.type)), context.commentTags(props), !hideSources && context.memberSources(props));
}

// src/lib/output/themes/default/partials/member.signature.title.tsx
import "#models";
function memberSignatureTitle(context, props, options = {}) {
  const builder = new FormattedCodeBuilder(context.router, context.model);
  const tree = builder.signature(props, options);
  const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
  generator.node(tree, 0 /* Detect */);
  return generator.toElement();
}

// src/lib/output/themes/default/partials/member.signatures.tsx
import { JSX as JSX16 } from "#utils";
var memberSignatures = (context, props) => /* @__PURE__ */ JSX16.createElement(JSX16.Fragment, null, /* @__PURE__ */ JSX16.createElement("ul", { class: classNames({ "tsd-signatures": true }, context.getReflectionClasses(props)) }, props.signatures?.map((item) => /* @__PURE__ */ JSX16.createElement("li", { class: context.getReflectionClasses(item) }, /* @__PURE__ */ JSX16.createElement("div", { class: "tsd-signature tsd-anchor-link", id: context.getAnchor(item) }, context.memberSignatureTitle(item), anchorIcon(context, context.getAnchor(item))), /* @__PURE__ */ JSX16.createElement("div", { class: "tsd-description" }, context.memberSignatureBody(item))))));

// src/lib/output/themes/default/partials/member.sources.tsx
import { i18n as i18n22, JSX as JSX17 } from "#utils";
function sourceLink(context, item) {
  if (!item.url) {
    return /* @__PURE__ */ JSX17.createElement("li", null, i18n22.theme_defined_in(), " ", item.fileName, ":", item.line);
  }
  if (context.options.getValue("sourceLinkExternal")) {
    return /* @__PURE__ */ JSX17.createElement("li", null, i18n22.theme_defined_in(), " ", /* @__PURE__ */ JSX17.createElement("a", { href: item.url, class: "external", target: "_blank" }, item.fileName, ":", item.line));
  }
  return /* @__PURE__ */ JSX17.createElement("li", null, i18n22.theme_defined_in(), " ", /* @__PURE__ */ JSX17.createElement("a", { href: item.url }, item.fileName, ":", item.line));
}
var memberSources = (context, props) => {
  const sources = [];
  if (props.implementationOf) {
    sources.push(
      /* @__PURE__ */ JSX17.createElement("p", null, i18n22.theme_implementation_of(), " ", context.typeAndParent(props.implementationOf))
    );
  }
  if (props.inheritedFrom) {
    sources.push(
      /* @__PURE__ */ JSX17.createElement("p", null, i18n22.theme_inherited_from(), " ", context.typeAndParent(props.inheritedFrom))
    );
  }
  if (props.overwrites) {
    sources.push(
      /* @__PURE__ */ JSX17.createElement("p", null, i18n22.theme_overrides(), " ", context.typeAndParent(props.overwrites))
    );
  }
  if (props.sources?.length) {
    sources.push(/* @__PURE__ */ JSX17.createElement("ul", null, props.sources.map((item) => sourceLink(context, item))));
  }
  if (sources.length === 0) {
    return /* @__PURE__ */ JSX17.createElement(JSX17.Fragment, null);
  }
  return /* @__PURE__ */ JSX17.createElement("aside", { class: "tsd-sources" }, sources);
};

// src/lib/output/themes/default/partials/members.tsx
import { JSX as JSX18 } from "#utils";
import "#models";
function members(context, props) {
  const sections = getMemberSections(props, (child) => !context.router.hasOwnDocument(child));
  return /* @__PURE__ */ JSX18.createElement(JSX18.Fragment, null, sections.map((section) => {
    if (isNoneSection(section)) {
      return /* @__PURE__ */ JSX18.createElement("section", { class: "tsd-panel-group tsd-member-group" }, section.children.map((item) => context.member(item)));
    }
    context.page.startNewSection(section.title);
    const sectionAnchor = context.slugger.slug(section.title);
    return /* @__PURE__ */ JSX18.createElement("details", { class: "tsd-panel-group tsd-member-group tsd-accordion", open: true }, /* @__PURE__ */ JSX18.createElement("summary", { class: "tsd-accordion-summary", "data-key": "section-" + section.title }, context.icons.chevronDown(), /* @__PURE__ */ JSX18.createElement("h2", { class: "tsd-anchor-link", id: sectionAnchor }, section.title, anchorIcon(context, sectionAnchor))), /* @__PURE__ */ JSX18.createElement("section", null, section.children.map((item) => context.member(item))));
  }));
}

// src/lib/output/themes/default/partials/navigation.tsx
import { ReflectionFlag as ReflectionFlag8, ReflectionFlags } from "#models";
import { i18n as i18n23, JSX as JSX19, translateTagName as translateTagName2 } from "#utils";
function sidebar(context, props) {
  return /* @__PURE__ */ JSX19.createElement(JSX19.Fragment, null, context.sidebarLinks(), context.navigation(props));
}
function buildFilterItem(context, name, displayName, defaultValue) {
  return /* @__PURE__ */ JSX19.createElement("li", { class: "tsd-filter-item" }, /* @__PURE__ */ JSX19.createElement("label", { class: "tsd-filter-input" }, /* @__PURE__ */ JSX19.createElement("input", { type: "checkbox", id: `tsd-filter-${name}`, name, checked: defaultValue }), context.icons.checkbox(), /* @__PURE__ */ JSX19.createElement("span", null, displayName)));
}
function sidebarLinks(context) {
  const links = Object.entries(context.options.getValue("sidebarLinks"));
  const navLinks = Object.entries(context.options.getValue("navigationLinks"));
  if (!links.length && !navLinks.length) return null;
  return /* @__PURE__ */ JSX19.createElement("nav", { id: "tsd-sidebar-links", class: "tsd-navigation" }, links.map(([label, url]) => /* @__PURE__ */ JSX19.createElement("a", { href: url }, label)), navLinks.map(([label, url]) => /* @__PURE__ */ JSX19.createElement("a", { href: url, class: "tsd-nav-link" }, label)));
}
var flagOptionNameToReflectionFlag = {
  protected: ReflectionFlag8.Protected,
  private: ReflectionFlag8.Private,
  external: ReflectionFlag8.External,
  inherited: ReflectionFlag8.Inherited
};
function settings(context) {
  const defaultFilters = context.options.getValue("visibilityFilters");
  const visibilityOptions = [];
  for (const key of Object.keys(defaultFilters)) {
    if (key.startsWith("@")) {
      const filterName = key.substring(1).replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      visibilityOptions.push(
        buildFilterItem(
          context,
          filterName,
          translateTagName2(key),
          defaultFilters[key]
        )
      );
    } else if (key === "protected" && !context.options.getValue("excludeProtected") || key === "private" && !context.options.getValue("excludePrivate") || key === "external" && !context.options.getValue("excludeExternals") || key === "inherited") {
      visibilityOptions.push(
        buildFilterItem(
          context,
          key,
          ReflectionFlags.flagString(flagOptionNameToReflectionFlag[key]),
          defaultFilters[key]
        )
      );
    }
  }
  return /* @__PURE__ */ JSX19.createElement("div", { class: "tsd-navigation settings" }, /* @__PURE__ */ JSX19.createElement("details", { class: "tsd-accordion", open: false }, /* @__PURE__ */ JSX19.createElement("summary", { class: "tsd-accordion-summary" }, context.icons.chevronDown(), /* @__PURE__ */ JSX19.createElement("h3", null, i18n23.theme_settings())), /* @__PURE__ */ JSX19.createElement("div", { class: "tsd-accordion-details" }, !!visibilityOptions.length && /* @__PURE__ */ JSX19.createElement("div", { class: "tsd-filter-visibility" }, /* @__PURE__ */ JSX19.createElement("span", { class: "settings-label" }, i18n23.theme_member_visibility()), /* @__PURE__ */ JSX19.createElement("ul", { id: "tsd-filter-options" }, ...visibilityOptions)), /* @__PURE__ */ JSX19.createElement("div", { class: "tsd-theme-toggle" }, /* @__PURE__ */ JSX19.createElement("label", { class: "settings-label", for: "tsd-theme" }, i18n23.theme_theme()), /* @__PURE__ */ JSX19.createElement("select", { id: "tsd-theme" }, /* @__PURE__ */ JSX19.createElement("option", { value: "os" }, i18n23.theme_os()), /* @__PURE__ */ JSX19.createElement("option", { value: "light" }, i18n23.theme_light()), /* @__PURE__ */ JSX19.createElement("option", { value: "dark" }, i18n23.theme_dark()))))));
}
var navigation = function navigation2(context, props) {
  return /* @__PURE__ */ JSX19.createElement("nav", { class: "tsd-navigation" }, /* @__PURE__ */ JSX19.createElement(
    "a",
    {
      href: context.urlTo(props.project),
      class: classNames({
        current: props.url === context.router.getFullUrl(props.model) && props.model.isProject()
      })
    },
    getDisplayName(props.project)
  ), /* @__PURE__ */ JSX19.createElement("ul", { class: "tsd-small-nested-navigation", id: "tsd-nav-container" }, /* @__PURE__ */ JSX19.createElement("li", null, i18n23.theme_loading())));
};
function pageSidebar(context, props) {
  return /* @__PURE__ */ JSX19.createElement(JSX19.Fragment, null, context.settings(), context.pageNavigation(props));
}
function buildSectionNavigation(context, headings) {
  const levels = [[]];
  function finalizeLevel(finishedHandlingHeadings) {
    const level = levels.pop();
    if (levels[levels.length - 1].length === 0 && finishedHandlingHeadings) {
      levels[levels.length - 1] = level;
      return;
    }
    const built = /* @__PURE__ */ JSX19.createElement("ul", null, level.map((l) => /* @__PURE__ */ JSX19.createElement("li", null, l)));
    levels[levels.length - 1].push(built);
  }
  function getInferredHeadingLevel(heading) {
    if (heading.level) {
      return heading.level + 2;
    }
    if (heading.kind) {
      return 2;
    }
    return 1;
  }
  for (const heading of headings) {
    const inferredLevel = getInferredHeadingLevel(heading);
    while (inferredLevel < levels.length) {
      finalizeLevel(false);
    }
    while (inferredLevel > levels.length) {
      levels.push([]);
    }
    levels[levels.length - 1].push(
      /* @__PURE__ */ JSX19.createElement("a", { href: heading.link, class: classNames({}, heading.classes) }, heading.icon && context.icons[heading.icon](), /* @__PURE__ */ JSX19.createElement("span", null, wbr(heading.text)))
    );
  }
  while (levels.length > 1) {
    finalizeLevel(true);
  }
  levels.unshift([]);
  finalizeLevel(true);
  return levels[0];
}
function pageNavigation(context, props) {
  if (!props.pageSections.some((sect) => sect.headings.length)) {
    return /* @__PURE__ */ JSX19.createElement(JSX19.Fragment, null);
  }
  const sections = [];
  for (const section of props.pageSections) {
    if (section.title) {
      sections.push(
        /* @__PURE__ */ JSX19.createElement("details", { open: true, class: "tsd-accordion tsd-page-navigation-section" }, /* @__PURE__ */ JSX19.createElement("summary", { class: "tsd-accordion-summary", "data-key": `section-${section.title}` }, context.icons.chevronDown(), section.title), /* @__PURE__ */ JSX19.createElement("div", null, buildSectionNavigation(context, section.headings)))
      );
    } else {
      sections.push(buildSectionNavigation(context, section.headings));
    }
  }
  return /* @__PURE__ */ JSX19.createElement("details", { open: true, class: "tsd-accordion tsd-page-navigation" }, /* @__PURE__ */ JSX19.createElement("summary", { class: "tsd-accordion-summary" }, context.icons.chevronDown(), /* @__PURE__ */ JSX19.createElement("h3", null, i18n23.theme_on_this_page())), /* @__PURE__ */ JSX19.createElement("div", { class: "tsd-accordion-details" }, sections));
}

// src/lib/output/themes/default/partials/reflectionPreview.tsx
import { DeclarationReflection as DeclarationReflection14, ReflectionKind as ReflectionKind25 } from "#models";
import { JSX as JSX20 } from "#utils";
function reflectionPreview(context, props) {
  if (!(props instanceof DeclarationReflection14)) return;
  if (props.kindOf(ReflectionKind25.Interface) && props.children) {
    const builder = new FormattedCodeBuilder(context.router, context.model);
    const tree = builder.interface(props);
    const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
    generator.forceWrap(builder.forceWrap);
    generator.node(tree, 1 /* Enable */);
    return /* @__PURE__ */ JSX20.createElement("div", { class: "tsd-signature" }, generator.toElement());
  }
  if (props.kindOf(ReflectionKind25.TypeAlias) && props.children) {
    const builder = new FormattedCodeBuilder(context.router, context.model);
    const tree = builder.typeAlias(props);
    const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
    generator.forceWrap(builder.forceWrap);
    generator.node(tree, 1 /* Enable */);
    return /* @__PURE__ */ JSX20.createElement("div", { class: "tsd-signature" }, generator.toElement());
  }
}

// src/lib/output/themes/default/partials/toolbar.tsx
import { i18n as i18n24, JSX as JSX21 } from "#utils";
var toolbar = (context, props) => /* @__PURE__ */ JSX21.createElement("header", { class: "tsd-page-toolbar" }, /* @__PURE__ */ JSX21.createElement("div", { class: "tsd-toolbar-contents container" }, /* @__PURE__ */ JSX21.createElement("a", { href: context.options.getValue("titleLink") || context.relativeURL("index.html"), class: "title" }, getDisplayName(props.project)), /* @__PURE__ */ JSX21.createElement("div", { id: "tsd-toolbar-links" }, Object.entries(context.options.getValue("navigationLinks")).map(([label, url]) => /* @__PURE__ */ JSX21.createElement("a", { href: url }, label))), /* @__PURE__ */ JSX21.createElement("button", { id: "tsd-search-trigger", class: "tsd-widget", "aria-label": i18n24.theme_search() }, context.icons.search()), /* @__PURE__ */ JSX21.createElement("dialog", { id: "tsd-search", "aria-label": i18n24.theme_search() }, /* @__PURE__ */ JSX21.createElement(
  "input",
  {
    role: "combobox",
    id: "tsd-search-input",
    "aria-controls": "tsd-search-results",
    "aria-autocomplete": "list",
    "aria-expanded": "true",
    spellcheck: false,
    autocapitalize: "off",
    autocomplete: "off",
    placeholder: i18n24.theme_search_placeholder(),
    maxLength: 100
  }
), /* @__PURE__ */ JSX21.createElement("ul", { role: "listbox", id: "tsd-search-results" }), /* @__PURE__ */ JSX21.createElement("div", { id: "tsd-search-status", "aria-live": "polite", "aria-atomic": "true" }, /* @__PURE__ */ JSX21.createElement("div", null, i18n24.theme_preparing_search_index()))), /* @__PURE__ */ JSX21.createElement(
  "a",
  {
    href: "#",
    class: "tsd-widget menu",
    id: "tsd-toolbar-menu-trigger",
    "data-toggle": "menu",
    "aria-label": i18n24.theme_menu()
  },
  context.icons.menu()
)));

// src/lib/output/themes/default/partials/type.tsx
import { TypeContext as TypeContext2 } from "#models";
function type(context, type2, options = { topLevelLinks: false }) {
  const builder = new FormattedCodeBuilder(context.router, context.model);
  const tree = builder.type(type2, TypeContext2.none, options);
  const generator = new FormattedCodeGenerator(context.options.getValue("typePrintWidth"));
  generator.node(tree, 0 /* Detect */);
  return generator.toElement();
}

// src/lib/output/themes/default/partials/typeAndParent.tsx
import { ArrayType as ArrayType2, ReferenceType as ReferenceType7, SignatureReflection as SignatureReflection10 } from "#models";
import { JSX as JSX22 } from "#utils";
var typeAndParent = (context, props) => {
  if (props instanceof ArrayType2) {
    return /* @__PURE__ */ JSX22.createElement(JSX22.Fragment, null, context.typeAndParent(props.elementType), "[]");
  }
  if (props instanceof ReferenceType7) {
    if (props.reflection) {
      const refl = props.reflection instanceof SignatureReflection10 ? props.reflection.parent : props.reflection;
      const parent = refl.parent;
      return /* @__PURE__ */ JSX22.createElement(JSX22.Fragment, null, /* @__PURE__ */ JSX22.createElement("a", { href: context.urlTo(parent) }, parent.name), ".", /* @__PURE__ */ JSX22.createElement("a", { href: context.urlTo(refl) }, refl.name));
    } else if (props.externalUrl) {
      if (props.externalUrl === "#") {
        return /* @__PURE__ */ JSX22.createElement(JSX22.Fragment, null, props.toString());
      } else {
        return /* @__PURE__ */ JSX22.createElement("a", { href: props.externalUrl, class: "external", target: "_blank" }, props.name);
      }
    }
  }
  return /* @__PURE__ */ JSX22.createElement(JSX22.Fragment, null, props.toString());
};

// src/lib/output/themes/default/partials/typeParameters.tsx
import { i18n as i18n25, JSX as JSX23 } from "#utils";
function typeParameters(context, typeParameters2) {
  return /* @__PURE__ */ JSX23.createElement(JSX23.Fragment, null, /* @__PURE__ */ JSX23.createElement("section", { class: "tsd-panel" }, /* @__PURE__ */ JSX23.createElement("h4", null, i18n25.kind_plural_type_parameter()), /* @__PURE__ */ JSX23.createElement("ul", { class: "tsd-type-parameter-list" }, typeParameters2.map((item) => /* @__PURE__ */ JSX23.createElement("li", null, /* @__PURE__ */ JSX23.createElement("span", { id: anchorTargetIfPresent(context, item) }, item.flags.isConst && /* @__PURE__ */ JSX23.createElement(JSX23.Fragment, null, /* @__PURE__ */ JSX23.createElement("span", { class: "tsd-signature-keyword" }, "const"), " "), item.varianceModifier && /* @__PURE__ */ JSX23.createElement(JSX23.Fragment, null, /* @__PURE__ */ JSX23.createElement("span", { class: "tsd-signature-keyword" }, item.varianceModifier), " "), /* @__PURE__ */ JSX23.createElement("span", { class: "tsd-kind-type-parameter" }, item.name), !!item.type && /* @__PURE__ */ JSX23.createElement(JSX23.Fragment, null, " ", /* @__PURE__ */ JSX23.createElement("span", { class: "tsd-signature-keyword" }, "extends"), " ", context.type(item.type)), !!item.default && /* @__PURE__ */ JSX23.createElement(JSX23.Fragment, null, " = ", context.type(item.default))), context.commentSummary(item), context.commentTags(item))))));
}

// src/lib/output/themes/default/templates/index.tsx
import { JSX as JSX24 } from "#utils";
var indexTemplate = ({ markdown }, props) => /* @__PURE__ */ JSX24.createElement("div", { class: "tsd-panel tsd-typography" }, /* @__PURE__ */ JSX24.createElement(JSX24.Raw, { html: markdown(props.model.readme || []) }));

// src/lib/output/themes/default/templates/document.tsx
import { JSX as JSX25 } from "#utils";
var documentTemplate = ({ markdown }, props) => /* @__PURE__ */ JSX25.createElement("div", { class: "tsd-panel tsd-typography" }, /* @__PURE__ */ JSX25.createElement(JSX25.Raw, { html: markdown(props.model.content) }));

// src/lib/output/themes/default/templates/hierarchy.tsx
import { i18n as i18n26, JSX as JSX26 } from "#utils";
function fullHierarchy(context, root, seen) {
  if (seen.has(root)) {
    return /* @__PURE__ */ JSX26.createElement("li", { "data-refl": root.id }, /* @__PURE__ */ JSX26.createElement("a", { href: context.urlTo(root) }, context.reflectionIcon(root), root.name));
  }
  seen.add(root);
  const children = [];
  for (const child of [...root.implementedBy || [], ...root.extendedBy || []]) {
    if (child.reflection) {
      children.push(fullHierarchy(context, child.reflection, seen));
    }
  }
  return /* @__PURE__ */ JSX26.createElement("li", { "data-refl": root.id, id: root.getFullName() }, /* @__PURE__ */ JSX26.createElement("a", { href: context.urlTo(root) }, context.reflectionIcon(root), root.name), !!children.length && /* @__PURE__ */ JSX26.createElement("ul", null, children));
}
function hierarchyTemplate(context, props) {
  const seen = /* @__PURE__ */ new Set();
  return /* @__PURE__ */ JSX26.createElement(JSX26.Fragment, null, /* @__PURE__ */ JSX26.createElement("h2", null, i18n26.theme_hierarchy_summary()), getHierarchyRoots(props.project).map((root) => /* @__PURE__ */ JSX26.createElement("ul", { class: "tsd-full-hierarchy" }, fullHierarchy(context, root, seen))));
}

// src/lib/output/themes/default/templates/reflection.tsx
import { DeclarationReflection as DeclarationReflection15, ReflectionKind as ReflectionKind26 } from "#models";
import { i18n as i18n27, JSX as JSX27 } from "#utils";
function reflectionTemplate(context, props) {
  if (props.model.kindOf(ReflectionKind26.TypeAlias | ReflectionKind26.Variable) && props.model instanceof DeclarationReflection15 && props.model.type) {
    return context.memberDeclaration(props.model);
  }
  if (props.model.kindOf(ReflectionKind26.ExportContainer) && (props.model.isDeclaration() || props.model.isProject())) {
    return context.moduleReflection(props.model);
  }
  return /* @__PURE__ */ JSX27.createElement(JSX27.Fragment, null, props.model.hasComment(context.options.getValue("notRenderedTags")) && /* @__PURE__ */ JSX27.createElement("section", { class: "tsd-panel tsd-comment" }, context.commentSummary(props.model), context.commentTags(props.model)), context.reflectionPreview(props.model), hasTypeParameters(props.model) && /* @__PURE__ */ JSX27.createElement(JSX27.Fragment, null, context.typeParameters(props.model.typeParameters)), props.model instanceof DeclarationReflection15 && /* @__PURE__ */ JSX27.createElement(JSX27.Fragment, null, context.hierarchy(props.model.typeHierarchy), !!props.model.implementedTypes && /* @__PURE__ */ JSX27.createElement("section", { class: "tsd-panel" }, /* @__PURE__ */ JSX27.createElement("h4", null, i18n27.theme_implements()), /* @__PURE__ */ JSX27.createElement("ul", { class: "tsd-hierarchy" }, props.model.implementedTypes.map((item) => /* @__PURE__ */ JSX27.createElement("li", null, context.type(item))))), !!props.model.implementedBy && /* @__PURE__ */ JSX27.createElement("section", { class: "tsd-panel" }, /* @__PURE__ */ JSX27.createElement("h4", null, i18n27.theme_implemented_by()), /* @__PURE__ */ JSX27.createElement("ul", { class: "tsd-hierarchy" }, props.model.implementedBy.map((item) => /* @__PURE__ */ JSX27.createElement("li", null, context.type(item))))), !!props.model.signatures?.length && /* @__PURE__ */ JSX27.createElement("section", { class: "tsd-panel" }, context.memberSignatures(props.model)), !!props.model.indexSignatures?.length && /* @__PURE__ */ JSX27.createElement("section", { class: "tsd-panel" }, /* @__PURE__ */ JSX27.createElement("h4", { class: "tsd-before-signature" }, i18n27.theme_indexable()), /* @__PURE__ */ JSX27.createElement("ul", { class: "tsd-signatures" }, props.model.indexSignatures.map((index2) => renderIndexSignature(context, index2)))), !props.model.signatures && context.memberSources(props.model)), !!props.model.childrenIncludingDocuments?.length && context.index(props.model), context.members(props.model));
}
function renderIndexSignature(context, index2) {
  return /* @__PURE__ */ JSX27.createElement("li", { class: classNames({ "tsd-index-signature": true }, context.getReflectionClasses(index2)) }, /* @__PURE__ */ JSX27.createElement("div", { class: "tsd-signature" }, index2.flags.isReadonly && /* @__PURE__ */ JSX27.createElement(JSX27.Fragment, null, /* @__PURE__ */ JSX27.createElement("span", { class: "tsd-signature-keyword" }, "readonly"), " "), /* @__PURE__ */ JSX27.createElement("span", { class: "tsd-signature-symbol" }, "["), index2.parameters.map((item) => /* @__PURE__ */ JSX27.createElement(JSX27.Fragment, null, /* @__PURE__ */ JSX27.createElement("span", { class: getKindClass(item) }, item.name), ": ", context.type(item.type))), /* @__PURE__ */ JSX27.createElement("span", { class: "tsd-signature-symbol" }, "]:"), " ", context.type(index2.type)), context.commentSummary(index2), context.commentTags(index2), context.typeDetailsIfUseful(index2, index2.type));
}

// src/lib/output/themes/default/partials/typeDetails.tsx
import {
  Comment as Comment10,
  Reflection as Reflection4,
  ReflectionKind as ReflectionKind27
} from "#models";
import { assert as assert10, i18n as i18n28, JSX as JSX28 } from "#utils";
function renderingTypeDetailsIsUseful(container, type2, notRenderedTags) {
  const isUsefulVisitor = {
    array(type3) {
      return renderingTypeDetailsIsUseful(container, type3.elementType, notRenderedTags);
    },
    intersection(type3) {
      return type3.types.some((t) => renderingTypeDetailsIsUseful(container, t, notRenderedTags));
    },
    union(type3) {
      return !!type3.elementSummaries || type3.types.some((t) => renderingTypeDetailsIsUseful(container, t, notRenderedTags));
    },
    reflection(type3) {
      return renderingChildIsUseful(type3.declaration, notRenderedTags);
    },
    reference(type3) {
      return shouldExpandReference(container, type3);
    }
  };
  return type2.visit(isUsefulVisitor) ?? false;
}
function typeDeclaration(context, reflectionOwningType, type2) {
  assert10(
    reflectionOwningType instanceof Reflection4,
    "typeDeclaration(reflectionOwningType, type) called incorrectly"
  );
  if (renderingTypeDetailsIsUseful(reflectionOwningType, type2, context.options.getValue("notRenderedTags"))) {
    return /* @__PURE__ */ JSX28.createElement("div", { class: "tsd-type-declaration" }, /* @__PURE__ */ JSX28.createElement("h4", null, i18n28.theme_type_declaration()), context.typeDetails(reflectionOwningType, type2, true));
  }
  return null;
}
var expandTypeCache = /* @__PURE__ */ new WeakMap();
function getExpandTypeInfo(refl) {
  const cache = expandTypeCache.get(refl);
  if (cache) return cache;
  const expandType = /* @__PURE__ */ new Set();
  const preventExpand = /* @__PURE__ */ new Set();
  if (!refl.isProject()) {
    const info = getExpandTypeInfo(refl.parent);
    for (const item of info.expandType) {
      expandType.add(item);
    }
    for (const item of info.preventExpand) {
      preventExpand.add(item);
    }
  }
  for (const tag of refl.comment?.blockTags || []) {
    if (tag.tag === "@expandType") {
      const name = Comment10.combineDisplayParts(tag.content);
      expandType.add(name);
      preventExpand.delete(name);
    } else if (tag.tag === "@preventExpand") {
      const name = Comment10.combineDisplayParts(tag.content);
      preventExpand.add(name);
      expandType.delete(name);
    }
  }
  expandTypeCache.set(refl, { expandType, preventExpand });
  return { expandType, preventExpand };
}
var expanded = /* @__PURE__ */ new Set();
function shouldExpandReference(container, reference) {
  const target = reference.reflection;
  if (!target) {
    return reference.highlightedProperties !== void 0;
  }
  if (!target.kindOf(ReflectionKind27.TypeAlias | ReflectionKind27.Interface)) return false;
  if (expanded.has(target)) return false;
  const info = getExpandTypeInfo(container);
  if (reference.highlightedProperties || target.comment?.hasModifier("@expand") || info.expandType.has(target.name)) {
    return !info.preventExpand.has(target.name);
  }
  return false;
}
function typeDetails(context, reflectionOwningType, type2, renderAnchors) {
  return typeDetailsImpl(context, reflectionOwningType, type2, renderAnchors);
}
function typeDetailsImpl(context, reflectionOwningType, type2, renderAnchors, highlighted) {
  const result = type2.visit({
    array(type3) {
      return context.typeDetails(reflectionOwningType, type3.elementType, renderAnchors);
    },
    intersection(type3) {
      return type3.types.map((t) => context.typeDetails(reflectionOwningType, t, renderAnchors));
    },
    union(type3) {
      const result2 = [];
      for (let i = 0; i < type3.types.length; ++i) {
        result2.push(
          /* @__PURE__ */ JSX28.createElement("li", null, context.type(type3.types[i]), context.displayParts(type3.elementSummaries?.[i]), context.typeDetailsIfUseful(reflectionOwningType, type3.types[i]))
        );
      }
      return /* @__PURE__ */ JSX28.createElement("ul", null, result2);
    },
    reflection(type3) {
      const declaration = type3.declaration;
      if (highlighted) {
        return highlightedDeclarationDetails(context, declaration, renderAnchors, highlighted);
      }
      return declarationDetails(context, declaration, renderAnchors);
    },
    reference(reference) {
      if (shouldExpandReference(reflectionOwningType, reference)) {
        const target = reference.reflection;
        if (!target?.isDeclaration()) {
          return highlightedPropertyDetails(context, reference.highlightedProperties);
        }
        expanded.add(target);
        const details = target.type ? context.typeDetails(reflectionOwningType, target.type, renderAnchors) : declarationDetails(context, target, renderAnchors);
        expanded.delete(target);
        return details;
      }
    }
    // tuple??
  });
  if (!result && highlighted) {
    return highlightedPropertyDetails(context, highlighted);
  }
  return result;
}
function typeDetailsIfUseful(context, reflectionOwningType, type2) {
  assert10(
    reflectionOwningType instanceof Reflection4,
    "typeDetailsIfUseful(reflectionOwningType, type) called incorrectly"
  );
  if (type2 && renderingTypeDetailsIsUseful(reflectionOwningType, type2, context.options.getValue("notRenderedTags"))) {
    return context.typeDetails(reflectionOwningType, type2, false);
  }
}
function highlightedPropertyDetails(context, highlighted) {
  if (!highlighted?.size) return;
  return /* @__PURE__ */ JSX28.createElement("ul", { class: "tsd-parameters" }, Array.from(highlighted.entries(), ([name, parts]) => {
    return /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter" }, /* @__PURE__ */ JSX28.createElement("h5", null, /* @__PURE__ */ JSX28.createElement("span", null, name)), context.displayParts(parts));
  }));
}
function highlightedDeclarationDetails(context, declaration, renderAnchors, highlightedProperties) {
  return /* @__PURE__ */ JSX28.createElement("ul", { class: "tsd-parameters" }, declaration.getProperties()?.map(
    (child) => highlightedProperties?.has(child.name) && renderChild(context, child, renderAnchors, highlightedProperties.get(child.name))
  ));
}
function declarationDetails(context, declaration, renderAnchors) {
  return /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, context.commentSummary(declaration), /* @__PURE__ */ JSX28.createElement("ul", { class: "tsd-parameters" }, declaration.signatures && /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter-signature" }, /* @__PURE__ */ JSX28.createElement("ul", { class: classNames({ "tsd-signatures": true }, context.getReflectionClasses(declaration)) }, declaration.signatures.map((item) => {
    const anchor = context.router.hasUrl(item) ? context.getAnchor(item) : void 0;
    return /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-signature", id: anchor }, context.memberSignatureTitle(item, {
      hideName: true
    })), /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-description" }, context.memberSignatureBody(item, {
      hideSources: true
    })));
  }))), declaration.indexSignatures?.map((index2) => renderIndexSignature2(context, index2)), declaration.getProperties()?.map((child) => renderChild(context, child, renderAnchors))));
}
function renderChild(context, child, renderAnchors, highlight2) {
  if (child.signatures) {
    return /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter" }, /* @__PURE__ */ JSX28.createElement("h5", { id: anchorTargetIfPresent(context, child) }, child.flags.isRest && /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "..."), /* @__PURE__ */ JSX28.createElement("span", { class: getKindClass(child) }, child.name), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, child.flags.isOptional && "?", ":"), " function"), context.memberSignatures(child));
  }
  function highlightOrComment(refl) {
    if (highlight2) {
      return context.displayParts(highlight2);
    }
    return /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, context.commentSummary(refl), context.commentTags(refl));
  }
  if (child.type) {
    const notRenderedTags = context.options.getValue("notRenderedTags");
    return /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter" }, /* @__PURE__ */ JSX28.createElement("h5", { id: anchorTargetIfPresent(context, child) }, context.reflectionFlags(child), child.flags.isRest && /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "..."), /* @__PURE__ */ JSX28.createElement("span", { class: getKindClass(child) }, child.name), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, child.flags.isOptional && "?", ": "), context.type(child.type)), highlightOrComment(child), child.getProperties().some((prop) => renderingChildIsUseful(prop, notRenderedTags)) && /* @__PURE__ */ JSX28.createElement("ul", { class: "tsd-parameters" }, child.getProperties().map((c) => renderChild(context, c, renderAnchors))));
  }
  return /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, child.getSignature && /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter" }, /* @__PURE__ */ JSX28.createElement("h5", { id: anchorTargetIfPresent(context, child) }, context.reflectionFlags(child.getSignature), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-keyword" }, "get"), " ", /* @__PURE__ */ JSX28.createElement("span", { class: getKindClass(child) }, child.name), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "():"), " ", context.type(child.getSignature.type)), highlightOrComment(child.getSignature)), child.setSignature && /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter" }, /* @__PURE__ */ JSX28.createElement("h5", { id: !child.getSignature ? anchorTargetIfPresent(context, child) : void 0 }, context.reflectionFlags(child.setSignature), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-keyword" }, "set"), " ", /* @__PURE__ */ JSX28.createElement("span", { class: getKindClass(child) }, child.name), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "("), child.setSignature.parameters?.map((item) => /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, item.name, /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, ":"), " ", context.type(item.type))), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "):"), " ", context.type(child.setSignature.type)), highlightOrComment(child.setSignature)));
}
function renderIndexSignature2(context, index2) {
  return /* @__PURE__ */ JSX28.createElement("li", { class: "tsd-parameter-index-signature" }, /* @__PURE__ */ JSX28.createElement("h5", null, index2.flags.isReadonly && /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-keyword" }, "readonly"), " "), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "["), index2.parameters.map((item) => /* @__PURE__ */ JSX28.createElement(JSX28.Fragment, null, /* @__PURE__ */ JSX28.createElement("span", { class: getKindClass(item) }, item.name), ": ", context.type(item.type))), /* @__PURE__ */ JSX28.createElement("span", { class: "tsd-signature-symbol" }, "]:"), " ", context.type(index2.type)), context.commentSummary(index2), context.commentTags(index2), context.typeDeclaration(index2, index2.type));
}
function renderingChildIsUseful(refl, notRenderedTags) {
  if (refl.kindOf(ReflectionKind27.TypeLiteral) && refl.parent?.kindOf(ReflectionKind27.SomeExport) && refl.parent.type?.type === "reflection") {
    return true;
  }
  if (renderingThisChildIsUseful(refl, notRenderedTags)) {
    return true;
  }
  return refl.getProperties().some((prop) => renderingThisChildIsUseful(prop, notRenderedTags));
}
function renderingThisChildIsUseful(refl, notRenderedTags) {
  if (refl.hasComment(notRenderedTags)) return true;
  const declaration = refl.type?.type === "reflection" ? refl.type.declaration : refl;
  if (declaration.hasComment(notRenderedTags)) return true;
  return declaration.getAllSignatures().some((sig) => {
    return sig.hasComment(notRenderedTags) || sig.parameters?.some((p) => p.hasComment(notRenderedTags));
  });
}

// src/lib/output/themes/default/partials/moduleReflection.tsx
import {
  ReferenceReflection as ReferenceReflection5,
  ReflectionKind as ReflectionKind28
} from "#models";
import { JSX as JSX29 } from "#utils";
function moduleReflection(context, mod) {
  const sections = getMemberSections(mod);
  return /* @__PURE__ */ JSX29.createElement(JSX29.Fragment, null, mod.hasComment(context.options.getValue("notRenderedTags")) && /* @__PURE__ */ JSX29.createElement("section", { class: "tsd-panel tsd-comment" }, context.commentSummary(mod), context.commentTags(mod)), mod.isDeclaration() && mod.kind === ReflectionKind28.Module && !!mod.readme?.length && /* @__PURE__ */ JSX29.createElement("section", { class: "tsd-panel tsd-typography" }, /* @__PURE__ */ JSX29.createElement(JSX29.Raw, { html: context.markdown(mod.readme) })), sections.map((section) => {
    if (!isNoneSection(section)) {
      context.page.startNewSection(section.title);
    }
    const content = /* @__PURE__ */ JSX29.createElement(JSX29.Fragment, null, section.description && /* @__PURE__ */ JSX29.createElement("div", { class: "tsd-comment tsd-typography" }, /* @__PURE__ */ JSX29.createElement(JSX29.Raw, { html: context.markdown(section.description) })), /* @__PURE__ */ JSX29.createElement("dl", { class: "tsd-member-summaries" }, section.children.map((item) => context.moduleMemberSummary(item))));
    if (isNoneSection(section)) {
      return /* @__PURE__ */ JSX29.createElement("section", { class: "tsd-panel-group tsd-member-group" }, content);
    }
    const sectionAnchor = context.slugger.slug(section.title);
    return /* @__PURE__ */ JSX29.createElement("details", { class: "tsd-panel-group tsd-member-group tsd-accordion", open: true }, /* @__PURE__ */ JSX29.createElement("summary", { class: "tsd-accordion-summary", "data-key": "section-" + section.title }, context.icons.chevronDown(), /* @__PURE__ */ JSX29.createElement("h2", { class: "tsd-anchor-link", id: sectionAnchor }, section.title, anchorIcon(context, sectionAnchor))), content);
  }));
}
function moduleMemberSummary(context, member2) {
  const id = member2.isReference() ? context.getAnchor(member2) : context.slugger.slug(member2.name);
  context.page.pageHeadings.push({
    link: `#${id}`,
    text: getDisplayName(member2),
    kind: member2 instanceof ReferenceReflection5 ? member2.getTargetReflectionDeep().kind : member2.kind,
    classes: context.getReflectionClasses(member2),
    icon: context.theme.getReflectionIcon(member2)
  });
  let name;
  if (member2 instanceof ReferenceReflection5) {
    const target = member2.getTargetReflectionDeep();
    name = /* @__PURE__ */ JSX29.createElement("span", { class: "tsd-member-summary-name" }, context.reflectionIcon(target), /* @__PURE__ */ JSX29.createElement("span", { class: classNames({ deprecated: member2.isDeprecated() }) }, member2.name), /* @__PURE__ */ JSX29.createElement("span", null, "\xA0", "\u2192", "\xA0"), uniqueName(context, target), anchorIcon(context, id));
  } else {
    name = /* @__PURE__ */ JSX29.createElement("span", { class: "tsd-member-summary-name" }, context.reflectionIcon(member2), /* @__PURE__ */ JSX29.createElement("a", { class: classNames({ deprecated: member2.isDeprecated() }), href: context.urlTo(member2) }, member2.name), anchorIcon(context, id));
  }
  return /* @__PURE__ */ JSX29.createElement(JSX29.Fragment, null, /* @__PURE__ */ JSX29.createElement("dt", { class: classNames({ "tsd-member-summary": true }, context.getReflectionClasses(member2)), id }, name), /* @__PURE__ */ JSX29.createElement("dd", { class: classNames({ "tsd-member-summary": true }, context.getReflectionClasses(member2)) }, context.commentShortSummary(member2)));
}
function uniqueName(context, reflection) {
  const name = join3(
    ".",
    getUniquePath(reflection),
    (item) => /* @__PURE__ */ JSX29.createElement("a", { href: context.urlTo(item), class: classNames({ deprecated: item.isDeprecated() }) }, item.name)
  );
  return /* @__PURE__ */ JSX29.createElement(JSX29.Fragment, null, name);
}

// src/lib/output/themes/default/DefaultThemeRenderContext.ts
function bind(fn, first) {
  return (...r) => fn(first, ...r);
}
var DefaultThemeRenderContext = class {
  constructor(router, theme, page, options) {
    this.router = router;
    this.theme = theme;
    this.page = page;
    this._refIcons = buildRefIcons(theme.icons, this);
    this.options = options;
    this.model = page.model;
  }
  router;
  theme;
  page;
  _refIcons;
  options;
  model;
  /**
   * Icons available for use within the page.
   * When getting an icon for a reflection, {@link reflectionIcon} should be used so
   * that themes which define multiple icon variants can correctly specify which icon
   * they want to be used.
   *
   * Note: This creates a reference to icons declared by {@link DefaultTheme.icons},
   * to customize icons, that object must be modified instead.
   */
  get icons() {
    return this._refIcons;
  }
  /**
   * Do not override this method, override {@link DefaultTheme.getReflectionIcon} instead.
   */
  reflectionIcon = (reflection) => {
    return this.icons[this.theme.getReflectionIcon(reflection)]();
  };
  get slugger() {
    return this.router.getSlugger(this.page.model);
  }
  hook = (...params) => {
    return this.theme.owner.hooks.emit(...params);
  };
  /** Avoid this in favor of urlTo if possible */
  relativeURL = (url, cacheBust = false) => {
    const result = this.router.baseRelativeUrl(this.page.model, url);
    if (cacheBust && this.theme.owner.cacheBust) {
      return result + `?cache=${this.theme.owner.renderStartTime}`;
    }
    return result;
  };
  getAnchor = (reflection) => {
    return this.router.getAnchor(reflection);
  };
  urlTo = (reflection) => {
    return this.router.relativeUrl(this.page.model, reflection);
  };
  markdown = (md) => {
    return this.theme.markedPlugin.parseMarkdown(md || "", this.page, this);
  };
  /** Renders user comment markdown wrapped in a tsd-comment div */
  displayParts = bind(renderDisplayParts, this);
  getNavigation = () => this.theme.getNavigation(this.page.project);
  getReflectionClasses = (refl) => this.theme.getReflectionClasses(refl);
  documentTemplate = bind(documentTemplate, this);
  reflectionTemplate = bind(reflectionTemplate, this);
  indexTemplate = bind(indexTemplate, this);
  hierarchyTemplate = bind(hierarchyTemplate, this);
  defaultLayout = bind(defaultLayout, this);
  /**
   * Rendered just after the description for a reflection.
   * This can be used to render a shortened type display of a reflection that the
   * rest of the page expands on.
   *
   * Note: Will not be called for variables/type aliases, as they are summarized
   * by their type declaration, which is already rendered by {@link DefaultThemeRenderContext.memberDeclaration}
   */
  reflectionPreview = bind(reflectionPreview, this);
  /**
   * Used to render additional details about a type. This is used to implement
   * the `@expand` tag, comments on union members, comments on object type members...
   */
  typeDetails = bind(typeDetails, this);
  /**
   * Should call the {@link typeDetails} helper if rendering additional details
   * about the type will provide the user with more information about the type.
   */
  typeDetailsIfUseful = bind(typeDetailsIfUseful, this);
  /**
   * Wrapper around {@link typeDetails} which checks if it is useful
   * and includes a "Type Declaration" header.
   */
  typeDeclaration = bind(typeDeclaration, this);
  breadcrumbs = bind(breadcrumbs, this);
  commentShortSummary = bind(commentShortSummary, this);
  commentSummary = bind(commentSummary, this);
  commentTags = bind(commentTags, this);
  reflectionFlags = bind(reflectionFlags, this);
  footer = bind(footer, this);
  header = bind(header, this);
  hierarchy = bind(hierarchy, this);
  index = bind(index, this);
  member = bind(member, this);
  moduleReflection = bind(moduleReflection, this);
  moduleMemberSummary = bind(moduleMemberSummary, this);
  memberDeclaration = bind(memberDeclaration, this);
  memberGetterSetter = bind(memberGetterSetter, this);
  memberSignatureBody = bind(memberSignatureBody, this);
  memberSignatureTitle = bind(memberSignatureTitle, this);
  memberSignatures = bind(memberSignatures, this);
  memberSources = bind(memberSources, this);
  members = bind(members, this);
  sidebar = bind(sidebar, this);
  pageSidebar = bind(pageSidebar, this);
  sidebarLinks = bind(sidebarLinks, this);
  settings = bind(settings, this);
  navigation = bind(navigation, this);
  pageNavigation = bind(pageNavigation, this);
  toolbar = bind(toolbar, this);
  type = bind(type, this);
  typeAndParent = bind(typeAndParent, this);
  typeParameters = bind(typeParameters, this);
};

// src/lib/output/themes/default/DefaultTheme.tsx
import { filterMap as filterMap5, JSX as JSX30 } from "#utils";

// src/lib/output/router.ts
import { ProjectReflection as ProjectReflection3, Reflection as Reflection5, ReflectionKind as ReflectionKind29 } from "#models";
import { createNormalizedUrl } from "#node-utils";
import { Option as Option10 } from "#node-utils";

// src/lib/output/themes/default/Slugger.ts
import { getSimilarValues } from "#utils";
var Slugger = class {
  constructor(options) {
    this.options = options;
  }
  options;
  seen = /* @__PURE__ */ new Map();
  serialize(value) {
    const slug = value.trim().replace(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
      ""
    ).replace(/\s/g, "-").replace(/--+/, "-");
    return slug || "_";
  }
  slug(value) {
    const originalSlug = this.serialize(value);
    const lowerOriginalSlug = originalSlug.toLocaleLowerCase();
    let count = 0;
    let slug = lowerOriginalSlug;
    if (this.seen.has(lowerOriginalSlug)) {
      count = this.seen.get(lowerOriginalSlug);
      do {
        count++;
        slug = `${lowerOriginalSlug}-${count}`;
      } while (this.seen.has(slug));
    }
    this.seen.set(lowerOriginalSlug, count);
    if (!this.options.lowercase) {
      return count === 0 ? originalSlug : `${originalSlug}-${count}`;
    }
    return slug;
  }
  hasAnchor(anchor) {
    return this.seen.has(anchor);
  }
  getSimilarAnchors(anchor) {
    return getSimilarValues(this.seen.keys(), anchor);
  }
};

// src/lib/output/router.ts
var PageKind = {
  Index: "index",
  Reflection: "reflection",
  Document: "document",
  Hierarchy: "hierarchy"
};
function getFullName(target) {
  if (target instanceof ProjectReflection3) {
    return target.name;
  }
  const parts = [target.name];
  let current = target;
  while (!(current instanceof ProjectReflection3)) {
    parts.unshift(current.name);
    current = current.parent;
  }
  return parts.join(".");
}
var _includeHierarchySummary_dec, _sluggerConfiguration_dec, _init11, _sluggerConfiguration, _includeHierarchySummary;
_sluggerConfiguration_dec = [Option10("sluggerConfiguration")], _includeHierarchySummary_dec = [Option10("includeHierarchySummary")];
var BaseRouter = class {
  constructor(application) {
    this.application = application;
    __publicField(this, "extension", ".html");
    // Note: This will always contain lowercased names to avoid issues with
    // case-insensitive file systems.
    __publicField(this, "usedFileNames", /* @__PURE__ */ new Set());
    __publicField(this, "sluggers", /* @__PURE__ */ new Map());
    __publicField(this, "fullUrls", /* @__PURE__ */ new Map());
    __publicField(this, "anchors", /* @__PURE__ */ new Map());
    __privateAdd(this, _sluggerConfiguration, __runInitializers(_init11, 8, this)), __runInitializers(_init11, 11, this);
    __privateAdd(this, _includeHierarchySummary, __runInitializers(_init11, 12, this)), __runInitializers(_init11, 15, this);
  }
  application;
  buildPages(project) {
    this.usedFileNames = /* @__PURE__ */ new Set();
    this.sluggers = /* @__PURE__ */ new Map([
      [project, new Slugger(this.sluggerConfiguration)]
    ]);
    const pages = [];
    if (project.readme?.length) {
      pages.push({
        url: this.getFileName("index"),
        kind: PageKind.Index,
        model: project
      });
      pages.push({
        url: this.getFileName("modules"),
        kind: PageKind.Reflection,
        model: project
      });
    } else {
      pages.push({
        url: this.getFileName("index"),
        kind: PageKind.Reflection,
        model: project
      });
    }
    this.fullUrls.set(project, pages[pages.length - 1].url);
    if (this.includeHierarchySummary && getHierarchyRoots(project)) {
      pages.push({
        url: this.getFileName("hierarchy"),
        kind: PageKind.Hierarchy,
        model: project
      });
    }
    for (const child of project.childrenIncludingDocuments || []) {
      this.buildChildPages(child, pages);
    }
    return pages;
  }
  hasUrl(target) {
    return this.fullUrls.has(target);
  }
  getLinkTargets() {
    return Array.from(this.fullUrls.keys());
  }
  getAnchor(target) {
    if (!this.anchors.has(target)) {
      this.application.logger.verbose(
        `${getFullName(target)} does not have an anchor but one was requested, this is a bug in the theme`
      );
    }
    return this.anchors.get(target);
  }
  hasOwnDocument(target) {
    return this.anchors.get(target) === void 0 && this.hasUrl(target);
  }
  relativeUrl(from, to) {
    let slashes = 0;
    while (!this.hasOwnDocument(from)) {
      from = from.parent;
    }
    let toPage = to;
    while (!this.hasOwnDocument(toPage)) {
      toPage = toPage.parent;
    }
    if (from === toPage && !(to instanceof ProjectReflection3)) {
      return to === toPage ? "" : `#${this.getAnchor(to)}`;
    }
    const fromUrl = this.getFullUrl(from);
    const toUrl = this.getFullUrl(to);
    let equal = true;
    let start = 0;
    for (let i = 0; i < fromUrl.length; ++i) {
      equal = equal && fromUrl[i] === toUrl[i];
      if (fromUrl[i] === "/") {
        if (equal) {
          start = i + 1;
        } else {
          ++slashes;
        }
      }
    }
    if (equal) {
      return toUrl.substring(start);
    }
    return "../".repeat(slashes) + toUrl.substring(start);
  }
  baseRelativeUrl(from, target) {
    let slashes = 0;
    const full = this.getFullUrl(from);
    for (let i = 0; i < full.length; ++i) {
      if (full[i] === "/") ++slashes;
    }
    if (target == "./" && slashes !== 0) {
      return "../".repeat(slashes);
    }
    return "../".repeat(slashes) + target;
  }
  getFullUrl(target) {
    const url = this.fullUrls.get(target);
    if (!url) {
      throw new Error(
        `Tried to get a URL of a router target ${getFullName(target)} which did not receive a URL`
      );
    }
    return url;
  }
  getSlugger(target) {
    if (this.sluggers.has(target)) {
      return this.sluggers.get(target);
    }
    return this.getSlugger(target.parent);
  }
  /**
   * Should the page kind to use if a reflection should have its own rendered
   * page in the output. Note that once `undefined` is returned, children of
   * that reflection will not have their own document.
   */
  getPageKind(target) {
    if (!(target instanceof Reflection5)) {
      return void 0;
    }
    const pageReflectionKinds = ReflectionKind29.Class | ReflectionKind29.Interface | ReflectionKind29.Enum | ReflectionKind29.Module | ReflectionKind29.Namespace | ReflectionKind29.TypeAlias | ReflectionKind29.Function | ReflectionKind29.Variable;
    const documentReflectionKinds = ReflectionKind29.Document;
    if (target.kindOf(pageReflectionKinds)) {
      return PageKind.Reflection;
    }
    if (target.kindOf(documentReflectionKinds)) {
      return PageKind.Document;
    }
  }
  buildChildPages(target, outPages) {
    const kind = this.getPageKind(target);
    if (kind) {
      const idealName = this.getIdealBaseName(target);
      const actualName = this.getFileName(idealName);
      this.fullUrls.set(target, actualName);
      this.sluggers.set(
        target,
        new Slugger(this.sluggerConfiguration)
      );
      outPages.push({
        kind,
        model: target,
        url: actualName
      });
      if (target instanceof Reflection5) {
        target.traverse((child) => {
          this.buildChildPages(child, outPages);
          return true;
        });
      }
    } else {
      this.buildAnchors(target, target.parent);
    }
  }
  createAnchor(target, pageTarget) {
    const parts = [target.name];
    while (target.parent && target.parent !== pageTarget) {
      target = target.parent;
      if (!target.kindOf(
        ReflectionKind29.TypeLiteral | ReflectionKind29.FunctionOrMethod
      )) {
        parts.unshift(target.name);
      }
    }
    return this.getSlugger(pageTarget).slug(parts.join("."));
  }
  buildAnchors(target, pageTarget) {
    if (!(target instanceof Reflection5) || !(pageTarget instanceof Reflection5)) {
      return;
    }
    if (!target.isDeclaration() && !target.isSignature() && !target.isTypeParameter()) {
      return;
    }
    if (target.kindOf(ReflectionKind29.TypeLiteral) && (!target.parent?.kindOf(ReflectionKind29.SomeExport) || target.parent.type?.type !== "reflection")) {
      return;
    }
    if (!target.kindOf(ReflectionKind29.TypeLiteral)) {
      const anchor = this.createAnchor(target, pageTarget);
      this.fullUrls.set(
        target,
        this.fullUrls.get(pageTarget) + "#" + anchor
      );
      this.anchors.set(target, anchor);
    }
    target.traverse((child) => {
      this.buildAnchors(child, pageTarget);
      return true;
    });
  }
  /** Strip non-url safe characters from the specified string. */
  getUrlSafeName(name) {
    return createNormalizedUrl(name);
  }
  getFileName(baseName) {
    const lowerBaseName = baseName.toLocaleLowerCase();
    if (this.usedFileNames.has(lowerBaseName)) {
      let index2 = 1;
      while (this.usedFileNames.has(`${lowerBaseName}-${index2}`)) {
        ++index2;
      }
      this.usedFileNames.add(`${lowerBaseName}-${index2}`);
      return `${baseName}-${index2}${this.extension}`;
    }
    this.usedFileNames.add(lowerBaseName);
    return `${baseName}${this.extension}`;
  }
};
_init11 = __decoratorStart(null);
_sluggerConfiguration = new WeakMap();
_includeHierarchySummary = new WeakMap();
__decorateElement(_init11, 4, "sluggerConfiguration", _sluggerConfiguration_dec, BaseRouter, _sluggerConfiguration);
__decorateElement(_init11, 4, "includeHierarchySummary", _includeHierarchySummary_dec, BaseRouter, _includeHierarchySummary);
__decoratorMetadata(_init11, BaseRouter);
var KindRouter = class extends BaseRouter {
  directories = /* @__PURE__ */ new Map([
    [ReflectionKind29.Class, "classes"],
    [ReflectionKind29.Interface, "interfaces"],
    [ReflectionKind29.Enum, "enums"],
    [ReflectionKind29.Namespace, "modules"],
    [ReflectionKind29.Module, "modules"],
    [ReflectionKind29.TypeAlias, "types"],
    [ReflectionKind29.Function, "functions"],
    [ReflectionKind29.Variable, "variables"],
    [ReflectionKind29.Document, "documents"]
  ]);
  getIdealBaseName(reflection) {
    const dir = this.directories.get(reflection.kind);
    const parts = [createNormalizedUrl(reflection.name)];
    while (reflection.parent && !reflection.parent.isProject()) {
      reflection = reflection.parent;
      parts.unshift(createNormalizedUrl(reflection.name));
    }
    const baseName = parts.join(".");
    return `${dir}/${baseName}`;
  }
};
var KindDirRouter = class extends KindRouter {
  fixLink(link) {
    return link.replace(/\/index\.html(#|$)/, "/$1");
  }
  buildChildPages(reflection, outPages) {
    this.extension = `/index.html`;
    return super.buildChildPages(reflection, outPages);
  }
  getFullUrl(refl) {
    return this.fixLink(super.getFullUrl(refl));
  }
  relativeUrl(from, to) {
    return this.fixLink(super.relativeUrl(from, to));
  }
};
var StructureRouter = class extends BaseRouter {
  getIdealBaseName(reflection) {
    const parts = [...reflection.name.split("/").map(createNormalizedUrl)];
    while (reflection.parent && !reflection.parent.isProject()) {
      reflection = reflection.parent;
      parts.unshift(
        ...reflection.name.split("/").map(createNormalizedUrl)
      );
    }
    if (parts.includes("..")) {
      throw new Error(
        "structure router cannot be used with a project that has a name containing '..'"
      );
    }
    return parts.join("/");
  }
};
var StructureDirRouter = class extends StructureRouter {
  fixLink(link) {
    return link.replace(/\/index\.html(#|$)/, "/$1");
  }
  buildChildPages(reflection, outPages) {
    this.extension = `/index.html`;
    return super.buildChildPages(reflection, outPages);
  }
  getFullUrl(refl) {
    return this.fixLink(super.getFullUrl(refl));
  }
  relativeUrl(from, to) {
    return this.fixLink(super.relativeUrl(from, to));
  }
};
var _groupReferencesByType_dec2, _a10, _init12, _groupReferencesByType2;
var GroupRouter = class extends (_a10 = BaseRouter, _groupReferencesByType_dec2 = [Option10("groupReferencesByType")], _a10) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _groupReferencesByType2, __runInitializers(_init12, 8, this)), __runInitializers(_init12, 11, this);
  }
  getGroup(reflection) {
    if (reflection.isDeclaration() || reflection.isDocument()) {
      const group2 = GroupPlugin.getGroups(
        reflection,
        this.groupReferencesByType
      );
      return group2.values().next().value;
    }
    throw new Error(
      "Tried to render a non declaration/document to a page, not supported by GroupRouter"
    );
  }
  getIdealBaseName(reflection) {
    const group2 = this.getGroup(reflection).split("/").map(createNormalizedUrl).join("/");
    const parts = [createNormalizedUrl(reflection.name)];
    while (reflection.parent && !reflection.parent.isProject()) {
      reflection = reflection.parent;
      parts.unshift(createNormalizedUrl(reflection.name));
    }
    const baseName = parts.join(".");
    return `${group2}/${baseName}`;
  }
};
_init12 = __decoratorStart(_a10);
_groupReferencesByType2 = new WeakMap();
__decorateElement(_init12, 4, "groupReferencesByType", _groupReferencesByType_dec2, GroupRouter, _groupReferencesByType2);
__decoratorMetadata(_init12, GroupRouter);
var _defaultCategory_dec3, _a11, _init13, _defaultCategory3;
var CategoryRouter = class extends (_a11 = BaseRouter, _defaultCategory_dec3 = [Option10("defaultCategory")], _a11) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _defaultCategory3, __runInitializers(_init13, 8, this)), __runInitializers(_init13, 11, this);
  }
  getCategory(reflection) {
    if (reflection.isDeclaration() || reflection.isDocument()) {
      const cats = CategoryPlugin.getCategories(reflection);
      return cats.size ? cats.values().next().value : this.defaultCategory;
    }
    throw new Error(
      "Tried to render a non declaration/document to a page, not supported by GroupRouter"
    );
  }
  getIdealBaseName(reflection) {
    const cat = this.getCategory(reflection).split("/").map(createNormalizedUrl).join("/");
    const parts = [createNormalizedUrl(reflection.name)];
    while (reflection.parent && !reflection.parent.isProject()) {
      reflection = reflection.parent;
      parts.unshift(createNormalizedUrl(reflection.name));
    }
    const baseName = parts.join(".");
    return `${cat}/${baseName}`;
  }
};
_init13 = __decoratorStart(_a11);
_defaultCategory3 = new WeakMap();
__decorateElement(_init13, 4, "defaultCategory", _defaultCategory_dec3, CategoryRouter, _defaultCategory3);
__decoratorMetadata(_init13, CategoryRouter);

// src/lib/output/themes/default/DefaultTheme.tsx
import { loadHighlighter, Option as Option11 } from "#node-utils";
var _ignoredHighlightLanguages_dec, _highlightLanguages_dec, _darkTheme_dec, _lightTheme_dec, _a12, _init14, _lightTheme, _darkTheme, _highlightLanguages, _ignoredHighlightLanguages;
var DefaultTheme = class extends (_a12 = Theme, _lightTheme_dec = [Option11("lightHighlightTheme")], _darkTheme_dec = [Option11("darkHighlightTheme")], _highlightLanguages_dec = [Option11("highlightLanguages")], _ignoredHighlightLanguages_dec = [Option11("ignoredHighlightLanguages")], _a12) {
  /**
   * Create a new DefaultTheme instance.
   *
   * @param renderer  The renderer this theme is attached to.
   */
  constructor(renderer) {
    super(renderer);
    // Note: This will always contain lowercased names to avoid issues with
    // case-insensitive file systems.
    __publicField(this, "usedFileNames", /* @__PURE__ */ new Set());
    /** @internal */
    __publicField(this, "markedPlugin");
    __publicField(this, "router");
    /**
     * The icons which will actually be rendered. The source of truth lives on the theme, and
     * the {@link DefaultThemeRenderContext.icons} member will produce references to these.
     *
     * These icons will be written twice. Once to an `icons.svg` file in the assets directory
     * which will be referenced by icons on the context, and once to an `icons.js` file so that
     * references to the icons can be dynamically embedded within the page for use by the search
     * dropdown and when loading the page on `file://` urls.
     *
     * Custom themes may overwrite this entire object or individual properties on it to customize
     * the icons used within the page, however TypeDoc currently assumes that all icons are svg
     * elements, so custom themes must also use svg elements.
     */
    __publicField(this, "icons");
    __publicField(this, "ContextClass", DefaultThemeRenderContext);
    __privateAdd(this, _lightTheme, __runInitializers(_init14, 8, this)), __runInitializers(_init14, 11, this);
    __privateAdd(this, _darkTheme, __runInitializers(_init14, 12, this)), __runInitializers(_init14, 15, this);
    __privateAdd(this, _highlightLanguages, __runInitializers(_init14, 16, this)), __runInitializers(_init14, 19, this);
    __privateAdd(this, _ignoredHighlightLanguages, __runInitializers(_init14, 20, this)), __runInitializers(_init14, 23, this);
    __publicField(this, "documentTemplate", (pageEvent) => {
      return this.getRenderContext(pageEvent).documentTemplate(pageEvent);
    });
    __publicField(this, "reflectionTemplate", (pageEvent) => {
      return this.getRenderContext(pageEvent).reflectionTemplate(pageEvent);
    });
    __publicField(this, "indexTemplate", (pageEvent) => {
      return this.getRenderContext(pageEvent).indexTemplate(pageEvent);
    });
    __publicField(this, "hierarchyTemplate", (pageEvent) => {
      return this.getRenderContext(pageEvent).hierarchyTemplate(pageEvent);
    });
    __publicField(this, "defaultLayoutTemplate", (pageEvent, template) => {
      return this.getRenderContext(pageEvent).defaultLayout(template, pageEvent);
    });
    __publicField(this, "_navigationCache");
    this.icons = getIcons();
    this.markedPlugin = renderer.markedPlugin;
    this.router = renderer.router;
  }
  getRenderContext(pageEvent) {
    return new this.ContextClass(this.router, this, pageEvent, this.application.options);
  }
  getReflectionClasses(reflection) {
    const filters = this.application.options.getValue("visibilityFilters");
    return getReflectionClasses(reflection, filters);
  }
  /**
   * This is used so that themes may define multiple icons for modified icons (e.g. method, and inherited method)
   */
  getReflectionIcon(reflection) {
    return reflection.kind;
  }
  render(page) {
    const templateMapping = {
      [PageKind.Index]: this.indexTemplate,
      [PageKind.Document]: this.documentTemplate,
      [PageKind.Hierarchy]: this.hierarchyTemplate,
      [PageKind.Reflection]: this.reflectionTemplate
    };
    const template = templateMapping[page.pageKind];
    if (!template) {
      throw new Error(`TypeDoc's DefaultTheme does not support the page kind ${page.pageKind}`);
    }
    if (!page.isReflectionEvent()) {
      throw new Error(
        `TypeDoc's DefaultTheme requires that a page model be a reflection when rendering ${page.pageKind}`
      );
    }
    const templateOutput = this.defaultLayoutTemplate(page, template);
    return "<!DOCTYPE html>" + JSX30.renderElement(templateOutput) + "\n";
  }
  async preRender(_event) {
    await loadHighlighter(
      this.lightTheme,
      this.darkTheme,
      // Checked in option validation
      this.highlightLanguages,
      this.ignoredHighlightLanguages
    );
  }
  /**
   * If implementing a custom theme, it is recommended to override {@link buildNavigation} instead.
   */
  getNavigation(project) {
    if (this._navigationCache) {
      return this._navigationCache;
    }
    return this._navigationCache = this.buildNavigation(project);
  }
  buildNavigation(project) {
    const theme = this;
    const router = this.router;
    const opts = this.application.options.getValue("navigation");
    const leaves = this.application.options.getValue("navigationLeaves");
    return getNavigationElements(project) || [];
    function toNavigation(element) {
      if (opts.excludeReferences && element instanceof ReferenceReflection6) {
        return;
      }
      const children = getNavigationElements(element);
      if (element instanceof ReflectionCategory2 || element instanceof ReflectionGroup2) {
        if (!children?.length) {
          return;
        }
        return {
          text: element.title,
          children
        };
      }
      const icon = theme.getReflectionIcon(element) === element.kind ? void 0 : theme.getReflectionIcon(element);
      return {
        text: getDisplayName(element),
        path: router.getFullUrl(element),
        kind: element.kind & ReflectionKind30.Project ? void 0 : element.kind,
        class: classNames({ deprecated: element.isDeprecated() }, theme.getReflectionClasses(element)),
        children: children?.length ? children : void 0,
        icon
      };
    }
    function getNavigationElements(parent) {
      if (parent instanceof ReflectionCategory2) {
        return filterMap5(parent.children, toNavigation);
      }
      if (parent instanceof ReflectionGroup2) {
        if (shouldShowCategories(parent.owningReflection, opts) && parent.categories) {
          return filterMap5(parent.categories, toNavigation);
        }
        return filterMap5(parent.children, toNavigation);
      }
      if (leaves.includes(parent.getFullName())) {
        return;
      }
      if (!parent.kindOf(ReflectionKind30.MayContainDocuments)) {
        return;
      }
      if (parent.isDocument()) {
        return filterMap5(parent.children, toNavigation);
      }
      if (!parent.kindOf(ReflectionKind30.SomeModule | ReflectionKind30.Project)) {
        return filterMap5(parent.documents, toNavigation);
      }
      if (parent.categories && shouldShowCategories(parent, opts)) {
        return filterMapWithNoneCollection(parent.categories);
      }
      if (parent.groups && shouldShowGroups(parent, opts)) {
        return filterMapWithNoneCollection(parent.groups);
      }
      if (opts.includeFolders && parent.childrenIncludingDocuments?.some((child) => child.name.includes("/"))) {
        return deriveModuleFolders(parent.childrenIncludingDocuments);
      }
      return filterMap5(parent.childrenIncludingDocuments, toNavigation);
    }
    function filterMapWithNoneCollection(reflection) {
      const none = reflection.find((x) => x.title.toLocaleLowerCase() === "none");
      const others = reflection.filter((x) => x.title.toLocaleLowerCase() !== "none");
      const mappedOthers = filterMap5(others, toNavigation);
      if (none) {
        const noneMappedChildren = filterMap5(none.children, toNavigation);
        return [...noneMappedChildren, ...mappedOthers];
      }
      return mappedOthers;
    }
    function deriveModuleFolders(children) {
      const result = [];
      const resolveOrCreateParents = (path3, root = result) => {
        if (path3.length > 1) {
          const inner = root.find((el) => el.text === path3[0]);
          if (inner) {
            inner.children ||= [];
            return resolveOrCreateParents(path3.slice(1), inner.children);
          } else {
            root.push({
              text: path3[0],
              children: []
            });
            return resolveOrCreateParents(path3.slice(1), root[root.length - 1].children);
          }
        }
        return root;
      };
      for (const child of children.filter((c) => router.hasOwnDocument(c))) {
        const nav = toNavigation(child);
        if (nav) {
          const parts = child.name.split("/");
          const collection = resolveOrCreateParents(parts);
          nav.text = parts[parts.length - 1];
          collection.push(nav);
        }
      }
      if (opts.compactFolders) {
        const queue = [...result];
        while (queue.length) {
          const review = queue.shift();
          queue.push(...review.children || []);
          if (review.kind || review.path) continue;
          if (review.children?.length === 1) {
            const copyFrom = review.children[0];
            const fullName = `${review.text}/${copyFrom.text}`;
            delete review.children;
            Object.assign(review, copyFrom);
            review.text = fullName;
            queue.push(review);
          }
        }
      }
      return result;
    }
  }
};
_init14 = __decoratorStart(_a12);
_lightTheme = new WeakMap();
_darkTheme = new WeakMap();
_highlightLanguages = new WeakMap();
_ignoredHighlightLanguages = new WeakMap();
__decorateElement(_init14, 4, "lightTheme", _lightTheme_dec, DefaultTheme, _lightTheme);
__decorateElement(_init14, 4, "darkTheme", _darkTheme_dec, DefaultTheme, _darkTheme);
__decorateElement(_init14, 4, "highlightLanguages", _highlightLanguages_dec, DefaultTheme, _highlightLanguages);
__decorateElement(_init14, 4, "ignoredHighlightLanguages", _ignoredHighlightLanguages_dec, DefaultTheme, _ignoredHighlightLanguages);
__decoratorMetadata(_init14, DefaultTheme);
function getReflectionClasses(reflection, filters) {
  const classes = /* @__PURE__ */ new Set();
  for (const key of Object.keys(filters)) {
    if (key === "inherited") {
      if (reflection.flags.isInherited) {
        classes.add("tsd-is-inherited");
      }
    } else if (key === "protected") {
      if (reflection.flags.isProtected) {
        classes.add("tsd-is-protected");
      }
    } else if (key === "private") {
      if (reflection.flags.isPrivate) {
        classes.add("tsd-is-private");
      }
    } else if (key === "external") {
      if (reflection.flags.isExternal) {
        classes.add("tsd-is-external");
      }
    } else if (key.startsWith("@")) {
      if (key === "@deprecated") {
        if (reflection.isDeprecated()) {
          classes.add(toStyleClass(`tsd-is-${key.substring(1)}`));
        }
      } else if (reflection.comment?.hasModifier(key) || reflection.comment?.getTag(key)) {
        classes.add(toStyleClass(`tsd-is-${key.substring(1)}`));
      } else if (reflection.isDeclaration()) {
        const ownSignatures = reflection.getNonIndexSignatures();
        if (ownSignatures.length && ownSignatures.every(
          (refl) => refl.comment?.hasModifier(key) || refl.comment?.getTag(key)
        )) {
          classes.add(toStyleClass(`tsd-is-${key.substring(1)}`));
        }
      }
    }
  }
  return Array.from(classes).join(" ");
}
function shouldShowCategories(reflection, opts) {
  if (opts.includeCategories) {
    return !reflection.comment?.hasModifier("@hideCategories");
  }
  return reflection.comment?.hasModifier("@showCategories") === true;
}
function shouldShowGroups(reflection, opts) {
  if (opts.includeGroups) {
    return !reflection.comment?.hasModifier("@hideGroups");
  }
  return reflection.comment?.hasModifier("@showGroups") === true;
}

// src/lib/output/themes/MarkedPlugin.tsx
import MarkdownIt2 from "markdown-it";
import { Reflection as Reflection6, ReflectionKind as ReflectionKind31 } from "#models";
import { highlight, isLoadedLanguage, isSupportedLanguage, Option as Option12 } from "#node-utils";
import { assertNever as assertNever6, escapeHtml, i18n as i18n29, JSX as JSX31 } from "#utils";
function getFriendlyFullName(target) {
  if (target instanceof Reflection6) {
    return target.getFriendlyFullName();
  }
  if (target.parent) {
    return target.name;
  }
  const parts = [target.name];
  let current = target;
  while (current.parent) {
    parts.unshift(current.name);
    current = current.parent;
  }
  return parts.join(".");
}
var _validation_dec4, _markdownLinkExternal_dec, _markdownItOptions_dec, _darkTheme_dec2, _lightTheme_dec2, _a13, _init15, _lightTheme2, _darkTheme2, _markdownItOptions, _markdownLinkExternal, _validation4;
var MarkedPlugin = class extends (_a13 = ContextAwareRendererComponent, _lightTheme_dec2 = [Option12("lightHighlightTheme")], _darkTheme_dec2 = [Option12("darkHighlightTheme")], _markdownItOptions_dec = [Option12("markdownItOptions")], _markdownLinkExternal_dec = [Option12("markdownLinkExternal")], _validation_dec4 = [Option12("validation")], _a13) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _lightTheme2, __runInitializers(_init15, 8, this)), __runInitializers(_init15, 11, this);
    __privateAdd(this, _darkTheme2, __runInitializers(_init15, 12, this)), __runInitializers(_init15, 15, this);
    __privateAdd(this, _markdownItOptions, __runInitializers(_init15, 16, this)), __runInitializers(_init15, 19, this);
    __privateAdd(this, _markdownLinkExternal, __runInitializers(_init15, 20, this)), __runInitializers(_init15, 23, this);
    __privateAdd(this, _validation4, __runInitializers(_init15, 24, this)), __runInitializers(_init15, 27, this);
    __publicField(this, "parser");
    __publicField(this, "renderedRelativeLinks", []);
    /**
     * This needing to be here really feels hacky... probably some nicer way to do this.
     * Revisit in 0.28.
     */
    __publicField(this, "renderContext", null);
    __publicField(this, "lastHeaderSlug", "");
    this.owner.on(MarkdownEvent.PARSE, this.onParseMarkdown.bind(this));
    this.owner.on(RendererEvent.END, this.onEnd.bind(this));
  }
  /**
   * Highlight the syntax of the given text using Shiki.
   *
   * @param text  The text that should be highlighted.
   * @param lang  The language that should be used to highlight the string.
   * @return A html string with syntax highlighting.
   */
  getHighlighted(text, lang) {
    lang = lang || "typescript";
    lang = lang.toLowerCase();
    if (!isLoadedLanguage(lang)) {
      if (isSupportedLanguage(lang)) {
        this.application.logger.warn(
          i18n29.unloaded_language_0_not_highlighted_in_comment_for_1(
            lang,
            getFriendlyFullName(this.page?.model || { name: "(unknown)" })
          )
        );
      } else {
        this.application.logger.warn(
          i18n29.unsupported_highlight_language_0_not_highlighted_in_comment_for_1(
            lang,
            getFriendlyFullName(this.page?.model || { name: "(unknown)" })
          )
        );
      }
      return text;
    }
    return highlight(text, lang);
  }
  /**
   * Parse the given markdown string and return the resulting html.
   *
   * @param input  The markdown string that should be parsed.
   * @returns The resulting html string.
   */
  parseMarkdown(input, page, context) {
    let markdown = input;
    if (typeof markdown !== "string") {
      markdown = this.displayPartsToMarkdown(page, context, markdown);
    }
    this.renderContext = context;
    const event = new MarkdownEvent(page, markdown, markdown);
    this.owner.trigger(MarkdownEvent.PARSE, event);
    this.renderContext = null;
    return event.parsedText;
  }
  displayPartsToMarkdown(page, context, parts) {
    const useHtml = !!this.markdownItOptions["html"];
    const result = [];
    for (const part of parts) {
      switch (part.kind) {
        case "text":
        case "code":
          result.push(part.text);
          break;
        case "inline-tag":
          switch (part.tag) {
            case "@label":
            case "@inheritdoc":
              break;
            // Not rendered.
            case "@link":
            case "@linkcode":
            case "@linkplain": {
              if (part.target) {
                let url;
                let kindClass;
                if (typeof part.target === "string") {
                  url = part.target === "#" ? void 0 : part.target;
                } else if ("id" in part.target) {
                  kindClass = ReflectionKind31.classString(part.target.kind);
                  if (context.router.hasUrl(part.target)) {
                    url = context.urlTo(part.target);
                  }
                  if (typeof url === "undefined") {
                    let target = part.target.parent;
                    while (!context.router.hasUrl(target)) {
                      target = target.parent;
                    }
                    url = context.urlTo(target);
                    if (this.validation.rewrittenLink) {
                      this.application.logger.warn(
                        i18n29.reflection_0_links_to_1_with_text_2_but_resolved_to_3(
                          page.model.getFriendlyFullName(),
                          part.target.getFriendlyFullName(),
                          part.text,
                          target.getFriendlyFullName()
                        )
                      );
                    }
                  }
                  if (url == "") {
                    url = "#";
                  }
                }
                if (useHtml) {
                  const text = part.tag === "@linkcode" ? `<code>${part.text}</code>` : part.text;
                  result.push(
                    url ? `<a href="${url}"${kindClass ? ` class="${kindClass}"` : ""}>${text}</a>` : part.text
                  );
                } else {
                  const text = part.tag === "@linkcode" ? "`" + part.text + "`" : part.text;
                  result.push(url ? `[${text}](${url})` : text);
                }
              } else {
                result.push(part.text);
              }
              break;
            }
            default:
              result.push(`{${part.tag} ${part.text}}`);
              break;
          }
          break;
        case "relative-link":
          switch (typeof part.target) {
            case "number": {
              const refl = page.project.files.resolve(part.target, page.model.project);
              let url;
              if (typeof refl === "object") {
                if (refl.isProject()) {
                  url = context.relativeURL("./");
                } else {
                  url = context.urlTo(refl);
                }
              } else {
                const fileName = page.project.files.getName(part.target);
                if (fileName) {
                  url = context.relativeURL(`media/${fileName}`);
                }
              }
              if (typeof url !== "undefined") {
                if (part.targetAnchor) {
                  url += "#" + part.targetAnchor;
                  if (typeof refl === "object") {
                    this.renderedRelativeLinks.push({
                      source: this.page.model,
                      target: refl,
                      link: part
                    });
                  }
                }
                result.push(url);
                break;
              }
            }
            // fall through
            case "undefined":
              result.push(part.text);
              break;
          }
          break;
        default:
          assertNever6(part);
      }
    }
    return result.join("");
  }
  onEnd() {
    for (const { source, target, link } of this.renderedRelativeLinks) {
      const slugger = this.owner.router.getSlugger(target);
      if (!slugger.hasAnchor(link.targetAnchor)) {
        this.application.logger.warn(
          i18n29.reflection_0_links_to_1_but_anchor_does_not_exist_try_2(
            getFriendlyFullName(source),
            link.text,
            slugger.getSimilarAnchors(link.targetAnchor).map((a) => link.text.replace(/#.*/, "#" + a)).join("\n	")
          )
        );
      }
    }
    this.renderedRelativeLinks = [];
  }
  /**
   * Triggered before the renderer starts rendering a project.
   *
   * @param event  An event object describing the current render operation.
   */
  onBeginRenderer(event) {
    super.onBeginRenderer(event);
    this.setupParser();
  }
  getSlugger() {
    return this.owner.router.getSlugger(this.page.model);
  }
  /**
   * Creates an object with options that are passed to the markdown parser.
   *
   * @returns The options object for the markdown parser.
   */
  setupParser() {
    this.parser = MarkdownIt2({
      ...this.markdownItOptions,
      highlight: (code, lang) => {
        code = this.getHighlighted(code, lang || "ts");
        code = code.replace(/\n$/, "") + "\n";
        if (!lang) {
          return `<pre><code>${code}</code><button>${i18n29.theme_copy()}</button></pre>
`;
        }
        return `<pre><code class="${escapeHtml(lang)}">${code}</code><button type="button">${i18n29.theme_copy()}</button></pre>
`;
      }
    });
    githubAlertMarkdownPlugin(this.parser);
    const loader = this.application.options.getValue("markdownItLoader");
    loader(this.parser);
    function defaultRender(tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    }
    const headingOpenRenderer = this.parser.renderer.rules["heading_open"] || defaultRender;
    this.parser.renderer.rules["heading_open"] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const content = getTokenTextContent(tokens[idx + 1]);
      const level = token.markup.length;
      const slug = this.getSlugger().slug(content);
      this.lastHeaderSlug = slug;
      this.page.pageHeadings.push({
        link: `#${slug}`,
        text: content,
        level
      });
      token.attrSet("id", slug);
      token.attrSet("class", "tsd-anchor-link");
      return headingOpenRenderer(tokens, idx, options, env, self);
    };
    const headingCloseRenderer = this.parser.renderer.rules["heading_close"] || defaultRender;
    this.parser.renderer.rules["heading_close"] = (...args) => {
      return `${JSX31.renderElement(anchorIcon(this.renderContext, this.lastHeaderSlug))}${headingCloseRenderer(...args)}`;
    };
    const linkOpenRenderer = this.parser.renderer.rules["link_open"] || defaultRender;
    this.parser.renderer.rules["link_open"] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const href = token.attrGet("href");
      if (href) {
        if (this.markdownLinkExternal && /^https?:\/\//i.test(href) && !(href + "/").startsWith(this.hostedBaseUrl)) {
          token.attrSet("target", "_blank");
          const classes = token.attrGet("class")?.split(" ") || [];
          classes.push("external");
          token.attrSet("class", classes.join(" "));
        }
        token.attrSet("href", href);
      }
      return linkOpenRenderer(tokens, idx, options, env, self);
    };
    this.parser.renderer.rules["alert_open"] = (tokens, idx) => {
      const icon = this.renderContext.icons[tokens[idx].attrGet("icon")];
      const iconHtml = JSX31.renderElement(icon());
      return `<div class="${tokens[idx].attrGet("class")}"><div class="tsd-alert-title">${iconHtml}<span>${tokens[idx].attrGet("alert")}</span></div>`;
    };
  }
  /**
   * Triggered when {@link MarkedPlugin} parses a markdown string.
   *
   * @param event
   */
  onParseMarkdown(event) {
    event.parsedText = this.parser.render(event.parsedText);
  }
};
_init15 = __decoratorStart(_a13);
_lightTheme2 = new WeakMap();
_darkTheme2 = new WeakMap();
_markdownItOptions = new WeakMap();
_markdownLinkExternal = new WeakMap();
_validation4 = new WeakMap();
__decorateElement(_init15, 4, "lightTheme", _lightTheme_dec2, MarkedPlugin, _lightTheme2);
__decorateElement(_init15, 4, "darkTheme", _darkTheme_dec2, MarkedPlugin, _darkTheme2);
__decorateElement(_init15, 4, "markdownItOptions", _markdownItOptions_dec, MarkedPlugin, _markdownItOptions);
__decorateElement(_init15, 4, "markdownLinkExternal", _markdownLinkExternal_dec, MarkedPlugin, _markdownLinkExternal);
__decorateElement(_init15, 4, "validation", _validation_dec4, MarkedPlugin, _validation4);
__decoratorMetadata(_init15, MarkedPlugin);
function getTokenTextContent(token) {
  if (token.children) {
    return token.children.map(getTokenTextContent).join("");
  }
  if (token.type === "text") {
    return token.content;
  }
  return "";
}
var kindNames = ["note", "tip", "important", "warning", "caution"];
var iconNames = ["alertNote", "alertTip", "alertImportant", "alertWarning", "alertCaution"];
var kindTranslations = [
  () => i18n29.alert_note(),
  () => i18n29.alert_tip(),
  () => i18n29.alert_important(),
  () => i18n29.alert_warning(),
  () => i18n29.alert_caution()
];
function githubAlertMarkdownPlugin(md) {
  md.core.ruler.after("block", "typedoc-github-alert-plugin", (state) => {
    const bqStarts = [];
    for (let i = 0; i < state.tokens.length; ++i) {
      const token = state.tokens[i];
      if (token.type === "blockquote_open") {
        bqStarts.push(i);
      } else if (token.type === "blockquote_close") {
        if (bqStarts.length === 1) {
          checkForAlert(state.tokens, bqStarts[0], i);
        }
        bqStarts.pop();
      }
    }
  });
}
function checkForAlert(tokens, start, end) {
  let alertKind = -1;
  for (let i = start; i < end; ++i) {
    if (tokens[i].type === "inline") {
      const kindString = tokens[i].content.match(/^\[!(\w+)\]/);
      const kindIndex = kindNames.indexOf(kindString?.[1].toLowerCase() || "");
      if (kindIndex !== -1) {
        tokens[i].content = tokens[i].content.substring(kindString[0].length);
        alertKind = kindIndex;
      }
      break;
    }
  }
  if (alertKind === -1) return;
  tokens[start].type = "alert_open";
  tokens[start].tag = "div";
  tokens[start].attrPush(["class", `tsd-alert tsd-alert-${kindNames[alertKind]}`]);
  tokens[start].attrPush(["alert", kindTranslations[alertKind]()]);
  tokens[start].attrPush(["icon", iconNames[alertKind]]);
  tokens[end].type = "alert_close";
  tokens[end].tag = "div";
}

// src/lib/output/plugins/AssetsPlugin.ts
import { ReflectionKind as ReflectionKind32 } from "#models";
import { copySync, getStyles, isFile as isFile2, Option as Option13, readFile as readFile4, TYPEDOC_ROOT, writeFileSync } from "#node-utils";
import { getEnumKeys, i18n as i18n30 } from "#utils";
import { existsSync as existsSync2 } from "fs";
import { extname as extname2, join as join5 } from "path";
var _customJs_dec, _customCss_dec, _favicon_dec, _a14, _init16, _favicon, _customCss, _customJs;
var AssetsPlugin = class extends (_a14 = RendererComponent, _favicon_dec = [Option13("favicon")], _customCss_dec = [Option13("customCss")], _customJs_dec = [Option13("customJs")], _a14) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _favicon, __runInitializers(_init16, 8, this)), __runInitializers(_init16, 11, this);
    __privateAdd(this, _customCss, __runInitializers(_init16, 12, this)), __runInitializers(_init16, 15, this);
    __privateAdd(this, _customJs, __runInitializers(_init16, 16, this)), __runInitializers(_init16, 19, this);
    this.owner.on(RendererEvent.BEGIN, this.onRenderBegin.bind(this));
    this.owner.on(RendererEvent.END, this.onRenderEnd.bind(this));
  }
  getTranslatedStrings() {
    const translations2 = {
      copy: i18n30.theme_copy(),
      copied: i18n30.theme_copied(),
      normally_hidden: i18n30.theme_normally_hidden(),
      hierarchy_expand: i18n30.theme_hierarchy_expand(),
      hierarchy_collapse: i18n30.theme_hierarchy_collapse(),
      folder: i18n30.theme_folder(),
      search_index_not_available: i18n30.theme_search_index_not_available(),
      search_no_results_found_for_0: i18n30.theme_search_no_results_found_for_0(
        "{0}"
      )
    };
    for (const key of getEnumKeys(ReflectionKind32)) {
      const kind = ReflectionKind32[key];
      translations2[`kind_${kind}`] = ReflectionKind32.singularString(kind);
    }
    return translations2;
  }
  onRenderBegin(event) {
    const dest = join5(event.outputDirectory, "assets");
    if (!/^https?:\/\//i.test(this.favicon) && [".ico", ".png", ".svg"].includes(extname2(this.favicon))) {
      copySync(
        this.favicon,
        join5(dest, "favicon" + extname2(this.favicon))
      );
    }
    if (this.customCss) {
      this.application.watchFile(this.customCss);
      if (existsSync2(this.customCss)) {
        copySync(this.customCss, join5(dest, "custom.css"));
      } else {
        this.application.logger.error(
          i18n30.custom_css_file_0_does_not_exist(
            this.customCss
          )
        );
      }
    }
    if (this.customJs) {
      this.application.watchFile(this.customJs);
      if (existsSync2(this.customJs)) {
        copySync(this.customJs, join5(dest, "custom.js"));
      } else {
        this.application.logger.error(
          i18n30.custom_js_file_0_does_not_exist(
            this.customJs
          )
        );
      }
    }
  }
  /**
   * Triggered before the renderer starts rendering a project.
   *
   * @param event  An event object describing the current render operation.
   */
  onRenderEnd(event) {
    if (this.owner.theme instanceof DefaultTheme) {
      const src = join5(
        TYPEDOC_ROOT,
        "static"
      );
      const dest = join5(event.outputDirectory, "assets");
      copySync(join5(src, "style.css"), join5(dest, "style.css"));
      const mainJs = readFile4(join5(src, "main.js"));
      writeFileSync(
        join5(dest, "main.js"),
        [
          '"use strict";',
          `window.translations=${JSON.stringify(this.getTranslatedStrings())};`,
          mainJs
        ].join("\n")
      );
      writeFileSync(join5(dest, "highlight.css"), getStyles());
      const media = join5(event.outputDirectory, "media");
      const toCopy = event.project.files.getNameToAbsoluteMap();
      for (const [fileName, absolute] of toCopy.entries()) {
        if (isFile2(absolute)) {
          copySync(absolute, join5(media, fileName));
        }
      }
    }
  }
};
_init16 = __decoratorStart(_a14);
_favicon = new WeakMap();
_customCss = new WeakMap();
_customJs = new WeakMap();
__decorateElement(_init16, 4, "favicon", _favicon_dec, AssetsPlugin, _favicon);
__decorateElement(_init16, 4, "customCss", _customCss_dec, AssetsPlugin, _customCss);
__decorateElement(_init16, 4, "customJs", _customJs_dec, AssetsPlugin, _customJs);
__decoratorMetadata(_init16, AssetsPlugin);

// src/lib/output/plugins/HierarchyPlugin.ts
import { compressJson, writeFile } from "#node-utils";
import * as Path3 from "path";
var HierarchyPlugin = class extends RendererComponent {
  constructor(renderer) {
    super(renderer);
    this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
  }
  onRendererBegin(_event) {
    if (!(this.owner.theme instanceof DefaultTheme)) {
      return;
    }
    this.owner.preRenderAsyncJobs.push((event) => this.buildHierarchy(event));
  }
  async buildHierarchy(event) {
    const project = event.project;
    const hierarchy2 = {
      roots: getHierarchyRoots(project).map((refl) => refl.id),
      reflections: {}
    };
    const queue = [...hierarchy2.roots];
    while (queue.length) {
      const id = queue.pop();
      const refl = project.getReflectionById(id);
      if (id in hierarchy2.reflections) continue;
      const url = this.owner.router.getFullUrl(refl);
      if (!url) continue;
      const jsonRecord = {
        name: refl.name,
        kind: refl.kind,
        url,
        class: getKindClass(refl)
      };
      const path3 = getUniquePath(refl);
      if (path3.length > 1) {
        jsonRecord.uniqueNameParents = path3.slice(0, -1).map((r) => r.id);
        queue.push(...jsonRecord.uniqueNameParents);
      }
      const children = [
        ...refl.implementedBy || [],
        ...refl.extendedBy || []
      ];
      for (const child of children) {
        if (child.reflection) {
          jsonRecord.children ||= [];
          jsonRecord.children.push(child.reflection.id);
        }
      }
      if (jsonRecord.children) {
        queue.push(...jsonRecord.children);
      }
      hierarchy2.reflections[id] = jsonRecord;
    }
    const hierarchyJs = Path3.join(
      event.outputDirectory,
      "assets",
      "hierarchy.js"
    );
    await writeFile(
      hierarchyJs,
      `window.hierarchyData = "${await compressJson(hierarchy2)}"`
    );
  }
};

// src/lib/output/plugins/IconsPlugin.tsx
import { writeFile as writeFile2 } from "#node-utils";
import { JSX as JSX32 } from "#utils";
import { join as join7 } from "path";
var ICONS_JS = `
(function() {
    addIcons();
    function addIcons() {
        if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", addIcons);
        const svg = document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        svg.innerHTML = \`SVG_HTML\`;
        svg.style.display = "none";
        if (location.protocol === "file:") updateUseElements();
    }

    function updateUseElements() {
        document.querySelectorAll("use").forEach(el => {
            if (el.getAttribute("href").includes("#icon-")) {
                el.setAttribute("href", el.getAttribute("href").replace(/.*#/, "#"));
            }
        });
    }
})()
`.trim();
var IconsPlugin = class extends RendererComponent {
  iconHtml;
  constructor(owner) {
    super(owner);
    this.owner.on(RendererEvent.BEGIN, this.onBeginRender.bind(this));
  }
  onBeginRender(_event) {
    if (this.owner.theme instanceof DefaultTheme) {
      this.owner.postRenderAsyncJobs.push((event) => this.onRenderEnd(event));
    }
  }
  async onRenderEnd(event) {
    const children = [];
    const icons = this.owner.theme.icons;
    for (const [name, icon] of Object.entries(icons)) {
      const svg2 = icon.call(icons);
      const className = svg2.props && "class" in svg2.props ? String(svg2.props.class) + " tsd-no-select" : "tsd-no-select";
      children.push(
        /* @__PURE__ */ JSX32.createElement("symbol", { ...svg2.props || {}, id: `icon-${name}`, class: className }, svg2.children)
      );
    }
    const svg = JSX32.renderElement(/* @__PURE__ */ JSX32.createElement("svg", { xmlns: "http://www.w3.org/2000/svg" }, children));
    const js = ICONS_JS.replace("SVG_HTML", JSX32.renderElement(/* @__PURE__ */ JSX32.createElement(JSX32.Fragment, null, children)).replaceAll("`", "\\`"));
    const svgPath = join7(event.outputDirectory, "assets/icons.svg");
    const jsPath = join7(event.outputDirectory, "assets/icons.js");
    await Promise.all([writeFile2(svgPath, svg), writeFile2(jsPath, js)]);
  }
};

// src/lib/output/plugins/JavascriptIndexPlugin.ts
import lunr from "lunr";
import * as Path4 from "path";
import { Reflection as Reflection7 } from "#models";
import { compressJson as compressJson2, Option as Option14, writeFile as writeFile3 } from "#node-utils";
import { i18n as i18n31 } from "#utils";
var _groupReferencesByType_dec3, _searchCategoryBoosts_dec, _searchGroupBoosts_dec, _searchDocuments_dec, _searchComments_dec, _a15, _init17, _searchComments, _searchDocuments, _searchGroupBoosts, _searchCategoryBoosts, _groupReferencesByType3;
var JavascriptIndexPlugin = class extends (_a15 = RendererComponent, _searchComments_dec = [Option14("searchInComments")], _searchDocuments_dec = [Option14("searchInDocuments")], _searchGroupBoosts_dec = [Option14("searchGroupBoosts")], _searchCategoryBoosts_dec = [Option14("searchCategoryBoosts")], _groupReferencesByType_dec3 = [Option14("groupReferencesByType")], _a15) {
  constructor(owner) {
    super(owner);
    __privateAdd(this, _searchComments, __runInitializers(_init17, 8, this)), __runInitializers(_init17, 11, this);
    __privateAdd(this, _searchDocuments, __runInitializers(_init17, 12, this)), __runInitializers(_init17, 15, this);
    __privateAdd(this, _searchGroupBoosts, __runInitializers(_init17, 16, this)), __runInitializers(_init17, 19, this);
    __privateAdd(this, _searchCategoryBoosts, __runInitializers(_init17, 20, this)), __runInitializers(_init17, 23, this);
    __privateAdd(this, _groupReferencesByType3, __runInitializers(_init17, 24, this)), __runInitializers(_init17, 27, this);
    __publicField(this, "unusedGroupBoosts", /* @__PURE__ */ new Set());
    __publicField(this, "unusedCatBoosts", /* @__PURE__ */ new Set());
    this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
  }
  onRendererBegin(_event) {
    this.unusedGroupBoosts = new Set(Object.keys(this.searchGroupBoosts));
    this.unusedCatBoosts = new Set(Object.keys(this.searchCategoryBoosts));
    if (!(this.owner.theme instanceof DefaultTheme)) {
      return;
    }
    this.owner.preRenderAsyncJobs.push((event) => this.buildSearchIndex(event));
  }
  async buildSearchIndex(event) {
    const theme = this.owner.theme;
    const rows = [];
    const initialSearchResults = this.owner.router.getLinkTargets().filter(
      (refl) => refl instanceof Reflection7 && (refl.isDeclaration() || refl.isDocument()) && refl.name && !refl.flags.isExternal
    );
    const indexEvent = new IndexEvent(initialSearchResults);
    this.owner.trigger(IndexEvent.PREPARE_INDEX, indexEvent);
    const builder = new lunr.Builder();
    builder.pipeline.add(lunr.trimmer);
    builder.ref("id");
    for (const [key, boost] of Object.entries(
      indexEvent.searchFieldWeights
    )) {
      builder.field(key, { boost });
    }
    for (const reflection of indexEvent.searchResults) {
      const boost = this.getBoost(reflection);
      if (boost <= 0) {
        continue;
      }
      let parent = reflection.parent;
      if (parent?.isProject()) {
        parent = void 0;
      }
      const row = {
        kind: reflection.kind,
        name: reflection.name,
        url: theme.router.getFullUrl(reflection),
        classes: theme.getReflectionClasses(reflection)
      };
      const icon = theme.getReflectionIcon(reflection);
      if (icon !== reflection.kind) {
        row.icon = icon;
      }
      if (parent) {
        row.parent = parent.getFullName();
      }
      builder.add(
        {
          name: reflection.name,
          comment: this.getCommentSearchText(reflection),
          document: this.getDocumentSearchText(reflection),
          ...indexEvent.searchFields[rows.length],
          id: rows.length
        },
        { boost }
      );
      rows.push(row);
    }
    const index2 = builder.build();
    const jsonFileName = Path4.join(
      event.outputDirectory,
      "assets",
      "search.js"
    );
    const data = {
      rows,
      index: index2
    };
    await writeFile3(
      jsonFileName,
      `window.searchData = "${await compressJson2(data)}";`
    );
    if (this.unusedGroupBoosts.size && this.application.options.isSet("searchGroupBoosts")) {
      this.application.logger.warn(
        i18n31.not_all_search_group_boosts_used_0(
          Array.from(this.unusedGroupBoosts).join("\n	")
        )
      );
    }
    if (this.unusedCatBoosts.size && this.application.options.isSet("searchCategoryBoosts")) {
      this.application.logger.warn(
        i18n31.not_all_search_category_boosts_used_0(
          Array.from(this.unusedCatBoosts).join("\n	")
        )
      );
    }
  }
  getBoost(refl) {
    let boost = refl.relevanceBoost ?? 1;
    for (const group2 of GroupPlugin.getGroups(
      refl,
      this.groupReferencesByType
    )) {
      boost *= this.searchGroupBoosts[group2] ?? 1;
      this.unusedGroupBoosts.delete(group2);
    }
    for (const cat of CategoryPlugin.getCategories(refl)) {
      boost *= this.searchCategoryBoosts[cat] ?? 1;
      this.unusedCatBoosts.delete(cat);
    }
    return boost;
  }
  getCommentSearchText(reflection) {
    if (!this.searchComments) return;
    const comments = [];
    if (reflection.comment) comments.push(reflection.comment);
    if (reflection.isDeclaration()) {
      reflection.signatures?.forEach(
        (s) => s.comment && comments.push(s.comment)
      );
      if (reflection.getSignature?.comment) {
        comments.push(reflection.getSignature.comment);
      }
      if (reflection.setSignature?.comment) {
        comments.push(reflection.setSignature.comment);
      }
    }
    if (!comments.length) {
      return;
    }
    return comments.flatMap((c) => {
      return [...c.summary, ...c.blockTags.flatMap((t) => t.content)];
    }).map((part) => part.text).join("\n");
  }
  getDocumentSearchText(reflection) {
    if (!this.searchDocuments) return;
    if (reflection.isDocument()) {
      return reflection.content.flatMap((c) => c.text).join("\n");
    }
  }
};
_init17 = __decoratorStart(_a15);
_searchComments = new WeakMap();
_searchDocuments = new WeakMap();
_searchGroupBoosts = new WeakMap();
_searchCategoryBoosts = new WeakMap();
_groupReferencesByType3 = new WeakMap();
__decorateElement(_init17, 4, "searchComments", _searchComments_dec, JavascriptIndexPlugin, _searchComments);
__decorateElement(_init17, 4, "searchDocuments", _searchDocuments_dec, JavascriptIndexPlugin, _searchDocuments);
__decorateElement(_init17, 4, "searchGroupBoosts", _searchGroupBoosts_dec, JavascriptIndexPlugin, _searchGroupBoosts);
__decorateElement(_init17, 4, "searchCategoryBoosts", _searchCategoryBoosts_dec, JavascriptIndexPlugin, _searchCategoryBoosts);
__decorateElement(_init17, 4, "groupReferencesByType", _groupReferencesByType_dec3, JavascriptIndexPlugin, _groupReferencesByType3);
__decoratorMetadata(_init17, JavascriptIndexPlugin);

// src/lib/output/plugins/NavigationPlugin.ts
import { compressJson as compressJson3, writeFile as writeFile4 } from "#node-utils";
import * as Path5 from "path";
var NavigationPlugin = class extends RendererComponent {
  constructor(owner) {
    super(owner);
    this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
  }
  onRendererBegin(_event) {
    if (!(this.owner.theme instanceof DefaultTheme)) {
      return;
    }
    this.owner.preRenderAsyncJobs.push((event) => this.buildNavigationIndex(event));
  }
  async buildNavigationIndex(event) {
    const navigationJs = Path5.join(
      event.outputDirectory,
      "assets",
      "navigation.js"
    );
    const nav = this.owner.theme.getNavigation(
      event.project
    );
    await writeFile4(
      navigationJs,
      `window.navigationData = "${await compressJson3(nav)}"`
    );
  }
};

// src/lib/output/plugins/SitemapPlugin.ts
import Path6 from "path";
import { writeFile as writeFile5 } from "#node-utils";
import { escapeHtml as escapeHtml2, JSX as JSX33 } from "#utils";
var SitemapPlugin = class extends RendererComponent {
  get hostedBaseUrl() {
    const url = this.application.options.getValue("hostedBaseUrl");
    return !url || url.endsWith("/") ? url : url + "/";
  }
  constructor(owner) {
    super(owner);
    this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
  }
  onRendererBegin(_event) {
    if (!(this.owner.theme instanceof DefaultTheme)) {
      return;
    }
    if (!this.hostedBaseUrl) {
      return;
    }
    this.owner.hooks.on("head.begin", (context) => {
      if (context.page.url === "index.html") {
        return {
          tag: "link",
          props: { rel: "canonical", href: this.hostedBaseUrl },
          children: []
        };
      }
      return { tag: JSX33.Fragment, props: null, children: [] };
    });
    this.owner.preRenderAsyncJobs.push((event) => this.buildSitemap(event));
  }
  async buildSitemap(event) {
    const sitemapXml = Path6.join(event.outputDirectory, "sitemap.xml");
    const lastmod = new Date(this.owner.renderStartTime).toISOString();
    const urls = event.pages.map((page) => {
      return {
        tag: "url",
        children: [
          {
            tag: "loc",
            children: new URL(
              page.url,
              this.hostedBaseUrl
            ).toString()
          },
          {
            tag: "lastmod",
            children: lastmod
          }
        ]
      };
    });
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
` + stringifyXml({
      tag: "urlset",
      attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" },
      children: urls
    }) + "\n";
    await writeFile5(sitemapXml, sitemap);
  }
};
function stringifyXml(xml, indent2 = 0) {
  const parts = ["	".repeat(indent2), "<", xml.tag];
  for (const [key, val] of Object.entries(xml.attr || {})) {
    parts.push(" ", key, '="', escapeHtml2(val), '"');
  }
  parts.push(">");
  if (typeof xml.children === "string") {
    parts.push(escapeHtml2(xml.children));
  } else {
    for (const child of xml.children) {
      parts.push("\n");
      parts.push(stringifyXml(child, indent2 + 1));
    }
    parts.push("\n", "	".repeat(indent2));
  }
  parts.push("</", xml.tag, ">");
  return parts.join("");
}

// src/lib/output/renderer.ts
var _pretty_dec, _cacheBust_dec, _githubPages_dec, _cname_dec, _cleanOutputDir_dec, _routerName_dec, _themeName_dec, _a16, _init18, _themeName, _routerName, _cleanOutputDir, _cname, _githubPages, _cacheBust, _pretty;
var Renderer = class extends (_a16 = AbstractComponent4, _themeName_dec = [Option15("theme")], _routerName_dec = [Option15("router")], _cleanOutputDir_dec = [Option15("cleanOutputDir")], _cname_dec = [Option15("cname")], _githubPages_dec = [Option15("githubPages")], _cacheBust_dec = [Option15("cacheBust")], _pretty_dec = [Option15("pretty")], _a16) {
  constructor(owner) {
    super(owner);
    __publicField(this, "routers", /* @__PURE__ */ new Map([
      ["kind", KindRouter],
      ["structure", StructureRouter],
      ["kind-dir", KindDirRouter],
      ["structure-dir", StructureDirRouter],
      ["group", GroupRouter],
      ["category", CategoryRouter]
    ]));
    __publicField(this, "themes", /* @__PURE__ */ new Map([
      ["default", DefaultTheme]
    ]));
    /**
     * A list of async jobs which must be completed *before* rendering output.
     * They will be called after {@link RendererEvent.BEGIN} has fired, but before any files have been written.
     *
     * This may be used by plugins to register work that must be done to prepare output files. For example: asynchronously
     * transform markdown to HTML.
     *
     * Note: This array is cleared after calling the contained functions on each {@link Renderer.render} call.
     */
    __publicField(this, "preRenderAsyncJobs", []);
    /**
     * A list of async jobs which must be completed after rendering output files but before generation is considered successful.
     * These functions will be called after all documents have been written to the filesystem.
     *
     * This may be used by plugins to register work that must be done to finalize output files. For example: asynchronously
     * generating an image referenced in a render hook.
     *
     * Note: This array is cleared after calling the contained functions on each {@link Renderer.render} call.
     */
    __publicField(this, "postRenderAsyncJobs", []);
    /**
     * The theme that is used to render the documentation.
     */
    __publicField(this, "theme");
    /**
     * The router which is used to determine the pages to render and
     * how to link between pages.
     */
    __publicField(this, "router");
    /**
     * Hooks which will be called when rendering pages.
     * Note:
     * - Hooks added during output will be discarded at the end of rendering.
     * - Hooks added during a page render will be discarded at the end of that page's render.
     *
     * See {@link RendererHooks} for a description of each available hook, and when it will be called.
     */
    __publicField(this, "hooks", new EventHooks());
    __privateAdd(this, _themeName, __runInitializers(_init18, 8, this)), __runInitializers(_init18, 11, this);
    __privateAdd(this, _routerName, __runInitializers(_init18, 12, this)), __runInitializers(_init18, 15, this);
    __privateAdd(this, _cleanOutputDir, __runInitializers(_init18, 16, this)), __runInitializers(_init18, 19, this);
    __privateAdd(this, _cname, __runInitializers(_init18, 20, this)), __runInitializers(_init18, 23, this);
    __privateAdd(this, _githubPages, __runInitializers(_init18, 24, this)), __runInitializers(_init18, 27, this);
    __privateAdd(this, _cacheBust, __runInitializers(_init18, 28, this)), __runInitializers(_init18, 31, this);
    __privateAdd(this, _pretty, __runInitializers(_init18, 32, this)), __runInitializers(_init18, 35, this);
    __publicField(this, "renderStartTime", -1);
    __publicField(this, "markedPlugin");
    this.markedPlugin = new MarkedPlugin(this);
    new AssetsPlugin(this);
    new IconsPlugin(this);
    new HierarchyPlugin(this);
    new JavascriptIndexPlugin(this);
    new NavigationPlugin(this);
    new SitemapPlugin(this);
  }
  /**
   * Define a new theme that can be used to render output.
   * This API will likely be changing at some point, to allow more easily overriding parts of the theme without
   * requiring additional boilerplate.
   * @param name
   * @param theme
   */
  defineTheme(name, theme) {
    if (this.themes.has(name)) {
      throw new Error(`The theme "${name}" has already been defined.`);
    }
    this.themes.set(name, theme);
  }
  /** @internal intended for test usage only */
  removeTheme(name) {
    this.themes.delete(name);
  }
  /**
   * Define a new router that can be used to determine the output structure.
   * @param name
   * @param router
   */
  defineRouter(name, router) {
    if (this.routers.has(name)) {
      throw new Error(`The router "${name}" has already been defined.`);
    }
    this.routers.set(name, router);
  }
  /** @internal intended for test usage only */
  removeRouter(name) {
    this.routers.delete(name);
  }
  /**
   * Render the given project reflection to the specified output directory.
   *
   * @param project  The project that should be rendered.
   * @param outputDirectory  The path of the directory the documentation should be rendered to.
   */
  async render(project, outputDirectory) {
    JSX34.setRenderSettings({ pretty: this.pretty });
    const momento = this.hooks.saveMomento();
    this.renderStartTime = Date.now();
    if (!this.prepareRouter() || !this.prepareTheme() || !await this.prepareOutputDirectory(outputDirectory)) {
      return;
    }
    const pages = this.router.buildPages(project);
    const output = new RendererEvent(outputDirectory, project, pages);
    this.trigger(RendererEvent.BEGIN, output);
    await this.runPreRenderJobs(output);
    this.application.logger.verbose(
      `There are ${pages.length} pages to write.`
    );
    await Promise.all(pages.map((page) => this.renderDocument(outputDirectory, page, project)));
    this.postRenderAsyncJobs.push(async (o) => await this.theme.postRender(o));
    await Promise.all(this.postRenderAsyncJobs.map((job) => job(output)));
    this.postRenderAsyncJobs = [];
    this.trigger(RendererEvent.END, output);
    this.theme = void 0;
    this.router = void 0;
    this.hooks.restoreMomento(momento);
  }
  async runPreRenderJobs(output) {
    const start = Date.now();
    this.preRenderAsyncJobs.push(async (o) => await this.theme.preRender(o));
    await Promise.all(this.preRenderAsyncJobs.map((job) => job(output)));
    this.preRenderAsyncJobs = [];
    this.application.logger.verbose(
      `Pre render async jobs took ${Date.now() - start}ms`
    );
  }
  /**
   * Render a single page.
   *
   * @param page An event describing the current page.
   * @return TRUE if the page has been saved to disc, otherwise FALSE.
   */
  async renderDocument(outputDirectory, page, project) {
    const momento = this.hooks.saveMomento();
    const event = new PageEvent(page.model);
    event.url = page.url;
    event.filename = path2.join(outputDirectory, page.url);
    event.pageKind = page.kind;
    event.project = project;
    this.trigger(PageEvent.BEGIN, event);
    event.contents = this.theme.render(event);
    this.trigger(PageEvent.END, event);
    this.hooks.restoreMomento(momento);
    try {
      await writeFile6(event.filename, event.contents);
    } catch (error) {
      this.application.logger.error(
        i18n32.could_not_write_0(event.filename)
      );
    }
  }
  prepareRouter() {
    if (!this.theme) {
      const ctor = this.routers.get(this.routerName);
      if (!ctor) {
        this.application.logger.error(
          i18n32.router_0_is_not_defined_available_are_1(
            this.routerName,
            [...this.routers.keys()].join(", ")
          )
        );
        return false;
      } else {
        this.router = new ctor(this.application);
      }
    }
    return true;
  }
  prepareTheme() {
    if (!this.theme) {
      const ctor = this.themes.get(this.themeName);
      if (!ctor) {
        this.application.logger.error(
          i18n32.theme_0_is_not_defined_available_are_1(
            this.themeName,
            [...this.themes.keys()].join(", ")
          )
        );
        return false;
      } else {
        this.theme = new ctor(this);
      }
    }
    return true;
  }
  /**
   * Prepare the output directory. If the directory does not exist, it will be
   * created. If the directory exists, it will be emptied.
   *
   * @param directory  The path to the directory that should be prepared.
   * @returns TRUE if the directory could be prepared, otherwise FALSE.
   */
  async prepareOutputDirectory(directory) {
    if (this.cleanOutputDir) {
      try {
        await fs.promises.rm(directory, {
          recursive: true,
          force: true
        });
      } catch (error) {
        this.application.logger.warn(
          i18n32.could_not_empty_output_directory_0(
            directory
          )
        );
        return false;
      }
    }
    try {
      fs.mkdirSync(directory, { recursive: true });
    } catch (error) {
      this.application.logger.error(
        i18n32.could_not_create_output_directory_0(
          directory
        )
      );
      return false;
    }
    if (this.githubPages) {
      try {
        const text = "TypeDoc added this file to prevent GitHub Pages from using Jekyll. You can turn off this behavior by setting the `githubPages` option to false.";
        fs.writeFileSync(path2.join(directory, ".nojekyll"), text);
      } catch (error) {
        this.application.logger.warn(
          i18n32.could_not_write_0(
            path2.join(directory, ".nojekyll")
          )
        );
        return false;
      }
    }
    if (this.cname) {
      fs.writeFileSync(path2.join(directory, "CNAME"), this.cname);
    }
    return true;
  }
};
_init18 = __decoratorStart(_a16);
_themeName = new WeakMap();
_routerName = new WeakMap();
_cleanOutputDir = new WeakMap();
_cname = new WeakMap();
_githubPages = new WeakMap();
_cacheBust = new WeakMap();
_pretty = new WeakMap();
__decorateElement(_init18, 4, "themeName", _themeName_dec, Renderer, _themeName);
__decorateElement(_init18, 4, "routerName", _routerName_dec, Renderer, _routerName);
__decorateElement(_init18, 4, "cleanOutputDir", _cleanOutputDir_dec, Renderer, _cleanOutputDir);
__decorateElement(_init18, 4, "cname", _cname_dec, Renderer, _cname);
__decorateElement(_init18, 4, "githubPages", _githubPages_dec, Renderer, _githubPages);
__decorateElement(_init18, 4, "cacheBust", _cacheBust_dec, Renderer, _cacheBust);
__decorateElement(_init18, 4, "pretty", _pretty_dec, Renderer, _pretty);
__decoratorMetadata(_init18, Renderer);
/** @event */
__publicField(Renderer, "EVENT_BEGIN_PAGE", PageEvent.BEGIN);
/** @event */
__publicField(Renderer, "EVENT_END_PAGE", PageEvent.END);
/** @event */
__publicField(Renderer, "EVENT_BEGIN", RendererEvent.BEGIN);
/** @event */
__publicField(Renderer, "EVENT_END", RendererEvent.END);
/** @event */
__publicField(Renderer, "EVENT_PREPARE_INDEX", IndexEvent.PREPARE_INDEX);

// src/lib/application.ts
import { FileRegistry as FileRegistry2 } from "#models";
import { deriveRootDir as deriveRootDir2, findTsConfigFile, glob, readFile as readFile5 } from "#node-utils";
import { i18n as i18n39, Logger as Logger2, LogLevel, unique as unique3 } from "#utils";
import { ok as ok9 } from "assert";

// src/lib/internationalization/internationalization.ts
import { addTranslations, DefaultMap as DefaultMap3, setTranslations } from "#utils";

// src/lib/internationalization/locales/en.ts
var en_default = {
  loaded_multiple_times_0: "TypeDoc has been loaded multiple times. This is commonly caused by plugins which have their own installation of TypeDoc. The loaded paths are:\n	{0}",
  unsupported_ts_version_0: "You are running with an unsupported TypeScript version! If TypeDoc crashes, this is why. TypeDoc supports {0}",
  no_compiler_options_set: "No compiler options set. This likely means that TypeDoc did not find your tsconfig.json. Generated documentation will probably be empty",
  loaded_plugin_0: `Loaded plugin {0}`,
  solution_not_supported_in_watch_mode: "The provided tsconfig file looks like a solution style tsconfig, which is not supported in watch mode",
  strategy_not_supported_in_watch_mode: "entryPointStrategy must be set to either resolve or expand for watch mode",
  file_0_changed_restarting: "Configuration file {0} changed: full restart required...",
  file_0_changed_rebuilding: "File {0} changed: rebuilding output...",
  found_0_errors_and_1_warnings: "Found {0} errors and {1} warnings",
  output_0_could_not_be_generated: "{0} output could not be generated due to the errors above",
  output_0_generated_at_1: "{0} generated at {1}",
  no_entry_points_for_packages: "No entry points provided to packages mode, documentation cannot be generated",
  failed_to_find_packages: "Failed to find any packages, ensure you have provided at least one directory as an entry point containing package.json",
  nested_packages_unsupported_0: "Project at {0} has entryPointStrategy set to packages, but nested packages are not supported",
  package_option_0_should_be_specified_at_root: "The packageOptions option sets option {0}, which only has an affect at the root level",
  previous_error_occurred_when_reading_options_for_0: "The previous error occurred when reading options for the package at {0}",
  converting_project_at_0: "Converting project at {0}",
  failed_to_convert_packages: "Failed to convert one or more packages, result will not be merged together",
  merging_converted_projects: "Merging converted projects",
  no_entry_points_to_merge: "No entry points provided to merge",
  entrypoint_did_not_match_files_0: "The entrypoint glob {0} did not match any files",
  failed_to_parse_json_0: `Failed to parse file at {0} as json`,
  failed_to_read_0_when_processing_document_tag_in_1: `Failed to read file {0} when processing @document tag for comment in {1}`,
  failed_to_read_0_when_processing_project_document: `Failed to read file {0} when adding project document`,
  failed_to_read_0_when_processing_document_child_in_1: `Failed to read file {0} when processing document children in {1}`,
  frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values: "Frontmatter children in {0} should be an array of strings or an object with string values",
  converting_union_as_interface: `Using @interface on a union type will discard properties not present on all branches of the union. TypeDoc's output may not accurately describe your source code`,
  converting_0_as_class_requires_value_declaration: `Converting {0} as a class requires a declaration which represents a non-type value`,
  converting_0_as_class_without_construct_signatures: `{0} is being converted as a class, but does not have any construct signatures`,
  converting_0_as_enum_requires_value_declaration: `Converting {0} as an enum requires a declaration which represents a non-type value`,
  failed_to_convert_0_as_reexport: "Failed to convert {0} as a re-export because it is not direct reference.",
  comment_for_0_should_not_contain_block_or_modifier_tags: `The comment for {0} should not contain any block or modifier tags`,
  symbol_0_has_multiple_declarations_with_comment: `{0} has multiple declarations with a comment. An arbitrary comment will be used`,
  comments_for_0_are_declared_at_1: `The comments for {0} are declared at:
	{1}`,
  // comments/parser.ts
  multiple_type_parameters_on_template_tag_unsupported: `TypeDoc does not support multiple type parameters defined in a single @template tag with a comment`,
  inline_tag_0_not_parsed_as_modifier_tag_1: `The inline tag {0} was likely intended to be a modifier tag but was not parsed as one due to including content "{1}"`,
  failed_to_find_jsdoc_tag_for_name_0: `Failed to find JSDoc tag for {0} after parsing comment, please file a bug report`,
  relative_path_0_is_not_a_file_and_will_not_be_copied_to_output: `The relative path {0} is not a file and will not be copied to the output directory`,
  inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0: "An inline @inheritDoc tag should not appear within a block tag as it will not be processed in comment at {0}",
  at_most_one_remarks_tag_expected_in_comment_at_0: "At most one @remarks tag is expected in a comment, ignoring all but the first in comment at {0}",
  at_most_one_returns_tag_expected_in_comment_at_0: "At most one @returns tag is expected in a comment, ignoring all but the first in comment at {0}",
  at_most_one_inheritdoc_tag_expected_in_comment_at_0: "At most one @inheritDoc tag is expected in a comment, ignoring all but the first in comment at {0}",
  content_in_summary_overwritten_by_inheritdoc_in_comment_at_0: "Content in the summary section will be overwritten by the @inheritDoc tag in comment at {0}",
  content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0: "Content in the @remarks block will be overwritten by the @inheritDoc tag in comment at {0}",
  content_in_returns_block_overwritten_by_inheritdoc_in_comment_at_0: "Content in the @returns block will be overwritten by the @inheritDoc tag in comment at {0}",
  example_tag_literal_name: "The first line of an example tag will be taken literally as the example name, and should only contain text",
  inheritdoc_tag_properly_capitalized: "The @inheritDoc tag should be properly capitalized",
  treating_unrecognized_tag_0_as_modifier: `Treating unrecognized tag {0} as a modifier tag`,
  unmatched_closing_brace: `Unmatched closing brace`,
  unescaped_open_brace_without_inline_tag: `Encountered an unescaped open brace without an inline tag`,
  unknown_block_tag_0: `Encountered an unknown block tag {0}`,
  unknown_inline_tag_0: `Encountered an unknown inline tag {0}`,
  open_brace_within_inline_tag: `Encountered an open brace within an inline tag, this is likely a mistake`,
  inline_tag_not_closed: `Inline tag is not closed`,
  // validation
  comment_for_0_links_to_1_not_included_in_docs_use_external_link_2: `The comment for {0} links to "{1}" which was resolved but is not included in the documentation. To fix this warning export it or add {2} to the externalSymbolLinkMappings option`,
  failed_to_resolve_link_to_0_in_comment_for_1: `Failed to resolve link to "{0}" in comment for {1}`,
  failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2: `Failed to resolve link to "{0}" in comment for {1}. You may have wanted "{2}"`,
  failed_to_resolve_link_to_0_in_readme_for_1: `Failed to resolve link to "{0}" in readme for {1}`,
  failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2: `Failed to resolve link to "{0}" in readme for {1}. You may have wanted "{2}"`,
  failed_to_resolve_link_to_0_in_document_1: `Failed to resolve link to "{0}" in document {1}`,
  failed_to_resolve_link_to_0_in_document_1_may_have_meant_2: `Failed to resolve link to "{0}" in document {1}. You may have wanted "{2}"`,
  type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: `{0}, defined in {1}, is referenced by {2} but not included in the documentation`,
  reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: `{0} ({1}), defined in {2}, does not have any documentation`,
  invalid_intentionally_not_documented_names_0: "The following qualified reflection names were marked as intentionally not documented, but were either not referenced in the documentation, or were documented:\n	{0}",
  invalid_intentionally_not_exported_symbols_0: "The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n	{0}",
  reflection_0_has_unused_mergeModuleWith_tag: "{0} has a @mergeModuleWith tag which could not be resolved",
  reflection_0_links_to_1_with_text_2_but_resolved_to_3: `"{0}" links to "{1}" with text "{2}" which exists but does not have a link in the documentation, will link to "{3}" instead.`,
  // conversion plugins
  not_all_search_category_boosts_used_0: `Not all categories specified in searchCategoryBoosts were used in the documentation. The unused categories were:
	{0}`,
  not_all_search_group_boosts_used_0: `Not all groups specified in searchGroupBoosts were used in the documentation. The unused groups were:
	{0}`,
  comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group: `Comment for {0} includes @categoryDescription for "{1}", but no child is placed in that category`,
  comment_for_0_includes_groupDescription_for_1_but_no_child_in_group: `Comment for {0} includes @groupDescription for "{1}", but no child is placed in that group`,
  comment_for_0_specifies_1_as_sort_strategy_but_only_2_is_valid: `Comment for {0} specifies @sortStrategy with "{1}", which is an invalid sort strategy, the following are valid:
	{2}`,
  label_0_for_1_cannot_be_referenced: `The label "{0}" for {1} cannot be referenced with a declaration reference. Labels may only contain A-Z, 0-9, and _, and may not start with a number`,
  modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2: `The modifier tag {0} is mutually exclusive with {1} in the comment for {2}`,
  signature_0_has_unused_param_with_name_1: `The signature {0} has an @param with name "{1}", which was not used`,
  declaration_reference_in_inheritdoc_for_0_not_fully_parsed: `Declaration reference in @inheritDoc for {0} was not fully parsed and may resolve incorrectly`,
  failed_to_find_0_to_inherit_comment_from_in_1: `Failed to find "{0}" to inherit the comment from in the comment for {1}`,
  reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: `{0} tried to copy a comment from {1} with @inheritDoc, but the source has no associated comment`,
  inheritdoc_circular_inheritance_chain_0: `@inheritDoc specifies a circular inheritance chain: {0}`,
  provided_readme_at_0_could_not_be_read: `Provided README path, {0} could not be read`,
  defaulting_project_name: 'The --name option was not specified, and no package.json was found. Defaulting project name to "Documentation"',
  disable_git_set_but_not_source_link_template: `disableGit is set, but sourceLinkTemplate is not, so source links cannot be produced. Set a sourceLinkTemplate or disableSources to prevent source tracking`,
  disable_git_set_and_git_revision_used: `disableGit is set and sourceLinkTemplate contains {gitRevision}, which will be replaced with an empty string as no revision was provided`,
  git_remote_0_not_valid: `The provided git remote "{0}" was not valid. Source links will be broken`,
  reflection_0_tried_to_merge_into_child_1: `The reflection {0} tried to use @mergeModuleWith to merge into one of its children: {1}`,
  include_0_in_1_specified_2_resolved_to_3_does_not_exist: `{0} tag in comment for {1} specified "{2}" to include, which was resolved to "{3}" and does not exist or is not a file.`,
  include_0_in_1_specified_2_circular_include_3: `{0} tag in comment for {1} specified "{2}" to include, which resulted in a circular include:
	{3}`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_not_found: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled "{4}", but the region was not found in the file.`,
  include_0_tag_in_1_region_2_region_not_supported: `{0} tag in {1} specified "{2}", but regions are not supported for this file extension.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_close_not_found: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled "{4}", but the region closing comment was not found in the file.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_open_not_found: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled "{4}", but the region opening comment was not found in the file.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_close_found_multiple_times: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled {4}, but the region closing comment was found multiple times in the file.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_open_found_multiple_times: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled {4}, but the region opening comment was found multiple times in the file.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_found_multiple_times: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled {4}, but the region was found multiple times in the file.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_empty: `{0} tag in {1} specified "{2}" to include from file "{3}" the region labeled {4}. The region was found but it is empty or contains only whitespace.`,
  include_0_tag_in_1_specified_2_file_3_lines_4_invalid_range: `{0} tag in {1} specified "{2}" to include from file "{3}" the lines {4}, but an invalid range was specified.`,
  include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines: `{0} tag in {1} specified "{2}" to include from file "{3}" the lines {4}, but the file only has {5} lines.`,
  // output plugins
  custom_css_file_0_does_not_exist: `Custom CSS file at {0} does not exist`,
  custom_js_file_0_does_not_exist: `Custom JavaScript file at {0} does not exist`,
  unsupported_highlight_language_0_not_highlighted_in_comment_for_1: `Unsupported highlight language {0} will not be highlighted in comment for {1}`,
  unloaded_language_0_not_highlighted_in_comment_for_1: `Code block with language {0} will not be highlighted in comment for {1} as it was not included in the highlightLanguages option`,
  yaml_frontmatter_not_an_object: `Expected YAML frontmatter to be an object`,
  // renderer
  could_not_write_0: `Could not write {0}`,
  could_not_empty_output_directory_0: `Could not empty the output directory {0}`,
  could_not_create_output_directory_0: `Could not create the output directory {0}`,
  theme_0_is_not_defined_available_are_1: `The theme '{0}' is not defined. The available themes are: {1}`,
  router_0_is_not_defined_available_are_1: `The router '{0}' is not defined. The available routers are: {1}`,
  reflection_0_links_to_1_but_anchor_does_not_exist_try_2: `{0} links to {1}, but the anchor does not exist. You may have meant:
	{2}`,
  // entry points
  no_entry_points_provided: "No entry points were provided or discovered from package.json exports, this is likely a misconfiguration",
  unable_to_find_any_entry_points: "Unable to find any entry points. See previous warnings",
  watch_does_not_support_packages_mode: "Watch mode does not support 'packages' style entry points",
  watch_does_not_support_merge_mode: "Watch mode does not support 'merge' style entry points",
  entry_point_0_not_in_program: `The entry point {0} is not referenced by the 'files' or 'include' option in your tsconfig`,
  failed_to_resolve_0_to_ts_path: `Failed to resolve entry point path {0} from package.json to a TypeScript source file`,
  use_expand_or_glob_for_files_in_dir: `If you wanted to include files inside this directory, set --entryPointStrategy to expand or specify a glob`,
  glob_0_did_not_match_any_files: `The glob {0} did not match any files`,
  entry_point_0_did_not_match_any_files_after_exclude: `The glob {0} did not match any files after applying exclude patterns`,
  entry_point_0_did_not_exist: `Provided entry point {0} does not exist`,
  entry_point_0_did_not_match_any_packages: `The entry point glob {0} did not match any directories containing package.json`,
  file_0_not_an_object: `The file {0} is not an object`,
  // deserialization
  serialized_project_referenced_0_not_part_of_project: `Serialized project referenced reflection {0}, which was not a part of the project`,
  saved_relative_path_0_resolved_from_1_does_not_exist: `Serialized project referenced {0}, which does not exist relative to {1}`,
  // options
  circular_reference_extends_0: `Circular reference encountered for "extends" field of {0}`,
  failed_resolve_0_to_file_in_1: `Failed to resolve {0} to a file in {1}`,
  glob_0_should_use_posix_slash: `The glob "{0}" escapes a non-special character. Glob inputs to TypeDoc may not use Windows path separators (\\), try replacing with posix path separators (/)`,
  option_0_can_only_be_specified_by_config_file: `The '{0}' option can only be specified via a config file`,
  option_0_expected_a_value_but_none_provided: `--{0} expected a value, but none was given as an argument`,
  unknown_option_0_may_have_meant_1: `Unknown option: {0}, you may have meant:
	{1}`,
  typedoc_key_in_0_ignored: `The 'typedoc' key in {0} was used by the legacy-packages entryPointStrategy and will be ignored`,
  typedoc_options_must_be_object_in_0: `Failed to parse the "typedocOptions" field in {0}, ensure it exists and contains an object`,
  tsconfig_file_0_does_not_exist: `The tsconfig file {0} does not exist`,
  tsconfig_file_specifies_options_file: `"typedocOptions" in tsconfig file specifies an option file to read but the option file has already been read. This is likely a misconfiguration`,
  tsconfig_file_specifies_tsconfig_file: `"typedocOptions" in tsconfig file may not specify a tsconfig file to read`,
  tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: `The {0} defined in typedoc.json will be overwritten by configuration in tsdoc.json`,
  failed_read_tsdoc_json_0: `Failed to read tsdoc.json file at {0}`,
  invalid_tsdoc_json_0: `The file {0} is not a valid tsdoc.json file`,
  options_file_0_does_not_exist: `The options file {0} does not exist`,
  failed_read_options_file_0: `Failed to parse {0}, ensure it exists and exports an object`,
  failed_to_apply_compilerOptions_overrides_0: "Failed to apply compilerOptions overrides: {0}",
  // plugins
  invalid_plugin_0_missing_load_function: `Invalid structure in plugin {0}, no load function found`,
  plugin_0_could_not_be_loaded: `The plugin {0} could not be loaded`,
  // option declarations help
  help_options: "Specify a json option file that should be loaded. If not specified TypeDoc will look for 'typedoc.json' in the current directory",
  help_tsconfig: "Specify a TypeScript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory",
  help_compilerOptions: "Selectively override the TypeScript compiler options used by TypeDoc",
  help_lang: "Sets the language to be used in generation and in TypeDoc's messages",
  help_locales: "Add translations for a specified locale. This option is primarily intended to be used as a stopgap while waiting for official locale support to be added to TypeDoc",
  help_packageOptions: "Set options which will be set within each package when entryPointStrategy is set to packages",
  help_entryPoints: "The entry points of your documentation",
  help_entryPointStrategy: "The strategy to be used to convert entry points into documentation modules",
  help_alwaysCreateEntryPointModule: "When set, TypeDoc will always create a `Module` for entry points, even if only one is provided",
  help_projectDocuments: "Documents which should be added as children to the root of the generated documentation. Supports globs to match multiple files",
  help_exclude: "Define patterns to be excluded when expanding a directory that was specified as an entry point",
  help_externalPattern: "Define patterns for files that should be considered being external",
  help_excludeExternals: "Prevent externally resolved symbols from being documented",
  help_excludeNotDocumented: "Prevent symbols that are not explicitly documented from appearing in the results",
  help_excludeNotDocumentedKinds: "Specify the type of reflections that can be removed by excludeNotDocumented",
  help_excludeInternal: "Prevent symbols that are marked with @internal from being documented",
  help_excludeCategories: "Exclude symbols within this category from the documentation",
  help_excludePrivate: "Ignore members marked with the private keyword and #private class fields, defaults to true.",
  help_excludePrivateClassFields: "Ignore #private class fields, defaults to true.",
  help_excludeProtected: "Ignore protected variables and methods",
  help_excludeReferences: "If a symbol is exported multiple times, ignore all but the first export",
  help_externalSymbolLinkMappings: "Define custom links for symbols not included in the documentation",
  help_out: "Specify the location the documentation for the default output should be written to. The default output type may be changed by plugins.",
  help_html: "Specify the location where html documentation should be written to.",
  help_json: "Specify the location and filename a JSON file describing the project is written to",
  help_pretty: "Specify whether the output JSON should be formatted with tabs",
  help_emit: "Specify what TypeDoc should emit, 'docs', 'both', or 'none'",
  help_theme: "Specify the theme name to render the documentation with",
  help_router: "Specify the router name to use to determine file names in the documentation",
  help_lightHighlightTheme: "Specify the code highlighting theme in light mode",
  help_darkHighlightTheme: "Specify the code highlighting theme in dark mode",
  help_highlightLanguages: "Specify the languages which will be loaded to highlight code when rendering",
  help_ignoredHighlightLanguages: "Specify languages which will be accepted as valid highlight languages, but will not be highlighted at runtime",
  help_typePrintWidth: "Width at which to wrap code to a new line when rendering a type",
  help_customCss: "Path to a custom CSS file to for the theme to import",
  help_customJs: "Path to a custom JS file to import",
  help_markdownItOptions: "Specify the options passed to markdown-it, the Markdown parser used by TypeDoc",
  help_markdownItLoader: "Specify a callback to be called when loading the markdown-it instance. Will be passed the instance of the parser which TypeDoc will use",
  help_maxTypeConversionDepth: "Set the maximum depth of types to be converted",
  help_name: "Set the name of the project that will be used in the header of the template",
  help_includeVersion: "Add the package version to the project name",
  help_disableSources: "Disable setting the source of a reflection when documenting it",
  help_sourceLinkTemplate: "Specify a link template to be used when generating source urls. If not set, will be automatically created using the git remote. Supports {path}, {line}, {gitRevision} placeholders",
  help_gitRevision: "Use specified revision instead of the last revision for linking to GitHub/Bitbucket source files. Has no effect if disableSources is set",
  help_gitRemote: "Use the specified remote for linking to GitHub/Bitbucket source files. Has no effect if disableGit or disableSources is set",
  help_disableGit: "Assume that all can be linked to with the sourceLinkTemplate, sourceLinkTemplate must be set if this is enabled. {path} will be rooted at basePath",
  help_displayBasePath: "Specifies the base path to be used when displaying file paths. If not specified, basePath is used.",
  help_excludeTags: "Remove the listed block/modifier tags from doc comments",
  help_notRenderedTags: "Tags which will be preserved in doc comments, but not rendered when creating output",
  help_cascadedModifierTags: "Modifier tags which should be copied to all children of the parent reflection",
  help_preservedTypeAnnotationTags: "Block tags whose type annotations should be preserved in the output.",
  help_readme: "Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page",
  help_basePath: "Specifies a path which links may be resolved relative to.",
  help_cname: "Set the CNAME file text, it's useful for custom domains on GitHub Pages",
  help_favicon: "Path to favicon to include as the site icon",
  help_sourceLinkExternal: "Specifies that source links should be treated as external links to be opened in a new tab",
  help_markdownLinkExternal: "Specifies that http[s]:// links in comments and markdown files should be treated as external links to be opened in a new tab",
  help_githubPages: "Generate a .nojekyll file to prevent 404 errors in GitHub Pages. Defaults to `true`",
  help_hostedBaseUrl: "Specify a base URL to be used in generating a sitemap.xml in our output folder and canonical links. If not specified, no sitemap will be generated",
  help_useHostedBaseUrlForAbsoluteLinks: "If set, TypeDoc will produce absolute links to pages on your site using the hostedBaseUrl option",
  help_hideGenerator: "Do not print the TypeDoc link at the end of the page",
  help_customFooterHtml: "Custom footer after the TypeDoc link",
  help_customFooterHtmlDisableWrapper: "If set, disables the wrapper element for customFooterHtml",
  help_cacheBust: "Include the generation time in links to static assets",
  help_searchInComments: "If set, the search index will also include comments. This will greatly increase the size of the search index",
  help_searchInDocuments: "If set, the search index will also include documents. This will greatly increase the size of the search index",
  help_cleanOutputDir: "If set, TypeDoc will remove the output directory before writing output",
  help_titleLink: "Set the link the title in the header points to. Defaults to the documentation homepage",
  help_navigationLinks: "Defines links to be included in the header",
  help_sidebarLinks: "Defines links to be included in the sidebar",
  help_navigationLeaves: "Branches of the navigation tree which should not be expanded",
  help_headings: "Determines which optional headings are rendered",
  help_sluggerConfiguration: "Determines how anchors within rendered HTML are determined.",
  help_navigation: "Determines how the navigation sidebar is organized",
  help_includeHierarchySummary: "If set, a reflections hierarchy summary will be rendered to a summary page. Defaults to `true`",
  help_visibilityFilters: "Specify the default visibility for builtin filters and additional filters according to modifier tags",
  help_searchCategoryBoosts: "Configure search to give a relevance boost to selected categories",
  help_searchGroupBoosts: 'Configure search to give a relevance boost to selected kinds (eg "class")',
  help_useFirstParagraphOfCommentAsSummary: "If set and no @summary tag is specified, TypeDoc will use the first paragraph of comments as the short summary in the module/namespace view",
  help_jsDocCompatibility: "Sets compatibility options for comment parsing that increase similarity with JSDoc comments",
  help_suppressCommentWarningsInDeclarationFiles: "Prevents warnings due to unspecified tags from being reported in comments within .d.ts files.",
  help_commentStyle: "Determines how TypeDoc searches for comments",
  help_useTsLinkResolution: "Use TypeScript's link resolution when determining where @link tags point. This only applies to JSDoc style comments",
  help_preserveLinkText: "If set, @link tags without link text will use the text content as the link. If not set, will use the target reflection name",
  help_blockTags: "Block tags which TypeDoc should recognize when parsing comments",
  help_inlineTags: "Inline tags which TypeDoc should recognize when parsing comments",
  help_modifierTags: "Modifier tags which TypeDoc should recognize when parsing comments",
  help_categorizeByGroup: "Specify whether categorization will be done at the group level",
  help_groupReferencesByType: "If set, references will be grouped with the type they refer to rather than in a 'References' group",
  help_defaultCategory: "Specify the default category for reflections without a category",
  help_categoryOrder: "Specify the order in which categories appear. * indicates the relative order for categories not in the list",
  help_groupOrder: "Specify the order in which groups appear. * indicates the relative order for groups not in the list",
  help_sort: "Specify the sort strategy for documented values",
  help_sortEntryPoints: "If set, entry points will be subject to the same sorting rules as other reflections",
  help_kindSortOrder: "Specify the sort order for reflections when 'kind' is specified",
  help_watch: "Watch files for changes and rebuild docs on change",
  help_preserveWatchOutput: "If set, TypeDoc will not clear the screen between compilation runs",
  help_skipErrorChecking: "Do not run TypeScript's type checking before generating docs",
  help_help: "Print this message",
  help_version: "Print TypeDoc's version",
  help_showConfig: "Print the resolved configuration and exit",
  help_plugin: "Specify the npm plugins that should be loaded. Omit to load all installed plugins",
  help_logLevel: "Specify what level of logging should be used",
  help_treatWarningsAsErrors: "If set, all warnings will be treated as errors",
  help_treatValidationWarningsAsErrors: "If set, warnings emitted during validation will be treated as errors. This option cannot be used to disable treatWarningsAsErrors for validation warnings",
  help_intentionallyNotExported: "A list of types which should not produce 'referenced but not documented' warnings",
  help_requiredToBeDocumented: "A list of reflection kinds that must be documented",
  help_packagesRequiringDocumentation: "A list of packages that must be documented",
  help_intentionallyNotDocumented: "A list of full reflection names which should not produce warnings about not being documented",
  help_validation: "Specify which validation steps TypeDoc should perform on your generated documentation",
  // ==================================================================
  // Option validation
  // ==================================================================
  unknown_option_0_you_may_have_meant_1: `Unknown option '{0}' You may have meant:
	{1}`,
  option_0_must_be_between_1_and_2: "{0} must be between {1} and {2}",
  option_0_must_be_equal_to_or_greater_than_1: "{0} must be equal to or greater than {1}",
  option_0_must_be_less_than_or_equal_to_1: "{0} must be less than or equal to {1}",
  option_0_must_be_one_of_1: "{0} must be one of {1}",
  flag_0_is_not_valid_for_1_expected_2: "The flag '{0}' is not valid for {1}, expected one of {2}",
  expected_object_with_flag_values_for_0: "Expected an object with flag values for {0} or true/false",
  flag_values_for_0_must_be_booleans: "Flag values for {0} must be a boolean",
  locales_must_be_an_object: `The 'locales' option must be set to an object which resembles: { en: { theme_implements: "Implements" }}`,
  exclude_not_documented_specified_0_valid_values_are_1: `excludeNotDocumentedKinds may only specify known values, and invalid values were provided ({0}). The valid kinds are:
{1}`,
  external_symbol_link_mappings_must_be_object: "externalSymbolLinkMappings must be a Record<package name, Record<symbol name, link>>",
  highlight_theme_0_must_be_one_of_1: "{0} must be one of the following: {1}",
  highlightLanguages_contains_invalid_languages_0: "highlightLanguages contains invalid languages: {0}, run typedoc --help for a list of supported languages",
  hostedBaseUrl_must_start_with_http: "hostedBaseUrl must start with http:// or https://",
  useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl: "The useHostedBaseUrlForAbsoluteLinks option requires that hostedBaseUrl be set",
  favicon_must_have_one_of_the_following_extensions_0: "Favicon must have one of the following extensions: {0}",
  option_0_must_be_an_object: "The '{0}' option must be a non-array object",
  option_0_must_be_an_array_of_string: "The '{0}' option must be set to an array of strings",
  option_0_must_be_an_array_of_string_or_functions: "The '{0}' option must be set to an array of strings/functions",
  option_0_must_be_a_function: "The '{0}' option must be a function",
  option_0_must_be_object_with_urls: `{0} must be an object with string labels as keys and URL values`,
  visibility_filters_only_include_0: `visibilityFilters can only include the following non-@ keys: {0}`,
  visibility_filters_must_be_booleans: `All values of visibilityFilters must be booleans`,
  option_0_values_must_be_numbers: "All values of {0} must be numbers",
  option_0_values_must_be_array_of_tags: "{0} must be an array of valid tag names",
  option_0_specified_1_but_only_2_is_valid: `{0} may only specify known values, and invalid values were provided ({1}). The valid options are:
{2}`,
  option_outputs_must_be_array: `"outputs" option must be an array of { name: string, path: string, options?: TypeDocOptions } values.`,
  specified_output_0_has_not_been_defined: `Specified output "{0}" has not been defined.`,
  // https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
  alert_note: "Note",
  alert_tip: "Tip",
  alert_important: "Important",
  alert_warning: "Warning",
  alert_caution: "Caution",
  // ReflectionKind singular translations
  kind_project: "Project",
  kind_module: "Module",
  kind_namespace: "Namespace",
  kind_enum: "Enumeration",
  kind_enum_member: "Enumeration Member",
  kind_variable: "Variable",
  kind_function: "Function",
  kind_class: "Class",
  kind_interface: "Interface",
  kind_constructor: "Constructor",
  kind_property: "Property",
  kind_method: "Method",
  kind_call_signature: "Call Signature",
  kind_index_signature: "Index Signature",
  kind_constructor_signature: "Constructor Signature",
  kind_parameter: "Parameter",
  kind_type_literal: "Type Literal",
  kind_type_parameter: "Type Parameter",
  kind_accessor: "Accessor",
  kind_get_signature: "Get Signature",
  kind_set_signature: "Set Signature",
  kind_type_alias: "Type Alias",
  kind_reference: "Reference",
  kind_document: "Document",
  // ReflectionKind plural translations
  kind_plural_project: "Projects",
  kind_plural_module: "Modules",
  kind_plural_namespace: "Namespaces",
  kind_plural_enum: "Enumerations",
  kind_plural_enum_member: "Enumeration Members",
  kind_plural_variable: "Variables",
  kind_plural_function: "Functions",
  kind_plural_class: "Classes",
  kind_plural_interface: "Interfaces",
  kind_plural_constructor: "Constructors",
  kind_plural_property: "Properties",
  kind_plural_method: "Methods",
  kind_plural_call_signature: "Call Signatures",
  kind_plural_index_signature: "Index Signatures",
  kind_plural_constructor_signature: "Constructor Signatures",
  kind_plural_parameter: "Parameters",
  kind_plural_type_literal: "Type Literals",
  kind_plural_type_parameter: "Type Parameters",
  kind_plural_accessor: "Accessors",
  kind_plural_get_signature: "Get Signatures",
  kind_plural_set_signature: "Set Signatures",
  kind_plural_type_alias: "Type Aliases",
  kind_plural_reference: "References",
  kind_plural_document: "Documents",
  // ReflectionFlag translations
  flag_private: "Private",
  flag_protected: "Protected",
  flag_public: "Public",
  flag_static: "Static",
  flag_external: "External",
  flag_optional: "Optional",
  flag_rest: "Rest",
  flag_abstract: "Abstract",
  flag_const: "Const",
  flag_readonly: "Readonly",
  flag_inherited: "Inherited",
  // ==================================================================
  // Strings that show up in the default theme
  // ==================================================================
  // Page headings/labels
  theme_implements: "Implements",
  theme_indexable: "Indexable",
  theme_type_declaration: "Type Declaration",
  theme_index: "Index",
  theme_hierarchy: "Hierarchy",
  theme_hierarchy_summary: "Hierarchy Summary",
  theme_hierarchy_view_summary: "View Summary",
  theme_implemented_by: "Implemented by",
  theme_defined_in: "Defined in",
  theme_implementation_of: "Implementation of",
  theme_inherited_from: "Inherited from",
  theme_overrides: "Overrides",
  theme_returns: "Returns",
  theme_generated_using_typedoc: "Generated using TypeDoc",
  // If this includes "TypeDoc", theme will insert a link at that location.
  // Search
  theme_preparing_search_index: "Preparing search index...",
  // Left nav bar
  theme_loading: "Loading...",
  // Right nav bar
  theme_settings: "Settings",
  theme_member_visibility: "Member Visibility",
  theme_theme: "Theme",
  theme_os: "OS",
  theme_light: "Light",
  theme_dark: "Dark",
  theme_on_this_page: "On This Page",
  // aria-label
  theme_search: "Search",
  theme_menu: "Menu",
  theme_permalink: "Permalink",
  theme_folder: "Folder",
  // Used by the frontend JS
  // For the English translations only, these should also be added to
  // src/lib/output/themes/default/assets/typedoc/Application.ts
  // Also uses theme_folder and singular kinds
  theme_copy: "Copy",
  theme_copied: "Copied!",
  theme_normally_hidden: "This member is normally hidden due to your filter settings.",
  theme_hierarchy_expand: "Expand",
  theme_hierarchy_collapse: "Collapse",
  theme_search_index_not_available: "The search index is not available",
  theme_search_no_results_found_for_0: "No results found for {0}",
  theme_search_placeholder: "Search the docs"
};

// src/lib/internationalization/locale-utils.ts
function buildIncompleteTranslation(translations2) {
  return translations2;
}

// src/lib/internationalization/locales/de.ts
var de_default = buildIncompleteTranslation({
  loaded_multiple_times_0: "TypeDoc wurde mehrfach geladen. Das wird oft von Plugins verursacht, die auch TypeDoc installiert haben. Die Pfade, von denen TypeDoc geladen wurde, sind:\n	{0}",
  unsupported_ts_version_0: "Sie verwenden eine Version von TypeScript, die nicht unterst\xFCtzt wird! St\xFCrzt TypeDoc ab, ist das der Grund. TypeDoc unterst\xFCtzt {0}",
  no_compiler_options_set: "Keine Compiler-Optionen gesetzt. Das bedeutet wahrscheinlich, dass TypeDoc die tsconfig.json nicht finden konnte. Die generierte Dokumentation wird wahrscheinlich leer sein",
  loaded_plugin_0: "Plugin {0} geladen",
  solution_not_supported_in_watch_mode: "Die angegebene tsconfig-Datei sieht nach einer Solution-Style-tsconfig aus, die nicht im Watch-Modus unterst\xFCtzt wird",
  strategy_not_supported_in_watch_mode: "entryPointStrategy muss f\xFCr den Watch-Modus entweder auf resolve oder expand gesetzt werden",
  file_0_changed_restarting: "Konfigurationsdatei {0} wurde ver\xE4ndert: Kompletter Neustart erforderlich...",
  file_0_changed_rebuilding: "Datei {0} wurde ver\xE4ndert: Baue Ausgabe neu...",
  found_0_errors_and_1_warnings: "{0} Fehler und {1} Warnungen gefunden",
  output_0_could_not_be_generated: "{0}-Ausgabe konnte aufgrund obiger Fehler nicht erstellt werden",
  output_0_generated_at_1: "{0} wurde generiert in {1}",
  no_entry_points_for_packages: "Keine Einstiegspunkte f\xFCr den packages-Modus angegeben, Dokumentation kann nicht generiert werden",
  failed_to_find_packages: "Konnte keine Packages finden, stellen Sie sicher, dass mindestens ein Verzeichnis mit einer package.json als Einstiegspunkt angegeben wurde",
  nested_packages_unsupported_0: "Projekt unter {0} hat die entryPointStrategy auf packages gesetzt, aber geschachtelte Packages werden nicht unterst\xFCtzt",
  package_option_0_should_be_specified_at_root: "Die Option packageOptions setzt die Option {0}, welche nur auf Root-Ebene eine Auswirkung hat",
  previous_error_occurred_when_reading_options_for_0: "Der vorangegangene Fehler trat auf, als die Optionen f\xFCr das Package unter {0} gelesen wurden",
  converting_project_at_0: "Konvertiere Projekt unter {0}",
  failed_to_convert_packages: "Konnte ein oder mehrere Packages nicht konvertieren, Ergebnisse werden nicht zusammengef\xFChrt",
  merging_converted_projects: "F\xFChre konvertierte Projekte zusammen",
  no_entry_points_to_merge: "Keine Einstiegspunkte zum Zusammenf\xFChren angegeben",
  entrypoint_did_not_match_files_0: "Der Glob {0} f\xFCr den Einstiegspunkt passte auf keine Dateien",
  failed_to_parse_json_0: "Konnte Datei unter {0} nicht als JSON parsen",
  failed_to_read_0_when_processing_document_tag_in_1: "Fehler beim Einlesen der Datei {0} w\xE4hrend der Verarbeitung des @document-Tags vom Kommentar in {1}",
  failed_to_read_0_when_processing_project_document: "Fehler beim Einlesen der Datei {0} w\xE4hrend des Hinzuf\xFCgens des Projekt-Dokuments",
  failed_to_read_0_when_processing_document_child_in_1: "Fehler beim Einlesen der Datei {0} w\xE4hrend der Verarbeitung der Dokument-Kindelemente in {1}",
  frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values: "Kinder der Frontmatter in {0} sollten entweder ein Array von Strings oder ein Objekt mit String-Werten sein",
  converting_union_as_interface: "Nutzung von @interface auf einem Union-Typ verwirft alle Eigenschaften, die nicht in allen Teilen der Union vorhanden sind. TypeDocs Ausgabe spiegelt m\xF6glicherweise den Quellcode nicht korrekt wider.",
  converting_0_as_class_requires_value_declaration: "Konvertierung von {0} als Klasse erfordert eine Klassen-Deklaration, die einen Wert und nicht nur einen Typ darstellt",
  converting_0_as_class_without_construct_signatures: "{0} wird als Klasse konvertiert, hat aber keine Konstruktor-Signaturen",
  comment_for_0_should_not_contain_block_or_modifier_tags: "Das Kommentar f\xFCr {0} sollte keine Block- oder Modifier-Tags enthalten",
  symbol_0_has_multiple_declarations_with_comment: "{0} hat mehrere Deklarationen mit Kommentaren. Ein beliebiges Kommentar wird verwendet werden",
  comments_for_0_are_declared_at_1: "Die Kommentare f\xFCr {0} sind deklariert in:\n	{1}",
  // comments/parser.ts
  multiple_type_parameters_on_template_tag_unsupported: "TypeDoc unterst\xFCtzt mehrfache Typenparameter nicht, wenn diese in einem einzelnen @template-Tag mit Kommentar definiert sind",
  failed_to_find_jsdoc_tag_for_name_0: "Konnte JSDoc-Tag f\xFCr {0} nach dem Parsen der Kommentare nicht finden, bitte erstellen Sie einen Bug-Report",
  relative_path_0_is_not_a_file_and_will_not_be_copied_to_output: "Der relative Pfad {0} ist keine Datei und wird daher nicht mit in das Ausgabeverzeichnis kopiert",
  inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0: "Inline-@inheritDoc-Tag sollte nicht innerhalb eines Block-Tags verwendet werden. Solche Tags im Kommentar unter {0} k\xF6nnen nicht verarbeitet werden",
  at_most_one_remarks_tag_expected_in_comment_at_0: "H\xF6chstens ein @remarks-Tag darf in einem Kommentar verwendet werden. Alle au\xDFer dem ersten Tag im Kommentar unter {0} werden ignoriert",
  at_most_one_returns_tag_expected_in_comment_at_0: "H\xF6chstens ein @returns-Tag darf in einem Kommentar verwendet werden. Alle au\xDFer dem ersten Tag im Kommentar unter {0} werden ignoriert",
  at_most_one_inheritdoc_tag_expected_in_comment_at_0: "H\xF6chstens ein @inheritDoc-Tag darf in einem Kommentar verwendet werden. Alle au\xDFer dem ersten Tag im Kommentar unter {0} werden ignoriert",
  content_in_summary_overwritten_by_inheritdoc_in_comment_at_0: "Inhalt in der Zusammenfassung des Kommentars unter {0} wird vom @inheritDoc-Tag \xFCberschrieben werden",
  content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0: "Inhalt im @remarks-Block des Kommentars unter {0} wird vom @inheritDoc-Tag \xFCberschrieben werden",
  example_tag_literal_name: "Die erste Zeile eines @example-Tags wird wortw\xF6rtlich als Name des Beispiels interpretiert und sollte nur Text enthalten",
  inheritdoc_tag_properly_capitalized: "Der @inheritDoc-Tag sollte korrekte Gro\xDF- und Kleinschreibung verwenden",
  treating_unrecognized_tag_0_as_modifier: "Behandle unerkannten Tag {0} als Modifier-Tag",
  unmatched_closing_brace: "Nicht \xFCbereinstimmende schlie\xDFende Klammern",
  unescaped_open_brace_without_inline_tag: "Unmaskierte \xF6ffnende Klammer ohne Inline-Tag vorgefunden",
  unknown_block_tag_0: "Unbekannter Block-Tag {0} vorgefunden",
  unknown_inline_tag_0: "Unbekannter Inline-Tag {0} vorgefunden",
  open_brace_within_inline_tag: "\xD6ffnende Klammer innerhalb eines Inline-Tags vorgefunden, das ist wahrscheinlich ein Fehler",
  inline_tag_not_closed: "Inline-Tag wurde nicht geschlossen",
  // validation
  failed_to_resolve_link_to_0_in_comment_for_1: `Konnte Link zu "{0}" im Kommentar f\xFCr {1} nicht aufl\xF6sen`,
  failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2: `Konnte Link zu "{0}" im Kommentar f\xFCr {1} nicht aufl\xF6sen. Meinten Sie vielleicht "{2}"`,
  failed_to_resolve_link_to_0_in_readme_for_1: `Konnte Link zu "{0}" in Readme f\xFCr {1} nicht aufl\xF6sen`,
  failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2: `Konnte Link zu "{0}" in Readme f\xFCr {1} nicht aufl\xF6sen. Meinten Sie vielleicht "{2}"`,
  failed_to_resolve_link_to_0_in_document_1: `Konnte Link zu "{0}" im Dokument {1} nicht aufl\xF6sen`,
  failed_to_resolve_link_to_0_in_document_1_may_have_meant_2: `Konnte Link zu "{0}" im Dokument {1} nicht aufl\xF6sen. Meinten Sie vielleicht "{2}"`,
  type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: "{0}, definiert in {1}, wird referenziert von {2}, ist aber nicht in der Dokumentation enthalten",
  reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: "{0} ({1}), definiert in {2}, hat keinerlei Dokumentation",
  invalid_intentionally_not_documented_names_0: "Die folgenden qualifizierten Reflection-Namen wurden absichtlich als undokumentiert markiert, wurden aber entweder in der Dokumentation nicht referenziert oder werden dokumentiert:\n	{0}",
  invalid_intentionally_not_exported_symbols_0: "Die folgenden Symbole wurden absichtlich als nicht exportiert markiert, wurden aber entweder in der Dokumentation nicht referenziert oder werden dokumentiert:\n	{0}",
  reflection_0_has_unused_mergeModuleWith_tag: "{0} hat einen @mergeModuleWith-Tag, der nicht aufgel\xF6st werden konnte",
  reflection_0_links_to_1_with_text_2_but_resolved_to_3: `"{0}" verlinkt auf "{1}" mit Text "{2}", welcher zwar existiert, aber keinen Link in der Dokumentation hat. Verlinke stattdessen auf "{3}"`,
  // conversion plugins
  not_all_search_category_boosts_used_0: "Nicht alle in searchCategoryBoosts angegebenen Kategorien werden in der Dokumentation verwendet. Die unbenutzten Kategorien sind:\n	{0}",
  not_all_search_group_boosts_used_0: "Nicht alle in searchGroupBoosts angegebenen Gruppen werden in der Dokumentation verwendet. Die unbenutzten Gruppen sind:\n	{0}",
  comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group: `Kommentar f\xFCr {0} enth\xE4lt @categoryDescription f\xFCr "{1}", aber kein Kind wurde in dieser Kategorie platziert`,
  comment_for_0_includes_groupDescription_for_1_but_no_child_in_group: `Kommentar f\xFCr {0} enth\xE4lt @groupDescription f\xFCr "{1}", aber kein Kind wurde in dieser Gruppe platziert`,
  label_0_for_1_cannot_be_referenced: `Das Label "{0}" f\xFCr {1} kann nicht mit einer Deklarationsreferenz referenziert werden. Labels d\xFCrfen nur A-Z, 0-9 sowie _ enthalten und d\xFCrfen nicht mit einer Ziffer beginnen`,
  modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2: "Der Modifier-Tag {0} darf nicht gleichzeitig mit {1} verwendet werden im Kommentar f\xFCr {2}",
  signature_0_has_unused_param_with_name_1: `Die Signatur {0} enth\xE4lt einen @param mit Namen "{1}", der nicht verwendet wird`,
  declaration_reference_in_inheritdoc_for_0_not_fully_parsed: "Deklarationsreferenz in @inheritDoc f\xFCr {0} wurde nicht vollst\xE4ndig geparst und wird m\xF6glicherweise falsch aufgel\xF6st werden",
  failed_to_find_0_to_inherit_comment_from_in_1: `Konnte "{0}" zum Erben des Kommentars nicht finden. Betrifft Kommentar f\xFCr {1}`,
  reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: "{0} hat versucht, ein Kommentar von {1} mit @inheritDoc zu kopieren, aber die Quelle hat kein zugeh\xF6riges Kommentar",
  inheritdoc_circular_inheritance_chain_0: "@inheritDoc spezifiziert eine zyklische Vererbungskette: {0}",
  provided_readme_at_0_could_not_be_read: "Angegebener README-Pfad {0} konnte nicht gelesen werden",
  defaulting_project_name: 'Die Option --name wurde nicht angegeben und kein package.json wurde gefunden. Verwende "Dokumentation" als R\xFCckfallwert f\xFCr den Projektnamen',
  disable_git_set_but_not_source_link_template: "disableGit wurde gesetzt, aber sourceLinkTemplate nicht, sodass Links auf die Quellcode-Dateien nicht erstellt werden k\xF6nnen. Setzen Sie sourceLinkTemplate oder disableSources, um das Ermitteln der Quellcode-Dateien zu deaktivieren",
  disable_git_set_and_git_revision_used: "disableGit wurde gesetzt und sourceLinkTemplate enth\xE4lt {gitRevision}, was mit dem Leerstring ersetzt wird, da keine Revision angegeben wurde",
  git_remote_0_not_valid: `Das angegebene Git-Remote "{0}" war nicht g\xFCltig. Links auf Quellcode-Dateien werden nicht funktionieren`,
  reflection_0_tried_to_merge_into_child_1: "Die Reflection {0} versuchte mittels @mergeModuleWith, sich in eines ihrer Kinder einzuf\xFCgen: {1}",
  include_0_in_1_specified_2_resolved_to_3_does_not_exist: `{0}-Tag im Kommentar f\xFCr {1} gab "{2}" zum Einbinden an, was zu "{3}" aufgel\xF6st wurde und nicht existiert oder keine Datei ist.`,
  include_0_in_1_specified_2_circular_include_3: `{0}-Tag im Kommentar f\xFCr {1} gab "{2}" zum Einbinden an, was in einer zyklischen Einbindung resultierte:
	{3}`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_not_found: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber die Region wurde nicht in der Datei gefunden.`,
  include_0_tag_in_1_region_2_region_not_supported: `{0}-Tag in {1} gab "{2}" an, aber Regionen werden f\xFCr die Dateierweiterung nicht unterst\xFCtzt.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_close_not_found: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum Schlie\xDFen der Region wurde nicht in der Datei gefunden.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_open_not_found: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum \xD6ffnen einer Region wurde nicht in der Datei gefunden.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_close_found_multiple_times: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum Schlie\xDFen der Region wurde mehrfach in der Datei gefunden.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_open_found_multiple_times: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum \xD6ffnen der Region wurde mehrfach in der Datei gefunden.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_found_multiple_times: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber die Region wurde mehrfach in der Datei gefunden.`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_empty: `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an. Die Region wurde gefunden, ist aber leer oder enth\xE4lt nur Leerzeichen.`,
  include_0_tag_in_1_specified_2_file_3_lines_4_invalid_range: `{0}-Tag in {1} gab "{2}" zum Einbinden der Zeilen {4} aus Datei "{3}" an, aber ein ung\xFCltiges Intervall wurde angegeben.`,
  include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines: `{0}-Tag in {1} gab "{2}" zum Einbinden der Zeilen {4} aus Datei "{3}" an, aber die Datei hat nur {5} Zeilen.`,
  // output plugins
  custom_css_file_0_does_not_exist: "Eigene CSS-Datei unter {0} existiert nicht",
  custom_js_file_0_does_not_exist: "Eigene JavaScript-Datei unter {0} existiert nicht",
  unsupported_highlight_language_0_not_highlighted_in_comment_for_1: "Sprache {0} unterst\xFCtzt keine Syntaxhervorhebung und wird im Kommentar {1} nicht hervorgehoben",
  unloaded_language_0_not_highlighted_in_comment_for_1: "Code-Block mit Sprache {0} wird keine Syntaxhervorhebung im Kommentar f\xFCr {1} erfahren, da diese Sprache nicht in der Option highlightLanguages enthalten ist",
  yaml_frontmatter_not_an_object: "Erwartete ein Objekt f\xFCr die YAML-Frontmatter",
  // renderer
  could_not_write_0: "{0} konnte nicht geschrieben werden",
  could_not_empty_output_directory_0: "Ausgabeverzeichnis {0} konnte nicht geleert werden",
  could_not_create_output_directory_0: "Konnte das Ausgabeverzeichnis {0} nicht erstellen",
  theme_0_is_not_defined_available_are_1: `Das Theme '{0}' ist nicht definiert. Verf\xFCgbare Themes sind: {1}`,
  router_0_is_not_defined_available_are_1: `Der Router '{0}' ist nicht definiert. Verf\xFCgbare Router sind: {1}`,
  reflection_0_links_to_1_but_anchor_does_not_exist_try_2: "{0} verlinkt auf {1}, aber der Anker existiert nicht. Meinten Sie vielleicht:\n	{2}",
  // entry points
  no_entry_points_provided: "Einstiegspunkte wurden weder angegeben noch konnten sie aus den package.json-Exports ermittelt werden. Das ist wahrscheinlich eine Fehlerkonfiguration",
  unable_to_find_any_entry_points: "Konnte keine Einstiegspunkte finden. Beachte auch die vorigen Warnmeldungen",
  watch_does_not_support_packages_mode: "Watch-Modus unterst\xFCtzt Einstiegspunkte der Art 'packages' nicht",
  watch_does_not_support_merge_mode: "Watch-Modus unterst\xFCtzt Einstiegspunkte der Art 'merge' nicht",
  entry_point_0_not_in_program: `Der Einstiegspunkt {0} wird nicht von der Option 'files' oder 'include' in der tsconfig referenziert`,
  failed_to_resolve_0_to_ts_path: "Konnte den Einstiegspunktpfad {0} der package.json nicht zu einer TypeScript-Quellcode-Datei aufl\xF6sen",
  use_expand_or_glob_for_files_in_dir: 'Falls Sie Dateien aus diesem Verzeichnis einbinden wollten, setzen Sie die --entryPointStrategy auf "expand" oder geben Sie einen Glob an',
  glob_0_did_not_match_any_files: "Der Glob {0} passte auf keine Dateien",
  entry_point_0_did_not_match_any_files_after_exclude: "Der Glob {0} passte auf keine Dateien mehr, nachdem die Exclude-Patterns angewandt wurden",
  entry_point_0_did_not_exist: "Angegebener Einstiegspunkt {0} existiert nicht",
  entry_point_0_did_not_match_any_packages: "Der Einstiegspunkt-Glob {0} passte auf keine Verzeichnisse mit einer package.json-Datei",
  file_0_not_an_object: "Die Datei {0} ist kein Objekt",
  // deserialization
  serialized_project_referenced_0_not_part_of_project: "Serialisiertes Projekt referenziert Reflection {0}, welche kein Teil des Projekts ist",
  saved_relative_path_0_resolved_from_1_does_not_exist: "Serialisiertes Projekt referenziert {0}, was relativ zu {1} nicht existiert",
  // options
  circular_reference_extends_0: `Zyklische Referenz im "extends"-Feld von {0} gefunden`,
  failed_resolve_0_to_file_in_1: "Konnte {0} in {1} nicht zu einer Datei aufl\xF6sen",
  glob_0_should_use_posix_slash: `Der Glob "{0}" maskiert nichtspezielle Zeichen. Glob-Eingaben f\xFCr TypeDoc d\xFCrfen keine Windows-Pfadtrennzeichen (\\) verwenden, nutzen Sie stattdessen Posix-Pfadtrennzeichen (/)`,
  option_0_can_only_be_specified_by_config_file: `Die Option '{0}' darf nur in einer Konfigurationsdatei angegeben werden`,
  option_0_expected_a_value_but_none_provided: "--{0} erwartet einen Wert, aber keiner wurde als Argument \xFCbergeben",
  unknown_option_0_may_have_meant_1: "Unbekannte Option: {0}, meinten Sie vielleicht:\n	{1}",
  typedoc_key_in_0_ignored: `Das Feld 'typedoc' in {0} wurde von der entryPointStrategy "legacy-packages" verwendet und wird ignoriert`,
  typedoc_options_must_be_object_in_0: `Konnte das Feld "typedocOptions" in {0} nicht parsen, stellen Sie sicher, dass es existiert und ein Objekt enth\xE4lt`,
  tsconfig_file_0_does_not_exist: "Die tsconfig-Datei {0} existiert nicht",
  tsconfig_file_specifies_options_file: `"typedocOptions" in der tsconfig-Datei gibt eine einzulesende Datei mit Optionen an, aber die Optionsdatei wurde schon eingelesen. Das ist wahrscheinlich ein Konfigurationsfehler`,
  tsconfig_file_specifies_tsconfig_file: `"typedocOptions" in der tsconfig-Datei darf keine tsconfig-Datei zum Einlesen angeben`,
  tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: "Die {0} aus der typedoc.json werden durch die Konfiguration in der tsdoc.json \xFCberschrieben",
  failed_read_tsdoc_json_0: "Konnte tsdoc.json-Datei unter {0} nicht lesen",
  invalid_tsdoc_json_0: "Die Datei {0} ist keine g\xFCltige tsdoc.json-Datei",
  options_file_0_does_not_exist: "Die Optionsdatei {0} existiert nicht",
  failed_read_options_file_0: "Konnte {0} nicht parsen, stellen Sie sicher, dass die Datei existiert und ein Objekt exportiert",
  // plugins
  invalid_plugin_0_missing_load_function: "Ung\xFCltige Struktur im Plugin {0}, keine load-Funktion gefunden",
  plugin_0_could_not_be_loaded: "Das Plugin {0} konnte nicht geladen werden",
  // option declarations help
  help_options: "JSON-Datei mit Optionen, die geladen werden soll. Ist keine angegeben, schaut TypeDoc nach einer 'typedoc.json' im aktuellen Verzeichnis",
  help_tsconfig: "TypeScript-Konfigurationsdatei, die geladen werden soll. Ist keine angegeben, schaut TypeDoc nach einer 'tsconfig.json' im aktuellen Verzeichnis",
  help_compilerOptions: "Ausgew\xE4hlte TypeScript-Compiler-Optionen \xFCberschreiben, die von TypeDoc genutzt werden",
  help_lang: "Setzt die Sprache f\xFCr die generierte Dokumentation und f\xFCr die von TypeDoc ausgegebenen Meldungen",
  help_locales: "F\xFCgt \xDCbersetzungen f\xFCr eine bestimmte Sprache hinzu. Die Option ist haupts\xE4chlich als \xDCberbr\xFCckung gedacht, bis TypeDoc die Sprache offiziell unterst\xFCtzt",
  help_packageOptions: "Setzt Optionen, die innerhalb jedes Packages verwendet werden, falls die entryPointStrategy auf packages gesetzt ist",
  help_entryPoints: "Die Einstiegspunkte der Dokumentation",
  help_entryPointStrategy: "Die zu nutzende Strategie, um die Einstiegspunkte in Dokumentationsmodule umzuwandeln",
  help_alwaysCreateEntryPointModule: "Falls gesetzt, erstellt TypeDoc immer ein `Modul` f\xFCr Einstiegspunkte, selbst wenn nur eins angegeben wurde",
  help_projectDocuments: "Dokumente, die als Kinder zur Root-Ebene der generierten Dokumentation hinzugef\xFCgt werden sollen. Unterst\xFCtzt Globs, um mehrere Dateien zu selektieren",
  help_exclude: "Patterns zum Ausschlie\xDFen von Dateien, wenn nach Dateien in einem Verzeichnis gesucht wird, das als Einstiegspunkt angegeben wurde",
  help_externalPattern: "Patterns f\xFCr Dateien, die als extern betrachtet werden sollen",
  help_excludeExternals: "Verhindert die Dokumentation von als extern aufgel\xF6sten Symbolen",
  help_excludeNotDocumented: "Verhindert, dass Symbole in der Dokumentation erscheinen, die nicht explizit dokumentiert wurden",
  help_excludeNotDocumentedKinds: "Arten von Reflections, die von excludeNotDocumented entfernt werden k\xF6nnen",
  help_excludeInternal: "Verhindert, dass Symbole in der Dokumentation erscheinen, die mit @internal markiert sind",
  help_excludeCategories: "Schlie\xDFt Symbole aus dieser Kategorie von der Dokumentation aus",
  help_excludeProtected: "Ignoriert gesch\xFCtzte Variablen und Methoden",
  help_excludeReferences: "Wird ein Symbol mehrfach exportiert, ignoriere alle au\xDFer dem ersten Export",
  help_externalSymbolLinkMappings: "Definiert eigene Links f\xFCr Symbole, die nicht in der Dokumentation enthalten sind",
  help_out: "Gibt den Pfad an, wohin die Dokumentation f\xFCr die Default-Ausgabe geschrieben werden soll. Der Standard-Ausgabetyp kann von Plugins ge\xE4ndert werden.",
  help_html: "Gibt den Pfad an, wohin die HTML-Dokumentation geschrieben werden soll.",
  help_json: "Gibt den Pfad und den Dateinamen an, wohin eine JSON-Datei mit einer Beschreibung des Projekts geschrieben werden soll",
  help_pretty: "Gibt an, ob die JSON-Datei mit Tabs formatiert werden soll",
  help_emit: "Gibt an, was TypeDoc ausgeben soll, 'docs', 'both', oder 'none'",
  help_theme: "Gibt den Namen des Themes an, mit dem die Dokumentation erstellt werden soll",
  help_router: "Gibt den Namen des Routers an, der zum Ermitteln der Dateinamen in der Dokumentation verwendet wird",
  help_lightHighlightTheme: "Gibt das Theme f\xFCr die Syntaxhervorhebung im Light-Modus an",
  help_darkHighlightTheme: "Gibt das Theme f\xFCr die Syntaxhervorhebung im Dark-Modus an",
  help_highlightLanguages: "Gibt die Sprachen an, die geladen werden sollen, um Code bei der Ausgabe hervorzuheben",
  help_ignoredHighlightLanguages: "Gibt Sprachen an, welche als g\xFCltige Sprache f\xFCr die Syntaxhervorhebung erkannt werden, aber zur Laufzeit nicht hervorgehoben werden",
  help_typePrintWidth: "Breite beim Rendern eines Typs, ab der Code in eine neue Zeile umgebrochen wird",
  help_customCss: "Pfad auf eine eigene CSS-Datei, die zus\xE4tzlich zum Theme importiert wird",
  help_customJs: "Pfade auf eine eigene einzubindende JavaScript-Datei",
  help_markdownItOptions: "Gibt Optionen an, die zu markdown-it weitergereicht werden, dem von TypeDoc verwendeten Markdown-Parser",
  help_markdownItLoader: "Gibt ein Callback an, das beim Laden der markdown-it-Instanz gerufen wird. Dem Callback wird die Instanz des Parsers \xFCbergeben, den TypeDoc verwenden wird",
  help_maxTypeConversionDepth: "Setzt die maximale Tiefe von Typen, bis zu der diese konvertiert werden",
  help_name: "Setzt den Namen des Projekts, der im Header des Templates verwendet wird",
  help_includeVersion: "F\xFCgt die Package-Version zum Projektnamen hinzu",
  help_disableSources: "Deaktiviert das Setzen der Quelle, wenn eine Reflection dokumentiert wird",
  help_sourceLinkTemplate: "Gibt ein Link-Template an, das beim Generieren von Quelldatei-URLs verwendet wird. Wenn nicht gesetzt, wird automatisch ein Template vom Git-Remote erstellt. Unterst\xFCtzt die Platzhalter {path}, {line} und {gitRevision}",
  help_gitRevision: "Nutzt die angegebene Revision statt der neuesten Revision zum Verlinken der Quellcode-Dateien auf GitHub/Bitbucket. Hat keinen Effekt, wenn disableSources gesetzt ist",
  help_gitRemote: "Nutzt das angegebene Remote zum Verlinken von Quellcode-Dateien auf GitHub/Bitbucket. Hat keinen Effekt, wenn disableGit oder disableSources gesetzt ist",
  help_disableGit: "Gehe davon aus, dass auf alles mit dem sourceLinkTemplate verlinkt werden kann, sourceLinkTemplate muss gesetzt sein, falls die Option aktiviert ist. Der Platzhalter {path} ist dann relativ zum basePath",
  help_basePath: "Gibt den Basispfad an, der beim Anzeigen von Dateipfaden verwendet wird",
  help_excludeTags: "Entfernt die angegebenen Block- und Modifier-Tags von den Doc-Kommentaren",
  help_notRenderedTags: "Tags, die in den Doc-Kommentaren bewahrt werden, aber in der Dokumentation nicht angezeigt werden sollen",
  help_cascadedModifierTags: "Modifier-Tags, die in alle Kinder einer Eltern-Reflection kopiert werden sollen",
  help_readme: "Pfad auf die Readme-Datei, die auf der Indexseite angezeigt werden soll. `none`, um die Indexseite zu deaktivieren und die Dokumentation auf der Seite mit den globalen Variablen beginnen zu lassen",
  help_cname: "Setzt den CNAME-Dateitext, n\xFCtzlich f\xFCr eigene Domains bei GitHub-Pages",
  help_favicon: "Pfad auf ein Favicon, welches als Icon f\xFCr die Seite eingebunden werden soll",
  help_sourceLinkExternal: "Gibt an, dass Quelldatei-Links als externe Links behandelt und in einem neuen Tab ge\xF6ffnet werden sollen",
  help_markdownLinkExternal: "Gibt an, dass http[s]://-Links in Kommentaren und Markdown-Dateien als externe Links behandelt und in einem neuen Tab ge\xF6ffnet werden sollen",
  help_githubPages: "Erzeugt eine .nojekyll-Datei, um 404-Fehler bei GitHub-Pages zu vermeiden. Standardwert ist `true`",
  help_hostedBaseUrl: "Gibt die Basis-URL an, die beim Erzeugen einer sitemap.xml im Ausgabeverzeichnis und f\xFCr kanonische Links verwendet wird. Wenn nicht angegeben, wird keine Sitemap erzeugt",
  help_useHostedBaseUrlForAbsoluteLinks: "Wenn gesetzt, erzeugt TypeDoc unter Verwendung der Option hostedBaseUrl absolute Links auf Unterseiten der Seite",
  help_hideGenerator: "Gibt den TypeDoc-Link am Ende der Seite nicht aus",
  help_customFooterHtml: "Eigener Footer nach dem TypeDoc-Link",
  help_customFooterHtmlDisableWrapper: "Wenn gesetzt, wird das Wrapper-Element um customFooterHtml nicht ausgegeben",
  help_cacheBust: "Zeitpunkt der Erstellung der Dokumentation in Links auf statische Assets inkludieren",
  help_searchInComments: "Wenn gesetzt, wird der Suchindex auch Kommentare enthalten. Dies wird die Gr\xF6\xDFe des Suchindex stark erh\xF6hen",
  help_searchInDocuments: "Wenn gesetzt, wird der Suchindex auch Dokumente enthalten. Dies wird die Gr\xF6\xDFe des Suchindex stark erh\xF6hen",
  help_cleanOutputDir: "Wenn gesetzt, l\xF6scht TypeDoc das Ausgabeverzeichnis vor dem Schreiben der Dokumentation",
  help_titleLink: "Setzt den Link des Titels im Header. Standardm\xE4\xDFig wird auf die Startseite der Dokumentation verlinkt",
  help_navigationLinks: "Gibt Links an, die mit in den Header geschrieben werden",
  help_sidebarLinks: "Gibt Links an, die mit in die Seitenleiste geschrieben werden",
  help_navigationLeaves: "Zweige des Navigationsbaums, die nicht ausgeklappt sein sollen",
  help_headings: "Legt fest, welche optionalen \xDCberschriften ausgegeben werden sollen",
  help_sluggerConfiguration: "Legt fest, wie Anker im generierten HTML festgelegt werden.",
  help_navigation: "Legt fest, wie die Navigationsseitenleiste organisiert wird",
  help_includeHierarchySummary: "Wenn gesetzt, wird eine \xDCbersicht der Reflection-Hierarchie auf der Zusammenfassungsseite ausgegeben. Standardwert ist `true`",
  help_visibilityFilters: "Gibt die standardm\xE4\xDFige Sichtbarkeit f\xFCr eingebaute Filter sowie zus\xE4tzliche Filter anhand eines Modifier-Tags an.",
  help_searchCategoryBoosts: "Konfiguriert die Suche so, dass ausgew\xE4hlte Kategorien als relevanter bewertet werden",
  help_searchGroupBoosts: 'Konfiguriert die Suche so, dass ausgew\xE4hlte Symbolarten (z.B. "Klasse") als relevanter bewertet werden',
  help_useFirstParagraphOfCommentAsSummary: "Wenn gesetzt und kein @summary-Tag vorhanden ist, verwendet TypeDoc den ersten Absatz eines Kommentars als die Kurzzusammenfassung in der Modul- oder Namensraum-Ansicht",
  help_jsDocCompatibility: "Setzt Kompatibilit\xE4tsoptionen beim Parsen von Kommentaren, welche die \xC4hnlichkeit zu JSDoc-Kommentaren erh\xF6hen",
  help_suppressCommentWarningsInDeclarationFiles: "Verhindert, dass Warnungen gemeldet werden, die durch unspezifizierte Tags innerhalb von Kommentaren in .d.ts-Dateien verursacht wurden.",
  help_commentStyle: "Legt fest, wie TypeDoc nach Kommentaren sucht",
  help_useTsLinkResolution: "Verwendet TypeScripts Mechanismus zur Aufl\xF6sung von Links beim Ermitteln des Ziels eines @link-Tags. Betrifft nur Kommentare im JSDoc-Stil",
  help_preserveLinkText: "Wenn gesetzt, wird bei @link-Tags ohne expliziten Link-Text der Textinhalt als Link verwendet. Wenn nicht gesetzt, wird der Name der Ziel-Reflection verwendet",
  help_blockTags: "Block-Tags, die TypeDoc beim Parsen von Kommentaren erkennen soll",
  help_inlineTags: "Inline-Tags, die TypeDoc beim Parsen von Kommentaren erkennen soll",
  help_modifierTags: "Modifier-Tags, die TypeDoc beim Parsen von Kommentaren erkennen soll",
  help_categorizeByGroup: "Gibt an, ob die Kategorisierung auf der Gruppen-Ebene vorgenommen werden soll",
  help_groupReferencesByType: "Wenn gesetzt, werden Referenzen zusammen mit dem Typ, auf den sie verweisen, gruppiert und nicht innerhalb einer 'Referenzen'-Gruppe",
  help_defaultCategory: "Gibt die Standard-Kategorie f\xFCr Reflections ohne eine Kategorie an",
  help_categoryOrder: "Gibt die Reihenfolge an, in der Kategorien erscheinen. * legt die relative Reihenfolge f\xFCr Kategorien fest, die nicht in der Liste sind",
  help_groupOrder: "Gibt die Reihenfolge an, in der Gruppen erscheinen. * legt die relative Reihenfolge f\xFCr Gruppen fest, die nicht in der Liste sind",
  help_sort: "Gibt die Sortierstrategie f\xFCr dokumentierte Werte an",
  help_sortEntryPoints: "Wenn gesetzt, werden auf Einstiegspunkte die gleichen Sortierregeln angewandt, die auch f\xFCr andere Reflections gelten",
  help_kindSortOrder: "Gibt die Sortierreihenfolge f\xFCr Reflections an, wenn ein 'kind' festgelegt ist",
  help_watch: "\xDCberwache Dateien auf \xC4nderungen und baue die Dokumentation bei \xC4nderungen neu",
  help_preserveWatchOutput: "Wenn gesetzt, leert TypeDoc den Bildschirm nicht zwischen Kompilierungsschritten",
  help_skipErrorChecking: "F\xFChrt die Typenpr\xFCfung von TypeScript nicht vor Erzeugung der Dokumentation aus",
  help_help: "Gibt diese Nachricht aus",
  help_version: "Gibt die Version von TypeDoc aus",
  help_showConfig: "Gibt die aufgel\xF6ste Konfiguration aus und stoppt",
  help_plugin: "Gibt die NPM-Plugins an, die geladen werden sollen. Nicht angeben, um alle installierten Plugins zu laden",
  help_logLevel: "Gibt an, welches Level f\xFCr das Logging verwendet werden soll",
  help_treatWarningsAsErrors: "Wenn gesetzt, werden alle Warnungen als Fehler behandelt",
  help_treatValidationWarningsAsErrors: "Wenn gesetzt, werden alle Warnungen, die w\xE4hrend der Validierung erzeugt wurden, als Fehler behandelt. Diese Option kann nicht zum Deaktivieren von treatWarningsAsErrors f\xFCr Validierungswarnungen verwendet werden",
  help_intentionallyNotExported: "Eine Liste von Typen, welche keine Warnungen der Art 'referenziert, aber nicht dokumentiert' erzeugen sollen",
  help_requiredToBeDocumented: "Eine Liste von Reflection-Arten, die dokumentiert werden m\xFCssen",
  help_packagesRequiringDocumentation: "Eine Liste von Packages, die dokumentiert werden m\xFCssen",
  help_intentionallyNotDocumented: "Eine Liste von vollst\xE4ndigen Reflection-Namen, welche keine Warnungen erzeugen sollen, wenn sie nicht dokumentiert sind",
  help_validation: "Gibt an, welche Validierungsschritte TypeDoc auf die erzeugte Dokumentation anwenden soll",
  // ==================================================================
  // Option validation
  // ==================================================================
  unknown_option_0_you_may_have_meant_1: `Unbekannte Option '{0}'. Meinten Sie vielleicht:
	{1}`,
  option_0_must_be_between_1_and_2: "{0} muss zwischen {1} und {2} liegen",
  option_0_must_be_equal_to_or_greater_than_1: "{0} muss gr\xF6\xDFer oder gleich {1} sein",
  option_0_must_be_less_than_or_equal_to_1: "{0} muss kleiner oder gleich {1} sein",
  option_0_must_be_one_of_1: "{0} muss enthalten sein in {1}",
  flag_0_is_not_valid_for_1_expected_2: "Das Flag '{0}' ist nicht g\xFCltig f\xFCr {1}, erwartet wird {2}",
  expected_object_with_flag_values_for_0: "Erwartet f\xFCr {0} wird entweder true/false oder ein Objekt mit Flag-Werten",
  flag_values_for_0_must_be_booleans: "Flag-Werte f\xFCr {0} m\xFCssen Wahrheitswerte sein",
  locales_must_be_an_object: `Die Option 'locales' muss auf ein Objekt der folgenden Form gesetzt werden: { en: { theme_implements: "Implements" }}`,
  exclude_not_documented_specified_0_valid_values_are_1: "excludeNotDocumentedKinds erlaubt nur bekannte Werte, und ung\xFCltige Werte wurden angegeben ({0}). Die g\xFCltigen Arten sind:\n{1}",
  external_symbol_link_mappings_must_be_object: "externalSymbolLinkMappings muss vom Typ Record<package name, Record<symbol name, link>> sein",
  highlight_theme_0_must_be_one_of_1: "{0} muss einer der folgenden Werte sein: {1}",
  highlightLanguages_contains_invalid_languages_0: "highlightLanguages enth\xE4lt ung\xFCltige Sprachen: {0}, f\xFChren Sie typedoc --help aus, um eine Liste unterst\xFCtzter Sprachen zu erhalten",
  hostedBaseUrl_must_start_with_http: "hostedBaseUrl muss mit http:// oder https:// anfangen",
  useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl: "Die Option useHostedBaseUrlForAbsoluteLinks erfordert, dass auch hostedBaseUrl gesetzt wird",
  favicon_must_have_one_of_the_following_extensions_0: "Favicon muss eine der folgenden Dateiendungen haben: {0}",
  option_0_must_be_an_object: "Die Option '{0}' muss ein Objekt (kein Array) sein",
  option_0_must_be_a_function: "Die Option '{0}' muss eine Funktion sein",
  option_0_must_be_object_with_urls: "{0} muss ein Objekt sein, mit String-Labels als Schl\xFCssel und URLs als Werte",
  visibility_filters_only_include_0: "visibilityFilters darf nur die folgenden nicht-@-Schl\xFCssel enthalten: {0}",
  visibility_filters_must_be_booleans: "Alle Werte von visibilityFilters m\xFCssen Wahrheitswerte sein",
  option_0_values_must_be_numbers: "Alle Werte von {0} m\xFCssen Zahlen sein",
  option_0_values_must_be_array_of_tags: "{0} muss ein Array mit g\xFCltigen Tag-Namen sein",
  option_0_specified_1_but_only_2_is_valid: "{0} erlaubt nur bekannte Werte, und ung\xFCltige Werte wurden angegeben ({1}). Die g\xFCltigen Sortierungsstrategien sind:\n{2}",
  option_outputs_must_be_array: `Option "outputs" muss ein Array aus Elementen vom Typ { name: string, path: string, options?: TypeDocOptions } sein.`,
  specified_output_0_has_not_been_defined: `Angegebene Ausgabe "{0}" wurde nicht definiert.`,
  // https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
  alert_note: "Hinweis",
  alert_tip: "Tipp",
  alert_important: "Wichtig",
  alert_warning: "Warnung",
  alert_caution: "Achtung",
  // ReflectionKind singular translations
  kind_project: "Projekt",
  kind_module: "Modul",
  kind_namespace: "Namensraum",
  kind_enum: "Aufz\xE4hlung",
  kind_enum_member: "Aufz\xE4hlungselement",
  kind_variable: "Variable",
  kind_function: "Funktion",
  kind_class: "Klasse",
  kind_interface: "Schnittstelle",
  kind_constructor: "Konstruktor",
  kind_property: "Eigenschaft",
  kind_method: "Methode",
  kind_call_signature: "Aufrufsignatur",
  kind_index_signature: "Indexsignatur",
  kind_constructor_signature: "Konstruktorsignatur",
  kind_parameter: "Parameter",
  kind_type_literal: "Typenliteral",
  kind_type_parameter: "Typenparameter",
  kind_accessor: "Zugriffsfunktion",
  kind_get_signature: "Abfragesignatur",
  kind_set_signature: "\xC4nderungssignatur",
  kind_type_alias: "Typenalias",
  kind_reference: "Referenz",
  kind_document: "Dokument",
  // ReflectionKind plural translations
  kind_plural_project: "Projekte",
  kind_plural_module: "Module",
  kind_plural_namespace: "Namensr\xE4ume",
  kind_plural_enum: "Aufz\xE4hlungen",
  kind_plural_enum_member: "Aufz\xE4hlungselemente",
  kind_plural_variable: "Variablen",
  kind_plural_function: "Funktionen",
  kind_plural_class: "Klassen",
  kind_plural_interface: "Schnittstellen",
  kind_plural_constructor: "Konstruktoren",
  kind_plural_property: "Eigenschaften",
  kind_plural_method: "Methoden",
  kind_plural_call_signature: "Aufrufsignaturen",
  kind_plural_index_signature: "Indexsignaturen",
  kind_plural_constructor_signature: "Konstruktorsignaturen",
  kind_plural_parameter: "Parameter",
  kind_plural_type_literal: "Typenliterale",
  kind_plural_type_parameter: "Typenparameter",
  kind_plural_accessor: "Zugriffsfunktionen",
  kind_plural_get_signature: "Abfragesignaturen",
  kind_plural_set_signature: "\xC4nderungssignaturen",
  kind_plural_type_alias: "Typenaliasse",
  kind_plural_reference: "Referenzen",
  kind_plural_document: "Dokumente",
  // ReflectionFlag translations
  flag_private: "Privat",
  flag_protected: "Gesch\xFCtzt",
  flag_public: "\xD6ffentlich",
  flag_static: "Statisch",
  flag_external: "Extern",
  flag_optional: "Optional",
  flag_rest: "Rest",
  flag_abstract: "Abstrakt",
  flag_const: "Konstant",
  flag_readonly: "Schreibgesch\xFCtzt",
  flag_inherited: "Geerbt",
  // ==================================================================
  // Strings that show up in the default theme
  // ==================================================================
  // Page headings/labels
  theme_implements: "Implementiert",
  theme_indexable: "Indexierbar",
  theme_type_declaration: "Typendeklaration",
  theme_index: "Index",
  theme_hierarchy: "Hierarchie",
  theme_hierarchy_summary: "Hierarchie\xFCbersicht",
  theme_hierarchy_view_summary: "Zusammenfassung anzeigen",
  theme_implemented_by: "Implementiert von",
  theme_defined_in: "Definiert in",
  theme_implementation_of: "Implementierung von",
  theme_inherited_from: "Geerbt von",
  theme_overrides: "\xDCberschreibt",
  theme_returns: "R\xFCckgabewert",
  theme_generated_using_typedoc: "Generiert mit TypeDoc",
  // If this includes "TypeDoc", theme will insert a link at that location.
  // Search
  theme_preparing_search_index: "Bereite Suchindex vor...",
  // Left nav bar
  theme_loading: "Lade...",
  // Right nav bar
  theme_settings: "Einstellungen",
  theme_member_visibility: "Member-Sichtbarkeit",
  theme_theme: "Theme",
  theme_os: "OS",
  theme_light: "Light",
  theme_dark: "Dark",
  theme_on_this_page: "Auf dieser Seite",
  // aria-label
  theme_search: "Suchen",
  theme_menu: "Menu",
  theme_permalink: "Permalink",
  theme_folder: "Ordner",
  // Used by the frontend JS
  // For the English translations only, these should also be added to
  // src/lib/output/themes/default/assets/typedoc/Application.ts
  // Also uses theme_folder and singular kinds
  theme_copy: "Kopieren",
  theme_copied: "Kopiert!",
  theme_normally_hidden: "Dieser Member ist normalerweise aufgrund der Filtereinstellungen versteckt.",
  theme_hierarchy_expand: "Ausklappen",
  theme_hierarchy_collapse: "Einklappen",
  theme_search_index_not_available: "Der Suchindex ist nicht verf\xFCgbar",
  theme_search_no_results_found_for_0: "Keine Resultate gefunden f\xFCr {0}",
  theme_search_placeholder: "Dokumentation durchsuchen"
});

// src/lib/internationalization/locales/fr.ts
var fr_default = buildIncompleteTranslation({
  loaded_multiple_times_0: "TypeDoc a \xE9t\xE9 charg\xE9 plusieurs fois. Cela est g\xE9n\xE9ralement d\xFB \xE0 des plugins qui ont leur propre installation de TypeDoc. Les chemins charg\xE9s sont :\n	{0}",
  unsupported_ts_version_0: "Vous utilisez une version de TypeScript non support\xE9e ! Si TypeDoc plante, c'est probablement pour cette raison. TypeDoc supporte {0}",
  no_compiler_options_set: "Aucune option de compilation d\xE9finie. Cela signifie probablement que TypeDoc n'a pas trouv\xE9 votre fichier tsconfig.json. La documentation g\xE9n\xE9r\xE9e sera probablement vide",
  loaded_plugin_0: "Plugin charg\xE9 {0}",
  solution_not_supported_in_watch_mode: "Le fichier tsconfig fourni semble \xEAtre un tsconfig de type 'solution', ce qui n'est pas support\xE9 en mode watch",
  strategy_not_supported_in_watch_mode: "entryPointStrategy doit \xEAtre d\xE9fini sur 'resolve' ou 'expand' pour le mode watch",
  file_0_changed_restarting: "Le fichier de configuration {0} a chang\xE9 : red\xE9marrage complet requis...",
  file_0_changed_rebuilding: "Le fichier {0} a chang\xE9 : reconstruction de la sortie...",
  found_0_errors_and_1_warnings: "{0} erreurs et {1} avertissements trouv\xE9s",
  output_0_could_not_be_generated: "La sortie {0} n'a pas pu \xEAtre g\xE9n\xE9r\xE9e \xE0 cause des erreurs ci-dessus",
  output_0_generated_at_1: "{0} g\xE9n\xE9r\xE9 \xE0 {1}",
  no_entry_points_for_packages: "Aucun point d'entr\xE9e fourni pour le mode packages, la documentation ne peut pas \xEAtre g\xE9n\xE9r\xE9e",
  failed_to_find_packages: "\xC9chec de la recherche de packages, assurez-vous d'avoir fourni au moins un r\xE9pertoire comme point d'entr\xE9e contenant un package.json",
  nested_packages_unsupported_0: "Le projet \xE0 {0} a entryPointStrategy d\xE9fini sur packages, mais les packages imbriqu\xE9s ne sont pas support\xE9s",
  package_option_0_should_be_specified_at_root: "L'option packageOptions d\xE9finit l'option {0}, qui n'a d'effet qu'au niveau racine",
  previous_error_occurred_when_reading_options_for_0: "L'erreur pr\xE9c\xE9dente s'est produite lors de la lecture des options pour le package \xE0 {0}",
  converting_project_at_0: "Conversion du projet \xE0 {0}",
  failed_to_convert_packages: "\xC9chec de la conversion d'un ou plusieurs packages, le r\xE9sultat ne sera pas fusionn\xE9",
  merging_converted_projects: "Fusion des projets convertis",
  no_entry_points_to_merge: "Aucun point d'entr\xE9e fourni \xE0 fusionner",
  entrypoint_did_not_match_files_0: "Le glob de point d'entr\xE9e {0} ne correspond \xE0 aucun fichier",
  failed_to_parse_json_0: "\xC9chec de l'analyse du fichier \xE0 {0} en tant que json",
  failed_to_read_0_when_processing_document_tag_in_1: "\xC9chec de la lecture du fichier {0} lors du traitement de la balise @document pour le commentaire dans {1}",
  failed_to_read_0_when_processing_project_document: "\xC9chec de la lecture du fichier {0} lors de l'ajout du document de projet",
  failed_to_read_0_when_processing_document_child_in_1: "\xC9chec de la lecture du fichier {0} lors du traitement des enfants du document dans {1}",
  frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values: "Les enfants frontmatter dans {0} doivent \xEAtre un tableau de cha\xEEnes ou un objet avec des valeurs de cha\xEEne",
  converting_union_as_interface: "L'utilisation de @interface sur un type union supprimera les propri\xE9t\xE9s non pr\xE9sentes sur toutes les branches de l'union. La sortie de TypeDoc pourrait ne pas d\xE9crire fid\xE8lement votre code source",
  converting_0_as_class_requires_value_declaration: "La conversion de {0} en tant que classe n\xE9cessite une d\xE9claration qui repr\xE9sente une valeur non-type",
  converting_0_as_class_without_construct_signatures: "{0} est converti en tant que classe, mais n'a aucune signature de construction",
  comment_for_0_should_not_contain_block_or_modifier_tags: "Le commentaire pour {0} ne devrait contenir aucune balise de bloc ou de modificateur",
  symbol_0_has_multiple_declarations_with_comment: "{0} a plusieurs d\xE9clarations avec un commentaire. Un commentaire arbitraire sera utilis\xE9",
  comments_for_0_are_declared_at_1: "Les commentaires pour {0} sont d\xE9clar\xE9s \xE0 :\n	{1}",
  multiple_type_parameters_on_template_tag_unsupported: "TypeDoc ne supporte pas plusieurs param\xE8tres de type d\xE9finis dans une seule balise @template avec un commentaire",
  failed_to_find_jsdoc_tag_for_name_0: "\xC9chec de la recherche de la balise JSDoc pour {0} apr\xE8s l'analyse du commentaire, veuillez signaler un bug",
  relative_path_0_is_not_a_file_and_will_not_be_copied_to_output: "Le chemin relatif {0} n'est pas un fichier et ne sera pas copi\xE9 dans le r\xE9pertoire de sortie",
  inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0: "Une balise @inheritDoc en ligne ne devrait pas appara\xEEtre dans une balise de bloc car elle ne sera pas trait\xE9e dans le commentaire \xE0 {0}",
  at_most_one_remarks_tag_expected_in_comment_at_0: "Au plus une balise @remarks est attendue dans un commentaire, ignorance de toutes sauf la premi\xE8re dans le commentaire \xE0 {0}",
  at_most_one_returns_tag_expected_in_comment_at_0: "Au plus une balise @returns est attendue dans un commentaire, ignorance de toutes sauf la premi\xE8re dans le commentaire \xE0 {0}",
  at_most_one_inheritdoc_tag_expected_in_comment_at_0: "Au plus une balise @inheritDoc est attendue dans un commentaire, ignorance de toutes sauf la premi\xE8re dans le commentaire \xE0 {0}",
  content_in_summary_overwritten_by_inheritdoc_in_comment_at_0: "Le contenu de la section r\xE9sum\xE9 sera \xE9cras\xE9 par la balise @inheritDoc dans le commentaire \xE0 {0}",
  content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0: "Le contenu du bloc @remarks sera \xE9cras\xE9 par la balise @inheritDoc dans le commentaire \xE0 {0}",
  example_tag_literal_name: "La premi\xE8re ligne d'une balise d'exemple sera prise litt\xE9ralement comme nom de l'exemple, et ne doit contenir que du texte",
  inheritdoc_tag_properly_capitalized: "La balise @inheritDoc doit \xEAtre correctement capitalis\xE9e",
  treating_unrecognized_tag_0_as_modifier: "Traitement de la balise non reconnue {0} comme une balise de modificateur",
  unmatched_closing_brace: "Accolade fermante non correspondante",
  unescaped_open_brace_without_inline_tag: "Accolade ouvrante non \xE9chapp\xE9e rencontr\xE9e sans balise en ligne",
  unknown_block_tag_0: "Balise de bloc inconnue {0} rencontr\xE9e",
  unknown_inline_tag_0: "Balise en ligne inconnue {0} rencontr\xE9e",
  open_brace_within_inline_tag: "Accolade ouvrante rencontr\xE9e dans une balise en ligne, c'est probablement une erreur",
  inline_tag_not_closed: "La balise en ligne n'est pas ferm\xE9e",
  failed_to_resolve_link_to_0_in_comment_for_1: '\xC9chec de la r\xE9solution du lien vers "{0}" dans le commentaire pour {1}',
  failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2: '\xC9chec de la r\xE9solution du lien vers "{0}" dans le commentaire pour {1}. Vous vouliez peut-\xEAtre "{2}"',
  failed_to_resolve_link_to_0_in_readme_for_1: '\xC9chec de la r\xE9solution du lien vers "{0}" dans le lisez-moi pour {1}',
  failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2: '\xC9chec de la r\xE9solution du lien vers "{0}" dans le lisez-moi pour {1}. Vous vouliez peut-\xEAtre "{2}"',
  failed_to_resolve_link_to_0_in_document_1: '\xC9chec de la r\xE9solution du lien vers "{0}" dans le document {1}',
  failed_to_resolve_link_to_0_in_document_1_may_have_meant_2: '\xC9chec de la r\xE9solution du lien vers "{0}" dans le document {1}. Vous vouliez peut-\xEAtre "{2}"',
  type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: "{0}, d\xE9fini dans {1}, est r\xE9f\xE9renc\xE9 par {2} mais n'est pas inclus dans la documentation",
  reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: "{0} ({1}), d\xE9fini dans {2}, n'a aucune documentation",
  invalid_intentionally_not_documented_names_0: "Les noms de r\xE9flexion qualifi\xE9s suivants ont \xE9t\xE9 marqu\xE9s comme intentionnellement non document\xE9s, mais n'ont pas \xE9t\xE9 r\xE9f\xE9renc\xE9s dans la documentation, ou ont \xE9t\xE9 document\xE9s :\n	{0}",
  invalid_intentionally_not_exported_symbols_0: "Les symboles suivants ont \xE9t\xE9 marqu\xE9s comme intentionnellement non export\xE9s, mais n'ont pas \xE9t\xE9 r\xE9f\xE9renc\xE9s dans la documentation, ou ont \xE9t\xE9 export\xE9s :\n	{0}",
  reflection_0_has_unused_mergeModuleWith_tag: "{0} a une balise @mergeModuleWith qui n'a pas pu \xEAtre r\xE9solue",
  reflection_0_links_to_1_with_text_2_but_resolved_to_3: `"{0}" lie vers "{1}" avec le texte "{2}" qui existe mais n'a pas de lien dans la documentation, liera vers "{3}" \xE0 la place.`,
  not_all_search_category_boosts_used_0: "Toutes les cat\xE9gories sp\xE9cifi\xE9es dans searchCategoryBoosts n'ont pas \xE9t\xE9 utilis\xE9es dans la documentation. Les cat\xE9gories inutilis\xE9es sont :\n	{0}",
  not_all_search_group_boosts_used_0: "Tous les groupes sp\xE9cifi\xE9s dans searchGroupBoosts n'ont pas \xE9t\xE9 utilis\xE9s dans la documentation. Les groupes inutilis\xE9s sont :\n	{0}",
  comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group: `Le commentaire pour {0} inclut @categoryDescription pour "{1}", mais aucun enfant n'est plac\xE9 dans cette cat\xE9gorie`,
  comment_for_0_includes_groupDescription_for_1_but_no_child_in_group: `Le commentaire pour {0} inclut @groupDescription pour "{1}", mais aucun enfant n'est plac\xE9 dans ce groupe`,
  label_0_for_1_cannot_be_referenced: 'Le label "{0}" pour {1} ne peut pas \xEAtre r\xE9f\xE9renc\xE9 avec une r\xE9f\xE9rence de d\xE9claration. Les labels ne peuvent contenir que A-Z, 0-9 et _, et ne peuvent pas commencer par un nombre',
  modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2: "La balise de modificateur {0} est mutuellement exclusive avec {1} dans le commentaire pour {2}",
  signature_0_has_unused_param_with_name_1: `La signature {0} a un @param avec le nom "{1}", qui n'est pas utilis\xE9`,
  declaration_reference_in_inheritdoc_for_0_not_fully_parsed: "La r\xE9f\xE9rence de d\xE9claration dans @inheritDoc pour {0} n'a pas \xE9t\xE9 enti\xE8rement analys\xE9e et peut se r\xE9soudre incorrectement",
  failed_to_find_0_to_inherit_comment_from_in_1: '\xC9chec de la recherche de "{0}" pour h\xE9riter du commentaire dans le commentaire pour {1}',
  reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: "{0} a essay\xE9 de copier un commentaire de {1} avec @inheritDoc, mais la source n'a aucun commentaire associ\xE9",
  inheritdoc_circular_inheritance_chain_0: "@inheritDoc sp\xE9cifie une cha\xEEne d'h\xE9ritage circulaire : {0}",
  provided_readme_at_0_could_not_be_read: "Le chemin README fourni, {0}, n'a pas pu \xEAtre lu",
  defaulting_project_name: `L'option --name n'a pas \xE9t\xE9 sp\xE9cifi\xE9e, et aucun package.json n'a \xE9t\xE9 trouv\xE9. Nom du projet par d\xE9faut : "Documentation"`,
  disable_git_set_but_not_source_link_template: "disableGit est d\xE9fini, mais sourceLinkTemplate ne l'est pas, donc les liens sources ne peuvent pas \xEAtre produits. D\xE9finissez un sourceLinkTemplate ou disableSources pour emp\xEAcher le suivi des sources",
  disable_git_set_and_git_revision_used: "disableGit est d\xE9fini et sourceLinkTemplate contient {gitRevision}, qui sera remplac\xE9 par une cha\xEEne vide car aucune r\xE9vision n'a \xE9t\xE9 fournie",
  git_remote_0_not_valid: `Le d\xE9p\xF4t distant git fourni "{0}" n'est pas valide. Les liens sources seront cass\xE9s`,
  reflection_0_tried_to_merge_into_child_1: "La r\xE9flexion {0} a essay\xE9 d'utiliser @mergeModuleWith pour fusionner dans l'un de ses enfants : {1}",
  custom_css_file_0_does_not_exist: "Le fichier CSS personnalis\xE9 \xE0 {0} n'existe pas",
  custom_js_file_0_does_not_exist: "Le fichier JavaScript personnalis\xE9 \xE0 {0} n'existe pas",
  unsupported_highlight_language_0_not_highlighted_in_comment_for_1: "La langue de coloration syntaxique non support\xE9e {0} ne sera pas color\xE9e dans le commentaire pour {1}",
  unloaded_language_0_not_highlighted_in_comment_for_1: "Le bloc de code avec la langue {0} ne sera pas color\xE9 dans le commentaire pour {1} car il n'est pas inclus dans l'option highlightLanguages",
  yaml_frontmatter_not_an_object: "Frontmatter YAML attendu en tant qu'objet",
  could_not_write_0: "Impossible d'\xE9crire {0}",
  could_not_empty_output_directory_0: "Impossible de vider le r\xE9pertoire de sortie {0}",
  could_not_create_output_directory_0: "Impossible de cr\xE9er le r\xE9pertoire de sortie {0}",
  theme_0_is_not_defined_available_are_1: "Le th\xE8me '{0}' n'est pas d\xE9fini. Les th\xE8mes disponibles sont : {1}",
  router_0_is_not_defined_available_are_1: "Le routeur '{0}' n'est pas d\xE9fini. Les routeurs disponibles sont : {1}",
  reflection_0_links_to_1_but_anchor_does_not_exist_try_2: "{0} lie vers {1}, mais l'ancre n'existe pas. Vous vouliez peut-\xEAtre :\n	{2}",
  no_entry_points_provided: "Aucun point d'entr\xE9e n'a \xE9t\xE9 fourni ou d\xE9couvert \xE0 partir des exports de package.json, c'est probablement une erreur de configuration",
  unable_to_find_any_entry_points: "Impossible de trouver des points d'entr\xE9e. Voir les avertissements pr\xE9c\xE9dents",
  watch_does_not_support_packages_mode: "Le mode watch ne supporte pas les points d'entr\xE9e de style 'packages'",
  watch_does_not_support_merge_mode: "Le mode watch ne supporte pas les points d'entr\xE9e de style 'merge'",
  entry_point_0_not_in_program: "Le point d'entr\xE9e {0} n'est pas r\xE9f\xE9renc\xE9 par l'option 'files' ou 'include' dans votre tsconfig",
  failed_to_resolve_0_to_ts_path: "\xC9chec de la r\xE9solution du chemin du point d'entr\xE9e {0} depuis package.json vers un fichier source TypeScript",
  use_expand_or_glob_for_files_in_dir: "Si vous vouliez inclure des fichiers \xE0 l'int\xE9rieur de ce r\xE9pertoire, d\xE9finissez --entryPointStrategy sur 'expand' ou sp\xE9cifiez un glob",
  glob_0_did_not_match_any_files: "Le glob {0} n'a correspondu \xE0 aucun fichier",
  entry_point_0_did_not_match_any_files_after_exclude: "Le glob {0} n'a correspondu \xE0 aucun fichier apr\xE8s application des motifs d'exclusion",
  entry_point_0_did_not_exist: "Le point d'entr\xE9e fourni {0} n'existe pas",
  entry_point_0_did_not_match_any_packages: "Le glob de point d'entr\xE9e {0} n'a correspondu \xE0 aucun r\xE9pertoire contenant un package.json",
  file_0_not_an_object: "Le fichier {0} n'est pas un objet",
  serialized_project_referenced_0_not_part_of_project: "Le projet s\xE9rialis\xE9 r\xE9f\xE9rence la r\xE9flexion {0}, qui ne fait pas partie du projet",
  saved_relative_path_0_resolved_from_1_does_not_exist: "Le projet s\xE9rialis\xE9 r\xE9f\xE9rence {0}, qui n'existe pas par rapport \xE0 {1}",
  circular_reference_extends_0: 'R\xE9f\xE9rence circulaire rencontr\xE9e pour le champ "extends" de {0}',
  failed_resolve_0_to_file_in_1: "\xC9chec de la r\xE9solution de {0} vers un fichier dans {1}",
  glob_0_should_use_posix_slash: 'Le glob "{0}" \xE9chappe un caract\xE8re non sp\xE9cial. Les entr\xE9es glob pour TypeDoc ne peuvent pas utiliser les s\xE9parateurs de chemin Windows (\\), essayez de les remplacer par des s\xE9parateurs de chemin posix (/)',
  option_0_can_only_be_specified_by_config_file: "L'option '{0}' ne peut \xEAtre sp\xE9cifi\xE9e que via un fichier de configuration",
  option_0_expected_a_value_but_none_provided: "--{0} attendait une valeur, mais aucune n'a \xE9t\xE9 fournie en argument",
  unknown_option_0_may_have_meant_1: "Option inconnue : {0}, vous vouliez peut-\xEAtre :\n	{1}",
  typedoc_key_in_0_ignored: "La cl\xE9 'typedoc' dans {0} \xE9tait utilis\xE9e par l'entryPointStrategy legacy-packages et sera ignor\xE9e",
  typedoc_options_must_be_object_in_0: `\xC9chec de l'analyse du champ "typedocOptions" dans {0}, assurez-vous qu'il existe et contient un objet`,
  tsconfig_file_0_does_not_exist: "Le fichier tsconfig {0} n'existe pas",
  tsconfig_file_specifies_options_file: `"typedocOptions" dans le fichier tsconfig sp\xE9cifie un fichier d'options \xE0 lire mais le fichier d'options a d\xE9j\xE0 \xE9t\xE9 lu. C'est probablement une erreur de configuration`,
  tsconfig_file_specifies_tsconfig_file: '"typedocOptions" dans le fichier tsconfig ne peut pas sp\xE9cifier un fichier tsconfig \xE0 lire',
  tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: "Les {0} d\xE9finis dans typedoc.json seront \xE9cras\xE9s par la configuration dans tsdoc.json",
  failed_read_tsdoc_json_0: "\xC9chec de la lecture du fichier tsdoc.json \xE0 {0}",
  invalid_tsdoc_json_0: "Le fichier {0} n'est pas un fichier tsdoc.json valide",
  options_file_0_does_not_exist: "Le fichier d'options {0} n'existe pas",
  failed_read_options_file_0: "\xC9chec de l'analyse de {0}, assurez-vous qu'il existe et exporte un objet",
  invalid_plugin_0_missing_load_function: "Structure invalide dans le plugin {0}, aucune fonction load trouv\xE9e",
  plugin_0_could_not_be_loaded: "Le plugin {0} n'a pas pu \xEAtre charg\xE9",
  help_options: "Sp\xE9cifie un fichier d'options json qui doit \xEAtre charg\xE9. Si non sp\xE9cifi\xE9, TypeDoc cherchera 'typedoc.json' dans le r\xE9pertoire courant",
  help_tsconfig: "Sp\xE9cifie un fichier de configuration TypeScript qui doit \xEAtre charg\xE9. Si non sp\xE9cifi\xE9, TypeDoc cherchera 'tsconfig.json' dans le r\xE9pertoire courant",
  help_compilerOptions: "Surcharge s\xE9lectivement les options du compilateur TypeScript utilis\xE9es par TypeDoc",
  help_lang: "D\xE9finit la langue \xE0 utiliser dans la g\xE9n\xE9ration et dans les messages de TypeDoc",
  help_locales: "Ajoute des traductions pour une locale sp\xE9cifi\xE9e. Cette option est principalement destin\xE9e \xE0 \xEAtre utilis\xE9e comme solution temporaire en attendant le support officiel de la locale dans TypeDoc",
  help_packageOptions: "D\xE9finit les options qui seront appliqu\xE9es \xE0 chaque package lorsque entryPointStrategy est d\xE9fini sur packages",
  help_entryPoints: "Les points d'entr\xE9e de votre documentation",
  help_entryPointStrategy: "La strat\xE9gie \xE0 utiliser pour convertir les points d'entr\xE9e en modules de documentation",
  help_alwaysCreateEntryPointModule: "Lorsque activ\xE9, TypeDoc cr\xE9era toujours un `Module` pour les points d'entr\xE9e, m\xEAme si un seul est fourni",
  help_projectDocuments: "Documents qui doivent \xEAtre ajout\xE9s en tant qu'enfants \xE0 la racine de la documentation g\xE9n\xE9r\xE9e. Supporte les globs pour correspondre \xE0 plusieurs fichiers",
  help_exclude: "D\xE9finit les motifs \xE0 exclure lors de l'expansion d'un r\xE9pertoire sp\xE9cifi\xE9 comme point d'entr\xE9e",
  help_externalPattern: "D\xE9finit les motifs pour les fichiers qui doivent \xEAtre consid\xE9r\xE9s comme externes",
  help_excludeExternals: "Emp\xEAche les symboles r\xE9solus de mani\xE8re externe d'\xEAtre document\xE9s",
  help_excludeNotDocumented: "Emp\xEAche les symboles qui ne sont pas explicitement document\xE9s d'appara\xEEtre dans les r\xE9sultats",
  help_excludeNotDocumentedKinds: "Sp\xE9cifie le type de r\xE9flexions qui peuvent \xEAtre supprim\xE9es par excludeNotDocumented",
  help_excludeInternal: "Emp\xEAche les symboles marqu\xE9s avec @internal d'\xEAtre document\xE9s",
  help_excludeCategories: "Exclut les symboles de cette cat\xE9gorie de la documentation",
  help_excludeProtected: "Ignore les variables et m\xE9thodes prot\xE9g\xE9es",
  help_excludeReferences: "Si un symbole est export\xE9 plusieurs fois, ignore tout sauf le premier export",
  help_externalSymbolLinkMappings: "D\xE9finit des liens personnalis\xE9s pour les symboles non inclus dans la documentation",
  help_out: "Sp\xE9cifie l'emplacement o\xF9 la documentation pour la sortie par d\xE9faut doit \xEAtre \xE9crite. Le type de sortie par d\xE9faut peut \xEAtre modifi\xE9 par des plugins.",
  help_html: "Sp\xE9cifie l'emplacement o\xF9 la documentation HTML doit \xEAtre \xE9crite.",
  help_json: "Sp\xE9cifie l'emplacement et le nom du fichier JSON d\xE9crivant le projet",
  help_pretty: "Sp\xE9cifie si la sortie JSON doit \xEAtre format\xE9e avec des tabulations",
  help_emit: "Sp\xE9cifie ce que TypeDoc doit \xE9mettre, 'docs', 'both', ou 'none'",
  help_theme: "Sp\xE9cifie le nom du th\xE8me pour rendre la documentation",
  help_router: "Sp\xE9cifie le nom du routeur \xE0 utiliser pour d\xE9terminer les noms de fichiers dans la documentation",
  help_lightHighlightTheme: "Sp\xE9cifie le th\xE8me de coloration syntaxique en mode clair",
  help_darkHighlightTheme: "Sp\xE9cifie le th\xE8me de coloration syntaxique en mode sombre",
  help_highlightLanguages: "Sp\xE9cifie les langues qui seront charg\xE9es pour colorer le code lors du rendu",
  help_ignoredHighlightLanguages: "Sp\xE9cifie les langues qui seront accept\xE9es comme langues de coloration valides, mais ne seront pas color\xE9es \xE0 l'ex\xE9cution",
  help_typePrintWidth: "Largeur \xE0 laquelle le code doit \xEAtre renvoy\xE9 \xE0 la ligne lors du rendu d'un type",
  help_customCss: "Chemin vers un fichier CSS personnalis\xE9 pour l'import du th\xE8me",
  help_customJs: "Chemin vers un fichier JS personnalis\xE9 \xE0 importer",
  help_markdownItOptions: "Sp\xE9cifie les options pass\xE9es \xE0 markdown-it, le parseur Markdown utilis\xE9 par TypeDoc",
  help_markdownItLoader: "Sp\xE9cifie un callback \xE0 appeler lors du chargement de l'instance markdown-it. L'instance du parseur utilis\xE9 par TypeDoc lui sera pass\xE9e",
  help_maxTypeConversionDepth: "D\xE9finit la profondeur maximale des types \xE0 convertir",
  help_name: "D\xE9finit le nom du projet qui sera utilis\xE9 dans l'en-t\xEAte du template",
  help_includeVersion: "Ajoute la version du package au nom du projet",
  help_disableSources: "D\xE9sactive la d\xE9finition de la source d'une r\xE9flexion lors de sa documentation",
  help_sourceLinkTemplate: "Sp\xE9cifie un template de lien \xE0 utiliser lors de la g\xE9n\xE9ration des URLs sources. Si non d\xE9fini, sera cr\xE9\xE9 automatiquement via le d\xE9p\xF4t distant git. Supporte les espaces r\xE9serv\xE9s {path}, {line}, {gitRevision}",
  help_gitRevision: "Utilise la r\xE9vision sp\xE9cifi\xE9e au lieu de la derni\xE8re r\xE9vision pour lier aux fichiers sources GitHub/Bitbucket. Sans effet si disableSources est activ\xE9",
  help_gitRemote: "Utilise le d\xE9p\xF4t distant sp\xE9cifi\xE9 pour lier aux fichiers sources GitHub/Bitbucket. Sans effet si disableGit ou disableSources est activ\xE9",
  help_disableGit: "Suppose que tout peut \xEAtre li\xE9 avec sourceLinkTemplate, sourceLinkTemplate doit \xEAtre d\xE9fini si activ\xE9. {path} sera relatif \xE0 basePath",
  help_basePath: "Sp\xE9cifie le chemin de base \xE0 utiliser lors de l'affichage des chemins de fichiers",
  help_excludeTags: "Supprime les balises de bloc/modificateur list\xE9es des commentaires de documentation",
  help_notRenderedTags: "Balises qui seront conserv\xE9es dans les commentaires, mais non rendues lors de la cr\xE9ation de la sortie",
  help_cascadedModifierTags: "Balises de modificateur qui doivent \xEAtre copi\xE9es vers tous les enfants de la r\xE9flexion parente",
  help_readme: "Chemin vers le fichier lisez-moi qui doit \xEAtre affich\xE9 sur la page d'index. Passez `none` pour d\xE9sactiver la page d'index et commencer la documentation sur la page des globales",
  help_cname: "D\xE9finit le texte du fichier CNAME, utile pour les domaines personnalis\xE9s sur GitHub Pages",
  help_favicon: "Chemin vers le favicon \xE0 inclure comme ic\xF4ne du site",
  help_sourceLinkExternal: "Sp\xE9cifie que les liens sources doivent \xEAtre trait\xE9s comme des liens externes \xE0 ouvrir dans un nouvel onglet",
  help_markdownLinkExternal: "Sp\xE9cifie que les liens http[s]:// dans les commentaires et fichiers markdown doivent \xEAtre trait\xE9s comme des liens externes \xE0 ouvrir dans un nouvel onglet",
  help_githubPages: "G\xE9n\xE8re un fichier .nojekyll pour pr\xE9venir les erreurs 404 sur GitHub Pages. Par d\xE9faut \xE0 `true`",
  help_hostedBaseUrl: "Sp\xE9cifie une URL de base \xE0 utiliser pour g\xE9n\xE9rer un sitemap.xml dans notre dossier de sortie et les liens canoniques. Si non sp\xE9cifi\xE9, aucun sitemap ne sera g\xE9n\xE9r\xE9",
  help_useHostedBaseUrlForAbsoluteLinks: "Si activ\xE9, TypeDoc produira des liens absolus vers les pages de votre site en utilisant l'option hostedBaseUrl",
  help_hideGenerator: "Ne pas afficher le lien TypeDoc en bas de la page",
  help_customFooterHtml: "Pied de page personnalis\xE9 apr\xE8s le lien TypeDoc",
  help_customFooterHtmlDisableWrapper: "Si activ\xE9, d\xE9sactive l'\xE9l\xE9ment d'enveloppe pour customFooterHtml",
  help_cacheBust: "Inclut l'heure de g\xE9n\xE9ration dans les liens vers les ressources statiques",
  help_searchInComments: "Si activ\xE9, l'index de recherche inclura \xE9galement les commentaires. Cela augmentera consid\xE9rablement la taille de l'index de recherche",
  help_searchInDocuments: "Si activ\xE9, l'index de recherche inclura \xE9galement les documents. Cela augmentera consid\xE9rablement la taille de l'index de recherche",
  help_cleanOutputDir: "Si activ\xE9, TypeDoc supprimera le r\xE9pertoire de sortie avant d'\xE9crire la sortie",
  help_titleLink: "D\xE9finit le lien vers lequel pointe le titre dans l'en-t\xEAte. Par d\xE9faut la page d'accueil de la documentation",
  help_navigationLinks: "D\xE9finit les liens \xE0 inclure dans l'en-t\xEAte",
  help_sidebarLinks: "D\xE9finit les liens \xE0 inclure dans la barre lat\xE9rale",
  help_navigationLeaves: "Branches de l'arbre de navigation qui ne doivent pas \xEAtre \xE9tendues",
  help_navigation: "D\xE9termine comment la barre lat\xE9rale de navigation est organis\xE9e",
  help_visibilityFilters: "Sp\xE9cifie la visibilit\xE9 par d\xE9faut pour les filtres int\xE9gr\xE9s et les filtres suppl\xE9mentaires selon les balises de modificateur",
  help_searchCategoryBoosts: "Configure la recherche pour donner un boost de pertinence aux cat\xE9gories s\xE9lectionn\xE9es",
  help_searchGroupBoosts: 'Configure la recherche pour donner un boost de pertinence aux types s\xE9lectionn\xE9s (ex: "classe")',
  help_jsDocCompatibility: "D\xE9finit les options de compatibilit\xE9 pour l'analyse des commentaires qui augmentent la similarit\xE9 avec les commentaires JSDoc",
  help_commentStyle: "D\xE9termine comment TypeDoc recherche les commentaires",
  help_useTsLinkResolution: "Utilise la r\xE9solution de lien de TypeScript pour d\xE9terminer o\xF9 pointent les balises @link. Cela ne s'applique qu'aux commentaires de style JSDoc",
  help_preserveLinkText: "Si activ\xE9, les balises @link sans texte de lien utiliseront le contenu textuel comme lien. Si non activ\xE9, utilisera le nom de la r\xE9flexion cible",
  help_blockTags: "Balises de bloc que TypeDoc doit reconna\xEEtre lors de l'analyse des commentaires",
  help_inlineTags: "Balises en ligne que TypeDoc doit reconna\xEEtre lors de l'analyse des commentaires",
  help_modifierTags: "Balises de modificateur que TypeDoc doit reconna\xEEtre lors de l'analyse des commentaires",
  help_categorizeByGroup: "Sp\xE9cifie si la cat\xE9gorisation sera faite au niveau du groupe",
  help_defaultCategory: "Sp\xE9cifie la cat\xE9gorie par d\xE9faut pour les r\xE9flexions sans cat\xE9gorie",
  help_categoryOrder: "Sp\xE9cifie l'ordre dans lequel les cat\xE9gories apparaissent. * indique l'ordre relatif pour les cat\xE9gories non pr\xE9sentes dans la liste",
  help_groupOrder: "Sp\xE9cifie l'ordre dans lequel les groupes apparaissent. * indique l'ordre relatif pour les groupes non pr\xE9sentes dans la liste",
  help_sort: "Sp\xE9cifie la strat\xE9gie de tri pour les valeurs document\xE9es",
  help_sortEntryPoints: "Si activ\xE9, les points d'entr\xE9e seront soumis aux m\xEAmes r\xE8gles de tri que les autres r\xE9flexions",
  help_kindSortOrder: "Sp\xE9cifie l'ordre de tri pour les r\xE9flexions lorsqu'un 'kind' est sp\xE9cifi\xE9",
  help_watch: "Surveille les fichiers pour les changements et reconstruit la documentation lors d'un changement",
  help_preserveWatchOutput: "Si activ\xE9, TypeDoc n'effacera pas l'\xE9cran entre les passes de compilation",
  help_skipErrorChecking: "Ne pas lancer la v\xE9rification de type de TypeScript avant de g\xE9n\xE9rer la documentation",
  help_help: "Affiche ce message",
  help_version: "Affiche la version de TypeDoc",
  help_showConfig: "Affiche la configuration r\xE9solue et quitte",
  help_plugin: "Sp\xE9cifie les plugins npm qui doivent \xEAtre charg\xE9s. Omettez pour charger tous les plugins install\xE9s",
  help_logLevel: "Sp\xE9cifie le niveau de journalisation \xE0 utiliser",
  help_treatWarningsAsErrors: "Si activ\xE9, tous les avertissements seront trait\xE9s comme des erreurs",
  help_treatValidationWarningsAsErrors: "Si activ\xE9, les avertissements \xE9mis lors de la validation seront trait\xE9s comme des erreurs. Cette option ne peut pas \xEAtre utilis\xE9e pour d\xE9sactiver treatWarningsAsErrors pour les avertissements de validation",
  help_intentionallyNotExported: "Une liste de types qui ne doivent pas produire d'avertissements 'r\xE9f\xE9renc\xE9 mais non document\xE9'",
  help_requiredToBeDocumented: "Une liste de types de r\xE9flexions qui doivent \xEAtre document\xE9s",
  help_validation: "Sp\xE9cifie les \xE9tapes de validation que TypeDoc doit effectuer sur votre documentation g\xE9n\xE9r\xE9e",
  unknown_option_0_you_may_have_meant_1: "Option inconnue '{0}'. Vous vouliez peut-\xEAtre :\n	{1}",
  option_0_must_be_between_1_and_2: "{0} doit \xEAtre entre {1} et {2}",
  option_0_must_be_equal_to_or_greater_than_1: "{0} doit \xEAtre sup\xE9rieur ou \xE9gal \xE0 {1}",
  option_0_must_be_less_than_or_equal_to_1: "{0} doit \xEAtre inf\xE9rieur ou \xE9gal \xE0 {1}",
  option_0_must_be_one_of_1: "{0} doit \xEAtre l'un de {1}",
  flag_0_is_not_valid_for_1_expected_2: "Le drapeau '{0}' n'est pas valide pour {1}, attendu l'un de {2}",
  expected_object_with_flag_values_for_0: "Attendu un objet avec des valeurs de drapeaux pour {0} ou true/false",
  flag_values_for_0_must_be_booleans: "Les valeurs de drapeaux pour {0} doivent \xEAtre des bool\xE9ens",
  locales_must_be_an_object: `L'option 'locales' doit \xEAtre d\xE9finie sur un objet ressemblant \xE0 : { en: { theme_implements: "Implements" }}`,
  exclude_not_documented_specified_0_valid_values_are_1: "excludeNotDocumentedKinds ne peut sp\xE9cifier que des valeurs connues, et des valeurs invalides ont \xE9t\xE9 fournies ({0}). Les types valides sont :\n{1}",
  external_symbol_link_mappings_must_be_object: "externalSymbolLinkMappings doit \xEAtre un Record<package name, Record<symbol name, link>>",
  highlight_theme_0_must_be_one_of_1: "{0} doit \xEAtre l'un des suivants : {1}",
  highlightLanguages_contains_invalid_languages_0: "highlightLanguages contient des langues invalides : {0}, lancez typedoc --help pour une liste des langues support\xE9es",
  hostedBaseUrl_must_start_with_http: "hostedBaseUrl doit commencer par http:// ou https://",
  useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl: "L'option useHostedBaseUrlForAbsoluteLinks n\xE9cessite que hostedBaseUrl soit d\xE9fini",
  favicon_must_have_one_of_the_following_extensions_0: "Le favicon doit avoir l'une des extensions suivantes : {0}",
  option_0_must_be_an_object: "L'option '{0}' doit \xEAtre un objet non-tableau",
  option_0_must_be_a_function: "L'option '{0}' doit \xEAtre une fonction",
  option_0_must_be_object_with_urls: "{0} doit \xEAtre un objet avec des labels de cha\xEEne comme cl\xE9s et des URLs comme valeurs",
  visibility_filters_only_include_0: "visibilityFilters ne peut inclure que les cl\xE9s suivantes sans @ : {0}",
  visibility_filters_must_be_booleans: "Toutes les valeurs de visibilityFilters doivent \xEAtre des bool\xE9ens",
  option_0_values_must_be_numbers: "Toutes les valeurs de {0} doivent \xEAtre des nombres",
  option_0_values_must_be_array_of_tags: "{0} doit \xEAtre un tableau de noms de balises valides",
  option_0_specified_1_but_only_2_is_valid: "{0} ne peut sp\xE9cifier que des valeurs connues, et des valeurs invalides ont \xE9t\xE9 fournies ({1}). Les strat\xE9gies de tri valides sont :\n{2}",
  alert_note: "Note",
  alert_tip: "Conseil",
  alert_important: "Important",
  alert_warning: "Avertissement",
  alert_caution: "Attention",
  kind_project: "Projet",
  kind_module: "Module",
  kind_namespace: "Espace de noms",
  kind_enum: "\xC9num\xE9ration",
  kind_enum_member: "Membre d'\xE9num\xE9ration",
  kind_variable: "Variable",
  kind_function: "Fonction",
  kind_class: "Classe",
  kind_interface: "Interface",
  kind_constructor: "Constructeur",
  kind_property: "Propri\xE9t\xE9",
  kind_method: "M\xE9thode",
  kind_call_signature: "Signature d'appel",
  kind_index_signature: "Signature d'index",
  kind_constructor_signature: "Signature de constructeur",
  kind_parameter: "Param\xE8tre",
  kind_type_literal: "Litt\xE9ral de type",
  kind_type_parameter: "Param\xE8tre de type",
  kind_accessor: "Accesseur",
  kind_get_signature: "Signature d'obtention",
  kind_set_signature: "Signature de d\xE9finition",
  kind_type_alias: "Alias de type",
  kind_reference: "R\xE9f\xE9rence",
  kind_document: "Document",
  kind_plural_project: "Projets",
  kind_plural_module: "Modules",
  kind_plural_namespace: "Espaces de noms",
  kind_plural_enum: "\xC9num\xE9rations",
  kind_plural_enum_member: "Membres d'\xE9num\xE9ration",
  kind_plural_variable: "Variables",
  kind_plural_function: "Fonctions",
  kind_plural_class: "Classes",
  kind_plural_interface: "Interfaces",
  kind_plural_constructor: "Constructeurs",
  kind_plural_property: "Propri\xE9t\xE9s",
  kind_plural_method: "M\xE9thodes",
  kind_plural_call_signature: "Signatures d'appel",
  kind_plural_index_signature: "Signatures d'index",
  kind_plural_constructor_signature: "Signatures de constructeur",
  kind_plural_parameter: "Param\xE8tres",
  kind_plural_type_literal: "Litt\xE9raux de type",
  kind_plural_type_parameter: "Param\xE8tres de type",
  kind_plural_accessor: "Accesseurs",
  kind_plural_get_signature: "Signatures d'obtention",
  kind_plural_set_signature: "Signatures de d\xE9finition",
  kind_plural_type_alias: "Alias de type",
  kind_plural_reference: "R\xE9f\xE9rences",
  kind_plural_document: "Documents",
  flag_private: "Priv\xE9",
  flag_protected: "Prot\xE9g\xE9",
  flag_public: "Public",
  flag_static: "Statique",
  flag_external: "Externe",
  flag_optional: "Optionnel",
  flag_rest: "Reste",
  flag_abstract: "Abstrait",
  flag_const: "Constante",
  flag_readonly: "Lecture seule",
  flag_inherited: "H\xE9rit\xE9",
  theme_implements: "Impl\xE9mente",
  theme_indexable: "Indexable",
  theme_type_declaration: "D\xE9claration de type",
  theme_index: "Index",
  theme_hierarchy: "Hi\xE9rarchie",
  theme_hierarchy_summary: "R\xE9sum\xE9 de la hi\xE9rarchie",
  theme_hierarchy_view_summary: "Voir le r\xE9sum\xE9",
  theme_implemented_by: "Impl\xE9ment\xE9 par",
  theme_defined_in: "D\xE9fini dans",
  theme_implementation_of: "Impl\xE9mentation de",
  theme_inherited_from: "H\xE9rit\xE9 de",
  theme_overrides: "Surcharge",
  theme_returns: "Retourne",
  theme_generated_using_typedoc: "G\xE9n\xE9r\xE9 avec TypeDoc",
  theme_preparing_search_index: "Pr\xE9paration de l'index de recherche...",
  theme_loading: "Chargement...",
  theme_settings: "Param\xE8tres",
  theme_member_visibility: "Visibilit\xE9 des membres",
  theme_theme: "Th\xE8me",
  theme_os: "Syst\xE8me",
  theme_light: "Clair",
  theme_dark: "Sombre",
  theme_on_this_page: "Sur cette page",
  theme_search: "Recherche",
  theme_menu: "Menu",
  theme_permalink: "Permalien",
  theme_folder: "Dossier",
  theme_copy: "Copier",
  theme_copied: "Copi\xE9 !",
  theme_normally_hidden: "Ce membre est normalement masqu\xE9 en raison de vos param\xE8tres de filtrage.",
  theme_hierarchy_expand: "D\xE9velopper",
  theme_hierarchy_collapse: "R\xE9duire",
  theme_search_index_not_available: "L'index de recherche n'est pas disponible",
  theme_search_no_results_found_for_0: "Aucun r\xE9sultat trouv\xE9 pour {0}",
  theme_search_placeholder: "Rechercher dans la documentation"
});

// src/lib/internationalization/locales/ja.ts
var ja_default = buildIncompleteTranslation({
  loaded_multiple_times_0: "TypeDoc \u304C\u8907\u6570\u56DE\u8AAD\u307F\u8FBC\u307E\u308C\u307E\u3057\u305F\u3002\u3053\u308C\u306F\u901A\u5E38\u3001TypeDoc \u3092\u72EC\u81EA\u306B\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3057\u305F\u30D7\u30E9\u30B0\u30A4\u30F3\u306B\u3088\u3063\u3066\u767A\u751F\u3057\u307E\u3059\u3002\u8AAD\u307F\u8FBC\u307E\u308C\u305F\u30D1\u30B9\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059:\n{0}",
  unsupported_ts_version_0: "\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u306A\u3044 TypeScript \u30D0\u30FC\u30B8\u30E7\u30F3\u3067\u5B9F\u884C\u3055\u308C\u3066\u3044\u307E\u3059\u3002TypeDoc \u304C\u30AF\u30E9\u30C3\u30B7\u30E5\u3057\u305F\u5834\u5408\u306F\u3001\u3053\u308C\u304C\u539F\u56E0\u3067\u3059\u3002TypeDoc \u306F {0} \u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u3059\u3002",
  no_compiler_options_set: "\u30B3\u30F3\u30D1\u30A4\u30E9\u30AA\u30D7\u30B7\u30E7\u30F3\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u3053\u308C\u306F\u3001TypeDoc \u304C tsconfig.json \u3092\u898B\u3064\u3051\u3089\u308C\u306A\u304B\u3063\u305F\u3053\u3068\u3092\u610F\u5473\u3057\u307E\u3059\u3002\u751F\u6210\u3055\u308C\u305F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306F\u304A\u305D\u3089\u304F\u7A7A\u306B\u306A\u308A\u307E\u3059\u3002",
  loaded_plugin_0: "\u30D7\u30E9\u30B0\u30A4\u30F3 {0} \u304C\u8AAD\u307F\u8FBC\u307E\u308C\u307E\u3057\u305F",
  solution_not_supported_in_watch_mode: "\u63D0\u4F9B\u3055\u308C\u305F tsconfig \u30D5\u30A1\u30A4\u30EB\u306F\u30BD\u30EA\u30E5\u30FC\u30B7\u30E7\u30F3 \u30B9\u30BF\u30A4\u30EB\u306E tsconfig \u306E\u3088\u3046\u306B\u898B\u3048\u307E\u3059\u304C\u3001\u3053\u308C\u306F\u30A6\u30A9\u30C3\u30C1 \u30E2\u30FC\u30C9\u3067\u306F\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  strategy_not_supported_in_watch_mode: "\u30A6\u30A9\u30C3\u30C1\u30E2\u30FC\u30C9\u306E\u5834\u5408\u3001entryPointStrategy \u306F\u3001resolve \u307E\u305F\u306F expand \u306E\u3044\u305A\u308C\u304B\u306B\u8A2D\u5B9A\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
  found_0_errors_and_1_warnings: "{0} \u4EF6\u306E\u30A8\u30E9\u30FC\u3068 {1} \u4EF6\u306E\u8B66\u544A\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F",
  // output_0_could_not_be_generated
  // output_0_generated_at_1
  no_entry_points_for_packages: "\u30D1\u30C3\u30B1\u30FC\u30B8 \u30E2\u30FC\u30C9\u306B\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8\u304C\u63D0\u4F9B\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3092\u751F\u6210\u3067\u304D\u307E\u305B\u3093",
  failed_to_find_packages: "\u30D1\u30C3\u30B1\u30FC\u30B8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002package.json \u3092\u542B\u3080\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8\u3068\u3057\u3066\u5C11\u306A\u304F\u3068\u3082 1 \u3064\u306E\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3092\u6307\u5B9A\u3057\u3066\u3044\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  nested_packages_unsupported_0: "{0} \u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3067\u306F entryPointStrategy \u304C\u30D1\u30C3\u30B1\u30FC\u30B8\u306B\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u30CD\u30B9\u30C8\u3055\u308C\u305F\u30D1\u30C3\u30B1\u30FC\u30B8\u306F\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
  previous_error_occurred_when_reading_options_for_0: "\u524D\u306E\u30A8\u30E9\u30FC\u306F\u3001{0} \u306E\u30D1\u30C3\u30B1\u30FC\u30B8\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u8AAD\u307F\u53D6\u308A\u4E2D\u306B\u767A\u751F\u3057\u307E\u3057\u305F",
  converting_project_at_0: "{0} \u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u5909\u63DB\u3057\u3066\u3044\u307E\u3059",
  failed_to_convert_packages: "1 \u3064\u4EE5\u4E0A\u306E\u30D1\u30C3\u30B1\u30FC\u30B8\u306E\u5909\u63DB\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u7D50\u679C\u306F\u7D50\u5408\u3055\u308C\u307E\u305B\u3093\u3002",
  merging_converted_projects: "\u5909\u63DB\u3055\u308C\u305F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u30DE\u30FC\u30B8",
  no_entry_points_to_merge: "\u30DE\u30FC\u30B8\u3059\u308B\u305F\u3081\u306E\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8\u304C\u63D0\u4F9B\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
  entrypoint_did_not_match_files_0: "\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8 \u30B0\u30ED\u30D6 {0} \u306F\u3069\u306E\u30D5\u30A1\u30A4\u30EB\u306B\u3082\u4E00\u81F4\u3057\u307E\u305B\u3093\u3067\u3057\u305F",
  failed_to_parse_json_0: "{0} \u306E\u30D5\u30A1\u30A4\u30EB\u3092 json \u3068\u3057\u3066\u89E3\u6790\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F",
  failed_to_read_0_when_processing_document_tag_in_1: "{1} \u306E\u30B3\u30E1\u30F3\u30C8\u306E @document \u30BF\u30B0\u306E\u51E6\u7406\u4E2D\u306B\u30D5\u30A1\u30A4\u30EB {0} \u306E\u8AAD\u307F\u53D6\u308A\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
  failed_to_read_0_when_processing_project_document: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8 \u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306E\u8FFD\u52A0\u6642\u306B\u30D5\u30A1\u30A4\u30EB {0} \u306E\u8AAD\u307F\u53D6\u308A\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
  failed_to_read_0_when_processing_document_child_in_1: "{1} \u5185\u306E\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306E\u5B50\u3092\u51E6\u7406\u3059\u308B\u3068\u304D\u306B\u30D5\u30A1\u30A4\u30EB {0} \u306E\u8AAD\u307F\u53D6\u308A\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
  frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values: "{0} \u306E Frontmatter \u306E\u5B50\u306F\u3001\u6587\u5B57\u5217\u306E\u914D\u5217\u307E\u305F\u306F\u6587\u5B57\u5217\u5024\u3092\u6301\u3064\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
  converting_union_as_interface: "\u30E6\u30CB\u30AA\u30F3\u578B\u3067@interface\u3092\u4F7F\u7528\u3059\u308B\u3068\u3001\u30E6\u30CB\u30AA\u30F3\u306E\u3059\u3079\u3066\u306E\u30D6\u30E9\u30F3\u30C1\u306B\u5B58\u5728\u3057\u306A\u3044\u30D7\u30ED\u30D1\u30C6\u30A3\u304C\u7834\u68C4\u3055\u308C\u307E\u3059\u3002TypeDoc\u306E\u51FA\u529B\u306F\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9\u3092\u6B63\u78BA\u306B\u8A18\u8FF0\u3057\u306A\u3044\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002",
  converting_0_as_class_requires_value_declaration: "{0} \u3092\u30AF\u30E9\u30B9\u3068\u3057\u3066\u5909\u63DB\u3059\u308B\u306B\u306F\u3001\u975E\u578B\u5024\u3092\u8868\u3059\u5BA3\u8A00\u304C\u5FC5\u8981\u3067\u3059",
  converting_0_as_class_without_construct_signatures: "{0} \u306F\u30AF\u30E9\u30B9\u3068\u3057\u3066\u5909\u63DB\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u30B3\u30F3\u30B9\u30C8\u30E9\u30AF\u30C8 \u30B7\u30B0\u30CD\u30C1\u30E3\u304C\u3042\u308A\u307E\u305B\u3093",
  comment_for_0_should_not_contain_block_or_modifier_tags: "{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306B\u306F\u30D6\u30ED\u30C3\u30AF\u30BF\u30B0\u3084\u4FEE\u98FE\u30BF\u30B0\u3092\u542B\u3081\u308B\u3053\u3068\u306F\u3067\u304D\u307E\u305B\u3093",
  symbol_0_has_multiple_declarations_with_comment: "{0} \u306B\u306F\u30B3\u30E1\u30F3\u30C8\u4ED8\u304D\u306E\u5BA3\u8A00\u304C\u8907\u6570\u3042\u308A\u307E\u3059\u3002\u4EFB\u610F\u306E\u30B3\u30E1\u30F3\u30C8\u304C\u4F7F\u7528\u3055\u308C\u307E\u3059",
  comments_for_0_are_declared_at_1: "{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306F\u6B21\u306E\u5834\u6240\u3067\u5BA3\u8A00\u3055\u308C\u3066\u3044\u307E\u3059:\n{1}",
  multiple_type_parameters_on_template_tag_unsupported: "TypeDoc \u306F\u3001\u30B3\u30E1\u30F3\u30C8\u4ED8\u304D\u306E\u5358\u4E00\u306E @template \u30BF\u30B0\u3067\u5B9A\u7FA9\u3055\u308C\u305F\u8907\u6570\u306E\u578B\u30D1\u30E9\u30E1\u30FC\u30BF\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u305B\u3093\u3002",
  failed_to_find_jsdoc_tag_for_name_0: "\u30B3\u30E1\u30F3\u30C8\u3092\u89E3\u6790\u3057\u305F\u5F8C\u3001{0} \u306E JSDoc \u30BF\u30B0\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30D0\u30B0\u30EC\u30DD\u30FC\u30C8\u3092\u63D0\u51FA\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  // relative_path_0_is_not_a_file_and_will_not_be_copied_to_output
  inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0: "\u30A4\u30F3\u30E9\u30A4\u30F3 @inheritDoc \u30BF\u30B0\u306F\u30D6\u30ED\u30C3\u30AF \u30BF\u30B0\u5185\u306B\u51FA\u73FE\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002{0} \u306E\u30B3\u30E1\u30F3\u30C8\u3067\u306F\u51E6\u7406\u3055\u308C\u307E\u305B\u3093\u3002",
  at_most_one_remarks_tag_expected_in_comment_at_0: "\u30B3\u30E1\u30F3\u30C8\u306B\u306F\u6700\u5927 1 \u3064\u306E @remarks \u30BF\u30B0\u304C\u5FC5\u8981\u3067\u3059\u3002{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306E\u6700\u521D\u306E\u30BF\u30B0\u4EE5\u5916\u306F\u3059\u3079\u3066\u7121\u8996\u3055\u308C\u307E\u3059\u3002",
  at_most_one_returns_tag_expected_in_comment_at_0: "\u30B3\u30E1\u30F3\u30C8\u306B\u306F\u6700\u5927 1 \u3064\u306E @returns \u30BF\u30B0\u304C\u5FC5\u8981\u3067\u3059\u3002{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306E\u6700\u521D\u306E\u30BF\u30B0\u4EE5\u5916\u306F\u3059\u3079\u3066\u7121\u8996\u3055\u308C\u307E\u3059\u3002",
  at_most_one_inheritdoc_tag_expected_in_comment_at_0: "\u30B3\u30E1\u30F3\u30C8\u306B\u306F\u6700\u5927 1 \u3064\u306E @inheritDoc \u30BF\u30B0\u304C\u5FC5\u8981\u3067\u3059\u3002{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306E\u6700\u521D\u306E\u30BF\u30B0\u4EE5\u5916\u306F\u3059\u3079\u3066\u7121\u8996\u3055\u308C\u307E\u3059\u3002",
  content_in_summary_overwritten_by_inheritdoc_in_comment_at_0: "\u6982\u8981\u30BB\u30AF\u30B7\u30E7\u30F3\u306E\u5185\u5BB9\u306F\u3001{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306E @inheritDoc \u30BF\u30B0\u306B\u3088\u3063\u3066\u4E0A\u66F8\u304D\u3055\u308C\u307E\u3059\u3002",
  content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0: "@remarks \u30D6\u30ED\u30C3\u30AF\u306E\u5185\u5BB9\u306F\u3001{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306E @inheritDoc \u30BF\u30B0\u306B\u3088\u3063\u3066\u4E0A\u66F8\u304D\u3055\u308C\u307E\u3059\u3002",
  example_tag_literal_name: "\u30B5\u30F3\u30D7\u30EB\u30BF\u30B0\u306E\u6700\u521D\u306E\u884C\u306F\u30B5\u30F3\u30D7\u30EB\u540D\u3068\u3057\u3066\u6587\u5B57\u901A\u308A\u89E3\u91C8\u3055\u308C\u3001\u30C6\u30AD\u30B9\u30C8\u306E\u307F\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
  inheritdoc_tag_properly_capitalized: "@inheritDoc\u30BF\u30B0\u306F\u9069\u5207\u306B\u5927\u6587\u5B57\u306B\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  treating_unrecognized_tag_0_as_modifier: "\u8A8D\u8B58\u3055\u308C\u306A\u3044\u30BF\u30B0 {0} \u3092\u4FEE\u98FE\u30BF\u30B0\u3068\u3057\u3066\u51E6\u7406\u3057\u307E\u3059",
  unmatched_closing_brace: "\u4E00\u81F4\u3057\u306A\u3044\u9589\u3058\u62EC\u5F27",
  unescaped_open_brace_without_inline_tag: "\u30A4\u30F3\u30E9\u30A4\u30F3\u30BF\u30B0\u306E\u306A\u3044\u30A8\u30B9\u30B1\u30FC\u30D7\u3055\u308C\u3066\u3044\u306A\u3044\u958B\u304D\u62EC\u5F27\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F",
  unknown_block_tag_0: "\u4E0D\u660E\u306A\u30D6\u30ED\u30C3\u30AF \u30BF\u30B0 {0} \u306B\u906D\u9047\u3057\u307E\u3057\u305F",
  unknown_inline_tag_0: "\u4E0D\u660E\u306A\u30A4\u30F3\u30E9\u30A4\u30F3 \u30BF\u30B0 {0} \u306B\u906D\u9047\u3057\u307E\u3057\u305F",
  open_brace_within_inline_tag: "\u30A4\u30F3\u30E9\u30A4\u30F3\u30BF\u30B0\u5185\u306B\u958B\u304D\u62EC\u5F27\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F\u3002\u3053\u308C\u306F\u304A\u305D\u3089\u304F\u9593\u9055\u3044\u3067\u3059",
  inline_tag_not_closed: "\u30A4\u30F3\u30E9\u30A4\u30F3\u30BF\u30B0\u304C\u9589\u3058\u3089\u308C\u3066\u3044\u306A\u3044",
  failed_to_resolve_link_to_0_in_comment_for_1: "{1} \u306E\u30B3\u30E1\u30F3\u30C8\u5185\u306E\u300C{0}\u300D\u3078\u306E\u30EA\u30F3\u30AF\u3092\u89E3\u6C7A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F",
  type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: "{1} \u3067\u5B9A\u7FA9\u3055\u308C\u3066\u3044\u308B {0} \u306F {2} \u306B\u3088\u3063\u3066\u53C2\u7167\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306B\u306F\u542B\u307E\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: "{2} \u3067\u5B9A\u7FA9\u3055\u308C\u3066\u3044\u308B {0} ({1}) \u306B\u306F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u304C\u3042\u308A\u307E\u305B\u3093",
  invalid_intentionally_not_exported_symbols_0: "\u6B21\u306E\u30B7\u30F3\u30DC\u30EB\u306F\u610F\u56F3\u7684\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u306A\u3044\u3082\u306E\u3068\u3057\u3066\u30DE\u30FC\u30AF\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3067\u53C2\u7167\u3055\u308C\u3066\u3044\u306A\u3044\u304B\u3001\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u3059:\n{0}",
  not_all_search_category_boosts_used_0: "searchCategoryBoosts \u3067\u6307\u5B9A\u3055\u308C\u305F\u3059\u3079\u3066\u306E\u30AB\u30C6\u30B4\u30EA\u304C\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3067\u4F7F\u7528\u3055\u308C\u3066\u3044\u308B\u308F\u3051\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u4F7F\u7528\u3055\u308C\u3066\u3044\u306A\u3044\u30AB\u30C6\u30B4\u30EA\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059:\n{0}",
  not_all_search_group_boosts_used_0: "searchGroupBoosts \u3067\u6307\u5B9A\u3055\u308C\u305F\u3059\u3079\u3066\u306E\u30B0\u30EB\u30FC\u30D7\u304C\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3067\u4F7F\u7528\u3055\u308C\u3066\u3044\u308B\u308F\u3051\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u4F7F\u7528\u3055\u308C\u3066\u3044\u306A\u3044\u30B0\u30EB\u30FC\u30D7\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059:\n{0}",
  comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group: "{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306B\u300C{1}\u300D\u306E @categoryDescription \u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u305D\u306E\u30AB\u30C6\u30B4\u30EA\u306B\u5B50\u304C\u914D\u7F6E\u3055\u308C\u3066\u3044\u307E\u305B\u3093",
  comment_for_0_includes_groupDescription_for_1_but_no_child_in_group: '{0} \u306E\u30B3\u30E1\u30F3\u30C8\u306B "{1}" \u306E @groupDescription \u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u305D\u306E\u30B0\u30EB\u30FC\u30D7\u306B\u306F\u5B50\u304C\u914D\u7F6E\u3055\u308C\u3066\u3044\u307E\u305B\u3093',
  label_0_for_1_cannot_be_referenced: '{1} \u306E\u30E9\u30D9\u30EB "{0}" \u306F\u5BA3\u8A00\u53C2\u7167\u3067\u306F\u53C2\u7167\u3067\u304D\u307E\u305B\u3093\u3002\u30E9\u30D9\u30EB\u306B\u306F A \uFF5E Z\u30010 \uFF5E 9\u3001_ \u306E\u307F\u3092\u542B\u3081\u308B\u3053\u3068\u304C\u3067\u304D\u3001\u6570\u5B57\u3067\u59CB\u307E\u308B\u3053\u3068\u306F\u3067\u304D\u307E\u305B\u3093\u3002',
  failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2: `{1} \u306E\u30B3\u30E1\u30F3\u30C8\u5185\u306E "{0}" \u3078\u306E\u30EA\u30F3\u30AF\u3092\u89E3\u6C7A\u3067\u304D\u307E\u305B\u3093\u3002"{2}" \u3092\u610F\u5473\u3057\u3066\u3044\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002`,
  failed_to_resolve_link_to_0_in_readme_for_1: `{1} \u306E README \u30D5\u30A1\u30A4\u30EB\u5185\u306E "{0}" \u3078\u306E\u30EA\u30F3\u30AF\u3092\u89E3\u6C7A\u3067\u304D\u307E\u305B\u3093\u3002`,
  failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2: `{1} \u306E README \u30D5\u30A1\u30A4\u30EB\u5185\u306E "{0}" \u3078\u306E\u30EA\u30F3\u30AF\u3092\u89E3\u6C7A\u3067\u304D\u307E\u305B\u3093\u3002"{2}" \u3092\u610F\u5473\u3057\u3066\u3044\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002`,
  modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2: "\u4FEE\u98FE\u5B50\u30BF\u30B0 {0} \u306F\u3001{2} \u306E\u30B3\u30E1\u30F3\u30C8\u5185\u306E {1} \u3068\u76F8\u4E92\u306B\u6392\u4ED6\u7684\u3067\u3059",
  signature_0_has_unused_param_with_name_1: '\u7F72\u540D {0} \u306B\u306F\u3001\u540D\u524D\u304C "{1}" \u306E @param \u304C\u3042\u308A\u307E\u3059\u304C\u3001\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002',
  declaration_reference_in_inheritdoc_for_0_not_fully_parsed: "{0} \u306E @inheritDoc \u306E\u5BA3\u8A00\u53C2\u7167\u304C\u5B8C\u5168\u306B\u89E3\u6790\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u6B63\u3057\u304F\u89E3\u6C7A\u3055\u308C\u306A\u3044\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059",
  failed_to_find_0_to_inherit_comment_from_in_1: "{1} \u306E\u30B3\u30E1\u30F3\u30C8\u304B\u3089\u30B3\u30E1\u30F3\u30C8\u3092\u7D99\u627F\u3059\u308B\u300C{0}\u300D\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F",
  reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: "{0} \u306F @inheritDoc \u3092\u4F7F\u7528\u3057\u3066 {1} \u304B\u3089\u30B3\u30E1\u30F3\u30C8\u3092\u30B3\u30D4\u30FC\u3057\u3088\u3046\u3068\u3057\u307E\u3057\u305F\u304C\u3001\u30BD\u30FC\u30B9\u306B\u306F\u95A2\u9023\u4ED8\u3051\u3089\u308C\u305F\u30B3\u30E1\u30F3\u30C8\u304C\u3042\u308A\u307E\u305B\u3093",
  inheritdoc_circular_inheritance_chain_0: "@inheritDoc \u306F\u5FAA\u74B0\u7D99\u627F\u30C1\u30A7\u30FC\u30F3\u3092\u6307\u5B9A\u3057\u307E\u3059: {0}",
  provided_readme_at_0_could_not_be_read: "\u6307\u5B9A\u3055\u308C\u305F README \u30D1\u30B9\u3001{0} \u306F\u8AAD\u307F\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F",
  defaulting_project_name: "--name \u30AA\u30D7\u30B7\u30E7\u30F3\u304C\u6307\u5B9A\u3055\u308C\u3066\u304A\u3089\u305A\u3001package.json \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u540D\u3092\u300CDocumentation\u300D\u306B\u30C7\u30D5\u30A9\u30EB\u30C8\u8A2D\u5B9A\u3057\u307E\u3059\u3002",
  disable_git_set_but_not_source_link_template: "enableGit \u306F\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001sourceLinkTemplate \u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u30BD\u30FC\u30B9\u30EA\u30F3\u30AF\u3092\u751F\u6210\u3067\u304D\u307E\u305B\u3093\u3002\u30BD\u30FC\u30B9\u306E\u8FFD\u8DE1\u3092\u9632\u6B62\u3059\u308B\u306B\u306F\u3001sourceLinkTemplate \u307E\u305F\u306F enableSources \u3092\u8A2D\u5B9A\u3057\u307E\u3059\u3002",
  disable_git_set_and_git_revision_used: "enableGit \u304C\u8A2D\u5B9A\u3055\u308C\u3066\u304A\u308A\u3001sourceLinkTemplate \u306B {gitRevision} \u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u30EA\u30D3\u30B8\u30E7\u30F3\u304C\u63D0\u4F9B\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001\u7A7A\u306E\u6587\u5B57\u5217\u306B\u7F6E\u304D\u63DB\u3048\u3089\u308C\u307E\u3059\u3002",
  git_remote_0_not_valid: '\u63D0\u4F9B\u3055\u308C\u305F Git \u30EA\u30E2\u30FC\u30C8 "{0}" \u306F\u7121\u52B9\u3067\u3059\u3002\u30BD\u30FC\u30B9 \u30EA\u30F3\u30AF\u306F\u58CA\u308C\u307E\u3059',
  custom_css_file_0_does_not_exist: "{0} \u306E\u30AB\u30B9\u30BF\u30E0 CSS \u30D5\u30A1\u30A4\u30EB\u306F\u5B58\u5728\u3057\u307E\u305B\u3093",
  unsupported_highlight_language_0_not_highlighted_in_comment_for_1: "\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u306A\u3044\u30CF\u30A4\u30E9\u30A4\u30C8\u8A00\u8A9E {0} \u306F\u3001{1} \u306E\u30B3\u30E1\u30F3\u30C8\u3067\u306F\u30CF\u30A4\u30E9\u30A4\u30C8\u3055\u308C\u307E\u305B\u3093\u3002",
  unloaded_language_0_not_highlighted_in_comment_for_1: "\u8A00\u8A9E {0} \u306E\u30B3\u30FC\u30C9 \u30D6\u30ED\u30C3\u30AF\u306F\u3001highlightLanguages \u30AA\u30D7\u30B7\u30E7\u30F3\u306B\u542B\u307E\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u3001{1} \u306E\u30B3\u30E1\u30F3\u30C8\u3067\u306F\u5F37\u8ABF\u8868\u793A\u3055\u308C\u307E\u305B\u3093\u3002",
  yaml_frontmatter_not_an_object: "YAML \u30D5\u30ED\u30F3\u30C8\u30DE\u30BF\u30FC\u306F\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u3068\u60F3\u5B9A\u3055\u308C\u307E\u3059",
  could_not_write_0: "{0} \u3092\u66F8\u304D\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F",
  could_not_empty_output_directory_0: "\u51FA\u529B\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA {0} \u3092\u7A7A\u306B\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F",
  could_not_create_output_directory_0: "\u51FA\u529B\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA {0} \u3092\u4F5C\u6210\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F",
  theme_0_is_not_defined_available_are_1: "\u30C6\u30FC\u30DE '{0}' \u306F\u5B9A\u7FA9\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u4F7F\u7528\u53EF\u80FD\u306A\u30C6\u30FC\u30DE\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059: {1}",
  // no_entry_points_provided:
  unable_to_find_any_entry_points: "\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002\u4EE5\u524D\u306E\u8B66\u544A\u3092\u53C2\u7167\u3057\u3066\u304F\u3060\u3055\u3044",
  watch_does_not_support_packages_mode: "\u30A6\u30A9\u30C3\u30C1\u30E2\u30FC\u30C9\u306F\u300C\u30D1\u30C3\u30B1\u30FC\u30B8\u300D\u30B9\u30BF\u30A4\u30EB\u306E\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u307E\u305B\u3093",
  watch_does_not_support_merge_mode: "\u30A6\u30A9\u30C3\u30C1\u30E2\u30FC\u30C9\u3067\u306F\u300C\u30DE\u30FC\u30B8\u300D\u30B9\u30BF\u30A4\u30EB\u306E\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8\u306F\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u307E\u305B\u3093",
  entry_point_0_not_in_program: "\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8 {0} \u306F\u3001tsconfig \u306E 'files' \u307E\u305F\u306F 'include' \u30AA\u30D7\u30B7\u30E7\u30F3\u306B\u3088\u3063\u3066\u53C2\u7167\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
  use_expand_or_glob_for_files_in_dir: "\u3053\u306E\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u5185\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u542B\u3081\u308B\u5834\u5408\u306F\u3001--entryPointStrategy\u3092\u8A2D\u5B9A\u3057\u3066\u5C55\u958B\u3059\u308B\u304B\u3001glob\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002",
  glob_0_did_not_match_any_files: "\u30B0\u30ED\u30D6 {0} \u306F\u3069\u306E\u30D5\u30A1\u30A4\u30EB\u306B\u3082\u4E00\u81F4\u3057\u307E\u305B\u3093\u3067\u3057\u305F",
  entry_point_0_did_not_match_any_files_after_exclude: "\u9664\u5916\u30D1\u30BF\u30FC\u30F3\u3092\u9069\u7528\u3057\u305F\u5F8C\u3001\u30B0\u30ED\u30D6 {0} \u306F\u3069\u306E\u30D5\u30A1\u30A4\u30EB\u306B\u3082\u4E00\u81F4\u3057\u307E\u305B\u3093\u3067\u3057\u305F",
  entry_point_0_did_not_exist: "\u6307\u5B9A\u3055\u308C\u305F\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8 {0} \u306F\u5B58\u5728\u3057\u307E\u305B\u3093",
  entry_point_0_did_not_match_any_packages: "\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8 glob {0} \u306F\u3001package.json \u3092\u542B\u3080\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  file_0_not_an_object: "\u30D5\u30A1\u30A4\u30EB {0} \u306F\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u306F\u3042\u308A\u307E\u305B\u3093",
  serialized_project_referenced_0_not_part_of_project: "\u30B7\u30EA\u30A2\u30EB\u5316\u3055\u308C\u305F\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306F\u3001\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u4E00\u90E8\u3067\u306F\u306A\u3044\u30EA\u30D5\u30EC\u30AF\u30B7\u30E7\u30F3 {0} \u3092\u53C2\u7167\u3057\u307E\u3057\u305F",
  // saved_relative_path_0_resolved_from_1_does_not_exist
  circular_reference_extends_0: '{0} \u306E "extends" \u30D5\u30A3\u30FC\u30EB\u30C9\u3067\u5FAA\u74B0\u53C2\u7167\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F',
  failed_resolve_0_to_file_in_1: "{0} \u3092 {1} \u5185\u306E\u30D5\u30A1\u30A4\u30EB\u306B\u89E3\u6C7A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F",
  option_0_can_only_be_specified_by_config_file: "'{0}' \u30AA\u30D7\u30B7\u30E7\u30F3\u306F\u8A2D\u5B9A\u30D5\u30A1\u30A4\u30EB\u7D4C\u7531\u3067\u306E\u307F\u6307\u5B9A\u3067\u304D\u307E\u3059",
  option_0_expected_a_value_but_none_provided: "--{0} \u306B\u306F\u5024\u304C\u671F\u5F85\u3055\u308C\u3066\u3044\u307E\u3057\u305F\u304C\u3001\u5F15\u6570\u3068\u3057\u3066\u5024\u304C\u4E0E\u3048\u3089\u308C\u307E\u305B\u3093\u3067\u3057\u305F",
  unknown_option_0_may_have_meant_1: "\u4E0D\u660E\u306A\u30AA\u30D7\u30B7\u30E7\u30F3: {0}\u3002\u6B21\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u610F\u5473\u3057\u3066\u3044\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059:\n{1}",
  typedoc_key_in_0_ignored: "{0} \u306E 'typedoc' \u30AD\u30FC\u306F\u3001\u30EC\u30AC\u30B7\u30FC \u30D1\u30C3\u30B1\u30FC\u30B8\u306E entryPointStrategy \u306B\u3088\u3063\u3066\u4F7F\u7528\u3055\u308C\u3066\u304A\u308A\u3001\u7121\u8996\u3055\u308C\u307E\u3059\u3002",
  typedoc_options_must_be_object_in_0: '{0} \u306E "typedocOptions" \u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u89E3\u6790\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u30D5\u30A3\u30FC\u30EB\u30C9\u304C\u5B58\u5728\u3057\u3001\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u304C\u542B\u307E\u308C\u3066\u3044\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002',
  tsconfig_file_0_does_not_exist: "tsconfig \u30D5\u30A1\u30A4\u30EB {0} \u304C\u5B58\u5728\u3057\u307E\u305B\u3093",
  tsconfig_file_specifies_options_file: "tsconfig \u30D5\u30A1\u30A4\u30EB\u306E\u300CtypedocOptions\u300D\u306F\u3001\u8AAD\u307F\u53D6\u308B\u30AA\u30D7\u30B7\u30E7\u30F3 \u30D5\u30A1\u30A4\u30EB\u3092\u6307\u5B9A\u3057\u3066\u3044\u307E\u3059\u304C\u3001\u30AA\u30D7\u30B7\u30E7\u30F3 \u30D5\u30A1\u30A4\u30EB\u306F\u65E2\u306B\u8AAD\u307F\u53D6\u3089\u308C\u3066\u3044\u307E\u3059\u3002\u3053\u308C\u306F\u3001\u8A2D\u5B9A\u30DF\u30B9\u3067\u3042\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002",
  tsconfig_file_specifies_tsconfig_file: 'tsconfig \u30D5\u30A1\u30A4\u30EB\u306E "typedocOptions" \u3067\u3001\u8AAD\u307F\u53D6\u308B tsconfig \u30D5\u30A1\u30A4\u30EB\u3092\u6307\u5B9A\u3057\u3066\u3044\u306A\u3044\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002',
  tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: "typedoc.json \u3067\u5B9A\u7FA9\u3055\u308C\u305F {0} \u306F\u3001tsdoc.json \u306E\u8A2D\u5B9A\u306B\u3088\u3063\u3066\u4E0A\u66F8\u304D\u3055\u308C\u307E\u3059\u3002",
  failed_read_tsdoc_json_0: "{0} \u306E tsdoc.json \u30D5\u30A1\u30A4\u30EB\u306E\u8AAD\u307F\u53D6\u308A\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
  invalid_tsdoc_json_0: "\u30D5\u30A1\u30A4\u30EB {0} \u306F\u6709\u52B9\u306A tsdoc.json \u30D5\u30A1\u30A4\u30EB\u3067\u306F\u3042\u308A\u307E\u305B\u3093",
  options_file_0_does_not_exist: "\u30AA\u30D7\u30B7\u30E7\u30F3\u30D5\u30A1\u30A4\u30EB {0} \u304C\u5B58\u5728\u3057\u307E\u305B\u3093",
  failed_read_options_file_0: "{0} \u306E\u89E3\u6790\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u5B58\u5728\u3057\u3001\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3092\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u3066\u3044\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044",
  invalid_plugin_0_missing_load_function: "\u30D7\u30E9\u30B0\u30A4\u30F3 {0} \u306E\u69CB\u9020\u304C\u7121\u52B9\u3067\u3059\u3002\u30ED\u30FC\u30C9\u95A2\u6570\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
  plugin_0_could_not_be_loaded: "\u30D7\u30E9\u30B0\u30A4\u30F3 {0} \u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F",
  help_options: "\u8AAD\u307F\u8FBC\u3080\u3079\u304D json \u30AA\u30D7\u30B7\u30E7\u30F3 \u30D5\u30A1\u30A4\u30EB\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002\u6307\u5B9A\u3057\u306A\u3044\u5834\u5408\u3001TypeDoc \u306F\u73FE\u5728\u306E\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3067 'typedoc.json' \u3092\u691C\u7D22\u3057\u307E\u3059\u3002",
  help_tsconfig: "\u8AAD\u307F\u8FBC\u3080 TypeScript \u8A2D\u5B9A\u30D5\u30A1\u30A4\u30EB\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002\u6307\u5B9A\u3057\u306A\u3044\u5834\u5408\u3001TypeDoc \u306F\u73FE\u5728\u306E\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3067 'tsconfig.json' \u3092\u691C\u7D22\u3057\u307E\u3059\u3002",
  help_compilerOptions: "TypeDoc \u3067\u4F7F\u7528\u3055\u308C\u308B TypeScript \u30B3\u30F3\u30D1\u30A4\u30E9 \u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u9078\u629E\u7684\u306B\u30AA\u30FC\u30D0\u30FC\u30E9\u30A4\u30C9\u3057\u307E\u3059\u3002",
  help_lang: "\u751F\u6210\u6642\u304A\u3088\u3073TypeDoc\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u4F7F\u7528\u3059\u308B\u8A00\u8A9E\u3092\u8A2D\u5B9A\u3057\u307E\u3059",
  help_locales: "\u6307\u5B9A\u3055\u308C\u305F\u30ED\u30B1\u30FC\u30EB\u306E\u7FFB\u8A33\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002\u3053\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u306F\u3001TypeDoc \u306B\u516C\u5F0F\u306E\u30ED\u30B1\u30FC\u30EB \u30B5\u30DD\u30FC\u30C8\u304C\u8FFD\u52A0\u3055\u308C\u308B\u307E\u3067\u306E\u66AB\u5B9A\u7684\u306A\u624B\u6BB5\u3068\u3057\u3066\u4E3B\u306B\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002",
  help_packageOptions: "entryPointStrategy \u304C\u30D1\u30C3\u30B1\u30FC\u30B8\u306B\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u306B\u5404\u30D1\u30C3\u30B1\u30FC\u30B8\u5185\u3067\u8A2D\u5B9A\u3055\u308C\u308B\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u8A2D\u5B9A\u3057\u307E\u3059\u3002",
  help_entryPoints: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306E\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8",
  help_entryPointStrategy: "\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8\u3092\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u30E2\u30B8\u30E5\u30FC\u30EB\u306B\u5909\u63DB\u3059\u308B\u305F\u3081\u306B\u4F7F\u7528\u3059\u308B\u6226\u7565",
  help_alwaysCreateEntryPointModule: "\u8A2D\u5B9A\u3059\u308B\u3068\u3001TypeDoc \u306F\u30A8\u30F3\u30C8\u30EA \u30DD\u30A4\u30F3\u30C8\u306B `Module` \u3092\u5E38\u306B\u4F5C\u6210\u3057\u307E\u3059 (1 \u3064\u3057\u304B\u63D0\u4F9B\u3055\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u3067\u3082)\u3002",
  help_projectDocuments: "\u751F\u6210\u3055\u308C\u305F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306E\u30EB\u30FC\u30C8\u306B\u5B50\u3068\u3057\u3066\u8FFD\u52A0\u3055\u308C\u308B\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3002\u8907\u6570\u306E\u30D5\u30A1\u30A4\u30EB\u306B\u4E00\u81F4\u3059\u308B glob \u3092\u30B5\u30DD\u30FC\u30C8\u3057\u307E\u3059\u3002",
  help_exclude: "\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8\u3068\u3057\u3066\u6307\u5B9A\u3055\u308C\u305F\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3092\u5C55\u958B\u3059\u308B\u3068\u304D\u306B\u9664\u5916\u3059\u308B\u30D1\u30BF\u30FC\u30F3\u3092\u5B9A\u7FA9\u3057\u307E\u3059",
  help_externalPattern: "\u5916\u90E8\u30D5\u30A1\u30A4\u30EB\u3068\u307F\u306A\u3059\u3079\u304D\u30D5\u30A1\u30A4\u30EB\u306E\u30D1\u30BF\u30FC\u30F3\u3092\u5B9A\u7FA9\u3059\u308B",
  help_excludeExternals: "\u5916\u90E8\u3067\u89E3\u6C7A\u3055\u308C\u305F\u30B7\u30F3\u30DC\u30EB\u304C\u6587\u66F8\u5316\u3055\u308C\u306A\u3044\u3088\u3046\u306B\u3059\u308B",
  help_excludeNotDocumented: "\u660E\u793A\u7684\u306B\u6587\u66F8\u5316\u3055\u308C\u3066\u3044\u306A\u3044\u30B7\u30F3\u30DC\u30EB\u304C\u7D50\u679C\u306B\u8868\u793A\u3055\u308C\u306A\u3044\u3088\u3046\u306B\u3059\u308B",
  help_excludeNotDocumentedKinds: "excludeNotDocumented \u306B\u3088\u3063\u3066\u524A\u9664\u3067\u304D\u308B\u53CD\u5C04\u306E\u7A2E\u985E\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_excludeInternal: "@internal \u3067\u30DE\u30FC\u30AF\u3055\u308C\u305F\u30B7\u30F3\u30DC\u30EB\u304C\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u5316\u3055\u308C\u306A\u3044\u3088\u3046\u306B\u3059\u308B",
  help_excludeCategories: "\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u5185\u306E\u30B7\u30F3\u30DC\u30EB\u3092\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u304B\u3089\u9664\u5916\u3059\u308B",
  help_excludeProtected: "\u4FDD\u8B77\u3055\u308C\u305F\u5909\u6570\u3068\u30E1\u30BD\u30C3\u30C9\u3092\u7121\u8996\u3059\u308B",
  help_excludeReferences: "\u30B7\u30F3\u30DC\u30EB\u304C\u8907\u6570\u56DE\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u305F\u5834\u5408\u3001\u6700\u521D\u306E\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u4EE5\u5916\u306F\u3059\u3079\u3066\u7121\u8996\u3055\u308C\u307E\u3059\u3002",
  help_externalSymbolLinkMappings: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306B\u542B\u307E\u308C\u3066\u3044\u306A\u3044\u30B7\u30F3\u30DC\u30EB\u306E\u30AB\u30B9\u30BF\u30E0\u30EA\u30F3\u30AF\u3092\u5B9A\u7FA9\u3059\u308B",
  // help_out
  // help_html
  help_json: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u8AAC\u660E\u3059\u308BJSON\u30D5\u30A1\u30A4\u30EB\u304C\u66F8\u304D\u8FBC\u307E\u308C\u308B\u5834\u6240\u3068\u30D5\u30A1\u30A4\u30EB\u540D\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_pretty: "\u51FA\u529BJSON\u3092\u30BF\u30D6\u3067\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u3059\u308B\u304B\u3069\u3046\u304B\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_emit: "TypeDoc \u304C\u767A\u884C\u3059\u308B\u5185\u5BB9\u3092\u6307\u5B9A\u3057\u307E\u3059 (\u300Cdocs\u300D\u3001\u300Cboth\u300D\u3001\u307E\u305F\u306F\u300Cnone\u300D)",
  help_theme: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3092\u30EC\u30F3\u30C0\u30EA\u30F3\u30B0\u3059\u308B\u30C6\u30FC\u30DE\u540D\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_lightHighlightTheme: "\u30E9\u30A4\u30C8\u30E2\u30FC\u30C9\u3067\u30B3\u30FC\u30C9\u5F37\u8ABF\u30C6\u30FC\u30DE\u3092\u6307\u5B9A\u3059\u308B",
  help_darkHighlightTheme: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9\u3067\u306E\u30B3\u30FC\u30C9\u5F37\u8ABF\u30C6\u30FC\u30DE\u3092\u6307\u5B9A\u3059\u308B",
  help_highlightLanguages: "\u30EC\u30F3\u30C0\u30EA\u30F3\u30B0\u6642\u306B\u30B3\u30FC\u30C9\u3092\u5F37\u8ABF\u8868\u793A\u3059\u308B\u305F\u3081\u306B\u8AAD\u307F\u8FBC\u307E\u308C\u308B\u8A00\u8A9E\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_customCss: "\u30C6\u30FC\u30DE\u3092\u30A4\u30F3\u30DD\u30FC\u30C8\u3059\u308B\u305F\u3081\u306E\u30AB\u30B9\u30BF\u30E0 CSS \u30D5\u30A1\u30A4\u30EB\u3078\u306E\u30D1\u30B9",
  help_markdownItOptions: "TypeDoc\u304C\u4F7F\u7528\u3059\u308BMarkdown\u30D1\u30FC\u30B5\u30FC\u3067\u3042\u308Bmarkdown-it\u306B\u6E21\u3055\u308C\u308B\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002",
  help_markdownItLoader: "markdown-it\u30A4\u30F3\u30B9\u30BF\u30F3\u30B9\u3092\u30ED\u30FC\u30C9\u3059\u308B\u3068\u304D\u306B\u547C\u3073\u51FA\u3055\u308C\u308B\u30B3\u30FC\u30EB\u30D0\u30C3\u30AF\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002TypeDoc\u304C\u4F7F\u7528\u3059\u308B\u30D1\u30FC\u30B5\u30FC\u306E\u30A4\u30F3\u30B9\u30BF\u30F3\u30B9\u304C\u6E21\u3055\u308C\u307E\u3059\u3002",
  help_maxTypeConversionDepth: "\u5909\u63DB\u3059\u308B\u578B\u306E\u6700\u5927\u6DF1\u5EA6\u3092\u8A2D\u5B9A\u3059\u308B",
  help_name: "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u306E\u30D8\u30C3\u30C0\u30FC\u3067\u4F7F\u7528\u3055\u308C\u308B\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u540D\u3092\u8A2D\u5B9A\u3057\u307E\u3059",
  help_includeVersion: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u540D\u306B\u30D1\u30C3\u30B1\u30FC\u30B8\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u8FFD\u52A0\u3059\u308B",
  help_disableSources: "\u53CD\u5C04\u3092\u6587\u66F8\u5316\u3059\u308B\u3068\u304D\u306B\u53CD\u5C04\u306E\u30BD\u30FC\u30B9\u306E\u8A2D\u5B9A\u3092\u7121\u52B9\u306B\u3059\u308B",
  help_sourceLinkTemplate: "\u30BD\u30FC\u30B9 URL \u3092\u751F\u6210\u3059\u308B\u3068\u304D\u306B\u4F7F\u7528\u3059\u308B\u30EA\u30F3\u30AF \u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001git \u30EA\u30E2\u30FC\u30C8\u3092\u4F7F\u7528\u3057\u3066\u81EA\u52D5\u7684\u306B\u4F5C\u6210\u3055\u308C\u307E\u3059\u3002{path}\u3001{line}\u3001{gitRevision} \u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u307E\u3059\u3002",
  help_gitRevision: "GitHub/Bitbucket \u30BD\u30FC\u30B9\u30D5\u30A1\u30A4\u30EB\u3078\u306E\u30EA\u30F3\u30AF\u306B\u3001\u6700\u5F8C\u306E\u30EA\u30D3\u30B8\u30E7\u30F3\u3067\u306F\u306A\u304F\u6307\u5B9A\u3055\u308C\u305F\u30EA\u30D3\u30B8\u30E7\u30F3\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002disableSources \u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u306F\u52B9\u679C\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  help_gitRemote: "GitHub/Bitbucket \u30BD\u30FC\u30B9\u30D5\u30A1\u30A4\u30EB\u3078\u306E\u30EA\u30F3\u30AF\u306B\u6307\u5B9A\u3055\u308C\u305F\u30EA\u30E2\u30FC\u30C8\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002disableGit \u307E\u305F\u306FdisableSources \u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u306F\u52B9\u679C\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  help_disableGit: "\u3059\u3079\u3066\u304C sourceLinkTemplate \u3067\u30EA\u30F3\u30AF\u3067\u304D\u308B\u3068\u4EEE\u5B9A\u3057\u307E\u3059\u3002\u3053\u308C\u304C\u6709\u52B9\u306A\u5834\u5408\u306F\u3001sourceLinkTemplate \u3092\u8A2D\u5B9A\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002{path} \u306F basePath \u3092\u30EB\u30FC\u30C8\u3068\u3057\u307E\u3059\u3002",
  help_basePath: "\u30D5\u30A1\u30A4\u30EB\u30D1\u30B9\u3092\u8868\u793A\u3059\u308B\u3068\u304D\u306B\u4F7F\u7528\u3059\u308B\u30D9\u30FC\u30B9\u30D1\u30B9\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_excludeTags: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u30B3\u30E1\u30F3\u30C8\u304B\u3089\u30EA\u30B9\u30C8\u3055\u308C\u305F\u30D6\u30ED\u30C3\u30AF/\u4FEE\u98FE\u5B50\u30BF\u30B0\u3092\u524A\u9664\u3057\u307E\u3059",
  // help_notRenderedTags
  help_readme: "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9 \u30DA\u30FC\u30B8\u306B\u8868\u793A\u3055\u308C\u308B Readme \u30D5\u30A1\u30A4\u30EB\u3078\u306E\u30D1\u30B9\u3002\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9 \u30DA\u30FC\u30B8\u3092\u7121\u52B9\u306B\u3057\u3066\u30B0\u30ED\u30FC\u30D0\u30EB \u30DA\u30FC\u30B8\u3067\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3092\u958B\u59CB\u3059\u308B\u306B\u306F\u3001`none` \u3092\u6E21\u3057\u307E\u3059\u3002",
  help_cname: "CNAME\u30D5\u30A1\u30A4\u30EB\u306E\u30C6\u30AD\u30B9\u30C8\u3092\u8A2D\u5B9A\u3057\u307E\u3059\u3002\u3053\u308C\u306FGitHub Pages\u306E\u30AB\u30B9\u30BF\u30E0\u30C9\u30E1\u30A4\u30F3\u306B\u4FBF\u5229\u3067\u3059\u3002",
  help_sourceLinkExternal: "\u30BD\u30FC\u30B9\u30EA\u30F3\u30AF\u3092\u5916\u90E8\u30EA\u30F3\u30AF\u3068\u3057\u3066\u6271\u3044\u3001\u65B0\u3057\u3044\u30BF\u30D6\u3067\u958B\u304F\u3088\u3046\u306B\u6307\u5B9A\u3057\u307E\u3059\u3002",
  help_githubPages: "GitHub Pages \u3067 404 \u30A8\u30E9\u30FC\u3092\u9632\u3050\u305F\u3081\u306B .nojekyll \u30D5\u30A1\u30A4\u30EB\u3092\u751F\u6210\u3057\u307E\u3059\u3002\u30C7\u30D5\u30A9\u30EB\u30C8\u306F `true` \u3067\u3059\u3002",
  help_hostedBaseUrl: "\u51FA\u529B\u30D5\u30A9\u30EB\u30C0\u5185\u306E sitemap.xml \u3068\u6B63\u898F\u30EA\u30F3\u30AF\u3092\u751F\u6210\u3059\u308B\u969B\u306B\u4F7F\u7528\u3059\u308B\u30D9\u30FC\u30B9 URL \u3092\u6307\u5B9A\u3057\u307E\u3059\u3002\u6307\u5B9A\u3057\u306A\u3044\u5834\u5408\u306F\u3001\u30B5\u30A4\u30C8\u30DE\u30C3\u30D7\u306F\u751F\u6210\u3055\u308C\u307E\u305B\u3093\u3002",
  help_useHostedBaseUrlForAbsoluteLinks: "\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001TypeDoc\u306FhostedBaseUrl\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u4F7F\u7528\u3057\u3066\u30B5\u30A4\u30C8\u4E0A\u306E\u30DA\u30FC\u30B8\u3078\u306E\u7D76\u5BFE\u30EA\u30F3\u30AF\u3092\u751F\u6210\u3057\u307E\u3059\u3002",
  help_hideGenerator: "\u30DA\u30FC\u30B8\u306E\u6700\u5F8C\u306B\u3042\u308B TypeDoc \u30EA\u30F3\u30AF\u3092\u5370\u5237\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044",
  help_customFooterHtml: "TypeDoc \u30EA\u30F3\u30AF\u306E\u5F8C\u306E\u30AB\u30B9\u30BF\u30E0 \u30D5\u30C3\u30BF\u30FC",
  help_customFooterHtmlDisableWrapper: "\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001customFooterHtml \u306E\u30E9\u30C3\u30D1\u30FC\u8981\u7D20\u304C\u7121\u52B9\u306B\u306A\u308A\u307E\u3059\u3002",
  // help_hideTypesInSignatureTitle
  help_cacheBust: "\u9759\u7684\u30A2\u30BB\u30C3\u30C8\u3078\u306E\u30EA\u30F3\u30AF\u306B\u751F\u6210\u6642\u9593\u3092\u542B\u3081\u308B",
  help_searchInComments: "\u8A2D\u5B9A\u3059\u308B\u3068\u3001\u691C\u7D22\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u306B\u30B3\u30E1\u30F3\u30C8\u3082\u542B\u307E\u308C\u307E\u3059\u3002\u3053\u308C\u306B\u3088\u308A\u3001\u691C\u7D22\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u306E\u30B5\u30A4\u30BA\u304C\u5927\u5E45\u306B\u5897\u52A0\u3057\u307E\u3059\u3002",
  help_searchInDocuments: "\u8A2D\u5B9A\u3059\u308B\u3068\u3001\u691C\u7D22\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u306B\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3082\u542B\u307E\u308C\u307E\u3059\u3002\u3053\u308C\u306B\u3088\u308A\u3001\u691C\u7D22\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u306E\u30B5\u30A4\u30BA\u304C\u5927\u5E45\u306B\u5897\u52A0\u3057\u307E\u3059\u3002",
  help_cleanOutputDir: "\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001TypeDoc\u306F\u51FA\u529B\u3092\u66F8\u304D\u8FBC\u3080\u524D\u306B\u51FA\u529B\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u3092\u524A\u9664\u3057\u307E\u3059\u3002",
  help_titleLink: "\u30D8\u30C3\u30C0\u30FC\u306E\u30BF\u30A4\u30C8\u30EB\u304C\u6307\u3059\u30EA\u30F3\u30AF\u3092\u8A2D\u5B9A\u3057\u307E\u3059\u3002\u30C7\u30D5\u30A9\u30EB\u30C8\u306F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306E\u30DB\u30FC\u30E0\u30DA\u30FC\u30B8\u3067\u3059\u3002",
  help_navigationLinks: "\u30D8\u30C3\u30C0\u30FC\u306B\u542B\u3081\u308B\u30EA\u30F3\u30AF\u3092\u5B9A\u7FA9\u3057\u307E\u3059",
  help_sidebarLinks: "\u30B5\u30A4\u30C9\u30D0\u30FC\u306B\u542B\u3081\u308B\u30EA\u30F3\u30AF\u3092\u5B9A\u7FA9\u3057\u307E\u3059",
  help_navigationLeaves: "\u5C55\u958B\u3059\u3079\u304D\u3067\u306A\u3044\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u30C4\u30EA\u30FC\u306E\u30D6\u30E9\u30F3\u30C1",
  help_navigation: "\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u30B5\u30A4\u30C9\u30D0\u30FC\u306E\u69CB\u6210\u65B9\u6CD5\u3092\u6C7A\u5B9A\u3057\u307E\u3059",
  help_visibilityFilters: "\u4FEE\u98FE\u30BF\u30B0\u306B\u5FDC\u3058\u3066\u7D44\u307F\u8FBC\u307F\u30D5\u30A3\u30EB\u30BF\u30FC\u3068\u8FFD\u52A0\u30D5\u30A3\u30EB\u30BF\u30FC\u306E\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u8868\u793A\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_searchCategoryBoosts: "\u9078\u629E\u3057\u305F\u30AB\u30C6\u30B4\u30EA\u306E\u95A2\u9023\u6027\u3092\u9AD8\u3081\u308B\u305F\u3081\u306B\u691C\u7D22\u3092\u8A2D\u5B9A\u3059\u308B",
  help_searchGroupBoosts: "\u9078\u629E\u3057\u305F\u7A2E\u985E\uFF08\u4F8B\uFF1A\u300C\u30AF\u30E9\u30B9\u300D\uFF09\u306E\u95A2\u9023\u6027\u3092\u9AD8\u3081\u308B\u3088\u3046\u306B\u691C\u7D22\u3092\u8A2D\u5B9A\u3057\u307E\u3059",
  help_jsDocCompatibility: "JSDoc\u30B3\u30E1\u30F3\u30C8\u3068\u306E\u985E\u4F3C\u6027\u3092\u9AD8\u3081\u308B\u30B3\u30E1\u30F3\u30C8\u89E3\u6790\u306E\u4E92\u63DB\u6027\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u8A2D\u5B9A\u3057\u307E\u3059",
  help_commentStyle: "TypeDoc \u304C\u30B3\u30E1\u30F3\u30C8\u3092\u691C\u7D22\u3059\u308B\u65B9\u6CD5\u3092\u6C7A\u5B9A\u3057\u307E\u3059",
  help_useTsLinkResolution: "@link\u30BF\u30B0\u304C\u6307\u3059\u5834\u6240\u3092\u6C7A\u5B9A\u3059\u308B\u969B\u306BTypeScript\u306E\u30EA\u30F3\u30AF\u89E3\u6C7A\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002\u3053\u308C\u306FJSDoc\u30B9\u30BF\u30A4\u30EB\u306E\u30B3\u30E1\u30F3\u30C8\u306B\u306E\u307F\u9069\u7528\u3055\u308C\u307E\u3059\u3002",
  help_preserveLinkText: "\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001\u30EA\u30F3\u30AF\u30C6\u30AD\u30B9\u30C8\u306E\u306A\u3044@link\u30BF\u30B0\u306F\u30C6\u30AD\u30B9\u30C8\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u30EA\u30F3\u30AF\u3068\u3057\u3066\u4F7F\u7528\u3057\u307E\u3059\u3002\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001\u30BF\u30FC\u30B2\u30C3\u30C8\u30EA\u30D5\u30EC\u30AF\u30B7\u30E7\u30F3\u540D\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
  help_blockTags: "\u30B3\u30E1\u30F3\u30C8\u3092\u89E3\u6790\u3059\u308B\u3068\u304D\u306B TypeDoc \u304C\u8A8D\u8B58\u3059\u308B\u30D6\u30ED\u30C3\u30AF\u30BF\u30B0",
  help_inlineTags: "TypeDoc \u304C\u30B3\u30E1\u30F3\u30C8\u3092\u89E3\u6790\u3059\u308B\u969B\u306B\u8A8D\u8B58\u3059\u308B\u30A4\u30F3\u30E9\u30A4\u30F3\u30BF\u30B0",
  help_modifierTags: "TypeDoc \u304C\u30B3\u30E1\u30F3\u30C8\u3092\u89E3\u6790\u3059\u308B\u969B\u306B\u8A8D\u8B58\u3059\u308B\u4FEE\u98FE\u30BF\u30B0",
  help_categorizeByGroup: "\u30B0\u30EB\u30FC\u30D7\u30EC\u30D9\u30EB\u3067\u5206\u985E\u3092\u884C\u3046\u304B\u3069\u3046\u304B\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_defaultCategory: "\u30AB\u30C6\u30B4\u30EA\u306E\u306A\u3044\u53CD\u5C04\u306E\u30C7\u30D5\u30A9\u30EB\u30C8\u30AB\u30C6\u30B4\u30EA\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_categoryOrder: "\u30AB\u30C6\u30B4\u30EA\u306E\u8868\u793A\u9806\u5E8F\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002* \u306F\u30EA\u30B9\u30C8\u306B\u306A\u3044\u30AB\u30C6\u30B4\u30EA\u306E\u76F8\u5BFE\u9806\u5E8F\u3092\u793A\u3057\u307E\u3059\u3002",
  help_groupOrder: "\u30B0\u30EB\u30FC\u30D7\u306E\u8868\u793A\u9806\u5E8F\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002* \u306F\u30EA\u30B9\u30C8\u306B\u306A\u3044\u30B0\u30EB\u30FC\u30D7\u306E\u76F8\u5BFE\u9806\u5E8F\u3092\u793A\u3057\u307E\u3059\u3002",
  help_sort: "\u6587\u66F8\u5316\u3055\u308C\u305F\u5024\u306E\u30BD\u30FC\u30C8\u6226\u7565\u3092\u6307\u5B9A\u3059\u308B",
  help_sortEntryPoints: "\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001\u30A8\u30F3\u30C8\u30EA\u30DD\u30A4\u30F3\u30C8\u306F\u4ED6\u306E\u30EA\u30D5\u30EC\u30AF\u30B7\u30E7\u30F3\u3068\u540C\u3058\u30BD\u30FC\u30C8\u30EB\u30FC\u30EB\u306B\u5F93\u3044\u307E\u3059\u3002",
  help_kindSortOrder: "\u300Ckind\u300D\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001\u53CD\u5C04\u306E\u30BD\u30FC\u30C8\u9806\u3092\u6307\u5B9A\u3057\u307E\u3059",
  help_watch: "\u30D5\u30A1\u30A4\u30EB\u306E\u5909\u66F4\u3092\u76E3\u8996\u3057\u3001\u5909\u66F4\u304C\u3042\u3063\u305F\u5834\u5408\u306F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3092\u518D\u69CB\u7BC9\u3059\u308B",
  help_preserveWatchOutput: "\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u5834\u5408\u3001TypeDoc \u306F\u30B3\u30F3\u30D1\u30A4\u30EB\u5B9F\u884C\u9593\u3067\u753B\u9762\u3092\u30AF\u30EA\u30A2\u3057\u307E\u305B\u3093\u3002",
  help_skipErrorChecking: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u3092\u751F\u6210\u3059\u308B\u524D\u306BTypeScript\u306E\u578B\u30C1\u30A7\u30C3\u30AF\u3092\u5B9F\u884C\u3057\u306A\u3044",
  help_help: "\u3053\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5370\u5237\u3059\u308B",
  help_version: "TypeDoc\u306E\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u5370\u5237",
  help_showConfig: "\u89E3\u6C7A\u3055\u308C\u305F\u69CB\u6210\u3092\u5370\u5237\u3057\u3066\u7D42\u4E86\u3059\u308B",
  help_plugin: "\u30ED\u30FC\u30C9\u3059\u308Bnpm\u30D7\u30E9\u30B0\u30A4\u30F3\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002\u7701\u7565\u3059\u308B\u3068\u3001\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3055\u308C\u3066\u3044\u308B\u3059\u3079\u3066\u306E\u30D7\u30E9\u30B0\u30A4\u30F3\u304C\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059\u3002",
  help_logLevel: "\u4F7F\u7528\u3059\u308B\u30ED\u30B0\u30EC\u30D9\u30EB\u3092\u6307\u5B9A\u3059\u308B",
  help_treatWarningsAsErrors: "\u8A2D\u5B9A\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E\u8B66\u544A\u304C\u30A8\u30E9\u30FC\u3068\u3057\u3066\u6271\u308F\u308C\u307E\u3059",
  help_treatValidationWarningsAsErrors: "\u8A2D\u5B9A\u3059\u308B\u3068\u3001\u691C\u8A3C\u4E2D\u306B\u767A\u884C\u3055\u308C\u305F\u8B66\u544A\u306F\u30A8\u30E9\u30FC\u3068\u3057\u3066\u6271\u308F\u308C\u307E\u3059\u3002\u3053\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u306F\u3001\u691C\u8A3C\u8B66\u544A\u306E treatWarningsAsErrors \u3092\u7121\u52B9\u306B\u3059\u308B\u305F\u3081\u306B\u4F7F\u7528\u3059\u308B\u3053\u3068\u306F\u3067\u304D\u307E\u305B\u3093\u3002",
  help_intentionallyNotExported: "\u300C\u53C2\u7167\u3055\u308C\u3066\u3044\u308B\u304C\u6587\u66F8\u5316\u3055\u308C\u3066\u3044\u306A\u3044\u300D\u3068\u3044\u3046\u8B66\u544A\u3092\u751F\u6210\u3057\u306A\u3044\u30BF\u30A4\u30D7\u306E\u30EA\u30B9\u30C8",
  help_requiredToBeDocumented: "\u6587\u66F8\u5316\u3059\u308B\u5FC5\u8981\u304C\u3042\u308B\u53CD\u5C04\u306E\u7A2E\u985E\u306E\u30EA\u30B9\u30C8",
  help_validation: "\u751F\u6210\u3055\u308C\u305F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u306B\u5BFE\u3057\u3066 TypeDoc \u304C\u5B9F\u884C\u3059\u308B\u691C\u8A3C\u624B\u9806\u3092\u6307\u5B9A\u3057\u307E\u3059\u3002",
  unknown_option_0_you_may_have_meant_1: "\u4E0D\u660E\u306A\u30AA\u30D7\u30B7\u30E7\u30F3 '{0}' \u6B21\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u3092\u610F\u5473\u3057\u3066\u3044\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059:\n{1}",
  option_0_must_be_between_1_and_2: "{0} \u306F {1} \u3068 {2} \u306E\u9593\u3067\u306A\u3051\u308C\u3070\u306A\u308A\u307E\u305B\u3093",
  option_0_must_be_equal_to_or_greater_than_1: "{0} \u306F {1} \u4EE5\u4E0A\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_must_be_less_than_or_equal_to_1: "{0} \u306F {1} \u4EE5\u4E0B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_must_be_one_of_1: "{0} \u306F {1} \u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  flag_0_is_not_valid_for_1_expected_2: "\u30D5\u30E9\u30B0 '{0}' \u306F {1} \u306B\u5BFE\u3057\u3066\u6709\u52B9\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002{2} \u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
  expected_object_with_flag_values_for_0: "{0} \u307E\u305F\u306F true/false \u306E\u30D5\u30E9\u30B0\u5024\u3092\u6301\u3064\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u304C\u5FC5\u8981\u3067\u3059",
  flag_values_for_0_must_be_booleans: "{0} \u306E\u30D5\u30E9\u30B0\u5024\u306F\u30D6\u30FC\u30EB\u5024\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  locales_must_be_an_object: `'locales' \u30AA\u30D7\u30B7\u30E7\u30F3\u306F\u3001\u6B21\u306E\u3088\u3046\u306A\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u306B\u8A2D\u5B9A\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059: { en: { theme_implements: "Implements" }}`,
  exclude_not_documented_specified_0_valid_values_are_1: "excludeNotDocumentedKinds \u306F\u65E2\u77E5\u306E\u5024\u306E\u307F\u3092\u6307\u5B9A\u3067\u304D\u307E\u3059\u304C\u3001\u7121\u52B9\u306A\u5024\u304C\u6307\u5B9A\u3055\u308C\u307E\u3057\u305F ({0})\u3002\u6709\u52B9\u306A\u7A2E\u985E\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059:\n{1}",
  external_symbol_link_mappings_must_be_object: "externalSymbolLinkMappings \u306F\u3001Record<\u30D1\u30C3\u30B1\u30FC\u30B8\u540D\u3001Record<\u30B7\u30F3\u30DC\u30EB\u540D\u3001\u30EA\u30F3\u30AF>> \u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
  highlight_theme_0_must_be_one_of_1: "{0} \u306F\u6B21\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059: {1}",
  highlightLanguages_contains_invalid_languages_0: "highlightLanguages \u306B\u7121\u52B9\u306A\u8A00\u8A9E\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059: {0}\u3002\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u308B\u8A00\u8A9E\u306E\u30EA\u30B9\u30C8\u306B\u3064\u3044\u3066\u306F typedoc --help \u3092\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044",
  hostedBaseUrl_must_start_with_http: "hostedBaseUrl \u306F http:// \u307E\u305F\u306F https:// \u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl: "useHostedBaseUrlForAbsoluteLinks\u30AA\u30D7\u30B7\u30E7\u30F3\u3067\u306FhostedBaseUrl\u3092\u8A2D\u5B9A\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_must_be_an_object: "'{0}' \u30AA\u30D7\u30B7\u30E7\u30F3\u306F\u914D\u5217\u4EE5\u5916\u306E\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_must_be_a_function: "'{0}' \u30AA\u30D7\u30B7\u30E7\u30F3\u306F\u95A2\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_must_be_object_with_urls: "{0} \u306F\u3001\u30AD\u30FC\u3068\u3057\u3066\u6587\u5B57\u5217\u30E9\u30D9\u30EB\u3001URL \u5024\u3068\u3057\u3066\u6587\u5B57\u5217\u30E9\u30D9\u30EB\u3092\u6301\u3064\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
  visibility_filters_only_include_0: "visibilityFilters \u306B\u306F\u3001\u6B21\u306E\u975E @ \u30AD\u30FC\u306E\u307F\u3092\u542B\u3081\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059: {0}",
  visibility_filters_must_be_booleans: "visibilityFilters \u306E\u3059\u3079\u3066\u306E\u5024\u306F\u30D6\u30FC\u30EB\u5024\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_values_must_be_numbers: "{0} \u306E\u3059\u3079\u3066\u306E\u5024\u306F\u6570\u5024\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_values_must_be_array_of_tags: "{0} \u306F\u6709\u52B9\u306A\u30BF\u30B0\u540D\u306E\u914D\u5217\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059",
  option_0_specified_1_but_only_2_is_valid: "{0} \u306F\u65E2\u77E5\u306E\u5024\u306E\u307F\u3092\u6307\u5B9A\u3067\u304D\u307E\u3059\u304C\u3001\u7121\u52B9\u306A\u5024\u304C\u6307\u5B9A\u3055\u308C\u307E\u3057\u305F ({1})\u3002\u6709\u52B9\u306A\u4E26\u3079\u66FF\u3048\u6226\u7565\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059:\n{2}",
  kind_project: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8",
  kind_module: "\u30E2\u30B8\u30E5\u30FC\u30EB",
  kind_namespace: "\u540D\u524D\u7A7A\u9593",
  kind_enum: "\u5217\u6319",
  kind_enum_member: "\u5217\u6319\u30E1\u30F3\u30D0\u30FC",
  kind_variable: "\u5909\u6570",
  kind_function: "\u95A2\u6570",
  kind_class: "\u30AF\u30E9\u30B9",
  kind_interface: "\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30A4\u30B9",
  kind_constructor: "\u30B3\u30F3\u30B9\u30C8\u30E9\u30AF\u30BF\u30FC",
  kind_property: "\u30D5\u309A\u30ED\u30D1\u30C6\u30A3",
  kind_method: "\u30E1\u30BD\u30C3\u30C9",
  kind_call_signature: "\u30B3\u30FC\u30EB\u30B7\u30B0\u30CD\u30C1\u30E3",
  kind_index_signature: "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u30B7\u30B0\u30CD\u30C1\u30E3",
  kind_constructor_signature: "\u30B3\u30F3\u30B9\u30C8\u30E9\u30AF\u30BF\u30FC\u30B7\u30B0\u30CD\u30C1\u30E3",
  kind_parameter: "\u30D1\u30E9\u30E1\u30FC\u30BF\u30FC",
  kind_type_literal: "\u578B\u30EA\u30C6\u30E9\u30EB",
  kind_type_parameter: "\u578B\u30D1\u30E9\u30E1\u30FC\u30BF\u30FC",
  kind_accessor: "\u30A2\u30AF\u30BB\u30C3\u30B5\u30FC",
  kind_get_signature: "\u7F72\u540D\u3092\u53D6\u5F97\u3059\u308B",
  kind_set_signature: "\u7F72\u540D\u3092\u8A2D\u5B9A\u3059\u308B",
  kind_type_alias: "\u578B\u30A8\u30A4\u30EA\u30A2\u30B9",
  kind_reference: "\u30EA\u30D5\u30A1\u30EC\u30F3\u30B9",
  kind_document: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8",
  kind_plural_project: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8",
  kind_plural_module: "\u30E2\u30B8\u30E5\u30FC\u30EB",
  kind_plural_namespace: "\u540D\u524D\u7A7A\u9593",
  kind_plural_enum: "\u5217\u6319",
  kind_plural_enum_member: "\u5217\u6319\u30E1\u30F3\u30D0\u30FC",
  kind_plural_variable: "\u5909\u6570",
  kind_plural_function: "\u95A2\u6570",
  kind_plural_class: "\u30AF\u30E9\u30B9",
  kind_plural_interface: "\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30A4\u30B9",
  kind_plural_constructor: "\u30B3\u30F3\u30B9\u30C8\u30E9\u30AF\u30BF\u30FC",
  kind_plural_property: "\u30D5\u309A\u30ED\u30D1\u30C6\u30A3",
  kind_plural_method: "\u30E1\u30BD\u30C3\u30C9",
  kind_plural_call_signature: "\u30B3\u30FC\u30EB\u30B7\u30B0\u30CD\u30C1\u30E3",
  kind_plural_index_signature: "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u30B7\u30B0\u30CD\u30C1\u30E3",
  kind_plural_constructor_signature: "\u30B3\u30F3\u30B9\u30C8\u30E9\u30AF\u30BF\u30FC\u30B7\u30B0\u30CD\u30C1\u30E3",
  kind_plural_parameter: "\u30D1\u30E9\u30E1\u30FC\u30BF",
  kind_plural_type_literal: "\u578B\u30EA\u30C6\u30E9\u30EB",
  kind_plural_type_parameter: "\u578B\u30D1\u30E9\u30E1\u30FC\u30BF\u30FC",
  kind_plural_accessor: "\u30A2\u30AF\u30BB\u30C3\u30B5\u30FC",
  kind_plural_get_signature: "\u7F72\u540D\u3092\u53D6\u5F97\u3059\u308B",
  kind_plural_set_signature: "\u7F72\u540D\u3092\u8A2D\u5B9A\u3059\u308B",
  kind_plural_type_alias: "\u578B\u30A8\u30A4\u30EA\u30A2\u30B9",
  kind_plural_reference: "\u30EA\u30D5\u30A1\u30EC\u30F3\u30B9",
  kind_plural_document: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8",
  flag_protected: "\u4FDD\u8B77",
  flag_private: "\u975E\u516C\u958B",
  flag_external: "\u5916\u90E8",
  flag_inherited: "\u7D99\u627F",
  flag_public: "\u516C\u958B",
  flag_static: "\u9759\u7684",
  flag_optional: "\u30AA\u30D7\u30B7\u30E7\u30F3",
  flag_rest: "REST \u30D1\u30E9\u30E1\u30FC\u30BF",
  flag_abstract: "\u62BD\u8C61",
  flag_const: "\u5B9A\u6570",
  flag_readonly: "\u8AAD\u307F\u53D6\u308A\u5C02\u7528",
  theme_implements: "\u5B9F\u88C5",
  theme_indexable: "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u53EF\u80FD",
  theme_type_declaration: "\u578B\u5BA3\u8A00",
  theme_index: "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9",
  theme_hierarchy: "\u968E\u5C64",
  theme_implemented_by: "\u5B9F\u88C5\u8005",
  theme_defined_in: "\u5B9A\u7FA9",
  theme_implementation_of: "\u306E\u5B9F\u88C5",
  theme_inherited_from: "\u7D99\u627F\u5143",
  theme_overrides: "\u4E0A\u66F8\u304D",
  theme_returns: "\u623B\u308A\u5024",
  theme_generated_using_typedoc: "TypeDoc\u3092\u4F7F\u7528\u3057\u3066\u751F\u6210",
  theme_preparing_search_index: "\u691C\u7D22\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u3092\u6E96\u5099\u3057\u3066\u3044\u307E\u3059...",
  theme_search_index_not_available: "\u691C\u7D22\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u306F\u5229\u7528\u3067\u304D\u307E\u305B\u3093",
  theme_settings: "\u30C6\u30FC\u30DE\u8A2D\u5B9A",
  theme_member_visibility: "\u30E1\u30F3\u30D0\u30FC\u306E\u53EF\u8996\u6027",
  theme_theme: "\u914D\u8272",
  theme_os: "\u81EA\u52D5",
  theme_light: "\u30E9\u30A4\u30C8",
  theme_dark: "\u30C0\u30FC\u30AF",
  theme_on_this_page: "\u3053\u306E\u30DA\u30FC\u30B8",
  theme_search: "\u691C\u7D22",
  theme_menu: "\u30E1\u30CB\u30E5\u30FC",
  theme_permalink: "\u30D1\u30FC\u30DE\u30EA\u30F3\u30AF",
  tag_see: "\u53C2\u7167",
  tag_group: "\u6240\u5C5E\u30B0\u30EB\u30FC\u30D7",
  tag_example: "\u4F8B",
  theme_copy: "\u30B3\u30D4\u30FC",
  theme_copied: "\u30B3\u30D4\u30FC\u5B8C\u4E86\uFF01",
  theme_normally_hidden: "\u3053\u306E\u30E1\u30F3\u30D0\u30FC\u306F\u3001\u30D5\u30A3\u30EB\u30BF\u30FC\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u901A\u5E38\u306F\u975E\u8868\u793A\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002",
  theme_loading: "\u8AAD\u307F\u8FBC\u307F\u4E2D..."
});

// src/lib/internationalization/locales/ko.ts
var ko_default = buildIncompleteTranslation({
  // output_0_could_not_be_generated
  // output_0_generated_at_1
  no_entry_points_for_packages: "\uD328\uD0A4\uC9C0 \uBAA8\uB4DC\uC5D0 \uB300\uD55C \uC9C4\uC785\uC810\uC774 \uC81C\uACF5\uB418\uC9C0 \uC54A\uC558\uC73C\uBBC0\uB85C \uBB38\uC11C\uB97C \uC0DD\uC131\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
  failed_to_find_packages: "\uD328\uD0A4\uC9C0\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC801\uC5B4\uB3C4 \uD558\uB098\uC758 \uB514\uB809\uD130\uB9AC\uB97C package.json\uC744 \uD3EC\uD568\uD558\uB294 \uC9C4\uC785\uC810\uC73C\uB85C \uC81C\uACF5\uD588\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694",
  nested_packages_unsupported_0: "{0} \uD504\uB85C\uC81D\uD2B8\uC758 entryPointStrategy\uAC00 \uD328\uD0A4\uC9C0\uC778\uB370 \uC911\uCCA9\uB41C \uD328\uD0A4\uC9C0\uB294 \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  previous_error_occurred_when_reading_options_for_0: "{0} \uC704\uCE58\uC758 \uD328\uD0A4\uC9C0 \uC635\uC158\uC744 \uC77D\uB294 \uC911\uC5D0 \uC774\uC804 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4",
  converting_project_at_0: "{0} \uC704\uCE58\uC758 \uD504\uB85C\uC81D\uD2B8 \uBCC0\uD658 \uC911",
  failed_to_convert_packages: "\uD558\uB098 \uC774\uC0C1\uC758 \uD328\uD0A4\uC9C0\uB97C \uBCC0\uD658\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uACB0\uACFC\uAC00 \uBCD1\uD569\uB418\uC9C0 \uC54A\uC744 \uAC83\uC785\uB2C8\uB2E4",
  merging_converted_projects: "\uBCC0\uD658\uB41C \uD504\uB85C\uC81D\uD2B8 \uBCD1\uD569 \uC911",
  no_entry_points_to_merge: "\uBCD1\uD569\uD560 \uC9C4\uC785\uC810\uC774 \uC81C\uACF5\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4",
  entrypoint_did_not_match_files_0: "\uC9C4\uC785\uC810 \uAE00\uB85C\uBE0C {0}\uC774(\uAC00) \uC5B4\uB5A4 \uD30C\uC77C\uACFC\uB3C4 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4",
  frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values: "{0}\uC758 Frontmatter children\uC740 \uBB38\uC790\uC5F4 \uBC30\uC5F4\uC774\uB098 \uBB38\uC790\uC5F4 \uAC12\uC744 \uAC16\uB294 \uAC1D\uCCB4\uC5EC\uC57C \uD569\uB2C8\uB2E4",
  inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0: "{0} \uC704\uCE58\uC758 \uC8FC\uC11D\uC5D0\uC11C \uC778\uB77C\uC778 @inheritDoc \uD0DC\uADF8\uB294 \uBE14\uB85D \uD0DC\uADF8 \uC548\uC5D0 \uB098\uD0C0\uB098\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4",
  at_most_one_remarks_tag_expected_in_comment_at_0: "\uC8FC\uC11D\uC5D0\uC11C @remarks \uD0DC\uADF8\uB294 \uCD5C\uB300 \uD558\uB098\uB9CC \uC608\uC0C1\uB429\uB2C8\uB2E4. {0}",
  at_most_one_returns_tag_expected_in_comment_at_0: "\uC8FC\uC11D\uC5D0\uC11C @returns \uD0DC\uADF8\uB294 \uCD5C\uB300 \uD558\uB098\uB9CC \uC608\uC0C1\uB429\uB2C8\uB2E4. {0}",
  at_most_one_inheritdoc_tag_expected_in_comment_at_0: "\uC8FC\uC11D\uC5D0\uC11C @inheritDoc \uD0DC\uADF8\uB294 \uCD5C\uB300 \uD558\uB098\uB9CC \uC608\uC0C1\uB429\uB2C8\uB2E4. {0}",
  content_in_summary_overwritten_by_inheritdoc_in_comment_at_0: "\uC8FC\uC11D\uC5D0\uC11C \uC694\uC57D \uBD80\uBD84\uC758 \uB0B4\uC6A9\uC774 @inheritDoc \uD0DC\uADF8\uC5D0 \uC758\uD574 \uB36E\uC5B4\uC4F0\uC5EC\uC9D1\uB2C8\uB2E4. {0}",
  content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0: "\uC8FC\uC11D\uC5D0\uC11C @remarks \uBE14\uB85D\uC758 \uB0B4\uC6A9\uC774 @inheritDoc \uD0DC\uADF8\uC5D0 \uC758\uD574 \uB36E\uC5B4\uC4F0\uC5EC\uC9D1\uB2C8\uB2E4. {0}",
  example_tag_literal_name: "\uC608\uC81C \uD0DC\uADF8\uC758 \uCCAB \uBC88\uC9F8 \uC904\uC740 \uC608\uC81C \uC774\uB984\uC73C\uB85C \uC0AC\uC6A9\uB429\uB2C8\uB2E4. \uD14D\uC2A4\uD2B8\uB9CC \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4",
  inheritdoc_tag_properly_capitalized: "@inheritDoc \uD0DC\uADF8\uB294 \uC62C\uBC14\uB974\uAC8C \uB300\uBB38\uC790\uD654\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4",
  invalid_intentionally_not_exported_symbols_0: "\uB2E4\uC74C \uC2EC\uBCFC\uC740 \uC758\uB3C4\uC801\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC9C0 \uC54A\uC558\uC9C0\uB9CC \uBB38\uC11C\uD654\uC5D0\uC11C \uCC38\uC870\uB418\uC9C0 \uC54A\uC558\uAC70\uB098 \uB0B4\uBCF4\uB0B4\uC84C\uC2B5\uB2C8\uB2E4:\n	{0}",
  defaulting_project_name: '--name \uC635\uC158\uC774 \uC9C0\uC815\uB418\uC9C0 \uC54A\uC558\uACE0 package.json\uB3C4 \uBC1C\uACAC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 "Documentation"\uC73C\uB85C \uAE30\uBCF8 \uC124\uC815\uD569\uB2C8\uB2E4',
  // no_entry_points_provided:
  unable_to_find_any_entry_points: "\uC5B4\uB5A4 \uC9C4\uC785\uC810\uB3C4 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC774\uC804 \uACBD\uACE0\uB97C \uD655\uC778\uD558\uC138\uC694",
  watch_does_not_support_packages_mode: "\uC6CC\uCE58 \uBAA8\uB4DC\uB294 'packages' \uC2A4\uD0C0\uC77C \uC9C4\uC785\uC810\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  watch_does_not_support_merge_mode: "\uC6CC\uCE58 \uBAA8\uB4DC\uB294 'merge' \uC2A4\uD0C0\uC77C \uC9C4\uC785\uC810\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  help_options: "\uB85C\uB4DC\uD560 JSON \uC635\uC158 \uD30C\uC77C\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. \uC9C0\uC815\uD558\uC9C0 \uC54A\uC73C\uBA74 TypeDoc\uC740 \uD604\uC7AC \uB514\uB809\uD130\uB9AC\uC758 'typedoc.json'\uC744 \uCC3E\uC2B5\uB2C8\uB2E4",
  help_tsconfig: "\uB85C\uB4DC\uD560 TypeScript \uAD6C\uC131 \uD30C\uC77C\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. \uC9C0\uC815\uD558\uC9C0 \uC54A\uC73C\uBA74 TypeDoc\uC740 \uD604\uC7AC \uB514\uB809\uD130\uB9AC\uC758 'tsconfig.json'\uC744 \uCC3E\uC2B5\uB2C8\uB2E4",
  help_compilerOptions: "TypeDoc\uC774 \uC0AC\uC6A9\uD560 TypeScript \uCEF4\uD30C\uC77C\uB7EC \uC635\uC158\uC744 \uC120\uD0DD\uC801\uC73C\uB85C \uC7AC\uC815\uC758\uD569\uB2C8\uB2E4",
  help_lang: "\uC0DD\uC131 \uBC0F TypeDoc \uBA54\uC2DC\uC9C0\uC5D0 \uC0AC\uC6A9\uD560 \uC5B8\uC5B4\uB97C \uC124\uC815\uD569\uB2C8\uB2E4",
  help_locales: "\uD2B9\uC815 \uB85C\uCF00\uC77C\uC5D0 \uB300\uD55C \uBC88\uC5ED\uC744 \uCD94\uAC00\uD569\uB2C8\uB2E4. \uC774 \uC635\uC158\uC740 \uC8FC\uB85C TypeDoc\uC5D0\uC11C \uACF5\uC2DD \uB85C\uCF00\uC77C \uC9C0\uC6D0\uC774 \uCD94\uAC00\uB420 \uB54C\uAE4C\uC9C0 \uC784\uC2DC \uBC29\uD3B8\uC73C\uB85C \uC0AC\uC6A9\uB429\uB2C8\uB2E4",
  help_packageOptions: "entryPointStrategy\uAC00 \uD328\uD0A4\uC9C0\uB85C \uC124\uC815\uB41C \uACBD\uC6B0 \uAC01 \uD328\uD0A4\uC9C0\uC5D0 \uC124\uC815\uB420 \uC635\uC158\uC744 \uC124\uC815\uD569\uB2C8\uB2E4",
  help_entryPoints: "\uBB38\uC11C\uD654\uD560 \uC9C4\uC785\uC810\uC785\uB2C8\uB2E4",
  help_entryPointStrategy: "\uC9C4\uC785\uC810\uC744 \uBB38\uC11C \uBAA8\uB4C8\uB85C \uBCC0\uD658\uD558\uB294 \uB370 \uC0AC\uC6A9\uD560 \uC804\uB7B5\uC785\uB2C8\uB2E4",
  help_alwaysCreateEntryPointModule: "\uC124\uC815 \uC2DC TypeDoc\uC740 \uD558\uB098\uC758 \uC9C4\uC785\uC810\uB9CC \uC81C\uACF5\uB418\uB354\uB77C\uB3C4 \uD56D\uC0C1 'Module'\uC744 \uC0DD\uC131\uD569\uB2C8\uB2E4",
  help_projectDocuments: "\uC0DD\uC131\uB41C \uBB38\uC11C\uC758 \uB8E8\uD2B8\uC5D0 \uCD94\uAC00\uB420 \uBB38\uC11C\uC785\uB2C8\uB2E4. \uBCF5\uC218 \uD30C\uC77C\uC744 \uB9E4\uCE58\uD558\uAE30 \uC704\uD55C \uAE00\uB85C\uBE0C\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4",
  help_exclude: "\uC9C4\uC785\uC810\uC73C\uB85C \uC9C0\uC815\uB41C \uB514\uB809\uD130\uB9AC \uD655\uC7A5 \uC2DC \uC81C\uC678\uD560 \uD328\uD134\uC744 \uC815\uC758\uD569\uB2C8\uB2E4",
  help_externalPattern: "\uC678\uBD80\uB85C \uAC04\uC8FC\uB420 \uD30C\uC77C \uD328\uD134\uC744 \uC815\uC758\uD569\uB2C8\uB2E4",
  help_excludeExternals: "\uC678\uBD80\uB85C \uD574\uACB0\uB41C \uC2EC\uBCFC\uC774 \uBB38\uC11C\uD654\uB418\uC9C0 \uC54A\uB3C4\uB85D \uBC29\uC9C0\uD569\uB2C8\uB2E4",
  help_excludeNotDocumented: "\uBA85\uC2DC\uC801\uC73C\uB85C \uBB38\uC11C\uD654\uB418\uC9C0 \uC54A\uC740 \uC2EC\uBCFC\uC774 \uACB0\uACFC\uC5D0 \uD45C\uC2DC\uB418\uC9C0 \uC54A\uB3C4\uB85D \uBC29\uC9C0\uD569\uB2C8\uB2E4",
  help_excludeNotDocumentedKinds: "excludeNotDocumented\uB85C \uC81C\uAC70\uB420 \uB9AC\uD50C\uB809\uC158 \uC720\uD615\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_excludeInternal: "@internal\uB85C \uD45C\uC2DC\uB41C \uC2EC\uBCFC\uC774 \uBB38\uC11C\uD654\uB418\uC9C0 \uC54A\uB3C4\uB85D \uBC29\uC9C0\uD569\uB2C8\uB2E4",
  help_excludeCategories: "\uBB38\uC11C\uC5D0\uC11C \uC81C\uC678\uD560 \uCE74\uD14C\uACE0\uB9AC \uB0B4\uC758 \uC2EC\uBCFC\uC744 \uC81C\uC678\uD569\uB2C8\uB2E4",
  help_excludeProtected: "\uBCF4\uD638\uB41C \uBCC0\uC218\uC640 \uBA54\uC11C\uB4DC\uB97C \uBB34\uC2DC\uD569\uB2C8\uB2E4",
  help_excludeReferences: "\uC2EC\uBCFC\uC774 \uC5EC\uB7EC \uBC88 \uB0B4\uBCF4\uB0B4\uC9C4 \uACBD\uC6B0 \uCCAB \uBC88\uC9F8 \uB0B4\uBCF4\uB0B4\uAE30\uB97C \uC81C\uC678\uD558\uACE0 \uBAA8\uB450 \uBB34\uC2DC\uD569\uB2C8\uB2E4",
  help_externalSymbolLinkMappings: "\uBB38\uC11C\uC5D0 \uD3EC\uD568\uB418\uC9C0 \uC54A\uC740 \uC2EC\uBCFC\uC5D0 \uB300\uD55C \uC0AC\uC6A9\uC790 \uC815\uC758 \uB9C1\uD06C\uB97C \uC815\uC758\uD569\uB2C8\uB2E4",
  // help_out
  // help_html
  help_json: "\uD504\uB85C\uC81D\uD2B8\uB97C \uC124\uBA85\uD558\uB294 JSON \uD30C\uC77C\uC758 \uC704\uCE58\uC640 \uD30C\uC77C \uC774\uB984\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_pretty: "\uCD9C\uB825 JSON\uC744 \uD0ED\uC73C\uB85C \uD3EC\uB9F7\uD305\uD560 \uC9C0 \uC5EC\uBD80\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_emit: "TypeDoc\uC774 \uC0DD\uC131\uD560 \uB0B4\uC6A9\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. 'docs', 'both', 'none' \uC911 \uD558\uB098\uB97C \uC120\uD0DD\uD569\uB2C8\uB2E4",
  help_theme: "\uBB38\uC11C\uB97C \uB80C\uB354\uB9C1\uD560 \uD14C\uB9C8 \uC774\uB984\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_lightHighlightTheme: "\uB77C\uC774\uD2B8 \uBAA8\uB4DC\uC5D0\uC11C \uCF54\uB4DC \uD558\uC774\uB77C\uC774\uD305 \uD14C\uB9C8\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_darkHighlightTheme: "\uB2E4\uD06C \uBAA8\uB4DC\uC5D0\uC11C \uCF54\uB4DC \uD558\uC774\uB77C\uC774\uD305 \uD14C\uB9C8\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_highlightLanguages: "\uB80C\uB354\uB9C1 \uC2DC \uCF54\uB4DC \uD558\uC774\uB77C\uC774\uD305\uC5D0 \uC0AC\uC6A9\uB420 \uC5B8\uC5B4\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_customCss: "\uD14C\uB9C8\uC5D0\uC11C \uAC00\uC838\uC62C \uC0AC\uC6A9\uC790 \uC9C0\uC815 CSS \uD30C\uC77C\uC758 \uACBD\uB85C",
  help_markdownItOptions: "TypeDoc\uC774 \uC0AC\uC6A9\uD558\uB294 markdown-it\uC5D0 \uC804\uB2EC\uD560 \uC635\uC158\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_markdownItLoader: "markdown-it \uC778\uC2A4\uD134\uC2A4\uB97C \uB85C\uB4DC\uD560 \uB54C \uD638\uCD9C\uB420 \uCF5C\uBC31\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. TypeDoc\uC774 \uC0AC\uC6A9\uD560 \uD30C\uC11C \uC778\uC2A4\uD134\uC2A4\uB97C \uC804\uB2EC\uBC1B\uC2B5\uB2C8\uB2E4",
  help_maxTypeConversionDepth: "\uBCC0\uD658\uB420 \uD0C0\uC785\uC758 \uCD5C\uB300 \uAE4A\uC774\uB97C \uC124\uC815\uD569\uB2C8\uB2E4",
  help_name: "\uD15C\uD50C\uB9BF \uD5E4\uB354\uC5D0 \uC0AC\uC6A9\uD560 \uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC124\uC815\uD569\uB2C8\uB2E4",
  help_includeVersion: "\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC5D0 \uD328\uD0A4\uC9C0 \uBC84\uC804\uC744 \uCD94\uAC00\uD569\uB2C8\uB2E4",
  help_disableSources: "\uBB38\uC11C\uD654\uD560 \uB54C \uB9AC\uD50C\uB809\uC158\uC758 \uC18C\uC2A4 \uC124\uC815\uC744 \uBE44\uD65C\uC131\uD654\uD569\uB2C8\uB2E4",
  help_sourceLinkTemplate: "\uC18C\uC2A4 URL \uC0DD\uC131 \uC2DC \uC0AC\uC6A9\uD560 \uB9C1\uD06C \uD15C\uD50C\uB9BF\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. \uC124\uC815\uD558\uC9C0 \uC54A\uC73C\uBA74 \uC790\uB3D9\uC73C\uB85C git \uC6D0\uACA9 \uC800\uC7A5\uC18C\uC5D0\uC11C \uC0DD\uC131\uB429\uB2C8\uB2E4. {path}, {line}, {gitRevision} \uD50C\uB808\uC774\uC2A4\uD640\uB354\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4",
  help_gitRevision: "GitHub/Bitbucket \uC18C\uC2A4 \uD30C\uC77C\uC5D0 \uB300\uD55C \uB9C1\uD06C\uB97C \uC0DD\uC131\uD560 \uB54C \uC0AC\uC6A9\uD560 \uD2B9\uC815 \uB9AC\uBE44\uC804\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. disableSources\uAC00 \uC124\uC815\uB41C \uACBD\uC6B0\uC5D0\uB9CC \uC720\uD6A8\uD569\uB2C8\uB2E4",
  help_gitRemote: "GitHub/Bitbucket \uC18C\uC2A4 \uD30C\uC77C\uC5D0 \uB300\uD55C \uB9C1\uD06C\uB97C \uC0DD\uC131\uD560 \uB54C \uC0AC\uC6A9\uD560 \uD2B9\uC815 \uC6D0\uACA9 \uC800\uC7A5\uC18C\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4. disableGit \uB610\uB294 disableSources\uAC00 \uC124\uC815\uB41C \uACBD\uC6B0\uC5D0\uB9CC \uC720\uD6A8\uD569\uB2C8\uB2E4",
  help_disableGit: "\uBAA8\uB4E0 \uAC83\uC744 sourceLinkTemplate\uB85C \uB9C1\uD06C\uD560 \uC218 \uC788\uB3C4\uB85D \uAC00\uC815\uD569\uB2C8\uB2E4. \uC774 \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 sourceLinkTemplate\uC774 \uC124\uC815\uB418\uC5B4 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4. {path}\uB294 basePath\uC5D0\uC11C \uC2DC\uC791\uB429\uB2C8\uB2E4",
  help_basePath: "\uD30C\uC77C \uACBD\uB85C\uB97C \uD45C\uC2DC\uD560 \uB54C \uC0AC\uC6A9\uD560 \uAE30\uBCF8 \uACBD\uB85C\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_excludeTags: "\uBB38\uC11C \uC8FC\uC11D\uC5D0\uC11C \uC81C\uAC70\uD560 \uBE14\uB85D/\uC218\uC815\uC790 \uD0DC\uADF8\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  // help_notRenderedTags
  help_readme: "\uC778\uB371\uC2A4 \uD398\uC774\uC9C0\uC5D0 \uD45C\uC2DC\uD560 readme \uD30C\uC77C\uC758 \uACBD\uB85C\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4. 'none'\uC744 \uC804\uB2EC\uD558\uC5EC \uC778\uB371\uC2A4 \uD398\uC774\uC9C0\uB97C \uBE44\uD65C\uC131\uD654\uD558\uACE0 \uAE00\uB85C\uBC8C \uD398\uC774\uC9C0\uC5D0\uC11C \uBB38\uC11C\uD654\uB97C \uC2DC\uC791\uD569\uB2C8\uB2E4",
  help_cname: "GitHub Pages\uC758 \uC0AC\uC6A9\uC790 \uC815\uC758 \uB3C4\uBA54\uC778\uC5D0 \uC720\uC6A9\uD55C CNAME \uD30C\uC77C \uD14D\uC2A4\uD2B8\uB97C \uC124\uC815\uD569\uB2C8\uB2E4",
  help_sourceLinkExternal: "\uC18C\uC2A4 \uB9C1\uD06C\uB97C \uC678\uBD80 \uB9C1\uD06C\uB85C \uCDE8\uAE09\uD558\uC5EC \uC0C8 \uD0ED\uC5D0\uC11C \uC5F4\uB3C4\uB85D \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_githubPages: "GitHub Pages\uC5D0\uC11C 404 \uC624\uB958\uB97C \uBC29\uC9C0\uD558\uAE30 \uC704\uD574 .nojekyll \uD30C\uC77C\uC744 \uC0DD\uC131\uD569\uB2C8\uB2E4. \uAE30\uBCF8\uAC12\uC740 `true`\uC785\uB2C8\uB2E4",
  help_hostedBaseUrl: "\uC0DD\uC131\uB41C sitemap.xml \uBC0F \uCD9C\uB825 \uD3F4\uB354\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uBCA0\uC774\uC2A4 URL\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. \uC9C0\uC815\uD558\uC9C0 \uC54A\uC73C\uBA74 sitemap\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  help_useHostedBaseUrlForAbsoluteLinks: "\uC0AC\uC774\uD2B8\uC758 \uD398\uC774\uC9C0\uC5D0 \uB300\uD574 hostedBaseUrl \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC808\uB300 \uB9C1\uD06C\uB97C \uC0DD\uC131\uD558\uB3C4\uB85D \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_hideGenerator: "\uD398\uC774\uC9C0 \uB05D\uC5D0 TypeDoc \uB9C1\uD06C\uB97C \uCD9C\uB825\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  help_customFooterHtml: "TypeDoc \uB9C1\uD06C \uB4A4\uC5D0 \uC0AC\uC6A9\uC790 \uC815\uC758 \uD478\uD130\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_customFooterHtmlDisableWrapper: "customFooterHtml\uC758 \uB798\uD37C \uC694\uC18C\uB97C \uBE44\uD65C\uC131\uD654\uD569\uB2C8\uB2E4",
  // help_hideTypesInSignatureTitle
  help_cacheBust: "\uC815\uC801 \uC790\uC0B0\uC758 \uB9C1\uD06C\uC5D0 \uC0DD\uC131 \uC2DC\uAC04\uC744 \uD3EC\uD568\uD569\uB2C8\uB2E4",
  help_searchInComments: "\uAC80\uC0C9 \uC778\uB371\uC2A4\uC5D0 \uC8FC\uC11D\uB3C4 \uD3EC\uD568\uD569\uB2C8\uB2E4. \uC774 \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uBA74 \uAC80\uC0C9 \uC778\uB371\uC2A4\uC758 \uD06C\uAE30\uAC00 \uD06C\uAC8C \uC99D\uAC00\uD569\uB2C8\uB2E4",
  help_searchInDocuments: "\uAC80\uC0C9 \uC778\uB371\uC2A4\uC5D0 \uBB38\uC11C\uB3C4 \uD3EC\uD568\uD569\uB2C8\uB2E4. \uC774 \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uBA74 \uAC80\uC0C9 \uC778\uB371\uC2A4\uC758 \uD06C\uAE30\uAC00 \uD06C\uAC8C \uC99D\uAC00\uD569\uB2C8\uB2E4",
  help_cleanOutputDir: "\uCD9C\uB825 \uB514\uB809\uD130\uB9AC\uB97C \uC791\uC131\uD558\uAE30 \uC804\uC5D0 TypeDoc\uC774 \uC81C\uAC70\uD558\uB3C4\uB85D \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_titleLink: "\uD5E4\uB354\uC758 \uC81C\uBAA9\uC774 \uAC00\uB9AC\uD0A4\uB294 \uB9C1\uD06C\uB97C \uC124\uC815\uD569\uB2C8\uB2E4. \uAE30\uBCF8\uAC12\uC740 \uBB38\uC11C \uD648\uD398\uC774\uC9C0\uC785\uB2C8\uB2E4",
  help_navigationLinks: "\uD5E4\uB354\uC5D0 \uD3EC\uD568\uB420 \uB9C1\uD06C\uB97C \uC815\uC758\uD569\uB2C8\uB2E4",
  help_sidebarLinks: "\uC0AC\uC774\uB4DC\uBC14\uC5D0 \uD3EC\uD568\uB420 \uB9C1\uD06C\uB97C \uC815\uC758\uD569\uB2C8\uB2E4",
  help_navigationLeaves: "\uD655\uC7A5\uB418\uC9C0 \uC54A\uC544\uC57C \uD560 \uB124\uBE44\uAC8C\uC774\uC158 \uD2B8\uB9AC\uC758 \uAC00\uC9C0\uB97C \uC815\uC758\uD569\uB2C8\uB2E4",
  help_navigation: "\uB124\uBE44\uAC8C\uC774\uC158 \uC0AC\uC774\uB4DC\uBC14\uC758 \uAD6C\uC131 \uBC29\uC2DD\uC744 \uACB0\uC815\uD569\uB2C8\uB2E4",
  help_visibilityFilters: "\uAE30\uBCF8 \uB0B4\uC7A5 \uD544\uD130 \uBC0F \uC218\uC815\uC790 \uD0DC\uADF8\uC5D0 \uB300\uD55C \uAE30\uBCF8 \uAC00\uC2DC\uC131\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_searchCategoryBoosts: "\uC120\uD0DD\uD55C \uCE74\uD14C\uACE0\uB9AC\uC5D0 \uB300\uD574 \uAC80\uC0C9\uC5D0\uC11C \uC911\uC694\uB3C4 \uBD80\uC2A4\uD2B8\uB97C \uAD6C\uC131\uD569\uB2C8\uB2E4",
  help_searchGroupBoosts: "\uC120\uD0DD\uD55C \uC885\uB958(\uC608: '\uD074\uB798\uC2A4')\uC5D0 \uB300\uD574 \uAC80\uC0C9\uC5D0\uC11C \uC911\uC694\uB3C4 \uBD80\uC2A4\uD2B8\uB97C \uAD6C\uC131\uD569\uB2C8\uB2E4",
  help_jsDocCompatibility: "JSDoc \uC8FC\uC11D\uACFC \uC720\uC0AC\uC131\uC744 \uB192\uC774\uAE30 \uC704\uD55C \uC8FC\uC11D \uD30C\uC2F1\uC758 \uD638\uD658\uC131 \uC635\uC158\uC744 \uC124\uC815\uD569\uB2C8\uB2E4",
  help_commentStyle: "TypeDoc\uC774 \uC8FC\uC11D\uC744 \uAC80\uC0C9\uD558\uB294 \uBC29\uC2DD\uC744 \uACB0\uC815\uD569\uB2C8\uB2E4",
  help_useTsLinkResolution: "TypeScript \uB9C1\uD06C \uD574\uACB0\uC744 \uC0AC\uC6A9\uD558\uC5EC @link \uD0DC\uADF8\uAC00 \uAC00\uB9AC\uD0A4\uB294 \uC704\uCE58\uB97C \uACB0\uC815\uD569\uB2C8\uB2E4. \uC774 \uC635\uC158\uC740 JSDoc \uC2A4\uD0C0\uC77C \uC8FC\uC11D\uC5D0\uB9CC \uC801\uC6A9\uB429\uB2C8\uB2E4",
  help_preserveLinkText: "\uB9C1\uD06C \uD14D\uC2A4\uD2B8\uAC00 \uC5C6\uB294 @link \uD0DC\uADF8\uB294 \uD14D\uC2A4\uD2B8 \uB0B4\uC6A9\uC744 \uB9C1\uD06C\uB85C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC124\uC815\uB418\uC9C0 \uC54A\uC73C\uBA74 \uB300\uC0C1 \uB9AC\uD50C\uB809\uC158 \uC774\uB984\uC744 \uC0AC\uC6A9\uD569\uB2C8\uB2E4",
  help_blockTags: "TypeDoc\uC774 \uC8FC\uC11D\uC744 \uD30C\uC2F1\uD560 \uB54C \uC778\uC2DD\uD560 \uBE14\uB85D \uD0DC\uADF8\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_inlineTags: "TypeDoc\uC774 \uC8FC\uC11D\uC744 \uD30C\uC2F1\uD560 \uB54C \uC778\uC2DD\uD560 \uC778\uB77C\uC778 \uD0DC\uADF8\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_modifierTags: "TypeDoc\uC774 \uC8FC\uC11D\uC744 \uD30C\uC2F1\uD560 \uB54C \uC778\uC2DD\uD560 \uC218\uC815\uC790 \uD0DC\uADF8\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_categorizeByGroup: "\uCE74\uD14C\uACE0\uB9AC\uD654\uAC00 \uADF8\uB8F9 \uC218\uC900\uC5D0\uC11C \uC218\uD589\uB420\uC9C0 \uC5EC\uBD80\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_defaultCategory: "\uCE74\uD14C\uACE0\uB9AC\uAC00 \uC9C0\uC815\uB418\uC9C0 \uC54A\uC740 \uB9AC\uD50C\uB809\uC158\uC758 \uAE30\uBCF8 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_categoryOrder: "\uCE74\uD14C\uACE0\uB9AC\uAC00 \uD45C\uC2DC\uB420 \uC21C\uC11C\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4. *\uC740 \uB9AC\uC2A4\uD2B8\uC5D0 \uC5C6\uB294 \uCE74\uD14C\uACE0\uB9AC\uC758 \uC0C1\uB300\uC801 \uC21C\uC11C\uB97C \uB098\uD0C0\uB0C5\uB2C8\uB2E4",
  help_groupOrder: "\uADF8\uB8F9\uC774 \uD45C\uC2DC\uB420 \uC21C\uC11C\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4. *\uC740 \uB9AC\uC2A4\uD2B8\uC5D0 \uC5C6\uB294 \uADF8\uB8F9\uC758 \uC0C1\uB300\uC801 \uC21C\uC11C\uB97C \uB098\uD0C0\uB0C5\uB2C8\uB2E4",
  help_sort: "\uBB38\uC11C\uD654\uB41C \uAC12\uC5D0 \uB300\uD55C \uC815\uB82C \uC804\uB7B5\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_sortEntryPoints: "\uC9C4\uC785\uC810\uC774 \uB2E4\uB978 \uB9AC\uD50C\uB809\uC158\uACFC \uB3D9\uC77C\uD55C \uC815\uB82C \uADDC\uCE59\uC744 \uB530\uB97C\uC9C0 \uC5EC\uBD80\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_kindSortOrder: "'kind'\uAC00 \uC9C0\uC815\uB41C \uACBD\uC6B0 \uB9AC\uD50C\uB809\uC158\uC758 \uC815\uB82C \uC21C\uC11C\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_watch: "\uD30C\uC77C \uBCC0\uACBD\uC744 \uAC10\uC9C0\uD558\uACE0 \uBB38\uC11C\uB97C \uB2E4\uC2DC \uBE4C\uB4DC\uD560\uC9C0 \uC5EC\uBD80\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_preserveWatchOutput: "TypeDoc\uC774 \uCEF4\uD30C\uC77C \uC2E4\uD589 \uAC04\uC5D0 \uD654\uBA74\uC744 \uC9C0\uC6B0\uC9C0 \uC54A\uB3C4\uB85D \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_skipErrorChecking: "TypeScript\uC758 \uD0C0\uC785 \uCCB4\uD06C\uB97C \uC2E4\uD589\uD558\uC9C0 \uC54A\uACE0 \uBB38\uC11C\uB97C \uC0DD\uC131\uD558\uC9C0 \uC54A\uB3C4\uB85D \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_help: "\uD574\uB2F9 \uBA54\uC2DC\uC9C0\uC744 \uCD9C\uB825\uD569\uB2C8\uB2E4",
  help_version: "TypeDoc\uC758 \uBC84\uC804\uC744 \uCD9C\uB825\uD569\uB2C8\uB2E4",
  help_showConfig: "\uD574\uACB0\uB41C \uAD6C\uC131\uC744 \uCD9C\uB825\uD558\uACE0 \uC885\uB8CC\uD569\uB2C8\uB2E4",
  help_plugin: "\uB85C\uB4DC\uD560 npm \uD50C\uB7EC\uADF8\uC778\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4. \uC0DD\uB7B5\uD558\uBA74 \uC124\uCE58\uB41C \uBAA8\uB4E0 \uD50C\uB7EC\uADF8\uC778\uC774 \uB85C\uB4DC\uB429\uB2C8\uB2E4",
  help_logLevel: "\uC0AC\uC6A9\uD560 \uB85C\uAE45 \uB808\uBCA8\uC744 \uC9C0\uC815\uD569\uB2C8\uB2E4",
  help_treatWarningsAsErrors: "\uBAA8\uB4E0 \uACBD\uACE0\uB97C \uC624\uB958\uB85C \uCC98\uB9AC\uD569\uB2C8\uB2E4",
  help_treatValidationWarningsAsErrors: "\uAC80\uC99D \uC911 \uACBD\uACE0\uB97C \uC624\uB958\uB85C \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uC774 \uC635\uC158\uC740 \uAC80\uC99D \uACBD\uACE0\uC5D0 \uB300\uD574 treatWarningsAsErrors\uB97C \uBE44\uD65C\uC131\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
  help_intentionallyNotExported: "'\uCC38\uC870\uB418\uC5C8\uC9C0\uB9CC \uBB38\uC11C\uD654\uB418\uC9C0 \uC54A\uC558\uC74C' \uACBD\uACE0\uB97C \uC0DD\uC131\uD558\uC9C0 \uC54A\uC744 \uC720\uD615\uC758 \uBAA9\uB85D",
  help_requiredToBeDocumented: "\uBB38\uC11C\uD654\uD574\uC57C \uD560 \uB9AC\uD50C\uB809\uC158 \uC885\uB958\uC758 \uBAA9\uB85D",
  help_validation: "\uC0DD\uC131\uB41C \uBB38\uC11C\uC5D0 \uB300\uD574 TypeDoc\uC774 \uC218\uD589\uD560 \uAC80\uC99D \uB2E8\uACC4\uB97C \uC9C0\uC815\uD569\uB2C8\uB2E4",
  option_0_must_be_between_1_and_2: "{0}\uC740(\uB294) {1}\uACFC(\uC640) {2} \uC0AC\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4",
  option_0_must_be_equal_to_or_greater_than_1: "{0}\uC740(\uB294) {1} \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4",
  option_0_must_be_less_than_or_equal_to_1: "{0}\uC740(\uB294) {1} \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4",
  option_0_must_be_one_of_1: "{0}\uC740(\uB294) \uB2E4\uC74C \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4: {1}",
  flag_0_is_not_valid_for_1_expected_2: "\uD50C\uB798\uADF8 '{0}'\uC740(\uB294) {1}\uC5D0 \uB300\uD574 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. {2} \uC911 \uD558\uB098\uAC00 \uC608\uC0C1\uB429\uB2C8\uB2E4",
  expected_object_with_flag_values_for_0: "{0}\uC5D0 \uB300\uD574 \uD50C\uB798\uADF8 \uAC12\uC774 \uD3EC\uD568\uB41C \uAC1D\uCCB4\uAC00 \uC608\uC0C1\uB429\uB2C8\uB2E4. true/false\uB3C4 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
  flag_values_for_0_must_be_booleans: "{0}\uC5D0 \uB300\uD55C \uD50C\uB798\uADF8 \uAC12\uC740 \uBD88\uB9AC\uC5B8\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4",
  locales_must_be_an_object: `'locales' \uC635\uC158\uC740 'en: { theme_implements: "Implements" }'\uC640 \uBE44\uC2B7\uD55C \uAC1D\uCCB4\uB85C \uC124\uC815\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4`,
  external_symbol_link_mappings_must_be_object: "externalSymbolLinkMappings\uB294 Record<package name, Record<symbol name, link>> \uD615\uD0DC\uC5EC\uC57C \uD569\uB2C8\uB2E4",
  highlight_theme_0_must_be_one_of_1: "{0}\uC740(\uB294) \uB2E4\uC74C \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4: {1}",
  highlightLanguages_contains_invalid_languages_0: "highlightLanguages\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC5B8\uC5B4\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4: {0}. \uC9C0\uC6D0\uD558\uB294 \uC5B8\uC5B4 \uBAA9\uB85D\uC744 \uD655\uC778\uD558\uB824\uBA74 typedoc --help\uB97C \uC2E4\uD589\uD558\uC138\uC694",
  hostedBaseUrl_must_start_with_http: "hostedBaseUrl\uC740 'http://' \uB610\uB294 'https://'\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4",
  useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl: "useHostedBaseUrlForAbsoluteLinks \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 hostedBaseUrl\uC774 \uC124\uC815\uB418\uC5B4 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4",
  option_0_must_be_an_object: "'{0}' \uC635\uC158\uC740 \uBC30\uC5F4\uC774 \uC544\uB2CC \uAC1D\uCCB4\uC5EC\uC57C \uD569\uB2C8\uB2E4",
  option_0_must_be_a_function: "'{0}' \uC635\uC158\uC740 \uD568\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4",
  option_0_values_must_be_numbers: "{0}\uC758 \uBAA8\uB4E0 \uAC12\uC740 \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4",
  option_0_values_must_be_array_of_tags: "{0}\uC740(\uB294) \uC720\uD6A8\uD55C \uD0DC\uADF8 \uC774\uB984 \uBC30\uC5F4\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4",
  loaded_multiple_times_0: "TypeDoc\uAC00 \uC5EC\uB7EC \uBC88 \uB85C\uB4DC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC77C\uBC18\uC801\uC73C\uB85C \uC790\uCCB4\uC801\uC73C\uB85C \uC124\uCE58\uB41C TypeDoc\uC744 \uAC00\uC9C4 \uD50C\uB7EC\uADF8\uC778\uB4E4\uC774 \uC774\uB97C \uC77C\uC73C\uD0B5\uB2C8\uB2E4. \uB85C\uB4DC\uB41C \uACBD\uB85C\uB294 \uB2E4\uC74C\uACFC \uAC19\uC2B5\uB2C8\uB2E4:\n	{0}",
  unsupported_ts_version_0: "\uC9C0\uC6D0\uB418\uC9C0 \uC54A\uB294 Typescript \uBC84\uC804\uC73C\uB85C \uC2E4\uD589 \uC911\uC785\uB2C8\uB2E4! TypeDoc\uC774 \uCDA9\uB3CC\uC774 \uC0DD\uAE30\uB294 \uACBD\uC6B0 \uC774\uAC83\uC774 \uADF8 \uC774\uC720\uAC00 \uB429\uB2C8\uB2E4. TypeDoc {0}\uC744 \uC9C0\uC6D0\uD569\uB2C8\uB2E4.",
  no_compiler_options_set: "\uCEF4\uD30C\uC77C\uB7EC \uC635\uC158\uC774 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC774\uB294 TypeDoc\uC774 tsconfig.json\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC74C\uC744 \uC758\uBBF8\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC0DD\uC131\uB41C \uBB38\uC11C\uB294 \uBE44\uC5B4 \uC788\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  loaded_plugin_0: `\uB85C\uB4DC\uB41C \uD50C\uB7EC\uADF8\uC778 {0}`,
  solution_not_supported_in_watch_mode: "\uC81C\uACF5\uB41C tsconfig \uD30C\uC77C\uC740 watch \uBAA8\uB4DC\uC5D0\uC11C \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uB294 \uC194\uB8E8\uC158 \uC2A4\uD0C0\uC77C tsconfig\uCC98\uB7FC \uBCF4\uC785\uB2C8\uB2E4.",
  strategy_not_supported_in_watch_mode: "watch \uBAA8\uB4DC\uC5D0\uC11C\uB294 EntryPointStrategy\uB97C \uD655\uC778 \uB610\uB294 \uD655\uC7A5\uC73C\uB85C \uC124\uC815\uD574\uC57C \uD569\uB2C8\uB2E4.",
  found_0_errors_and_1_warnings: "{0}\uAC1C\uC758 \uC624\uB958\uC640 {1}\uAC1C\uC758 \uACBD\uACE0\uB97C \uBC1C\uACAC\uD588\uC2B5\uB2C8\uB2E4.",
  // ReflectionFlag translations
  flag_private: "Private",
  flag_protected: "Protected",
  flag_public: "Public",
  flag_static: "Static",
  flag_external: "External",
  flag_optional: "Optional",
  flag_rest: "Rest",
  flag_abstract: "Abstract",
  flag_const: "Const",
  flag_readonly: "Readonly",
  flag_inherited: "Inherited",
  kind_project: "\uD504\uB85C\uC81D\uD2B8",
  kind_module: "\uBAA8\uB4C8",
  kind_namespace: "\uB124\uC784\uC2A4\uD398\uC774\uC2A4",
  kind_enum: "\uC5F4\uAC70\uD615",
  kind_enum_member: "\uD3EC\uD568\uB41C \uAC12",
  kind_variable: "\uBCC0\uC218",
  kind_function: "\uD568\uC218",
  kind_class: "\uD074\uB798\uC2A4",
  kind_interface: "\uC778\uD130\uD398\uC774\uC2A4",
  kind_constructor: "\uC0DD\uC131\uC790",
  kind_property: "\uC18D\uC131",
  kind_method: "\uBA54\uC18C\uB4DC",
  kind_call_signature: "\uD638\uCD9C \uC2DC\uADF8\uB2C8\uCCD0",
  kind_index_signature: "\uC778\uB371\uC2A4 \uC2DC\uADF8\uB2C8\uCCD0",
  kind_constructor_signature: "\uC0DD\uC131\uC790 \uC2DC\uADF8\uB2C8\uCCD0",
  kind_parameter: "\uB9E4\uAC1C\uBCC0\uC218",
  kind_type_literal: "\uD0C0\uC785 \uB9AC\uD130\uB7F4",
  kind_type_parameter: "\uD0C0\uC785 \uB9E4\uAC1C\uBCC0\uC218",
  kind_accessor: "\uC811\uADFC\uC790",
  kind_get_signature: "get \uC2DC\uADF8\uB2C8\uCCD0",
  kind_set_signature: "set \uC2DC\uADF8\uB2C8\uCCD0",
  kind_type_alias: "\uD0C0\uC785 \uBCC4\uCE6D",
  kind_reference: "\uCC38\uC870",
  kind_document: "\uBB38\uC11C",
  kind_plural_project: "\uD504\uB85C\uC81D\uD2B8",
  kind_plural_module: "\uBAA8\uB4C8",
  kind_plural_namespace: "\uB124\uC784\uC2A4\uD398\uC774\uC2A4",
  kind_plural_enum: "\uC5F4\uAC70\uD615",
  kind_plural_enum_member: "\uD3EC\uD568\uB41C \uAC12",
  kind_plural_variable: "\uBCC0\uC218",
  kind_plural_function: "\uD568\uC218",
  kind_plural_class: "\uD074\uB798\uC2A4",
  kind_plural_interface: "\uC778\uD130\uD398\uC774\uC2A4",
  kind_plural_constructor: "\uC0DD\uC131\uC790",
  kind_plural_property: "\uC18D\uC131",
  kind_plural_method: "\uBA54\uC18C\uB4DC",
  kind_plural_call_signature: "\uD638\uCD9C \uC2DC\uADF8\uB2C8\uCCD0",
  kind_plural_index_signature: "\uC778\uB371\uC2A4 \uC2DC\uADF8\uB2C8\uCCD0",
  kind_plural_constructor_signature: "\uC0DD\uC131\uC790 \uC2DC\uADF8\uB2C8\uCCD0",
  kind_plural_parameter: "\uB9E4\uAC1C\uBCC0\uC218",
  kind_plural_type_literal: "\uD0C0\uC785 \uB9AC\uD130\uB7F4",
  kind_plural_type_parameter: "\uD0C0\uC785 \uB9E4\uAC1C\uBCC0\uC218",
  kind_plural_accessor: "\uC811\uADFC\uC790",
  kind_plural_get_signature: "get \uC2DC\uADF8\uB2C8\uCCD0",
  kind_plural_set_signature: "set \uC2DC\uADF8\uB2C8\uCCD0",
  kind_plural_type_alias: "\uD0C0\uC785 \uBCC4\uCE6D",
  kind_plural_reference: "\uCC38\uC870",
  kind_plural_document: "\uBB38\uC11C",
  theme_implements: "\uAD6C\uD604\uD55C \uD0C0\uC785",
  theme_indexable: "\uC778\uB371\uC2F1 \uAC00\uB2A5",
  theme_type_declaration: "\uD0C0\uC785 \uC120\uC5B8",
  theme_index: "\uB458\uB7EC\uBCF4\uAE30",
  theme_hierarchy: "\uACC4\uCE35",
  theme_implemented_by: "\uAD6C\uD604",
  theme_defined_in: "\uC815\uC758 \uC704\uCE58:",
  theme_implementation_of: "\uAD6C\uD604\uD558\uB294 \uD0C0\uC785:",
  theme_inherited_from: "\uC0C1\uC18D\uBC1B\uC740 \uD0C0\uC785:",
  theme_overrides: "\uC624\uBC84\uB77C\uC774\uB4DC \uB300\uC0C1:",
  theme_returns: "\uBC18\uD658 \uD615\uC2DD:",
  theme_generated_using_typedoc: "TypeDoc\uC73C\uB85C \uC0DD\uC131\uB428",
  theme_preparing_search_index: "\uAC80\uC0C9 \uC0C9\uC778 \uC900\uBE44 \uC911...",
  theme_search_index_not_available: "\uAC80\uC0C9 \uC0C9\uC778\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  theme_settings: "\uC124\uC815",
  theme_member_visibility: "\uD544\uD130",
  theme_theme: "\uD14C\uB9C8",
  theme_os: "\uC2DC\uC2A4\uD15C",
  theme_light: "\uB77C\uC774\uD2B8",
  theme_dark: "\uB2E4\uD06C",
  theme_on_this_page: "\uBAA9\uCC28",
  theme_search: "\uAC80\uC0C9",
  theme_menu: "\uBA54\uB274",
  theme_permalink: "\uB9C1\uD06C"
});

// src/lib/internationalization/locales/zh.ts
var zh_default = buildIncompleteTranslation({
  loaded_multiple_times_0: "TypeDoc \u5DF2\u52A0\u8F7D\u591A\u6B21\u3002\u8FD9\u901A\u5E38\u662F\u7531\u5177\u6709\u81EA\u5DF1\u7684 TypeDoc \u5B89\u88C5\u7684\u63D2\u4EF6\u5F15\u8D77\u7684\u3002\u52A0\u8F7D\u7684\u8DEF\u5F84\u4E3A\uFF1A\n{0}",
  unsupported_ts_version_0: "\u60A8\u6B63\u5728\u4F7F\u7528\u4E0D\u53D7\u652F\u6301\u7684 TypeScript \u7248\u672C\u8FD0\u884C\uFF01\u5982\u679C TypeDoc \u5D29\u6E83\uFF0C\u8FD9\u5C31\u662F\u539F\u56E0\u3002TypeDoc \u652F\u6301 {0}",
  no_compiler_options_set: "\u672A\u8BBE\u7F6E\u7F16\u8BD1\u5668\u9009\u9879\u3002\u8FD9\u53EF\u80FD\u610F\u5473\u7740 TypeDoc \u6CA1\u6709\u627E\u5230\u4F60\u7684 tsconfig.json\u3002\u751F\u6210\u7684\u6587\u6863\u53EF\u80FD\u4E3A\u7A7A",
  loaded_plugin_0: "\u5DF2\u52A0\u8F7D\u63D2\u4EF6 {0}",
  solution_not_supported_in_watch_mode: "\u63D0\u4F9B\u7684 tsconfig \u6587\u4EF6\u770B\u8D77\u6765\u50CF\u89E3\u51B3\u65B9\u6848\u6837\u5F0F\u7684 tsconfig\uFF0C\u5728\u76D1\u89C6\u6A21\u5F0F\u4E0B\u4E0D\u53D7\u652F\u6301",
  strategy_not_supported_in_watch_mode: "\u5BF9\u4E8E\u76D1\u89C6\u6A21\u5F0F\uFF0CentryPointStrategy \u5FC5\u987B\u8BBE\u7F6E\u4E3A resolve \u6216 expand",
  file_0_changed_restarting: "\u914D\u7F6E\u6587\u4EF6 {0} \u5DF2\u66F4\u6539\uFF1A\u9700\u8981\u91CD\u65B0\u542F\u52A8\u2026\u2026",
  file_0_changed_rebuilding: "\u6587\u4EF6 {0} \u5DF2\u66F4\u6539\uFF1A\u6B63\u5728\u91CD\u65B0\u6784\u5EFA\u8F93\u51FA\u2026\u2026",
  found_0_errors_and_1_warnings: "\u53D1\u73B0 {0} \u4E2A\u9519\u8BEF\u548C {1} \u4E2A\u8B66\u544A",
  output_0_could_not_be_generated: "\u7531\u4E8E\u4EE5\u4E0A\u9519\u8BEF\u65E0\u6CD5\u751F\u6210 {0} \u8F93\u51FA",
  output_0_generated_at_1: "\u5DF2\u751F\u6210 {0} \u8F93\u51FA\uFF0C\u4F4D\u4E8E {1}",
  no_entry_points_for_packages: "\u6CA1\u6709\u4E3A\u5305\u6A21\u5F0F\u63D0\u4F9B\u5165\u53E3\u70B9\uFF0C\u65E0\u6CD5\u751F\u6210\u6587\u6863",
  failed_to_find_packages: "\u627E\u4E0D\u5230\u4EFB\u4F55\u8F6F\u4EF6\u5305\uFF0C\u8BF7\u786E\u4FDD\u60A8\u81F3\u5C11\u63D0\u4F9B\u4E86\u4E00\u4E2A\u5305\u542B package.json \u7684\u76EE\u5F55\u4F5C\u4E3A\u5165\u53E3\u70B9",
  nested_packages_unsupported_0: "\u4F4D\u4E8E {0} \u7684\u9879\u76EE\u5DF2\u5C06 entryPointStrategy \u8BBE\u7F6E\u4E3A\u5305\uFF0C\u4F46\u4E0D\u652F\u6301\u5D4C\u5957\u5305",
  package_option_0_should_be_specified_at_root: "\u7531 packageOptions \u8BBE\u7F6E\u7684\u9009\u9879 {0} \u4EC5\u5728\u6839\u7EA7\u522B\u6709\u6548",
  previous_error_occurred_when_reading_options_for_0: "\u8BFB\u53D6 {0} \u5904\u7684\u5305\u7684\u9009\u9879\u65F6\u53D1\u751F\u4E0A\u4E00\u4E2A\u9519\u8BEF",
  converting_project_at_0: "\u6B63\u5728\u8F6C\u6362 {0} \u5904\u7684\u9879\u76EE",
  failed_to_convert_packages: "\u65E0\u6CD5\u8F6C\u6362\u4E00\u4E2A\u6216\u591A\u4E2A\u5305\uFF0C\u7ED3\u679C\u5C06\u4E0D\u4F1A\u5408\u5E76\u5728\u4E00\u8D77",
  merging_converted_projects: "\u5408\u5E76\u8F6C\u6362\u540E\u7684\u9879\u76EE",
  no_entry_points_to_merge: "\u6CA1\u6709\u63D0\u4F9B\u5408\u5E76\u7684\u5165\u53E3\u70B9",
  entrypoint_did_not_match_files_0: "\u5165\u53E3\u70B9 glob {0} \u4E0E\u4EFB\u4F55\u6587\u4EF6\u5747\u4E0D\u5339\u914D",
  failed_to_parse_json_0: "\u65E0\u6CD5\u5C06 {0} \u5904\u7684\u6587\u4EF6\u89E3\u6790\u4E3A json",
  failed_to_read_0_when_processing_document_tag_in_1: "\u5904\u7406 {1} \u4E2D\u6CE8\u91CA\u7684 @document \u6807\u7B7E\u65F6\u65E0\u6CD5\u8BFB\u53D6\u6587\u4EF6 {0}",
  failed_to_read_0_when_processing_project_document: "\u6DFB\u52A0\u9879\u76EE\u6587\u6863\u65F6\u65E0\u6CD5\u8BFB\u53D6\u6587\u4EF6 {0}",
  failed_to_read_0_when_processing_document_child_in_1: "\u5904\u7406 {1} \u4E2D\u7684\u6587\u6863\u5B50\u9879\u65F6\u65E0\u6CD5\u8BFB\u53D6\u6587\u4EF6 {0}",
  frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values: "{0} \u4E2D\u7684 Frontmatter \u5B50\u9879\u5E94\u4E3A\u5B57\u7B26\u4E32\u6570\u7EC4\u6216\u5177\u6709\u5B57\u7B26\u4E32\u503C\u7684\u5BF9\u8C61",
  converting_union_as_interface: "\u5728\u8054\u5408\u7C7B\u578B\u4E0A\u4F7F\u7528 @interface \u5C06\u4E22\u5F03\u8054\u5408\u6240\u6709\u5206\u652F\u4E0A\u4E0D\u5B58\u5728\u7684\u5C5E\u6027\u3002TypeDoc \u7684\u8F93\u51FA\u53EF\u80FD\u65E0\u6CD5\u51C6\u786E\u63CF\u8FF0\u60A8\u7684\u6E90\u4EE3\u7801",
  converting_0_as_class_requires_value_declaration: "\u5C06 {0} \u8F6C\u6362\u4E3A\u7C7B\u9700\u8981\u8868\u793A\u975E\u7C7B\u578B\u503C\u7684\u58F0\u660E",
  converting_0_as_class_without_construct_signatures: "{0} \u6B63\u5728\u8F6C\u6362\u4E3A\u7C7B\uFF0C\u4F46\u6CA1\u6709\u4EFB\u4F55\u6784\u9020\u7B7E\u540D",
  comment_for_0_should_not_contain_block_or_modifier_tags: "{0} \u7684\u6CE8\u91CA\u4E0D\u5E94\u5305\u542B\u4EFB\u4F55\u5757\u7EA7\u6807\u7B7E\u6216\u4FEE\u9970\u7B26\u6807\u7B7E",
  symbol_0_has_multiple_declarations_with_comment: "{0} \u6709\u591A\u4E2A\u5E26\u6CE8\u91CA\u7684\u58F0\u660E\u3002\u5C06\u4F7F\u7528\u4EFB\u610F\u6CE8\u91CA",
  comments_for_0_are_declared_at_1: "{0} \u7684\u6CE8\u91CA\u58F0\u660E\u4E8E\uFF1A\n{1}",
  // comments/parser.ts
  multiple_type_parameters_on_template_tag_unsupported: "TypeDoc \u4E0D\u652F\u6301\u5728\u5E26\u6709\u6CE8\u91CA\u7684\u5355\u4E2A @template \u6807\u7B7E\u4E2D\u5B9A\u4E49\u591A\u4E2A\u7C7B\u578B\u53C2\u6570",
  failed_to_find_jsdoc_tag_for_name_0: "\u89E3\u6790\u6CE8\u91CA\u540E\u65E0\u6CD5\u627E\u5230 {0} \u7684 JSDoc \u6807\u7B7E\uFF0C\u8BF7\u63D0\u4EA4\u9519\u8BEF\u62A5\u544A",
  relative_path_0_is_not_a_file_and_will_not_be_copied_to_output: "\u627E\u4E0D\u5230\u76F8\u5BF9\u8DEF\u5F84 {0} \u5BF9\u5E94\u7684\u6587\u4EF6\uFF0C\u8BE5\u6587\u4EF6\u4E0D\u4F1A\u88AB\u590D\u5236\u81F3\u8F93\u51FA\u76EE\u5F55",
  inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0: "\u5185\u8054 @inheritDoc \u6807\u7B7E\u4E0D\u5E94\u51FA\u73B0\u5728\u5757\u7EA7\u6807\u7B7E\u5185\uFF0C\u56E0\u4E3A\u5B83\u4E0D\u4F1A\u5728 {0} \u5904\u7684\u6CE8\u91CA\u4E2D\u88AB\u5904\u7406\u3002",
  at_most_one_remarks_tag_expected_in_comment_at_0: "\u6CE8\u91CA\u4E2D\u6700\u591A\u5E94\u6709\u4E00\u4E2A @remarks \u6807\u7B7E\uFF0C\u5FFD\u7565 {0} \u5904\u6CE8\u91CA\u4E2D\u9664\u7B2C\u4E00\u4E2A\u6807\u7B7E\u4E4B\u5916\u7684\u6240\u6709\u6807\u7B7E",
  at_most_one_returns_tag_expected_in_comment_at_0: "\u6CE8\u91CA\u4E2D\u6700\u591A\u5E94\u6709\u4E00\u4E2A @returns \u6807\u7B7E\uFF0C\u5FFD\u7565 {0} \u5904\u6CE8\u91CA\u4E2D\u9664\u7B2C\u4E00\u4E2A\u6807\u7B7E\u4E4B\u5916\u7684\u6240\u6709\u6807\u7B7E",
  at_most_one_inheritdoc_tag_expected_in_comment_at_0: "\u6CE8\u91CA\u4E2D\u6700\u591A\u5E94\u6709\u4E00\u4E2A @inheritDoc \u6807\u7B7E\uFF0C\u5FFD\u7565 {0} \u5904\u6CE8\u91CA\u4E2D\u9664\u7B2C\u4E00\u4E2A\u6807\u7B7E\u4E4B\u5916\u7684\u6240\u6709\u6807\u7B7E",
  content_in_summary_overwritten_by_inheritdoc_in_comment_at_0: "\u6458\u8981\u90E8\u5206\u7684\u5185\u5BB9\u5C06\u88AB {0} \u5904\u6CE8\u91CA\u4E2D\u7684 @inheritDoc \u6807\u7B7E\u8986\u76D6",
  content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0: "@remarks \u5757\u4E2D\u7684\u5185\u5BB9\u5C06\u88AB {0} \u5904\u6CE8\u91CA\u4E2D\u7684 @inheritDoc \u6807\u7B7E\u8986\u76D6",
  example_tag_literal_name: "\u793A\u4F8B\u6807\u7B7E\u7684\u7B2C\u4E00\u884C\u5C06\u6309\u539F\u6837\u4F5C\u4E3A\u793A\u4F8B\u540D\u79F0\uFF0C\u5E76\u4E14\u53EA\u80FD\u5305\u542B\u6587\u672C",
  inheritdoc_tag_properly_capitalized: "@inheritDoc \u6807\u7B7E\u5E94\u6B63\u786E\u5927\u5199",
  treating_unrecognized_tag_0_as_modifier: "\u5C06\u65E0\u6CD5\u8BC6\u522B\u7684\u6807\u7B7E {0} \u89C6\u4E3A\u4FEE\u9970\u6807\u7B7E",
  unmatched_closing_brace: "\u4E0D\u5339\u914D\u7684\u53F3\u62EC\u53F7",
  unescaped_open_brace_without_inline_tag: "\u9047\u5230\u672A\u8F6C\u4E49\u7684\u65E0\u5185\u8054\u6807\u7B7E\u7684\u5F00\u62EC\u53F7",
  unknown_block_tag_0: "\u9047\u5230\u672A\u77E5\u7684\u5757\u7EA7\u6807\u7B7E {0}",
  unknown_inline_tag_0: "\u9047\u5230\u672A\u77E5\u7684\u5185\u8054\u6807\u7B7E {0}",
  open_brace_within_inline_tag: "\u5728\u5185\u8054\u6807\u7B7E\u4E2D\u9047\u5230\u5DE6\u62EC\u53F7\uFF0C\u8FD9\u53EF\u80FD\u662F\u4E00\u4E2A\u9519\u8BEF",
  inline_tag_not_closed: "\u5185\u8054\u6807\u7B7E\u672A\u5173\u95ED",
  // validation
  comment_for_0_links_to_1_not_included_in_docs_use_external_link_2: `{0} \u6CE8\u91CA\u4E2D\u6307\u5411 \u201C{1}\u201D \u7684\u5DF2\u89E3\u6790\u7684\u94FE\u63A5\u4E0D\u4F1A\u88AB\u5305\u542B\u5728\u6587\u6863\u4E2D\u3002\u8BF7\u5C06 {2} \u5BFC\u51FA\u6216\u6DFB\u52A0\u81F3 externalSymbolLinkMappings \u9009\u9879\u4EE5\u4FEE\u590D\u8BE5\u8B66\u544A`,
  failed_to_resolve_link_to_0_in_comment_for_1: "\u65E0\u6CD5\u89E3\u6790 {1} \u6CE8\u91CA\u4E2D\u6307\u5411 \u201C{0}\u201D \u7684\u94FE\u63A5",
  failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2: "\u65E0\u6CD5\u89E3\u6790 {1} \u7684\u6CE8\u91CA\u4E2D\u6307\u5411 \u201C{0}\u201D \u7684\u94FE\u63A5\u3002\u60A8\u53EF\u80FD\u60F3\u8981 \u201C{2}\u201D",
  failed_to_resolve_link_to_0_in_readme_for_1: "\u65E0\u6CD5\u89E3\u6790 {1} \u7684\u81EA\u8FF0\u6587\u4EF6\u4E2D\u6307\u5411 \u201C{0}\u201D \u7684\u94FE\u63A5",
  failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2: "\u65E0\u6CD5\u89E3\u6790 {1} \u7684\u81EA\u8FF0\u6587\u4EF6\u4E2D\u6307\u5411 \u201C{0}\u201D \u7684\u94FE\u63A5\u3002\u60A8\u53EF\u80FD\u60F3\u8981 \u201C{2}\u201D",
  failed_to_resolve_link_to_0_in_document_1: "\u65E0\u6CD5\u89E3\u6790\u6587\u6863 {1} \u4E2D\u6307\u5411 \u201C{0}\u201D \u7684\u94FE\u63A5",
  failed_to_resolve_link_to_0_in_document_1_may_have_meant_2: "\u65E0\u6CD5\u89E3\u6790\u6587\u6863 {1} \u4E2D\u6307\u5411 \u201C{0}\u201D \u7684\u94FE\u63A5\u3002\u60A8\u53EF\u80FD\u60F3\u8981 \u201C{2}\u201D",
  type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs: "{0} \u5728 {1} \u4E2D\u5B9A\u4E49\uFF0C\u88AB {2} \u5F15\u7528\uFF0C\u4F46\u672A\u5305\u542B\u5728\u6587\u6863\u4E2D",
  reflection_0_kind_1_defined_in_2_does_not_have_any_documentation: "{0} ({1})\uFF0C\u5728 {2} \u4E2D\u5B9A\u4E49\uFF0C\u6CA1\u6709\u4EFB\u4F55\u6587\u6863",
  invalid_intentionally_not_documented_names_0: "\u4EE5\u4E0B\u7684\u9650\u5B9A\u53CD\u5C04\u540D\u79F0\u88AB\u8BBE\u5B9A\u4E3A\u523B\u610F\u65E0\u6587\u6863\u8BF4\u660E\uFF0C\u4F46\u5B83\u4EEC\u8981\u4E48\u672A\u5728\u6587\u6863\u4E2D\u88AB\u5F15\u7528\uFF0C\u8981\u4E48\u5DF2\u6709\u6587\u6863\u8BF4\u660E\uFF1A\n	{0}",
  invalid_intentionally_not_exported_symbols_0: "\u4EE5\u4E0B\u7B26\u53F7\u88AB\u8BBE\u5B9A\u4E3A\u523B\u610F\u975E\u5BFC\u51FA\uFF0C\u4F46\u5B83\u4EEC\u8981\u4E48\u672A\u5728\u6587\u6863\u4E2D\u88AB\u5F15\u7528\uFF0C\u8981\u4E48\u5DF2\u4E3A\u5BFC\u51FA\u7B26\u53F7\uFF1A\n{0}",
  reflection_0_has_unused_mergeModuleWith_tag: "{0} \u4E2D\u5B58\u5728\u65E0\u6CD5\u89E3\u6790\u7684 @mergeModuleWith \u6807\u7B7E",
  reflection_0_links_to_1_with_text_2_but_resolved_to_3: "\u201C{0}\u201D\u4E2D\u7684\u94FE\u63A5\u201C{2}\u201D\u6307\u5411\u201C{1}\u201D\uFF0C\u76EE\u6807\u867D\u7136\u5B58\u5728\u4F46\u5E76\u6CA1\u6709\u76F4\u63A5\u7684\u94FE\u63A5\uFF0C\u56E0\u6B64\u5C06\u6539\u4E3A\u94FE\u63A5\u81F3\u201C{3}\u201D\u3002",
  // conversion plugins
  not_all_search_category_boosts_used_0: "\u6587\u6863\u4E2D\u5E76\u672A\u4F7F\u7528 searchCategoryBoosts \u4E2D\u6307\u5B9A\u7684\u6240\u6709\u7C7B\u522B\u3002\u672A\u4F7F\u7528\u7684\u7C7B\u522B\u5305\u62EC\uFF1A\n{0}",
  not_all_search_group_boosts_used_0: "\u6587\u6863\u4E2D\u5E76\u672A\u4F7F\u7528 searchGroupBoosts \u4E2D\u6307\u5B9A\u7684\u6240\u6709\u7EC4\u3002\u672A\u4F7F\u7528\u7684\u7EC4\u4E3A\uFF1A\n{0}",
  comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group: "{0} \u7684\u6CE8\u91CA\u4E2D\u5305\u542B\u4E86 \u201C{1}\u201D \u7684 @categoryDescription\uFF0C\u4F46\u8BE5\u7C7B\u522B\u4E2D\u6CA1\u6709\u5B50\u9879",
  comment_for_0_includes_groupDescription_for_1_but_no_child_in_group: "{0} \u7684\u6CE8\u91CA\u4E2D\u5305\u542B\u4E86 \u201C{1}\u201D \u7684 @groupDescription\uFF0C\u4F46\u8BE5\u5206\u7EC4\u4E2D\u6CA1\u6709\u5B50\u9879",
  comment_for_0_specifies_1_as_sort_strategy_but_only_2_is_valid: `{0} \u7684\u6CE8\u91CA\u4E2D\u6307\u5B9A\u7684 \u201C{1}\u201D \u7684 @sortStrategy \u65E0\u6548\uFF0C\u4EE5\u4E0B\u662F\u6709\u6548\u7684\u9009\u9879\uFF1A
	{2}`,
  label_0_for_1_cannot_be_referenced: "\u65E0\u6CD5\u4F7F\u7528\u58F0\u660E\u5F15\u7528\u6765\u5F15\u7528 {1} \u7684\u6807\u7B7E\u201C{0}\u201D\u3002\u6807\u7B7E\u53EA\u80FD\u5305\u542B A-Z\u30010-9 \u548C _\uFF0C\u5E76\u4E14\u4E0D\u80FD\u4EE5\u6570\u5B57\u5F00\u5934",
  modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2: "\u4FEE\u9970\u7B26\u6807\u7B7E {0} \u4E0E {2} \u6CE8\u91CA\u4E2D\u7684 {1} \u4E92\u65A5",
  signature_0_has_unused_param_with_name_1: "\u7B7E\u540D {0} \u6709\u4E00\u4E2A\u540D\u4E3A\u201C{1}\u201D\u7684 @param\uFF0C\u4F46\u672A\u88AB\u4F7F\u7528",
  declaration_reference_in_inheritdoc_for_0_not_fully_parsed: "@inheritDoc \u4E2D\u5BF9 {0} \u7684\u58F0\u660E\u5F15\u7528\u672A\u5B8C\u5168\u89E3\u6790\uFF0C\u53EF\u80FD\u4F1A\u89E3\u6790\u4E0D\u6B63\u786E",
  failed_to_find_0_to_inherit_comment_from_in_1: "\u5728 {1} \u7684\u6CE8\u91CA\u4E2D\u627E\u4E0D\u5230\u8981\u7EE7\u627F\u7684\u6CE8\u91CA\u201C{0}\u201D",
  reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment: "{0} \u5C1D\u8BD5\u4F7F\u7528 @inheritDoc \u4ECE {1} \u590D\u5236\u6CE8\u91CA\uFF0C\u4F46\u6E90\u6CA1\u6709\u76F8\u5173\u6CE8\u91CA",
  inheritdoc_circular_inheritance_chain_0: "@inheritDoc \u6307\u5B9A\u5FAA\u73AF\u7EE7\u627F\u94FE\uFF1A{0}",
  provided_readme_at_0_could_not_be_read: "\u63D0\u4F9B\u7684 README \u8DEF\u5F84\u65E0\u6CD5\u8BFB\u53D6 {0}",
  defaulting_project_name: "\u672A\u6307\u5B9A --name \u9009\u9879\uFF0C\u5E76\u4E14\u672A\u627E\u5230 package.json\u3002\u5C06\u9879\u76EE\u540D\u79F0\u9ED8\u8BA4\u4E3A\u201CDocumentation\u201D",
  disable_git_set_but_not_source_link_template: "\u5DF2\u8BBE\u7F6E disableGit\uFF0C\u4F46\u672A\u8BBE\u7F6E sourceLinkTemplate\uFF0C\u56E0\u6B64\u65E0\u6CD5\u751F\u6210\u6E90\u4EE3\u7801\u94FE\u63A5\u3002\u8BBE\u7F6E sourceLinkTemplate \u6216 disableSources \u4EE5\u505C\u7528\u6E90\u4EE3\u7801\u8DDF\u8E2A",
  disable_git_set_and_git_revision_used: "disableGit \u5DF2\u8BBE\u7F6E\uFF0C\u5E76\u4E14 sourceLinkTemplate \u5305\u542B {gitRevision}\uFF0C\u7531\u4E8E\u672A\u63D0\u4F9B\u4FEE\u8BA2\uFF0C\u56E0\u6B64\u5C06\u66FF\u6362\u4E3A\u7A7A\u5B57\u7B26\u4E32",
  git_remote_0_not_valid: "\u63D0\u4F9B\u7684 git \u8FDC\u7A0B\u201C{0}\u201D\u65E0\u6548\u3002\u6E90\u94FE\u63A5\u5C06\u5931\u6548",
  reflection_0_tried_to_merge_into_child_1: "\u53CD\u5C04 {0} \u5C1D\u8BD5\u4F7F\u7528 @mergeModuleWith \u5408\u5E76\u5230\u5176\u5B50\u9879\u4E4B\u4E00\uFF1A{1}",
  include_0_in_1_specified_2_resolved_to_3_does_not_exist: "{1} \u7684\u6CE8\u91CA\u4E2D {0} \u6807\u7B7E\u6307\u5B9A\u4E86\u5305\u542B \u201C{2}\u201D\uFF0C\u89E3\u6790\u4E3A \u201C{3}\u201D\uFF0C\u8BE5\u6587\u4EF6\u5E76\u4E0D\u5B58\u5728\u6216\u5E76\u975E\u6587\u4EF6\u3002",
  include_0_in_1_specified_2_circular_include_3: "{1} \u7684\u6CE8\u91CA\u4E2D {0} \u6807\u7B7E\u6307\u5B9A\u4E86\u5305\u542B \u201C{2}\u201D\uFF0C\u5BFC\u81F4\u4E86\u5FAA\u73AF\u5305\u542B\uFF1A\n	{3}",
  include_0_tag_in_1_specified_2_file_3_region_4_region_not_found: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u627E\u4E0D\u5230\u8BE5\u533A\u57DF\u3002`,
  include_0_tag_in_1_region_2_region_not_supported: `{1} \u4E2D\u7684 \u6807\u7B7E {0} \u6307\u5B9A\u4E86 \u201C{2}\u201D\uFF0C\u4F46\u5C1A\u4E0D\u652F\u6301\u5BF9\u5E94\u7684\u6587\u4EF6\u6269\u5C55\u540D\u3002`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_close_not_found: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u4E2D\u627E\u4E0D\u5230\u8BE5\u533A\u57DF\u7684\u7ED3\u675F\u6CE8\u91CA\u3002`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_open_not_found: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u4E2D\u627E\u4E0D\u5230\u8BE5\u533A\u57DF\u7684\u8D77\u59CB\u6CE8\u91CA\u3002`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_close_found_multiple_times: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u4E2D\u8BE5\u533A\u57DF\u7684\u7ED3\u675F\u6CE8\u91CA\u51FA\u73B0\u4E86\u591A\u6B21\u3002`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_open_found_multiple_times: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u4E2D\u8BE5\u533A\u57DF\u7684\u8D77\u59CB\u6CE8\u91CA\u51FA\u73B0\u4E86\u591A\u6B21\u3002`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_found_multiple_times: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u4E2D\u8BE5\u533A\u57DF\u51FA\u73B0\u4E86\u591A\u6B21\u3002`,
  include_0_tag_in_1_specified_2_file_3_region_4_region_empty: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u6807\u8BB0\u4E3A \u201C{4}\u201D \u7684\u533A\u57DF\uFF0C\u4F46\u5728\u5BF9\u5E94\u7684\u6587\u4EF6\u4E2D\u8BE5\u533A\u57DF\u4E0D\u5305\u542B\u5185\u5BB9\u6216\u4EC5\u5305\u542B\u7A7A\u767D\u5B57\u7B26\u3002`,
  include_0_tag_in_1_specified_2_file_3_lines_4_invalid_range: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u7684 {4} \u884C\uFF0C\u4F46\u6307\u5B9A\u7684\u884C\u8303\u56F4\u65E0\u6548\u3002`,
  include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines: `{1} \u4E2D\u7684\u6807\u7B7E {0} \u6307\u5B9A \u201C{2}\u201D \u4EE5\u5305\u542B\u6587\u4EF6 \u201C{3}\u201D \u4E2D\u7684 {4} \u884C\uFF0C\u4F46\u8BE5\u6587\u4EF6\u53EA\u6709 {5} \u884C\u3002`,
  // output plugins
  custom_css_file_0_does_not_exist: "{0} \u5904\u7684\u81EA\u5B9A\u4E49 CSS \u6587\u4EF6\u4E0D\u5B58\u5728",
  custom_js_file_0_does_not_exist: "{0} \u5904\u7684\u81EA\u5B9A\u4E49 JavaScript \u6587\u4EF6\u4E0D\u5B58\u5728",
  unsupported_highlight_language_0_not_highlighted_in_comment_for_1: "{1} \u7684\u6CE8\u91CA\u4E2D\u4F7F\u7528\u4E86\u4E0D\u652F\u6301\u7684\u9AD8\u4EAE\u8BED\u8A00 {0} \uFF0C\u56E0\u6B64\u8BE5\u8BED\u8A00\u5C06\u4E0D\u4F1A\u88AB\u9AD8\u4EAE",
  unloaded_language_0_not_highlighted_in_comment_for_1: "{1} \u7684\u6CE8\u91CA\u4E2D\u8BED\u8A00\u4E3A {0} \u7684\u4EE3\u7801\u5757\u5C06\u4E0D\u4F1A\u88AB\u9AD8\u4EAE\uFF0C\u56E0\u4E3A\u8BE5\u8BED\u8A00\u672A\u5305\u542B\u5728 highlightLanguages \u9009\u9879\u4E2D",
  yaml_frontmatter_not_an_object: "YAML Frontmatter \u5E94\u5F53\u4E3A\u5BF9\u8C61",
  // renderer
  could_not_write_0: "\u65E0\u6CD5\u5199\u5165 {0}",
  could_not_empty_output_directory_0: "\u65E0\u6CD5\u6E05\u7A7A\u8F93\u51FA\u76EE\u5F55 {0}",
  could_not_create_output_directory_0: "\u65E0\u6CD5\u521B\u5EFA\u8F93\u51FA\u76EE\u5F55 {0}",
  theme_0_is_not_defined_available_are_1: "\u4E3B\u9898\u201C{0}\u201D\u672A\u5B9A\u4E49\u3002\u53EF\u7528\u4E3B\u9898\u4E3A\uFF1A{1}",
  router_0_is_not_defined_available_are_1: `\u8DEF\u7531 \u201C{0}\u201D \u672A\u5B9A\u4E49\u3002\u53EF\u7528\u7684\u8DEF\u7531\u4E3A\uFF1A{1}`,
  reflection_0_links_to_1_but_anchor_does_not_exist_try_2: "{0} \u94FE\u63A5\u81F3 {1}\uFF0C\u4F46\u5BF9\u5E94\u951A\u70B9\u4E0D\u5B58\u5728\u3002\u4F60\u662F\u5426\u662F\u6307\uFF1A\n	{2}",
  // entry points
  no_entry_points_provided: "\u6CA1\u6709\u63D0\u4F9B\u5165\u53E3\u70B9\uFF0C\u8FD9\u53EF\u80FD\u662F\u914D\u7F6E\u9519\u8BEF",
  unable_to_find_any_entry_points: "\u65E0\u6CD5\u627E\u5230\u4EFB\u4F55\u5165\u53E3\u70B9\u3002\u8BF7\u53C2\u9605\u5148\u524D\u7684\u8B66\u544A",
  watch_does_not_support_packages_mode: "\u76D1\u89C6\u6A21\u5F0F\u4E0D\u652F\u6301\u201C\u5305\u201D\u6837\u5F0F\u7684\u5165\u53E3\u70B9",
  watch_does_not_support_merge_mode: "\u76D1\u89C6\u6A21\u5F0F\u4E0D\u652F\u6301\u201C\u5408\u5E76\u201D\u6837\u5F0F\u7684\u5165\u53E3\u70B9",
  entry_point_0_not_in_program: "\u5165\u53E3\u70B9 {0} \u672A\u88AB tsconfig \u4E2D\u7684\u201Cfiles\u201D\u6216\u201Cinclude\u201D\u9009\u9879\u5F15\u7528",
  failed_to_resolve_0_to_ts_path: "\u65E0\u6CD5\u5C06 package.json \u4E2D\u7684\u5165\u53E3\u70B9 {0} \u89E3\u6790\u81F3 TypeScript \u6E90\u6587\u4EF6",
  use_expand_or_glob_for_files_in_dir: "\u5982\u679C\u8981\u5305\u542B\u6B64\u76EE\u5F55\u4E2D\u7684\u6587\u4EF6\uFF0C\u8BF7\u8BBE\u7F6E --entryPointStrategy \u4EE5\u5C55\u5F00\u6216\u6307\u5B9A glob",
  glob_0_did_not_match_any_files: "glob {0} \u4E0E\u4EFB\u4F55\u6587\u4EF6\u5747\u4E0D\u5339\u914D",
  entry_point_0_did_not_match_any_files_after_exclude: "\u5E94\u7528\u6392\u9664\u6A21\u5F0F\u540E\uFF0Cglob {0} \u6CA1\u6709\u5339\u914D\u4EFB\u4F55\u6587\u4EF6",
  entry_point_0_did_not_exist: "\u63D0\u4F9B\u7684\u5165\u53E3\u70B9 {0} \u4E0D\u5B58\u5728",
  entry_point_0_did_not_match_any_packages: "\u5165\u53E3\u70B9 glob {0} \u4E0E\u4EFB\u4F55\u5305\u542B package.json \u7684\u76EE\u5F55\u4E0D\u5339\u914D",
  file_0_not_an_object: "\u6587\u4EF6 {0} \u4E0D\u662F\u5BF9\u8C61",
  // deserialization
  serialized_project_referenced_0_not_part_of_project: "\u5E8F\u5217\u5316\u9879\u76EE\u5F15\u7528\u4E86\u53CD\u5C04 {0}\uFF0C\u4F46\u5B83\u4E0D\u662F\u9879\u76EE\u7684\u4E00\u90E8\u5206",
  saved_relative_path_0_resolved_from_1_does_not_exist: "\u5E8F\u5217\u5316\u9879\u76EE\u5F15\u7528\u7684 {0} \u4E0D\u5B58\u5728\u6216\u65E0\u6CD5\u5728 {1} \u4E0B\u627E\u5230",
  // options
  circular_reference_extends_0: "{0} \u7684\u201Cextends\u201D\u5B57\u6BB5\u51FA\u73B0\u5FAA\u73AF\u5F15\u7528",
  failed_resolve_0_to_file_in_1: "\u65E0\u6CD5\u5C06 {0} \u89E3\u6790\u4E3A {1} \u4E2D\u7684\u6587\u4EF6",
  glob_0_should_use_posix_slash: `\u8BE5 glob \u201C{0}\u201D \u4E2D\u8F6C\u4E49\u4E86\u4E0D\u662F\u7279\u6B8A\u5B57\u7B26\u7684\u5B57\u7B26\u3002\u8F93\u5165 TypeDoc \u7684 glob \u53EF\u80FD\u4E0D\u4F1A\u4F7F\u7528 Windows \u8DEF\u5F84\u5206\u9694\u7B26\uFF08\\\uFF09\uFF0C\u8BF7\u5C1D\u8BD5\u5C06\u5176\u66FF\u6362\u4E3A POSIX \u8DEF\u5F84\u5206\u9694\u7B26\uFF08/\uFF09`,
  option_0_can_only_be_specified_by_config_file: "\u201C{0}\u201D\u9009\u9879\u53EA\u80FD\u901A\u8FC7\u914D\u7F6E\u6587\u4EF6\u6307\u5B9A",
  option_0_expected_a_value_but_none_provided: "--{0} \u9700\u8981\u4E00\u4E2A\u503C\uFF0C\u4F46\u6CA1\u6709\u7ED9\u51FA\u4EFB\u4F55\u53C2\u6570",
  unknown_option_0_may_have_meant_1: "\u672A\u77E5\u9009\u9879\uFF1A{0}\uFF0C\u4F60\u53EF\u80FD\u6307\u7684\u662F\uFF1A\n	{1}",
  typedoc_key_in_0_ignored: "{0} \u4E2D\u7684\u201Ctypedoc\u201D\u952E\u5DF2\u88AB\u65E7\u5305 entryPointStrategy \u4F7F\u7528\uFF0C\u5C06\u88AB\u5FFD\u7565",
  typedoc_options_must_be_object_in_0: "\u65E0\u6CD5\u89E3\u6790 {0} \u4E2D\u7684\u201CtypedocOptions\u201D\u5B57\u6BB5\uFF0C\u8BF7\u786E\u4FDD\u5B83\u5B58\u5728\u4E14\u5305\u542B\u5BF9\u8C61",
  tsconfig_file_0_does_not_exist: "tsconfig \u6587\u4EF6 {0} \u4E0D\u5B58\u5728",
  tsconfig_file_specifies_options_file: "tsconfig \u6587\u4EF6\u4E2D\u7684\u201CtypedocOptions\u201D\u6307\u5B9A\u8981\u8BFB\u53D6\u7684\u9009\u9879\u6587\u4EF6\uFF0C\u4F46\u8BE5\u9009\u9879\u6587\u4EF6\u5DF2\u88AB\u8BFB\u53D6\u3002\u8FD9\u53EF\u80FD\u662F\u914D\u7F6E\u9519\u8BEF",
  tsconfig_file_specifies_tsconfig_file: "tsconfig \u6587\u4EF6\u4E2D\u7684\u201CtypedocOptions\u201D\u53EF\u80FD\u672A\u6307\u5B9A\u8981\u8BFB\u53D6\u7684 tsconfig \u6587\u4EF6",
  tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json: "typedoc.json \u4E2D\u5B9A\u4E49\u7684 {0} \u5C06\u88AB tsdoc.json \u4E2D\u7684\u914D\u7F6E\u8986\u76D6",
  failed_read_tsdoc_json_0: "\u65E0\u6CD5\u8BFB\u53D6\u4F4D\u4E8E {0} \u7684 tsdoc.json \u6587\u4EF6",
  invalid_tsdoc_json_0: "\u6587\u4EF6 {0} \u4E0D\u662F\u6709\u6548\u7684 tsdoc.json \u6587\u4EF6",
  options_file_0_does_not_exist: "\u9009\u9879\u6587\u4EF6 {0} \u4E0D\u5B58\u5728",
  failed_read_options_file_0: "\u65E0\u6CD5\u89E3\u6790 {0}\uFF0C\u8BF7\u786E\u4FDD\u5176\u5B58\u5728\u5E76\u5BFC\u51FA\u5BF9\u8C61",
  // plugins
  invalid_plugin_0_missing_load_function: "\u63D2\u4EF6 {0} \u4E2D\u7684\u7ED3\u6784\u65E0\u6548\uFF0C\u672A\u627E\u5230\u52A0\u8F7D\u51FD\u6570",
  plugin_0_could_not_be_loaded: "\u65E0\u6CD5\u52A0\u8F7D\u63D2\u4EF6 {0}",
  // option declarations help
  help_options: "\u6307\u5B9A\u5E94\u52A0\u8F7D\u7684 json \u9009\u9879\u6587\u4EF6\u3002\u5982\u679C\u672A\u6307\u5B9A\uFF0CTypeDoc \u5C06\u5728\u5F53\u524D\u76EE\u5F55\u4E2D\u67E5\u627E\u201Ctypedoc.json\u201D",
  help_tsconfig: "\u6307\u5B9A\u5E94\u52A0\u8F7D\u7684 TypeScript \u914D\u7F6E\u6587\u4EF6\u3002\u5982\u679C\u672A\u6307\u5B9A\uFF0CTypeDoc \u5C06\u5728\u5F53\u524D\u76EE\u5F55\u4E2D\u67E5\u627E\u201Ctsconfig.json\u201D",
  help_compilerOptions: "\u6709\u9009\u62E9\u5730\u8986\u76D6 TypeDoc \u4F7F\u7528\u7684 TypeScript \u7F16\u8BD1\u5668\u9009\u9879",
  help_lang: "\u8BBE\u7F6E\u751F\u6210\u548C TypeDoc \u6D88\u606F\u4E2D\u4F7F\u7528\u7684\u8BED\u8A00",
  help_locales: "\u4E3A\u6307\u5B9A\u8BED\u8A00\u73AF\u5883\u6DFB\u52A0\u7FFB\u8BD1\u3002\u6B64\u9009\u9879\u4E3B\u8981\u7528\u4F5C\u5728\u7B49\u5F85\u5B98\u65B9\u8BED\u8A00\u73AF\u5883\u652F\u6301\u6DFB\u52A0\u5230 TypeDoc \u65F6\u7684\u6743\u5B9C\u4E4B\u8BA1",
  help_packageOptions: "\u5F53 entryPointStrategy \u8BBE\u7F6E\u4E3A\u5305\u65F6\uFF0C\u8BBE\u7F6E\u5C06\u5728\u6BCF\u4E2A\u5305\u4E2D\u8BBE\u7F6E\u7684\u9009\u9879",
  help_entryPoints: "\u6587\u6863\u7684\u5165\u53E3\u70B9",
  help_entryPointStrategy: "\u5C06\u5165\u53E3\u70B9\u8F6C\u6362\u4E3A\u6587\u6863\u6A21\u5757\u6240\u91C7\u7528\u7684\u7B56\u7565",
  help_alwaysCreateEntryPointModule: "\u8BBE\u7F6E\u540E\uFF0CTypeDoc \u5C06\u59CB\u7EC8\u4E3A\u5165\u53E3\u70B9\u521B\u5EFA\u4E00\u4E2A\u201C\u6A21\u5757\u201D\uFF0C\u5373\u4F7F\u53EA\u63D0\u4F9B\u4E86\u4E00\u4E2A",
  help_projectDocuments: "\u5E94\u4F5C\u4E3A\u5B50\u9879\u6DFB\u52A0\u5230\u751F\u6210\u6587\u6863\u6839\u76EE\u5F55\u4E2D\u7684\u6587\u6863\u3002\u652F\u6301\u4F7F\u7528 glob \u5339\u914D\u591A\u4E2A\u6587\u4EF6",
  help_exclude: "\u5B9A\u4E49\u5728\u6269\u5C55\u6307\u5B9A\u4E3A\u5165\u53E3\u70B9\u7684\u76EE\u5F55\u65F6\u8981\u6392\u9664\u7684\u6A21\u5F0F",
  help_externalPattern: "\u5B9A\u4E49\u5E94\u88AB\u89C6\u4E3A\u5916\u90E8\u7684\u6587\u4EF6\u7684\u6A21\u5F0F",
  help_excludeExternals: "\u9632\u6B62\u8BB0\u5F55\u5916\u90E8\u89E3\u6790\u7684\u7B26\u53F7",
  help_excludeNotDocumented: "\u9632\u6B62\u672A\u660E\u786E\u8BB0\u5F55\u7684\u7B26\u53F7\u51FA\u73B0\u5728\u7ED3\u679C\u4E2D",
  help_excludeNotDocumentedKinds: "\u6307\u5B9A\u53EF\u4EE5\u901A\u8FC7 excludeNotDocumented \u5220\u9664\u7684\u53CD\u5C04\u7C7B\u578B",
  help_excludeInternal: "\u9632\u6B62\u6807\u6709 @internal \u7684\u7B26\u53F7\u88AB\u8BB0\u5F55",
  help_excludeCategories: "\u4ECE\u6587\u6863\u4E2D\u6392\u9664\u6B64\u7C7B\u522B\u4E2D\u7684\u7B26\u53F7",
  help_excludeProtected: "\u5FFD\u7565\u53D7\u4FDD\u62A4\u7684\u53D8\u91CF\u548C\u65B9\u6CD5",
  help_excludeReferences: "\u5982\u679C\u4E00\u4E2A\u7B26\u53F7\u88AB\u5BFC\u51FA\u591A\u6B21\uFF0C\u5219\u5FFD\u7565\u9664\u7B2C\u4E00\u6B21\u5BFC\u51FA\u4E4B\u5916\u7684\u6240\u6709\u5BFC\u51FA",
  help_externalSymbolLinkMappings: "\u4E3A\u6587\u6863\u4E2D\u672A\u5305\u542B\u7684\u7B26\u53F7\u5B9A\u4E49\u81EA\u5B9A\u4E49\u94FE\u63A5",
  help_out: "\u6307\u5B9A\u9ED8\u8BA4\u7C7B\u578B\u8F93\u51FA\u7684\u6587\u6863\u5199\u5165\u7684\u4F4D\u7F6E\u3002\u63D2\u4EF6\u53EF\u80FD\u4F1A\u6539\u53D8\u9ED8\u8BA4\u7684\u8F93\u51FA\u7C7B\u578B\u3002",
  help_html: "\u6307\u5B9A HTML \u6587\u6863\u5199\u5165\u7684\u4F4D\u7F6E",
  help_json: "\u6307\u5B9A\u63CF\u8FF0\u9879\u76EE\u7684 JSON \u6587\u4EF6\u5199\u5165\u7684\u4F4D\u7F6E\u548C\u6587\u4EF6\u540D",
  help_pretty: "\u6307\u5B9A\u8F93\u51FA JSON \u662F\u5426\u5E94\u4F7F\u7528\u5236\u8868\u7B26\u8FDB\u884C\u683C\u5F0F\u5316",
  help_emit: "\u6307\u5B9A TypeDoc \u5E94\u53D1\u51FA\u7684\u5185\u5BB9\uFF0C\u201Cdocs\u201D\u3001\u201Cboth\u201D\u6216\u201Cnone\u201D",
  help_theme: "\u6307\u5B9A\u7528\u4E8E\u5448\u73B0\u6587\u6863\u7684\u4E3B\u9898\u540D\u79F0",
  help_router: "\u6307\u5B9A\u9700\u8981\u4F7F\u7528\u8DEF\u7531\u7684\u540D\u79F0\u4EE5\u51B3\u5B9A\u6587\u6863\u4E2D\u6587\u4EF6\u7684\u547D\u540D\u65B9\u5F0F",
  help_lightHighlightTheme: "\u6307\u5B9A\u6D45\u8272\u6A21\u5F0F\u4E0B\u7684\u4EE3\u7801\u9AD8\u4EAE\u4E3B\u9898",
  help_darkHighlightTheme: "\u6307\u5B9A\u6697\u9ED1\u6A21\u5F0F\u4E0B\u7684\u4EE3\u7801\u9AD8\u4EAE\u4E3B\u9898",
  help_highlightLanguages: "\u6307\u5B9A\u6E32\u67D3\u65F6\u5C06\u52A0\u8F7D\u7684\u4EE3\u7801\u9AD8\u4EAE\u8BED\u8A00",
  help_ignoredHighlightLanguages: "\u6307\u5B9A\u54EA\u4E9B\u8BED\u8A00\u5C06\u88AB\u89C6\u4E3A\u652F\u6301\u7684\u4EE3\u7801\u9AD8\u4EAE\u8BED\u8A00\uFF0C\u4F46\u4E0D\u4F1A\u5728\u8FD0\u884C\u65F6\u88AB\u8BED\u6CD5\u9AD8\u4EAE",
  help_typePrintWidth: "\u6E32\u67D3\u7C7B\u578B\u65F6\u89E6\u53D1\u81EA\u52A8\u6362\u884C\u7684\u4EE3\u7801\u5BBD\u5EA6",
  help_customCss: "\u8981\u5BFC\u5165\u4E3B\u9898\u7684\u81EA\u5B9A\u4E49 CSS \u6587\u4EF6\u7684\u8DEF\u5F84",
  help_customJs: "\u8981\u5BFC\u5165\u7684\u81EA\u5B9A\u4E49 JS \u6587\u4EF6\u7684\u8DEF\u5F84",
  help_markdownItOptions: "\u6307\u5B9A\u4F20\u9012\u7ED9 markdown-it\uFF08TypeDoc \u4F7F\u7528\u7684 Markdown \u89E3\u6790\u5668\uFF09\u7684\u9009\u9879",
  help_markdownItLoader: "\u6307\u5B9A\u52A0\u8F7D markdown-it \u5B9E\u4F8B\u65F6\u8981\u8C03\u7528\u7684\u56DE\u8C03\u3002\u5C06\u4F20\u9012 TypeDoc \u5C06\u4F7F\u7528\u7684\u89E3\u6790\u5668\u5B9E\u4F8B",
  help_maxTypeConversionDepth: "\u8BBE\u7F6E\u8981\u8F6C\u6362\u7C7B\u578B\u7684\u6700\u5927\u6DF1\u5EA6",
  help_name: "\u8BBE\u7F6E\u5C06\u5728\u6A21\u677F\u6807\u9898\u4E2D\u4F7F\u7528\u7684\u9879\u76EE\u540D\u79F0",
  help_includeVersion: "\u5C06\u8F6F\u4EF6\u5305\u7248\u672C\u6DFB\u52A0\u5230\u9879\u76EE\u540D\u79F0\u4E2D",
  help_disableSources: "\u8BB0\u5F55\u53CD\u5C04\u65F6\u7981\u7528\u8BBE\u7F6E\u53CD\u5C04\u6E90",
  help_sourceLinkTemplate: "\u6307\u5B9A\u751F\u6210\u6E90 URL \u65F6\u8981\u4F7F\u7528\u7684\u94FE\u63A5\u6A21\u677F\u3002\u5982\u679C\u672A\u8BBE\u7F6E\uFF0C\u5C06\u4F7F\u7528 git remote \u81EA\u52A8\u521B\u5EFA\u3002\u652F\u6301 {path}\u3001{line}\u3001{gitRevision} \u5360\u4F4D\u7B26",
  help_gitRevision: "\u4F7F\u7528\u6307\u5B9A\u4FEE\u8BA2\u7248\u672C\u800C\u4E0D\u662F\u6700\u65B0\u4FEE\u8BA2\u7248\u672C\u6765\u94FE\u63A5\u5230 GitHub/Bitbucket \u6E90\u6587\u4EF6\u3002\u5982\u679C\u8BBE\u7F6E\u4E86 disableSources\uFF0C\u5219\u65E0\u6548",
  help_gitRemote: "\u4F7F\u7528\u6307\u5B9A\u7684\u8FDC\u7A0B\u94FE\u63A5\u5230 GitHub/Bitbucket \u6E90\u6587\u4EF6\u3002\u5982\u679C\u8BBE\u7F6E\u4E86 disableGit \u6216 disableSources\uFF0C\u5219\u65E0\u6548",
  help_disableGit: "\u5047\u8BBE\u6240\u6709\u5185\u5BB9\u90FD\u53EF\u4EE5\u901A\u8FC7 sourceLinkTemplate \u8FDB\u884C\u94FE\u63A5\uFF0C\u5982\u679C\u542F\u7528\u6B64\u529F\u80FD\uFF0C\u5219\u5FC5\u987B\u8BBE\u7F6E sourceLinkTemplate\u3002{path} \u5C06\u4EE5 basePath \u4E3A\u6839",
  help_basePath: "\u6307\u5B9A\u663E\u793A\u6587\u4EF6\u8DEF\u5F84\u65F6\u4F7F\u7528\u7684\u57FA\u672C\u8DEF\u5F84",
  help_excludeTags: "\u4ECE\u6587\u6863\u6CE8\u91CA\u4E2D\u5220\u9664\u5217\u51FA\u7684\u5757\u7EA7/\u4FEE\u9970\u7B26\u6807\u7B7E",
  help_notRenderedTags: "\u4FDD\u7559\u5728\u6587\u6863\u6CE8\u91CA\u4E2D\u4F46\u5728\u521B\u5EFA\u8F93\u51FA\u65F6\u4E0D\u6E32\u67D3\u7684\u6807\u7B7E",
  help_cascadedModifierTags: "\u9700\u8981\u4ECE\u7236\u53CD\u5C04\u590D\u5236\u81F3\u6240\u6709\u5B50\u53CD\u5C04\u7684\u4FEE\u9970\u7B26\u6807\u7B7E",
  help_readme: "\u5E94\u663E\u793A\u5728\u7D22\u5F15\u9875\u4E0A\u7684\u81EA\u8FF0\u6587\u4EF6\u8DEF\u5F84\u3002\u4F20\u9012\u201Cnone\u201D\u4EE5\u7981\u7528\u7D22\u5F15\u9875\u5E76\u5728\u5168\u5C40\u9875\u4E0A\u542F\u52A8\u6587\u6863",
  help_cname: "\u8BBE\u7F6E CNAME \u6587\u4EF6\u6587\u672C\uFF0C\u8FD9\u5BF9\u4E8E GitHub Pages \u4E0A\u7684\u81EA\u5B9A\u4E49\u57DF\u5F88\u6709\u7528",
  help_favicon: "\u4F5C\u4E3A\u7AD9\u70B9\u56FE\u6807\u5305\u542B\u7684 favicon \u7684\u8DEF\u5F84",
  help_sourceLinkExternal: "\u6307\u5B9A\u54EA\u4E9B\u6E90\u4EE3\u7801\u94FE\u63A5\u5E94\u88AB\u89C6\u4E3A\u5916\u90E8\u94FE\u63A5\uFF0C\u5E76\u5728\u65B0\u9009\u9879\u5361\u4E2D\u6253\u5F00",
  help_markdownLinkExternal: "\u6307\u5B9A\u6CE8\u91CA\u4E0E Markdown \u6587\u4EF6\u4E2D\u54EA\u4E9B http[s]:// \u94FE\u63A5\u5E94\u88AB\u89C6\u4E3A\u5916\u90E8\u94FE\u63A5\uFF0C\u5E76\u5728\u65B0\u9009\u9879\u5361\u4E2D\u6253\u5F00",
  help_githubPages: "\u751F\u6210 .nojekyll \u6587\u4EF6\u4EE5\u9632\u6B62 GitHub Pages \u4E2D\u51FA\u73B0 404 \u9519\u8BEF\u3002\u9ED8\u8BA4\u4E3A\u201Ctrue\u201D",
  help_hostedBaseUrl: "\u6307\u5B9A\u7528\u4E8E\u5728\u6211\u4EEC\u7684\u8F93\u51FA\u6587\u4EF6\u5939\u548C\u89C4\u8303\u94FE\u63A5\u4E2D\u751F\u6210 sitemap.xml \u7684\u57FA\u672C URL\u3002\u5982\u679C\u672A\u6307\u5B9A\uFF0C\u5219\u4E0D\u4F1A\u751F\u6210\u7AD9\u70B9\u5730\u56FE",
  help_useHostedBaseUrlForAbsoluteLinks: "\u5982\u679C\u8BBE\u7F6E\uFF0CTypeDoc \u5C06\u4F7F\u7528 hostingBaseUrl \u9009\u9879\u751F\u6210\u5230\u60A8\u7F51\u7AD9\u9875\u9762\u7684\u7EDD\u5BF9\u94FE\u63A5",
  help_hideGenerator: "\u4E0D\u8981\u6253\u5370\u9875\u9762\u672B\u5C3E\u7684 TypeDoc \u94FE\u63A5",
  help_customFooterHtml: "TypeDoc \u94FE\u63A5\u540E\u7684\u81EA\u5B9A\u4E49\u9875\u811A",
  help_customFooterHtmlDisableWrapper: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u5219\u7981\u7528 customFooterHtml \u7684\u5305\u88C5\u5143\u7D20",
  help_cacheBust: "\u5728\u9759\u6001\u8D44\u4EA7\u94FE\u63A5\u4E2D\u5305\u542B\u751F\u6210\u65F6\u95F4",
  help_searchInComments: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u641C\u7D22\u7D22\u5F15\u8FD8\u5C06\u5305\u62EC\u6CE8\u91CA\u3002\u8FD9\u5C06\u5927\u5927\u589E\u52A0\u641C\u7D22\u7D22\u5F15\u7684\u5927\u5C0F",
  help_searchInDocuments: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u641C\u7D22\u7D22\u5F15\u8FD8\u5C06\u5305\u542B\u6587\u6863\u3002\u8FD9\u5C06\u5927\u5927\u589E\u52A0\u641C\u7D22\u7D22\u5F15\u7684\u5927\u5C0F",
  help_cleanOutputDir: "\u5982\u679C\u8BBE\u7F6E\uFF0CTypeDoc \u5C06\u5728\u5199\u5165\u8F93\u51FA\u4E4B\u524D\u5220\u9664\u8F93\u51FA\u76EE\u5F55",
  help_titleLink: "\u8BBE\u7F6E\u9875\u7709\u4E2D\u7684\u6807\u9898\u6307\u5411\u7684\u94FE\u63A5\u3002\u9ED8\u8BA4\u4E3A\u6587\u6863\u4E3B\u9875",
  help_navigationLinks: "\u5B9A\u4E49\u8981\u5305\u542B\u5728\u6807\u9898\u4E2D\u7684\u94FE\u63A5",
  help_sidebarLinks: "\u5B9A\u4E49\u8981\u5305\u542B\u5728\u4FA7\u8FB9\u680F\u4E2D\u7684\u94FE\u63A5",
  help_navigationLeaves: "\u5BFC\u822A\u6811\u4E2D\u4E0D\u5E94\u6269\u5C55\u7684\u5206\u652F",
  help_headings: "\u786E\u5B9A\u6807\u9898\u662F\u5426\u9700\u8981\u88AB\u6E32\u67D3",
  help_sluggerConfiguration: "\u786E\u5B9A\u6E32\u67D3\u7684 HTML \u4E2D\u951A\u70B9\u7684\u786E\u5B9A\u65B9\u5F0F",
  help_navigation: "\u786E\u5B9A\u5BFC\u822A\u4FA7\u8FB9\u680F\u7684\u7EC4\u7EC7\u65B9\u5F0F",
  help_includeHierarchySummary: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u53CD\u5C04\u7684\u5C42\u7EA7\u4E00\u89C8\u5C06\u88AB\u6E32\u67D3\u81F3\u6982\u8FF0\u9875\u9762\u3002\u9ED8\u8BA4\u4E3A `true`",
  help_visibilityFilters: "\u6839\u636E\u4FEE\u9970\u7B26\u6807\u7B7E\u6307\u5B9A\u5185\u7F6E\u8FC7\u6EE4\u5668\u548C\u9644\u52A0\u8FC7\u6EE4\u5668\u7684\u9ED8\u8BA4\u53EF\u89C1\u6027",
  help_searchCategoryBoosts: "\u914D\u7F6E\u641C\u7D22\u4EE5\u63D0\u9AD8\u6240\u9009\u7C7B\u522B\u7684\u76F8\u5173\u6027",
  help_searchGroupBoosts: "\u914D\u7F6E\u641C\u7D22\u4EE5\u589E\u5F3A\u6240\u9009\u79CD\u7C7B\uFF08\u4F8B\u5982\u201C\u7C7B\u522B\u201D\uFF09\u7684\u76F8\u5173\u6027",
  help_useFirstParagraphOfCommentAsSummary: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u4E14\u6CA1\u6709\u6307\u5B9A @summary \u6807\u7B7E\uFF0CTypeDoc \u4F1A\u4F7F\u7528\u6CE8\u91CA\u7684\u7B2C\u4E00\u884C\u4F5C\u4E3A\u5728\u6A21\u5757/\u547D\u540D\u7A7A\u95F4\u4E00\u89C8\u91CC\u7684\u6982\u8FF0",
  help_jsDocCompatibility: "\u8BBE\u7F6E\u6CE8\u91CA\u89E3\u6790\u7684\u517C\u5BB9\u6027\u9009\u9879\uFF0C\u4EE5\u589E\u52A0\u4E0E JSDoc \u6CE8\u91CA\u7684\u76F8\u4F3C\u5EA6",
  help_suppressCommentWarningsInDeclarationFiles: "\u963B\u6B62 .d.ts \u6587\u4EF6\u7684\u6CE8\u91CA\u4E2D\u56E0\u4E3A\u5B58\u5728\u672A\u6307\u5B9A\u7684\u6807\u7B7E\u800C\u5F39\u51FA\u7684\u8B66\u544A\u3002",
  help_commentStyle: "\u786E\u5B9A TypeDoc \u5982\u4F55\u641C\u7D22\u6CE8\u91CA",
  help_useTsLinkResolution: "\u4F7F\u7528 TypeScript \u7684\u94FE\u63A5\u89E3\u6790\u6765\u786E\u5B9A @link \u6807\u7B7E\u6307\u5411\u7684\u4F4D\u7F6E\u3002\u8FD9\u4EC5\u9002\u7528\u4E8E JSDoc \u6837\u5F0F\u6CE8\u91CA",
  help_preserveLinkText: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u4E0D\u5E26\u94FE\u63A5\u6587\u672C\u7684 @link \u6807\u7B7E\u5C06\u4F7F\u7528\u6587\u672C\u5185\u5BB9\u4F5C\u4E3A\u94FE\u63A5\u3002\u5982\u679C\u672A\u8BBE\u7F6E\uFF0C\u5C06\u4F7F\u7528\u76EE\u6807\u53CD\u5C04\u540D\u79F0",
  help_blockTags: "TypeDoc \u5728\u89E3\u6790\u6CE8\u91CA\u65F6\u5E94\u8BE5\u8BC6\u522B\u7684\u5757\u7EA7\u6807\u7B7E",
  help_inlineTags: "TypeDoc \u5728\u89E3\u6790\u6CE8\u91CA\u65F6\u5E94\u8BE5\u8BC6\u522B\u7684\u5185\u8054\u6807\u7B7E",
  help_modifierTags: "TypeDoc \u5728\u89E3\u6790\u6CE8\u91CA\u65F6\u5E94\u8BE5\u8BC6\u522B\u7684\u4FEE\u9970\u7B26\u6807\u7B7E",
  help_categorizeByGroup: "\u6307\u5B9A\u662F\u5426\u5728\u7EC4\u7EA7\u522B\u8FDB\u884C\u5206\u7C7B",
  help_groupReferencesByType: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u5F15\u7528\u5C06\u6309\u7167\u5B83\u4EEC\u7684\u7C7B\u578B\u8FDB\u884C\u5206\u7C7B\uFF0C\u800C\u975E\u76F4\u63A5\u5206\u5728\u201C\u5F15\u7528\u201D\u7C7B\u578B\u4E2D",
  help_defaultCategory: "\u4E3A\u6CA1\u6709\u7C7B\u522B\u7684\u53CD\u5C04\u6307\u5B9A\u9ED8\u8BA4\u7C7B\u522B",
  help_categoryOrder: "\u6307\u5B9A\u7C7B\u522B\u51FA\u73B0\u7684\u987A\u5E8F\u3002* \u8868\u793A\u4E0D\u5728\u5217\u8868\u4E2D\u7684\u7C7B\u522B\u7684\u76F8\u5BF9\u987A\u5E8F",
  help_groupOrder: "\u6307\u5B9A\u7EC4\u7684\u663E\u793A\u987A\u5E8F\u3002* \u8868\u793A\u4E0D\u5728\u5217\u8868\u4E2D\u7684\u7EC4\u7684\u76F8\u5BF9\u987A\u5E8F",
  help_sort: "\u6307\u5B9A\u8BB0\u5F55\u503C\u7684\u6392\u5E8F\u7B56\u7565",
  help_sortEntryPoints: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u5165\u53E3\u70B9\u5C06\u9075\u5FAA\u4E0E\u5176\u4ED6\u53CD\u5C04\u76F8\u540C\u7684\u6392\u5E8F\u89C4\u5219",
  help_kindSortOrder: "\u5F53\u6307\u5B9A\u201C\u79CD\u7C7B\u201D\u65F6\u6307\u5B9A\u53CD\u5C04\u7684\u6392\u5E8F\u987A\u5E8F",
  help_watch: "\u76D1\u89C6\u6587\u4EF6\u7684\u53D8\u5316\u5E76\u5728\u53D1\u751F\u66F4\u6539\u65F6\u91CD\u5EFA\u6587\u6863",
  help_preserveWatchOutput: "\u5982\u679C\u8BBE\u7F6E\uFF0CTypeDoc \u5C06\u4E0D\u4F1A\u5728\u7F16\u8BD1\u8FD0\u884C\u4E4B\u95F4\u6E05\u9664\u5C4F\u5E55",
  help_skipErrorChecking: "\u5728\u751F\u6210\u6587\u6863\u4E4B\u524D\u4E0D\u8981\u8FD0\u884C TypeScript \u7684\u7C7B\u578B\u68C0\u67E5",
  help_help: "\u6253\u5370\u6B64\u6D88\u606F",
  help_version: "\u6253\u5370 TypeDoc \u7684\u7248\u672C",
  help_showConfig: "\u6253\u5370\u89E3\u6790\u540E\u7684\u914D\u7F6E\u5E76\u9000\u51FA",
  help_plugin: "\u6307\u5B9A\u5E94\u52A0\u8F7D\u7684 npm \u63D2\u4EF6\u3002\u7701\u7565\u5219\u52A0\u8F7D\u6240\u6709\u5DF2\u5B89\u88C5\u7684\u63D2\u4EF6",
  help_logLevel: "\u6307\u5B9A\u5E94\u4F7F\u7528\u4EC0\u4E48\u7EA7\u522B\u7684\u65E5\u5FD7\u8BB0\u5F55",
  help_treatWarningsAsErrors: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u6240\u6709\u8B66\u544A\u90FD\u5C06\u88AB\u89C6\u4E3A\u9519\u8BEF",
  help_treatValidationWarningsAsErrors: "\u5982\u679C\u8BBE\u7F6E\uFF0C\u9A8C\u8BC1\u671F\u95F4\u53D1\u51FA\u7684\u8B66\u544A\u5C06\u88AB\u89C6\u4E3A\u9519\u8BEF\u3002\u6B64\u9009\u9879\u4E0D\u80FD\u7528\u4E8E\u7981\u7528\u9A8C\u8BC1\u8B66\u544A\u7684 treatWarningsAsErrors",
  help_intentionallyNotExported: "\u4E0D\u4F1A\u56E0\u4E3A\u201C\u5F15\u7528\u4F46\u5E76\u672A\u5BFC\u51FA\u201D\u800C\u4EA7\u751F\u8B66\u544A\u7684\u7B26\u53F7\u5217\u8868",
  help_requiredToBeDocumented: "\u9700\u8981\u6709\u6587\u6863\u8BF4\u660E\u7684\u53CD\u5C04\u7C7B\u578B\u5217\u8868",
  help_packagesRequiringDocumentation: "\u9700\u8981\u6709\u6587\u6863\u8BF4\u660E\u7684\u5305\u7684\u5217\u8868",
  help_intentionallyNotDocumented: "\u4E0D\u4F1A\u56E0\u4E3A\u65E0\u6587\u6863\u8BF4\u660E\u800C\u4EA7\u751F\u8B66\u544A\u7684\u5B8C\u6574\u53CD\u5C04\u540D\u79F0\u5217\u8868",
  help_validation: "\u6307\u5B9A TypeDoc \u5E94\u5BF9\u751F\u6210\u7684\u6587\u6863\u6267\u884C\u54EA\u4E9B\u9A8C\u8BC1\u6B65\u9AA4",
  // ==================================================================
  // Option validation
  // ==================================================================
  unknown_option_0_you_may_have_meant_1: "\u672A\u77E5\u9009\u9879\u201C{0}\u201D \u4F60\u53EF\u80FD\u6307\u7684\u662F\uFF1A\n{1}",
  option_0_must_be_between_1_and_2: "{0} \u5FC5\u987B\u4ECB\u4E8E {1} \u548C {2} \u4E4B\u95F4",
  option_0_must_be_equal_to_or_greater_than_1: "{0} \u5FC5\u987B\u7B49\u4E8E\u6216\u5927\u4E8E {1}",
  option_0_must_be_less_than_or_equal_to_1: "{0} \u5FC5\u987B\u5C0F\u4E8E\u6216\u7B49\u4E8E {1}",
  option_0_must_be_one_of_1: "{0} \u5FC5\u987B\u662F {1} \u4E4B\u4E00",
  flag_0_is_not_valid_for_1_expected_2: "\u6807\u5FD7\u201C{0}\u201D\u5BF9 {1} \u65E0\u6548\uFF0C\u5E94\u4E3A {2} \u4E4B\u4E00",
  expected_object_with_flag_values_for_0: "\u9884\u671F\u4E3A\u4E00\u4E2A\u5E26\u6709\u6807\u5FD7\u503C\u4E3A {0} \u6216 true/false \u7684\u5BF9\u8C61",
  flag_values_for_0_must_be_booleans: "{0} \u7684\u6807\u5FD7\u503C\u5FC5\u987B\u662F\u5E03\u5C14\u503C",
  locales_must_be_an_object: `'locales' \u9009\u9879\u5FC5\u987B\u8BBE\u7F6E\u4E3A\u7C7B\u4F3C\u4E8E\u4EE5\u4E0B\u5BF9\u8C61\uFF1A{ en: { theme_implements: "Implements" }}`,
  exclude_not_documented_specified_0_valid_values_are_1: "excludeNotDocumentedKinds \u53EA\u80FD\u6307\u5B9A\u5DF2\u77E5\u503C\uFF0C\u5E76\u4E14\u63D0\u4F9B\u4E86\u65E0\u6548\u503C ({0})\u3002\u6709\u6548\u7C7B\u578B\u4E3A\uFF1A\n{1}",
  external_symbol_link_mappings_must_be_object: "externalSymbolLinkMappings \u5FC5\u987B\u662F Record<package name, Record<symbol name, link>>",
  highlight_theme_0_must_be_one_of_1: "{0} \u5FC5\u987B\u662F\u4E0B\u5217\u4E4B\u4E00\uFF1A{1}",
  highlightLanguages_contains_invalid_languages_0: "highlightLanguages \u5305\u542B\u65E0\u6548\u8BED\u8A00\uFF1A{0}\uFF0C\u8FD0\u884C typedoc --help \u83B7\u53D6\u53D7\u652F\u6301\u8BED\u8A00\u7684\u5217\u8868",
  hostedBaseUrl_must_start_with_http: "hostingBaseUrl \u5FC5\u987B\u4EE5 http:// \u6216 https:// \u5F00\u5934",
  useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl: "useHostedBaseUrlForAbsoluteLinks \u9009\u9879\u8981\u6C42\u8BBE\u7F6E hostingBaseUrl",
  favicon_must_have_one_of_the_following_extensions_0: "favicon \u7684\u540E\u7F00\u540D\u5FC5\u987B\u662F\u4E0B\u5217\u4E4B\u4E00\uFF1A{0}",
  option_0_must_be_an_object: "\u201C{0}\u201D\u9009\u9879\u5FC5\u987B\u662F\u975E\u6570\u7EC4\u5BF9\u8C61",
  option_0_must_be_an_array_of_string: "\u201C{0}\u201D\u9009\u9879\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6570\u7EC4",
  option_0_must_be_an_array_of_string_or_functions: "\u201C{0}\u201D\u9009\u9879\u5FC5\u987B\u662F\u7531\u5B57\u7B26\u4E32\u6216\u51FD\u6570\u6784\u6210\u7684\u6570\u7EC4",
  option_0_must_be_a_function: "\u2018{0}\u2019 \u9009\u9879\u5FC5\u987B\u662F\u4E00\u4E2A\u51FD\u6570",
  option_0_must_be_object_with_urls: "{0} \u5FC5\u987B\u662F\u5177\u6709\u5B57\u7B26\u4E32\u6807\u7B7E\u4F5C\u4E3A\u952E\u548C URL \u503C\u7684\u5BF9\u8C61",
  visibility_filters_only_include_0: "visibilityFilters \u53EA\u80FD\u5305\u542B\u4EE5\u4E0B\u975E@\u952E\uFF1A{0}",
  visibility_filters_must_be_booleans: "visibilityFilters \u7684\u6240\u6709\u503C\u90FD\u5FC5\u987B\u662F\u5E03\u5C14\u503C",
  option_0_values_must_be_numbers: "{0} \u7684\u6240\u6709\u503C\u90FD\u5FC5\u987B\u662F\u6570\u5B57",
  option_0_values_must_be_array_of_tags: "{0} \u5FC5\u987B\u662F\u6709\u6548\u6807\u7B7E\u540D\u79F0\u7684\u6570\u7EC4",
  option_0_specified_1_but_only_2_is_valid: "{0} \u53EA\u80FD\u6307\u5B9A\u5DF2\u77E5\u503C\uFF0C\u5E76\u4E14\u63D0\u4F9B\u4E86\u65E0\u6548\u503C ({1})\u3002\u6709\u6548\u7684\u6392\u5E8F\u7B56\u7565\u4E3A\uFF1A\n{2}",
  option_outputs_must_be_array: "\u201Coutputs\u201D \u9009\u9879\u5FC5\u987B\u4E3A\u4E00\u4E2A\u6570\u7EC4\uFF0C\u5176\u6210\u5458\u5747\u4E3A { name: string, path: string, options?: TypeDocOptions }\u3002",
  specified_output_0_has_not_been_defined: "\u6307\u5B9A\u7684\u8F93\u51FA\u7C7B\u578B {0} \u672A\u88AB\u5B9A\u4E49\u3002",
  // https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
  alert_note: "\u6CE8\u610F",
  alert_tip: "\u63D0\u793A",
  alert_important: "\u91CD\u8981",
  alert_warning: "\u8B66\u544A",
  alert_caution: "\u5C0F\u5FC3",
  // ReflectionKind singular translations
  kind_project: "\u9879\u76EE",
  kind_module: "\u6A21\u5757",
  kind_namespace: "\u547D\u540D\u7A7A\u95F4",
  kind_enum: "\u679A\u4E3E",
  kind_enum_member: "\u679A\u4E3E\u6210\u5458",
  kind_variable: "\u53D8\u91CF",
  kind_function: "\u51FD\u6570",
  kind_class: "\u7C7B",
  kind_interface: "\u63A5\u53E3",
  kind_constructor: "\u6784\u9020\u51FD\u6570",
  kind_property: "\u5C5E\u6027",
  kind_method: "\u65B9\u6CD5",
  kind_call_signature: "\u8C03\u7528\u7B7E\u540D",
  kind_index_signature: "\u7D22\u5F15\u7B7E\u540D",
  kind_constructor_signature: "\u6784\u9020\u51FD\u6570\u7B7E\u540D",
  kind_parameter: "\u53C2\u6570",
  kind_type_literal: "\u7C7B\u578B\u5B57\u9762\u91CF",
  kind_type_parameter: "\u7C7B\u578B\u53C2\u6570",
  kind_accessor: "\u8BBF\u95EE\u5668",
  kind_get_signature: "Getter \u7B7E\u540D",
  kind_set_signature: "Setter \u7B7E\u540D",
  kind_type_alias: "\u7C7B\u578B\u522B\u540D",
  kind_reference: "\u53C2\u8003",
  kind_document: "\u6587\u6863",
  // ReflectionKind plural translations
  kind_plural_project: "\u9879\u76EE",
  kind_plural_module: "\u6A21\u5757",
  kind_plural_namespace: "\u547D\u540D\u7A7A\u95F4",
  kind_plural_enum: "\u679A\u4E3E",
  kind_plural_enum_member: "\u679A\u4E3E\u6210\u5458",
  kind_plural_variable: "\u53D8\u91CF",
  kind_plural_function: "\u51FD\u6570",
  kind_plural_class: "\u7C7B",
  kind_plural_interface: "\u63A5\u53E3",
  kind_plural_constructor: "\u6784\u9020\u51FD\u6570",
  kind_plural_property: "\u5C5E\u6027",
  kind_plural_method: "\u65B9\u6CD5",
  kind_plural_call_signature: "\u8C03\u7528\u7B7E\u540D",
  kind_plural_index_signature: "\u7D22\u5F15\u7B7E\u540D",
  kind_plural_constructor_signature: "\u6784\u9020\u51FD\u6570\u7B7E\u540D",
  kind_plural_parameter: "\u53C2\u6570",
  kind_plural_type_literal: "\u7C7B\u578B\u5B57\u9762\u91CF",
  kind_plural_type_parameter: "\u7C7B\u578B\u53C2\u6570",
  kind_plural_accessor: "\u8BBF\u95EE\u5668",
  kind_plural_get_signature: "Getter \u7B7E\u540D",
  kind_plural_set_signature: "Setter \u7B7E\u540D",
  kind_plural_type_alias: "\u7C7B\u578B\u522B\u540D",
  kind_plural_reference: "\u53C2\u8003",
  kind_plural_document: "\u6587\u6863",
  // ReflectionFlag translations
  flag_private: "\u79C1\u6709",
  flag_protected: "\u53D7\u4FDD\u62A4",
  flag_public: "\u516C\u5F00",
  flag_static: "\u9759\u6001",
  flag_external: "\u5916\u90E8",
  flag_optional: "\u53EF\u9009",
  flag_rest: "\u52A8\u6001\u53C2\u6570",
  flag_abstract: "\u62BD\u8C61",
  flag_const: "\u5E38\u91CF",
  flag_readonly: "\u53EA\u8BFB",
  flag_inherited: "\u7EE7\u627F",
  // ==================================================================
  // Strings that show up in the default theme
  // ==================================================================
  // Page headings/labels
  theme_implements: "\u5B9E\u73B0",
  theme_indexable: "\u53EF\u7D22\u5F15",
  theme_type_declaration: "\u7C7B\u578B\u58F0\u660E",
  theme_index: "\u7D22\u5F15",
  theme_hierarchy: "\u5C42\u7EA7",
  theme_hierarchy_summary: "\u5C42\u7EA7\u4E00\u89C8",
  theme_hierarchy_view_summary: "\u67E5\u770B\u5C42\u7EA7\u4E00\u89C8",
  theme_implemented_by: "\u5B9E\u73B0\u4E8E",
  theme_defined_in: "\u5B9A\u4E49\u4E8E",
  theme_implementation_of: "\u5B9E\u73B0\u4E86",
  theme_inherited_from: "\u7EE7\u627F\u81EA",
  theme_overrides: "\u91CD\u5199\u4E86",
  theme_returns: "\u8FD4\u56DE",
  theme_generated_using_typedoc: "\u4F7F\u7528 TypeDoc \u751F\u6210",
  // If this includes "TypeDoc", theme will insert a link at that location.
  // Search
  theme_preparing_search_index: "\u6B63\u5728\u51C6\u5907\u641C\u7D22\u7D22\u5F15...",
  // Left nav bar
  theme_loading: "\u52A0\u8F7D\u4E2D\u2026\u2026",
  // Right nav bar
  theme_settings: "\u663E\u793A\u8BBE\u7F6E",
  theme_member_visibility: "\u6210\u5458\u53EF\u89C1\u6027",
  theme_theme: "\u914D\u8272",
  theme_os: "\u81EA\u52A8",
  theme_light: "\u6D45\u8272",
  theme_dark: "\u6DF1\u8272",
  theme_on_this_page: "\u76EE\u5F55",
  // aria-label
  theme_search: "\u641C\u7D22",
  theme_menu: "\u83DC\u5355",
  theme_permalink: "\u6C38\u4E45\u94FE\u63A5",
  theme_folder: "\u6587\u4EF6\u5939",
  // Used by the frontend JS
  // For the English translations only, these should also be added to
  // src/lib/output/themes/default/assets/typedoc/Application.ts
  // Also uses theme_folder and singular kinds
  theme_copy: "\u590D\u5236",
  theme_copied: "\u5DF2\u590D\u5236\uFF01",
  theme_normally_hidden: "\u7531\u4E8E\u60A8\u7684\u8FC7\u6EE4\u5668\u8BBE\u7F6E\uFF0C\u8BE5\u6210\u5458\u5DF2\u88AB\u9690\u85CF\u3002",
  theme_hierarchy_expand: "\u5C55\u5F00",
  theme_hierarchy_collapse: "\u6298\u53E0",
  theme_search_index_not_available: "\u641C\u7D22\u7D22\u5F15\u4E0D\u53EF\u7528",
  theme_search_no_results_found_for_0: "\u627E\u4E0D\u5230\u5305\u542B {0} \u7684\u7ED3\u679C",
  theme_search_placeholder: "\u641C\u7D22\u6587\u6863",
  // Block tags
  tag_defaultValue: "\u9ED8\u8BA4\u503C",
  tag_deprecated: "\u5DF2\u88AB\u5F03\u7528",
  tag_example: "\u793A\u4F8B",
  tag_param: "\u53C2\u6570",
  tag_privateRemarks: "\u79C1\u6709\u5907\u6CE8",
  tag_remarks: "\u5907\u6CE8",
  tag_returns: "\u8FD4\u56DE",
  tag_see: "\u53C2\u9605",
  tag_throws: "\u629B\u51FA",
  tag_typeParam: "\u7C7B\u578B\u53C2\u6570",
  tag_author: "\u4F5C\u8005",
  tag_callback: "\u56DE\u8C03",
  tag_category: "\u7C7B\u522B",
  tag_categoryDescription: "\u7C7B\u522B\u63CF\u8FF0",
  tag_default: "\u9ED8\u8BA4\u503C",
  tag_document: "\u6587\u6863",
  tag_extends: "\u7EE7\u627F\u81EA",
  tag_augments: "\u7EE7\u627F\u81EA",
  tag_yields: "\u751F\u6210",
  tag_group: "\u5206\u7EC4",
  tag_groupDescription: "\u5206\u7EC4\u63CF\u8FF0",
  tag_import: "\u5BFC\u5165",
  tag_inheritDoc: "\u7EE7\u627F\u6587\u6863",
  tag_jsx: "JSX",
  tag_license: "\u8BB8\u53EF\u534F\u8BAE",
  tag_module: "\u6A21\u5757",
  tag_mergeModuleWith: "\u5408\u5E76\u6A21\u5757\u81F3",
  tag_prop: "\u5C5E\u6027",
  tag_property: "\u5C5E\u6027",
  tag_return: "\u8FD4\u56DE",
  tag_satisfies: "\u6EE1\u8DB3",
  tag_since: "\u6DFB\u52A0\u4E8E",
  tag_sortStrategy: "\u6392\u5E8F\u7B56\u7565",
  tag_template: "\u7C7B\u578B\u53C2\u6570",
  tag_type: "\u7C7B\u578B",
  tag_typedef: "\u7C7B\u578B\u5B9A\u4E49",
  tag_summary: "\u6982\u8FF0",
  tag_preventInline: "\u53D6\u6D88\u5185\u8054",
  tag_inlineType: "\u5185\u8054\u7C7B\u578B",
  tag_preventExpand: "\u53D6\u6D88\u6269\u5C55",
  tag_expandType: "\u6269\u5C55\u7C7B\u578B",
  // Inline tags
  tag_link: "\u94FE\u63A5",
  tag_label: "\u6807\u8BB0",
  tag_linkcode: "\u94FE\u63A5",
  tag_linkplain: "\u94FE\u63A5",
  tag_include: "\u5305\u542B",
  tag_includeCode: "\u5305\u542B",
  // Modifier tags
  tag_alpha: "alpha",
  tag_beta: "beta",
  tag_eventProperty: "\u4E8B\u4EF6\u5C5E\u6027",
  tag_experimental: "\u5B9E\u9A8C\u6027",
  tag_internal: "\u5185\u90E8\u6210\u5458",
  tag_override: "\u91CD\u5199",
  tag_packageDocumentation: "\u5305\u6587\u6863",
  tag_public: "\u516C\u5171\u6210\u5458",
  tag_readonly: "\u53EA\u8BFB",
  tag_sealed: "\u65E0\u6CD5\u7EE7\u627F",
  tag_virtual: "\u865A\u51FD\u6570",
  tag_abstract: "\u62BD\u8C61\u7C7B",
  tag_class: "\u7C7B",
  tag_disableGroups: "\u7981\u7528\u5206\u7EC4",
  tag_enum: "\u679A\u4E3E",
  tag_event: "\u4E8B\u4EF6",
  tag_expand: "\u5C55\u5F00",
  tag_hidden: "\u9690\u85CF",
  tag_hideCategories: "\u5728\u7C7B\u522B\u4E2D\u9690\u85CF",
  tag_hideconstructor: "\u9690\u85CF\u6784\u9020\u5668",
  tag_hideGroups: "\u5728\u5206\u7EC4\u4E2D\u9690\u85CF",
  tag_ignore: "\u9690\u85CF",
  tag_inline: "\u5185\u8054",
  tag_interface: "\u63A5\u53E3",
  tag_namespace: "\u547D\u540D\u7A7A\u95F4",
  tag_function: "\u51FD\u6570",
  tag_overload: "\u91CD\u8F7D",
  tag_private: "\u79C1\u6709\u6210\u5458",
  tag_protected: "\u53D7\u4FDD\u62A4\u6210\u5458",
  tag_showCategories: "\u5728\u7C7B\u522B\u4E2D\u663E\u793A",
  tag_showGroups: "\u5728\u5206\u7EC4\u4E2D\u663E\u793A",
  tag_useDeclaredType: "\u4F7F\u7528\u58F0\u660E\u7C7B\u578B",
  tag_primaryExport: "\u4E3B\u8981\u5BFC\u51FA"
});

// src/lib/internationalization/internationalization.ts
var translations = /* @__PURE__ */ new Map([
  ["de", de_default],
  ["en", en_default],
  ["fr", fr_default],
  ["ja", ja_default],
  ["ko", ko_default],
  ["zh", zh_default]
]);
var Internationalization = class {
  locales = new DefaultMap3(() => ({}));
  loadedLocale;
  constructor() {
    this.setLocale("en");
  }
  setLocale(locale) {
    if (this.loadedLocale !== locale) {
      const defaultTranslations = translations.get(locale) || translations.get("en") || {};
      const overrides = this.locales.get(locale);
      setTranslations({ ...defaultTranslations, ...overrides });
      this.loadedLocale = locale;
    }
  }
  addTranslations(locale, translations2) {
    Object.assign(this.locales.get(locale), translations2);
    if (locale === this.loadedLocale) {
      addTranslations(translations2);
    }
  }
  hasTranslations(locale) {
    return this.getSupportedLanguages().includes(locale);
  }
  getSupportedLanguages() {
    const supported = new Set(translations.keys());
    for (const [locale, translations2] of this.locales) {
      if (Object.entries(translations2).length) {
        supported.add(locale);
      }
    }
    return Array.from(supported);
  }
};

// src/lib/output/output.ts
import { nicePath as nicePath5, ParameterType } from "#node-utils";
import { i18n as i18n33 } from "#utils";
var Outputs = class {
  constructor(application) {
    this.application = application;
  }
  application;
  outputs = /* @__PURE__ */ new Map();
  defaultOutput = "html";
  addOutput(name, output) {
    if (this.outputs.has(name)) {
      throw new Error(`Output type '${name}' has already been defined`);
    }
    this.outputs.set(name, output);
  }
  setDefaultOutputName(name) {
    this.defaultOutput = name;
  }
  getOutputSpecs() {
    const options = this.application.options;
    let outputs = [];
    const outputShortcuts = options.getDeclarations().filter(
      (decl) => decl.type === ParameterType.Path && decl.outputShortcut
    );
    if (options.isSet("out")) {
      outputs.push({
        name: this.defaultOutput,
        path: options.getValue("out")
      });
    }
    for (const shortcut of outputShortcuts) {
      if (options.isSet(shortcut.name)) {
        outputs.push({
          name: shortcut.outputShortcut,
          path: options.getValue(shortcut.name)
        });
      }
    }
    if (outputs.length === 0) {
      outputs = options.getValue("outputs") || [];
    }
    if (!outputs.length) {
      outputs.push({
        name: this.defaultOutput,
        path: options.getValue("out")
      });
    }
    return outputs;
  }
  async writeOutputs(project) {
    const outputs = this.getOutputSpecs();
    for (const output of outputs) {
      await this.writeOutput(output, project);
    }
  }
  async writeOutput(output, project) {
    const options = this.application.options;
    const snap = options.snapshot();
    const writer = this.outputs.get(output.name);
    if (!writer) {
      this.application.logger.error(
        i18n33.specified_output_0_has_not_been_defined(
          output.name
        )
      );
      return;
    }
    if (!this.application.setOptions(output.options || {}, true)) {
      options.restore(snap);
      return;
    }
    const preErrors = this.application.logger.errorCount;
    const start = Date.now();
    try {
      await writer(output.path, project);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.application.logger.error(message);
    }
    if (this.application.logger.errorCount === preErrors) {
      this.application.logger.info(
        i18n33.output_0_generated_at_1(
          output.name,
          nicePath5(output.path)
        )
      );
    } else {
      this.application.logger.error(
        i18n33.output_0_could_not_be_generated(
          output.name
        )
      );
    }
    this.application.logger.verbose(
      `${output.name} took ${Date.now() - start}ms`
    );
    options.restore(snap);
  }
};

// src/lib/validation/documentation.ts
import {
  DeclarationReflection as DeclarationReflection16,
  ReflectionKind as ReflectionKind33,
  ReflectionType as ReflectionType6
} from "#models";
import { i18n as i18n34, removeFlag as removeFlag2 } from "#utils";
function validateDocumentation(project, logger, requiredToBeDocumented, intentionallyNotDocumented, packagesRequiringDocumentation) {
  let kinds = requiredToBeDocumented.reduce(
    (prev, cur) => prev | ReflectionKind33[cur],
    0
  );
  if (kinds & ReflectionKind33.FunctionOrMethod) {
    kinds |= ReflectionKind33.CallSignature;
    kinds = removeFlag2(kinds, ReflectionKind33.FunctionOrMethod);
  }
  if (kinds & ReflectionKind33.Constructor) {
    kinds |= ReflectionKind33.ConstructorSignature;
    kinds = removeFlag2(kinds, ReflectionKind33.Constructor);
  }
  if (kinds & ReflectionKind33.Accessor) {
    kinds |= ReflectionKind33.GetSignature | ReflectionKind33.SetSignature;
    kinds = removeFlag2(kinds, ReflectionKind33.Accessor);
  }
  const toProcess = project.getReflectionsByKind(kinds);
  const seen = /* @__PURE__ */ new Set();
  const intentionalUsage = /* @__PURE__ */ new Set();
  outer: while (toProcess.length) {
    const ref = toProcess.shift();
    if (seen.has(ref)) continue;
    seen.add(ref);
    let r = ref.parent;
    while (r) {
      if (r.kindOf(ReflectionKind33.Parameter)) {
        continue outer;
      }
      r = r.parent;
    }
    if (ref.kindOf(ReflectionKind33.TypeLiteral) && ref.parent?.kindOf(ReflectionKind33.TypeAlias)) {
      toProcess.push(ref.parent);
      continue;
    }
    if (ref.kindOf(ReflectionKind33.CallSignature) && ref.parent?.kindOf(ReflectionKind33.TypeLiteral)) {
      toProcess.push(ref.parent.parent);
      continue;
    }
    if (ref.kindOf(ReflectionKind33.ConstructorSignature) && ref.parent?.parent?.kindOf(ReflectionKind33.TypeAlias)) {
      toProcess.push(ref.parent.parent);
      continue;
    }
    if (ref instanceof DeclarationReflection16) {
      const signatures = ref.type instanceof ReflectionType6 ? ref.type.declaration.getNonIndexSignatures() : ref.getNonIndexSignatures();
      if (signatures.length) {
        toProcess.push(...signatures);
        if (ref.kindOf(ReflectionKind33.SignatureContainer)) {
          continue;
        }
      }
    }
    const symbolId = project.getSymbolIdFromReflection(ref);
    const hasComment = ref.hasComment() || ref.kindOf(ReflectionKind33.SomeSignature) && ref.parent?.hasComment();
    if (!hasComment && symbolId) {
      if (!packagesRequiringDocumentation.includes(symbolId.packageName)) {
        continue;
      }
      const intentionalIndex = intentionallyNotDocumented.indexOf(
        ref.getFriendlyFullName()
      );
      if (intentionalIndex !== -1) {
        intentionalUsage.add(intentionalIndex);
        continue;
      }
      logger.validationWarning(
        i18n34.reflection_0_kind_1_defined_in_2_does_not_have_any_documentation(
          ref.getFriendlyFullName(),
          ReflectionKind33[ref.kind],
          `${symbolId.packageName}/${symbolId.packagePath}`
        )
      );
    }
  }
  const unusedIntentional = intentionallyNotDocumented.filter(
    (_, i) => !intentionalUsage.has(i)
  );
  if (unusedIntentional.length) {
    logger.validationWarning(
      i18n34.invalid_intentionally_not_documented_names_0(
        unusedIntentional.join("\n	")
      )
    );
  }
}

// src/lib/validation/exports.ts
import { ok as ok8 } from "assert";
import { discoverAllReferenceTypes as discoverAllReferenceTypes2 } from "#node-utils";
import { i18n as i18n35 } from "#utils";
function makeIntentionallyExportedHelper(project, intentional, logger) {
  const used = /* @__PURE__ */ new Set();
  const processed = intentional.map((v) => {
    const index2 = v.lastIndexOf(":");
    if (index2 === -1) {
      return ["", v];
    }
    return [v.substring(0, index2), v.substring(index2 + 1)];
  });
  return {
    has(type2, typeName) {
      ok8(!type2.reflection);
      if (!type2.package) {
        logger.verbose(
          `The type ${type2.qualifiedName} has no declarations, implicitly allowing missing export.`
        );
        return true;
      }
      if (type2.package !== project.packageName) {
        return true;
      }
      for (const [index2, [file, name]] of processed.entries()) {
        if (typeName === name && `${type2.symbolId.packageName}/${type2.symbolId.packagePath}`.endsWith(file)) {
          used.add(index2);
          return true;
        }
      }
      return false;
    },
    getUnused() {
      return intentional.filter((_, i) => !used.has(i));
    }
  };
}
function validateExports(project, logger, intentionallyNotExported) {
  const intentional = makeIntentionallyExportedHelper(
    project,
    intentionallyNotExported,
    logger
  );
  const warned = /* @__PURE__ */ new Set();
  for (const { type: type2, owner } of discoverAllReferenceTypes2(project, true)) {
    const uniqueId = type2.symbolId?.getStableKey();
    if (!type2.reflection && !type2.externalUrl && !type2.isIntentionallyBroken() && !intentional.has(type2, type2.qualifiedName) && !warned.has(uniqueId) && !project.symbolIdHasBeenRemoved(type2.symbolId)) {
      warned.add(uniqueId);
      logger.validationWarning(
        i18n35.type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs(
          type2.qualifiedName,
          `${type2.symbolId.packageName}/${type2.symbolId.packagePath}`,
          owner.getFriendlyFullName()
        )
      );
    }
  }
  const unusedIntentional = intentional.getUnused();
  if (unusedIntentional.length) {
    logger.validationWarning(
      i18n35.invalid_intentionally_not_exported_symbols_0(
        unusedIntentional.join("\n	")
      )
    );
  }
}

// src/lib/validation/filePaths.ts
import { i18n as i18n36 } from "#utils";
import { isFile as isFile3 } from "#node-utils";
function validateFilePaths(project, logger) {
  for (const absolute of project.files.getMediaPaths()) {
    if (!isFile3(absolute)) {
      logger.validationWarning(
        i18n36.relative_path_0_is_not_a_file_and_will_not_be_copied_to_output(absolute)
      );
    }
  }
}

// src/lib/validation/links.ts
import { i18n as i18n37 } from "#utils";
import {
  ReflectionKind as ReflectionKind34,
  ReflectionSymbolId as ReflectionSymbolId3
} from "#models";
var linkTags = ["@link", "@linkcode", "@linkplain"];
function getBrokenPartLinks(parts) {
  const links = [];
  for (const part of parts) {
    if (part.kind === "inline-tag" && linkTags.includes(part.tag) && (!part.target || part.target instanceof ReflectionSymbolId3)) {
      links.push(part);
    }
  }
  return links;
}
function getBrokenLinks(comment) {
  if (!comment) return [];
  const links = [...getBrokenPartLinks(comment.summary)];
  for (const tag of comment.blockTags) {
    links.push(...getBrokenPartLinks(tag.content));
  }
  return links;
}
function validateLinks(project, logger) {
  for (const id in project.reflections) {
    checkReflection(project.reflections[id], logger);
  }
}
function checkReflection(reflection, logger) {
  if (reflection.isProject() || reflection.isDeclaration()) {
    for (const broken of getBrokenPartLinks(reflection.readme || [])) {
      const linkText = broken.text.trim();
      if (linkText.startsWith("@") && !linkText.includes("!")) {
        logger.validationWarning(
          i18n37.failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2(
            linkText,
            reflection.getFriendlyFullName(),
            linkText.replace(/[.#~]/, "!")
          )
        );
      } else {
        logger.validationWarning(
          i18n37.failed_to_resolve_link_to_0_in_readme_for_1(
            linkText,
            reflection.getFriendlyFullName()
          )
        );
      }
    }
  }
  if (reflection.isDocument()) {
    for (const broken of getBrokenPartLinks(reflection.content)) {
      const linkText = broken.text.trim();
      if (linkText.startsWith("@") && !linkText.includes("!")) {
        logger.validationWarning(
          i18n37.failed_to_resolve_link_to_0_in_document_1_may_have_meant_2(
            linkText,
            reflection.getFriendlyFullName(),
            linkText.replace(/[.#~]/, "!")
          )
        );
      } else {
        logger.validationWarning(
          i18n37.failed_to_resolve_link_to_0_in_document_1(
            linkText,
            reflection.getFriendlyFullName()
          )
        );
      }
    }
  }
  for (const broken of getBrokenLinks(reflection.comment)) {
    reportBrokenCommentLink(broken, reflection, logger);
  }
  if (reflection.isDeclaration() && reflection.kindOf(ReflectionKind34.TypeAlias) && reflection.type?.type === "union" && reflection.type.elementSummaries) {
    for (const broken of reflection.type.elementSummaries.flatMap(
      getBrokenPartLinks
    )) {
      reportBrokenCommentLink(broken, reflection, logger);
    }
  }
}
function reportBrokenCommentLink(broken, reflection, logger) {
  const linkText = broken.text.trim();
  if (broken.target instanceof ReflectionSymbolId3) {
    logger.validationWarning(
      i18n37.comment_for_0_links_to_1_not_included_in_docs_use_external_link_2(
        reflection.getFriendlyFullName(),
        linkText,
        `{ "${broken.target.packageName}": { "${broken.target.qualifiedName}": "#" }}`
      )
    );
  } else if (linkText.startsWith("@") && !linkText.includes("!")) {
    logger.validationWarning(
      i18n37.failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2(
        linkText,
        reflection.getFriendlyFullName(),
        linkText.replace(/[.#~]/, "!")
      )
    );
  } else {
    logger.validationWarning(
      i18n37.failed_to_resolve_link_to_0_in_comment_for_1(
        linkText,
        reflection.getFriendlyFullName()
      )
    );
  }
}

// src/lib/validation/unusedMergeModuleWith.ts
import { i18n as i18n38 } from "#utils";
import { ReflectionKind as ReflectionKind35 } from "#models";
function validateMergeModuleWith(project, logger) {
  for (const refl of project.getReflectionsByKind(
    ReflectionKind35.SomeModule
  )) {
    if (refl.comment?.getTag("@mergeModuleWith")) {
      logger.warn(
        i18n38.reflection_0_has_unused_mergeModuleWith_tag(
          refl.getFriendlyFullName()
        )
      );
    }
  }
  if (project.comment?.getTag("@mergeModuleWith")) {
    logger.warn(
      i18n38.reflection_0_has_unused_mergeModuleWith_tag(
        "<project>"
      )
    );
  }
}

// src/lib/application.ts
var DETECTOR = /* @__PURE__ */ Symbol();
var DEFAULT_READERS = [
  new TypeDocReader(),
  new PackageJsonReader(),
  new TSConfigReader()
];
var _entryPoints_dec2, _entryPointStrategy_dec2, _skipErrorChecking_dec, _lang_dec, _a17, _init19, _lang, _skipErrorChecking, _entryPointStrategy2, _entryPoints2;
var _Application = class _Application extends (_a17 = AbstractComponent5, _lang_dec = [Option16("lang")], _skipErrorChecking_dec = [Option16("skipErrorChecking")], _entryPointStrategy_dec2 = [Option16("entryPointStrategy")], _entryPoints_dec2 = [Option16("entryPoints")], _a17) {
  /**
   * Create a new TypeDoc application instance.
   */
  constructor(detector) {
    if (detector !== DETECTOR) {
      throw new Error(
        "An application handle must be retrieved with Application.bootstrap or Application.bootstrapWithPlugins"
      );
    }
    super(null);
    __publicField(this, "_logger", new FancyConsoleLogger());
    /**
     * The converter used to create the declaration reflections.
     */
    __publicField(this, "converter");
    __publicField(this, "outputs", new Outputs(this));
    /**
     * The renderer used to generate the HTML documentation output.
     */
    __publicField(this, "renderer");
    /**
     * The serializer used to generate JSON output.
     */
    __publicField(this, "serializer", new Serializer());
    /**
     * The deserializer used to restore previously serialized JSON output.
     */
    __publicField(this, "deserializer", new Deserializer(this._logger));
    /**
     * Internationalization module which supports translating according to
     * the `lang` option.
     */
    __publicField(this, "internationalization", new Internationalization());
    __publicField(this, "options", new Options());
    /**
     * Due for deprecation in 0.29, use the reference to this on {@link ProjectReflection},
     * this was the wrong place for this member to live.
     */
    __publicField(this, "files", new ValidatingFileRegistry());
    /**
     * Cache of git repository information used by the SourcePlugin to get source URLs.
     * Will be undefined before {@link convert} is called, will also be undefined if the
     * `--disableSources` option is enabled.
     * @internal
     */
    __publicField(this, "repositories");
    __privateAdd(this, _lang, __runInitializers(_init19, 8, this)), __runInitializers(_init19, 11, this);
    __privateAdd(this, _skipErrorChecking, __runInitializers(_init19, 12, this)), __runInitializers(_init19, 15, this);
    __privateAdd(this, _entryPointStrategy2, __runInitializers(_init19, 16, this)), __runInitializers(_init19, 19, this);
    __privateAdd(this, _entryPoints2, __runInitializers(_init19, 20, this)), __runInitializers(_init19, 23, this);
    __publicField(this, "watchers", /* @__PURE__ */ new Map());
    __publicField(this, "_watchFile");
    __publicField(this, "criticalFiles", /* @__PURE__ */ new Set());
    this.converter = new Converter(this);
    this.renderer = new Renderer(this);
    this.outputs.addOutput("json", async (out, project) => {
      const ser = this.serializer.projectToObject(project, normalizePath8(process.cwd()));
      const space2 = this.options.getValue("pretty") ? "	" : "";
      await writeFile7(out, JSON.stringify(ser, null, space2) + "\n");
    });
    this.outputs.addOutput("html", async (out, project) => {
      await this.renderer.render(project, out);
    });
  }
  /**
   * The logger that should be used to output messages.
   */
  get logger() {
    return this._logger;
  }
  set logger(l) {
    this._logger = l;
    this.deserializer.logger = l;
  }
  /**
   * Initialize TypeDoc, loading plugins if applicable.
   */
  static async bootstrapWithPlugins(options = {}, readers = DEFAULT_READERS) {
    const app = new _Application(DETECTOR);
    readers.forEach((r) => app.options.addReader(r));
    app.options.reset();
    app.setOptions(
      options,
      /* reportErrors */
      false
    );
    app.internationalization.setLocale(app.lang);
    await app.options.read(new Logger2(), void 0, (path3) => app.watchConfigFile(path3));
    app.internationalization.setLocale(app.lang);
    app.logger.level = app.options.getValue("logLevel");
    await loadPlugins(app, app.options.getValue("plugin"));
    await app._bootstrap(options);
    return app;
  }
  /**
   * Initialize TypeDoc without loading plugins.
   *
   * @example
   * Initialize the application with pretty-printing output disabled.
   * ```ts
   * const app = await Application.bootstrap({ pretty: false });
   * ```
   *
   * @param options Options to set during initialization
   * @param readers Option readers to use to discover options from config files.
   */
  static async bootstrap(options = {}, readers = DEFAULT_READERS) {
    const app = new _Application(DETECTOR);
    readers.forEach((r) => app.options.addReader(r));
    await app._bootstrap(options);
    return app;
  }
  /**
   * Internal utility to synchronously create an application instance.
   * Only intended for TypeDoc's unit tests.
   * @internal
   * @private
   */
  static createAppForTesting() {
    const app = new _Application(DETECTOR);
    app.files = new FileRegistry2();
    return app;
  }
  async _bootstrap(options) {
    this.options.reset();
    this.setOptions(
      options,
      /* reportErrors */
      false
    );
    this.internationalization.setLocale(this.lang);
    await this.options.read(this.logger, void 0, (path3) => this.watchConfigFile(path3));
    this.setOptions(options);
    this.internationalization.setLocale(this.lang);
    if (isDebugging()) {
      this.logger.level = LogLevel.Verbose;
    } else {
      this.logger.level = this.options.getValue("logLevel");
    }
    if (this.files instanceof ValidatingFileRegistry) {
      this.files.basePath = this.options.getValue("basePath");
    }
    for (const [lang, locales] of Object.entries(
      this.options.getValue("locales")
    )) {
      this.internationalization.addTranslations(lang, locales);
    }
    if (hasBeenLoadedMultipleTimes()) {
      this.logger.warn(
        i18n39.loaded_multiple_times_0(
          getLoadedPaths().join("\n	")
        )
      );
    }
    this.trigger(ApplicationEvents.BOOTSTRAP_END, this);
    if (!this.internationalization.hasTranslations(this.lang)) {
      this.logger.warn(
        `Options specified "${this.lang}" as the language to use, but TypeDoc cannot provide translations for it.`
      );
      this.logger.info(
        "The languages that translations are available for are:\n	" + this.internationalization.getSupportedLanguages().join("\n	")
      );
      this.logger.info(
        "You can define/override local locales with the `locales` option, or contribute them to TypeDoc!"
      );
    }
    if (this.options.getValue("useHostedBaseUrlForAbsoluteLinks") && !this.options.getValue("hostedBaseUrl")) {
      this.logger.warn(
        i18n39.useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl()
      );
      this.options.setValue("useHostedBaseUrlForAbsoluteLinks", false);
    }
  }
  /** @internal */
  setOptions(options, reportErrors = true) {
    let success = true;
    for (const [key, val] of Object.entries(options)) {
      try {
        this.options.setValue(key, val);
      } catch (error) {
        success = false;
        ok9(error instanceof Error);
        if (reportErrors) {
          this.logger.error(error.message);
        }
      }
    }
    return success;
  }
  /**
   * Return the path to the TypeScript compiler.
   */
  getTypeScriptPath() {
    return nicePath6(Path7.dirname(TYPESCRIPT_ROOT));
  }
  getTypeScriptVersion() {
    return ts17.version;
  }
  getEntryPoints() {
    if (this.options.isSet("entryPoints")) {
      return this.getDefinedEntryPoints();
    }
    return inferEntryPoints(this.logger, this.options);
  }
  /**
   * Gets the entry points to be documented according to the current `entryPoints` and `entryPointStrategy` options.
   * May return undefined if entry points fail to be expanded.
   */
  getDefinedEntryPoints() {
    return getEntryPoints(this.logger, this.options);
  }
  /**
   * Run the converter for the given set of files and return the generated reflections.
   *
   * @returns An instance of ProjectReflection on success, undefined otherwise.
   */
  async convert() {
    const start = Date.now();
    this.logger.verbose(
      `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`
    );
    if (this.entryPointStrategy === EntryPointStrategy.Merge) {
      return this._merge();
    }
    if (this.entryPointStrategy === EntryPointStrategy.Packages) {
      return this._convertPackages();
    }
    if (!SUPPORTED_TYPESCRIPT_VERSIONS.some(
      (version) => version == ts17.versionMajorMinor
    )) {
      this.logger.warn(
        i18n39.unsupported_ts_version_0(
          SUPPORTED_TYPESCRIPT_VERSIONS.join(", ")
        )
      );
    }
    const entryPoints = this.getEntryPoints();
    if (!entryPoints) {
      return;
    }
    await this.initializeRepositories(entryPoints);
    const programs = unique3(entryPoints.map((e) => e.program));
    this.logger.verbose(
      `Converting with ${programs.length} programs ${entryPoints.length} entry points`
    );
    if (this.skipErrorChecking === false) {
      const errors = programs.flatMap((program) => ts17.getPreEmitDiagnostics(program));
      if (errors.length) {
        diagnostics(this.logger, errors);
        return;
      }
    }
    if (this.options.getValue("emit") === "both") {
      for (const program of programs) {
        program.emit();
      }
    }
    const startConversion = Date.now();
    this.logger.verbose(
      `Finished getting entry points in ${Date.now() - start}ms`
    );
    const project = this.converter.convert(entryPoints);
    this.logger.verbose(
      `Finished conversion in ${Date.now() - startConversion}ms`
    );
    return project;
  }
  clearWatches() {
    this.watchers.forEach((w) => w.close());
    this.watchers.clear();
  }
  watchConfigFile(path3) {
    this.criticalFiles.add(path3);
  }
  /**
   * Register that the current build depends on a file, so that in watch mode
   * the build will be repeated.  Has no effect if a watch build is not
   * running, or if the file has already been registered.
   *
   * @param path The file to watch.  It does not need to exist, and you should
   * in fact register files you look for, but which do not exist, so that if
   * they are created the build will re-run.  (e.g. if you look through a list
   * of 5 possibilities and find the third, you should register the first 3.)
   *
   * @param shouldRestart Should the build be completely restarted?  (This is
   * normally only used for configuration files -- i.e. files whose contents
   * determine how conversion, rendering, or compiling will be done, as
   * opposed to files that are only read *during* the conversion or
   * rendering.)
   */
  watchFile(path3, shouldRestart = false) {
    this._watchFile?.(path3, shouldRestart);
  }
  /**
   * Run a convert / watch process.
   *
   * @param success Callback to run after each convert, receiving the project
   * @returns True if the watch process should be restarted due to a
   * configuration change, false for an options error
   */
  async convertAndWatch(success) {
    if (!this.options.getValue("preserveWatchOutput") && this.logger instanceof FancyConsoleLogger) {
      ts17.sys.clearScreen?.();
    }
    this.logger.verbose(
      `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`
    );
    if (!SUPPORTED_TYPESCRIPT_VERSIONS.some(
      (version) => version == ts17.versionMajorMinor
    )) {
      this.logger.warn(
        i18n39.unsupported_ts_version_0(
          SUPPORTED_TYPESCRIPT_VERSIONS.join(", ")
        )
      );
    }
    if (Object.keys(this.options.getCompilerOptions(this.logger)).length === 0) {
      this.logger.warn(i18n39.no_compiler_options_set());
    }
    if (this.options.getFileNames().length === 0) {
      this.logger.error(i18n39.solution_not_supported_in_watch_mode());
      return false;
    }
    if (this.entryPointStrategy !== EntryPointStrategy.Resolve && this.entryPointStrategy !== EntryPointStrategy.Expand) {
      this.logger.error(i18n39.strategy_not_supported_in_watch_mode());
      return false;
    }
    const tsconfigFile = findTsConfigFile(this.options.getValue("tsconfig")) ?? "tsconfig.json";
    let firstStatusReport = true;
    const host = ts17.createWatchCompilerHost(
      tsconfigFile,
      this.options.fixCompilerOptions({}, this.logger),
      ts17.sys,
      ts17.createEmitAndSemanticDiagnosticsBuilderProgram,
      (d) => diagnostic(this.logger, d),
      (status, newLine, _options, errorCount) => {
        if (!firstStatusReport && errorCount === void 0 && !this.options.getValue("preserveWatchOutput") && this.logger instanceof FancyConsoleLogger) {
          ts17.sys.clearScreen?.();
        }
        firstStatusReport = false;
        this.logger.info(
          ts17.flattenDiagnosticMessageText(
            status.messageText,
            newLine
          )
        );
      }
    );
    let successFinished = true;
    let currentProgram;
    let lastProgram = currentProgram;
    let restarting = false;
    this._watchFile = (path3, shouldRestart = false) => {
      this.logger.verbose(
        `Watching ${nicePath6(path3)}, shouldRestart=${shouldRestart}`
      );
      if (this.watchers.has(path3)) return;
      this.watchers.set(
        path3,
        host.watchFile(
          path3,
          (file) => {
            if (shouldRestart) {
              restartMain(file);
            } else if (!currentProgram) {
              currentProgram = lastProgram;
              this.logger.info(
                i18n39.file_0_changed_rebuilding(
                  nicePath6(file)
                )
              );
            }
            if (successFinished) void runSuccess();
          },
          2e3
        )
      );
    };
    let exitWatch;
    const restartMain = (file) => {
      if (restarting) return;
      this.logger.info(
        i18n39.file_0_changed_restarting(nicePath6(file))
      );
      restarting = true;
      currentProgram = void 0;
      this.clearWatches();
      tsWatcher.close();
    };
    const runSuccess = async () => {
      if (restarting && successFinished) {
        successFinished = false;
        exitWatch(true);
        return;
      }
      if (!currentProgram) {
        return;
      }
      if (successFinished) {
        if (this.options.getValue("emit") === "both" && currentProgram !== lastProgram) {
          currentProgram.emit();
        }
        const lastFiles = lastProgram?.getSourceFiles().map((s) => s.fileName).sort().join("\0");
        const currentFiles = currentProgram.getSourceFiles().map((s) => s.fileName).sort().join("\0");
        lastProgram = currentProgram;
        this.logger.resetErrors();
        this.logger.resetWarnings();
        const entryPoints = getWatchEntryPoints(
          this.logger,
          this.options,
          currentProgram
        );
        if (!entryPoints) {
          return;
        }
        successFinished = false;
        this.clearWatches();
        if (!this.repositories || lastFiles !== currentFiles) {
          await this.initializeRepositories(entryPoints);
        }
        this.criticalFiles.forEach((path3) => this.watchFile(path3, true));
        const project = this.converter.convert(entryPoints);
        currentProgram = void 0;
        void success(project).then(() => {
          successFinished = true;
          return runSuccess();
        });
      }
    };
    const origAfterProgramCreate = host.afterProgramCreate;
    host.afterProgramCreate = (program) => {
      if (!restarting && ts17.getPreEmitDiagnostics(program.getProgram()).length === 0) {
        currentProgram = program.getProgram();
        void runSuccess();
      }
      origAfterProgramCreate?.(program);
    };
    const tsWatcher = ts17.createWatchProgram(host);
    return await new Promise((res) => {
      exitWatch = res;
    });
  }
  validate(project) {
    const checks = this.options.getValue("validation");
    const start = Date.now();
    if (checks.notExported && this.entryPointStrategy !== EntryPointStrategy.Merge) {
      validateExports(
        project,
        this.logger,
        this.options.getValue("intentionallyNotExported")
      );
    }
    if (checks.notDocumented) {
      const packagesRequiringDocumentation = this.options.isSet("packagesRequiringDocumentation") ? this.options.getValue("packagesRequiringDocumentation") : [project.packageName ?? ReflectionSymbolId4.UNKNOWN_PACKAGE];
      validateDocumentation(
        project,
        this.logger,
        this.options.getValue("requiredToBeDocumented"),
        this.options.getValue("intentionallyNotDocumented"),
        packagesRequiringDocumentation
      );
    }
    if (checks.invalidLink) {
      validateLinks(project, this.logger);
    }
    if (checks.unusedMergeModuleWith) {
      validateMergeModuleWith(project, this.logger);
    }
    if (checks.invalidPath) {
      validateFilePaths(project, this.logger);
    }
    this.trigger(_Application.EVENT_VALIDATE_PROJECT, project);
    this.logger.verbose(`Validation took ${Date.now() - start}ms`);
  }
  /**
   * Render outputs selected with options for the specified project
   */
  async generateOutputs(project) {
    this.trigger(_Application.EVENT_GENERATE_OUTPUTS_BEGIN, project);
    await this.outputs.writeOutputs(project);
    this.trigger(_Application.EVENT_GENERATE_OUTPUTS_END, project);
  }
  /**
   * Render HTML for the given project
   */
  async generateDocs(project, out) {
    this.trigger(_Application.EVENT_GENERATE_OUTPUTS_BEGIN, project);
    await this.outputs.writeOutput(
      {
        name: "html",
        path: out
      },
      project
    );
    this.trigger(_Application.EVENT_GENERATE_OUTPUTS_END, project);
  }
  /**
   * Write the reflections to a json file.
   *
   * @param out The path and file name of the target file.
   * @returns Whether the JSON file could be written successfully.
   */
  async generateJson(project, out) {
    this.trigger(_Application.EVENT_GENERATE_OUTPUTS_BEGIN, project);
    await this.outputs.writeOutput(
      {
        name: "json",
        path: out
      },
      project
    );
    this.trigger(_Application.EVENT_GENERATE_OUTPUTS_END, project);
  }
  /**
   * Print the version number.
   */
  toString() {
    return [
      "",
      `TypeDoc ${_Application.VERSION}`,
      `Using TypeScript ${this.getTypeScriptVersion()} from ${this.getTypeScriptPath()}`,
      ""
    ].join("\n");
  }
  async _convertPackages() {
    if (!this.options.isSet("entryPoints")) {
      this.logger.error(i18n39.no_entry_points_for_packages());
      return;
    }
    const packageDirs = getPackageDirectories(
      this.logger,
      this.options,
      this.options.getValue("entryPoints")
    );
    if (packageDirs.length === 0) {
      this.logger.error(i18n39.failed_to_find_packages());
      return;
    }
    const origFiles = this.files;
    const origOptions = this.options;
    const projects = [];
    for (const opt of Object.keys(this.options.getValue("packageOptions"))) {
      if (rootPackageOptions.includes(opt)) {
        this.logger.warn(
          i18n39.package_option_0_should_be_specified_at_root(
            opt
          )
        );
      }
    }
    const projectsToConvert = [];
    for (const dir of packageDirs) {
      this.logger.verbose(`Reading project at ${nicePath6(dir)}`);
      let opts;
      try {
        opts = origOptions.copyForPackage(dir);
      } catch (error) {
        ok9(error instanceof Error);
        this.logger.error(error.message);
        this.logger.info(
          i18n39.previous_error_occurred_when_reading_options_for_0(
            nicePath6(dir)
          )
        );
        continue;
      }
      await opts.read(this.logger, dir);
      opts.setValue("validation", {
        invalidLink: false,
        unusedMergeModuleWith: false
      });
      if (opts.getValue("entryPointStrategy") === EntryPointStrategy.Packages) {
        this.logger.error(
          i18n39.nested_packages_unsupported_0(nicePath6(dir))
        );
        continue;
      }
      projectsToConvert.push({ dir, options: opts });
    }
    for (const { dir, options } of projectsToConvert) {
      this.logger.info(i18n39.converting_project_at_0(nicePath6(dir)));
      this.options = options;
      this.files = new ValidatingFileRegistry(options.getValue("basePath"));
      let project = await this.convert();
      if (project) {
        this.validate(project);
        const serialized = this.serializer.projectToObject(
          project,
          normalizePath8(process.cwd())
        );
        projects.push(serialized);
      }
      project = void 0;
      this.files = void 0;
      continue;
    }
    this.options = origOptions;
    this.files = origFiles;
    if (projects.length !== packageDirs.length) {
      this.logger.error(i18n39.failed_to_convert_packages());
      return;
    }
    this.logger.info(i18n39.merging_converted_projects());
    const result = this.deserializer.reviveProjects(
      this.options.getValue("name") || "Documentation",
      projects,
      {
        projectRoot: normalizePath8(process.cwd()),
        registry: this.files,
        alwaysCreateEntryPointModule: this.options.getValue("alwaysCreateEntryPointModule")
      }
    );
    this.converter.addProjectDocuments(result);
    this.trigger(ApplicationEvents.REVIVE, result);
    return result;
  }
  _merge() {
    const start = Date.now();
    if (!this.options.isSet("entryPoints")) {
      this.logger.error(i18n39.no_entry_points_to_merge());
      return;
    }
    const rootDir = deriveRootDir2(this.entryPoints);
    const entryPoints = this.entryPoints.flatMap((entry) => {
      const result2 = glob(entry, rootDir);
      if (result2.length === 0) {
        this.logger.warn(
          i18n39.entrypoint_did_not_match_files_0(entry)
        );
      } else if (result2.length !== 1) {
        this.logger.verbose(
          `Expanded ${entry} to:
	${result2.map(nicePath6).join("\n	")}`
        );
      }
      return result2;
    });
    const jsonProjects = entryPoints.map((path3) => {
      try {
        return JSON.parse(readFile5(path3));
      } catch {
        this.logger.error(
          i18n39.failed_to_parse_json_0(nicePath6(path3))
        );
        return null;
      }
    });
    if (this.logger.hasErrors()) return;
    const result = this.deserializer.reviveProjects(
      this.options.getValue("name"),
      jsonProjects,
      {
        projectRoot: normalizePath8(process.cwd()),
        registry: this.files,
        alwaysCreateEntryPointModule: this.options.getValue("alwaysCreateEntryPointModule")
      }
    );
    this.converter.addProjectDocuments(result);
    this.logger.verbose(`Reviving projects took ${Date.now() - start}ms`);
    this.trigger(ApplicationEvents.REVIVE, result);
    return result;
  }
  /**
   * Conversion is synchronous to ensure that TypeDoc builds are completely
   * reproducible, so the SourcePlugin, which needs git information either needs
   * to run commands synchronously or we need to initialize the repositories which
   * are relevant before calling {@link Converter#convert}. As of v0.28.20, we do
   * that initialization early.
   *
   * This generally does not need to be called manually as {@link convert} and
   * {@link convertAndWatch} will automatically do it, but is exposed for API users
   * who want to primarily run TypeDoc synchronously.
   */
  async initializeRepositories(entryPoints) {
    const start = Date.now();
    this.repositories = void 0;
    if (this.options.getValue("disableSources")) {
      return;
    }
    const disableGit = this.options.getValue("disableGit");
    const sourceLinkTemplate = this.options.getValue("sourceLinkTemplate");
    const gitRevision = this.options.getValue("gitRevision");
    if (disableGit && !sourceLinkTemplate) {
      this.application.logger.error(
        i18n39.disable_git_set_but_not_source_link_template()
      );
      return;
    }
    if (disableGit && sourceLinkTemplate.includes("{gitRevision}") && !gitRevision) {
      this.application.logger.warn(
        i18n39.disable_git_set_and_git_revision_used()
      );
    }
    const basePath = this.options.getValue("displayBasePath") || getCommonDirectory2(entryPoints.map((e) => e.sourceFile.fileName));
    this.repositories = new RepositoryManager(
      basePath,
      gitRevision,
      this.options.getValue("gitRemote"),
      sourceLinkTemplate,
      disableGit,
      this.logger
    );
    const programs = unique3(entryPoints.map((e) => e.program));
    const possibleRepoDirs = unique3(
      programs.map((p) => p.getSourceFiles().map((s) => Path7.dirname(s.fileName)).flat()).flat()
    );
    await this.repositories.initializeRepositoriesForDirs(possibleRepoDirs);
    this.logger.verbose(`Took ${Date.now() - start}ms to initialize repositories`);
  }
};
_init19 = __decoratorStart(_a17);
_lang = new WeakMap();
_skipErrorChecking = new WeakMap();
_entryPointStrategy2 = new WeakMap();
_entryPoints2 = new WeakMap();
__decorateElement(_init19, 4, "lang", _lang_dec, _Application, _lang);
__decorateElement(_init19, 4, "skipErrorChecking", _skipErrorChecking_dec, _Application, _skipErrorChecking);
__decorateElement(_init19, 4, "entryPointStrategy", _entryPointStrategy_dec2, _Application, _entryPointStrategy2);
__decorateElement(_init19, 4, "entryPoints", _entryPoints_dec2, _Application, _entryPoints2);
__decoratorMetadata(_init19, _Application);
/**
 * The version number of TypeDoc.
 */
__publicField(_Application, "VERSION", TYPEDOC_VERSION);
/**
 * Emitted after plugins have been loaded and options have been read, but before they have been frozen.
 * The listener will be given an instance of {@link Application}.
 * @event
 */
__publicField(_Application, "EVENT_BOOTSTRAP_END", ApplicationEvents.BOOTSTRAP_END);
/**
 * Emitted after a project has been deserialized from JSON.
 * The listener will be given an instance of {@link ProjectReflection}.
 * @event
 */
__publicField(_Application, "EVENT_PROJECT_REVIVE", ApplicationEvents.REVIVE);
/**
 * Emitted when validation is being run.
 * The listener will be given an instance of {@link ProjectReflection}.
 * @event
 */
__publicField(_Application, "EVENT_VALIDATE_PROJECT", ApplicationEvents.VALIDATE_PROJECT);
/**
 * Emitted just before outputs are generated. This can be used by plugins which generate
 * additional auxiliary output files to avoid generating output if the user has validation
 * warnings and treat warnings as errors is enabled.
 * @event
 */
__publicField(_Application, "EVENT_GENERATE_OUTPUTS_BEGIN", ApplicationEvents.GENERATE_OUTPUTS_BEGIN);
/**
 * Emitted just after outputs are generated. This can be used by plugins which generate
 * additional auxiliary output files to avoid generating output if the user has validation
 * warnings and treat warnings as errors is enabled.
 * @event
 */
__publicField(_Application, "EVENT_GENERATE_OUTPUTS_END", ApplicationEvents.GENERATE_OUTPUTS_END);
var Application = _Application;

// src/lib/index.ts
export * from "#models";
import * as Models from "#models";
import {
  Configuration,
  EntryPointStrategy as EntryPointStrategy2,
  normalizePath as normalizePath9,
  ValidatingFileRegistry as ValidatingFileRegistry2
} from "#node-utils";
import {
  ArgumentsReader,
  CommentStyle as CommentStyle2,
  Option as Option17,
  OptionDefaults,
  Options as Options2,
  PackageJsonReader as PackageJsonReader2,
  ParameterHint,
  ParameterType as ParameterType2,
  TSConfigReader as TSConfigReader2,
  TypeDocReader as TypeDocReader2
} from "#node-utils";
import {
  ConsoleLogger,
  EventDispatcher,
  EventHooks as EventHooks2,
  i18n as i18n41,
  JSX as JSX35,
  Logger as Logger3,
  LogLevel as LogLevel2,
  MinimalSourceFile as MinimalSourceFile4,
  translateTagName as translateTagName3
} from "#utils";
import {
  Deserializer as Deserializer2,
  JSONOutput,
  SerializeEvent,
  Serializer as Serializer2
} from "#serialization";

// src/lib/internationalization/index.ts
var internationalization_exports = {};
__export(internationalization_exports, {
  Internationalization: () => Internationalization,
  i18n: () => i18n40
});
import { i18n as i18n40 } from "#utils";

// src/lib/index.ts
import TypeScript from "typescript";
export {
  Application,
  ArgumentsReader,
  BaseRouter,
  CategoryRouter,
  CommentStyle2 as CommentStyle,
  Configuration,
  ConsoleLogger,
  Context,
  Converter,
  DefaultTheme,
  DefaultThemeRenderContext,
  Deserializer2 as Deserializer,
  EntryPointStrategy2 as EntryPointStrategy,
  EventDispatcher,
  EventHooks2 as EventHooks,
  GroupRouter,
  IndexEvent,
  internationalization_exports as Internationalization,
  JSONOutput,
  JSX35 as JSX,
  KindDirRouter,
  KindRouter,
  LogLevel2 as LogLevel,
  Logger3 as Logger,
  MarkdownEvent,
  MinimalSourceFile4 as MinimalSourceFile,
  Models,
  Option17 as Option,
  OptionDefaults,
  Options2 as Options,
  Outputs,
  PackageJsonReader2 as PackageJsonReader,
  PageEvent,
  PageKind,
  ParameterHint,
  ParameterType2 as ParameterType,
  Renderer,
  RendererEvent,
  RepositoryManager,
  SerializeEvent,
  Serializer2 as Serializer,
  Slugger,
  StructureDirRouter,
  StructureRouter,
  TSConfigReader2 as TSConfigReader,
  Theme,
  TypeDocReader2 as TypeDocReader,
  TypeScript,
  ValidatingFileRegistry2 as ValidatingFileRegistry,
  i18n41 as i18n,
  normalizePath9 as normalizePath,
  translateTagName3 as translateTagName
};
