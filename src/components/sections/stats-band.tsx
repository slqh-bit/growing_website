import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { siteSettings } from "@/content/site";
import { t as tr } from "@/content/types";
import { Container } from "@/components/ui/container";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export async function StatsBand({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="py-8">
      <Container>
        <div className="rounded-3xl border border-border bg-surface px-6 py-10 shadow-sm sm:px-10">
          <Reveal className="mb-8 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              {t("statsTitle")}
            </h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {siteSettings.stats.map((s) => (
              <Reveal key={s.value} className="flex flex-col items-center gap-1 text-center">
                <span className="text-3xl font-bold text-foreground sm:text-4xl">{s.value}</span>
                <span className="text-sm text-muted-foreground">{tr(s.label, locale)}</span>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
