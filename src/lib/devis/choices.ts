import "server-only";
import type { Locale } from "@/i18n/routing";
import type { DevisForm, Service } from "@/payload-types";
import type { SiteKey } from "@/sites/config";
import { getDevisForms, getServices, getSite } from "@/lib/cms/queries";
import { getGroupMembers } from "@/lib/group";
import { childrenOf, topLevel } from "@/lib/services";
import { brandHex } from "@/lib/theme";
import type { FormDef, QuestionDef } from "./form-def";

/** A company the client can address a request to (group site: one per member). */
export interface DevisCompany {
  key: SiteKey;
  name: string;
  summary: string;
  monogram: string;
  /** Brand colours (hex) for its choice card. */
  colors: { from: string; to: string };
}

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
  /** The company (site) that receives the request. */
  company: SiteKey;
  form: FormDef;
}

/** A form document (fetched with `locale: "all"`) as a definition. */
export function toFormDef(form: DevisForm): FormDef {
  return {
    questions: (form.questions ?? []) as unknown as QuestionDef[],
    attachments: (form.attachments ?? null) as FormDef["attachments"],
  };
}

const idOf = (v: number | { id: number } | null | undefined) =>
  v && typeof v === "object" ? v.id : (v ?? null);

/**
 * One site's services linked to a quote form (Services → Formulaire de
 * devis), areas first then their sub-services, in the admin's order.
 */
async function siteChoices(site: SiteKey, locale: Locale): Promise<DevisChoice[]> {
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
        company: site,
        form: toFormDef(form),
      },
    ];
  };
  return topLevel(services).flatMap((s) => [
    ...choice(s, null),
    ...childrenOf(services, s.id).flatMap((c) => choice(c, s)),
  ]);
}

/**
 * The services a site's quote form offers: its own, or — on the group site —
 * every company's, each request then going to that company (plan §3.3).
 */
export async function getDevisChoices(site: SiteKey, locale: Locale): Promise<DevisChoice[]> {
  if (site !== "group") return siteChoices(site, locale);
  const { members } = await getGroupMembers(locale);
  return (await Promise.all(members.map((m) => siteChoices(m.site.key, locale)))).flat();
}

/** The companies to choose from first (group site only; empty elsewhere). */
export async function getDevisCompanies(site: SiteKey, locale: Locale): Promise<DevisCompany[]> {
  if (site !== "group") return [];
  const { members } = await getGroupMembers(locale);
  return members.map(({ site: member, summary }) => {
    const hex = brandHex(member.theme);
    return {
      key: member.key,
      name: member.companyName,
      summary,
      monogram: member.monogram?.trim() || member.companyName.slice(0, 2).toUpperCase(),
      colors: { from: hex.from, to: hex.to },
    };
  });
}

/** Just the site record a request belongs to (for routing and its reference). */
export const leadSite = (choice: DevisChoice, locale: Locale) => getSite(choice.company, locale);
