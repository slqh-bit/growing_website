import { ArrowRight, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/cms/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SmartLink, type CtaLink } from "@/components/cms/smart-link";

/**
 * Closing call-to-action band. The CTA block passes its own copy; inner pages
 * use the default quote-request copy from the UI message catalog. The phone
 * number always comes from Site settings.
 */
export async function CtaBand({
  locale,
  title,
  subtitle,
  button,
}: {
  locale: Locale;
  title?: string | null;
  subtitle?: string | null;
  button?: CtaLink;
}) {
  const [t, tc, settings] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "common" }),
    getSiteSettings(locale),
  ]);

  const label = button?.label || tc("requestQuote");
  const href = button?.href || "/devis";

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="bg-solar relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-xl sm:px-12">
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-10 size-56 rounded-full bg-accent-300/20 blur-2xl" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title || t("ctaTitle")}</h2>
            <p className="text-lg text-white/90">{subtitle || t("ctaSubtitle")}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <SmartLink href={href}>
                  {label}
                  <ArrowRight className="size-5 rtl:rotate-180" />
                </SmartLink>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} dir="ltr">
                  <Phone className="size-5" />
                  {settings.phone}
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
