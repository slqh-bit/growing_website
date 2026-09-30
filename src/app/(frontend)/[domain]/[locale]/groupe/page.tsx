import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { getGroupMembers } from "@/lib/group";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/cms/rich-text";
import { PageHeader } from "@/components/sections/page-header";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { brandOf, Logo } from "@/components/brand/logo";

/**
 * "Le groupe" (plan §3.3): the same page on every site, managed once in
 * Paramètres → Groupe, presenting each company with a link to its site.
 */
type Params = Promise<{ domain: string; locale: Locale }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const { group } = await getGroupMembers(locale);
  return buildMetadata({
    site,
    locale,
    path: "/groupe",
    title: group.name,
    description: group.tagline ?? undefined,
  });
}

export default async function GroupPage({ params }: { params: Params }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, { group, members }] = await Promise.all([
    getTranslations({ locale, namespace: "group" }),
    getGroupMembers(locale),
  ]);

  return (
    <>
      <PageHeader eyebrow={t("title")} title={group.name} subtitle={group.tagline ?? undefined} />

      {group.story && (
        <section className="pt-16 sm:pt-20">
          <Container className="max-w-3xl">
            <Reveal immediate>
              <RichText data={group.story} locale={locale} />
            </Reveal>
          </Container>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("companies")}</h2>
          <RevealGroup className="mt-8 grid gap-6 md:grid-cols-2">
            {members.map(({ site: member, summary, origin }) => {
              const current = member.key === site;
              return (
                <Reveal key={member.id} className="h-full">
                  <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <Logo brand={brandOf(member)} />
                      {current && <Badge variant="primary">{t("youAreHere")}</Badge>}
                    </div>
                    <p className="text-foreground/90">{summary}</p>
                    <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4 text-brand" aria-hidden />
                      {member.city}
                      {member.certification && <span>· {member.certification}</span>}
                    </p>
                    {!current && origin && (
                      <Button asChild variant="outline" className="mt-auto w-fit">
                        <a href={`${origin}/${locale}`}>
                          {t("visit")}
                          <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
                        </a>
                      </Button>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </RevealGroup>
        </Container>
      </section>

      <CtaBand locale={locale} site={site} />
    </>
  );
}
