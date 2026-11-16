import type { Suggestion as SuggestionType } from "@/api/generated/models";
import { Comment } from "./Comment";
import { SuggestionStatusActions } from "./SuggestionStatusActions";

type Props = {
  suggestion: SuggestionType;
  userCanEdit: boolean;
  /** Compact footer is one single line with comment between status change buttons. */
  compact?: boolean;
};

export function SuggestionFooter({ suggestion, userCanEdit, compact = false }: Props) {
  const { id, status, comment, in_issue_draft } = suggestion;

  const commentBox = (
    <Comment suggestionId={id} comment={comment ?? null} canEdit={userCanEdit} compact={compact} />
  );

  if (!userCanEdit) {
    return comment ? commentBox : null;
  }

  return (
    <>
      {!compact && commentBox}
      <SuggestionStatusActions
        suggestionId={id}
        status={status}
        comment={comment}
        inIssueDraft={in_issue_draft}
      >
        {compact ? commentBox : undefined}
      </SuggestionStatusActions>
    </>
  );
}
