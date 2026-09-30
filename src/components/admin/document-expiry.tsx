import type { ServerProps } from "payload";
import { EXPIRY_WARNING_DAYS, expiryLevel } from "@/lib/documents";
import { ValidityBadge } from "./validity-cell";

type Lang = "fr" | "en" | "ar";

const text: Record<Lang, { title: string; intro: string }> = {
  fr: {
    title: "Documents administratifs à renouveler",
    intro: `Expirés ou expirant dans les ${EXPIRY_WARNING_DAYS} jours. Un document expiré n'est plus proposé sur le site.`,
  },
  en: {
    title: "Company documents to renew",
    intro: `Expired or expiring within ${EXPIRY_WARNING_DAYS} days. An expired document is no longer offered on the site.`,
  },
  ar: {
    title: "وثائق إدارية يجب تجديدها",
    intro: `منتهية الصلاحية أو تنتهي خلال ${EXPIRY_WARNING_DAYS} يوماً. لا تُعرض الوثيقة المنتهية على الموقع.`,
  },
};

/**
 * Admin dashboard: the company documents (of the user's sites) that are
 * expired or about to expire, most urgent first. Hidden when there are none.
 */
export async function DocumentExpiry({ payload, user, i18n }: ServerProps) {
  if (!user) return null;
  const lang: Lang = i18n.language === "ar" || i18n.language === "en" ? i18n.language : "fr";
  const horizon = new Date(Date.now() + (EXPIRY_WARNING_DAYS + 1) * 24 * 60 * 60 * 1000);
  const { docs } = await payload.find({
    collection: "company-documents",
    where: { validUntil: { less_than_equal: horizon.toISOString() } },
    sort: "validUntil",
    depth: 1,
    limit: 50,
    overrideAccess: false,
    user,
    locale: lang,
  });
  const due = docs.filter((d) => expiryLevel(d.validUntil) !== "valid");
  if (due.length === 0) return null;
  const t = text[lang];

  return (
    <div
      style={{
        border: "1px solid var(--theme-warning-300)",
        background: "var(--theme-warning-50)",
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: "var(--base)",
      }}
    >
      <h3 style={{ margin: 0 }}>{t.title}</h3>
      <p style={{ margin: "4px 0 12px", color: "var(--theme-elevation-600)" }}>{t.intro}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {due.map((doc) => (
          <li key={doc.id} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <a href={`/admin/collections/company-documents/${doc.id}`} style={{ fontWeight: 600 }}>
              {doc.title}
            </a>
            {typeof doc.site === "object" && doc.site && (
              <span style={{ color: "var(--theme-elevation-500)" }}>{doc.site.companyName}</span>
            )}
            <ValidityBadge validUntil={doc.validUntil} lang={lang} />
          </li>
        ))}
      </ul>
    </div>
  );
}
