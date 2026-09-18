import { SendIcon, Trash2Icon } from "lucide-preact";
import { useState } from "preact/hooks";
import { Collapsible } from "@/components/ui/Collapsible";
import { Spinner } from "@/components/ui/Spinner";
import { useIssueDraftPublishMutation } from "@/hooks/useIssueDraftPublish";
import { useIssueDraftResetMutation } from "@/hooks/useIssueDraftReset";

type Props = {
  open: boolean;
};

export function IssueDraftPanel({ open }: Props) {
  const [title, setTitle] = useState("");
  const publishMutation = useIssueDraftPublishMutation();
  const resetMutation = useIssueDraftResetMutation();

  function publish() {
    const trimmed = title.trim();
    if (!trimmed) return;
    publishMutation.mutate({ data: { title: trimmed } }, { onSuccess: () => setTitle("") });
  }

  return (
    <Collapsible open={open}>
      <div className="box border rounded row gap-small wrap" data-testid="issue-draft-panel">
        <input
          type="text"
          placeholder="Issue title"
          value={title}
          onInput={(e) => setTitle(e.currentTarget.value)}
          className="rounded border box compact grow"
          aria-label="Issue title"
        />
        <button
          type="button"
          className="btn btn-gray row gap-small centered"
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
        >
          <Trash2Icon size="1em" />
          Reset draft
        </button>
        <button
          type="button"
          className="btn btn-green row gap-small centered"
          onClick={publish}
          disabled={publishMutation.isPending || !title.trim()}
        >
          {publishMutation.isPending ? <Spinner /> : <SendIcon size="1em" />}
          Publish
        </button>
      </div>
    </Collapsible>
  );
}
