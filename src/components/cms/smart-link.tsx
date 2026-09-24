import { Link } from "@/i18n/navigation";

/** A CMS link group ({ label, href }); both may be empty when optional. */
export interface CtaLink {
  label?: string | null;
  href?: string | null;
}

/**
 * CMS links are either locale-agnostic paths ("/devis") — rendered with the
 * locale-aware Link — or absolute https URLs, opened as external links.
 */
export function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
