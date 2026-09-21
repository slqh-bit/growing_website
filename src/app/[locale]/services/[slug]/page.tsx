import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { services, getService, serviceSlugs } from "@/content/services";
import { getProjectsByActivity } from "@/content/projects";
import { t as tr } from "@/content/types";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectCard } from "@/components/sections/project-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    serviceSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: tr(service.title, locale),
    description: tr(service.shortDescription, locale),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getService(slug);
  if (!service) notFound();

  const t = await getTranslations({ locale, namespace: "services" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const relatedProjects = getProjectsByActivity(service.activityKey);
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <PageHeader eyebrow={t("title")} title={tr(service.title, locale)} subtitle={tr(service.shortDescription, locale)}>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button asChild variant="solar">
            <Link href="/devis">
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
          {/* Body + process */}
          <div className="lg:col-span-2">
            <Reveal className="flex items-start gap-4">
              <ServiceIcon name={service.icon} />
              <p className="text-lg leading-relaxed text-foreground/90">{tr(service.body, locale)}</p>
            </Reveal>

            {/* Process */}
            <div className="mt-14">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("processTitle")}</h2>
              <RevealGroup className="mt-8 space-y-4">
                {service.process.map((step, i) => (
                  <Reveal key={i}>
                    <div className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
                      <span className="bg-solar inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">{tr(step.title, locale)}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tr(step.description, locale)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </RevealGroup>
            </div>
          </div>

          {/* Benefits sidebar */}
          <aside className="lg:col-span-1">
            <Reveal className="sticky top-24 rounded-2xl border border-border bg-surface-muted/60 p-6">
              <h2 className="text-lg font-bold text-foreground">{t("benefitsTitle")}</h2>
              <ul className="mt-4 space-y-3">
                {tr(service.benefits, locale).map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button asChild variant="solar" className="mt-6 w-full">
                <Link href="/devis">{tc("requestQuote")}</Link>
              </Button>
            </Reveal>
          </aside>
        </Container>
      </section>

      {/* Related projects */}
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

      {/* Other services */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("allServices")}</h2>
          <RevealGroup className="mt-8 flex flex-wrap gap-3">
            {others.map((s) => (
              <Reveal key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary-300 hover:text-primary-600"
                >
                  <ServiceIcon name={s.icon} className="size-6 rounded-md" iconClassName="size-3.5" />
                  {tr(s.title, locale)}
                </Link>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
