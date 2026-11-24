import type { LucideIcon } from "lucide-preact";
import type { ComponentChildren } from "preact";
import type { SuggestionStatusEnum, Suggestion as SuggestionType } from "@/api/generated/models";
import { AffectedProductsTree } from "./AffectedProductsTree";
import { CategorizedMaintainersList } from "./CategorizedMaintainersList";
import { CategorizedPackagesList } from "./CategorizedPackagesList";
import { CategorizedReferencesList } from "./CategorizedReferencesList";
import { SUGGESTION_SECTION_HEADINGS, type SuggestionSectionId } from "./SuggestionSectionHeadings";
import { hasOriginalMaintainers } from "./suggestionItems";

export type SuggestionSection = {
  value: SuggestionSectionId;
  label: string;
  icon: LucideIcon;
  content: ComponentChildren;
};

/**
 * Whether a suggestion in this status still accepts changes to its references, packages and maintainers.
 */
export function isSuggestionEditable(status: SuggestionStatusEnum): boolean {
  return status === "pending" || status === "accepted";
}

function section(value: SuggestionSectionId, content: ComponentChildren): SuggestionSection {
  return { value, ...SUGGESTION_SECTION_HEADINGS[value], content };
}

/**
 * The non-empty sections of a suggestion, in display order.
 */
export function suggestionSections(
  suggestion: SuggestionType,
  userCanEdit: boolean,
): SuggestionSection[] {
  const { id, status, affected_products, packages, maintainers, url_references } = suggestion;

  const editable = userCanEdit && isSuggestionEditable(status);

  const sections: (SuggestionSection | false)[] = [
    Object.keys(url_references).length > 0 &&
      section(
        "references",
        <CategorizedReferencesList
          references={url_references}
          suggestionId={id}
          editable={editable}
        />,
      ),
    affected_products.length > 0 &&
      section("affected-products", <AffectedProductsTree affectedProducts={affected_products} />),
    Object.keys(packages).length > 0 &&
      section(
        "packages",
        <CategorizedPackagesList suggestionId={id} packages={packages} editable={editable} />,
      ),
    hasOriginalMaintainers(maintainers) &&
      section(
        "maintainers",
        <CategorizedMaintainersList
          suggestionId={id}
          maintainers={maintainers}
          editable={editable}
        />,
      ),
  ];

  return sections.filter((s): s is SuggestionSection => Boolean(s));
}
