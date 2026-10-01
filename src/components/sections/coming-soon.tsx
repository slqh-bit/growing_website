import { getTranslations } from "next-intl/server";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Reveal } from "@/components/motion/reveal";
import type { IconName } from "@/lib/icons";

/**
 * Polished "Coming soon" placeholder (plan Phase 9) — phased-rollout mindset,
 * never a dead link: each page offers what already works instead (track a
 * request, apply by email, see the projects…), defaulting to a quote request.
 */
export async function ComingSoon({
  locale,
  title,
  description,
  icon,
  action,
}: {
  locale: Locale;
  title?: string;
  description?: string;
  icon?: IconName;
  /** Main button; a `mailto:` href is rendered as a plain link. */
  action?: { href: string; label: string };
}) {
  const tc = await getTranslations({ locale, namespace: "common" });
  const main = action ?? { href: "/devis", label: tc("requestQuote") };

  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
      <Reveal immediate className="flex flex-col items-center gap-5">
        <Badge variant="accent" className="gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          {tc("comingSoon")}
        </Badge>
        <span className="bg-solar inline-flex size-20 items-center justify-center rounded-2xl text-white shadow-lg">
          {icon ? <DynamicIcon name={icon} className="size-9" /> : <Clock className="size-9" aria-hidden />}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title ?? tc("comingSoon")}
        </h1>
        <p className="max-w-md text-muted-foreground">{description ?? tc("comingSoonBody")}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="solar">
            {main.href.startsWith("mailto:") ? (
              <a href={main.href}>
                {main.label}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </a>
            ) : (
              <Link href={main.href}>
                {main.label}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{tc("backHome")}</Link>
          </Button>
        </div>
      </Reveal>
    </Container>
  );
}
