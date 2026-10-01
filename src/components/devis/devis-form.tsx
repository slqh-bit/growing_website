"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, RotateCcw, SendHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { get, useForm, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rtlLocales, type Locale } from "@/i18n/config";
import { submitDevis } from "@/lib/devis/actions";
import { emptyDevisValues, stepSchema, type DevisErrorKey, type DevisFormValues } from "@/lib/devis/schema";
import { checkAttachments, type AttachmentErrorKey } from "@/lib/devis/attachments";
import { attachmentsMode } from "@/lib/devis/form-def";
import type { DevisChoice, DevisCompany } from "@/lib/devis/choices";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepProgress } from "./step-progress";
import { ActivityStep, ContactStep, ReviewStep, TechnicalStep, type CompanyState, type FilesState } from "./steps";
import { DevisSuccess } from "./devis-success";

const STEP_KEYS = ["activity", "technical", "contact", "review"] as const;
const LAST_STEP = STEP_KEYS.length - 1;

type Banner = "rateLimited" | "server" | "network" | "fixErrors";

declare global {
  interface Window {
    /** Plausible Analytics (loaded only when PLAUSIBLE_DOMAIN is set). */
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

/** Which step owns a form path (to jump back to a server-side error). */
function stepOfPath(path: string): number {
  const root = path.split(".")[0] ?? "";
  if (root === "service") return 0;
  if (root === "answers" || root === "attachments") return 1;
  if (root === "consent") return 3;
  return 2;
}

/**
 * Multi-step devis form (plan §6): service → technical needs (the questions
 * of the service's form, built in the admin) → site & contact → review. Each
 * step is validated with its own Zod schema before moving on; the server
 * action re-validates everything against the form read on the server.
 */
export function DevisForm({
  activities,
  companies = [],
  locale,
  privacyHref,
}: {
  /** The site's services that have a quote form. */
  activities: DevisChoice[];
  /** Group site: the companies to choose from first (else empty). */
  companies?: DevisCompany[];
  locale: Locale;
  privacyHref: string;
}) {
  const t = useTranslations("devis");
  const rtl = rtlLocales.includes(locale);

  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [success, setSuccess] = React.useState<{ reference: string; name: string; email?: string } | null>(null);
  // Attachments live outside react-hook-form (File objects, checked on their own).
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileError, setFileError] = React.useState<AttachmentErrorKey | "required" | null>(null);
  const attachments: FilesState = { files, setFiles, error: fileError, setError: setFileError };
  // Group site: which company the request is for (its services are shown).
  const [company, setCompany] = React.useState<string | null>(companies.length === 1 ? companies[0]!.key : null);
  const companyState: CompanyState = { companies, company, setCompany };

  // The resolver validates only the current step's schema (step 2: the chosen service's questions).
  const stepRef = React.useRef(0);
  const resolver = React.useMemo<Resolver<DevisFormValues>>(
    () => (values, context, options) =>
      zodResolver(stepSchema(stepRef.current, activities, values.service))(values, context, options),
    [activities],
  );
  const form = useForm<DevisFormValues>({ defaultValues: emptyDevisValues, resolver, mode: "onTouched" });

  const startedAt = React.useRef(0);
  const honeypot = React.useRef<HTMLInputElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const hasNavigated = React.useRef(false);

  React.useEffect(() => {
    startedAt.current = Date.now();
    // Service pages link here with ?service=<slug> (older links: ?activite=<key>) to preselect it.
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("service");
    const key = params.get("activite");
    const preset = activities.find((a) => (slug && a.slug === slug) || (key && a.activityKey === key));
    if (preset) form.setValue("service", preset.id);
    // Group site: ?societe=hikview preselects the company; a preset service implies its own.
    const wanted = preset?.company ?? params.get("societe");
    if (wanted && companies.some((c) => c.key === wanted)) setCompany(wanted);
  }, [form, activities, companies]);

  // Move focus to the new step's heading (screen readers announce it).
  React.useEffect(() => {
    if (hasNavigated.current) headingRef.current?.focus();
  }, [step]);

  /**
   * register() + live re-validation of fields that currently show an error:
   * the message clears as soon as the value is fixed. Otherwise ("onTouched")
   * it would clear on blur — i.e. on the mousedown of the next button click —
   * and the resulting layout shift would swallow that click.
   */
  const field = (name: Path<DevisFormValues>) =>
    form.register(name, {
      onChange: () => {
        if (get(form.formState.errors, name)) void form.trigger(name);
      },
    });

  const errorOf = (name: string): string | undefined => {
    const key = get(form.formState.errors, name)?.message as DevisErrorKey | undefined;
    return key ? t(`errors.${key}`) : undefined;
  };

  function goTo(target: number, { keepErrors = false } = {}) {
    if (!keepErrors) form.clearErrors();
    hasNavigated.current = true;
    setDirection(target >= step ? 1 : -1);
    stepRef.current = target;
    setStep(target);
    setBanner(null);
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      cardRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function focusFirstInvalid() {
    requestAnimationFrame(() => {
      const el = cardRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      // A radiogroup isn't focusable itself: focus its first radio.
      (el?.matches("input, select, textarea") ? el : el?.querySelector<HTMLElement>("input"))?.focus();
    });
  }

  /** The chosen service's attachments rule, checked with the technical step. */
  function checkFiles(): boolean {
    const def = activities.find((a) => a.id === form.getValues("service"))?.form;
    const mode = def ? attachmentsMode(def) : "off";
    const problem = mode === "off" ? null : mode === "required" && files.length === 0 ? "required" : checkAttachments(files);
    setFileError(problem);
    return problem === null;
  }

  async function next() {
    const valid = await form.trigger();
    const filesValid = step !== 1 || checkFiles();
    if (!valid || !filesValid) return focusFirstInvalid();
    goTo(step + 1);
  }

  async function submit() {
    setBanner(null);
    if (!(await form.trigger())) return focusFirstInvalid();

    const values = form.getValues();
    const def = activities.find((a) => a.id === values.service)?.form;
    const upload = new FormData();
    if (def && attachmentsMode(def) !== "off") files.forEach((f) => upload.append("files", f));
    setSubmitting(true);
    try {
      const result = await submitDevis(
        values,
        { locale, website: honeypot.current?.value ?? "", startedAt: startedAt.current },
        upload,
      );
      if (result.ok) {
        // Conversion goal (no personal data: service and language only).
        const service = activities.find((a) => a.id === values.service);
        window.plausible?.("Devis", { props: { activity: service?.slug ?? "", locale } });
        setSuccess({ reference: result.reference, name: values.fullName.trim(), email: values.email.trim() || undefined });
        return;
      }
      if (result.error === "validation") {
        const entries = Object.entries(result.fieldErrors);
        entries.forEach(([path, message]) =>
          path === "attachments"
            ? setFileError(message as AttachmentErrorKey | "required")
            : form.setError(path as Path<DevisFormValues>, { type: "server", message }),
        );
        const target = Math.min(...entries.map(([path]) => stepOfPath(path)));
        if (target !== step) goTo(target, { keepErrors: true });
        setBanner("fixErrors");
        focusFirstInvalid();
        return;
      }
      setBanner(result.error);
    } catch {
      setBanner("network");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    form.reset(emptyDevisValues);
    setCompany(companies.length === 1 ? companies[0]!.key : null);
    setFiles([]);
    setFileError(null);
    startedAt.current = Date.now();
    hasNavigated.current = false;
    stepRef.current = 0;
    setStep(0);
    setSuccess(null);
  }

  if (success) {
    return <DevisSuccess {...success} onNewRequest={reset} />;
  }

  // Slide in from the "forward" side; mirrored in RTL. Reduced-motion users
  // get no animation (global rule in globals.css).
  const offset = direction * 32 * (rtl ? -1 : 1);
  const labels = STEP_KEYS.map((k) => t(`steps.${k}`));

  return (
    <div ref={cardRef} className="scroll-mt-24 rounded-3xl border border-border bg-surface shadow-sm">
      <StepProgress labels={labels} current={step} onGoTo={(i) => goTo(i)} />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < LAST_STEP) void next();
          else void submit();
        }}
        className="px-5 py-6 sm:px-8 sm:py-8"
      >
        {/* Honeypot: bots fill every input in the markup. Not rendered (display:none) and
            given a meaningless name/label, so browser autofill and password managers —
            which filled the old sr-only "website" field for real visitors — skip it. */}
        <div aria-hidden="true" className="hidden">
          <label>
            gt-hp
            <input
              ref={honeypot}
              type="text"
              name="gt_hp_ref"
              tabIndex={-1}
              autoComplete="off"
              data-1p-ignore=""
              data-lpignore="true"
              data-bwignore=""
              data-form-type="other"
              defaultValue=""
            />
          </label>
        </div>

        <div
          key={step}
          className={hasNavigated.current ? "step-in" : undefined}
          style={{ "--step-offset": `${offset}px` } as React.CSSProperties}
        >
            <div className="mb-6 flex flex-col gap-1">
              <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold tracking-tight text-foreground outline-none sm:text-2xl">
                {labels[step]}
              </h2>
              <p className="text-sm text-muted-foreground">{t(`stepIntro.${STEP_KEYS[step]}`)}</p>
            </div>

            {step === 0 && (
              <ActivityStep
                form={form}
                field={field}
                locale={locale}
                errorOf={errorOf}
                activities={activities}
                companyState={companyState}
              />
            )}
            {step === 1 && (
              <TechnicalStep
                form={form}
                field={field}
                locale={locale}
                errorOf={errorOf}
                activities={activities}
                attachments={attachments}
              />
            )}
            {step === 2 && <ContactStep form={form} field={field} locale={locale} errorOf={errorOf} />}
            {step === 3 && (
              <ReviewStep
                form={form}
                field={field}
                locale={locale}
                errorOf={errorOf}
                activities={activities}
                onEdit={(s) => goTo(s)}
                privacyHref={privacyHref}
                files={files}
                companies={companies}
              />
            )}
        </div>

        {banner && (
          <div
            role="alert"
            className={cn(
              "mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm",
              banner === "fixErrors"
                ? "border-accent-300 bg-accent-50 text-accent-900 dark:border-accent-800 dark:bg-accent-950/30 dark:text-accent-100"
                : "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
            )}
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="flex-1">{t(`errors.${banner}`)}</p>
            {banner !== "fixErrors" && (
              <button
                type="button"
                onClick={() => void submit()}
                className="inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-2 hover:underline"
              >
                <RotateCcw className="size-4" aria-hidden />
                {t("errors.retry")}
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} disabled={submitting}>
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t("back")}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">{t("requiredNote")}</span>
            )}
          </div>

          {step < LAST_STEP ? (
            <Button type="submit" variant="solar" size="lg">
              {t("next")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          ) : (
            <Button type="submit" variant="solar" size="lg" disabled={submitting} aria-busy={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  {t("submit")}
                  <SendHorizontal className="size-4 rtl:rotate-180" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
