import {
  DatePickerContent,
  DatePickerContext,
  DatePickerControl,
  DatePickerInput,
  DatePickerNextTrigger,
  DatePickerPositioner,
  DatePickerPrevTrigger,
  DatePickerRangeText,
  DatePickerRoot,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerTrigger,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
  parseDate,
} from "@ark-ui/react";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-preact";
import styles from "./DatePicker.module.css";

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateValues(...days: string[]) {
  return days.filter((day) => DAY_PATTERN.test(day)).map((day) => parseDate(day));
}

// In range mode the value array is positional, so an unset start cannot be
// skipped without the end silently becoming the start.
function toRangeValues(start: string, end: string) {
  return DAY_PATTERN.test(start) ? toDateValues(start, end) : [];
}

function toBound(day: string | undefined) {
  return day && DAY_PATTERN.test(day) ? parseDate(day) : undefined;
}

/**
 * en-CA locale parses the YYYY-MM-DD ISO way
 * That way it is consistent with the API and URL parameters
 * Used as props to the ArkUI components
 */
const ISO_DATES = {
  locale: "en-CA",
  format: (date: { toString: () => string }) => date.toString(),
};

function Calendar() {
  return (
    <DatePickerPositioner>
      <DatePickerContent
        className={`rounded border box compact shadow bg-white text-black ${styles.content}`}
      >
        <DatePickerView view="day">
          <DatePickerContext>
            {(api) => (
              <>
                <ViewControl />
                <DatePickerTable>
                  <DatePickerTableHead>
                    <DatePickerTableRow>
                      {api.weekDays.map((weekDay) => (
                        <DatePickerTableHeader key={weekDay.short} className={styles.weekDay}>
                          {weekDay.narrow}
                        </DatePickerTableHeader>
                      ))}
                    </DatePickerTableRow>
                  </DatePickerTableHead>
                  <DatePickerTableBody>
                    {api.weeks.map((week) => (
                      <DatePickerTableRow key={week[0].toString()}>
                        {week.map((day) => (
                          <DatePickerTableCell key={day.toString()} value={day}>
                            <DatePickerTableCellTrigger className={`cursor-pointer ${styles.cell}`}>
                              {day.day}
                            </DatePickerTableCellTrigger>
                          </DatePickerTableCell>
                        ))}
                      </DatePickerTableRow>
                    ))}
                  </DatePickerTableBody>
                </DatePickerTable>
              </>
            )}
          </DatePickerContext>
        </DatePickerView>
        <DatePickerView view="month">
          <DatePickerContext>
            {(api) => (
              <>
                <ViewControl />
                <DatePickerTable>
                  <DatePickerTableBody>
                    {api.getMonthsGrid({ columns: 4, format: "short" }).map((months) => (
                      <DatePickerTableRow key={months[0].value}>
                        {months.map((month) => (
                          <DatePickerTableCell key={month.value} value={month.value}>
                            <DatePickerTableCellTrigger className={`cursor-pointer ${styles.cell}`}>
                              {month.label}
                            </DatePickerTableCellTrigger>
                          </DatePickerTableCell>
                        ))}
                      </DatePickerTableRow>
                    ))}
                  </DatePickerTableBody>
                </DatePickerTable>
              </>
            )}
          </DatePickerContext>
        </DatePickerView>
        <DatePickerView view="year">
          <DatePickerContext>
            {(api) => (
              <>
                <ViewControl />
                <DatePickerTable>
                  <DatePickerTableBody>
                    {api.getYearsGrid({ columns: 4 }).map((years) => (
                      <DatePickerTableRow key={years[0].value}>
                        {years.map((year) => (
                          <DatePickerTableCell key={year.value} value={year.value}>
                            <DatePickerTableCellTrigger className={`cursor-pointer ${styles.cell}`}>
                              {year.label}
                            </DatePickerTableCellTrigger>
                          </DatePickerTableCell>
                        ))}
                      </DatePickerTableRow>
                    ))}
                  </DatePickerTableBody>
                </DatePickerTable>
              </>
            )}
          </DatePickerContext>
        </DatePickerView>
      </DatePickerContent>
    </DatePickerPositioner>
  );
}

function ViewControl() {
  return (
    <DatePickerViewControl className={`row centered spread ${styles.viewControl}`}>
      <DatePickerPrevTrigger
        aria-label="Previous"
        className={`cursor-pointer ${styles.navigation}`}
      >
        <ChevronLeftIcon size="1em" />
      </DatePickerPrevTrigger>
      <DatePickerViewTrigger className={`cursor-pointer ${styles.navigation}`}>
        <DatePickerRangeText />
      </DatePickerViewTrigger>
      <DatePickerNextTrigger aria-label="Next" className={`cursor-pointer ${styles.navigation}`}>
        <ChevronRightIcon size="1em" />
      </DatePickerNextTrigger>
    </DatePickerViewControl>
  );
}

function CalendarTrigger({ label }: { label: string }) {
  return (
    <DatePickerTrigger aria-label={label} className={`cursor-pointer ${styles.trigger}`}>
      <CalendarDaysIcon size="1em" />
    </DatePickerTrigger>
  );
}

type DatePickerProps = {
  /** Selected day as `YYYY-MM-DD`, empty when unset. */
  value: string;
  onValueChange: (day: string) => void;
  /** Accessible name of the date input. */
  label: string;
  /** Selectable bounds, as `YYYY-MM-DD`. */
  min?: string;
  max?: string;
};

/** Single day picker with calendar popup. */
export function DatePicker({ value, onValueChange, label, min, max }: DatePickerProps) {
  return (
    <DatePickerRoot
      value={toDateValues(value)}
      min={toBound(min)}
      max={toBound(max)}
      onValueChange={({ valueAsString }) => onValueChange(valueAsString[0] ?? "")}
      {...ISO_DATES}
    >
      <DatePickerControl className="row centered gap-small">
        <DatePickerInput aria-label={label} className={styles.input} />
        <CalendarTrigger label={`Open ${label.toLowerCase()} calendar`} />
      </DatePickerControl>
      <Calendar />
    </DatePickerRoot>
  );
}

type DateRangePickerProps = {
  /** Range bounds as `YYYY-MM-DD`, empty when unset. */
  start: string;
  end: string;
  onValueChange: (start: string, end: string) => void;
  /** Accessible names of the two date inputs. */
  startLabel: string;
  endLabel: string;
};

/** Inclusive day range picke with calendar popup. */
export function DateRangePicker({
  start,
  end,
  onValueChange,
  startLabel,
  endLabel,
}: DateRangePickerProps) {
  return (
    <DatePickerRoot
      selectionMode="range"
      value={toRangeValues(start, end)}
      onValueChange={({ valueAsString }) =>
        onValueChange(valueAsString[0] ?? "", valueAsString[1] ?? "")
      }
      {...ISO_DATES}
    >
      <DatePickerControl className="row centered gap-small">
        <DatePickerInput index={0} aria-label={startLabel} className={styles.input} />
        <span aria-hidden="true">–</span>
        <DatePickerInput index={1} aria-label={endLabel} className={styles.input} />
        <CalendarTrigger label="Open creation date range calendar" />
      </DatePickerControl>
      <Calendar />
    </DatePickerRoot>
  );
}
