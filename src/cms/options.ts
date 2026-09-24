import type { Option } from "payload";
import { featureIconNames, serviceIconNames } from "../lib/icons";
import { t3 } from "./labels";

/** Activities, contact channels and governorates live with the devis form. */
export { activityOptions, contactChannelOptions, governorateOptions } from "../lib/devis/options";

/** Projects.clientType (devplan §4.2). */
export const clientTypeOptions = [
  { value: "residentiel", label: t3("Résidentiel", "Residential", "سكني") },
  { value: "agricole", label: t3("Agricole", "Agricultural", "فلاحي") },
  { value: "industriel", label: t3("Industriel", "Industrial", "صناعي") },
  { value: "public", label: t3("Public / B2G", "Public / B2G", "عمومي") },
] satisfies Option[];

export const serviceIconOptions = serviceIconNames.map((name) => ({ value: name, label: name }));
export const featureIconOptions = featureIconNames.map((name) => ({ value: name, label: name }));

/** Lead workflow (devplan §6): nouveau → contacté → devis envoyé → gagné/perdu. */
export const devisStatusOptions = [
  { value: "nouveau", label: t3("Nouveau", "New", "جديد") },
  { value: "contacte", label: t3("Contacté", "Contacted", "تمّ الاتصال") },
  { value: "devis-envoye", label: t3("Devis envoyé", "Quote sent", "أُرسلت التسعيرة") },
  { value: "gagne", label: t3("Gagné", "Won", "ناجح") },
  { value: "perdu", label: t3("Perdu", "Lost", "خاسر") },
] satisfies Option[];
