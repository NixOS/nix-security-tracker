import { ExternalLinkIcon } from "lucide-preact";
import type { ComponentChild } from "preact";
import { InlineIcon } from "./InlineIcon";

type ExternalLinkProps = {
  href: string;
  children: ComponentChild;
  className?: string;
  target?: string;
  rel?: string;
  title?: string;
};

export function ExternalLink({
  href,
  children,
  className,
  target = "_blank",
  rel = "noreferrer",
  title,
}: ExternalLinkProps) {
  return (
    <a href={href} target={target} rel={rel} className={className} title={title}>
      {children}
      <InlineIcon icon={ExternalLinkIcon} size=".9em" after />
    </a>
  );
}
