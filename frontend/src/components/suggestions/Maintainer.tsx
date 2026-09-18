import { UserMinusIcon, UserPlusIcon } from "lucide-preact";
import type { Maintainer as MaintainerType } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { useDeleteMaintainerMutation, useMaintainerMutation } from "@/hooks/useMaintainer";

type Props = {
  maintainer: MaintainerType;
  suggestionId: number;
  editable: boolean;
  /** Which category this maintainer is displayed in, and thus which action applies. */
  kind: "active" | "ignored" | "added";
};

export function Maintainer({ maintainer, suggestionId, editable, kind }: Props) {
  const ignoreRestoreMutation = useMaintainerMutation(suggestionId);
  const deleteMutation = useDeleteMaintainerMutation(suggestionId);

  const isIgnored = kind === "ignored";
  const isAdded = kind === "added";
  const mutation = isAdded ? deleteMutation : ignoreRestoreMutation;

  function handleClick() {
    if (isAdded) {
      deleteMutation.mutate({
        id: suggestionId,
        params: { github_id: maintainer.github_id },
      });
    } else {
      ignoreRestoreMutation.mutate({
        id: suggestionId,
        data: { github_id: maintainer.github_id, ignored: !isIgnored },
      });
    }
  }

  const label = isAdded ? "Delete" : isIgnored ? "Restore" : "Ignore";

  return (
    <div className="row gap centered">
      {editable && (
        <button
          type="button"
          className={`btn ${isIgnored ? "btn-green" : "btn-gray"} row gap-small centered`}
          onClick={handleClick}
          disabled={mutation.isPending}
        >
          {isIgnored ? <UserPlusIcon size="1em" /> : <UserMinusIcon size="1em" />}
          {label}
        </button>
      )}
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
    </div>
  );
}
