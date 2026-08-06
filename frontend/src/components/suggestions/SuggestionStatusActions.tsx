import { PenToolIcon, Trash2Icon } from "lucide-preact";
import type { ComponentChild } from "preact";
import type { StatusEnum, SuggestionStatusRejectionReason } from "@/api/generated/models";
import { Menu } from "@/components/ui/Menu";
import { useSuggestionStatusMutation } from "@/hooks/useSuggestionStatus";

type Props = {
  suggestionId: number;
  status: StatusEnum;
  comment?: string | null;
  children?: ComponentChild; // Component to insert between the status change buttons: e.g. comment in compact mode
};

export function SuggestionStatusActions({ suggestionId, status, comment, children }: Props) {
  const mutation = useSuggestionStatusMutation(suggestionId);

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

  return (
    <div
      className="row gap-small centered spread"
      data-testid={`suggestion-${suggestionId}-status-actions`}
    >
      {canDismiss && (
        <Menu
          trigger={
            <div className="btn btn-red row gap-small centered">
              <Trash2Icon size="1em" />
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
          className="btn btn-green row gap-small centered"
          onClick={accept}
          disabled={mutation.isPending}
        >
          <PenToolIcon size="1em" />
          Accept
        </button>
      )}
    </div>
  );
}
