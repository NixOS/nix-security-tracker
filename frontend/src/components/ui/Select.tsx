import {
  createListCollection,
  SelectContent,
  SelectControl,
  SelectIndicator,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@ark-ui/react";
import { ChevronDownIcon } from "lucide-preact";
import styles from "./Select.module.css";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  /** Accessible name of the trigger. */
  label: string;
};

/**
 * Single-choice dropdown. Borderless and transparent so it blends into its container.
 * Only the popup list is styled like other bordered boxes.
 */
export function Select({ value, options, onValueChange, label }: Props) {
  const collection = createListCollection({ items: options });

  return (
    <SelectRoot
      collection={collection}
      value={[value]}
      onValueChange={({ value }) => onValueChange(value[0])}
      positioning={{ sameWidth: false }}
    >
      <SelectControl>
        <SelectTrigger
          aria-label={label}
          className={`row centered gap-small cursor-pointer ${styles.trigger}`}
        >
          <SelectValueText />
          <SelectIndicator className="row centered">
            <ChevronDownIcon size="1em" />
          </SelectIndicator>
        </SelectTrigger>
      </SelectControl>
      <SelectPositioner>
        <SelectContent
          className={`rounded border box compact shadow bg-white text-black ${styles.content}`}
        >
          <SelectList>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                item={option}
                className={`cursor-pointer ${styles.item}`}
              >
                <SelectItemText>{option.label}</SelectItemText>
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </SelectPositioner>
    </SelectRoot>
  );
}
