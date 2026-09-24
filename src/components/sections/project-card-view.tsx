import { MapPin, Zap, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "@/components/ui/service-icon";
import { cn } from "@/lib/utils";

/** A project with every string already resolved for the active locale. */
export interface ProjectView {
  slug: string;
  title: string;
  summary: string;
  region: string;
  clientType: string;
  clientTypeLabel: string;
  activityKey: string;
  activityLabel: string;
  icon: string;
  powerKwc: number | null;
}

/**
 * Presentational project card. Hook-free, so it renders from both server
 * components (`ProjectCard`) and client components (`ProjectsExplorer`).
 */
export function ProjectCardView({
  project,
  className,
}: {
  project: ProjectView;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* Cover placeholder (media wired in a later phase) */}
      <div className="bg-solar relative flex aspect-[16/10] items-center justify-center">
        <ServiceIcon
          name={project.icon}
          className="size-16 bg-white/15 text-white backdrop-blur-sm"
          iconClassName="size-8"
        />
        <Badge variant="accent" className="absolute end-3 top-3">
          {project.clientTypeLabel}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground">{project.summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary-600" aria-hidden />
            {project.region}
          </span>
          {project.powerKwc != null && (
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-primary-600" aria-hidden />
              {project.powerKwc} kWc
            </span>
          )}
          <ArrowRight className="ms-auto size-4 text-primary-600 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
