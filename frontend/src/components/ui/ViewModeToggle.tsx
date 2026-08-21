import type { LucideIcon } from "lucide-preact";
import { ToggleGroup, type ToggleGroupOption } from "@/components/ui/ToggleGroup";

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
};

/** Generic segmented toggle for switching between view modes (e.g. issue/suggestion display density). */
export function ViewModeToggle<T extends string>({
  modes,
  value,
  onChange,
  testId,
  iconOnly = false,
  allowClear = false,
}: Props<T>) {
  const options: ToggleGroupOption[] = modes.map(({ value: mode, label, Icon }) => ({
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
            onChange(clicked as T);
          }
        }}
      />
    </div>
  );
}
