import { LinkIcon, UnlinkIcon } from "lucide-preact";
import type { SuggestionUrlReference } from "@/api/generated/models";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { useReferenceMutation } from "@/hooks/useReference";
import { ReferenceTag } from "./ReferenceTag";

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
    <div className="row gap centered">
      {editable && (
        <button
          type="button"
          className={`btn ${isIgnored ? "btn-green" : "btn-gray"}`}
          onClick={handleClick}
          disabled={mutation.isPending}
        >
          <InlineIcon icon={isIgnored ? LinkIcon : UnlinkIcon} />
          {isIgnored ? "Restore" : "Ignore"}
        </button>
      )}
      <ExternalLink href={reference.url}>{displayedLabel}</ExternalLink>
      <ul className="row gap-small">
        {reference.tags.map((tag) => (
          <li key={tag}>
            <ReferenceTag tag={tag} />
          </li>
        ))}
      </ul>
    </div>
  );
}
