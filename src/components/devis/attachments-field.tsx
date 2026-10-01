"use client";

import * as React from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import {
  MAX_ATTACHMENTS,
  attachmentAccept,
  checkAttachments,
  formatBytes,
  type AttachmentErrorKey,
} from "@/lib/devis/attachments";
import { attachmentsMode, pick, type FormDef } from "@/lib/devis/form-def";
import { FieldError, fieldId } from "./field-shell";

/** The label of a form's attachments (Formulaires de devis → Pièces jointes), else the generic one. */
export function useAttachmentsLabel(def: FormDef | undefined, locale: Locale): string {
  const t = useTranslations("devis.attachments");
  return pick(def?.attachments?.label, locale) || t("label");
}

/**
 * Files attached to a quote request (plans, photos, specifications): picked
 * or dropped, checked at once (type, size, count), listed with a remove
 * button. The server action checks them again.
 */
export function AttachmentsField({
  def,
  locale,
  files,
  onChange,
  error,
  onError,
}: {
  def: FormDef;
  locale: Locale;
  files: File[];
  onChange: (files: File[]) => void;
  /** Translated error message, if any. */
  error?: string;
  onError: (key: AttachmentErrorKey | null) => void;
}) {
  const t = useTranslations("devis.attachments");
  const label = useAttachmentsLabel(def, locale);
  const help = pick(def.attachments?.help, locale) || t("help");
  const required = attachmentsMode(def) === "required";
  const id = fieldId("attachments");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  function add(list: FileList | null) {
    if (!list || list.length === 0) return;
    const known = new Set(files.map((f) => `${f.name}:${f.size}`));
    const next = [...files, ...Array.from(list).filter((f) => !known.has(`${f.name}:${f.size}`))];
    const problem = checkAttachments(next);
    onError(problem);
    if (!problem) onChange(next);
    if (inputRef.current) inputRef.current.value = ""; // picking the same file again still fires
  }

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <p id={`${id}-label`} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </p>
      <p className="-mt-1 text-xs text-muted-foreground">{help}</p>

      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
          dragging ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40" : "border-border bg-surface hover:border-primary-300",
          error && "border-red-400",
          files.length >= MAX_ATTACHMENTS && "pointer-events-none opacity-60",
        )}
      >
        <Paperclip className="size-5 text-primary-600 dark:text-primary-300" aria-hidden />
        <span className="text-sm font-semibold text-foreground">{t("add")}</span>
        <span className="text-xs text-muted-foreground">{t("limits", { max: MAX_ATTACHMENTS })}</span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          accept={attachmentAccept}
          disabled={files.length >= MAX_ATTACHMENTS}
          onChange={(e) => add(e.target.files)}
          aria-labelledby={`${id}-label`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="sr-only"
        />
      </label>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label={t("selected")}>
          {files.map((file, i) => (
            <li
              key={`${file.name}:${file.size}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <bdi className="min-w-0 flex-1 truncate font-medium text-foreground">{file.name}</bdi>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size, locale)}</span>
              <button
                type="button"
                onClick={() => {
                  onError(null);
                  onChange(files.filter((_, j) => j !== i));
                }}
                aria-label={t("remove", { name: file.name })}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-red-950/40"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <FieldError id={id} message={error} />
    </div>
  );
}
