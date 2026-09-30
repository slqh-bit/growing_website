import type { Locale } from "@/i18n/routing";
import type { Service } from "@/payload-types";
import { CmsImage } from "@/components/cms/cms-image";
import { RichText } from "@/components/cms/rich-text";
import { Reveal } from "@/components/motion/reveal";
import { ScrollToHash } from "@/components/motion/scroll-to-hash";
import { ServiceIcon } from "@/components/ui/service-icon";

type Section = NonNullable<Service["sections"]>[number];

/**
 * A service's page sections (Services → Sections de la page), each reachable
 * by its anchor (/fr/services/installation-raccordee#commercial), with a small
 * "on this page" index when there are several.
 */
export function ServiceSections({
  sections,
  locale,
  onThisPage,
}: {
  sections: Section[];
  locale: Locale;
  onThisPage: string;
}) {
  return (
    <div className="mt-12">
      <ScrollToHash />
      {sections.length > 1 && (
        <nav aria-label={onThisPage} className="mb-10 flex flex-wrap items-center gap-2">
          <span className="me-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{onThisPage}</span>
          {sections.map((section) => (
            <a
              key={section.anchor}
              href={`#${section.anchor}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary-300 hover:text-brand"
            >
              {section.title}
            </a>
          ))}
        </nav>
      )}

      <div className="space-y-12">
        {sections.map((section) => (
          <Reveal key={section.anchor}>
            {/* scroll-mt: the anchor lands below the sticky header. */}
            <section id={section.anchor} className="scroll-mt-24">
              <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
                {section.icon && <ServiceIcon name={section.icon} className="size-10 shrink-0" iconClassName="size-5" />}
                {section.title}
              </h2>
              {section.image && (
                <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
                  <CmsImage media={section.image} size="card" fill sizes="(min-width: 1024px) 60vw, 100vw" />
                </div>
              )}
              {section.body && (
                <div className="mt-4">
                  <RichText data={section.body} locale={locale} />
                </div>
              )}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
