"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleCheck } from "lucide-react";
import { TabConfiguration } from "./tab-configuration";
import { TabVersionHistory } from "./tab-version-history";
import { TabTenants } from "./tab-tenants";
import { TabRollout } from "./tab-rollout";
import { TabYaml } from "./tab-yaml";
import { TabAudit } from "./tab-audit";
import { rollupTemplateStatus } from "./policy-helpers";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PolicyTemplate } from "@/types";

interface TemplateEditorDialogProps {
  templateId: string | null;
  initialTab?: TemplateEditorTab;
  onClose: () => void;
}

export type TemplateEditorTab =
  | "configuration"
  | "versions"
  | "tenants"
  | "rollout"
  | "yaml"
  | "audit";

const TAB_LABELS: Record<TemplateEditorTab, string> = {
  configuration: "Configuration",
  versions: "Version History",
  tenants: "Tenants Applied",
  rollout: "Rollout Manager",
  yaml: "YAML",
  audit: "Audit",
};

export function TemplateEditorDialog({
  templateId,
  initialTab = "configuration",
  onClose,
}: TemplateEditorDialogProps) {
  const templates = useConsoleStore((s) => s.policyTemplates);

  const template = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  return (
    <Dialog open={templateId !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="grid h-[88vh] max-w-[1100px] grid-rows-[auto_1fr_auto] gap-0 p-0 sm:max-w-[1100px]">
        {template ? (
          <EditorBody
            key={`${template.id}__${initialTab}`}
            template={template}
            initialTab={initialTab}
            onClose={onClose}
          />
        ) : (
          <VisuallyHidden.Root>
            <DialogTitle>Policy template editor</DialogTitle>
            <DialogDescription>Loading template details</DialogDescription>
          </VisuallyHidden.Root>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EditorBodyProps {
  template: PolicyTemplate;
  initialTab: TemplateEditorTab;
  onClose: () => void;
}

function EditorBody({ template, initialTab, onClose }: EditorBodyProps) {
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const rollouts = useConsoleStore((s) => s.policyTemplateRollouts);
  const savePolicyTemplateVersion = useConsoleStore(
    (s) => s.savePolicyTemplateVersion,
  );

  const [tab, setTab] = useState<TemplateEditorTab>(initialTab);
  const [draft, setDraft] = useState<PolicyTemplate>(() => ({ ...template }));

  const status = rollupTemplateStatus(template, assignments, overrides, rollouts);
  const tenantCount = status.totalAssignments;

  function handleSave(): void {
    const newVersion = savePolicyTemplateVersion(
      template.id,
      draft.versions[draft.versions.length - 1].config,
      draft.versions[draft.versions.length - 1].changeSummary || "Configuration update",
      currentOperator.name,
    );
    toast.success(`v${newVersion} saved`, {
      description: "Configure rollout in the Rollout Manager tab.",
    });
    setTab("rollout");
  }

  return (
    <>
      <header className="flex flex-col gap-2 border-b border-border-subtle px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-[18px] font-semibold leading-tight text-text-primary">
                {template.name}
              </DialogTitle>
              <Badge
                variant="outline"
                className="border-border-default bg-secondary px-1.5 py-0 text-[11px] tabular-nums text-text-secondary"
              >
                v{template.currentVersion}
              </Badge>
            </div>
            <div className="mt-0.5 text-[12px] text-text-secondary">
              {template.industry}-aligned · {tenantCount} tenant
              {tenantCount === 1 ? "" : "s"} assigned · v{template.currentVersion} active
              in production
            </div>
            <div className="mt-1.5">
              {status.inSync ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-status-success">
                  <CircleCheck className="h-3 w-3" />
                  In sync · No drift detected
                </span>
              ) : status.hasActiveRollout ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-status-info">
                  Rollout active · {status.pendingMigration} pending migrations
                </span>
              ) : status.pendingMigration > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-status-warning">
                  {status.pendingMigration} tenant
                  {status.pendingMigration === 1 ? "" : "s"} pending migration to v
                  {template.currentVersion}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-status-warning">
                  {status.overrideCount} active override
                  {status.overrideCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pr-8">
            <Button variant="outline" size="sm" onClick={onClose}>
              Save Draft
            </Button>
            <Button
              size="sm"
              className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              onClick={handleSave}
            >
              Save as New Version
            </Button>
          </div>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TemplateEditorTab)}
        className="grid grid-rows-[auto_1fr] overflow-hidden"
      >
        <TabsList className="h-auto justify-start gap-1 rounded-none border-b border-border-subtle bg-surface px-6 py-0">
          {(
            ["configuration", "versions", "tenants", "rollout", "yaml", "audit"] as TemplateEditorTab[]
          ).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className={cn(
                "rounded-none border-b-2 border-transparent px-3 py-2.5 text-[12.5px] font-medium text-text-secondary",
                "data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:text-text-primary data-[state=active]:shadow-none",
              )}
            >
              {TAB_LABELS[t]}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="overflow-y-auto px-6 py-4">
          <TabsContent value="configuration" className="m-0">
            <TabConfiguration
              template={template}
              draft={draft}
              onDraftChange={setDraft}
            />
          </TabsContent>
          <TabsContent value="versions" className="m-0">
            <TabVersionHistory
              template={template}
              onSwitchToRollout={() => setTab("rollout")}
            />
          </TabsContent>
          <TabsContent value="tenants" className="m-0">
            <TabTenants template={template} />
          </TabsContent>
          <TabsContent value="rollout" className="m-0">
            <TabRollout template={template} />
          </TabsContent>
          <TabsContent value="yaml" className="m-0">
            <TabYaml template={template} />
          </TabsContent>
          <TabsContent value="audit" className="m-0">
            <TabAudit template={template} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
