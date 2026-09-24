"use client";

import { CheckCircle2, Pencil, Phone, MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Path, UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { contactLabels, contactSummary, technicalFields, technicalSummary, activityLabel } from "@/lib/devis/fields";
import { contactChannelOptions, governorateOptions, technicalGroupOf, type Activity } from "@/lib/devis/options";
import { devisSchema, type DevisFormValues } from "@/lib/devis/schema";
import { ServiceIcon } from "@/components/ui/service-icon";
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

export interface ActivityChoice {
  value: Activity;
  title: string;
  description: string;
  icon: string;
}

// --- Step 1 ------------------------------------------------------------------------

export function ActivityStep({ form, field, errorOf, activities }: StepProps & { activities: ActivityChoice[] }) {
  const t = useTranslations("devis");
  const selected = form.watch("activity");
  const error = errorOf("activity");
  const id = fieldId("activity");

  return (
    <fieldset>
      <legend className="sr-only">{t("steps.activity")}</legend>
      <div
        role="radiogroup"
        aria-label={t("steps.activity")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="grid gap-3 sm:grid-cols-2"
      >
        {activities.map((a) => {
          const isSelected = selected === a.value;
          return (
            <label
              key={a.value}
              className={cn(
                "relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                isSelected
                  ? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500/40 dark:bg-primary-950/40"
                  : "border-border bg-surface hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm",
                error && !selected && "border-red-400",
              )}
            >
              <input
                type="radio"
                value={a.value}
                {...field("activity")}
                className="sr-only"
              />
              <ServiceIcon name={a.icon} className="size-11 shrink-0" iconClassName="size-5" />
              <span className="flex min-w-0 flex-col gap-1 pe-6">
                <span className="font-semibold text-foreground">{a.title}</span>
                <span className="text-sm text-muted-foreground">{a.description}</span>
              </span>
              <CheckCircle2
                aria-hidden
                className={cn(
                  "absolute end-3 top-3 size-5 text-primary-600 transition-all duration-200",
                  isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              />
            </label>
          );
        })}
      </div>
      <div className="mt-3">
        <FieldError id={id} message={error} />
      </div>
    </fieldset>
  );
}

// --- Step 2 ------------------------------------------------------------------------

export function TechnicalStep({ form, field, locale, errorOf }: StepProps) {
  const t = useTranslations("devis");
  const activity = form.watch("activity");
  if (!activity) return null;
  const group = technicalGroupOf[activity];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {technicalFields[group].map((def) => {
        const name = `${group}.${def.name}` as Path<DevisFormValues>;
        const id = fieldId(name);
        const error = errorOf(name);
        const label = def.label[locale];
        const help = def.help?.[locale];
        const wide = def.kind === "textarea" || def.kind === "checkbox";

        if (def.kind === "checkbox") {
          return (
            <label key={name} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:col-span-2">
              <input type="checkbox" {...field(name)} className="size-5 rounded accent-primary-600" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </label>
          );
        }

        return (
          <FieldShell
            key={name}
            id={id}
            label={label}
            required={def.required}
            help={help}
            helpLabel={t("moreInfo")}
            error={error}
            className={wide ? "sm:col-span-2" : undefined}
          >
            {def.kind === "select" ? (
              <select
                id={id}
                {...field(name)}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy(id, { error })}
                className={inputClass(Boolean(error), "appearance-auto")}
              >
                <option value="">{t("select")}</option>
                {def.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label[locale]}
                  </option>
                ))}
              </select>
            ) : def.kind === "textarea" ? (
              <textarea
                id={id}
                rows={3}
                {...field(name)}
                placeholder={t("placeholders.textarea")}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy(id, { error })}
                className={inputClass(Boolean(error), "resize-y")}
              />
            ) : (
              <div className="relative">
                <input
                  id={id}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  {...field(name)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy(id, { error })}
                  className={inputClass(Boolean(error), def.unit ? "pe-24" : undefined)}
                />
                {def.unit && (
                  <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-sm text-muted-foreground">
                    {def.unit[locale]}
                  </span>
                )}
              </div>
            )}
          </FieldShell>
        );
      })}
    </div>
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
    </div>
  );
}

// --- Step 4 ------------------------------------------------------------------------

export function ReviewStep({
  form,
  field,
  locale,
  errorOf,
  onEdit,
  privacyHref,
}: StepProps & { onEdit: (step: number) => void; privacyHref: string }) {
  const t = useTranslations("devis");
  // Previous steps are valid here; parse for display (normalized numbers, labels).
  const parsed = devisSchema.safeParse({ ...form.getValues(), consent: true });
  const consentId = fieldId("consent");
  const consentError = errorOf("consent");

  if (!parsed.success) return null;
  const lead = parsed.data;
  const technical = technicalSummary(lead, locale);

  const sections = [
    { title: t("review.activity"), step: 0, rows: [{ label: contactLabels.activity[locale], value: activityLabel(lead.activity, locale) }] },
    { title: t("review.technical"), step: 1, rows: technical, empty: t("review.empty") },
    { title: t("review.contact"), step: 2, rows: contactSummary(lead, locale) },
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
