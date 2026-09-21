import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/motion/reveal";

/**
 * Legal pages are authored in French per the project language rule
 * (business/legal text in FR). The surrounding chrome stays localized.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={`Dernière mise à jour : ${updated}`} />
      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Reveal
            className="prose-legal flex flex-col gap-6 text-foreground/90 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:space-y-1"
            dir="ltr"
          >
            {children}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
