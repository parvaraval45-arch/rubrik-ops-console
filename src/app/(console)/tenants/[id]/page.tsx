"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { TenantHeader } from "@/components/tenant-detail/header";
import { SummaryTiles } from "@/components/tenant-detail/summary-tiles";
import { OverviewTab } from "@/components/tenant-detail/tabs/overview-tab";
import { WorkloadsTab } from "@/components/tenant-detail/tabs/workloads-tab";
import { BackupsTab } from "@/components/tenant-detail/tabs/backups-tab";
import { PoliciesTab } from "@/components/tenant-detail/tabs/policies-tab";
import { CapacityTab } from "@/components/tenant-detail/tabs/capacity-tab";
import { SecurityTab } from "@/components/tenant-detail/tabs/security-tab";
import { AuditTab } from "@/components/tenant-detail/tabs/audit-tab";
import { JobDetailSheet } from "@/components/tenant-detail/job-detail-sheet";
import { EmptyState } from "@/components/data/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConsoleStore } from "@/lib/store";
import type { WorkloadType } from "@/types";

const TAB_VALUES = [
  "overview",
  "workloads",
  "backups",
  "policies",
  "capacity",
  "security",
  "audit",
] as const;
type TabValue = (typeof TAB_VALUES)[number];

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = params.id;

  const tenant = useConsoleStore((s) =>
    s.tenants.find((t) => t.id === tenantId),
  );
  const workloads = useConsoleStore((s) => s.workloads[tenantId] ?? []);
  const alarms = useConsoleStore((s) => s.alarms[tenantId] ?? []);
  const jobs = useConsoleStore((s) => s.jobs[tenantId] ?? []);
  const policyAssignment = useConsoleStore(
    (s) => s.policyAssignments[tenantId],
  );
  const detailedAudit = useConsoleStore((s) => s.detailedAudit[tenantId] ?? []);
  const monthly = useConsoleStore((s) => s.monthly[tenantId] ?? []);
  const quota = useConsoleStore((s) => s.quota[tenantId]);
  const keyRotation = useConsoleStore((s) => s.keyRotation[tenantId]);
  const threats = useConsoleStore((s) => s.threats[tenantId] ?? []);

  const tabFromUrl = (searchParams.get("tab") ?? "overview") as TabValue;
  const tab: TabValue = TAB_VALUES.includes(tabFromUrl) ? tabFromUrl : "overview";
  const typeFromUrl = searchParams.get("type") as WorkloadType | null;
  const statusFromUrl = searchParams.get("status");

  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const setTab = (next: string, params?: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (next !== "overview") sp.set("tab", next);
    Object.entries(params ?? {}).forEach(([k, v]) => sp.set(k, v));
    const qs = sp.toString();
    router.push(`/tenants/${tenantId}${qs ? `?${qs}` : ""}`);
  };

  const handleTileClick = (
    target: "capacity" | "backups-failed" | "security" | "sla",
  ) => {
    if (target === "capacity") return setTab("capacity");
    if (target === "backups-failed") return setTab("backups", { status: "failed" });
    if (target === "security") return setTab("security");
    if (target === "sla") return setTab("overview");
  };

  const passingControls = 5;
  const totalControls = 5;
  const warningControls = 0;
  const failedControls = 0;
  const postureScore = useMemo(() => {
    return Math.round(
      82 +
        (tenant?.securityScore ?? 80) * 0.05 -
        warningControls * 4 -
        failedControls * 12,
    );
  }, [tenant?.securityScore]);

  if (!tenant) {
    return (
      <EmptyState
        icon={Building2}
        title="Tenant not found"
        description="This tenant ID does not exist in the current workspace."
      />
    );
  }

  const activeJob = jobs.find((j) => j.id === activeJobId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <TenantHeader tenant={tenant} workloads={workloads} />

      <SummaryTiles
        tenant={tenant}
        jobs={jobs}
        workloads={workloads}
        passingControls={passingControls}
        totalControls={totalControls}
        warningControls={warningControls}
        failedControls={failedControls}
        postureScore={postureScore}
        onTileClick={handleTileClick}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v)} className="flex flex-col gap-4">
        <TabsList className="bg-surface">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workloads">Workloads</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            tenant={tenant}
            workloads={workloads}
            alarms={alarms}
            jobs={jobs}
            onSwitchTab={setTab}
            onJobClick={(id) => setActiveJobId(id)}
          />
        </TabsContent>

        <TabsContent value="workloads">
          <WorkloadsTab
            tenant={tenant}
            workloads={workloads}
            initialTypeFilter={typeFromUrl ?? undefined}
          />
        </TabsContent>

        <TabsContent value="backups">
          <BackupsTab
            tenant={tenant}
            jobs={jobs}
            initialStatusFilter={
              statusFromUrl === "failed" ? "failed" : undefined
            }
          />
        </TabsContent>

        <TabsContent value="policies">
          {policyAssignment ? (
            <PoliciesTab tenant={tenant} assignment={policyAssignment} />
          ) : null}
        </TabsContent>

        <TabsContent value="capacity">
          {quota ? (
            <CapacityTab tenant={tenant} quota={quota} monthly={monthly} />
          ) : null}
        </TabsContent>

        <TabsContent value="security">
          {keyRotation ? (
            <SecurityTab
              tenant={tenant}
              threats={threats}
              keyRotation={keyRotation}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab tenant={tenant} events={detailedAudit} />
        </TabsContent>
      </Tabs>

      <JobDetailSheet
        tenant={tenant}
        job={activeJob}
        open={activeJob !== null}
        onOpenChange={(o) => {
          if (!o) setActiveJobId(null);
        }}
      />
    </div>
  );
}
