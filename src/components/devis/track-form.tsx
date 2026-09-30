"use client";

import * as React from "react";
import { Check, Circle, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { FieldError, inputClass } from "@/components/devis/field-shell";
import { activityOptions, labelOf } from "@/lib/devis/options";
import { pick } from "@/lib/devis/form-def";
import { trackDevis, type TrackDevisResult } from "@/lib/devis/track-action";
import type { TrackingView } from "@/lib/devis/tracking";
import { cn } from "@/lib/utils";

type ErrorKey = Extract<TrackDevisResult, { ok: false }>["error"];

/** Tracking lookup (reference + phone) and the progress timeline. */
/** `prefix`: the site's reference initials (GT, HE…), for the hints. */
export function TrackForm({ locale, prefix }: { locale: Locale; prefix: string }) {
  const t = useTranslations("track");
  const [reference, setReference] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState<ErrorKey | null>(null);
  const [view, setView] = React.useState<TrackingView | null>(null);
  const [pending, startTransition] = React.useTransition();
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const resultRef = React.useRef<HTMLHeadingElement>(null);

  // Links from the success screen and emails pre-fill ?ref= (read here so the
  // page itself stays static).
  React.useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      setReference(ref);
      phoneRef.current?.focus();
    }
  }, []);

  React.useEffect(() => {
    if (view) resultRef.current?.focus();
  }, [view]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await trackDevis({ reference, phone });
        if (result.ok) setView(result.view);
        else setError(result.error);
      } catch {
        setError("server");
      }
    });
  }

  if (view) {
    return (
      <Timeline
        view={view}
        locale={locale}
        headingRef={resultRef}
        onReset={() => {
          setView(null);
          setPhone("");
        }}
      />
    );
  }

  const fieldError = (key: ErrorKey) => (error === key ? t(`errors.${key}`, { prefix }) : undefined);
  const refError = fieldError("invalidReference");
  const phoneError = fieldError("invalidPhone");
  const formError = error && !refError && !phoneError ? t(`errors.${error}`, { prefix }) : undefined;

  return (
    <form
      onSubmit={submit}
      noValidate
      className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="track-reference" className="text-foreground text-sm font-medium">
          {t("reference")}
        </label>
        <input
          id="track-reference"
          name="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder={t("referencePlaceholder", { prefix })}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          dir="ltr"
          required
          aria-invalid={Boolean(refError)}
          aria-describedby={refError ? "track-reference-error" : "track-reference-hint"}
          className={inputClass(Boolean(refError), "font-mono uppercase placeholder:normal-case")}
        />
        {refError ? (
          <FieldError id="track-reference" message={refError} />
        ) : (
          <p id="track-reference-hint" className="text-muted-foreground text-xs">
            {t("referenceHint")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="track-phone" className="text-foreground text-sm font-medium">
          {t("phone")}
        </label>
        <input
          ref={phoneRef}
          id="track-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98 123 456"
          dir="ltr"
          required
          aria-invalid={Boolean(phoneError)}
          aria-describedby={phoneError ? "track-phone-error" : "track-phone-hint"}
          className={inputClass(Boolean(phoneError))}
        />
        {phoneError ? (
          <FieldError id="track-phone" message={phoneError} />
        ) : (
          <p id="track-phone-hint" className="text-muted-foreground text-xs">
            {t("phoneHint")}
          </p>
        )}
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {formError}
        </p>
      )}

      <Button type="submit" variant="solar" disabled={pending} className="self-start">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

function Timeline({
  view,
  locale,
  headingRef,
  onReset,
}: {
  view: TrackingView;
  locale: Locale;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
}) {
  const t = useTranslations("track.result");
  const date = new Intl.DateTimeFormat(`${locale}-TN`, {
    dateStyle: "long",
    timeZone: "Africa/Tunis",
  });

  return (
    <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-1">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-foreground text-2xl font-bold tracking-tight outline-none"
        >
          {t("heading")}{" "}
          <span className="font-mono" dir="ltr">
            {view.reference}
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("activity")} {pick(view.service, locale) || labelOf(activityOptions, view.activity, locale)}
        </p>
      </div>

      <ol className="flex flex-col">
        {view.steps.map(({ step, reached, at }, i) => {
          const isCurrent = step === view.current;
          const last = i === view.steps.length - 1;
          // The final step reads as the outcome once the file is done.
          const key = step === "done" && view.outcome ? view.outcome : step;
          const closed = key === "closed";
          return (
            <li
              key={step}
              className="relative flex gap-4 pb-6 last:pb-0"
              aria-current={isCurrent ? "step" : undefined}
            >
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute start-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
                    reached && !isCurrent ? "bg-primary-500" : "bg-border",
                  )}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                  reached
                    ? closed
                      ? "border-muted-foreground bg-muted-foreground text-white"
                      : "border-primary-600 bg-primary-600 text-white"
                    : "border-border bg-background text-muted-foreground",
                  isCurrent && !closed && "ring-primary-500/25 ring-4",
                )}
              >
                {reached ? (
                  closed ? (
                    <X className="size-4" />
                  ) : (
                    <Check className="size-4" strokeWidth={3} />
                  )
                ) : (
                  <Circle className="size-2.5" />
                )}
              </span>
              <div className="flex flex-col gap-0.5 pt-1">
                <p
                  className={cn(
                    "font-semibold",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t(`steps.${key}`)}
                  {isCurrent && (
                    <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200 ms-2 rounded-full px-2 py-0.5 align-middle text-xs font-medium">
                      {t("current")}
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground text-sm">
                  {reached ? (at ? date.format(new Date(at)) : null) : t("pending")}
                </p>
                {isCurrent && <p className="text-foreground/80 text-sm">{t(`stepHelp.${key}`)}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      <Button variant="outline" onClick={onReset} className="self-start">
        <Search className="size-4" />
        {t("another")}
      </Button>
    </div>
  );
}
