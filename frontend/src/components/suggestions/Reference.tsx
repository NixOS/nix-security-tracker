import type { SuggestionUrlReference } from "@/api/generated/models";
import { ReferenceTag } from "./ReferenceTag";

type Props = {
  reference: SuggestionUrlReference;
};

const maxDisplayedUrlLength = 80;

export function Reference({ reference }: Props) {
  const label = reference.name || reference.url;
  const displayedLabel =
    label.length > maxDisplayedUrlLength ? `${label.slice(0, maxDisplayedUrlLength)}…` : label;
  return (
    <div className="row gap centered">
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
