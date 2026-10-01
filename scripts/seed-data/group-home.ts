import type { Localized } from "./types";

/**
 * Home page of the group site (plan §3.3, group landing), from the approved
 * mockup. Seed data only: the texts are edited in Pages → Accueil (site
 * "groupe"); the companies, services and projects come from each company's
 * site.
 */
const L = (fr: string, en: string, ar: string): Localized => ({ fr, en, ar });

export const groupHome = {
  hero: {
    badge: L("Deux expertises, un même groupe", "Two areas of expertise, one group", "خبرتان في مجموعة واحدة"),
    title: L("Sécuriser, connecter,", "Securing, connecting,", "نؤمّن، نربط،"),
    highlight: L("alimenter votre avenir.", "powering your future.", "ونمدّ مستقبلك بالطاقة."),
    subtitle: L(
      "Hikview Engineering et Growing Technologies réunissent sécurité électronique, infrastructure numérique et énergie solaire pour les entreprises, institutions et agriculteurs de Tunisie.",
      "Hikview Engineering and Growing Technologies bring together electronic security, digital infrastructure and solar energy for Tunisian businesses, institutions and farmers.",
      "تجمع Hikview Engineering وGrowing Technologies بين الأمن الإلكتروني والبنية التحتية الرقمية والطاقة الشمسية لخدمة المؤسسات والإدارات والفلاحين في تونس.",
    ),
    discover: L("Découvrir le groupe", "Discover the group", "اكتشف المجموعة"),
  },
  companies: {
    eyebrow: L("Le groupe", "The group", "المجموعة"),
    title: L(
      "Deux sociétés complémentaires, une exigence commune",
      "Two complementary companies, one shared standard",
      "شركتان متكاملتان بمعيار جودة واحد",
    ),
    subtitle: L(
      "Un interlocuteur unique pour équiper, sécuriser et alimenter vos sites, avec des équipes spécialisées pour chaque métier.",
      "A single partner to equip, secure and power your sites, with specialised teams for each trade.",
      "شريك واحد لتجهيز مواقعكم وتأمينها وتزويدها بالطاقة، مع فرق متخصصة لكل مجال.",
    ),
    link: L("Découvrir le site", "Visit the website", "زيارة الموقع"),
  },
  services: {
    eyebrow: L("Nos services", "Our services", "خدماتنا"),
    title: L("Des solutions pour chaque besoin", "Solutions for every need", "حلول لكل احتياج"),
  },
  steps: {
    eyebrow: L("Notre méthode", "Our method", "منهجيتنا"),
    title: L("De l'idée à la mise en service", "From idea to commissioning", "من الفكرة إلى التشغيل"),
    items: [
      { title: L("Étude", "Survey", "الدراسة"), description: L("Visite du site et analyse des besoins.", "Site visit and needs analysis.", "زيارة الموقع وتحليل الاحتياجات.") },
      {
        title: L("Proposition", "Proposal", "العرض"),
        description: L(
          "Devis détaillé avec TVA 19 % et timbre fiscal.",
          "Detailed quote with 19% VAT and stamp duty.",
          "عرض سعر مفصّل مع الأداء على القيمة المضافة 19٪ والطابع الجبائي.",
        ),
      },
      {
        title: L("Installation", "Installation", "التركيب"),
        description: L("Équipes qualifiées et matériel certifié.", "Qualified crews and certified equipment.", "فرق مؤهلة ومعدات معتمدة."),
      },
      { title: L("Suivi", "Follow-up", "المتابعة"), description: L("Maintenance, support et garantie.", "Maintenance, support and warranty.", "صيانة ودعم وضمان.") },
    ],
  },
  projects: {
    eyebrow: L("Références", "References", "المراجع"),
    title: L("Nos réalisations", "Our projects", "إنجازاتنا"),
    subtitle: L(
      "Une sélection de projets menés par les sociétés du groupe.",
      "A selection of projects delivered by the group's companies.",
      "مختارات من المشاريع التي أنجزتها شركات المجموعة.",
    ),
  },
  quote: {
    eyebrow: L("Devis gratuit", "Free quote", "عرض سعر مجاني"),
    title: L("Parlons de votre projet", "Let's talk about your project", "لنتحدث عن مشروعك"),
    subtitle: L(
      "Choisissez la société et le service : votre demande est dirigée vers la bonne équipe, qui vous répond sous 48 h ouvrées.",
      "Pick the company and the service: your request goes straight to the right team, which replies within 48 working hours.",
      "اختر الشركة والخدمة وسيتم توجيه طلبك إلى الفريق المناسب الذي يردّ عليك خلال 48 ساعة عمل.",
    ),
  },
};
