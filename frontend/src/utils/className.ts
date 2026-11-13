/**
 * Joins the truthy class names with spaces.
 *
 * @example
 * cx("button", isActive && "active"); // "button active" when isActive, "button" otherwise
 */
export function cx(...classNames: (string | false | null | undefined)[]): string {
  return classNames.filter(Boolean).join(" ");
}
