import { getTranslations } from "next-intl/server";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Faq, Service, Site } from "@/payload-types";
import type { SiteKey } from "@/sites/config";
import { getPartners, getProjectsForService, getServices, getServicesByIds, getSite } from "@/lib/cms/queries";
import { populated } from "@/lib/cms/media";
import { otherSiteOrigin, siteOrigin } from "@/lib/metadata";
import { childrenOf, parentId, servicePath, topLevel } from "@/lib/services";
import { breadcrumbLd, JsonLd, serviceLd } from "@/lib/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CmsImage } from "@/components/cms/cms-image";
import { RichText } from "@/components/cms/rich-text";
import { PageHeader } from "@/components/sections/page-header";
import { PartnerLogos } from "@/components/sections/partner-logos";
import { ServiceSections } from "@/components/sections/service-sections";
import { ServiceCard } from "@/components/sections/service-card";
import { ProjectCard } from "@/components/sections/project-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

/**
 * Services picked in "Chez notre société sœur", grouped by company, each with
 * its absolute URL on that company's site (hidden while it has no address).
 */
async function crossSellGroups(service: Service, site: SiteKey, locale: Locale) {
  const ids = (service.crossSell ?? []).map((c) => (typeof c === "object" ? c.id : c));
  const picked = await getServicesByIds(ids, locale);
  const bySite = new Map<number, { company: Site; items: Service[] }>();
  for (const s of picked) {
    const company = typeof s.site === "object" ? s.site : null;
    if (!company || company.key === site) continue;
    const entry = bySite.get(company.id) ?? { company, items: [] };
    entry.items.push(s);
    bySite.set(company.id, entry);
  }
  const groups = await Promise.all(
    [...bySite.values()].map(async ({ company, items }) => {
      const origin = otherSiteOrigin(company);
      if (!origin) return null;
      const theirServices = await getServices(company.key, locale);
      return {
        company,
        links: items.map((s) => ({ service: s, href: `${origin}/${locale}${servicePath(s, theirServices)}` })),
      };
    }),
  );
  return groups.filter((g) => g !== null);
}

/**
 * A service page: a top-level service (Growing activity, Hikview area — with
 * its sub-services) or a sub-service (/services/<area>/<sub>, with the other
 * solutions of its area). Shared by both service routes.
 */
export async function ServiceDetail({ site, locale, service }: { site: SiteKey; locale: Locale; service: Service }) {
  const [t, tc, tn, tg, allServices, settings, partners, crossSell] = await Promise.all([
    getTranslations({ locale, namespace: "services" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "group" }),
    getServices(site, locale),
    getSite(site, locale),
    getPartners(site, locale, { serviceId: service.id }),
    crossSellGroups(service, site, locale),
  ]);
  const origin = siteOrigin(settings);
  const path = servicePath(service, allServices);
  const pid = parentId(service);
  const parent = pid === null ? undefined : allServices.find((s) => s.id === pid);
  const subServices = parent ? [] : childrenOf(allServices, service.id);
  // Siblings in the same area, or the other top-level services.
  const others = (parent ? childrenOf(allServices, parent.id) : topLevel(allServices)).filter(
    (s) => s.id !== service.id,
  );
  // An area also shows the projects of its sub-services.
  const projects = await getProjectsForService(
    site,
    [service.id, ...subServices.map((s) => s.id)],
    Boolean(service.showPublicReferences),
    locale,
  );

  // Services without a quote form yet (plan Phase 5a) lead to the contact page.
  const quoteHref = service.activityKey ? `/devis?activite=${service.activityKey}` : "/contact";
  const sections = service.sections ?? [];
  const benefits = service.benefits ?? [];
  const steps = service.process ?? [];
  const faqs = (service.faqRefs ?? []).map((f) => populated<Faq>(f)).filter((f): f is Faq => f !== null);
  const back = parent ? { href: servicePath(parent, allServices), label: parent.title } : { href: "/services", label: t("allServices") };

  return (
    <>
      <JsonLd data={serviceLd(service, locale, origin, path)} />
      <JsonLd
        data={breadcrumbLd(
          [
            { name: tn("home"), path: "" },
            { name: t("title"), path: "/services" },
            ...(parent ? [{ name: parent.title, path: servicePath(parent, allServices) }] : []),
            { name: service.title, path },
          ],
          locale,
          origin,
        )}
      />
      <PageHeader eyebrow={parent?.title ?? t("title")} title={service.title} subtitle={service.shortDescription}>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button asChild variant="solar">
            <Link href={quoteHref}>
              {t("requestForActivity")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={back.href}>
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {back.label}
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

            {sections.length > 0 && (
              <ServiceSections sections={sections} locale={locale} onThisPage={t("onThisPage")} />
            )}

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
                <Link href={quoteHref}>{tc("requestQuote")}</Link>
              </Button>
            </Reveal>
          </aside>
        </Container>
      </section>

      {subServices.length > 0 && (
        <section className="border-t border-border py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("subServicesTitle")}</h2>
            <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {subServices.map((sub) => (
                <Reveal key={sub.id} className="h-full">
                  <ServiceCard service={sub} href={servicePath(sub, allServices)} locale={locale} className="h-full" />
                </Reveal>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}

      {partners.length > 0 && <PartnerLogos partners={partners} title={t("partnersTitle")} />}

      {projects.length > 0 && (
        <section className="border-t border-border bg-surface-muted/40 py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {service.showPublicReferences ? t("publicReferences") : tc("viewProjects")}
            </h2>
            <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Reveal key={project.slug} className="h-full">
                  <ProjectCard project={project} locale={locale} className="h-full" />
                </Reveal>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}

      {crossSell.map(({ company, links }) => (
        <section key={company.id} className="border-t border-border bg-surface-muted/40 py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {tg("sisterCompany", { company: company.companyName })}
            </h2>
            <p className="mt-2 text-muted-foreground">{tg("sisterSubtitle")}</p>
            <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {links.map(({ service: s, href }) => (
                <Reveal key={s.id} className="h-full">
                  <ServiceCard service={s} href={href} locale={locale} className="h-full" />
                </Reveal>
              ))}
            </RevealGroup>
          </Container>
        </section>
      ))}

      {others.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {parent ? t("sameArea", { area: parent.title }) : t("allServices")}
            </h2>
            <RevealGroup className="mt-8 flex flex-wrap gap-3">
              {others.map((s) => (
                <Reveal key={s.slug}>
                  <Link
                    href={servicePath(s, allServices)}
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

      <CtaBand locale={locale} site={site} />
    </>
  );
}
