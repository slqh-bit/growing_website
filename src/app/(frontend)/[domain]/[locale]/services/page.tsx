import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getServices, getSite } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { childrenOf, servicePath, topLevel } from "@/lib/services";
import { Link } from "@/i18n/navigation";
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
  const [t, settings] = await Promise.all([getTranslations({ locale, namespace: "services" }), getSite(site, locale)]);
  return buildMetadata({
    site,
    locale,
    path: "/services",
    title: t("title"),
    description: settings.servicesIntro || t("subtitle"),
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ domain: string; locale: Locale }> }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: "services" }),
    getServices(site, locale),
    getSite(site, locale),
  ]);

  return (
    <>
      <PageHeader title={t("title")} subtitle={settings.servicesIntro || t("subtitle")} />
      <section className="py-16 sm:py-20">
        <Container>
          {/* Starts right under the header: CSS-only entrance so first paint never waits for hydration. */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topLevel(services).map((service, i) => {
              const subs = childrenOf(services, service.id);
              return (
                <Reveal key={service.slug} immediate delay={Math.min(i, 5) * 0.06} className="flex h-full flex-col gap-3">
                  <ServiceCard service={service} locale={locale} className="flex-1" headingLevel={2} />
                  {/* An area's sub-services, one click away. */}
                  {subs.length > 0 && (
                    <ul className="flex flex-wrap gap-2 px-1">
                      {subs.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={servicePath(sub, services)}
                            className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary-300 hover:text-brand"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
      <CtaBand locale={locale} site={site} />
    </>
  );
}
