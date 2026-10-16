import { cookies } from "next/headers";
import type { CSSProperties } from "react";
import type { Payload } from "payload";
import { WORKSPACE_COOKIE } from "@/cms/workspace";
import { loadWorkspace, type Workspace, type WorkspaceSite } from "@/cms/workspace-server";

export type Lang = "fr" | "en" | "ar";
export type Label = Record<Lang, string>;

/** The admin's interface language (French unless Arabic or English is chosen). */
export const adminLang = (i18n: { language: string }): Lang =>
  i18n.language === "ar" || i18n.language === "en" ? i18n.language : "fr";

/** The workspace of the admin screen being rendered (views get no request object). */
export async function currentWorkspace(payload: Payload, user: unknown): Promise<Workspace> {
  return loadWorkspace(payload, user, (await cookies()).get(WORKSPACE_COOKIE)?.value ?? null);
}

/** Tints a screen with its company's brand colour (see custom.scss). */
export const accentStyle = (site: WorkspaceSite | null): CSSProperties | undefined =>
  site?.color ? ({ "--ws-accent": site.color } as CSSProperties) : undefined;
