import { ArrowRight, Sun, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { siteSettings } from "@/content/site";
import { t as tr } from "@/content/types";

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "common" });

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
          <Reveal>
            <Badge variant="primary" className="gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t("heroBadge")}
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              {t("heroSubtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="solar">
              <Link href="/devis">
                {tc("requestQuote")}
                <ArrowRight className="size-5 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">{tc("discoverServices")}</Link>
            </Button>
          </Reveal>
          <Reveal delay={0.2} className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex -space-x-1">
              {siteSettings.stats.slice(0, 3).map((s) => (
                <span
                  key={s.value}
                  className="inline-flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                >
                  {s.value.replace(/[^0-9A-Z+]/g, "").slice(0, 3) || "GT"}
                </span>
              ))}
            </span>
            <span>{tr(siteSettings.stats[0]!.label, locale)}</span>
          </Reveal>
        </div>

        {/* Visual panel */}
        <Reveal delay={0.1} className="relative">
          <div className="bg-solar relative aspect-square overflow-hidden rounded-3xl shadow-2xl sm:aspect-[4/5] lg:aspect-square">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%)] [background-size:36px_36px]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
              <Sun className="size-20 animate-pulse" aria-hidden />
              <p className="text-2xl font-bold">{siteSettings.companyName}</p>
              <p className="max-w-xs text-sm text-white/85">{tc("companyTagline")}</p>
            </div>
          </div>
          {/* Floating stat chip */}
          <div className="absolute -bottom-5 start-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-lg sm:start-8">
            <p className="text-2xl font-bold text-primary-600">{siteSettings.stats[1]!.value}</p>
            <p className="text-xs text-muted-foreground">{tr(siteSettings.stats[1]!.label, locale)}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
