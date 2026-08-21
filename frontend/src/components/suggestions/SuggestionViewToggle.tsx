import { PanelTopIcon, RectangleHorizontalIcon, Rows2Icon, Rows4Icon } from "lucide-preact";
import { type ViewModeOption, ViewModeToggle } from "@/components/ui/ViewModeToggle";
import type { SuggestionViewMode } from "@/hooks/useSuggestionViewMode";

const VIEW_MODES: ViewModeOption<SuggestionViewMode>[] = [
  { value: "detailed", label: "Detailed", Icon: Rows4Icon },
  { value: "compact", label: "Compact", Icon: Rows2Icon },
  { value: "collapsed", label: "Collapsed", Icon: RectangleHorizontalIcon },
  { value: "tabs", label: "Tabs", Icon: PanelTopIcon },
];

type Props = {
  value: SuggestionViewMode | undefined;
  onChange: (viewMode: SuggestionViewMode | undefined) => void;
  testId: string;
  iconOnly?: boolean;
  allowClear?: boolean;
};

export function SuggestionViewToggle(props: Props) {
  return <ViewModeToggle modes={VIEW_MODES} {...props} />;
}
