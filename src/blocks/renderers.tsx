import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type {
  ActivityGridBlock,
  CtaBlock,
  Faq,
  FaqBlock,
  FeaturesBlock,
  HeroBlock,
  LogosBlock,
  ProjectsBlock,
  RichTextBlock,
  StatsBlock,
} from "@/payload-types";
import { getFaq, getFeaturedProjects, getServices, getSiteSettings } from "@/lib/cms/queries";
import { populated } from "@/lib/cms/media";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { CmsImage } from "@/components/cms/cms-image";
import { RichText } from "@/components/cms/rich-text";
import { SmartLink } from "@/components/cms/smart-link";
import { CtaButtons, Hero } from "@/components/sections/hero";
import { PageHeader } from "@/components/sections/page-header";
import { StatsBand } from "@/components/sections/stats-band";
import { ServiceCard } from "@/components/sections/service-card";
import { ProjectCard } from "@/components/sections/project-card";
import { CtaBand } from "@/components/sections/cta-band";

interface BlockProps<B> {
  block: B;
  locale: Locale;
}

export async function HeroBlockView({ block, locale }: BlockProps<HeroBlock>) {
  if (block.style === "full") {
    const [settings, tc] = await Promise.all([
      getSiteSettings(locale),
      getTranslations({ locale, namespace: "common" }),
    ]);
    return (
      <Hero
        badge={block.badge}
        title={block.title}
        subtitle={block.subtitle}
        primaryCta={block.primaryCta}
        secondaryCta={block.secondaryCta}
        image={block.image}
        companyName={settings.companyName}
        tagline={tc("companyTagline")}
        stats={settings.stats ?? []}
      />
    );
  }

  return (
    <PageHeader eyebrow={block.badge ?? undefined} title={block.title} subtitle={block.subtitle ?? undefined}>
      <div className="mt-2">
        <CtaButtons primary={block.primaryCta} secondary={block.secondaryCta} />
      </div>
    </PageHeader>
  );
}

export async function StatsBlockView({ block, locale }: BlockProps<StatsBlock>) {
  const items = block.useSiteStats === false ? (block.items ?? []) : ((await getSiteSettings(locale)).stats ?? []);
  return <StatsBand title={block.title} items={items} />;
}

export async function ActivityGridBlockView({ block, locale }: BlockProps<ActivityGridBlock>) {
  const [services, tc] = await Promise.all([
    getServices(locale),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return (
    <section className="py-20 sm:py-24">
      <Container>
        {block.title && <SectionHeading title={block.title} subtitle={block.subtitle ?? undefined} />}
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
  );
}

export function FeaturesBlockView({ block }: BlockProps<FeaturesBlock>) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface-muted/50 py-20 sm:py-24">
      <Container>
        {block.title && <SectionHeading title={block.title} subtitle={block.subtitle ?? undefined} />}
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.id ?? i}>
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-surface p-6 shadow-sm">
                <span className="bg-solar inline-flex size-11 items-center justify-center rounded-xl text-white">
                  <DynamicIcon name={item.icon} className="size-5" />
                </span>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

export async function ProjectsBlockView({ block, locale }: BlockProps<ProjectsBlock>) {
  const [projects, tc] = await Promise.all([
    getFeaturedProjects(locale, block.limit ?? 3),
    getTranslations({ locale, namespace: "common" }),
  ]);
  if (projects.length === 0) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          {block.title && (
            <SectionHeading align="start" title={block.title} subtitle={block.subtitle ?? undefined} />
          )}
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/projects">
              {tc("viewProjects")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Reveal key={project.slug} className="h-full">
              <ProjectCard project={project} locale={locale} className="h-full" />
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

export function CtaBlockView({ block, locale }: BlockProps<CtaBlock>) {
  return <CtaBand locale={locale} title={block.title} subtitle={block.subtitle} button={block.button} />;
}

export function RichTextBlockView({ block, locale }: BlockProps<RichTextBlock>) {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Reveal>
          {block.title && (
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{block.title}</h2>
          )}
          <RichText data={block.content} locale={locale} />
        </Reveal>
      </Container>
    </section>
  );
}

export function LogosBlockView({ block }: BlockProps<LogosBlock>) {
  const logos = block.logos ?? [];
  if (logos.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        {block.title && (
          <Reveal className="mb-10 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{block.title}</h2>
          </Reveal>
        )}
        <RevealGroup className="grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo, i) => {
            const image = (
              <CmsImage
                media={logo.image}
                size="thumbnail"
                sizes="160px"
                className="mx-auto h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            );
            return (
              <Reveal key={logo.id ?? i} title={logo.name}>
                {logo.url ? (
                  <SmartLink href={logo.url} className="block">
                    {image}
                  </SmartLink>
                ) : (
                  image
                )}
              </Reveal>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}

export async function FaqBlockView({ block, locale }: BlockProps<FaqBlock>) {
  const picked = (block.items ?? []).map((item) => populated<Faq>(item)).filter((f): f is Faq => f !== null);
  const items = picked.length > 0 ? picked : await getFaq(locale);
  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        {block.title && <SectionHeading title={block.title} className="mb-10" />}
        <Accordion
          items={items.map((f) => ({ id: String(f.id), question: f.question, answer: f.answer }))}
        />
      </Container>
    </section>
  );
}
