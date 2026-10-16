import { ExternalLink, FileText, Mail, MessageCircle, Paperclip, Phone } from "lucide-react";
import Link from "next/link";
import { contactLinks, nextStatus, requestSteps, tabOf } from "@/lib/devis/inbox";
import { answersSummary, pick, type Answers, type FormSnapshot } from "@/lib/devis/form-def";
import { contactChannelOptions, governorateOptions, labelOf } from "@/lib/devis/options";
import type { DevisRequest } from "@/payload-types";
import type { Lang } from "../shared";
import { QuoteDrop, StatusActions } from "./actions";
import { inboxText } from "./text";

interface Props {
  request: DevisRequest;
  lang: Lang;
  /** Status value → its label in the admin's language. */
  statusLabels: Record<string, string>;
}

/** One quote request: who to call, where it stands, what was asked, and the quote. */
export function RequestDetail({ request, lang, statusLabels }: Props) {
  const t = inboxText[lang];
  const links = contactLinks(request);
  const snapshot = request.formSnapshot as FormSnapshot | null;
  const answers = snapshot?.questions ? answersSummary(snapshot, (request.technicalDetails ?? {}) as Answers, lang) : [];
  const service =
    typeof request.service === "object" && request.service ? request.service.title : pick(snapshot?.serviceTitle, lang);
  const attachments = (request.attachments ?? []).filter((file) => typeof file === "object");
  const quote = typeof request.quote === "object" ? request.quote : null;
  const next = nextStatus(request.status);
  const lost = request.status === "perdu";
  const reached = (requestSteps as readonly string[]).indexOf(request.status);
  const received = new Intl.DateTimeFormat({ fr: "fr-FR", en: "en-GB", ar: "ar-TN" }[lang], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Tunis",
  }).format(new Date(request.createdAt));

  const facts: [string, string | null | undefined][] = [
    [t.region, labelOf(governorateOptions, request.region, lang)],
    [t.channel, labelOf(contactChannelOptions, request.preferredChannel, lang)],
    [t.address, request.address],
    [t.visit, request.siteVisit ? t.yes : null],
    [t.received, received],
    [t.language, request.locale?.toUpperCase()],
  ];

  return (
    <article className="ws-request">
      <header className="ws-request__header">
        <div>
          <h2>{request.fullName}</h2>
          <p className="ws-muted">
            <span dir="ltr">{request.reference}</span>
            {service && ` · ${service}`}
          </p>
        </div>
        <div className="ws-request__reach">
          {links.call && (
            <a href={links.call} className="ws-button">
              <Phone size={16} aria-hidden="true" />
              {t.call}
            </a>
          )}
          {links.whatsapp && (
            <a href={links.whatsapp} className="ws-button" target="_blank" rel="noreferrer">
              <MessageCircle size={16} aria-hidden="true" />
              {t.whatsapp}
            </a>
          )}
          {links.email && (
            <a href={links.email} className="ws-button">
              <Mail size={16} aria-hidden="true" />
              {t.email}
            </a>
          )}
        </div>
      </header>

      <ol className="ws-steps" aria-label={t.steps}>
        {requestSteps.map((step, index) => (
          <li
            key={step}
            className={
              lost ? "ws-steps__step" : index === reached ? "ws-steps__step ws-steps__step--current" : index < reached ? "ws-steps__step ws-steps__step--past" : "ws-steps__step"
            }
            aria-current={!lost && index === reached ? "step" : undefined}
          >
            {statusLabels[step]}
          </li>
        ))}
        {lost && (
          <li className="ws-steps__step ws-steps__step--lost" aria-current="step">
            {statusLabels.perdu ?? t.lost}
          </li>
        )}
      </ol>

      <StatusActions
        id={request.id}
        next={next ? { status: next, label: t.markAs(statusLabels[next] ?? next), tab: tabOf(next) } : null}
        canLose={next !== null}
        lostLabel={t.markLost}
        failed={t.failed}
      />

      <section>
        <h3>{t.answers}</h3>
        {answers.length === 0 ? (
          <p className="ws-muted">{t.noAnswers}</p>
        ) : (
          <dl className="ws-facts">
            {answers.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section>
        <h3>{t.contact}</h3>
        <dl className="ws-facts">
          <div>
            <dt>{t.phone}</dt>
            <dd dir="ltr">{request.phone}</dd>
          </div>
          {request.email && (
            <div>
              <dt>{t.email}</dt>
              <dd dir="ltr">{request.email}</dd>
            </div>
          )}
          {facts.map(
            ([label, value]) =>
              value && (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ),
          )}
        </dl>
      </section>

      {attachments.length > 0 && (
        <section>
          <h3>{t.files}</h3>
          <ul className="ws-files">
            {attachments.map(
              (file) =>
                file.url && (
                  <li key={file.id}>
                    <a href={file.url} target="_blank" rel="noreferrer">
                      <Paperclip size={16} aria-hidden="true" />
                      {file.filename}
                    </a>
                  </li>
                ),
            )}
          </ul>
        </section>
      )}

      <section>
        <h3>{t.quote}</h3>
        {quote?.url && (
          <p>
            <a href={quote.url} target="_blank" rel="noreferrer" className="ws-file-link">
              <FileText size={16} aria-hidden="true" />
              {quote.filename}
            </a>
          </p>
        )}
        <QuoteDrop
          id={request.id}
          prompt={quote ? t.quoteReplace : t.quoteDrop}
          choose={t.quoteChoose}
          uploading={t.quoteUploading}
          onlyPdf={t.quoteOnlyPdf}
          failed={t.failed}
        />
        {!quote && <p className="ws-muted ws-hint">{t.quoteHint}</p>}
      </section>

      {request.notes && (
        <section>
          <h3>{t.notes}</h3>
          <p className="ws-notes">{request.notes}</p>
        </section>
      )}

      <p>
        <Link href={`/admin/collections/devis-requests/${request.id}`} className="ws-file-link" prefetch={false}>
          <ExternalLink size={16} aria-hidden="true" />
          {t.fullRecord}
        </Link>
      </p>
    </article>
  );
}
