import { ArrowRight, Sun, ShieldCheck } from "lucide-react";
import type { Media } from "@/payload-types";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink, type CtaLink } from "@/components/cms/smart-link";
import type { StatItem } from "@/components/sections/stats-band";

/** Large home-page hero ("full" style of the Hero block). */
export function Hero({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  image,
  companyName,
  tagline,
  stats,
}: {
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  image?: number | Media | null;
  companyName: string;
  tagline: string;
  stats: StatItem[];
}) {
  const [firstStat, secondStat] = stats;

  return (
    <section className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-950/40" />
        <div className="absolute -end-24 top-10 size-72 rounded-full bg-accent-200/40 blur-3xl dark:bg-accent-900/20" />
        <div className="absolute -start-24 top-40 size-72 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/20" />
      </div>

      <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div className="flex flex-col items-start gap-6">
          {badge && (
            <Reveal immediate>
              <Badge variant="primary" className="gap-1.5">
                <ShieldCheck className="size-3.5" aria-hidden />
                {badge}
              </Badge>
            </Reveal>
          )}
          <Reveal immediate delay={0.05}>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Reveal>
          {subtitle && (
            <Reveal immediate delay={0.1}>
              <p className="max-w-xl text-pretty text-lg text-muted-foreground">{subtitle}</p>
            </Reveal>
          )}
          <CtaButtons primary={primaryCta} secondary={secondaryCta} delay={0.15} />
          {firstStat && (
            <Reveal immediate delay={0.2} className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex -space-x-1 rtl:space-x-reverse">
                {stats.slice(0, 3).map((s) => (
                  <span
                    key={s.value}
                    dir="ltr"
                    className="inline-flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                  >
                    {s.value.replace(/[^0-9A-Z+]/g, "").slice(0, 3) || "GT"}
                  </span>
                ))}
              </span>
              <span>
                <bdi dir="ltr">{firstStat.value}</bdi> · {firstStat.label}
              </span>
            </Reveal>
          )}
        </div>

        {/* Visual panel: CMS image, or the branded gradient */}
        <Reveal immediate delay={0.1} className="relative">
          <div className="bg-solar relative aspect-square overflow-hidden rounded-3xl shadow-2xl sm:aspect-[4/5] lg:aspect-square">
            {image ? (
              <CmsImage media={image} size="hero" fill priority sizes="(min-width: 1024px) 50vw, 100vw" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%)] [background-size:36px_36px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
                  <Sun className="size-20 animate-pulse" aria-hidden />
                  <p className="text-2xl font-bold">{companyName}</p>
                  <p className="max-w-xs text-sm text-white/85">{tagline}</p>
                </div>
              </>
            )}
          </div>
          {secondStat && (
            <div className="absolute -bottom-5 start-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-lg sm:start-8">
              <p className="text-2xl font-bold text-brand">
                <bdi dir="ltr">{secondStat.value}</bdi>
              </p>
              <p className="text-xs text-muted-foreground">{secondStat.label}</p>
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

/** Primary (solar) + secondary (outline) CTA pair; hidden when unset. */
export function CtaButtons({
  primary,
  secondary,
  delay = 0,
}: {
  primary?: CtaLink;
  secondary?: CtaLink;
  delay?: number;
}) {
  const hasPrimary = Boolean(primary?.label && primary.href);
  const hasSecondary = Boolean(secondary?.label && secondary.href);
  if (!hasPrimary && !hasSecondary) return null;

  return (
    <Reveal immediate delay={delay} className="flex flex-col gap-3 sm:flex-row">
      {hasPrimary && (
        <Button asChild size="lg" variant="solar">
          <SmartLink href={primary!.href!}>
            {primary!.label}
            <ArrowRight className="size-5 rtl:rotate-180" />
          </SmartLink>
        </Button>
      )}
      {hasSecondary && (
        <Button asChild size="lg" variant="outline">
          <SmartLink href={secondary!.href!}>{secondary!.label}</SmartLink>
        </Button>
      )}
    </Reveal>
  );
}
