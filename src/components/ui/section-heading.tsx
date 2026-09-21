import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
