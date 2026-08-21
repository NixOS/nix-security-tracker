import { GlobeCheckIcon, InboxIcon, PenToolIcon, Trash2Icon } from "lucide-preact";
import type { SuggestionStatusEnum } from "@/api/generated/models";

type Props = {
  status: SuggestionStatusEnum;
  size?: string;
};

export function SuggestionStatusIcon({ status, size }: Props) {
  switch (status) {
    case "pending":
      return <InboxIcon size={size} />;
    case "accepted":
      return <PenToolIcon size={size} />;
    case "rejected":
      return <Trash2Icon size={size} />;
    case "published":
      return <GlobeCheckIcon size={size} />;
  }
}
