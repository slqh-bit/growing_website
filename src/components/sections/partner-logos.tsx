import type { Partner } from "@/payload-types";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/cms/smart-link";
import { Container } from "@/components/ui/container";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

/** Grayscale logo strip of partners/brands (Contenu → Partenaires & marques). */
export function PartnerLogos({ partners, title }: { partners: Partner[]; title?: string | null }) {
  if (partners.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        {title && (
          <Reveal className="mb-10 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
          </Reveal>
        )}
        <RevealGroup className="grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => {
            const logo = (
              <CmsImage
                media={partner.logo}
                size="thumbnail"
                sizes="160px"
                className="mx-auto h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            );
            return (
              <Reveal key={partner.id} title={partner.description ?? partner.name}>
                {partner.url ? (
                  <SmartLink href={partner.url} className="block">
                    {logo}
                  </SmartLink>
                ) : (
                  logo
                )}
              </Reveal>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
