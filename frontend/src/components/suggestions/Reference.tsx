import { LinkIcon, UnlinkIcon } from "lucide-preact";
import type { SuggestionUrlReference } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { useReferenceMutation } from "@/hooks/useReference";
import { IgnoreRestoreButton } from "./IgnoreRestoreButton";
import { ReferenceTag } from "./ReferenceTag";
import { SuggestionItemRow } from "./SuggestionItemCollection";

type Props = {
  reference: SuggestionUrlReference;
  suggestionId: number;
  editable: boolean;
  isIgnored: boolean;
};

const maxDisplayedUrlLength = 80;

export function Reference({ reference, suggestionId, editable, isIgnored }: Props) {
  const mutation = useReferenceMutation(suggestionId);
  const label = reference.name || reference.url;
  const displayedLabel =
    label.length > maxDisplayedUrlLength ? `${label.slice(0, maxDisplayedUrlLength)}…` : label;

  function handleClick() {
    mutation.mutate({
      id: suggestionId,
      data: { reference_url: reference.url, ignored: !isIgnored },
    });
  }

  return (
    <SuggestionItemRow
      ignored={isIgnored}
      action={
        editable && (
          <IgnoreRestoreButton
            action={isIgnored ? "restore" : "ignore"}
            icon={isIgnored ? LinkIcon : UnlinkIcon}
            onClick={handleClick}
            disabled={mutation.isPending}
          />
        )
      }
    >
      <div className="row gap centered wrap">
        <ExternalLink href={reference.url}>{displayedLabel}</ExternalLink>
        <ul className="row gap-small">
          {reference.tags.map((tag) => (
            <li key={tag}>
              <ReferenceTag tag={tag} />
            </li>
          ))}
        </ul>
      </div>
    </SuggestionItemRow>
  );
}
