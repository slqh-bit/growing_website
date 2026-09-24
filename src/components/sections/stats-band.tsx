import { Container } from "@/components/ui/container";
import { Reveal, RevealGroup } from "@/components/motion/reveal";

export interface StatItem {
  value: string;
  label: string;
}

/** Key-figures band (Stats block / Site settings stats). */
export function StatsBand({ title, items }: { title?: string | null; items: StatItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-8">
      <Container>
        <div className="rounded-3xl border border-border bg-surface px-6 py-10 shadow-sm sm:px-10">
          {title && (
            <Reveal className="mb-8 text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand">{title}</h2>
            </Reveal>
          )}
          <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {items.map((s, i) => (
              <Reveal key={`${s.value}-${i}`} className="flex flex-col items-center gap-1 text-center">
                <bdi dir="ltr" className="text-3xl font-bold text-foreground sm:text-4xl">
                  {s.value}
                </bdi>
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
