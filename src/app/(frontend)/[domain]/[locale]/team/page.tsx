import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getTeam } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { CmsImage } from "@/components/cms/cms-image";
import { ComingSoon } from "@/components/sections/coming-soon";
import { PageHeader } from "@/components/sections/page-header";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const [t, team] = await Promise.all([getTranslations({ locale, namespace: "team" }), getTeam(locale)]);
  // Keep the "Coming soon" placeholder out of search results.
  return buildMetadata({
    site,
    locale,
    path: "/team",
    title: t("title"),
    description: t("subtitle"),
    noindex: team.length === 0,
  });
}

/** Team members from the CMS; "Coming soon" until the first one is added. */
export default async function TeamPage({ params }: { params: Promise<{ domain: string; locale: Locale }> }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, team] = await Promise.all([getTranslations({ locale, namespace: "team" }), getTeam(locale)]);

  if (team.length === 0) return <ComingSoon locale={locale} title={t("title")} />;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16 sm:py-20">
        <Container>
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Reveal key={member.id}>
                <div className="flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
                  <div className="bg-solar relative size-28 overflow-hidden rounded-full">
                    {member.photo ? (
                      <CmsImage media={member.photo} size="thumbnail" fill sizes="112px" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-3xl font-bold text-white">
                        {initials(member.name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{member.name}</h2>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </Container>
      </section>
      <CtaBand locale={locale} site={site} />
    </>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
