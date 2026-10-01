"use client";

import type { DefaultCellComponentProps } from "payload";
import { useTranslation } from "@payloadcms/ui";
import { daysLeft, expiryLevel, type ExpiryLevel } from "@/lib/documents";

type Lang = "fr" | "en" | "ar";

const text: Record<Lang, { never: string; expired: string; today: string; days: (n: number) => string }> = {
  fr: { never: "Sans expiration", expired: "Expiré", today: "Expire aujourd'hui", days: (n) => `Expire dans ${n} j` },
  en: { never: "No expiry", expired: "Expired", today: "Expires today", days: (n) => `Expires in ${n} d` },
  ar: { never: "دون تاريخ انتهاء", expired: "منتهية الصلاحية", today: "تنتهي اليوم", days: (n) => `تنتهي بعد ${n} يوم` },
};

const colours: Record<ExpiryLevel, { bg: string; fg: string }> = {
  valid: { bg: "var(--theme-success-100)", fg: "var(--theme-success-800)" },
  soon: { bg: "var(--theme-warning-100)", fg: "var(--theme-warning-800)" },
  urgent: { bg: "var(--theme-error-100)", fg: "var(--theme-error-800)" },
  expired: { bg: "var(--theme-error-500)", fg: "#fff" },
};

/** A document's validity date with how long it has left (Documents administratifs list). */
export function ValidityBadge({ validUntil, lang }: { validUntil: string | null | undefined; lang: Lang }) {
  const t = text[lang];
  const days = daysLeft(validUntil);
  if (days === null) return <span style={{ color: "var(--theme-elevation-500)" }}>{t.never}</span>;
  const level = expiryLevel(validUntil);
  const date = new Intl.DateTimeFormat("fr-TN", { dateStyle: "short", timeZone: "Africa/Tunis" }).format(new Date(validUntil!));
  const label = level === "expired" ? t.expired : level === "valid" ? null : days === 0 ? t.today : t.days(days);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span dir="ltr">{date}</span>
      {label && (
        <span
          style={{
            background: colours[level].bg,
            color: colours[level].fg,
            borderRadius: 999,
            padding: "1px 8px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export function ValidityCell({ cellData }: DefaultCellComponentProps) {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === "ar" || i18n.language === "en" ? i18n.language : "fr";
  return <ValidityBadge validUntil={typeof cellData === "string" ? cellData : null} lang={lang} />;
}
