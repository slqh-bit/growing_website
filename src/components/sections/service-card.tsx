import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Service } from "@/payload-types";
import { ServiceIcon } from "@/components/ui/service-icon";
import { cn } from "@/lib/utils";

export type ServiceSummary = Pick<Service, "slug" | "icon" | "title" | "shortDescription">;

export async function ServiceCard({
  service,
  locale,
  className,
  headingLevel = 3,
}: {
  service: ServiceSummary;
  locale: Locale;
  className?: string;
  /** 2 when the card list sits directly under the page's h1 (keeps heading order valid). */
  headingLevel?: 2 | 3;
}) {
  const t = await getTranslations({ locale, namespace: "common" });
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <ServiceIcon name={service.icon} className="transition-transform duration-300 group-hover:scale-105" />
      <div className="flex flex-col gap-2">
        <Heading className="text-lg font-semibold tracking-tight text-foreground">{service.title}</Heading>
        <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand">
        {t("learnMore")}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
