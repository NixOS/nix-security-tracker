import { useState } from "preact/hooks";
import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { Tabs } from "@/components/ui/Tabs";
import { SuggestionFooter } from "./SuggestionFooter";
import { suggestionSections } from "./SuggestionSections";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
};

export function SuggestionTabsBody({ suggestion, userCanEdit }: Props) {
  const tabs = suggestionSections(suggestion, userCanEdit);

  const [activeTab, setActiveTab] = useState<string | undefined>(tabs[0]?.value);

  return (
    <div className="column gap-big" data-testid={`suggestion-${suggestion.id}-tabs`}>
      {tabs.length > 0 && (
        <Tabs value={activeTab ?? tabs[0].value} onValueChange={setActiveTab} tabs={tabs} compact />
      )}

      <SuggestionFooter suggestion={suggestion} userCanEdit={userCanEdit} compact />
    </div>
  );
}
