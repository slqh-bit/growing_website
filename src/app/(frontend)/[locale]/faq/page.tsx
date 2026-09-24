import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { getFaq } from "@/lib/cms/queries";
import { Container } from "@/components/ui/container";
import { Accordion, type AccordionItemData } from "@/components/ui/accordion";
import { PageHeader } from "@/components/sections/page-header";
import { CtaBand } from "@/components/sections/cta-band";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });
  return buildMetadata({ locale, path: "/faq", title: tn("faq"), description: tc("companyTagline") });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });

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
      <PageHeader eyebrow={tc("companyTagline")} title={tn("faq")} />
      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="space-y-10">
            {Array.from(groups.entries()).map(([category, items]) => (
              <div key={category}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-600">
                  {category}
                </h2>
                <Accordion items={items} />
              </div>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
