"use client";

import { Building2, ChevronDown, FileText, Home, Images, Inbox, Library, Settings, Zap, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isActiveHref, type NavEntry } from "@/cms/nav";

export interface NavLinkItem {
  key: string;
  href: string;
  icon: NavEntry["icon"];
  label: string;
  /** Shown as a badge when above zero. */
  count: number;
  children?: { key: string; href: string; label: string }[];
}

const icons: Record<NavEntry["icon"], LucideIcon> = { Home, Inbox, FileText, Zap, Images, Library, Building2, Settings };

export function NavLinks({ items }: { items: NavLinkItem[] }) {
  const pathname = usePathname() ?? "";
  // Settings sits apart from the daily entries.
  return (
    <ul className="ws-nav__list">
      {items.map((item) => (
        <li key={item.key} className={item.key === "settings" ? "ws-nav__item ws-nav__item--apart" : "ws-nav__item"}>
          <Entry item={item} pathname={pathname} />
        </li>
      ))}
    </ul>
  );
}

function Entry({ item, pathname }: { item: NavLinkItem; pathname: string }) {
  const Icon = icons[item.icon];
  const children = item.children ?? [];
  const childActive = children.some((child) => isActiveHref(pathname, child.href));
  // A group has no page of its own: its link is its first child's.
  const isGroup = children.some((child) => child.href === item.href);
  const [toggled, setToggled] = useState<boolean | null>(null);

  if (!isGroup) {
    const active = isActiveHref(pathname, item.href);
    return (
      <>
        <Link
          href={item.href}
          className={active ? "ws-nav__link ws-nav__link--active" : "ws-nav__link"}
          aria-current={active ? "page" : undefined}
          prefetch={false}
        >
          <Icon size={18} aria-hidden="true" />
          <span className="ws-nav__label">{item.label}</span>
          {item.count > 0 && <span className="ws-nav__count">{item.count}</span>}
        </Link>
        {(active || childActive) && <Children items={children} pathname={pathname} />}
      </>
    );
  }

  const open = toggled ?? childActive;
  return (
    <>
      <button
        type="button"
        className={childActive ? "ws-nav__link ws-nav__link--within" : "ws-nav__link"}
        aria-expanded={open}
        onClick={() => setToggled(!open)}
      >
        <Icon size={18} aria-hidden="true" />
        <span className="ws-nav__label">{item.label}</span>
        <ChevronDown size={16} aria-hidden="true" className={open ? "ws-nav__chevron ws-nav__chevron--open" : "ws-nav__chevron"} />
      </button>
      {open && <Children items={children} pathname={pathname} />}
    </>
  );
}

function Children({ items, pathname }: { items: NonNullable<NavLinkItem["children"]>; pathname: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="ws-nav__children">
      {items.map((child) => {
        const active = isActiveHref(pathname, child.href);
        return (
          <li key={child.key}>
            <Link
              href={child.href}
              className={active ? "ws-nav__sublink ws-nav__sublink--active" : "ws-nav__sublink"}
              aria-current={active ? "page" : undefined}
              prefetch={false}
            >
              {child.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
