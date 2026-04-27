"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCw, Settings as SettingsIcon, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SecurityScoreGauge } from "@/components/security/security-score-gauge";
import { CriticalBanner } from "@/components/security/critical-banner";
import {
  SecurityKpiRow,
  type SecurityKpi,
} from "@/components/security/security-kpi-row";
import { AssessmentBar } from "@/components/security/assessment-bar";
import { IsolationMatrix } from "@/components/security/matrix";
import { CellDrillSheet } from "@/components/security/cell-drill-sheet";
import { ThreatDetectionsTable } from "@/components/security/threats-table";
import { AccessPanels } from "@/components/security/access-panels";
import { ComplianceStrip } from "@/components/security/compliance-strip";
import { AttestationExportDialog } from "@/components/security/attestation-export";
import { ScheduleSheet } from "@/components/security/schedule-sheet";
import { useConsoleStore } from "@/lib/store";
import type { IsolationControlId } from "@/types";

export default function SecurityPage() {
  const tenants = useConsoleStore((s) => s.tenants);
  const cells = useConsoleStore((s) => s.matrixCells);
  const schedule = useConsoleStore((s) => s.securitySchedule);
  const rerunPosture = useConsoleStore((s) => s.rerunPostureSweep);
  const securityThreats = useConsoleStore((s) => s.securityThreats);
  const keyRotation = useConsoleStore((s) => s.keyRotation);
  const policyTemplates = useConsoleStore((s) => s.policyTemplates);
  const policyTemplateAssignments = useConsoleStore(
    (s) => s.policyTemplateAssignments,
  );

  const [postureRunning, setPostureRunning] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [attestationOpen, setAttestationOpen] = useState(false);
  const [selected, setSelected] = useState<{
    tenantId: string;
    controlId: IsolationControlId;
  } | null>(null);
  const [matrixViewKey, setMatrixViewKey] = useState(0);

  const stats = useMemo(() => {
    const failures = cells.filter((c) => c.status === "fail").length;
    const warnings = cells.filter((c) => c.status === "warn").length;
    const passing = cells.filter((c) => c.status === "pass").length;
    const score = Math.max(0, Math.min(100, Math.round(100 - failures * 1.5 - warnings * 0.4)));
    return { failures, warnings, passing, score };
  }, [cells]);

  const kpiStats = useMemo(() => {
    const activeTenants = tenants.filter((t) => t.status !== "Churned");
    const activeThreats = securityThreats.filter(
      (t) => t.status === "Investigating" || t.status === "Contained",
    ).length;
    const containedThreats = securityThreats.filter(
      (t) => t.status === "Contained",
    ).length;
    const resolvedThreats = securityThreats.filter(
      (t) => t.status === "Resolved",
    ).length;

    // MFA enforcement: tenants where security score >= 85 are treated as having
    // strict tenant-side MFA enforcement enabled. Approximation, but derived
    // from store rather than hardcoded.
    const mfaEnforcedCount = activeTenants.filter(
      (t) => t.securityScore >= 85,
    ).length;

    // Encryption coverage: tenants with an active GCM-class key rotation entry.
    const tenantsWithEncryption = activeTenants.filter((t) => {
      const k = keyRotation[t.id];
      return k && k.algorithm === "AES-256-GCM";
    }).length;
    const encryptionCoverage =
      activeTenants.length === 0
        ? 0
        : Math.round((tenantsWithEncryption / activeTenants.length) * 100);

    // Immutability coverage: tenants assigned to a template whose current
    // version has a Compliance lock enabled.
    const immutableTenantIds = new Set<string>();
    for (const a of policyTemplateAssignments) {
      const tpl = policyTemplates.find((p) => p.id === a.templateId);
      if (!tpl) continue;
      const v = tpl.versions.find((x) => x.version === a.appliedVersion);
      if (v && v.config.immutabilityLockType === "Compliance") {
        immutableTenantIds.add(a.tenantId);
      }
    }
    const immutabilityCoverage =
      activeTenants.length === 0
        ? 0
        : Math.round((immutableTenantIds.size / activeTenants.length) * 100);

    return {
      activeTenantCount: activeTenants.length,
      activeThreats,
      containedThreats,
      resolvedThreats,
      mfaEnforcedCount,
      encryptionCoverage,
      immutabilityCoverage,
    };
  }, [
    tenants,
    securityThreats,
    keyRotation,
    policyTemplates,
    policyTemplateAssignments,
  ]);

  const kpis: SecurityKpi[] = [
    {
      label: "Isolation Violations",
      value: stats.failures.toString(),
      valueTone: stats.failures > 0 ? "critical" : "success",
      subtitle: stats.failures > 0 ? "Should be 0" : "All clear",
      trend:
        stats.failures > 0
          ? { direction: "up", tone: "negative", label: `${stats.warnings} warnings also active` }
          : { direction: "down", tone: "positive", label: "All controls passing" },
      onClick: () => setMatrixViewKey((k) => k + 1),
    },
    {
      label: "Anomalies Detected (24h)",
      value: kpiStats.activeThreats.toString(),
      valueTone: kpiStats.activeThreats > 0 ? "default" : "success",
      subtitle: "Active threats under investigation",
      trend: {
        direction: "neutral",
        tone: "neutral",
        label: `${kpiStats.containedThreats} contained, ${kpiStats.resolvedThreats} resolved`,
      },
    },
    {
      label: "MFA Enforced",
      value: `${kpiStats.mfaEnforcedCount} / ${kpiStats.activeTenantCount}`,
      valueTone:
        kpiStats.mfaEnforcedCount === kpiStats.activeTenantCount
          ? "success"
          : "warning",
      subtitle: "Tenants with mandatory MFA",
      trend: {
        direction: "neutral",
        tone: "neutral",
        label: `${kpiStats.activeTenantCount - kpiStats.mfaEnforcedCount} on optional — review at QBR`,
      },
    },
    {
      label: "Encryption Coverage",
      value: `${kpiStats.encryptionCoverage}%`,
      valueTone: kpiStats.encryptionCoverage >= 90 ? "success" : "warning",
      subtitle: "Tenants on AES-256-GCM",
      progress: kpiStats.encryptionCoverage,
      trend: { direction: "up", tone: "positive", label: "+2% vs last quarter" },
    },
    {
      label: "Immutability Coverage",
      value: `${kpiStats.immutabilityCoverage}%`,
      valueTone:
        kpiStats.immutabilityCoverage >= 80
          ? "success"
          : kpiStats.immutabilityCoverage >= 60
            ? "warning"
            : "critical",
      subtitle: "Tenants under compliance lock",
      progress: kpiStats.immutabilityCoverage,
      trend: {
        direction: "neutral",
        tone: "neutral",
        label:
          kpiStats.immutabilityCoverage >= 80
            ? "Above 80% target"
            : "Below 80% target",
      },
    },
  ];

  const onRunPostureCheck = () => {
    setPostureRunning(true);
    setTimeout(() => {
      rerunPosture();
      setPostureRunning(false);
      toast.success("Posture check complete", {
        description: `All 5 controls re-evaluated across ${kpiStats.activeTenantCount} tenants.`,
      });
    }, 1_400);
  };

  const selectedCell = selected
    ? cells.find(
        (c) => c.tenantId === selected.tenantId && c.controlId === selected.controlId,
      ) ?? null
    : null;
  const selectedTenant = selected
    ? tenants.find((t) => t.id === selected.tenantId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
        <div className="flex items-center gap-5">
          <SecurityScoreGauge
            score={stats.score}
            lastAssessmentLabel={`Last assessment: ${formatStaticDate(schedule[0]?.lastRunAt)}`}
          />
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Compliance & Isolation
            </span>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-text-primary">
              Security & Isolation
            </h1>
            <p className="text-[12.5px] text-text-secondary">
              Continuous compliance verification across {tenants.length} tenants
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRunPostureCheck}
            disabled={postureRunning}
            className="gap-2"
          >
            {postureRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Run Posture Check
          </Button>
          <Button
            variant="ghost"
            onClick={() => setScheduleOpen(true)}
            className="gap-2 text-text-secondary"
          >
            <SettingsIcon className="h-4 w-4" />
            Schedule Settings
          </Button>
          <Button
            onClick={() => setAttestationOpen(true)}
            className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            <FileDown className="h-4 w-4" />
            Export Attestation Report
          </Button>
        </div>
      </header>

      {stats.failures + stats.warnings > 0 ? (
        <CriticalBanner
          failures={stats.failures}
          warnings={stats.warnings}
          onFilterFailures={() => {
            setMatrixViewKey((k) => k + 1);
            toast("Filtered to failures", { description: "Matrix scoped to failing rows." });
          }}
        />
      ) : null}

      <SecurityKpiRow kpis={kpis} />

      <AssessmentBar schedule={schedule} onOpenSchedule={() => setScheduleOpen(true)} />

      <IsolationMatrix
        key={matrixViewKey}
        tenants={tenants}
        cells={cells}
        onCellClick={(tenantId, controlId) => setSelected({ tenantId, controlId })}
        selectedKey={selected ? `${selected.tenantId}:${selected.controlId}` : undefined}
      />

      <ThreatDetectionsTable />

      <AccessPanels />

      <ComplianceStrip />

      <CellDrillSheet
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
        tenant={selectedTenant}
        cell={selectedCell}
      />

      <ScheduleSheet open={scheduleOpen} onOpenChange={setScheduleOpen} />
      <AttestationExportDialog open={attestationOpen} onOpenChange={setAttestationOpen} />
    </div>
  );
}

function formatStaticDate(iso?: string) {
  if (!iso) return "—";
  // Use a stable formatted string to avoid hydration-time differences.
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}
