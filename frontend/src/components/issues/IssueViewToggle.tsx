import { ChevronsDownUpIcon, ChevronsUpDownIcon } from "lucide-preact";
import { type ViewModeOption, ViewModeToggle } from "@/components/ui/ViewModeToggle";
import type { IssueViewMode } from "@/hooks/useIssueViewMode";

const VIEW_MODES: ViewModeOption<IssueViewMode>[] = [
  { value: "collapsed", label: "Collapsed", Icon: ChevronsDownUpIcon },
  { value: "expanded", label: "Expanded", Icon: ChevronsUpDownIcon },
];

type Props = {
  value: IssueViewMode | undefined;
  onChange: (viewMode: IssueViewMode | undefined) => void;
  testId: string;
  iconOnly?: boolean;
  allowClear?: boolean;
};

export function IssueViewToggle(props: Props) {
  return <ViewModeToggle modes={VIEW_MODES} {...props} />;
}
