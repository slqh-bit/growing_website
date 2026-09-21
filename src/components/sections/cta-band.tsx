import { ArrowRight, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { siteSettings } from "@/content/site";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export async function CtaBand({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="bg-solar relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-xl sm:px-12">
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-10 size-56 rounded-full bg-accent-300/20 blur-2xl" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="text-lg text-white/90">{t("ctaSubtitle")}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/devis">
                  {tc("requestQuote")}
                  <ArrowRight className="size-5 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}>
                  <Phone className="size-5" />
                  {siteSettings.phone}
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
