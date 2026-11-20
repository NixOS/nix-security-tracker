import {
  ChevronDownIcon,
  ChevronRightIcon,
  PackageMinusIcon,
  PackagePlusIcon,
} from "lucide-preact";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import type { PackageGroup, SuggestionPackageBranches } from "@/api/generated/models";
import { Collapsible } from "@/components/ui/Collapsible";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { usePackageMutation } from "@/hooks/usePackage";
import { useSuggestionListFilterHref, withPackageFilter } from "@/hooks/useSuggestionListFilters";
import { cx } from "@/utils/className";
import { formatTime } from "@/utils/date";
import { FilterShortcut } from "./FilterShortcut";
import { IgnoreRestoreButton } from "./IgnoreRestoreButton";
import styles from "./Package.module.css";
import { SuggestionItemLine } from "./SuggestionItemCollection";
import {
  allIgnored,
  type ItemRow,
  ignoredRows,
  type PackageEntry,
  type PackageSlot,
  sharedBranches,
  shownRows,
} from "./suggestionItems";

type PackageProps = {
  slot: PackageSlot;
  suggestionId: number;
  editable: boolean;
  /** Whether ignored attributes are shown when a group is unfolded. */
  showIgnored: boolean;
};

/**
 * One row of a suggestion's packages list.
 * Either an attribute alone, or the attributes of the same package folded together.
 */
export function Package({ slot, suggestionId, editable, showIgnored }: PackageProps) {
  return slot.group && slot.attributes.length > 1 ? (
    <AttributeGroup
      group={slot.group}
      attributes={slot.attributes}
      suggestionId={suggestionId}
      editable={editable}
      showIgnored={showIgnored}
    />
  ) : (
    <Attribute row={slot.attributes[0]} suggestionId={suggestionId} editable={editable} />
  );
}

type AttributeProps = {
  row: ItemRow<PackageEntry>;
  suggestionId: number;
  editable: boolean;
};

/** An attribute on its own in the packages list. */
function Attribute({ row, suggestionId, editable }: AttributeProps) {
  return (
    <li>
      <PackageItemLine suggestionId={suggestionId} editable={editable} attributes={[row]}>
        <PackageSummary
          title={<AttributeTitle attribute={row.item.attribute} />}
          description={row.item.pkg.description}
          branches={row.item.pkg.branches}
        />
      </PackageItemLine>
    </li>
  );
}

type AttributeGroupProps = {
  group: PackageGroup;
  /** In their original order, whatever their state. */
  attributes: ItemRow<PackageEntry>[];
  suggestionId: number;
  editable: boolean;
  showIgnored: boolean;
};

function attributeCount(total: number, ignored: number): string {
  if (ignored === 0 || ignored === total) {
    return `(${total})`;
  }
  return `(${total - ignored} of ${total})`;
}

/**
 * Attributes of the same package in one row, which unfolds to the attributes themselves.
 * The group can be ignored or restored as a whole, or attribute by attribute.
 */
