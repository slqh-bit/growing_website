"use client";

import * as React from "react";
import { Check, Copy, Home, ListChecks, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function DevisSuccess({
  reference,
  name,
  email,
  onNewRequest,
}: {
  reference: string;
  name: string;
  email?: string;
  onNewRequest: () => void;
}) {
  const t = useTranslations("devis.success");
  const [copied, setCopied] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the reference stays visible and selectable */
    }
  }

  return (
    <div
      style={{ "--reveal-delay": "0.25s" } as React.CSSProperties}
      className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-12">
      <span
        className="pop-in bg-solar inline-flex size-20 items-center justify-center rounded-full text-white shadow-lg"
      >
        <Check className="size-10" strokeWidth={3} aria-hidden />
      </span>

      <div className="flex flex-col gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight text-foreground outline-none">
          {t("title")}
        </h2>
        <p className="max-w-md text-muted-foreground">{t("body", { name })}</p>
      </div>

      <div
        className="reveal-now flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl border border-dashed border-primary-300 bg-primary-50 px-5 py-4 dark:border-primary-800 dark:bg-primary-950/40"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
          {t("reference")}
        </span>
        <div className="flex items-center gap-2">
          <span className="select-all font-mono text-2xl font-bold tracking-wide text-foreground" dir="ltr">
            {reference}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label={t("copy")}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-primary-300 dark:hover:bg-primary-900/50"
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t("keepRef")}</p>
      </div>

      {email && <p className="text-sm text-muted-foreground">{t("emailSent", { email })}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="solar">
          <Link href={{ pathname: "/suivi", query: { ref: reference } }}>
            <ListChecks className="size-4" />
            {t("track")}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" />
            {t("backHome")}
          </Link>
        </Button>
        <Button variant="outline" onClick={onNewRequest}>
          <RotateCcw className="size-4" />
          {t("newRequest")}
        </Button>
      </div>
    </div>
  );
}
