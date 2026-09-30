import "server-only";
import type { Locale } from "@/i18n/routing";
import type { DevisForm, Service } from "@/payload-types";
import type { SiteKey } from "@/sites/config";
import { getDevisForms, getServices } from "@/lib/cms/queries";
import { childrenOf, topLevel } from "@/lib/services";
import type { FormDef, QuestionDef } from "./form-def";

/** A service offered at step 1 of the quote form, with its questions. */
export interface DevisChoice {
  /** Service id, as a string (the form value). */
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  /** The area of a sub-service (Hikview), shown as a group heading. */
  area: string | null;
  /** Legacy key of Growing's typed form, kept on requests and ?activite= links. */
  activityKey: string | null;
  form: FormDef;
}

/** A form document (fetched with `locale: "all"`) as a definition. */
export function toFormDef(form: DevisForm): FormDef {
  return { questions: (form.questions ?? []) as unknown as QuestionDef[] };
}

const idOf = (v: number | { id: number } | null | undefined) => (v && typeof v === "object" ? v.id : (v ?? null));

/**
 * The site's services linked to a quote form (Services → Formulaire de devis),
 * areas first then their sub-services, in the admin's order.
 */
export async function getDevisChoices(site: SiteKey, locale: Locale): Promise<DevisChoice[]> {
  const [services, forms] = await Promise.all([getServices(site, locale), getDevisForms(site)]);
  const choice = (s: Service, area: Service | null): DevisChoice[] => {
    const form = forms.find((f) => f.id === idOf(s.devisForm));
    if (!form || (form.questions ?? []).length === 0) return [];
    return [
      {
        id: String(s.id),
        slug: s.slug,
        title: s.title,
        description: s.shortDescription,
        icon: s.icon,
        area: area?.title ?? null,
        activityKey: s.activityKey ?? null,
        form: toFormDef(form),
      },
    ];
  };
  return topLevel(services).flatMap((s) => [...choice(s, null), ...childrenOf(services, s.id).flatMap((c) => choice(c, s))]);
}
