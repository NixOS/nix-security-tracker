/** Truncates `text` to `maxLength` characters, appending an ellipsis when shortened. */
export function truncate(text: string, maxLength = 80): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
