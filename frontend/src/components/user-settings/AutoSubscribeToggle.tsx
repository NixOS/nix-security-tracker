import {
  getGetAutoSubscribeQueryKey,
  useGetAutoSubscribe,
  useSetAutoSubscribe,
} from "@/api/generated/endpoints";
import type { AutoSubscribe } from "@/api/generated/models";
import { useEnabledToggle } from "@/hooks/useEnabledToggle";
import { SettingsToggle } from "./SettingsToggle";

export function AutoSubscribeToggle() {
  const toggle = useEnabledToggle<AutoSubscribe>({
    queryKey: getGetAutoSubscribeQueryKey(),
    useGet: useGetAutoSubscribe,
    useSet: useSetAutoSubscribe,
  });

  return (
    <SettingsToggle
      label="Auto-subscribe to maintained packages"
      errorText="Failed to load subscription preferences."
      toggle={toggle}
    />
  );
}