function AttributeGroup({
  group,
  attributes,
  suggestionId,
  editable,
  showIgnored,
}: AttributeGroupProps) {
  const [open, setOpen] = useState(false);
  const branches = sharedBranches(attributes);

  return (
    <li>
      <PackageItemLine suggestionId={suggestionId} editable={editable} attributes={attributes}>
        <PackageSummary
          title={
            <>
              <button
                type="button"
                className="btn-plain"
                aria-expanded={open}
                aria-label={`${open ? "Hide" : "Show"} attributes of package '${group.name}'`}
                onClick={() => setOpen(!open)}
              >
                {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </button>
              <h3 className="bold">{group.name}</h3>
              <span className="text-gray">
                {attributeCount(attributes.length, ignoredRows(attributes).length)}
              </span>
            </>
          }
          description={group.description}
          branches={branches}
        />
      </PackageItemLine>
      <Collapsible open={open}>
        <ul className={`column gap-small ${styles.attributes}`}>
          {shownRows(attributes, showIgnored).map((row) => (
            <GroupedAttribute
              key={row.key}
              row={row}
              suggestionId={suggestionId}
              editable={editable}
              showBranches={!branches}
            />
          ))}
        </ul>
      </Collapsible>
    </li>
  );
}

type GroupedAttributeProps = AttributeProps & {
  /** Whether the attribute's versions differ from the other attributes of the group. */
  showBranches: boolean;
};

/** An attribute in an unfolded group, whose package details are already shown by the group. */
function GroupedAttribute({ row, suggestionId, editable, showBranches }: GroupedAttributeProps) {
  return (
    <li>
      <PackageItemLine suggestionId={suggestionId} editable={editable} attributes={[row]}>
        <PackageSummary
          title={<AttributeTitle attribute={row.item.attribute} />}
          description={null}
          branches={showBranches ? row.item.pkg.branches : undefined}
          nested
        />
      </PackageItemLine>
    </li>
  );
}

type PackageItemLineProps = {
  suggestionId: number;
  editable: boolean;
  /** Attributes the ignore/restore button acts on. */
  attributes: readonly ItemRow<PackageEntry>[];
  children: ComponentChildren;
};

/**
 * Line of the packages list with an ignore/restore button acting on some attributes.
 * The button restores only when all of them are ignored, and ignores otherwise.
 */
function PackageItemLine({ suggestionId, editable, attributes, children }: PackageItemLineProps) {
  const mutation = usePackageMutation(suggestionId);
  const ignored = allIgnored(attributes);

  function handleClick() {
    // Only attributes not yet in the requested state, since the server rejects the others.
    const pending = attributes
      .filter((row) => (row.state === "ignored") === ignored)
      .map((row) => row.item.attribute);
    mutation.mutate({
      id: suggestionId,
      data: { package_attributes: pending, ignored: !ignored },
    });
  }

  return (
    <SuggestionItemLine
      ignored={ignored}
      action={
        editable && (
          <IgnoreRestoreButton
            action={ignored ? "restore" : "ignore"}
            icon={ignored ? PackagePlusIcon : PackageMinusIcon}
            onClick={handleClick}
            disabled={mutation.isPending}
          />
        )
      }
    >
      {children}
    </SuggestionItemLine>
  );
}

type PackageSummaryProps = {
  title: ComponentChildren;
  description: string | null;
  /** Left out when they are not common to the whole package. */
  branches?: SuggestionPackageBranches;
  /** Whether the title is indented under the title of its group, within the same width. */
  nested?: boolean;
};

/** Title and description of a package, next to its versions on the evaluated branches. */
function PackageSummary({ title, description, branches, nested = false }: PackageSummaryProps) {
  return (
    <div className="row gap align-start wrap">
      <div className="column">
        <div className={cx("row gap-small", styles.packageTitle, nested && styles.nestedTitle)}>
          {title}
        </div>
        {description && <p className={styles.packageTitle}>{description}</p>}
      </div>
      {branches && <PackageBranches branches={branches} />}
    </div>
  );
}

/** Shows an attribute name with a shortcut to filter suggestions by it. */
function AttributeTitle({ attribute }: { attribute: string }) {
  const filterHref = useSuggestionListFilterHref();
  return (
    <>
      <h3 className="bold">{attribute}</h3>
      <FilterShortcut
        href={filterHref(withPackageFilter(attribute))}
        label={`Filter suggestions by package '${attribute}'`}
      />
    </>
  );
}

function versionStatusClass(status: string | null): string {
  if (status === "affected") return "bg-red-light";
  if (status === "unaffected") return "bg-green-light";
  return "";
}

/** Version of a package on each evaluated branch with a link to its source. */
function PackageBranches({ branches }: { branches: SuggestionPackageBranches }) {
  if (Object.keys(branches).length === 0) return null;
  return (
    <ul className={`column gap-small ${styles.details}`}>
      {Object.entries(branches).map(([branch, info]) => (
        <li key={branch} className="inline-row gap-small">
          <span className={styles.branch}>{branch}</span>
          {info.version ? (
            info.src_position ? (
              <ExternalLink
                className={versionStatusClass(info.status)}
                href={info.src_position}
                title={info.updated ? `Evaluated: ${formatTime(info.updated)}` : undefined}
              >
                {info.version}
              </ExternalLink>
            ) : (
              <span className={versionStatusClass(info.status)}>{info.version}</span>
            )
          ) : (
            <span className="dimmed">—</span>
          )}
        </li>
      ))}
    </ul>
  );
}
