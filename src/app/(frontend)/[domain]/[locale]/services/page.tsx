import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getServices } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { ServiceCard } from "@/components/sections/service-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const t = await getTranslations({ locale, namespace: "services" });
  return buildMetadata({ site, locale, path: "/services", title: t("title"), description: t("subtitle") });
}

export default async function ServicesPage({ params }: { params: Promise<{ domain: string; locale: Locale }> }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, services] = await Promise.all([
    getTranslations({ locale, namespace: "services" }),
    getServices(site, locale),
  ]);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16 sm:py-20">
        <Container>
          {/* Starts right under the header: CSS-only entrance so first paint never waits for hydration. */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} immediate delay={Math.min(i, 5) * 0.06} className="h-full">
                <ServiceCard service={service} locale={locale} className="h-full" headingLevel={2} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand locale={locale} site={site} />
    </>
  );
}
