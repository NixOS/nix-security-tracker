import type { StatusEnum, SuggestionRejectionReason } from "@/api/generated/models";
import { SuggestionStatusIcon } from "./SuggestionStatusIcon";

type Props = {
  status: StatusEnum;
  rejectionReason?: SuggestionRejectionReason;
};

function statusLabel(status: StatusEnum): string {
  switch (status) {
    case "pending":
      return "Untriaged";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Dismissed";
    case "published":
      return "Published";
    default:
      return status;
  }
}

export function SuggestionStatus({ status, rejectionReason }: Props) {
  return (
    <div className="row gap-small centered wrap">
      <SuggestionStatusIcon status={status} size="1em" />
      <span>{statusLabel(status)}</span>
      {rejectionReason && <span>({rejectionReason})</span>}
    </div>
  );
}
