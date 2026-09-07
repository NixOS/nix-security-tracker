// src/highlight-first.ts
import { normalizeSpan } from "./normalize-span.mjs";
import { escapeRegex } from "./escape-regex.mjs";
function highlightFirst(props) {
  const { text, query, ignoreCase, exactMatch } = props;
  if (exactMatch) {
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(`\\b(${escapedQuery})\\b`, ignoreCase ? "i" : "");
    const match = text.match(regex);
    if (!match || match.index === void 0) {
      return [{ text, match: false }];
    }
    const start2 = match.index;
    const end2 = start2 + match[0].length;
    const spans2 = [{ start: start2, end: end2 }];
    return normalizeSpan(spans2, text.length).map((chunk) => ({
      text: text.slice(chunk.start, chunk.end),
      match: !!chunk.match
    }));
  }
  const searchText = ignoreCase ? text.toLowerCase() : text;
  const searchQuery = ignoreCase ? typeof query === "string" ? query.toLowerCase() : query : query;
  const start = typeof searchText === "string" ? searchText.indexOf(searchQuery) : -1;
  if (start === -1) {
    return [{ text, match: false }];
  }
  const end = start + searchQuery.length;
  const spans = [{ start, end }];
  return normalizeSpan(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match
  }));
}
export {
  highlightFirst
};
