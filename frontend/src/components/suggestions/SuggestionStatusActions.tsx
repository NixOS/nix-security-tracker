import { LayersMinusIcon, LayersPlusIcon, PenToolIcon, SendIcon, Trash2Icon } from "lucide-preact";
import type { ComponentChild } from "preact";
import type { SuggestionStatusEnum, SuggestionStatusRejectionReason } from "@/api/generated/models";
import { InlineIcon } from "@/components/ui/InlineIcon";
import { Menu } from "@/components/ui/Menu";
import { useSuggestionBundleMutation } from "@/hooks/useSuggestionBundle";
import { useSuggestionPublishMutation } from "@/hooks/useSuggestionPublish";
import { useSuggestionStatusMutation } from "@/hooks/useSuggestionStatus";

type Props = {
  suggestionId: number;
  status: SuggestionStatusEnum;
  comment?: string | null;
  inIssueDraft?: boolean;
  children?: ComponentChild; // Component to insert between the status change buttons: e.g. comment in compact mode
};

export function SuggestionStatusActions({
  suggestionId,
  status,
  comment,
  inIssueDraft = false,
  children,
}: Props) {
  const mutation = useSuggestionStatusMutation(suggestionId);
  const bundleMutation = useSuggestionBundleMutation(suggestionId);
  const publishMutation = useSuggestionPublishMutation(suggestionId);

  if (status === "published") {
    return null;
  }

  const canAccept = status === "pending" || status === "rejected";
  const canDismiss = status === "pending" || status === "accepted";

  function accept() {
    mutation.mutate({ id: suggestionId, data: { status: "accepted" } });
  }

  function dismiss(rejectionReason: SuggestionStatusRejectionReason) {
    mutation.mutate({
      id: suggestionId,
      data: { status: "rejected", rejection_reason: rejectionReason },
    });
  }

  function toggleBundle() {
    bundleMutation.mutate({ id: suggestionId, data: { in_issue_draft: !inIssueDraft } });
  }

  function publish() {
    publishMutation.mutate({ id: suggestionId });
  }

  return (
    <div
      className="row gap-small centered spread"
      data-testid={`suggestion-${suggestionId}-status-actions`}
    >
      {canDismiss && (
        <Menu
          trigger={
            <div className="btn btn-red">
              <InlineIcon icon={Trash2Icon} />
              Dismiss
            </div>
          }
          items={[
            {
              value: "with-comment",
              label: "With comment",
              onSelect: () => dismiss(null),
              disabled: !comment,
            },
            {
              value: "not-in-nixpkgs",
              label: "Not in nixpkgs",
              onSelect: () => dismiss("not_in_nixpkgs"),
            },
          ]}
        />
      )}
      {children ?? <div></div>}
      {canAccept && (
        <button
          type="button"
          className="btn btn-green"
          onClick={accept}
          disabled={mutation.isPending}
        >
          <InlineIcon icon={PenToolIcon} />
          Accept
        </button>
      )}
      {status === "accepted" && (
        <div className="row gap-small centered">
          <button
            type="button"
            className="btn btn-gray"
            onClick={toggleBundle}
            disabled={bundleMutation.isPending}
          >
            <InlineIcon icon={inIssueDraft ? LayersMinusIcon : LayersPlusIcon} />
            {inIssueDraft ? "Unbundle" : "Bundle"}
          </button>
          {!inIssueDraft && (
            <button
              type="button"
              className="btn btn-green"
              onClick={publish}
              disabled={publishMutation.isPending}
            >
              <InlineIcon icon={SendIcon} pending={publishMutation.isPending} />
              Publish
            </button>
          )}
        </div>
      )}
    </div>
  );
}
