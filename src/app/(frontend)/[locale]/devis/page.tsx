import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, Send, ArrowRight, ListChecks, SlidersHorizontal, MapPinned, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { siteSettings } from "@/content/site";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "devis" });
  return buildMetadata({ locale, path: "/devis", title: t("title"), description: t("subtitle") });
}

export default async function DevisPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "devis" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const steps = [
    { icon: ListChecks, titles: { fr: "Activité", ar: "النشاط", en: "Activity" } },
    { icon: SlidersHorizontal, titles: { fr: "Besoins techniques", ar: "الحاجيات الفنية", en: "Technical needs" } },
    { icon: MapPinned, titles: { fr: "Site & contact", ar: "الموقع والاتصال", en: "Site & contact" } },
    { icon: CheckCircle2, titles: { fr: "Récapitulatif", ar: "الملخّص", en: "Review" } },
  ] as const;

  const phoneClean = siteSettings.phone.replace(/\s/g, "");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="py-16 sm:py-20">
        <Container className="max-w-4xl">
          {/* Step preview / progress indicator */}
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const label = step.titles[locale] ?? step.titles.fr;
              return (
                <Reveal key={i}>
                  <div className="relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {tc("phase")} {i + 1}/4
                      </span>
                    </div>
                    <p className="font-semibold text-foreground">{label}</p>
                  </div>
                </Reveal>
              );
            })}
          </RevealGroup>

          {/* Coming soon note + direct contact */}
          <Reveal className="mt-10 rounded-3xl border border-primary-200 bg-primary-50 p-8 text-center dark:border-primary-900 dark:bg-primary-950/40">
            <Badge variant="accent" className="mb-4">
              {tc("comingSoon")}
            </Badge>
            <p className="mx-auto max-w-xl text-foreground">{t("comingSoonNote")}</p>
            <div className="mt-6 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="solar">
                <a href={`tel:${phoneClean}`}>
                  <Phone className="size-4" />
                  {siteSettings.phone}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`mailto:${siteSettings.email}`}>
                  <Mail className="size-4" />
                  {siteSettings.email}
                </a>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/contact">
                  <Send className="size-4" />
                  {tc("contactUs")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
