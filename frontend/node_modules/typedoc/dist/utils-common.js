var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/utils-common/array.ts
var emptyArray = [];
function insertPrioritySorted(arr, item) {
  const index = binaryFindPartition(arr, (v) => v.priority < item.priority);
  arr.splice(index === -1 ? arr.length : index, 0, item);
  return arr;
}
function insertOrderSorted(arr, item) {
  const index = binaryFindPartition(arr, (v) => v.order > item.order);
  arr.splice(index === -1 ? arr.length : index, 0, item);
  return arr;
}
function binaryFindPartition(arr, partition2) {
  if (arr.length === 0) {
    return -1;
  }
  let low = 0, high = arr.length - 1;
  while (high > low) {
    const mid = low + Math.floor((high - low) / 2);
    if (partition2(arr[mid])) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return partition2(arr[low]) ? low : -1;
}
function removeIfPresent(arr, item) {
  if (!arr) {
    return;
  }
  const index = arr.indexOf(item);
  if (index !== -1) {
    arr.splice(index, 1);
  }
}
function removeIf(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      arr.splice(i, 1);
      i--;
    }
  }
}
function unique(arr) {
  return Array.from(new Set(arr));
}
function partition(iter, predicate) {
  const left = [];
  const right = [];
  for (const item of iter) {
    if (predicate(item)) {
      left.push(item);
    } else {
      right.push(item);
    }
  }
  return [left, right];
}
function* zip(...args) {
  const iterators = args.map((x) => x[Symbol.iterator]());
  for (; ; ) {
    const next = iterators.map((i) => i.next());
    if (next.some((v) => v.done)) {
      break;
    }
    yield next.map((v) => v.value);
  }
}
function filterMap(iter, fn) {
  const result = [];
  for (const item of iter || []) {
    const newItem = fn(item);
    if (newItem !== void 0) {
      result.push(newItem);
    }
  }
  return result;
}
function firstDefined(array, callback) {
  for (let i = 0; i < array.length; i++) {
    const result = callback(array[i], i);
    if (result !== void 0) {
      return result;
    }
  }
  return void 0;
}
function filter(array, predicate) {
  return array ? array.filter(predicate) : emptyArray;
}
function aggregate(arr, fn) {
  return arr.reduce((sum, it) => sum + fn(it), 0);
}
function joinArray(arr, joiner, mapper) {
  if (arr?.length) {
    return arr.map(mapper).join(joiner);
  }
  return "";
}
function maxElementByScore(arr, score) {
  if (arr.length === 0) {
    return void 0;
  }
  let largest = arr[0];
  let largestScore = score(arr[0]);
  for (let i = 1; i < arr.length; ++i) {
    const itemScore = score(arr[i]);
    if (itemScore > largestScore) {
      largest = arr[i];
      largestScore = itemScore;
    }
  }
  return largest;
}

