// src/escape-regex.ts
var escapeRegex = (term) => term.replace(/[|\\{}()[\]^$+*?.-]/g, (char) => `\\${char}`);
export {
  escapeRegex
};
