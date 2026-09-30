import type { Localized } from "./types";

/**
 * Hikview Engineering starter pages (home, about) and footer tagline, created
 * once by the seed. The six areas and their sub-pages come in Phase 3; after
 * seeding, everything is edited in the admin.
 */
export const hikviewFooterTagline: Localized = {
  fr: "Sécurité électronique, réseaux et solutions technologiques — Sbeitla, Tunisie.",
  ar: "الأمن الإلكتروني والشبكات والحلول التكنولوجية — سبيطلة، تونس.",
  en: "Electronic security, networks and technology solutions — Sbeitla, Tunisia.",
};

export const hikviewHome = {
  heroBadge: {
    fr: "Intégrateur de solutions technologiques",
    ar: "مُدمج الحلول التكنولوجية",
    en: "Technology solutions integrator",
  },
  heroTitle: {
    fr: "Sécurité, réseaux et solutions technologiques clés en main",
    ar: "الأمن والشبكات والحلول التكنولوجية الجاهزة",
    en: "Turnkey security, networks and technology solutions",
  },
  heroSubtitle: {
    fr: "Hikview Engineering conçoit, installe et maintient les systèmes de sécurité électronique, les réseaux et les solutions numériques des particuliers, des entreprises et des institutions.",
    ar: "تصمّم Hikview Engineering وتركّب وتصون أنظمة الأمن الإلكتروني والشبكات والحلول الرقمية للخواص والمؤسسات والهياكل العمومية.",
    en: "Hikview Engineering designs, installs and maintains electronic security systems, networks and digital solutions for homes, businesses and public institutions.",
  },
  activitiesTitle: { fr: "Nos domaines d'expertise", ar: "مجالات خبرتنا", en: "Our areas of expertise" },
  activitiesSubtitle: {
    fr: "De la vidéosurveillance à la ville intelligente, un seul interlocuteur pour vos projets.",
    ar: "من المراقبة بالفيديو إلى المدينة الذكية، مخاطب واحد لمشاريعك.",
    en: "From video surveillance to smart cities, one partner for your projects.",
  },
  whyTitle: { fr: "Pourquoi Hikview Engineering", ar: "لماذا Hikview Engineering", en: "Why Hikview Engineering" },
  why: [
    {
      icon: "ShieldCheck",
      title: { fr: "Étude sur mesure", ar: "دراسة حسب الطلب", en: "Tailored design" },
      description: {
        fr: "Chaque installation est dimensionnée pour votre site, vos risques et votre budget.",
        ar: "كل تركيبة تُصمَّم حسب موقعك ومخاطرك وميزانيتك.",
        en: "Every system is designed for your site, your risks and your budget.",
      },
    },
    {
      icon: "Wrench",
      title: { fr: "Installation & maintenance", ar: "التركيب والصيانة", en: "Installation & maintenance" },
      description: {
        fr: "Nos techniciens installent, paramètrent et assurent le suivi de vos équipements.",
        ar: "يتولّى تقنيونا التركيب والضبط ومتابعة تجهيزاتك.",
        en: "Our technicians install, configure and maintain your equipment.",
      },
    },
    {
      icon: "Landmark",
      title: { fr: "Projets institutionnels", ar: "المشاريع العمومية", en: "Public-sector projects" },
      description: {
        fr: "Intégrateur B2G : nous répondons aux marchés publics, du cahier des charges à la réception.",
        ar: "مُدمج للقطاع العمومي: نشارك في الصفقات العمومية من كرّاس الشروط إلى القبول.",
        en: "B2G integrator: we bid on public tenders, from specifications to acceptance.",
      },
    },
    {
      icon: "Headphones",
      title: { fr: "Support de proximité", ar: "دعم عن قرب", en: "Local support" },
      description: {
        fr: "Une équipe basée à Sbeitla, joignable et réactive.",
        ar: "فريق مقرّه سبيطلة، متاح وسريع الاستجابة.",
        en: "A team based in Sbeitla, reachable and responsive.",
      },
    },
  ],
  ctaTitle: { fr: "Un projet de sécurité ou de réseau ?", ar: "لديك مشروع أمن أو شبكة؟", en: "A security or network project?" },
  ctaSubtitle: {
    fr: "Décrivez-nous votre besoin : nous revenons vers vous sous 48 h ouvrées.",
    ar: "صِف لنا حاجتك: نعود إليك خلال 48 ساعة عمل.",
    en: "Tell us what you need: we get back to you within 48 working hours.",
  },
} satisfies Record<string, unknown>;

export const hikviewAbout = {
  title: { fr: "À propos de Hikview Engineering", ar: "عن Hikview Engineering", en: "About Hikview Engineering" },
  subtitle: {
    fr: "Ingénierie en sécurité électronique, réseaux et solutions technologiques.",
    ar: "هندسة في الأمن الإلكتروني والشبكات والحلول التكنولوجية.",
    en: "Engineering in electronic security, networks and technology solutions.",
  },
  storyTitle: { fr: "Notre métier", ar: "مهنتنا", en: "What we do" },
  story: {
    fr: "Hikview Engineering est une société d'ingénierie basée à Sbeitla. Nous intégrons des solutions de sécurité électronique (vidéosurveillance, alarme, contrôle d'accès, sécurité incendie), des réseaux et infrastructures numériques, des solutions de gestion et de point de vente, des solutions audiovisuelles et collaboratives, ainsi que des projets IoT et ville intelligente.\n\nNous accompagnons aussi les institutions publiques en tant qu'intégrateur de projets B2G. Hikview Engineering fait partie du même groupe que Growing Technologies, installateur solaire certifié ANME.",
    ar: "Hikview Engineering شركة هندسة مقرّها سبيطلة. ندمج حلول الأمن الإلكتروني (المراقبة بالفيديو والإنذار ومراقبة الدخول والسلامة من الحرائق) والشبكات والبنية التحتية الرقمية وحلول التسيير ونقاط البيع والحلول السمعية البصرية والتعاونية، إضافة إلى مشاريع إنترنت الأشياء والمدينة الذكية.\n\nكما نرافق الهياكل العمومية بصفتنا مُدمجاً لمشاريع القطاع العمومي. تنتمي Hikview Engineering إلى نفس مجموعة Growing Technologies، المركّب الشمسي المعتمد.",
    en: "Hikview Engineering is an engineering company based in Sbeitla. We integrate electronic security (video surveillance, alarms, access control, fire safety), networks and digital infrastructure, business management and point-of-sale solutions, AV and collaboration solutions, and IoT and smart-city projects.\n\nWe also serve public institutions as a B2G project integrator. Hikview Engineering belongs to the same group as Growing Technologies, an ANME-certified solar installer.",
  },
} satisfies Record<string, unknown>;
