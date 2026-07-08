import { useV1ServerInfoRetrieve } from "@/api/generated/endpoints";
import type { ServerInfo } from "@/api/generated/models";

export function useServerInfo(): ServerInfo | undefined {
  const { data } = useV1ServerInfoRetrieve({
    query: {
      staleTime: Infinity, // server info doesn't change during a session
    },
  });

  return data;
}
