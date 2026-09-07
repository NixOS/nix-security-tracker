import { Mutation, MutationFilters, MutationState, QueryClient } from "@tanstack/query-core";
//#region src/useMutationState.d.ts
declare function useIsMutating(filters?: MutationFilters, queryClient?: QueryClient): number;
type MutationTypeFromResult<TResult> = [TResult] extends [MutationState<infer TData, infer TError, infer TVariables, infer TOnMutateResult>] ? Mutation<TData, TError, TVariables, TOnMutateResult> : Mutation;
type MutationStateOptions<TResult = MutationState, TMutation extends Mutation<any, any, any, any> = MutationTypeFromResult<TResult>> = {
  filters?: MutationFilters;
  select?: (mutation: TMutation) => TResult;
};
declare function useMutationState<TResult = MutationState, TMutation extends Mutation<any, any, any, any> = MutationTypeFromResult<TResult>>(options?: MutationStateOptions<TResult, TMutation>, queryClient?: QueryClient): Array<TResult>;
//#endregion
export { useIsMutating, useMutationState };
//# sourceMappingURL=useMutationState.d.ts.map