import { t3 } from "../../src/cms/labels";
import type { SeedForm } from "./devis-forms";

/**
 * Hikview Engineering's quote forms (plan §6.3): one per sub-service (the IoT
 * form serves both IoT pages) plus the public-sector (B2G) form on its area.
 * Seed data only: the team refines them in the admin (Formulaires de devis).
 */

const opt = (value: string, fr: string, en: string, ar: string) => ({ value, label: t3(fr, en, ar) });

const m2 = t3("m²", "m²", "م²");
const m = t3("m", "m", "م");

const clientType = {
  name: "clientType",
  type: "radio" as const,
  required: true,
  label: t3("Pour", "For", "لفائدة"),
  options: [
    opt("residentiel", "Maison / résidence", "Home / residence", "منزل / إقامة"),
    opt("professionnel", "Entreprise / commerce", "Business / shop", "مؤسسة / محلّ تجاري"),
    opt("public", "Administration / collectivité", "Public body / municipality", "إدارة / جماعة محلية"),
  ],
};

const sites = {
  name: "sites",
  type: "number" as const,
  label: t3("Nombre de sites", "Number of sites", "عدد المواقع"),
  help: t3(
    "Plusieurs agences, magasins ou bâtiments à équiper ? Indiquez combien.",
    "Several branches, shops or buildings to equip? Say how many.",
    "عدّة فروع أو محلات أو مبانٍ؟ اذكر عددها.",
  ),
  min: 1,
  max: 1_000,
};

const existingNotes = (fr: string, en: string, ar: string) => ({
  name: "existingNotes",
  type: "textarea" as const,
  label: t3(fr, en, ar),
});

