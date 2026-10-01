import { t3 } from "../../src/cms/labels";
import type { AttachmentsMode, QuestionDef } from "../../src/lib/devis/form-def";
import {
  phaseOptions,
  roofTypeOptions,
  waterSourceOptions,
  type LabeledOption,
} from "../../src/lib/devis/options";
import type { SiteKey } from "../../src/sites/config";
import { hikviewDevisForms } from "./hikview-devis-forms";

/**
 * Quote forms (Contenu → Formulaires de devis) and the services they belong
 * to. Growing's four forms carry over the questions of the former typed form
 * (same keys, labels and help) plus the plan's additions: usage and voltage
 * for grid-connected systems, street lighting for off-grid, and utility-scale
 * PV plants. Hikview's forms are in ./hikview-devis-forms. Seed data only:
 * once created, forms are edited in the admin.
 */
export interface SeedForm {
  site: SiteKey;
  /** Services (slugs) that use this form. */
  services: string[];
  title: string;
  /** Files the client may attach (default: optional, generic label). */
  attachments?: {
    mode?: AttachmentsMode;
    label?: ReturnType<typeof t3>;
    help?: ReturnType<typeof t3>;
  };
  questions: (QuestionDef & { label: ReturnType<typeof t3> })[];
}

const opts = (options: readonly LabeledOption[]) => options.map((o) => ({ value: o.value, label: o.label }));
const opt = (value: string, fr: string, en: string, ar: string) => ({ value, label: t3(fr, en, ar) });

const kwh = t3("kWh", "kWh", "ك.و.س");

/** Also set on existing databases by the 5b migration. */
export const centraleAttachments = {
  label: t3("Documents du projet", "Project documents", "وثائق المشروع"),
  help: t3(
    "Plan ou coordonnées du terrain, factures STEG MT, études déjà réalisées…",
    "Land plan or coordinates, MV STEG bills, studies already carried out…",
    "مخطط الأرض أو إحداثياتها، فواتير الستاغ بالجهد المتوسط، الدراسات المنجزة…",
  ),
};

