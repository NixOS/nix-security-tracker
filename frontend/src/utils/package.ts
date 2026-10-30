import type { SuggestionPackage } from "@/api/generated/models";

/** The attribute path that addresses a package, e.g. to ignore or restore it, as chosen by the server. */
export function packageAttribute(pkg: SuggestionPackage): string | undefined {
  return pkg.attribute?.attrpath;
}

/** Identifies a package in a list. Name and homepage are unique, for packages without an attribute path to address them by. */
export function packageKey(pkg: SuggestionPackage): string {
  return packageAttribute(pkg) ?? `${pkg.name} ${pkg.homepage}`;
}

/** Order of packages in a suggestion, as sorted by the server: by name, then by attribute path. */
export function comparePackages(a: SuggestionPackage, b: SuggestionPackage): number {
  // Code point order, like Python's, rather than `localeCompare`.
  const compare = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
  return compare(a.name, b.name) || compare(packageAttribute(a) ?? "", packageAttribute(b) ?? "");
}
