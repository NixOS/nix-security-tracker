import type { SuggestionAttrpath, SuggestionPackage } from "@/api/generated/models";

export function packageAttrpath(pkg: SuggestionPackage): SuggestionAttrpath {
  return pkg.attrpaths.reduce((shortest, a) =>
    a.attrpath.length < shortest.attrpath.length ? a : shortest,
  );
}
