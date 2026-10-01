/**
 * Primary navigation — mirrors the Payload `Navigation` global (devplan §4.8).
 * `labelKey` resolves against the next-intl "nav" message namespace.
 */
export interface NavItem {
  href: string;
  labelKey: string;
  /** Not yet built — rendered as a "Coming soon" placeholder. */
  comingSoon?: boolean;
}

export const mainNav: NavItem[] = [
  { href: "/services", labelKey: "services" },
  { href: "/projects", labelKey: "projects" },
  { href: "/about", labelKey: "about" },
  { href: "/faq", labelKey: "faq" },
  { href: "/blog", labelKey: "blog", comingSoon: true },
  { href: "/contact", labelKey: "contact" },
];

export const footerNav: NavItem[] = [
  { href: "/services", labelKey: "services" },
  { href: "/projects", labelKey: "projects" },
  { href: "/about", labelKey: "about" },
  { href: "/faq", labelKey: "faq" },
  { href: "/contact", labelKey: "contact" },
  { href: "/devis", labelKey: "devis" },
  { href: "/groupe", labelKey: "group" },
  { href: "/documents", labelKey: "documents" },
];

export const legalNav: NavItem[] = [
  { href: "/mentions-legales", labelKey: "legalNotice" },
  { href: "/politique-confidentialite", labelKey: "privacy" },
];
