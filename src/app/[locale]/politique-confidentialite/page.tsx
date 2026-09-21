import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { siteSettings } from "@/content/site";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Growing Technologies.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalLayout title="Politique de confidentialité" updated="21/09/2026">
      <section>
        <h2>Collecte des données</h2>
        <p>
          Dans le cadre des demandes de devis et de contact, {siteSettings.companyName} collecte les
          données que vous fournissez volontairement : nom, coordonnées (téléphone, e-mail), région
          et informations techniques relatives à votre projet.
        </p>
      </section>

      <section>
        <h2>Finalité du traitement</h2>
        <p>Ces données sont utilisées exclusivement pour :</p>
        <ul>
          <li>répondre à votre demande de devis ou de renseignement ;</li>
          <li>établir une proposition technique et commerciale adaptée ;</li>
          <li>assurer le suivi de votre projet.</li>
        </ul>
      </section>

      <section>
        <h2>Conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire au traitement de votre demande et
          au suivi de la relation commerciale, puis archivées ou supprimées conformément à la
          réglementation applicable.
        </p>
      </section>

      <section>
        <h2>Partage</h2>
        <p>
          Vos données ne sont ni vendues ni cédées à des tiers. Elles peuvent être traitées par des
          prestataires techniques (hébergement, messagerie) strictement pour le fonctionnement du
          service.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
          données. Pour l&apos;exercer, contactez-nous à l&apos;adresse {siteSettings.email}.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Ce site utilise uniquement les cookies nécessaires à son bon fonctionnement et, le cas
          échéant, à une mesure d&apos;audience respectueuse de la vie privée. Aucun cookie
          publicitaire n&apos;est déposé sans votre consentement.
        </p>
      </section>
    </LegalLayout>
  );
}
