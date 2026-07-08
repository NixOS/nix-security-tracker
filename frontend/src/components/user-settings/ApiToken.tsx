import { useQueryClient } from "@tanstack/react-query";
import { useState } from "preact/hooks";
import {
  getGetTokenQueryKey,
  useExtendToken,
  useGenerateToken,
  useRevokeToken,
} from "@/api/generated/endpoints";
import type { NewToken, TokenInfo } from "@/api/generated/models";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useTokenStatus } from "@/hooks/useTokenStatus";
import { formatDate } from "@/utils/date";

export function ApiToken() {
  const queryClient = useQueryClient();
  const [newToken, setNewToken] = useState<NewToken | null>(null);

  const { data: tokenInfo, isLoading, isError } = useTokenStatus();

  const { mutate: generate, isPending: isGenerating } = useGenerateToken({
    mutation: {
      onSuccess: (result) => {
        setNewToken(result);
        queryClient.setQueryData<TokenInfo>(getGetTokenQueryKey(), {
          created: result.created,
          expiry: result.expiry,
          ttl_days: result.ttl_days,
        });
      },
    },
  });

  const { mutate: revoke, isPending: isRevoking } = useRevokeToken({
    mutation: {
      onSuccess: () => {
        setNewToken(null);
        queryClient.setQueryData<TokenInfo | null>(getGetTokenQueryKey(), null);
      },
    },
  });

  const { mutate: extend, isPending: isExtending } = useExtendToken({
    mutation: {
      onSuccess: (result) => {
        queryClient.setQueryData<TokenInfo>(getGetTokenQueryKey(), result);
      },
    },
  });

  const isPending = isGenerating || isRevoking || isExtending;

  if (isError)
    return <p className="rounded box bg-red text-white">Failed to load token information.</p>;

  return (
    <div className="column gap-big">
      <p>
        Use an API token to authenticate requests with{" "}
        <code>Authorization: Bearer &lt;token&gt;</code>.
      </p>

      {isLoading ? (
        <Skeleton shape="rect" width="100%" height="8em" />
      ) : newToken ? (
        <div className="rounded border box column gap">
          <h2 className="text-l bold">Your new token</h2>
          <div className="bold">Copy this value now. It will not be shown again.</div>
          <pre>{newToken.token}</pre>
          <p>
            Created: {formatDate(newToken.created)}
            <br />
            Expires: {formatDate(newToken.expiry)}
          </p>
          <div className="row gap-small centered">
            <button
              type="button"
              className="btn btn-red"
              disabled={isPending}
              onClick={() => revoke()}
            >
              Revoke
            </button>
            {isRevoking && <Spinner />}
          </div>
        </div>
      ) : tokenInfo?.created && tokenInfo?.expiry ? (
        <div className="rounded border box column gap">
          <h2 className="text-l bold">Active token</h2>
          <p>
            Created: {formatDate(tokenInfo.created)}
            <br />
            Expires: {formatDate(tokenInfo.expiry)}
          </p>
          <div className="row gap-small centered">
            <button
              type="button"
              className="btn btn-green"
              disabled={isPending}
              onClick={() => extend()}
            >
              Extend by {tokenInfo.ttl_days} days
            </button>
            <button
              type="button"
              className="btn btn-red"
              disabled={isPending}
              onClick={() => revoke()}
            >
              Revoke
            </button>
            {isPending && <Spinner />}
          </div>
        </div>
      ) : (
        <div className="rounded border box column gap">
          <h2 className="text-l bold">No active token</h2>
          <div className="row gap centered">
            <button
              type="button"
              className="btn btn-green"
              disabled={isPending}
              onClick={() => generate()}
            >
              Generate API token
            </button>
            {isGenerating && <Spinner />}
          </div>
        </div>
      )}
    </div>
  );
}
