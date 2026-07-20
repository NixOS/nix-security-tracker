import { Link2Icon, Link2OffIcon } from "lucide-preact";
import type { SuggestionUrlReference } from "@/api/generated/models";
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
          className={`btn ${isIgnored ? "btn-green" : "btn-gray"} row gap-small centered`}
          onClick={handleClick}
          disabled={mutation.isPending}
        >
          {isIgnored ? <Link2Icon size="1em" /> : <Link2OffIcon size="1em" />}
          {isIgnored ? "Restore" : "Ignore"}
        </button>
      )}
      <a href={reference.url} target="_blank" rel="noreferrer">
        {displayedLabel}
      </a>
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
