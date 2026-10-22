import { CalendarIcon, XIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker";
import { Select, type SelectOption } from "@/components/ui/Select";
import styles from "./DateRangeFilterInput.module.css";

type Props = {
  createdAtAfter: string;
  createdAtBefore: string;
  setCreatedAtRange: (after: string, before: string) => void;
};

type Mode = "anytime" | "before" | "after" | "on" | "between";

const MODE_OPTIONS: SelectOption[] = [
  { value: "anytime", label: "anytime" },
  { value: "before", label: "before" },
  { value: "after", label: "after" },
  { value: "on", label: "on" },
  { value: "between", label: "between" },
];

/** The mode is not stored in the URL: it is read back from the bounds, equal bounds meaning a single day. */
function deriveMode(after: string, before: string): Mode {
  if (after === "" && before === "") return "anytime";
  if (after === "") return "before";
  if (before === "") return "after";
  return after === before ? "on" : "between";
}

/** Whether a mode can express the given bounds */
function modeFits(mode: Mode, after: string, before: string): boolean {
  switch (mode) {
    case "anytime":
      return after === "" && before === "";
    case "before":
      return after === "";
    case "after":
      return before === "";
    case "on":
      return after === before;
    case "between":
      return true;
  }
}

export function DateRangeFilterInput({
  createdAtAfter,
  createdAtBefore,
  setCreatedAtRange,
}: Props) {
  const active = createdAtAfter !== "" || createdAtBefore !== "";
  // The bounds alone cannot tell an empty "before" from an empty "anytime" for instance.
  // The mode the user picked is kept locally for as long as it fits them.
  const [pickedMode, setPickedMode] = useState<Mode>("anytime");
  const mode = modeFits(pickedMode, createdAtAfter, createdAtBefore)
    ? pickedMode
    : deriveMode(createdAtAfter, createdAtBefore);

  const changeMode = (next: Mode) => {
    setPickedMode(next);
    // The day already picked, if any, is carried over to the new mode.
    const day = createdAtAfter || createdAtBefore;
    switch (next) {
      case "anytime":
        return setCreatedAtRange("", "");
      case "before":
        return setCreatedAtRange("", day);
      case "after":
      case "between":
        return setCreatedAtRange(day, "");
      case "on":
        return setCreatedAtRange(day, day);
    }
  };

  return (
    <div
      className={`row centered gap-small bg-gray-light rounded-full ${styles.pill} ${active ? "bg-nixos-blue text-white" : ""}`}
      data-testid="suggestion-date-filter"
    >
      <CalendarIcon size="1em" />
      <span>Created</span>
      <Select
        value={mode}
        options={MODE_OPTIONS}
        onValueChange={(value) => changeMode(value as Mode)}
        label="Creation date filter mode"
      />
      {mode === "before" && (
        <DatePicker
          value={createdAtBefore}
          onValueChange={(day) => setCreatedAtRange("", day)}
          label="Created on or before"
        />
      )}
      {mode === "after" && (
        <DatePicker
          value={createdAtAfter}
          onValueChange={(day) => setCreatedAtRange(day, "")}
          label="Created on or after"
        />
      )}
      {mode === "on" && (
        <DatePicker
          value={createdAtAfter}
          onValueChange={(day) => setCreatedAtRange(day, day)}
          label="Created on"
        />
      )}
      {mode === "between" && (
        <DateRangePicker
          start={createdAtAfter}
          end={createdAtBefore}
          onValueChange={setCreatedAtRange}
          startLabel="Created on or after"
          endLabel="Created on or before"
        />
      )}
      <button
        type="button"
        className={`cursor-pointer ${styles.clear}`}
        aria-label="Clear creation date filter"
        disabled={!active}
        onClick={() => {
          setPickedMode("anytime");
          setCreatedAtRange("", "");
        }}
      >
        <XIcon size="1em" />
      </button>
    </div>
  );
}
