var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/lib/models/Comment.ts
import { assertNever, i18n, NonEnumerable, removeIf } from "#utils";

// src/lib/models/ReflectionSymbolId.ts
import "#utils";

// src/lib/models/utils.ts
function splitUnquotedString(input, delimiter) {
  if (input.startsWith(delimiter)) {
    return splitUnquotedString(
      input.substring(delimiter.length),
      delimiter
    );
  }
  if (input.startsWith('"')) {
    const closingQuoteIndex = input.indexOf('"', 1);
    if (closingQuoteIndex === -1) {
      return input.split(delimiter);
    }
    if (closingQuoteIndex === input.length - 1) {
      return [input];
    } else {
      const remainder = input.substring(closingQuoteIndex + 1);
      return [
        input.substring(0, closingQuoteIndex + 1),
        ...splitUnquotedString(remainder, delimiter)
      ];
    }
  } else {
    return input.split(delimiter);
  }
}

// src/lib/models/ReflectionSymbolId.ts
var ReflectionSymbolId = class {
  /**
   * This will only be used if we somehow cannot find a package.json file for
   * source code. This is very unlikely, but if it occurs then the {@link packageName}
   * will be set to this string, and {@link packagePath} will have the absolute path
   * to the source file.
   */
  static UNKNOWN_PACKAGE = "<unknown>";
  /**
   * The name of the package which this symbol ID resides within.
   */
  packageName;
  /**
   * Path to the source file containing this symbol.
   * Note that this is NOT an absolute path, but a package-relative path according
   * to the directory containing package.json for the package name.
   */
  packagePath;
  /**
   * Qualified name of this symbol within the source file.
   */
  qualifiedName;
  /**
   * Note: This is **not** serialized. It exists for sorting by declaration order, but
   * should not be needed when deserializing from JSON.
   * Will be set to `Infinity` if the ID was deserialized from JSON.
   */
  pos;
  /**
   * Note: This is **not** serialized. It exists to support detection of the differences between
   * symbols which share declarations, but are instantiated with different type parameters.
   * This will be `NaN` if the symbol reference is not transient.
   * Note: This can only be non-NaN if {@link pos} is finite.
   */
  transientId;
  /**
   * Note: This is **not** serialized, only {@link packageName} and {@link packagePath} path
   * information is preserved when serializing. This is set so that it is available to plugins
   * when initially converting a project.
   *
   * @privateRemarks
   * This is used by typedoc-plugin-dt-links to determine the path to read to get the source
   * code of a definitely typed package.
   */
  fileName;
  constructor(json, pos, transientId, fileName) {
    this.packageName = json.packageName;
    this.packagePath = json.packagePath;
    this.qualifiedName = json.qualifiedName;
    this.pos = pos ?? Infinity;
    this.transientId = transientId ?? NaN;
    this.fileName = fileName;
  }
  getStableKey() {
    if (Number.isFinite(this.pos)) {
      return `${this.packageName}\0${this.packagePath}\0${this.qualifiedName}\0${this.pos}\0${this.transientId}`;
    } else {
      return `${this.packageName}\0${this.packagePath}\0${this.qualifiedName}`;
    }
  }
  toDeclarationReference() {
    return {
      resolutionStart: "global",
      moduleSource: this.packageName,
      symbolReference: {
        path: splitUnquotedString(this.qualifiedName, ".").map(
          (path) => ({
            navigation: ".",
            path
          })
        )
      }
    };
  }
  toObject() {
    return {
      packageName: this.packageName,
      packagePath: this.packagePath,
      qualifiedName: this.qualifiedName
    };
  }
};

// src/lib/models/Comment.ts
var CommentTag = class _CommentTag {
  /**
   * The name of this tag, e.g. `@returns`, `@example`
   */
  tag;
  /**
   * Some tags, (`@typedef`, `@param`, `@property`, etc.) may have a user defined identifier associated with them.
   * If this tag is one of those, it will be parsed out and included here.
   */
  name;
  /**
   * Optional type annotation associated with this tag. TypeDoc will remove type annotations unless explicitly
   * requested by the user with the `preservedTypeAnnotationTags` option.
   */
  typeAnnotation;
  /**
   * The actual body text of this tag.
   */
  content;
  /**
   * A flag which may be set by plugins to prevent TypeDoc from rendering this tag, if the plugin provides
   * custom rendering. Note: This flag is **not** serialized, it is expected to be set just before the comment
   * is rendered.
   */
  skipRendering = false;
  /**
   * Create a new CommentTag instance.
   */
  constructor(tag, text) {
    this.tag = tag;
    this.content = text;
  }
  /**
   * Checks if this block tag is roughly equal to the other tag.
   * This isn't exactly equal, but just "roughly equal" by the tag
   * text.
   */
  similarTo(other) {
    return this.tag === other.tag && this.name === other.name && Comment.combineDisplayParts(this.content) === Comment.combineDisplayParts(other.content);
  }
  clone() {
    const tag = new _CommentTag(
      this.tag,
      Comment.cloneDisplayParts(this.content)
    );
    if (this.name) {
      tag.name = this.name;
    }
    if (this.typeAnnotation) {
      tag.typeAnnotation = this.typeAnnotation;
    }
    return tag;
  }
  toObject() {
    return {
      tag: this.tag,
      name: this.name,
      content: Comment.serializeDisplayParts(this.content),
      typeAnnotation: this.typeAnnotation
    };
  }
  fromObject(de, obj) {
    this.name = obj.name;
    this.typeAnnotation = obj.typeAnnotation;
    this.content = Comment.deserializeDisplayParts(de, obj.content);
  }
};
var _inheritedFromParentDeclaration_dec, _discoveryId_dec, _sourcePath_dec, _init;
_sourcePath_dec = [NonEnumerable], _discoveryId_dec = [NonEnumerable], _inheritedFromParentDeclaration_dec = [NonEnumerable];
var _Comment = class _Comment {
  /**
   * Creates a new Comment instance.
   */
  constructor(summary = [], blockTags = [], modifierTags = /* @__PURE__ */ new Set()) {
    /**
     * The content of the comment which is not associated with a block tag.
     */
    __publicField(this, "summary");
    /**
     * All associated block level tags.
     */
    __publicField(this, "blockTags", []);
    /**
     * All modifier tags present on the comment, e.g. `@alpha`, `@beta`.
     */
    __publicField(this, "modifierTags", /* @__PURE__ */ new Set());
    /**
     * Label associated with this reflection, if any (https://tsdoc.org/pages/tags/label/)
     */
    __publicField(this, "label");
    __publicField(this, "sourcePath", __runInitializers(_init, 8, this)), __runInitializers(_init, 11, this);
    __publicField(this, "discoveryId", __runInitializers(_init, 12, this)), __runInitializers(_init, 15, this);
    __publicField(this, "inheritedFromParentDeclaration", __runInitializers(_init, 16, this)), __runInitializers(_init, 19, this);
    this.summary = summary;
    this.blockTags = blockTags;
    this.modifierTags = modifierTags;
    extractLabelTag(this);
  }
  /**
   * Debugging utility for combining parts into a simple string. Not suitable for
   * rendering, but can be useful in tests.
   */
  static combineDisplayParts(parts) {
    let result = "";
    for (const item of parts || []) {
      switch (item.kind) {
        case "text":
        case "code":
        case "relative-link":
          result += item.text;
          break;
        case "inline-tag":
          result += `{${item.tag} ${item.text}}`;
          break;
        default:
          assertNever(item);
      }
    }
    return result;
  }
  /**
   * Helper utility to clone {@link Comment#summary} or {@link CommentTag#content}
   */
  static cloneDisplayParts(parts) {
    return parts.map((p) => ({ ...p }));
  }
  static serializeDisplayParts(parts) {
    return parts?.map((part) => {
      switch (part.kind) {
        case "text":
        case "code":
          return { ...part };
        case "inline-tag": {
          let target;
          if (typeof part.target === "string") {
            target = part.target;
          } else if (part.target) {
            if ("id" in part.target) {
              target = part.target.id;
            } else {
              target = part.target.toObject();
            }
          }
          return {
            ...part,
            target
          };
        }
        case "relative-link": {
          return {
            ...part
          };
        }
      }
    });
  }
  // Since display parts are plain objects, this lives here
  static deserializeDisplayParts(de, parts) {
    const links = [];
    const files = [];
    const result = parts.map((part) => {
      switch (part.kind) {
        case "text":
        case "code":
          return { ...part };
        case "inline-tag": {
          if (typeof part.target === "number") {
            const part2 = {
              kind: part.kind,
              tag: part.tag,
              text: part.text,
              target: void 0,
              tsLinkText: part.tsLinkText
            };
            links.push([part.target, part2]);
            return part2;
          } else if (typeof part.target === "string" || part.target === void 0) {
            return {
              kind: "inline-tag",
              tag: part.tag,
              text: part.text,
              target: part.target,
              tsLinkText: part.tsLinkText
            };
          } else if (typeof part.target === "object") {
            return {
              kind: "inline-tag",
              tag: part.tag,
              text: part.text,
              target: new ReflectionSymbolId(part.target),
              tsLinkText: part.tsLinkText
            };
          } else {
            assertNever(part.target);
          }
          break;
        }
        case "relative-link": {
          if (part.target) {
            const part2 = {
              kind: "relative-link",
              text: part.text,
              target: null,
              targetAnchor: part.targetAnchor
            };
            files.push([part.target, part2]);
            return part2;
          }
          return {
            ...part,
            target: void 0,
            targetAnchor: part.targetAnchor
          };
        }
      }
    });
    if (links.length || files.length) {
      de.defer((project) => {
        for (const [oldFileId, part] of files) {
          part.target = de.oldFileIdToNewFileId[oldFileId];
        }
        for (const [oldId, part] of links) {
          part.target = project.getReflectionById(
            de.oldIdToNewId[oldId] ?? -1
          );
          if (!part.target) {
            de.logger.warn(
              i18n.serialized_project_referenced_0_not_part_of_project(
                oldId.toString()
              )
            );
          }
        }
      });
    }
    return result;
  }
  /**
   * Splits the provided parts into a header (first line, as a string)
   * and body (remaining lines). If the header line contains inline tags
   * they will be serialized to a string.
   */
  static splitPartsToHeaderAndBody(parts) {
    let index = parts.findIndex((part) => {
      switch (part.kind) {
        case "text":
        case "code":
          return part.text.includes("\n");
        case "inline-tag":
        case "relative-link":
          return false;
      }
    });
    if (index === -1) {
      return {
        header: _Comment.combineDisplayParts(parts),
        body: []
      };
    }
    if (parts[index].kind === "code") {
      --index;
    }
    if (index === -1) {
      return { header: "", body: _Comment.cloneDisplayParts(parts) };
    }
    let header = _Comment.combineDisplayParts(parts.slice(0, index));
    const split = parts[index].text.indexOf("\n");
    let body;
    if (split === -1) {
      header += parts[index].text;
      body = _Comment.cloneDisplayParts(parts.slice(index + 1));
    } else {
      header += parts[index].text.substring(0, split);
      body = _Comment.cloneDisplayParts(parts.slice(index));
      body[0].text = body[0].text.substring(split + 1);
    }
    if (!body[0].text) {
      body.shift();
    }
    return { header: header.trim(), body };
  }
  /**
   * Gets either the `@summary` tag, or a short version of the comment summary
   * section for rendering in module/namespace pages.
   */
  getShortSummary(useFirstParagraph) {
    const tag = this.getTag("@summary");
    if (tag) return tag.content;
    if (!useFirstParagraph) return [];
    let partsEnd = this.summary.findIndex((part) => {
      switch (part.kind) {
        case "text":
          return /\r?\n\r?\n/.test(part.text);
        case "code":
          return part.text.includes("\n");
        case "inline-tag":
        case "relative-link":
          return false;
        default:
          assertNever(part);
      }
    });
    const foundEnd = partsEnd !== -1;
    if (partsEnd === -1) {
      partsEnd = this.summary.length - 1;
    }
    const summaryParts = this.summary.slice(0, partsEnd);
    if (partsEnd !== -1) {
      const text = this.summary[partsEnd].text;
      const paragraphEnd = text.match(/\r?\n\r?\n/);
      if (paragraphEnd) {
        summaryParts.push({
          ...this.summary[partsEnd],
          text: text.slice(0, paragraphEnd.index)
        });
      } else if (!foundEnd) {
        summaryParts.push(this.summary[partsEnd]);
      }
    }
    return summaryParts;
  }
  /**
   * Checks if this comment is roughly equal to the other comment.
   * This isn't exactly equal, but just "roughly equal" by the comment
   * text.
   */
  similarTo(other) {
    if (_Comment.combineDisplayParts(this.summary) !== _Comment.combineDisplayParts(other.summary)) {
      return false;
    }
    if (this.blockTags.length !== other.blockTags.length) {
      return false;
    }
    for (let i = 0; i < this.blockTags.length; ++i) {
      if (!this.blockTags[i].similarTo(other.blockTags[i])) {
        return false;
      }
    }
    return true;
  }
  /**
   * Create a deep clone of this comment.
   */
  clone() {
    const comment = new _Comment(
      _Comment.cloneDisplayParts(this.summary),
      this.blockTags.map((tag) => tag.clone()),
      new Set(this.modifierTags)
    );
    comment.discoveryId = this.discoveryId;
    comment.sourcePath = this.sourcePath;
    comment.inheritedFromParentDeclaration = this.inheritedFromParentDeclaration;
    return comment;
  }
  /**
   * Returns true if this comment is completely empty.
   * @internal
   */
  isEmpty() {
    return !this.hasVisibleComponent() && this.modifierTags.size === 0;
  }
  /**
   * Checks if this comment contains any visible text.
   *
   * @returns TRUE when this reflection has a visible comment.
   */
  hasVisibleComponent(notRenderedTags) {
    if (this.summary.some((x) => x.kind !== "text" || x.text !== "")) {
      return true;
    }
    if (notRenderedTags) {
      return this.blockTags.some((tag) => !notRenderedTags.includes(tag.tag));
    } else {
      return this.blockTags.length > 0;
    }
  }
  /**
   * Test whether this comment contains a tag with the given name.
   *
   * @param tagName  The name of the tag to look for.
   * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
   */
  hasModifier(tagName) {
    return this.modifierTags.has(tagName);
  }
  removeModifier(tagName) {
    this.modifierTags.delete(tagName);
  }
  /**
   * Return the first tag with the given name.
   *
   * @param tagName  The name of the tag to look for.
   * @returns The found tag or undefined.
   */
  getTag(tagName) {
    return this.blockTags.find((tag) => tag.tag === tagName);
  }
  /**
   * Get all tags with the given tag name.
   */
  getTags(tagName) {
    return this.blockTags.filter((tag) => tag.tag === tagName);
  }
  getIdentifiedTag(identifier, tagName) {
    return this.blockTags.find(
      (tag) => tag.tag === tagName && tag.name === identifier
    );
  }
  /**
   * Removes all block tags with the given tag name from the comment.
   * @param tagName
   */
  removeTags(tagName) {
    removeIf(this.blockTags, (tag) => tag.tag === tagName);
  }
  toObject(serializer) {
    return {
      summary: _Comment.serializeDisplayParts(this.summary),
      blockTags: serializer.toObjectsOptional(this.blockTags),
      modifierTags: this.modifierTags.size > 0 ? Array.from(this.modifierTags) : void 0,
      label: this.label
    };
  }
  fromObject(de, obj) {
    this.summary = _Comment.deserializeDisplayParts(de, obj.summary);
    this.blockTags = obj.blockTags?.map((tagObj) => {
      const tag = new CommentTag(tagObj.tag, []);
      de.fromObject(tag, tagObj);
      return tag;
    }) || [];
    this.modifierTags = new Set(obj.modifierTags);
    this.label = obj.label;
  }
};
_init = __decoratorStart(null);
__decorateElement(_init, 5, "sourcePath", _sourcePath_dec, _Comment);
__decorateElement(_init, 5, "discoveryId", _discoveryId_dec, _Comment);
__decorateElement(_init, 5, "inheritedFromParentDeclaration", _inheritedFromParentDeclaration_dec, _Comment);
__decoratorMetadata(_init, _Comment);
var Comment = _Comment;
function extractLabelTag(comment) {
  const index = comment.summary.findIndex(
    (part) => part.kind === "inline-tag" && part.tag === "@label"
  );
  if (index !== -1) {
    comment.label = comment.summary.splice(index, 1)[0].text;
  }
}

