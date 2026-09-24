import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, Award, Heart, Eye, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { siteSettings } from "@/content/site";
import { t as tr } from "@/content/types";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/sections/page-header";
import { StatsBand } from "@/components/sections/stats-band";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({ locale, path: "/about", title: t("title"), description: t("subtitle") });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const values = [
    { icon: Award, key: "quality" },
    { icon: Heart, key: "proximity" },
    { icon: Eye, key: "transparency" },
  ] as const;

  return (
    <>
      <PageHeader eyebrow={siteSettings.certification} title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="primary" className="gap-1.5">
            <ShieldCheck className="size-3.5" aria-hidden />
            {siteSettings.certification}
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {tr(siteSettings.city, locale)}
          </Badge>
        </div>
      </PageHeader>

      {/* Story */}
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("storyTitle")}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-foreground/90">{t("story")}</p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("certification")}
                </dt>
                <dd className="mt-1 text-lg font-bold text-primary-600">{siteSettings.certification}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-5">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("matriculeFiscal")}
                </dt>
                <dd className="mt-1 text-lg font-bold text-foreground" dir="ltr">
                  {siteSettings.matriculeFiscal}
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="bg-solar relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
              <ShieldCheck className="size-16" aria-hidden />
              <p className="text-xl font-bold">{siteSettings.companyName}</p>
              <p className="max-w-xs text-sm text-white/85">{tr(siteSettings.address, locale)}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      <StatsBand locale={locale} />

      {/* Values */}
      <section className="py-20">
        <Container>
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("valuesTitle")}
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map(({ icon: Icon, key }) => (
              <Reveal key={key}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-semibold text-foreground">{t(`values.${key}`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`values.${key}Body`)}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
