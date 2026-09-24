import type { Project, ActivityKey } from "./types";

/**
 * Sample realized projects (devplan §4.2 Projects collection).
 * Replaced by the Payload `Projects` collection in a later phase.
 */
export const projects: Project[] = [
  {
    slug: "centrale-toiture-sbeitla",
    activityKey: "raccorde",
    clientType: "industriel",
    powerKwc: 110,
    date: "2025-06-15",
    featured: true,
    region: { fr: "Kasserine", ar: "القصرين", en: "Kasserine" },
    title: {
      fr: "Centrale 110 kWc en toiture industrielle",
      ar: "محطة 110 كيلوواط على سطح صناعي",
      en: "110 kWp rooftop industrial plant",
    },
    summary: {
      fr: "Installation raccordée STEG sur une toiture d'usine agroalimentaire à Sbeitla.",
      ar: "تركيب مربوط بالستاغ على سطح مصنع غذائي بسبيطلة.",
      en: "STEG grid-tied installation on an agri-food factory roof in Sbeitla.",
    },
    body: {
      fr: "Centrale photovoltaïque de 110 kWc couvrant une large part de la consommation diurne de l'usine, avec net-metering. Retour sur investissement estimé à moins de 5 ans.",
      ar: "محطة كهروضوئية بقدرة 110 كيلوواط تغطي جزءاً كبيراً من استهلاك المصنع النهاري مع احتساب صافي الطاقة. عائد الاستثمار المقدّر أقل من 5 سنوات.",
      en: "A 110 kWp PV plant covering a large share of the factory's daytime consumption, with net-metering. Estimated payback under 5 years.",
    },
  },
  {
    slug: "pompage-forage-oasis",
    activityKey: "pompage",
    clientType: "agricole",
    powerKwc: 15,
    date: "2025-03-02",
    featured: true,
    region: { fr: "Gafsa", ar: "قفصة", en: "Gafsa" },
    title: {
      fr: "Pompage solaire sur forage — 15 kWc",
      ar: "ضخّ شمسي على حفر — 15 كيلوواط",
      en: "Borehole solar pumping — 15 kWp",
    },
    summary: {
      fr: "Irrigation d'une exploitation de 8 ha alimentée par pompage solaire au fil du soleil.",
      ar: "ريّ ضيعة بمساحة 8 هكتار عبر ضخّ شمسي على مدار النهار.",
      en: "Irrigation of an 8 ha farm powered by sun-driven solar pumping.",
    },
    body: {
      fr: "Remplacement d'un groupe diesel par une pompe solaire immergée. Débit optimisé sur la journée, coût de pompage quasi nul.",
      ar: "تعويض مولّد الديزل بمضخة شمسية غاطسة. تدفق محسّن على مدار النهار وتكلفة ضخّ شبه منعدمة.",
      en: "A diesel genset replaced by a submersible solar pump. Flow optimised over the day, near-zero pumping cost.",
    },
  },
  {
    slug: "site-isole-relais",
    activityKey: "isole",
    clientType: "public",
    powerKwc: 5,
    date: "2024-11-20",
    featured: true,
    region: { fr: "Kasserine", ar: "القصرين", en: "Kasserine" },
    title: {
      fr: "Alimentation autonome d'un relais",
      ar: "تزويد مستقلّ لمحطة بثّ",
      en: "Off-grid supply for a relay station",
    },
    summary: {
      fr: "Système solaire autonome avec stockage batterie pour un site hors réseau.",
      ar: "نظام شمسي مستقلّ مع تخزين بالبطاريات لموقع خارج الشبكة.",
      en: "Autonomous solar system with battery storage for an off-grid site.",
    },
    body: {
      fr: "Alimentation 24/7 d'un relais télécom en zone non raccordée, avec deux jours d'autonomie et supervision à distance.",
      ar: "تزويد على مدار الساعة لمحطة اتصالات في منطقة غير مربوطة، مع يومَي استقلالية ومتابعة عن بُعد.",
      en: "24/7 supply of a telecom relay in an unconnected area, with two days of autonomy and remote monitoring.",
    },
  },
  {
    slug: "poste-transformation-industrie",
    activityKey: "mt",
    clientType: "industriel",
    powerKwc: null,
    date: "2024-09-10",
    featured: false,
    region: { fr: "Sidi Bouzid", ar: "سيدي بوزيد", en: "Sidi Bouzid" },
    title: {
      fr: "Poste de transformation MT/BT",
      ar: "محطة تحويل من الجهد المتوسط إلى المنخفض",
      en: "MV/LV transformer substation",
    },
    summary: {
      fr: "Poste de transformation clés en main pour une unité industrielle.",
      ar: "محطة تحويل جاهزة بالكامل لوحدة صناعية.",
      en: "Turnkey transformer substation for an industrial unit.",
    },
    body: {
      fr: "Étude, fourniture et installation d'un poste MT/BT conforme aux exigences STEG, avec mise en service et maintenance.",
      ar: "دراسة وتزويد وتركيب محطة تحويل مطابقة لمتطلبات الستاغ، مع التشغيل والصيانة.",
      en: "Study, supply and installation of an MV/LV substation compliant with STEG requirements, with commissioning and maintenance.",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectsByActivity(key: ActivityKey): Project[] {
  return projects.filter((p) => p.activityKey === key);
}

export const projectSlugs = projects.map((p) => p.slug);
