import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { getFaq, getSite } from "@/lib/cms/queries";
import { Container } from "@/components/ui/container";
import { Accordion, type AccordionItemData } from "@/components/ui/accordion";
import { PageHeader } from "@/components/sections/page-header";
import { CtaBand } from "@/components/sections/cta-band";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const [tn, settings] = await Promise.all([getTranslations({ locale, namespace: "nav" }), getSite(site, locale)]);
  return buildMetadata({ site, locale, path: "/faq", title: tn("faq"), description: settings.tagline });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [tn, settings] = await Promise.all([getTranslations({ locale, namespace: "nav" }), getSite(site, locale)]);

  // Already sorted by `order`; group by (localized) category, keeping first-seen order.
  const groups = new Map<string, AccordionItemData[]>();
  for (const item of await getFaq(locale)) {
    const entry: AccordionItemData = {
      id: String(item.id),
      question: item.question,
      answer: item.answer,
      category: item.category,
    };
    groups.set(item.category, [...(groups.get(item.category) ?? []), entry]);
  }

  return (
    <>
      <PageHeader eyebrow={settings.tagline} title={tn("faq")} />
      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="space-y-10">
            {Array.from(groups.entries()).map(([category, items]) => (
              <div key={category}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
                  {category}
                </h2>
                <Accordion items={items} />
              </div>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand locale={locale} site={site} />
    </>
  );
}
