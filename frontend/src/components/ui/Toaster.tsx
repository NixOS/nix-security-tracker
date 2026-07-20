import {
  Toaster as ArkToaster,
  type CreateToasterReturn,
  ToastCloseTrigger,
  ToastDescription,
  ToastRoot,
  ToastTitle,
} from "@ark-ui/react";
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-preact";
import styles from "./Toaster.module.css";

type ToasterProps = {
  toaster: CreateToasterReturn;
};

const typeToFg: Record<string, string> = {
  error: "text-white",
};

const typeToBg: Record<string, string> = {
  error: "bg-red",
  warning: "bg-yellow-light",
};

const typeToIcon: Record<string, typeof InfoIcon> = {
  error: CircleXIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  loading: Loader2Icon,
};

export function Toaster({ toaster }: ToasterProps) {
  return (
    <ArkToaster toaster={toaster} className={styles.group}>
      {(toast) => {
        const Icon = typeToIcon[toast.type ?? ""] ?? InfoIcon;
        return (
          <ToastRoot
            className={`rounded shadow column gap-small ${typeToFg[toast.type ?? ""]} ${typeToBg[toast.type ?? ""] ?? "bg-gray"} ${styles.root}`}
          >
            <ToastTitle className="row gap-small centered bold">
              <Icon size="1.2em" />
              {toast.title}
            </ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            <ToastCloseTrigger className={`row centered ${styles.closeTrigger}`}>
              <XIcon size="1em" />
            </ToastCloseTrigger>
          </ToastRoot>
        );
      }}
    </ArkToaster>
  );
}