// src/lib/models/Reflection.ts
import { i18n as i18n3, NonEnumerable as NonEnumerable2 } from "#utils";

// src/lib/models/kind.ts
import { i18n as i18n2 } from "#utils";
var ReflectionKind = /* @__PURE__ */ ((ReflectionKind2) => {
  ReflectionKind2[ReflectionKind2["Project"] = 1] = "Project";
  ReflectionKind2[ReflectionKind2["Module"] = 2] = "Module";
  ReflectionKind2[ReflectionKind2["Namespace"] = 4] = "Namespace";
  ReflectionKind2[ReflectionKind2["Enum"] = 8] = "Enum";
  ReflectionKind2[ReflectionKind2["EnumMember"] = 16] = "EnumMember";
  ReflectionKind2[ReflectionKind2["Variable"] = 32] = "Variable";
  ReflectionKind2[ReflectionKind2["Function"] = 64] = "Function";
  ReflectionKind2[ReflectionKind2["Class"] = 128] = "Class";
  ReflectionKind2[ReflectionKind2["Interface"] = 256] = "Interface";
  ReflectionKind2[ReflectionKind2["Constructor"] = 512] = "Constructor";
  ReflectionKind2[ReflectionKind2["Property"] = 1024] = "Property";
  ReflectionKind2[ReflectionKind2["Method"] = 2048] = "Method";
  ReflectionKind2[ReflectionKind2["CallSignature"] = 4096] = "CallSignature";
  ReflectionKind2[ReflectionKind2["IndexSignature"] = 8192] = "IndexSignature";
  ReflectionKind2[ReflectionKind2["ConstructorSignature"] = 16384] = "ConstructorSignature";
  ReflectionKind2[ReflectionKind2["Parameter"] = 32768] = "Parameter";
  ReflectionKind2[ReflectionKind2["TypeLiteral"] = 65536] = "TypeLiteral";
  ReflectionKind2[ReflectionKind2["TypeParameter"] = 131072] = "TypeParameter";
  ReflectionKind2[ReflectionKind2["Accessor"] = 262144] = "Accessor";
  ReflectionKind2[ReflectionKind2["GetSignature"] = 524288] = "GetSignature";
  ReflectionKind2[ReflectionKind2["SetSignature"] = 1048576] = "SetSignature";
  ReflectionKind2[ReflectionKind2["TypeAlias"] = 2097152] = "TypeAlias";
  ReflectionKind2[ReflectionKind2["Reference"] = 4194304] = "Reference";
  ReflectionKind2[ReflectionKind2["Document"] = 8388608] = "Document";
  return ReflectionKind2;
})(ReflectionKind || {});
((ReflectionKind2) => {
  ReflectionKind2.All = 4194304 /* Reference */ * 2 - 1;
  ReflectionKind2.ClassOrInterface = 128 /* Class */ | 256 /* Interface */;
  ReflectionKind2.VariableOrProperty = 32 /* Variable */ | 1024 /* Property */;
  ReflectionKind2.FunctionOrMethod = 64 /* Function */ | 2048 /* Method */;
  ReflectionKind2.ClassMember = 262144 /* Accessor */ | 512 /* Constructor */ | 2048 /* Method */ | 1024 /* Property */;
  ReflectionKind2.SomeSignature = 4096 /* CallSignature */ | 8192 /* IndexSignature */ | 16384 /* ConstructorSignature */ | 524288 /* GetSignature */ | 1048576 /* SetSignature */;
  ReflectionKind2.SomeModule = 4 /* Namespace */ | 2 /* Module */;
  ReflectionKind2.SomeType = 256 /* Interface */ | 65536 /* TypeLiteral */ | 131072 /* TypeParameter */ | 2097152 /* TypeAlias */;
  ReflectionKind2.SomeValue = 32 /* Variable */ | 64 /* Function */;
  ReflectionKind2.SomeMember = 16 /* EnumMember */ | 1024 /* Property */ | 2048 /* Method */ | 262144 /* Accessor */;
  ReflectionKind2.SomeExport = 2 /* Module */ | 4 /* Namespace */ | 8 /* Enum */ | 32 /* Variable */ | 64 /* Function */ | 128 /* Class */ | 256 /* Interface */ | 2097152 /* TypeAlias */ | 4194304 /* Reference */;
  ReflectionKind2.MayContainDocuments = ReflectionKind2.SomeExport | 1 /* Project */ | 8388608 /* Document */;
  ReflectionKind2.ExportContainer = ReflectionKind2.SomeModule | 1 /* Project */;
  ReflectionKind2.Inheritable = 262144 /* Accessor */ | 8192 /* IndexSignature */ | 1024 /* Property */ | 2048 /* Method */ | 512 /* Constructor */;
  ReflectionKind2.ContainsCallSignatures = 512 /* Constructor */ | 64 /* Function */ | 2048 /* Method */;
  ReflectionKind2.TypeReferenceTarget = 256 /* Interface */ | 2097152 /* TypeAlias */ | 128 /* Class */ | 8 /* Enum */;
  ReflectionKind2.ValueReferenceTarget = 2 /* Module */ | 4 /* Namespace */ | 32 /* Variable */ | 64 /* Function */;
  ReflectionKind2.SignatureContainer = ReflectionKind2.ContainsCallSignatures | 262144 /* Accessor */;
  ReflectionKind2.VariableContainer = ReflectionKind2.SomeModule | 1 /* Project */;
  ReflectionKind2.MethodContainer = ReflectionKind2.ClassOrInterface | ReflectionKind2.VariableOrProperty | ReflectionKind2.FunctionOrMethod | 65536 /* TypeLiteral */;
  function singularString(kind) {
    switch (kind) {
      case 1 /* Project */:
        return i18n2.kind_project();
      case 2 /* Module */:
        return i18n2.kind_module();
      case 4 /* Namespace */:
        return i18n2.kind_namespace();
      case 8 /* Enum */:
        return i18n2.kind_enum();
      case 16 /* EnumMember */:
        return i18n2.kind_enum_member();
      case 32 /* Variable */:
        return i18n2.kind_variable();
      case 64 /* Function */:
        return i18n2.kind_function();
      case 128 /* Class */:
        return i18n2.kind_class();
      case 256 /* Interface */:
        return i18n2.kind_interface();
      case 512 /* Constructor */:
        return i18n2.kind_constructor();
      case 1024 /* Property */:
        return i18n2.kind_property();
      case 2048 /* Method */:
        return i18n2.kind_method();
      case 4096 /* CallSignature */:
        return i18n2.kind_call_signature();
      case 8192 /* IndexSignature */:
        return i18n2.kind_index_signature();
      case 16384 /* ConstructorSignature */:
        return i18n2.kind_constructor_signature();
      case 32768 /* Parameter */:
        return i18n2.kind_parameter();
      case 65536 /* TypeLiteral */:
        return i18n2.kind_type_literal();
      case 131072 /* TypeParameter */:
        return i18n2.kind_type_parameter();
      case 262144 /* Accessor */:
        return i18n2.kind_accessor();
      case 524288 /* GetSignature */:
        return i18n2.kind_get_signature();
      case 1048576 /* SetSignature */:
        return i18n2.kind_set_signature();
      case 2097152 /* TypeAlias */:
        return i18n2.kind_type_alias();
      case 4194304 /* Reference */:
        return i18n2.kind_reference();
      case 8388608 /* Document */:
        return i18n2.kind_document();
    }
  }
  ReflectionKind2.singularString = singularString;
  function pluralString(kind) {
    switch (kind) {
      case 1 /* Project */:
        return i18n2.kind_plural_project();
      case 2 /* Module */:
        return i18n2.kind_plural_module();
      case 4 /* Namespace */:
        return i18n2.kind_plural_namespace();
      case 8 /* Enum */:
        return i18n2.kind_plural_enum();
      case 16 /* EnumMember */:
        return i18n2.kind_plural_enum_member();
      case 32 /* Variable */:
        return i18n2.kind_plural_variable();
      case 64 /* Function */:
        return i18n2.kind_plural_function();
      case 128 /* Class */:
        return i18n2.kind_plural_class();
      case 256 /* Interface */:
        return i18n2.kind_plural_interface();
      case 512 /* Constructor */:
        return i18n2.kind_plural_constructor();
      case 1024 /* Property */:
        return i18n2.kind_plural_property();
      case 2048 /* Method */:
        return i18n2.kind_plural_method();
      case 4096 /* CallSignature */:
        return i18n2.kind_plural_call_signature();
      case 8192 /* IndexSignature */:
        return i18n2.kind_plural_index_signature();
      case 16384 /* ConstructorSignature */:
        return i18n2.kind_plural_constructor_signature();
      case 32768 /* Parameter */:
        return i18n2.kind_plural_parameter();
      case 65536 /* TypeLiteral */:
        return i18n2.kind_plural_type_literal();
      case 131072 /* TypeParameter */:
        return i18n2.kind_plural_type_parameter();
      case 262144 /* Accessor */:
        return i18n2.kind_plural_accessor();
      case 524288 /* GetSignature */:
        return i18n2.kind_plural_get_signature();
      case 1048576 /* SetSignature */:
        return i18n2.kind_plural_set_signature();
      case 2097152 /* TypeAlias */:
        return i18n2.kind_plural_type_alias();
      case 4194304 /* Reference */:
        return i18n2.kind_plural_reference();
      case 8388608 /* Document */:
        return i18n2.kind_plural_document();
    }
  }
  ReflectionKind2.pluralString = pluralString;
  function classString(kind) {
    return `tsd-kind-${ReflectionKind2[kind].replace(/(.)([A-Z])/g, (_m, a, b) => `${a}-${b}`).toLowerCase()}`;
  }
  ReflectionKind2.classString = classString;
})(ReflectionKind || (ReflectionKind = {}));

