import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { siteSettings } from "@/content/site";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Growing Technologies.",
};

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalLayout title="Mentions légales" updated="21/09/2026">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le présent site est édité par <strong>{siteSettings.companyName}</strong>, installateur
          solaire certifié {siteSettings.certification}, dont le siège est situé à{" "}
          {siteSettings.address.fr}.
        </p>
        <ul>
          <li>Matricule fiscal : {siteSettings.matriculeFiscal}</li>
          <li>Téléphone : {siteSettings.phone}</li>
          <li>E-mail : {siteSettings.email}</li>
        </ul>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Le site est hébergé sur un serveur dédié. Les coordonnées de l&apos;hébergeur sont
          disponibles sur simple demande auprès de l&apos;éditeur.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus (textes, images, logos, éléments graphiques) présents sur ce
          site est la propriété de {siteSettings.companyName}, sauf mention contraire. Toute
          reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite
          préalable est interdite.
        </p>
      </section>

      <section>
        <h2>Tarifs et fiscalité</h2>
        <p>
          Les devis et prestations sont établis en dinars tunisiens (TND). Sauf mention contraire,
          les prix s&apos;entendent hors taxes ; la TVA au taux en vigueur (19 %) et le timbre fiscal
          applicable sont ajoutés conformément à la réglementation tunisienne.
        </p>
      </section>

      <section>
        <h2>Responsabilité</h2>
        <p>
          {siteSettings.companyName} s&apos;efforce d&apos;assurer l&apos;exactitude des
          informations diffusées sur ce site, mais ne saurait être tenue responsable des erreurs,
          omissions ou d&apos;une indisponibilité temporaire du service.
        </p>
      </section>
    </LegalLayout>
  );
}
