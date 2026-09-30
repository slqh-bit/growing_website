"use client";

import { useRowLabel } from "@payloadcms/ui";

/** Collapsed question rows show the question itself (Formulaires de devis → Questions). */
export function QuestionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string | null; name?: string | null }>();
  const fallback = `Question ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`;
  return <span>{data?.label || data?.name || fallback}</span>;
}
