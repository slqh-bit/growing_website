import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { clientReferences } from "@/lib/references";
import { RevealGroup, Reveal } from "@/components/motion/reveal";

/**
 * Plain (unfiltered) grid of Hikview's client logos and project photos, used
 * on the group home page under the "Hikview Engineering" heading.
 * Names are translated in messages/*.json → projects.references.items.<id>.
 */
export async function ReferenceLogosGrid({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "projects.references" });

  return (
    <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {clientReferences.map((r) => {
        const name = t(`items.${r.id}`);
        return (
          <Reveal key={r.id} className="h-full">
            <figure
              title={name}
              className="group border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-white">
                <Image
                  src={r.src}
                  alt={name}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className={
                    r.kind === "logo"
                      ? "object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                      : "object-cover transition-transform duration-500 group-hover:scale-105"
                  }
                />
              </div>
              <figcaption className="text-foreground border-border border-t px-3.5 py-3 text-sm leading-snug font-medium">
                {name}
              </figcaption>
            </figure>
          </Reveal>
        );
      })}
    </RevealGroup>
  );
}
