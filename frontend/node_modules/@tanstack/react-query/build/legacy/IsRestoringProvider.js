"use client";
import * as React from "react";
//#region src/IsRestoringProvider.ts
const IsRestoringContext = React.createContext(false);
const useIsRestoring = () => React.useContext(IsRestoringContext);
const IsRestoringProvider = IsRestoringContext.Provider;
//#endregion
export { IsRestoringProvider, useIsRestoring };

//# sourceMappingURL=IsRestoringProvider.js.map