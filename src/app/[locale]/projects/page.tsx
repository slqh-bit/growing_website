import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { projects } from "@/content/projects";
import { getServiceByKey } from "@/content/services";
import { t as tr } from "@/content/types";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectsExplorer, type ProjectView } from "@/components/sections/projects-explorer";
import { CtaBand } from "@/components/sections/cta-band";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "projects" });

  const views: ProjectView[] = projects.map((p) => {
    const service = getServiceByKey(p.activityKey);
    return {
      slug: p.slug,
      title: tr(p.title, locale),
      summary: tr(p.summary, locale),
      region: tr(p.region, locale),
      clientType: p.clientType,
      clientTypeLabel: t(`clientType.${p.clientType}`),
      activityKey: p.activityKey,
      activityLabel: service ? tr(service.title, locale) : p.activityKey,
      icon: service?.icon ?? "Sun",
      powerKwc: p.powerKwc,
    };
  });

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16 sm:py-20">
        <Container>
          <ProjectsExplorer
            projects={views}
            labels={{
              all: t("filterAll"),
              activity: t("filterActivity"),
              region: t("filterRegion"),
              clientType: t("filterClientType"),
              noResults: t("noResults"),
            }}
          />
        </Container>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
