import { Link } from "wouter-preact";
import type {
  RejectionReasonEnum,
  SuggestionRejectionReason,
  SuggestionStatusEnum,
} from "@/api/generated/models";
import { SuggestionStatusIcon } from "./SuggestionStatusIcon";

type Props = {
  status: SuggestionStatusEnum;
  rejectionReason?: SuggestionRejectionReason;
  /** @nullable */
  issueCode?: string | null;
  iconOnly?: boolean;
};

export function statusLabel(status: SuggestionStatusEnum): string {
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

export function rejectionReasonLabel(rejection_reason: RejectionReasonEnum): string {
  switch (rejection_reason) {
    case "not_in_nixpkgs":
      return "not in Nixpkgs";
    case "exclusively_hosted_service":
      return "exclusively hosted service";
    case "hardware_only_cpe":
      return "hardware only CPE";
    case "max_matches_exceeded":
      return "max matched exceeded";
    case "known_vulnerability":
      return "known vulnerability";
    case "no_matches":
      return "no matches";
    default:
      return rejection_reason;
  }
}

export function SuggestionStatus({ status, rejectionReason, issueCode, iconOnly = false }: Props) {
  return iconOnly ? (
    <SuggestionStatusIcon status={status} size="1em" />
  ) : (
    <div className="row gap-small centered wrap">
      <SuggestionStatusIcon status={status} size="1em" />
      <span>{statusLabel(status)}</span>
      {rejectionReason && <span>({rejectionReasonLabel(rejectionReason)})</span>}
      {status === "published" && issueCode && (
        <span>
          (<Link href={`/ui-v2/issues/${issueCode}`}>Issue</Link>)
        </span>
      )}
    </div>
  );
}
