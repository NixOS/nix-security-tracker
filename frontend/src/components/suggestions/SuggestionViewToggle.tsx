import {
  type LucideIcon,
  PanelTopIcon,
  RectangleHorizontalIcon,
  Rows2Icon,
  Rows4Icon,
} from "lucide-preact";
import { ToggleGroup, type ToggleGroupOption } from "@/components/ui/ToggleGroup";
import type { SuggestionViewMode } from "@/hooks/useSuggestionViewMode";

const VIEW_MODES: { value: SuggestionViewMode; label: string; Icon: LucideIcon }[] = [
  { value: "detailed", label: "Detailed", Icon: Rows4Icon },
  { value: "compact", label: "Compact", Icon: Rows2Icon },
  { value: "collapsed", label: "Collapsed", Icon: RectangleHorizontalIcon },
  { value: "tabs", label: "Tabs", Icon: PanelTopIcon },
];

type Props = {
  value: SuggestionViewMode | undefined;
  onChange: (viewMode: SuggestionViewMode | undefined) => void;
  testId: string;
  /** Only show icons without labels */
  iconOnly?: boolean;
  /** Allows to unselect. Used to inherit from the list-wide view mode. */
  allowClear?: boolean;
};

export function SuggestionViewToggle({
  value,
  onChange,
  testId,
  iconOnly = false,
  allowClear = false,
}: Props) {
  const options: ToggleGroupOption[] = VIEW_MODES.map(({ value: mode, label, Icon }) => ({
    value: mode,
    title: iconOnly ? label : undefined,
    label: iconOnly ? (
      <Icon size="1em" />
    ) : (
      <span className="row gap-small centered">
        <Icon size="1em" />
        {label}
      </span>
    ),
  }));

  return (
    <div data-testid={testId}>
      <ToggleGroup
        value={value ? [value] : []}
        options={options}
        variant="segmented"
        onItemClick={(clicked) => {
          if (allowClear && clicked === value) {
            onChange(undefined);
          } else {
            onChange(clicked as SuggestionViewMode);
          }
        }}
      />
    </div>
  );
}
