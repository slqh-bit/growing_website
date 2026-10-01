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

/**
 * Key figures as a card overlapping the large banner above it (group home):
 * gradient numbers, dividers between figures.
 */
export function StatsCard({ items }: { items: StatItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="relative z-10 -mt-14">
      <Container>
        <RevealGroup className="grid grid-cols-2 gap-y-6 rounded-3xl bg-surface px-4 py-8 shadow-xl ring-1 ring-border sm:grid-cols-4 sm:py-9">
          {items.map((s, i) => (
            <Reveal
              key={`${s.value}-${i}`}
              className="flex flex-col items-center gap-1 px-3 text-center sm:border-e sm:border-border sm:last:border-e-0"
            >
              <bdi
                dir="ltr"
                className="bg-gradient-to-br from-primary-600 to-accent-500 bg-clip-text text-4xl font-extrabold text-transparent"
              >
                {s.value}
              </bdi>
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
            </Reveal>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
