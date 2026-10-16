import type { InboxTab } from "@/lib/devis/inbox";
import type { Lang } from "../shared";

export interface InboxText {
  title: string;
  tabs: Record<InboxTab, string>;
  search: string;
  searchPlaceholder: string;
  newRequest: string;
  empty: Record<InboxTab, string>;
  noMatch: string;
  pick: string;
  back: string;
  call: string;
  phone: string;
  whatsapp: string;
  email: string;
  steps: string;
  lost: string;
  markAs: (status: string) => string;
  markLost: string;
  answers: string;
  noAnswers: string;
  contact: string;
  region: string;
  channel: string;
  address: string;
  visit: string;
  yes: string;
  received: string;
  language: string;
  files: string;
  quote: string;
  quoteHint: string;
  quoteDrop: string;
  quoteReplace: string;
  quoteChoose: string;
  quoteUploading: string;
  quoteOnlyPdf: string;
  notes: string;
  fullRecord: string;
  failed: string;
  previous: string;
  next: string;
}

export const inboxText: Record<Lang, InboxText> = {
  fr: {
    title: "Demandes de devis",
    tabs: { new: "Nouvelles", progress: "En cours", done: "Terminées" },
    search: "Rechercher",
    searchPlaceholder: "Nom, téléphone, référence…",
    newRequest: "Saisir une demande",
    empty: {
      new: "Aucune nouvelle demande. Les prochaines apparaîtront ici.",
      progress: "Aucune demande en cours.",
      done: "Aucune demande terminée.",
    },
    noMatch: "Aucune demande ne correspond à cette recherche.",
    pick: "Choisissez une demande dans la liste.",
    back: "Retour à la liste",
    call: "Appeler",
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    email: "E-mail",
    steps: "Avancement",
    lost: "Perdue",
    markAs: (status) => `Passer à « ${status} »`,
    markLost: "Marquer comme perdue",
    answers: "Réponses du client",
    noAnswers: "Pas de réponses techniques enregistrées.",
    contact: "Contact",
    region: "Gouvernorat",
    channel: "Canal préféré",
    address: "Adresse",
    visit: "Visite technique souhaitée",
    yes: "Oui",
    received: "Reçue le",
    language: "Langue du client",
    files: "Pièces jointes",
    quote: "Devis (PDF)",
    quoteHint: "Obligatoire avant « Devis envoyé » : il est joint à l'e-mail du client.",
    quoteDrop: "Déposez le devis PDF ici",
    quoteReplace: "Déposez un PDF pour remplacer le devis",
    quoteChoose: "Choisir un fichier",
    quoteUploading: "Envoi en cours…",
    quoteOnlyPdf: "Seuls les fichiers PDF sont acceptés.",
    notes: "Notes internes",
    fullRecord: "Ouvrir la fiche complète",
    failed: "La modification n'a pas pu être enregistrée. Réessayez.",
    previous: "Précédentes",
    next: "Suivantes",
  },
  en: {
    title: "Quote requests",
    tabs: { new: "New", progress: "In progress", done: "Done" },
    search: "Search",
    searchPlaceholder: "Name, phone, reference…",
    newRequest: "Log a request",
    empty: {
      new: "No new requests. The next ones will show up here.",
      progress: "No requests in progress.",
      done: "No finished requests.",
    },
    noMatch: "No request matches this search.",
    pick: "Choose a request from the list.",
    back: "Back to the list",
    call: "Call",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    steps: "Progress",
    lost: "Lost",
    markAs: (status) => `Move to “${status}”`,
    markLost: "Mark as lost",
    answers: "Client's answers",
    noAnswers: "No technical answers recorded.",
    contact: "Contact",
    region: "Governorate",
    channel: "Preferred channel",
    address: "Address",
    visit: "Site visit requested",
    yes: "Yes",
    received: "Received on",
    language: "Client language",
    files: "Attachments",
    quote: "Quote (PDF)",
    quoteHint: "Required before “Quote sent”: it is attached to the client's email.",
    quoteDrop: "Drop the quote PDF here",
    quoteReplace: "Drop a PDF to replace the quote",
    quoteChoose: "Choose a file",
    quoteUploading: "Uploading…",
    quoteOnlyPdf: "Only PDF files are accepted.",
    notes: "Internal notes",
    fullRecord: "Open the full record",
    failed: "The change couldn't be saved. Try again.",
    previous: "Previous",
    next: "Next",
  },
  ar: {
    title: "طلبات التسعيرة",
    tabs: { new: "جديدة", progress: "قيد المعالجة", done: "منتهية" },
    search: "بحث",
    searchPlaceholder: "الاسم، الهاتف، المرجع…",
    newRequest: "تسجيل طلب",
    empty: {
      new: "لا توجد طلبات جديدة. ستظهر الطلبات القادمة هنا.",
      progress: "لا توجد طلبات قيد المعالجة.",
      done: "لا توجد طلبات منتهية.",
    },
    noMatch: "لا يوجد طلب يطابق هذا البحث.",
    pick: "اختر طلباً من القائمة.",
    back: "العودة إلى القائمة",
    call: "اتصال",
    phone: "الهاتف",
    whatsapp: "واتساب",
    email: "بريد إلكتروني",
    steps: "التقدّم",
    lost: "خاسر",
    markAs: (status) => `الانتقال إلى «${status}»`,
    markLost: "تعليم كخاسر",
    answers: "إجابات العميل",
    noAnswers: "لا توجد إجابات فنية مسجّلة.",
    contact: "الاتصال",
    region: "الولاية",
    channel: "وسيلة الاتصال المفضّلة",
    address: "العنوان",
    visit: "طلب زيارة تقنية",
    yes: "نعم",
    received: "تاريخ الاستلام",
    language: "لغة العميل",
    files: "المرفقات",
    quote: "التسعيرة (PDF)",
    quoteHint: "إلزامية قبل «أُرسلت التسعيرة»: تُرفق برسالة العميل.",
    quoteDrop: "ضع ملف التسعيرة PDF هنا",
    quoteReplace: "ضع ملف PDF لتعويض التسعيرة",
    quoteChoose: "اختيار ملف",
    quoteUploading: "جارٍ الإرسال…",
    quoteOnlyPdf: "تُقبل ملفات PDF فقط.",
    notes: "ملاحظات داخلية",
    fullRecord: "فتح البطاقة الكاملة",
    failed: "تعذّر حفظ التعديل. أعد المحاولة.",
    previous: "السابقة",
    next: "التالية",
  },
};
