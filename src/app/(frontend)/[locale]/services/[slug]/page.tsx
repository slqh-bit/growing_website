import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Faq } from "@/payload-types";
import { getProjectsByService, getServiceBySlug, getServices } from "@/lib/cms/queries";
import { populated } from "@/lib/cms/media";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbLd, JsonLd, serviceLd } from "@/lib/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CmsImage } from "@/components/cms/cms-image";
import { RichText } from "@/components/cms/rich-text";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectCard } from "@/components/sections/project-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

type Params = Promise<{ locale: Locale; slug: string }>;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug, locale);
  if (!service) return {};
  return buildMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: service.title,
    description: service.shortDescription,
    image: service.heroImage,
    seo: service.seo,
  });
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = await getServiceBySlug(slug, locale);
  if (!service) notFound();

  const [t, tc, tn, relatedProjects, allServices] = await Promise.all([
    getTranslations({ locale, namespace: "services" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getProjectsByService(service.id, locale),
    getServices(locale),
  ]);
  const others = allServices.filter((s) => s.id !== service.id);
  const benefits = service.benefits ?? [];
  const steps = service.process ?? [];
  const faqs = (service.faqRefs ?? []).map((f) => populated<Faq>(f)).filter((f): f is Faq => f !== null);

  return (
    <>
      <JsonLd data={serviceLd(service, locale)} />
      <JsonLd
        data={breadcrumbLd(
          [
            { name: tn("home"), path: "" },
            { name: t("title"), path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ],
          locale,
        )}
      />
      <PageHeader eyebrow={t("title")} title={service.title} subtitle={service.shortDescription}>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button asChild variant="solar">
            <Link href={`/devis?activite=${service.activityKey}`}>
              {t("requestForActivity")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/services">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t("allServices")}
            </Link>
          </Button>
        </div>
      </PageHeader>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {service.heroImage && (
              <Reveal immediate className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-lg">
                <CmsImage media={service.heroImage} size="hero" fill priority sizes="(min-width: 1024px) 66vw, 100vw" />
              </Reveal>
            )}
            {/* Above the fold (LCP on mobile): CSS-only entrance, no hydration wait. */}
            <Reveal immediate delay={0.05} className="flex items-start gap-4">
              <ServiceIcon name={service.icon} className="shrink-0" />
              <RichText data={service.body} locale={locale} />
            </Reveal>

            {steps.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("processTitle")}</h2>
                {/* Often above the fold on mobile when the intro is short — see above. */}
                <div className="mt-8 space-y-4">
                  {steps.map((step, i) => (
                    <Reveal key={step.id ?? i} immediate delay={0.1 + Math.min(i, 5) * 0.06}>
                      <div className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <span className="bg-solar inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                          {step.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {faqs.length > 0 && (
              <div className="mt-14">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">FAQ</h2>
                <Accordion items={faqs.map((f) => ({ id: String(f.id), question: f.question, answer: f.answer }))} />
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <Reveal className="sticky top-24 rounded-2xl border border-border bg-surface-muted/60 p-6">
              {benefits.length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-foreground">{t("benefitsTitle")}</h2>
                  <ul className="mt-4 space-y-3">
                    {benefits.map((benefit, i) => (
                      <li key={benefit.id ?? i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                        {benefit.text}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Button asChild variant="solar" className="mt-6 w-full">
                <Link href={`/devis?activite=${service.activityKey}`}>{tc("requestQuote")}</Link>
              </Button>
            </Reveal>
          </aside>
        </Container>
      </section>

      {relatedProjects.length > 0 && (
        <section className="border-t border-border bg-surface-muted/40 py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{tc("viewProjects")}</h2>
            <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <Reveal key={project.slug} className="h-full">
                  <ProjectCard project={project} locale={locale} className="h-full" />
                </Reveal>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}

      {others.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("allServices")}</h2>
            <RevealGroup className="mt-8 flex flex-wrap gap-3">
              {others.map((s) => (
                <Reveal key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary-300 hover:text-brand"
                  >
                    <ServiceIcon name={s.icon} className="size-6 rounded-md" iconClassName="size-3.5" />
                    {s.title}
                  </Link>
                </Reveal>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}

      <CtaBand locale={locale} />
    </>
  );
}
