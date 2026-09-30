import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Zap, Calendar, Users, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import type { Service } from "@/payload-types";
import { getProjectBySlug, getSite } from "@/lib/cms/queries";
import { populated } from "@/lib/cms/media";
import { buildMetadata, siteOrigin } from "@/lib/metadata";
import { breadcrumbLd, JsonLd } from "@/lib/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CmsImage } from "@/components/cms/cms-image";
import { RichText } from "@/components/cms/rich-text";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

type Params = Promise<{ domain: string; locale: Locale; slug: string }>;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale, slug } = await routeContext(params);
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  return buildMetadata({
    site,
    locale,
    path: `/projects/${project.slug}`,
    title: project.title,
    description: project.summary,
    image: project.coverImage,
    seo: project.seo,
  });
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { site, locale, slug } = await routeContext(params);
  setRequestLocale(locale);

  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();

  const [t, tn, settings] = await Promise.all([
    getTranslations({ locale, namespace: "projects" }),
    getTranslations({ locale, namespace: "nav" }),
    getSite(site, locale),
  ]);
  const service = populated<Service>(project.activity);
  const gallery = (project.gallery ?? []).filter((m) => typeof m === "object");
  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : locale, {
    year: "numeric",
    month: "long",
  }).format(new Date(project.date));

  const specs = [
    { icon: Users, label: t("client"), value: t(`clientType.${project.clientType}`) },
    { icon: MapPin, label: t("region"), value: project.region },
    ...(project.powerKwc != null ? [{ icon: Zap, label: t("power"), value: `${project.powerKwc} kWc` }] : []),
    { icon: Calendar, label: t("date"), value: dateFmt },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbLd(
          [
            { name: tn("home"), path: "" },
            { name: t("title"), path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ],
          locale,
          siteOrigin(settings),
        )}
      />
      {/* Hero: cover image with a solar overlay, or the branded gradient */}
      <section className="bg-solar relative overflow-hidden">
        {project.coverImage ? (
          <>
            <CmsImage media={project.coverImage} size="hero" fill priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/60 to-primary-900/30" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        )}
        <Container className="relative py-16 sm:py-20">
          <Reveal immediate className="flex flex-col gap-5 text-white">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-fit border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/projects">
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t("title")}
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              {service && (
                <ServiceIcon name={service.icon} className="size-12 bg-white/15 text-white" iconClassName="size-6" />
              )}
              <Badge variant="accent">{t(`clientType.${project.clientType}`)}</Badge>
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{project.title}</h1>
            <p className="max-w-2xl text-lg text-white/90">{project.summary}</p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <RichText data={project.body} locale={locale} />
            </Reveal>
            {service && (
              <Reveal className="mt-8">
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary-300 hover:text-brand"
                >
                  <ServiceIcon name={service.icon} className="size-6 rounded-md" iconClassName="size-3.5" />
                  {service.title}
                </Link>
              </Reveal>
            )}

            {gallery.length > 0 && (
              <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.map((media, i) => (
                  <Reveal key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <CmsImage
                      media={media}
                      size="card"
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </Reveal>
                ))}
              </RevealGroup>
            )}
          </div>

          <aside>
            <Reveal className="sticky top-24 rounded-2xl border border-border bg-surface-muted/60 p-6">
              <dl className="space-y-4">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    // dl > div may only hold dt/dd, so the icon lives inside the dt.
                    <div key={spec.label} className="relative flex min-h-9 flex-col justify-center ps-12">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        <span className="absolute start-0 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        {spec.label}
                      </dt>
                      <dd className="font-semibold text-foreground">
                        <bdi>{spec.value}</bdi>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Reveal>
          </aside>
        </Container>
      </section>

      <CtaBand locale={locale} site={site} />
    </>
  );
}