// src/lib/models/Reflection.ts
var REFLECTION_ID = 0;
function resetReflectionID() {
  REFLECTION_ID = 0;
}
var ReflectionFlag = /* @__PURE__ */ ((ReflectionFlag2) => {
  ReflectionFlag2[ReflectionFlag2["None"] = 0] = "None";
  ReflectionFlag2[ReflectionFlag2["Private"] = 1] = "Private";
  ReflectionFlag2[ReflectionFlag2["Protected"] = 2] = "Protected";
  ReflectionFlag2[ReflectionFlag2["Public"] = 4] = "Public";
  ReflectionFlag2[ReflectionFlag2["Static"] = 8] = "Static";
  ReflectionFlag2[ReflectionFlag2["External"] = 16] = "External";
  ReflectionFlag2[ReflectionFlag2["Optional"] = 32] = "Optional";
  ReflectionFlag2[ReflectionFlag2["Rest"] = 64] = "Rest";
  ReflectionFlag2[ReflectionFlag2["Abstract"] = 128] = "Abstract";
  ReflectionFlag2[ReflectionFlag2["Const"] = 256] = "Const";
  ReflectionFlag2[ReflectionFlag2["Readonly"] = 512] = "Readonly";
  ReflectionFlag2[ReflectionFlag2["Inherited"] = 1024] = "Inherited";
  return ReflectionFlag2;
})(ReflectionFlag || {});
var relevantFlags = [
  1 /* Private */,
  2 /* Protected */,
  8 /* Static */,
  32 /* Optional */,
  128 /* Abstract */,
  256 /* Const */,
  512 /* Readonly */
];
var ReflectionFlags = class _ReflectionFlags {
  flags = 0 /* None */;
  hasFlag(flag) {
    return (flag & this.flags) !== 0;
  }
  /**
   * Is this a private member?
   */
  get isPrivate() {
    return this.hasFlag(1 /* Private */);
  }
  /**
   * Is this a protected member?
   */
  get isProtected() {
    return this.hasFlag(2 /* Protected */);
  }
  /**
   * Is this a public member?
   */
  get isPublic() {
    return this.hasFlag(4 /* Public */);
  }
  /**
   * Is this a static member?
   */
  get isStatic() {
    return this.hasFlag(8 /* Static */);
  }
  /**
   * Is this a declaration from an external document?
   */
  get isExternal() {
    return this.hasFlag(16 /* External */);
  }
  /**
   * Whether this reflection is an optional component or not.
   *
   * Applies to function parameters and object members.
   */
  get isOptional() {
    return this.hasFlag(32 /* Optional */);
  }
  /**
   * Whether it's a rest parameter, like `foo(...params);`.
   */
  get isRest() {
    return this.hasFlag(64 /* Rest */);
  }
  get isAbstract() {
    return this.hasFlag(128 /* Abstract */);
  }
  get isConst() {
    return this.hasFlag(256 /* Const */);
  }
  get isReadonly() {
    return this.hasFlag(512 /* Readonly */);
  }
  get isInherited() {
    return this.hasFlag(1024 /* Inherited */);
  }
  setFlag(flag, set) {
    switch (flag) {
      case 1 /* Private */:
        this.setSingleFlag(1 /* Private */, set);
        if (set) {
          this.setFlag(2 /* Protected */, false);
          this.setFlag(4 /* Public */, false);
        }
        break;
      case 2 /* Protected */:
        this.setSingleFlag(2 /* Protected */, set);
        if (set) {
          this.setFlag(1 /* Private */, false);
          this.setFlag(4 /* Public */, false);
        }
        break;
      case 4 /* Public */:
        this.setSingleFlag(4 /* Public */, set);
        if (set) {
          this.setFlag(1 /* Private */, false);
          this.setFlag(2 /* Protected */, false);
        }
        break;
      default:
        this.setSingleFlag(flag, set);
    }
  }
  static flagString(flag) {
    switch (flag) {
      case 0 /* None */:
        throw new Error("Should be unreachable");
      case 1 /* Private */:
        return i18n3.flag_private();
      case 2 /* Protected */:
        return i18n3.flag_protected();
      case 4 /* Public */:
        return i18n3.flag_public();
      case 8 /* Static */:
        return i18n3.flag_static();
      case 16 /* External */:
        return i18n3.flag_external();
      case 32 /* Optional */:
        return i18n3.flag_optional();
      case 64 /* Rest */:
        return i18n3.flag_rest();
      case 128 /* Abstract */:
        return i18n3.flag_abstract();
      case 256 /* Const */:
        return i18n3.flag_const();
      case 512 /* Readonly */:
        return i18n3.flag_readonly();
      case 1024 /* Inherited */:
        return i18n3.flag_inherited();
    }
  }
  getFlagStrings() {
    const strings = [];
    for (const flag of relevantFlags) {
      if (this.hasFlag(flag)) {
        strings.push(_ReflectionFlags.flagString(flag));
      }
    }
    return strings;
  }
  setSingleFlag(flag, set) {
    if (!set && this.hasFlag(flag)) {
      this.flags ^= flag;
    } else if (set && !this.hasFlag(flag)) {
      this.flags |= flag;
    }
  }
  static serializedFlags = [
    "isPrivate",
    "isProtected",
    "isPublic",
    "isStatic",
    "isExternal",
    "isOptional",
    "isRest",
    "isAbstract",
    "isConst",
    "isReadonly",
    "isInherited"
  ];
  toObject() {
    return Object.fromEntries(
      _ReflectionFlags.serializedFlags.filter((flag) => this[flag]).map((flag) => [flag, true])
    );
  }
  fromObject(obj) {
    for (const key of Object.keys(obj)) {
      const flagName = key.substring(2);
      if (flagName in ReflectionFlag) {
        this.setFlag(
          ReflectionFlag[flagName],
          true
        );
      }
    }
  }
};
var TraverseProperty = /* @__PURE__ */ ((TraverseProperty2) => {
  TraverseProperty2[TraverseProperty2["Children"] = 0] = "Children";
  TraverseProperty2[TraverseProperty2["Documents"] = 1] = "Documents";
  TraverseProperty2[TraverseProperty2["Parameters"] = 2] = "Parameters";
  TraverseProperty2[TraverseProperty2["TypeLiteral"] = 3] = "TypeLiteral";
  TraverseProperty2[TraverseProperty2["TypeParameter"] = 4] = "TypeParameter";
  TraverseProperty2[TraverseProperty2["Signatures"] = 5] = "Signatures";
  TraverseProperty2[TraverseProperty2["IndexSignature"] = 6] = "IndexSignature";
  TraverseProperty2[TraverseProperty2["GetSignature"] = 7] = "GetSignature";
  TraverseProperty2[TraverseProperty2["SetSignature"] = 8] = "SetSignature";
  return TraverseProperty2;
})(TraverseProperty || {});
var _project_dec, _parent_dec, _init2;
_parent_dec = [NonEnumerable2], _project_dec = [NonEnumerable2];
var Reflection = class {
  constructor(name, kind, parent) {
    /**
     * Unique id of this reflection.
     */
    __publicField(this, "id");
    /**
     * The symbol name of this reflection.
     */
    __publicField(this, "name");
    /**
     * The kind of this reflection.
     */
    __publicField(this, "kind");
    __publicField(this, "flags", new ReflectionFlags());
    // So that it doesn't show up in console.log
    __publicField(this, "parent", __runInitializers(_init2, 8, this)), __runInitializers(_init2, 11, this);
    __publicField(this, "project", __runInitializers(_init2, 12, this)), __runInitializers(_init2, 15, this);
    /**
     * The parsed documentation comment attached to this reflection.
     */
    __publicField(this, "comment");
    this.id = REFLECTION_ID++;
    this.parent = parent;
    this.project = parent?.project || this;
    this.name = name;
    this.kind = kind;
    if (parent?.flags.isExternal) {
      this.setFlag(16 /* External */);
    }
  }
  /**
   * Test whether this reflection is of the given kind.
   */
  kindOf(kind) {
    const kindFlags = Array.isArray(kind) ? kind.reduce((a, b) => a | b, 0) : kind;
    return (this.kind & kindFlags) !== 0;
  }
  /**
   * Return the full name of this reflection. Intended for use in debugging. For log messages
   * intended to be displayed to the user for them to fix, prefer {@link getFriendlyFullName} instead.
   *
   * The full name contains the name of this reflection and the names of all parent reflections.
   *
   * @param separator  Separator used to join the names of the reflections.
   * @returns The full name of this reflection.
   */
  getFullName(separator = ".") {
    if (this.parent && !this.parent.isProject()) {
      return this.parent.getFullName(separator) + separator + this.name;
    } else {
      return this.name;
    }
  }
  /**
   * Return the full name of this reflection, with signature names dropped if possible without
   * introducing ambiguity in the name.
   */
  getFriendlyFullName() {
    if (this.parent && !this.parent.isProject()) {
      if (this.kindOf(
        16384 /* ConstructorSignature */ | 4096 /* CallSignature */ | 524288 /* GetSignature */ | 1048576 /* SetSignature */
      )) {
        return this.parent.getFriendlyFullName();
      }
      return this.parent.getFriendlyFullName() + "." + this.name;
    } else {
      return this.name;
    }
  }
  /**
   * Set a flag on this reflection.
   */
  setFlag(flag, value = true) {
    this.flags.setFlag(flag, value);
  }
  /**
   * Checks if this reflection has a comment which contains any visible text.
   *
   * @returns TRUE when this reflection has a visible comment.
   */
  hasComment(notRenderedTags) {
    return this.comment ? this.comment.hasVisibleComponent(notRenderedTags) : false;
  }
  hasGetterOrSetter() {
    return false;
  }
  /**
   * Return a child by its name.
   *
   * @param arg The name hierarchy of the child to look for.
   * @returns The found child or undefined.
   */
  getChildByName(arg) {
    const names = Array.isArray(arg) ? arg : splitUnquotedString(arg, ".");
    const name = names[0];
    let result;
    this.traverse((child) => {
      if (child.name === name) {
        if (names.length <= 1) {
          result = child;
        } else {
          result = child.getChildByName(names.slice(1));
        }
        return false;
      }
      return true;
    });
    return result;
  }
  /**
   * Return whether this reflection is the root / project reflection.
   */
  isProject() {
    return false;
  }
  isDeclaration() {
    return false;
  }
  isSignature() {
    return false;
  }
  isTypeParameter() {
    return false;
  }
  isParameter() {
    return false;
  }
  isDocument() {
    return false;
  }
  isReference() {
    return this.variant === "reference";
  }
  isContainer() {
    return false;
  }
  /**
   * Check if this reflection or any of its parents have been marked with the `@deprecated` tag.
   */
  isDeprecated() {
    let signaturesDeprecated = false;
    this.visit({
      declaration(decl) {
        if (decl.signatures?.length && decl.signatures.every((sig) => sig.comment?.getTag("@deprecated"))) {
          signaturesDeprecated = true;
        }
      }
    });
    if (signaturesDeprecated || this.comment?.getTag("@deprecated")) {
      return true;
    }
    return this.parent?.isDeprecated() ?? false;
  }
  visit(visitor) {
    visitor[this.variant]?.(this);
  }
  /**
   * Return a string representation of this reflection.
   */
  toString() {
    return ReflectionKind[this.kind] + " " + this.name;
  }
  /**
   * Return a string representation of this reflection and all of its children.
   *
   * Note: This is intended as a debug tool only, output may change between patch versions.
   *
   * @param indent  Used internally to indent child reflections.
   */
  toStringHierarchy(indent = "") {
    const lines = [indent + this.toString()];
    indent += "  ";
    this.traverse((child) => {
      lines.push(child.toStringHierarchy(indent));
      return true;
    });
    return lines.join("\n");
  }
  toObject(serializer) {
    return {
      id: this.id,
      name: this.name,
      variant: this.variant,
      kind: this.kind,
      flags: this.flags.toObject(),
      comment: this.comment && !this.comment.isEmpty() ? serializer.toObject(this.comment) : void 0
    };
  }
  fromObject(de, obj) {
    this.name = obj.name;
    this.kind = obj.kind;
    this.flags.fromObject(obj.flags);
    this.comment = de.revive(obj.comment, () => new Comment());
  }
};
_init2 = __decoratorStart(null);
__decorateElement(_init2, 5, "parent", _parent_dec, Reflection);
__decorateElement(_init2, 5, "project", _project_dec, Reflection);
__decoratorMetadata(_init2, Reflection);

// src/lib/models/ReflectionCategory.ts
var ReflectionCategory = class {
  /**
   * The title, a string representation of this category.
   */
  title;
  /**
   * The user specified description, if any, set with `@categoryDescription`
   */
  description;
  /**
   * All reflections of this category.
   */
  children = [];
  /**
   * Create a new ReflectionCategory instance.
   *
   * @param title The title of this category.
   */
  constructor(title) {
    this.title = title;
  }
  toObject() {
    return {
      title: this.title,
      description: this.description ? Comment.serializeDisplayParts(this.description) : void 0,
      children: this.children.length > 0 ? this.children.map((child) => child.id) : void 0
    };
  }
  fromObject(de, obj) {
    if (obj.description) {
      this.description = Comment.deserializeDisplayParts(
        de,
        obj.description
      );
    }
    if (obj.children) {
      de.defer((project) => {
        for (const childId of obj.children || []) {
          const child = project.getReflectionById(
            de.oldIdToNewId[childId] ?? -1
          );
          if (child?.isDeclaration() || child?.isDocument()) {
            this.children.push(child);
          }
        }
      });
    }
  }
};

// src/lib/models/ReflectionGroup.ts
var ReflectionGroup = class {
  /**
   * Create a new ReflectionGroup instance.
   *
   * @param title The title of this group.
   * @param owningReflection The reflection containing this group, useful for changing rendering based on a comment on a reflection.
   */
  constructor(title, owningReflection) {
    this.owningReflection = owningReflection;
    this.title = title;
  }
  owningReflection;
  /**
   * The title, a string representation of the typescript kind, of this group.
   */
  title;
  /**
   * User specified description via `@groupDescription`, if specified.
   */
  description;
  /**
   * All reflections of this group.
   */
  children = [];
  /**
   * Categories contained within this group.
   */
  categories;
  toObject(serializer) {
    return {
      title: this.title,
      description: this.description ? Comment.serializeDisplayParts(this.description) : void 0,
      children: this.children.length > 0 ? this.children.map((child) => child.id) : void 0,
      categories: serializer.toObjectsOptional(this.categories)
    };
  }
  fromObject(de, obj) {
    if (obj.description) {
      this.description = Comment.deserializeDisplayParts(
        de,
        obj.description
      );
    }
    if (obj.categories) {
      this.categories = obj.categories.map((catObj) => {
        const cat = new ReflectionCategory(catObj.title);
        de.fromObject(cat, catObj);
        return cat;
      });
    }
    if (obj.children) {
      de.defer((project) => {
        for (const childId of obj.children || []) {
          const child = project.getReflectionById(
            de.oldIdToNewId[childId] ?? -1
          );
          if (child?.isDeclaration() || child?.isDocument()) {
            this.children.push(child);
          }
        }
      });
    }
  }
};

