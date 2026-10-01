import type { Localized, ProcessStep, Service } from "./types";

/**
 * Hikview Engineering's catalogue (plan §4.2): 6 areas, 15 sub-services
 * served at /services/<area>/<sub>. Trilingual. Seed data only: once created,
 * everything is edited in the admin (brands are added as Partners there).
 */
export interface HikviewService extends Service {
  /** Slug of the area this sub-service belongs to. */
  parent?: string;
  /** B2G page: lists every public-sector project of the site. */
  showPublicReferences?: boolean;
}

const L = (fr: string, en: string, ar: string): Localized => ({ fr, en, ar });
const list = (fr: string[], en: string[], ar: string[]): Localized<string[]> => ({ fr, en, ar });

/** How an area project runs (areas show it; sub-services stay short). */
const areaProcess: ProcessStep[] = [
  {
    title: L("Visite & étude", "Site visit & study", "المعاينة والدراسة"),
    description: L(
      "Relevé sur site, analyse de vos besoins et de l'existant.",
      "On-site survey, analysis of your needs and existing equipment.",
      "معاينة ميدانية وتحليل حاجياتك والتجهيزات الموجودة.",
    ),
  },
  {
    title: L("Proposition", "Proposal", "العرض"),
    description: L(
      "Solution technique dimensionnée et devis détaillé.",
      "A sized technical solution and a detailed quote.",
      "حلّ تقني محدّد الحجم وتسعيرة مفصّلة.",
    ),
  },
  {
    title: L("Installation & paramétrage", "Installation & configuration", "التركيب والضبط"),
    description: L(
      "Pose, câblage, configuration et tests par nos techniciens.",
      "Installation, cabling, configuration and testing by our technicians.",
      "التركيب والتوصيل والضبط والاختبارات من قبل تقنيينا.",
    ),
  },
  {
    title: L("Formation & maintenance", "Training & maintenance", "التكوين والصيانة"),
    description: L(
      "Prise en main par vos équipes, puis maintenance préventive et dépannage.",
      "Hand-over to your teams, then preventive maintenance and repairs.",
      "تكوين فرقك ثم الصيانة الوقائية والتدخّل عند الأعطال.",
    ),
  },
];