const growingDevisForms: SeedForm[] = [
  {
    site: "growing",
    services: ["installation-raccordee"],
    title: "Installation raccordée au réseau STEG (BT/MT)",
    questions: [
      {
        name: "usage",
        type: "select",
        required: true,
        label: t3("Pour quel usage ?", "For what use?", "لأيّ استعمال؟"),
        options: [
          opt("domestique", "Domestique (maison)", "Home", "منزلي"),
          opt("commercial", "Commercial (commerce, bureau, hôtel…)", "Commercial (shop, office, hotel…)", "تجاري (محلّ، مكتب، نزل…)"),
          opt("industriel", "Industriel", "Industrial", "صناعي"),
          opt("agricole", "Agricole", "Agricultural", "فلاحي"),
        ],
      },
      {
        name: "voltage",
        type: "select",
        label: t3("Raccordement STEG", "STEG connection", "الربط بالستاغ"),
        help: t3(
          "La plupart des maisons et commerces sont en basse tension (BT) ; les usines et grandes exploitations, avec un poste de transformation, en moyenne tension (MT). Indiqué sur votre facture.",
          "Most homes and shops are on low voltage (LV); factories and large farms with a transformer substation on medium voltage (MV). Shown on your bill.",
          "أغلب المنازل والمحلات بالجهد المنخفض؛ والمصانع والضيعات الكبرى ذات محطة التحويل بالجهد المتوسط. مذكور في فاتورتك.",
        ),
        options: [
          opt("bt", "Basse tension (BT)", "Low voltage (LV)", "الجهد المنخفض"),
          opt("mt", "Moyenne tension (MT)", "Medium voltage (MV)", "الجهد المتوسط"),
        ],
      },
      {
        name: "monthlyBillTnd",
        type: "number",
        requiredGroup: "consumption",
        label: t3("Facture STEG mensuelle", "Monthly STEG bill", "فاتورة الستاغ الشهرية"),
        unit: t3("TND", "TND", "د.ت"),
        help: t3(
          "Montant moyen de votre facture STEG par mois. Indiquez la facture OU la consommation.",
          "Average amount of your monthly STEG bill. Give the bill OR the consumption.",
          "المعدّل الشهري لفاتورة الستاغ. أدخل الفاتورة أو الاستهلاك.",
        ),
        max: 1_000_000,
      },
      {
        name: "monthlyConsumptionKwh",
        type: "number",
        requiredGroup: "consumption",
        label: t3("ou consommation mensuelle", "or monthly consumption", "أو الاستهلاك الشهري"),
        unit: kwh,
        help: t3("Indiquée sur votre facture STEG (en kWh).", "Shown on your STEG bill (in kWh).", "مذكور في فاتورة الستاغ (بالكيلوواط ساعة)."),
        max: 10_000_000,
      },
      { name: "roofType", type: "select", label: t3("Type de toiture", "Roof type", "نوع السطح"), options: opts(roofTypeOptions) },
      {
        name: "roofSurfaceM2",
        type: "number",
        label: t3("Surface disponible", "Available area", "المساحة المتاحة"),
        unit: t3("m²", "m²", "م²"),
        help: t3(
          "Surface de toit ou de terrain libre et ensoleillée. Comptez ≈ 5 à 6 m² par kWc.",
          "Free, sunny roof or ground area. Allow ≈ 5–6 m² per kWp.",
          "مساحة السطح أو الأرض الشاغرة والمشمسة. احتسب ≈ 5 إلى 6 م² لكل كيلوواط ذروة.",
        ),
        max: 1_000_000,
      },
      {
        name: "phase",
        type: "select",
        label: t3("Type de branchement", "Supply type", "نوع التوصيل"),
        options: opts(phaseOptions),
        help: t3(
          "Monophasé : habitations courantes. Triphasé : gros consommateurs, ateliers, agriculture. Indiqué sur votre compteur/facture.",
          "Single-phase: typical homes. Three-phase: large consumers, workshops, farms. Shown on your meter/bill.",
          "أحادي الطور: المساكن العادية. ثلاثي الطور: كبار المستهلكين والورشات والفلاحة. مذكور على العدّاد أو الفاتورة.",
        ),
        showIf: { field: "voltage", equals: "bt" },
      },
    ],
  },
  {
    site: "growing",
    services: ["pompage-solaire"],
    title: "Pompage solaire",
    questions: [
      {
        name: "waterSource",
        type: "select",
        required: true,
        label: t3("Source d'eau", "Water source", "مصدر المياه"),
        options: opts(waterSourceOptions),
      },
      {
        name: "flowM3PerDay",
        type: "number",
        required: true,
        label: t3("Besoin en eau", "Water needed", "الحاجة إلى المياه"),
        unit: t3("m³/jour", "m³/day", "م³/يوم"),
        help: t3(
          "Volume d'eau à pomper par jour (irrigation, abreuvement…). 1 m³ = 1 000 litres.",
          "Volume of water to pump per day (irrigation, livestock…). 1 m³ = 1,000 litres.",
          "كمية المياه اللازم ضخّها يومياً (ريّ، سقي الماشية…). 1 م³ = 1000 لتر.",
        ),
        max: 100_000,
      },
      {
        name: "depthM",
        type: "number",
        label: t3("Profondeur du puits/forage", "Well/borehole depth", "عمق البئر/الحفر"),
        unit: t3("m", "m", "م"),
        max: 3_000,
      },
      {
        name: "headM",
        type: "number",
        label: t3("Hauteur manométrique (HMT)", "Total dynamic head (TDH)", "الارتفاع المانومتري الكلي"),
        unit: t3("m", "m", "م"),
        help: t3(
          "HMT = hauteur totale à vaincre : profondeur du niveau d'eau + hauteur jusqu'au réservoir + pertes dans les tuyaux. Si vous ne savez pas, laissez vide.",
          "TDH = total height to overcome: water level depth + height to the tank + pipe losses. Leave empty if unsure.",
          "الارتفاع المانومتري = عمق مستوى الماء + الارتفاع حتى الخزان + ضياع الأنابيب. اتركه فارغاً إن لم تكن متأكداً.",
        ),
        max: 3_000,
      },
      {
        name: "existingPumpCv",
        type: "number",
        label: t3("Pompe existante", "Existing pump", "المضخة الحالية"),
        unit: t3("CV", "HP", "حصان"),
        help: t3(
          "Puissance de la pompe actuelle (en chevaux), si vous en avez une.",
          "Power of your current pump (horsepower), if any.",
          "قدرة المضخة الحالية (بالحصان) إن وُجدت.",
        ),
        max: 10_000,
      },
    ],
  },
  {
    site: "growing",
    services: ["site-isole"],
    title: "Sites isolés & éclairage public solaire",
    questions: [
      {
        name: "subtype",
        type: "radio",
        required: true,
        label: t3("Votre projet", "Your project", "مشروعك"),
        options: [
          opt("site-isole", "Site isolé (maison, ferme, relais…)", "Off-grid site (home, farm, relay…)", "موقع معزول (منزل، ضيعة، محطة…)"),
          opt("eclairage-public", "Éclairage public solaire", "Solar street lighting", "إنارة عمومية شمسية"),
        ],
      },
      {
        name: "dailyConsumptionKwh",
        type: "number",
        required: true,
        label: t3("Consommation journalière", "Daily consumption", "الاستهلاك اليومي"),
        unit: t3("kWh/jour", "kWh/day", "ك.و.س/يوم"),
        help: t3(
          "Énergie utilisée par jour. Exemple : 10 lampes (100 W) 5 h + réfrigérateur ≈ 2,5 kWh/jour.",
          "Energy used per day. Example: 10 lamps (100 W) for 5 h + a fridge ≈ 2.5 kWh/day.",
          "الطاقة المستعملة يومياً. مثال: 10 مصابيح (100 واط) لمدة 5 ساعات + ثلاجة ≈ 2.5 ك.و.س/يوم.",
        ),
        max: 100_000,
        showIf: { field: "subtype", equals: "site-isole" },
      },
      {
        name: "autonomyDays",
        type: "number",
        label: t3("Jours d'autonomie", "Days of autonomy", "أيام الاستقلالية"),
        unit: t3("jours", "days", "أيام"),
        help: t3(
          "Nombre de jours sans soleil que les batteries doivent couvrir (souvent 1 à 3).",
          "Number of sunless days the batteries must cover (often 1–3).",
          "عدد الأيام بدون شمس التي يجب أن تغطيها البطاريات (غالباً من 1 إلى 3).",
        ),
        max: 30,
        showIf: { field: "subtype", equals: "site-isole" },
      },
      {
        name: "hasGenset",
        type: "checkbox",
        label: t3("J'ai déjà un groupe électrogène", "I already have a generator", "لديّ مولّد كهربائي"),
        showIf: { field: "subtype", equals: "site-isole" },
      },
      {
        name: "criticalLoads",
        type: "textarea",
        label: t3("Charges critiques", "Critical loads", "الأحمال الحرجة"),
        help: t3(
          "Équipements qui ne doivent jamais s'arrêter (pompe, chambre froide, relais télécom…).",
          "Equipment that must never stop (pump, cold room, telecom relay…).",
          "تجهيزات يجب ألا تتوقف أبداً (مضخة، غرفة تبريد، محطة اتصالات…).",
        ),
        showIf: { field: "subtype", equals: "site-isole" },
      },
      {
        name: "lightPoints",
        type: "number",
        required: true,
        label: t3("Nombre de lampadaires", "Number of street lights", "عدد أعمدة الإنارة"),
        min: 1,
        max: 100_000,
        showIf: { field: "subtype", equals: "eclairage-public" },
      },
      {
        name: "poleHeightM",
        type: "number",
        label: t3("Hauteur des mâts", "Pole height", "ارتفاع الأعمدة"),
        unit: t3("m", "m", "م"),
        help: t3(
          "Souvent 4 à 6 m pour une rue ou une place, 8 à 10 m pour une route.",
          "Often 4–6 m for a street or square, 8–10 m for a road.",
          "غالباً 4 إلى 6 م للأنهج والساحات، و8 إلى 10 م للطرقات.",
        ),
        max: 30,
        showIf: { field: "subtype", equals: "eclairage-public" },
      },
      {
        name: "roadType",
        type: "select",
        label: t3("Lieu à éclairer", "Area to light", "المكان المراد إنارته"),
        options: [
          opt("rue", "Rue, quartier", "Street, neighbourhood", "نهج، حيّ"),
          opt("route", "Route", "Road", "طريق"),
          opt("place", "Place, jardin public", "Square, public garden", "ساحة، حديقة عمومية"),
          opt("parking", "Parking", "Car park", "مأوى سيارات"),
          opt("zone-industrielle", "Zone industrielle", "Industrial zone", "منطقة صناعية"),
        ],
        showIf: { field: "subtype", equals: "eclairage-public" },
      },
      {
        name: "commissioningBody",
        type: "select",
        label: t3("Vous êtes", "You are", "أنت"),
        options: [
          opt("commune", "Une commune", "A municipality", "بلدية"),
          opt("administration", "Une administration / entreprise publique", "A public body / state company", "إدارة / منشأة عمومية"),
          opt("entreprise", "Une entreprise", "A company", "مؤسسة"),
          opt("particulier", "Un particulier", "An individual", "فرد"),
        ],
        showIf: { field: "subtype", equals: "eclairage-public" },
      },
    ],
  },
  {
    site: "growing",
    services: ["centrale-photovoltaique"],
    title: "Centrale photovoltaïque (1 à 10 MW)",
    attachments: centraleAttachments,
    questions: [
      {
        name: "regime",
        type: "radio",
        required: true,
        label: t3("Régime du projet", "Project scheme", "نظام المشروع"),
        help: t3(
          "Autoproduction : la centrale couvre votre consommation en MT. Autorisation / concession : l'électricité est vendue à la STEG.",
          "Self-generation: the plant covers your MV consumption. Authorisation / concession: the electricity is sold to STEG.",
          "الإنتاج الذاتي: تغطي المحطة استهلاكك بالجهد المتوسط. الترخيص / اللزمة: تُباع الكهرباء للستاغ.",
        ),
        options: [
          opt("autoproduction", "Autoproduction MT", "MV self-generation", "إنتاج ذاتي بالجهد المتوسط"),
          opt("autorisation-concession", "Autorisation / concession (vente STEG)", "Authorisation / concession (sale to STEG)", "ترخيص / لزمة (بيع للستاغ)"),
        ],
      },
      {
        name: "targetPowerMw",
        type: "number",
        required: true,
        label: t3("Puissance visée", "Target capacity", "القدرة المستهدفة"),
        unit: t3("MW", "MW", "ميغاواط"),
        max: 100,
      },
      {
        name: "annualConsumptionMwh",
        type: "number",
        label: t3("Consommation annuelle du site", "Site's annual consumption", "الاستهلاك السنوي للموقع"),
        unit: t3("MWh/an", "MWh/year", "ميغاواط ساعة/سنة"),
        help: t3(
          "Sur vos factures STEG MT des 12 derniers mois.",
          "From your MV STEG bills over the last 12 months.",
          "من فواتير الستاغ بالجهد المتوسط لآخر 12 شهراً.",
        ),
        max: 10_000_000,
        showIf: { field: "regime", equals: "autoproduction" },
      },
      {
        name: "landSurfaceHa",
        type: "number",
        label: t3("Surface du terrain", "Land area", "مساحة الأرض"),
        unit: t3("ha", "ha", "هك"),
        help: t3("Comptez environ 1 à 1,5 ha par MW.", "Allow about 1–1.5 ha per MW.", "احتسب حوالي 1 إلى 1.5 هكتار لكل ميغاواط."),
        max: 10_000,
      },
      {
        name: "landOwnership",
        type: "select",
        label: t3("Le terrain", "The land", "الأرض"),
        options: [
          opt("proprietaire", "Nous en sommes propriétaires", "We own it", "نحن مالكوها"),
          opt("location", "En location / concession", "Leased / under concession", "مسوّغة / في إطار لزمة"),
          opt("a-trouver", "À trouver", "Still to find", "لم نجدها بعد"),
        ],
      },
      {
        name: "distanceToGridKm",
        type: "number",
        label: t3("Distance au réseau MT", "Distance to the MV grid", "المسافة إلى شبكة الجهد المتوسط"),
        unit: t3("km", "km", "كم"),
        help: t3(
          "Distance approximative jusqu'à la ligne moyenne tension ou au poste STEG le plus proche.",
          "Approximate distance to the nearest medium-voltage line or STEG substation.",
          "المسافة التقريبية إلى أقرب خطّ جهد متوسط أو محطة للستاغ.",
        ),
        max: 1_000,
      },
      {
        name: "projectStage",
        type: "select",
        required: true,
        label: t3("Avancement du projet", "Project stage", "مرحلة المشروع"),
        options: [
          opt("idee", "Idée / première estimation", "Idea / first estimate", "فكرة / تقدير أوّلي"),
          opt("faisabilite", "Étude de faisabilité en cours", "Feasibility study under way", "دراسة الجدوى جارية"),
          opt("autorisation", "Autorisation obtenue", "Authorisation obtained", "تمّ الحصول على الترخيص"),
        ],
      },
    ],
  },
];

export const devisForms: SeedForm[] = [...growingDevisForms, ...hikviewDevisForms];
