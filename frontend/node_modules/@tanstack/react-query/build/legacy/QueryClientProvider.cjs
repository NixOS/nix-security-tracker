"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/QueryClientProvider.tsx
const QueryClientContext = react.createContext(void 0);
const useQueryClient = (queryClient) => {
	const client = react.useContext(QueryClientContext);
	if (queryClient) return queryClient;
	if (!client) throw new Error("No QueryClient set, use QueryClientProvider to set one");
	return client;
};
const QueryClientProvider = ({ client, children }) => {
	react.useEffect(() => {
		client.mount();
		return () => {
			client.unmount();
		};
	}, [client]);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(QueryClientContext.Provider, {
		value: client,
		children
	});
};
//#endregion
exports.QueryClientContext = QueryClientContext;
exports.QueryClientProvider = QueryClientProvider;
exports.useQueryClient = useQueryClient;

//# sourceMappingURL=QueryClientProvider.cjs.map