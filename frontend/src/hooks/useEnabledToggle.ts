import type { AnyUseMutationOptions, QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export type EnabledToggle = {
  enabled: boolean;
  isLoading: boolean;
  isError: boolean;
  isPending: boolean;
  toggle: (checked: boolean) => void;
};

type EnabledValue = { enabled: boolean };

/**
 * Generic hook for a boolean user-setting backed by a GET + PUT API pair.
 *
 * Encapsulates the optimistic-update pattern: on toggle the query cache is
 * updated immediately, and rolled back if the mutation fails.
 *
 * @param queryKey  - stable key used to read/write the cached value
 * @param useGet    - generated GET hook (e.g. `useGetAutoSubscribe`)
 * @param useSet    - generated SET/PUT hook (e.g. `useSetAutoSubscribe`)
 */
export function useEnabledToggle<T extends EnabledValue>({
  queryKey,
  useGet,
  useSet,
}: {
  queryKey: QueryKey;
  useGet: () => { data?: T; isLoading: boolean; isError: boolean };
  // AnyUseMutationOptions avoids fighting the generated hooks' complex overloaded signatures
  // while still keeping the return type well-typed via T.
  useSet: (options: { mutation: AnyUseMutationOptions }) => {
    mutate: (vars: { data: T }) => void;
    isPending: boolean;
  };
}): EnabledToggle {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGet();

  const { mutate, isPending } = useSet({
    mutation: {
      onMutate: async ({ data: newValue }: { data: T }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<T>(queryKey);
        queryClient.setQueryData<T>(queryKey, newValue);
        return { previous };
      },
      onError: (_err: unknown, _vars: unknown, context?: { previous?: T }) => {
        if (context?.previous !== undefined) {
          queryClient.setQueryData<T>(queryKey, context.previous);
        }
      },
      onSuccess: (result: T) => {
        queryClient.setQueryData<T>(queryKey, result);
      },
    },
  });

  return {
    enabled: data?.enabled ?? false,
    isLoading,
    isError,
    isPending,
    toggle: (checked: boolean) => mutate({ data: { enabled: checked } as T }),
  };
}