// src/lib/models/ContainerReflection.ts
import { assertNever as assertNever2, removeIfPresent } from "#utils";
var ContainerReflection = class extends Reflection {
  /**
   * The children of this reflection. Do not add reflections to this array
   * manually. Instead call {@link addChild}.
   */
  children;
  /**
   * Documents associated with this reflection.
   *
   * These are not children as including them as children requires code handle both
   * types, despite being mostly unrelated and handled separately.
   *
   * Including them here in a separate array neatly handles that problem, but also
   * introduces another one for rendering. When rendering, documents should really
   * actually be considered part of the "children" of a reflection. For this reason,
   * we also maintain a list of child declarations with child documents which is used
   * when rendering.
   */
  documents;
  /**
   * Union of the {@link children} and {@link documents} arrays which dictates the
   * sort order for rendering.
   */
  childrenIncludingDocuments;
  /**
   * All children grouped by their kind.
   */
  groups;
  /**
   * All children grouped by their category.
   */
  categories;
  /**
   * Return a list of all children of a certain kind.
   *
   * @param kind  The desired kind of children.
   * @returns     An array containing all children with the desired kind.
   */
  getChildrenByKind(kind) {
    return (this.children || []).filter((child) => child.kindOf(kind));
  }
  addChild(child) {
    if (child.isDeclaration()) {
      this.children ||= [];
      this.children.push(child);
      this.childrenIncludingDocuments ||= [];
      this.childrenIncludingDocuments.push(child);
    } else if (child.isDocument()) {
      this.documents ||= [];
      this.documents.push(child);
      this.childrenIncludingDocuments ||= [];
      this.childrenIncludingDocuments.push(child);
    } else if (this.isDeclaration() && child.isSignature()) {
      switch (child.kind) {
        case 4096 /* CallSignature */:
        case 16384 /* ConstructorSignature */:
          this.signatures ||= [];
          this.signatures.push(child);
          break;
        case 8192 /* IndexSignature */:
          this.indexSignatures ||= [];
          this.indexSignatures.push(child);
          break;
        case 524288 /* GetSignature */:
        case 1048576 /* SetSignature */:
          throw new Error("Unsupported child type: " + ReflectionKind[child.kind]);
        default:
          assertNever2(child.kind);
      }
    } else {
      throw new Error("Unsupported child type: " + ReflectionKind[child.kind]);
    }
  }
  removeChild(child) {
    if (child.isDeclaration()) {
      removeIfPresent(this.children, child);
      if (this.children?.length === 0) {
        delete this.children;
      }
    } else {
      removeIfPresent(this.documents, child);
      if (this.documents?.length === 0) {
        delete this.documents;
      }
    }
    removeIfPresent(this.childrenIncludingDocuments, child);
    if (this.childrenIncludingDocuments?.length === 0) {
      delete this.childrenIncludingDocuments;
    }
  }
  isContainer() {
    return true;
  }
  traverse(callback) {
    for (const child of this.children?.slice() || []) {
      if (callback(child, 0 /* Children */) === false) {
        return;
      }
    }
    for (const child of this.documents?.slice() || []) {
      if (callback(child, 1 /* Documents */) === false) {
        return;
      }
    }
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      children: serializer.toObjectsOptional(this.children),
      documents: serializer.toObjectsOptional(this.documents),
      // If we only have one type of child, don't bother writing the duplicate info about
      // ordering with documents to the serialized file.
      childrenIncludingDocuments: this.children?.length && this.documents?.length ? this.childrenIncludingDocuments?.map((refl) => refl.id) : void 0,
      groups: serializer.toObjectsOptional(this.groups),
      categories: serializer.toObjectsOptional(this.categories)
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    this.children = de.reviveMany(obj.children, (child) => de.constructReflection(child));
    this.documents = de.reviveMany(obj.documents, (child) => de.constructReflection(child));
    const byId = /* @__PURE__ */ new Map();
    for (const child of this.children || []) {
      byId.set(child.id, child);
    }
    for (const child of this.documents || []) {
      byId.set(child.id, child);
    }
    for (const id of obj.childrenIncludingDocuments || []) {
      const child = byId.get(de.oldIdToNewId[id] ?? -1);
      if (child) {
        this.childrenIncludingDocuments ||= [];
        this.childrenIncludingDocuments.push(child);
        byId.delete(de.oldIdToNewId[id] ?? -1);
      }
    }
    if (byId.size) {
      this.childrenIncludingDocuments ||= [];
      this.childrenIncludingDocuments.push(...byId.values());
    }
    this.groups = de.reviveMany(
      obj.groups,
      (group) => new ReflectionGroup(group.title, this)
    );
    this.categories = de.reviveMany(
      obj.categories,
      (cat) => new ReflectionCategory(cat.title)
    );
  }
};

