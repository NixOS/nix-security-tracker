import { UseMutationOptions } from "./types.js";
import { DefaultError, WithRequired } from "@tanstack/query-core";
//#region src/mutationOptions.d.ts
declare function mutationOptions<TData = unknown, TError = DefaultError, TVariables = void, TOnMutateResult = unknown>(options: WithRequired<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, 'mutationKey'>): WithRequired<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, 'mutationKey'>;
declare function mutationOptions<TData = unknown, TError = DefaultError, TVariables = void, TOnMutateResult = unknown>(options: Omit<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, 'mutationKey'>): Omit<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, 'mutationKey'>;
//#endregion
export { mutationOptions };
//# sourceMappingURL=mutationOptions.d.ts.map