// src/lib/utils-common/declarationReference.ts
var MeaningKeywords = [
  "class",
  // SymbolFlags.Class
  "interface",
  // SymbolFlags.Interface
  "type",
  // SymbolFlags.TypeAlias
  "enum",
  // SymbolFlags.Enum
  "namespace",
  // SymbolFlags.Module
  "function",
  // SymbolFlags.Function
  "var",
  // SymbolFlags.Variable
  "constructor",
  // SymbolFlags.Constructor
  "member",
  // SymbolFlags.ClassMember | SymbolFlags.EnumMember
  "event",
  //
  "call",
  // SymbolFlags.Signature (for __call)
  "new",
  // SymbolFlags.Signature (for __new)
  "index",
  // SymbolFlags.Signature (for __index)
  "complex",
  // Any complex type
  // TypeDoc specific
  "getter",
  "setter"
];
function meaningToString(meaning) {
  let result = "";
  if (meaning.keyword) {
    result += meaning.keyword;
  } else if (meaning.label) {
    result += meaning.label;
  }
  if (typeof meaning.index === "number") {
    result += `(${meaning.index})`;
  }
  return result;
}
var WhiteSpace = /[\t\u2B7F\u240C \u00A0\uFEFF\p{White_Space}]/u;
var LineTerminator = "\r\n\u2028\u2029";
var Punctuators = "{}()[]!.#~:,";
var FutureReservedPunctuator = "{}@";
var NavigationPunctuator = ".#~";
var DecimalDigit = "0123456789";
var HexDigit = DecimalDigit + "abcdefABCDEF";
var SingleEscapeCharacter = `'"\\bfnrtv`;
var EscapeCharacter = SingleEscapeCharacter + DecimalDigit + "xu";
var UserLabelStart = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
var UserLabelCharacter = UserLabelStart + DecimalDigit;
var SingleEscapeChars = {
  "'": "'",
  '"': '"',
  "\\": "\\",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "	",
  v: "\v"
};
function parseEscapeSequence(source, pos, end) {
  if (SingleEscapeCharacter.includes(source[pos])) {
    return [SingleEscapeChars[source[pos]], pos + 1];
  }
  if (!(EscapeCharacter + LineTerminator).includes(source[pos])) {
    return [source[pos], pos + 1];
  }
  if (source[pos] === "0" && pos + 1 < end && !DecimalDigit.includes(source[pos + 1])) {
    return ["\0", pos + 1];
  }
  if (source[pos] === "x" && pos + 2 < end && HexDigit.includes(source[pos + 1]) && HexDigit.includes(source[pos + 2])) {
    return [
      String.fromCharCode(
        parseInt(source.substring(pos + 1, pos + 3), 16)
      ),
      pos + 3
    ];
  }
  return parseUnicodeEscapeSequence(source, pos, end);
}
function parseUnicodeEscapeSequence(source, pos, end) {
  if (source[pos] !== "u" || pos + 1 >= end) {
    return;
  }
  if (HexDigit.includes(source[pos + 1])) {
    if (pos + 4 >= end || !HexDigit.includes(source[pos + 2]) || !HexDigit.includes(source[pos + 3]) || !HexDigit.includes(source[pos + 4])) {
      return;
    }
    return [
      String.fromCharCode(
        parseInt(source.substring(pos + 1, pos + 5), 16)
      ),
      pos + 5
    ];
  }
  if (source[pos + 1] === "{" && pos + 2 < end && HexDigit.includes(source[pos + 2])) {
    let lookahead = pos + 3;
    while (lookahead < end && HexDigit.includes(source[lookahead])) {
      lookahead++;
    }
    if (lookahead >= end || source[lookahead] !== "}") return;
    const codePoint = parseInt(source.substring(pos + 2, lookahead), 16);
    if (codePoint <= 1114111) {
      return [String.fromCodePoint(codePoint), lookahead + 1];
    }
  }
}
function parseString(source, pos, end) {
  let result = "";
  if (source[pos++] !== '"') return;
  while (pos < end) {
    if (source[pos] === '"') {
      return [result, pos + 1];
    }
    if (LineTerminator.includes(source[pos])) return;
    if (source[pos] === "\\") {
      const esc = parseEscapeSequence(source, pos + 1, end);
      if (!esc) return;
      result += esc[0];
      pos = esc[1];
      continue;
    }
    result += source[pos++];
  }
}
function parseModuleSource(source, pos, end) {
  if (pos >= end) return;
  if (source[pos] === '"') {
    return parseString(source, pos, end);
  }
  let lookahead = pos;
  while (lookahead < end && !('"!' + LineTerminator).includes(source[lookahead])) {
    lookahead++;
  }
  if (lookahead === pos) return;
  return [source.substring(pos, lookahead), lookahead];
}
function parseSymbolReference(source, pos, end) {
  const path = parseComponentPath(source, pos, end);
  pos = path?.[1] ?? pos;
  const meaning = parseMeaning(source, pos, end);
  pos = meaning?.[1] ?? pos;
  if (path || meaning) {
    return [{ path: path?.[0], meaning: meaning?.[0] }, pos];
  }
}
function parseComponent(source, pos, end) {
  if (pos < end && source[pos] === '"') {
    return parseString(source, pos, end);
  }
  let lookahead = pos;
  while (lookahead < end && !('"' + Punctuators + FutureReservedPunctuator + LineTerminator).includes(source[lookahead]) && !WhiteSpace.test(source[lookahead])) {
    lookahead++;
  }
  if (lookahead === pos) return;
  return [source.substring(pos, lookahead), lookahead];
}
function parseComponentPath(source, pos, end) {
  const components = [];
  let component = parseComponent(source, pos, end);
  if (!component) return;
  pos = component[1];
  components.push({ navigation: ".", path: component[0] });
  while (pos < end && NavigationPunctuator.includes(source[pos])) {
    const navigation = source[pos];
    pos++;
    component = parseComponent(source, pos, end);
    if (!component) {
      return;
    }
    pos = component[1];
    components.push({ navigation, path: component[0] });
  }
  return [components, pos];
}
function parseMeaning(source, pos, end) {
  if (source[pos++] !== ":") return;
  const keyword = MeaningKeywords.find(
    (kw) => pos + kw.length <= end && source.startsWith(kw, pos)
  );
  if (keyword) {
    pos += keyword.length;
  }
  if (!keyword && UserLabelStart.includes(source[pos])) {
    let lookahead = pos + 1;
    while (lookahead < end && UserLabelCharacter.includes(source[lookahead])) {
      lookahead++;
    }
    return [{ label: source.substring(pos, lookahead) }, lookahead];
  }
  if (pos + 1 < end && source[pos] === "(" && DecimalDigit.includes(source[pos + 1])) {
    let lookahead = pos + 1;
    while (lookahead < end && DecimalDigit.includes(source[lookahead])) {
      lookahead++;
    }
    if (lookahead < end && source[lookahead] === ")") {
      return [
        {
          keyword,
          index: parseInt(source.substring(pos + 1, lookahead))
        },
        lookahead + 1
      ];
    }
  }
  if (!keyword && pos < end && DecimalDigit.includes(source[pos])) {
    let lookahead = pos;
    while (lookahead < end && DecimalDigit.includes(source[lookahead])) {
      lookahead++;
    }
    return [
      {
        index: parseInt(source.substring(pos, lookahead))
      },
      lookahead
    ];
  }
  if (keyword) {
    return [{ keyword }, pos];
  }
}
function parseDeclarationReference(source, pos, end) {
  let moduleSource;
  let symbolReference;
  let resolutionStart = "local";
  let topLevelLocalReference = false;
  const moduleSourceOrSymbolRef = parseModuleSource(source, pos, end);
  if (moduleSourceOrSymbolRef) {
    if (moduleSourceOrSymbolRef[1] < end && source[moduleSourceOrSymbolRef[1]] === "!") {
      pos = moduleSourceOrSymbolRef[1] + 1;
      resolutionStart = "global";
      moduleSource = moduleSourceOrSymbolRef[0];
      if (source[pos] === "~") {
        topLevelLocalReference = true;
        pos++;
      }
    }
  } else if (source[pos] === "!") {
    pos++;
    resolutionStart = "global";
  }
  const ref = parseSymbolReference(source, pos, end);
  if (ref) {
    symbolReference = ref[0];
    if (topLevelLocalReference && symbolReference.path?.length) {
      symbolReference.path[0].navigation = "~";
    }
    pos = ref[1];
  }
  if (!moduleSource && !symbolReference) return;
  return [
    {
      moduleSource,
      resolutionStart,
      symbolReference
    },
    pos
  ];
}

