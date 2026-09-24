import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Clock, Send, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/cms/queries";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({ locale, path: "/contact", title: t("title"), description: t("subtitle") });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, settings] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "common" }),
    getSiteSettings(locale),
  ]);

  const digits = (value: string) => value.replace(/[^\d+]/g, "");
  const { lat, lng } = settings.coords;
  // OpenStreetMap embed (no API key required).
  const bbox = `${lng - 0.03}%2C${lat - 0.02}%2C${lng + 0.03}%2C${lat + 0.02}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  const items = [
    { icon: Phone, label: t("phone"), value: settings.phone, href: `tel:${digits(settings.phone)}`, ltr: true },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: settings.whatsapp ? `https://wa.me/${digits(settings.whatsapp).replace(/^\+/, "")}` : undefined,
      ltr: true,
    },
    { icon: Mail, label: t("email"), value: settings.email, href: `mailto:${settings.email}`, ltr: true },
    {
      icon: Send,
      label: "Telegram",
      value: settings.telegram,
      href: settings.telegram ? `https://t.me/${settings.telegram.replace(/^@/, "")}` : undefined,
      ltr: true,
    },
    { icon: MapPin, label: t("address"), value: settings.address, href: undefined, ltr: false },
    { icon: Clock, label: t("hours"), value: settings.hours || t("hoursValue"), href: undefined, ltr: false },
  ].filter((item): item is typeof item & { value: string } => Boolean(item.value));

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          {/* Contact details */}
          <div>
            <RevealGroup className="space-y-4">
              {items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary-300">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-0.5 whitespace-pre-line font-semibold text-foreground" dir={item.ltr ? "ltr" : undefined}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <Reveal key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="block"
                        {...(item.href.startsWith("https://") && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </Reveal>
                );
              })}
            </RevealGroup>

            <Reveal className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-5 dark:border-primary-900 dark:bg-primary-950/40">
              <p className="text-sm text-foreground">{t("preferDevis")}</p>
              <Button asChild variant="solar" className="mt-4">
                <Link href="/devis">
                  {tc("requestQuote")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </Reveal>
          </div>

          {/* Map */}
          <Reveal delay={0.1}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t("mapTitle")}</h2>
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <iframe
                title={t("mapTitle")}
                src={mapSrc}
                className="aspect-[4/3] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
            >
              <MapPin className="size-4" aria-hidden />
              {settings.city}
            </a>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
