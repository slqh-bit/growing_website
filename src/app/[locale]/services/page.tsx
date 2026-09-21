import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { services } from "@/content/services";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { ServiceCard } from "@/components/sections/service-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16 sm:py-20">
        <Container>
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Reveal key={service.slug} className="h-full">
                <ServiceCard service={service} locale={locale} className="h-full" />
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
