import { useQueryClient } from "@tanstack/react-query";
import { PackageMinusIcon, PackagePlusIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { ApiError } from "@/api/client";
import {
  getListPackageSubscriptionsQueryKey,
  useAddPackageSubscription,
  useListPackageSubscriptions,
  useRemovePackageSubscription,
} from "@/api/generated/endpoints";
import type { PackageSubscriptions as PackageSubscriptionsData } from "@/api/generated/models";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

function PackageListSkeleton() {
  const widths = ["8em", "12em", "6em"];
  return (
    <ul className="column gap-small" aria-busy="true">
      {widths.map((w) => (
        <li key={w} className="row gap-small centered">
          <Skeleton width="6.5em" height="2em" />
          <Skeleton width={w} height="1em" />
        </li>
      ))}
    </ul>
  );
}

export function PackageSubscriptions() {
  const queryClient = useQueryClient();
  const [packageName, setPackageName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const { data, isLoading, isError } = useListPackageSubscriptions();

  const { mutate: addPackage, isPending: isAdding } = useAddPackageSubscription({
    mutation: {
      onSuccess: (result) => {
        queryClient.setQueryData<PackageSubscriptionsData>(
          getListPackageSubscriptionsQueryKey(),
          result,
        );
        setPackageName("");
        setAddError(null);
      },
      onError: (err) => {
        const detail =
          err instanceof ApiError && typeof (err.body as { detail?: string })?.detail === "string"
            ? (err.body as { detail: string }).detail
            : "Failed to subscribe to package.";
        setAddError(detail);
      },
    },
  });

  const { mutate: removePackage } = useRemovePackageSubscription({
    mutation: {
      onMutate: async ({ packageName: name }) => {
        const queryKey = getListPackageSubscriptionsQueryKey();
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<PackageSubscriptionsData>(queryKey);
        queryClient.setQueryData<PackageSubscriptionsData>(queryKey, (old) =>
          old ? { packages: old.packages.filter((p) => p !== name) } : old,
        );
        return { previous };
      },
      onError: (_err, _vars, context) => {
        const queryKey = getListPackageSubscriptionsQueryKey();
        if (context?.previous !== undefined) {
          queryClient.setQueryData<PackageSubscriptionsData>(queryKey, context.previous);
        }
      },
      onSuccess: (result) => {
        queryClient.setQueryData<PackageSubscriptionsData>(
          getListPackageSubscriptionsQueryKey(),
          result,
        );
      },
    },
  });

  if (isError) return <p>Failed to load package subscriptions.</p>;

  const packages = data?.packages ?? [];

  return (
    <div className="column gap">
      <p>
        Subscribe to additional packages here. You'll receive notifications when a new CVE may
        affect them.
      </p>

      <div className="row gap-small centered">
        <div className="row join join-green">
          <input
            type="text"
            className="rounded border box compact join-item"
            placeholder="Package name"
            value={packageName}
            onInput={(e) => setPackageName((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && packageName.trim() && !isAdding) {
                addPackage({ data: { package_name: packageName.trim() } });
              }
            }}
            disabled={isAdding}
          />
          <button
            type="button"
            className="btn btn-green join-item row gap-small centered"
            disabled={isAdding || !packageName.trim()}
            onClick={() => addPackage({ data: { package_name: packageName.trim() } })}
          >
            <PackagePlusIcon size="1em" />
            Subscribe
          </button>
        </div>
        {isAdding && <Spinner />}
      </div>

      {addError && <div className="rounded box bg-red text-white">{addError}</div>}

      {isLoading ? (
        <PackageListSkeleton />
      ) : packages.length === 0 ? (
        <div className="subscriptions-list-empty">You haven't subscribed to any packages yet.</div>
      ) : (
        <ul className="column gap-small">
          {packages.map((pkg) => (
            <li key={pkg} className="row gap-small centered">
              <button
                type="button"
                className="btn btn-gray row gap-small centered"
                onClick={() => removePackage({ packageName: pkg })}
              >
                <PackageMinusIcon size="1em" />
                Unsubscribe
              </button>
              <div>{pkg}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
