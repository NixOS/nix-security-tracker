import { createToaster } from "@ark-ui/react";

// How long toasts stay visible
const DURATION_MS = 10_000;

// Shared app-wide toaster instance.
export const toaster = createToaster({
  placement: "bottom-end",
  duration: DURATION_MS,
});
