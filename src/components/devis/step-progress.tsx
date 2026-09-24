"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * "Étape 2/4" progress indicator: label, animated bar and numbered steps.
 * Completed steps are buttons (go back to edit); future steps are inert.
 */
export function StepProgress({
  labels,
  current,
  onGoTo,
}: {
  labels: string[];
  current: number;
  onGoTo: (step: number) => void;
}) {
  const t = useTranslations("devis");
  const total = labels.length;
  const percent = Math.round(((current + 1) / total) * 100);

  return (
    <div className="border-b border-border px-5 py-5 sm:px-8">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-primary-700 dark:text-primary-300">
          {t("stepOf", { current: current + 1, total })}
        </span>
        <span className="text-muted-foreground sm:hidden">{labels[current]}</span>
      </div>

      <div
        role="progressbar"
        aria-label={t("stepOf", { current: current + 1, total })}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-valuetext={`${t("stepOf", { current: current + 1, total })} — ${labels[current]}`}
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
      >
        {/* Block-level bar: grows from the inline start, so it fills right-to-left in Arabic. */}
        <div className="bg-solar h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
      </div>

      <ol className="mt-4 hidden grid-cols-4 gap-2 sm:grid">
        {labels.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const content = (
            <>
              <span
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done && "bg-primary-600 text-white",
                  active && "bg-solar text-white shadow-md",
                  !done && !active && "border border-border bg-surface text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  active ? "text-foreground" : done ? "text-primary-700 dark:text-primary-300" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </>
          );
          return (
            <li key={label} aria-current={active ? "step" : undefined}>
              {done ? (
                <button
                  type="button"
                  onClick={() => onGoTo(i)}
                  className="flex w-full items-center gap-2 rounded-lg p-1 text-start transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-center gap-2 p-1">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
