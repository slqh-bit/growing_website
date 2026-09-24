"use client";

import { AlertCircle } from "lucide-react";
import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";

/** DOM id for a form path: "pompage.depthM" → "devis-pompage-depthM". */
export const fieldId = (name: string) => `devis-${name.replace(/\./g, "-")}`;

/** aria-describedby for an input: its error, else its hint. */
export function describedBy(id: string, { hint, error }: { hint?: string; error?: string }) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function inputClass(invalid: boolean, extra?: string) {
  return cn(
    // text-base (16px) keeps iOS from zooming into the field
    "block w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    invalid ? "border-red-500 ring-1 ring-red-500/30" : "border-border hover:border-primary-300",
    extra,
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/** Label (+ required star, + help tooltip), control, hint and error. */
export function FieldShell({
  id,
  label,
  required,
  help,
  helpLabel,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  helpLabel: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="text-red-600 dark:text-red-400" aria-hidden>
              {" "}
              *
            </span>
          )}
        </label>
        {help && <InfoTip content={help} label={`${helpLabel} — ${label}`} />}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={id} message={error} />
    </div>
  );
}
