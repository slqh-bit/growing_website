import type { Service, ActivityKey } from "./types";

/**
 * The five activities of Growing Technologies (devplan §1).
 * Content is trilingual (AR/FR/EN). In a later phase this is replaced by the
 * Payload `Services` collection; the shape is kept identical for a clean swap.
 */
export const services: Service[] = [
  {
    slug: "installation-raccordee",
    activityKey: "raccorde",
    icon: "PlugZap",
    order: 1,
    title: {
      fr: "Installation raccordée",
      ar: "تركيب مربوط بالشبكة",
      en: "Grid-connected installation",
    },
    shortDescription: {
      fr: "Photovoltaïque raccordé au réseau STEG avec net-metering pour réduire votre facture.",
      ar: "أنظمة كهروضوئية مربوطة بشبكة الستاغ مع احتساب صافي الطاقة لتخفيض فاتورتك.",
      en: "Grid-tied PV with STEG net-metering to cut your electricity bill.",
    },
    body: {
      fr: "Nous concevons et installons des centrales photovoltaïques raccordées au réseau STEG. Le surplus de production est injecté et déduit de votre consommation (net-metering), pour un retour sur investissement rapide. Étude technique, dimensionnement, démarches STEG et mise en service comprises.",
      ar: "نصمم ونركّب محطات كهروضوئية مربوطة بشبكة الستاغ. يُحقن فائض الإنتاج ويُخصم من استهلاكك (احتساب صافي الطاقة)، مما يضمن عائد استثمار سريع. تشمل الخدمة الدراسة الفنية وتحديد الحجم وإجراءات الستاغ والتشغيل.",
      en: "We design and install PV plants connected to the STEG grid. Surplus production is injected and offset against your consumption (net-metering) for a fast payback. Technical study, sizing, STEG paperwork and commissioning included.",
    },
    benefits: {
      fr: [
        "Facture STEG fortement réduite",
        "Éligible aux subventions ANME / PROSOL",
        "Net-metering : surplus injecté au réseau",
        "Maintenance simple, garantie panneaux 25 ans",
      ],
      ar: [
        "تخفيض كبير لفاتورة الستاغ",
        "مؤهّل لمنح الوكالة الوطنية للتحكم في الطاقة / بروسول",
        "احتساب صافي الطاقة: حقن الفائض في الشبكة",
        "صيانة بسيطة وضمان الألواح 25 سنة",
      ],
      en: [
        "Sharply reduced STEG bill",
        "Eligible for ANME / PROSOL subsidies",
        "Net-metering: surplus injected to the grid",
        "Simple maintenance, 25-year panel warranty",
      ],
    },
    process: [
      {
        title: { fr: "Étude & devis", ar: "دراسة وتسعيرة", en: "Study & quote" },
        description: {
          fr: "Analyse de votre facture et de votre toiture, dimensionnement et devis détaillé.",
          ar: "تحليل فاتورتك وسطحك، تحديد الحجم وتقديم تسعيرة مفصّلة.",
          en: "We analyse your bill and roof, size the system and issue a detailed quote.",
        },
      },
      {
        title: { fr: "Démarches STEG", ar: "إجراءات الستاغ", en: "STEG process" },
        description: {
          fr: "Constitution du dossier et demande de raccordement auprès de la STEG.",
          ar: "إعداد الملف وطلب الربط لدى الستاغ.",
          en: "We assemble the file and submit the grid-connection request to STEG.",
        },
      },
      {
        title: { fr: "Installation", ar: "التركيب", en: "Installation" },
        description: {
          fr: "Pose des panneaux, onduleur et protections par nos équipes certifiées.",
          ar: "تركيب الألواح والعاكس ووسائل الحماية من قبل فرقنا المعتمدة.",
          en: "Panels, inverter and protections installed by our certified teams.",
        },
      },
      {
        title: { fr: "Mise en service", ar: "التشغيل", en: "Commissioning" },
        description: {
          fr: "Tests, raccordement, mise en service et formation à la supervision.",
          ar: "اختبارات وربط وتشغيل وتكوين على المتابعة.",
          en: "Testing, connection, commissioning and monitoring hand-over.",
        },
      },
    ],
  },
  {
    slug: "pompage-solaire",
    activityKey: "pompage",
    icon: "Droplets",
    order: 2,
    title: {
      fr: "Pompage solaire",
      ar: "الضخّ بالطاقة الشمسية",
      en: "Solar water pumping",
    },
    shortDescription: {
      fr: "Pompes solaires pour forages, puits et irrigation — sans facture d'électricité.",
      ar: "مضخات شمسية للآبار والحفر والريّ — دون فاتورة كهرباء.",
      en: "Solar pumps for boreholes, wells and irrigation — with no electricity bill.",
    },
    body: {
      fr: "Solutions de pompage solaire au fil du soleil pour l'irrigation agricole et l'alimentation en eau. Dimensionnement selon la profondeur, le débit et la hauteur manométrique totale (HMT). Idéal pour les exploitations éloignées du réseau.",
      ar: "حلول ضخّ شمسي على مدار النهار للريّ الفلاحي وتزويد المياه. تحديد الحجم حسب العمق والتدفق والارتفاع المانومتري الكلي. مثالي للضيعات البعيدة عن الشبكة.",
      en: "Sun-driven solar pumping for agricultural irrigation and water supply. Sizing based on depth, flow rate and total dynamic head (HMT). Ideal for farms far from the grid.",
    },
    benefits: {
      fr: [
        "Zéro facture d'électricité de pompage",
        "Adapté aux forages profonds et puits",
        "Débit optimisé sur la journée solaire",
        "Éligible aux subventions agricoles (APIA)",
      ],
      ar: [
        "صفر فاتورة كهرباء للضخّ",
        "مناسب للحفر العميقة والآبار",
        "تدفق محسّن على مدار النهار الشمسي",
        "مؤهّل للمنح الفلاحية (وكالة النهوض بالاستثمارات الفلاحية)",
      ],
      en: [
        "Zero pumping electricity bill",
        "Suited to deep boreholes and wells",
        "Flow optimised over the solar day",
        "Eligible for agricultural subsidies (APIA)",
      ],
    },
    process: [
      {
        title: { fr: "Étude hydraulique", ar: "دراسة هيدروليكية", en: "Hydraulic study" },
        description: {
          fr: "Mesure de la profondeur, du débit requis et de la HMT.",
          ar: "قياس العمق والتدفق المطلوب والارتفاع المانومتري الكلي.",
          en: "We measure depth, required flow and total dynamic head.",
        },
      },
      {
        title: { fr: "Dimensionnement", ar: "تحديد الحجم", en: "Sizing" },
        description: {
          fr: "Choix de la pompe et du champ PV pour le débit visé.",
          ar: "اختيار المضخة والحقل الكهروضوئي حسب التدفق المستهدف.",
          en: "We select the pump and PV array for the target flow.",
        },
      },
      {
        title: { fr: "Installation", ar: "التركيب", en: "Installation" },
        description: {
          fr: "Pose du champ solaire, du variateur et de la pompe.",
          ar: "تركيب الحقل الشمسي والمحوّل والمضخة.",
          en: "Solar array, drive controller and pump installed.",
        },
      },
      {
        title: { fr: "Suivi", ar: "المتابعة", en: "Follow-up" },
        description: {
          fr: "Mise en service, réglage du débit et maintenance préventive.",
          ar: "التشغيل وضبط التدفق والصيانة الوقائية.",
          en: "Commissioning, flow tuning and preventive maintenance.",
        },
      },
    ],
  },
  {
    slug: "site-isole",
    activityKey: "isole",
    icon: "BatteryCharging",
    order: 3,
    title: {
      fr: "Site isolé",
      ar: "موقع معزول",
      en: "Off-grid systems",
    },
    shortDescription: {
      fr: "Systèmes autonomes avec stockage pour les sites hors réseau STEG.",
      ar: "أنظمة مستقلة مع تخزين للمواقع خارج شبكة الستاغ.",
      en: "Autonomous systems with storage for sites off the STEG grid.",
    },
    body: {
      fr: "Systèmes photovoltaïques autonomes avec batteries pour les sites non raccordés : fermes, relais, habitations isolées. Dimensionnement selon la consommation journalière, les charges critiques et les jours d'autonomie souhaités.",
      ar: "أنظمة كهروضوئية مستقلة مع بطاريات للمواقع غير المربوطة: الضيعات ومحطات البثّ والمساكن المعزولة. تحديد الحجم حسب الاستهلاك اليومي والأحمال الحرجة وأيام الاستقلالية المطلوبة.",
      en: "Standalone PV systems with batteries for unconnected sites: farms, relays, remote homes. Sizing based on daily consumption, critical loads and desired days of autonomy.",
    },
    benefits: {
      fr: [
        "Électricité fiable là où le réseau n'arrive pas",
        "Stockage batterie pour la nuit et les jours nuageux",
        "Réduit ou supprime le groupe électrogène",
        "Extensible selon vos besoins",
      ],
      ar: [
        "كهرباء موثوقة حيث لا تصل الشبكة",
        "تخزين بالبطاريات لليل والأيام الغائمة",
        "يقلّل أو يلغي المولّد الكهربائي",
        "قابل للتوسعة حسب حاجتك",
      ],
      en: [
        "Reliable power where the grid does not reach",
        "Battery storage for nights and cloudy days",
        "Reduces or removes the diesel genset",
        "Scalable to your needs",
      ],
    },
    process: [
      {
        title: { fr: "Bilan de puissance", ar: "حصيلة الطاقة", en: "Load assessment" },
        description: {
          fr: "Inventaire des charges et de la consommation journalière.",
          ar: "جرد الأحمال والاستهلاك اليومي.",
          en: "Inventory of loads and daily consumption.",
        },
      },
      {
        title: { fr: "Dimensionnement", ar: "تحديد الحجم", en: "Sizing" },
        description: {
          fr: "Champ PV, parc batteries et onduleur selon l'autonomie visée.",
          ar: "الحقل الكهروضوئي وبنك البطاريات والعاكس حسب الاستقلالية المستهدفة.",
          en: "PV array, battery bank and inverter for the target autonomy.",
        },
      },
      {
        title: { fr: "Installation", ar: "التركيب", en: "Installation" },
        description: {
          fr: "Montage, câblage et protections aux normes.",
          ar: "التركيب والتوصيل ووسائل الحماية وفق المعايير.",
          en: "Mounting, wiring and code-compliant protections.",
        },
      },
      {
        title: { fr: "Mise en service", ar: "التشغيل", en: "Commissioning" },
        description: {
          fr: "Paramétrage, tests d'autonomie et formation utilisateur.",
          ar: "الضبط واختبارات الاستقلالية وتكوين المستخدم.",
          en: "Configuration, autonomy tests and user training.",
        },
      },
    ],
  },
  {
    slug: "basse-tension",
    activityKey: "bt",
    icon: "Cable",
    order: 4,
    title: {
      fr: "Basse tension (BT)",
      ar: "الجهد المنخفض",
      en: "Low voltage (LV)",
    },
    shortDescription: {
      fr: "Installations électriques BT : tableaux, distribution, mise aux normes.",
      ar: "تركيبات كهربائية بالجهد المنخفض: لوحات وتوزيع ومطابقة للمعايير.",
      en: "LV electrical work: switchboards, distribution, code compliance.",
    },
    body: {
      fr: "Travaux d'électricité basse tension pour le résidentiel, le tertiaire et l'industrie : tableaux de distribution, câblage, éclairage, mise à la terre et mise aux normes. Réalisés par des électriciens qualifiés.",
      ar: "أشغال كهرباء بالجهد المنخفض للسكني والخدمي والصناعي: لوحات التوزيع والتوصيل والإنارة والتأريض والمطابقة للمعايير. تُنجز من قبل كهربائيين مؤهّلين.",
      en: "Low-voltage electrical work for residential, commercial and industrial sites: distribution boards, wiring, lighting, earthing and code compliance. Delivered by qualified electricians.",
    },
    benefits: {
      fr: [
        "Installations conformes et sécurisées",
        "Tableaux et distribution sur mesure",
        "Mise à la terre et protections différentielles",
        "Intervention résidentielle et industrielle",
      ],
      ar: [
        "تركيبات مطابقة وآمنة",
        "لوحات وتوزيع حسب الطلب",
        "تأريض وحماية تفاضلية",
        "تدخّل سكني وصناعي",
      ],
      en: [
        "Compliant, safe installations",
        "Custom switchboards and distribution",
        "Earthing and residual-current protection",
        "Residential and industrial call-outs",
      ],
    },
    process: [
      {
        title: { fr: "Visite technique", ar: "زيارة فنية", en: "Site visit" },
        description: {
          fr: "Relevé des besoins et de l'installation existante.",
          ar: "معاينة الحاجيات والتركيبة الموجودة.",
          en: "Survey of needs and existing installation.",
        },
      },
      {
        title: { fr: "Conception", ar: "التصميم", en: "Design" },
        description: {
          fr: "Schéma unifilaire, choix des protections et devis.",
          ar: "المخطط أحادي الخط واختيار الحمايات والتسعيرة.",
          en: "Single-line diagram, protection selection and quote.",
        },
      },
      {
        title: { fr: "Réalisation", ar: "الإنجاز", en: "Execution" },
        description: {
          fr: "Câblage, pose des tableaux et raccordements.",
          ar: "التوصيل وتركيب اللوحات والربط.",
          en: "Wiring, board mounting and connections.",
        },
      },
      {
        title: { fr: "Contrôle", ar: "المراقبة", en: "Verification" },
        description: {
          fr: "Tests, mesures et remise du rapport de conformité.",
          ar: "اختبارات وقياسات وتسليم تقرير المطابقة.",
          en: "Testing, measurements and compliance report.",
        },
      },
    ],
  },
  {
    slug: "moyenne-tension",
    activityKey: "mt",
    icon: "Zap",
    order: 5,
    title: {
      fr: "Moyenne tension (MT)",
      ar: "الجهد المتوسط",
      en: "Medium voltage (MV)",
    },
    shortDescription: {
      fr: "Postes de transformation MT/BT, raccordements et maintenance industrielle.",
      ar: "محطات تحويل من الجهد المتوسط إلى المنخفض، ربط وصيانة صناعية.",
      en: "MV/LV transformer substations, connections and industrial maintenance.",
    },
    body: {
      fr: "Études et travaux moyenne tension : postes de transformation MT/BT, cellules, raccordements industriels et maintenance. Interventions conformes aux exigences STEG pour les clients industriels et B2G.",
      ar: "دراسات وأشغال بالجهد المتوسط: محطات تحويل من الجهد المتوسط إلى المنخفض والخلايا والربط الصناعي والصيانة. تدخّلات مطابقة لمتطلبات الستاغ للعملاء الصناعيين والقطاع العام.",
      en: "Medium-voltage studies and works: MV/LV transformer substations, switchgear cells, industrial connections and maintenance. Interventions compliant with STEG requirements for industrial and B2G clients.",
    },
    benefits: {
      fr: [
        "Postes de transformation MT/BT clés en main",
        "Conformité aux exigences STEG",
        "Maintenance préventive et curative",
        "Interlocuteur unique pour l'industrie",
      ],
      ar: [
        "محطات تحويل جاهزة بالكامل",
        "مطابقة لمتطلبات الستاغ",
        "صيانة وقائية وعلاجية",
        "مخاطب واحد للصناعة",
      ],
      en: [
        "Turnkey MV/LV substations",
        "Compliance with STEG requirements",
        "Preventive and corrective maintenance",
        "Single point of contact for industry",
      ],
    },
    process: [
      {
        title: { fr: "Étude", ar: "الدراسة", en: "Study" },
        description: {
          fr: "Analyse du besoin, dossier technique et coordination STEG.",
          ar: "تحليل الحاجة والملف الفني والتنسيق مع الستاغ.",
          en: "Needs analysis, technical file and STEG coordination.",
        },
      },
      {
        title: { fr: "Fourniture", ar: "التزويد", en: "Supply" },
        description: {
          fr: "Approvisionnement transformateur, cellules et équipements.",
          ar: "تزويد المحوّل والخلايا والتجهيزات.",
          en: "Transformer, cells and equipment procurement.",
        },
      },
      {
        title: { fr: "Installation", ar: "التركيب", en: "Installation" },
        description: {
          fr: "Montage du poste et raccordement MT/BT.",
          ar: "تركيب المحطة والربط بين الجهدين.",
          en: "Substation assembly and MV/LV connection.",
        },
      },
      {
        title: { fr: "Mise en service", ar: "التشغيل", en: "Commissioning" },
        description: {
          fr: "Essais, consignation et mise en exploitation.",
          ar: "الاختبارات والتأمين والتشغيل.",
          en: "Testing, lock-out and commissioning.",
        },
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServiceByKey(key: ActivityKey): Service | undefined {
  return services.find((s) => s.activityKey === key);
}

export const serviceSlugs = services.map((s) => s.slug);
