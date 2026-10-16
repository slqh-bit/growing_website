"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WORKSPACE_COOKIE, type Id } from "@/cms/workspace";

interface SwitcherSite {
  id: Id;
  name: string;
  monogram: string;
  color: string | null;
}

const badgeStyle = (site: SwitcherSite): CSSProperties | undefined =>
  site.color ? { background: site.color } : undefined;

/**
 * The company the admin is working on. With several companies it opens a menu;
 * choosing one stores it in a cookie (read by the server on every request) and
 * returns to the home screen, since the open document belongs to the other one.
 */
export function WorkspaceSwitcher({ sites, currentId, label }: { sites: SwitcherSite[]; currentId: Id; label: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = sites.find((site) => site.id === currentId) ?? sites[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!current) return null;

  const choose = (id: Id) => {
    if (id === currentId) return setOpen(false);
    document.cookie = `${WORKSPACE_COOKIE}=${encodeURIComponent(String(id))}; path=/; max-age=31536000; samesite=lax`;
    // A full reload on purpose: the admin's server-rendered nav and lists follow the cookie.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin");
  };

  const identity = (
    <>
      <span className="ws-switcher__badge" style={badgeStyle(current)} aria-hidden="true">
        {current.monogram}
      </span>
      <span className="ws-switcher__name">{current.name}</span>
    </>
  );

  if (sites.length < 2) return <div className="ws-switcher ws-switcher__current">{identity}</div>;

  return (
    <div className="ws-switcher" ref={root}>
      <button
        type="button"
        className="ws-switcher__current ws-switcher__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label} — ${current.name}`}
        onClick={() => setOpen(!open)}
      >
        {identity}
        <ChevronsUpDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <ul className="ws-switcher__menu" role="menu" aria-label={label}>
          {sites.map((site) => (
            <li key={site.id} role="none">
              <button type="button" role="menuitemradio" aria-checked={site.id === currentId} onClick={() => choose(site.id)}>
                <span className="ws-switcher__badge" style={badgeStyle(site)} aria-hidden="true">
                  {site.monogram}
                </span>
                <span className="ws-switcher__name">{site.name}</span>
                {site.id === currentId && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
