import { PackagePlusIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { Spinner } from "@/components/ui/Spinner";
import { useAddPackageMutation } from "@/hooks/usePackage";
import { getApiErrorMessage } from "@/utils/apiError";

type Props = {
  suggestionId: number;
};

export function PackageAddForm({ suggestionId }: Props) {
  const [packageAttribute, setPackageAttribute] = useState("");
  const mutation = useAddPackageMutation(suggestionId);

  function handleAdd() {
    const attribute = packageAttribute.trim();
    if (!attribute || mutation.isPending) return;
    mutation.mutate(
      { id: suggestionId, data: { package_attributes: [attribute] } },
      { onSuccess: () => setPackageAttribute("") },
    );
  }

  return (
    <div className="column gap-small">
      <div className="row gap-small centered">
        <div className="row join join-green">
          <input
            type="text"
            className="rounded border box compact join-item"
            placeholder="Attribute path"
            value={packageAttribute}
            onInput={(e) => setPackageAttribute((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            disabled={mutation.isPending}
          />
          <button
            type="button"
            className="btn btn-green join-item"
            disabled={mutation.isPending || !packageAttribute.trim()}
            onClick={handleAdd}
          >
            <InlineIcon icon={PackagePlusIcon} />
            Add
          </button>
        </div>
        {mutation.isPending && <Spinner />}
      </div>
      {mutation.isError && (
        <div className="rounded box bg-red text-white">
          {getApiErrorMessage(mutation.error, { includeField: false })}
        </div>
      )}
    </div>
  );
}
