import { useQueryClient } from "@tanstack/react-query";
import {
  getListIssuesQueryKey,
  getListSuggestionsQueryKey,
  usePublishIssueDraft,
} from "@/api/generated/endpoints";
import type { Issue } from "@/api/generated/models";
import { IssuePublishedToast } from "@/components/issues/IssuePublishedToast";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  clearCachedIssueDraftLists,
  patchCachedSuggestionsMatching,
  staleQuietly,
} from "@/utils/suggestionCache";
import { toaster } from "@/utils/toaster";

/** Publish all suggestions currently in the issue draft as a single GitHub issue. */
export function useIssueDraftPublishMutation() {
  const queryClient = useQueryClient();

  return usePublishIssueDraft({
    mutation: {
      onSuccess: (issue: Issue) => {
        patchCachedSuggestionsMatching(
          queryClient,
          (s) => s.in_issue_draft,
          (s) => ({ ...s, in_issue_draft: false, status: "published", issue_code: issue.code }),
        );
        clearCachedIssueDraftLists(queryClient);
        staleQuietly(queryClient, getListSuggestionsQueryKey());
        staleQuietly(queryClient, getListIssuesQueryKey());
        toaster.success({
          title: "Issue bundle published",
          description: <IssuePublishedToast issue={issue} />,
        });
      },
      onError: (err: unknown) => {
        toaster.error({
          title: "Failed to publish the issue bundle",
          description: getApiErrorMessage(err),
        });
      },
    },
  });
}
