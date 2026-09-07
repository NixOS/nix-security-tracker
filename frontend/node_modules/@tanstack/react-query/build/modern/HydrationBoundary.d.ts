import * as React from "react";
import { DehydratedState, HydrateOptions, OmitKeyof, QueryClient } from "@tanstack/query-core";
//#region src/HydrationBoundary.d.ts
interface HydrationBoundaryProps {
  state: DehydratedState | null | undefined;
  options?: OmitKeyof<HydrateOptions, 'defaultOptions'> & {
    defaultOptions?: OmitKeyof<Exclude<HydrateOptions['defaultOptions'], undefined>, 'mutations'>;
  };
  children?: React.ReactNode;
  queryClient?: QueryClient;
}
declare const HydrationBoundary: ({ children, options, state, queryClient }: HydrationBoundaryProps) => React.ReactElement;
//#endregion
export { HydrationBoundary, HydrationBoundaryProps };
//# sourceMappingURL=HydrationBoundary.d.ts.map