export const hikviewServices: HikviewService[] = [
  // --- H1 Sécurité électronique ----------------------------------------------
  {
    slug: "securite-electronique",
    icon: "Cctv",
    order: 1,
    title: L(
      "Sécurité électronique (résidentielle & professionnelle)",
      "Electronic security (home & business)",
      "الأمن الإلكتروني (السكني والمهني)",
    ),
    shortDescription: L(
      "Vidéosurveillance intelligente, alarme, contrôle d'accès et sécurité incendie pour les maisons, les entreprises et les sites publics.",
      "Smart video surveillance, alarms, access control and fire safety for homes, businesses and public sites.",
      "المراقبة الذكية بالفيديو والإنذار ومراقبة الدخول والسلامة من الحرائق للمنازل والمؤسسات والمواقع العمومية.",
    ),
    body: L(
      "Nous protégeons les personnes et les biens avec des systèmes de sécurité électronique conçus pour chaque site : habitation, commerce, usine, administration. Chaque installation est étudiée selon vos risques, puis installée, paramétrée et maintenue par nos techniciens.",
      "We protect people and property with electronic security systems designed for each site: homes, shops, factories, public buildings. Every system is designed around your risks, then installed, configured and maintained by our technicians.",
      "نحمي الأشخاص والممتلكات بأنظمة أمن إلكتروني مصمّمة لكل موقع: مسكن أو محلّ تجاري أو مصنع أو إدارة. تُدرس كل تركيبة حسب المخاطر، ثم يتولّى تقنيونا تركيبها وضبطها وصيانتها.",
    ),
    benefits: list(
      ["Étude des risques sur site", "Systèmes évolutifs et interconnectés", "Consultation à distance sur smartphone", "Maintenance et assistance de proximité"],
      ["On-site risk assessment", "Scalable, interconnected systems", "Remote viewing on your smartphone", "Local maintenance and support"],
      ["دراسة المخاطر في الموقع", "أنظمة قابلة للتوسعة ومترابطة", "المتابعة عن بُعد عبر الهاتف الذكي", "صيانة ودعم عن قرب"],
    ),
    process: areaProcess,
  },
  {
    slug: "videosurveillance",
    parent: "securite-electronique",
    icon: "Cctv",
    order: 1,
    title: L("Vidéosurveillance & vision par ordinateur", "Video surveillance & computer vision", "المراقبة بالفيديو والرؤية الحاسوبية"),
    shortDescription: L(
      "Caméras IP, enregistrement et analyse vidéo par IA : lecture de plaques (LAPI), comptage, détection d'intrusion.",
      "IP cameras, recording and AI video analytics: licence-plate recognition (ANPR), people counting, intrusion detection.",
      "كاميرات IP وتسجيل وتحليل الفيديو بالذكاء الاصطناعي: قراءة لوحات السيارات والعدّ وكشف التسلّل.",
    ),
    body: L(
      "Systèmes de vidéosurveillance IP pour l'intérieur et l'extérieur, avec enregistreurs, stockage dimensionné selon la durée de conservation souhaitée et consultation à distance.\n\nLa vision par ordinateur transforme les caméras en capteurs : lecture automatique des plaques d'immatriculation, comptage de personnes et de véhicules, détection d'intrusion et de franchissement de ligne, alertes en temps réel.",
      "IP video surveillance for indoor and outdoor use, with recorders, storage sized to the retention period you need, and remote viewing.\n\nComputer vision turns cameras into sensors: automatic licence-plate recognition, people and vehicle counting, intrusion and line-crossing detection, real-time alerts.",
      "أنظمة مراقبة بالفيديو IP للداخل والخارج، مع أجهزة تسجيل وسعة تخزين حسب مدّة الحفظ المطلوبة ومتابعة عن بُعد.\n\nتحوّل الرؤية الحاسوبية الكاميرات إلى أجهزة استشعار: قراءة آلية للوحات السيارات وعدّ الأشخاص والعربات وكشف التسلّل وتجاوز الخطوط وتنبيهات فورية.",
    ),
    benefits: list(
      ["Images HD de jour comme de nuit", "Analyse vidéo par IA (LAPI, comptage, intrusion)", "Accès à distance sécurisé", "Mise à niveau d'installations existantes"],
      ["HD images day and night", "AI video analytics (ANPR, counting, intrusion)", "Secure remote access", "Upgrade of existing installations"],
      ["صور عالية الدقة ليلاً ونهاراً", "تحليل الفيديو بالذكاء الاصطناعي", "نفاذ آمن عن بُعد", "تحديث التركيبات الموجودة"],
    ),
    process: [],
  },
  {
    slug: "alarme-anti-intrusion",
    parent: "securite-electronique",
    icon: "Siren",
    order: 2,
    title: L("Alarme anti-intrusion", "Intrusion alarms", "أنظمة الإنذار ضدّ التسلّل"),
    shortDescription: L(
      "Détecteurs, sirènes et centrales d'alarme pour la maison et l'entreprise, avec alertes sur téléphone.",
      "Detectors, sirens and alarm panels for homes and businesses, with alerts on your phone.",
      "كواشف وصفارات ولوحات إنذار للمنزل والمؤسسة مع تنبيهات على الهاتف.",
    ),
    body: L(
      "Centrales d'alarme filaires ou sans fil, détecteurs de mouvement et d'ouverture, sirènes intérieures et extérieures. Transmission des alertes par GSM ou IP, pilotage depuis une application, et possibilité de levée de doute vidéo en lien avec la vidéosurveillance.",
      "Wired or wireless alarm panels, motion and opening detectors, indoor and outdoor sirens. Alerts sent over GSM or IP, control from an app, and optional video verification linked to your cameras.",
      "لوحات إنذار سلكية أو لاسلكية وكواشف حركة وفتح وصفارات داخلية وخارجية. إرسال التنبيهات عبر GSM أو IP والتحكّم عبر تطبيق، مع إمكانية التحقق بالفيديو بالربط مع الكاميرات.",
    ),
    benefits: list(
      ["Pour la maison comme pour l'entreprise", "Alertes instantanées sur smartphone", "Zones et horaires programmables", "Couplage avec la vidéosurveillance"],
      ["For homes and businesses alike", "Instant alerts on your smartphone", "Programmable zones and schedules", "Linked with video surveillance"],
      ["للمنزل كما للمؤسسة", "تنبيهات فورية على الهاتف الذكي", "مناطق وأوقات قابلة للبرمجة", "ربط مع المراقبة بالفيديو"],
    ),
    process: [],
  },
  {
    slug: "controle-acces-pointage",
    parent: "securite-electronique",
    icon: "Fingerprint",
    order: 3,
    title: L("Contrôle d'accès & pointage", "Access control & time attendance", "مراقبة الدخول والتسجيل الزمني للحضور"),
    shortDescription: L(
      "Badge, empreinte ou reconnaissance faciale pour contrôler les accès et gérer la présence du personnel.",
      "Badge, fingerprint or face recognition to control access and track staff attendance.",
      "بطاقة أو بصمة أو تعرّف على الوجه لمراقبة الدخول ومتابعة حضور الموظفين.",
    ),
    body: L(
      "Lecteurs de badges, terminaux biométriques et reconnaissance faciale, gâches et serrures électriques, tourniquets et barrières. Les droits d'accès sont gérés par zone et par horaire, et les pointages sont exportés vers votre gestion des ressources humaines et de la paie.",
      "Badge readers, biometric terminals and face recognition, electric strikes and locks, turnstiles and barriers. Access rights are managed by zone and schedule, and attendance data is exported to your HR and payroll.",
      "قارئات بطاقات وأجهزة بيومترية وتعرّف على الوجه وأقفال كهربائية وبوابات دوّارة وحواجز. تُدار صلاحيات الدخول حسب المنطقة والتوقيت، وتُصدَّر بيانات الحضور إلى نظام الموارد البشرية والأجور.",
    ),
    benefits: list(
      ["Accès maîtrisés par zone et par horaire", "Pointage fiable, sans fraude", "Export vers la paie", "Gestion multi-sites"],
      ["Access controlled by zone and schedule", "Reliable, fraud-free attendance", "Export to payroll", "Multi-site management"],
      ["دخول مضبوط حسب المنطقة والتوقيت", "تسجيل حضور موثوق دون غشّ", "تصدير نحو الأجور", "تسيير متعدّد المواقع"],
    ),
    process: [],
  },
  {
    slug: "securite-incendie",
    parent: "securite-electronique",
    icon: "Flame",
    order: 4,
    title: L("Sécurité incendie", "Fire safety", "السلامة من الحرائق"),
    shortDescription: L(
      "Détection incendie conventionnelle ou adressable et systèmes d'extinction, conformes à la réglementation.",
      "Conventional or addressable fire detection and extinguishing systems, compliant with regulations.",
      "كشف الحرائق التقليدي أو المعنون وأنظمة الإطفاء وفق التراتيب.",
    ),
    body: L(
      "Centrales de détection incendie conventionnelles ou adressables, détecteurs de fumée et de chaleur, déclencheurs manuels et sirènes, ainsi que systèmes d'extinction automatique. Nous vous accompagnons pour répondre aux exigences de la protection civile selon le type d'établissement.",
      "Conventional or addressable fire alarm panels, smoke and heat detectors, manual call points and sounders, plus automatic extinguishing systems. We help you meet civil-protection requirements for your type of building.",
      "لوحات كشف الحرائق التقليدية أو المعنونة وكواشف الدخان والحرارة ومفاتيح الإنذار اليدوية والصفارات، إضافة إلى أنظمة الإطفاء الآلي. نرافقك لاستيفاء متطلبات الحماية المدنية حسب نوع المؤسسة.",
    ),
    benefits: list(
      ["Détection précoce et localisée", "Conformité protection civile", "Extinction automatique des locaux techniques", "Contrats de maintenance"],
      ["Early, pinpointed detection", "Civil-protection compliance", "Automatic extinguishing for technical rooms", "Maintenance contracts"],
      ["كشف مبكّر ومحدّد الموقع", "مطابقة لمتطلبات الحماية المدنية", "إطفاء آلي للمحلات التقنية", "عقود صيانة"],
    ),
    process: [],
  },

  // --- H2 Réseaux & infrastructures numériques ---------------------------------
  {
    slug: "reseaux-infrastructures",
    icon: "Network",
    order: 2,
    title: L("Réseaux & infrastructures numériques", "Networks & digital infrastructure", "الشبكات والبنية التحتية الرقمية"),
    shortDescription: L(
      "Fibre optique, câblage structuré, téléphonie IP, réseaux LAN / Wi-Fi et salles serveurs.",
      "Fibre optics, structured cabling, IP telephony, LAN / Wi-Fi networks and server rooms.",
      "الألياف البصرية والتوصيل المهيكل والهاتف عبر IP وشبكات LAN / Wi-Fi وقاعات الخوادم.",
    ),
    body: L(
      "Une infrastructure réseau fiable est la base de tous vos systèmes : téléphonie, vidéosurveillance, informatique, objets connectés. Nous concevons, déployons et certifions vos réseaux, du câblage physique jusqu'aux équipements actifs.",
      "A reliable network infrastructure underpins all your systems: telephony, video surveillance, IT, connected devices. We design, deploy and certify your networks, from physical cabling to active equipment.",
      "البنية التحتية الموثوقة للشبكة هي أساس كل أنظمتك: الهاتف والمراقبة بالفيديو والإعلامية والأجهزة المتصلة. نصمّم شبكاتك وننشرها ونصادق عليها، من التوصيل المادي إلى التجهيزات النشطة.",
    ),
    benefits: list(
      ["Câblage certifié et documenté", "Réseaux performants et sécurisés", "Interconnexion de sites", "Un seul interlocuteur du câble au serveur"],
      ["Certified, documented cabling", "Fast, secure networks", "Site interconnection", "One partner from cable to server"],
      ["توصيل مصادق عليه وموثّق", "شبكات سريعة وآمنة", "ربط المواقع", "مخاطب واحد من الكابل إلى الخادم"],
    ),
    process: areaProcess,
  },
  {
    slug: "fibre-optique-cablage",
    parent: "reseaux-infrastructures",
    icon: "Cable",
    order: 1,
    title: L("Fibre optique & câblage structuré", "Fibre optics & structured cabling", "الألياف البصرية والتوصيل المهيكل"),
    shortDescription: L(
      "Pose, raccordement et certification de liaisons fibre et de réseaux cuivre catégorie 6/6A.",
      "Installation, splicing and certification of fibre links and Cat 6/6A copper networks.",
      "تركيب وربط وتصديق وصلات الألياف وشبكات النحاس من الفئة 6/6A.",
    ),
    body: L(
      "Câblage structuré cuivre, baies de brassage, liaisons fibre optique entre bâtiments ou étages, soudure et tests réflectométriques. Chaque réseau est étiqueté, testé et livré avec son dossier de recette.",
      "Structured copper cabling, patch racks, fibre links between buildings or floors, fusion splicing and OTDR testing. Every network is labelled, tested and delivered with its acceptance file.",
      "توصيل نحاسي مهيكل وخزائن توزيع ووصلات ألياف بصرية بين المباني أو الطوابق ولحام واختبارات قياس الانعكاس. تُسلَّم كل شبكة موسومة ومختبرة مع ملف الاستلام.",
    ),
    benefits: list(
      ["Tests et certification des liens", "Interconnexion de bâtiments en fibre", "Baies organisées et étiquetées", "Dossier de recette complet"],
      ["Link testing and certification", "Fibre interconnection of buildings", "Tidy, labelled racks", "Full acceptance file"],
      ["اختبار الوصلات والمصادقة عليها", "ربط المباني بالألياف", "خزائن منظّمة وموسومة", "ملف استلام كامل"],
    ),
    process: [],
  },
  {
    slug: "telephonie-ip-standard",
    parent: "reseaux-infrastructures",
    icon: "Phone",
    order: 2,
    title: L("Téléphonie IP & standard téléphonique", "IP telephony & phone systems (IPBX)", "الهاتف عبر IP والمقسّم الهاتفي"),
    shortDescription: L(
      "Standards IPBX, postes IP, serveur vocal et enregistrement des appels pour vos équipes.",
      "IPBX systems, IP handsets, IVR and call recording for your teams.",
      "مقسّمات IPBX وهواتف IP ومجيب صوتي وتسجيل المكالمات لفرقك.",
    ),
    body: L(
      "Mise en place de standards téléphoniques IP (IPBX) sur site ou hébergés, postes fixes et softphones, serveur vocal interactif, files d'attente et enregistrement des appels. Raccordement aux lignes des opérateurs et interconnexion de plusieurs sites.",
      "On-premise or hosted IP phone systems (IPBX), desk phones and softphones, interactive voice response, call queues and call recording. Connection to operator lines and interconnection of several sites.",
      "تركيز مقسّمات هاتفية IP محلية أو مستضافة وهواتف مكتبية وتطبيقات هاتفية ومجيب صوتي تفاعلي وقوائم انتظار وتسجيل المكالمات، مع الربط بخطوط المشغّلين وبين عدّة مواقع.",
    ),
    benefits: list(
      ["Appels internes gratuits entre sites", "Accueil téléphonique professionnel", "Mobilité : votre poste sur smartphone", "Coûts de communication réduits"],
      ["Free internal calls between sites", "Professional call handling", "Mobility: your extension on a smartphone", "Lower call costs"],
      ["مكالمات داخلية مجانية بين المواقع", "استقبال هاتفي احترافي", "التنقّل: رقمك على الهاتف الذكي", "تكاليف اتصال أقل"],
    ),
    process: [],
  },
  {
    slug: "reseaux-lan-wifi",
    parent: "reseaux-infrastructures",
    icon: "Wifi",
    order: 3,
    title: L("Réseaux LAN / Wi-Fi & salles serveurs", "LAN / Wi-Fi networks & server rooms", "شبكات LAN / Wi-Fi وقاعات الخوادم"),
    shortDescription: L(
      "Commutateurs, Wi-Fi professionnel, pare-feu et aménagement de salles serveurs.",
      "Switches, professional Wi-Fi, firewalls and server-room fit-out.",
      "مبدّلات وWi-Fi احترافي وجدران حماية وتهيئة قاعات الخوادم.",
    ),
    body: L(
      "Réseaux locaux avec commutateurs administrables, segmentation, couverture Wi-Fi professionnelle étudiée et sécurisée, pare-feu. Aménagement de salles serveurs et locaux techniques : baies, onduleurs, climatisation et supervision.",
      "Local networks with managed switches, segmentation, surveyed and secured professional Wi-Fi coverage, firewalls. Server rooms and technical rooms fitted out: racks, UPS, cooling and monitoring.",
      "شبكات محلية بمبدّلات قابلة للإدارة وتقسيم وتغطية Wi-Fi احترافية مدروسة وآمنة وجدران حماية. تهيئة قاعات الخوادم والمحلات التقنية: خزائن ومموّجات وتكييف ومراقبة.",
    ),
    benefits: list(
      ["Couverture Wi-Fi étudiée sur plan", "Réseau segmenté et sécurisé", "Salles serveurs protégées (onduleur, climatisation)", "Supervision des équipements"],
      ["Wi-Fi coverage planned on your floor plan", "Segmented, secured network", "Protected server rooms (UPS, cooling)", "Equipment monitoring"],
      ["تغطية Wi-Fi مدروسة على المخطّط", "شبكة مقسّمة وآمنة", "قاعات خوادم محميّة (مموّج، تكييف)", "مراقبة التجهيزات"],
    ),
    process: [],
  },

  // --- H3 Solutions de gestion & point de vente --------------------------------
  {
    slug: "gestion-point-de-vente",
    icon: "Store",
    order: 3,
    title: L("Solutions de gestion & point de vente", "Retail & business management", "حلول التسيير ونقاط البيع"),
    shortDescription: L(
      "Caisses enregistreuses, terminaux de point de vente et logiciels de gestion commerciale et de stock.",
      "Cash registers, point-of-sale terminals and sales & stock management software.",
      "آلات تسجيل النقد ونقاط البيع وبرمجيات التسيير التجاري والمخزون.",
    ),
    body: L(
      "Nous équipons les commerces, restaurants, pharmacies et entreprises en solutions d'encaissement et de gestion : notre propre logiciel ou des solutions éditeurs, installés, paramétrés et accompagnés sur le terrain.",
      "We equip shops, restaurants, pharmacies and companies with checkout and management solutions: our own software or third-party solutions, installed, configured and supported on site.",
      "نجهّز المحلات التجارية والمطاعم والصيدليات والمؤسسات بحلول الدفع والتسيير: برمجيتنا الخاصة أو حلول ناشرين، مع التركيب والضبط والمرافقة الميدانية.",
    ),
    benefits: list(
      ["Matériel et logiciel d'un seul fournisseur", "Paramétrage selon votre activité", "Formation de vos équipes", "Assistance et mises à jour"],
      ["Hardware and software from one supplier", "Set up for your business", "Training for your teams", "Support and updates"],
      ["العتاد والبرمجيات من مزوّد واحد", "ضبط حسب نشاطك", "تكوين فرقك", "دعم وتحديثات"],
    ),
    process: areaProcess,
  },
  {
    slug: "caisse-enregistreuse",
    parent: "gestion-point-de-vente",
    icon: "ScanBarcode",
    order: 1,
    title: L("Caisses enregistreuses & terminaux POS", "Cash registers & POS terminals", "آلات تسجيل النقد ونقاط البيع"),
    shortDescription: L(
      "Terminaux de caisse tactiles, imprimantes de tickets, lecteurs de codes-barres, balances et tiroirs-caisse.",
      "Touch POS terminals, receipt printers, barcode scanners, scales and cash drawers.",
      "أجهزة دفع لمسية وطابعات تذاكر وقارئات رموز شريطية وموازين وأدراج نقود.",
    ),
    body: L(
      "Postes d'encaissement complets adaptés à votre commerce : terminal tactile, imprimante, scanner, balance connectée, afficheur client et tiroir-caisse. Installation, paramétrage des articles et des taxes, et formation du personnel de caisse.",
      "Complete checkout stations for your business: touch terminal, printer, scanner, connected scale, customer display and cash drawer. Installation, item and tax set-up, and cashier training.",
      "محطات دفع متكاملة تناسب نشاطك: جهاز لمسي وطابعة وماسح وميزان متصل وشاشة للحريف ودرج نقود، مع التركيب وضبط المنتجات والأداءات وتكوين أعوان الخزينة.",
    ),
    benefits: list(
      ["Encaissement rapide et fiable", "Périphériques compatibles et testés", "Suivi des ventes en temps réel", "Dépannage de proximité"],
      ["Fast, reliable checkout", "Compatible, tested peripherals", "Real-time sales tracking", "Local repairs"],
      ["دفع سريع وموثوق", "ملحقات متوافقة ومختبرة", "متابعة المبيعات في الوقت الحقيقي", "إصلاح عن قرب"],
    ),
    process: [],
  },
  {
    slug: "logiciel-gestion-stock",
    parent: "gestion-point-de-vente",
    icon: "Server",
    order: 2,
    title: L("Logiciel de gestion commerciale & de stock", "Sales & stock management software", "برمجية التسيير التجاري والمخزون"),
    shortDescription: L(
      "Ventes, achats, stock multi-dépôts et facturation : notre logiciel ou des solutions éditeurs, déployés chez vous.",
      "Sales, purchasing, multi-warehouse stock and invoicing: our own software or third-party solutions, deployed for you.",
      "المبيعات والمشتريات والمخزون متعدّد المستودعات والفوترة: برمجيتنا أو حلول ناشرين.",
    ),
    body: L(
      "Gestion des ventes et des achats, suivi du stock par dépôt, inventaires, facturation et tableaux de bord. Nous déployons notre propre logiciel de gestion ou une solution éditeur adaptée, reprenons vos données existantes et formons vos utilisateurs.",
      "Sales and purchase management, stock by warehouse, inventories, invoicing and dashboards. We deploy our own management software or a suitable third-party solution, migrate your existing data and train your users.",
      "تسيير المبيعات والمشتريات ومتابعة المخزون حسب المستودع والجرد والفوترة ولوحات القيادة. ننشر برمجيتنا الخاصة أو حلاً مناسباً من ناشر، مع نقل بياناتك الحالية وتكوين المستعملين.",
    ),
    benefits: list(
      ["Stock juste, inventaires simplifiés", "Facturation et suivi des paiements", "Reprise de vos données", "Sur site ou dans le cloud"],
      ["Accurate stock, simpler inventories", "Invoicing and payment tracking", "Migration of your data", "On-premise or cloud"],
      ["مخزون دقيق وجرد مبسّط", "فوترة ومتابعة الخلاص", "نقل بياناتك", "محلياً أو في السحابة"],
    ),
    process: [],
  },

  // --- H4 Solutions audiovisuelles & collaboratives ----------------------------
  {
    slug: "solutions-audiovisuelles",
    icon: "Monitor",
    order: 4,
    title: L("Solutions audiovisuelles & collaboratives", "AV & collaboration solutions", "الحلول السمعية البصرية والتعاونية"),
    shortDescription: L(
      "Écrans interactifs, affichage dynamique, gestion de file d'attente et salles de réunion connectées.",
      "Interactive displays, digital signage, queue management and connected meeting rooms.",
      "شاشات تفاعلية ولافتات رقمية وتسيير قوائم الانتظار وقاعات اجتماعات متصلة.",
    ),
    body: L(
      "Pour les écoles, les administrations, les banques, les cliniques et les entreprises, nous intégrons les technologies qui facilitent la communication et l'accueil : écrans interactifs, affichage dynamique, gestion de l'attente et visioconférence.",
      "For schools, public offices, banks, clinics and companies, we integrate the technologies that make communication and customer reception easier: interactive displays, digital signage, queue management and video conferencing.",
      "للمدارس والإدارات والبنوك والمصحّات والمؤسسات، ندمج التقنيات التي تسهّل التواصل والاستقبال: الشاشات التفاعلية واللافتات الرقمية وتسيير الانتظار والاجتماعات المرئية.",
    ),
    benefits: list(
      ["Solutions clés en main", "Contenus gérés à distance", "Matériel professionnel", "Formation des utilisateurs"],
      ["Turnkey solutions", "Content managed remotely", "Professional-grade hardware", "User training"],
      ["حلول جاهزة", "إدارة المحتوى عن بُعد", "عتاد احترافي", "تكوين المستعملين"],
    ),
    process: areaProcess,
  },
  {
    slug: "ecrans-interactifs",
    parent: "solutions-audiovisuelles",
    icon: "Presentation",
    order: 1,
    title: L("Écrans interactifs", "Interactive displays", "الشاشات التفاعلية"),
    shortDescription: L(
      "Écrans tactiles grand format pour l'enseignement, la formation et les réunions.",
      "Large touch displays for teaching, training and meetings.",
      "شاشات لمسية كبيرة للتعليم والتكوين والاجتماعات.",
    ),
    body: L(
      "Écrans interactifs tactiles de 65 à 86 pouces avec tableau blanc numérique, partage d'écran sans fil et applications éducatives. Fourniture, fixation murale ou sur support mobile, paramétrage et prise en main par les enseignants ou vos équipes.",
      "Interactive touch displays from 65 to 86 inches with digital whiteboard, wireless screen sharing and educational apps. Supply, wall or mobile-stand mounting, configuration and hand-over to teachers or your teams.",
      "شاشات تفاعلية لمسية من 65 إلى 86 بوصة مع سبّورة رقمية ومشاركة الشاشة لاسلكياً وتطبيقات تعليمية. التزويد والتثبيت على الجدار أو على حامل متنقل والضبط وتكوين المدرّسين أو فرقك.",
    ),
    benefits: list(
      ["Cours et réunions plus interactifs", "Partage sans fil depuis PC et smartphone", "Installation murale ou mobile", "Prise en main accompagnée"],
      ["More engaging lessons and meetings", "Wireless sharing from PC and smartphone", "Wall or mobile installation", "Guided hand-over"],
      ["دروس واجتماعات أكثر تفاعلاً", "مشاركة لاسلكية من الحاسوب والهاتف", "تركيب جداري أو متنقّل", "مرافقة في الاستعمال"],
    ),
    process: [],
  },
  {
    slug: "affichage-dynamique",
    parent: "solutions-audiovisuelles",
    icon: "Tv",
    order: 2,
    title: L("Affichage dynamique", "Digital signage", "اللافتات الرقمية"),
    shortDescription: L(
      "Écrans d'information et de promotion pilotés à distance, en intérieur ou en vitrine.",
      "Information and promotion screens managed remotely, indoors or in shop windows.",
      "شاشات إعلام وترويج تُدار عن بُعد في الداخل أو في الواجهات.",
    ),
    body: L(
      "Réseaux d'écrans pour l'accueil, les vitrines, les restaurants et les espaces publics, avec un logiciel de gestion des contenus : programmation par horaire, multi-écrans et multi-sites, contenus vidéo, images et informations en direct.",
      "Screen networks for receptions, shop windows, restaurants and public spaces, with content management software: scheduling, multi-screen and multi-site, video, images and live information.",
      "شبكات شاشات للاستقبال والواجهات والمطاعم والفضاءات العمومية مع برمجية لإدارة المحتوى: برمجة حسب التوقيت ومتعدّدة الشاشات والمواقع ومحتوى فيديو وصور ومعلومات مباشرة.",
    ),
    benefits: list(
      ["Contenus mis à jour à distance", "Programmation par horaire", "Plusieurs écrans, plusieurs sites", "Écrans haute luminosité pour vitrines"],
      ["Content updated remotely", "Scheduled playlists", "Many screens, many sites", "High-brightness screens for windows"],
      ["تحديث المحتوى عن بُعد", "برمجة حسب التوقيت", "عدّة شاشات وعدّة مواقع", "شاشات عالية الإضاءة للواجهات"],
    ),
    process: [],
  },
  {
    slug: "gestion-file-attente",
    parent: "solutions-audiovisuelles",
    icon: "ListOrdered",
    order: 3,
    title: L("Gestion de file d'attente", "Queue management", "تسيير قوائم الانتظار"),
    shortDescription: L(
      "Bornes de tickets, afficheurs d'appel et statistiques pour un accueil fluide.",
      "Ticket kiosks, calling displays and statistics for smooth customer flow.",
      "أجهزة تذاكر وشاشات نداء وإحصائيات لاستقبال سلس.",
    ),
    body: L(
      "Systèmes de gestion de l'attente pour les agences, administrations, cliniques et guichets : borne de distribution de tickets, écrans et annonces vocales d'appel, ticket par SMS ou QR code, et statistiques sur les temps d'attente et de service.",
      "Queue management for branches, public offices, clinics and counters: ticket kiosks, calling screens and voice announcements, SMS or QR-code tickets, and statistics on waiting and service times.",
      "أنظمة تسيير الانتظار للوكالات والإدارات والمصحّات والشبابيك: أجهزة توزيع التذاكر وشاشات ونداءات صوتية وتذاكر عبر الإرسالية القصيرة أو رمز QR وإحصائيات حول مدّة الانتظار والخدمة.",
    ),
    benefits: list(
      ["Accueil organisé et plus serein", "Ticket papier, SMS ou QR code", "Statistiques par guichet", "Interface en arabe et en français"],
      ["Organised, calmer reception", "Paper, SMS or QR-code tickets", "Per-counter statistics", "Arabic and French interface"],
      ["استقبال منظّم وأكثر هدوءاً", "تذكرة ورقية أو عبر الإرسالية أو QR", "إحصائيات لكل شبّاك", "واجهة بالعربية والفرنسية"],
    ),
    process: [],
  },
  {
    slug: "salles-reunion",
    parent: "solutions-audiovisuelles",
    icon: "Video",
    order: 4,
    title: L("Salles de réunion connectées & visioconférence", "Connected meeting rooms & video conferencing", "قاعات الاجتماعات المتصلة والاجتماعات المرئية"),
    shortDescription: L(
      "Caméras, micros, écrans et partage sans fil pour des réunions sur site et à distance.",
      "Cameras, microphones, screens and wireless sharing for on-site and remote meetings.",
      "كاميرات وميكروفونات وشاشات ومشاركة لاسلكية للاجتماعات الحضورية وعن بُعد.",
    ),
    body: L(
      "Équipement de salles de réunion et de conférence : caméra de visioconférence, système audio, écrans ou vidéoprojection, partage d'écran sans fil. Compatible avec les plateformes du marché (Teams, Zoom, Meet), pour des salles de 4 à plusieurs dizaines de personnes.",
      "Meeting and conference room equipment: video-conferencing camera, audio system, screens or projection, wireless screen sharing. Works with mainstream platforms (Teams, Zoom, Meet), for rooms from 4 to several dozen people.",
      "تجهيز قاعات الاجتماعات والمؤتمرات: كاميرا للاجتماعات المرئية ونظام صوتي وشاشات أو عرض ضوئي ومشاركة لاسلكية للشاشة، متوافق مع المنصّات الشائعة (Teams وZoom وMeet) لقاعات من 4 أشخاص إلى عدّة عشرات.",
    ),
    benefits: list(
      ["Réunions hybrides sans friction", "Son et image de qualité", "Partage d'écran en un clic", "Compatible avec vos outils"],
      ["Frictionless hybrid meetings", "Quality sound and picture", "One-click screen sharing", "Works with your tools"],
      ["اجتماعات هجينة دون تعقيد", "صوت وصورة بجودة عالية", "مشاركة الشاشة بنقرة", "متوافق مع أدواتك"],
    ),
    process: [],
  },

  // --- H5 IoT & Smart City -------------------------------------------------------
  {
    slug: "iot-smart-city",
    icon: "Cpu",
    order: 5,
    title: L("IoT & Smart City", "IoT & Smart City", "إنترنت الأشياء والمدن الذكية"),
    shortDescription: L(
      "Capteurs connectés, télémétrie et plateformes de supervision pour les entreprises et les collectivités.",
      "Connected sensors, telemetry and monitoring platforms for companies and local authorities.",
      "أجهزة استشعار متصلة وقياس عن بُعد ومنصّات مراقبة للمؤسسات والجماعات المحلية.",
    ),
    body: L(
      "L'Internet des objets permet de mesurer, surveiller et piloter à distance : niveaux d'eau, énergie, température, éclairage, stationnement. Nous déployons les capteurs, le réseau de communication et la plateforme de supervision adaptés à chaque projet.",
      "The Internet of Things lets you measure, monitor and control remotely: water levels, energy, temperature, lighting, parking. We deploy the sensors, communication network and monitoring platform each project needs.",
      "يتيح إنترنت الأشياء القياس والمراقبة والتحكّم عن بُعد: مستويات المياه والطاقة والحرارة والإنارة ووقوف السيارات. ننشر أجهزة الاستشعار وشبكة الاتصال ومنصّة المراقبة الملائمة لكل مشروع.",
    ),
    benefits: list(
      ["Données en temps réel", "Alertes automatiques", "Réseaux longue portée basse consommation", "Tableaux de bord sur mesure"],
      ["Real-time data", "Automatic alerts", "Long-range, low-power networks", "Custom dashboards"],
      ["بيانات في الوقت الحقيقي", "تنبيهات آلية", "شبكات بعيدة المدى منخفضة الاستهلاك", "لوحات قيادة حسب الطلب"],
    ),
    process: areaProcess,
  },
  {
    slug: "iot-telemetrie",
    parent: "iot-smart-city",
    icon: "RadioTower",
    order: 1,
    title: L("Capteurs & télémétrie IoT (LoRaWAN)", "IoT sensors & telemetry (LoRaWAN)", "أجهزة الاستشعار والقياس عن بُعد (LoRaWAN)"),
    shortDescription: L(
      "Mesure à distance de niveaux, compteurs, températures et équipements, via LoRaWAN ou réseau mobile.",
      "Remote measurement of levels, meters, temperatures and equipment over LoRaWAN or mobile networks.",
      "قياس عن بُعد للمستويات والعدّادات والحرارة والتجهيزات عبر LoRaWAN أو الشبكة الخلوية.",
    ),
    body: L(
      "Capteurs autonomes sur batterie pour les réservoirs et forages, compteurs d'eau et d'énergie, chambres froides, pompes et groupes électrogènes. Les données remontent par LoRaWAN ou réseau mobile vers une plateforme qui affiche les mesures, l'historique et envoie des alertes.",
      "Battery-powered sensors for tanks and boreholes, water and energy meters, cold rooms, pumps and gensets. Data travels over LoRaWAN or mobile networks to a platform that shows readings and history and sends alerts.",
      "أجهزة استشعار مستقلة بالبطارية للخزانات والآبار وعدّادات المياه والطاقة وغرف التبريد والمضخات والمولّدات. تنتقل البيانات عبر LoRaWAN أو الشبكة الخلوية إلى منصّة تعرض القياسات وسجلّها وترسل التنبيهات.",
    ),
    benefits: list(
      ["Surveillance des pompes et forages", "Relevés de compteurs à distance", "Alertes sur seuils", "Plusieurs années d'autonomie"],
      ["Pump and borehole monitoring", "Remote meter reading", "Threshold alerts", "Years of battery life"],
      ["مراقبة المضخات والآبار", "قراءة العدّادات عن بُعد", "تنبيهات عند تجاوز العتبات", "استقلالية لسنوات"],
    ),
    process: [],
  },
  {
    slug: "smart-city",
    parent: "iot-smart-city",
    icon: "Building2",
    order: 2,
    title: L("Smart city", "Smart city", "المدينة الذكية"),
    shortDescription: L(
      "Éclairage intelligent, stationnement, vidéo urbaine et supervision centralisée pour les communes.",
      "Smart lighting, parking, urban video and centralised supervision for municipalities.",
      "إنارة ذكية ووقوف السيارات ومراقبة حضرية بالفيديو وإشراف مركزي للبلديات.",
    ),
    body: L(
      "Nous accompagnons les communes dans leurs projets de ville intelligente : pilotage à distance de l'éclairage public, capteurs de stationnement, vidéoprotection urbaine, mesure de la qualité de l'environnement, le tout réuni dans une supervision centralisée.\n\nAvec Growing Technologies, notre société sœur, nous proposons aussi l'éclairage public solaire.",
      "We support municipalities in their smart-city projects: remote control of street lighting, parking sensors, urban video protection, environmental monitoring, all brought together in centralised supervision.\n\nWith our sister company Growing Technologies, we also offer solar street lighting.",
      "نرافق البلديات في مشاريع المدينة الذكية: التحكّم عن بُعد في الإنارة العمومية وأجهزة استشعار وقوف السيارات والحماية الحضرية بالفيديو وقياس جودة البيئة، ضمن منصّة إشراف مركزية.\n\nومع شركتنا الشقيقة Growing Technologies نوفّر أيضاً الإنارة العمومية الشمسية.",
    ),
    benefits: list(
      ["Économies d'énergie sur l'éclairage", "Espaces publics plus sûrs", "Supervision centralisée", "Projets conformes aux marchés publics"],
      ["Energy savings on lighting", "Safer public spaces", "Centralised supervision", "Projects compliant with public procurement"],
      ["اقتصاد في طاقة الإنارة", "فضاءات عمومية أكثر أماناً", "إشراف مركزي", "مشاريع مطابقة للصفقات العمومية"],
    ),
    process: [],
  },

  // --- H6 Intégrateur B2G ------------------------------------------------------------
  {
    slug: "integration-b2g",
    icon: "Landmark",
    order: 6,
    showPublicReferences: true,
    showDocuments: true,
    title: L("Intégrateur de projets publics (B2G)", "Public-sector systems integrator (B2G)", "مُدمج المشاريع العمومية"),
    shortDescription: L(
      "Réponse aux marchés publics et intégration clés en main de projets multi-lots pour les institutions.",
      "Public tenders and turnkey integration of multi-lot projects for public institutions.",
      "المشاركة في الصفقات العمومية والإدماج الشامل للمشاريع متعدّدة الحصص لفائدة المؤسسات العمومية.",
    ),
    body: L(
      "Ministères, communes, établissements scolaires et de santé, entreprises publiques : nous répondons aux appels d'offres et réalisons des projets qui réunissent plusieurs technologies — sécurité électronique, réseaux, audiovisuel, IoT et énergie — sous une seule responsabilité, du cahier des charges à la réception.",
      "Ministries, municipalities, schools, hospitals and state-owned companies: we bid on public tenders and deliver projects that combine several technologies — electronic security, networks, AV, IoT and energy — under a single responsibility, from specifications to acceptance.",
      "الوزارات والبلديات والمؤسسات التربوية والصحية والمنشآت العمومية: نشارك في طلبات العروض وننجز مشاريع تجمع عدّة تقنيات — الأمن الإلكتروني والشبكات والسمعي البصري وإنترنت الأشياء والطاقة — تحت مسؤولية واحدة من كرّاس الشروط إلى القبول.",
    ),
    benefits: list(
      ["Un interlocuteur unique pour tous les lots", "Maîtrise des procédures de marchés publics", "Documents administratifs à jour", "Garantie et maintenance après réception"],
      ["One contractor for every lot", "Command of public procurement procedures", "Up-to-date administrative documents", "Warranty and maintenance after acceptance"],
      ["مخاطب واحد لكل الحصص", "تحكّم في إجراءات الصفقات العمومية", "وثائق إدارية محيّنة", "ضمان وصيانة بعد القبول"],
    ),
    process: [
      {
        title: L("Analyse du cahier des charges", "Specification review", "تحليل كرّاس الشروط"),
        description: L(
          "Lecture technique et administrative, visite des lieux, questions au maître d'ouvrage.",
          "Technical and administrative review, site visit, questions to the contracting authority.",
          "قراءة فنية وإدارية ومعاينة الموقع وأسئلة لصاحب المشروع.",
        ),
      },
      {
        title: L("Offre technique & financière", "Technical & financial bid", "العرض الفني والمالي"),
        description: L(
          "Solution conforme, fiches techniques, planning et offre de prix.",
          "Compliant solution, datasheets, schedule and price offer.",
          "حلّ مطابق وبطاقات فنية ورزنامة وعرض أسعار.",
        ),
      },
      {
        title: L("Exécution", "Delivery", "التنفيذ"),
        description: L(
          "Fourniture, installation et coordination de tous les lots.",
          "Supply, installation and coordination of every lot.",
          "التزويد والتركيب وتنسيق كل الحصص.",
        ),
      },
      {
        title: L("Réception & garantie", "Acceptance & warranty", "القبول والضمان"),
        description: L(
          "Essais, formation, dossier de récolement, puis garantie et maintenance.",
          "Testing, training, as-built file, then warranty and maintenance.",
          "الاختبارات والتكوين وملف المطابقة ثم الضمان والصيانة.",
        ),
      },
    ],
    sections: [
      {
        anchor: "marches-publics",
        icon: "Landmark",
        title: L("Marchés publics", "Public tenders", "الصفقات العمومية"),
        body: L(
          "Nous répondons aux consultations et appels d'offres nationaux, seuls ou en groupement, dans le respect des procédures de la commande publique. Nos documents administratifs et fiscaux sont tenus à jour et transmis sur demande.",
          "We bid on national consultations and tenders, alone or in consortium, following public procurement procedures. Our administrative and tax documents are kept up to date and provided on request.",
          "نشارك في الاستشارات وطلبات العروض الوطنية منفردين أو ضمن تجمّع، وفق إجراءات الشراءات العمومية. وثائقنا الإدارية والجبائية محيّنة وتُقدَّم عند الطلب.",
        ),
      },
      {
        anchor: "integration-multi-lots",
        icon: "Network",
        title: L("Intégration multi-lots clés en main", "Turnkey multi-lot integration", "إدماج شامل للمشاريع متعدّدة الحصص"),
        body: L(
          "Un même projet peut réunir vidéoprotection, contrôle d'accès, câblage, réseau, affichage dynamique et énergie solaire. Nous coordonnons l'ensemble et livrons un système cohérent, documenté et maintenu, avec l'appui de Growing Technologies pour la partie énergie.",
          "One project can combine video protection, access control, cabling, networking, digital signage and solar power. We coordinate everything and deliver a coherent, documented and maintained system, with Growing Technologies handling the energy part.",
          "قد يجمع مشروع واحد الحماية بالفيديو ومراقبة الدخول والتوصيل والشبكة واللافتات الرقمية والطاقة الشمسية. ننسّق الكل ونسلّم منظومة متناسقة وموثّقة ومصانة، بدعم من Growing Technologies في الجانب الطاقي.",
        ),
      },
    ],
  },
];