// src/lib/models/types.ts
import { i18n as i18n4, joinArray, NonEnumerable as NonEnumerable3 } from "#utils";
var Type = class {
  /**
   * Return a string representation of this type.
   */
  toString() {
    return this.stringify(TypeContext.none);
  }
  visit(visitor, ...args) {
    return visitor[this.type]?.(this, ...args);
  }
  stringify(context) {
    if (this.needsParenthesis(context)) {
      return `(${this.getTypeString()})`;
    }
    return this.getTypeString();
  }
  // Nothing to do for the majority of types.
  fromObject(_de, _obj) {
  }
  /**
   * Return the estimated size of the type if it was all printed on one line.
   */
  estimatePrintWidth() {
    return this.getTypeString().length;
  }
};
function makeRecursiveVisitor(visitor) {
  const recursiveVisitor = {
    namedTupleMember(type) {
      visitor.namedTupleMember?.(type);
      type.element.visit(recursiveVisitor);
    },
    templateLiteral(type) {
      visitor.templateLiteral?.(type);
      for (const [h] of type.tail) {
        h.visit(recursiveVisitor);
      }
    },
    array(type) {
      visitor.array?.(type);
      type.elementType.visit(recursiveVisitor);
    },
    conditional(type) {
      visitor.conditional?.(type);
      type.checkType.visit(recursiveVisitor);
      type.extendsType.visit(recursiveVisitor);
      type.trueType.visit(recursiveVisitor);
      type.falseType.visit(recursiveVisitor);
    },
    indexedAccess(type) {
      visitor.indexedAccess?.(type);
      type.indexType.visit(recursiveVisitor);
      type.objectType.visit(recursiveVisitor);
    },
    inferred(type) {
      visitor.inferred?.(type);
      type.constraint?.visit(recursiveVisitor);
    },
    intersection(type) {
      visitor.intersection?.(type);
      type.types.forEach((t) => t.visit(recursiveVisitor));
    },
    intrinsic(type) {
      visitor.intrinsic?.(type);
    },
    literal(type) {
      visitor.literal?.(type);
    },
    mapped(type) {
      visitor.mapped?.(type);
      type.nameType?.visit(recursiveVisitor);
      type.parameterType.visit(recursiveVisitor);
      type.templateType.visit(recursiveVisitor);
    },
    optional(type) {
      visitor.optional?.(type);
      type.elementType.visit(recursiveVisitor);
    },
    predicate(type) {
      visitor.predicate?.(type);
      type.targetType?.visit(recursiveVisitor);
    },
    query(type) {
      visitor.query?.(type);
      type.queryType.visit(recursiveVisitor);
    },
    reference(type) {
      visitor.reference?.(type);
      type.typeArguments?.forEach((t) => t.visit(recursiveVisitor));
    },
    reflection(type) {
      visitor.reflection?.(type);
    },
    rest(type) {
      visitor.rest?.(type);
      type.elementType.visit(recursiveVisitor);
    },
    tuple(type) {
      visitor.tuple?.(type);
      type.elements.forEach((t) => t.visit(recursiveVisitor));
    },
    typeOperator(type) {
      visitor.typeOperator?.(type);
      type.target.visit(recursiveVisitor);
    },
    union(type) {
      visitor.union?.(type);
      type.types.forEach((t) => t.visit(recursiveVisitor));
    },
    unknown(type) {
      visitor.unknown?.(type);
    }
  };
  return recursiveVisitor;
}
var TypeContext = {
  none: "none",
  templateLiteralElement: "templateLiteralElement",
  // `${here}`
  arrayElement: "arrayElement",
  // here[]
  indexedAccessElement: "indexedAccessElement",
  // {}[here]
  conditionalCheck: "conditionalCheck",
  // here extends 1 ? 2 : 3
  conditionalExtends: "conditionalExtends",
  // 1 extends here ? 2 : 3
  conditionalTrue: "conditionalTrue",
  // 1 extends 2 ? here : 3
  conditionalFalse: "conditionalFalse",
  // 1 extends 2 ? 3 : here
  indexedIndex: "indexedIndex",
  // {}[here]
  indexedObject: "indexedObject",
  // here[1]
  inferredConstraint: "inferredConstraint",
  // 1 extends infer X extends here ? 1 : 2
  intersectionElement: "intersectionElement",
  // here & 1
  mappedName: "mappedName",
  // { [k in string as here]: 1 }
  mappedParameter: "mappedParameter",
  // { [k in here]: 1 }
  mappedTemplate: "mappedTemplate",
  // { [k in string]: here }
  optionalElement: "optionalElement",
  // [here?]
  predicateTarget: "predicateTarget",
  // (): X is here
  queryTypeTarget: "queryTypeTarget",
  // typeof here, can only ever be a ReferenceType
  typeOperatorTarget: "typeOperatorTarget",
  // keyof here
  referenceTypeArgument: "referenceTypeArgument",
  // X<here>
  restElement: "restElement",
  // [...here]
  tupleElement: "tupleElement",
  // [here]
  unionElement: "unionElement"
  // here | 1
};
var ArrayType = class extends Type {
  /**
   * @param elementType The type of the elements in the array.
   */
  constructor(elementType) {
    super();
    this.elementType = elementType;
  }
  elementType;
  type = "array";
  getTypeString() {
    return this.elementType.stringify(TypeContext.arrayElement) + "[]";
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      elementType: serializer.toObject(this.elementType)
    };
  }
};
var ConditionalType = class extends Type {
  constructor(checkType, extendsType, trueType, falseType) {
    super();
    this.checkType = checkType;
    this.extendsType = extendsType;
    this.trueType = trueType;
    this.falseType = falseType;
  }
  checkType;
  extendsType;
  trueType;
  falseType;
  type = "conditional";
  getTypeString() {
    return [
      this.checkType.stringify(TypeContext.conditionalCheck),
      "extends",
      this.extendsType.stringify(TypeContext.conditionalExtends),
      "?",
      this.trueType.stringify(TypeContext.conditionalTrue),
      ":",
      this.falseType.stringify(TypeContext.conditionalFalse)
    ].join(" ");
  }
  needsParenthesis(context) {
    const map = {
      none: false,
      templateLiteralElement: false,
      arrayElement: true,
      indexedAccessElement: false,
      conditionalCheck: true,
      conditionalExtends: true,
      conditionalTrue: false,
      conditionalFalse: false,
      indexedIndex: false,
      indexedObject: true,
      inferredConstraint: true,
      intersectionElement: true,
      mappedName: false,
      mappedParameter: false,
      mappedTemplate: false,
      optionalElement: true,
      predicateTarget: false,
      queryTypeTarget: false,
      typeOperatorTarget: true,
      referenceTypeArgument: false,
      restElement: true,
      tupleElement: false,
      unionElement: true
    };
    return map[context];
  }
  toObject(serializer) {
    return {
      type: this.type,
      checkType: serializer.toObject(this.checkType),
      extendsType: serializer.toObject(this.extendsType),
      trueType: serializer.toObject(this.trueType),
      falseType: serializer.toObject(this.falseType)
    };
  }
};
var IndexedAccessType = class extends Type {
  constructor(objectType, indexType) {
    super();
    this.objectType = objectType;
    this.indexType = indexType;
  }
  objectType;
  indexType;
  type = "indexedAccess";
  getTypeString() {
    return [
      this.objectType.stringify(TypeContext.indexedObject),
      "[",
      this.indexType.stringify(TypeContext.indexedIndex),
      "]"
    ].join("");
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      indexType: serializer.toObject(this.indexType),
      objectType: serializer.toObject(this.objectType)
    };
  }
};
var InferredType = class extends Type {
  constructor(name, constraint) {
    super();
    this.name = name;
    this.constraint = constraint;
  }
  name;
  constraint;
  type = "inferred";
  getTypeString() {
    if (this.constraint) {
      return `infer ${this.name} extends ${this.constraint.stringify(
        TypeContext.inferredConstraint
      )}`;
    }
    return `infer ${this.name}`;
  }
  needsParenthesis(context) {
    const map = {
      none: false,
      templateLiteralElement: false,
      arrayElement: true,
      indexedAccessElement: false,
      conditionalCheck: false,
      conditionalExtends: false,
      conditionalTrue: false,
      conditionalFalse: false,
      indexedIndex: false,
      indexedObject: true,
      inferredConstraint: false,
      intersectionElement: false,
      mappedName: false,
      mappedParameter: false,
      mappedTemplate: false,
      optionalElement: true,
      predicateTarget: false,
      queryTypeTarget: false,
      typeOperatorTarget: false,
      referenceTypeArgument: false,
      restElement: true,
      tupleElement: false,
      unionElement: false
    };
    return map[context];
  }
  toObject(serializer) {
    return {
      type: this.type,
      name: this.name,
      constraint: serializer.toObject(this.constraint)
    };
  }
};
var IntersectionType = class extends Type {
  constructor(types) {
    super();
    this.types = types;
  }
  types;
  type = "intersection";
  getTypeString() {
    return this.types.map((t) => t.stringify(TypeContext.intersectionElement)).join(" & ");
  }
  needsParenthesis(context) {
    const map = {
      none: false,
      templateLiteralElement: false,
      arrayElement: true,
      indexedAccessElement: false,
      conditionalCheck: true,
      conditionalExtends: false,
      conditionalTrue: false,
      conditionalFalse: false,
      indexedIndex: false,
      indexedObject: true,
      inferredConstraint: false,
      intersectionElement: false,
      mappedName: false,
      mappedParameter: false,
      mappedTemplate: false,
      optionalElement: true,
      predicateTarget: false,
      queryTypeTarget: false,
      typeOperatorTarget: true,
      referenceTypeArgument: false,
      restElement: true,
      tupleElement: false,
      unionElement: false
    };
    return map[context];
  }
  toObject(serializer) {
    return {
      type: this.type,
      types: this.types.map((t) => serializer.toObject(t))
    };
  }
};
var IntrinsicType = class extends Type {
  constructor(name) {
    super();
    this.name = name;
  }
  name;
  type = "intrinsic";
  getTypeString() {
    return this.name;
  }
  toObject() {
    return {
      type: this.type,
      name: this.name
    };
  }
  needsParenthesis() {
    return false;
  }
};
var LiteralType = class extends Type {
  constructor(value) {
    super();
    this.value = value;
  }
  value;
  type = "literal";
  /**
   * Return a string representation of this type.
   */
  getTypeString() {
    if (typeof this.value === "bigint") {
      return this.value.toString() + "n";
    }
    return JSON.stringify(this.value);
  }
  needsParenthesis() {
    return false;
  }
  toObject() {
    if (typeof this.value === "bigint") {
      return {
        type: this.type,
        value: {
          value: this.value.toString().replace("-", ""),
          negative: this.value < BigInt("0")
        }
      };
    }
    return {
      type: this.type,
      value: this.value
    };
  }
};
var MappedType = class extends Type {
  constructor(parameter, parameterType, templateType, readonlyModifier, optionalModifier, nameType) {
    super();
    this.parameter = parameter;
    this.parameterType = parameterType;
    this.templateType = templateType;
    this.readonlyModifier = readonlyModifier;
    this.optionalModifier = optionalModifier;
    this.nameType = nameType;
  }
  parameter;
  parameterType;
  templateType;
  readonlyModifier;
  optionalModifier;
  nameType;
  type = "mapped";
  getTypeString() {
    const read = {
      "+": "readonly ",
      "-": "-readonly ",
      "": ""
    }[this.readonlyModifier ?? ""];
    const opt = {
      "+": "?",
      "-": "-?",
      "": ""
    }[this.optionalModifier ?? ""];
    const parts = [
      "{ ",
      read,
      "[",
      this.parameter,
      " in ",
      this.parameterType.stringify(TypeContext.mappedParameter)
    ];
    if (this.nameType) {
      parts.push(" as ", this.nameType.stringify(TypeContext.mappedName));
    }
    parts.push(
      "]",
      opt,
      ": ",
      this.templateType.stringify(TypeContext.mappedTemplate),
      " }"
    );
    return parts.join("");
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      parameter: this.parameter,
      parameterType: serializer.toObject(this.parameterType),
      templateType: serializer.toObject(this.templateType),
      readonlyModifier: this.readonlyModifier,
      optionalModifier: this.optionalModifier,
      nameType: serializer.toObject(this.nameType)
    };
  }
};
var OptionalType = class extends Type {
  constructor(elementType) {
    super();
    this.elementType = elementType;
  }
  elementType;
  type = "optional";
  getTypeString() {
    return this.elementType.stringify(TypeContext.optionalElement) + "?";
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      elementType: serializer.toObject(this.elementType)
    };
  }
};
var PredicateType = class extends Type {
  /**
   * Create a new PredicateType instance.
   *
   * @param name The identifier name which is tested by the predicate.
   * @param asserts True if the type is of the form `asserts val is string`,
   *                false if the type is of the form `val is string`
   * @param targetType The type that the identifier is tested to be.
   *                   May be undefined if the type is of the form `asserts val`.
   *                   Will be defined if the type is of the form `asserts val is string` or `val is string`.
   */
  constructor(name, asserts, targetType) {
    super();
    this.name = name;
    this.asserts = asserts;
    this.targetType = targetType;
  }
  name;
  asserts;
  targetType;
  type = "predicate";
  /**
   * Return a string representation of this type.
   */
  getTypeString() {
    const out = this.asserts ? ["asserts", this.name] : [this.name];
    if (this.targetType) {
      out.push(
        "is",
        this.targetType.stringify(TypeContext.predicateTarget)
      );
    }
    return out.join(" ");
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      name: this.name,
      asserts: this.asserts,
      targetType: serializer.toObject(this.targetType)
    };
  }
};
var QueryType = class extends Type {
  constructor(queryType) {
    super();
    this.queryType = queryType;
  }
  queryType;
  type = "query";
  getTypeString() {
    return `typeof ${this.queryType.stringify(
      TypeContext.queryTypeTarget
    )}`;
  }
  /**
   * @privateRemarks
   * An argument could be made that this ought to return true for indexedObject
   * since precedence is different than on the value side... if someone really cares
   * they can easily use a custom theme to change this.
   */
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      queryType: serializer.toObject(this.queryType)
    };
  }
};
var __project_dec, _a, _init3;
var _ReferenceType = class _ReferenceType extends (_a = Type, __project_dec = [NonEnumerable3], _a) {
  constructor(name, target, project, qualifiedName) {
    super();
    __publicField(this, "type", "reference");
    /**
     * The name of the referenced type.
     *
     * If the symbol cannot be found because it's not part of the documentation this
     * can be used to represent the type.
     */
    __publicField(this, "name");
    /**
     * The type arguments of this reference.
     */
    __publicField(this, "typeArguments");
    /**
     * Sometimes a few properties are more important than the rest
     * of the properties within a type. This occurs most often with
     * object parameters, where users want to specify `@param foo.bar`
     * to highlight something about the `bar` property.
     *
     * Does NOT support nested properties.
     */
    __publicField(this, "highlightedProperties");
    /**
     * The fully qualified name of the referenced type, relative to the file it is defined in.
     * This will usually be the same as `name`, unless namespaces are used.
     */
    __publicField(this, "qualifiedName");
    /**
     * The package that this type is referencing.
     */
    __publicField(this, "package");
    /**
     * If this reference type refers to a reflection defined by a project not being rendered,
     * points to the url that this type should be linked to.
     */
    __publicField(this, "externalUrl");
    /**
     * If set, no warnings about something not being exported should be created
     * since this may be referring to a type created with `infer X` which will not
     * be registered on the project.
     */
    __publicField(this, "refersToTypeParameter", false);
    /**
     * If set, will prefer reflections with {@link ReflectionKind | ReflectionKinds} which represent
     * values rather than those which represent types.
     */
    __publicField(this, "preferValues", false);
    __publicField(this, "_target");
    __publicField(this, "_project", __runInitializers(_init3, 8, this)), __runInitializers(_init3, 11, this);
    this.name = name;
    if (typeof target === "number") {
      this._target = target;
    } else {
      this._target = "variant" in target ? target.id : target;
    }
    this._project = project;
    this.qualifiedName = qualifiedName;
  }
  /**
   * The resolved reflection.
   */
  get reflection() {
    if (typeof this._target === "number") {
      return this._project?.getReflectionById(this._target);
    }
    const resolvePotential = this._project?.getReflectionsFromSymbolId(
      this._target
    );
    if (!resolvePotential?.length) {
      return;
    }
    const kind = this.preferValues ? ReflectionKind.ValueReferenceTarget : ReflectionKind.TypeReferenceTarget;
    const resolved = resolvePotential.find((refl) => refl.kindOf(kind)) || resolvePotential.find((refl) => refl.kindOf(~kind));
    return resolved;
  }
  /**
   * If not resolved, the symbol id of the reflection, otherwise undefined.
   */
  get symbolId() {
    if (!this.reflection && typeof this._target === "object") {
      return this._target;
    }
  }
  /**
   * Checks if this type is a reference type because it uses a name, but is intentionally not pointing
   * to a reflection. This happens for type parameters and when representing a mapped type.
   */
  isIntentionallyBroken() {
    if (typeof this._target === "object" && this._project?.symbolIdHasBeenRemoved(this._target)) {
      return true;
    }
    return this._target === -1 || this.refersToTypeParameter;
  }
  /**
   * Convert this reference type to a declaration reference used for resolution of external types.
   */
  toDeclarationReference() {
    return {
      resolutionStart: "global",
      moduleSource: this.package,
      symbolReference: {
        path: this.qualifiedName.split(".").map((p) => ({ path: p, navigation: "." }))
      }
    };
  }
  static createUnresolvedReference(name, target, project, qualifiedName) {
    return new _ReferenceType(name, target, project, qualifiedName);
  }
  static createResolvedReference(name, target, project) {
    return new _ReferenceType(name, target, project, name);
  }
  /**
   * This is used for type parameters, which don't actually point to something,
   * and also for temporary references which will be cleaned up with real references
   * later during conversion.
   * @internal
   */
  static createBrokenReference(name, project, packageName) {
    const ref = new _ReferenceType(name, -1, project, name);
    ref.package = packageName;
    return ref;
  }
  getTypeString() {
    const name = this.reflection ? this.reflection.name : this.name;
    let typeArgs = "";
    if (this.typeArguments && this.typeArguments.length > 0) {
      typeArgs += "<";
      typeArgs += this.typeArguments.map((arg) => arg.stringify(TypeContext.referenceTypeArgument)).join(", ");
      typeArgs += ">";
    }
    return name + typeArgs;
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    let target;
    if (typeof this._target === "number") {
      target = this._target;
    } else if (this._project?.symbolIdHasBeenRemoved(this._target)) {
      target = -1;
    } else if (this.reflection) {
      target = this.reflection.id;
    } else {
      target = this._target.toObject();
    }
    const result = {
      type: this.type,
      target,
      typeArguments: serializer.toObjectsOptional(this.typeArguments),
      name: this.name,
      package: this.package,
      externalUrl: this.externalUrl
    };
    if (this.name !== this.qualifiedName) {
      result.qualifiedName = this.qualifiedName;
    }
    if (this.refersToTypeParameter) {
      result.refersToTypeParameter = true;
    }
    if (typeof target !== "number" && this.preferValues) {
      result.preferValues = true;
    }
    if (this.highlightedProperties) {
      result.highlightedProperties = Object.fromEntries(
        Array.from(
          this.highlightedProperties.entries(),
          ([key, parts]) => {
            return [
              key,
              Comment.serializeDisplayParts(parts)
            ];
          }
        )
      );
    }
    return result;
  }
  fromObject(de, obj) {
    this.typeArguments = de.reviveMany(obj.typeArguments, (t) => de.constructType(t));
    if (typeof obj.target === "number") {
      if (obj.target === -1) {
        this._target = -1;
      } else {
        de.defer((project) => {
          const target = project.getReflectionById(
            de.oldIdToNewId[obj.target] ?? -1
          );
          if (target) {
            this._project = project;
            this._target = target.id;
          } else {
            de.logger.warn(
              i18n4.serialized_project_referenced_0_not_part_of_project(
                JSON.stringify(obj.target)
              )
            );
          }
        });
      }
    } else {
      this._project = de.project;
      this._target = new ReflectionSymbolId(obj.target);
    }
    this.qualifiedName = obj.qualifiedName ?? obj.name;
    this.package = obj.package;
    this.refersToTypeParameter = !!obj.refersToTypeParameter;
    this.preferValues = !!obj.preferValues;
    if (obj.highlightedProperties) {
      this.highlightedProperties = /* @__PURE__ */ new Map();
      for (const [key, parts] of Object.entries(
        obj.highlightedProperties
      )) {
        this.highlightedProperties.set(
          key,
          Comment.deserializeDisplayParts(de, parts)
        );
      }
    }
  }
};
_init3 = __decoratorStart(_a);
__decorateElement(_init3, 5, "_project", __project_dec, _ReferenceType);
__decoratorMetadata(_init3, _ReferenceType);
var ReferenceType = _ReferenceType;
var ReflectionType = class extends Type {
  constructor(declaration) {
    super();
    this.declaration = declaration;
  }
  declaration;
  type = "reflection";
  getTypeString() {
    const parts = [];
    const sigs = this.declaration.getNonIndexSignatures();
    for (const sig of sigs) {
      parts.push(sigStr(sig, ": "));
    }
    for (const p of this.declaration.children || []) {
      parts.push(`${p.name}${propertySep(p)} ${typeStr(p.type)}`);
    }
    for (const s of this.declaration.indexSignatures || []) {
      parts.push(sigStr(s, ": ", "[]"));
    }
    if (sigs.length === 1 && parts.length === 1) {
      return sigStr(sigs[0], " => ");
    }
    if (parts.length === 0) {
      return "{}";
    }
    return `{ ${parts.join("; ")} }`;
  }
  needsParenthesis(where) {
    if (this.declaration.children || this.declaration.indexSignatures) {
      return false;
    }
    if (this.declaration.signatures?.length === 1) {
      return where === TypeContext.arrayElement || where === TypeContext.unionElement;
    }
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      declaration: serializer.toObject(this.declaration)
    };
  }
};
var RestType = class extends Type {
  constructor(elementType) {
    super();
    this.elementType = elementType;
  }
  elementType;
  type = "rest";
  getTypeString() {
    return `...${this.elementType.stringify(TypeContext.restElement)}`;
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      elementType: serializer.toObject(this.elementType)
    };
  }
};
var TemplateLiteralType = class extends Type {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
  head;
  tail;
  type = "templateLiteral";
  getTypeString() {
    return [
      "`",
      this.head,
      ...this.tail.map(([type, text]) => {
        return "${" + type.stringify(TypeContext.templateLiteralElement) + "}" + text;
      }),
      "`"
    ].join("");
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      head: this.head,
      tail: this.tail.map(([type, text]) => [
        serializer.toObject(type),
        text
      ])
    };
  }
};
var TupleType = class extends Type {
  /**
   * @param elements The ordered type elements of the tuple type.
   */
  constructor(elements) {
    super();
    this.elements = elements;
  }
  elements;
  type = "tuple";
  getTypeString() {
    return "[" + this.elements.map((t) => t.stringify(TypeContext.tupleElement)).join(", ") + "]";
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      elements: serializer.toObjectsOptional(this.elements)
    };
  }
};
var NamedTupleMember = class extends Type {
  constructor(name, isOptional, element) {
    super();
    this.name = name;
    this.isOptional = isOptional;
    this.element = element;
  }
  name;
  isOptional;
  element;
  type = "namedTupleMember";
  /**
   * Return a string representation of this type.
   */
  getTypeString() {
    return `${this.name}${this.isOptional ? "?" : ""}: ${this.element.stringify(TypeContext.tupleElement)}`;
  }
  needsParenthesis() {
    return false;
  }
  toObject(serializer) {
    return {
      type: this.type,
      name: this.name,
      isOptional: this.isOptional,
      element: serializer.toObject(this.element)
    };
  }
};
var TypeOperatorType = class extends Type {
  constructor(target, operator) {
    super();
    this.target = target;
    this.operator = operator;
  }
  target;
  operator;
  type = "typeOperator";
  getTypeString() {
    return `${this.operator} ${this.target.stringify(
      TypeContext.typeOperatorTarget
    )}`;
  }
  needsParenthesis(context) {
    const map = {
      none: false,
      templateLiteralElement: false,
      arrayElement: true,
      indexedAccessElement: false,
      conditionalCheck: false,
      conditionalExtends: false,
      conditionalTrue: false,
      conditionalFalse: false,
      indexedIndex: false,
      indexedObject: true,
      inferredConstraint: false,
      intersectionElement: false,
      mappedName: false,
      mappedParameter: false,
      mappedTemplate: false,
      optionalElement: true,
      predicateTarget: false,
      queryTypeTarget: false,
      typeOperatorTarget: false,
      referenceTypeArgument: false,
      restElement: false,
      tupleElement: false,
      unionElement: false
    };
    return map[context];
  }
  toObject(serializer) {
    return {
      type: this.type,
      operator: this.operator,
      target: serializer.toObject(this.target)
    };
  }
};
var UnionType = class extends Type {
  constructor(types) {
    super();
    this.types = types;
  }
  types;
  type = "union";
  /**
   * If present, there should be as many items in this array as there are items in the {@link types} array.
   *
   * This member is only valid on unions which are on {@link DeclarationReflection.type | DeclarationReflection.type} with a
   * {@link ReflectionKind} `kind` of `TypeAlias`. Specifying it on any other union is undefined behavior.
   */
  elementSummaries;
  getTypeString() {
    return this.types.map((t) => t.stringify(TypeContext.unionElement)).join(" | ");
  }
  needsParenthesis(context) {
    const map = {
      none: false,
      templateLiteralElement: false,
      arrayElement: true,
      indexedAccessElement: false,
      conditionalCheck: true,
      conditionalExtends: false,
      conditionalTrue: false,
      conditionalFalse: false,
      indexedIndex: false,
      indexedObject: true,
      inferredConstraint: false,
      intersectionElement: true,
      mappedName: false,
      mappedParameter: false,
      mappedTemplate: false,
      optionalElement: true,
      predicateTarget: false,
      queryTypeTarget: false,
      typeOperatorTarget: true,
      referenceTypeArgument: false,
      restElement: false,
      tupleElement: false,
      unionElement: false
    };
    return map[context];
  }
  fromObject(de, obj) {
    if (obj.elementSummaries) {
      this.elementSummaries = obj.elementSummaries.map((parts) => Comment.deserializeDisplayParts(de, parts));
    }
  }
  toObject(serializer) {
    return {
      type: this.type,
      types: this.types.map((t) => serializer.toObject(t)),
      elementSummaries: this.elementSummaries?.map((parts) => Comment.serializeDisplayParts(parts))
    };
  }
};
var UnknownType = class extends Type {
  type = "unknown";
  /**
   * A string representation of the type as returned from TypeScript compiler.
   */
  name;
  constructor(name) {
    super();
    this.name = name;
  }
  getTypeString() {
    return this.name;
  }
  /**
   * Always returns true if not at the root level, we have no idea what's in here, so wrap it in parenthesis
   * to be extra safe.
   */
  needsParenthesis(context) {
    return context !== TypeContext.none;
  }
  toObject() {
    return {
      type: this.type,
      name: this.name
    };
  }
};
function propertySep(refl) {
  return refl.flags.isOptional ? "?:" : ":";
}
function typeStr(type) {
  return type?.toString() ?? "any";
}
function sigStr(sig, sep, brackets = "()") {
  const params = joinArray(
    sig.parameters,
    ", ",
    (p) => `${p.name}${propertySep(p)} ${typeStr(p.type)}`
  );
  return `${brackets[0]}${params}${brackets[1]}${sep}${typeStr(sig.type)}`;
}

