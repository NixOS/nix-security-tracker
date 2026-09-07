var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/utils/component.ts
import { EventDispatcher } from "#utils";
var AbstractComponent = class extends EventDispatcher {
  /**
   * The owner of this component instance.
   */
  _componentOwner;
  /**
   * The name of this component as set by the `@Component` decorator.
   */
  componentName;
  /**
   * Create new Component instance.
   */
  constructor(owner) {
    super();
    this._componentOwner = owner;
  }
  /**
   * Return the application / root component instance.
   */
  get application() {
    if (this._componentOwner === null) {
      return this;
    }
    return this._componentOwner.application;
  }
  /**
   * Return the owner of this component.
   */
  get owner() {
    return this._componentOwner === null ? this : this._componentOwner;
  }
};

// src/lib/utils/fs.ts
import * as fs from "fs";
import { promises as fsp } from "fs";
import { Minimatch as Minimatch2 } from "minimatch";
import { dirname as dirname2, join, relative as relative2, resolve as resolve2 } from "path";
import { escapeRegExp, Validation } from "#utils";

// src/lib/utils/paths.ts
import { countMatches, filterMap } from "#utils";
import { Minimatch } from "minimatch";
import { dirname, isAbsolute, relative, resolve } from "path";
var MinimatchSet = class {
  patterns;
  constructor(patterns) {
    this.patterns = patterns.map((p) => new Minimatch(p, { dot: true }));
  }
  matchesAny(path) {
    return this.patterns.some((p) => {
      return p.match(path);
    });
  }
};
function escapeGlob(glob2) {
  return glob2.replace(/[?*()[\]\\{}]/g, "\\$&");
}
function isGlobalGlob(glob2) {
  const start = glob2.match(/^[!#]+/)?.[0].length ?? 0;
  return glob2.startsWith("**", start);
}
function splitGlobToPathAndSpecial(glob2) {
  const modifiers = glob2.match(/^[!#]+/)?.[0] ?? "";
  const noModifierGlob = glob2.substring(modifiers.length);
  if (isGlobalGlob(glob2)) {
    return { modifiers, path: "", glob: noModifierGlob };
  }
  const mini = new Minimatch(noModifierGlob, { dot: true });
  const basePaths = mini.set.map((set) => {
    const stop = set.findIndex((part) => typeof part !== "string");
    if (stop === -1) {
      return set.join("/");
    } else {
      return set.slice(0, stop).join("/");
    }
  });
  const base = getCommonPath(basePaths);
  if (base) {
    const skipIndex = countMatches(base, "/") + 1;
    const globPart = mini.globParts.map((s) => s.slice(skipIndex));
    const resultingGlob = globPart.length === 1 ? globPart[0].join("/") : `{${globPart.map((s) => s.join("/")).join(",")}}`;
    return { modifiers, path: base, glob: resultingGlob };
  }
  return { modifiers, path: "", glob: noModifierGlob };
}
function createGlobString(relativeTo, glob2) {
  if (isAbsolute(glob2) || isGlobalGlob(glob2)) return glob2;
  const split = splitGlobToPathAndSpecial(glob2);
  const leadingPath = normalizePath(resolve(relativeTo, split.path));
  if (!split.glob) {
    return split.modifiers + escapeGlob(leadingPath);
  }
  return `${split.modifiers}${escapeGlob(leadingPath)}/${split.glob}`;
}
function getCommonPath(files) {
  if (!files.length) {
    return "";
  }
  const roots = files.map((f) => f.split("/"));
  if (roots.length === 1) {
    return roots[0].join("/");
  }
  let i = 0;
  while (i < roots[0].length && new Set(roots.map((part) => part[i])).size === 1) {
    i++;
  }
  return roots[0].slice(0, i).join("/");
}
function getCommonDirectory(files) {
  if (files.length === 1) {
    return normalizePath(dirname(files[0]));
  }
  return getCommonPath(files);
}
function deriveRootDir(globPaths) {
  const globs = new MinimatchSet(globPaths).patterns;
  const rootPaths = globs.flatMap(
    (glob2, i) => filterMap(glob2.set, (set) => {
      const stop = set.findIndex((part) => typeof part !== "string");
      if (stop === -1) {
        return globPaths[i];
      } else {
        const kept = set.slice(0, stop).join("/");
        return globPaths[i].substring(
          0,
          globPaths[i].indexOf(kept) + kept.length
        );
      }
    })
  );
  return getCommonDirectory(rootPaths);
}
function nicePath(absPath) {
  if (!isAbsolute(absPath)) return absPath;
  const relativePath = relative(process.cwd(), absPath);
  if (relativePath.startsWith("..")) {
    return normalizePath(absPath);
  }
  return `./${normalizePath(relativePath)}`;
}
var ALREADY_NORMALIZED_WIN = /^[A-Z]:\/[^\\]*$/;
function normalizePath(path) {
  if (process.platform === "win32") {
    if (ALREADY_NORMALIZED_WIN.test(path)) {
      return path;
    }
    path = path.replace(/\\/g, "/");
    path = path.replace(/^\/([a-zA-Z])\//, (_m, m1) => `${m1}:/`);
    path = path.replace(
      /^([^:]+):\//,
      (_m, m1) => m1.toUpperCase() + ":/"
    );
  }
  return path;
}

// src/lib/utils/fs.ts
import { ok } from "assert";
function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}
function isDir(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
}
function readFile(file) {
  const buffer = fs.readFileSync(file);
  switch (buffer[0]) {
    case 254:
      if (buffer[1] === 255) {
        let i = 0;
        while (i + 1 < buffer.length) {
          const temp = buffer[i];
          buffer[i] = buffer[i + 1];
          buffer[i + 1] = temp;
          i += 2;
        }
        return buffer.toString("ucs2", 2);
      }
      break;
    case 255:
      if (buffer[1] === 254) {
        return buffer.toString("ucs2", 2);
      }
      break;
    case 239:
      if (buffer[1] === 187) {
        return buffer.toString("utf8", 3);
      }
  }
  return buffer.toString("utf8", 0);
}
function writeFileSync2(fileName, data) {
  fs.mkdirSync(dirname2(normalizePath(fileName)), { recursive: true });
  fs.writeFileSync(normalizePath(fileName), data);
}
async function writeFile(fileName, data) {
  await fsp.mkdir(dirname2(normalizePath(fileName)), {
    recursive: true
  });
  await fsp.writeFile(normalizePath(fileName), data);
}
async function copy(src, dest) {
  const stat = await fsp.stat(src);
  if (stat.isDirectory()) {
    const contained = await fsp.readdir(src);
    await Promise.all(
      contained.map((file) => copy(join(src, file), join(dest, file)))
    );
  } else if (stat.isFile()) {
    await fsp.mkdir(dirname2(dest), { recursive: true });
    await fsp.copyFile(src, dest);
  } else {
  }
}
function copySync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const contained = fs.readdirSync(src);
    contained.forEach((file) => copySync(join(src, file), join(dest, file)));
  } else if (stat.isFile()) {
    fs.mkdirSync(dirname2(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  } else {
  }
}
var realpathCache = /* @__PURE__ */ new Map();
function discoverFiles(rootDir, controller) {
  const result = [];
  const dirs = [normalizePath(rootDir).split("/")];
  const symlinkTargetsSeen = /* @__PURE__ */ new Set();
  const { matchDirectories = false, followSymlinks = false } = controller;
  let dir = dirs.shift();
  const handleFile = (path) => {
    const childPath = [...dir, path].join("/");
    if (controller.matches(childPath)) {
      result.push(childPath);
    }
  };
  const handleDirectory = (path) => {
    const childPath = [...dir, path];
    if (controller.shouldRecurse(childPath)) {
      dirs.push(childPath);
    }
  };
  const handleSymlink = (path) => {
    const childPath = [...dir, path].join("/");
    let realpath;
    try {
      realpath = realpathCache.get(childPath) ?? fs.realpathSync(childPath);
      realpathCache.set(childPath, realpath);
    } catch {
      return;
    }
    if (symlinkTargetsSeen.has(realpath)) {
      return;
    }
    symlinkTargetsSeen.add(realpath);
    try {
      const stats = fs.statSync(realpath);
      if (stats.isDirectory()) {
        handleDirectory(path);
      } else if (stats.isFile()) {
        handleFile(path);
      } else if (stats.isSymbolicLink()) {
        const dirpath = dir.join("/");
        if (dirpath === realpath) {
          return;
        }
        const targetPath = relative2(dirpath, realpath);
        handleSymlink(targetPath);
      }
    } catch (e) {
    }
  };
  while (dir) {
    if (matchDirectories && controller.matches(dir.join("/"))) {
      result.push(dir.join("/"));
    }
    for (const child of fs.readdirSync(dir.join("/"), {
      withFileTypes: true
    })) {
      if (child.isFile()) {
        handleFile(child.name);
      } else if (child.isDirectory()) {
        handleDirectory(child.name);
      } else if (followSymlinks && child.isSymbolicLink()) {
        handleSymlink(child.name);
      }
    }
    dir = dirs.shift();
  }
  return result;
}
function glob(pattern, root, options = {}) {
  const mini = new Minimatch2(pattern);
  const shouldIncludeNodeModules = pattern.includes("node_modules");
  const controller = {
    matches(path) {
      return mini.match(path);
    },
    shouldRecurse(childPath) {
      if (childPath[childPath.length - 1] === "node_modules" && !shouldIncludeNodeModules) {
        return false;
      }
      return mini.set.some((row) => mini.matchOne(
        childPath,
        row,
        /* partial */
        true
      ));
    },
    matchDirectories: options.includeDirectories,
    followSymlinks: options.followSymlinks
  };
  return discoverFiles(root, controller);
}
function hasTsExtension(path) {
  return /\.[cm]?ts$|\.tsx$/.test(path);
}
function hasDeclarationFileExtension(path) {
  return /\.d\.[cm]?ts$/.test(path);
}
function discoverInParentDirExactMatch(name, dir, read, usedFile) {
  if (!isDir(dir)) return;
  const reachedTopDirectory = (dirName) => dirName === resolve2(join(dirName, ".."));
  while (!reachedTopDirectory(dir)) {
    usedFile?.(join(dir, name));
    try {
      const content = read(readFile(join(dir, name)));
      if (content != null) {
        return { file: join(dir, name), content };
      }
    } catch {
    }
    dir = resolve2(join(dir, ".."));
  }
}
function discoverPackageJson(dir, usedFile) {
  return discoverInParentDirExactMatch(
    "package.json",
    dir,
    (content) => {
      const pkg = JSON.parse(content);
      if (Validation.validate(
        { name: String, version: Validation.optional(String) },
        pkg
      )) {
        return pkg;
      }
    },
    usedFile
  );
}
var packageCache = /* @__PURE__ */ new Map();
function findPackageForPath(sourcePath) {
  let startIndex = sourcePath.lastIndexOf("node_modules/");
  if (startIndex !== -1) {
    startIndex += "node_modules/".length;
    let stopIndex = sourcePath.indexOf("/", startIndex);
    if (sourcePath[startIndex] === "@") {
      stopIndex = sourcePath.indexOf("/", stopIndex + 1);
    }
    const packageName = sourcePath.substring(startIndex, stopIndex);
    return [packageName, sourcePath.substring(0, stopIndex)];
  }
  const dir = dirname2(sourcePath);
  const cache = packageCache.get(dir);
  if (cache) {
    return cache;
  }
  const packageJson = discoverPackageJson(dir);
  if (packageJson) {
    packageCache.set(dir, [packageJson.content.name, dirname2(packageJson.file)]);
    return [packageJson.content.name, dirname2(packageJson.file)];
  }
}
function inferPackageEntryPointPaths(packagePath) {
  const packageDir = normalizePath(dirname2(packagePath));
  const packageJson = JSON.parse(readFile(packagePath));
  const exports = packageJson.exports;
  if (typeof exports === "string") {
    return resolveExport(packageDir, ".", exports, false);
  }
  if (!exports || typeof exports !== "object") {
    if (typeof packageJson.main === "string") {
      return [[".", resolve2(packageDir, packageJson.main)]];
    }
    return [];
  }
  const results = [];
  if (Array.isArray(exports)) {
    results.push(...resolveExport(packageDir, ".", exports, true));
  } else {
    for (const [importPath, exp] of Object.entries(exports)) {
      results.push(...resolveExport(packageDir, importPath, exp, false));
    }
  }
  return results;
}
function resolveExport(packageDir, name, exportDeclaration, validatePath) {
  if (typeof exportDeclaration === "string") {
    return resolveStarredExport(
      packageDir,
      name,
      exportDeclaration,
      validatePath
    );
  }
  if (Array.isArray(exportDeclaration)) {
    for (const item of exportDeclaration) {
      const result = resolveExport(packageDir, name, item, true);
      if (result.length) {
        return result;
      }
    }
    return [];
  }
  const EXPORT_CONDITIONS = ["typedoc", "types", "import", "node", "default"];
  for (const cond in exportDeclaration) {
    if (EXPORT_CONDITIONS.includes(cond)) {
      return resolveExport(
        packageDir,
        name,
        exportDeclaration[cond],
        false
      );
    }
  }
  return [];
}
function isWildcardName(name) {
  let starCount = 0;
  for (let i = 0; i < name.length; ++i) {
    if (name[i] === "*") {
      ++starCount;
    }
  }
  return starCount === 1;
}
function resolveStarredExport(packageDir, name, exportDeclaration, validatePath) {
  if (isWildcardName(name) && exportDeclaration.includes("*")) {
    let first = true;
    const matcher = new RegExp(
      "^" + escapeRegExp(
        normalizePath(packageDir) + "/" + exportDeclaration.replace(/^\.\//, "")
      ).replaceAll("\\*", () => {
        if (first) {
          first = false;
          return "(.*)";
        }
        return "\\1";
      }) + "$"
    );
    const matchedFiles = discoverFiles(packageDir, {
      matches(path) {
        return matcher.test(path);
      },
      shouldRecurse(path) {
        return path[path.length - 1] !== "node_modules";
      }
    });
    return matchedFiles.flatMap((path) => {
      const starContent = path.match(matcher);
      ok(starContent, "impossible, discoverFiles uses matcher");
      return [[name.replace("*", starContent[1]), path]];
    });
  }
  const exportPath = resolve2(packageDir, exportDeclaration);
  if (validatePath && !fs.existsSync(exportPath)) {
    return [];
  }
  return [[name, exportPath]];
}

// src/lib/utils/general.ts
import { dirname as dirname3 } from "path";
import { url as debuggerUrl } from "inspector";
import { createRequire } from "module";
var req = createRequire(import.meta.url);
var TYPEDOC_ROOT = dirname3(req.resolve("typedoc/package.json"));
var TYPESCRIPT_ROOT = dirname3(req.resolve("typescript"));
var TYPEDOC_VERSION = req("typedoc/package.json").version;
var SUPPORTED_TYPESCRIPT_VERSIONS = req("typedoc/package.json").peerDependencies.typescript.split("||").map((version) => version.replace(/^\s*|\.x\s*$/g, ""));
var loadSymbol = /* @__PURE__ */ Symbol.for("typedoc_loads");
var pathSymbol = /* @__PURE__ */ Symbol.for("typedoc_paths");
var g = globalThis;
g[loadSymbol] = (g[loadSymbol] || 0) + 1;
g[pathSymbol] ||= [];
g[pathSymbol].push(import.meta.url);
function hasBeenLoadedMultipleTimes() {
  return g[loadSymbol] !== 1;
}
function getLoadedPaths() {
  return g[pathSymbol] || [];
}
function isDebugging() {
  return !!debuggerUrl();
}

// src/lib/utils/loggers.ts
import ts from "typescript";
import { resolve as resolve3 } from "path";
import { ConsoleLogger, LogLevel } from "#utils";
var Colors = {
  red: "\x1B[91m",
  yellow: "\x1B[93m",
  cyan: "\x1B[96m",
  gray: "\x1B[90m",
  black: "\x1B[47m\x1B[30m",
  reset: "\x1B[0m"
};
function color(text, color2) {
  if ("NO_COLOR" in process.env) return text;
  return `${Colors[color2]}${text}${Colors.reset}`;
}
var messagePrefixes = {
  [LogLevel.Error]: color("[error]", "red"),
  [LogLevel.Warn]: color("[warning]", "yellow"),
  [LogLevel.Info]: color("[info]", "cyan"),
  [LogLevel.Verbose]: color("[debug]", "gray")
};
function diagnostics(logger, diagnostics2) {
  for (const d of diagnostics2) {
    diagnostic(logger, d);
  }
}
function diagnostic(logger, diagnostic2) {
  const output = ts.formatDiagnosticsWithColorAndContext([diagnostic2], {
    getCanonicalFileName: resolve3,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => ts.sys.newLine
  });
  switch (diagnostic2.category) {
    case ts.DiagnosticCategory.Error:
      logger.log(output, LogLevel.Error);
      break;
    case ts.DiagnosticCategory.Warning:
      logger.log(output, LogLevel.Warn);
      break;
    case ts.DiagnosticCategory.Message:
      logger.log(output, LogLevel.Info);
      break;
  }
}
var FancyConsoleLogger = class extends ConsoleLogger {
  addContext(message, level, ...args) {
    if (typeof args[0] === "undefined") {
      return `${messagePrefixes[level]} ${message}`;
    }
    if (typeof args[0] !== "number") {
      const node = args[0];
      return this.addContext(
        message,
        level,
        node.getStart(node.getSourceFile(), false),
        args[0].getSourceFile()
      );
    }
    const [pos, file] = args;
    const path = nicePath(file.fileName);
    const { line, character } = file.getLineAndCharacterOfPosition(pos);
    const location = `${color(path, "cyan")}:${color(
      `${line + 1}`,
      "yellow"
    )}:${color(`${character}`, "yellow")}`;
    const start = file.text.lastIndexOf("\n", pos) + 1;
    let end = file.text.indexOf("\n", start);
    if (end === -1) end = file.text.length;
    const prefix = `${location} - ${messagePrefixes[level]}`;
    const context = `${color(
      `${line + 1}`,
      "black"
    )}    ${file.text.substring(start, end)}`;
    return `${prefix} ${message}

${context}
`;
  }
};

// src/lib/utils/plugins.ts
import { isAbsolute as isAbsolute2 } from "path";
import { pathToFileURL } from "url";
import { i18n } from "#utils";
async function loadPlugins(app, plugins) {
  for (const plugin of plugins) {
    const pluginDisplay = getPluginDisplayName(plugin);
    try {
      let initFunction;
      if (typeof plugin === "function") {
        initFunction = plugin;
      } else {
        let instance;
        try {
          const esmPath = isAbsolute2(plugin) ? pathToFileURL(plugin).toString() : plugin;
          instance = await import(esmPath);
        } catch (error) {
          if (error.code === "ERR_UNSUPPORTED_DIR_IMPORT") {
            instance = __require(plugin);
          } else {
            throw error;
          }
        }
        initFunction = instance.load;
      }
      if (typeof initFunction === "function") {
        await initFunction(app);
        app.logger.info(i18n.loaded_plugin_0(pluginDisplay));
      } else {
        app.logger.error(
          i18n.invalid_plugin_0_missing_load_function(
            pluginDisplay
          )
        );
      }
    } catch (error) {
      app.logger.error(
        i18n.plugin_0_could_not_be_loaded(pluginDisplay)
      );
      if (error instanceof Error && error.stack) {
        app.logger.error(error.stack);
      }
    }
  }
}
function getPluginDisplayName(plugin) {
  if (typeof plugin === "function") {
    return plugin.name || "function";
  }
  const path = nicePath(plugin);
  if (path.startsWith("./node_modules/")) {
    return path.substring("./node_modules/".length);
  }
  return plugin;
}

// src/lib/utils/options/defaults.ts
var defaults_exports = {};
__export(defaults_exports, {
  blockTags: () => blockTags2,
  cascadedModifierTags: () => cascadedModifierTags,
  excludeNotDocumentedKinds: () => excludeNotDocumentedKinds,
  excludeTags: () => excludeTags,
  highlightLanguages: () => highlightLanguages,
  ignoredHighlightLanguages: () => ignoredHighlightLanguages,
  inlineTags: () => inlineTags2,
  kindSortOrder: () => kindSortOrder,
  modifierTags: () => modifierTags2,
  notRenderedTags: () => notRenderedTags,
  preservedTypeAnnotationTags: () => preservedTypeAnnotationTags,
  requiredToBeDocumented: () => requiredToBeDocumented,
  sort: () => sort
});

// src/lib/utils/options/tsdoc-defaults.ts
var tsdoc_defaults_exports = {};
__export(tsdoc_defaults_exports, {
  blockTags: () => blockTags,
  inlineTags: () => inlineTags,
  modifierTags: () => modifierTags,
  tsdocBlockTags: () => tsdocBlockTags,
  tsdocInlineTags: () => tsdocInlineTags,
  tsdocModifierTags: () => tsdocModifierTags
});
var tsdocBlockTags = [
  "@defaultValue",
  "@deprecated",
  "@example",
  "@jsx",
  "@param",
  "@privateRemarks",
  "@remarks",
  "@returns",
  "@see",
  "@throws",
  "@typeParam"
];
var blockTags = [
  ...tsdocBlockTags,
  "@author",
  "@callback",
  "@category",
  "@categoryDescription",
  "@default",
  "@document",
  "@extends",
  "@augments",
  // Alias for @extends
  "@yields",
  "@group",
  "@groupDescription",
  "@import",
  "@inheritDoc",
  "@license",
  "@module",
  "@mergeModuleWith",
  "@prop",
  "@property",
  "@return",
  "@satisfies",
  "@since",
  "@sortStrategy",
  "@template",
  // Alias for @typeParam
  "@this",
  "@type",
  "@typedef",
  "@summary",
  "@preventInline",
  "@inlineType",
  "@preventExpand",
  "@expandType"
];
var tsdocInlineTags = ["@link", "@inheritDoc", "@label"];
var inlineTags = [
  ...tsdocInlineTags,
  "@linkcode",
  "@linkplain",
  "@include",
  "@includeCode"
];
var tsdocModifierTags = [
  "@alpha",
  "@beta",
  "@eventProperty",
  "@experimental",
  "@internal",
  "@override",
  "@packageDocumentation",
  "@public",
  "@readonly",
  "@sealed",
  "@virtual"
];
var modifierTags = [
  ...tsdocModifierTags,
  "@abstract",
  "@class",
  "@disableGroups",
  "@enum",
  "@event",
  "@expand",
  "@hidden",
  "@hideCategories",
  "@hideconstructor",
  "@hideGroups",
  "@ignore",
  "@inline",
  "@interface",
  "@namespace",
  "@function",
  "@overload",
  "@private",
  "@protected",
  "@reexport",
  "@showCategories",
  "@showGroups",
  "@useDeclaredType",
  "@primaryExport"
];

// src/lib/utils/options/defaults.ts
var excludeNotDocumentedKinds = [
  "Module",
  "Namespace",
  "Enum",
  // Not including enum member here by default
  "Variable",
  "Function",
  "Class",
  "Interface",
  "Constructor",
  "Property",
  "Method",
  "CallSignature",
  "IndexSignature",
  "ConstructorSignature",
  "Accessor",
  "GetSignature",
  "SetSignature",
  "TypeAlias",
  "Reference"
];
var excludeTags = [
  "@override",
  "@virtual",
  "@privateRemarks",
  "@satisfies",
  "@overload",
  "@inline",
  "@inlineType"
];
var blockTags2 = blockTags;
var inlineTags2 = inlineTags;
var modifierTags2 = modifierTags;
var cascadedModifierTags = [
  "@alpha",
  "@beta",
  "@experimental"
];
var preservedTypeAnnotationTags = [];
var notRenderedTags = [
  "@showCategories",
  "@showGroups",
  "@hideCategories",
  "@hideGroups",
  "@disableGroups",
  "@expand",
  "@preventExpand",
  "@expandType",
  "@summary",
  "@group",
  "@groupDescription",
  "@category",
  "@categoryDescription"
];
var highlightLanguages = [
  "bash",
  "console",
  "css",
  "html",
  "javascript",
  "json",
  "jsonc",
  "json5",
  "yaml",
  "tsx",
  "typescript"
];
var ignoredHighlightLanguages = [];
var sort = [
  "kind",
  "instance-first",
  "alphabetical-ignoring-documents"
];
var kindSortOrder = [
  "Document",
  "Project",
  "Module",
  "Namespace",
  "Enum",
  "EnumMember",
  "Class",
  "Interface",
  "TypeAlias",
  "Constructor",
  "Property",
  "Variable",
  "Function",
  "Accessor",
  "Method",
  "Reference"
];
var requiredToBeDocumented = [
  "Enum",
  "EnumMember",
  "Variable",
  "Function",
  "Class",
  "Interface",
  "Property",
  "Method",
  "Accessor",
  "TypeAlias"
];

// src/lib/utils/sort.ts
import { ReflectionKind } from "#models";
var SORT_STRATEGIES = [
  "source-order",
  "alphabetical",
  "alphabetical-ignoring-documents",
  "enum-value-ascending",
  "enum-value-descending",
  "enum-member-source-order",
  "static-first",
  "instance-first",
  "visibility",
  "required-first",
  "kind",
  "external-last",
  "documents-first",
  "documents-last"
];
var sorts = {
  "source-order"(a, b) {
    const aSymbol = a.project.getSymbolIdFromReflection(a);
    const bSymbol = b.project.getSymbolIdFromReflection(b);
    if (aSymbol && bSymbol) {
      if (aSymbol.packageName < bSymbol.packageName) {
        return true;
      }
      if (aSymbol.packageName === bSymbol.packageName && aSymbol.packagePath < bSymbol.packagePath) {
        return true;
      }
      if (aSymbol.packageName === bSymbol.packageName && aSymbol.packagePath === bSymbol.packagePath && aSymbol.pos < bSymbol.pos) {
        return true;
      }
      return false;
    }
    return false;
  },
  alphabetical(a, b) {
    return a.name.localeCompare(b.name) < 0;
  },
  "alphabetical-ignoring-documents"(a, b) {
    if (a.kindOf(ReflectionKind.Document) || b.kindOf(ReflectionKind.Document)) {
      return false;
    }
    return a.name.localeCompare(b.name) < 0;
  },
  "enum-value-ascending"(a, b) {
    if (a.kind == ReflectionKind.EnumMember && b.kind == ReflectionKind.EnumMember) {
      const aRefl = a;
      const bRefl = b;
      const aValue = aRefl.type?.type === "literal" ? aRefl.type.value : -Infinity;
      const bValue = bRefl.type?.type === "literal" ? bRefl.type.value : -Infinity;
      return aValue < bValue;
    }
    return false;
  },
  "enum-value-descending"(a, b) {
    if (a.kind == ReflectionKind.EnumMember && b.kind == ReflectionKind.EnumMember) {
      const aRefl = a;
      const bRefl = b;
      const aValue = aRefl.type?.type === "literal" ? aRefl.type.value : -Infinity;
      const bValue = bRefl.type?.type === "literal" ? bRefl.type.value : -Infinity;
      return bValue < aValue;
    }
    return false;
  },
  "enum-member-source-order"(a, b, data) {
    if (a.kind === ReflectionKind.EnumMember && b.kind === ReflectionKind.EnumMember) {
      return sorts["source-order"](a, b, data);
    }
    return false;
  },
  "static-first"(a, b) {
    return a.flags.isStatic && !b.flags.isStatic;
  },
  "instance-first"(a, b) {
    return !a.flags.isStatic && b.flags.isStatic;
  },
  visibility(a, b) {
    if (a.flags.isPrivate) {
      return false;
    }
    if (a.flags.isProtected) {
      return b.flags.isPrivate;
    }
    if (b.flags.isPrivate || b.flags.isProtected) {
      return true;
    }
    return false;
  },
  "required-first"(a, b) {
    return !a.flags.isOptional && b.flags.isOptional;
  },
  kind(a, b, { kindSortOrder: kindSortOrder2 }) {
    return kindSortOrder2.indexOf(a.kind) < kindSortOrder2.indexOf(b.kind);
  },
  "external-last"(a, b) {
    return !a.flags.isExternal && b.flags.isExternal;
  },
  "documents-first"(a, b) {
    return a.kindOf(ReflectionKind.Document) && !b.kindOf(ReflectionKind.Document);
  },
  "documents-last"(a, b) {
    return !a.kindOf(ReflectionKind.Document) && b.kindOf(ReflectionKind.Document);
  }
};
function isValidSortStrategy(strategy) {
  return SORT_STRATEGIES.includes(strategy);
}
function getSortFunction(opts, strategies = opts.getValue("sort")) {
  const kindSortOrder2 = opts.getValue("kindSortOrder").map((k) => ReflectionKind[k]);
  for (const kind of kindSortOrder) {
    if (!kindSortOrder2.includes(ReflectionKind[kind])) {
      kindSortOrder2.push(ReflectionKind[kind]);
    }
  }
  const data = { kindSortOrder: kindSortOrder2 };
  return function sortReflections(reflections) {
    reflections.sort((a, b) => {
      for (const s of strategies) {
        if (sorts[s](a, b, data)) {
          return -1;
        }
        if (sorts[s](b, a, data)) {
          return 1;
        }
      }
      return 0;
    });
  };
}

// src/lib/utils/options/index.ts
var options_exports = {};
__export(options_exports, {
  ArgumentsReader: () => ArgumentsReader,
  CommentStyle: () => CommentStyle,
  EmitStrategy: () => EmitStrategy,
  Option: () => Option,
  OptionDefaults: () => defaults_exports,
  Options: () => Options,
  PackageJsonReader: () => PackageJsonReader,
  ParameterHint: () => ParameterHint,
  ParameterType: () => ParameterType,
  TSConfigReader: () => TSConfigReader,
  TSDocDefaults: () => tsdoc_defaults_exports,
  TypeDocReader: () => TypeDocReader,
  rootPackageOptions: () => rootPackageOptions
});

// src/lib/utils/options/declaration.ts
import { isAbsolute as isAbsolute3, join as join2, resolve as resolve4 } from "path";
import {
  i18n as i18n2
} from "#utils";
var EmitStrategy = {
  both: "both",
  // Emit both documentation and JS
  docs: "docs",
  // Emit documentation, but not JS (default)
  none: "none"
  // Emit nothing, just convert and run validation
};
var CommentStyle = {
  JSDoc: "jsdoc",
  Block: "block",
  Line: "line",
  TripleSlash: "triple-slash",
  All: "all"
};
var rootPackageOptions = [
  // Configuration Options
  "plugin",
  // Input Options
  "packageOptions",
  // Output Options
  "outputs",
  "out",
  "html",
  "json",
  "pretty",
  "theme",
  "router",
  "lightHighlightTheme",
  "darkHighlightTheme",
  "highlightLanguages",
  "ignoredHighlightLanguages",
  "typePrintWidth",
  "customCss",
  "customJs",
  "customFooterHtml",
  "customFooterHtmlDisableWrapper",
  "markdownItOptions",
  "markdownItLoader",
  "cname",
  "favicon",
  "sourceLinkExternal",
  "markdownLinkExternal",
  "lang",
  "locales",
  "githubPages",
  "cacheBust",
  "hideGenerator",
  "searchInComments",
  "searchInDocuments",
  "cleanOutputDir",
  "titleLink",
  "navigationLinks",
  "sidebarLinks",
  "navigation",
  "headings",
  "sluggerConfiguration",
  "navigationLeaves",
  "visibilityFilters",
  "searchCategoryBoosts",
  "searchGroupBoosts",
  "hostedBaseUrl",
  "useHostedBaseUrlForAbsoluteLinks",
  "useFirstParagraphOfCommentAsSummary",
  "includeHierarchySummary",
  // Comment Options
  "notRenderedTags",
  // Organization Options
  // Validation Options
  "treatWarningsAsErrors",
  "treatValidationWarningsAsErrors",
  // Other Options
  "watch",
  "preserveWatchOutput",
  "help",
  "version",
  "showConfig",
  "logLevel"
];
var ParameterHint = /* @__PURE__ */ ((ParameterHint2) => {
  ParameterHint2[ParameterHint2["File"] = 0] = "File";
  ParameterHint2[ParameterHint2["Directory"] = 1] = "Directory";
  return ParameterHint2;
})(ParameterHint || {});
var ParameterType = /* @__PURE__ */ ((ParameterType2) => {
  ParameterType2[ParameterType2["String"] = 0] = "String";
  ParameterType2[ParameterType2["Path"] = 1] = "Path";
  ParameterType2[ParameterType2["UrlOrPath"] = 2] = "UrlOrPath";
  ParameterType2[ParameterType2["Number"] = 3] = "Number";
  ParameterType2[ParameterType2["Boolean"] = 4] = "Boolean";
  ParameterType2[ParameterType2["Map"] = 5] = "Map";
  ParameterType2[ParameterType2["Mixed"] = 6] = "Mixed";
  ParameterType2[ParameterType2["Array"] = 7] = "Array";
  ParameterType2[ParameterType2["PathArray"] = 8] = "PathArray";
  ParameterType2[ParameterType2["ModuleArray"] = 9] = "ModuleArray";
  ParameterType2[ParameterType2["PluginArray"] = 10] = "PluginArray";
  ParameterType2[ParameterType2["GlobArray"] = 11] = "GlobArray";
  ParameterType2[ParameterType2["Object"] = 12] = "Object";
  ParameterType2[ParameterType2["Flags"] = 13] = "Flags";
  return ParameterType2;
})(ParameterType || {});
function toStringArray(value, option) {
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return value;
  } else if (typeof value === "string") {
    return [value];
  }
  throw new Error(i18n2.option_0_must_be_an_array_of_string(option.name));
}
function toStringOrFunctionArray(value, option) {
  if (Array.isArray(value) && value.every((v) => typeof v === "string" || typeof v === "function")) {
    return value;
  } else if (typeof value === "string") {
    return [value];
  }
  throw new Error(i18n2.option_0_must_be_an_array_of_string_or_functions(option.name));
}
var converters = {
  [0 /* String */](value, option) {
    const stringValue = value == null ? "" : String(value);
    option.validate?.(stringValue);
    return stringValue;
  },
  [1 /* Path */](value, option, configPath) {
    const stringValue = (
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      value == null ? "" : resolve4(configPath, String(value))
    );
    option.validate?.(stringValue);
    return normalizePath(stringValue);
  },
  [2 /* UrlOrPath */](value, option, configPath) {
    const stringValue = value == null ? "" : String(value);
    if (/^https?:\/\//i.test(stringValue)) {
      option.validate?.(stringValue);
      return stringValue;
    }
    const resolved = normalizePath(resolve4(configPath, stringValue));
    option.validate?.(resolved);
    return resolved;
  },
  [3 /* Number */](value, option) {
    const numValue = parseInt(String(value), 10) || 0;
    if (!valueIsWithinBounds(numValue, option.minValue, option.maxValue)) {
      throw new Error(
        getBoundsError(
          option.name,
          option.minValue,
          option.maxValue
        )
      );
    }
    option.validate?.(numValue);
    return numValue;
  },
  [4 /* Boolean */](value) {
    return !!value;
  },
  [7 /* Array */](value, option) {
    const strArrValue = toStringArray(value, option);
    option.validate?.(strArrValue);
    return strArrValue;
  },
  [8 /* PathArray */](value, option, configPath) {
    const strArrValue = toStringArray(value, option);
    const normalized = strArrValue.map((path) => normalizePath(resolve4(configPath, path)));
    option.validate?.(normalized);
    return normalized;
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  [9 /* ModuleArray */](value, option, configPath) {
    const strArrValue = toStringArray(value, option);
    const resolved = resolveModulePaths(strArrValue, configPath);
    option.validate?.(resolved);
    return resolved;
  },
  [10 /* PluginArray */](value, option, configPath) {
    const arrayValue = toStringOrFunctionArray(value, option);
    const resolved = arrayValue.map(
      (plugin) => typeof plugin === "function" ? plugin : resolveModulePath(plugin, configPath)
    );
    return resolved;
  },
  [11 /* GlobArray */](value, option, configPath) {
    const toGlobString = (v) => {
      const s = String(v);
      if (/\\[^?*()[\]\\{}]/.test(s)) {
        throw new Error(i18n2.glob_0_should_use_posix_slash(s));
      }
      return createGlobString(configPath, s);
    };
    const strArrValue = toStringArray(value, option);
    const globs = strArrValue.map(toGlobString);
    option.validate?.(globs);
    return globs;
  },
  [5 /* Map */](value, option) {
    const key = String(value);
    if (option.map instanceof Map) {
      if (option.map.has(key)) {
        return option.map.get(key);
      } else if ([...option.map.values()].includes(value)) {
        return value;
      }
    } else if (key in option.map) {
      if (isTsNumericEnum(option.map) && typeof value === "number") {
        return value;
      }
      return option.map[key];
    } else if (Object.values(option.map).includes(value)) {
      return value;
    }
    throw new Error(getMapError(option.map, option.name));
  },
  [6 /* Mixed */](value, option) {
    option.validate?.(value);
    return value;
  },
  [12 /* Object */](value, option, _configPath, oldValue) {
    option.validate?.(value);
    if (typeof oldValue !== "undefined") {
      value = { ...oldValue, ...value };
    }
    return value;
  },
  [13 /* Flags */](value, option) {
    if (typeof value === "boolean") {
      value = Object.fromEntries(
        Object.keys(option.defaults).map((key) => [key, value])
      );
    }
    if (typeof value !== "object" || value == null) {
      throw new Error(
        i18n2.expected_object_with_flag_values_for_0(option.name)
      );
    }
    const obj = { ...value };
    for (const key of Object.keys(obj)) {
      if (!Object.prototype.hasOwnProperty.call(option.defaults, key)) {
        throw new Error(
          i18n2.flag_0_is_not_valid_for_1_expected_2(
            key,
            option.name,
            Object.keys(option.defaults).join(", ")
          )
        );
      }
      if (typeof obj[key] !== "boolean") {
        if (obj[key] == null) {
          obj[key] = option.defaults[key];
        } else {
          throw new Error(
            i18n2.flag_values_for_0_must_be_booleans(option.name)
          );
        }
      }
    }
    return obj;
  }
};
function convert(value, option, configPath, oldValue) {
  const _converters = converters;
  return _converters[option.type ?? 0 /* String */](
    value,
    option,
    configPath,
    oldValue
  );
}
var defaultGetters = {
  [0 /* String */](option) {
    return option.defaultValue ?? "";
  },
  [1 /* Path */](option) {
    const defaultStr = option.defaultValue ?? "";
    if (defaultStr == "") {
      return "";
    }
    return normalizePath(
      isAbsolute3(defaultStr) ? defaultStr : join2(process.cwd(), defaultStr)
    );
  },
  [2 /* UrlOrPath */](option) {
    const defaultStr = option.defaultValue ?? "";
    if (defaultStr == "") {
      return "";
    }
    if (/^https?:\/\//i.test(defaultStr)) {
      return defaultStr;
    }
    return isAbsolute3(defaultStr) ? defaultStr : join2(process.cwd(), defaultStr);
  },
  [3 /* Number */](option) {
    return option.defaultValue ?? 0;
  },
  [4 /* Boolean */](option) {
    return option.defaultValue ?? false;
  },
  [5 /* Map */](option) {
    return option.defaultValue;
  },
  [6 /* Mixed */](option) {
    return option.defaultValue;
  },
  [12 /* Object */](option) {
    return option.defaultValue;
  },
  [7 /* Array */](option) {
    return option.defaultValue?.slice() ?? [];
  },
  [8 /* PathArray */](option) {
    return option.defaultValue?.map((value) => normalizePath(resolve4(process.cwd(), value))) ?? [];
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  [9 /* ModuleArray */](option) {
    if (option.defaultValue) {
      return resolveModulePaths(option.defaultValue, process.cwd());
    }
    return [];
  },
  [10 /* PluginArray */](option) {
    if (option.defaultValue) {
      return resolveModulePaths(option.defaultValue, process.cwd());
    }
    return [];
  },
  [11 /* GlobArray */](option) {
    return (option.defaultValue ?? []).map((g2) => createGlobString(normalizePath(process.cwd()), g2));
  },
  [13 /* Flags */](option) {
    return { ...option.defaults };
  }
};
function getDefaultValue(option) {
  const getters = defaultGetters;
  return getters[option.type ?? 0 /* String */](option);
}
function resolveModulePaths(modules, configPath) {
  return modules.map((path) => resolveModulePath(path, configPath));
}
function resolveModulePath(path, configPath) {
  if (path.startsWith(".")) {
    return normalizePath(resolve4(configPath, path));
  }
  return normalizePath(path);
}
function isTsNumericEnum(map) {
  return Object.values(map).every((key) => map[map[key]] === key);
}
function getMapError(map, name) {
  let keys = map instanceof Map ? [...map.keys()] : Object.keys(map);
  if (!(map instanceof Map) && isTsNumericEnum(map)) {
    keys = keys.filter((key) => Number.isNaN(parseInt(key, 10)));
  }
  return i18n2.option_0_must_be_one_of_1(name, keys.join(", "));
}
function getBoundsError(name, minValue, maxValue) {
  if (isFiniteNumber(minValue) && isFiniteNumber(maxValue)) {
    return i18n2.option_0_must_be_between_1_and_2(
      name,
      String(minValue),
      String(maxValue)
    );
  } else if (isFiniteNumber(minValue)) {
    return i18n2.option_0_must_be_equal_to_or_greater_than_1(
      name,
      String(minValue)
    );
  } else {
    return i18n2.option_0_must_be_less_than_or_equal_to_1(
      name,
      String(maxValue)
    );
  }
}
function isFiniteNumber(value) {
  return Number.isFinite(value);
}
function valueIsWithinBounds(value, minValue, maxValue) {
  if (isFiniteNumber(minValue) && isFiniteNumber(maxValue)) {
    return minValue <= value && value <= maxValue;
  } else if (isFiniteNumber(minValue)) {
    return minValue <= value;
  } else if (isFiniteNumber(maxValue)) {
    return value <= maxValue;
  } else {
    return true;
  }
}

// src/lib/utils/options/options.ts
import ts3 from "typescript";
import { resolve as resolve7 } from "path";

// src/lib/utils/entry-point.ts
import { assertNever, i18n as i18n4 } from "#utils";
import * as FS from "fs";
import { join as join4, relative as relative4, resolve as resolve6 } from "path";
import ts2 from "typescript";

// src/lib/utils/declaration-maps.ts
import { existsSync as existsSync2 } from "fs";
import { Validation as Validation2 } from "#utils";
import { join as join3, relative as relative3, resolve as resolve5 } from "path";
var declarationMapCache = /* @__PURE__ */ new Map();
function resolveDeclarationMaps(file) {
  if (!/\.d\.[cm]?ts$/.test(file)) return file;
  if (declarationMapCache.has(file)) return declarationMapCache.get(file);
  const mapFile = file + ".map";
  if (!existsSync2(mapFile)) return file;
  let sourceMap;
  try {
    sourceMap = JSON.parse(readFile(mapFile));
  } catch {
    return file;
  }
  if (Validation2.validate(
    {
      file: String,
      sourceRoot: Validation2.optional(String),
      sources: [Array, String]
    },
    sourceMap
  )) {
    let source = sourceMap.sources[0];
    if (sourceMap.sourceRoot !== void 0) {
      source = source.replace(/^\//, "");
      source = join3(sourceMap.sourceRoot, source);
    }
    const result = resolve5(mapFile, "..", source);
    declarationMapCache.set(file, result);
    return result;
  }
  return file;
}
function addInferredDeclarationMapPaths(opts, files) {
  const rootDir = opts.rootDir || getCommonDirectory(files);
  const declDir = opts.declarationDir || opts.outDir || rootDir;
  for (const file of files) {
    const mapFile = normalizePath(
      resolve5(declDir, relative3(rootDir, file)).replace(
        /\.([cm]?[tj]s)x?$/,
        ".d.$1"
      )
    );
    declarationMapCache.set(mapFile, file);
  }
}

// src/lib/utils/package-manifest.ts
import { dirname as dirname4 } from "path";
import { i18n as i18n3 } from "#utils";
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function loadPackageManifest(logger, packageJsonPath) {
  const packageJson = JSON.parse(readFile(packageJsonPath));
  if (typeof packageJson !== "object" || !packageJson) {
    logger.error(
      i18n3.file_0_not_an_object(nicePath(packageJsonPath))
    );
    return void 0;
  }
  return packageJson;
}
function getPackagePaths(packageJSON) {
  if (Array.isArray(packageJSON["workspaces"]) && packageJSON["workspaces"].every((i) => typeof i === "string")) {
    return packageJSON["workspaces"];
  }
  if (typeof packageJSON["workspaces"] === "object" && packageJSON["workspaces"] != null) {
    const workspaces = packageJSON["workspaces"];
    if (hasOwnProperty(workspaces, "packages") && Array.isArray(workspaces["packages"]) && workspaces["packages"].every((i) => typeof i === "string")) {
      return workspaces["packages"];
    }
  }
  return void 0;
}
function expandPackages(logger, packageJsonDir, workspaces, exclude) {
  return workspaces.flatMap((workspace) => {
    const expandedPackageJsonPaths = glob(
      createGlobString(packageJsonDir, `${workspace}/package.json`),
      packageJsonDir
    );
    if (expandedPackageJsonPaths.length === 0) {
      logger.warn(
        i18n3.entry_point_0_did_not_match_any_packages(
          nicePath(workspace)
        )
      );
    } else if (expandedPackageJsonPaths.length !== 1) {
      logger.verbose(
        `Expanded ${nicePath(workspace)} to:
	${expandedPackageJsonPaths.map(nicePath).join("\n	")}`
      );
    }
    return expandedPackageJsonPaths.flatMap((packageJsonPath) => {
      if (exclude.matchesAny(dirname4(packageJsonPath))) {
        return [];
      }
      const packageJson = loadPackageManifest(logger, packageJsonPath);
      if (packageJson === void 0) {
        return [];
      }
      const packagePaths = getPackagePaths(packageJson);
      if (packagePaths === void 0) {
        return [dirname4(packageJsonPath)];
      }
      return expandPackages(
        logger,
        normalizePath(dirname4(packageJsonPath)),
        packagePaths.map((p) => createGlobString(normalizePath(dirname4(packageJsonPath)), p)),
        exclude
      );
    });
  });
}

// src/lib/utils/entry-point.ts
var EntryPointStrategy = {
  /**
   * The default behavior in v0.22+, expects all provided entry points as being part of a single program.
   * Any directories included in the entry point list will result in `dir/index.([cm][tj]s|[tj]sx?)` being used.
   */
  Resolve: "resolve",
  /**
   * The default behavior in v0.21 and earlier. Behaves like the resolve behavior, but will recursively
   * expand directories into an entry point for each file within the directory.
   */
  Expand: "expand",
  /**
   * Run TypeDoc in each directory passed as an entry point. Once all directories have been converted,
   * use the merge option to produce final output.
   */
  Packages: "packages",
  /**
   * Merges multiple previously generated output from TypeDoc's --json output together into a single project.
   */
  Merge: "merge"
};
function inferEntryPoints(logger, options, programs) {
  const packageJson = discoverPackageJson(
    options.packageDir ?? process.cwd()
  );
  if (!packageJson) {
    logger.warn(i18n4.no_entry_points_provided());
    return [];
  }
  const pathEntries = inferPackageEntryPointPaths(packageJson.file);
  const entryPoints = [];
  programs ||= getEntryPrograms(
    pathEntries.map((p) => p[1]),
    logger,
    options
  );
  const jsToTsSource = /* @__PURE__ */ new Map();
  for (const program of programs) {
    const opts = program.getCompilerOptions();
    const rootDir = opts.rootDir || getCommonDirectory(program.getRootFileNames());
    const outDir = opts.outDir || rootDir;
    for (const tsFile of program.getRootFileNames()) {
      const jsFile = normalizePath(
        resolve6(outDir, relative4(rootDir, tsFile)).replace(
          /\.([cm]?)[tj]sx?$/,
          ".$1js"
        )
      );
      jsToTsSource.set(jsFile, tsFile);
    }
  }
  for (const [name, path] of pathEntries) {
    const displayName = name.replace(/^\.\/?/, "");
    const targetPath = jsToTsSource.get(normalizePath(path)) || resolveDeclarationMaps(path) || path;
    const program = programs.find((p) => p.getSourceFile(targetPath));
    if (program) {
      entryPoints.push({
        displayName,
        program,
        sourceFile: program.getSourceFile(targetPath)
      });
    } else if (/\.[cm]?js$/.test(path)) {
      logger.warn(
        i18n4.failed_to_resolve_0_to_ts_path(nicePath(path))
      );
    }
  }
  if (entryPoints.length === 0) {
    logger.warn(i18n4.no_entry_points_provided());
    return [];
  }
  logger.verbose(
    `Inferred entry points to be:
	${entryPoints.map((e) => nicePath(e.sourceFile.fileName)).join("\n	")}`
  );
  return entryPoints;
}
function getEntryPoints(logger, options) {
  if (!options.isSet("entryPoints")) {
    logger.warn(i18n4.no_entry_points_provided());
    return [];
  }
  const entryPoints = options.getValue("entryPoints");
  const exclude = options.getValue("exclude");
  if (entryPoints.length === 0) {
    return [];
  }
  let result;
  const strategy = options.getValue("entryPointStrategy");
  switch (strategy) {
    case EntryPointStrategy.Resolve:
      result = getEntryPointsForPaths(
        logger,
        expandGlobs(entryPoints, exclude, logger),
        options
      );
      break;
    case EntryPointStrategy.Expand:
      result = getExpandedEntryPointsForPaths(
        logger,
        expandGlobs(entryPoints, exclude, logger),
        options
      );
      break;
    case EntryPointStrategy.Merge:
    case EntryPointStrategy.Packages:
      return [];
    default:
      assertNever(strategy);
  }
  if (result.length === 0) {
    logger.error(i18n4.unable_to_find_any_entry_points());
    return;
  }
  return result;
}
function getDocumentEntryPoints(logger, options) {
  const docGlobs = options.getValue("projectDocuments");
  if (docGlobs.length === 0) {
    return [];
  }
  const docPaths = expandGlobs(docGlobs, [], logger);
  const supportedFileRegex = /\.(md|markdown)$/;
  const expanded = expandInputFiles(
    logger,
    docPaths,
    options,
    supportedFileRegex
  );
  const baseDir = options.getValue("displayBasePath") || options.getValue("basePath") || getCommonDirectory(expanded);
  return expanded.map((path) => {
    return {
      displayName: relative4(baseDir, path).replace(/\.[^.]+$/, ""),
      path
    };
  });
}
function getWatchEntryPoints(logger, options, program) {
  let result;
  const entryPoints = options.getValue("entryPoints");
  const exclude = options.getValue("exclude");
  const strategy = options.getValue("entryPointStrategy");
  switch (strategy) {
    case EntryPointStrategy.Resolve:
      if (options.isSet("entryPoints")) {
        result = getEntryPointsForPaths(
          logger,
          expandGlobs(entryPoints, exclude, logger),
          options,
          [program]
        );
      } else {
        result = inferEntryPoints(logger, options, [program]);
      }
      break;
    case EntryPointStrategy.Expand:
      if (options.isSet("entryPoints")) {
        result = getExpandedEntryPointsForPaths(
          logger,
          expandGlobs(entryPoints, exclude, logger),
          options,
          [program]
        );
      } else {
        result = inferEntryPoints(logger, options, [program]);
      }
      break;
    case EntryPointStrategy.Packages:
      logger.error(i18n4.watch_does_not_support_packages_mode());
      break;
    case EntryPointStrategy.Merge:
      logger.error(i18n4.watch_does_not_support_merge_mode());
      break;
    default:
      assertNever(strategy);
  }
  if (result && result.length === 0) {
    logger.error(i18n4.unable_to_find_any_entry_points());
    return;
  }
  return result;
}
function getPackageDirectories(logger, options, packageGlobPaths) {
  const exclude = new MinimatchSet(options.getValue("exclude"));
  const rootDir = deriveRootDir(packageGlobPaths);
  return expandPackages(logger, rootDir, packageGlobPaths, exclude);
}
function getModuleName(fileName, baseDir) {
  return normalizePath(relative4(baseDir, fileName)).replace(
    /(\/index)?(\.d)?\.([cm][tj]s|[tj]sx?)$/,
    ""
  );
}
function getEntryPointsForPaths(logger, inputFiles, options, programs = getEntryPrograms(inputFiles, logger, options)) {
  const baseDir = options.getValue("displayBasePath") || options.getValue("basePath") || getCommonDirectory(inputFiles);
  const entryPoints = [];
  let expandSuggestion = true;
  entryLoop: for (const fileOrDir of inputFiles.map(normalizePath)) {
    const toCheck = [fileOrDir];
    if (!/\.([cm][tj]s|[tj]sx?)$/.test(fileOrDir)) {
      toCheck.push(
        `${fileOrDir}/index.ts`,
        `${fileOrDir}/index.cts`,
        `${fileOrDir}/index.mts`,
        `${fileOrDir}/index.tsx`,
        `${fileOrDir}/index.js`,
        `${fileOrDir}/index.cjs`,
        `${fileOrDir}/index.mjs`,
        `${fileOrDir}/index.jsx`
      );
    }
    for (const program of programs) {
      for (const check of toCheck) {
        const sourceFile = program.getSourceFile(check);
        if (sourceFile) {
          entryPoints.push({
            displayName: getModuleName(resolve6(check), baseDir),
            sourceFile,
            program
          });
          continue entryLoop;
        }
      }
    }
    logger.warn(
      i18n4.entry_point_0_not_in_program(nicePath(fileOrDir))
    );
    if (expandSuggestion && isDir(fileOrDir)) {
      expandSuggestion = false;
      logger.info(i18n4.use_expand_or_glob_for_files_in_dir());
    }
  }
  return entryPoints;
}
function getExpandedEntryPointsForPaths(logger, inputFiles, options, programs = getEntryPrograms(inputFiles, logger, options)) {
  const compilerOptions = options.getCompilerOptions(logger);
  const supportedFileRegex = compilerOptions.allowJs || compilerOptions.checkJs ? /\.([cm][tj]s|[tj]sx?)$/ : /\.([cm]ts|tsx?)$/;
  return getEntryPointsForPaths(
    logger,
    expandInputFiles(logger, inputFiles, options, supportedFileRegex),
    options,
    programs
  );
}
function expandGlobs(globs, exclude, logger) {
  const excludePatterns = new MinimatchSet(exclude);
  const base = deriveRootDir(globs);
  const result = globs.flatMap((entry) => {
    const result2 = glob(entry, base, {
      includeDirectories: true,
      followSymlinks: true
    });
    const filtered = result2.filter(
      (file) => file === entry || !excludePatterns.matchesAny(file)
    );
    if (result2.length === 0) {
      logger.warn(
        i18n4.glob_0_did_not_match_any_files(entry)
      );
    } else if (filtered.length === 0) {
      logger.warn(
        i18n4.entry_point_0_did_not_match_any_files_after_exclude(
          entry
        )
      );
    } else if (filtered.length !== 1) {
      logger.verbose(
        `Expanded ${entry} to:
	${filtered.map(nicePath).join("\n	")}`
      );
    }
    return filtered;
  });
  return result;
}
function getEntryPrograms(inputFiles, logger, options) {
  const noTsConfigFound = options.getFileNames().length === 0 && options.getProjectReferences().length === 0;
  const rootProgram = noTsConfigFound ? ts2.createProgram({
    rootNames: inputFiles,
    options: options.getCompilerOptions(logger)
  }) : ts2.createProgram({
    rootNames: options.getFileNames(),
    options: options.getCompilerOptions(logger),
    projectReferences: options.getProjectReferences()
  });
  addInferredDeclarationMapPaths(
    options.getCompilerOptions(logger),
    options.getFileNames()
  );
  const programs = [rootProgram];
  if (rootProgram.getRootFileNames().length === 0) {
    logger.verbose(
      "tsconfig appears to be a solution style tsconfig - creating programs for references"
    );
    const resolvedReferences = rootProgram.getResolvedProjectReferences();
    for (const ref of resolvedReferences ?? []) {
      if (!ref) continue;
      programs.push(
        ts2.createProgram({
          options: options.fixCompilerOptions(
            ref.commandLine.options,
            logger
          ),
          rootNames: ref.commandLine.fileNames,
          projectReferences: ref.commandLine.projectReferences
        })
      );
      addInferredDeclarationMapPaths(
        ref.commandLine.options,
        ref.commandLine.fileNames
      );
    }
  }
  return programs;
}
function expandInputFiles(logger, entryPoints, options, supportedFile) {
  const files = [];
  const exclude = new MinimatchSet(options.getValue("exclude"));
  function add(file, entryPoint) {
    let stats;
    try {
      stats = FS.statSync(file);
    } catch {
      return;
    }
    const fileIsDir = stats.isDirectory();
    if (fileIsDir && !file.endsWith("/")) {
      file = `${file}/`;
    }
    if (fileIsDir) {
      FS.readdirSync(file).forEach((next) => {
        add(join4(file, next), false);
      });
    } else if (supportedFile.test(file)) {
      if (!entryPoint && exclude.matchesAny(file)) {
        return;
      }
      files.push(normalizePath(file));
    }
  }
  entryPoints.forEach((file) => {
    const resolved = resolve6(file);
    if (!FS.existsSync(resolved)) {
      logger.warn(i18n4.entry_point_0_did_not_exist(file));
      return;
    }
    add(resolved, true);
  });
  return files;
}

// src/lib/utils/options/sources/typedoc.ts
import { ReflectionKind as ReflectionKind2 } from "#models";
import { getEnumKeys, i18n as i18n5, LogLevel as LogLevel2, setDifference, Validation as Validation3 } from "#utils";

// src/lib/utils/highlighter.tsx
import * as shiki from "@gerrit0/mini-shiki";
import { JSX, unique } from "#utils";
import assert from "assert";
var tsAliases = [["mts", "typescript"], ["cts", "typescript"]];
var aliases = new Map(tsAliases);
for (const lang of shiki.bundledLanguagesInfo) {
  for (const alias of lang.aliases || []) {
    aliases.set(alias, lang.id);
  }
}
var plaintextLanguages = ["txt", "text"];
var supportedLanguages = unique([
  ...plaintextLanguages,
  ...aliases.keys(),
  ...shiki.bundledLanguagesInfo.map((lang) => lang.id)
]).sort();
var supportedThemes = Object.keys(shiki.bundledThemes);
var ShikiHighlighter = class {
  constructor(highlighter2, light, dark) {
    this.highlighter = highlighter2;
    this.light = light;
    this.dark = dark;
  }
  highlighter;
  light;
  dark;
  schemes = /* @__PURE__ */ new Map();
  supports(lang) {
    return this.highlighter.getLoadedLanguages().includes(lang);
  }
  highlight(code, lang) {
    const tokens = shiki.codeToTokensWithThemes(this.highlighter, code, {
      themes: { light: this.light, dark: this.dark },
      lang
    });
    const docEls = [];
    for (const line of tokens) {
      for (const token of line) {
        docEls.push(/* @__PURE__ */ JSX.createElement("span", { class: this.getClass(token.variants) }, token.content));
      }
      docEls.push(/* @__PURE__ */ JSX.createElement("br", null));
    }
    docEls.pop();
    docEls.pop();
    return JSX.renderElement(/* @__PURE__ */ JSX.createElement(JSX.Fragment, null, docEls));
  }
  getStyles() {
    const style = [":root {"];
    const lightRules = [];
    const darkRules = [];
    let i = 0;
    for (const key of this.schemes.keys()) {
      const [light, dark] = key.split(" | ");
      style.push(`    --light-hl-${i}: ${light};`);
      style.push(`    --dark-hl-${i}: ${dark};`);
      lightRules.push(`    --hl-${i}: var(--light-hl-${i});`);
      darkRules.push(`    --hl-${i}: var(--dark-hl-${i});`);
      i++;
    }
    style.push(`    --light-code-background: ${this.highlighter.getTheme(this.light).bg};`);
    style.push(`    --dark-code-background: ${this.highlighter.getTheme(this.dark).bg};`);
    lightRules.push(`    --code-background: var(--light-code-background);`);
    darkRules.push(`    --code-background: var(--dark-code-background);`);
    style.push("}", "");
    style.push("@media (prefers-color-scheme: light) { :root {");
    style.push(...lightRules);
    style.push("} }", "");
    style.push("@media (prefers-color-scheme: dark) { :root {");
    style.push(...darkRules);
    style.push("} }", "");
    style.push(":root[data-theme='light'] {");
    style.push(...lightRules);
    style.push("}", "");
    style.push(":root[data-theme='dark'] {");
    style.push(...darkRules);
    style.push("}", "");
    for (i = 0; i < this.schemes.size; i++) {
      style.push(`.hl-${i} { color: var(--hl-${i}); }`);
    }
    style.push("pre, code, math[display='block'] { background: var(--code-background); }", "");
    return style.join("\n");
  }
  getClass(variants) {
    const key = `${variants["light"].color} | ${variants["dark"].color}`;
    let scheme = this.schemes.get(key);
    if (scheme == null) {
      scheme = `hl-${this.schemes.size}`;
      this.schemes.set(key, scheme);
    }
    return scheme;
  }
};
var TestHighlighter = class {
  supports() {
    return true;
  }
  highlight(code) {
    return code;
  }
  getStyles() {
    return "";
  }
};
var shikiEngine;
var highlighter;
var ignoredLanguages;
function loadTestHighlighter() {
  highlighter = new TestHighlighter();
}
async function loadHighlighter(lightTheme, darkTheme, langs, ignoredLangs) {
  if (highlighter) return;
  ignoredLanguages = ignoredLangs;
  if (!shikiEngine) {
    await shiki.loadBuiltinWasm();
    shikiEngine = await shiki.createOnigurumaEngine();
  }
  const hl = await shiki.createShikiInternal({
    engine: shikiEngine,
    themes: [shiki.bundledThemes[lightTheme], shiki.bundledThemes[darkTheme]],
    langs: langs.map((lang) => shiki.bundledLanguages[lang])
  });
  highlighter = new ShikiHighlighter(hl, lightTheme, darkTheme);
}
function isPlainLanguage(lang) {
  return ignoredLanguages?.includes(lang) || plaintextLanguages.includes(lang);
}
function isSupportedLanguage(lang) {
  return isPlainLanguage(lang) || supportedLanguages.includes(lang);
}
function getSupportedLanguages() {
  return supportedLanguages;
}
function getSupportedThemes() {
  return supportedThemes;
}
function isLoadedLanguage(lang) {
  return isPlainLanguage(lang) || highlighter?.supports(lang) || false;
}
function highlight(code, lang) {
  assert(highlighter, "Tried to highlight with an uninitialized highlighter");
  if (plaintextLanguages.includes(lang) || ignoredLanguages?.includes(lang)) {
    return JSX.renderElement(/* @__PURE__ */ JSX.createElement(JSX.Fragment, null, code));
  }
  return highlighter.highlight(code, aliases.get(lang) ?? lang);
}
function getStyles() {
  assert(highlighter, "Tried to highlight with an uninitialized highlighter");
  return highlighter.getStyles();
}

// src/lib/utils/options/sources/typedoc.ts
import { extname } from "path";
function makeTagArrayValidator(name) {
  return (value) => {
    if (!Validation3.validate([Array, Validation3.isTagString], value)) {
      throw new Error(i18n5.option_0_values_must_be_array_of_tags(name));
    }
  };
}
function addTypeDocOptions(options) {
  options.addDeclaration({
    type: 1 /* Path */,
    name: "options",
    help: () => i18n5.help_options(),
    hint: 0 /* File */,
    defaultValue: ""
  });
  options.addDeclaration({
    type: 1 /* Path */,
    name: "tsconfig",
    help: () => i18n5.help_tsconfig(),
    hint: 0 /* File */,
    defaultValue: ""
  });
  options.addDeclaration({
    name: "compilerOptions",
    help: () => i18n5.help_compilerOptions(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    validate(value) {
      if (!Validation3.validate({}, value)) {
        throw new Error(
          i18n5.option_0_must_be_an_object("compilerOptions")
        );
      }
    }
  });
  options.addDeclaration({
    name: "lang",
    help: () => i18n5.help_lang(),
    type: 0 /* String */,
    defaultValue: "en"
  });
  options.addDeclaration({
    name: "locales",
    help: () => i18n5.help_locales(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: {},
    validate(value) {
      if (typeof value !== "object" || !value) {
        throw new Error(i18n5.locales_must_be_an_object());
      }
      for (const val of Object.values(value)) {
        if (typeof val !== "object" || !val) {
          throw new Error(i18n5.locales_must_be_an_object());
        }
        for (const val2 of Object.values(val)) {
          if (typeof val2 !== "string") {
            throw new Error(i18n5.locales_must_be_an_object());
          }
        }
      }
    }
  });
  options.addDeclaration({
    name: "packageOptions",
    help: () => i18n5.help_packageOptions(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: {},
    validate(value) {
      if (!Validation3.validate({}, value)) {
        throw new Error(
          i18n5.option_0_must_be_an_object("packageOptions")
        );
      }
    }
  });
  options.addDeclaration({
    name: "entryPoints",
    help: () => i18n5.help_entryPoints(),
    type: 11 /* GlobArray */
  });
  options.addDeclaration({
    name: "entryPointStrategy",
    help: () => i18n5.help_entryPointStrategy(),
    type: 5 /* Map */,
    map: EntryPointStrategy,
    defaultValue: EntryPointStrategy.Resolve
  });
  options.addDeclaration({
    name: "alwaysCreateEntryPointModule",
    help: () => i18n5.help_alwaysCreateEntryPointModule(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "projectDocuments",
    help: () => i18n5.help_projectDocuments(),
    type: 11 /* GlobArray */
  });
  options.addDeclaration({
    name: "exclude",
    help: () => i18n5.help_exclude(),
    type: 11 /* GlobArray */
  });
  options.addDeclaration({
    name: "externalPattern",
    help: () => i18n5.help_externalPattern(),
    type: 11 /* GlobArray */,
    defaultValue: ["**/node_modules/**"]
  });
  options.addDeclaration({
    name: "excludeExternals",
    help: () => i18n5.help_excludeExternals(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "excludeNotDocumented",
    help: () => i18n5.help_excludeNotDocumented(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "excludeNotDocumentedKinds",
    help: () => i18n5.help_excludeNotDocumentedKinds(),
    type: 7 /* Array */,
    validate(value) {
      const invalid = new Set(value);
      const valid = new Set(getEnumKeys(ReflectionKind2));
      for (const notPermitted of [
        ReflectionKind2.Project,
        ReflectionKind2.TypeLiteral,
        ReflectionKind2.TypeParameter,
        ReflectionKind2.Parameter
      ]) {
        valid.delete(ReflectionKind2[notPermitted]);
      }
      for (const v of valid) {
        invalid.delete(v);
      }
      if (invalid.size !== 0) {
        throw new Error(
          i18n5.exclude_not_documented_specified_0_valid_values_are_1(
            Array.from(invalid).join(", "),
            Array.from(valid).join(", ")
          )
        );
      }
    },
    defaultValue: excludeNotDocumentedKinds
  });
  options.addDeclaration({
    name: "excludeInternal",
    help: () => i18n5.help_excludeInternal(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "excludeCategories",
    help: () => i18n5.help_excludeCategories(),
    type: 7 /* Array */,
    defaultValue: []
  });
  options.addDeclaration({
    name: "excludePrivate",
    help: () => i18n5.help_excludePrivate(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "excludePrivateClassFields",
    help: () => i18n5.help_excludePrivateClassFields(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "excludeProtected",
    help: () => i18n5.help_excludeProtected(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "excludeReferences",
    help: () => i18n5.help_excludeReferences(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "externalSymbolLinkMappings",
    help: () => i18n5.help_externalSymbolLinkMappings(),
    type: 6 /* Mixed */,
    defaultValue: {},
    validate(value) {
      if (!Validation3.validate({}, value)) {
        throw new Error(
          i18n5.external_symbol_link_mappings_must_be_object()
        );
      }
      for (const mappings of Object.values(value)) {
        if (!Validation3.validate({}, mappings)) {
          throw new Error(
            i18n5.external_symbol_link_mappings_must_be_object()
          );
        }
        for (const link of Object.values(mappings)) {
          if (typeof link !== "string") {
            throw new Error(
              i18n5.external_symbol_link_mappings_must_be_object()
            );
          }
        }
      }
    }
  });
  options.addDeclaration({
    name: "readme",
    help: () => i18n5.help_readme(),
    type: 1 /* Path */
  });
  options.addDeclaration({
    name: "basePath",
    help: () => i18n5.help_basePath(),
    type: 1 /* Path */
  });
  options.addDeclaration({
    name: "outputs",
    help: () => i18n5.help_out(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: void 0,
    validate(value) {
      if (!Validation3.validate(
        [
          Array,
          {
            name: String,
            path: String,
            options: Validation3.optional({
              [Validation3.additionalProperties]: true
            })
          }
        ],
        value
      )) {
        throw new Error(i18n5.option_outputs_must_be_array());
      }
    }
  });
  options.addDeclaration({
    name: "out",
    help: () => i18n5.help_out(),
    type: 1 /* Path */,
    hint: 1 /* Directory */,
    defaultValue: "./docs"
  });
  options.addDeclaration({
    name: "html",
    outputShortcut: "html",
    help: () => i18n5.help_html(),
    type: 1 /* Path */,
    hint: 1 /* Directory */
  });
  options.addDeclaration({
    name: "json",
    outputShortcut: "json",
    help: () => i18n5.help_json(),
    type: 1 /* Path */,
    hint: 0 /* File */
  });
  options.addDeclaration({
    name: "pretty",
    help: () => i18n5.help_pretty(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "emit",
    help: () => i18n5.help_emit(),
    type: 5 /* Map */,
    map: EmitStrategy,
    defaultValue: "docs"
  });
  options.addDeclaration({
    name: "theme",
    help: () => i18n5.help_theme(),
    type: 0 /* String */,
    defaultValue: "default"
  });
  options.addDeclaration({
    name: "router",
    help: () => i18n5.help_router(),
    type: 0 /* String */,
    defaultValue: "kind"
  });
  const defaultLightTheme = "light-plus";
  const defaultDarkTheme = "dark-plus";
  options.addDeclaration({
    name: "lightHighlightTheme",
    help: () => i18n5.help_lightHighlightTheme(),
    type: 0 /* String */,
    defaultValue: defaultLightTheme,
    validate(value) {
      if (!getSupportedThemes().includes(value)) {
        throw new Error(
          i18n5.highlight_theme_0_must_be_one_of_1(
            "lightHighlightTheme",
            getSupportedThemes().join(", ")
          )
        );
      }
    }
  });
  options.addDeclaration({
    name: "darkHighlightTheme",
    help: () => i18n5.help_darkHighlightTheme(),
    type: 0 /* String */,
    defaultValue: defaultDarkTheme,
    validate(value) {
      if (!getSupportedThemes().includes(value)) {
        throw new Error(
          i18n5.highlight_theme_0_must_be_one_of_1(
            "darkHighlightTheme",
            getSupportedThemes().join(", ")
          )
        );
      }
    }
  });
  options.addDeclaration({
    name: "highlightLanguages",
    help: () => i18n5.help_highlightLanguages(),
    type: 7 /* Array */,
    defaultValue: highlightLanguages,
    validate(value) {
      const invalid = setDifference(value, getSupportedLanguages());
      if (invalid.size) {
        throw new Error(
          i18n5.highlightLanguages_contains_invalid_languages_0(
            Array.from(invalid).join(", ")
          )
        );
      }
    }
  });
  options.addDeclaration({
    name: "ignoredHighlightLanguages",
    help: () => i18n5.help_ignoredHighlightLanguages(),
    type: 7 /* Array */,
    defaultValue: ignoredHighlightLanguages
  });
  options.addDeclaration({
    name: "typePrintWidth",
    help: () => i18n5.help_typePrintWidth(),
    type: 3 /* Number */,
    defaultValue: 80
  });
  options.addDeclaration({
    name: "customCss",
    help: () => i18n5.help_customCss(),
    type: 1 /* Path */
  });
  options.addDeclaration({
    name: "customJs",
    help: () => i18n5.help_customJs(),
    type: 1 /* Path */
  });
  options.addDeclaration({
    name: "markdownItOptions",
    help: () => i18n5.help_markdownItOptions(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: {
      html: true,
      linkify: true
    },
    validate(value) {
      if (!Validation3.validate({}, value)) {
        throw new Error(
          i18n5.option_0_must_be_an_object("markdownItOptions")
        );
      }
    }
  });
  options.addDeclaration({
    name: "markdownItLoader",
    help: () => i18n5.help_markdownItLoader(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: () => {
    },
    validate(value) {
      if (typeof value !== "function") {
        throw new Error(
          i18n5.option_0_must_be_a_function("markdownItLoader")
        );
      }
    }
  });
  options.addDeclaration({
    name: "maxTypeConversionDepth",
    help: () => i18n5.help_maxTypeConversionDepth(),
    defaultValue: 10,
    type: 3 /* Number */
  });
  options.addDeclaration({
    name: "name",
    help: () => i18n5.help_name()
  });
  options.addDeclaration({
    name: "includeVersion",
    help: () => i18n5.help_includeVersion(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "disableSources",
    help: () => i18n5.help_disableSources(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "sourceLinkTemplate",
    help: () => i18n5.help_sourceLinkTemplate()
  });
  options.addDeclaration({
    name: "gitRevision",
    help: () => i18n5.help_gitRevision()
  });
  options.addDeclaration({
    name: "gitRemote",
    help: () => i18n5.help_gitRemote(),
    defaultValue: "origin"
  });
  options.addDeclaration({
    name: "disableGit",
    help: () => i18n5.help_disableGit(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "displayBasePath",
    help: () => i18n5.help_displayBasePath(),
    type: 1 /* Path */
  });
  options.addDeclaration({
    name: "cname",
    help: () => i18n5.help_cname()
  });
  options.addDeclaration({
    name: "favicon",
    help: () => i18n5.help_favicon(),
    validate(value) {
      const allowedExtension = [".ico", ".png", ".svg"];
      if (!/^https?:\/\//i.test(value) && !allowedExtension.includes(extname(value))) {
        throw new Error(
          i18n5.favicon_must_have_one_of_the_following_extensions_0(
            allowedExtension.join(", ")
          )
        );
      }
    },
    type: 2 /* UrlOrPath */
  });
  options.addDeclaration({
    name: "sourceLinkExternal",
    help: () => i18n5.help_sourceLinkExternal(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "markdownLinkExternal",
    help: () => i18n5.help_markdownLinkExternal(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "githubPages",
    help: () => i18n5.help_githubPages(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "hostedBaseUrl",
    help: () => i18n5.help_hostedBaseUrl(),
    validate(value) {
      if (!/^https?:\/\//i.test(value)) {
        throw new Error(i18n5.hostedBaseUrl_must_start_with_http());
      }
    }
  });
  options.addDeclaration({
    name: "useHostedBaseUrlForAbsoluteLinks",
    help: () => i18n5.help_useHostedBaseUrlForAbsoluteLinks(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "hideGenerator",
    help: () => i18n5.help_hideGenerator(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "customFooterHtml",
    help: () => i18n5.help_customFooterHtml(),
    type: 0 /* String */
  });
  options.addDeclaration({
    name: "customFooterHtmlDisableWrapper",
    help: () => i18n5.help_customFooterHtmlDisableWrapper(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "cacheBust",
    help: () => i18n5.help_cacheBust(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "searchInComments",
    help: () => i18n5.help_searchInComments(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "searchInDocuments",
    help: () => i18n5.help_searchInDocuments(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "cleanOutputDir",
    help: () => i18n5.help_cleanOutputDir(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "titleLink",
    help: () => i18n5.help_titleLink(),
    type: 0 /* String */
  });
  options.addDeclaration({
    name: "navigationLinks",
    help: () => i18n5.help_navigationLinks(),
    type: 6 /* Mixed */,
    defaultValue: {},
    validate(value) {
      if (!isObject(value)) {
        throw new Error(
          i18n5.option_0_must_be_object_with_urls("navigationLinks")
        );
      }
      if (Object.values(value).some((x) => typeof x !== "string")) {
        throw new Error(
          i18n5.option_0_must_be_object_with_urls("navigationLinks")
        );
      }
    }
  });
  options.addDeclaration({
    name: "sidebarLinks",
    help: () => i18n5.help_sidebarLinks(),
    type: 6 /* Mixed */,
    defaultValue: {},
    validate(value) {
      if (!isObject(value)) {
        throw new Error(
          i18n5.option_0_must_be_object_with_urls("sidebarLinks")
        );
      }
      if (Object.values(value).some((x) => typeof x !== "string")) {
        throw new Error(
          i18n5.option_0_must_be_object_with_urls("sidebarLinks")
        );
      }
    }
  });
  options.addDeclaration({
    name: "navigationLeaves",
    help: () => i18n5.help_navigationLeaves(),
    type: 7 /* Array */
  });
  options.addDeclaration({
    name: "navigation",
    help: () => i18n5.help_navigation(),
    type: 13 /* Flags */,
    defaults: {
      includeCategories: false,
      includeGroups: false,
      includeFolders: true,
      compactFolders: true,
      excludeReferences: false
    }
  });
  options.addDeclaration({
    name: "headings",
    help: () => i18n5.help_headings(),
    type: 13 /* Flags */,
    defaults: {
      readme: true,
      document: false
    }
  });
  options.addDeclaration({
    name: "sluggerConfiguration",
    help: () => i18n5.help_sluggerConfiguration(),
    type: 13 /* Flags */,
    defaults: {
      lowercase: true
    }
  });
  options.addDeclaration({
    name: "includeHierarchySummary",
    help: () => i18n5.help_includeHierarchySummary(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "visibilityFilters",
    help: () => i18n5.help_visibilityFilters(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: {
      protected: false,
      private: false,
      inherited: true,
      external: false
    },
    validate(value) {
      const knownKeys = ["protected", "private", "inherited", "external"];
      if (typeof value !== "object" || !value) {
        throw new Error(
          i18n5.option_0_must_be_an_object("visibilityFilters")
        );
      }
      for (const [key, val] of Object.entries(value)) {
        if (!key.startsWith("@") && !knownKeys.includes(key)) {
          throw new Error(
            i18n5.visibility_filters_only_include_0(
              knownKeys.join(", ")
            )
          );
        }
        if (typeof val !== "boolean") {
          throw new Error(i18n5.visibility_filters_must_be_booleans());
        }
      }
    }
  });
  options.addDeclaration({
    name: "searchCategoryBoosts",
    help: () => i18n5.help_searchCategoryBoosts(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: {},
    validate(value) {
      if (!isObject(value)) {
        throw new Error(
          i18n5.option_0_must_be_an_object("searchCategoryBoosts")
        );
      }
      if (Object.values(value).some((x) => typeof x !== "number")) {
        throw new Error(
          i18n5.option_0_values_must_be_numbers(
            "searchCategoryBoosts"
          )
        );
      }
    }
  });
  options.addDeclaration({
    name: "searchGroupBoosts",
    help: () => i18n5.help_searchGroupBoosts(),
    type: 6 /* Mixed */,
    configFileOnly: true,
    defaultValue: {},
    validate(value) {
      if (!isObject(value)) {
        throw new Error(
          i18n5.option_0_must_be_an_object("searchGroupBoosts")
        );
      }
      if (Object.values(value).some((x) => typeof x !== "number")) {
        throw new Error(
          i18n5.option_0_values_must_be_numbers("searchGroupBoosts")
        );
      }
    }
  });
  options.addDeclaration({
    name: "useFirstParagraphOfCommentAsSummary",
    help: () => i18n5.help_useFirstParagraphOfCommentAsSummary(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "jsDocCompatibility",
    help: () => i18n5.help_jsDocCompatibility(),
    type: 13 /* Flags */,
    defaults: {
      defaultTag: true,
      exampleTag: true,
      inheritDocTag: true,
      ignoreUnescapedBraces: true
    }
  });
  options.addDeclaration({
    name: "suppressCommentWarningsInDeclarationFiles",
    help: () => i18n5.help_suppressCommentWarningsInDeclarationFiles(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "commentStyle",
    help: () => i18n5.help_commentStyle(),
    type: 5 /* Map */,
    map: CommentStyle,
    defaultValue: CommentStyle.JSDoc
  });
  options.addDeclaration({
    name: "useTsLinkResolution",
    help: () => i18n5.help_useTsLinkResolution(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "preserveLinkText",
    help: () => i18n5.help_preserveLinkText(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "blockTags",
    help: () => i18n5.help_blockTags(),
    type: 7 /* Array */,
    defaultValue: blockTags,
    validate: makeTagArrayValidator("blockTags")
  });
  options.addDeclaration({
    name: "inlineTags",
    help: () => i18n5.help_inlineTags(),
    type: 7 /* Array */,
    defaultValue: inlineTags,
    validate: makeTagArrayValidator("inlineTags")
  });
  options.addDeclaration({
    name: "modifierTags",
    help: () => i18n5.help_modifierTags(),
    type: 7 /* Array */,
    defaultValue: modifierTags,
    validate: makeTagArrayValidator("modifierTags")
  });
  options.addDeclaration({
    name: "excludeTags",
    help: () => i18n5.help_excludeTags(),
    type: 7 /* Array */,
    defaultValue: excludeTags,
    validate: makeTagArrayValidator("excludeTags")
  });
  options.addDeclaration({
    name: "notRenderedTags",
    help: () => i18n5.help_notRenderedTags(),
    type: 7 /* Array */,
    defaultValue: notRenderedTags,
    validate: makeTagArrayValidator("notRenderedTags")
  });
  options.addDeclaration({
    name: "cascadedModifierTags",
    help: () => i18n5.help_cascadedModifierTags(),
    type: 7 /* Array */,
    defaultValue: cascadedModifierTags,
    validate: makeTagArrayValidator("cascadedModifierTags")
  });
  options.addDeclaration({
    name: "preservedTypeAnnotationTags",
    help: () => i18n5.help_preservedTypeAnnotationTags(),
    type: 7 /* Array */,
    defaultValue: preservedTypeAnnotationTags,
    validate: makeTagArrayValidator("preservedTypeAnnotationTags")
  });
  options.addDeclaration({
    name: "categorizeByGroup",
    help: () => i18n5.help_categorizeByGroup(),
    type: 4 /* Boolean */,
    defaultValue: false
  });
  options.addDeclaration({
    name: "groupReferencesByType",
    help: () => i18n5.help_groupReferencesByType(),
    type: 4 /* Boolean */,
    defaultValue: false
  });
  options.addDeclaration({
    name: "defaultCategory",
    help: () => i18n5.help_defaultCategory(),
    defaultValue: "Other"
  });
  options.addDeclaration({
    name: "categoryOrder",
    help: () => i18n5.help_categoryOrder(),
    type: 7 /* Array */
  });
  options.addDeclaration({
    name: "groupOrder",
    help: () => i18n5.help_groupOrder(),
    type: 7 /* Array */
    // default order specified in GroupPlugin to correctly handle localization.
  });
  options.addDeclaration({
    name: "sort",
    help: () => i18n5.help_sort(),
    type: 7 /* Array */,
    defaultValue: sort,
    validate(value) {
      const invalid = setDifference(value, SORT_STRATEGIES);
      if (invalid.size !== 0) {
        throw new Error(
          i18n5.option_0_specified_1_but_only_2_is_valid(
            "sort",
            Array.from(invalid).join(", "),
            SORT_STRATEGIES.join(", ")
          )
        );
      }
    }
  });
  options.addDeclaration({
    name: "sortEntryPoints",
    help: () => i18n5.help_sortEntryPoints(),
    type: 4 /* Boolean */,
    defaultValue: true
  });
  options.addDeclaration({
    name: "kindSortOrder",
    help: () => i18n5.help_kindSortOrder(),
    type: 7 /* Array */,
    defaultValue: [],
    validate(value) {
      const invalid = setDifference(value, getEnumKeys(ReflectionKind2));
      if (invalid.size !== 0) {
        throw new Error(
          i18n5.option_0_specified_1_but_only_2_is_valid(
            `kindSortOrder`,
            Array.from(invalid).join(", "),
            getEnumKeys(ReflectionKind2).join(", ")
          )
        );
      }
    }
  });
  options.addDeclaration({
    name: "watch",
    help: () => i18n5.help_watch(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "preserveWatchOutput",
    help: () => i18n5.help_preserveWatchOutput(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "skipErrorChecking",
    help: () => i18n5.help_skipErrorChecking(),
    type: 4 /* Boolean */,
    defaultValue: false
  });
  options.addDeclaration({
    name: "help",
    help: () => i18n5.help_help(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "version",
    help: () => i18n5.help_version(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "showConfig",
    help: () => i18n5.help_showConfig(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "plugin",
    help: () => i18n5.help_plugin(),
    type: 10 /* PluginArray */
  });
  options.addDeclaration({
    name: "logLevel",
    help: () => i18n5.help_logLevel(),
    type: 5 /* Map */,
    map: LogLevel2,
    defaultValue: LogLevel2.Info
  });
  options.addDeclaration({
    name: "treatWarningsAsErrors",
    help: () => i18n5.help_treatWarningsAsErrors(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "treatValidationWarningsAsErrors",
    help: () => i18n5.help_treatValidationWarningsAsErrors(),
    type: 4 /* Boolean */
  });
  options.addDeclaration({
    name: "intentionallyNotExported",
    help: () => i18n5.help_intentionallyNotExported(),
    type: 7 /* Array */
  });
  options.addDeclaration({
    name: "requiredToBeDocumented",
    help: () => i18n5.help_requiredToBeDocumented(),
    type: 7 /* Array */,
    validate(values) {
      const validValues = getEnumKeys(ReflectionKind2);
      for (const kind of values) {
        if (!validValues.includes(kind)) {
          throw new Error(
            i18n5.option_0_specified_1_but_only_2_is_valid(
              "requiredToBeDocumented",
              kind,
              validValues.join(", ")
            )
          );
        }
      }
    },
    defaultValue: requiredToBeDocumented
  });
  options.addDeclaration({
    name: "packagesRequiringDocumentation",
    help: () => i18n5.help_packagesRequiringDocumentation(),
    type: 7 /* Array */
  });
  options.addDeclaration({
    name: "intentionallyNotDocumented",
    help: () => i18n5.help_intentionallyNotDocumented(),
    type: 7 /* Array */,
    defaultValue: []
  });
  options.addDeclaration({
    name: "validation",
    help: () => i18n5.help_validation(),
    type: 13 /* Flags */,
    defaults: {
      notExported: true,
      invalidLink: true,
      invalidPath: true,
      rewrittenLink: true,
      notDocumented: false,
      unusedMergeModuleWith: true
    }
  });
}
function isObject(x) {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

// src/lib/utils/options/help.ts
function hasHint(parameter) {
  return (parameter.type ?? 0 /* String */) === 0 /* String */ && "hint" in parameter;
}
function getParameterHelp(options) {
  const parameters = options.getDeclarations();
  parameters.sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "base" }));
  const names = [];
  const helps = [];
  let margin = 0;
  for (const parameter of parameters) {
    if (!parameter.help || parameter.configFileOnly) {
      continue;
    }
    let name = " --" + parameter.name;
    if (hasHint(parameter)) {
      name += " " + ParameterHint[parameter.hint].toUpperCase();
    }
    names.push(name);
    helps.push(
      typeof parameter.help === "string" ? parameter.help : parameter.help()
    );
    margin = Math.max(name.length, margin);
  }
  return { names, helps, margin };
}
function toEvenColumns(values, maxLineWidth) {
  const columnWidth = values.reduce((acc, val) => Math.max(acc, val.length), 0) + 2;
  const numColumns = Math.max(1, Math.floor(maxLineWidth / columnWidth));
  let line = "";
  const out = [];
  for (let i = 0; i < values.length; ++i) {
    if (i !== 0 && i % numColumns === 0) {
      out.push(line);
      line = "";
    }
    line += values[i].padEnd(columnWidth);
  }
  if (line != "") {
    out.push(line);
  }
  return out;
}
function getOptionsHelp(options) {
  const output = ["typedoc path/to/entry.ts", "", "Options:"];
  const columns = getParameterHelp(options);
  for (let i = 0; i < columns.names.length; i++) {
    const usage = columns.names[i];
    const description = columns.helps[i];
    output.push(usage.padEnd(columns.margin + 2) + description);
  }
  output.push(
    "",
    "Supported highlighting languages:",
    ...toEvenColumns(getSupportedLanguages(), 80)
  );
  output.push(
    "",
    "Supported highlighting themes:",
    ...toEvenColumns(getSupportedThemes(), 80)
  );
  return output.join("\n");
}

// src/lib/utils/options/options.ts
import { getSimilarValues, i18n as i18n6, insertOrderSorted, unique as unique2 } from "#utils";
var optionSnapshots = /* @__PURE__ */ new WeakMap();
var Options = class _Options {
  _readers = [];
  _declarations = /* @__PURE__ */ new Map();
  _values = {};
  _setOptions = /* @__PURE__ */ new Set();
  _compilerOptions = {};
  _fileNames = [];
  _projectReferences = [];
  /**
   * In packages mode, the directory of the package being converted.
   */
  packageDir;
  constructor() {
    addTypeDocOptions(this);
  }
  /**
   * Clones the options, intended for use in packages mode.
   */
  copyForPackage(packageDir) {
    const options = new _Options();
    options.packageDir = packageDir;
    options._readers = this._readers.filter(
      (reader) => reader.supportsPackages
    );
    options._declarations = new Map(this._declarations);
    options.reset();
    for (const [key, val] of Object.entries(
      this.getValue("packageOptions")
    )) {
      options.setValue(key, val, packageDir);
    }
    return options;
  }
  /**
   * Take a snapshot of option values now, used in tests only.
   * @internal
   */
  snapshot() {
    const key = {};
    optionSnapshots.set(key, {
      values: { ...this._values },
      set: new Set(this._setOptions)
    });
    return key;
  }
  /**
   * Take a snapshot of option values now, used in tests only.
   * @internal
   */
  restore(snapshot) {
    const data = optionSnapshots.get(snapshot);
    this._values = { ...data.values };
    this._setOptions = new Set(data.set);
  }
  reset(name) {
    if (name != null) {
      const declaration = this.getDeclaration(name);
      if (!declaration) {
        throw new Error(
          `Cannot reset an option (${name}) which has not been declared.`
        );
      }
      this._values[declaration.name] = getDefaultValue(declaration);
      this._setOptions.delete(declaration.name);
    } else {
      for (const declaration of this.getDeclarations()) {
        this._values[declaration.name] = getDefaultValue(declaration);
      }
      this._setOptions.clear();
      this._compilerOptions = {};
      this._fileNames = [];
    }
  }
  /**
   * Adds an option reader that will be used to read configuration values
   * from the command line, configuration files, or other locations.
   * @param reader
   */
  addReader(reader) {
    insertOrderSorted(this._readers, reader);
  }
  async read(logger, cwd = process.cwd(), usedFile = () => {
  }) {
    for (const reader of this._readers) {
      await reader.read(this, logger, cwd, usedFile);
    }
  }
  addDeclaration(declaration) {
    const decl = this.getDeclaration(declaration.name);
    if (decl) {
      throw new Error(
        `The option ${declaration.name} has already been registered`
      );
    } else {
      this._declarations.set(declaration.name, declaration);
    }
    this._values[declaration.name] = getDefaultValue(declaration);
  }
  /**
   * Gets a declaration by one of its names.
   * @param name
   */
  getDeclaration(name) {
    return this._declarations.get(name);
  }
  /**
   * Gets all declared options.
   */
  getDeclarations() {
    return unique2(this._declarations.values());
  }
  isSet(name) {
    if (!this._declarations.has(name)) {
      throw new Error(
        `Tried to check if an undefined option (${name}) was set`
      );
    }
    return this._setOptions.has(name);
  }
  /**
   * Gets all of the TypeDoc option values defined in this option container.
   */
  getRawValues() {
    return this._values;
  }
  getValue(name) {
    const declaration = this.getDeclaration(name);
    if (!declaration) {
      const nearNames = this.getSimilarOptions(name);
      throw new Error(
        i18n6.unknown_option_0_you_may_have_meant_1(
          name,
          nearNames.join("\n	")
        )
      );
    }
    return this._values[declaration.name];
  }
  setValue(name, value, configPath) {
    const declaration = this.getDeclaration(name);
    if (!declaration) {
      const nearNames = this.getSimilarOptions(name);
      throw new Error(
        i18n6.unknown_option_0_you_may_have_meant_1(
          name,
          nearNames.join("\n	")
        )
      );
    }
    let oldValue = this._values[declaration.name];
    if (typeof oldValue === "undefined") {
      oldValue = getDefaultValue(declaration);
    }
    const converted = convert(
      value,
      declaration,
      configPath ?? process.cwd(),
      oldValue
    );
    if (declaration.type === 13 /* Flags */) {
      this._values[declaration.name] = Object.assign(
        {},
        this._values[declaration.name],
        converted
      );
    } else if (declaration.name === "outputs") {
      this._values[declaration.name] = converted.map((c) => {
        return {
          ...c,
          path: normalizePath(resolve7(configPath ?? process.cwd(), c.path))
        };
      });
    } else {
      this._values[declaration.name] = converted;
    }
    this._setOptions.add(name);
  }
  /**
   * Gets the set compiler options.
   */
  getCompilerOptions(logger) {
    return this.fixCompilerOptions(this._compilerOptions, logger);
  }
  /** @internal */
  fixCompilerOptions(options, logger) {
    const overrides = this.getValue("compilerOptions");
    const result = { ...options };
    if (overrides) {
      const tsOptions = ts3.convertCompilerOptionsFromJson(overrides, ".", "typedoc-overrides.json");
      if (tsOptions.errors.length) {
        for (const error of tsOptions.errors) {
          logger.error(
            i18n6.failed_to_apply_compilerOptions_overrides_0(
              ts3.flattenDiagnosticMessageText(error.messageText, "\n")
            )
          );
        }
      } else {
        for (const key in overrides) {
          result[key] = tsOptions.options[key];
        }
      }
    }
    if (this.getValue("emit") !== "both") {
      result.noEmit = true;
      delete result.emitDeclarationOnly;
    }
    return result;
  }
  /**
   * Gets the file names discovered through reading a tsconfig file.
   */
  getFileNames() {
    return this._fileNames;
  }
  /**
   * Gets the project references - used in solution style tsconfig setups.
   */
  getProjectReferences() {
    return this._projectReferences;
  }
  /**
   * Sets the compiler options that will be used to get a TS program.
   */
  setCompilerOptions(fileNames, options, projectReferences) {
    if (options.stripInternal && !this.isSet("excludeInternal")) {
      this.setValue("excludeInternal", true);
    }
    this._fileNames = fileNames;
    this._compilerOptions = { ...options };
    this._projectReferences = projectReferences ?? [];
  }
  /**
   * Discover similar option names to the given name, for use in error reporting.
   */
  getSimilarOptions(missingName) {
    return getSimilarValues(this._declarations.keys(), missingName);
  }
  /**
   * Get the help message to be displayed to the user if `--help` is passed.
   */
  getHelp() {
    return getOptionsHelp(this);
  }
};
function Option(name) {
  return (_, _context) => {
    return {
      get() {
        const options = "options" in this ? this.options : this.application.options;
        return options.getValue(name);
      },
      set(_value) {
        throw new Error(
          `Options may not be set via the Option decorator when setting ${name}`
        );
      }
    };
  };
}

// src/lib/utils/options/readers/arguments.ts
import { ok as ok2 } from "assert";
import { i18n as i18n7 } from "#utils";
var ARRAY_OPTION_TYPES = /* @__PURE__ */ new Set([
  7 /* Array */,
  8 /* PathArray */,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  9 /* ModuleArray */,
  10 /* PluginArray */,
  11 /* GlobArray */
]);
var ArgumentsReader = class {
  name = "arguments";
  order;
  supportsPackages = false;
  args;
  skipErrorReporting = false;
  constructor(priority, args = process.argv.slice(2)) {
    this.order = priority;
    this.args = args;
  }
  ignoreErrors() {
    this.skipErrorReporting = true;
    return this;
  }
  read(container, logger) {
    const options = container;
    const seen = /* @__PURE__ */ new Set();
    let index = 0;
    const trySet = (name, value) => {
      try {
        options.setValue(name, value);
      } catch (err) {
        ok2(err instanceof Error);
        if (!this.skipErrorReporting) {
          logger.error(err.message);
        }
      }
    };
    while (index < this.args.length) {
      const name = this.args[index];
      const decl = name.startsWith("-") ? (index++, options.getDeclaration(name.replace(/^--?/, ""))) : options.getDeclaration("entryPoints");
      if (decl) {
        if (decl.configFileOnly) {
          if (!this.skipErrorReporting) {
            logger.error(
              i18n7.option_0_can_only_be_specified_by_config_file(
                decl.name
              )
            );
          }
          continue;
        }
        if (seen.has(decl.name) && ARRAY_OPTION_TYPES.has(decl.type)) {
          trySet(
            decl.name,
            options.getValue(decl.name).concat(
              this.args[index]
            )
          );
        } else if (decl.type === 4 /* Boolean */ || decl.type === 13 /* Flags */) {
          const value = String(this.args.at(index)).toLowerCase();
          if (value === "true" || value === "false") {
            trySet(decl.name, value === "true");
          } else {
            trySet(decl.name, true);
            index--;
          }
        } else {
          if (index === this.args.length) {
            if (!this.skipErrorReporting) {
              logger.warn(
                i18n7.option_0_expected_a_value_but_none_provided(
                  decl.name
                )
              );
            }
          }
          trySet(decl.name, this.args[index]);
        }
        seen.add(decl.name);
        index++;
        continue;
      }
      if (name.includes(".")) {
        const actualName = name.split(".")[0].replace(/^--?/, "");
        const decl2 = options.getDeclaration(actualName);
        if (decl2 && decl2.type === 13 /* Flags */) {
          const flagName = name.split(".", 2)[1];
          const value = String(this.args.at(index)).toLowerCase();
          if (value === "true" || value === "false") {
            trySet(decl2.name, { [flagName]: value === "true" });
          } else {
            trySet(decl2.name, { [flagName]: true });
            index--;
          }
          index++;
          continue;
        }
      }
      if (!this.skipErrorReporting) {
        logger.error(
          i18n7.unknown_option_0_may_have_meant_1(
            name,
            options.getSimilarOptions(name).join("\n	")
          )
        );
      }
      index++;
    }
  }
};

// src/lib/utils/options/readers/package-json.ts
import { ok as ok3 } from "assert";
import { dirname as dirname5 } from "path";
import { i18n as i18n8 } from "#utils";
var PackageJsonReader = class {
  // Should run after the TypeDoc config reader but before the TS config
  // reader, so that it can still specify a path to a `tsconfig.json` file.
  order = 150;
  supportsPackages = true;
  name = "package-json";
  read(container, logger, cwd, usedFile) {
    const result = discoverPackageJson(cwd, usedFile);
    if (!result) {
      return;
    }
    const { file, content } = result;
    if ("typedoc" in content) {
      logger.warn(i18n8.typedoc_key_in_0_ignored(nicePath(file)));
    }
    const optsKey = "typedocOptions";
    if (!(optsKey in content)) {
      return;
    }
    const opts = content[optsKey];
    if (opts === null || typeof opts !== "object") {
      logger.error(
        i18n8.typedoc_options_must_be_object_in_0(nicePath(file))
      );
      return;
    }
    for (const [opt, val] of Object.entries(opts)) {
      try {
        container.setValue(opt, val, dirname5(file));
      } catch (err) {
        ok3(err instanceof Error);
        logger.error(err.message);
      }
    }
  }
};

// src/lib/utils/options/readers/tsconfig.ts
import { dirname as dirname6, join as join5, resolve as resolve8 } from "path";
import ts5 from "typescript";
import { ok as ok4 } from "assert";
import { i18n as i18n9, unique as unique3, Validation as Validation4 } from "#utils";
import { createRequire as createRequire3 } from "module";

// src/lib/utils/tsconfig.ts
import ts4 from "typescript";
import { createRequire as createRequire2 } from "module";
function findTsConfigFile(path, usedFile) {
  let fileToRead = path;
  if (isDir(fileToRead)) {
    fileToRead = ts4.findConfigFile(
      path,
      (file) => (usedFile?.(file), isFile(file))
    );
  }
  if (!fileToRead || !isFile(fileToRead)) {
    return;
  }
  return fileToRead;
}
function getTypeDocOptionsFromTsConfig(file) {
  const readResult = ts4.readConfigFile(file, readFile);
  const result = {};
  if (readResult.error) {
    return result;
  }
  if ("extends" in readResult.config) {
    const resolver = createRequire2(file);
    const extended = Array.isArray(readResult.config.extends) ? readResult.config.extends.map(String) : [String(readResult.config.extends)];
    for (const extendedFile of extended) {
      let resolvedParent;
      try {
        resolvedParent = resolver.resolve(extendedFile);
      } catch {
        continue;
      }
      Object.assign(
        result,
        getTypeDocOptionsFromTsConfig(resolvedParent)
      );
    }
  }
  if ("typedocOptions" in readResult.config) {
    Object.assign(result, readResult.config.typedocOptions);
  }
  return result;
}
var tsConfigCache = {};
function readTsConfig(path, logger) {
  if (tsConfigCache[path]) {
    return tsConfigCache[path];
  }
  const parsed = ts4.getParsedCommandLineOfConfigFile(
    path,
    {},
    {
      ...ts4.sys,
      onUnRecoverableConfigFileDiagnostic: diagnostic.bind(null, logger)
    }
  );
  if (!parsed) {
    return;
  }
  diagnostics(logger, parsed.errors);
  tsConfigCache[path] = parsed;
  return parsed;
}

// src/lib/utils/options/readers/tsconfig.ts
function isSupportForTags(obj) {
  return Validation4.validate({}, obj) && Object.entries(obj).every(([key, val]) => {
    return /^@[a-zA-Z][a-zA-Z0-9]*$/.test(key) && typeof val === "boolean";
  });
}
var tsDocSchema = {
  $schema: Validation4.optional(String),
  extends: Validation4.optional([Array, String]),
  noStandardTags: Validation4.optional(Boolean),
  tagDefinitions: Validation4.optional([
    Array,
    {
      tagName: Validation4.isTagString,
      syntaxKind: ["inline", "block", "modifier"],
      allowMultiple: Validation4.optional(Boolean),
      [Validation4.additionalProperties]: false
    }
  ]),
  supportForTags: Validation4.optional(isSupportForTags),
  // The official parser has code to support for these two, but
  // the schema doesn't allow them... just silently ignore them for now.
  supportedHtmlElements: Validation4.optional({}),
  reportUnsupportedHtmlElements: Validation4.optional(Boolean),
  [Validation4.additionalProperties]: false
};
var TSConfigReader = class {
  /**
   * Note: Runs after the {@link TypeDocReader}.
   */
  order = 200;
  name = "tsconfig-json";
  supportsPackages = true;
  seenTsdocPaths = /* @__PURE__ */ new Set();
  read(container, logger, cwd, usedFile) {
    const file = container.getValue("tsconfig") || cwd;
    let fileToRead = findTsConfigFile(file, usedFile);
    if (!fileToRead) {
      if (container.isSet("tsconfig")) {
        logger.error(
          i18n9.tsconfig_file_0_does_not_exist(nicePath(file))
        );
      }
      return;
    }
    fileToRead = normalizePath(resolve8(fileToRead));
    logger.verbose(`Reading tsconfig at ${nicePath(fileToRead)}`);
    this.addTagsFromTsdocJson(container, logger, resolve8(fileToRead));
    const parsed = readTsConfig(fileToRead, logger);
    if (!parsed) {
      return;
    }
    diagnostics(logger, parsed.errors);
    if (parsed.errors.length) {
      return;
    }
    const typedocOptions = getTypeDocOptionsFromTsConfig(fileToRead);
    if (typedocOptions.options) {
      logger.error(i18n9.tsconfig_file_specifies_options_file());
      delete typedocOptions.options;
    }
    if (typedocOptions.tsconfig) {
      logger.error(i18n9.tsconfig_file_specifies_tsconfig_file());
      delete typedocOptions.tsconfig;
    }
    container.setCompilerOptions(
      parsed.fileNames,
      parsed.options,
      parsed.projectReferences
    );
    for (const [key, val] of Object.entries(typedocOptions || {})) {
      try {
        container.setValue(
          key,
          val,
          join5(fileToRead, "..")
        );
      } catch (error) {
        ok4(error instanceof Error);
        logger.error(error.message);
      }
    }
  }
  addTagsFromTsdocJson(container, logger, tsconfig) {
    this.seenTsdocPaths.clear();
    const tsdoc = join5(dirname6(tsconfig), "tsdoc.json");
    if (!isFile(tsdoc)) {
      return;
    }
    const overwritten = ["blockTags", "inlineTags", "modifierTags"].filter((opt) => container.isSet(opt));
    if (overwritten.length) {
      logger.warn(
        i18n9.tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json(
          overwritten.join(", ")
        )
      );
    }
    const config = this.readTsDoc(logger, tsdoc);
    if (!config) return;
    const supported = (tag) => {
      return config.supportForTags ? !!config.supportForTags[tag.tagName] : true;
    };
    const blockTags3 = [];
    const inlineTags3 = [];
    const modifierTags3 = [];
    if (!config.noStandardTags) {
      blockTags3.push(...tsdocBlockTags);
      inlineTags3.push(...tsdocInlineTags);
      modifierTags3.push(...tsdocModifierTags);
    }
    for (const { tagName, syntaxKind } of config.tagDefinitions?.filter(
      supported
    ) || []) {
      const arr = {
        block: blockTags3,
        inline: inlineTags3,
        modifier: modifierTags3
      }[syntaxKind];
      arr.push(tagName);
    }
    container.setValue("blockTags", unique3(blockTags3));
    container.setValue("inlineTags", unique3(inlineTags3));
    container.setValue("modifierTags", unique3(modifierTags3));
  }
  readTsDoc(logger, path) {
    if (this.seenTsdocPaths.has(path)) {
      logger.error(
        i18n9.circular_reference_extends_0(nicePath(path))
      );
      return;
    }
    this.seenTsdocPaths.add(path);
    const { config, error } = ts5.readConfigFile(
      normalizePath(path),
      ts5.sys.readFile
    );
    if (error) {
      logger.error(i18n9.failed_read_tsdoc_json_0(nicePath(path)));
      return;
    }
    if (!Validation4.validate(tsDocSchema, config)) {
      logger.error(i18n9.invalid_tsdoc_json_0(nicePath(path)));
      return;
    }
    const workingConfig = {};
    if (config.extends) {
      const resolver = createRequire3(path);
      for (const extendedPath of config.extends) {
        let resolvedPath;
        try {
          resolvedPath = resolver.resolve(extendedPath);
        } catch {
          logger.error(
            i18n9.failed_resolve_0_to_file_in_1(
              extendedPath,
              nicePath(path)
            )
          );
          return;
        }
        const parentConfig = this.readTsDoc(logger, resolvedPath);
        if (!parentConfig) return;
        mergeConfigs(parentConfig, workingConfig);
      }
    }
    mergeConfigs(config, workingConfig);
    return workingConfig;
  }
};
function mergeConfigs(from, into) {
  if (from.supportForTags) {
    into.supportForTags ||= {};
    Object.assign(into.supportForTags, from.supportForTags);
  }
  if (from.tagDefinitions) {
    into.tagDefinitions ||= [];
    into.tagDefinitions.push(...from.tagDefinitions);
  }
  into.noStandardTags = from.noStandardTags ?? into.noStandardTags;
}

// src/lib/utils/options/readers/typedoc.ts
import { dirname as dirname7, join as join6, resolve as resolve9 } from "path";
import * as FS2 from "fs";
import ts6 from "typescript";
import { ok as ok5 } from "assert";
import { createRequire as createRequire4 } from "module";
import { pathToFileURL as pathToFileURL2 } from "url";
import { i18n as i18n10 } from "#utils";
var TypeDocReader = class {
  /**
   * Should run before the tsconfig reader so that it can specify a tsconfig file to read.
   */
  order = 100;
  name = "typedoc-json";
  supportsPackages = true;
  /**
   * Read user configuration from a typedoc.json or typedoc.js configuration file.
   */
  async read(container, logger, cwd, usedFile) {
    const path = container.getValue("options") || cwd;
    const file = this.findTypedocFile(path, usedFile);
    if (!file) {
      if (container.isSet("options")) {
        logger.error(
          i18n10.options_file_0_does_not_exist(nicePath(path))
        );
      }
      return;
    }
    const seen = /* @__PURE__ */ new Set();
    await this.readFile(file, container, logger, seen);
  }
  /**
   * Read the given options file + any extended files.
   * @param file
   * @param container
   * @param logger
   */
  async readFile(file, container, logger, seen) {
    if (seen.has(file)) {
      logger.error(
        i18n10.circular_reference_extends_0(nicePath(file))
      );
      return;
    }
    seen.add(file);
    let fileContent;
    if (file.endsWith(".json") || file.endsWith(".jsonc")) {
      const readResult = ts6.readConfigFile(normalizePath(file), (path) => FS2.readFileSync(path, "utf-8"));
      if (readResult.error) {
        logger.error(
          i18n10.failed_read_options_file_0(nicePath(file))
        );
        return;
      } else {
        fileContent = readResult.config;
      }
    } else {
      try {
        const esmPath = pathToFileURL2(file).toString();
        fileContent = await (await import(esmPath)).default;
      } catch (error) {
        logger.error(
          i18n10.failed_read_options_file_0(nicePath(file))
        );
        logger.error(
          String(
            error instanceof Error ? error.message : error
          )
        );
        return;
      }
    }
    if (typeof fileContent !== "object" || !fileContent) {
      logger.error(
        i18n10.failed_read_options_file_0(nicePath(file))
      );
      return;
    }
    const data = { ...fileContent };
    delete data["$schema"];
    if ("extends" in data) {
      const resolver = createRequire4(file);
      const extended = getStringArray(data["extends"]);
      for (const extendedFile of extended) {
        let resolvedParent;
        try {
          resolvedParent = resolver.resolve(extendedFile);
        } catch {
          logger.error(
            i18n10.failed_resolve_0_to_file_in_1(
              extendedFile,
              nicePath(file)
            )
          );
          continue;
        }
        await this.readFile(resolvedParent, container, logger, seen);
      }
      delete data["extends"];
    }
    for (const [key, val] of Object.entries(data)) {
      try {
        container.setValue(
          key,
          val,
          resolve9(dirname7(file))
        );
      } catch (error) {
        ok5(error instanceof Error);
        logger.error(error.message);
      }
    }
  }
  /**
   * Search for the configuration file given path
   *
   * @param  path Path to the typedoc.(js|json) file. If path is a directory
   *   typedoc file will be attempted to be found at the root of this path
   * @returns the typedoc.(js|json) file path or undefined
   */
  findTypedocFile(path, usedFile) {
    path = resolve9(path);
    return [
      path,
      join6(path, "typedoc.json"),
      join6(path, "typedoc.jsonc"),
      join6(path, "typedoc.config.js"),
      join6(path, "typedoc.config.cjs"),
      join6(path, "typedoc.config.mjs"),
      join6(path, "typedoc.js"),
      join6(path, "typedoc.cjs"),
      join6(path, "typedoc.mjs"),
      join6(path, ".config/typedoc.json"),
      join6(path, ".config/typedoc.jsonc"),
      join6(path, ".config/typedoc.config.js"),
      join6(path, ".config/typedoc.config.cjs"),
      join6(path, ".config/typedoc.config.mjs"),
      join6(path, ".config/typedoc.js"),
      join6(path, ".config/typedoc.cjs"),
      join6(path, ".config/typedoc.mjs")
    ].find((file) => (usedFile?.(file), isFile(file)));
  }
};
function getStringArray(arg) {
  return Array.isArray(arg) ? arg.map(String) : [String(arg)];
}

// src/lib/utils/compress.ts
import { deflate } from "zlib";
import { promisify } from "util";
var deflateP = promisify(deflate);
async function compressJson(data) {
  const gz = await deflateP(Buffer.from(JSON.stringify(data)));
  return gz.toString("base64");
}

// src/lib/utils/reflections.ts
import {
  ContainerReflection,
  DeclarationReflection,
  makeRecursiveVisitor,
  ParameterReflection,
  Reflection,
  SignatureReflection,
  TypeParameterReflection
} from "#models";
function discoverAllReferenceTypes(project, forExportValidation) {
  let current = project;
  const queue = [];
  const result = [];
  const visitor = makeRecursiveVisitor({
    reference(type) {
      result.push({ type, owner: current });
    },
    reflection(type) {
      queue.push(type.declaration);
    }
  });
  const add = (item) => {
    if (!item) return;
    if (item instanceof Reflection) {
      queue.push(item);
    } else {
      queue.push(...item);
    }
  };
  do {
    if (current instanceof ContainerReflection) {
      add(current.children);
    }
    if (current instanceof DeclarationReflection) {
      current.type?.visit(visitor);
      add(current.typeParameters);
      add(current.signatures);
      add(current.indexSignatures);
      add(current.getSignature);
      add(current.setSignature);
      current.overwrites?.visit(visitor);
      current.implementedTypes?.forEach((type) => type.visit(visitor));
      if (!forExportValidation) {
        current.inheritedFrom?.visit(visitor);
        current.implementationOf?.visit(visitor);
        current.extendedTypes?.forEach((t) => t.visit(visitor));
        current.extendedBy?.forEach((t) => t.visit(visitor));
        current.implementedBy?.forEach((t) => t.visit(visitor));
      }
    }
    if (current instanceof SignatureReflection) {
      add(current.parameters);
      add(current.typeParameters);
      current.type?.visit(visitor);
      current.overwrites?.visit(visitor);
      if (!forExportValidation) {
        current.inheritedFrom?.visit(visitor);
        current.implementationOf?.visit(visitor);
      }
    }
    if (current instanceof ParameterReflection) {
      current.type?.visit(visitor);
    }
    if (current instanceof TypeParameterReflection) {
      current.type?.visit(visitor);
      current.default?.visit(visitor);
    }
  } while (current = queue.shift());
  return result;
}

// src/lib/utils/html.ts
import { assertNever as assertNever2 } from "#utils";

// src/lib/utils/html-entities.ts
var htmlEntities = {
  AElig: { p: [198], c: "\xC6" },
  "AElig;": { p: [198], c: "\xC6" },
  AMP: { p: [38], c: "&" },
  "AMP;": { p: [38], c: "&" },
  Aacute: { p: [193], c: "\xC1" },
  "Aacute;": { p: [193], c: "\xC1" },
  "Abreve;": { p: [258], c: "\u0102" },
  Acirc: { p: [194], c: "\xC2" },
  "Acirc;": { p: [194], c: "\xC2" },
  "Acy;": { p: [1040], c: "\u0410" },
  "Afr;": { p: [120068], c: "\u{1D504}" },
  Agrave: { p: [192], c: "\xC0" },
  "Agrave;": { p: [192], c: "\xC0" },
  "Alpha;": { p: [913], c: "\u0391" },
  "Amacr;": { p: [256], c: "\u0100" },
  "And;": { p: [10835], c: "\u2A53" },
  "Aogon;": { p: [260], c: "\u0104" },
  "Aopf;": { p: [120120], c: "\u{1D538}" },
  "ApplyFunction;": { p: [8289], c: "\u2061" },
  Aring: { p: [197], c: "\xC5" },
  "Aring;": { p: [197], c: "\xC5" },
  "Ascr;": { p: [119964], c: "\u{1D49C}" },
  "Assign;": { p: [8788], c: "\u2254" },
  Atilde: { p: [195], c: "\xC3" },
  "Atilde;": { p: [195], c: "\xC3" },
  Auml: { p: [196], c: "\xC4" },
  "Auml;": { p: [196], c: "\xC4" },
  "Backslash;": { p: [8726], c: "\u2216" },
  "Barv;": { p: [10983], c: "\u2AE7" },
  "Barwed;": { p: [8966], c: "\u2306" },
  "Bcy;": { p: [1041], c: "\u0411" },
  "Because;": { p: [8757], c: "\u2235" },
  "Bernoullis;": { p: [8492], c: "\u212C" },
  "Beta;": { p: [914], c: "\u0392" },
  "Bfr;": { p: [120069], c: "\u{1D505}" },
  "Bopf;": { p: [120121], c: "\u{1D539}" },
  "Breve;": { p: [728], c: "\u02D8" },
  "Bscr;": { p: [8492], c: "\u212C" },
  "Bumpeq;": { p: [8782], c: "\u224E" },
  "CHcy;": { p: [1063], c: "\u0427" },
  COPY: { p: [169], c: "\xA9" },
  "COPY;": { p: [169], c: "\xA9" },
  "Cacute;": { p: [262], c: "\u0106" },
  "Cap;": { p: [8914], c: "\u22D2" },
  "CapitalDifferentialD;": { p: [8517], c: "\u2145" },
  "Cayleys;": { p: [8493], c: "\u212D" },
  "Ccaron;": { p: [268], c: "\u010C" },
  Ccedil: { p: [199], c: "\xC7" },
  "Ccedil;": { p: [199], c: "\xC7" },
  "Ccirc;": { p: [264], c: "\u0108" },
  "Cconint;": { p: [8752], c: "\u2230" },
  "Cdot;": { p: [266], c: "\u010A" },
  "Cedilla;": { p: [184], c: "\xB8" },
  "CenterDot;": { p: [183], c: "\xB7" },
  "Cfr;": { p: [8493], c: "\u212D" },
  "Chi;": { p: [935], c: "\u03A7" },
  "CircleDot;": { p: [8857], c: "\u2299" },
  "CircleMinus;": { p: [8854], c: "\u2296" },
  "CirclePlus;": { p: [8853], c: "\u2295" },
  "CircleTimes;": { p: [8855], c: "\u2297" },
  "ClockwiseContourIntegral;": {
    p: [8754],
    c: "\u2232"
  },
  "CloseCurlyDoubleQuote;": { p: [8221], c: "\u201D" },
  "CloseCurlyQuote;": { p: [8217], c: "\u2019" },
  "Colon;": { p: [8759], c: "\u2237" },
  "Colone;": { p: [10868], c: "\u2A74" },
  "Congruent;": { p: [8801], c: "\u2261" },
  "Conint;": { p: [8751], c: "\u222F" },
  "ContourIntegral;": { p: [8750], c: "\u222E" },
  "Copf;": { p: [8450], c: "\u2102" },
  "Coproduct;": { p: [8720], c: "\u2210" },
  "CounterClockwiseContourIntegral;": {
    p: [8755],
    c: "\u2233"
  },
  "Cross;": { p: [10799], c: "\u2A2F" },
  "Cscr;": { p: [119966], c: "\u{1D49E}" },
  "Cup;": { p: [8915], c: "\u22D3" },
  "CupCap;": { p: [8781], c: "\u224D" },
  "DD;": { p: [8517], c: "\u2145" },
  "DDotrahd;": { p: [10513], c: "\u2911" },
  "DJcy;": { p: [1026], c: "\u0402" },
  "DScy;": { p: [1029], c: "\u0405" },
  "DZcy;": { p: [1039], c: "\u040F" },
  "Dagger;": { p: [8225], c: "\u2021" },
  "Darr;": { p: [8609], c: "\u21A1" },
  "Dashv;": { p: [10980], c: "\u2AE4" },
  "Dcaron;": { p: [270], c: "\u010E" },
  "Dcy;": { p: [1044], c: "\u0414" },
  "Del;": { p: [8711], c: "\u2207" },
  "Delta;": { p: [916], c: "\u0394" },
  "Dfr;": { p: [120071], c: "\u{1D507}" },
  "DiacriticalAcute;": { p: [180], c: "\xB4" },
  "DiacriticalDot;": { p: [729], c: "\u02D9" },
  "DiacriticalDoubleAcute;": { p: [733], c: "\u02DD" },
  "DiacriticalGrave;": { p: [96], c: "`" },
  "DiacriticalTilde;": { p: [732], c: "\u02DC" },
  "Diamond;": { p: [8900], c: "\u22C4" },
  "DifferentialD;": { p: [8518], c: "\u2146" },
  "Dopf;": { p: [120123], c: "\u{1D53B}" },
  "Dot;": { p: [168], c: "\xA8" },
  "DotDot;": { p: [8412], c: "\u20DC" },
  "DotEqual;": { p: [8784], c: "\u2250" },
  "DoubleContourIntegral;": { p: [8751], c: "\u222F" },
  "DoubleDot;": { p: [168], c: "\xA8" },
  "DoubleDownArrow;": { p: [8659], c: "\u21D3" },
  "DoubleLeftArrow;": { p: [8656], c: "\u21D0" },
  "DoubleLeftRightArrow;": { p: [8660], c: "\u21D4" },
  "DoubleLeftTee;": { p: [10980], c: "\u2AE4" },
  "DoubleLongLeftArrow;": { p: [10232], c: "\u27F8" },
  "DoubleLongLeftRightArrow;": {
    p: [10234],
    c: "\u27FA"
  },
  "DoubleLongRightArrow;": { p: [10233], c: "\u27F9" },
  "DoubleRightArrow;": { p: [8658], c: "\u21D2" },
  "DoubleRightTee;": { p: [8872], c: "\u22A8" },
  "DoubleUpArrow;": { p: [8657], c: "\u21D1" },
  "DoubleUpDownArrow;": { p: [8661], c: "\u21D5" },
  "DoubleVerticalBar;": { p: [8741], c: "\u2225" },
  "DownArrow;": { p: [8595], c: "\u2193" },
  "DownArrowBar;": { p: [10515], c: "\u2913" },
  "DownArrowUpArrow;": { p: [8693], c: "\u21F5" },
  "DownBreve;": { p: [785], c: "\u0311" },
  "DownLeftRightVector;": { p: [10576], c: "\u2950" },
  "DownLeftTeeVector;": { p: [10590], c: "\u295E" },
  "DownLeftVector;": { p: [8637], c: "\u21BD" },
  "DownLeftVectorBar;": { p: [10582], c: "\u2956" },
  "DownRightTeeVector;": { p: [10591], c: "\u295F" },
  "DownRightVector;": { p: [8641], c: "\u21C1" },
  "DownRightVectorBar;": { p: [10583], c: "\u2957" },
  "DownTee;": { p: [8868], c: "\u22A4" },
  "DownTeeArrow;": { p: [8615], c: "\u21A7" },
  "Downarrow;": { p: [8659], c: "\u21D3" },
  "Dscr;": { p: [119967], c: "\u{1D49F}" },
  "Dstrok;": { p: [272], c: "\u0110" },
  "ENG;": { p: [330], c: "\u014A" },
  ETH: { p: [208], c: "\xD0" },
  "ETH;": { p: [208], c: "\xD0" },
  Eacute: { p: [201], c: "\xC9" },
  "Eacute;": { p: [201], c: "\xC9" },
  "Ecaron;": { p: [282], c: "\u011A" },
  Ecirc: { p: [202], c: "\xCA" },
  "Ecirc;": { p: [202], c: "\xCA" },
  "Ecy;": { p: [1069], c: "\u042D" },
  "Edot;": { p: [278], c: "\u0116" },
  "Efr;": { p: [120072], c: "\u{1D508}" },
  Egrave: { p: [200], c: "\xC8" },
  "Egrave;": { p: [200], c: "\xC8" },
  "Element;": { p: [8712], c: "\u2208" },
  "Emacr;": { p: [274], c: "\u0112" },
  "EmptySmallSquare;": { p: [9723], c: "\u25FB" },
  "EmptyVerySmallSquare;": { p: [9643], c: "\u25AB" },
  "Eogon;": { p: [280], c: "\u0118" },
  "Eopf;": { p: [120124], c: "\u{1D53C}" },
  "Epsilon;": { p: [917], c: "\u0395" },
  "Equal;": { p: [10869], c: "\u2A75" },
  "EqualTilde;": { p: [8770], c: "\u2242" },
  "Equilibrium;": { p: [8652], c: "\u21CC" },
  "Escr;": { p: [8496], c: "\u2130" },
  "Esim;": { p: [10867], c: "\u2A73" },
  "Eta;": { p: [919], c: "\u0397" },
  Euml: { p: [203], c: "\xCB" },
  "Euml;": { p: [203], c: "\xCB" },
  "Exists;": { p: [8707], c: "\u2203" },
  "ExponentialE;": { p: [8519], c: "\u2147" },
  "Fcy;": { p: [1060], c: "\u0424" },
  "Ffr;": { p: [120073], c: "\u{1D509}" },
  "FilledSmallSquare;": { p: [9724], c: "\u25FC" },
  "FilledVerySmallSquare;": { p: [9642], c: "\u25AA" },
  "Fopf;": { p: [120125], c: "\u{1D53D}" },
  "ForAll;": { p: [8704], c: "\u2200" },
  "Fouriertrf;": { p: [8497], c: "\u2131" },
  "Fscr;": { p: [8497], c: "\u2131" },
  "GJcy;": { p: [1027], c: "\u0403" },
  GT: { p: [62], c: ">" },
  "GT;": { p: [62], c: ">" },
  "Gamma;": { p: [915], c: "\u0393" },
  "Gammad;": { p: [988], c: "\u03DC" },
  "Gbreve;": { p: [286], c: "\u011E" },
  "Gcedil;": { p: [290], c: "\u0122" },
  "Gcirc;": { p: [284], c: "\u011C" },
  "Gcy;": { p: [1043], c: "\u0413" },
  "Gdot;": { p: [288], c: "\u0120" },
  "Gfr;": { p: [120074], c: "\u{1D50A}" },
  "Gg;": { p: [8921], c: "\u22D9" },
  "Gopf;": { p: [120126], c: "\u{1D53E}" },
  "GreaterEqual;": { p: [8805], c: "\u2265" },
  "GreaterEqualLess;": { p: [8923], c: "\u22DB" },
  "GreaterFullEqual;": { p: [8807], c: "\u2267" },
  "GreaterGreater;": { p: [10914], c: "\u2AA2" },
  "GreaterLess;": { p: [8823], c: "\u2277" },
  "GreaterSlantEqual;": { p: [10878], c: "\u2A7E" },
  "GreaterTilde;": { p: [8819], c: "\u2273" },
  "Gscr;": { p: [119970], c: "\u{1D4A2}" },
  "Gt;": { p: [8811], c: "\u226B" },
  "HARDcy;": { p: [1066], c: "\u042A" },
  "Hacek;": { p: [711], c: "\u02C7" },
  "Hat;": { p: [94], c: "^" },
  "Hcirc;": { p: [292], c: "\u0124" },
  "Hfr;": { p: [8460], c: "\u210C" },
  "HilbertSpace;": { p: [8459], c: "\u210B" },
  "Hopf;": { p: [8461], c: "\u210D" },
  "HorizontalLine;": { p: [9472], c: "\u2500" },
  "Hscr;": { p: [8459], c: "\u210B" },
  "Hstrok;": { p: [294], c: "\u0126" },
  "HumpDownHump;": { p: [8782], c: "\u224E" },
  "HumpEqual;": { p: [8783], c: "\u224F" },
  "IEcy;": { p: [1045], c: "\u0415" },
  "IJlig;": { p: [306], c: "\u0132" },
  "IOcy;": { p: [1025], c: "\u0401" },
  Iacute: { p: [205], c: "\xCD" },
  "Iacute;": { p: [205], c: "\xCD" },
  Icirc: { p: [206], c: "\xCE" },
  "Icirc;": { p: [206], c: "\xCE" },
  "Icy;": { p: [1048], c: "\u0418" },
  "Idot;": { p: [304], c: "\u0130" },
  "Ifr;": { p: [8465], c: "\u2111" },
  Igrave: { p: [204], c: "\xCC" },
  "Igrave;": { p: [204], c: "\xCC" },
  "Im;": { p: [8465], c: "\u2111" },
  "Imacr;": { p: [298], c: "\u012A" },
  "ImaginaryI;": { p: [8520], c: "\u2148" },
  "Implies;": { p: [8658], c: "\u21D2" },
  "Int;": { p: [8748], c: "\u222C" },
  "Integral;": { p: [8747], c: "\u222B" },
  "Intersection;": { p: [8898], c: "\u22C2" },
  "InvisibleComma;": { p: [8291], c: "\u2063" },
  "InvisibleTimes;": { p: [8290], c: "\u2062" },
  "Iogon;": { p: [302], c: "\u012E" },
  "Iopf;": { p: [120128], c: "\u{1D540}" },
  "Iota;": { p: [921], c: "\u0399" },
  "Iscr;": { p: [8464], c: "\u2110" },
  "Itilde;": { p: [296], c: "\u0128" },
  "Iukcy;": { p: [1030], c: "\u0406" },
  Iuml: { p: [207], c: "\xCF" },
  "Iuml;": { p: [207], c: "\xCF" },
  "Jcirc;": { p: [308], c: "\u0134" },
  "Jcy;": { p: [1049], c: "\u0419" },
  "Jfr;": { p: [120077], c: "\u{1D50D}" },
  "Jopf;": { p: [120129], c: "\u{1D541}" },
  "Jscr;": { p: [119973], c: "\u{1D4A5}" },
  "Jsercy;": { p: [1032], c: "\u0408" },
  "Jukcy;": { p: [1028], c: "\u0404" },
  "KHcy;": { p: [1061], c: "\u0425" },
  "KJcy;": { p: [1036], c: "\u040C" },
  "Kappa;": { p: [922], c: "\u039A" },
  "Kcedil;": { p: [310], c: "\u0136" },
  "Kcy;": { p: [1050], c: "\u041A" },
  "Kfr;": { p: [120078], c: "\u{1D50E}" },
  "Kopf;": { p: [120130], c: "\u{1D542}" },
  "Kscr;": { p: [119974], c: "\u{1D4A6}" },
  "LJcy;": { p: [1033], c: "\u0409" },
  LT: { p: [60], c: "<" },
  "LT;": { p: [60], c: "<" },
  "Lacute;": { p: [313], c: "\u0139" },
  "Lambda;": { p: [923], c: "\u039B" },
  "Lang;": { p: [10218], c: "\u27EA" },
  "Laplacetrf;": { p: [8466], c: "\u2112" },
  "Larr;": { p: [8606], c: "\u219E" },
  "Lcaron;": { p: [317], c: "\u013D" },
  "Lcedil;": { p: [315], c: "\u013B" },
  "Lcy;": { p: [1051], c: "\u041B" },
  "LeftAngleBracket;": { p: [10216], c: "\u27E8" },
  "LeftArrow;": { p: [8592], c: "\u2190" },
  "LeftArrowBar;": { p: [8676], c: "\u21E4" },
  "LeftArrowRightArrow;": { p: [8646], c: "\u21C6" },
  "LeftCeiling;": { p: [8968], c: "\u2308" },
  "LeftDoubleBracket;": { p: [10214], c: "\u27E6" },
  "LeftDownTeeVector;": { p: [10593], c: "\u2961" },
  "LeftDownVector;": { p: [8643], c: "\u21C3" },
  "LeftDownVectorBar;": { p: [10585], c: "\u2959" },
  "LeftFloor;": { p: [8970], c: "\u230A" },
  "LeftRightArrow;": { p: [8596], c: "\u2194" },
  "LeftRightVector;": { p: [10574], c: "\u294E" },
  "LeftTee;": { p: [8867], c: "\u22A3" },
  "LeftTeeArrow;": { p: [8612], c: "\u21A4" },
  "LeftTeeVector;": { p: [10586], c: "\u295A" },
  "LeftTriangle;": { p: [8882], c: "\u22B2" },
  "LeftTriangleBar;": { p: [10703], c: "\u29CF" },
  "LeftTriangleEqual;": { p: [8884], c: "\u22B4" },
  "LeftUpDownVector;": { p: [10577], c: "\u2951" },
  "LeftUpTeeVector;": { p: [10592], c: "\u2960" },
  "LeftUpVector;": { p: [8639], c: "\u21BF" },
  "LeftUpVectorBar;": { p: [10584], c: "\u2958" },
  "LeftVector;": { p: [8636], c: "\u21BC" },
  "LeftVectorBar;": { p: [10578], c: "\u2952" },
  "Leftarrow;": { p: [8656], c: "\u21D0" },
  "Leftrightarrow;": { p: [8660], c: "\u21D4" },
  "LessEqualGreater;": { p: [8922], c: "\u22DA" },
  "LessFullEqual;": { p: [8806], c: "\u2266" },
  "LessGreater;": { p: [8822], c: "\u2276" },
  "LessLess;": { p: [10913], c: "\u2AA1" },
  "LessSlantEqual;": { p: [10877], c: "\u2A7D" },
  "LessTilde;": { p: [8818], c: "\u2272" },
  "Lfr;": { p: [120079], c: "\u{1D50F}" },
  "Ll;": { p: [8920], c: "\u22D8" },
  "Lleftarrow;": { p: [8666], c: "\u21DA" },
  "Lmidot;": { p: [319], c: "\u013F" },
  "LongLeftArrow;": { p: [10229], c: "\u27F5" },
  "LongLeftRightArrow;": { p: [10231], c: "\u27F7" },
  "LongRightArrow;": { p: [10230], c: "\u27F6" },
  "Longleftarrow;": { p: [10232], c: "\u27F8" },
  "Longleftrightarrow;": { p: [10234], c: "\u27FA" },
  "Longrightarrow;": { p: [10233], c: "\u27F9" },
  "Lopf;": { p: [120131], c: "\u{1D543}" },
  "LowerLeftArrow;": { p: [8601], c: "\u2199" },
  "LowerRightArrow;": { p: [8600], c: "\u2198" },
  "Lscr;": { p: [8466], c: "\u2112" },
  "Lsh;": { p: [8624], c: "\u21B0" },
  "Lstrok;": { p: [321], c: "\u0141" },
  "Lt;": { p: [8810], c: "\u226A" },
  "Map;": { p: [10501], c: "\u2905" },
  "Mcy;": { p: [1052], c: "\u041C" },
  "MediumSpace;": { p: [8287], c: "\u205F" },
  "Mellintrf;": { p: [8499], c: "\u2133" },
  "Mfr;": { p: [120080], c: "\u{1D510}" },
  "MinusPlus;": { p: [8723], c: "\u2213" },
  "Mopf;": { p: [120132], c: "\u{1D544}" },
  "Mscr;": { p: [8499], c: "\u2133" },
  "Mu;": { p: [924], c: "\u039C" },
  "NJcy;": { p: [1034], c: "\u040A" },
  "Nacute;": { p: [323], c: "\u0143" },
  "Ncaron;": { p: [327], c: "\u0147" },
  "Ncedil;": { p: [325], c: "\u0145" },
  "Ncy;": { p: [1053], c: "\u041D" },
  "NegativeMediumSpace;": { p: [8203], c: "\u200B" },
  "NegativeThickSpace;": { p: [8203], c: "\u200B" },
  "NegativeThinSpace;": { p: [8203], c: "\u200B" },
  "NegativeVeryThinSpace;": { p: [8203], c: "\u200B" },
  "NestedGreaterGreater;": { p: [8811], c: "\u226B" },
  "NestedLessLess;": { p: [8810], c: "\u226A" },
  "NewLine;": { p: [10], c: "\n" },
  "Nfr;": { p: [120081], c: "\u{1D511}" },
  "NoBreak;": { p: [8288], c: "\u2060" },
  "NonBreakingSpace;": { p: [160], c: "\xA0" },
  "Nopf;": { p: [8469], c: "\u2115" },
  "Not;": { p: [10988], c: "\u2AEC" },
  "NotCongruent;": { p: [8802], c: "\u2262" },
  "NotCupCap;": { p: [8813], c: "\u226D" },
  "NotDoubleVerticalBar;": { p: [8742], c: "\u2226" },
  "NotElement;": { p: [8713], c: "\u2209" },
  "NotEqual;": { p: [8800], c: "\u2260" },
  "NotEqualTilde;": {
    p: [8770, 824],
    c: "\u2242\u0338"
  },
  "NotExists;": { p: [8708], c: "\u2204" },
  "NotGreater;": { p: [8815], c: "\u226F" },
  "NotGreaterEqual;": { p: [8817], c: "\u2271" },
  "NotGreaterFullEqual;": {
    p: [8807, 824],
    c: "\u2267\u0338"
  },
  "NotGreaterGreater;": {
    p: [8811, 824],
    c: "\u226B\u0338"
  },
  "NotGreaterLess;": { p: [8825], c: "\u2279" },
  "NotGreaterSlantEqual;": {
    p: [10878, 824],
    c: "\u2A7E\u0338"
  },
  "NotGreaterTilde;": { p: [8821], c: "\u2275" },
  "NotHumpDownHump;": {
    p: [8782, 824],
    c: "\u224E\u0338"
  },
  "NotHumpEqual;": {
    p: [8783, 824],
    c: "\u224F\u0338"
  },
  "NotLeftTriangle;": { p: [8938], c: "\u22EA" },
  "NotLeftTriangleBar;": {
    p: [10703, 824],
    c: "\u29CF\u0338"
  },
  "NotLeftTriangleEqual;": { p: [8940], c: "\u22EC" },
  "NotLess;": { p: [8814], c: "\u226E" },
  "NotLessEqual;": { p: [8816], c: "\u2270" },
  "NotLessGreater;": { p: [8824], c: "\u2278" },
  "NotLessLess;": {
    p: [8810, 824],
    c: "\u226A\u0338"
  },
  "NotLessSlantEqual;": {
    p: [10877, 824],
    c: "\u2A7D\u0338"
  },
  "NotLessTilde;": { p: [8820], c: "\u2274" },
  "NotNestedGreaterGreater;": {
    p: [10914, 824],
    c: "\u2AA2\u0338"
  },
  "NotNestedLessLess;": {
    p: [10913, 824],
    c: "\u2AA1\u0338"
  },
  "NotPrecedes;": { p: [8832], c: "\u2280" },
  "NotPrecedesEqual;": {
    p: [10927, 824],
    c: "\u2AAF\u0338"
  },
  "NotPrecedesSlantEqual;": { p: [8928], c: "\u22E0" },
  "NotReverseElement;": { p: [8716], c: "\u220C" },
  "NotRightTriangle;": { p: [8939], c: "\u22EB" },
  "NotRightTriangleBar;": {
    p: [10704, 824],
    c: "\u29D0\u0338"
  },
  "NotRightTriangleEqual;": { p: [8941], c: "\u22ED" },
  "NotSquareSubset;": {
    p: [8847, 824],
    c: "\u228F\u0338"
  },
  "NotSquareSubsetEqual;": { p: [8930], c: "\u22E2" },
  "NotSquareSuperset;": {
    p: [8848, 824],
    c: "\u2290\u0338"
  },
  "NotSquareSupersetEqual;": {
    p: [8931],
    c: "\u22E3"
  },
  "NotSubset;": { p: [8834, 8402], c: "\u2282\u20D2" },
  "NotSubsetEqual;": { p: [8840], c: "\u2288" },
  "NotSucceeds;": { p: [8833], c: "\u2281" },
  "NotSucceedsEqual;": {
    p: [10928, 824],
    c: "\u2AB0\u0338"
  },
  "NotSucceedsSlantEqual;": { p: [8929], c: "\u22E1" },
  "NotSucceedsTilde;": {
    p: [8831, 824],
    c: "\u227F\u0338"
  },
  "NotSuperset;": {
    p: [8835, 8402],
    c: "\u2283\u20D2"
  },
  "NotSupersetEqual;": { p: [8841], c: "\u2289" },
  "NotTilde;": { p: [8769], c: "\u2241" },
  "NotTildeEqual;": { p: [8772], c: "\u2244" },
  "NotTildeFullEqual;": { p: [8775], c: "\u2247" },
  "NotTildeTilde;": { p: [8777], c: "\u2249" },
  "NotVerticalBar;": { p: [8740], c: "\u2224" },
  "Nscr;": { p: [119977], c: "\u{1D4A9}" },
  Ntilde: { p: [209], c: "\xD1" },
  "Ntilde;": { p: [209], c: "\xD1" },
  "Nu;": { p: [925], c: "\u039D" },
  "OElig;": { p: [338], c: "\u0152" },
  Oacute: { p: [211], c: "\xD3" },
  "Oacute;": { p: [211], c: "\xD3" },
  Ocirc: { p: [212], c: "\xD4" },
  "Ocirc;": { p: [212], c: "\xD4" },
  "Ocy;": { p: [1054], c: "\u041E" },
  "Odblac;": { p: [336], c: "\u0150" },
  "Ofr;": { p: [120082], c: "\u{1D512}" },
  Ograve: { p: [210], c: "\xD2" },
  "Ograve;": { p: [210], c: "\xD2" },
  "Omacr;": { p: [332], c: "\u014C" },
  "Omega;": { p: [937], c: "\u03A9" },
  "Omicron;": { p: [927], c: "\u039F" },
  "Oopf;": { p: [120134], c: "\u{1D546}" },
  "OpenCurlyDoubleQuote;": { p: [8220], c: "\u201C" },
  "OpenCurlyQuote;": { p: [8216], c: "\u2018" },
  "Or;": { p: [10836], c: "\u2A54" },
  "Oscr;": { p: [119978], c: "\u{1D4AA}" },
  Oslash: { p: [216], c: "\xD8" },
  "Oslash;": { p: [216], c: "\xD8" },
  Otilde: { p: [213], c: "\xD5" },
  "Otilde;": { p: [213], c: "\xD5" },
  "Otimes;": { p: [10807], c: "\u2A37" },
  Ouml: { p: [214], c: "\xD6" },
  "Ouml;": { p: [214], c: "\xD6" },
  "OverBar;": { p: [8254], c: "\u203E" },
  "OverBrace;": { p: [9182], c: "\u23DE" },
  "OverBracket;": { p: [9140], c: "\u23B4" },
  "OverParenthesis;": { p: [9180], c: "\u23DC" },
  "PartialD;": { p: [8706], c: "\u2202" },
  "Pcy;": { p: [1055], c: "\u041F" },
  "Pfr;": { p: [120083], c: "\u{1D513}" },
  "Phi;": { p: [934], c: "\u03A6" },
  "Pi;": { p: [928], c: "\u03A0" },
  "PlusMinus;": { p: [177], c: "\xB1" },
  "Poincareplane;": { p: [8460], c: "\u210C" },
  "Popf;": { p: [8473], c: "\u2119" },
  "Pr;": { p: [10939], c: "\u2ABB" },
  "Precedes;": { p: [8826], c: "\u227A" },
  "PrecedesEqual;": { p: [10927], c: "\u2AAF" },
  "PrecedesSlantEqual;": { p: [8828], c: "\u227C" },
  "PrecedesTilde;": { p: [8830], c: "\u227E" },
  "Prime;": { p: [8243], c: "\u2033" },
  "Product;": { p: [8719], c: "\u220F" },
  "Proportion;": { p: [8759], c: "\u2237" },
  "Proportional;": { p: [8733], c: "\u221D" },
  "Pscr;": { p: [119979], c: "\u{1D4AB}" },
  "Psi;": { p: [936], c: "\u03A8" },
  QUOT: { p: [34], c: '"' },
  "QUOT;": { p: [34], c: '"' },
  "Qfr;": { p: [120084], c: "\u{1D514}" },
  "Qopf;": { p: [8474], c: "\u211A" },
  "Qscr;": { p: [119980], c: "\u{1D4AC}" },
  "RBarr;": { p: [10512], c: "\u2910" },
  REG: { p: [174], c: "\xAE" },
  "REG;": { p: [174], c: "\xAE" },
  "Racute;": { p: [340], c: "\u0154" },
  "Rang;": { p: [10219], c: "\u27EB" },
  "Rarr;": { p: [8608], c: "\u21A0" },
  "Rarrtl;": { p: [10518], c: "\u2916" },
  "Rcaron;": { p: [344], c: "\u0158" },
  "Rcedil;": { p: [342], c: "\u0156" },
  "Rcy;": { p: [1056], c: "\u0420" },
  "Re;": { p: [8476], c: "\u211C" },
  "ReverseElement;": { p: [8715], c: "\u220B" },
  "ReverseEquilibrium;": { p: [8651], c: "\u21CB" },
  "ReverseUpEquilibrium;": { p: [10607], c: "\u296F" },
  "Rfr;": { p: [8476], c: "\u211C" },
  "Rho;": { p: [929], c: "\u03A1" },
  "RightAngleBracket;": { p: [10217], c: "\u27E9" },
  "RightArrow;": { p: [8594], c: "\u2192" },
  "RightArrowBar;": { p: [8677], c: "\u21E5" },
  "RightArrowLeftArrow;": { p: [8644], c: "\u21C4" },
  "RightCeiling;": { p: [8969], c: "\u2309" },
  "RightDoubleBracket;": { p: [10215], c: "\u27E7" },
  "RightDownTeeVector;": { p: [10589], c: "\u295D" },
  "RightDownVector;": { p: [8642], c: "\u21C2" },
  "RightDownVectorBar;": { p: [10581], c: "\u2955" },
  "RightFloor;": { p: [8971], c: "\u230B" },
  "RightTee;": { p: [8866], c: "\u22A2" },
  "RightTeeArrow;": { p: [8614], c: "\u21A6" },
  "RightTeeVector;": { p: [10587], c: "\u295B" },
  "RightTriangle;": { p: [8883], c: "\u22B3" },
  "RightTriangleBar;": { p: [10704], c: "\u29D0" },
  "RightTriangleEqual;": { p: [8885], c: "\u22B5" },
  "RightUpDownVector;": { p: [10575], c: "\u294F" },
  "RightUpTeeVector;": { p: [10588], c: "\u295C" },
  "RightUpVector;": { p: [8638], c: "\u21BE" },
  "RightUpVectorBar;": { p: [10580], c: "\u2954" },
  "RightVector;": { p: [8640], c: "\u21C0" },
  "RightVectorBar;": { p: [10579], c: "\u2953" },
  "Rightarrow;": { p: [8658], c: "\u21D2" },
  "Ropf;": { p: [8477], c: "\u211D" },
  "RoundImplies;": { p: [10608], c: "\u2970" },
  "Rrightarrow;": { p: [8667], c: "\u21DB" },
  "Rscr;": { p: [8475], c: "\u211B" },
  "Rsh;": { p: [8625], c: "\u21B1" },
  "RuleDelayed;": { p: [10740], c: "\u29F4" },
  "SHCHcy;": { p: [1065], c: "\u0429" },
  "SHcy;": { p: [1064], c: "\u0428" },
  "SOFTcy;": { p: [1068], c: "\u042C" },
  "Sacute;": { p: [346], c: "\u015A" },
  "Sc;": { p: [10940], c: "\u2ABC" },
  "Scaron;": { p: [352], c: "\u0160" },
  "Scedil;": { p: [350], c: "\u015E" },
  "Scirc;": { p: [348], c: "\u015C" },
  "Scy;": { p: [1057], c: "\u0421" },
  "Sfr;": { p: [120086], c: "\u{1D516}" },
  "ShortDownArrow;": { p: [8595], c: "\u2193" },
  "ShortLeftArrow;": { p: [8592], c: "\u2190" },
  "ShortRightArrow;": { p: [8594], c: "\u2192" },
  "ShortUpArrow;": { p: [8593], c: "\u2191" },
  "Sigma;": { p: [931], c: "\u03A3" },
  "SmallCircle;": { p: [8728], c: "\u2218" },
  "Sopf;": { p: [120138], c: "\u{1D54A}" },
  "Sqrt;": { p: [8730], c: "\u221A" },
  "Square;": { p: [9633], c: "\u25A1" },
  "SquareIntersection;": { p: [8851], c: "\u2293" },
  "SquareSubset;": { p: [8847], c: "\u228F" },
  "SquareSubsetEqual;": { p: [8849], c: "\u2291" },
  "SquareSuperset;": { p: [8848], c: "\u2290" },
  "SquareSupersetEqual;": { p: [8850], c: "\u2292" },
  "SquareUnion;": { p: [8852], c: "\u2294" },
  "Sscr;": { p: [119982], c: "\u{1D4AE}" },
  "Star;": { p: [8902], c: "\u22C6" },
  "Sub;": { p: [8912], c: "\u22D0" },
  "Subset;": { p: [8912], c: "\u22D0" },
  "SubsetEqual;": { p: [8838], c: "\u2286" },
  "Succeeds;": { p: [8827], c: "\u227B" },
  "SucceedsEqual;": { p: [10928], c: "\u2AB0" },
  "SucceedsSlantEqual;": { p: [8829], c: "\u227D" },
  "SucceedsTilde;": { p: [8831], c: "\u227F" },
  "SuchThat;": { p: [8715], c: "\u220B" },
  "Sum;": { p: [8721], c: "\u2211" },
  "Sup;": { p: [8913], c: "\u22D1" },
  "Superset;": { p: [8835], c: "\u2283" },
  "SupersetEqual;": { p: [8839], c: "\u2287" },
  "Supset;": { p: [8913], c: "\u22D1" },
  THORN: { p: [222], c: "\xDE" },
  "THORN;": { p: [222], c: "\xDE" },
  "TRADE;": { p: [8482], c: "\u2122" },
  "TSHcy;": { p: [1035], c: "\u040B" },
  "TScy;": { p: [1062], c: "\u0426" },
  "Tab;": { p: [9], c: "	" },
  "Tau;": { p: [932], c: "\u03A4" },
  "Tcaron;": { p: [356], c: "\u0164" },
  "Tcedil;": { p: [354], c: "\u0162" },
  "Tcy;": { p: [1058], c: "\u0422" },
  "Tfr;": { p: [120087], c: "\u{1D517}" },
  "Therefore;": { p: [8756], c: "\u2234" },
  "Theta;": { p: [920], c: "\u0398" },
  "ThickSpace;": {
    p: [8287, 8202],
    c: "\u205F\u200A"
  },
  "ThinSpace;": { p: [8201], c: "\u2009" },
  "Tilde;": { p: [8764], c: "\u223C" },
  "TildeEqual;": { p: [8771], c: "\u2243" },
  "TildeFullEqual;": { p: [8773], c: "\u2245" },
  "TildeTilde;": { p: [8776], c: "\u2248" },
  "Topf;": { p: [120139], c: "\u{1D54B}" },
  "TripleDot;": { p: [8411], c: "\u20DB" },
  "Tscr;": { p: [119983], c: "\u{1D4AF}" },
  "Tstrok;": { p: [358], c: "\u0166" },
  Uacute: { p: [218], c: "\xDA" },
  "Uacute;": { p: [218], c: "\xDA" },
  "Uarr;": { p: [8607], c: "\u219F" },
  "Uarrocir;": { p: [10569], c: "\u2949" },
  "Ubrcy;": { p: [1038], c: "\u040E" },
  "Ubreve;": { p: [364], c: "\u016C" },
  Ucirc: { p: [219], c: "\xDB" },
  "Ucirc;": { p: [219], c: "\xDB" },
  "Ucy;": { p: [1059], c: "\u0423" },
  "Udblac;": { p: [368], c: "\u0170" },
  "Ufr;": { p: [120088], c: "\u{1D518}" },
  Ugrave: { p: [217], c: "\xD9" },
  "Ugrave;": { p: [217], c: "\xD9" },
  "Umacr;": { p: [362], c: "\u016A" },
  "UnderBar;": { p: [95], c: "_" },
  "UnderBrace;": { p: [9183], c: "\u23DF" },
  "UnderBracket;": { p: [9141], c: "\u23B5" },
  "UnderParenthesis;": { p: [9181], c: "\u23DD" },
  "Union;": { p: [8899], c: "\u22C3" },
  "UnionPlus;": { p: [8846], c: "\u228E" },
  "Uogon;": { p: [370], c: "\u0172" },
  "Uopf;": { p: [120140], c: "\u{1D54C}" },
  "UpArrow;": { p: [8593], c: "\u2191" },
  "UpArrowBar;": { p: [10514], c: "\u2912" },
  "UpArrowDownArrow;": { p: [8645], c: "\u21C5" },
  "UpDownArrow;": { p: [8597], c: "\u2195" },
  "UpEquilibrium;": { p: [10606], c: "\u296E" },
  "UpTee;": { p: [8869], c: "\u22A5" },
  "UpTeeArrow;": { p: [8613], c: "\u21A5" },
  "Uparrow;": { p: [8657], c: "\u21D1" },
  "Updownarrow;": { p: [8661], c: "\u21D5" },
  "UpperLeftArrow;": { p: [8598], c: "\u2196" },
  "UpperRightArrow;": { p: [8599], c: "\u2197" },
  "Upsi;": { p: [978], c: "\u03D2" },
  "Upsilon;": { p: [933], c: "\u03A5" },
  "Uring;": { p: [366], c: "\u016E" },
  "Uscr;": { p: [119984], c: "\u{1D4B0}" },
  "Utilde;": { p: [360], c: "\u0168" },
  Uuml: { p: [220], c: "\xDC" },
  "Uuml;": { p: [220], c: "\xDC" },
  "VDash;": { p: [8875], c: "\u22AB" },
  "Vbar;": { p: [10987], c: "\u2AEB" },
  "Vcy;": { p: [1042], c: "\u0412" },
  "Vdash;": { p: [8873], c: "\u22A9" },
  "Vdashl;": { p: [10982], c: "\u2AE6" },
  "Vee;": { p: [8897], c: "\u22C1" },
  "Verbar;": { p: [8214], c: "\u2016" },
  "Vert;": { p: [8214], c: "\u2016" },
  "VerticalBar;": { p: [8739], c: "\u2223" },
  "VerticalLine;": { p: [124], c: "|" },
  "VerticalSeparator;": { p: [10072], c: "\u2758" },
  "VerticalTilde;": { p: [8768], c: "\u2240" },
  "VeryThinSpace;": { p: [8202], c: "\u200A" },
  "Vfr;": { p: [120089], c: "\u{1D519}" },
  "Vopf;": { p: [120141], c: "\u{1D54D}" },
  "Vscr;": { p: [119985], c: "\u{1D4B1}" },
  "Vvdash;": { p: [8874], c: "\u22AA" },
  "Wcirc;": { p: [372], c: "\u0174" },
  "Wedge;": { p: [8896], c: "\u22C0" },
  "Wfr;": { p: [120090], c: "\u{1D51A}" },
  "Wopf;": { p: [120142], c: "\u{1D54E}" },
  "Wscr;": { p: [119986], c: "\u{1D4B2}" },
  "Xfr;": { p: [120091], c: "\u{1D51B}" },
  "Xi;": { p: [926], c: "\u039E" },
  "Xopf;": { p: [120143], c: "\u{1D54F}" },
  "Xscr;": { p: [119987], c: "\u{1D4B3}" },
  "YAcy;": { p: [1071], c: "\u042F" },
  "YIcy;": { p: [1031], c: "\u0407" },
  "YUcy;": { p: [1070], c: "\u042E" },
  Yacute: { p: [221], c: "\xDD" },
  "Yacute;": { p: [221], c: "\xDD" },
  "Ycirc;": { p: [374], c: "\u0176" },
  "Ycy;": { p: [1067], c: "\u042B" },
  "Yfr;": { p: [120092], c: "\u{1D51C}" },
  "Yopf;": { p: [120144], c: "\u{1D550}" },
  "Yscr;": { p: [119988], c: "\u{1D4B4}" },
  "Yuml;": { p: [376], c: "\u0178" },
  "ZHcy;": { p: [1046], c: "\u0416" },
  "Zacute;": { p: [377], c: "\u0179" },
  "Zcaron;": { p: [381], c: "\u017D" },
  "Zcy;": { p: [1047], c: "\u0417" },
  "Zdot;": { p: [379], c: "\u017B" },
  "ZeroWidthSpace;": { p: [8203], c: "\u200B" },
  "Zeta;": { p: [918], c: "\u0396" },
  "Zfr;": { p: [8488], c: "\u2128" },
  "Zopf;": { p: [8484], c: "\u2124" },
  "Zscr;": { p: [119989], c: "\u{1D4B5}" },
  aacute: { p: [225], c: "\xE1" },
  "aacute;": { p: [225], c: "\xE1" },
  "abreve;": { p: [259], c: "\u0103" },
  "ac;": { p: [8766], c: "\u223E" },
  "acE;": { p: [8766, 819], c: "\u223E\u0333" },
  "acd;": { p: [8767], c: "\u223F" },
  acirc: { p: [226], c: "\xE2" },
  "acirc;": { p: [226], c: "\xE2" },
  acute: { p: [180], c: "\xB4" },
  "acute;": { p: [180], c: "\xB4" },
  "acy;": { p: [1072], c: "\u0430" },
  aelig: { p: [230], c: "\xE6" },
  "aelig;": { p: [230], c: "\xE6" },
  "af;": { p: [8289], c: "\u2061" },
  "afr;": { p: [120094], c: "\u{1D51E}" },
  agrave: { p: [224], c: "\xE0" },
  "agrave;": { p: [224], c: "\xE0" },
  "alefsym;": { p: [8501], c: "\u2135" },
  "aleph;": { p: [8501], c: "\u2135" },
  "alpha;": { p: [945], c: "\u03B1" },
  "amacr;": { p: [257], c: "\u0101" },
  "amalg;": { p: [10815], c: "\u2A3F" },
  amp: { p: [38], c: "&" },
  "amp;": { p: [38], c: "&" },
  "and;": { p: [8743], c: "\u2227" },
  "andand;": { p: [10837], c: "\u2A55" },
  "andd;": { p: [10844], c: "\u2A5C" },
  "andslope;": { p: [10840], c: "\u2A58" },
  "andv;": { p: [10842], c: "\u2A5A" },
  "ang;": { p: [8736], c: "\u2220" },
  "ange;": { p: [10660], c: "\u29A4" },
  "angle;": { p: [8736], c: "\u2220" },
  "angmsd;": { p: [8737], c: "\u2221" },
  "angmsdaa;": { p: [10664], c: "\u29A8" },
  "angmsdab;": { p: [10665], c: "\u29A9" },
  "angmsdac;": { p: [10666], c: "\u29AA" },
  "angmsdad;": { p: [10667], c: "\u29AB" },
  "angmsdae;": { p: [10668], c: "\u29AC" },
  "angmsdaf;": { p: [10669], c: "\u29AD" },
  "angmsdag;": { p: [10670], c: "\u29AE" },
  "angmsdah;": { p: [10671], c: "\u29AF" },
  "angrt;": { p: [8735], c: "\u221F" },
  "angrtvb;": { p: [8894], c: "\u22BE" },
  "angrtvbd;": { p: [10653], c: "\u299D" },
  "angsph;": { p: [8738], c: "\u2222" },
  "angst;": { p: [197], c: "\xC5" },
  "angzarr;": { p: [9084], c: "\u237C" },
  "aogon;": { p: [261], c: "\u0105" },
  "aopf;": { p: [120146], c: "\u{1D552}" },
  "ap;": { p: [8776], c: "\u2248" },
  "apE;": { p: [10864], c: "\u2A70" },
  "apacir;": { p: [10863], c: "\u2A6F" },
  "ape;": { p: [8778], c: "\u224A" },
  "apid;": { p: [8779], c: "\u224B" },
  "apos;": { p: [39], c: "'" },
  "approx;": { p: [8776], c: "\u2248" },
  "approxeq;": { p: [8778], c: "\u224A" },
  aring: { p: [229], c: "\xE5" },
  "aring;": { p: [229], c: "\xE5" },
  "ascr;": { p: [119990], c: "\u{1D4B6}" },
  "ast;": { p: [42], c: "*" },
  "asymp;": { p: [8776], c: "\u2248" },
  "asympeq;": { p: [8781], c: "\u224D" },
  atilde: { p: [227], c: "\xE3" },
  "atilde;": { p: [227], c: "\xE3" },
  auml: { p: [228], c: "\xE4" },
  "auml;": { p: [228], c: "\xE4" },
  "awconint;": { p: [8755], c: "\u2233" },
  "awint;": { p: [10769], c: "\u2A11" },
  "bNot;": { p: [10989], c: "\u2AED" },
  "backcong;": { p: [8780], c: "\u224C" },
  "backepsilon;": { p: [1014], c: "\u03F6" },
  "backprime;": { p: [8245], c: "\u2035" },
  "backsim;": { p: [8765], c: "\u223D" },
  "backsimeq;": { p: [8909], c: "\u22CD" },
  "barvee;": { p: [8893], c: "\u22BD" },
  "barwed;": { p: [8965], c: "\u2305" },
  "barwedge;": { p: [8965], c: "\u2305" },
  "bbrk;": { p: [9141], c: "\u23B5" },
  "bbrktbrk;": { p: [9142], c: "\u23B6" },
  "bcong;": { p: [8780], c: "\u224C" },
  "bcy;": { p: [1073], c: "\u0431" },
  "bdquo;": { p: [8222], c: "\u201E" },
  "becaus;": { p: [8757], c: "\u2235" },
  "because;": { p: [8757], c: "\u2235" },
  "bemptyv;": { p: [10672], c: "\u29B0" },
  "bepsi;": { p: [1014], c: "\u03F6" },
  "bernou;": { p: [8492], c: "\u212C" },
  "beta;": { p: [946], c: "\u03B2" },
  "beth;": { p: [8502], c: "\u2136" },
  "between;": { p: [8812], c: "\u226C" },
  "bfr;": { p: [120095], c: "\u{1D51F}" },
  "bigcap;": { p: [8898], c: "\u22C2" },
  "bigcirc;": { p: [9711], c: "\u25EF" },
  "bigcup;": { p: [8899], c: "\u22C3" },
  "bigodot;": { p: [10752], c: "\u2A00" },
  "bigoplus;": { p: [10753], c: "\u2A01" },
  "bigotimes;": { p: [10754], c: "\u2A02" },
  "bigsqcup;": { p: [10758], c: "\u2A06" },
  "bigstar;": { p: [9733], c: "\u2605" },
  "bigtriangledown;": { p: [9661], c: "\u25BD" },
  "bigtriangleup;": { p: [9651], c: "\u25B3" },
  "biguplus;": { p: [10756], c: "\u2A04" },
  "bigvee;": { p: [8897], c: "\u22C1" },
  "bigwedge;": { p: [8896], c: "\u22C0" },
  "bkarow;": { p: [10509], c: "\u290D" },
  "blacklozenge;": { p: [10731], c: "\u29EB" },
  "blacksquare;": { p: [9642], c: "\u25AA" },
  "blacktriangle;": { p: [9652], c: "\u25B4" },
  "blacktriangledown;": { p: [9662], c: "\u25BE" },
  "blacktriangleleft;": { p: [9666], c: "\u25C2" },
  "blacktriangleright;": { p: [9656], c: "\u25B8" },
  "blank;": { p: [9251], c: "\u2423" },
  "blk12;": { p: [9618], c: "\u2592" },
  "blk14;": { p: [9617], c: "\u2591" },
  "blk34;": { p: [9619], c: "\u2593" },
  "block;": { p: [9608], c: "\u2588" },
  "bne;": { p: [61, 8421], c: "=\u20E5" },
  "bnequiv;": { p: [8801, 8421], c: "\u2261\u20E5" },
  "bnot;": { p: [8976], c: "\u2310" },
  "bopf;": { p: [120147], c: "\u{1D553}" },
  "bot;": { p: [8869], c: "\u22A5" },
  "bottom;": { p: [8869], c: "\u22A5" },
  "bowtie;": { p: [8904], c: "\u22C8" },
  "boxDL;": { p: [9559], c: "\u2557" },
  "boxDR;": { p: [9556], c: "\u2554" },
  "boxDl;": { p: [9558], c: "\u2556" },
  "boxDr;": { p: [9555], c: "\u2553" },
  "boxH;": { p: [9552], c: "\u2550" },
  "boxHD;": { p: [9574], c: "\u2566" },
  "boxHU;": { p: [9577], c: "\u2569" },
  "boxHd;": { p: [9572], c: "\u2564" },
  "boxHu;": { p: [9575], c: "\u2567" },
  "boxUL;": { p: [9565], c: "\u255D" },
  "boxUR;": { p: [9562], c: "\u255A" },
  "boxUl;": { p: [9564], c: "\u255C" },
  "boxUr;": { p: [9561], c: "\u2559" },
  "boxV;": { p: [9553], c: "\u2551" },
  "boxVH;": { p: [9580], c: "\u256C" },
  "boxVL;": { p: [9571], c: "\u2563" },
  "boxVR;": { p: [9568], c: "\u2560" },
  "boxVh;": { p: [9579], c: "\u256B" },
  "boxVl;": { p: [9570], c: "\u2562" },
  "boxVr;": { p: [9567], c: "\u255F" },
  "boxbox;": { p: [10697], c: "\u29C9" },
  "boxdL;": { p: [9557], c: "\u2555" },
  "boxdR;": { p: [9554], c: "\u2552" },
  "boxdl;": { p: [9488], c: "\u2510" },
  "boxdr;": { p: [9484], c: "\u250C" },
  "boxh;": { p: [9472], c: "\u2500" },
  "boxhD;": { p: [9573], c: "\u2565" },
  "boxhU;": { p: [9576], c: "\u2568" },
  "boxhd;": { p: [9516], c: "\u252C" },
  "boxhu;": { p: [9524], c: "\u2534" },
  "boxminus;": { p: [8863], c: "\u229F" },
  "boxplus;": { p: [8862], c: "\u229E" },
  "boxtimes;": { p: [8864], c: "\u22A0" },
  "boxuL;": { p: [9563], c: "\u255B" },
  "boxuR;": { p: [9560], c: "\u2558" },
  "boxul;": { p: [9496], c: "\u2518" },
  "boxur;": { p: [9492], c: "\u2514" },
  "boxv;": { p: [9474], c: "\u2502" },
  "boxvH;": { p: [9578], c: "\u256A" },
  "boxvL;": { p: [9569], c: "\u2561" },
  "boxvR;": { p: [9566], c: "\u255E" },
  "boxvh;": { p: [9532], c: "\u253C" },
  "boxvl;": { p: [9508], c: "\u2524" },
  "boxvr;": { p: [9500], c: "\u251C" },
  "bprime;": { p: [8245], c: "\u2035" },
  "breve;": { p: [728], c: "\u02D8" },
  brvbar: { p: [166], c: "\xA6" },
  "brvbar;": { p: [166], c: "\xA6" },
  "bscr;": { p: [119991], c: "\u{1D4B7}" },
  "bsemi;": { p: [8271], c: "\u204F" },
  "bsim;": { p: [8765], c: "\u223D" },
  "bsime;": { p: [8909], c: "\u22CD" },
  "bsol;": { p: [92], c: "\\" },
  "bsolb;": { p: [10693], c: "\u29C5" },
  "bsolhsub;": { p: [10184], c: "\u27C8" },
  "bull;": { p: [8226], c: "\u2022" },
  "bullet;": { p: [8226], c: "\u2022" },
  "bump;": { p: [8782], c: "\u224E" },
  "bumpE;": { p: [10926], c: "\u2AAE" },
  "bumpe;": { p: [8783], c: "\u224F" },
  "bumpeq;": { p: [8783], c: "\u224F" },
  "cacute;": { p: [263], c: "\u0107" },
  "cap;": { p: [8745], c: "\u2229" },
  "capand;": { p: [10820], c: "\u2A44" },
  "capbrcup;": { p: [10825], c: "\u2A49" },
  "capcap;": { p: [10827], c: "\u2A4B" },
  "capcup;": { p: [10823], c: "\u2A47" },
  "capdot;": { p: [10816], c: "\u2A40" },
  "caps;": { p: [8745, 65024], c: "\u2229\uFE00" },
  "caret;": { p: [8257], c: "\u2041" },
  "caron;": { p: [711], c: "\u02C7" },
  "ccaps;": { p: [10829], c: "\u2A4D" },
  "ccaron;": { p: [269], c: "\u010D" },
  ccedil: { p: [231], c: "\xE7" },
  "ccedil;": { p: [231], c: "\xE7" },
  "ccirc;": { p: [265], c: "\u0109" },
  "ccups;": { p: [10828], c: "\u2A4C" },
  "ccupssm;": { p: [10832], c: "\u2A50" },
  "cdot;": { p: [267], c: "\u010B" },
  cedil: { p: [184], c: "\xB8" },
  "cedil;": { p: [184], c: "\xB8" },
  "cemptyv;": { p: [10674], c: "\u29B2" },
  cent: { p: [162], c: "\xA2" },
  "cent;": { p: [162], c: "\xA2" },
  "centerdot;": { p: [183], c: "\xB7" },
  "cfr;": { p: [120096], c: "\u{1D520}" },
  "chcy;": { p: [1095], c: "\u0447" },
  "check;": { p: [10003], c: "\u2713" },
  "checkmark;": { p: [10003], c: "\u2713" },
  "chi;": { p: [967], c: "\u03C7" },
  "cir;": { p: [9675], c: "\u25CB" },
  "cirE;": { p: [10691], c: "\u29C3" },
  "circ;": { p: [710], c: "\u02C6" },
  "circeq;": { p: [8791], c: "\u2257" },
  "circlearrowleft;": { p: [8634], c: "\u21BA" },
  "circlearrowright;": { p: [8635], c: "\u21BB" },
  "circledR;": { p: [174], c: "\xAE" },
  "circledS;": { p: [9416], c: "\u24C8" },
  "circledast;": { p: [8859], c: "\u229B" },
  "circledcirc;": { p: [8858], c: "\u229A" },
  "circleddash;": { p: [8861], c: "\u229D" },
  "cire;": { p: [8791], c: "\u2257" },
  "cirfnint;": { p: [10768], c: "\u2A10" },
  "cirmid;": { p: [10991], c: "\u2AEF" },
  "cirscir;": { p: [10690], c: "\u29C2" },
  "clubs;": { p: [9827], c: "\u2663" },
  "clubsuit;": { p: [9827], c: "\u2663" },
  "colon;": { p: [58], c: ":" },
  "colone;": { p: [8788], c: "\u2254" },
  "coloneq;": { p: [8788], c: "\u2254" },
  "comma;": { p: [44], c: "," },
  "commat;": { p: [64], c: "@" },
  "comp;": { p: [8705], c: "\u2201" },
  "compfn;": { p: [8728], c: "\u2218" },
  "complement;": { p: [8705], c: "\u2201" },
  "complexes;": { p: [8450], c: "\u2102" },
  "cong;": { p: [8773], c: "\u2245" },
  "congdot;": { p: [10861], c: "\u2A6D" },
  "conint;": { p: [8750], c: "\u222E" },
  "copf;": { p: [120148], c: "\u{1D554}" },
  "coprod;": { p: [8720], c: "\u2210" },
  copy: { p: [169], c: "\xA9" },
  "copy;": { p: [169], c: "\xA9" },
  "copysr;": { p: [8471], c: "\u2117" },
  "crarr;": { p: [8629], c: "\u21B5" },
  "cross;": { p: [10007], c: "\u2717" },
  "cscr;": { p: [119992], c: "\u{1D4B8}" },
  "csub;": { p: [10959], c: "\u2ACF" },
  "csube;": { p: [10961], c: "\u2AD1" },
  "csup;": { p: [10960], c: "\u2AD0" },
  "csupe;": { p: [10962], c: "\u2AD2" },
  "ctdot;": { p: [8943], c: "\u22EF" },
  "cudarrl;": { p: [10552], c: "\u2938" },
  "cudarrr;": { p: [10549], c: "\u2935" },
  "cuepr;": { p: [8926], c: "\u22DE" },
  "cuesc;": { p: [8927], c: "\u22DF" },
  "cularr;": { p: [8630], c: "\u21B6" },
  "cularrp;": { p: [10557], c: "\u293D" },
  "cup;": { p: [8746], c: "\u222A" },
  "cupbrcap;": { p: [10824], c: "\u2A48" },
  "cupcap;": { p: [10822], c: "\u2A46" },
  "cupcup;": { p: [10826], c: "\u2A4A" },
  "cupdot;": { p: [8845], c: "\u228D" },
  "cupor;": { p: [10821], c: "\u2A45" },
  "cups;": { p: [8746, 65024], c: "\u222A\uFE00" },
  "curarr;": { p: [8631], c: "\u21B7" },
  "curarrm;": { p: [10556], c: "\u293C" },
  "curlyeqprec;": { p: [8926], c: "\u22DE" },
  "curlyeqsucc;": { p: [8927], c: "\u22DF" },
  "curlyvee;": { p: [8910], c: "\u22CE" },
  "curlywedge;": { p: [8911], c: "\u22CF" },
  curren: { p: [164], c: "\xA4" },
  "curren;": { p: [164], c: "\xA4" },
  "curvearrowleft;": { p: [8630], c: "\u21B6" },
  "curvearrowright;": { p: [8631], c: "\u21B7" },
  "cuvee;": { p: [8910], c: "\u22CE" },
  "cuwed;": { p: [8911], c: "\u22CF" },
  "cwconint;": { p: [8754], c: "\u2232" },
  "cwint;": { p: [8753], c: "\u2231" },
  "cylcty;": { p: [9005], c: "\u232D" },
  "dArr;": { p: [8659], c: "\u21D3" },
  "dHar;": { p: [10597], c: "\u2965" },
  "dagger;": { p: [8224], c: "\u2020" },
  "daleth;": { p: [8504], c: "\u2138" },
  "darr;": { p: [8595], c: "\u2193" },
  "dash;": { p: [8208], c: "\u2010" },
  "dashv;": { p: [8867], c: "\u22A3" },
  "dbkarow;": { p: [10511], c: "\u290F" },
  "dblac;": { p: [733], c: "\u02DD" },
  "dcaron;": { p: [271], c: "\u010F" },
  "dcy;": { p: [1076], c: "\u0434" },
  "dd;": { p: [8518], c: "\u2146" },
  "ddagger;": { p: [8225], c: "\u2021" },
  "ddarr;": { p: [8650], c: "\u21CA" },
  "ddotseq;": { p: [10871], c: "\u2A77" },
  deg: { p: [176], c: "\xB0" },
  "deg;": { p: [176], c: "\xB0" },
  "delta;": { p: [948], c: "\u03B4" },
  "demptyv;": { p: [10673], c: "\u29B1" },
  "dfisht;": { p: [10623], c: "\u297F" },
  "dfr;": { p: [120097], c: "\u{1D521}" },
  "dharl;": { p: [8643], c: "\u21C3" },
  "dharr;": { p: [8642], c: "\u21C2" },
  "diam;": { p: [8900], c: "\u22C4" },
  "diamond;": { p: [8900], c: "\u22C4" },
  "diamondsuit;": { p: [9830], c: "\u2666" },
  "diams;": { p: [9830], c: "\u2666" },
  "die;": { p: [168], c: "\xA8" },
  "digamma;": { p: [989], c: "\u03DD" },
  "disin;": { p: [8946], c: "\u22F2" },
  "div;": { p: [247], c: "\xF7" },
  divide: { p: [247], c: "\xF7" },
  "divide;": { p: [247], c: "\xF7" },
  "divideontimes;": { p: [8903], c: "\u22C7" },
  "divonx;": { p: [8903], c: "\u22C7" },
  "djcy;": { p: [1106], c: "\u0452" },
  "dlcorn;": { p: [8990], c: "\u231E" },
  "dlcrop;": { p: [8973], c: "\u230D" },
  "dollar;": { p: [36], c: "$" },
  "dopf;": { p: [120149], c: "\u{1D555}" },
  "dot;": { p: [729], c: "\u02D9" },
  "doteq;": { p: [8784], c: "\u2250" },
  "doteqdot;": { p: [8785], c: "\u2251" },
  "dotminus;": { p: [8760], c: "\u2238" },
  "dotplus;": { p: [8724], c: "\u2214" },
  "dotsquare;": { p: [8865], c: "\u22A1" },
  "doublebarwedge;": { p: [8966], c: "\u2306" },
  "downarrow;": { p: [8595], c: "\u2193" },
  "downdownarrows;": { p: [8650], c: "\u21CA" },
  "downharpoonleft;": { p: [8643], c: "\u21C3" },
  "downharpoonright;": { p: [8642], c: "\u21C2" },
  "drbkarow;": { p: [10512], c: "\u2910" },
  "drcorn;": { p: [8991], c: "\u231F" },
  "drcrop;": { p: [8972], c: "\u230C" },
  "dscr;": { p: [119993], c: "\u{1D4B9}" },
  "dscy;": { p: [1109], c: "\u0455" },
  "dsol;": { p: [10742], c: "\u29F6" },
  "dstrok;": { p: [273], c: "\u0111" },
  "dtdot;": { p: [8945], c: "\u22F1" },
  "dtri;": { p: [9663], c: "\u25BF" },
  "dtrif;": { p: [9662], c: "\u25BE" },
  "duarr;": { p: [8693], c: "\u21F5" },
  "duhar;": { p: [10607], c: "\u296F" },
  "dwangle;": { p: [10662], c: "\u29A6" },
  "dzcy;": { p: [1119], c: "\u045F" },
  "dzigrarr;": { p: [10239], c: "\u27FF" },
  "eDDot;": { p: [10871], c: "\u2A77" },
  "eDot;": { p: [8785], c: "\u2251" },
  eacute: { p: [233], c: "\xE9" },
  "eacute;": { p: [233], c: "\xE9" },
  "easter;": { p: [10862], c: "\u2A6E" },
  "ecaron;": { p: [283], c: "\u011B" },
  "ecir;": { p: [8790], c: "\u2256" },
  ecirc: { p: [234], c: "\xEA" },
  "ecirc;": { p: [234], c: "\xEA" },
  "ecolon;": { p: [8789], c: "\u2255" },
  "ecy;": { p: [1101], c: "\u044D" },
  "edot;": { p: [279], c: "\u0117" },
  "ee;": { p: [8519], c: "\u2147" },
  "efDot;": { p: [8786], c: "\u2252" },
  "efr;": { p: [120098], c: "\u{1D522}" },
  "eg;": { p: [10906], c: "\u2A9A" },
  egrave: { p: [232], c: "\xE8" },
  "egrave;": { p: [232], c: "\xE8" },
  "egs;": { p: [10902], c: "\u2A96" },
  "egsdot;": { p: [10904], c: "\u2A98" },
  "el;": { p: [10905], c: "\u2A99" },
  "elinters;": { p: [9191], c: "\u23E7" },
  "ell;": { p: [8467], c: "\u2113" },
  "els;": { p: [10901], c: "\u2A95" },
  "elsdot;": { p: [10903], c: "\u2A97" },
  "emacr;": { p: [275], c: "\u0113" },
  "empty;": { p: [8709], c: "\u2205" },
  "emptyset;": { p: [8709], c: "\u2205" },
  "emptyv;": { p: [8709], c: "\u2205" },
  "emsp13;": { p: [8196], c: "\u2004" },
  "emsp14;": { p: [8197], c: "\u2005" },
  "emsp;": { p: [8195], c: "\u2003" },
  "eng;": { p: [331], c: "\u014B" },
  "ensp;": { p: [8194], c: "\u2002" },
  "eogon;": { p: [281], c: "\u0119" },
  "eopf;": { p: [120150], c: "\u{1D556}" },
  "epar;": { p: [8917], c: "\u22D5" },
  "eparsl;": { p: [10723], c: "\u29E3" },
  "eplus;": { p: [10865], c: "\u2A71" },
  "epsi;": { p: [949], c: "\u03B5" },
  "epsilon;": { p: [949], c: "\u03B5" },
  "epsiv;": { p: [1013], c: "\u03F5" },
  "eqcirc;": { p: [8790], c: "\u2256" },
  "eqcolon;": { p: [8789], c: "\u2255" },
  "eqsim;": { p: [8770], c: "\u2242" },
  "eqslantgtr;": { p: [10902], c: "\u2A96" },
  "eqslantless;": { p: [10901], c: "\u2A95" },
  "equals;": { p: [61], c: "=" },
  "equest;": { p: [8799], c: "\u225F" },
  "equiv;": { p: [8801], c: "\u2261" },
  "equivDD;": { p: [10872], c: "\u2A78" },
  "eqvparsl;": { p: [10725], c: "\u29E5" },
  "erDot;": { p: [8787], c: "\u2253" },
  "erarr;": { p: [10609], c: "\u2971" },
  "escr;": { p: [8495], c: "\u212F" },
  "esdot;": { p: [8784], c: "\u2250" },
  "esim;": { p: [8770], c: "\u2242" },
  "eta;": { p: [951], c: "\u03B7" },
  eth: { p: [240], c: "\xF0" },
  "eth;": { p: [240], c: "\xF0" },
  euml: { p: [235], c: "\xEB" },
  "euml;": { p: [235], c: "\xEB" },
  "euro;": { p: [8364], c: "\u20AC" },
  "excl;": { p: [33], c: "!" },
  "exist;": { p: [8707], c: "\u2203" },
  "expectation;": { p: [8496], c: "\u2130" },
  "exponentiale;": { p: [8519], c: "\u2147" },
  "fallingdotseq;": { p: [8786], c: "\u2252" },
  "fcy;": { p: [1092], c: "\u0444" },
  "female;": { p: [9792], c: "\u2640" },
  "ffilig;": { p: [64259], c: "\uFB03" },
  "fflig;": { p: [64256], c: "\uFB00" },
  "ffllig;": { p: [64260], c: "\uFB04" },
  "ffr;": { p: [120099], c: "\u{1D523}" },
  "filig;": { p: [64257], c: "\uFB01" },
  "fjlig;": { p: [102, 106], c: "fj" },
  "flat;": { p: [9837], c: "\u266D" },
  "fllig;": { p: [64258], c: "\uFB02" },
  "fltns;": { p: [9649], c: "\u25B1" },
  "fnof;": { p: [402], c: "\u0192" },
  "fopf;": { p: [120151], c: "\u{1D557}" },
  "forall;": { p: [8704], c: "\u2200" },
  "fork;": { p: [8916], c: "\u22D4" },
  "forkv;": { p: [10969], c: "\u2AD9" },
  "fpartint;": { p: [10765], c: "\u2A0D" },
  frac12: { p: [189], c: "\xBD" },
  "frac12;": { p: [189], c: "\xBD" },
  "frac13;": { p: [8531], c: "\u2153" },
  frac14: { p: [188], c: "\xBC" },
  "frac14;": { p: [188], c: "\xBC" },
  "frac15;": { p: [8533], c: "\u2155" },
  "frac16;": { p: [8537], c: "\u2159" },
  "frac18;": { p: [8539], c: "\u215B" },
  "frac23;": { p: [8532], c: "\u2154" },
  "frac25;": { p: [8534], c: "\u2156" },
  frac34: { p: [190], c: "\xBE" },
  "frac34;": { p: [190], c: "\xBE" },
  "frac35;": { p: [8535], c: "\u2157" },
  "frac38;": { p: [8540], c: "\u215C" },
  "frac45;": { p: [8536], c: "\u2158" },
  "frac56;": { p: [8538], c: "\u215A" },
  "frac58;": { p: [8541], c: "\u215D" },
  "frac78;": { p: [8542], c: "\u215E" },
  "frasl;": { p: [8260], c: "\u2044" },
  "frown;": { p: [8994], c: "\u2322" },
  "fscr;": { p: [119995], c: "\u{1D4BB}" },
  "gE;": { p: [8807], c: "\u2267" },
  "gEl;": { p: [10892], c: "\u2A8C" },
  "gacute;": { p: [501], c: "\u01F5" },
  "gamma;": { p: [947], c: "\u03B3" },
  "gammad;": { p: [989], c: "\u03DD" },
  "gap;": { p: [10886], c: "\u2A86" },
  "gbreve;": { p: [287], c: "\u011F" },
  "gcirc;": { p: [285], c: "\u011D" },
  "gcy;": { p: [1075], c: "\u0433" },
  "gdot;": { p: [289], c: "\u0121" },
  "ge;": { p: [8805], c: "\u2265" },
  "gel;": { p: [8923], c: "\u22DB" },
  "geq;": { p: [8805], c: "\u2265" },
  "geqq;": { p: [8807], c: "\u2267" },
  "geqslant;": { p: [10878], c: "\u2A7E" },
  "ges;": { p: [10878], c: "\u2A7E" },
  "gescc;": { p: [10921], c: "\u2AA9" },
  "gesdot;": { p: [10880], c: "\u2A80" },
  "gesdoto;": { p: [10882], c: "\u2A82" },
  "gesdotol;": { p: [10884], c: "\u2A84" },
  "gesl;": { p: [8923, 65024], c: "\u22DB\uFE00" },
  "gesles;": { p: [10900], c: "\u2A94" },
  "gfr;": { p: [120100], c: "\u{1D524}" },
  "gg;": { p: [8811], c: "\u226B" },
  "ggg;": { p: [8921], c: "\u22D9" },
  "gimel;": { p: [8503], c: "\u2137" },
  "gjcy;": { p: [1107], c: "\u0453" },
  "gl;": { p: [8823], c: "\u2277" },
  "glE;": { p: [10898], c: "\u2A92" },
  "gla;": { p: [10917], c: "\u2AA5" },
  "glj;": { p: [10916], c: "\u2AA4" },
  "gnE;": { p: [8809], c: "\u2269" },
  "gnap;": { p: [10890], c: "\u2A8A" },
  "gnapprox;": { p: [10890], c: "\u2A8A" },
  "gne;": { p: [10888], c: "\u2A88" },
  "gneq;": { p: [10888], c: "\u2A88" },
  "gneqq;": { p: [8809], c: "\u2269" },
  "gnsim;": { p: [8935], c: "\u22E7" },
  "gopf;": { p: [120152], c: "\u{1D558}" },
  "grave;": { p: [96], c: "`" },
  "gscr;": { p: [8458], c: "\u210A" },
  "gsim;": { p: [8819], c: "\u2273" },
  "gsime;": { p: [10894], c: "\u2A8E" },
  "gsiml;": { p: [10896], c: "\u2A90" },
  gt: { p: [62], c: ">" },
  "gt;": { p: [62], c: ">" },
  "gtcc;": { p: [10919], c: "\u2AA7" },
  "gtcir;": { p: [10874], c: "\u2A7A" },
  "gtdot;": { p: [8919], c: "\u22D7" },
  "gtlPar;": { p: [10645], c: "\u2995" },
  "gtquest;": { p: [10876], c: "\u2A7C" },
  "gtrapprox;": { p: [10886], c: "\u2A86" },
  "gtrarr;": { p: [10616], c: "\u2978" },
  "gtrdot;": { p: [8919], c: "\u22D7" },
  "gtreqless;": { p: [8923], c: "\u22DB" },
  "gtreqqless;": { p: [10892], c: "\u2A8C" },
  "gtrless;": { p: [8823], c: "\u2277" },
  "gtrsim;": { p: [8819], c: "\u2273" },
  "gvertneqq;": {
    p: [8809, 65024],
    c: "\u2269\uFE00"
  },
  "gvnE;": { p: [8809, 65024], c: "\u2269\uFE00" },
  "hArr;": { p: [8660], c: "\u21D4" },
  "hairsp;": { p: [8202], c: "\u200A" },
  "half;": { p: [189], c: "\xBD" },
  "hamilt;": { p: [8459], c: "\u210B" },
  "hardcy;": { p: [1098], c: "\u044A" },
  "harr;": { p: [8596], c: "\u2194" },
  "harrcir;": { p: [10568], c: "\u2948" },
  "harrw;": { p: [8621], c: "\u21AD" },
  "hbar;": { p: [8463], c: "\u210F" },
  "hcirc;": { p: [293], c: "\u0125" },
  "hearts;": { p: [9829], c: "\u2665" },
  "heartsuit;": { p: [9829], c: "\u2665" },
  "hellip;": { p: [8230], c: "\u2026" },
  "hercon;": { p: [8889], c: "\u22B9" },
  "hfr;": { p: [120101], c: "\u{1D525}" },
  "hksearow;": { p: [10533], c: "\u2925" },
  "hkswarow;": { p: [10534], c: "\u2926" },
  "hoarr;": { p: [8703], c: "\u21FF" },
  "homtht;": { p: [8763], c: "\u223B" },
  "hookleftarrow;": { p: [8617], c: "\u21A9" },
  "hookrightarrow;": { p: [8618], c: "\u21AA" },
  "hopf;": { p: [120153], c: "\u{1D559}" },
  "horbar;": { p: [8213], c: "\u2015" },
  "hscr;": { p: [119997], c: "\u{1D4BD}" },
  "hslash;": { p: [8463], c: "\u210F" },
  "hstrok;": { p: [295], c: "\u0127" },
  "hybull;": { p: [8259], c: "\u2043" },
  "hyphen;": { p: [8208], c: "\u2010" },
  iacute: { p: [237], c: "\xED" },
  "iacute;": { p: [237], c: "\xED" },
  "ic;": { p: [8291], c: "\u2063" },
  icirc: { p: [238], c: "\xEE" },
  "icirc;": { p: [238], c: "\xEE" },
  "icy;": { p: [1080], c: "\u0438" },
  "iecy;": { p: [1077], c: "\u0435" },
  iexcl: { p: [161], c: "\xA1" },
  "iexcl;": { p: [161], c: "\xA1" },
  "iff;": { p: [8660], c: "\u21D4" },
  "ifr;": { p: [120102], c: "\u{1D526}" },
  igrave: { p: [236], c: "\xEC" },
  "igrave;": { p: [236], c: "\xEC" },
  "ii;": { p: [8520], c: "\u2148" },
  "iiiint;": { p: [10764], c: "\u2A0C" },
  "iiint;": { p: [8749], c: "\u222D" },
  "iinfin;": { p: [10716], c: "\u29DC" },
  "iiota;": { p: [8489], c: "\u2129" },
  "ijlig;": { p: [307], c: "\u0133" },
  "imacr;": { p: [299], c: "\u012B" },
  "image;": { p: [8465], c: "\u2111" },
  "imagline;": { p: [8464], c: "\u2110" },
  "imagpart;": { p: [8465], c: "\u2111" },
  "imath;": { p: [305], c: "\u0131" },
  "imof;": { p: [8887], c: "\u22B7" },
  "imped;": { p: [437], c: "\u01B5" },
  "in;": { p: [8712], c: "\u2208" },
  "incare;": { p: [8453], c: "\u2105" },
  "infin;": { p: [8734], c: "\u221E" },
  "infintie;": { p: [10717], c: "\u29DD" },
  "inodot;": { p: [305], c: "\u0131" },
  "int;": { p: [8747], c: "\u222B" },
  "intcal;": { p: [8890], c: "\u22BA" },
  "integers;": { p: [8484], c: "\u2124" },
  "intercal;": { p: [8890], c: "\u22BA" },
  "intlarhk;": { p: [10775], c: "\u2A17" },
  "intprod;": { p: [10812], c: "\u2A3C" },
  "iocy;": { p: [1105], c: "\u0451" },
  "iogon;": { p: [303], c: "\u012F" },
  "iopf;": { p: [120154], c: "\u{1D55A}" },
  "iota;": { p: [953], c: "\u03B9" },
  "iprod;": { p: [10812], c: "\u2A3C" },
  iquest: { p: [191], c: "\xBF" },
  "iquest;": { p: [191], c: "\xBF" },
  "iscr;": { p: [119998], c: "\u{1D4BE}" },
  "isin;": { p: [8712], c: "\u2208" },
  "isinE;": { p: [8953], c: "\u22F9" },
  "isindot;": { p: [8949], c: "\u22F5" },
  "isins;": { p: [8948], c: "\u22F4" },
  "isinsv;": { p: [8947], c: "\u22F3" },
  "isinv;": { p: [8712], c: "\u2208" },
  "it;": { p: [8290], c: "\u2062" },
  "itilde;": { p: [297], c: "\u0129" },
  "iukcy;": { p: [1110], c: "\u0456" },
  iuml: { p: [239], c: "\xEF" },
  "iuml;": { p: [239], c: "\xEF" },
  "jcirc;": { p: [309], c: "\u0135" },
  "jcy;": { p: [1081], c: "\u0439" },
  "jfr;": { p: [120103], c: "\u{1D527}" },
  "jmath;": { p: [567], c: "\u0237" },
  "jopf;": { p: [120155], c: "\u{1D55B}" },
  "jscr;": { p: [119999], c: "\u{1D4BF}" },
  "jsercy;": { p: [1112], c: "\u0458" },
  "jukcy;": { p: [1108], c: "\u0454" },
  "kappa;": { p: [954], c: "\u03BA" },
  "kappav;": { p: [1008], c: "\u03F0" },
  "kcedil;": { p: [311], c: "\u0137" },
  "kcy;": { p: [1082], c: "\u043A" },
  "kfr;": { p: [120104], c: "\u{1D528}" },
  "kgreen;": { p: [312], c: "\u0138" },
  "khcy;": { p: [1093], c: "\u0445" },
  "kjcy;": { p: [1116], c: "\u045C" },
  "kopf;": { p: [120156], c: "\u{1D55C}" },
  "kscr;": { p: [12e4], c: "\u{1D4C0}" },
  "lAarr;": { p: [8666], c: "\u21DA" },
  "lArr;": { p: [8656], c: "\u21D0" },
  "lAtail;": { p: [10523], c: "\u291B" },
  "lBarr;": { p: [10510], c: "\u290E" },
  "lE;": { p: [8806], c: "\u2266" },
  "lEg;": { p: [10891], c: "\u2A8B" },
  "lHar;": { p: [10594], c: "\u2962" },
  "lacute;": { p: [314], c: "\u013A" },
  "laemptyv;": { p: [10676], c: "\u29B4" },
  "lagran;": { p: [8466], c: "\u2112" },
  "lambda;": { p: [955], c: "\u03BB" },
  "lang;": { p: [10216], c: "\u27E8" },
  "langd;": { p: [10641], c: "\u2991" },
  "langle;": { p: [10216], c: "\u27E8" },
  "lap;": { p: [10885], c: "\u2A85" },
  laquo: { p: [171], c: "\xAB" },
  "laquo;": { p: [171], c: "\xAB" },
  "larr;": { p: [8592], c: "\u2190" },
  "larrb;": { p: [8676], c: "\u21E4" },
  "larrbfs;": { p: [10527], c: "\u291F" },
  "larrfs;": { p: [10525], c: "\u291D" },
  "larrhk;": { p: [8617], c: "\u21A9" },
  "larrlp;": { p: [8619], c: "\u21AB" },
  "larrpl;": { p: [10553], c: "\u2939" },
  "larrsim;": { p: [10611], c: "\u2973" },
  "larrtl;": { p: [8610], c: "\u21A2" },
  "lat;": { p: [10923], c: "\u2AAB" },
  "latail;": { p: [10521], c: "\u2919" },
  "late;": { p: [10925], c: "\u2AAD" },
  "lates;": { p: [10925, 65024], c: "\u2AAD\uFE00" },
  "lbarr;": { p: [10508], c: "\u290C" },
  "lbbrk;": { p: [10098], c: "\u2772" },
  "lbrace;": { p: [123], c: "{" },
  "lbrack;": { p: [91], c: "[" },
  "lbrke;": { p: [10635], c: "\u298B" },
  "lbrksld;": { p: [10639], c: "\u298F" },
  "lbrkslu;": { p: [10637], c: "\u298D" },
  "lcaron;": { p: [318], c: "\u013E" },
  "lcedil;": { p: [316], c: "\u013C" },
  "lceil;": { p: [8968], c: "\u2308" },
  "lcub;": { p: [123], c: "{" },
  "lcy;": { p: [1083], c: "\u043B" },
  "ldca;": { p: [10550], c: "\u2936" },
  "ldquo;": { p: [8220], c: "\u201C" },
  "ldquor;": { p: [8222], c: "\u201E" },
  "ldrdhar;": { p: [10599], c: "\u2967" },
  "ldrushar;": { p: [10571], c: "\u294B" },
  "ldsh;": { p: [8626], c: "\u21B2" },
  "le;": { p: [8804], c: "\u2264" },
  "leftarrow;": { p: [8592], c: "\u2190" },
  "leftarrowtail;": { p: [8610], c: "\u21A2" },
  "leftharpoondown;": { p: [8637], c: "\u21BD" },
  "leftharpoonup;": { p: [8636], c: "\u21BC" },
  "leftleftarrows;": { p: [8647], c: "\u21C7" },
  "leftrightarrow;": { p: [8596], c: "\u2194" },
  "leftrightarrows;": { p: [8646], c: "\u21C6" },
  "leftrightharpoons;": { p: [8651], c: "\u21CB" },
  "leftrightsquigarrow;": { p: [8621], c: "\u21AD" },
  "leftthreetimes;": { p: [8907], c: "\u22CB" },
  "leg;": { p: [8922], c: "\u22DA" },
  "leq;": { p: [8804], c: "\u2264" },
  "leqq;": { p: [8806], c: "\u2266" },
  "leqslant;": { p: [10877], c: "\u2A7D" },
  "les;": { p: [10877], c: "\u2A7D" },
  "lescc;": { p: [10920], c: "\u2AA8" },
  "lesdot;": { p: [10879], c: "\u2A7F" },
  "lesdoto;": { p: [10881], c: "\u2A81" },
  "lesdotor;": { p: [10883], c: "\u2A83" },
  "lesg;": { p: [8922, 65024], c: "\u22DA\uFE00" },
  "lesges;": { p: [10899], c: "\u2A93" },
  "lessapprox;": { p: [10885], c: "\u2A85" },
  "lessdot;": { p: [8918], c: "\u22D6" },
  "lesseqgtr;": { p: [8922], c: "\u22DA" },
  "lesseqqgtr;": { p: [10891], c: "\u2A8B" },
  "lessgtr;": { p: [8822], c: "\u2276" },
  "lesssim;": { p: [8818], c: "\u2272" },
  "lfisht;": { p: [10620], c: "\u297C" },
  "lfloor;": { p: [8970], c: "\u230A" },
  "lfr;": { p: [120105], c: "\u{1D529}" },
  "lg;": { p: [8822], c: "\u2276" },
  "lgE;": { p: [10897], c: "\u2A91" },
  "lhard;": { p: [8637], c: "\u21BD" },
  "lharu;": { p: [8636], c: "\u21BC" },
  "lharul;": { p: [10602], c: "\u296A" },
  "lhblk;": { p: [9604], c: "\u2584" },
  "ljcy;": { p: [1113], c: "\u0459" },
  "ll;": { p: [8810], c: "\u226A" },
  "llarr;": { p: [8647], c: "\u21C7" },
  "llcorner;": { p: [8990], c: "\u231E" },
  "llhard;": { p: [10603], c: "\u296B" },
  "lltri;": { p: [9722], c: "\u25FA" },
  "lmidot;": { p: [320], c: "\u0140" },
  "lmoust;": { p: [9136], c: "\u23B0" },
  "lmoustache;": { p: [9136], c: "\u23B0" },
  "lnE;": { p: [8808], c: "\u2268" },
  "lnap;": { p: [10889], c: "\u2A89" },
  "lnapprox;": { p: [10889], c: "\u2A89" },
  "lne;": { p: [10887], c: "\u2A87" },
  "lneq;": { p: [10887], c: "\u2A87" },
  "lneqq;": { p: [8808], c: "\u2268" },
  "lnsim;": { p: [8934], c: "\u22E6" },
  "loang;": { p: [10220], c: "\u27EC" },
  "loarr;": { p: [8701], c: "\u21FD" },
  "lobrk;": { p: [10214], c: "\u27E6" },
  "longleftarrow;": { p: [10229], c: "\u27F5" },
  "longleftrightarrow;": { p: [10231], c: "\u27F7" },
  "longmapsto;": { p: [10236], c: "\u27FC" },
  "longrightarrow;": { p: [10230], c: "\u27F6" },
  "looparrowleft;": { p: [8619], c: "\u21AB" },
  "looparrowright;": { p: [8620], c: "\u21AC" },
  "lopar;": { p: [10629], c: "\u2985" },
  "lopf;": { p: [120157], c: "\u{1D55D}" },
  "loplus;": { p: [10797], c: "\u2A2D" },
  "lotimes;": { p: [10804], c: "\u2A34" },
  "lowast;": { p: [8727], c: "\u2217" },
  "lowbar;": { p: [95], c: "_" },
  "loz;": { p: [9674], c: "\u25CA" },
  "lozenge;": { p: [9674], c: "\u25CA" },
  "lozf;": { p: [10731], c: "\u29EB" },
  "lpar;": { p: [40], c: "(" },
  "lparlt;": { p: [10643], c: "\u2993" },
  "lrarr;": { p: [8646], c: "\u21C6" },
  "lrcorner;": { p: [8991], c: "\u231F" },
  "lrhar;": { p: [8651], c: "\u21CB" },
  "lrhard;": { p: [10605], c: "\u296D" },
  "lrm;": { p: [8206], c: "\u200E" },
  "lrtri;": { p: [8895], c: "\u22BF" },
  "lsaquo;": { p: [8249], c: "\u2039" },
  "lscr;": { p: [120001], c: "\u{1D4C1}" },
  "lsh;": { p: [8624], c: "\u21B0" },
  "lsim;": { p: [8818], c: "\u2272" },
  "lsime;": { p: [10893], c: "\u2A8D" },
  "lsimg;": { p: [10895], c: "\u2A8F" },
  "lsqb;": { p: [91], c: "[" },
  "lsquo;": { p: [8216], c: "\u2018" },
  "lsquor;": { p: [8218], c: "\u201A" },
  "lstrok;": { p: [322], c: "\u0142" },
  lt: { p: [60], c: "<" },
  "lt;": { p: [60], c: "<" },
  "ltcc;": { p: [10918], c: "\u2AA6" },
  "ltcir;": { p: [10873], c: "\u2A79" },
  "ltdot;": { p: [8918], c: "\u22D6" },
  "lthree;": { p: [8907], c: "\u22CB" },
  "ltimes;": { p: [8905], c: "\u22C9" },
  "ltlarr;": { p: [10614], c: "\u2976" },
  "ltquest;": { p: [10875], c: "\u2A7B" },
  "ltrPar;": { p: [10646], c: "\u2996" },
  "ltri;": { p: [9667], c: "\u25C3" },
  "ltrie;": { p: [8884], c: "\u22B4" },
  "ltrif;": { p: [9666], c: "\u25C2" },
  "lurdshar;": { p: [10570], c: "\u294A" },
  "luruhar;": { p: [10598], c: "\u2966" },
  "lvertneqq;": {
    p: [8808, 65024],
    c: "\u2268\uFE00"
  },
  "lvnE;": { p: [8808, 65024], c: "\u2268\uFE00" },
  "mDDot;": { p: [8762], c: "\u223A" },
  macr: { p: [175], c: "\xAF" },
  "macr;": { p: [175], c: "\xAF" },
  "male;": { p: [9794], c: "\u2642" },
  "malt;": { p: [10016], c: "\u2720" },
  "maltese;": { p: [10016], c: "\u2720" },
  "map;": { p: [8614], c: "\u21A6" },
  "mapsto;": { p: [8614], c: "\u21A6" },
  "mapstodown;": { p: [8615], c: "\u21A7" },
  "mapstoleft;": { p: [8612], c: "\u21A4" },
  "mapstoup;": { p: [8613], c: "\u21A5" },
  "marker;": { p: [9646], c: "\u25AE" },
  "mcomma;": { p: [10793], c: "\u2A29" },
  "mcy;": { p: [1084], c: "\u043C" },
  "mdash;": { p: [8212], c: "\u2014" },
  "measuredangle;": { p: [8737], c: "\u2221" },
  "mfr;": { p: [120106], c: "\u{1D52A}" },
  "mho;": { p: [8487], c: "\u2127" },
  micro: { p: [181], c: "\xB5" },
  "micro;": { p: [181], c: "\xB5" },
  "mid;": { p: [8739], c: "\u2223" },
  "midast;": { p: [42], c: "*" },
  "midcir;": { p: [10992], c: "\u2AF0" },
  middot: { p: [183], c: "\xB7" },
  "middot;": { p: [183], c: "\xB7" },
  "minus;": { p: [8722], c: "\u2212" },
  "minusb;": { p: [8863], c: "\u229F" },
  "minusd;": { p: [8760], c: "\u2238" },
  "minusdu;": { p: [10794], c: "\u2A2A" },
  "mlcp;": { p: [10971], c: "\u2ADB" },
  "mldr;": { p: [8230], c: "\u2026" },
  "mnplus;": { p: [8723], c: "\u2213" },
  "models;": { p: [8871], c: "\u22A7" },
  "mopf;": { p: [120158], c: "\u{1D55E}" },
  "mp;": { p: [8723], c: "\u2213" },
  "mscr;": { p: [120002], c: "\u{1D4C2}" },
  "mstpos;": { p: [8766], c: "\u223E" },
  "mu;": { p: [956], c: "\u03BC" },
  "multimap;": { p: [8888], c: "\u22B8" },
  "mumap;": { p: [8888], c: "\u22B8" },
  "nGg;": { p: [8921, 824], c: "\u22D9\u0338" },
  "nGt;": { p: [8811, 8402], c: "\u226B\u20D2" },
  "nGtv;": { p: [8811, 824], c: "\u226B\u0338" },
  "nLeftarrow;": { p: [8653], c: "\u21CD" },
  "nLeftrightarrow;": { p: [8654], c: "\u21CE" },
  "nLl;": { p: [8920, 824], c: "\u22D8\u0338" },
  "nLt;": { p: [8810, 8402], c: "\u226A\u20D2" },
  "nLtv;": { p: [8810, 824], c: "\u226A\u0338" },
  "nRightarrow;": { p: [8655], c: "\u21CF" },
  "nVDash;": { p: [8879], c: "\u22AF" },
  "nVdash;": { p: [8878], c: "\u22AE" },
  "nabla;": { p: [8711], c: "\u2207" },
  "nacute;": { p: [324], c: "\u0144" },
  "nang;": { p: [8736, 8402], c: "\u2220\u20D2" },
  "nap;": { p: [8777], c: "\u2249" },
  "napE;": { p: [10864, 824], c: "\u2A70\u0338" },
  "napid;": { p: [8779, 824], c: "\u224B\u0338" },
  "napos;": { p: [329], c: "\u0149" },
  "napprox;": { p: [8777], c: "\u2249" },
  "natur;": { p: [9838], c: "\u266E" },
  "natural;": { p: [9838], c: "\u266E" },
  "naturals;": { p: [8469], c: "\u2115" },
  nbsp: { p: [160], c: "\xA0" },
  "nbsp;": { p: [160], c: "\xA0" },
  "nbump;": { p: [8782, 824], c: "\u224E\u0338" },
  "nbumpe;": { p: [8783, 824], c: "\u224F\u0338" },
  "ncap;": { p: [10819], c: "\u2A43" },
  "ncaron;": { p: [328], c: "\u0148" },
  "ncedil;": { p: [326], c: "\u0146" },
  "ncong;": { p: [8775], c: "\u2247" },
  "ncongdot;": { p: [10861, 824], c: "\u2A6D\u0338" },
  "ncup;": { p: [10818], c: "\u2A42" },
  "ncy;": { p: [1085], c: "\u043D" },
  "ndash;": { p: [8211], c: "\u2013" },
  "ne;": { p: [8800], c: "\u2260" },
  "neArr;": { p: [8663], c: "\u21D7" },
  "nearhk;": { p: [10532], c: "\u2924" },
  "nearr;": { p: [8599], c: "\u2197" },
  "nearrow;": { p: [8599], c: "\u2197" },
  "nedot;": { p: [8784, 824], c: "\u2250\u0338" },
  "nequiv;": { p: [8802], c: "\u2262" },
  "nesear;": { p: [10536], c: "\u2928" },
  "nesim;": { p: [8770, 824], c: "\u2242\u0338" },
  "nexist;": { p: [8708], c: "\u2204" },
  "nexists;": { p: [8708], c: "\u2204" },
  "nfr;": { p: [120107], c: "\u{1D52B}" },
  "ngE;": { p: [8807, 824], c: "\u2267\u0338" },
  "nge;": { p: [8817], c: "\u2271" },
  "ngeq;": { p: [8817], c: "\u2271" },
  "ngeqq;": { p: [8807, 824], c: "\u2267\u0338" },
  "ngeqslant;": { p: [10878, 824], c: "\u2A7E\u0338" },
  "nges;": { p: [10878, 824], c: "\u2A7E\u0338" },
  "ngsim;": { p: [8821], c: "\u2275" },
  "ngt;": { p: [8815], c: "\u226F" },
  "ngtr;": { p: [8815], c: "\u226F" },
  "nhArr;": { p: [8654], c: "\u21CE" },
  "nharr;": { p: [8622], c: "\u21AE" },
  "nhpar;": { p: [10994], c: "\u2AF2" },
  "ni;": { p: [8715], c: "\u220B" },
  "nis;": { p: [8956], c: "\u22FC" },
  "nisd;": { p: [8954], c: "\u22FA" },
  "niv;": { p: [8715], c: "\u220B" },
  "njcy;": { p: [1114], c: "\u045A" },
  "nlArr;": { p: [8653], c: "\u21CD" },
  "nlE;": { p: [8806, 824], c: "\u2266\u0338" },
  "nlarr;": { p: [8602], c: "\u219A" },
  "nldr;": { p: [8229], c: "\u2025" },
  "nle;": { p: [8816], c: "\u2270" },
  "nleftarrow;": { p: [8602], c: "\u219A" },
  "nleftrightarrow;": { p: [8622], c: "\u21AE" },
  "nleq;": { p: [8816], c: "\u2270" },
  "nleqq;": { p: [8806, 824], c: "\u2266\u0338" },
  "nleqslant;": { p: [10877, 824], c: "\u2A7D\u0338" },
  "nles;": { p: [10877, 824], c: "\u2A7D\u0338" },
  "nless;": { p: [8814], c: "\u226E" },
  "nlsim;": { p: [8820], c: "\u2274" },
  "nlt;": { p: [8814], c: "\u226E" },
  "nltri;": { p: [8938], c: "\u22EA" },
  "nltrie;": { p: [8940], c: "\u22EC" },
  "nmid;": { p: [8740], c: "\u2224" },
  "nopf;": { p: [120159], c: "\u{1D55F}" },
  not: { p: [172], c: "\xAC" },
  "not;": { p: [172], c: "\xAC" },
  "notin;": { p: [8713], c: "\u2209" },
  "notinE;": { p: [8953, 824], c: "\u22F9\u0338" },
  "notindot;": { p: [8949, 824], c: "\u22F5\u0338" },
  "notinva;": { p: [8713], c: "\u2209" },
  "notinvb;": { p: [8951], c: "\u22F7" },
  "notinvc;": { p: [8950], c: "\u22F6" },
  "notni;": { p: [8716], c: "\u220C" },
  "notniva;": { p: [8716], c: "\u220C" },
  "notnivb;": { p: [8958], c: "\u22FE" },
  "notnivc;": { p: [8957], c: "\u22FD" },
  "npar;": { p: [8742], c: "\u2226" },
  "nparallel;": { p: [8742], c: "\u2226" },
  "nparsl;": { p: [11005, 8421], c: "\u2AFD\u20E5" },
  "npart;": { p: [8706, 824], c: "\u2202\u0338" },
  "npolint;": { p: [10772], c: "\u2A14" },
  "npr;": { p: [8832], c: "\u2280" },
  "nprcue;": { p: [8928], c: "\u22E0" },
  "npre;": { p: [10927, 824], c: "\u2AAF\u0338" },
  "nprec;": { p: [8832], c: "\u2280" },
  "npreceq;": { p: [10927, 824], c: "\u2AAF\u0338" },
  "nrArr;": { p: [8655], c: "\u21CF" },
  "nrarr;": { p: [8603], c: "\u219B" },
  "nrarrc;": { p: [10547, 824], c: "\u2933\u0338" },
  "nrarrw;": { p: [8605, 824], c: "\u219D\u0338" },
  "nrightarrow;": { p: [8603], c: "\u219B" },
  "nrtri;": { p: [8939], c: "\u22EB" },
  "nrtrie;": { p: [8941], c: "\u22ED" },
  "nsc;": { p: [8833], c: "\u2281" },
  "nsccue;": { p: [8929], c: "\u22E1" },
  "nsce;": { p: [10928, 824], c: "\u2AB0\u0338" },
  "nscr;": { p: [120003], c: "\u{1D4C3}" },
  "nshortmid;": { p: [8740], c: "\u2224" },
  "nshortparallel;": { p: [8742], c: "\u2226" },
  "nsim;": { p: [8769], c: "\u2241" },
  "nsime;": { p: [8772], c: "\u2244" },
  "nsimeq;": { p: [8772], c: "\u2244" },
  "nsmid;": { p: [8740], c: "\u2224" },
  "nspar;": { p: [8742], c: "\u2226" },
  "nsqsube;": { p: [8930], c: "\u22E2" },
  "nsqsupe;": { p: [8931], c: "\u22E3" },
  "nsub;": { p: [8836], c: "\u2284" },
  "nsubE;": { p: [10949, 824], c: "\u2AC5\u0338" },
  "nsube;": { p: [8840], c: "\u2288" },
  "nsubset;": { p: [8834, 8402], c: "\u2282\u20D2" },
  "nsubseteq;": { p: [8840], c: "\u2288" },
  "nsubseteqq;": {
    p: [10949, 824],
    c: "\u2AC5\u0338"
  },
  "nsucc;": { p: [8833], c: "\u2281" },
  "nsucceq;": { p: [10928, 824], c: "\u2AB0\u0338" },
  "nsup;": { p: [8837], c: "\u2285" },
  "nsupE;": { p: [10950, 824], c: "\u2AC6\u0338" },
  "nsupe;": { p: [8841], c: "\u2289" },
  "nsupset;": { p: [8835, 8402], c: "\u2283\u20D2" },
  "nsupseteq;": { p: [8841], c: "\u2289" },
  "nsupseteqq;": {
    p: [10950, 824],
    c: "\u2AC6\u0338"
  },
  "ntgl;": { p: [8825], c: "\u2279" },
  ntilde: { p: [241], c: "\xF1" },
  "ntilde;": { p: [241], c: "\xF1" },
  "ntlg;": { p: [8824], c: "\u2278" },
  "ntriangleleft;": { p: [8938], c: "\u22EA" },
  "ntrianglelefteq;": { p: [8940], c: "\u22EC" },
  "ntriangleright;": { p: [8939], c: "\u22EB" },
  "ntrianglerighteq;": { p: [8941], c: "\u22ED" },
  "nu;": { p: [957], c: "\u03BD" },
  "num;": { p: [35], c: "#" },
  "numero;": { p: [8470], c: "\u2116" },
  "numsp;": { p: [8199], c: "\u2007" },
  "nvDash;": { p: [8877], c: "\u22AD" },
  "nvHarr;": { p: [10500], c: "\u2904" },
  "nvap;": { p: [8781, 8402], c: "\u224D\u20D2" },
  "nvdash;": { p: [8876], c: "\u22AC" },
  "nvge;": { p: [8805, 8402], c: "\u2265\u20D2" },
  "nvgt;": { p: [62, 8402], c: ">\u20D2" },
  "nvinfin;": { p: [10718], c: "\u29DE" },
  "nvlArr;": { p: [10498], c: "\u2902" },
  "nvle;": { p: [8804, 8402], c: "\u2264\u20D2" },
  "nvlt;": { p: [60, 8402], c: "<\u20D2" },
  "nvltrie;": { p: [8884, 8402], c: "\u22B4\u20D2" },
  "nvrArr;": { p: [10499], c: "\u2903" },
  "nvrtrie;": { p: [8885, 8402], c: "\u22B5\u20D2" },
  "nvsim;": { p: [8764, 8402], c: "\u223C\u20D2" },
  "nwArr;": { p: [8662], c: "\u21D6" },
  "nwarhk;": { p: [10531], c: "\u2923" },
  "nwarr;": { p: [8598], c: "\u2196" },
  "nwarrow;": { p: [8598], c: "\u2196" },
  "nwnear;": { p: [10535], c: "\u2927" },
  "oS;": { p: [9416], c: "\u24C8" },
  oacute: { p: [243], c: "\xF3" },
  "oacute;": { p: [243], c: "\xF3" },
  "oast;": { p: [8859], c: "\u229B" },
  "ocir;": { p: [8858], c: "\u229A" },
  ocirc: { p: [244], c: "\xF4" },
  "ocirc;": { p: [244], c: "\xF4" },
  "ocy;": { p: [1086], c: "\u043E" },
  "odash;": { p: [8861], c: "\u229D" },
  "odblac;": { p: [337], c: "\u0151" },
  "odiv;": { p: [10808], c: "\u2A38" },
  "odot;": { p: [8857], c: "\u2299" },
  "odsold;": { p: [10684], c: "\u29BC" },
  "oelig;": { p: [339], c: "\u0153" },
  "ofcir;": { p: [10687], c: "\u29BF" },
  "ofr;": { p: [120108], c: "\u{1D52C}" },
  "ogon;": { p: [731], c: "\u02DB" },
  ograve: { p: [242], c: "\xF2" },
  "ograve;": { p: [242], c: "\xF2" },
  "ogt;": { p: [10689], c: "\u29C1" },
  "ohbar;": { p: [10677], c: "\u29B5" },
  "ohm;": { p: [937], c: "\u03A9" },
  "oint;": { p: [8750], c: "\u222E" },
  "olarr;": { p: [8634], c: "\u21BA" },
  "olcir;": { p: [10686], c: "\u29BE" },
  "olcross;": { p: [10683], c: "\u29BB" },
  "oline;": { p: [8254], c: "\u203E" },
  "olt;": { p: [10688], c: "\u29C0" },
  "omacr;": { p: [333], c: "\u014D" },
  "omega;": { p: [969], c: "\u03C9" },
  "omicron;": { p: [959], c: "\u03BF" },
  "omid;": { p: [10678], c: "\u29B6" },
  "ominus;": { p: [8854], c: "\u2296" },
  "oopf;": { p: [120160], c: "\u{1D560}" },
  "opar;": { p: [10679], c: "\u29B7" },
  "operp;": { p: [10681], c: "\u29B9" },
  "oplus;": { p: [8853], c: "\u2295" },
  "or;": { p: [8744], c: "\u2228" },
  "orarr;": { p: [8635], c: "\u21BB" },
  "ord;": { p: [10845], c: "\u2A5D" },
  "order;": { p: [8500], c: "\u2134" },
  "orderof;": { p: [8500], c: "\u2134" },
  ordf: { p: [170], c: "\xAA" },
  "ordf;": { p: [170], c: "\xAA" },
  ordm: { p: [186], c: "\xBA" },
  "ordm;": { p: [186], c: "\xBA" },
  "origof;": { p: [8886], c: "\u22B6" },
  "oror;": { p: [10838], c: "\u2A56" },
  "orslope;": { p: [10839], c: "\u2A57" },
  "orv;": { p: [10843], c: "\u2A5B" },
  "oscr;": { p: [8500], c: "\u2134" },
  oslash: { p: [248], c: "\xF8" },
  "oslash;": { p: [248], c: "\xF8" },
  "osol;": { p: [8856], c: "\u2298" },
  otilde: { p: [245], c: "\xF5" },
  "otilde;": { p: [245], c: "\xF5" },
  "otimes;": { p: [8855], c: "\u2297" },
  "otimesas;": { p: [10806], c: "\u2A36" },
  ouml: { p: [246], c: "\xF6" },
  "ouml;": { p: [246], c: "\xF6" },
  "ovbar;": { p: [9021], c: "\u233D" },
  "par;": { p: [8741], c: "\u2225" },
  para: { p: [182], c: "\xB6" },
  "para;": { p: [182], c: "\xB6" },
  "parallel;": { p: [8741], c: "\u2225" },
  "parsim;": { p: [10995], c: "\u2AF3" },
  "parsl;": { p: [11005], c: "\u2AFD" },
  "part;": { p: [8706], c: "\u2202" },
  "pcy;": { p: [1087], c: "\u043F" },
  "percnt;": { p: [37], c: "%" },
  "period;": { p: [46], c: "." },
  "permil;": { p: [8240], c: "\u2030" },
  "perp;": { p: [8869], c: "\u22A5" },
  "pertenk;": { p: [8241], c: "\u2031" },
  "pfr;": { p: [120109], c: "\u{1D52D}" },
  "phi;": { p: [966], c: "\u03C6" },
  "phiv;": { p: [981], c: "\u03D5" },
  "phmmat;": { p: [8499], c: "\u2133" },
  "phone;": { p: [9742], c: "\u260E" },
  "pi;": { p: [960], c: "\u03C0" },
  "pitchfork;": { p: [8916], c: "\u22D4" },
  "piv;": { p: [982], c: "\u03D6" },
  "planck;": { p: [8463], c: "\u210F" },
  "planckh;": { p: [8462], c: "\u210E" },
  "plankv;": { p: [8463], c: "\u210F" },
  "plus;": { p: [43], c: "+" },
  "plusacir;": { p: [10787], c: "\u2A23" },
  "plusb;": { p: [8862], c: "\u229E" },
  "pluscir;": { p: [10786], c: "\u2A22" },
  "plusdo;": { p: [8724], c: "\u2214" },
  "plusdu;": { p: [10789], c: "\u2A25" },
  "pluse;": { p: [10866], c: "\u2A72" },
  plusmn: { p: [177], c: "\xB1" },
  "plusmn;": { p: [177], c: "\xB1" },
  "plussim;": { p: [10790], c: "\u2A26" },
  "plustwo;": { p: [10791], c: "\u2A27" },
  "pm;": { p: [177], c: "\xB1" },
  "pointint;": { p: [10773], c: "\u2A15" },
  "popf;": { p: [120161], c: "\u{1D561}" },
  pound: { p: [163], c: "\xA3" },
  "pound;": { p: [163], c: "\xA3" },
  "pr;": { p: [8826], c: "\u227A" },
  "prE;": { p: [10931], c: "\u2AB3" },
  "prap;": { p: [10935], c: "\u2AB7" },
  "prcue;": { p: [8828], c: "\u227C" },
  "pre;": { p: [10927], c: "\u2AAF" },
  "prec;": { p: [8826], c: "\u227A" },
  "precapprox;": { p: [10935], c: "\u2AB7" },
  "preccurlyeq;": { p: [8828], c: "\u227C" },
  "preceq;": { p: [10927], c: "\u2AAF" },
  "precnapprox;": { p: [10937], c: "\u2AB9" },
  "precneqq;": { p: [10933], c: "\u2AB5" },
  "precnsim;": { p: [8936], c: "\u22E8" },
  "precsim;": { p: [8830], c: "\u227E" },
  "prime;": { p: [8242], c: "\u2032" },
  "primes;": { p: [8473], c: "\u2119" },
  "prnE;": { p: [10933], c: "\u2AB5" },
  "prnap;": { p: [10937], c: "\u2AB9" },
  "prnsim;": { p: [8936], c: "\u22E8" },
  "prod;": { p: [8719], c: "\u220F" },
  "profalar;": { p: [9006], c: "\u232E" },
  "profline;": { p: [8978], c: "\u2312" },
  "profsurf;": { p: [8979], c: "\u2313" },
  "prop;": { p: [8733], c: "\u221D" },
  "propto;": { p: [8733], c: "\u221D" },
  "prsim;": { p: [8830], c: "\u227E" },
  "prurel;": { p: [8880], c: "\u22B0" },
  "pscr;": { p: [120005], c: "\u{1D4C5}" },
  "psi;": { p: [968], c: "\u03C8" },
  "puncsp;": { p: [8200], c: "\u2008" },
  "qfr;": { p: [120110], c: "\u{1D52E}" },
  "qint;": { p: [10764], c: "\u2A0C" },
  "qopf;": { p: [120162], c: "\u{1D562}" },
  "qprime;": { p: [8279], c: "\u2057" },
  "qscr;": { p: [120006], c: "\u{1D4C6}" },
  "quaternions;": { p: [8461], c: "\u210D" },
  "quatint;": { p: [10774], c: "\u2A16" },
  "quest;": { p: [63], c: "?" },
  "questeq;": { p: [8799], c: "\u225F" },
  quot: { p: [34], c: '"' },
  "quot;": { p: [34], c: '"' },
  "rAarr;": { p: [8667], c: "\u21DB" },
  "rArr;": { p: [8658], c: "\u21D2" },
  "rAtail;": { p: [10524], c: "\u291C" },
  "rBarr;": { p: [10511], c: "\u290F" },
  "rHar;": { p: [10596], c: "\u2964" },
  "race;": { p: [8765, 817], c: "\u223D\u0331" },
  "racute;": { p: [341], c: "\u0155" },
  "radic;": { p: [8730], c: "\u221A" },
  "raemptyv;": { p: [10675], c: "\u29B3" },
  "rang;": { p: [10217], c: "\u27E9" },
  "rangd;": { p: [10642], c: "\u2992" },
  "range;": { p: [10661], c: "\u29A5" },
  "rangle;": { p: [10217], c: "\u27E9" },
  raquo: { p: [187], c: "\xBB" },
  "raquo;": { p: [187], c: "\xBB" },
  "rarr;": { p: [8594], c: "\u2192" },
  "rarrap;": { p: [10613], c: "\u2975" },
  "rarrb;": { p: [8677], c: "\u21E5" },
  "rarrbfs;": { p: [10528], c: "\u2920" },
  "rarrc;": { p: [10547], c: "\u2933" },
  "rarrfs;": { p: [10526], c: "\u291E" },
  "rarrhk;": { p: [8618], c: "\u21AA" },
  "rarrlp;": { p: [8620], c: "\u21AC" },
  "rarrpl;": { p: [10565], c: "\u2945" },
  "rarrsim;": { p: [10612], c: "\u2974" },
  "rarrtl;": { p: [8611], c: "\u21A3" },
  "rarrw;": { p: [8605], c: "\u219D" },
  "ratail;": { p: [10522], c: "\u291A" },
  "ratio;": { p: [8758], c: "\u2236" },
  "rationals;": { p: [8474], c: "\u211A" },
  "rbarr;": { p: [10509], c: "\u290D" },
  "rbbrk;": { p: [10099], c: "\u2773" },
  "rbrace;": { p: [125], c: "}" },
  "rbrack;": { p: [93], c: "]" },
  "rbrke;": { p: [10636], c: "\u298C" },
  "rbrksld;": { p: [10638], c: "\u298E" },
  "rbrkslu;": { p: [10640], c: "\u2990" },
  "rcaron;": { p: [345], c: "\u0159" },
  "rcedil;": { p: [343], c: "\u0157" },
  "rceil;": { p: [8969], c: "\u2309" },
  "rcub;": { p: [125], c: "}" },
  "rcy;": { p: [1088], c: "\u0440" },
  "rdca;": { p: [10551], c: "\u2937" },
  "rdldhar;": { p: [10601], c: "\u2969" },
  "rdquo;": { p: [8221], c: "\u201D" },
  "rdquor;": { p: [8221], c: "\u201D" },
  "rdsh;": { p: [8627], c: "\u21B3" },
  "real;": { p: [8476], c: "\u211C" },
  "realine;": { p: [8475], c: "\u211B" },
  "realpart;": { p: [8476], c: "\u211C" },
  "reals;": { p: [8477], c: "\u211D" },
  "rect;": { p: [9645], c: "\u25AD" },
  reg: { p: [174], c: "\xAE" },
  "reg;": { p: [174], c: "\xAE" },
  "rfisht;": { p: [10621], c: "\u297D" },
  "rfloor;": { p: [8971], c: "\u230B" },
  "rfr;": { p: [120111], c: "\u{1D52F}" },
  "rhard;": { p: [8641], c: "\u21C1" },
  "rharu;": { p: [8640], c: "\u21C0" },
  "rharul;": { p: [10604], c: "\u296C" },
  "rho;": { p: [961], c: "\u03C1" },
  "rhov;": { p: [1009], c: "\u03F1" },
  "rightarrow;": { p: [8594], c: "\u2192" },
  "rightarrowtail;": { p: [8611], c: "\u21A3" },
  "rightharpoondown;": { p: [8641], c: "\u21C1" },
  "rightharpoonup;": { p: [8640], c: "\u21C0" },
  "rightleftarrows;": { p: [8644], c: "\u21C4" },
  "rightleftharpoons;": { p: [8652], c: "\u21CC" },
  "rightrightarrows;": { p: [8649], c: "\u21C9" },
  "rightsquigarrow;": { p: [8605], c: "\u219D" },
  "rightthreetimes;": { p: [8908], c: "\u22CC" },
  "ring;": { p: [730], c: "\u02DA" },
  "risingdotseq;": { p: [8787], c: "\u2253" },
  "rlarr;": { p: [8644], c: "\u21C4" },
  "rlhar;": { p: [8652], c: "\u21CC" },
  "rlm;": { p: [8207], c: "\u200F" },
  "rmoust;": { p: [9137], c: "\u23B1" },
  "rmoustache;": { p: [9137], c: "\u23B1" },
  "rnmid;": { p: [10990], c: "\u2AEE" },
  "roang;": { p: [10221], c: "\u27ED" },
  "roarr;": { p: [8702], c: "\u21FE" },
  "robrk;": { p: [10215], c: "\u27E7" },
  "ropar;": { p: [10630], c: "\u2986" },
  "ropf;": { p: [120163], c: "\u{1D563}" },
  "roplus;": { p: [10798], c: "\u2A2E" },
  "rotimes;": { p: [10805], c: "\u2A35" },
  "rpar;": { p: [41], c: ")" },
  "rpargt;": { p: [10644], c: "\u2994" },
  "rppolint;": { p: [10770], c: "\u2A12" },
  "rrarr;": { p: [8649], c: "\u21C9" },
  "rsaquo;": { p: [8250], c: "\u203A" },
  "rscr;": { p: [120007], c: "\u{1D4C7}" },
  "rsh;": { p: [8625], c: "\u21B1" },
  "rsqb;": { p: [93], c: "]" },
  "rsquo;": { p: [8217], c: "\u2019" },
  "rsquor;": { p: [8217], c: "\u2019" },
  "rthree;": { p: [8908], c: "\u22CC" },
  "rtimes;": { p: [8906], c: "\u22CA" },
  "rtri;": { p: [9657], c: "\u25B9" },
  "rtrie;": { p: [8885], c: "\u22B5" },
  "rtrif;": { p: [9656], c: "\u25B8" },
  "rtriltri;": { p: [10702], c: "\u29CE" },
  "ruluhar;": { p: [10600], c: "\u2968" },
  "rx;": { p: [8478], c: "\u211E" },
  "sacute;": { p: [347], c: "\u015B" },
  "sbquo;": { p: [8218], c: "\u201A" },
  "sc;": { p: [8827], c: "\u227B" },
  "scE;": { p: [10932], c: "\u2AB4" },
  "scap;": { p: [10936], c: "\u2AB8" },
  "scaron;": { p: [353], c: "\u0161" },
  "sccue;": { p: [8829], c: "\u227D" },
  "sce;": { p: [10928], c: "\u2AB0" },
  "scedil;": { p: [351], c: "\u015F" },
  "scirc;": { p: [349], c: "\u015D" },
  "scnE;": { p: [10934], c: "\u2AB6" },
  "scnap;": { p: [10938], c: "\u2ABA" },
  "scnsim;": { p: [8937], c: "\u22E9" },
  "scpolint;": { p: [10771], c: "\u2A13" },
  "scsim;": { p: [8831], c: "\u227F" },
  "scy;": { p: [1089], c: "\u0441" },
  "sdot;": { p: [8901], c: "\u22C5" },
  "sdotb;": { p: [8865], c: "\u22A1" },
  "sdote;": { p: [10854], c: "\u2A66" },
  "seArr;": { p: [8664], c: "\u21D8" },
  "searhk;": { p: [10533], c: "\u2925" },
  "searr;": { p: [8600], c: "\u2198" },
  "searrow;": { p: [8600], c: "\u2198" },
  sect: { p: [167], c: "\xA7" },
  "sect;": { p: [167], c: "\xA7" },
  "semi;": { p: [59], c: ";" },
  "seswar;": { p: [10537], c: "\u2929" },
  "setminus;": { p: [8726], c: "\u2216" },
  "setmn;": { p: [8726], c: "\u2216" },
  "sext;": { p: [10038], c: "\u2736" },
  "sfr;": { p: [120112], c: "\u{1D530}" },
  "sfrown;": { p: [8994], c: "\u2322" },
  "sharp;": { p: [9839], c: "\u266F" },
  "shchcy;": { p: [1097], c: "\u0449" },
  "shcy;": { p: [1096], c: "\u0448" },
  "shortmid;": { p: [8739], c: "\u2223" },
  "shortparallel;": { p: [8741], c: "\u2225" },
  shy: { p: [173], c: "\xAD" },
  "shy;": { p: [173], c: "\xAD" },
  "sigma;": { p: [963], c: "\u03C3" },
  "sigmaf;": { p: [962], c: "\u03C2" },
  "sigmav;": { p: [962], c: "\u03C2" },
  "sim;": { p: [8764], c: "\u223C" },
  "simdot;": { p: [10858], c: "\u2A6A" },
  "sime;": { p: [8771], c: "\u2243" },
  "simeq;": { p: [8771], c: "\u2243" },
  "simg;": { p: [10910], c: "\u2A9E" },
  "simgE;": { p: [10912], c: "\u2AA0" },
  "siml;": { p: [10909], c: "\u2A9D" },
  "simlE;": { p: [10911], c: "\u2A9F" },
  "simne;": { p: [8774], c: "\u2246" },
  "simplus;": { p: [10788], c: "\u2A24" },
  "simrarr;": { p: [10610], c: "\u2972" },
  "slarr;": { p: [8592], c: "\u2190" },
  "smallsetminus;": { p: [8726], c: "\u2216" },
  "smashp;": { p: [10803], c: "\u2A33" },
  "smeparsl;": { p: [10724], c: "\u29E4" },
  "smid;": { p: [8739], c: "\u2223" },
  "smile;": { p: [8995], c: "\u2323" },
  "smt;": { p: [10922], c: "\u2AAA" },
  "smte;": { p: [10924], c: "\u2AAC" },
  "smtes;": { p: [10924, 65024], c: "\u2AAC\uFE00" },
  "softcy;": { p: [1100], c: "\u044C" },
  "sol;": { p: [47], c: "/" },
  "solb;": { p: [10692], c: "\u29C4" },
  "solbar;": { p: [9023], c: "\u233F" },
  "sopf;": { p: [120164], c: "\u{1D564}" },
  "spades;": { p: [9824], c: "\u2660" },
  "spadesuit;": { p: [9824], c: "\u2660" },
  "spar;": { p: [8741], c: "\u2225" },
  "sqcap;": { p: [8851], c: "\u2293" },
  "sqcaps;": { p: [8851, 65024], c: "\u2293\uFE00" },
  "sqcup;": { p: [8852], c: "\u2294" },
  "sqcups;": { p: [8852, 65024], c: "\u2294\uFE00" },
  "sqsub;": { p: [8847], c: "\u228F" },
  "sqsube;": { p: [8849], c: "\u2291" },
  "sqsubset;": { p: [8847], c: "\u228F" },
  "sqsubseteq;": { p: [8849], c: "\u2291" },
  "sqsup;": { p: [8848], c: "\u2290" },
  "sqsupe;": { p: [8850], c: "\u2292" },
  "sqsupset;": { p: [8848], c: "\u2290" },
  "sqsupseteq;": { p: [8850], c: "\u2292" },
  "squ;": { p: [9633], c: "\u25A1" },
  "square;": { p: [9633], c: "\u25A1" },
  "squarf;": { p: [9642], c: "\u25AA" },
  "squf;": { p: [9642], c: "\u25AA" },
  "srarr;": { p: [8594], c: "\u2192" },
  "sscr;": { p: [120008], c: "\u{1D4C8}" },
  "ssetmn;": { p: [8726], c: "\u2216" },
  "ssmile;": { p: [8995], c: "\u2323" },
  "sstarf;": { p: [8902], c: "\u22C6" },
  "star;": { p: [9734], c: "\u2606" },
  "starf;": { p: [9733], c: "\u2605" },
  "straightepsilon;": { p: [1013], c: "\u03F5" },
  "straightphi;": { p: [981], c: "\u03D5" },
  "strns;": { p: [175], c: "\xAF" },
  "sub;": { p: [8834], c: "\u2282" },
  "subE;": { p: [10949], c: "\u2AC5" },
  "subdot;": { p: [10941], c: "\u2ABD" },
  "sube;": { p: [8838], c: "\u2286" },
  "subedot;": { p: [10947], c: "\u2AC3" },
  "submult;": { p: [10945], c: "\u2AC1" },
  "subnE;": { p: [10955], c: "\u2ACB" },
  "subne;": { p: [8842], c: "\u228A" },
  "subplus;": { p: [10943], c: "\u2ABF" },
  "subrarr;": { p: [10617], c: "\u2979" },
  "subset;": { p: [8834], c: "\u2282" },
  "subseteq;": { p: [8838], c: "\u2286" },
  "subseteqq;": { p: [10949], c: "\u2AC5" },
  "subsetneq;": { p: [8842], c: "\u228A" },
  "subsetneqq;": { p: [10955], c: "\u2ACB" },
  "subsim;": { p: [10951], c: "\u2AC7" },
  "subsub;": { p: [10965], c: "\u2AD5" },
  "subsup;": { p: [10963], c: "\u2AD3" },
  "succ;": { p: [8827], c: "\u227B" },
  "succapprox;": { p: [10936], c: "\u2AB8" },
  "succcurlyeq;": { p: [8829], c: "\u227D" },
  "succeq;": { p: [10928], c: "\u2AB0" },
  "succnapprox;": { p: [10938], c: "\u2ABA" },
  "succneqq;": { p: [10934], c: "\u2AB6" },
  "succnsim;": { p: [8937], c: "\u22E9" },
  "succsim;": { p: [8831], c: "\u227F" },
  "sum;": { p: [8721], c: "\u2211" },
  "sung;": { p: [9834], c: "\u266A" },
  sup1: { p: [185], c: "\xB9" },
  "sup1;": { p: [185], c: "\xB9" },
  sup2: { p: [178], c: "\xB2" },
  "sup2;": { p: [178], c: "\xB2" },
  sup3: { p: [179], c: "\xB3" },
  "sup3;": { p: [179], c: "\xB3" },
  "sup;": { p: [8835], c: "\u2283" },
  "supE;": { p: [10950], c: "\u2AC6" },
  "supdot;": { p: [10942], c: "\u2ABE" },
  "supdsub;": { p: [10968], c: "\u2AD8" },
  "supe;": { p: [8839], c: "\u2287" },
  "supedot;": { p: [10948], c: "\u2AC4" },
  "suphsol;": { p: [10185], c: "\u27C9" },
  "suphsub;": { p: [10967], c: "\u2AD7" },
  "suplarr;": { p: [10619], c: "\u297B" },
  "supmult;": { p: [10946], c: "\u2AC2" },
  "supnE;": { p: [10956], c: "\u2ACC" },
  "supne;": { p: [8843], c: "\u228B" },
  "supplus;": { p: [10944], c: "\u2AC0" },
  "supset;": { p: [8835], c: "\u2283" },
  "supseteq;": { p: [8839], c: "\u2287" },
  "supseteqq;": { p: [10950], c: "\u2AC6" },
  "supsetneq;": { p: [8843], c: "\u228B" },
  "supsetneqq;": { p: [10956], c: "\u2ACC" },
  "supsim;": { p: [10952], c: "\u2AC8" },
  "supsub;": { p: [10964], c: "\u2AD4" },
  "supsup;": { p: [10966], c: "\u2AD6" },
  "swArr;": { p: [8665], c: "\u21D9" },
  "swarhk;": { p: [10534], c: "\u2926" },
  "swarr;": { p: [8601], c: "\u2199" },
  "swarrow;": { p: [8601], c: "\u2199" },
  "swnwar;": { p: [10538], c: "\u292A" },
  szlig: { p: [223], c: "\xDF" },
  "szlig;": { p: [223], c: "\xDF" },
  "target;": { p: [8982], c: "\u2316" },
  "tau;": { p: [964], c: "\u03C4" },
  "tbrk;": { p: [9140], c: "\u23B4" },
  "tcaron;": { p: [357], c: "\u0165" },
  "tcedil;": { p: [355], c: "\u0163" },
  "tcy;": { p: [1090], c: "\u0442" },
  "tdot;": { p: [8411], c: "\u20DB" },
  "telrec;": { p: [8981], c: "\u2315" },
  "tfr;": { p: [120113], c: "\u{1D531}" },
  "there4;": { p: [8756], c: "\u2234" },
  "therefore;": { p: [8756], c: "\u2234" },
  "theta;": { p: [952], c: "\u03B8" },
  "thetasym;": { p: [977], c: "\u03D1" },
  "thetav;": { p: [977], c: "\u03D1" },
  "thickapprox;": { p: [8776], c: "\u2248" },
  "thicksim;": { p: [8764], c: "\u223C" },
  "thinsp;": { p: [8201], c: "\u2009" },
  "thkap;": { p: [8776], c: "\u2248" },
  "thksim;": { p: [8764], c: "\u223C" },
  thorn: { p: [254], c: "\xFE" },
  "thorn;": { p: [254], c: "\xFE" },
  "tilde;": { p: [732], c: "\u02DC" },
  times: { p: [215], c: "\xD7" },
  "times;": { p: [215], c: "\xD7" },
  "timesb;": { p: [8864], c: "\u22A0" },
  "timesbar;": { p: [10801], c: "\u2A31" },
  "timesd;": { p: [10800], c: "\u2A30" },
  "tint;": { p: [8749], c: "\u222D" },
  "toea;": { p: [10536], c: "\u2928" },
  "top;": { p: [8868], c: "\u22A4" },
  "topbot;": { p: [9014], c: "\u2336" },
  "topcir;": { p: [10993], c: "\u2AF1" },
  "topf;": { p: [120165], c: "\u{1D565}" },
  "topfork;": { p: [10970], c: "\u2ADA" },
  "tosa;": { p: [10537], c: "\u2929" },
  "tprime;": { p: [8244], c: "\u2034" },
  "trade;": { p: [8482], c: "\u2122" },
  "triangle;": { p: [9653], c: "\u25B5" },
  "triangledown;": { p: [9663], c: "\u25BF" },
  "triangleleft;": { p: [9667], c: "\u25C3" },
  "trianglelefteq;": { p: [8884], c: "\u22B4" },
  "triangleq;": { p: [8796], c: "\u225C" },
  "triangleright;": { p: [9657], c: "\u25B9" },
  "trianglerighteq;": { p: [8885], c: "\u22B5" },
  "tridot;": { p: [9708], c: "\u25EC" },
  "trie;": { p: [8796], c: "\u225C" },
  "triminus;": { p: [10810], c: "\u2A3A" },
  "triplus;": { p: [10809], c: "\u2A39" },
  "trisb;": { p: [10701], c: "\u29CD" },
  "tritime;": { p: [10811], c: "\u2A3B" },
  "trpezium;": { p: [9186], c: "\u23E2" },
  "tscr;": { p: [120009], c: "\u{1D4C9}" },
  "tscy;": { p: [1094], c: "\u0446" },
  "tshcy;": { p: [1115], c: "\u045B" },
  "tstrok;": { p: [359], c: "\u0167" },
  "twixt;": { p: [8812], c: "\u226C" },
  "twoheadleftarrow;": { p: [8606], c: "\u219E" },
  "twoheadrightarrow;": { p: [8608], c: "\u21A0" },
  "uArr;": { p: [8657], c: "\u21D1" },
  "uHar;": { p: [10595], c: "\u2963" },
  uacute: { p: [250], c: "\xFA" },
  "uacute;": { p: [250], c: "\xFA" },
  "uarr;": { p: [8593], c: "\u2191" },
  "ubrcy;": { p: [1118], c: "\u045E" },
  "ubreve;": { p: [365], c: "\u016D" },
  ucirc: { p: [251], c: "\xFB" },
  "ucirc;": { p: [251], c: "\xFB" },
  "ucy;": { p: [1091], c: "\u0443" },
  "udarr;": { p: [8645], c: "\u21C5" },
  "udblac;": { p: [369], c: "\u0171" },
  "udhar;": { p: [10606], c: "\u296E" },
  "ufisht;": { p: [10622], c: "\u297E" },
  "ufr;": { p: [120114], c: "\u{1D532}" },
  ugrave: { p: [249], c: "\xF9" },
  "ugrave;": { p: [249], c: "\xF9" },
  "uharl;": { p: [8639], c: "\u21BF" },
  "uharr;": { p: [8638], c: "\u21BE" },
  "uhblk;": { p: [9600], c: "\u2580" },
  "ulcorn;": { p: [8988], c: "\u231C" },
  "ulcorner;": { p: [8988], c: "\u231C" },
  "ulcrop;": { p: [8975], c: "\u230F" },
  "ultri;": { p: [9720], c: "\u25F8" },
  "umacr;": { p: [363], c: "\u016B" },
  uml: { p: [168], c: "\xA8" },
  "uml;": { p: [168], c: "\xA8" },
  "uogon;": { p: [371], c: "\u0173" },
  "uopf;": { p: [120166], c: "\u{1D566}" },
  "uparrow;": { p: [8593], c: "\u2191" },
  "updownarrow;": { p: [8597], c: "\u2195" },
  "upharpoonleft;": { p: [8639], c: "\u21BF" },
  "upharpoonright;": { p: [8638], c: "\u21BE" },
  "uplus;": { p: [8846], c: "\u228E" },
  "upsi;": { p: [965], c: "\u03C5" },
  "upsih;": { p: [978], c: "\u03D2" },
  "upsilon;": { p: [965], c: "\u03C5" },
  "upuparrows;": { p: [8648], c: "\u21C8" },
  "urcorn;": { p: [8989], c: "\u231D" },
  "urcorner;": { p: [8989], c: "\u231D" },
  "urcrop;": { p: [8974], c: "\u230E" },
  "uring;": { p: [367], c: "\u016F" },
  "urtri;": { p: [9721], c: "\u25F9" },
  "uscr;": { p: [120010], c: "\u{1D4CA}" },
  "utdot;": { p: [8944], c: "\u22F0" },
  "utilde;": { p: [361], c: "\u0169" },
  "utri;": { p: [9653], c: "\u25B5" },
  "utrif;": { p: [9652], c: "\u25B4" },
  "uuarr;": { p: [8648], c: "\u21C8" },
  uuml: { p: [252], c: "\xFC" },
  "uuml;": { p: [252], c: "\xFC" },
  "uwangle;": { p: [10663], c: "\u29A7" },
  "vArr;": { p: [8661], c: "\u21D5" },
  "vBar;": { p: [10984], c: "\u2AE8" },
  "vBarv;": { p: [10985], c: "\u2AE9" },
  "vDash;": { p: [8872], c: "\u22A8" },
  "vangrt;": { p: [10652], c: "\u299C" },
  "varepsilon;": { p: [1013], c: "\u03F5" },
  "varkappa;": { p: [1008], c: "\u03F0" },
  "varnothing;": { p: [8709], c: "\u2205" },
  "varphi;": { p: [981], c: "\u03D5" },
  "varpi;": { p: [982], c: "\u03D6" },
  "varpropto;": { p: [8733], c: "\u221D" },
  "varr;": { p: [8597], c: "\u2195" },
  "varrho;": { p: [1009], c: "\u03F1" },
  "varsigma;": { p: [962], c: "\u03C2" },
  "varsubsetneq;": {
    p: [8842, 65024],
    c: "\u228A\uFE00"
  },
  "varsubsetneqq;": {
    p: [10955, 65024],
    c: "\u2ACB\uFE00"
  },
  "varsupsetneq;": {
    p: [8843, 65024],
    c: "\u228B\uFE00"
  },
  "varsupsetneqq;": {
    p: [10956, 65024],
    c: "\u2ACC\uFE00"
  },
  "vartheta;": { p: [977], c: "\u03D1" },
  "vartriangleleft;": { p: [8882], c: "\u22B2" },
  "vartriangleright;": { p: [8883], c: "\u22B3" },
  "vcy;": { p: [1074], c: "\u0432" },
  "vdash;": { p: [8866], c: "\u22A2" },
  "vee;": { p: [8744], c: "\u2228" },
  "veebar;": { p: [8891], c: "\u22BB" },
  "veeeq;": { p: [8794], c: "\u225A" },
  "vellip;": { p: [8942], c: "\u22EE" },
  "verbar;": { p: [124], c: "|" },
  "vert;": { p: [124], c: "|" },
  "vfr;": { p: [120115], c: "\u{1D533}" },
  "vltri;": { p: [8882], c: "\u22B2" },
  "vnsub;": { p: [8834, 8402], c: "\u2282\u20D2" },
  "vnsup;": { p: [8835, 8402], c: "\u2283\u20D2" },
  "vopf;": { p: [120167], c: "\u{1D567}" },
  "vprop;": { p: [8733], c: "\u221D" },
  "vrtri;": { p: [8883], c: "\u22B3" },
  "vscr;": { p: [120011], c: "\u{1D4CB}" },
  "vsubnE;": { p: [10955, 65024], c: "\u2ACB\uFE00" },
  "vsubne;": { p: [8842, 65024], c: "\u228A\uFE00" },
  "vsupnE;": { p: [10956, 65024], c: "\u2ACC\uFE00" },
  "vsupne;": { p: [8843, 65024], c: "\u228B\uFE00" },
  "vzigzag;": { p: [10650], c: "\u299A" },
  "wcirc;": { p: [373], c: "\u0175" },
  "wedbar;": { p: [10847], c: "\u2A5F" },
  "wedge;": { p: [8743], c: "\u2227" },
  "wedgeq;": { p: [8793], c: "\u2259" },
  "weierp;": { p: [8472], c: "\u2118" },
  "wfr;": { p: [120116], c: "\u{1D534}" },
  "wopf;": { p: [120168], c: "\u{1D568}" },
  "wp;": { p: [8472], c: "\u2118" },
  "wr;": { p: [8768], c: "\u2240" },
  "wreath;": { p: [8768], c: "\u2240" },
  "wscr;": { p: [120012], c: "\u{1D4CC}" },
  "xcap;": { p: [8898], c: "\u22C2" },
  "xcirc;": { p: [9711], c: "\u25EF" },
  "xcup;": { p: [8899], c: "\u22C3" },
  "xdtri;": { p: [9661], c: "\u25BD" },
  "xfr;": { p: [120117], c: "\u{1D535}" },
  "xhArr;": { p: [10234], c: "\u27FA" },
  "xharr;": { p: [10231], c: "\u27F7" },
  "xi;": { p: [958], c: "\u03BE" },
  "xlArr;": { p: [10232], c: "\u27F8" },
  "xlarr;": { p: [10229], c: "\u27F5" },
  "xmap;": { p: [10236], c: "\u27FC" },
  "xnis;": { p: [8955], c: "\u22FB" },
  "xodot;": { p: [10752], c: "\u2A00" },
  "xopf;": { p: [120169], c: "\u{1D569}" },
  "xoplus;": { p: [10753], c: "\u2A01" },
  "xotime;": { p: [10754], c: "\u2A02" },
  "xrArr;": { p: [10233], c: "\u27F9" },
  "xrarr;": { p: [10230], c: "\u27F6" },
  "xscr;": { p: [120013], c: "\u{1D4CD}" },
  "xsqcup;": { p: [10758], c: "\u2A06" },
  "xuplus;": { p: [10756], c: "\u2A04" },
  "xutri;": { p: [9651], c: "\u25B3" },
  "xvee;": { p: [8897], c: "\u22C1" },
  "xwedge;": { p: [8896], c: "\u22C0" },
  yacute: { p: [253], c: "\xFD" },
  "yacute;": { p: [253], c: "\xFD" },
  "yacy;": { p: [1103], c: "\u044F" },
  "ycirc;": { p: [375], c: "\u0177" },
  "ycy;": { p: [1099], c: "\u044B" },
  yen: { p: [165], c: "\xA5" },
  "yen;": { p: [165], c: "\xA5" },
  "yfr;": { p: [120118], c: "\u{1D536}" },
  "yicy;": { p: [1111], c: "\u0457" },
  "yopf;": { p: [120170], c: "\u{1D56A}" },
  "yscr;": { p: [120014], c: "\u{1D4CE}" },
  "yucy;": { p: [1102], c: "\u044E" },
  yuml: { p: [255], c: "\xFF" },
  "yuml;": { p: [255], c: "\xFF" },
  "zacute;": { p: [378], c: "\u017A" },
  "zcaron;": { p: [382], c: "\u017E" },
  "zcy;": { p: [1079], c: "\u0437" },
  "zdot;": { p: [380], c: "\u017C" },
  "zeetrf;": { p: [8488], c: "\u2128" },
  "zeta;": { p: [950], c: "\u03B6" },
  "zfr;": { p: [120119], c: "\u{1D537}" },
  "zhcy;": { p: [1078], c: "\u0436" },
  "zigrarr;": { p: [8669], c: "\u21DD" },
  "zopf;": { p: [120171], c: "\u{1D56B}" },
  "zscr;": { p: [120015], c: "\u{1D4CF}" },
  "zwj;": { p: [8205], c: "\u200D" },
  "zwnj;": { p: [8204], c: "\u200C" }
};

// src/lib/utils/html.ts
var htmlEntitiesTrie = {};
for (const [name, data] of Object.entries(htmlEntities)) {
  let current = htmlEntitiesTrie;
  for (let i = 0; i < name.length; ++i) {
    current.children ||= {};
    current = current.children[name.charCodeAt(i)] ||= {};
  }
  current.data = data;
}
function createNormalizedUrl(url) {
  const codePoints = [...url].map((c) => c.codePointAt(0));
  for (let i = 0; i < codePoints.length; ++i) {
    if (isalnum(codePoints[i])) continue;
    switch (codePoints[i]) {
      // case Chars.BANG: // commonly used for shell history access
      // case Chars.DOLLAR: // variable reference in shells
      // case Chars.AMPERSAND: // confusing in urls with params
      // case Chars.APOSTROPHE: // sometimes permitted for quoting
      case 40 /* LEFT_PAREN */:
      case 41 /* RIGHT_PAREN */:
      // case Chars.ASTERISK: // not allowed in file names on windows
      case 43 /* PLUS */:
      case 44 /* COMMA */:
      case 45 /* DASH */:
      case 46 /* DOT */:
      // case Chars.SOLIDUS: // not allowed in file names
      // case Chars.COLON: // not allowed in file names on windows
      // case Chars.SEMICOLON: // appears suspiciously close to colon
      // case Chars.EQUALS: // confusing in urls with params
      // case Chars.QUESTION_MARK: // not allowed in file names on windows
      // case Chars.AT: // avoid confusing some (bad) software that thinks this is an email
      case 95 /* UNDERSCORE */:
        continue;
    }
    if (160 <= codePoints[i] && codePoints[i] <= 1114109) {
      if (!isSurrogate(codePoints[i])) {
        continue;
      }
    }
    codePoints[i] = 95 /* UNDERSCORE */;
  }
  return String.fromCodePoint(...codePoints);
}
function isalpha(ch) {
  return 97 /* LOWERCASE_A */ <= (ch | 32) && (ch | 32) <= 122 /* LOWERCASE_Z */;
}
function isdigit(ch) {
  return 48 /* ZERO */ <= ch && ch <= 57 /* NINE */;
}
function isalnum(ch) {
  return isalpha(ch) || isdigit(ch);
}
function isxdigit(ch) {
  return isdigit(ch) || 97 /* LOWERCASE_A */ <= (ch | 32) && (ch | 32) <= 102 /* LOWERCASE_F */;
}
var ParserState = /* @__PURE__ */ ((ParserState2) => {
  ParserState2[ParserState2["BeforeAttributeName"] = 0] = "BeforeAttributeName";
  ParserState2[ParserState2["AfterAttributeName"] = 1] = "AfterAttributeName";
  ParserState2[ParserState2["BeforeAttributeValue"] = 2] = "BeforeAttributeValue";
  ParserState2[ParserState2["END"] = 3] = "END";
  return ParserState2;
})(ParserState || {});
var HtmlAttributeParser = class {
  constructor(text, pos = 0) {
    this.text = text;
    this.pos = pos;
  }
  text;
  pos;
  state = 0 /* BeforeAttributeName */;
  currentAttributeName = "";
  currentAttributeValueStart = -1;
  currentAttributeValueEnd = -1;
  currentAttributeValue = "";
  temporaryBuffer = [];
  characterReferenceCode = 0;
  step() {
    switch (this.state) {
      case 0 /* BeforeAttributeName */:
        this.beforeAttributeName();
        return;
      case 1 /* AfterAttributeName */:
        this.afterAttributeName();
        return;
      case 2 /* BeforeAttributeValue */:
        this.beforeAttributeValue();
        return;
      case 3 /* END */:
        return;
    }
    assertNever2(this.state);
  }
  peek() {
    const ch = this.text.charCodeAt(this.pos);
    return isNaN(ch) ? -1 /* EOF */ : ch;
  }
  consume() {
    const ch = this.peek();
    ++this.pos;
    return ch;
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#before-attribute-name-state
  beforeAttributeName() {
    this.currentAttributeName = "";
    this.currentAttributeValue = "";
    loop: for (; ; ) {
      switch (this.consume()) {
        case 9 /* TAB */:
        case 10 /* LF */:
        case 12 /* FF */:
        case 32 /* SPACE */:
          break;
        case 47 /* SOLIDUS */:
        case 62 /* GREATER_THAN */:
        case -1 /* EOF */:
          --this.pos;
          this.afterAttributeName();
          break loop;
        case 61 /* EQUALS */:
        // Unexpected equals sign before attribute name parse error.
        // fall through
        default:
          --this.pos;
          this.attributeName();
          break loop;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#attribute-name-state
  attributeName() {
    const startPos = this.pos;
    loop: for (; ; ) {
      const ch = this.consume();
      switch (ch) {
        case 9 /* TAB */:
        case 10 /* LF */:
        case 12 /* FF */:
        case 32 /* SPACE */:
        case 47 /* SOLIDUS */:
        case 62 /* GREATER_THAN */:
        case -1 /* EOF */:
          --this.pos;
          this.state = 1 /* AfterAttributeName */;
          break loop;
        case 61 /* EQUALS */:
          this.state = 2 /* BeforeAttributeValue */;
          break loop;
        case 34 /* QUOTATION_MARK */:
        case 39 /* APOSTROPHE */:
        case 60 /* LESS_THAN */:
        // This is an unexpected-character-in-attribute-name parse error. Treat it as per the "anything else" entry below.
        // fall through
        default:
          break;
      }
    }
    if (this.state === 2 /* BeforeAttributeValue */) {
      this.currentAttributeName = this.text.substring(startPos, this.pos - 1).toLowerCase();
    } else {
      this.currentAttributeName = this.text.substring(startPos, this.pos).toLowerCase();
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#after-attribute-name-state
  afterAttributeName() {
    loop: for (; ; ) {
      switch (this.consume()) {
        case 9 /* TAB */:
        case 10 /* LF */:
        case 12 /* FF */:
        case 32 /* SPACE */:
          break;
        // Ignore the character
        case 47 /* SOLIDUS */:
          this.state = 3 /* END */;
          break loop;
        case 61 /* EQUALS */:
          this.state = 2 /* BeforeAttributeValue */;
          break loop;
        case 62 /* GREATER_THAN */:
          this.state = 3 /* END */;
          break loop;
        case -1 /* EOF */:
          this.state = 3 /* END */;
          break loop;
        default:
          --this.pos;
          this.attributeName();
          break loop;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#before-attribute-value-state
  beforeAttributeValue() {
    loop: for (; ; ) {
      switch (this.consume()) {
        case 9 /* TAB */:
        case 10 /* LF */:
        case 12 /* FF */:
        case 32 /* SPACE */:
          break;
        // Ignore the character
        case 34 /* QUOTATION_MARK */:
          this.attributeValueDoubleQuoted();
          break loop;
        case 39 /* APOSTROPHE */:
          this.attributeValueSingleQuoted();
          break loop;
        case 62 /* GREATER_THAN */:
          this.state = 3 /* END */;
          break loop;
        default:
          --this.pos;
          this.attributeValueUnquoted();
          break loop;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state
  attributeValueDoubleQuoted() {
    this.currentAttributeValueStart = this.pos;
    loop: for (; ; ) {
      switch (this.consume()) {
        case 34 /* QUOTATION_MARK */:
          this.currentAttributeValueEnd = this.pos - 1;
          this.afterAttributeValueQuoted();
          break loop;
        case 38 /* AMPERSAND */:
          this.characterReference();
          break;
        case 0 /* NULL */:
          this.currentAttributeValue += String.fromCharCode(65533);
          break;
        case -1 /* EOF */:
          this.currentAttributeValueEnd = this.pos;
          this.state = 3 /* END */;
          break loop;
        default:
          this.currentAttributeValue += this.text[this.pos - 1];
          break;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(single-quoted)-state
  attributeValueSingleQuoted() {
    this.currentAttributeValueStart = this.pos;
    loop: for (; ; ) {
      switch (this.consume()) {
        case 39 /* APOSTROPHE */:
          this.currentAttributeValueEnd = this.pos - 1;
          this.afterAttributeValueQuoted();
          break loop;
        case 38 /* AMPERSAND */:
          this.characterReference();
          break;
        case 0 /* NULL */:
          this.currentAttributeValue += String.fromCharCode(65533);
          break;
        case -1 /* EOF */:
          this.currentAttributeValueEnd = this.pos;
          this.state = 3 /* END */;
          break loop;
        default:
          this.currentAttributeValue += this.text[this.pos - 1];
          break;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(unquoted)-state
  attributeValueUnquoted() {
    this.currentAttributeValueStart = this.pos;
    loop: for (; ; ) {
      switch (this.consume()) {
        case 9 /* TAB */:
        case 10 /* LF */:
        case 12 /* FF */:
        case 32 /* SPACE */:
          this.currentAttributeValueEnd = this.pos - 1;
          this.state = 0 /* BeforeAttributeName */;
          break loop;
        case 38 /* AMPERSAND */:
          this.characterReference();
          break;
        case 62 /* GREATER_THAN */:
          this.currentAttributeValueEnd = this.pos;
          this.state = 3 /* END */;
          break loop;
        case 0 /* NULL */:
          this.currentAttributeValue += String.fromCharCode(65533);
          break;
        case -1 /* EOF */:
          this.currentAttributeValueEnd = this.pos;
          this.state = 3 /* END */;
          break loop;
        case 34 /* QUOTATION_MARK */:
        case 39 /* APOSTROPHE */:
        case 60 /* LESS_THAN */:
        case 61 /* EQUALS */:
        case 96 /* GRAVE_ACCENT */:
        // This is an unexpected-character-in-unquoted-attribute-value parse error. Treat it as per the "anything else" entry below.
        // fall through
        default:
          this.currentAttributeValue += this.text[this.pos - 1];
          break;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#after-attribute-value-(quoted)-state
  afterAttributeValueQuoted() {
    switch (this.consume()) {
      case 9 /* TAB */:
      case 10 /* LF */:
      case 12 /* FF */:
      case 32 /* SPACE */:
        this.state = 0 /* BeforeAttributeName */;
        break;
      case 47 /* SOLIDUS */:
      case 62 /* GREATER_THAN */:
      case -1 /* EOF */:
        this.state = 3 /* END */;
        break;
      default:
        --this.pos;
        this.state = 0 /* BeforeAttributeName */;
        break;
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#character-reference-state
  characterReference() {
    this.temporaryBuffer = [38 /* AMPERSAND */];
    const next = this.consume();
    if (isalnum(next)) {
      --this.pos;
      this.namedCharacterReference();
    } else if (next == 35 /* NUMBER_SIGN */) {
      this.temporaryBuffer.push(next);
      this.numericCharacterReference();
    } else {
      --this.pos;
      this.flushTemporaryBuffer();
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
  // Intentionally only handling part of an attribute
  namedCharacterReference() {
    let currentTrie = htmlEntitiesTrie;
    for (; ; ) {
      const ch = this.consume();
      this.temporaryBuffer.push(ch);
      if (currentTrie.children && ch in currentTrie.children) {
        currentTrie = currentTrie.children[ch];
      } else {
        --this.pos;
        this.temporaryBuffer.pop();
        const lastChar = this.temporaryBuffer[this.temporaryBuffer.length - 1];
        if (currentTrie.data) {
          if (lastChar != 59 /* SEMICOLON */ && (this.peek() == 61 /* EQUALS */ || isalpha(this.peek()))) {
            this.flushTemporaryBuffer();
            return;
          } else {
            this.temporaryBuffer = currentTrie.data.p;
            this.flushTemporaryBuffer();
            return;
          }
        } else {
          this.flushTemporaryBuffer();
          this.ambiguousAmpersand();
          return;
        }
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#ambiguous-ampersand-state
  ambiguousAmpersand() {
    const ch = this.consume();
    if (isalnum(ch)) {
      this.currentAttributeValue += String.fromCharCode(ch);
    } else {
      --this.pos;
      return;
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-state
  numericCharacterReference() {
    this.characterReferenceCode = 0;
    const ch = this.consume();
    switch (ch) {
      case 120 /* LOWERCASE_X */:
      case 88 /* UPPERCASE_X */:
        this.temporaryBuffer.push(ch);
        this.hexadecimalCharacterReferenceStart();
        break;
      default:
        --this.pos;
        this.decimalCharacterReferenceStart();
        break;
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#hexadecimal-character-reference-start-state
  hexadecimalCharacterReferenceStart() {
    const ch = this.consume();
    if (isxdigit(ch)) {
      --this.pos;
      this.hexadecimalCharacterReference();
    } else {
      --this.pos;
      this.flushTemporaryBuffer();
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#decimal-character-reference-start-state
  decimalCharacterReferenceStart() {
    const ch = this.consume();
    if (isdigit(ch)) {
      --this.pos;
      this.decimalCharacterReference();
    } else {
      --this.pos;
      this.flushTemporaryBuffer();
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#hexadecimal-character-reference-state
  hexadecimalCharacterReference() {
    for (; ; ) {
      const ch = this.consume();
      if (isdigit(ch)) {
        this.characterReferenceCode *= 16;
        this.characterReferenceCode += ch - 48;
      } else if (65 /* UPPERCASE_A */ <= ch && ch <= 70 /* UPPERCASE_F */) {
        this.characterReferenceCode *= 16;
        this.characterReferenceCode += ch - 55;
      } else if (97 /* LOWERCASE_A */ <= ch && ch <= 102 /* LOWERCASE_F */) {
        this.characterReferenceCode *= 16;
        this.characterReferenceCode += ch - 87;
      } else if (ch === 59 /* SEMICOLON */) {
        this.numericCharacterReferenceEndState();
        return;
      } else {
        --this.pos;
        this.numericCharacterReferenceEndState();
        return;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#decimal-character-reference-state
  decimalCharacterReference() {
    for (; ; ) {
      const ch = this.consume();
      if (isdigit(ch)) {
        this.characterReferenceCode *= 10;
        this.characterReferenceCode += ch - 48;
      } else if (ch === 59 /* SEMICOLON */) {
        this.numericCharacterReferenceEndState();
        return;
      } else {
        --this.pos;
        this.numericCharacterReferenceEndState();
        return;
      }
    }
  }
  // https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state
  numericCharacterReferenceEndState() {
    if (this.characterReferenceCode == 0) {
      this.characterReferenceCode = 65533;
    }
    if (this.characterReferenceCode > 1114111) {
      this.characterReferenceCode = 65533;
    }
    if (isSurrogate(this.characterReferenceCode)) {
      this.characterReferenceCode = 65533;
    }
    this.characterReferenceCode = characterReferenceCodePointReplacements.get(
      this.characterReferenceCode
    ) ?? this.characterReferenceCode;
    this.temporaryBuffer = [this.characterReferenceCode];
    this.flushTemporaryBuffer();
  }
  flushTemporaryBuffer() {
    this.currentAttributeValue += String.fromCodePoint(
      ...this.temporaryBuffer
    );
    this.temporaryBuffer = [];
  }
};
function isLeadingSurrogate(ch) {
  return 55296 <= ch && ch <= 56319;
}
function isTrailingSurrogate(ch) {
  return 56320 <= ch && ch <= 57343;
}
function isSurrogate(ch) {
  return isLeadingSurrogate(ch) || isTrailingSurrogate(ch);
}
var characterReferenceCodePointReplacements = /* @__PURE__ */ new Map([
  [128, 8364],
  // EURO SIGN (€)
  [130, 8218],
  // SINGLE LOW-9 QUOTATION MARK (‚)
  [131, 402],
  // LATIN SMALL LETTER F WITH HOOK (ƒ)
  [132, 8222],
  // DOUBLE LOW-9 QUOTATION MARK („)
  [133, 8230],
  // HORIZONTAL ELLIPSIS (…)
  [134, 8224],
  // DAGGER (†)
  [135, 8225],
  // DOUBLE DAGGER (‡)
  [136, 710],
  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
  [137, 8240],
  // PER MILLE SIGN (‰)
  [138, 352],
  // LATIN CAPITAL LETTER S WITH CARON (Š)
  [139, 8249],
  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
  [140, 338],
  // LATIN CAPITAL LIGATURE OE (Œ)
  [142, 381],
  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
  [145, 8216],
  // LEFT SINGLE QUOTATION MARK (‘)
  [146, 8217],
  // RIGHT SINGLE QUOTATION MARK (’)
  [147, 8220],
  // LEFT DOUBLE QUOTATION MARK (“)
  [148, 8221],
  // RIGHT DOUBLE QUOTATION MARK (”)
  [149, 8226],
  // BULLET (•)
  [150, 8211],
  // EN DASH (–)
  [151, 8212],
  // EM DASH (—)
  [152, 732],
  // SMALL TILDE (˜)
  [153, 8482],
  // TRADE MARK SIGN (™)
  [154, 353],
  // LATIN SMALL LETTER S WITH CARON (š)
  [155, 8250],
  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
  [156, 339],
  // LATIN SMALL LIGATURE OE (œ)
  [158, 382],
  // LATIN SMALL LETTER Z WITH CARON (ž)
  [159, 376]
  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
]);

// src/lib/utils/tsutils.ts
import ts7 from "typescript";
function getQualifiedName(symbol, defaultName) {
  let sym = symbol;
  const parts = [];
  while (sym && !sym.declarations?.some(ts7.isSourceFile)) {
    parts.unshift(getHumanName(sym.name));
    sym = sym.parent;
  }
  return parts.join(".") || defaultName;
}
function getHumanName(name) {
  const match = /^__@(.*)@\d+$/.exec(name);
  if (match) {
    return `[${match[1]}]`;
  }
  return name;
}

// src/lib/utils/ValidatingFileRegistry.ts
import { FileRegistry } from "#models";
import { i18n as i18n11, NormalizedPathUtils } from "#utils";
import { existsSync as existsSync4 } from "fs";
var ValidatingFileRegistry = class extends FileRegistry {
  basePath;
  constructor(basePath = "") {
    super();
    this.basePath = basePath;
  }
  register(sourcePath, relativePath) {
    let absolute = NormalizedPathUtils.resolve(NormalizedPathUtils.dirname(sourcePath), relativePath);
    let absoluteWithoutAnchor = absolute.replace(/#.*/, "");
    if (!existsSync4(absoluteWithoutAnchor)) {
      if (this.basePath != "") {
        absolute = NormalizedPathUtils.resolve(this.basePath, relativePath);
        absoluteWithoutAnchor = absolute.replace(/#.*/, "");
        if (!existsSync4(absoluteWithoutAnchor)) {
          return;
        }
      } else {
        return;
      }
    }
    return this.registerAbsolute(absolute);
  }
  fromObject(de, obj) {
    for (const [key, val] of Object.entries(obj.entries)) {
      const absolute = NormalizedPathUtils.resolve(de.projectRoot, val);
      if (!existsSync4(absolute)) {
        de.logger.warn(
          i18n11.saved_relative_path_0_resolved_from_1_does_not_exist(
            val,
            de.projectRoot
          )
        );
        continue;
      }
      de.oldFileIdToNewFileId[+key] = this.registerAbsolute(absolute).target;
    }
    de.defer((project) => {
      for (const [media, reflId] of Object.entries(obj.reflections)) {
        const refl = project.getReflectionById(
          de.oldIdToNewId[reflId]
        );
        if (refl) {
          this.mediaToReflection.set(
            de.oldFileIdToNewFileId[+media],
            refl.id
          );
        } else {
          de.logger.warn(
            i18n11.serialized_project_referenced_0_not_part_of_project(
              reflId.toString()
            )
          );
        }
      }
    });
  }
};
export {
  AbstractComponent,
  ArgumentsReader,
  CommentStyle,
  options_exports as Configuration,
  EmitStrategy,
  EntryPointStrategy,
  FancyConsoleLogger,
  HtmlAttributeParser,
  MinimatchSet,
  Option,
  defaults_exports as OptionDefaults,
  Options,
  PackageJsonReader,
  ParameterHint,
  ParameterType,
  ParserState,
  SORT_STRATEGIES,
  SUPPORTED_TYPESCRIPT_VERSIONS,
  TSConfigReader,
  tsdoc_defaults_exports as TSDocDefaults,
  TYPEDOC_ROOT,
  TYPEDOC_VERSION,
  TYPESCRIPT_ROOT,
  TypeDocReader,
  ValidatingFileRegistry,
  addInferredDeclarationMapPaths,
  addTypeDocOptions,
  compressJson,
  copy,
  copySync,
  createGlobString,
  createNormalizedUrl,
  deriveRootDir,
  diagnostic,
  diagnostics,
  discoverAllReferenceTypes,
  discoverFiles,
  discoverInParentDirExactMatch,
  discoverPackageJson,
  findPackageForPath,
  findTsConfigFile,
  getCommonDirectory,
  getCommonPath,
  getDocumentEntryPoints,
  getEntryPoints,
  getExpandedEntryPointsForPaths,
  getHumanName,
  getLoadedPaths,
  getPackageDirectories,
  getQualifiedName,
  getSortFunction,
  getStyles,
  getSupportedLanguages,
  getSupportedThemes,
  getTypeDocOptionsFromTsConfig,
  getWatchEntryPoints,
  glob,
  hasBeenLoadedMultipleTimes,
  hasDeclarationFileExtension,
  hasTsExtension,
  highlight,
  inferEntryPoints,
  inferPackageEntryPointPaths,
  isDebugging,
  isDir,
  isFile,
  isLoadedLanguage,
  isSupportedLanguage,
  isValidSortStrategy,
  loadHighlighter,
  loadPlugins,
  loadTestHighlighter,
  nicePath,
  normalizePath,
  readFile,
  readTsConfig,
  resolveDeclarationMaps,
  rootPackageOptions,
  splitGlobToPathAndSpecial,
  writeFile,
  writeFileSync2 as writeFileSync
};
