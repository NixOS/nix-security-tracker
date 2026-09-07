// src/highlight-multiple.ts
import { normalizeSpan } from "./normalize-span.mjs";
import { escapeRegex } from "./escape-regex.mjs";
var buildRegex = (queryProp, flags, exactMatch) => {
  const query = queryProp.filter(Boolean).map((text) => escapeRegex(text));
  const pattern = exactMatch ? `\\b(${query.join("|")})\\b` : `(${query.join("|")})`;
  return new RegExp(pattern, flags);
};
var getRegexFlags = (ignoreCase, matchAll = true) => `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`;
function highlightMultiple(props) {
  const { text, query, ignoreCase, matchAll, exactMatch } = props;
  if (query.length === 0) {
    return [{ text, match: false }];
  }
  const flags = getRegexFlags(ignoreCase, matchAll);
  const regex = buildRegex(Array.isArray(query) ? query : [query], flags, exactMatch);
  const spans = [...text.matchAll(regex)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length
  }));
  return normalizeSpan(spans, props.text.length).map((chunk) => ({
    text: props.text.slice(chunk.start, chunk.end),
    match: !!chunk.match
  }));
}
export {
  highlightMultiple
};
