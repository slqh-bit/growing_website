import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Zap, Calendar, Users, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getProject, projectSlugs } from "@/content/projects";
import { getServiceByKey } from "@/content/services";
import { t as tr } from "@/content/types";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: tr(project.title, locale), description: tr(project.summary, locale) };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: "projects" });
  const service = getServiceByKey(project.activityKey);
  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : locale, {
    year: "numeric",
    month: "long",
  }).format(new Date(project.date));

  const specs = [
    { icon: Users, label: t("client"), value: t(`clientType.${project.clientType}`) },
    { icon: MapPin, label: t("region"), value: tr(project.region, locale) },
    ...(project.powerKwc != null
      ? [{ icon: Zap, label: t("power"), value: `${project.powerKwc} kWc` }]
      : []),
    { icon: Calendar, label: "Date", value: dateFmt },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-solar relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <Container className="relative py-16 sm:py-20">
          <Reveal className="flex flex-col gap-5 text-white">
            <Button asChild variant="outline" size="sm" className="w-fit border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/projects">
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t("title")}
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              {service && (
                <ServiceIcon
                  name={service.icon}
                  className="size-12 bg-white/15 text-white"
                  iconClassName="size-6"
                />
              )}
              <Badge variant="accent">{t(`clientType.${project.clientType}`)}</Badge>
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {tr(project.title, locale)}
            </h1>
            <p className="max-w-2xl text-lg text-white/90">{tr(project.summary, locale)}</p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <p className="text-lg leading-relaxed text-foreground/90">{tr(project.body, locale)}</p>
            </Reveal>
            {service && (
              <Reveal className="mt-8">
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary-300 hover:text-primary-600"
                >
                  <ServiceIcon name={service.icon} className="size-6 rounded-md" iconClassName="size-3.5" />
                  {tr(service.title, locale)}
                </Link>
              </Reveal>
            )}
          </div>

          <aside>
            <Reveal className="sticky top-24 rounded-2xl border border-border bg-surface-muted/60 p-6">
              <dl className="space-y-4">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div key={spec.label} className="flex items-center gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div>
                        <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                          {spec.label}
                        </dt>
                        <dd className="font-semibold text-foreground">{spec.value}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </Reveal>
          </aside>
        </Container>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
