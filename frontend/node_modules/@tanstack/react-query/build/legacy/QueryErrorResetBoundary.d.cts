import * as React from "react";
//#region src/QueryErrorResetBoundary.d.ts
type QueryErrorResetFunction = () => void;
type QueryErrorIsResetFunction = () => boolean;
type QueryErrorClearResetFunction = () => void;
interface QueryErrorResetBoundaryValue {
  clearReset: QueryErrorClearResetFunction;
  isReset: QueryErrorIsResetFunction;
  reset: QueryErrorResetFunction;
}
declare const useQueryErrorResetBoundary: () => QueryErrorResetBoundaryValue;
type QueryErrorResetBoundaryFunction = (value: QueryErrorResetBoundaryValue) => React.ReactNode;
interface QueryErrorResetBoundaryProps {
  children: QueryErrorResetBoundaryFunction | React.ReactNode;
}
declare const QueryErrorResetBoundary: ({ children }: QueryErrorResetBoundaryProps) => import("react/jsx-runtime").JSX.Element;
//#endregion
export { QueryErrorClearResetFunction, QueryErrorIsResetFunction, QueryErrorResetBoundary, QueryErrorResetBoundaryFunction, QueryErrorResetBoundaryProps, QueryErrorResetBoundaryValue, QueryErrorResetFunction, useQueryErrorResetBoundary };
//# sourceMappingURL=QueryErrorResetBoundary.d.cts.map