import type { LucideIcon } from "lucide-preact";
import {
  SegmentedToggleGroup,
  type SegmentedToggleOption,
} from "@/components/ui/SegmentedToggleGroup";

export type ViewModeOption<T extends string> = { value: T; label: string; Icon: LucideIcon };

type Props<T extends string> = {
  modes: ViewModeOption<T>[];
  value: T | undefined;
  onChange: (viewMode: T | undefined) => void;
  testId: string;
  /** Only show icons without labels */
  iconOnly?: boolean;
  /** Allows to unselect. Used to inherit from the list-wide view mode. */
  allowClear?: boolean;
  /**
   * The inherited/parent-scope value, always highlighted distinctly from the
   * plain unselected options (unless it is itself the current selection).
   */
  currentValue?: T;
  /** Used when nested in a `LegendCard`'s border-legend slot. */
  onLegend?: boolean;
};

/** Generic segmented toggle for switching between view modes (e.g. issue/suggestion display density). */
export function ViewModeToggle<T extends string>({
  modes,
  value,
  onChange,
  testId,
  iconOnly = false,
  allowClear = false,
  currentValue,
  onLegend = false,
}: Props<T>) {
  const options: SegmentedToggleOption[] = modes.map(({ value: mode, label, Icon }) => ({
    value: mode,
    title: iconOnly ? label : undefined,
    current: mode === currentValue,
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
      <SegmentedToggleGroup
        value={value}
        options={options}
        onLegend={onLegend}
        onItemClick={(clicked) => {
          if (allowClear && clicked === value) {
            onChange(undefined);
          } else {
            onChange(clicked as T);
          }
        }}
      />
    </div>
  );
}