export const hikviewDevisForms: SeedForm[] = [
  // --- H1 Sécurité électronique -----------------------------------------------
  {
    site: "hikview",
    services: ["videosurveillance"],
    title: "Vidéosurveillance & vision par ordinateur",
    attachments: {
      help: t3(
        "Un plan du site ou des photos des zones à surveiller nous aident à placer les caméras.",
        "A site plan or photos of the areas to cover help us place the cameras.",
        "مخطط الموقع أو صور المناطق المراد مراقبتها يساعدنا على تحديد أماكن الكاميرات.",
      ),
    },
    questions: [
      clientType,
      {
        name: "siteType",
        type: "select",
        required: true,
        label: t3("Type de site", "Site type", "نوع الموقع"),
        options: [
          opt("maison", "Maison / villa", "House / villa", "منزل / فيلا"),
          opt("immeuble", "Immeuble / résidence", "Apartment building / residence", "عمارة / إقامة"),
          opt("commerce", "Commerce / showroom", "Shop / showroom", "محلّ / قاعة عرض"),
          opt("bureaux", "Bureaux", "Offices", "مكاتب"),
          opt("industrie", "Usine / entrepôt", "Factory / warehouse", "مصنع / مستودع"),
          opt("exploitation", "Exploitation agricole / site isolé", "Farm / remote site", "ضيعة فلاحية / موقع معزول"),
          opt("etablissement-public", "Établissement public (école, hôpital…)", "Public building (school, hospital…)", "مؤسسة عمومية (مدرسة، مستشفى…)"),
          opt("voie-publique", "Voie publique / parking", "Public road / car park", "طريق عمومي / مأوى سيارات"),
        ],
      },
      {
        name: "indoorCameras",
        type: "number",
        label: t3("Caméras intérieures", "Indoor cameras", "كاميرات داخلية"),
        help: t3(
          "Nombre approximatif. Si vous ne savez pas, laissez vide : nous le définirons lors de la visite.",
          "Approximate number. If unsure, leave empty: we'll work it out during the visit.",
          "عدد تقريبي. إن لم تكن متأكداً اتركه فارغاً: نحدّده أثناء الزيارة.",
        ),
        max: 5_000,
      },
      {
        name: "outdoorCameras",
        type: "number",
        label: t3("Caméras extérieures", "Outdoor cameras", "كاميرات خارجية"),
        max: 5_000,
      },
      {
        name: "recordingDays",
        type: "select",
        label: t3("Durée de conservation des images", "Recording retention", "مدّة حفظ التسجيلات"),
        help: t3(
          "Nombre de jours d'enregistrement gardés avant d'être écrasés. Elle détermine la capacité de stockage.",
          "Days of footage kept before being overwritten. It sets the storage capacity.",
          "عدد أيام التسجيل المحفوظة قبل المسح. تحدّد سعة التخزين.",
        ),
        options: [
          opt("7", "7 jours", "7 days", "7 أيام"),
          opt("15", "15 jours", "15 days", "15 يوماً"),
          opt("30", "30 jours", "30 days", "30 يوماً"),
          opt("60", "60 jours ou plus", "60 days or more", "60 يوماً أو أكثر"),
        ],
      },
      {
        name: "analytics",
        type: "multiselect",
        label: t3("Fonctions intelligentes souhaitées", "Smart features wanted", "الوظائف الذكية المطلوبة"),
        options: [
          opt("lapi", "Lecture de plaques (LAPI / ANPR)", "Number-plate recognition (ANPR)", "قراءة لوحات السيارات"),
          opt("comptage", "Comptage de personnes / véhicules", "People / vehicle counting", "عدّ الأشخاص / السيارات"),
          opt("intrusion", "Détection d'intrusion / franchissement de ligne", "Intrusion / line-crossing detection", "كشف التسلّل / تجاوز الخط"),
          opt("visage", "Reconnaissance faciale", "Face recognition", "التعرّف على الوجوه"),
          opt("feu-fumee", "Détection de feu / fumée", "Fire / smoke detection", "كشف النار / الدخان"),
        ],
      },
      {
        name: "remoteViewing",
        type: "checkbox",
        label: t3("Consultation à distance sur smartphone", "Remote viewing on a smartphone", "المشاهدة عن بعد على الهاتف الذكي"),
      },
      {
        name: "project",
        type: "radio",
        required: true,
        label: t3("Votre projet", "Your project", "مشروعك"),
        options: [
          opt("nouveau", "Nouvelle installation", "New installation", "تركيب جديد"),
          opt("extension", "Extension / modernisation d'un système existant", "Extending / upgrading an existing system", "توسعة / تحديث منظومة موجودة"),
        ],
      },
      {
        ...existingNotes(
          "Système existant (marque, nombre de caméras, analogique ou IP)",
          "Existing system (brand, number of cameras, analogue or IP)",
          "المنظومة الحالية (العلامة، عدد الكاميرات، تناظرية أو IP)",
        ),
        showIf: { field: "project", equals: "extension" },
      },
    ],
  },
  {
    site: "hikview",
    services: ["alarme-anti-intrusion"],
    title: "Alarme anti-intrusion",
    questions: [
      {
        ...clientType,
        options: clientType.options.slice(0, 2),
      },
      { name: "surfaceM2", type: "number", label: t3("Surface à protéger", "Area to protect", "المساحة المراد حمايتها"), unit: m2, max: 1_000_000 },
      {
        name: "openings",
        type: "number",
        label: t3("Ouvertures à protéger", "Openings to protect", "المنافذ المراد حمايتها"),
        help: t3("Portes, fenêtres, baies vitrées donnant sur l'extérieur.", "Doors, windows and glass doors to the outside.", "الأبواب والنوافذ والواجهات الزجاجية المطلّة على الخارج."),
        max: 10_000,
      },
      {
        name: "zones",
        type: "number",
        label: t3("Pièces / zones", "Rooms / zones", "الغرف / المناطق"),
        max: 10_000,
      },
      {
        name: "alerting",
        type: "radio",
        label: t3("En cas d'alarme", "When the alarm goes off", "عند الإنذار"),
        options: [
          opt("sirene", "Sirène sur place uniquement", "On-site siren only", "صفّارة في المكان فقط"),
          opt("application", "Sirène + alertes sur smartphone", "Siren + smartphone alerts", "صفّارة + تنبيهات على الهاتف"),
          opt("telesurveillance", "Télésurveillance par un centre", "Monitoring by a control centre", "مراقبة عن بعد من مركز"),
        ],
      },
      {
        name: "transmission",
        type: "select",
        label: t3("Transmission", "Transmission", "الإرسال"),
        help: t3(
          "GSM/4G fonctionne sans internet ; la double transmission reste joignable si un lien coupe.",
          "GSM/4G works without internet; dual transmission stays reachable if one link fails.",
          "يعمل GSM/4G دون إنترنت؛ الإرسال المزدوج يبقى متاحاً إذا انقطع أحد الخطّين.",
        ),
        options: [
          opt("gsm", "GSM / 4G", "GSM / 4G", "GSM / 4G"),
          opt("ip", "IP (internet)", "IP (internet)", "IP (إنترنت)"),
          opt("gsm-ip", "GSM + IP (double transmission)", "GSM + IP (dual path)", "GSM + IP (إرسال مزدوج)"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "extras",
        type: "multiselect",
        label: t3("Options", "Options", "خيارات"),
        options: [
          opt("exterieur", "Détecteurs extérieurs", "Outdoor detectors", "كواشف خارجية"),
          opt("animaux", "Compatible animaux", "Pet-friendly detectors", "كواشف متوافقة مع الحيوانات"),
          opt("fumee", "Détecteurs de fumée", "Smoke detectors", "كواشف الدخان"),
          opt("levee-doute", "Levée de doute vidéo", "Video verification", "التحقّق بالفيديو"),
        ],
      },
    ],
  },
  {
    site: "hikview",
    services: ["controle-acces-pointage"],
    title: "Contrôle d'accès & pointage",
    questions: [
      {
        name: "need",
        type: "multiselect",
        required: true,
        label: t3("Vous avez besoin de", "You need", "تحتاج إلى"),
        options: [
          opt("controle-acces", "Contrôle d'accès (portes, zones)", "Access control (doors, zones)", "مراقبة الدخول (أبواب، مناطق)"),
          opt("pointage", "Pointage du personnel", "Staff time attendance", "تسجيل حضور الأعوان"),
          opt("parking", "Accès parking / véhicules", "Car park / vehicle access", "دخول المأوى / السيارات"),
        ],
      },
      { name: "doors", type: "number", label: t3("Portes / accès à équiper", "Doors / entrances to equip", "الأبواب / المداخل المراد تجهيزها"), max: 10_000 },
      { name: "staff", type: "number", required: true, label: t3("Nombre d'employés", "Number of employees", "عدد الأعوان"), min: 1, max: 100_000 },
      {
        name: "technology",
        type: "multiselect",
        label: t3("Identification", "Identification", "طريقة التعريف"),
        options: [
          opt("badge", "Badge / carte RFID", "RFID badge / card", "شارة / بطاقة RFID"),
          opt("empreinte", "Empreinte digitale", "Fingerprint", "بصمة الإصبع"),
          opt("visage", "Reconnaissance faciale", "Face recognition", "التعرّف على الوجه"),
          opt("code", "Code", "PIN code", "رمز سرّي"),
          opt("mobile", "QR code / smartphone", "QR code / smartphone", "رمز QR / هاتف ذكي"),
        ],
      },
      {
        name: "hardware",
        type: "multiselect",
        label: t3("Équipements", "Hardware", "التجهيزات"),
        options: [
          opt("serrures", "Serrures / ventouses électriques", "Electric locks / maglocks", "أقفال كهربائية / مغناطيسية"),
          opt("tourniquets", "Tourniquets / portillons", "Turnstiles / speed gates", "بوابات دوّارة"),
          opt("barrieres", "Barrières levantes", "Boom barriers", "حواجز آلية"),
          opt("interphone", "Interphone / visiophone", "Intercom / video door phone", "جرس داخلي / هاتف مرئي"),
        ],
      },
      {
        name: "hrExport",
        type: "checkbox",
        label: t3(
          "Export des pointages vers la paie / RH (Excel ou logiciel de paie)",
          "Attendance export to payroll / HR (Excel or payroll software)",
          "تصدير بيانات الحضور إلى الأجور / الموارد البشرية (Excel أو برنامج الأجور)",
        ),
      },
      sites,
    ],
  },
  {
    site: "hikview",
    services: ["securite-incendie"],
    title: "Sécurité incendie",
    attachments: {
      help: t3(
        "Plans du bâtiment et, le cas échéant, le rapport de la Protection civile.",
        "Building plans and, if any, the Civil Protection report.",
        "مخططات المبنى، وتقرير الحماية المدنية إن وُجد.",
      ),
    },
    questions: [
      {
        name: "buildingType",
        type: "select",
        required: true,
        label: t3("Type d'établissement", "Type of building", "نوع المؤسسة"),
        options: [
          opt("habitation", "Habitation / résidence", "Residential", "سكني"),
          opt("bureaux", "Bureaux", "Offices", "مكاتب"),
          opt("commerce", "Commerce / centre commercial", "Shop / shopping centre", "محلّ / مركز تجاري"),
          opt("hotel", "Hôtel / restaurant", "Hotel / restaurant", "نزل / مطعم"),
          opt("sante", "Santé (clinique, hôpital)", "Healthcare (clinic, hospital)", "صحّة (مصحّة، مستشفى)"),
          opt("enseignement", "Enseignement", "Education", "تعليم"),
          opt("industrie", "Industrie / entrepôt", "Industry / warehouse", "صناعة / مستودع"),
          opt("parking", "Parking", "Car park", "مأوى سيارات"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      {
        name: "erpCategory",
        type: "select",
        label: t3("Catégorie ERP (si connue)", "Public-access category (if known)", "صنف المؤسسة المفتوحة للعموم (إن كان معروفاً)"),
        help: t3(
          "Pour un établissement recevant du public : la catégorie dépend de l'effectif accueilli (1 = le plus grand).",
          "For a building open to the public: the category depends on the number of people received (1 = largest).",
          "بالنسبة للمؤسسات المفتوحة للعموم: يحدّد الصنفَ عددُ الأشخاص المستقبَلين (1 = الأكبر).",
        ),
        options: [
          opt("1", "1re catégorie", "Category 1", "الصنف 1"),
          opt("2", "2e catégorie", "Category 2", "الصنف 2"),
          opt("3", "3e catégorie", "Category 3", "الصنف 3"),
          opt("4", "4e catégorie", "Category 4", "الصنف 4"),
          opt("5", "5e catégorie", "Category 5", "الصنف 5"),
          opt("inconnue", "Je ne sais pas", "I don't know", "لا أعرف"),
        ],
      },
      { name: "surfaceM2", type: "number", required: true, label: t3("Surface totale", "Total floor area", "المساحة الجملية"), unit: m2, max: 10_000_000 },
      { name: "floors", type: "number", label: t3("Nombre de niveaux", "Number of floors", "عدد الطوابق"), min: 1, max: 200 },
      {
        name: "detection",
        type: "radio",
        label: t3("Détection", "Detection", "الكشف"),
        help: t3(
          "Conventionnelle : alarme par zone, pour les petits sites. Adressable : chaque détecteur est localisé, pour les grands bâtiments.",
          "Conventional: alarm per zone, for small sites. Addressable: each detector is located, for large buildings.",
          "تقليدي: إنذار حسب المنطقة للمواقع الصغيرة. معنوَن: تحديد كل كاشف على حدة للمباني الكبرى.",
        ),
        options: [
          opt("conventionnelle", "Conventionnelle", "Conventional", "تقليدي"),
          opt("adressable", "Adressable", "Addressable", "معنوَن"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "extinction",
        type: "multiselect",
        label: t3("Extinction & désenfumage", "Suppression & smoke control", "الإطفاء وإزالة الدخان"),
        options: [
          opt("extincteurs", "Extincteurs", "Fire extinguishers", "طفايات الحريق"),
          opt("ria", "Robinets d'incendie armés (RIA)", "Fire hose reels", "حنفيات الحريق المجهّزة"),
          opt("sprinkler", "Sprinklers", "Sprinklers", "رشّاشات آلية"),
          opt("gaz", "Extinction automatique par gaz (salle serveurs, archives)", "Automatic gas suppression (server room, archives)", "إطفاء آلي بالغاز (قاعة الخوادم، الأرشيف)"),
          opt("desenfumage", "Désenfumage", "Smoke extraction", "إزالة الدخان"),
        ],
      },
      {
        name: "compliance",
        type: "checkbox",
        label: t3(
          "Mise en conformité demandée par la Protection civile",
          "Compliance work requested by the Civil Protection",
          "مطابقة مطلوبة من الحماية المدنية",
        ),
      },
      {
        name: "complianceNotes",
        type: "textarea",
        label: t3("Remarques du rapport", "Points raised in the report", "ملاحظات التقرير"),
        showIf: { field: "compliance", equals: "true" },
      },
    ],
  },
  {
    site: "hikview",
    services: ["amped-five"],
    title: "Amped FIVE – analyse vidéo forensique",
    attachments: { mode: "off" },
    questions: [
      {
        name: "organisation",
        type: "select",
        required: true,
        label: t3("Votre organisme", "Your organisation", "هيكلكم"),
        options: [
          opt("forces-ordre", "Service d'enquête / forces de l'ordre", "Investigation unit / law enforcement", "مصلحة بحث / قوات الأمن"),
          opt("laboratoire", "Laboratoire de police scientifique", "Forensic laboratory", "مخبر شرطة فنية"),
          opt("expert", "Expert judiciaire / cabinet d'expertise", "Court expert / expert firm", "خبير عدلي / مكتب خبرة"),
          opt("entreprise", "Entreprise (sécurité, assurance…)", "Company (security, insurance…)", "مؤسسة (أمن، تأمين…)"),
          opt("autre", "Autre", "Other", "آخر"),
        ],
      },
      {
        name: "needs",
        type: "multiselect",
        required: true,
        label: t3("Votre besoin", "What you need", "حاجتكم"),
        options: [
          opt("licences", "Licences du logiciel", "Software licences", "تراخيص البرمجية"),
          opt("installation", "Installation et configuration", "Installation and configuration", "التركيب والضبط"),
          opt("formation", "Formation des utilisateurs", "User training", "تكوين المستعملين"),
          opt("poste", "Poste de travail adapté", "Suitable workstation", "حاسوب عمل ملائم"),
          opt("support", "Assistance et mises à jour", "Support and updates", "المساعدة والتحديثات"),
        ],
      },
      {
        name: "licences",
        type: "number",
        label: t3("Nombre de postes à équiper", "Number of workstations to equip", "عدد الحواسيب المراد تجهيزها"),
        min: 1,
        max: 1_000,
      },
      {
        name: "trainees",
        type: "number",
        label: t3("Personnes à former", "People to train", "عدد الأشخاص المراد تكوينهم"),
        max: 1_000,
      },
      {
        name: "sources",
        type: "multiselect",
        label: t3("Sources à analyser", "Footage to analyse", "المصادر المراد تحليلها"),
        options: [
          opt("enregistreurs", "Enregistreurs de vidéosurveillance (DVR / NVR)", "CCTV recorders (DVR / NVR)", "أجهزة تسجيل المراقبة (DVR / NVR)"),
          opt("telephones", "Téléphones et réseaux sociaux", "Phones and social media", "الهواتف وشبكات التواصل"),
          opt("embarquees", "Caméras-piétons / embarquées", "Body-worn / dashboard cameras", "كاميرات محمولة / على متن العربات"),
          opt("images", "Photos et documents", "Photos and documents", "صور ووثائق"),
        ],
      },
      existingNotes(
        "Outils d'analyse déjà utilisés",
        "Analysis tools you already use",
        "أدوات التحليل المستعملة حالياً",
      ),
    ],
  },
  {
    site: "hikview",
    services: ["intelligence-artificielle"],
    title: "Solutions d'intelligence artificielle",
    attachments: {
      help: t3(
        "Quelques photos de la scène à analyser, prises depuis les caméras, nous aident à évaluer la faisabilité.",
        "A few photos of the scene to analyse, taken from the cameras, help us assess feasibility.",
        "بعض الصور للمشهد المراد تحليله، ملتقطة من الكاميرات، تساعدنا على تقييم إمكانية الإنجاز.",
      ),
    },
    questions: [
      {
        ...clientType,
        options: clientType.options.slice(1),
      },
      {
        name: "useCases",
        type: "multiselect",
        required: true,
        label: t3("Ce que l'IA doit détecter ou mesurer", "What the AI should detect or measure", "ما يجب أن يكشفه أو يقيسه الذكاء الاصطناعي"),
        help: t3(
          "Un besoin qui n'est pas dans la liste ? Décrivez-le dans votre message.",
          "A need that isn't listed? Describe it in your message.",
          "حاجة غير موجودة في القائمة؟ صفها في رسالتك.",
        ),
        options: [
          opt("intrusion", "Intrusion / surveillance de périmètre", "Intrusion / perimeter monitoring", "التسلّل / مراقبة المحيط"),
          opt("lapi", "Lecture de plaques (LAPI / ANPR)", "Number-plate recognition (ANPR)", "قراءة لوحات السيارات"),
          opt("comptage", "Comptage et analyse des flux", "Counting and flow analysis", "العدّ وتحليل الحركة"),
          opt("visage", "Reconnaissance faciale", "Face recognition", "التعرّف على الوجوه"),
          opt("epi", "Port des équipements de protection (casque, gilet)", "Protective equipment worn (helmet, vest)", "ارتداء معدّات الوقاية (خوذة، صدرية)"),
          opt("feu-fumee", "Détection de feu / fumée", "Fire / smoke detection", "كشف النار / الدخان"),
          opt("qualite", "Contrôle qualité / inspection industrielle", "Quality control / industrial inspection", "مراقبة الجودة / الفحص الصناعي"),
          opt("autre", "Autre besoin", "Another need", "حاجة أخرى"),
        ],
      },
      {
        name: "cameras",
        type: "radio",
        required: true,
        label: t3("Caméras", "Cameras", "الكاميرات"),
        options: [
          opt("existantes", "Utiliser les caméras existantes", "Use the existing cameras", "استعمال الكاميرات الموجودة"),
          opt("nouvelles", "Installer de nouvelles caméras", "Install new cameras", "تركيب كاميرات جديدة"),
          opt("mixte", "Les deux", "Both", "كلاهما"),
        ],
      },
      {
        name: "cameraCount",
        type: "number",
        label: t3("Nombre de caméras concernées", "Number of cameras involved", "عدد الكاميرات المعنية"),
        max: 5_000,
      },
      {
        name: "processing",
        type: "select",
        label: t3("Où traiter les images", "Where to process the images", "أين تُعالج الصور"),
        help: t3(
          "Sur site, les images ne quittent pas vos locaux ; le cloud évite d'installer un serveur.",
          "On site, footage never leaves your premises; the cloud avoids installing a server.",
          "في الموقع لا تغادر الصور محلاتكم؛ السحابة تغني عن تركيب خادم.",
        ),
        options: [
          opt("serveur-local", "Sur site (serveur local)", "On site (local server)", "في الموقع (خادم محلّي)"),
          opt("camera", "Dans les caméras", "Inside the cameras", "داخل الكاميرات"),
          opt("cloud", "Dans le cloud", "In the cloud", "في السحابة"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      existingNotes(
        "Systèmes à relier (logiciel vidéo, contrôle d'accès, ERP…)",
        "Systems to connect (video software, access control, ERP…)",
        "الأنظمة المراد ربطها (برمجية الفيديو، مراقبة الدخول، ERP…)",
      ),
    ],
  },

  // --- H2 Réseaux & infrastructures ---------------------------------------------
  {
    site: "hikview",
    services: ["fibre-optique-cablage"],
    title: "Fibre optique & câblage structuré",
    attachments: {
      help: t3("Un plan des locaux avec l'emplacement des postes est idéal.", "A floor plan showing the workstations is ideal.", "مخطط المحلات مع أماكن المكاتب هو الأفضل."),
    },
    questions: [
      {
        name: "scope",
        type: "multiselect",
        required: true,
        label: t3("Travaux", "Work", "الأشغال"),
        options: [
          opt("cuivre", "Câblage cuivre (Cat 6 / 6A)", "Copper cabling (Cat 6 / 6A)", "كوابل نحاسية (Cat 6 / 6A)"),
          opt("fibre", "Fibre entre bâtiments / étages", "Fibre between buildings / floors", "ألياف بين المباني / الطوابق"),
          opt("baie", "Baie de brassage", "Patch cabinet", "خزانة توزيع"),
          opt("raccordement", "Raccordement à l'opérateur", "Connection to the operator", "الربط بالمشغّل"),
        ],
      },
      { name: "networkPoints", type: "number", label: t3("Prises réseau (RJ45)", "Network outlets (RJ45)", "مآخذ الشبكة (RJ45)"), max: 100_000 },
      { name: "buildings", type: "number", label: t3("Bâtiments à relier", "Buildings to connect", "المباني المراد ربطها"), min: 1, max: 1_000 },
      {
        name: "distanceM",
        type: "number",
        label: t3("Plus grande distance", "Longest distance", "أطول مسافة"),
        unit: m,
        help: t3("Entre les deux points les plus éloignés à relier.", "Between the two furthest points to connect.", "بين أبعد نقطتين يجب ربطهما."),
        max: 100_000,
      },
      {
        name: "fibreType",
        type: "select",
        label: t3("Type de fibre", "Fibre type", "نوع الألياف"),
        options: [
          opt("monomode", "Monomode (longues distances)", "Single-mode (long distances)", "أحادية النمط (مسافات طويلة)"),
          opt("multimode", "Multimode (dans un bâtiment)", "Multimode (within a building)", "متعدّدة الأنماط (داخل مبنى)"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "building",
        type: "radio",
        label: t3("Bâtiment", "Building", "المبنى"),
        options: [
          opt("neuf", "Neuf / en construction", "New / under construction", "جديد / في طور البناء"),
          opt("existant", "Existant", "Existing", "قائم"),
        ],
      },
      {
        name: "certification",
        type: "checkbox",
        label: t3(
          "Recette et certification des liens (rapport de tests)",
          "Link testing and certification (test report)",
          "اختبار الوصلات والمصادقة عليها (تقرير اختبارات)",
        ),
      },
    ],
  },
  {
    site: "hikview",
    services: ["telephonie-ip-standard"],
    title: "Téléphonie IP & standard téléphonique",
    questions: [
      { name: "extensions", type: "number", required: true, label: t3("Nombre de postes", "Number of extensions", "عدد الأجهزة الفرعية"), min: 1, max: 100_000 },
      {
        name: "lines",
        type: "multiselect",
        label: t3("Lignes extérieures", "External lines", "الخطوط الخارجية"),
        options: [
          opt("analogiques", "Lignes classiques (analogiques / RNIS)", "Standard lines (analogue / ISDN)", "خطوط تقليدية (تناظرية / رقمية)"),
          opt("sip", "Trunk SIP (téléphonie par internet)", "SIP trunk (internet telephony)", "خطّ SIP (هاتف عبر الإنترنت)"),
          opt("gsm", "Passerelle GSM (cartes SIM)", "GSM gateway (SIM cards)", "بوابة GSM (بطاقات SIM)"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "simultaneousCalls",
        type: "number",
        label: t3("Appels extérieurs simultanés", "Simultaneous external calls", "المكالمات الخارجية المتزامنة"),
        max: 10_000,
      },
      sites,
      {
        name: "features",
        type: "multiselect",
        label: t3("Fonctions", "Features", "الوظائف"),
        options: [
          opt("svi", "Accueil vocal / serveur vocal (SVI)", "Auto attendant / IVR", "استقبال صوتي آلي"),
          opt("enregistrement", "Enregistrement des appels", "Call recording", "تسجيل المكالمات"),
          opt("files", "Files d'attente / centre d'appels", "Call queues / call centre", "قوائم انتظار / مركز نداء"),
          opt("mobile", "Poste sur smartphone / télétravail", "Smartphone extension / remote work", "جهاز فرعي على الهاتف / عمل عن بعد"),
          opt("visio", "Visioconférence", "Video conferencing", "مؤتمرات بالفيديو"),
        ],
      },
      existingNotes("Standard actuel (marque, modèle), s'il existe", "Current phone system (brand, model), if any", "المقسم الحالي (العلامة، الطراز) إن وُجد"),
    ],
  },
  {
    site: "hikview",
    services: ["reseaux-lan-wifi"],
    title: "Réseaux LAN / Wi-Fi & salles serveurs",
    questions: [
      {
        name: "scope",
        type: "multiselect",
        required: true,
        label: t3("Votre besoin", "Your need", "حاجتك"),
        options: [
          opt("lan", "Réseau local (switchs)", "Local network (switches)", "الشبكة المحلية (محوّلات)"),
          opt("wifi", "Wi-Fi", "Wi-Fi", "Wi-Fi"),
          opt("salle-serveurs", "Salle serveurs / baie", "Server room / rack", "قاعة الخوادم / خزانة"),
          opt("securite", "Pare-feu / sécurité réseau", "Firewall / network security", "جدار حماية / أمن الشبكة"),
        ],
      },
      { name: "surfaceM2", type: "number", label: t3("Surface à couvrir", "Area to cover", "المساحة المراد تغطيتها"), unit: m2, max: 10_000_000 },
      { name: "users", type: "number", label: t3("Utilisateurs", "Users", "المستخدمون"), max: 100_000 },
      {
        name: "wifiZones",
        type: "multiselect",
        label: t3("Wi-Fi", "Wi-Fi", "Wi-Fi"),
        options: [
          opt("interieur", "Intérieur", "Indoor", "داخلي"),
          opt("exterieur", "Extérieur", "Outdoor", "خارجي"),
          opt("invites", "Wi-Fi invités / hotspot", "Guest Wi-Fi / hotspot", "Wi-Fi للضيوف / نقطة اتصال"),
        ],
        showIf: { field: "scope", equals: "wifi" },
      },
      {
        name: "accessPoints",
        type: "number",
        label: t3("Points d'accès (si connu)", "Access points (if known)", "نقاط الوصول (إن كان معروفاً)"),
        max: 10_000,
        showIf: { field: "scope", equals: "wifi" },
      },
      {
        name: "serverRoom",
        type: "multiselect",
        label: t3("Salle serveurs", "Server room", "قاعة الخوادم"),
        options: [
          opt("baie", "Baie / rack", "Rack cabinet", "خزانة / رفّ"),
          opt("onduleur", "Onduleur (UPS)", "UPS", "مموّج (UPS)"),
          opt("climatisation", "Climatisation", "Cooling", "تكييف"),
          opt("supervision", "Supervision (température, accès)", "Monitoring (temperature, access)", "مراقبة (الحرارة، الدخول)"),
          opt("serveurs", "Serveurs / stockage (NAS)", "Servers / storage (NAS)", "خوادم / تخزين (NAS)"),
        ],
        showIf: { field: "scope", equals: "salle-serveurs" },
      },
    ],
  },

  // --- H3 Gestion & point de vente -----------------------------------------------
  {
    site: "hikview",
    services: ["caisse-enregistreuse"],
    title: "Caisses enregistreuses & terminaux POS",
    questions: [
      {
        name: "businessType",
        type: "select",
        required: true,
        label: t3("Type de commerce", "Type of business", "نوع النشاط التجاري"),
        options: [
          opt("superette", "Épicerie / supérette", "Grocery / convenience store", "بقالة / مغازة صغرى"),
          opt("supermarche", "Supermarché", "Supermarket", "مغازة كبرى"),
          opt("restaurant", "Restaurant / café", "Restaurant / café", "مطعم / مقهى"),
          opt("boulangerie", "Boulangerie / pâtisserie", "Bakery / pastry shop", "مخبزة / مرطّبات"),
          opt("pharmacie", "Pharmacie / parapharmacie", "Pharmacy", "صيدلية"),
          opt("boutique", "Boutique (mode, électronique…)", "Retail shop (fashion, electronics…)", "متجر (ملابس، إلكترونيات…)"),
          opt("quincaillerie", "Quincaillerie / matériaux", "Hardware / building materials", "مواد حديدية / بناء"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      { name: "tills", type: "number", required: true, label: t3("Nombre de caisses", "Number of tills", "عدد الصناديق"), min: 1, max: 1_000 },
      {
        name: "peripherals",
        type: "multiselect",
        label: t3("Périphériques", "Peripherals", "الملحقات"),
        options: [
          opt("scanner", "Lecteur code-barres", "Barcode scanner", "قارئ الرموز الشريطية"),
          opt("imprimante", "Imprimante tickets", "Receipt printer", "طابعة التذاكر"),
          opt("tiroir", "Tiroir-caisse", "Cash drawer", "درج النقود"),
          opt("balance", "Balance connectée", "Connected scale", "ميزان متّصل"),
          opt("afficheur", "Afficheur client", "Customer display", "شاشة الحريف"),
          opt("tpe", "Terminal de paiement (TPE)", "Card payment terminal", "جهاز الدفع الإلكتروني"),
          opt("cuisine", "Imprimante / écran cuisine", "Kitchen printer / display", "طابعة / شاشة المطبخ"),
        ],
      },
      {
        name: "software",
        type: "radio",
        label: t3("Logiciel", "Software", "البرنامج"),
        options: [
          opt("complet", "Caisse avec logiciel de vente et de stock", "Till with sales and stock software", "صندوق مع برنامج المبيعات والمخزون"),
          opt("materiel", "Matériel seulement", "Hardware only", "التجهيزات فقط"),
        ],
      },
      {
        name: "fiscal",
        type: "multiselect",
        label: t3("Exigences fiscales", "Tax requirements", "المتطلبات الجبائية"),
        help: t3(
          "Indiquez les obligations qui s'appliquent à votre activité : nous vérifions la conformité de la solution.",
          "Tell us which obligations apply to your business: we check the solution complies.",
          "اذكر الواجبات التي تنطبق على نشاطك: نتحقّق من مطابقة الحلّ.",
        ),
        options: [
          opt("caisse-fiscale", "Caisse enregistreuse conforme (obligation fiscale)", "Compliant cash register (tax obligation)", "آلة تسجيل مطابقة (واجب جبائي)"),
          opt("facture-electronique", "Facturation électronique (TTN / El Fatoora)", "E-invoicing (TTN / El Fatoora)", "الفوترة الإلكترونية (TTN / الفاتورة)"),
          opt("inconnu", "Je ne sais pas", "I don't know", "لا أعرف"),
        ],
      },
      sites,
    ],
  },
  {
    site: "hikview",
    services: ["logiciel-gestion-stock"],
    title: "Logiciel de gestion commerciale & de stock",
    questions: [
      {
        name: "modules",
        type: "multiselect",
        required: true,
        label: t3("Modules", "Modules", "الوحدات"),
        options: [
          opt("stock", "Stock & inventaires", "Stock & inventory", "المخزون والجرد"),
          opt("ventes", "Ventes & caisse", "Sales & POS", "المبيعات والصندوق"),
          opt("achats", "Achats & fournisseurs", "Purchasing & suppliers", "المشتريات والمزوّدون"),
          opt("facturation", "Devis & facturation", "Quotes & invoicing", "العروض والفوترة"),
          opt("facture-electronique", "Facture électronique (El Fatoora)", "E-invoicing (El Fatoora)", "الفاتورة الإلكترونية"),
          opt("tresorerie", "Règlements & trésorerie", "Payments & cash flow", "الخلاص والخزينة"),
          opt("crm", "Clients (CRM)", "Customers (CRM)", "الحرفاء (CRM)"),
        ],
      },
      {
        name: "businessType",
        type: "select",
        label: t3("Activité", "Business", "النشاط"),
        options: [
          opt("detail", "Commerce de détail", "Retail", "تجارة التفصيل"),
          opt("gros", "Distribution / commerce de gros", "Wholesale / distribution", "توزيع / تجارة الجملة"),
          opt("industrie", "Industrie / production", "Manufacturing", "صناعة / إنتاج"),
          opt("services", "Services", "Services", "خدمات"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      { name: "users", type: "number", label: t3("Utilisateurs", "Users", "المستخدمون"), min: 1, max: 10_000 },
      { name: "warehouses", type: "number", label: t3("Dépôts / magasins", "Warehouses / shops", "المستودعات / المحلات"), min: 1, max: 1_000 },
      {
        name: "deployment",
        type: "radio",
        label: t3("Hébergement", "Hosting", "الاستضافة"),
        options: [
          opt("cloud", "Cloud (accès partout)", "Cloud (access anywhere)", "سحابي (نفاذ من أي مكان)"),
          opt("local", "Sur vos serveurs", "On your own servers", "على خوادمكم"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "dataMigration",
        type: "radio",
        label: t3("Reprise des données", "Data migration", "نقل البيانات"),
        options: [
          opt("aucune", "Aucune (démarrage à zéro)", "None (fresh start)", "لا شيء (بداية جديدة)"),
          opt("excel", "Depuis Excel", "From Excel", "من Excel"),
          opt("logiciel", "Depuis un autre logiciel", "From another software", "من برنامج آخر"),
        ],
      },
      {
        name: "currentSoftware",
        type: "text",
        label: t3("Logiciel actuel", "Current software", "البرنامج الحالي"),
        showIf: { field: "dataMigration", equals: "logiciel" },
      },
    ],
  },

  // --- H4 Solutions audiovisuelles ------------------------------------------------
  {
    site: "hikview",
    services: ["ecrans-interactifs"],
    title: "Écrans interactifs",
    questions: [
      {
        name: "use",
        type: "radio",
        required: true,
        label: t3("Utilisation", "Use", "الاستعمال"),
        options: [
          opt("enseignement", "Enseignement / formation", "Teaching / training", "تعليم / تكوين"),
          opt("reunion", "Salle de réunion", "Meeting room", "قاعة اجتماعات"),
          opt("accueil", "Accueil / showroom", "Reception / showroom", "استقبال / قاعة عرض"),
        ],
      },
      { name: "quantity", type: "number", required: true, label: t3("Quantité", "Quantity", "الكمية"), min: 1, max: 10_000 },
      {
        name: "sizeInch",
        type: "select",
        label: t3("Taille", "Size", "المقاس"),
        options: [
          opt("55", "55 pouces", "55 inches", "55 بوصة"),
          opt("65", "65 pouces", "65 inches", "65 بوصة"),
          opt("75", "75 pouces", "75 inches", "75 بوصة"),
          opt("86", "86 pouces", "86 inches", "86 بوصة"),
          opt("98", "98 pouces", "98 inches", "98 بوصة"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "mounting",
        type: "select",
        label: t3("Fixation", "Mounting", "التثبيت"),
        options: [
          opt("mural", "Support mural", "Wall mount", "حامل حائطي"),
          opt("mobile", "Pied mobile à roulettes", "Mobile stand on wheels", "حامل متنقّل بعجلات"),
          opt("motorise", "Support réglable en hauteur", "Height-adjustable stand", "حامل قابل لتعديل الارتفاع"),
        ],
      },
      {
        name: "extras",
        type: "multiselect",
        label: t3("Avec", "With", "مع"),
        options: [
          opt("pc", "PC intégré (OPS)", "Built-in PC (OPS)", "حاسوب مدمج (OPS)"),
          opt("visio", "Caméra & micro pour la visio", "Camera & microphone for video calls", "كاميرا وميكروفون للمحادثات المرئية"),
          opt("logiciels", "Logiciels pédagogiques / collaboratifs", "Teaching / collaboration software", "برمجيات تعليمية / تعاونية"),
          opt("formation", "Installation & formation des utilisateurs", "Installation & user training", "التركيب وتكوين المستعملين"),
        ],
      },
    ],
  },
  {
    site: "hikview",
    services: ["affichage-dynamique"],
    title: "Affichage dynamique",
    questions: [
      {
        name: "sector",
        type: "select",
        label: t3("Secteur", "Sector", "القطاع"),
        options: [
          opt("commerce", "Commerce / centre commercial", "Retail / shopping centre", "تجارة / مركز تجاري"),
          opt("restauration", "Restauration (menus)", "Food service (menu boards)", "مطاعم (قوائم الأطباق)"),
          opt("banque", "Banque / agence", "Bank / branch", "بنك / وكالة"),
          opt("sante", "Santé", "Healthcare", "صحّة"),
          opt("administration", "Administration", "Public administration", "إدارة"),
          opt("hotel", "Hôtellerie", "Hospitality", "نزل"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      { name: "screens", type: "number", required: true, label: t3("Nombre d'écrans", "Number of screens", "عدد الشاشات"), min: 1, max: 10_000 },
      {
        name: "placement",
        type: "radio",
        label: t3("Emplacement", "Placement", "المكان"),
        options: [
          opt("interieur", "Intérieur", "Indoor", "داخلي"),
          opt("vitrine", "Vitrine (face au soleil)", "Shop window (facing the sun)", "واجهة (مقابل الشمس)"),
          opt("exterieur", "Extérieur", "Outdoor", "خارجي"),
        ],
      },
      {
        name: "format",
        type: "multiselect",
        label: t3("Format", "Format", "الشكل"),
        options: [
          opt("ecran-mural", "Écran mural", "Wall screen", "شاشة حائطية"),
          opt("totem", "Totem / borne", "Totem / kiosk", "عمود عرض / كشك"),
          opt("mur-video", "Mur d'images", "Video wall", "جدار شاشات"),
          opt("led", "Écran LED grand format", "Large LED display", "شاشة LED كبيرة"),
        ],
      },
      {
        name: "contentManagement",
        type: "radio",
        label: t3("Gestion des contenus", "Content management", "إدارة المحتوى"),
        options: [
          opt("centralisee", "À distance, depuis une plateforme", "Remotely, from a platform", "عن بعد، من منصّة"),
          opt("locale", "Sur place (clé USB)", "On site (USB stick)", "في المكان (مفتاح USB)"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      sites,
    ],
  },
  {
    site: "hikview",
    services: ["gestion-file-attente"],
    title: "Gestion de file d'attente",
    questions: [
      {
        name: "sector",
        type: "select",
        label: t3("Secteur", "Sector", "القطاع"),
        options: [
          opt("banque", "Banque / assurance", "Bank / insurance", "بنك / تأمين"),
          opt("administration", "Administration / municipalité", "Public administration / municipality", "إدارة / بلدية"),
          opt("sante", "Santé (hôpital, laboratoire)", "Healthcare (hospital, laboratory)", "صحّة (مستشفى، مخبر)"),
          opt("agence", "Agence commerciale (télécom, énergie…)", "Customer office (telecom, utilities…)", "وكالة تجارية (اتصالات، طاقة…)"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      { name: "counters", type: "number", required: true, label: t3("Nombre de guichets", "Number of counters", "عدد الشبابيك"), min: 1, max: 1_000 },
      {
        name: "ticketing",
        type: "multiselect",
        label: t3("Prise de ticket", "Ticketing", "أخذ التذكرة"),
        options: [
          opt("borne", "Borne tactile avec ticket papier", "Touch kiosk with paper ticket", "كشك لمسي مع تذكرة ورقية"),
          opt("sms", "Ticket virtuel par SMS", "Virtual ticket by SMS", "تذكرة افتراضية عبر SMS"),
          opt("qr", "QR code / smartphone", "QR code / smartphone", "رمز QR / هاتف ذكي"),
          opt("rendez-vous", "Rendez-vous en ligne", "Online appointments", "مواعيد عبر الإنترنت"),
        ],
      },
      { name: "displays", type: "number", label: t3("Écrans d'appel", "Calling displays", "شاشات النداء"), max: 1_000 },
      {
        name: "features",
        type: "multiselect",
        label: t3("Options", "Options", "خيارات"),
        options: [
          opt("annonce-vocale", "Appel vocal", "Voice announcements", "نداء صوتي"),
          opt("statistiques", "Statistiques (temps d'attente, performance)", "Statistics (waiting times, performance)", "إحصائيات (وقت الانتظار، الأداء)"),
          opt("satisfaction", "Enquête de satisfaction", "Satisfaction survey", "استبيان الرضا"),
        ],
      },
      sites,
    ],
  },
  {
    site: "hikview",
    services: ["salles-reunion"],
    title: "Salles de réunion connectées & visioconférence",
    questions: [
      { name: "rooms", type: "number", required: true, label: t3("Nombre de salles", "Number of rooms", "عدد القاعات"), min: 1, max: 1_000 },
      {
        name: "capacity",
        type: "number",
        label: t3("Capacité moyenne", "Average capacity", "متوسّط طاقة الاستيعاب"),
        unit: t3("personnes", "people", "أشخاص"),
        max: 5_000,
      },
      {
        name: "platform",
        type: "select",
        label: t3("Plateforme de visioconférence", "Video-conferencing platform", "منصّة المؤتمرات المرئية"),
        options: [
          opt("teams", "Microsoft Teams", "Microsoft Teams", "Microsoft Teams"),
          opt("zoom", "Zoom", "Zoom", "Zoom"),
          opt("meet", "Google Meet", "Google Meet", "Google Meet"),
          opt("plusieurs", "Plusieurs", "Several", "عدّة منصّات"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "equipment",
        type: "multiselect",
        label: t3("Équipements", "Equipment", "التجهيزات"),
        options: [
          opt("ecran", "Écran / projecteur", "Display / projector", "شاشة / جهاز عرض"),
          opt("camera", "Caméra de salle", "Room camera", "كاميرا القاعة"),
          opt("audio", "Micros & haut-parleurs", "Microphones & speakers", "ميكروفونات ومكبّرات صوت"),
          opt("sans-fil", "Présentation sans fil", "Wireless presentation", "العرض اللاسلكي"),
          opt("reservation", "Écran de réservation de salle", "Room booking panel", "شاشة حجز القاعة"),
          opt("commande", "Commande centralisée (lumière, écran, son)", "Central control (lights, display, sound)", "تحكّم مركزي (إنارة، شاشة، صوت)"),
        ],
      },
    ],
  },

  // --- H5 IoT & Smart City ---------------------------------------------------------
  {
    site: "hikview",
    services: ["iot-telemetrie", "smart-city"],
    title: "IoT & Smart City",
    questions: [
      {
        name: "useCase",
        type: "select",
        required: true,
        label: t3("Cas d'usage", "Use case", "مجال الاستعمال"),
        options: [
          opt("pompage", "Télésurveillance de pompes / forages", "Remote monitoring of pumps / boreholes", "مراقبة المضخّات / الآبار عن بعد"),
          opt("niveaux", "Niveau de cuves / réservoirs", "Tank / reservoir levels", "مستوى الخزانات"),
          opt("comptage", "Comptage d'énergie / d'eau", "Energy / water metering", "عدّ الطاقة / المياه"),
          opt("environnement", "Qualité de l'air / météo", "Air quality / weather", "جودة الهواء / الطقس"),
          opt("suivi", "Suivi de véhicules / d'équipements (GPS)", "Vehicle / asset tracking (GPS)", "تتبّع السيارات / المعدّات (GPS)"),
          opt("eclairage", "Éclairage public intelligent", "Smart street lighting", "إنارة عمومية ذكية"),
          opt("parking", "Parking intelligent", "Smart parking", "مأوى سيارات ذكي"),
          opt("video-urbaine", "Vidéoprotection urbaine", "City video surveillance", "المراقبة بالفيديو في المدينة"),
          opt("dechets", "Collecte des déchets (remplissage des bacs)", "Waste collection (bin fill levels)", "جمع الفضلات (امتلاء الحاويات)"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      {
        name: "points",
        type: "number",
        label: t3("Capteurs / points à équiper", "Sensors / points to equip", "المستشعرات / النقاط المراد تجهيزها"),
        max: 1_000_000,
      },
      {
        name: "zone",
        type: "radio",
        label: t3("Zone", "Area", "المنطقة"),
        options: [
          opt("site", "Un bâtiment / un site", "A building / one site", "مبنى / موقع واحد"),
          opt("ville", "Commune / zone urbaine", "Municipality / urban area", "بلدية / منطقة حضرية"),
          opt("rural", "Zone rurale étendue", "Wide rural area", "منطقة ريفية شاسعة"),
        ],
      },
      {
        name: "connectivity",
        type: "select",
        label: t3("Connectivité", "Connectivity", "الاتصال"),
        help: t3(
          "LoRaWAN : longue portée et faible consommation, idéal sans électricité ni internet sur place.",
          "LoRaWAN: long range and low power, ideal where there's no power or internet on site.",
          "LoRaWAN: مدى طويل واستهلاك ضعيف، مثالي حيث لا كهرباء ولا إنترنت.",
        ),
        options: [
          opt("lorawan", "LoRaWAN", "LoRaWAN", "LoRaWAN"),
          opt("cellulaire", "4G / NB-IoT", "4G / NB-IoT", "4G / NB-IoT"),
          opt("wifi", "Wi-Fi / Ethernet", "Wi-Fi / Ethernet", "Wi-Fi / Ethernet"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "platform",
        type: "radio",
        label: t3("Exploitation des données", "Using the data", "استغلال البيانات"),
        options: [
          opt("tableau-de-bord", "Tableau de bord web + alertes", "Web dashboard + alerts", "لوحة قيادة على الواب + تنبيهات"),
          opt("integration", "Intégration à votre système existant", "Integration with your existing system", "إدماج في منظومتكم الحالية"),
          opt("conseil", "À conseiller", "Please advise", "حسب نصيحتكم"),
        ],
      },
      {
        name: "description",
        type: "textarea",
        label: t3("Décrivez votre besoin", "Describe your need", "صِف حاجتك"),
      },
    ],
  },

  // --- H6 Intégrateur B2G ------------------------------------------------------------
  {
    site: "hikview",
    services: ["integration-b2g"],
    title: "Projet public (B2G)",
    attachments: {
      label: t3("Cahier des charges (CDC)", "Tender specifications", "كرّاس الشروط"),
      help: t3(
        "Le cahier des charges, les plans ou le bordereau des prix, s'ils sont disponibles.",
        "The specifications, plans or bill of quantities, if available.",
        "كرّاس الشروط أو المخططات أو جدول الأسعار إن كانت متوفّرة.",
      ),
    },
    questions: [
      {
        name: "institution",
        type: "text",
        required: true,
        width: "full",
        label: t3("Institution / organisme", "Institution / body", "المؤسسة / الهيكل"),
      },
      {
        name: "institutionType",
        type: "select",
        label: t3("Type d'acheteur", "Type of buyer", "نوع المشتري"),
        options: [
          opt("ministere", "Ministère / administration centrale", "Ministry / central administration", "وزارة / إدارة مركزية"),
          opt("commune", "Commune / collectivité locale", "Municipality / local authority", "بلدية / جماعة محلية"),
          opt("entreprise-publique", "Entreprise / établissement public", "State-owned company / public body", "منشأة / مؤسسة عمومية"),
          opt("sante", "Santé publique", "Public health", "الصحّة العمومية"),
          opt("enseignement", "Enseignement / université", "Education / university", "تعليم / جامعة"),
          opt("autre", "Autre", "Other", "أخرى"),
        ],
      },
      {
        name: "procedure",
        type: "select",
        label: t3("Procédure", "Procedure", "الإجراء"),
        options: [
          opt("appel-offres", "Appel d'offres (TUNEPS)", "Call for tenders (TUNEPS)", "طلب عروض (TUNEPS)"),
          opt("consultation", "Consultation", "Request for quotations", "استشارة"),
          opt("etude", "Étude / avant-projet (pas encore publié)", "Study / preliminary design (not yet published)", "دراسة / مشروع أوّلي (لم يُنشر بعد)"),
        ],
      },
      { name: "tenderReference", type: "text", label: t3("Référence de l'appel d'offres", "Tender reference", "مرجع طلب العروض") },
      {
        name: "deadline",
        type: "date",
        label: t3("Date limite de remise des offres", "Bid submission deadline", "آخر أجل لتقديم العروض"),
      },
      {
        name: "lots",
        type: "multiselect",
        label: t3("Lots concernés", "Lots concerned", "الأقساط المعنية"),
        options: [
          opt("videosurveillance", "Vidéosurveillance", "Video surveillance", "المراقبة بالفيديو"),
          opt("controle-acces", "Contrôle d'accès & pointage", "Access control & attendance", "مراقبة الدخول والحضور"),
          opt("incendie", "Sécurité incendie", "Fire safety", "السلامة من الحرائق"),
          opt("reseaux", "Réseaux, fibre & câblage", "Networks, fibre & cabling", "الشبكات والألياف والكوابل"),
          opt("telephonie", "Téléphonie IP", "IP telephony", "الهاتف عبر IP"),
          opt("audiovisuel", "Audiovisuel & salles de réunion", "AV & meeting rooms", "السمعي البصري وقاعات الاجتماعات"),
          opt("file-attente", "Gestion de file d'attente", "Queue management", "إدارة الطوابير"),
          opt("smart-city", "IoT / smart city", "IoT / smart city", "إنترنت الأشياء / المدينة الذكية"),
          opt("solaire", "Énergie solaire (avec Growing Technologies)", "Solar energy (with Growing Technologies)", "الطاقة الشمسية (مع Growing Technologies)"),
        ],
      },
      {
        name: "description",
        type: "textarea",
        required: true,
        label: t3("Objet du marché et besoins", "Purpose of the contract and needs", "موضوع الصفقة والحاجيات"),
      },
    ],
  },
];
