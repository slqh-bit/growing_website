import { Gutter } from "@payloadcms/ui";
import { Phone, Plus } from "lucide-react";
import Link from "next/link";
import type { AdminViewServerProps, Where } from "payload";
import { pick, type FormSnapshot } from "@/lib/devis/form-def";
import { governorateOptions, labelOf } from "@/lib/devis/options";
import { EXPIRY_WARNING_DAYS, expiryLevel } from "@/lib/documents";
import { accentStyle, adminLang, currentWorkspace, type Lang } from "../shared";
import { ValidityBadge } from "../validity-cell";

const REQUESTS = "/admin/collections/devis-requests";
const DOCUMENTS = "/admin/collections/company-documents";

const text: Record<
  Lang,
  {
    hello: (name: string) => string;
    newRequests: string;
    toQuote: string;
    expiring: string;
    waiting: string;
    nothing: string;
    newBadge: string;
    allRequests: string;
    addProject: string;
    logRequest: string;
    shortcuts: string;
  }
> = {
  fr: {
    hello: (name) => `Bonjour ${name}`,
    newRequests: "Nouvelles demandes",
    toQuote: "Devis à envoyer",
    expiring: "Documents à renouveler",
    waiting: "À traiter",
    nothing: "Rien à traiter pour le moment. Les nouvelles demandes et les documents à renouveler apparaîtront ici.",
    newBadge: "Nouvelle",
    allRequests: "Voir toutes les demandes",
    addProject: "Ajouter une réalisation",
    logRequest: "Saisir une demande reçue par téléphone",
    shortcuts: "Raccourcis",
  },
  en: {
    hello: (name) => `Hello ${name}`,
    newRequests: "New requests",
    toQuote: "Quotes to send",
    expiring: "Documents to renew",
    waiting: "Waiting for you",
    nothing: "Nothing is waiting right now. New requests and documents to renew will show up here.",
    newBadge: "New",
    allRequests: "See all requests",
    addProject: "Add a project",
    logRequest: "Log a request received by phone",
    shortcuts: "Shortcuts",
  },
  ar: {
    hello: (name) => `مرحباً ${name}`,
    newRequests: "طلبات جديدة",
    toQuote: "تسعيرات للإرسال",
    expiring: "وثائق يجب تجديدها",
    waiting: "في انتظارك",
    nothing: "لا شيء في الانتظار حالياً. ستظهر هنا الطلبات الجديدة والوثائق التي يجب تجديدها.",
    newBadge: "جديد",
    allRequests: "عرض كل الطلبات",
    addProject: "إضافة إنجاز",
    logRequest: "تسجيل طلب ورد عبر الهاتف",
    shortcuts: "اختصارات",
  },
};

/**
 * Admin home (replaces the grid of collections): what is waiting in the
 * company being worked on — new quote requests, quotes to send, company
 * documents about to expire — and the two things staff add most often.
 */
export async function Home({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  const { payload, user, i18n } = req;
  if (!user) return null;
  const lang = adminLang(i18n);
  const t = text[lang];
  const { current } = await currentWorkspace(payload, user);
  const inSite: Where[] = current ? [{ site: { equals: current.id } }] : [];
  const withStatus = (status: string): Where => ({ and: [...inSite, { status: { equals: status } }] });
  const horizon = new Date(Date.now() + (EXPIRY_WARNING_DAYS + 1) * 24 * 60 * 60 * 1000);

  // Read with the user's own access, like the lists these numbers lead to.
  const [fresh, toQuote, documents] = await Promise.all([
    payload.find({
      collection: "devis-requests",
      where: withStatus("nouveau"),
      sort: "-createdAt",
      limit: 5,
      depth: 1,
      locale: lang,
      overrideAccess: false,
      user,
    }),
    payload.count({ collection: "devis-requests", where: withStatus("contacte"), overrideAccess: false, user }),
    payload.find({
      collection: "company-documents",
      where: { and: [...inSite, { validUntil: { less_than_equal: horizon.toISOString() } }] },
      sort: "validUntil",
      limit: 50,
      depth: 0,
      locale: lang,
      overrideAccess: false,
      user,
    }),
  ]);
  const due = documents.docs.filter((doc) => expiryLevel(doc.validUntil) !== "valid");
  const name = (user as { name?: string | null }).name?.trim() || user.email?.split("@")[0] || "";

  const counters = [
    { label: t.newRequests, value: fresh.totalDocs, href: `${REQUESTS}?tab=new`, alert: false },
    { label: t.toQuote, value: toQuote.totalDocs, href: `${REQUESTS}?tab=progress`, alert: false },
    { label: t.expiring, value: due.length, href: DOCUMENTS, alert: due.length > 0 },
  ];

  return (
    <Gutter className="ws-home">
      <div style={accentStyle(current)}>
        <h1>{t.hello(name)}</h1>
        {current && <p className="ws-muted">{current.name}</p>}

        <ul className="ws-counters">
          {counters.map((counter) => (
            <li key={counter.label}>
              <Link href={counter.href} className="ws-counter" prefetch={false}>
                <span className="ws-counter__label">{counter.label}</span>
                <span className={counter.alert ? "ws-counter__value ws-counter__value--alert" : "ws-counter__value"}>
                  {counter.value}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section>
          <h2>{t.waiting}</h2>
          {fresh.docs.length === 0 && due.length === 0 ? (
            <p className="ws-empty">{t.nothing}</p>
          ) : (
            <ul className="ws-waiting">
              {fresh.docs.map((request) => {
                const service =
                  typeof request.service === "object" && request.service
                    ? request.service.title
                    : pick((request.formSnapshot as FormSnapshot | null)?.serviceTitle, lang);
                return (
                  <li key={`request-${request.id}`}>
                    <Link href={`${REQUESTS}?tab=new&id=${request.id}`} className="ws-waiting__row" prefetch={false}>
                      <span className="ws-pill ws-pill--new">{t.newBadge}</span>
                      <span className="ws-waiting__main">{request.fullName}</span>
                      <span className="ws-muted">
                        {[service, labelOf(governorateOptions, request.region, lang)].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {due.map((doc) => (
                <li key={`document-${doc.id}`}>
                  <Link href={`${DOCUMENTS}/${doc.id}`} className="ws-waiting__row" prefetch={false}>
                    <span className="ws-waiting__main">{doc.title}</span>
                    <ValidityBadge validUntil={doc.validUntil} lang={lang} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {fresh.totalDocs > fresh.docs.length && (
            <p>
              <Link href={`${REQUESTS}?tab=new`} prefetch={false}>
                {t.allRequests}
              </Link>
            </p>
          )}
        </section>

        <section>
          <h2>{t.shortcuts}</h2>
          <div className="ws-shortcuts">
            <Link href="/admin/collections/projects/create" className="ws-button" prefetch={false}>
              <Plus size={16} aria-hidden="true" />
              {t.addProject}
            </Link>
            <Link href={`${REQUESTS}/create`} className="ws-button" prefetch={false}>
              <Phone size={16} aria-hidden="true" />
              {t.logRequest}
            </Link>
          </div>
        </section>
      </div>
    </Gutter>
  );
}
