import { Fragment } from "preact";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { SuggestionFooter } from "./SuggestionFooter";
import { suggestionSections } from "./SuggestionSections";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionDetailedBody({ suggestion, userCanEdit }: Props) {
  return (
    <>
      <div className="column gap">
        {suggestionSections(suggestion, userCanEdit).map((section) => (
          <Fragment key={section.value}>{section.content}</Fragment>
        ))}
      </div>

      <SuggestionFooter suggestion={suggestion} userCanEdit={userCanEdit} />
    </>
  );
}
