import { GlobeCheckIcon, InboxIcon, type LucideIcon, PenToolIcon, Trash2Icon } from "lucide-preact";
import type { SuggestionStatusEnum } from "@/api/generated/models";

export function suggestionStatusIcon(status: SuggestionStatusEnum): LucideIcon {
  switch (status) {
    case "pending":
      return InboxIcon;
    case "accepted":
      return PenToolIcon;
    case "rejected":
      return Trash2Icon;
    case "published":
      return GlobeCheckIcon;
  }
}
