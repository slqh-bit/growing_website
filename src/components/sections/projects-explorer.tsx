"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ProjectCardView, type ProjectView } from "@/components/sections/project-card-view";
import { cn } from "@/lib/utils";

interface Labels {
  all: string;
  activity: string;
  region: string;
  clientType: string;
  noResults: string;
}

type FilterKey = "activityKey" | "region" | "clientType";

export function ProjectsExplorer({
  projects,
  labels,
}: {
  projects: ProjectView[];
  labels: Labels;
}) {
  const [activity, setActivity] = React.useState<string>("all");
  const [region, setRegion] = React.useState<string>("all");
  const [clientType, setClientType] = React.useState<string>("all");

  const regions = unique(projects.map((p) => p.region));
  const activities = uniqueBy(projects, "activityKey", "activityLabel");
  const clientTypes = uniqueBy(projects, "clientType", "clientTypeLabel");

  const filtered = projects.filter(
    (p) =>
      (activity === "all" || p.activityKey === activity) &&
      (region === "all" || p.region === region) &&
      (clientType === "all" || p.clientType === clientType),
  );

  return (
    <div>
      <div className="flex flex-col gap-5">
        <FilterRow
          label={labels.activity}
          value={activity}
          onChange={setActivity}
          allLabel={labels.all}
          options={activities}
        />
        <FilterRow
          label={labels.clientType}
          value={clientType}
          onChange={setClientType}
          allLabel={labels.all}
          options={clientTypes}
        />
        <FilterRow
          label={labels.region}
          value={region}
          onChange={setRegion}
          allLabel={labels.all}
          options={regions.map((r) => ({ value: r, label: r }))}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {labels.noResults}
        </p>
      ) : (
        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ProjectCardView project={p} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  const all = [{ value: "all", label: allLabel }, ...options];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {all.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-primary-600 bg-primary-600 text-white"
              : "border-border bg-surface text-foreground hover:border-primary-300",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function uniqueBy(
  items: ProjectView[],
  valueKey: FilterKey,
  labelKey: keyof ProjectView,
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const item of items) {
    map.set(item[valueKey] as string, item[labelKey] as string);
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}
