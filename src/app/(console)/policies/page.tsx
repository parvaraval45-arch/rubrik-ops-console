"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { useConsoleStore } from "@/lib/store";
import { toast } from "sonner";
import { RolloutBanner } from "@/components/policies/rollout-banner";
import { PoliciesKpis } from "@/components/policies/policies-kpis";
import {
  PoliciesFilterSidebar,
  EMPTY_FILTERS,
  type PoliciesFilterState,
} from "@/components/policies/policies-filter-sidebar";
import { TemplateCard } from "@/components/policies/template-card";
import {
  TemplateEditorDialog,
  type TemplateEditorTab,
} from "@/components/policies/template-editor-dialog";
import { DriftDetailDialog } from "@/components/policies/drift-detail-dialog";
import { CreateTemplateDialog } from "@/components/policies/create-template-dialog";
import { rollupTemplateStatus } from "@/components/policies/policy-helpers";

export default function PoliciesPage() {
  const templates = useConsoleStore((s) => s.policyTemplates);
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const rollouts = useConsoleStore((s) => s.policyTemplateRollouts);

  const searchParams = useSearchParams();
  const queryPolicyId = searchParams.get("policyId");
  const queryTab = searchParams.get("tab") as TemplateEditorTab | null;

  const [filters, setFilters] = useState<PoliciesFilterState>(EMPTY_FILTERS);
  const [manualOpenTemplateId, setManualOpenTemplateId] = useState<string | null>(null);
  const [closedFromQuery, setClosedFromQuery] = useState(false);
  const [editorTab, setEditorTab] = useState<TemplateEditorTab>(
    queryTab ?? "configuration",
  );

  const openTemplateId =
    manualOpenTemplateId ??
    (queryPolicyId && !closedFromQuery && templates.some((t) => t.id === queryPolicyId)
      ? queryPolicyId
      : null);
  const [driftOpen, setDriftOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const visibleTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (
        filters.industries.length > 0 &&
        !filters.industries.includes(t.industry)
      )
        return false;
      if (
        filters.workloadTypes.length > 0 &&
        !filters.workloadTypes.some((w) => t.workloadCoverage.includes(w))
      )
        return false;
      if (
        filters.frameworks.length > 0 &&
        !filters.frameworks.some((f) => t.complianceFrameworks.includes(f))
      )
        return false;
      const status = rollupTemplateStatus(t, assignments, overrides, rollouts);
      if (filters.status === "active" && t.status !== "Active") return false;
      if (filters.status === "draft" && t.status !== "Draft") return false;
      if (filters.status === "deprecated" && t.status !== "Deprecated") return false;
      if (filters.status === "pending" && status.pendingMigration === 0 && !status.hasActiveRollout)
        return false;
      if (filters.status === "overrides" && status.overrideCount === 0) return false;
      return true;
    });
  }, [templates, assignments, overrides, rollouts, filters]);

  const subtitle = useMemo(() => {
    const totalAssignments = new Set(assignments.map((a) => a.tenantId)).size;
    const pendingTemplates = templates.filter((t) => {
      const s = rollupTemplateStatus(t, assignments, overrides, rollouts);
      return s.pendingMigration > 0 || s.hasActiveRollout;
    }).length;
    return `${templates.length} templates · ${totalAssignments} active tenant assignments · ${pendingTemplates} templates with pending rollouts`;
  }, [templates, assignments, overrides, rollouts]);

  const activeFilterChips: Array<{ label: string; onRemove: () => void }> = [];
  for (const ind of filters.industries) {
    activeFilterChips.push({
      label: `Industry: ${ind}`,
      onRemove: () =>
        setFilters({
          ...filters,
          industries: filters.industries.filter((x) => x !== ind),
        }),
    });
  }
  for (const w of filters.workloadTypes) {
    activeFilterChips.push({
      label: `Workload: ${w}`,
      onRemove: () =>
        setFilters({
          ...filters,
          workloadTypes: filters.workloadTypes.filter((x) => x !== w),
        }),
    });
  }
  for (const f of filters.frameworks) {
    activeFilterChips.push({
      label: `Framework: ${f}`,
      onRemove: () =>
        setFilters({
          ...filters,
          frameworks: filters.frameworks.filter((x) => x !== f),
        }),
    });
  }
  if (filters.status !== "all") {
    activeFilterChips.push({
      label: `Status: ${filters.status}`,
      onRemove: () => setFilters({ ...filters, status: "all" }),
    });
  }

  function openEditor(templateId: string, tab: TemplateEditorTab = "configuration"): void {
    setEditorTab(tab);
    setClosedFromQuery(false);
    setManualOpenTemplateId(templateId);
  }

  function closeEditor(): void {
    setManualOpenTemplateId(null);
    if (queryPolicyId) setClosedFromQuery(true);
  }

  function openPendingRolloutTemplate(): void {
    const target = templates.find((t) => {
      const s = rollupTemplateStatus(t, assignments, overrides, rollouts);
      return s.hasActiveRollout || s.pendingMigration > 0;
    });
    if (target) openEditor(target.id, "rollout");
    else setFilters({ ...filters, status: "pending" });
  }

  function openRolloutForTemplate(templateId: string): void {
    openEditor(templateId, "rollout");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Governance"
        title="Policy Templates"
        description={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() =>
                toast("Import template", {
                  description: "Drop YAML or JSON to import an external template.",
                })
              }
            >
              <Upload className="h-3.5 w-3.5" />
              Import Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() =>
                toast.success("Templates exported", {
                  description: `${templates.length} templates packaged as YAML bundle`,
                })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Export All
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create Template
            </Button>
          </div>
        }
      />

      <RolloutBanner onOpenRollout={openRolloutForTemplate} />

      <PoliciesKpis
        onPendingClick={openPendingRolloutTemplate}
        onDriftClick={() => setDriftOpen(true)}
      />

      <div className="grid grid-cols-[240px_1fr] gap-6">
        <PoliciesFilterSidebar filters={filters} onChange={setFilters} />

        <div className="flex flex-col gap-4">
          {activeFilterChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Active filters:
              </span>
              {activeFilterChips.map((chip) => (
                <Badge
                  key={chip.label}
                  variant="outline"
                  className="gap-1 border-border-default bg-secondary px-2 py-0.5 text-[11px] text-text-secondary"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="text-text-tertiary hover:text-text-primary"
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                Clear all
              </Button>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-[12px] tabular-nums text-text-tertiary">
              Showing {visibleTemplates.length} of {templates.length} templates
            </span>
          </div>

          {visibleTemplates.length === 0 ? (
            <EmptyState
              title="No templates match these filters"
              description="Adjust the filter sidebar or clear your active filters to see more."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleTemplates.map((t, i) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  index={i}
                  onOpen={(id) => openEditor(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TemplateEditorDialog
        templateId={openTemplateId}
        initialTab={editorTab}
        onClose={closeEditor}
      />
      <DriftDetailDialog open={driftOpen} onOpenChange={setDriftOpen} />
      <CreateTemplateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          openEditor(id);
        }}
      />
    </div>
  );
}
