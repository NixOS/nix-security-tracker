import { BugIcon, LinkIcon, type LucideIcon, PackageIcon, UserIcon } from "lucide-preact";
import { InlineIcon } from "@/components/ui/InlineIcon";

export type SuggestionSectionId = "references" | "affected-products" | "packages" | "maintainers";

export const SUGGESTION_SECTION_HEADINGS: Record<
  SuggestionSectionId,
  { label: string; icon: LucideIcon }
> = {
  references: { label: "References", icon: LinkIcon },
  "affected-products": { label: "Affected products", icon: BugIcon },
  packages: { label: "Matching in Nixpkgs", icon: PackageIcon },
  maintainers: { label: "Maintainers", icon: UserIcon },
};

export function SuggestionSectionHeading({ section }: { section: SuggestionSectionId }) {
  const { label, icon } = SUGGESTION_SECTION_HEADINGS[section];
  return (
    <>
      <InlineIcon icon={icon} />
      {label}
    </>
  );
}
