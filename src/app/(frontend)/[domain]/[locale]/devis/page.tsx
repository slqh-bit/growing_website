import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, Clock, FileCheck2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getServices, getSite } from "@/lib/cms/queries";
import { activityOptions } from "@/lib/devis/options";
import { buildMetadata } from "@/lib/metadata";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/motion/reveal";
import { DevisForm } from "@/components/devis/devis-form";
import type { ActivityChoice } from "@/components/devis/steps";
import { telHref, whatsappHref } from "@/lib/contact-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const t = await getTranslations({ locale, namespace: "devis" });
  return buildMetadata({ site, locale, path: "/devis", title: t("title"), description: t("subtitle") });
}

/** Devis (quote request) page — the conversion engine (devplan §6). */
export default async function DevisPage({ params }: { params: Promise<{ domain: string; locale: Locale }> }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: "devis" }),
    getServices(site, locale),
    getSite(site, locale),
  ]);

  // The activities offered are those of this site's services that are linked
  // to the form (Services → Activité), in the services' order; the service
  // supplies the editable title, description and icon. Legacy values (BT/MT,
  // merged into "Installations raccordées") stay valid for older requests only.
  const activities: ActivityChoice[] = services.flatMap((service) => {
    const option = activityOptions.find((o) => o.value === service.activityKey);
    return option
      ? [{ value: option.value, title: service.title, description: service.shortDescription, icon: service.icon }]
      : [];
  });

  // The certification lines only apply to a certified site (Sites → Certification).
  const reasons = [
    { icon: FileCheck2, text: t("aside.free") },
    { icon: Clock, text: t("aside.fast") },
    ...(settings.certification
      ? [
          { icon: ShieldCheck, text: t("aside.certified") },
          { icon: BadgeCheck, text: t("aside.subsidies") },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activities.length > 0 ? (
              <DevisForm activities={activities} locale={locale} privacyHref={`/${locale}/politique-confidentialite`} />
            ) : (
              // No service of this site is linked to the form yet (plan Phase 5).
              <Reveal className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
                <p className="text-foreground">{t("unavailable")}</p>
                <Button asChild variant="solar" className="mt-6">
                  <Link href="/contact">{t("unavailableCta")}</Link>
                </Button>
              </Reveal>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <Reveal className="rounded-3xl border border-border bg-surface-muted/60 p-6">
              <h2 className="text-lg font-bold text-foreground">{t("aside.title")}</h2>
              <ul className="mt-4 space-y-3">
                {reasons.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-foreground/90">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="pt-1.5">{text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="bg-solar rounded-3xl p-6 text-white shadow-md">
              <p className="font-semibold">{t("aside.preferCall")}</p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={telHref(settings.phone)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
                  dir="ltr"
                >
                  <Phone className="size-4" aria-hidden />
                  {settings.phone}
                </a>
                {settings.whatsapp && (
                  <a
                    href={whatsappHref(settings.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                )}
              </div>
            </Reveal>
          </aside>
        </Container>
      </section>
    </>
  );
}
