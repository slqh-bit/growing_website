import type { Service, ActivityKey } from "./types";

/**
 * Growing Technologies' four activities (plan §4.1): solar pumping, off-grid &
 * solar street lighting, STEG grid-connected systems (BT/MT — the former
 * "Basse tension" / "Moyenne tension" pages are sections of it now) and
 * utility-scale PV plants. Trilingual (AR/FR/EN). Seed data only: once
 * created, services are edited in the admin.
 */
export const services: Service[] = [
  {
    slug: "pompage-solaire",
    activityKey: "pompage",
    icon: "Droplets",
    order: 1,
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
    order: 2,
    title: {
      fr: "Sites isolés & éclairage public solaire",
      ar: "المواقع المعزولة والإنارة العمومية الشمسية",
      en: "Off-grid systems & solar street lighting",
    },
    shortDescription: {
      fr: "Électricité autonome avec stockage hors réseau STEG, et éclairage public solaire pour communes et routes.",
      ar: "كهرباء مستقلة مع تخزين خارج شبكة الستاغ، وإنارة عمومية شمسية للبلديات والطرقات.",
      en: "Autonomous power with storage off the STEG grid, and solar street lighting for municipalities and roads.",
    },
    body: {
      fr: "Là où le réseau n'arrive pas — ou coûte trop cher à tirer —, nous installons des systèmes photovoltaïques autonomes avec batteries : habitations et fermes isolées, relais de télécommunication, et éclairage public solaire. Chaque système est dimensionné selon la consommation journalière, les charges critiques et l'autonomie souhaitée.",
      ar: "حيث لا تصل الشبكة — أو تكون كلفة مدّها مرتفعة — نركّب أنظمة كهروضوئية مستقلة مع بطاريات: المساكن والضيعات المعزولة ومحطات الاتصالات والإنارة العمومية الشمسية. يُحدَّد حجم كل نظام حسب الاستهلاك اليومي والأحمال الحرجة والاستقلالية المطلوبة.",
      en: "Where the grid doesn't reach — or costs too much to extend — we install standalone PV systems with batteries: remote homes and farms, telecom relays, and solar street lighting. Each system is sized to the daily consumption, critical loads and desired autonomy.",
    },
    benefits: {
      fr: [
        "Électricité fiable là où le réseau n'arrive pas",
        "Stockage batterie pour la nuit et les jours nuageux",
        "Éclairage public sans tranchée ni facture d'électricité",
        "Réduit ou supprime le groupe électrogène",
      ],
      ar: [
        "كهرباء موثوقة حيث لا تصل الشبكة",
        "تخزين بالبطاريات لليل والأيام الغائمة",
        "إنارة عمومية دون حفر خنادق ودون فاتورة كهرباء",
        "يقلّل أو يلغي المولّد الكهربائي",
      ],
      en: [
        "Reliable power where the grid does not reach",
        "Battery storage for nights and cloudy days",
        "Street lighting with no trenching and no electricity bill",
        "Reduces or removes the diesel genset",
      ],
    },
    process: [
      {
        title: { fr: "Bilan de puissance", ar: "حصيلة الطاقة", en: "Load assessment" },
        description: {
          fr: "Inventaire des charges, de la consommation journalière ou des points lumineux.",
          ar: "جرد الأحمال والاستهلاك اليومي أو نقاط الإنارة.",
          en: "Inventory of loads, daily consumption or light points.",
        },
      },
      {
        title: { fr: "Dimensionnement", ar: "تحديد الحجم", en: "Sizing" },
        description: {
          fr: "Champ PV, parc batteries et onduleur (ou lampadaires) selon l'autonomie visée.",
          ar: "الحقل الكهروضوئي وبنك البطاريات والعاكس (أو الأعمدة) حسب الاستقلالية المستهدفة.",
          en: "PV array, battery bank and inverter (or street lights) for the target autonomy.",
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
    sections: [
      {
        anchor: "sites-isoles",
        icon: "House",
        title: { fr: "Habitations et exploitations isolées", ar: "المساكن والضيعات المعزولة", en: "Remote homes and farms" },
        body: {
          fr: "Kits autonomes pour maisons, fermes et locaux techniques non raccordés : panneaux, régulateur, batteries lithium ou plomb, onduleur. Extension possible à mesure que vos besoins évoluent.",
          ar: "أنظمة مستقلة للمنازل والضيعات والمحلات التقنية غير المربوطة: ألواح ومنظّم وبطاريات ليثيوم أو رصاص وعاكس. قابلة للتوسعة حسب تطوّر حاجياتك.",
          en: "Standalone kits for unconnected homes, farms and technical rooms: panels, charge controller, lithium or lead batteries, inverter. Expandable as your needs grow.",
        },
      },
      {
        anchor: "relais-telecom",
        icon: "RadioTower",
        title: { fr: "Relais et sites techniques", ar: "محطات الاتصالات والمواقع التقنية", en: "Relays and technical sites" },
        body: {
          fr: "Alimentation continue des relais de télécommunication, stations de mesure et équipements distants, avec supervision et autonomie calculée pour les périodes sans soleil.",
          ar: "تغذية مستمرة لمحطات الاتصالات ومحطات القياس والتجهيزات البعيدة، مع مراقبة واستقلالية محسوبة لفترات غياب الشمس.",
          en: "Continuous power for telecom relays, measuring stations and remote equipment, with monitoring and autonomy sized for sunless periods.",
        },
      },
      {
        anchor: "eclairage-public",
        icon: "Lightbulb",
        title: { fr: "Éclairage public solaire", ar: "الإنارة العمومية الشمسية", en: "Solar street lighting" },
        body: {
          fr: "Lampadaires solaires autonomes pour communes, routes, places, parkings et zones industrielles : aucun raccordement ni tranchée, aucune facture d'électricité, pilotage de l'intensité selon l'heure.\n\nNous accompagnons les collectivités de l'étude d'éclairement à la pose, y compris dans le cadre de marchés publics.",
          ar: "أعمدة إنارة شمسية مستقلة للبلديات والطرقات والساحات ومآوي السيارات والمناطق الصناعية: دون ربط أو حفر خنادق ودون فاتورة كهرباء، مع التحكم في شدّة الإضاءة حسب الساعة.\n\nنرافق الجماعات المحلية من دراسة الإنارة إلى التركيب، بما في ذلك في إطار الصفقات العمومية.",
          en: "Standalone solar street lights for municipalities, roads, squares, car parks and industrial zones: no grid connection or trenching, no electricity bill, dimming by time of night.\n\nWe support local authorities from the lighting study to installation, including through public tenders.",
        },
      },
    ],
  },
  {
    slug: "installation-raccordee",
    activityKey: "raccorde",
    icon: "PlugZap",
    order: 3,
    title: {
      fr: "Installations raccordées au réseau STEG (BT/MT)",
      ar: "المنشآت المربوطة بشبكة الستاغ (الجهد المنخفض والمتوسط)",
      en: "STEG grid-connected systems (LV/MV)",
    },
    shortDescription: {
      fr: "Photovoltaïque raccordé STEG en basse et moyenne tension, pour les foyers, les commerces et l'industrie.",
      ar: "أنظمة كهروضوئية مربوطة بالستاغ بالجهد المنخفض والمتوسط للمنازل والمحلات والصناعة.",
      en: "STEG grid-tied PV in low and medium voltage, for homes, businesses and industry.",
    },
    body: {
      fr: "Nous concevons et installons des centrales photovoltaïques raccordées au réseau STEG, en basse tension (BT) comme en moyenne tension (MT). Le surplus de production est injecté et déduit de votre consommation (net-metering), pour un retour sur investissement rapide. Étude technique, dimensionnement, démarches STEG, travaux électriques et mise en service compris.",
      ar: "نصمم ونركّب محطات كهروضوئية مربوطة بشبكة الستاغ، بالجهد المنخفض كما بالجهد المتوسط. يُحقن فائض الإنتاج ويُخصم من استهلاكك (احتساب صافي الطاقة)، مما يضمن عائد استثمار سريع. تشمل الخدمة الدراسة الفنية وتحديد الحجم وإجراءات الستاغ والأشغال الكهربائية والتشغيل.",
      en: "We design and install PV plants connected to the STEG grid, in low voltage (LV) as well as medium voltage (MV). Surplus production is injected and offset against your consumption (net-metering) for a fast payback. Technical study, sizing, STEG paperwork, electrical works and commissioning included.",
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
    sections: [
      {
        anchor: "domestique",
        icon: "House",
        title: { fr: "Domestique (BT)", ar: "المنازل (الجهد المنخفض)", en: "Homes (LV)" },
        body: {
          fr: "Installations résidentielles raccordées en basse tension, éligibles au programme PROSOL Élec de l'ANME. Nous montons le dossier de subvention et de raccordement, et dimensionnons l'installation sur votre facture STEG.",
          ar: "تركيبات سكنية مربوطة بالجهد المنخفض، مؤهّلة لبرنامج بروسول الكهرباء للوكالة الوطنية للتحكم في الطاقة. نعدّ ملف المنحة والربط ونحدّد حجم التركيبة حسب فاتورة الستاغ.",
          en: "Residential systems connected in low voltage, eligible for ANME's PROSOL Élec programme. We prepare the subsidy and connection file, and size the system on your STEG bill.",
        },
      },
      {
        anchor: "commercial",
        icon: "Store",
        title: { fr: "Commercial (BT/MT)", ar: "التجاري (الجهد المنخفض والمتوسط)", en: "Commercial (LV/MV)" },
        body: {
          fr: "Commerces, bureaux, hôtels et établissements de santé : autoconsommation raccordée en BT ou en MT selon votre abonnement.\n\nNous réalisons aussi les travaux électriques associés — tableaux de distribution, câblage, mise à la terre, protections et mise aux normes — par des électriciens qualifiés.",
          ar: "المحلات التجارية والمكاتب والنزل والمؤسسات الصحية: استهلاك ذاتي مربوط بالجهد المنخفض أو المتوسط حسب اشتراكك.\n\nننجز أيضاً الأشغال الكهربائية المرتبطة — لوحات التوزيع والتوصيل والتأريض والحمايات والمطابقة للمعايير — من قبل كهربائيين مؤهّلين.",
          en: "Shops, offices, hotels and healthcare sites: grid-tied self-consumption in LV or MV depending on your contract.\n\nWe also carry out the related electrical works — distribution boards, wiring, earthing, protections and code compliance — by qualified electricians.",
        },
      },
      {
        anchor: "industriel",
        icon: "Factory",
        title: { fr: "Industriel (MT)", ar: "الصناعي (الجهد المتوسط)", en: "Industrial (MV)" },
        body: {
          fr: "Centrales en toiture ou au sol pour les sites industriels raccordés en moyenne tension, sous le régime de l'autoproduction.\n\nNous prenons en charge la partie MT : postes de transformation MT/BT, cellules, raccordements et maintenance préventive, en conformité avec les exigences STEG.",
          ar: "محطات على الأسطح أو على الأرض للمواقع الصناعية المربوطة بالجهد المتوسط في إطار نظام الإنتاج الذاتي.\n\nنتكفّل بجزء الجهد المتوسط: محطات التحويل من الجهد المتوسط إلى المنخفض والخلايا والربط والصيانة الوقائية، وفق متطلبات الستاغ.",
          en: "Rooftop or ground-mounted plants for industrial sites connected in medium voltage, under the self-generation (autoproduction) scheme.\n\nWe handle the MV side: MV/LV transformer substations, switchgear cells, connections and preventive maintenance, compliant with STEG requirements.",
        },
      },
    ],
  },
  {
    slug: "centrale-photovoltaique",
    icon: "Sun",
    order: 4,
    title: {
      fr: "Centrales photovoltaïques (1 à 10 MW)",
      ar: "محطات الطاقة الشمسية الكهروضوئية (1 إلى 10 ميغاواط)",
      en: "Utility-scale solar plants (1–10 MW)",
    },
    shortDescription: {
      fr: "Études, ingénierie et construction de centrales de 1 à 10 MW, en autoproduction MT ou pour la vente à la STEG.",
      ar: "دراسة وهندسة وإنجاز محطات من 1 إلى 10 ميغاواط، للإنتاج الذاتي بالجهد المتوسط أو لبيع الكهرباء للستاغ.",
      en: "Studies, engineering and construction of 1–10 MW plants, for MV self-generation or for sale to STEG.",
    },
    body: {
      fr: "Nous accompagnons les industriels, les exploitations agricoles et les investisseurs dans leurs projets de centrales photovoltaïques de 1 à 10 MW : étude de faisabilité et de productible, étude de raccordement, dossiers d'autorisation, ingénierie, construction et maintenance.",
      ar: "نرافق الصناعيين والمستغلّات الفلاحية والمستثمرين في مشاريع المحطات الكهروضوئية من 1 إلى 10 ميغاواط: دراسة الجدوى والإنتاجية ودراسة الربط وملفات الترخيص والهندسة والإنجاز والصيانة.",
      en: "We support industrial companies, farms and investors in 1–10 MW PV plant projects: feasibility and yield study, grid-connection study, authorisation files, engineering, construction and maintenance.",
    },
    benefits: {
      fr: [
        "Équipe certifiée ANME, basée au centre-ouest",
        "Maîtrise de la moyenne tension et des exigences STEG",
        "Accompagnement de l'étude à l'exploitation",
        "Suivi de production et maintenance sur site",
      ],
      ar: [
        "فريق معتمد من الوكالة الوطنية للتحكم في الطاقة ومقرّه بالوسط الغربي",
        "تحكّم في الجهد المتوسط ومتطلبات الستاغ",
        "مرافقة من الدراسة إلى الاستغلال",
        "متابعة الإنتاج والصيانة في الموقع",
      ],
      en: [
        "ANME-certified team based in central-west Tunisia",
        "Command of medium voltage and STEG requirements",
        "Support from study to operation",
        "Production monitoring and on-site maintenance",
      ],
    },
    process: [
      {
        title: { fr: "Faisabilité", ar: "دراسة الجدوى", en: "Feasibility" },
        description: {
          fr: "Terrain, ensoleillement, productible, modèle économique et choix du régime.",
          ar: "الأرض والإشعاع الشمسي والإنتاجية والنموذج الاقتصادي واختيار النظام.",
          en: "Land, irradiation, yield, business model and choice of scheme.",
        },
      },
      {
        title: { fr: "Raccordement & autorisations", ar: "الربط والتراخيص", en: "Grid connection & permits" },
        description: {
          fr: "Étude de raccordement STEG et constitution des dossiers d'autorisation.",
          ar: "دراسة الربط مع الستاغ وإعداد ملفات الترخيص.",
          en: "STEG grid-connection study and authorisation files.",
        },
      },
      {
        title: { fr: "Ingénierie & construction", ar: "الهندسة والإنجاز", en: "Engineering & construction" },
        description: {
          fr: "Conception détaillée, approvisionnement, génie civil, montage et poste de livraison MT.",
          ar: "التصميم التفصيلي والتزويد والهندسة المدنية والتركيب ومحطة التسليم بالجهد المتوسط.",
          en: "Detailed design, procurement, civil works, installation and MV delivery substation.",
        },
      },
      {
        title: { fr: "Exploitation & maintenance", ar: "الاستغلال والصيانة", en: "Operation & maintenance" },
        description: {
          fr: "Mise en service, supervision de la production et maintenance préventive.",
          ar: "التشغيل ومراقبة الإنتاج والصيانة الوقائية.",
          en: "Commissioning, production monitoring and preventive maintenance.",
        },
      },
    ],
    sections: [
      {
        anchor: "autoproduction",
        icon: "Factory",
        title: { fr: "Autoproduction en moyenne tension", ar: "الإنتاج الذاتي بالجهد المتوسط", en: "Self-generation in medium voltage" },
        body: {
          fr: "Pour les industriels et les grandes exploitations agricoles raccordés en MT : la centrale couvre votre propre consommation, le surplus est injecté sur le réseau STEG selon le régime de l'autoproduction. Nous étudions votre profil de consommation pour dimensionner la puissance la plus rentable.",
          ar: "للصناعيين والمستغلّات الفلاحية الكبرى المربوطة بالجهد المتوسط: تغطي المحطة استهلاكك الخاص ويُحقن الفائض في شبكة الستاغ وفق نظام الإنتاج الذاتي. ندرس ملف استهلاكك لتحديد القدرة الأكثر مردودية.",
          en: "For industrial companies and large farms connected in MV: the plant covers your own consumption and the surplus is injected into the STEG grid under the self-generation scheme. We study your consumption profile to size the most profitable capacity.",
        },
      },
      {
        anchor: "autorisation-concession",
        icon: "Landmark",
        title: { fr: "Autorisation et concession", ar: "الترخيص واللزمة", en: "Authorisation and concession" },
        body: {
          fr: "Pour les projets de production destinés à la vente d'électricité à la STEG, dans le cadre du régime des autorisations ou des appels d'offres de concession : nous accompagnons le porteur de projet sur les études, le dossier technique, la construction et la maintenance de la centrale.",
          ar: "لمشاريع الإنتاج الموجّهة لبيع الكهرباء للستاغ، في إطار نظام التراخيص أو طلبات العروض للّزمة: نرافق صاحب المشروع في الدراسات والملف الفني وإنجاز المحطة وصيانتها.",
          en: "For generation projects selling electricity to STEG, under the authorisation scheme or concession tenders: we support the project owner with the studies, technical file, construction and maintenance of the plant.",
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
