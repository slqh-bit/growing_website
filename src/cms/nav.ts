import { t3 } from "./labels";
import type { Id } from "./workspace";

type Label = ReturnType<typeof t3>;

export interface NavChild {
  key: string;
  href: string;
  label: Label;
}

export interface NavEntry extends NavChild {
  /** lucide-react icon name. */
  icon: "Home" | "Inbox" | "FileText" | "Zap" | "Images" | "Library" | "Building2" | "Settings";
  /** Live counter shown next to the label. */
  badge?: "newRequests";
  children?: NavChild[];
}

const collection = (slug: string) => `/admin/collections/${slug}`;

/**
 * The admin sidebar: seven entries for the staff of a company, plus Settings
 * (domains, redirects, users, group) for administrators. Quote documents and
 * attachments have no entry: they are reached from their request.
 */
export function navEntries({ isAdmin, siteId }: { isAdmin: boolean; siteId: Id | null }): NavEntry[] {
  const entries: NavEntry[] = [
    { key: "home", href: "/admin", icon: "Home", label: t3("Accueil", "Home", "الرئيسية") },
    {
      key: "requests",
      href: collection("devis-requests"),
      icon: "Inbox",
      label: t3("Demandes", "Requests", "الطلبات"),
      badge: "newRequests",
      children: [
        { key: "forms", href: collection("devis-forms"), label: t3("Formulaires", "Forms", "الاستمارات") },
      ],
    },
    { key: "pages", href: collection("pages"), icon: "FileText", label: t3("Pages", "Pages", "الصفحات") },
    { key: "services", href: collection("services"), icon: "Zap", label: t3("Services", "Services", "الخدمات") },
    { key: "projects", href: collection("projects"), icon: "Images", label: t3("Réalisations", "Projects", "الإنجازات") },
    {
      key: "library",
      href: collection("faq"),
      icon: "Library",
      label: t3("Bibliothèque", "Library", "المكتبة"),
      children: [
        { key: "faq", href: collection("faq"), label: t3("Questions fréquentes", "FAQ", "الأسئلة الشائعة") },
        { key: "team", href: collection("team"), label: t3("Équipe", "Team", "الفريق") },
        { key: "partners", href: collection("partners"), label: t3("Partenaires", "Partners", "الشركاء") },
        { key: "media", href: collection("media"), label: t3("Médias", "Media", "الوسائط") },
        {
          key: "company-documents",
          href: collection("company-documents"),
          label: t3("Documents administratifs", "Company documents", "الوثائق الإدارية"),
        },
      ],
    },
  ];

  if (siteId !== null) {
    entries.push({
      key: "company",
      href: `${collection("sites")}/${siteId}`,
      icon: "Building2",
      label: t3("Mon entreprise", "My company", "شركتي"),
    });
  }

  if (isAdmin) {
    entries.push({
      key: "settings",
      href: collection("sites"),
      icon: "Settings",
      label: t3("Réglages", "Settings", "الإعدادات"),
      children: [
        { key: "sites", href: collection("sites"), label: t3("Sites et domaines", "Sites and domains", "المواقع والنطاقات") },
        { key: "redirects", href: collection("redirects"), label: t3("Redirections", "Redirects", "إعادة التوجيه") },
        { key: "users", href: collection("users"), label: t3("Utilisateurs", "Users", "المستخدمون") },
        { key: "group", href: "/admin/globals/group", label: t3("Groupe", "Group", "المجموعة") },
      ],
    });
  }

  return entries;
}

/** Whether `pathname` is `href` or a page under it (Home only matches itself). */
export function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
