import type { Locale } from "@/i18n/routing";
import type { SiteKey } from "@/sites/config";
import { getSites } from "@/lib/cms/queries";
import { onSharedDevAddress } from "@/lib/group";

/**
 * Development only, on an address the sites share (the machine's IP address
 * from another device): the sites, to switch between them. The choice is
 * remembered (`?site=`, middleware), so this is also the way back to the
 * group site. Never rendered in production or on localhost.
 */
export async function DevSiteSwitcher({ site, locale }: { site: SiteKey; locale: Locale }) {
  if (!(await onSharedDevAddress())) return null;
  const sites = await getSites(locale);
  // The group first, then its companies.
  const ordered = [...sites].sort((a, b) => Number(b.key === "group") - Number(a.key === "group"));

  return (
    <nav
      aria-label="Sites"
      className="fixed inset-x-0 bottom-3 z-50 mx-auto flex w-fit gap-1 rounded-full border border-border bg-surface/95 p-1 text-xs font-medium shadow-lg backdrop-blur"
    >
      {ordered.map((s) => (
        <a
          key={s.key}
          href={`/${locale}?site=${s.key}`}
          aria-current={s.key === site ? "page" : undefined}
          title={s.companyName}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            s.key === site ? "bg-primary-600 text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {/* Phones: the monogram (the full names don't fit side by side). */}
          <span className="sm:hidden">{s.monogram?.trim() || s.companyName.slice(0, 2).toUpperCase()}</span>
          <span className="hidden sm:inline">{s.companyName}</span>
        </a>
      ))}
    </nav>
  );
}
