import type { Option } from "payload";
import { serviceIconNames } from "../lib/service-icons";
import { t3 } from "./labels";

/** The five activities (devplan §1) — Services.activityKey, DevisRequests.activity. */
export const activityOptions = [
  { value: "raccorde", label: t3("Installation raccordée", "Grid-connected", "تركيب مربوط بالشبكة") },
  { value: "pompage", label: t3("Pompage solaire", "Solar pumping", "الضخّ الشمسي") },
  { value: "isole", label: t3("Site isolé", "Off-grid", "موقع معزول") },
  { value: "bt", label: t3("Basse tension (BT)", "Low voltage (LV)", "الجهد المنخفض") },
  { value: "mt", label: t3("Moyenne tension (MT)", "Medium voltage (MV)", "الجهد المتوسط") },
] satisfies Option[];

/** Projects.clientType (devplan §4.2). */
export const clientTypeOptions = [
  { value: "residentiel", label: t3("Résidentiel", "Residential", "سكني") },
  { value: "agricole", label: t3("Agricole", "Agricultural", "فلاحي") },
  { value: "industriel", label: t3("Industriel", "Industrial", "صناعي") },
  { value: "public", label: t3("Public / B2G", "Public / B2G", "عمومي") },
] satisfies Option[];

export const serviceIconOptions = serviceIconNames.map((name) => ({ value: name, label: name }));

/** Lead workflow (devplan §6): nouveau → contacté → devis envoyé → gagné/perdu. */
export const devisStatusOptions = [
  { value: "nouveau", label: t3("Nouveau", "New", "جديد") },
  { value: "contacte", label: t3("Contacté", "Contacted", "تمّ الاتصال") },
  { value: "devis-envoye", label: t3("Devis envoyé", "Quote sent", "أُرسلت التسعيرة") },
  { value: "gagne", label: t3("Gagné", "Won", "ناجح") },
  { value: "perdu", label: t3("Perdu", "Lost", "خاسر") },
] satisfies Option[];

export const contactChannelOptions = [
  { value: "call", label: t3("Appel", "Phone call", "مكالمة") },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
] satisfies Option[];

/** The 24 Tunisian governorates (devis step 3). */
export const governorateOptions = [
  ["ariana", "Ariana", "أريانة"],
  ["beja", "Béja", "باجة"],
  ["ben-arous", "Ben Arous", "بن عروس"],
  ["bizerte", "Bizerte", "بنزرت"],
  ["gabes", "Gabès", "قابس"],
  ["gafsa", "Gafsa", "قفصة"],
  ["jendouba", "Jendouba", "جندوبة"],
  ["kairouan", "Kairouan", "القيروان"],
  ["kasserine", "Kasserine", "القصرين"],
  ["kebili", "Kébili", "قبلي"],
  ["kef", "Le Kef", "الكاف"],
  ["mahdia", "Mahdia", "المهدية"],
  ["manouba", "La Manouba", "منوبة"],
  ["medenine", "Médenine", "مدنين"],
  ["monastir", "Monastir", "المنستير"],
  ["nabeul", "Nabeul", "نابل"],
  ["sfax", "Sfax", "صفاقس"],
  ["sidi-bouzid", "Sidi Bouzid", "سيدي بوزيد"],
  ["siliana", "Siliana", "سليانة"],
  ["sousse", "Sousse", "سوسة"],
  ["tataouine", "Tataouine", "تطاوين"],
  ["tozeur", "Tozeur", "توزر"],
  ["tunis", "Tunis", "تونس"],
  ["zaghouan", "Zaghouan", "زغوان"],
].map(([value, fr, ar]) => ({ value: value!, label: t3(fr!, fr!, ar!) })) satisfies Option[];
