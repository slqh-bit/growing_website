import { ArrowRight, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type {
  CompaniesBlock,
  GroupHeroBlock,
  GroupProjectsBlock,
  GroupServicesBlock,
  Project,
  QuoteFormBlock,
  StepsBlock,
} from "@/payload-types";
import type { SiteKey } from "@/sites/config";
import { getFeaturedProjects, getServices } from "@/lib/cms/queries";
import { getDevisChoices, getDevisCompanies } from "@/lib/devis/choices";
import { getGroupMembers, type GroupMember } from "@/lib/group";
import { servicePath, topLevel } from "@/lib/services";
import { brandHex } from "@/lib/theme";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/cms/smart-link";
import { DevisForm } from "@/components/devis/devis-form";
import { GroupServicesTabs, type CompanyServices } from "./group-services-tabs";

/**
 * Renderers of the group site's blocks (./group-config.ts). Companies,
 * services and projects are read live from each company's site, in its own
 * colours; links lead to that company's site.
 */

interface BlockProps<T> {
  block: T;
  locale: Locale;
  site: SiteKey;
}

/** Section heading with the gradient eyebrow bar of the group design. */
function GroupHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  dark = false,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "start" | "center";
  dark?: boolean;
}) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <Reveal
      className={
        align === "center" ? "flex flex-col items-center text-center" : "flex flex-col items-start"
      }
    >
      {eyebrow && (
        <span
          className={`mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase ${dark ? "text-sky-300" : "text-brand"}`}
        >
          <span
            aria-hidden
            className="from-primary-500 to-accent-500 h-[3px] w-7 rounded-full bg-gradient-to-r"
          />
          {eyebrow}
        </span>
      )}
      {title && (
        <h2
          className={`max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-foreground"}`}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mt-3 max-w-2xl text-base sm:text-lg ${dark ? "text-white/70" : "text-muted-foreground"}`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

const memberHref = (m: GroupMember, locale: Locale) => m.link?.(`/${locale}`) ?? null;
const initialsOf = (m: GroupMember) =>
  m.site.monogram?.trim() || m.site.companyName.slice(0, 2).toUpperCase();

// --- Hero ---------------------------------------------------------------------------

export async function GroupHeroBlockView({ block, locale }: BlockProps<GroupHeroBlock>) {
  const { members } = await getGroupMembers(locale);
  const [a, b] = members.map((m) => brandHex(m.site.theme));
  const glow = [a, b].filter(Boolean);

  return (
    <section id="top" className="relative isolate overflow-hidden bg-[#060b18] text-white">
      {/* Each company's colour glows from one side. */}
      <div
        aria-hidden
        className="group-glow absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            glow[0] && `radial-gradient(60% 55% at 15% 30%, ${glow[0].from}8c, transparent 70%)`,
            glow[1] && `radial-gradient(55% 55% at 88% 70%, ${glow[1].from}73, transparent 70%)`,
            glow[1] && `radial-gradient(35% 35% at 70% 10%, ${glow[1].accent}40, transparent 70%)`,
          ]
            .filter(Boolean)
            .join(", "),
        }}
      />
      <div aria-hidden className="group-grid absolute inset-0 -z-10" />

      <Container className="grid items-center gap-12 py-24 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-32">
        <Reveal immediate className="flex flex-col items-start">
          {block.badge && (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold">
              <span aria-hidden className="group-pulse size-2 rounded-full bg-green-500" />
              {block.badge}
            </span>
          )}
          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {block.title}{" "}
            {block.highlight && (
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${[a?.light, a?.accent, b?.light, b?.accent].filter(Boolean).join(", ")})`,
                }}
              >
                {block.highlight}
              </span>
            )}
          </h1>
          {block.subtitle && (
            <p className="mt-5 max-w-xl text-lg text-white/75">{block.subtitle}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {block.primaryCta?.href && block.primaryCta.label && (
              <Button asChild size="lg" variant="solar">
                <SmartLink href={block.primaryCta.href}>
                  {block.primaryCta.label}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </SmartLink>
              </Button>
            )}
            {block.secondaryCta?.href && block.secondaryCta.label && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <SmartLink href={block.secondaryCta.href}>{block.secondaryCta.label}</SmartLink>
              </Button>
            )}
          </div>
        </Reveal>

        {members.length > 0 && (
          <Reveal
            immediate
            className="grid gap-3.5 rounded-3xl border border-white/20 bg-white/[0.08] p-6 backdrop-blur-md"
          >
            {members.map((m) => {
              const hex = brandHex(m.site.theme);
              const href = memberHref(m, locale);
              const inner = (
                <>
                  <span
                    aria-hidden
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${hex.from}, ${hex.accent})`,
                    }}
                  >
                    {initialsOf(m)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-bold">{m.site.companyName}</span>
                    <span className="text-sm text-white/65">{m.summary}</span>
                  </span>
                </>
              );
              const cls =
                "flex items-center gap-3.5 rounded-2xl bg-white/[0.07] p-4 transition-all duration-300 hover:bg-white/15 hover:translate-x-1.5 rtl:hover:-translate-x-1.5";
              return href ? (
                <a key={m.site.id} href={href} className={cls}>
                  {inner}
                </a>
              ) : (
                <div key={m.site.id} className={cls}>
                  {inner}
                </div>
              );
            })}
          </Reveal>
        )}
      </Container>
    </section>
  );
}

// --- Companies ----------------------------------------------------------------------

export async function CompaniesBlockView({ block, locale }: BlockProps<CompaniesBlock>) {
  const { members } = await getGroupMembers(locale);
  if (members.length === 0) return null;
  const activities = await Promise.all(members.map((m) => getServices(m.site.key, locale)));

  return (
    <section id="filiales" className="scroll-mt-20 py-20 sm:py-24">
      <Container>
        <GroupHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
        <RevealGroup className="mt-12 grid gap-7 lg:grid-cols-2">
          {members.map((m, i) => {
            const hex = brandHex(m.site.theme);
            const href = memberHref(m, locale);
            const tags = topLevel(activities[i] ?? []).map((s) => s.title);
            return (
              <Reveal key={m.site.id} className="h-full">
                <article
                  className="group relative isolate flex h-full min-h-[26rem] flex-col gap-8 overflow-hidden rounded-[1.75rem] p-8 text-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-10"
                  style={{
                    backgroundImage: `linear-gradient(150deg, ${hex.to}, ${hex.from} 55%, ${hex.accent})`,
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute -end-24 -top-28 -z-10 size-[21rem] rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125"
                  />
                  <span
                    aria-hidden
                    className="inline-flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold ring-1 ring-white/30 backdrop-blur-sm"
                  >
                    {initialsOf(m)}
                  </span>
                  {/* Content sits at the bottom of the card, whatever its length. */}
                  <div className="mt-auto flex flex-col">
                    <h3 className="text-3xl font-extrabold tracking-tight">{m.site.companyName}</h3>
                    <p className="mt-3 max-w-md text-white/85">{m.summary}</p>
                    {tags.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/80">
                      <MapPin className="size-4" aria-hidden />
                      {m.site.city}
                      {m.site.certification && <span>· {m.site.certification}</span>}
                    </p>
                    {href && block.linkLabel && (
                      <a
                        href={href}
                        className="mt-5 inline-flex w-fit items-center gap-2 font-bold after:absolute after:inset-0 after:content-['']"
                      >
                        {block.linkLabel}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-2 rtl:rotate-180 rtl:group-hover:-translate-x-2" />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}

// --- Services by company ------------------------------------------------------------

export async function GroupServicesBlockView({ block, locale }: BlockProps<GroupServicesBlock>) {
  const { members } = await getGroupMembers(locale);
  const companies: CompanyServices[] = await Promise.all(
    members.map(async (m) => {
      const services = await getServices(m.site.key, locale);
      const hex = brandHex(m.site.theme);
      return {
        key: m.site.key,
        name: m.site.companyName,
        colors: { from: hex.from, to: hex.to },
        services: topLevel(services).map((s) => ({
          id: s.id,
          title: s.title,
          description: s.shortDescription,
          icon: s.icon,
          href: m.link?.(`/${locale}${servicePath(s, services)}`) ?? null,
        })),
      };
    }),
  );
  if (companies.every((c) => c.services.length === 0)) return null;

  return (
    <section id="services" className="bg-surface scroll-mt-20 py-20 sm:py-24">
      <Container>
        <GroupHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
        <GroupServicesTabs companies={companies.filter((c) => c.services.length > 0)} />
      </Container>
    </section>
  );
}

// --- Steps ----------------------------------------------------------------------------

export function StepsBlockView({ block }: BlockProps<StepsBlock>) {
  const items = block.items ?? [];
  if (items.length === 0) return null;
  const columns = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  }[items.length];

  return (
    <section id="methode" className="scroll-mt-20 py-20 sm:py-24">
      <Container>
        <GroupHeading eyebrow={block.eyebrow} title={block.title} align="center" />
        <RevealGroup className={`relative mt-12 grid gap-8 sm:grid-cols-2 ${columns ?? ""}`}>
          {/* The thread joining the steps (one row, wide screens). */}
          <span
            aria-hidden
            className="from-primary-500 via-primary-300 to-accent-500 absolute inset-x-[12%] top-7 hidden h-[3px] rounded-full bg-gradient-to-r opacity-40 lg:block"
          />
          {items.map((item, i) => (
            <Reveal
              key={item.id ?? i}
              className="group relative flex flex-col items-center text-center"
            >
              <span className="from-primary-600 to-accent-500 relative mb-4 inline-flex size-14 items-center justify-center rounded-full bg-gradient-to-br text-lg font-extrabold text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                {i + 1}
              </span>
              <h3 className="text-foreground font-bold">{item.title}</h3>
              {item.description && (
                <p className="text-muted-foreground mt-1.5 text-sm">{item.description}</p>
              )}
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

// --- Projects of the group ------------------------------------------------------------

export async function GroupProjectsBlockView({ block, locale }: BlockProps<GroupProjectsBlock>) {
  const limit = block.limit ?? 6;
  const { members } = await getGroupMembers(locale);
  const perCompany = await Promise.all(
    members.map(async (m) =>
      (await getFeaturedProjects(m.site.key, locale, limit)).map((p) => ({
        project: p,
        member: m,
      })),
    ),
  );
  // Most recent first, whichever the company.
  const time = (p: Project) => new Date(p.date).getTime() || 0;
  const projects = perCompany
    .flat()
    .sort((x, y) => time(y.project) - time(x.project))
    .slice(0, limit);
  if (projects.length === 0) return null;

  return (
    <section id="references" className="bg-surface scroll-mt-20 py-20 sm:py-24">
      <Container>
        <GroupHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(({ project, member }) => {
            const hex = brandHex(member.site.theme);
            const href = member.link?.(`/${locale}/projects/${project.slug}`) ?? null;
            const card = (
              <article className="border-border bg-surface-muted/40 flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
                <div
                  className="relative h-44 overflow-hidden"
                  style={{ backgroundImage: `linear-gradient(135deg, ${hex.from}, ${hex.accent})` }}
                >
                  <CmsImage
                    media={project.coverImage}
                    size="card"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span
                    className="w-fit rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ color: hex.from, backgroundColor: `${hex.from}1a` }}
                  >
                    {member.site.companyName}
                  </span>
                  <h3 className="text-foreground font-bold">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {[project.region, project.date ? new Date(project.date).getFullYear() : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </article>
            );
            return (
              <Reveal key={`${member.site.key}-${project.id}`} className="h-full">
                {href ? (
                  <a
                    href={href}
                    className="group focus-visible:ring-ring block h-full rounded-2xl focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {card}
                  </a>
                ) : (
                  <div className="group h-full">{card}</div>
                )}
              </Reveal>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}

// --- Quote form -------------------------------------------------------------------------

export async function QuoteFormBlockView({ block, locale, site }: BlockProps<QuoteFormBlock>) {
  const [activities, companies, t] = await Promise.all([
    getDevisChoices(site, locale),
    getDevisCompanies(site, locale),
    getTranslations({ locale, namespace: "devis" }),
  ]);
  if (activities.length === 0) return null;

  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-20 overflow-hidden bg-gradient-to-br from-[#060b18] to-[#0b1a3d] py-20 sm:py-24"
    >
      <span
        aria-hidden
        className="absolute -start-40 -bottom-64 -z-10 size-[37rem] rounded-full bg-[radial-gradient(circle,rgb(22_163_74/0.35),transparent_70%)]"
      />
      <Container className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28">
          <GroupHeading
            eyebrow={block.eyebrow}
            title={block.title ?? t("title")}
            subtitle={block.subtitle}
            dark
          />
        </div>
        <Reveal>
          <DevisForm
            activities={activities}
            companies={companies}
            locale={locale}
            privacyHref={`/${locale}/politique-confidentialite`}
          />
        </Reveal>
      </Container>
    </section>
  );
}
