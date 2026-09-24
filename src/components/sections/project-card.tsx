import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Project, Service } from "@/payload-types";
import { imageSource, populated } from "@/lib/cms/media";
import { ProjectCardView, type ProjectView } from "@/components/sections/project-card-view";

/** Translator scoped to the `projects` namespace. */
type ProjectsTranslator = (key: string) => string;

/** Map a CMS project (depth ≥ 1) to the serializable card view model. */
export function toProjectView(project: Project, t: ProjectsTranslator): ProjectView {
  const service = populated<Service>(project.activity);
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    region: project.region,
    clientType: project.clientType,
    clientTypeLabel: t(`clientType.${project.clientType}`),
    activityKey: service?.activityKey ?? "",
    activityLabel: service?.title ?? "",
    icon: service?.icon ?? "Sun",
    powerKwc: project.powerKwc ?? null,
    cover: imageSource(project.coverImage, "card"),
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
  return <ProjectCardView project={toProjectView(project, t)} className={className} />;
}
