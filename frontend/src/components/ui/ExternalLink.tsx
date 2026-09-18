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
    <a
      href={href}
      target={target}
      rel={rel}
      className={`inline-row centered ${className}`}
      title={title}
    >
      {children}
      <ExternalLinkIcon size=".9em" style="margin-left: .2em" />
    </a>
  );
}
