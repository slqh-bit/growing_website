import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getProjects } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectsExplorer } from "@/components/sections/projects-explorer";
import { toProjectView } from "@/components/sections/project-card";
import { CtaBand } from "@/components/sections/cta-band";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const t = await getTranslations({ locale, namespace: "projects" });
  return buildMetadata({ site, locale, path: "/projects", title: t("title"), description: t("subtitle") });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, projects] = await Promise.all([
    getTranslations({ locale, namespace: "projects" }),
    getProjects(locale),
  ]);
  const views = projects.map((p) => toProjectView(p, t));

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
      <CtaBand locale={locale} site={site} />
    </>
  );
}
