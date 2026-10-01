import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarCheck, Download, FileText, Mail } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getCompanyDocuments, getSite, type PublicDocument } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { documentTypes, isExpired } from "@/lib/documents";
import { formatBytes } from "@/lib/devis/attachments";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

type Params = Promise<{ domain: string; locale: Locale }>;

/** Documents expire by the day: re-render at least hourly so an expired one leaves the page. */
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const t = await getTranslations({ locale, namespace: "documents" });
  return buildMetadata({ site, locale, path: "/documents", title: t("title"), description: t("subtitle") });
}

function formatDate(iso: string, locale: Locale) {
  const tag = { fr: "fr-TN", en: "en-GB", ar: "ar-TN" }[locale];
  return new Intl.DateTimeFormat(tag, { dateStyle: "long", timeZone: "Africa/Tunis" }).format(new Date(iso));
}

/**
 * Company documents for tenders (plan Phase 6): the site's legal identity and
 * its valid documents (Appels d'offres → Documents administratifs), grouped by
 * type. Public ones are downloaded through Payload's access check; "on
 * request" ones link to the contact page.
 */
export default async function DocumentsPage({ params }: { params: Params }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [t, settings, all] = await Promise.all([
    getTranslations({ locale, namespace: "documents" }),
    getSite(site, locale),
    getCompanyDocuments(site, locale),
  ]);

  const documents = all.filter((d) => !isExpired(d.validUntil));
  const groups = documentTypes
    .map((type) => ({ type, items: documents.filter((d) => d.type === type.value) }))
    .filter((g) => g.items.length > 0);

  const identity = [
    { label: t("legalName"), value: settings.legalName },
    { label: t("taxId"), value: settings.matriculeFiscal, ltr: true },
    { label: t("rne"), value: settings.rne, ltr: true },
    { label: t("certification"), value: settings.certification },
    { label: t("address"), value: settings.address },
  ].filter((row) => row.value);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-10 lg:col-span-2">
            {groups.length === 0 ? (
              <Reveal immediate className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
                <p className="text-foreground">{t("empty")}</p>
                <Button asChild variant="solar" className="mt-6">
                  <Link href="/contact">{t("contactCta")}</Link>
                </Button>
              </Reveal>
            ) : (
              groups.map(({ type, items }) => (
                <section key={type.value} aria-labelledby={`doc-type-${type.value}`}>
                  <h2 id={`doc-type-${type.value}`} className="text-xl font-bold tracking-tight text-foreground">
                    {type.label[locale]}
                  </h2>
                  <RevealGroup className="mt-4 grid gap-3">
                    {items.map((doc) => (
                      <Reveal key={doc.id}>
                        <DocumentRow doc={doc} locale={locale} t={t} />
                      </Reveal>
                    ))}
                  </RevealGroup>
                </section>
              ))
            )}
            {groups.length > 0 && <p className="text-sm text-muted-foreground">{t("note")}</p>}
          </div>

          <aside>
            <Reveal className="sticky top-24 rounded-2xl border border-border bg-surface-muted/60 p-6">
              <h2 className="text-lg font-bold text-foreground">{t("identity")}</h2>
              <dl className="mt-4 flex flex-col gap-3">
                {identity.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{row.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-line font-semibold text-foreground" dir={row.ltr ? "ltr" : undefined}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                href={`mailto:${settings.email}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline-offset-2 hover:underline dark:text-primary-300"
              >
                <Mail className="size-4" aria-hidden />
                <bdi>{settings.email}</bdi>
              </a>
            </Reveal>
          </aside>
        </Container>
      </section>
    </>
  );
}

function DocumentRow({
  doc,
  locale,
  t,
}: {
  doc: PublicDocument;
  locale: Locale;
  t: Awaited<ReturnType<typeof getTranslations<"documents">>>;
}) {
  const meta = [doc.mimeType === "application/pdf" ? "PDF" : doc.mimeType?.split("/")[1]?.toUpperCase(), doc.filesize ? formatBytes(doc.filesize, locale) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
        <FileText className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="font-semibold text-foreground">{doc.title}</h3>
        {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={doc.validUntil ? "primary" : "outline"}>
            <CalendarCheck className="size-3.5" aria-hidden />
            {doc.validUntil ? t("validUntil", { date: formatDate(doc.validUntil, locale) }) : t("noExpiry")}
          </Badge>
          {doc.url && meta && <span>{meta}</span>}
        </div>
      </div>
      {doc.url ? (
        <Button asChild variant="outline" className="shrink-0">
          <a href={doc.url} target="_blank" rel="noopener" aria-label={t("downloadLabel", { title: doc.title })}>
            <Download className="size-4" aria-hidden />
            {t("download")}
          </a>
        </Button>
      ) : (
        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <Badge variant="outline">{t("onRequest")}</Badge>
          <Link href="/contact" className="text-sm font-semibold text-primary-700 underline-offset-2 hover:underline dark:text-primary-300">
            {t("requestCta")}
          </Link>
        </div>
      )}
    </article>
  );
}
