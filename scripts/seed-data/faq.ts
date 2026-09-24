import type { FaqItem } from "./types";

/**
 * FAQ content — mirrors the Payload `FAQ` collection (devplan §4.4).
 * Rendered as a categorised accordion in Phase 6.
 */
export const faqItems: FaqItem[] = [
  {
    order: 1,
    category: { fr: "Subventions", ar: "المنح", en: "Subsidies" },
    question: {
      fr: "Existe-t-il des subventions pour le solaire en Tunisie ?",
      ar: "هل توجد منح للطاقة الشمسية في تونس؟",
      en: "Are there subsidies for solar in Tunisia?",
    },
    answer: {
      fr: "Oui. L'ANME (programme PROSOL) et d'autres dispositifs soutiennent le photovoltaïque résidentiel et professionnel. Nous vous accompagnons pour constituer le dossier de subvention.",
      ar: "نعم. تدعم الوكالة الوطنية للتحكم في الطاقة (برنامج بروسول) وآليات أخرى الطاقة الكهروضوئية السكنية والمهنية. نرافقك في إعداد ملف المنحة.",
      en: "Yes. ANME (PROSOL programme) and other schemes support residential and professional PV. We help you assemble the subsidy file.",
    },
  },
  {
    order: 2,
    category: { fr: "STEG", ar: "الستاغ", en: "STEG" },
    question: {
      fr: "Comment fonctionne le net-metering avec la STEG ?",
      ar: "كيف يعمل احتساب صافي الطاقة مع الستاغ؟",
      en: "How does net-metering with STEG work?",
    },
    answer: {
      fr: "Votre installation injecte le surplus de production dans le réseau STEG. Ce surplus est déduit de votre consommation sur la facture, ce qui réduit fortement le montant à payer.",
      ar: "تحقن تركيبتك فائض الإنتاج في شبكة الستاغ. يُخصم هذا الفائض من استهلاكك على الفاتورة، مما يخفّض المبلغ المستحقّ بشكل كبير.",
      en: "Your system injects surplus production into the STEG grid. That surplus is offset against your consumption on the bill, sharply reducing the amount due.",
    },
  },
  {
    order: 3,
    category: { fr: "Garantie", ar: "الضمان", en: "Warranty" },
    question: {
      fr: "Quelle est la durée de vie et la garantie des panneaux ?",
      ar: "ما هو عمر الألواح ومدّة ضمانها؟",
      en: "What is the lifespan and warranty of the panels?",
    },
    answer: {
      fr: "Les panneaux sont garantis en production jusqu'à 25 ans et fonctionnent au-delà. Les onduleurs sont garantis selon le fabricant (généralement 5 à 10 ans, extensible).",
      ar: "تُضمن الألواح في الإنتاج حتى 25 سنة وتعمل لما بعد ذلك. تُضمن العواكس حسب الصانع (عادة من 5 إلى 10 سنوات، قابلة للتمديد).",
      en: "Panels carry a production warranty up to 25 years and keep working beyond. Inverters are warranted per manufacturer (typically 5–10 years, extendable).",
    },
  },
  {
    order: 4,
    category: { fr: "Devis", ar: "التسعيرة", en: "Quote" },
    question: {
      fr: "Combien coûte une installation et comment obtenir un devis ?",
      ar: "كم تكلفة التركيب وكيف أحصل على تسعيرة؟",
      en: "How much does an installation cost and how do I get a quote?",
    },
    answer: {
      fr: "Le coût dépend de votre consommation et de votre site. Utilisez notre demande de devis en ligne : nous étudions votre besoin et revenons vers vous avec une proposition chiffrée (TVA 19 % incluse).",
      ar: "تعتمد التكلفة على استهلاكك وموقعك. استعمل طلب التسعيرة عبر الإنترنت: ندرس حاجتك ونعود إليك بعرض مسعّر (يشمل الأداء على القيمة المضافة 19٪).",
      en: "Cost depends on your consumption and site. Use our online quote request: we study your needs and return a priced proposal (19% VAT included).",
    },
  },
];

export const faqCategories = Array.from(
  new Map(faqItems.map((f) => [f.category.fr, f.category])).values(),
);
