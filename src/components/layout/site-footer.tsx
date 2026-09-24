import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getFooter, getServices, getSiteSettings } from "@/lib/cms/queries";
import { Logo } from "@/components/brand/logo";
import { SmartLink } from "@/components/cms/smart-link";

/** Footer: links from the Footer global, activities from Services, contacts from Site settings. */
export async function SiteFooter({ locale }: { locale: Locale }) {
  const [t, footer, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getFooter(locale),
    getServices(locale),
    getSiteSettings(locale),
  ]);
  const year = new Date().getFullYear();
  const quickLinks = footer.quickLinks ?? [];
  const legalLinks = footer.legalLinks ?? [];

  return (
    <footer className="mt-24 border-t border-border bg-surface-muted/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo name={settings.companyName} />
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
                      className="text-sm text-muted-foreground transition-colors hover:text-primary-600"
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
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-600"
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
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary-600" aria-hidden />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-primary-600" dir="ltr">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary-600" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-primary-600">
                  {settings.email}
                </a>
              </li>
              {settings.telegram && (
                <li className="flex items-center gap-2.5">
                  <Send className="size-4 shrink-0 text-primary-600" aria-hidden />
                  <span dir="ltr">{settings.telegram}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {settings.companyName}. {t("rights")}
          </p>
          {legalLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legalLinks.map((item) => (
                <li key={item.id ?? item.href}>
                  <SmartLink href={item.href} className="transition-colors hover:text-primary-600">
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
