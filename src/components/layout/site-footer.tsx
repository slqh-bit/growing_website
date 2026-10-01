import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteKey } from "@/sites/config";
import { getServices, getSite } from "@/lib/cms/queries";
import { brandOf, Logo } from "@/components/brand/logo";
import { SmartLink } from "@/components/cms/smart-link";
import { GroupBand } from "@/components/layout/group-band";
import { telHref } from "@/lib/contact-links";
import { topLevel } from "@/lib/services";

/** Footer: links and tagline (Sites → Pied de page), activities from Services, contacts from the site. */
export async function SiteFooter({ locale, site }: { locale: Locale; site: SiteKey }) {
  const [t, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getServices(site, locale),
    getSite(site, locale),
  ]);
  const footer = settings.footer ?? {};
  const year = new Date().getFullYear();
  const quickLinks = footer.quickLinks ?? [];
  const legalLinks = footer.legalLinks ?? [];

  return (
    <footer className="mt-24 border-t border-border bg-surface-muted/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo brand={brandOf(settings)} />
            {footer.tagline && <p className="mt-4 max-w-xs text-sm text-muted-foreground">{footer.tagline}</p>}
            <p className="mt-4 text-xs text-muted-foreground">
              {t("matricule")}: <span dir="ltr">{settings.matriculeFiscal}</span>
            </p>
          </div>

          {/* Quick links */}
          {quickLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t("quickLinks")}</h3>
              <ul className="mt-4 space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.id ?? item.href}>
                    <SmartLink
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {item.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Activities */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("activities")}</h3>
            <ul className="mt-4 space-y-2.5">
              {topLevel(services).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("contact")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand" aria-hidden />
                <a href={telHref(settings.phone)} className="hover:text-brand" dir="ltr">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand" aria-hidden />
                {/* Long addresses wrap instead of widening the 4-column grid at lg. */}
                <a href={`mailto:${settings.email}`} className="min-w-0 wrap-anywhere hover:text-brand">
                  {settings.email}
                </a>
              </li>
              {settings.telegram && (
                <li className="flex items-center gap-2.5">
                  <Send className="size-4 shrink-0 text-brand" aria-hidden />
                  <span dir="ltr">{settings.telegram}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <GroupBand locale={locale} site={site} />

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {settings.companyName}. {t("rights")}
          </p>
          {legalLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legalLinks.map((item) => (
                <li key={item.id ?? item.href}>
                  <SmartLink href={item.href} className="transition-colors hover:text-brand">
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
