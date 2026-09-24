import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, FileText, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { RenderBlocks } from "@/blocks/render-blocks";
import { getPageBySlug, getSiteSettings } from "@/lib/cms/queries";
import { firstHeroSubtitle, splitTrailingCta } from "@/lib/cms/pages";
import { buildMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

/** About = the CMS page with slug "about" + legal facts from Site settings. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug("about", locale);
  if (!page) return {};
  return buildMetadata({
    locale,
    path: "/about",
    title: page.title,
    description: firstHeroSubtitle(page),
    seo: page.seo,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, settings, t] = await Promise.all([
    getPageBySlug("about", locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "about" }),
  ]);
  if (!page) notFound();

  const [body, closingCta] = splitTrailingCta(page.layout);
  const facts = [
    { icon: ShieldCheck, label: t("certification"), value: settings.certification, ltr: false },
    { icon: FileText, label: t("matriculeFiscal"), value: settings.matriculeFiscal, ltr: true },
    { icon: MapPin, label: settings.legalName, value: settings.address, ltr: false },
  ].filter((f) => f.value);

  return (
    <>
      <RenderBlocks blocks={body} locale={locale} />

      <section className="py-12">
        <Container>
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("legalTitle")}</h2>
          </Reveal>
          <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-3">
            {facts.map(({ icon: Icon, label, value, ltr }) => (
              <Reveal key={label}>
                <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-surface p-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="mt-1 whitespace-pre-line font-semibold text-foreground" dir={ltr ? "ltr" : undefined}>
                      {value}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <RenderBlocks blocks={closingCta} locale={locale} />
    </>
  );
}
