import { getTranslations } from "next-intl/server";
import { ArrowUpRight, FileText, Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Site } from "@/payload-types";
import { getGroupMembers } from "@/lib/group";
import { brandHex } from "@/lib/theme";
import { telHref } from "@/lib/contact-links";
import { brandOf, Logo } from "@/components/brand/logo";
import { SmartLink } from "@/components/cms/smart-link";

/**
 * Footer of the group site: the group, then each company with its legal
 * identity (Sites → Entreprise) and links to its site and documents, then the
 * group's contacts. Company sites keep their own footer (./site-footer).
 */
export async function GroupFooter({ locale, settings }: { locale: Locale; settings: Site }) {
  const [t, tn, tg, { members }] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "group" }),
    getGroupMembers(locale),
  ]);
  const footer = settings.footer ?? {};
  const legalLinks = footer.legalLinks ?? [];
  const columns = members.length + 2;

  return (
    <footer className="mt-24 bg-[#060b18] text-white/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div
          className={`grid gap-10 md:grid-cols-2 ${columns >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          <div>
            <Logo brand={brandOf(settings)} tone="light" />
            {footer.tagline && <p className="mt-4 max-w-xs text-sm">{footer.tagline}</p>}
          </div>

          {members.map(({ site: member, origin }) => (
            <div key={member.id}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: brandHex(member.theme).light }}
                />
                {member.companyName}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>{member.legalName}</li>
                {member.matriculeFiscal && (
                  <li>
                    {t("matricule")}: <span dir="ltr">{member.matriculeFiscal}</span>
                  </li>
                )}
                {member.certification && <li>{member.certification}</li>}
                <li className="whitespace-pre-line">{member.address}</li>
                {origin && (
                  <>
                    <li className="pt-1">
                      <a
                        href={`${origin}/${locale}`}
                        className="inline-flex items-center gap-1.5 font-medium text-white/85 hover:text-white"
                      >
                        {tg("visitSite", { company: member.companyName })}
                        <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
                      </a>
                    </li>
                    <li>
                      <a
                        href={`${origin}/${locale}/documents`}
                        className="inline-flex items-center gap-1.5 hover:text-white"
                      >
                        <FileText className="size-3.5" aria-hidden />
                        {tn("documents")}
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-white">{t("contact")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0" aria-hidden />
                <a href={telHref(settings.phone)} className="hover:text-white" dir="ltr">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0" aria-hidden />
                <a
                  href={`mailto:${settings.email}`}
                  className="min-w-0 wrap-anywhere hover:text-white"
                >
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.companyName}. {t("rights")}
          </p>
          {legalLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legalLinks.map((item) => (
                <li key={item.id ?? item.href}>
                  <SmartLink href={item.href} className="transition-colors hover:text-white">
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
