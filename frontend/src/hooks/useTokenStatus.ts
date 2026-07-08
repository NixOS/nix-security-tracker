import { useQuery } from "@tanstack/react-query";
import { getGetTokenQueryKey, getToken } from "@/api/generated/endpoints";
import type { TokenInfo } from "@/api/generated/models";

/**
 * Fetches the current user's token status.
 *
 * Returns `TokenInfo` when a token exists (200), `null` when there is none (204).
 *
 * This thin wrapper exists because TanStack Query v5 rejects `undefined` as a query
 * result value. The generated `useGetToken` hook returns `TokenInfo | void`, which
 * causes `isError = true` when the server responds 204. Mapping `undefined → null`
 * here keeps 204 semantically correct on the API side while satisfying TanStack Query.
 */
export function useTokenStatus() {
  return useQuery<TokenInfo | null>({
    queryKey: getGetTokenQueryKey(),
    queryFn: async ({ signal }) => {
      const result = await getToken({}, signal);
      // apiFetch returns undefined for 204 responses; null is a valid TanStack Query value.
      return result ?? null;
    },
  });
}
