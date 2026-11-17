import { Fragment } from "preact";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { SuggestionFooter } from "./SuggestionFooter";
import type { SuggestionSectionId } from "./SuggestionSectionHeadings";
import { suggestionSections } from "./SuggestionSections";

const COMPACT_SECTIONS = new Set<SuggestionSectionId>(["references", "affected-products"]);

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionCompactBody({ suggestion, userCanEdit }: Props) {
  const sections = suggestionSections(suggestion, userCanEdit).filter((section) =>
    COMPACT_SECTIONS.has(section.value),
  );

  return (
    <div className="column gap-big">
      <div className="column gap">
        {sections.map((section) => (
          <Fragment key={section.value}>{section.content}</Fragment>
        ))}
      </div>

      <SuggestionFooter suggestion={suggestion} userCanEdit={userCanEdit} compact />
    </div>
  );
}
