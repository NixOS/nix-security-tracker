import { useQueryClient } from "@tanstack/react-query";
import {
  getListIssuesQueryKey,
  getListSuggestionsQueryKey,
  usePublishSuggestion,
} from "@/api/generated/endpoints";
import type { Issue } from "@/api/generated/models";
import { IssuePublishedToast } from "@/components/issues/IssuePublishedToast";
import { getApiErrorMessage } from "@/utils/apiError";
import { setCachedSuggestion, staleQuietly } from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

/** Publish a single accepted suggestion as its own GitHub issue. */
export function useSuggestionPublishMutation(suggestionId: number) {
  const queryClient = useQueryClient();

  return usePublishSuggestion({
    mutation: {
      onSuccess: (issue: Issue) => {
        setCachedSuggestion(queryClient, suggestionId, (prev) => ({
          ...prev,
          status: "published",
          issue_code: issue.code,
          in_issue_draft: false,
        }));
        staleQuietly(queryClient, getListSuggestionsQueryKey());
        staleQuietly(queryClient, getListIssuesQueryKey());
        toaster.success({
          title: "Issue published",
          description: <IssuePublishedToast issue={issue} />,
        });
      },
      onError: (err: unknown) => {
        toaster.error({
          title: "Failed to publish issue",
          description: getApiErrorMessage(err),
        });
      },
    },
  });
}
