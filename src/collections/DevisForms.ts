import type { CollectionConfig, Validate } from "payload";
import { siteContentAccess } from "../cms/access";
import { siteField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { choiceTypes, questionTypes, questionsProblem, type QuestionType } from "../lib/devis/form-def";

const KEY = /^[a-zA-Z][a-zA-Z0-9]*$/;

const typeLabels: Record<QuestionType, ReturnType<typeof t3>> = {
  text: t3("Texte court", "Short text", "نص قصير"),
  textarea: t3("Texte long", "Long text", "نص طويل"),
  number: t3("Nombre", "Number", "رقم"),
  select: t3("Liste déroulante", "Drop-down list", "قائمة منسدلة"),
  radio: t3("Choix unique (boutons)", "Single choice (buttons)", "اختيار واحد"),
  multiselect: t3("Choix multiples", "Multiple choice", "اختيارات متعدّدة"),
  checkbox: t3("Case à cocher (oui/non)", "Checkbox (yes/no)", "خانة اختيار"),
  date: t3("Date", "Date", "تاريخ"),
};

/** Keys unique in the form, conditions pointing at an earlier question, option values unique. */
const validateQuestions: Validate = (value) =>
  questionsProblem((value ?? []) as Parameters<typeof questionsProblem>[0]) ?? true;

const showFor =
  (...types: QuestionType[]) =>
  (_: unknown, siblingData: { type?: QuestionType }) =>
    types.includes(siblingData?.type as QuestionType);

/**
 * Quote forms built in the admin (plan §6): the technical questions a service
 * asks in its quote request (Services → Formulaire de devis). The public form,
 * its validation, the review step, the admin view of a request and the
 * notifications are all generated from it.
 */
export const DevisForms: CollectionConfig = {
  slug: "devis-forms",
  labels: {
    singular: t3("Formulaire de devis", "Quote form", "استمارة تسعيرة"),
    plural: t3("Formulaires de devis", "Quote forms", "استمارات التسعيرة"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "site", "updatedAt"],
    group: groups.leads,
    description: t3(
      "Les questions techniques posées pour un service. Reliez un formulaire à un service dans Services → Formulaire de devis.",
      "The technical questions asked for a service. Link a form to a service in Services → Quote form.",
      "الأسئلة التقنية المطروحة لخدمة ما. اربط الاستمارة بخدمة في الخدمات ← استمارة التسعيرة.",
    ),
  },
  access: siteContentAccess(),
  hooks: revalidateCollection("devis-forms"),
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: t3("Nom (admin)", "Name (admin)", "الاسم (للإدارة)"),
    },
    siteField(),
    {
      name: "attachments",
      type: "group",
      label: t3("Pièces jointes", "Attachments", "المرفقات"),
      admin: {
        description: t3(
          "Le client peut joindre jusqu'à 5 fichiers (PDF, photos, Word, Excel, DWG ; 10 Mo chacun) à la fin des questions.",
          "The client can attach up to 5 files (PDF, photos, Word, Excel, DWG; 10 MB each) after the questions.",
          "يمكن للعميل إرفاق 5 ملفات كحدّ أقصى (PDF، صور، Word، Excel، DWG؛ 10 م.ب لكل ملف) بعد الأسئلة.",
        ),
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "mode",
              type: "select",
              required: true,
              defaultValue: "optional",
              options: [
                { value: "optional", label: t3("Facultatives", "Optional", "اختيارية") },
                { value: "required", label: t3("Obligatoires", "Required", "إلزامية") },
                { value: "off", label: t3("Désactivées", "Off", "معطّلة") },
              ],
              label: t3("Pièces jointes", "Attachments", "المرفقات"),
              admin: { width: "30%" },
            },
            {
              name: "label",
              type: "text",
              localized: true,
              label: t3("Libellé", "Label", "التسمية"),
              admin: {
                width: "70%",
                description: t3(
                  "Vide = « Documents (plans, photos…) ». Ex. « Cahier des charges (CDC) ».",
                  "Empty = “Documents (plans, photos…)”. E.g. “Tender specifications”.",
                  "فارغ = « وثائق (مخططات، صور…) ».",
                ),
              },
            },
          ],
        },
        { name: "help", type: "textarea", localized: true, label: t3("Aide", "Help", "مساعدة") },
      ],
    },
    {
      name: "questions",
      type: "array",
      minRows: 1,
      validate: validateQuestions,
      label: t3("Questions", "Questions", "الأسئلة"),
      labels: {
        singular: t3("Question", "Question", "سؤال"),
        plural: t3("Questions", "Questions", "الأسئلة"),
      },
      admin: {
        components: { RowLabel: "/components/admin/question-row-label#QuestionRowLabel" },
        description: t3(
          "Dans l'ordre d'affichage. Le contact (nom, téléphone, gouvernorat…) et le consentement sont ajoutés automatiquement.",
          "In display order. Contact details (name, phone, governorate…) and consent are added automatically.",
          "حسب ترتيب العرض. تُضاف بيانات الاتصال والموافقة تلقائياً.",
        ),
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "label",
              type: "text",
              localized: true,
              required: true,
              label: t3("Question", "Question", "السؤال"),
              admin: { width: "50%" },
            },
            {
              name: "type",
              type: "select",
              required: true,
              defaultValue: "text",
              options: questionTypes.map((value) => ({ value, label: typeLabels[value] })),
              label: t3("Type de réponse", "Answer type", "نوع الإجابة"),
              admin: { width: "30%" },
            },
            {
              name: "name",
              type: "text",
              required: true,
              label: t3("Clé", "Key", "المفتاح"),
              validate: (value: string | null | undefined) =>
                (typeof value === "string" && KEY.test(value)) || "Letters and digits, starting with a letter (e.g. flowM3PerDay).",
              admin: {
                width: "20%",
                description: t3(
                  "Identifiant technique, ex. flowM3PerDay. Ne pas changer une fois utilisé.",
                  "Technical id, e.g. flowM3PerDay. Don't change it once used.",
                  "معرّف تقني. لا يُغيَّر بعد الاستعمال.",
                ),
              },
            },
          ],
        },
        {
          name: "help",
          type: "textarea",
          localized: true,
          label: t3("Aide (info-bulle)", "Help (tooltip)", "مساعدة (تلميح)"),
        },
        {
          type: "row",
          fields: [
            {
              name: "required",
              type: "checkbox",
              defaultValue: false,
              label: t3("Obligatoire", "Required", "إلزامي"),
              admin: { width: "25%", style: { alignSelf: "center" } },
            },
            {
              name: "width",
              type: "select",
              defaultValue: "half",
              options: [
                { value: "half", label: t3("Demi-largeur", "Half width", "نصف العرض") },
                { value: "full", label: t3("Pleine largeur", "Full width", "العرض الكامل") },
              ],
              label: t3("Largeur", "Width", "العرض"),
              admin: { width: "25%" },
            },
            {
              name: "requiredGroup",
              type: "text",
              label: t3("Au moins un de…", "At least one of…", "واحد على الأقل من…"),
              admin: {
                width: "50%",
                description: t3(
                  "Même mot pour plusieurs questions = au moins l'une d'elles doit être remplie (ex. « conso » pour facture OU consommation).",
                  "Same word on several questions = at least one of them must be filled (e.g. “usage” for bill OR consumption).",
                  "نفس الكلمة لعدّة أسئلة = يجب ملء واحد منها على الأقل.",
                ),
              },
            },
          ],
        },
        {
          type: "row",
          admin: { condition: showFor("number") },
          fields: [
            { name: "unit", type: "text", localized: true, label: t3("Unité", "Unit", "الوحدة"), admin: { width: "34%" } },
            { name: "min", type: "number", label: t3("Minimum", "Minimum", "الحدّ الأدنى"), admin: { width: "33%" } },
            { name: "max", type: "number", label: t3("Maximum", "Maximum", "الحدّ الأقصى"), admin: { width: "33%" } },
          ],
        },
        {
          name: "options",
          type: "array",
          label: t3("Choix", "Choices", "الاختيارات"),
          admin: { condition: showFor(...choiceTypes) },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "label",
                  type: "text",
                  localized: true,
                  required: true,
                  label: t3("Libellé", "Label", "التسمية"),
                  admin: { width: "65%" },
                },
                {
                  name: "value",
                  type: "text",
                  required: true,
                  label: t3("Valeur", "Value", "القيمة"),
                  validate: (value: string | null | undefined) =>
                    (typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ||
                    "Lowercase letters, digits and hyphens (e.g. forage).",
                  admin: { width: "35%" },
                },
              ],
            },
          ],
        },
        {
          name: "showIf",
          type: "group",
          label: t3("Afficher seulement si…", "Only show if…", "العرض فقط إذا…"),
          admin: {
            description: t3(
              "Optionnel : la clé d'une question précédente et la valeur attendue (ex. subtype = eclairage-public).",
              "Optional: the key of an earlier question and the expected value (e.g. subtype = eclairage-public).",
              "اختياري: مفتاح سؤال سابق والقيمة المنتظرة.",
            ),
          },
          fields: [
            {
              type: "row",
              fields: [
                { name: "field", type: "text", label: t3("Clé de la question", "Question key", "مفتاح السؤال"), admin: { width: "50%" } },
                { name: "equals", type: "text", label: t3("Valeur", "Value", "القيمة"), admin: { width: "50%" } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
