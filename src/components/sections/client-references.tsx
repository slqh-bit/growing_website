import { getTranslations } from "next-intl/server";
import { Building2, CalendarDays, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { clientReferences, referenceCategories } from "@/lib/references";
import { ClientReferencesWall, type WallItem } from "@/components/sections/client-references-wall";

/**
 * Projects page, references block: a short text about our projects followed by
 * the logo wall of the institutions and companies we have worked for.
 */
export async function ClientReferences({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "projects.references" });

  const items: WallItem[] = clientReferences.map((r) => ({
    id: r.id,
    src: r.src,
    kind: r.kind,
    category: r.category,
    name: t(`items.${r.id}`),
  }));
  const categories = referenceCategories.map((value) => ({ value, label: t(`categories.${value}`) }));

  const highlights = [
    { icon: CalendarDays, label: t("highlightSince") },
    { icon: Building2, label: t("highlightClients") },
    { icon: ShieldCheck, label: t("highlightWarranty") },
  ];

  return (
    <>
      <section className="py-14 sm:py-16">
        <Container>
          <Reveal className="grid gap-10 lg:grid-cols-5 lg:gap-14">
            <div className="flex flex-col gap-4 lg:col-span-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">{t("eyebrow")}</span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("heading")}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{t("body1")}</p>
              <p className="leading-relaxed text-muted-foreground">{t("body2")}</p>
            </div>
            <ul className="flex flex-col gap-3 lg:col-span-2 lg:justify-center">
              {highlights.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
                >
                  <span className="bg-solar inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-medium text-foreground">{label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className="border-y border-border bg-surface-muted py-14 sm:py-16">
        <Container>
          <Reveal className="mb-8 flex max-w-2xl flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("wallTitle")}</h2>
            <p className="text-muted-foreground">{t("wallSubtitle")}</p>
          </Reveal>
          <ClientReferencesWall items={items} categories={categories} allLabel={t("all")} />
        </Container>
      </section>
    </>
  );
}
