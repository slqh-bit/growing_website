import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="bg-solar bg-clip-text text-7xl font-black text-transparent sm:text-8xl">
        404
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("subtitle")}</p>
      <Button asChild variant="solar">
        <Link href="/">
          <Home className="size-4" />
          {tc("backHome")}
        </Link>
      </Button>
    </Container>
  );
}
