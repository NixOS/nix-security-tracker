import { UseMutationOptions, UseMutationResult } from "./types.js";
import { DefaultError, QueryClient } from "@tanstack/query-core";
//#region src/useMutation.d.ts
declare function useMutation<TData = unknown, TError = DefaultError, TVariables = void, TOnMutateResult = unknown>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, queryClient?: QueryClient): UseMutationResult<TData, TError, TVariables, TOnMutateResult>;
//#endregion
export { useMutation };
//# sourceMappingURL=useMutation.d.ts.map