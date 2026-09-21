import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { footerNav, legalNav } from "@/content/navigation";
import { services } from "@/content/services";
import { siteSettings } from "@/content/site";
import { t as tr } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { Logo } from "@/components/brand/logo";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface-muted/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {t("matricule")}: {siteSettings.matriculeFiscal}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("quickLinks")}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-600"
                  >
                    {tn(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
                    {tr(s.title, locale)}
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
                <span>{tr(siteSettings.address, locale)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary-600" aria-hidden />
                <a href={`tel:${siteSettings.phone.replace(/\s/g, "")}`} className="hover:text-primary-600" dir="ltr">
                  {siteSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary-600" aria-hidden />
                <a href={`mailto:${siteSettings.email}`} className="hover:text-primary-600">
                  {siteSettings.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Send className="size-4 shrink-0 text-primary-600" aria-hidden />
                <span dir="ltr">{siteSettings.telegram}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteSettings.companyName}. {t("rights")}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-primary-600">
                  {tn(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
