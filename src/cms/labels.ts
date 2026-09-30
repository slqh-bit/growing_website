/**
 * Trilingual admin label helper. Payload picks the entry matching the admin
 * UI language (fr / en / ar), so editors see field names in their language.
 */
export const t3 = (fr: string, en: string, ar: string) => ({ fr, en, ar });

/** Admin sidebar groups. */
export const groups = {
  content: t3("Contenu", "Content", "المحتوى"),
  leads: t3("Demandes", "Leads", "الطلبات"),
  tenders: t3("Appels d'offres", "Tenders", "طلبات العروض"),
  media: t3("Médias", "Media", "الوسائط"),
  settings: t3("Paramètres", "Settings", "الإعدادات"),
  admin: t3("Administration", "Administration", "الإدارة"),
} as const;