// src/lib/models/SourceReference.ts
var SourceReference = class {
  /**
   * The filename of the source file.
   * This will initially be absolute before being overwritten with a base path relative path during resolution.
   */
  fileName;
  /**
   * The absolute filename of the source file.
   * @internal
   */
  fullFileName;
  /**
   * The one based number of the line that emitted the declaration.
   */
  line;
  /**
   * The index of the character that emitted the declaration.
   */
  character;
  /**
   * URL for displaying the source file.
   */
  url;
  constructor(fileName, line, character) {
    this.fileName = fileName;
    this.fullFileName = fileName;
    this.line = line;
    this.character = character;
  }
  equals(other) {
    return this.fullFileName == other.fullFileName && this.line === other.line && this.character === other.character;
  }
  toObject() {
    return {
      fileName: this.fileName,
      line: this.line,
      character: this.character,
      url: this.url
    };
  }
  fromObject(_de, obj) {
    this.url = obj.url;
  }
};

// src/lib/models/DeclarationReflection.ts
import { i18n as i18n5 } from "#utils";
var DeclarationReflection = class extends ContainerReflection {
  variant = "declaration";
  /**
   * A list of all source files that contributed to this reflection.
   */
  sources;
  /**
   * Precomputed boost for search results, may be less than 1 to de-emphasize this member in search results.
   * Does NOT include group/category values as they are computed when building the JS index.
   *
   * This is exposed purely for plugin use, see #3036 for details.
   */
  relevanceBoost;
  /**
   * The escaped name of this declaration assigned by the TS compiler if there is an associated symbol.
   * This is used to retrieve properties for analyzing inherited members.
   *
   * Not serialized, only useful during conversion. This is a `ts.__String`.
   * @internal
   */
  escapedName;
  /**
   * The type of the reflection.
   *
   * If the reflection represents a variable or a property, this is the value type.<br />
   * If the reflection represents a signature, this is the return type.
   */
  type;
  typeParameters;
  /**
   * A list of call signatures attached to this declaration.
   *
   * TypeDoc creates one declaration per function that may contain one or more
   * signature reflections.
   */
  signatures;
  /**
   * The index signature of this declaration.
   */
  indexSignatures;
  /**
   * The get signature of this declaration.
   */
  getSignature;
  /**
   * The set signature of this declaration.
   */
  setSignature;
  /**
   * The default value of this reflection.
   *
   * Applies to function parameters, variables, and properties.
   */
  defaultValue;
  /**
   * A type that points to the reflection that has been overwritten by this reflection.
   *
   * Applies to interface and class members.
   */
  overwrites;
  /**
   * A type that points to the reflection this reflection has been inherited from.
   *
   * Applies to interface and class members.
   */
  inheritedFrom;
  /**
   * A type that points to the reflection this reflection is the implementation of.
   *
   * Applies to class members.
   */
  implementationOf;
  /**
   * A list of all types this reflection extends (e.g. the parent classes).
   */
  extendedTypes;
  /**
   * A list of all types that extend this reflection (e.g. the subclasses).
   */
  extendedBy;
  /**
   * A list of all types this reflection implements.
   */
  implementedTypes;
  /**
   * A list of all types that implement this reflection.
   */
  implementedBy;
  /**
   * Contains a simplified representation of the type hierarchy suitable for being
   * rendered in templates.
   */
  typeHierarchy;
  /**
   * The contents of the readme file of the module when found.
   */
  readme;
  /**
   * The version of the module when found.
   */
  packageVersion;
  isDeclaration() {
    return true;
  }
  hasGetterOrSetter() {
    return !!this.getSignature || !!this.setSignature;
  }
  getAllSignatures() {
    let result = [];
    if (this.signatures) {
      result = result.concat(this.signatures);
    }
    if (this.indexSignatures) {
      result = result.concat(this.indexSignatures);
    }
    if (this.getSignature) {
      result.push(this.getSignature);
    }
    if (this.setSignature) {
      result.push(this.setSignature);
    }
    return result;
  }
  getNonIndexSignatures() {
    return [].concat(
      this.signatures ?? [],
      this.setSignature ?? [],
      this.getSignature ?? []
    );
  }
  getProperties() {
    if (this.children?.length) {
      return this.children;
    }
    if (this.type?.type === "reflection") {
      return this.type.declaration.children ?? [];
    }
    return [];
  }
  getChildOrTypePropertyByName(path) {
    if (this.type?.type === "reflection") {
      for (const child of this.type.declaration.children || []) {
        if (path[0] === child.name) {
          if (path.length === 1) {
            return child;
          }
          return child.getChildOrTypePropertyByName(path.slice(1));
        }
      }
    }
    for (const child of this.children || []) {
      if (path[0] === child.name) {
        if (path.length === 1) {
          return child;
        }
        return child.getChildOrTypePropertyByName(path.slice(1));
      }
    }
    return void 0;
  }
  traverse(callback) {
    for (const parameter of this.typeParameters?.slice() || []) {
      if (callback(parameter, 4 /* TypeParameter */) === false) {
        return;
      }
    }
    if (this.type instanceof ReflectionType) {
      if (callback(
        this.type.declaration,
        3 /* TypeLiteral */
      ) === false) {
        return;
      }
    }
    for (const signature of this.signatures?.slice() || []) {
      if (callback(signature, 5 /* Signatures */) === false) {
        return;
      }
    }
    for (const signature of this.indexSignatures?.slice() || []) {
      if (callback(signature, 6 /* IndexSignature */) === false) {
        return;
      }
    }
    if (this.getSignature) {
      if (callback(this.getSignature, 7 /* GetSignature */) === false) {
        return;
      }
    }
    if (this.setSignature) {
      if (callback(this.setSignature, 8 /* SetSignature */) === false) {
        return;
      }
    }
    super.traverse(callback);
  }
  /**
   * Return a string representation of this reflection.
   */
  toString() {
    let result = super.toString();
    if (this.typeParameters) {
      const parameters = this.typeParameters.map(
        (parameter) => parameter.name
      );
      result += "<" + parameters.join(", ") + ">";
    }
    if (this.type) {
      result += ": " + this.type.toString();
    }
    return result;
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      variant: this.variant,
      packageVersion: this.packageVersion,
      sources: serializer.toObjectsOptional(this.sources),
      relevanceBoost: this.relevanceBoost === 1 ? void 0 : this.relevanceBoost,
      typeParameters: serializer.toObjectsOptional(this.typeParameters),
      type: serializer.toObject(this.type),
      signatures: serializer.toObjectsOptional(this.signatures),
      indexSignatures: serializer.toObjectsOptional(this.indexSignatures),
      getSignature: serializer.toObject(this.getSignature),
      setSignature: serializer.toObject(this.setSignature),
      defaultValue: this.defaultValue,
      overwrites: serializer.toObject(this.overwrites),
      inheritedFrom: serializer.toObject(this.inheritedFrom),
      implementationOf: serializer.toObject(this.implementationOf),
      extendedTypes: serializer.toObjectsOptional(this.extendedTypes),
      extendedBy: serializer.toObjectsOptional(this.extendedBy),
      implementedTypes: serializer.toObjectsOptional(
        this.implementedTypes
      ),
      implementedBy: serializer.toObjectsOptional(this.implementedBy),
      readme: Comment.serializeDisplayParts(this.readme)
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    if (obj.readme) {
      this.readme = Comment.deserializeDisplayParts(de, obj.readme);
    }
    if (obj.variant === "project") {
      this.kind = 2 /* Module */;
      this.packageVersion = obj.packageVersion;
      this.project.files.fromObject(de, obj.files || {});
      de.defer(() => {
        for (const [id, sid] of Object.entries(obj.symbolIdMap || {})) {
          const refl = this.project.getReflectionById(
            de.oldIdToNewId[+id] ?? -1
          );
          if (refl) {
            this.project.registerSymbolId(
              refl,
              new ReflectionSymbolId(sid)
            );
          } else {
            de.logger.warn(i18n5.serialized_project_referenced_0_not_part_of_project(id));
          }
        }
      });
      return;
    }
    this.packageVersion = obj.packageVersion;
    this.sources = de.reviveMany(
      obj.sources,
      (src) => new SourceReference(src.fileName, src.line, src.character)
    );
    this.relevanceBoost = obj.relevanceBoost;
    this.typeParameters = de.reviveMany(obj.typeParameters, (tp) => de.constructReflection(tp));
    this.type = de.revive(obj.type, (t) => de.constructType(t));
    this.signatures = de.reviveMany(obj.signatures, (r) => de.constructReflection(r));
    this.indexSignatures = de.reviveMany(obj.indexSignatures, (r) => de.constructReflection(r));
    this.getSignature = de.revive(obj.getSignature, (r) => de.constructReflection(r));
    this.setSignature = de.revive(obj.setSignature, (r) => de.constructReflection(r));
    this.defaultValue = obj.defaultValue;
    this.overwrites = de.reviveType(obj.overwrites);
    this.inheritedFrom = de.reviveType(obj.inheritedFrom);
    this.implementationOf = de.reviveType(obj.implementationOf);
    this.extendedTypes = de.reviveMany(obj.extendedTypes, (t) => de.reviveType(t));
    this.extendedBy = de.reviveMany(obj.extendedBy, (t) => de.reviveType(t));
    this.implementedTypes = de.reviveMany(obj.implementedTypes, (t) => de.reviveType(t));
    this.implementedBy = de.reviveMany(obj.implementedBy, (t) => de.reviveType(t));
  }
};

