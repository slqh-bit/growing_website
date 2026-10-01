import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteKey } from "@/sites/config";
import { getGroupMembers } from "@/lib/group";
import { brandOf, Logo } from "@/components/brand/logo";

/**
 * Footer band shared by every site (plan §3.3): "Member of <group>", the other
 * companies (linking to their sites) and a link to the /groupe page.
 * Hidden when Paramètres → Groupe → "Bandeau du groupe" is off.
 */
export async function GroupBand({ locale, site }: { locale: Locale; site: SiteKey }) {
  const [t, { group, members }] = await Promise.all([
    getTranslations({ locale, namespace: "group" }),
    getGroupMembers(locale),
  ]);
  const others = members.filter((m) => m.site.key !== site && m.origin);
  if (group.footerBand === false || others.length === 0) return null;

  return (
    <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-border bg-surface px-6 py-5 sm:flex-row">
      <p className="text-sm text-muted-foreground">{t("memberOf", { group: group.name })}</p>
      <ul className="flex flex-wrap items-center justify-center gap-6">
        {others.map((m) => (
          <li key={m.site.id}>
            <a
              href={`${m.origin}/${locale}`}
              className="block opacity-80 transition-opacity hover:opacity-100"
              title={t("visitSite", { company: m.site.companyName })}
            >
              <Logo brand={brandOf(m.site)} />
            </a>
          </li>
        ))}
      </ul>
      <Link href="/groupe" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
        {t("discover")}
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
      </Link>
    </div>
  );
}
