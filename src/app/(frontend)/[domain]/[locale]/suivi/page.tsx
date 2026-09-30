import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircle, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getSite } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { telHref, whatsappHref } from "@/lib/contact-links";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { TrackForm } from "@/components/devis/track-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const t = await getTranslations({ locale, namespace: "track" });
  // Personal lookup page: nothing to index.
  return buildMetadata({
    site,
    locale,
    path: "/suivi",
    title: t("title"),
    description: t("subtitle"),
    noindex: true,
  });
}

/** Client-side tracking of a quote request (reference + phone). */
export default async function TrackPage({ params }: { params: Promise<{ domain: string; locale: Locale }> }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "track" }),
    getSite(site, locale),
  ]);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrackForm locale={locale} />
          </div>

          <aside className="bg-solar h-fit rounded-3xl p-6 text-white shadow-md">
            <p className="font-semibold">{t("result.questions")}</p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={telHref(settings.phone)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
                dir="ltr"
              >
                <Phone className="size-4" aria-hidden />
                {settings.phone}
              </a>
              {settings.whatsapp && (
                <a
                  href={whatsappHref(settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              )}
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
