import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, MapPin, Wrench, Headphones, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { services } from "@/content/services";
import { getFeaturedProjects } from "@/content/projects";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Hero } from "@/components/sections/hero";
import { StatsBand } from "@/components/sections/stats-band";
import { ServiceCard } from "@/components/sections/service-card";
import { ProjectCard } from "@/components/sections/project-card";
import { CtaBand } from "@/components/sections/cta-band";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const featured = getFeaturedProjects();

  const why = [
    { icon: ShieldCheck, key: "certified" },
    { icon: MapPin, key: "local" },
    { icon: Wrench, key: "turnkey" },
    { icon: Headphones, key: "support" },
  ] as const;

  return (
    <>
      <Hero locale={locale} />
      <StatsBand locale={locale} />

      {/* Activities */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow={tc("companyTagline")}
            title={t("activitiesTitle")}
            subtitle={t("activitiesSubtitle")}
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Reveal key={service.slug} className="h-full">
                <ServiceCard service={service} locale={locale} className="h-full" />
              </Reveal>
            ))}
            <Reveal className="h-full">
              <Link
                href="/services"
                className="group flex h-full min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary-300 bg-primary-50/50 p-6 text-center transition-colors hover:bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30"
              >
                <span className="text-lg font-semibold text-primary-700 dark:text-primary-200">
                  {tc("discoverServices")}
                </span>
                <ArrowRight className="size-5 text-primary-600 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Reveal>
          </RevealGroup>
        </Container>
      </section>

      {/* Why us */}
      <section className="border-y border-border bg-surface-muted/50 py-20 sm:py-24">
        <Container>
          <SectionHeading title={t("whyTitle")} subtitle={t("whySubtitle")} />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map(({ icon: Icon, key }) => (
              <Reveal key={key}>
                <div className="flex h-full flex-col gap-3 rounded-2xl bg-surface p-6 shadow-sm">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-solar text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-semibold text-foreground">{t(`why.${key}`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`why.${key}Body`)}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* Featured projects */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              align="start"
              title={t("projectsTitle")}
              subtitle={t("projectsSubtitle")}
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/projects">
                {tc("viewProjects")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <Reveal key={project.slug} className="h-full">
                <ProjectCard project={project} locale={locale} className="h-full" />
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <CtaBand locale={locale} />
    </>
  );
}
