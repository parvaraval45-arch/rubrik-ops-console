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

  const kpis: SecurityKpi[] = [
    {
      label: "Isolation Violations",
      value: stats.failures.toString(),
      valueTone: stats.failures > 0 ? "critical" : "success",
      subtitle: stats.failures > 0 ? "Should be 0" : "All clear",
      trend:
        stats.failures > 0
          ? { direction: "up", tone: "negative", label: "+3 vs last assessment" }
          : { direction: "down", tone: "positive", label: "All controls passing" },
      onClick: () => setMatrixViewKey((k) => k + 1),
    },
    {
      label: "Anomalies Detected (24h)",
      value: "3",
      valueTone: "default",
      subtitle: "Active threats under investigation",
      trend: { direction: "neutral", tone: "neutral", label: "2 contained, 1 resolved" },
    },
    {
      label: "MFA Enforced",
      value: "43 / 56",
      valueTone: "warning",
      subtitle: "Tenants with mandatory MFA",
      trend: { direction: "neutral", tone: "neutral", label: "13 on optional — review at QBR" },
    },
    {
      label: "Encryption Coverage",
      value: "94%",
      valueTone: "success",
      subtitle: "of all workloads",
      progress: 94,
      trend: { direction: "up", tone: "positive", label: "+2% vs last quarter" },
    },
    {
      label: "Immutability Coverage",
      value: "71%",
      valueTone: "warning",
      subtitle: "of all backups",
      progress: 71,
      trend: { direction: "neutral", tone: "neutral", label: "Below 80% target" },
    },
  ];

  const onRunPostureCheck = () => {
    setPostureRunning(true);
    setTimeout(() => {
      rerunPosture();
      setPostureRunning(false);
      toast.success("Posture check complete", {
        description: "All 5 controls re-evaluated across 62 tenants.",
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
