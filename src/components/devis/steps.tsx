"use client";

import { CheckCircle2, Pencil, Phone, MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Path, UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { contactLabels, contactSummary } from "@/lib/devis/fields";
import {
  answersSchema,
  answersSummary,
  attachmentsMode,
  isVisible,
  pick,
  type Answers,
  type QuestionDef,
} from "@/lib/devis/form-def";
import type { AttachmentErrorKey } from "@/lib/devis/attachments";
import type { DevisChoice, DevisCompany } from "@/lib/devis/choices";
import { contactChannelOptions, governorateOptions } from "@/lib/devis/options";
import { stepSchema, type DevisFormValues } from "@/lib/devis/schema";
import { ServiceIcon } from "@/components/ui/service-icon";
import { AttachmentsField, useAttachmentsLabel } from "./attachments-field";
import { FieldError, FieldShell, describedBy, fieldId, inputClass } from "./field-shell";

type Form = UseFormReturn<DevisFormValues>;

interface StepProps {
  form: Form;
  /** register() with live re-validation once a field shows an error. */
  field: (name: Path<DevisFormValues>) => UseFormRegisterReturn;
  locale: Locale;
  /** Translated error message for a form path, if any. */
  errorOf: (name: string) => string | undefined;
}

// --- Step 1 ------------------------------------------------------------------------

/** Group site: the company the request is for, picked before its services. */
export interface CompanyState {
  companies: DevisCompany[];
  company: string | null;
  setCompany: (key: string) => void;
}

export function ActivityStep({
  form,
  field,
  errorOf,
  activities,
  companyState,
}: StepProps & { activities: DevisChoice[]; companyState: CompanyState }) {
  const t = useTranslations("devis");
  const selected = form.watch("service");
  const error = errorOf("service");
  const id = fieldId("service");
  const { companies, company, setCompany } = companyState;
  const multi = companies.length > 1;
  const shown = multi ? activities.filter((a) => a.company === company) : activities;
  // Sub-services are grouped under their area (Hikview); top-level services have none.
  const groups = shown.reduce<{ area: string | null; items: DevisChoice[] }[]>((acc, a) => {
    const last = acc.at(-1);
    if (last && last.area === a.area) last.items.push(a);
    else acc.push({ area: a.area, items: [a] });
    return acc;
  }, []);

  return (
    <fieldset>
      <legend className="sr-only">{t("steps.activity")}</legend>
      {multi && (
        <div className="mb-6 flex flex-col gap-3">
          <p id="devis-company-label" className="text-sm font-semibold text-foreground">
            {t("company.question")}
          </p>
          <div role="radiogroup" aria-labelledby="devis-company-label" className="grid gap-3 sm:grid-cols-2">
            {companies.map((c) => {
              const active = company === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setCompany(c.key);
                    // A service of the other company no longer applies.
                    if (activities.find((a) => a.id === selected)?.company !== c.key) form.setValue("service", "");
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border-2 p-4 text-start transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary-500 bg-primary-50 shadow-sm dark:bg-primary-950/40" : "border-border bg-surface hover:-translate-y-0.5 hover:border-primary-300",
                  )}
                >
                  <span
                    aria-hidden
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${c.colors.from}, ${c.colors.to})` }}
                  >
                    {c.monogram}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">{c.summary}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {multi && !company && <p className="text-sm text-muted-foreground">{t("company.pickFirst")}</p>}
      <div
        role="radiogroup"
        aria-label={t("steps.activity")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="flex flex-col gap-5"
      >
        {groups.map((group, gi) => (
          <div key={group.area ?? `group-${gi}`} className="flex flex-col gap-3">
            {group.area && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.area}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((a) => {
                const isSelected = selected === a.id;
                return (
                  <label
                    key={a.id}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      isSelected
                        ? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500/40 dark:bg-primary-950/40"
                        : "border-border bg-surface hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm",
                      error && !selected && "border-red-400",
                    )}
                  >
                    <input type="radio" value={a.id} {...field("service")} className="sr-only" />
                    <ServiceIcon name={a.icon} className="size-11 shrink-0" iconClassName="size-5" />
                    <span className="flex min-w-0 flex-col gap-1 pe-6">
                      <span className="font-semibold text-foreground">{a.title}</span>
                      <span className="text-sm text-muted-foreground">{a.description}</span>
                    </span>
                    <CheckCircle2
                      aria-hidden
                      className={cn(
                        "absolute end-3 top-3 size-5 text-brand transition-all duration-200",
                        isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0",
                      )}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <FieldError id={id} message={error} />
      </div>
    </fieldset>
  );
}

// --- Step 2 ------------------------------------------------------------------------

/** Questions that take the whole row. */
const wideTypes = new Set(["textarea", "checkbox", "radio", "multiselect"]);

/** The attachments picked at step 2 (kept outside react-hook-form: File objects). */
export interface FilesState {
  files: File[];
  setFiles: (files: File[]) => void;
  error: AttachmentErrorKey | "required" | null;
  setError: (key: AttachmentErrorKey | "required" | null) => void;
}

export function TechnicalStep({
  form,
  field,
  locale,
  errorOf,
  activities,
  attachments,
}: StepProps & { activities: DevisChoice[]; attachments: FilesState }) {
  const t = useTranslations("devis");
  const service = form.watch("service");
  const answers = (form.watch("answers") ?? {}) as Answers;
  const def = activities.find((a) => a.id === service)?.form;
  if (!def) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {def.questions
        .filter((q) => isVisible(q, answers, def))
        .map((q) => (
          <Question
            key={q.name}
            q={q}
            field={field}
            locale={locale}
            error={errorOf(`answers.${q.name}`)}
            labels={{ moreInfo: t("moreInfo"), select: t("select"), placeholder: t("placeholders.textarea") }}
          />
        ))}
      {attachmentsMode(def) !== "off" && (
        <AttachmentsField
          def={def}
          locale={locale}
          files={attachments.files}
          onChange={attachments.setFiles}
          error={attachments.error ? t(`errors.${attachments.error}`) : undefined}
          onError={attachments.setError}
        />
      )}
    </div>
  );
}

/** One question of a service's form (Contenu → Formulaires de devis). */
function Question({
  q,
  field,
  locale,
  error,
  labels,
}: {
  q: QuestionDef;
  field: StepProps["field"];
  locale: Locale;
  error?: string;
  labels: { moreInfo: string; select: string; placeholder: string };
}) {
  const name = `answers.${q.name}` as Path<DevisFormValues>;
  const id = fieldId(name);
  const label = pick(q.label, locale);
  const help = pick(q.help, locale) || undefined;
  const unit = pick(q.unit, locale);
  const wide = q.width === "full" || wideTypes.has(q.type);
  const options = q.options ?? [];
  const star = q.required ? <span className="text-red-600"> *</span> : null;

  if (q.type === "checkbox") {
    return (
      <div className="flex flex-col gap-2 sm:col-span-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            id={id}
            type="checkbox"
            {...field(name)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="size-5 rounded accent-primary-600"
          />
          <span className="text-sm font-medium text-foreground">
            {label}
            {star}
          </span>
        </label>
        <FieldError id={id} message={error} />
      </div>
    );
  }

  if (q.type === "radio" || q.type === "multiselect") {
    return (
      <fieldset
        id={id}
        className="flex flex-col gap-2 sm:col-span-2"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <legend className="mb-2 text-sm font-medium text-foreground">
          {label}
          {star}
        </legend>
        {help && <p className="-mt-1 mb-1 text-xs text-muted-foreground">{help}</p>}
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <label
              key={o.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors has-[:checked]:border-primary-600 has-[:checked]:bg-primary-600 has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
            >
              <input type={q.type === "radio" ? "radio" : "checkbox"} value={o.value} {...field(name)} className="sr-only" />
              {pick(o.label, locale)}
            </label>
          ))}
        </div>
        <FieldError id={id} message={error} />
      </fieldset>
    );
  }

  return (
    <FieldShell
      id={id}
      label={label}
      required={Boolean(q.required)}
      help={help}
      helpLabel={labels.moreInfo}
      error={error}
      className={wide ? "sm:col-span-2" : undefined}
    >
      {q.type === "select" ? (
        <select
          id={id}
          {...field(name)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, { error })}
          className={inputClass(Boolean(error), "appearance-auto")}
        >
          <option value="">{labels.select}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {pick(o.label, locale)}
            </option>
          ))}
        </select>
      ) : q.type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          {...field(name)}
          placeholder={labels.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, { error })}
          className={inputClass(Boolean(error), "resize-y")}
        />
      ) : (
        <div className="relative">
          <input
            id={id}
            type={q.type === "date" ? "date" : "text"}
            inputMode={q.type === "number" ? "decimal" : undefined}
            autoComplete="off"
            {...field(name)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy(id, { error })}
            className={inputClass(Boolean(error), unit ? "pe-24" : undefined)}
          />
          {unit && (
            <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-sm text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
      )}
    </FieldShell>
  );
}

// --- Step 3 ------------------------------------------------------------------------

const channelIcons = { call: Phone, whatsapp: MessageCircle, telegram: Send } as const;

export function ContactStep({ form, field, locale, errorOf }: StepProps) {
  const t = useTranslations("devis");
  const channel = form.watch("preferredChannel");
  const governorates = [...governorateOptions].sort((a, b) => a.label[locale].localeCompare(b.label[locale], locale));
  const ids = {
    fullName: fieldId("fullName"),
    phone: fieldId("phone"),
    email: fieldId("email"),
    region: fieldId("region"),
    address: fieldId("address"),
  };
  const err = {
    fullName: errorOf("fullName"),
    phone: errorOf("phone"),
    email: errorOf("email"),
    region: errorOf("region"),
    address: errorOf("address"),
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FieldShell id={ids.fullName} label={contactLabels.fullName[locale]} required helpLabel={t("moreInfo")} error={err.fullName}>
        <input
          id={ids.fullName}
          type="text"
          autoComplete="name"
          {...field("fullName")}
          placeholder={t("placeholders.fullName")}
          aria-invalid={Boolean(err.fullName)}
          aria-describedby={describedBy(ids.fullName, { error: err.fullName })}
          className={inputClass(Boolean(err.fullName))}
        />
      </FieldShell>

      <FieldShell
        id={ids.phone}
        label={contactLabels.phone[locale]}
        required
        helpLabel={t("moreInfo")}
        hint={t("phoneHint")}
        error={err.phone}
      >
        <input
          id={ids.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          {...field("phone")}
          placeholder={t("placeholders.phone")}
          aria-invalid={Boolean(err.phone)}
          aria-describedby={describedBy(ids.phone, { hint: t("phoneHint"), error: err.phone })}
          className={inputClass(Boolean(err.phone), "text-start rtl:text-end")}
        />
      </FieldShell>

      <FieldShell
        id={ids.email}
        label={contactLabels.email[locale]}
        helpLabel={t("moreInfo")}
        hint={t("emailHint")}
        error={err.email}
      >
        <input
          id={ids.email}
          type="email"
          autoComplete="email"
          dir="ltr"
          {...field("email")}
          placeholder={t("placeholders.email")}
          aria-invalid={Boolean(err.email)}
          aria-describedby={describedBy(ids.email, { hint: t("emailHint"), error: err.email })}
          className={inputClass(Boolean(err.email), "text-start rtl:text-end")}
        />
      </FieldShell>

      <FieldShell id={ids.region} label={contactLabels.region[locale]} required helpLabel={t("moreInfo")} error={err.region}>
        <select
          id={ids.region}
          autoComplete="address-level1"
          {...field("region")}
          aria-invalid={Boolean(err.region)}
          aria-describedby={describedBy(ids.region, { error: err.region })}
          className={inputClass(Boolean(err.region), "appearance-auto")}
        >
          <option value="">{t("select")}</option>
          {governorates.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label[locale]}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell
        id={ids.address}
        label={contactLabels.address[locale]}
        helpLabel={t("moreInfo")}
        error={err.address}
        className="sm:col-span-2"
      >
        <textarea
          id={ids.address}
          rows={2}
          autoComplete="street-address"
          {...field("address")}
          placeholder={t("placeholders.address")}
          aria-invalid={Boolean(err.address)}
          aria-describedby={describedBy(ids.address, { error: err.address })}
          className={inputClass(Boolean(err.address), "resize-y")}
        />
      </FieldShell>

      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-medium text-foreground">{contactLabels.preferredChannel[locale]}</legend>
        <div className="flex flex-wrap gap-2">
          {contactChannelOptions.map((o) => {
            const Icon = channelIcons[o.value];
            const active = channel === o.value;
            return (
              <label
                key={o.value}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  active
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-border bg-surface text-foreground hover:border-primary-300",
                )}
              >
                <input type="radio" value={o.value} {...field("preferredChannel")} className="sr-only" />
                <Icon className="size-4" aria-hidden />
                {o.label[locale]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:col-span-2">
        <input
          id={fieldId("siteVisit")}
          type="checkbox"
          {...field("siteVisit")}
          className="mt-0.5 size-5 shrink-0 rounded accent-primary-600"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{t("siteVisit.label")}</span>
          <span className="text-xs text-muted-foreground">{t("siteVisit.help")}</span>
        </span>
      </label>
    </div>
  );
}

// --- Step 4 ------------------------------------------------------------------------

export function ReviewStep({
  form,
  field,
  locale,
  errorOf,
  activities,
  onEdit,
  privacyHref,
  files,
  companies,
}: StepProps & {
  activities: DevisChoice[];
  onEdit: (step: number) => void;
  privacyHref: string;
  files: File[];
  companies: DevisCompany[];
}) {
  const t = useTranslations("devis");
  const consentId = fieldId("consent");
  const consentError = errorOf("consent");
  const values = form.getValues();
  const choice = activities.find((a) => a.id === values.service);
  const filesLabel = useAttachmentsLabel(choice?.form, locale);
  // Previous steps are valid here; parse for display (normalized numbers, labels).
  const parsed = choice ? answersSchema(choice.form).safeParse(values.answers ?? {}) : null;
  const contact = stepSchema(2, activities, values.service).safeParse(values);
  if (!choice || !parsed?.success || !contact.success) return null;

  const sections = [
    {
      title: t("review.activity"),
      step: 0,
      rows: [
        ...(companies.length > 1
          ? [{ label: t("company.label"), value: companies.find((c) => c.key === choice.company)?.name ?? "" }]
          : []),
        { label: contactLabels.activity[locale], value: choice.title },
      ],
    },
    {
      title: t("review.technical"),
      step: 1,
      rows: [
        ...answersSummary(choice.form, parsed.data, locale),
        ...(files.length > 0 && attachmentsMode(choice.form) !== "off"
          ? [{ label: filesLabel, value: files.map((f) => f.name).join("\n") }]
          : []),
      ],
      empty: t("review.empty"),
    },
    { title: t("review.contact"), step: 2, rows: contactSummary(contact.data as typeof values, locale) },
  ];

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-border bg-surface-muted/40 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              {section.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-primary-300 dark:hover:bg-primary-950/50"
            >
              <Pencil className="size-3.5" aria-hidden />
              {t("edit")}
            </button>
          </div>
          {section.rows.length > 0 ? (
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {section.rows.map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="whitespace-pre-line break-words font-medium text-foreground">
                    <bdi>{row.value}</bdi>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">{section.empty}</p>
          )}
        </section>
      ))}

      <div className="flex flex-col gap-2">
        <label
          htmlFor={consentId}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
            consentError ? "border-red-400 bg-red-50/50 dark:bg-red-950/20" : "border-border bg-surface hover:border-primary-300",
          )}
        >
          <input
            id={consentId}
            type="checkbox"
            {...field("consent")}
            aria-invalid={Boolean(consentError)}
            aria-describedby={consentError ? `${consentId}-error` : undefined}
            className="mt-0.5 size-5 shrink-0 rounded accent-primary-600"
          />
          <span className="text-sm text-foreground">
            {t.rich("consent", {
              // New tab: following the link must not lose the filled-in form.
              link: (chunks) => (
                <a
                  href={privacyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-700 underline underline-offset-2 dark:text-primary-300"
                >
                  {chunks}
                </a>
              ),
            })}
          </span>
        </label>
        <FieldError id={consentId} message={consentError} />
      </div>
    </div>
  );
}
