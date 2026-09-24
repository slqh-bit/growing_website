import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Standard inner-page header band. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 to-transparent dark:from-primary-950/30" />
      <Container className="py-14 sm:py-20">
        <Reveal immediate className="flex max-w-3xl flex-col gap-4">
          {eyebrow && (
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
          {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
          {children}
        </Reveal>
      </Container>
    </section>
  );
}
