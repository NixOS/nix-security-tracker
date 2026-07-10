import type { Maintainer as MaintainerType } from "@/api/generated/models";

type Props = {
  maintainer: MaintainerType;
};

export function Maintainer({ maintainer }: Props) {
  return (
    <div className="row gap centered">
      <div>
        <a
          className="bold"
          href={`https://github.com/${maintainer.github}`}
          target="_blank"
          rel="noreferrer"
        >
          @{maintainer.github}
        </a>
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
