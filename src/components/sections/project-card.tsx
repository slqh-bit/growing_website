import { getTranslations } from "next-intl/server";
import { t as tr } from "@/content/types";
import type { Project } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { getServiceByKey } from "@/content/services";
import { ProjectCardView, type ProjectView } from "@/components/sections/project-card-view";

/** Translator scoped to the `projects` namespace. */
type ProjectsTranslator = (key: string) => string;

/** Resolve a project's localized strings into a `ProjectView`. */
export function toProjectView(project: Project, locale: Locale, t: ProjectsTranslator): ProjectView {
  const service = getServiceByKey(project.activityKey);
  return {
    slug: project.slug,
    title: tr(project.title, locale),
    summary: tr(project.summary, locale),
    region: tr(project.region, locale),
    clientType: project.clientType,
    clientTypeLabel: t(`clientType.${project.clientType}`),
    activityKey: project.activityKey,
    activityLabel: service ? tr(service.title, locale) : project.activityKey,
    icon: service?.icon ?? "Sun",
    powerKwc: project.powerKwc,
  };
}

export async function ProjectCard({
  project,
  locale,
  className,
}: {
  project: Project;
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "projects" });
  return <ProjectCardView project={toProjectView(project, locale, t)} className={className} />;
}
