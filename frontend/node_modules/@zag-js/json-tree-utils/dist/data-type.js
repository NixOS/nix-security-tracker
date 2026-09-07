"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data-type.ts
var data_type_exports = {};
__export(data_type_exports, {
  ArrayBufferType: () => ArrayBufferType,
  ArrayType: () => ArrayType,
  BigIntType: () => BigIntType,
  BlobType: () => BlobType,
  BufferType: () => BufferType,
  ClassType: () => ClassType,
  DataViewType: () => DataViewType,
  DateType: () => DateType,
  DocumentType: () => DocumentType,
  ElementType: () => ElementType,
  ErrorType: () => ErrorType,
  FileType: () => FileType,
  FormDataType: () => FormDataType,
  FunctionType: () => FunctionType,
  HeadersType: () => HeadersType,
  IterableType: () => IterableType,
  MapType: () => MapType,
  NullType: () => NullType,
  ObjectType: () => ObjectType,
  PrimitiveType: () => PrimitiveType,
  ReactElementType: () => ReactElementType,
  RegexType: () => RegexType,
  SetType: () => SetType,
  SharedArrayBufferType: () => SharedArrayBufferType,
  StringType: () => StringType,
  SymbolType: () => SymbolType,
  TypedArrayType: () => TypedArrayType,
  URLSearchParamsType: () => URLSearchParamsType,
  UndefinedType: () => UndefinedType,
  UrlType: () => UrlType,
  WeakMapType: () => WeakMapType,
  WeakSetType: () => WeakSetType,
  WindowType: () => WindowType,
  dataTypes: () => dataTypes,
  getNodeTypeDescription: () => getNodeTypeDescription,
  jsonNodeToElement: () => jsonNodeToElement
});
module.exports = __toCommonJS(data_type_exports);
var import_node_conversion = require("./node-conversion.js");
var import_shared = require("./shared.js");
var generatePreviewText = (items, hasMore) => {
  return ` ${items.join(", ")}${hasMore ? ", \u2026 " : " "}`;
};
var ENTRIES_KEY = "[[Entries]]";
var txt = (value) => ({
  type: "text",
  value
});
var jsx = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children
});
var formatValueMini = (child) => {
  if (child.type === "string") return `"${child.value}"`;
  if (child.type === "null") return "null";
  if (child.type === "undefined" || child.type === "symbol") return "undefined";
  if (child.type === "object") return "{\u2026}";
  if (child.type === "array") return "[\u2026]";
  if (child.type === "set") return "Set(\u2026)";
  if (child.type === "map") return "Map(\u2026)";
  if (child.type === "iterable") return "Iterable(\u2026)";
  if (child.type === "function") return "\u0192(\u2026)";
  return String(child.value);
};
var formatValue = (value) => {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Set) return `Set(${value.size})`;
  if (value instanceof Map) return `Map(${value.size})`;
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === "object") return "Object";
  return String(value);
};
function dataType(opts) {
  return opts;
}
var NullType = dataType({
  type: "null",
  description: "null",
  check(value) {
    return value === null;
  },
  previewElement() {
    return jsx("span", {}, [txt("null")]);
  },
  node({ value, keyPath }) {
    return {
      value,
      type: "null",
      keyPath
    };
  }
});
var UndefinedType = dataType({
  type: "undefined",
  description: "undefined",
  check(value) {
    return value === void 0;
  },
  previewElement() {
    return jsx("span", {}, [txt("undefined")]);
  },
  node({ value, keyPath }) {
    return {
      type: "undefined",
      value,
      keyPath
    };
  }
});
var SymbolType = dataType({
  type: "symbol",
  description(node) {
    return String(node.value);
  },
  check(value) {
    return typeof value === "symbol";
  },
  previewElement(node) {
    return jsx("span", {}, [txt(node.value.toString())]);
  },
  node({ value, keyPath }) {
    return {
      type: "symbol",
      value,
      keyPath
    };
  }
});
var BigIntType = dataType({
  type: "bigint",
  description(node) {
    return `${node.value}n`;
  },
  check(value) {
    return typeof value === "bigint";
  },
  previewElement(node) {
    return jsx("span", {}, [txt(`${node.value}n`)]);
  },
  node({ value, keyPath }) {
    return {
      type: "bigint",
      value,
      keyPath
    };
  }
});
var SetType = dataType({
  type: "set",
  description(node) {
    return `Set(${node.value.size})`;
  },
  check(value) {
    return value instanceof Set;
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems;
    const entries = Array.from(node.value);
    const values = entries.slice(0, maxItems).map(formatValue);
    const hasMore = entries.length > maxItems;
    return generatePreviewText(values, hasMore);
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) ?? "";
    const size = node.value.size;
    const children = [
      jsx("span", { kind: "constructor" }, [txt(`Set(${size})`)]),
      jsx("span", { kind: "brace" }, [txt(" {")])
    ];
    if (preview) {
      children.push(jsx("span", { kind: "preview-text" }, [txt(preview)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("}")]));
    return jsx("span", {}, children);
  },
  node({ value, keyPath, createNode }) {
    const entriesChildren = Array.from(value).map((item, index) => createNode([ENTRIES_KEY, index.toString()], item));
    const entriesNode = {
      value: Array.from(value),
      keyPath: [...keyPath, ENTRIES_KEY],
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true
    };
    const sizeNode = createNode(["size"], value.size);
    return {
      type: "set",
      value,
      keyPath,
      children: [entriesNode, sizeNode]
    };
  }
});
var WeakSetType = dataType({
  type: "weakset",
  description: "WeakSet",
  check(value) {
    return value instanceof WeakSet;
  },
  previewElement() {
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("WeakSet")]),
      jsx("span", { kind: "brace" }, [txt(" {")]),
      jsx("span", { kind: "preview" }, [txt(" [[Entries]]: not enumerable ")]),
      jsx("span", { kind: "brace" }, [txt("}")])
    ]);
  },
  node({ value, keyPath }) {
    return {
      type: "weakset",
      value,
      keyPath
    };
  }
});
var WeakMapType = dataType({
  type: "weakmap",
  description: "WeakMap",
  check(value) {
    return value instanceof WeakMap;
  },
  previewElement() {
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("WeakMap")]),
      jsx("span", { kind: "brace" }, [txt(" {")]),
      jsx("span", { kind: "preview" }, [txt(" [[Entries]]: not enumerable ")]),
      jsx("span", { kind: "brace" }, [txt("}")])
    ]);
  },
  node({ value, keyPath }) {
    return {
      type: "weakmap",
      value,
      keyPath
    };
  }
});
var REGEX_KEYS = [
  "lastIndex",
  "dotAll",
  "flags",
  "global",
  "hasIndices",
  "ignoreCase",
  "multiline",
  "source",
  "sticky",
  "unicode"
];
var RegexType = dataType({
  type: "regex",
  description(node) {
    return String(node.value);
  },
  check(value) {
    return value instanceof RegExp;
  },
  previewElement(node) {
    return jsx("span", {}, [txt(String(node.value))]);
  },
  node({ value, keyPath, createNode }) {
    const children = REGEX_KEYS.map((key) => createNode([key], (0, import_shared.getProp)(value, key)));
    return {
      value,
      type: "regex",
      keyPath,
      children
    };
  }
});
var DATA_VIEW_KEYS = ["byteLength", "byteOffset", "buffer"];
var DataViewType = dataType({
  type: "dataview",
  description(node) {
    return `DataView(${node.value.byteLength})`;
  },
  check(value) {
    return value instanceof DataView;
  },
  previewElement(node) {
    const dataView = node.value;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(`DataView(${dataView.byteLength})`)]),
      jsx("span", { kind: "brace" }, [txt(" { ")]),
      jsx("span", { kind: "preview" }, [
        txt(` buffer: ArrayBuffer(${dataView.buffer.byteLength}), byteOffset: ${dataView.byteOffset} `)
      ]),
      jsx("span", { kind: "brace" }, [txt(" }")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const children = DATA_VIEW_KEYS.map((key) => createNode([key], (0, import_shared.getProp)(value, key)));
    return {
      value,
      keyPath,
      type: "dataview",
      children
    };
  }
});
var URL_KEYS = [
  "href",
  "origin",
  "protocol",
  "username",
  "password",
  "host",
  "hostname",
  "port",
  "pathname",
  "search",
  "searchParams",
  "hash"
];
var UrlType = dataType({
  type: "url",
  description: "URL",
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object URL]";
  },
  previewElement(node, opts) {
    const url = node.value;
    const maxItems = opts.maxPreviewItems;
    const previewKeys = URL_KEYS.slice(0, maxItems);
    const preview = previewKeys.map((key) => `${key}: '${url[key]}'`).join(", ");
    const hasMore = URL_KEYS.length > maxItems;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("URL")]),
      jsx("span", { kind: "brace" }, [txt(" { ")]),
      jsx("span", { kind: "preview-text" }, [txt(` ${preview}${hasMore ? ", \u2026" : ""} `)]),
      jsx("span", { kind: "brace" }, [txt(" }")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const children = URL_KEYS.map((key) => createNode([key], Reflect.get(value, key)));
    return {
      value,
      keyPath,
      type: "url",
      children
    };
  }
});
var URLSearchParamsType = dataType({
  type: "urlsearchparams",
  description: "URLSearchParams",
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object URLSearchParams]";
  },
  previewElement(node) {
    const params = node.value;
    const paramsArray = Array.from(params.entries());
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("URLSearchParams")]),
      jsx("span", { kind: "brace" }, [txt(" { ")]),
      jsx("span", { kind: "preview" }, [txt(`size: ${paramsArray.length}`)]),
      jsx("span", { kind: "brace" }, [txt(" }")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value2], index) => {
      const keyStr = String(key);
      const keyNode = createNode([ENTRIES_KEY, keyStr, "key"], key);
      const valueNode = createNode([ENTRIES_KEY, keyStr, "value"], value2);
      return {
        keyPath: [...keyPath, ENTRIES_KEY, index],
        value: { [key]: value2 },
        type: "object",
        children: [keyNode, valueNode]
      };
    });
    const entriesNode = {
      keyPath: [...keyPath, "[[Entries]]"],
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true
    };
    const sizeNode = createNode(["size"], Array.from(value.entries()).length);
    return {
      value,
      keyPath,
      type: "urlsearchparams",
      children: [entriesNode, sizeNode]
    };
  }
});
var BLOB_KEYS = ["size", "type"];
var BlobType = dataType({
  type: "blob",
  description(node) {
    return `Blob(${node.value.size})`;
  },
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object Blob]";
  },
  previewElement(node) {
    const blob = node.value;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("Blob")]),
      jsx("span", { kind: "brace" }, [txt(" { ")]),
      jsx("span", { kind: "preview" }, [txt(`size: ${blob.size}, type: '${blob.type || "application/octet-stream"}'`)]),
      jsx("span", { kind: "brace" }, [txt(" }")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const blobProperties = BLOB_KEYS.map((key) => ({ key, value: Reflect.get(value, key) }));
    const children = blobProperties.map(({ key, value: value2 }) => createNode([key], value2));
    return {
      value,
      keyPath,
      type: "blob",
      children
    };
  }
});
var FILE_KEYS = ["name", "size", "type", "lastModified", "webkitRelativePath"];
var FileType = dataType({
  type: "file",
  description(node) {
    return `File(${node.value.size})`;
  },
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object File]";
  },
  previewElement(node) {
    const file = node.value;
    const maxItems = 2;
    const hasMore = FILE_KEYS.length > maxItems;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("File")]),
      jsx("span", { kind: "brace" }, [txt(" { ")]),
      jsx("span", { kind: "preview" }, [
        txt(`name: '${file.name}', lastModified: ${file.lastModified}${hasMore ? ", \u2026" : ""}`)
      ]),
      jsx("span", { kind: "brace" }, [txt(" }")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const fileProperties = FILE_KEYS.map((key) => ({ key, value: (0, import_shared.getProp)(value, key) || "" }));
    const children = fileProperties.map(({ key, value: value2 }) => createNode([key], value2));
    return {
      value,
      keyPath,
      type: "file",
      children
    };
  }
});
var getFunctionString = (func) => {
  try {
    return func.toString();
  } catch {
    switch (func.constructor.name) {
      case "AsyncFunction":
        return "async function () {}";
      case "AsyncGeneratorFunction":
        return "async function * () {}";
      case "GeneratorFunction":
        return "function * () {}";
      default:
        return "function () {}";
    }
  }
};
var FUNCTION_SIGNATURE_REGEX = /(?:async\s+)?(?:function\s*\*?\s*)?([^(]*\([^)]*\))/;
var getFunctionSignature = (func) => {
  const funcString = getFunctionString(func);
  const signatureMatch = funcString.match(FUNCTION_SIGNATURE_REGEX);
  return signatureMatch ? signatureMatch[1] : `${func.name || "anonymous"}()`;
};
var FUNC_KEYS = ["name", "length", "prototype", "caller", "arguments"];
var FunctionType = dataType({
  type: "function",
  description(node) {
    const func = node.value;
    const name = func.name || "anonymous";
    const constructorName = func.constructor.name;
    switch (constructorName) {
      case "AsyncFunction":
        return `async \u0192 ${name}()`;
      case "AsyncGeneratorFunction":
        return `async \u0192* ${name}()`;
      case "GeneratorFunction":
        return `\u0192* ${name}()`;
      default:
        return `\u0192 ${name}()`;
    }
  },
  check(value) {
    return typeof value === "function";
  },
  previewElement(node) {
    const func = node.value;
    const signature = getFunctionSignature(func);
    const constructorName = func.constructor.name;
    const preview = signature.length > 50 ? `${signature.substring(0, 47)}...` : signature;
    let functionTypePrefix = "";
    if (constructorName === "AsyncFunction") functionTypePrefix += "async ";
    if (constructorName === "AsyncGeneratorFunction") functionTypePrefix += "async ";
    if (constructorName === "GeneratorFunction" || constructorName === "AsyncGeneratorFunction")
      functionTypePrefix += "\u0192* ";
    if (!constructorName.includes("Generator")) functionTypePrefix += "\u0192 ";
    return jsx("span", {}, [
      jsx("span", { kind: "function-type" }, [txt(functionTypePrefix)]),
      jsx("span", { kind: "function-body" }, [txt(preview)])
    ]);
  },
  node({ value, keyPath, createNode, options }) {
    const funcName = value.name || "anonymous";
    const constructorName = value.constructor.name;
    const enumerableProperties = [];
    const nonEnumerableProperties = [];
    const funcString = getFunctionString(value);
    nonEnumerableProperties.push({ key: "[[Function]]", value: funcString });
    enumerableProperties.push({ key: "name", value: funcName });
    enumerableProperties.push({ key: "length", value: value.length });
    enumerableProperties.push({ key: "constructor", value: constructorName });
    const additionalProps = Object.getOwnPropertyNames(value).filter((key) => !FUNC_KEYS.includes(key)).map((key) => ({ key, value: Reflect.get(value, key) }));
    enumerableProperties.push(...additionalProps);
    const enumerableChildren = enumerableProperties.map(({ key, value: value2 }) => createNode([key], value2));
    const nonEnumerableChildren = options?.showNonenumerable ? nonEnumerableProperties.map(({ key, value: value2 }) => {
      const node = createNode([key], value2);
      node.isNonEnumerable = true;
      return node;
    }) : [];
    const children = [...enumerableChildren, ...nonEnumerableChildren];
    return {
      value,
      type: "function",
      keyPath,
      children
    };
  }
});
var ArrayBufferType = dataType({
  type: "arraybuffer",
  description(node) {
    return `ArrayBuffer(${node.value.byteLength})`;
  },
  check(value) {
    return value instanceof ArrayBuffer;
  },
  previewElement(node) {
    return jsx("span", { nodeType: "arraybuffer" }, [txt(node.value.toString())]);
  },
  node({ value, keyPath }) {
    return {
      value,
      keyPath,
      type: "arraybuffer"
    };
  }
});
var SharedArrayBufferType = dataType({
  type: "sharedarraybuffer",
  description(node) {
    return `SharedArrayBuffer(${node.value.byteLength})`;
  },
  check(value) {
    return typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer;
  },
  previewElement() {
    return jsx("span", { nodeType: "sharedarraybuffer" }, [txt("sharedarraybuffer")]);
  },
  node({ value, keyPath }) {
    return {
      value,
      keyPath,
      type: "sharedarraybuffer"
    };
  }
});
var BufferType = dataType({
  type: "buffer",
  description(node) {
    return `Buffer(${node.value.length})`;
  },
  check(value) {
    return typeof Buffer !== "undefined" && value instanceof Buffer;
  },
  previewElement(node) {
    const buffer = node.value;
    const preview = Array.from(new Uint8Array(buffer).slice(0, 8)).map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
    const hasMore = buffer.length > 8;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(`Buffer(${buffer.length})`)]),
      jsx("span", { kind: "brace" }, [txt(" ['")]),
      jsx("span", { kind: "preview-text" }, [txt(preview + (hasMore ? " \u2026" : ""))]),
      jsx("span", { kind: "brace" }, [txt("']")])
    ]);
  },
  node({ value, keyPath }) {
    return {
      value,
      keyPath,
      type: "buffer"
    };
  }
});
var DateType = dataType({
  type: "date",
  description(node) {
    return String(node.value);
  },
  check(value) {
    return value instanceof Date;
  },
  previewElement(node) {
    return jsx("span", {}, [txt(node.value.toISOString())]);
  },
  node({ value, keyPath }) {
    return {
      value,
      keyPath,
      type: "date"
    };
  }
});
var MapType = dataType({
  type: "map",
  description(node) {
    return `Map(${node.value.size})`;
  },
  check(value) {
    return value instanceof Map;
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems;
    const entries = Array.from(node.value.entries());
    const previews = entries.slice(0, maxItems).map(([key, value]) => {
      const valueDesc = formatValue(value);
      const keyStr = typeof key === "string" ? `"${key}"` : String(key);
      return `${keyStr} => ${valueDesc}`;
    });
    const hasMore = entries.length > maxItems;
    return generatePreviewText(previews, hasMore);
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) || "";
    const size = node.value.size;
    const children = [
      jsx("span", { kind: "constructor" }, [txt(`Map(${size})`)]),
      jsx("span", { kind: "brace" }, [txt(" {")])
    ];
    if (preview) {
      children.push(jsx("span", { kind: "preview-text" }, [txt(preview)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("}")]));
    return jsx("span", {}, children);
  },
  node({ value, keyPath, createNode }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value2], index) => {
      const keyStr = String(key);
      const keyNode = createNode([ENTRIES_KEY, keyStr, "key"], key);
      const valueNode = createNode([ENTRIES_KEY, keyStr, "value"], value2);
      return {
        keyPath: [...keyPath, ENTRIES_KEY, index],
        value: { [keyStr]: value2 },
        type: "object",
        children: [keyNode, valueNode]
      };
    });
    const entriesNode = {
      keyPath: [...keyPath, ENTRIES_KEY],
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true
    };
    const sizeNode = createNode(["size"], value.size);
    return {
      value,
      keyPath,
      type: "map",
      children: [entriesNode, sizeNode]
    };
  }
});
var ERROR_KEYS = ["name", "message", "stack"];
var ErrorType = dataType({
  type: "error",
  description(node) {
    const err = node.value;
    return `${err.name}: ${err.message}`;
  },
  check(value) {
    return value instanceof Error;
  },
  previewElement(node) {
    const err = node.value;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(err.name)]),
      jsx("span", { kind: "colon" }, [txt(": ")]),
      jsx("span", {}, [txt(err.message)])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const errorProperties = ERROR_KEYS.map((key) => ({ key, value: Reflect.get(value, key) }));
    const additionalProps = Object.getOwnPropertyNames(value).filter((key) => !ERROR_KEYS.includes(key)).map((key) => ({ key, value: (0, import_shared.getProp)(value, key) }));
    const allProperties = [...errorProperties, ...additionalProps];
    const children = allProperties.map(({ key, value: value2 }) => createNode([key], value2));
    return {
      value,
      keyPath,
      type: "error",
      children
    };
  }
});
function errorStackToElement(stack) {
  const stackLines = stack?.split("\n").filter((line) => line.trim()) || [];
  return jsx(
    "span",
    {},
    stackLines.map((line, index) => {
      const appendNewLine = index < stackLines.length - 1;
      return jsx(
        "span",
        {
          nodeType: "string",
          kind: "error-stack"
        },
        [
          jsx("span", {}, [txt(line + (appendNewLine ? "\\n" : ""))]),
          jsx("span", { kind: "operator" }, [txt(appendNewLine ? " +" : "")])
        ]
      );
    })
  );
}
var HeadersType = dataType({
  type: "headers",
  description: "Headers",
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object Headers]";
  },
  previewElement(node) {
    const headers = node.value;
    const entriesArray = Array.from(headers.entries());
    const preview = entriesArray.slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(", ");
    const hasMore = entriesArray.length > 2;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(`Headers(${entriesArray.length})`)]),
      jsx("span", { kind: "brace" }, [txt(" {")]),
      jsx("span", { kind: "preview-text" }, [txt(` ${preview}${hasMore ? ", \u2026" : ""} `)]),
      jsx("span", { kind: "brace" }, [txt("}")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value2], index) => {
      const keyStr = String(key);
      const keyNode = createNode([ENTRIES_KEY, keyStr, "key"], key);
      const valueNode = createNode([ENTRIES_KEY, keyStr, "value"], value2);
      return {
        keyPath: [...keyPath, ENTRIES_KEY, index],
        value: { [key]: value2 },
        type: "object",
        children: [keyNode, valueNode]
      };
    });
    const entriesNode = {
      keyPath: [...keyPath, ENTRIES_KEY],
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true
    };
    return {
      value,
      keyPath,
      type: "headers",
      children: [entriesNode]
    };
  }
});
var FormDataType = dataType({
  type: "formdata",
  description: "FormData",
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object FormData]";
  },
  previewElement(node) {
    const formData = node.value;
    const entriesArray = Array.from(formData.entries());
    const preview = entriesArray.slice(0, 2).map(([key, value]) => {
      const valueStr = FileType.check(value) ? `File(${value.size})` : String(value);
      return `${key}: ${valueStr}`;
    }).join(", ");
    const hasMore = entriesArray.length > 2;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(`FormData(${entriesArray.length})`)]),
      jsx("span", { kind: "brace" }, [txt(" {")]),
      jsx("span", { kind: "preview-text" }, [txt(` ${preview}${hasMore ? ", \u2026" : ""} `)]),
      jsx("span", { kind: "brace" }, [txt("}")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const entriesChildren = Array.from(value.entries()).map(([key, value2], index) => {
      const keyNode = createNode([ENTRIES_KEY, index, "key"], key);
      const valueNode = createNode([ENTRIES_KEY, index, "value"], value2);
      return {
        keyPath: [...keyPath, ENTRIES_KEY, index],
        value: { [key]: value2 },
        type: "object",
        children: [keyNode, valueNode]
      };
    });
    const entriesNode = {
      keyPath: [...keyPath, ENTRIES_KEY],
      value: Array.from(value.entries()),
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true
    };
    return {
      value,
      keyPath,
      type: "formdata",
      children: [entriesNode]
    };
  }
});
var ArrayType = dataType({
  type: "array",
  description(node) {
    return `Array(${node.value.length})`;
  },
  check(value) {
    return Array.isArray(value);
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems;
    const children = node.children || [];
    const enumerableChildren = children.filter(
      (child) => !child.isNonEnumerable && (0, import_node_conversion.keyPathToKey)(child.keyPath) !== "length"
    );
    const values = enumerableChildren.slice(0, maxItems).map(formatValueMini);
    const hasMore = enumerableChildren.length > maxItems;
    return generatePreviewText(values, hasMore);
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) || "";
    const count = node.value.length;
    const children = [];
    if (count > 0) {
      children.push(jsx("span", { kind: "constructor" }, [txt(`(${count}) `)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("[")]));
    if (preview) {
      children.push(jsx("span", { kind: "preview-text" }, [txt(preview)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("]")]));
    return jsx("span", {}, children);
  },
  node({ value, keyPath, createNode, options }) {
    const arrayChildren = [];
    const definedIndices = Object.keys(value).filter((key) => !Number.isNaN(Number(key))).map(Number).sort((a, b) => a - b);
    const chunkSize = options?.groupArraysAfterLength;
    const shouldGroup = chunkSize && definedIndices.length > chunkSize;
    if (shouldGroup) {
      const chunks = [];
      for (let i = 0; i < definedIndices.length; i += chunkSize) {
        chunks.push(definedIndices.slice(i, i + chunkSize));
      }
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const startIndex = chunk[0];
        const endIndex = chunk[chunk.length - 1];
        const groupKey = `[${startIndex}\u2026${endIndex}]`;
        const groupChildren = chunk.map((index) => createNode([index.toString()], value[index]));
        const groupNode = {
          keyPath: [...keyPath, groupKey],
          value: chunk.map((index) => value[index]),
          type: "array",
          children: groupChildren,
          isNonEnumerable: false
        };
        arrayChildren.push(groupNode);
      }
    } else {
      for (const index of definedIndices) {
        arrayChildren.push(createNode([index.toString()], value[index]));
      }
    }
    const lengthChild = createNode(["length"], value.length);
    const propertyNames = Object.getOwnPropertyNames(value);
    const enumerableKeys = Object.keys(value).filter((key) => !Number.isNaN(Number(key)));
    const nonEnumerableKeys = propertyNames.filter(
      (key) => !enumerableKeys.includes(key) && key !== "length" && // length is already handled above
      Number.isNaN(Number(key))
      // exclude numeric indices
    );
    const nonEnumerableChildren = options?.showNonenumerable ? nonEnumerableKeys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      const node = createNode([key], Reflect.get(value, key));
      node.isNonEnumerable = true;
      node.propertyDescriptor = descriptor;
      return node;
    }) : [];
    const children = [...arrayChildren, lengthChild, ...nonEnumerableChildren];
    return {
      value,
      type: "array",
      children,
      keyPath
    };
  }
});
var typedArrayConstructors = {
  Int8Array: "int8array",
  Uint8Array: "uint8array",
  Uint8ClampedArray: "uint8clampedarray",
  Int16Array: "int16array",
  Uint16Array: "uint16array",
  Int32Array: "int32array",
  Uint32Array: "uint32array",
  Float32Array: "float32array",
  Float64Array: "float64array",
  BigInt64Array: "bigint64array",
  BigUint64Array: "biguint64array"
};
var revertTypedArrayConstructors = Object.fromEntries(
  Object.entries(typedArrayConstructors).map(([key, value]) => [value, key])
);
var TYPED_ARRAY_KEYS = ["length", "byteLength", "byteOffset", "buffer"];
var TypedArrayType = dataType({
  type: (value) => Reflect.get(typedArrayConstructors, value.constructor.name),
  description(node) {
    const typedArray = node.value;
    const constructorName = typedArray.constructor.name;
    return `${revertTypedArrayConstructors[constructorName]}(${typedArray.length})`;
  },
  check(value) {
    return (0, import_shared.isObj)(value) && value.constructor.name in typedArrayConstructors;
  },
  previewElement(node) {
    const typedArray = node.value;
    const constructorName = typedArray.constructor.name;
    const preview = Array.from(typedArray).slice(0, 5).join(", ");
    const hasMore = typedArray.length > 5;
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(`${constructorName}(${typedArray.length})`)]),
      jsx("span", { kind: "brace" }, [txt(" [ ")]),
      jsx("span", { kind: "preview-text" }, [txt(preview + (hasMore ? ", \u2026" : ""))]),
      jsx("span", { kind: "brace" }, [txt(" ]")])
    ]);
  },
  node({ value, keyPath, createNode, options }) {
    const typedArray = value;
    const enumerableProperties = TYPED_ARRAY_KEYS.map((key) => ({ key, value: Reflect.get(typedArray, key) }));
    const enumerableChildren = enumerableProperties.map(({ key, value: value2 }) => createNode([key], value2));
    const nonEnumerableChildren = options?.showNonenumerable ? (() => {
      const values = Array.from(typedArray).slice(0, 100);
      const node = createNode(["[[Values]]"], values);
      node.isNonEnumerable = true;
      return [node];
    })() : [];
    const children = [...enumerableChildren, ...nonEnumerableChildren];
    return {
      value,
      keyPath,
      type: Reflect.get(typedArrayConstructors, value.constructor.name),
      children
    };
  }
});
var IterableType = dataType({
  type: "iterable",
  description: "Iterable",
  check(value) {
    return Boolean(
      value && typeof value === "object" && typeof value[Symbol.iterator] === "function" && !(value instanceof Set) && !(value instanceof Map) && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof RegExp) && !(value instanceof ArrayBuffer)
    );
  },
  previewElement(node, opts) {
    const preview = SetType.previewText?.(node, opts) ?? "";
    const entriesArray = Array.from(node.value);
    const size = node.value.size ?? node.value.length ?? entriesArray.length;
    const children = [
      jsx("span", { kind: "constructor" }, [txt(`Iterable(${size})`)]),
      jsx("span", { kind: "brace" }, [txt(" {")])
    ];
    if (preview) {
      children.push(jsx("span", { kind: "preview-text" }, [txt(preview)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("}")]));
    return jsx("span", {}, children);
  },
  node({ value, keyPath, createNode }) {
    const entriesArray = Array.from(value);
    const entriesChildren = entriesArray.map((item, index) => createNode([ENTRIES_KEY, index], item));
    const entriesNode = {
      keyPath: [...keyPath, ENTRIES_KEY],
      value: entriesArray,
      type: "array",
      children: entriesChildren,
      isNonEnumerable: true
    };
    const sizeValue = value.size ?? value.length ?? entriesArray.length;
    const sizeNode = createNode(["size"], sizeValue);
    return {
      value,
      type: "iterable",
      children: [entriesNode, sizeNode],
      keyPath
    };
  }
});
var ClassType = dataType({
  type: "object",
  description(node) {
    return node.constructorName || "Object";
  },
  check(value) {
    return typeof value === "object" && value !== null && value.constructor !== Object;
  },
  previewText(node, opts) {
    return ObjectType.previewText?.(node, opts) || "";
  },
  previewElement(node, opts) {
    return ObjectType.previewElement(node, opts);
  },
  node({ value, keyPath, createNode, options }) {
    const constructorName = value.constructor.name;
    const allPropertyNames = Object.getOwnPropertyNames(value);
    const enumerableKeys = Object.keys(value);
    const nonEnumerableKeys = allPropertyNames.filter((key) => !enumerableKeys.includes(key));
    const enumerableChildren = enumerableKeys.map((key) => createNode([key], Reflect.get(value, key)));
    const nonEnumerableChildren = options?.showNonenumerable ? nonEnumerableKeys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      const node = createNode([`[[${key}]]`], (0, import_shared.getProp)(value, key));
      node.isNonEnumerable = true;
      node.propertyDescriptor = descriptor;
      return node;
    }) : [];
    const children = [...enumerableChildren, ...nonEnumerableChildren];
    return {
      value,
      keyPath,
      type: "object",
      constructorName,
      children
    };
  }
});
var ObjectType = dataType({
  type: "object",
  description: "Object",
  check(value) {
    return typeof value === "object" && value !== null;
  },
  previewText(node, opts) {
    const maxItems = opts.maxPreviewItems;
    const children = node.children || [];
    const previews = children.slice(0, maxItems).map((child) => {
      const valueDesc = getNodeTypeDescription(child);
      return `${(0, import_node_conversion.keyPathToKey)(child.keyPath)}: ${valueDesc}`;
    });
    const hasMore = children.length > maxItems;
    return generatePreviewText(previews, hasMore);
  },
  previewElement(node, opts) {
    const preview = this.previewText?.(node, opts) ?? "";
    const children = [];
    if (node.constructorName) {
      children.push(jsx("span", { kind: "constructor" }, [txt(`${node.constructorName} `)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("{")]));
    if (preview) {
      children.push(jsx("span", { kind: "preview-text" }, [txt(preview)]));
    }
    children.push(jsx("span", { kind: "brace" }, [txt("}")]));
    return jsx("span", {}, children);
  },
  node({ value, keyPath, createNode, options }) {
    const allPropertyNames = Object.getOwnPropertyNames(value);
    const enumerableKeys = Object.keys(value);
    const nonEnumerableKeys = allPropertyNames.filter((key) => !enumerableKeys.includes(key));
    const enumerableChildren = enumerableKeys.map((key) => createNode([key], (0, import_shared.getProp)(value, key)));
    const nonEnumerableChildren = options?.showNonenumerable ? nonEnumerableKeys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      const node = createNode([`[[${key}]]`], (0, import_shared.getProp)(value, key));
      node.isNonEnumerable = true;
      node.propertyDescriptor = descriptor;
      return node;
    }) : [];
    const children = [...enumerableChildren, ...nonEnumerableChildren];
    return {
      value,
      type: "object",
      children,
      keyPath
    };
  }
});
var ELEMENT_KEYS = [
  "attributes",
  "childElementCount",
  "className",
  "dataset",
  "hidden",
  "id",
  "inert",
  "isConnected",
  "isContentEditable",
  "nodeType",
  "style",
  "tabIndex",
  "tagName"
];
var isSvg = (el) => typeof el === "object" && el.tagName === "svg" && el.namespaceURI === "http://www.w3.org/2000/svg";
var isHTML = (el) => typeof el === "object" && el.namespaceURI === "http://www.w3.org/1999/xhtml";
var ElementType = dataType({
  type: "element",
  description(node) {
    return (0, import_shared.typeOf)(node.value);
  },
  check(value) {
    return isSvg(value) || isHTML(value);
  },
  previewElement(node) {
    const el = node.value;
    const classList = Array.from(el.classList).slice(0, 3);
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt(el.constructor.name)]),
      jsx("span", {}, [txt(" ")]),
      jsx("span", { kind: "preview-text" }, [
        txt(`<${el.localName}${el.id ? `#${el.id}` : ""}${classList.length > 0 ? "." + classList.join(".") : ""}>`)
      ])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const children = ELEMENT_KEYS.reduce((acc, key) => {
      let childValue = Reflect.get(value, key);
      if (key === "attributes") {
        const attrs = Array.from(value.attributes);
        childValue = attrs.length ? Object.fromEntries(attrs.map((attr) => [attr.name, attr.value])) : void 0;
      }
      if (key === "style") {
        const style = Array.from(value.style);
        childValue = style.length ? Object.fromEntries(style.map((key2) => [key2, value.style.getPropertyValue(key2)])) : void 0;
      }
      acc.push(createNode([key], childValue));
      return acc;
    }, []);
    return {
      value,
      keyPath,
      type: "element",
      children
    };
  }
});
var DOCUMENT_KEYS = ["title", "URL", "documentElement", "head", "body", "contentType", "readyState"];
var DocumentType = dataType({
  type: "document",
  description: "Document",
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object HTMLDocument]";
  },
  previewElement(node) {
    const doc = node.value;
    const url = doc.URL || "unknown";
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("#document")]),
      jsx("span", { kind: "preview-text" }, [txt(` (${url})`)])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const children = DOCUMENT_KEYS.map((key) => createNode([key], Reflect.get(value, key)));
    return {
      value,
      keyPath,
      type: "document",
      children
    };
  }
});
var WINDOW_KEYS = ["location", "navigator", "document", "innerWidth", "innerHeight", "devicePixelRatio", "origin"];
var WindowType = dataType({
  type: "window",
  description: "Window",
  check(value) {
    return (0, import_shared.typeOf)(value) === "[object Window]";
  },
  previewElement() {
    return jsx("span", {}, [
      jsx("span", { kind: "constructor" }, [txt("Window")]),
      jsx("span", { kind: "preview-text" }, [txt(" { \u2026 }")])
    ]);
  },
  node({ value, keyPath, createNode }) {
    const children = WINDOW_KEYS.map((key) => {
      const childValue = Reflect.get(value, key);
      return createNode([key], childValue);
    });
    return {
      value,
      keyPath,
      type: "window",
      children
    };
  }
});
var REACT_ELEMENT_KEYS = ["$$typeof", "type", "key", "ref", "props"];
var getElementTypeName = (type) => {
  if (typeof type === "string") return type;
  if (typeof type === "function") return type.displayName || type.name || "Component";
  return type?.toString() || "Component";
};
var ReactElementType = dataType({
  type: "react-element",
  description(node) {
    const el = node.value;
    return getElementTypeName(el.type);
  },
  check(value) {
    return (0, import_shared.isObj)(value) && "$$typeof" in value && "props" in value;
  },
  previewElement(node, opts) {
    const el = node.value;
    const elName = getElementTypeName(el.type);
    const props = Object.entries(el.props);
    const hasMore = props.length > opts.maxPreviewItems;
    return jsx("span", {}, [
      txt(`<${elName} `),
      ...props.slice(0, opts.maxPreviewItems).reduce((acc, [key, value]) => {
        if (key === "children") return acc;
        acc.push(jsx("span", {}, [txt(` ${key}=${typeof value === "string" ? `"${value}"` : `{${value}}`}`)]));
        return acc;
      }, []),
      ...hasMore ? [txt(" \u2026")] : [],
      txt(el.children ? `> {\u2026} </${elName}>` : ` />`)
    ]);
  },
  node({ value, keyPath, createNode }) {
    const children = REACT_ELEMENT_KEYS.reduce((acc, key) => {
      let childValue = Reflect.get(value, key);
      if (key === "type") {
        childValue = getElementTypeName(childValue);
      }
      acc.push(createNode([key], childValue));
      return acc;
    }, []);
    return {
      value,
      type: "react-element",
      keyPath,
      children
    };
  }
});
var map = {
  "\n": "\\n",
  "	": "\\t",
  "\r": "\\r"
};
var STRING_ESCAPE_REGEXP = /[\n\t\r]/g;
var StringType = dataType({
  type: "string",
  description(node, opts) {
    return `"${this.previewText?.(node, opts) ?? node.value}"`;
  },
  check(value) {
    return typeof value === "string";
  },
  previewText(node, opts) {
    const serialised = node.value.replace(STRING_ESCAPE_REGEXP, (_) => map[_]);
    const preview = serialised.slice(0, opts.collapseStringsAfterLength) + (serialised.length > opts.collapseStringsAfterLength ? "\u2026" : "");
    return preview;
  },
  previewElement(node) {
    const serialised = node.value.replace(STRING_ESCAPE_REGEXP, (_) => map[_]);
    return jsx("span", {}, [txt(`"${serialised}"`)]);
  },
  node({ value, keyPath }) {
    return {
      value,
      type: "string",
      keyPath
    };
  }
});
var PrimitiveType = dataType({
  type(value) {
    return typeof value;
  },
  description(node) {
    return String(node.value);
  },
  check(value) {
    return value !== null && value !== void 0;
  },
  previewElement(node) {
    return jsx("span", {}, [txt(String(node.value))]);
  },
  node({ value, keyPath }) {
    return {
      value,
      type: typeof value,
      keyPath
    };
  }
});
var dataTypes = [
  NullType,
  UndefinedType,
  SymbolType,
  BigIntType,
  FunctionType,
  ArrayBufferType,
  SharedArrayBufferType,
  BufferType,
  DataViewType,
  ErrorType,
  DateType,
  RegexType,
  SetType,
  MapType,
  WeakMapType,
  WeakSetType,
  FileType,
  BlobType,
  ReactElementType,
  WindowType,
  DocumentType,
  ElementType,
  UrlType,
  URLSearchParamsType,
  HeadersType,
  FormDataType,
  ArrayType,
  TypedArrayType,
  IterableType,
  ClassType,
  ObjectType,
  StringType,
  PrimitiveType
];
var jsonNodeToElement = (node, opts) => {
  const options = (0, import_node_conversion.getPreviewOptions)(opts);
  const key = (0, import_node_conversion.keyPathToKey)(node.keyPath, { excludeRoot: true });
  if (key === "stack" && typeof node.value === "string") {
    return errorStackToElement(node.value);
  }
  const dataType2 = dataTypes.find((dataType3) => dataType3.check(node.value));
  if (!dataType2) {
    return jsx("span", {}, [txt(String(node.value))]);
  }
  const element = dataType2.previewElement(node, options);
  if (!key) {
    element.properties.root = true;
  }
  element.properties.kind = "preview";
  element.properties.nodeType = typeof dataType2.type === "function" ? dataType2.type(node.value) : dataType2.type;
  return element;
};
var getNodeTypeDescription = (node, opts) => {
  const options = (0, import_node_conversion.getPreviewOptions)(opts);
  const dataType2 = dataTypes.find((dataType3) => dataType3.check(node.value));
  if (dataType2) {
    return typeof dataType2.description === "function" ? dataType2.description(node, options) : dataType2.description;
  }
  return String(node.value);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArrayBufferType,
  ArrayType,
  BigIntType,
  BlobType,
  BufferType,
  ClassType,
  DataViewType,
  DateType,
  DocumentType,
  ElementType,
  ErrorType,
  FileType,
  FormDataType,
  FunctionType,
  HeadersType,
  IterableType,
  MapType,
  NullType,
  ObjectType,
  PrimitiveType,
  ReactElementType,
  RegexType,
  SetType,
  SharedArrayBufferType,
  StringType,
  SymbolType,
  TypedArrayType,
  URLSearchParamsType,
  UndefinedType,
  UrlType,
  WeakMapType,
  WeakSetType,
  WindowType,
  dataTypes,
  getNodeTypeDescription,
  jsonNodeToElement
});
