"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

/**
 * Localized error state for public pages (e.g. the database is unreachable).
 * Already-cached pages keep being served; this only shows for uncached ones.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200">
        <AlertTriangle className="size-8" aria-hidden />
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("subtitle")}</p>
      {error.digest && <p className="font-mono text-xs text-muted-foreground">ref: {error.digest}</p>}
      <Button variant="solar" onClick={reset}>
        <RotateCcw className="size-4" />
        {t("retry")}
      </Button>
    </Container>
  );
}
