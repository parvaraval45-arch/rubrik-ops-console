"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ALL_FRAMEWORKS,
  ALL_INDUSTRIES,
  ALL_WORKLOAD_TYPES,
  rollupTemplateStatus,
} from "./policy-helpers";
import type {
  ComplianceFramework,
  TemplateIndustry,
  WorkloadCoverageType,
} from "@/types";

export interface PoliciesFilterState {
  industries: TemplateIndustry[];
  workloadTypes: WorkloadCoverageType[];
  frameworks: ComplianceFramework[];
  status: "all" | "active" | "draft" | "deprecated" | "pending" | "overrides";
}

export const EMPTY_FILTERS: PoliciesFilterState = {
  industries: [],
  workloadTypes: [],
  frameworks: [],
  status: "all",
};

interface PoliciesFilterSidebarProps {
  filters: PoliciesFilterState;
  onChange: (next: PoliciesFilterState) => void;
}

export function PoliciesFilterSidebar({
  filters,
  onChange,
}: PoliciesFilterSidebarProps) {
  const templates = useConsoleStore((s) => s.policyTemplates);
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const rollouts = useConsoleStore((s) => s.policyTemplateRollouts);

  const counts = useMemo(() => {
    const byIndustry: Record<string, number> = {};
    const byWorkload: Record<string, number> = {};
    const byFramework: Record<string, number> = {};
    let pendingTemplates = 0;
    let overrideTemplates = 0;
    for (const t of templates) {
      byIndustry[t.industry] = (byIndustry[t.industry] ?? 0) + 1;
      for (const w of t.workloadCoverage) {
        byWorkload[w] = (byWorkload[w] ?? 0) + 1;
      }
      for (const f of t.complianceFrameworks) {
        byFramework[f] = (byFramework[f] ?? 0) + 1;
      }
      const status = rollupTemplateStatus(t, assignments, overrides, rollouts);
      if (status.pendingMigration > 0 || status.hasActiveRollout) pendingTemplates += 1;
      if (status.overrideCount > 0) overrideTemplates += 1;
    }
    return { byIndustry, byWorkload, byFramework, pendingTemplates, overrideTemplates };
  }, [templates, assignments, overrides, rollouts]);

  function toggle<T extends string>(key: keyof PoliciesFilterState, value: T): void {
    const cur = filters[key] as T[];
    const next = cur.includes(value)
      ? cur.filter((x) => x !== value)
      : [...cur, value];
    onChange({ ...filters, [key]: next } as PoliciesFilterState);
  }

  const hasActiveFilters =
    filters.industries.length > 0 ||
    filters.workloadTypes.length > 0 ||
    filters.frameworks.length > 0 ||
    filters.status !== "all";

  return (
    <aside className="sticky top-4 flex h-fit w-full flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
          Filters
        </h3>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-text-secondary"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <FilterGroup label="Industry">
        {ALL_INDUSTRIES.map((ind) => (
          <FilterOption
            key={ind}
            label={ind}
            count={counts.byIndustry[ind] ?? 0}
            checked={filters.industries.includes(ind)}
            onCheck={() => toggle("industries", ind)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Workload Type">
        {ALL_WORKLOAD_TYPES.map((w) => (
          <FilterOption
            key={w}
            label={w === "FileShare" ? "File Shares" : w}
            count={counts.byWorkload[w] ?? 0}
            checked={filters.workloadTypes.includes(w)}
            onCheck={() => toggle("workloadTypes", w)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Compliance Framework">
        {ALL_FRAMEWORKS.map((f) => (
          <FilterOption
            key={f.id}
            label={f.id}
            count={counts.byFramework[f.id] ?? 0}
            checked={filters.frameworks.includes(f.id)}
            onCheck={() => toggle("frameworks", f.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Status">
        <StatusOption
          label="All"
          count={templates.length}
          checked={filters.status === "all"}
          onSelect={() => onChange({ ...filters, status: "all" })}
        />
        <StatusOption
          label="Active"
          count={templates.filter((t) => t.status === "Active").length}
          checked={filters.status === "active"}
          onSelect={() => onChange({ ...filters, status: "active" })}
        />
        <StatusOption
          label="Draft"
          count={templates.filter((t) => t.status === "Draft").length}
          checked={filters.status === "draft"}
          onSelect={() => onChange({ ...filters, status: "draft" })}
        />
        <StatusOption
          label="Deprecated"
          count={templates.filter((t) => t.status === "Deprecated").length}
          checked={filters.status === "deprecated"}
          onSelect={() => onChange({ ...filters, status: "deprecated" })}
        />
        <StatusOption
          label="With Pending Rollouts"
          count={counts.pendingTemplates}
          checked={filters.status === "pending"}
          onSelect={() => onChange({ ...filters, status: "pending" })}
        />
        <StatusOption
          label="With Active Overrides"
          count={counts.overrideTemplates}
          checked={filters.status === "overrides"}
          onSelect={() => onChange({ ...filters, status: "overrides" })}
        />
      </FilterGroup>
    </aside>
  );
}

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group flex w-full items-center justify-between text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          {label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-1.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FilterOptionProps {
  label: string;
  count: number;
  checked: boolean;
  onCheck: () => void;
}

function FilterOption({ label, count, checked, onCheck }: FilterOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded px-1.5 py-1 text-[12px] transition-colors hover:bg-secondary",
        checked ? "text-text-primary" : "text-text-secondary",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheck}
          className="h-3.5 w-3.5"
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 tabular-nums text-text-tertiary">{count}</span>
    </label>
  );
}

interface StatusOptionProps {
  label: string;
  count: number;
  checked: boolean;
  onSelect: () => void;
}

function StatusOption({ label, count, checked, onSelect }: StatusOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-[12px] transition-colors",
        checked
          ? "bg-brand-primary-subtle font-medium text-brand-primary-hover"
          : "text-text-secondary hover:bg-secondary",
      )}
    >
      <span>{label}</span>
      <span className="shrink-0 tabular-nums text-text-tertiary">{count}</span>
    </button>
  );
}
