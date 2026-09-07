"use client";
import * as React from "react";
import { jsx } from "react/jsx-runtime";
//#region src/QueryClientProvider.tsx
const QueryClientContext = React.createContext(void 0);
const useQueryClient = (queryClient) => {
	const client = React.useContext(QueryClientContext);
	if (queryClient) return queryClient;
	if (!client) throw new Error("No QueryClient set, use QueryClientProvider to set one");
	return client;
};
const QueryClientProvider = ({ client, children }) => {
	React.useEffect(() => {
		client.mount();
		return () => {
			client.unmount();
		};
	}, [client]);
	return /* @__PURE__ */ jsx(QueryClientContext.Provider, {
		value: client,
		children
	});
};
//#endregion
export { QueryClientContext, QueryClientProvider, useQueryClient };

//# sourceMappingURL=QueryClientProvider.js.map