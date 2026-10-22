import { ExternalLinkIcon } from "lucide-preact";
import type { ComponentChild } from "preact";

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
      <span className="no-line-breaks">
        {"⁠"}
        <ExternalLinkIcon size=".9em" style="margin-left: .2em; vertical-align: -0.05em;" />
      </span>
    </a>
  );
}