// src/lib/models/DocumentReflection.ts
var DocumentReflection = class extends Reflection {
  variant = "document";
  /**
   * The content to be displayed on the page for this reflection.
   */
  content;
  /**
   * Frontmatter included in document
   */
  frontmatter;
  /**
   * A precomputed boost derived from the searchCategoryBoosts and searchGroupBoosts options, used when
   * boosting search relevance scores at runtime. May be modified by plugins.
   */
  relevanceBoost;
  /**
   * Child documents, if any are present.
   */
  children;
  constructor(name, parent, content, frontmatter) {
    super(name, 8388608 /* Document */, parent);
    this.content = content;
    this.frontmatter = frontmatter;
    if (typeof frontmatter["title"] === "string") {
      this.name = frontmatter["title"];
      delete frontmatter["title"];
    }
  }
  addChild(child) {
    this.children ||= [];
    this.children.push(child);
  }
  isDocument() {
    return true;
  }
  traverse(callback) {
    for (const child of this.children || []) {
      if (callback(child, 1 /* Documents */) === false) {
        return;
      }
    }
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      variant: this.variant,
      content: Comment.serializeDisplayParts(this.content),
      frontmatter: this.frontmatter,
      relevanceBoost: this.relevanceBoost,
      children: serializer.toObjectsOptional(this.children)
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    this.content = Comment.deserializeDisplayParts(de, obj.content);
    this.frontmatter = obj.frontmatter;
    this.relevanceBoost = obj.relevanceBoost;
    this.children = de.reviveMany(obj.children, (obj2) => de.constructReflection(obj2));
  }
};

// src/lib/models/FileRegistry.ts
import { NormalizedPathUtils } from "#utils";
var FileRegistry = class {
  nextId = 1;
  // The combination of these two make up the registry
  mediaToReflection = /* @__PURE__ */ new Map();
  mediaToPath = /* @__PURE__ */ new Map();
  reflectionToPath = /* @__PURE__ */ new Map();
  pathToMedia = /* @__PURE__ */ new Map();
  // Lazily created as we get names for rendering
  names = /* @__PURE__ */ new Map();
  nameUsage = /* @__PURE__ */ new Map();
  registerAbsolute(absolute) {
    const anchorIndex = absolute.indexOf("#");
    let anchor = void 0;
    if (anchorIndex !== -1) {
      anchor = absolute.substring(anchorIndex + 1);
      absolute = absolute.substring(0, anchorIndex);
    }
    const existing = this.pathToMedia.get(absolute);
    if (existing) {
      return { target: existing, anchor };
    }
    this.mediaToPath.set(this.nextId, absolute);
    this.pathToMedia.set(absolute, this.nextId);
    return { target: this.nextId++, anchor };
  }
  /**
   * Registers the specified path as the canonical file for this reflection
   */
  registerReflection(absolute, reflection) {
    const { target } = this.registerAbsolute(absolute);
    this.reflectionToPath.set(reflection.id, absolute);
    this.mediaToReflection.set(target, reflection.id);
  }
  /**
   * Registers the specified path as a path which should be resolved to the specified
   * reflection. A reflection *may* be associated with multiple paths.
   */
  registerReflectionPath(absolute, reflection) {
    const { target } = this.registerAbsolute(absolute);
    this.mediaToReflection.set(target, reflection.id);
  }
  getReflectionPath(reflection) {
    return this.reflectionToPath.get(reflection.id);
  }
  register(sourcePath, relativePath) {
    return this.registerAbsolute(
      NormalizedPathUtils.resolve(NormalizedPathUtils.dirname(sourcePath), relativePath)
    );
  }
  removeReflection(reflection) {
    const absolute = this.reflectionToPath.get(reflection.id);
    if (absolute) {
      const media = this.pathToMedia.get(absolute);
      this.mediaToReflection.delete(media);
    }
  }
  resolve(id, project) {
    const reflId = this.mediaToReflection.get(id);
    if (typeof reflId === "number") {
      return project.getReflectionById(reflId);
    }
    return this.mediaToPath.get(id);
  }
  resolvePath(id) {
    return this.mediaToPath.get(id);
  }
  getName(id) {
    const absolute = this.mediaToPath.get(id);
    if (!absolute) return;
    if (this.names.has(id)) {
      return this.names.get(id);
    }
    const file = NormalizedPathUtils.basename(absolute);
    if (!this.nameUsage.has(file)) {
      this.nameUsage.set(file, 1);
      this.names.set(id, file);
    } else {
      const { name, ext } = NormalizedPathUtils.splitFilename(file);
      let counter = this.nameUsage.get(file);
      while (this.nameUsage.has(`${name}-${counter}${ext}`)) {
        ++counter;
      }
      this.nameUsage.set(file, counter + 1);
      this.nameUsage.set(`${name}-${counter}${ext}`, counter + 1);
      this.names.set(id, `${name}-${counter}${ext}`);
    }
    return this.names.get(id);
  }
  /**
   * Iterate over all registered media file paths, yielding entries
   * that do NOT have an associated reflection.
   */
  getMediaPaths() {
    const result = [];
    for (const [id, path] of this.mediaToPath.entries()) {
      if (!this.mediaToReflection.has(id)) {
        result.push(path);
      }
    }
    return result;
  }
  getNameToAbsoluteMap() {
    const result = /* @__PURE__ */ new Map();
    for (const [id, name] of this.names.entries()) {
      result.set(name, this.mediaToPath.get(id));
    }
    return result;
  }
  toObject(ser) {
    const result = {
      entries: {},
      reflections: {}
    };
    for (const [key, val] of this.mediaToPath.entries()) {
      result.entries[key] = NormalizedPathUtils.relative(ser.projectRoot, val);
    }
    for (const [key, val] of this.mediaToReflection.entries()) {
      if (ser.project.getReflectionById(val)) {
        result.reflections[key] = val;
      }
    }
    return result;
  }
  /**
   * Revive a file registry from disc.
   * Note that in the packages context this may be called multiple times on
   * a single object, and should merge in files from the other registries.
   */
  fromObject(de, obj) {
    for (const [fileId, path] of Object.entries(obj.entries)) {
      const absolute = NormalizedPathUtils.resolve(de.projectRoot, path);
      de.oldFileIdToNewFileId[+fileId] = this.registerAbsolute(absolute).target;
    }
    de.defer((project) => {
      for (const [fileId, reflId] of Object.entries(obj.reflections)) {
        const refl = project.getReflectionById(
          de.oldIdToNewId[reflId]
        );
        if (refl) {
          this.mediaToReflection.set(
            de.oldFileIdToNewFileId[+fileId],
            refl.id
          );
        }
      }
    });
  }
};

// src/lib/models/ParameterReflection.ts
var ParameterReflection = class extends Reflection {
  variant = "param";
  defaultValue;
  type;
  traverse(callback) {
    if (this.type instanceof ReflectionType) {
      if (callback(
        this.type.declaration,
        3 /* TypeLiteral */
      ) === false) {
        return;
      }
    }
  }
  isParameter() {
    return true;
  }
  /**
   * Return a string representation of this reflection.
   */
  toString() {
    return super.toString() + (this.type ? ": " + this.type.toString() : "");
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      variant: this.variant,
      type: serializer.toObject(this.type),
      defaultValue: this.defaultValue
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    this.type = de.reviveType(obj.type);
    this.defaultValue = obj.defaultValue;
  }
};

// src/lib/models/ReferenceReflection.ts
var ReferenceReflection = class _ReferenceReflection extends DeclarationReflection {
  variant = "reference";
  _target;
  /**
   * Creates a reference reflection. Should only be used within the factory function.
   * @internal
   */
  constructor(name, reflection, parent) {
    super(name, 4194304 /* Reference */, parent);
    this._target = reflection.id;
  }
  /**
   * Tries to get the reflection that is referenced. This may be another reference reflection.
   * To fully resolve any references, use {@link tryGetTargetReflectionDeep}.
   */
  tryGetTargetReflection() {
    return this.project.getReflectionById(this._target);
  }
  /**
   * Tries to get the reflection that is referenced, this will fully resolve references.
   * To only resolve one reference, use {@link tryGetTargetReflection}.
   */
  tryGetTargetReflectionDeep() {
    let result = this.tryGetTargetReflection();
    while (result instanceof _ReferenceReflection) {
      result = result.tryGetTargetReflection();
    }
    return result;
  }
  /**
   * Gets the reflection that is referenced. This may be another reference reflection.
   * To fully resolve any references, use {@link getTargetReflectionDeep}.
   */
  getTargetReflection() {
    const target = this.tryGetTargetReflection();
    if (!target) {
      throw new Error("Reference was unresolved.");
    }
    return target;
  }
  /**
   * Gets the reflection that is referenced, this will fully resolve references.
   * To only resolve one reference, use {@link getTargetReflection}.
   */
  getTargetReflectionDeep() {
    let result = this.getTargetReflection();
    while (result instanceof _ReferenceReflection) {
      result = result.getTargetReflection();
    }
    return result;
  }
  getChildByName(arg) {
    return this.getTargetReflection().getChildByName(arg);
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      variant: this.variant,
      target: this.tryGetTargetReflection()?.id ?? -1
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    de.defer((project) => {
      this._target = project.getReflectionById(de.oldIdToNewId[obj.target] ?? -1)?.id ?? -1;
    });
  }
};

