import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, Clock, FileCheck2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getServices, getSiteSettings } from "@/lib/cms/queries";
import { activityOptions } from "@/lib/devis/options";
import { buildMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/motion/reveal";
import { DevisForm } from "@/components/devis/devis-form";
import type { ActivityChoice } from "@/components/devis/steps";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "devis" });
  return buildMetadata({ locale, path: "/devis", title: t("title"), description: t("subtitle") });
}

/** Devis (quote request) page — the conversion engine (devplan §6). */
export default async function DevisPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: "devis" }),
    getServices(locale),
    getSiteSettings(locale),
  ]);

  // All five activities are always offered; the CMS service (if any) supplies
  // the editable title, description and icon.
  const activities: ActivityChoice[] = activityOptions.map((option) => {
    const service = services.find((s) => s.activityKey === option.value);
    return {
      value: option.value,
      title: service?.title ?? option.label[locale],
      description: service?.shortDescription ?? "",
      icon: service?.icon ?? "Sun",
    };
  });

  const digits = (value: string) => value.replace(/[^\d+]/g, "");
  const reasons = [
    { icon: FileCheck2, text: t("aside.free") },
    { icon: Clock, text: t("aside.fast") },
    { icon: ShieldCheck, text: t("aside.certified") },
    { icon: BadgeCheck, text: t("aside.subsidies") },
  ];

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DevisForm activities={activities} locale={locale} privacyHref={`/${locale}/politique-confidentialite`} />
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
                  href={`tel:${digits(settings.phone)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
                  dir="ltr"
                >
                  <Phone className="size-4" aria-hidden />
                  {settings.phone}
                </a>
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${digits(settings.whatsapp).replace(/^\+/, "")}`}
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
