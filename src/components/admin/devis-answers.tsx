"use client";

import { useFormFields, useTranslation } from "@payloadcms/ui";
import type { Locale } from "@/i18n/config";
import { answersSummary, pick, type Answers, type FormSnapshot } from "@/lib/devis/form-def";

/**
 * Admin view of a quote request's technical answers: the questions of the form
 * as it was when the client filled it (formSnapshot), in the admin's language.
 */
export function DevisAnswers() {
  const { i18n } = useTranslation();
  const snapshot = useFormFields(([fields]) => fields.formSnapshot?.value) as FormSnapshot | null | undefined;
  const answers = useFormFields(([fields]) => fields.technicalDetails?.value) as Answers | null | undefined;
  if (!snapshot?.questions) return null;

  const lang: Locale = i18n.language === "ar" || i18n.language === "en" ? i18n.language : "fr";
  const rows = answersSummary(snapshot, answers ?? {}, lang);

  return (
    <div style={{ marginBottom: "var(--base)" }}>
      <p style={{ fontWeight: 600, marginBottom: "calc(var(--base) / 2)" }}>{pick(snapshot.serviceTitle, lang)}</p>
      {rows.length === 0 ? (
        <p style={{ color: "var(--theme-elevation-500)" }}>—</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid var(--theme-elevation-100)" }}>
                <th
                  scope="row"
                  style={{ textAlign: "start", fontWeight: 400, color: "var(--theme-elevation-600)", padding: "6px 12px 6px 0", width: "40%" }}
                >
                  {row.label}
                </th>
                <td style={{ padding: "6px 0", fontWeight: 600, whiteSpace: "pre-line" }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
