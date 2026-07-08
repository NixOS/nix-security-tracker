import {
  getGetEmailNotificationsQueryKey,
  useGetEmailNotifications,
  useSetEmailNotifications,
} from "@/api/generated/endpoints";
import type { EmailNotifications } from "@/api/generated/models";
import { useEnabledToggle } from "@/hooks/useEnabledToggle";
import { SettingsToggle } from "./SettingsToggle";

export function EmailNotificationsToggle() {
  const toggle = useEnabledToggle<EmailNotifications>({
    queryKey: getGetEmailNotificationsQueryKey(),
    useGet: useGetEmailNotifications,
    useSet: useSetEmailNotifications,
  });

  return (
    <SettingsToggle
      label="Email notifications"
      errorText="Failed to load email notification preferences."
      toggle={toggle}
    />
  );
}
