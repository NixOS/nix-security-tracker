import { type LucideIcon, UserMinusIcon, UserPlusIcon } from "lucide-preact";
import type { Maintainer as MaintainerType } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { useDeleteMaintainerMutation, useMaintainerMutation } from "@/hooks/useMaintainer";
import { IgnoreRestoreButton } from "./IgnoreRestoreButton";
import { SuggestionItemRow } from "./SuggestionItemCollection";
import type { ItemState } from "./suggestionItems";

type Props = {
  maintainer: MaintainerType;
  suggestionId: number;
  editable: boolean;
  /** Which category this maintainer is displayed in, and thus which action applies. */
  kind: ItemState;
};

export function Maintainer({ maintainer, suggestionId, editable, kind }: Props) {
  const ignoreRestoreMutation = useMaintainerMutation(suggestionId);
  const deleteMutation = useDeleteMaintainerMutation(suggestionId);

  const isIgnored = kind === "ignored";
  function handleClick() {
    switch (kind) {
      case "added":
        return deleteMutation.mutate({
          id: suggestionId,
          params: { github_id: maintainer.github_id },
        });
      case "active":
      case "ignored":
        return ignoreRestoreMutation.mutate({
          id: suggestionId,
          data: { github_id: maintainer.github_id, ignored: !isIgnored },
        });
      default:
        kind satisfies never;
    }
  }

  const { action, icon, mutation } = (
    {
      active: { action: "ignore", icon: UserMinusIcon, mutation: ignoreRestoreMutation },
      ignored: { action: "restore", icon: UserPlusIcon, mutation: ignoreRestoreMutation },
      added: { action: "delete", icon: UserMinusIcon, mutation: deleteMutation },
    } as const satisfies Record<
      ItemState,
      { action: string; icon: LucideIcon; mutation: { isPending: boolean } }
    >
  )[kind];

  return (
    <SuggestionItemRow
      ignored={isIgnored}
      action={
        editable && (
          <IgnoreRestoreButton
            action={action}
            icon={icon}
            onClick={handleClick}
            disabled={mutation.isPending}
          />
        )
      }
    >
      <div>
        <ExternalLink className="bold" href={`https://github.com/${maintainer.github}`}>
          @{maintainer.github}
        </ExternalLink>
        {maintainer.name && <span> {maintainer.name}</span>}
        {maintainer.email && (
          <span>
            {" "}
            &lt;
            <a href={`mailto:${maintainer.email}`}>{maintainer.email}</a>
            &gt;
          </span>
        )}
      </div>
    </SuggestionItemRow>
  );
}
