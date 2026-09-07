"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/QueryErrorResetBoundary.tsx
function createValue() {
	let isReset = false;
	return {
		clearReset: () => {
			isReset = false;
		},
		reset: () => {
			isReset = true;
		},
		isReset: () => {
			return isReset;
		}
	};
}
const QueryErrorResetBoundaryContext = react.createContext(createValue());
const useQueryErrorResetBoundary = () => react.useContext(QueryErrorResetBoundaryContext);
const QueryErrorResetBoundary = ({ children }) => {
	const [value] = react.useState(() => createValue());
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(QueryErrorResetBoundaryContext.Provider, {
		value,
		children: typeof children === "function" ? children(value) : children
	});
};
//#endregion
exports.QueryErrorResetBoundary = QueryErrorResetBoundary;
exports.useQueryErrorResetBoundary = useQueryErrorResetBoundary;

//# sourceMappingURL=QueryErrorResetBoundary.cjs.map