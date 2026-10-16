import { NavHamburger, NavWrapper } from "@payloadcms/next/client";
import { Logout } from "@payloadcms/ui";
import type { ServerProps } from "payload";
import { isAdmin } from "@/cms/access";
import { navEntries } from "@/cms/nav";
import { accentStyle, adminLang, currentWorkspace, type Label } from "../shared";
import { NavLinks, type NavLinkItem } from "./nav-links";
import { WorkspaceSwitcher } from "./workspace-switcher";

const text = {
  switcher: { fr: "Changer d'entreprise", en: "Switch company", ar: "تغيير الشركة" },
  menu: { fr: "Menu principal", en: "Main menu", ar: "القائمة الرئيسية" },
} satisfies Record<string, Label>;

/**
 * Admin sidebar: the company being worked on, then seven entries (plus
 * Settings for administrators) instead of one link per collection.
 */
export async function AdminNav({ user, payload, i18n }: ServerProps) {
  if (!user) return null;
  const lang = adminLang(i18n);
  // Not every screen hands the sidebar its request: the cookie is read from Next instead.
  const { current, sites } = await currentWorkspace(payload, user);

  const newRequests = current
    ? (
        await payload.count({
          collection: "devis-requests",
          where: { and: [{ site: { equals: current.id } }, { status: { equals: "nouveau" } }] },
          overrideAccess: false,
          user,
        })
      ).totalDocs
    : 0;

  const items: NavLinkItem[] = navEntries({ isAdmin: isAdmin(user), siteId: current?.id ?? null }).map((entry) => ({
    key: entry.key,
    href: entry.href,
    icon: entry.icon,
    label: entry.label[lang],
    count: entry.badge === "newRequests" ? newRequests : 0,
    children: entry.children?.map((child) => ({ key: child.key, href: child.href, label: child.label[lang] })),
  }));

  return (
    <NavWrapper baseClass="nav">
      <nav className="nav__wrap ws-nav" aria-label={text.menu[lang]} style={accentStyle(current)}>
        {current && <WorkspaceSwitcher sites={sites} currentId={current.id} label={text.switcher[lang]} />}
        <NavLinks items={items} />
        <div className="nav__controls">
          <Logout />
        </div>
      </nav>
      <div className="nav__header">
        <div className="nav__header-content">
          <NavHamburger baseClass="nav" />
        </div>
      </div>
    </NavWrapper>
  );
}
