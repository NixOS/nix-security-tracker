import { UserPlusIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { useAddMaintainerMutation } from "@/hooks/useMaintainer";
import { getApiErrorMessage } from "@/utils/apiError";

type Props = {
  suggestionId: number;
};

export function MaintainerAddForm({ suggestionId }: Props) {
  const [githubHandle, setGithubHandle] = useState("");
  const mutation = useAddMaintainerMutation(suggestionId);

  function handleAdd() {
    const handle = githubHandle.trim();
    if (!handle || mutation.isPending) return;
    mutation.mutate(
      { id: suggestionId, data: { github_handle: handle } },
      { onSuccess: () => setGithubHandle("") },
    );
  }

  return (
    <div className="column gap-small">
      <div className="row gap-small centered">
        <div className="row join join-green">
          <input
            type="text"
            className="rounded border box compact join-item"
            placeholder="GitHub username"
            value={githubHandle}
            onInput={(e) => setGithubHandle((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            disabled={mutation.isPending}
          />
          <button
            type="button"
            className="btn btn-green join-item row gap-small centered"
            disabled={mutation.isPending || !githubHandle.trim()}
            onClick={handleAdd}
          >
            <UserPlusIcon size="1em" />
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
