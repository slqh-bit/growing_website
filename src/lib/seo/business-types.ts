import { t3 } from "../../cms/labels";

/**
 * schema.org types a company can announce (Sites → Entreprise → Type
 * d'activité). All are LocalBusiness subtypes, so address, opening hours and
 * geo coordinates stay valid.
 */
export const businessTypes = [
  { value: "Electrician", label: t3("Électricien / installateur solaire", "Electrician / solar installer", "كهربائي / مركّب طاقة شمسية") },
  { value: "HomeAndConstructionBusiness", label: t3("Bâtiment & installations", "Building & installations", "البناء والتركيبات") },
  { value: "ProfessionalService", label: t3("Services professionnels (intégrateur, bureau d'études)", "Professional services (integrator, engineering)", "خدمات مهنية (مُدمج، مكتب دراسات)") },
  { value: "Store", label: t3("Commerce / point de vente", "Store / shop", "متجر / نقطة بيع") },
  { value: "LocalBusiness", label: t3("Entreprise locale (générique)", "Local business (generic)", "مؤسسة محلية (عام)") },
] as const;

export type BusinessType = (typeof businessTypes)[number]["value"];