// src/lib/utils-common/enum.ts
function getEnumFlags(flags) {
  const result = [];
  for (let i = 1; i <= flags; i <<= 1) {
    if (flags & i) {
      result.push(i);
    }
  }
  return result;
}
function removeFlag(flag, remove) {
  return flag & ~remove;
}
function hasAllFlags(flags, check) {
  return (flags & check) === check;
}
function hasAnyFlag(flags, check) {
  return (flags & check) !== 0;
}
function debugFlags(Enum, flags) {
  return getEnumKeys(Enum).filter(
    (key) => (Enum[key] & flags) === Enum[key]
  );
}
function getEnumKeys(Enum) {
  const E = Enum;
  return Object.keys(E).filter((k) => E[E[k]] === k);
}

// src/lib/utils-common/events.ts
var EventDispatcher = class {
  // Function is *usually* not a good type to use, but here it lets us specify stricter
  // contracts in the methods while not casting everywhere this is used.
  _listeners = /* @__PURE__ */ new Map();
  /**
   * Starts listening to an event.
   * @param event the event to listen to.
   * @param listener function to be called when an this event is emitted.
   * @param priority optional priority to insert this hook with.
   *  Higher priority is placed earlier in the listener array.
   */
  on(event, listener, priority = 0) {
    const list = (this._listeners.get(event) || []).slice();
    insertPrioritySorted(list, { listener, priority });
    this._listeners.set(event, list);
  }
  /**
   * Stops listening to an event.
   * @param event the event to stop listening to.
   * @param listener the function to remove from the listener array.
   */
  off(event, listener) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      const index = listeners.findIndex((lo) => lo.listener === listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * Emits an event to all currently subscribed listeners.
   * @param event the event to emit.
   * @param args any arguments required for the event.
   */
  trigger(event, ...args) {
    const listeners = this._listeners.get(event)?.slice() || [];
    for (const { listener } of listeners) {
      listener(...args);
    }
  }
};

// src/lib/utils-common/general.ts
function assertNever(x) {
  throw new Error(
    `Expected handling to cover all possible cases, but it didn't cover: ${JSON.stringify(x)}`
  );
}
function assert(x, message = "Assertion failed") {
  if (!x) {
    debugger;
    throw new Error(message);
  }
}
function NonEnumerable(_cls, context) {
  context.addInitializer(function() {
    Object.defineProperty(this, context.name, {
      enumerable: false,
      configurable: true,
      writable: true
    });
  });
}

// src/lib/utils-common/hooks.ts
var momentos = /* @__PURE__ */ new WeakMap();
var EventHooks = class {
  // Function is *usually* not a good type to use, but here it lets us specify stricter
  // contracts in the methods while not casting everywhere this is used.
  _listeners = /* @__PURE__ */ new Map();
  /**
   * Starts listening to an event.
   * @param event the event to listen to.
   * @param listener function to be called when an this event is emitted.
   * @param order optional order to insert this hook with.
   */
  on(event, listener, order = 0) {
    const list = (this._listeners.get(event) || []).slice();
    insertOrderSorted(list, { listener, order });
    this._listeners.set(event, list);
  }
  /**
   * Listens to a single occurrence of an event.
   * @param event the event to listen to.
   * @param listener function to be called when an this event is emitted.
   * @param order optional order to insert this hook with.
   */
  once(event, listener, order = 0) {
    const list = (this._listeners.get(event) || []).slice();
    insertOrderSorted(list, { listener, once: true, order });
    this._listeners.set(event, list);
  }
  /**
   * Stops listening to an event.
   * @param event the event to stop listening to.
   * @param listener the function to remove from the listener array.
   */
  off(event, listener) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      const index = listeners.findIndex((lo) => lo.listener === listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * Emits an event to all currently subscribed listeners.
   * @param event the event to emit.
   * @param args any arguments required for the event.
   */
  emit(event, ...args) {
    const listeners = this._listeners.get(event)?.slice() || [];
    this._listeners.set(
      event,
      listeners.filter(({ once }) => !once)
    );
    return listeners.map(({ listener }) => listener(...args));
  }
  saveMomento() {
    const momento = {};
    const save = /* @__PURE__ */ new Map();
    for (const [key, val] of this._listeners) {
      save.set(key, [...val]);
    }
    momentos.set(momento, save);
    return momento;
  }
  restoreMomento(momento) {
    const saved = momentos.get(momento);
    if (saved) {
      this._listeners.clear();
      for (const [key, val] of saved) {
        this._listeners.set(key, [...val]);
      }
    } else {
      throw new Error("Momento not found.");
    }
  }
};

// src/lib/utils-common/i18n.ts
var translations = {};
function setTranslations(t) {
  translations = { ...t };
}
function addTranslations(t) {
  Object.assign(translations, t);
}
var i18n = new Proxy({}, {
  get(_, key) {
    return (...args) => {
      const template = String(translations[key] || key);
      return template.replace(/\{(\d+)\}/g, (_2, index) => {
        return args[+index] ?? "(no placeholder)";
      });
    };
  },
  has(_, key) {
    return Object.prototype.hasOwnProperty.call(translations, key);
  }
});
function translateTagName(tag) {
  const tagName = tag.substring(1);
  if (Object.prototype.hasOwnProperty.call(translations, `tag_${tagName}`)) {
    return translations[`tag_${tagName}`];
  }
  return tagName.substring(0, 1).toUpperCase() + tagName.substring(1).replace(
    /[a-z][A-Z]/g,
    (x) => `${x[0]} ${x[1]}`
  );
}

// src/lib/utils-common/jsx.ts
var jsx_exports = {};
__export(jsx_exports, {
  Fragment: () => JsxFragment,
  Raw: () => Raw,
  createElement: () => createElement,
  renderElement: () => renderElement,
  renderElementToText: () => renderElementToText,
  setRenderSettings: () => setRenderSettings
});

// src/lib/utils-common/jsx.elements.ts
function JsxFragment() {
  throw new Error("Should never be called");
}

// src/lib/utils-common/map.ts
var DefaultMap = class extends Map {
  constructor(creator) {
    super();
    this.creator = creator;
  }
  creator;
  get(key) {
    const saved = super.get(key);
    if (saved != null) {
      return saved;
    }
    const created = this.creator(key);
    this.set(key, created);
    return created;
  }
  getNoInsert(key) {
    return super.get(key);
  }
};
var StableKeyMap = class {
  [Symbol.toStringTag] = "StableKeyMap";
  impl = /* @__PURE__ */ new Map();
  get size() {
    return this.impl.size;
  }
  set(key, value) {
    this.impl.set(key.getStableKey(), [key, value]);
    return this;
  }
  get(key) {
    return this.impl.get(key.getStableKey())?.[1];
  }
  has(key) {
    return this.get(key) != null;
  }
  clear() {
    this.impl.clear();
  }
  delete(key) {
    return this.impl.delete(key.getStableKey());
  }
  forEach(callbackfn, thisArg) {
    for (const [k, v] of this.entries()) {
      callbackfn.apply(thisArg, [v, k, this]);
    }
  }
  entries() {
    return this.impl.values();
  }
  *keys() {
    for (const [k] of this.entries()) {
      yield k;
    }
  }
  *values() {
    for (const [, v] of this.entries()) {
      yield v;
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
};

// src/lib/utils-common/string.ts
function countMatches(text, search) {
  let count = 0;
  let last = 0;
  for (; ; ) {
    const index = text.indexOf(search, last);
    if (index === -1) {
      break;
    } else {
      last = index + 1;
      ++count;
    }
  }
  return count;
}
function dedent(text) {
  const lines = text.split(/\r?\n/);
  while (lines.length && lines[0].search(/\S/) === -1) {
    lines.shift();
  }
  while (lines.length && lines[lines.length - 1].search(/\S/) === -1) {
    lines.pop();
  }
  const minIndent = lines.reduce(
    (indent, line) => line.length ? Math.min(indent, line.search(/\S/)) : indent,
    Infinity
  );
  return lines.map((line) => line.substring(minIndent)).join("\n");
}
function editDistance(s, t) {
  if (s.length < t.length) return editDistance(t, s);
  let v0 = Array.from({ length: t.length + 1 }, (_, i) => i);
  let v1 = Array.from({ length: t.length + 1 }, () => 0);
  for (let i = 0; i < s.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < s.length; j++) {
      const deletionCost = v0[j + 1] + 1;
      const insertionCost = v1[j] + 1;
      let substitutionCost;
      if (s[i] === t[j]) {
        substitutionCost = v0[j];
      } else if (s[i]?.toUpperCase() === t[j]?.toUpperCase()) {
        substitutionCost = v0[j] + 1;
      } else {
        substitutionCost = v0[j] + 3;
      }
      v1[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost);
    }
    [v0, v1] = [v1, v0];
  }
  return v0[t.length];
}
function getSimilarValues(values, compareTo) {
  const results = new DefaultMap(() => []);
  let lowest = Infinity;
  for (const name of values) {
    const distance = editDistance(compareTo, name);
    lowest = Math.min(lowest, distance);
    results.get(distance).push(name);
  }
  return results.get(lowest).concat(results.get(lowest + 1), results.get(lowest + 2));
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeHtml(html) {
  return html.replace(/[&<>'"]/g, (c) => htmlEscapes[c]);
}

// src/lib/utils-common/jsx.ts
function Raw(_props) {
  return null;
}
var voidElements = /* @__PURE__ */ new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
var blockElements = /* @__PURE__ */ new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "section",
  "nav",
  "details",
  "p",
  "ul",
  "ol",
  "li"
]);
function createElement(tag, props, ...children) {
  return { tag, props, children };
}
var renderPretty = true;
function setRenderSettings(options) {
  renderPretty = options.pretty;
}
function renderElement(element) {
  if (!element) {
    return "";
  }
  const buf = [];
  renderInto(buf, element);
  return buf.join("");
}
function renderInto(buf, element) {
  if (!element) {
    return;
  }
  const { tag, props, children } = element;
  if (typeof tag === "function") {
    if (tag === Raw) {
      buf.push(String(props.html));
      return;
    }
    if (tag === JsxFragment) {
      renderChildrenInto(buf, children);
      return;
    }
    renderInto(buf, tag(Object.assign({ children }, props)));
    return;
  }
  if (blockElements.has(tag) && renderPretty && buf.length) {
    buf.push("\n");
  }
  buf.push("<", tag);
  for (const [key, val] of Object.entries(props ?? {})) {
    if (val == null) continue;
    if (typeof val === "boolean") {
      if (val) {
        buf.push(" ", key);
      }
    } else {
      const stringified = typeof val === "string" ? val : JSON.stringify(val);
      buf.push(" ", key, '="', stringified.replaceAll('"', "&quot;"), '"');
    }
  }
  if (children.length) {
    buf.push(">");
    renderChildrenInto(buf, children);
    buf.push("</", tag, ">");
  } else if (voidElements.has(tag)) {
    buf.push("/>");
  } else {
    buf.push("></", tag, ">");
  }
}
function renderChildrenInto(buf, children) {
  for (const child of children) {
    if (typeof child === "boolean") continue;
    if (Array.isArray(child)) {
      renderChildrenInto(buf, child);
    } else if (typeof child === "string" || typeof child === "number" || typeof child === "bigint") {
      buf.push(escapeHtml(child.toString()));
    } else {
      renderInto(buf, child);
    }
  }
}
function renderElementToText(element) {
  if (!element) {
    return "";
  }
  const buf = [];
  renderTextInto(buf, element);
  return buf.join("");
}
function renderTextInto(buf, element) {
  if (!element) {
    return;
  }
  const { tag, props, children } = element;
  if (typeof tag === "function") {
    if (tag === Raw) {
      buf.push(String(props.html));
      return;
    }
    if (tag === JsxFragment) {
      renderTextChildrenInto(buf, children);
      return;
    }
    renderTextInto(buf, tag(Object.assign({ children }, props)));
    return;
  } else if (tag === "br") {
    buf.push("\n");
    return;
  }
  renderTextChildrenInto(buf, children);
}
function renderTextChildrenInto(buf, children) {
  for (const child of children) {
    if (typeof child === "boolean") continue;
    if (Array.isArray(child)) {
      renderTextChildrenInto(buf, child);
    } else if (typeof child === "string" || typeof child === "number" || typeof child === "bigint") {
      buf.push(child.toString().replaceAll("\xA0", " "));
    } else {
      renderTextInto(buf, child);
    }
  }
}

// src/lib/utils-common/logger.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Verbose"] = 0] = "Verbose";
  LogLevel2[LogLevel2["Info"] = 1] = "Info";
  LogLevel2[LogLevel2["Warn"] = 2] = "Warn";
  LogLevel2[LogLevel2["Error"] = 3] = "Error";
  LogLevel2[LogLevel2["None"] = 4] = "None";
  return LogLevel2;
})(LogLevel || {});
var messagePrefixes = {
  [3 /* Error */]: "[error]",
  [2 /* Warn */]: "[warning]",
  [1 /* Info */]: "[info]",
  [0 /* Verbose */]: "[debug]"
};
var Logger = class {
  /**
   * How many error messages have been logged?
   */
  errorCount = 0;
  /**
   * How many warning messages have been logged?
   */
  warningCount = 0;
  /**
   * How many validation warning messages have been logged?
   */
  validationWarningCount = 0;
  /**
   * The minimum logging level to print.
   */
  level = 1 /* Info */;
  /**
   * Has an error been raised through the log method?
   */
  hasErrors() {
    return this.errorCount > 0;
  }
  /**
   * Has a warning been raised through the log method?
   */
  hasWarnings() {
    return this.warningCount > 0;
  }
  /**
   * Reset the error counter.
   */
  resetErrors() {
    this.errorCount = 0;
  }
  /**
   * Reset the warning counter.
   */
  resetWarnings() {
    this.warningCount = 0;
    this.validationWarningCount = 0;
  }
  /**
   * Log the given verbose message.
   *
   * @param text  The message that should be logged.
   */
  verbose(text) {
    this.log(this.addContext(text, 0 /* Verbose */), 0 /* Verbose */);
  }
  /** Log the given info message. */
  info(text) {
    this.log(this.addContext(text, 1 /* Info */), 1 /* Info */);
  }
  warn(text, ...args) {
    const text2 = this.addContext(text, 2 /* Warn */, ...args);
    this.log(text2, 2 /* Warn */);
  }
  validationWarning(...args) {
    this.validationWarningCount += 1;
    this.warn(...args);
  }
  error(text, ...args) {
    const text2 = this.addContext(text, 3 /* Error */, ...args);
    this.log(text2, 3 /* Error */);
  }
  /**
   * Print a log message.
   *
   * @param _message The message itself.
   * @param level The urgency of the log message.
   */
  log(_message, level) {
    if (level === 3 /* Error */) {
      this.errorCount += 1;
    }
    if (level === 2 /* Warn */) {
      this.warningCount += 1;
    }
  }
  addContext(message, _level, ..._args) {
    return message;
  }
};
var ConsoleLogger = class extends Logger {
  log(message, level) {
    super.log(message, level);
    if (level < this.level) {
      return;
    }
    const method = {
      [3 /* Error */]: "error",
      [2 /* Warn */]: "warn",
      [1 /* Info */]: "info",
      [0 /* Verbose */]: "log"
    }[level];
    console[method](message);
  }
  addContext(message, level, ..._args) {
    return `${messagePrefixes[level]} ${message}`;
  }
};

// src/lib/utils-common/minimalSourceFile.ts
var lineStarts = /* @__PURE__ */ new WeakMap();
var MinimalSourceFile = class {
  text;
  // This type is just string to ensure assignability from SourceFile
  fileName;
  constructor(text, fileName) {
    this.text = text.replaceAll("\r\n", "\n");
    lineStarts.set(this, [0]);
    this.fileName = fileName;
  }
  getLineAndCharacterOfPosition(pos) {
    if (pos < 0 || pos >= this.text.length) {
      throw new Error("pos must be within the range of the file.");
    }
    const starts = lineStarts.get(this);
    while (pos >= starts[starts.length - 1]) {
      const nextStart = this.text.indexOf(
        "\n",
        starts[starts.length - 1]
      );
      if (nextStart === -1) {
        starts.push(Infinity);
      } else {
        starts.push(nextStart + 1);
      }
    }
    const line = binaryFindPartition(starts, (x) => x > pos) - 1;
    return {
      character: pos - starts[line],
      line
    };
  }
};

// src/lib/utils-common/path.ts
var NormalizedPathUtils;
((NormalizedPathUtils2) => {
  function dirname(path) {
    let end = path.length - 2;
    for (; end > 0; --end) {
      if (path[end] === "/") break;
    }
    switch (end) {
      case -2:
      case -1:
        return path[0] === "/" ? "/" : ".";
      case 0:
        return path.substring(0, path.indexOf("/") + 1);
      default:
        return path.slice(0, end);
    }
  }
  NormalizedPathUtils2.dirname = dirname;
  function basename(path) {
    let end = path.length - 2;
    for (; end >= 0; --end) {
      if (path[end] === "/") break;
    }
    switch (end) {
      case -2:
      case -1:
        return path;
      default:
        if (path.endsWith("/")) {
          return path.slice(end + 1, -1);
        }
        return path.slice(end + 1);
    }
  }
  NormalizedPathUtils2.basename = basename;
  function relative(from, to) {
    if (from == to) {
      return "";
    }
    assert(
      isAbsolute(from) && isAbsolute(to),
      "resolving relative paths without absolute inputs requires a filesystem"
    );
    if (!from.endsWith("/")) {
      from += "/";
    }
    const end = to.length;
    if (!to.endsWith("/")) {
      to += "/";
    }
    const minLen = Math.min(from.length, to.length);
    let lastCommonSlash = 0;
    let i = 0;
    for (; i < minLen; ++i) {
      if (from[i] === to[i]) {
        if (from[i] === "/") {
          lastCommonSlash = i;
        }
      } else {
        break;
      }
    }
    if (lastCommonSlash === from.length - 1) {
      return to.substring(from.length, end);
    }
    let prefix = "";
    for (let i2 = lastCommonSlash + 1; i2 < from.length; ++i2) {
      if (from[i2] === "/" || i2 + 1 === from.length) {
        prefix += prefix ? "/.." : "..";
      }
    }
    return prefix + to.substring(lastCommonSlash, end);
  }
  NormalizedPathUtils2.relative = relative;
  function normalize(path) {
    const parts = path.split("/");
    let canRemoveDotDot = false;
    for (let i = 0; i < parts.length; ) {
      if (parts[i] == "." && i + 1 != parts.length) {
        parts.splice(i, 1);
      } else if (parts[i] == "..") {
        if (canRemoveDotDot) {
          if (i - 1 === 0 && /\w:/i.test(parts[0])) {
            parts.splice(i, 1);
          } else {
            parts.splice(i - 1, 2);
            i = i - 1;
          }
        } else {
          ++i;
        }
      } else {
        canRemoveDotDot = true;
        ++i;
      }
    }
    return parts.join("/");
  }
  NormalizedPathUtils2.normalize = normalize;
  function resolve(from, to) {
    assert(isAbsolute(from), "resolving without an absolute path requires a filesystem");
    if (isAbsolute(to)) {
      return to;
    }
    return normalize(`${from}/${to}`);
  }
  NormalizedPathUtils2.resolve = resolve;
  function isAbsolute(from) {
    return /^\/|^\w:\//.test(from);
  }
  NormalizedPathUtils2.isAbsolute = isAbsolute;
  function splitFilename(name) {
    const lastDot = name.lastIndexOf(".");
    if (lastDot < 1) {
      return { name, ext: "" };
    }
    return { name: name.substring(0, lastDot), ext: name.substring(lastDot) };
  }
  NormalizedPathUtils2.splitFilename = splitFilename;
  function isDeclarationFilePath(path) {
    return /\.d\.(ts|mts|cts)$/.test(path);
  }
  NormalizedPathUtils2.isDeclarationFilePath = isDeclarationFilePath;
})(NormalizedPathUtils || (NormalizedPathUtils = {}));

// src/lib/utils-common/set.ts
function setIntersection(a, b) {
  const result = /* @__PURE__ */ new Set();
  for (const elem of a) {
    if (b.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}
function setDifference(a, b) {
  const result = new Set(a);
  for (const elem of b) {
    result.delete(elem);
  }
  return result;
}
function setUnion(a, b) {
  const result = new Set(a);
  for (const elem of b) {
    result.add(elem);
  }
  return result;
}

// src/lib/utils-common/validation.ts
var validation_exports = {};
__export(validation_exports, {
  additionalProperties: () => additionalProperties,
  isTagString: () => isTagString,
  optional: () => optional,
  validate: () => validate
});
var opt = /* @__PURE__ */ Symbol();
var additionalProperties = /* @__PURE__ */ Symbol();
function validate(schema, obj) {
  let type = schema;
  if (opt in schema) {
    if (obj == null) {
      return true;
    }
    type = schema[opt];
  }
  if (type === String) {
    return typeof obj === "string";
  }
  if (type === Number) {
    return typeof obj === "number";
  }
  if (type === Boolean) {
    return typeof obj === "boolean";
  }
  if (typeof type === "function") {
    return type(obj);
  }
  if (Array.isArray(type)) {
    if (type[0] === Array) {
      return Array.isArray(obj) && obj.every((item) => validate(type[1], item));
    }
    return type.includes(obj);
  }
  if (additionalProperties in schema && !schema[additionalProperties]) {
    if (Object.keys(obj).some((key) => !(key in schema))) {
      return false;
    }
  }
  return !!obj && typeof obj === "object" && !Array.isArray(obj) && Object.entries(type).every(([key, prop]) => validate(prop, obj[key]));
}
function optional(x) {
  return { [opt]: x };
}
function isTagString(x) {
  return typeof x === "string" && /^@[a-z][a-z0-9-]*$/i.test(x);
}
export {
  ConsoleLogger,
  DefaultMap,
  EventDispatcher,
  EventHooks,
  jsx_exports as JSX,
  LogLevel,
  Logger,
  MeaningKeywords,
  MinimalSourceFile,
  NonEnumerable,
  NormalizedPathUtils,
  StableKeyMap,
  validation_exports as Validation,
  addTranslations,
  aggregate,
  assert,
  assertNever,
  binaryFindPartition,
  countMatches,
  debugFlags,
  dedent,
  editDistance,
  emptyArray,
  escapeHtml,
  escapeRegExp,
  filter,
  filterMap,
  firstDefined,
  getEnumFlags,
  getEnumKeys,
  getSimilarValues,
  hasAllFlags,
  hasAnyFlag,
  i18n,
  insertOrderSorted,
  insertPrioritySorted,
  joinArray,
  maxElementByScore,
  meaningToString,
  parseComponent,
  parseComponentPath,
  parseDeclarationReference,
  parseMeaning,
  parseModuleSource,
  parseString,
  parseSymbolReference,
  partition,
  removeFlag,
  removeIf,
  removeIfPresent,
  setDifference,
  setIntersection,
  setTranslations,
  setUnion,
  translateTagName,
  unique,
  zip
};
