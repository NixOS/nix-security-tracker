"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
//#region src/IsRestoringProvider.ts
const IsRestoringContext = react.createContext(false);
const useIsRestoring = () => react.useContext(IsRestoringContext);
const IsRestoringProvider = IsRestoringContext.Provider;
//#endregion
exports.IsRestoringProvider = IsRestoringProvider;
exports.useIsRestoring = useIsRestoring;

//# sourceMappingURL=IsRestoringProvider.cjs.map