// src/lib/models/ProjectReflection.ts
import {
  assertNever as assertNever3,
  DefaultMap,
  i18n as i18n6,
  NonEnumerable as NonEnumerable4,
  removeIfPresent as removeIfPresent2,
  StableKeyMap
} from "#utils";
var JSON_SCHEMA_VERSION = "2.0";
var _reflections_dec, _reflectionChildren_dec, _referenceGraph_dec, _removedSymbolIds_dec, _reflectionIdToSymbolIdMap_dec, _symbolToReflectionIdMap_dec, _a2, _init4;
var ProjectReflection = class extends (_a2 = ContainerReflection, _symbolToReflectionIdMap_dec = [NonEnumerable4], _reflectionIdToSymbolIdMap_dec = [NonEnumerable4], _removedSymbolIds_dec = [NonEnumerable4], _referenceGraph_dec = [NonEnumerable4], _reflectionChildren_dec = [NonEnumerable4], _reflections_dec = [NonEnumerable4], _a2) {
  constructor(name, registry) {
    super(name, 1 /* Project */);
    __publicField(this, "variant", "project");
    __publicField(this, "symbolToReflectionIdMap", __runInitializers(_init4, 8, this, new StableKeyMap())), __runInitializers(_init4, 11, this);
    __publicField(this, "reflectionIdToSymbolIdMap", __runInitializers(_init4, 12, this, /* @__PURE__ */ new Map())), __runInitializers(_init4, 15, this);
    __publicField(this, "removedSymbolIds", __runInitializers(_init4, 16, this, new StableKeyMap())), __runInitializers(_init4, 19, this);
    __publicField(this, "referenceGraph", __runInitializers(_init4, 20, this)), __runInitializers(_init4, 23, this);
    __publicField(this, "reflectionChildren", __runInitializers(_init4, 24, this, new DefaultMap(() => []))), __runInitializers(_init4, 27, this);
    __publicField(this, "reflections", __runInitializers(_init4, 28, this, {})), __runInitializers(_init4, 31, this);
    /**
     * The name of the package that this reflection documents according to package.json.
     */
    __publicField(this, "packageName");
    /**
     * The version of the package that this reflection documents according to package.json.
     */
    __publicField(this, "packageVersion");
    /**
     * The contents of the readme.md file of the project when found.
     */
    __publicField(this, "readme");
    /**
     * Object which describes where to find content for relative links.
     */
    __publicField(this, "files");
    this.reflections[this.id] = this;
    this.files = registry;
  }
  /**
   * Return whether this reflection is the root / project reflection.
   */
  isProject() {
    return true;
  }
  /**
   * Return a list of all reflections in this project of a certain kind.
   *
   * @param kind  The desired kind of reflection.
   * @returns     An array containing all reflections with the desired kind.
   */
  getReflectionsByKind(kind) {
    return Object.values(this.reflections).filter((reflection) => reflection.kindOf(kind));
  }
  /**
   * Registers the given reflection so that it can be quickly looked up by helper methods.
   * Should be called for *every* reflection added to the project.
   *
   * Note: During conversion, `Context.registerReflection` should be used instead so
   * that symbols can be saved for later use.
   */
  registerReflection(reflection, id, filePath) {
    this.referenceGraph = void 0;
    if (reflection.parent) {
      this.reflectionChildren.get(reflection.parent.id).push(reflection.id);
    }
    this.reflections[reflection.id] = reflection;
    if (id) {
      this.registerSymbolId(reflection, id);
    }
    if (filePath) {
      this.files.registerReflection(filePath, reflection);
    }
  }
  /**
   * Removes references to reflections contained within the provided type.
   * Plugins which overwrite types on reflections should pass the type to this
   * method before overwriting the property.
   * @since 0.26.6
   */
  removeTypeReflections(type) {
    type?.visit(
      makeRecursiveVisitor({
        reflection: (type2) => {
          this.removeReflection(type2.declaration);
        }
      })
    );
  }
  /**
   * Removes a reflection from the documentation. Can be used by plugins to filter reflections
   * out of the generated documentation. Has no effect if the reflection is not present in the
   * project.
   */
  removeReflection(reflection) {
    this._removeReflection(reflection);
    const parent = reflection.parent;
    parent?.traverse((child, property) => {
      if (child !== reflection) {
        return true;
      }
      switch (property) {
        case 0 /* Children */:
        case 1 /* Documents */:
          parent.removeChild(
            reflection
          );
          break;
        case 7 /* GetSignature */:
          delete parent.getSignature;
          break;
        case 6 /* IndexSignature */:
          removeIfPresent2(
            parent.indexSignatures,
            reflection
          );
          if (!parent.indexSignatures?.length) {
            delete parent.indexSignatures;
          }
          break;
        case 2 /* Parameters */:
          removeIfPresent2(
            reflection.parent.parameters,
            reflection
          );
          if (!reflection.parent.parameters?.length) {
            delete reflection.parent.parameters;
          }
          break;
        case 8 /* SetSignature */:
          delete parent.setSignature;
          break;
        case 5 /* Signatures */:
          removeIfPresent2(
            parent.signatures,
            reflection
          );
          if (!parent.signatures?.length) {
            delete parent.signatures;
          }
          break;
        case 3 /* TypeLiteral */:
          parent.type = new IntrinsicType("Object");
          break;
        case 4 /* TypeParameter */:
          removeIfPresent2(
            parent.typeParameters,
            reflection
          );
          if (!parent.typeParameters?.length) {
            delete parent.typeParameters;
          }
          break;
        default:
          assertNever3(property);
      }
      return false;
    });
  }
  /** @internal */
  mergeReflections(source, target) {
    delete this.referenceGraph;
    const oldChildrenIds = this.reflectionChildren.getNoInsert(source.id) || [];
    const newChildren = this.reflectionChildren.get(target.id);
    for (const childId of oldChildrenIds) {
      const childRefl = this.getReflectionById(childId);
      if (childRefl?.parent === source) {
        childRefl.parent = target;
        newChildren.push(childId);
        target.addChild(childRefl);
      }
    }
    this.reflectionChildren.delete(source.id);
    this.removeReflection(source);
    delete target.groups;
    delete target.categories;
  }
  /**
   * Remove a reflection without updating the parent reflection to remove references to the removed reflection.
   */
  _removeReflection(reflection) {
    this.files.removeReflection(reflection);
    const graph = this.getReferenceGraph();
    for (const id of graph.get(reflection.id) ?? []) {
      const ref = this.getReflectionById(id);
      if (ref) {
        this.removeReflection(ref);
      }
    }
    graph.delete(reflection.id);
    for (const childId of this.reflectionChildren.getNoInsert(
      reflection.id
    ) || []) {
      const child = this.getReflectionById(childId);
      if (child?.parent === reflection) {
        this._removeReflection(child);
      }
    }
    this.reflectionChildren.delete(reflection.id);
    const symbolId = this.reflectionIdToSymbolIdMap.get(reflection.id);
    if (symbolId) {
      const saved = this.symbolToReflectionIdMap.get(symbolId);
      if (saved === reflection.id) {
        this.symbolToReflectionIdMap.delete(symbolId);
        this.removedSymbolIds.set(symbolId, true);
      } else if (typeof saved === "object") {
        removeIfPresent2(saved, reflection.id);
        if (saved.length === 0) {
          this.removedSymbolIds.set(symbolId, true);
        }
      }
    }
    this.reflectionIdToSymbolIdMap.delete(reflection.id);
    delete this.reflections[reflection.id];
  }
  /**
   * Gets the reflection registered for the given reflection ID, or undefined if it is not present
   * in the project.
   */
  getReflectionById(id) {
    return this.reflections[id];
  }
  /**
   * Gets the reflection associated with the given symbol id, if it exists.
   * If there are multiple reflections associated with this symbol, gets the first one.
   * @internal
   */
  getReflectionFromSymbolId(symbolId) {
    return this.getReflectionsFromSymbolId(symbolId)[0];
  }
  /** @internal */
  getReflectionsFromSymbolId(symbolId) {
    const id = this.symbolToReflectionIdMap.get(symbolId);
    if (typeof id === "number") {
      return [this.getReflectionById(id)];
    } else if (typeof id === "object") {
      return id.map((id2) => this.getReflectionById(id2));
    }
    return [];
  }
  /** @internal */
  getSymbolIdFromReflection(reflection) {
    return this.reflectionIdToSymbolIdMap.get(reflection.id);
  }
  /** @internal */
  registerSymbolId(reflection, id) {
    this.removedSymbolIds.delete(id);
    this.reflectionIdToSymbolIdMap.set(reflection.id, id);
    const previous = this.symbolToReflectionIdMap.get(id);
    if (typeof previous !== "undefined") {
      if (typeof previous === "number") {
        this.symbolToReflectionIdMap.set(id, [previous, reflection.id]);
      } else {
        previous.push(reflection.id);
      }
    } else {
      this.symbolToReflectionIdMap.set(id, reflection.id);
    }
  }
  symbolIdHasBeenRemoved(id) {
    return this.removedSymbolIds.has(id);
  }
  getReferenceGraph() {
    if (!this.referenceGraph) {
      this.referenceGraph = /* @__PURE__ */ new Map();
      for (const id in this.reflections) {
        const ref = this.reflections[id];
        if (ref instanceof ReferenceReflection) {
          const target = ref.tryGetTargetReflection();
          if (target) {
            const refs = this.referenceGraph.get(target.id) ?? [];
            refs.push(ref.id);
            this.referenceGraph.set(target.id, refs);
          }
        }
      }
    }
    return this.referenceGraph;
  }
  toObject(serializer) {
    const symbolIdMap = {};
    this.reflectionIdToSymbolIdMap.forEach((sid, id) => {
      symbolIdMap[id] = sid.toObject();
    });
    return {
      schemaVersion: JSON_SCHEMA_VERSION,
      ...super.toObject(serializer),
      variant: this.variant,
      packageName: this.packageName,
      packageVersion: this.packageVersion,
      readme: Comment.serializeDisplayParts(this.readme),
      symbolIdMap,
      files: serializer.toObject(this.files)
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    this.packageName = obj.packageName;
    this.packageVersion = obj.packageVersion;
    if (obj.readme) {
      this.readme = Comment.deserializeDisplayParts(de, obj.readme);
    }
    this.files.fromObject(de, obj.files || {});
    de.defer(() => {
      for (const [id, sid] of Object.entries(obj.symbolIdMap || {})) {
        const refl = this.getReflectionById(de.oldIdToNewId[+id] ?? -1);
        if (refl) {
          this.registerSymbolId(refl, new ReflectionSymbolId(sid));
        } else {
          de.logger.warn(i18n6.serialized_project_referenced_0_not_part_of_project(id));
        }
      }
    });
  }
};
_init4 = __decoratorStart(_a2);
__decorateElement(_init4, 5, "symbolToReflectionIdMap", _symbolToReflectionIdMap_dec, ProjectReflection);
__decorateElement(_init4, 5, "reflectionIdToSymbolIdMap", _reflectionIdToSymbolIdMap_dec, ProjectReflection);
__decorateElement(_init4, 5, "removedSymbolIds", _removedSymbolIds_dec, ProjectReflection);
__decorateElement(_init4, 5, "referenceGraph", _referenceGraph_dec, ProjectReflection);
__decorateElement(_init4, 5, "reflectionChildren", _reflectionChildren_dec, ProjectReflection);
__decorateElement(_init4, 5, "reflections", _reflections_dec, ProjectReflection);
__decoratorMetadata(_init4, ProjectReflection);

// src/lib/models/SignatureReflection.ts
var SignatureReflection = class extends Reflection {
  variant = "signature";
  // ESLint is wrong, we're restricting types to be more narrow.
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(name, kind, parent) {
    super(name, kind, parent);
  }
  /**
   * A list of all source files that contributed to this reflection.
   */
  sources;
  parameters;
  typeParameters;
  type;
  /**
   * A type that points to the reflection that has been overwritten by this reflection.
   *
   * Applies to interface and class members.
   */
  overwrites;
  /**
   * A type that points to the reflection this reflection has been inherited from.
   *
   * Applies to interface and class members.
   */
  inheritedFrom;
  /**
   * A type that points to the reflection this reflection is the implementation of.
   *
   * Applies to class members.
   */
  implementationOf;
  traverse(callback) {
    if (this.type instanceof ReflectionType) {
      if (callback(
        this.type.declaration,
        3 /* TypeLiteral */
      ) === false) {
        return;
      }
    }
    for (const parameter of this.typeParameters?.slice() || []) {
      if (callback(parameter, 4 /* TypeParameter */) === false) {
        return;
      }
    }
    for (const parameter of this.parameters?.slice() || []) {
      if (callback(parameter, 2 /* Parameters */) === false) {
        return;
      }
    }
  }
  isSignature() {
    return true;
  }
  /**
   * Return a string representation of this reflection.
   */
  toString() {
    let result = super.toString();
    if (this.typeParameters) {
      const parameters = this.typeParameters.map(
        (parameter) => parameter.name
      );
      result += "<" + parameters.join(", ") + ">";
    }
    if (this.type) {
      result += ": " + this.type.toString();
    }
    return result;
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      variant: this.variant,
      sources: serializer.toObjectsOptional(this.sources),
      typeParameters: serializer.toObjectsOptional(this.typeParameters),
      parameters: serializer.toObjectsOptional(this.parameters),
      type: serializer.toObject(this.type),
      overwrites: serializer.toObject(this.overwrites),
      inheritedFrom: serializer.toObject(this.inheritedFrom),
      implementationOf: serializer.toObject(this.implementationOf)
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    this.sources = de.reviveMany(
      obj.sources,
      (t) => new SourceReference(t.fileName, t.line, t.character)
    );
    this.typeParameters = de.reviveMany(obj.typeParameters, (t) => de.constructReflection(t));
    this.parameters = de.reviveMany(obj.parameters, (t) => de.constructReflection(t));
    this.type = de.reviveType(obj.type);
    this.overwrites = de.reviveType(obj.overwrites);
    this.inheritedFrom = de.reviveType(obj.inheritedFrom);
    this.implementationOf = de.reviveType(obj.implementationOf);
  }
};

// src/lib/models/TypeParameterReflection.ts
var VarianceModifier = {
  in: "in",
  out: "out",
  inOut: "in out"
};
var TypeParameterReflection = class extends Reflection {
  variant = "typeParam";
  type;
  default;
  varianceModifier;
  constructor(name, parent, varianceModifier) {
    super(name, 131072 /* TypeParameter */, parent);
    this.varianceModifier = varianceModifier;
  }
  isTypeParameter() {
    return true;
  }
  toObject(serializer) {
    return {
      ...super.toObject(serializer),
      variant: this.variant,
      type: serializer.toObject(this.type),
      default: serializer.toObject(this.default),
      varianceModifier: this.varianceModifier
    };
  }
  fromObject(de, obj) {
    super.fromObject(de, obj);
    this.type = de.reviveType(obj.type);
    this.default = de.reviveType(obj.default);
    this.varianceModifier = obj.varianceModifier;
  }
  traverse(_callback) {
  }
};
export {
  ArrayType,
  Comment,
  CommentTag,
  ConditionalType,
  ContainerReflection,
  DeclarationReflection,
  DocumentReflection,
  FileRegistry,
  IndexedAccessType,
  InferredType,
  IntersectionType,
  IntrinsicType,
  LiteralType,
  MappedType,
  NamedTupleMember,
  OptionalType,
  ParameterReflection,
  PredicateType,
  ProjectReflection,
  QueryType,
  ReferenceReflection,
  ReferenceType,
  Reflection,
  ReflectionCategory,
  ReflectionFlag,
  ReflectionFlags,
  ReflectionGroup,
  ReflectionKind,
  ReflectionSymbolId,
  ReflectionType,
  RestType,
  SignatureReflection,
  SourceReference,
  TemplateLiteralType,
  TraverseProperty,
  TupleType,
  Type,
  TypeContext,
  TypeOperatorType,
  TypeParameterReflection,
  UnionType,
  UnknownType,
  VarianceModifier,
  makeRecursiveVisitor,
  resetReflectionID,
  splitUnquotedString
};
