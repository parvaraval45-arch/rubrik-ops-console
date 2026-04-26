"use client";

import { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type {
  KeyRotationStatus,
  Tenant,
  ThreatEvent,
  ThreatEventStatus,
} from "@/types";

interface SecurityTabProps {
  tenant: Tenant;
  threats: ThreatEvent[];
  keyRotation: KeyRotationStatus;
}

interface ControlSpec {
  id: string;
  name: string;
  description: string;
  evidence: string;
  remediation: string;
  status: "PASS" | "WARN" | "FAIL";
}

const CONTROLS: ControlSpec[] = [
  {
    id: "network",
    name: "Network Isolation",
    description: "Tenant traffic must not be reachable from outside its namespace.",
    evidence: "Envoy proxy active, no inbound exposure. Last verified by automated probe.",
    remediation: "Audit ingress rules and confirm no public-facing service annotations.",
    status: "PASS",
  },
  {
    id: "storage",
    name: "Storage Isolation",
    description: "Backups land on a tenant-scoped storage pool with dedicated keys.",
    evidence: "Dedicated repository pool, tenant-scoped encryption keys.",
    remediation: "Move shared volumes onto tenant-specific repository.",
    status: "PASS",
  },
  {
    id: "iam",
    name: "IAM Isolation",
    description: "No principal can act across tenants without explicit elevation.",
    evidence: "RBAC enforced, no cross-tenant role bleed in last sweep.",
    remediation: "Remove cross-tenant role bindings and rotate svc accounts.",
    status: "PASS",
  },
  {
    id: "key",
    name: "Encryption Key Isolation",
    description: "Tenant data is encrypted with a key never used by any other tenant.",
    evidence: "Tenant-specific AES-256 key stored in HSM partition.",
    remediation: "Mint a new key, re-encrypt at rest, decommission shared key.",
    status: "PASS",
  },
  {
    id: "namespace",
    name: "Namespace Isolation",
    description: "Tenant resources live in a fully scoped logical namespace.",
    evidence: "Namespace fully scoped. No shared resources detected.",
    remediation: "Migrate orphan resources into the tenant namespace.",
    status: "PASS",
  },
];

const THREAT_BADGE: Record<ThreatEventStatus, string> = {
  Investigating: "bg-status-warning-subtle text-status-warning",
  Contained: "bg-status-info-subtle text-status-info",
  Resolved: "bg-status-success-subtle text-status-success",
  "False Positive": "bg-secondary text-text-secondary",
};

export function SecurityTab({ tenant, threats, keyRotation }: SecurityTabProps) {
  const rotateTenantKey = useConsoleStore((s) => s.rotateTenantKey);
  const [activeControl, setActiveControl] = useState<ControlSpec | null>(null);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [rerunProgress, setRerunProgress] = useState(0);
  const [lastAssessmentAt, setLastAssessmentAt] = useState<string>(
    keyRotation.lastRotationAt,
  );

  const onRerunPosture = () => {
    setRerunning(true);
    setRerunProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 12;
      setRerunProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setRerunning(false);
        setLastAssessmentAt(new Date().toISOString());
        toast.success("Posture check complete", {
          description: "All controls remain compliant.",
        });
      }
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Isolation Posture"
        subtitle={
          <span suppressHydrationWarning>
            Last assessment {formatRelativeTime(lastAssessmentAt)}
          </span>
        }
        action={
          <Button
            variant="outline"
            className="gap-2 border-border-default"
            onClick={onRerunPosture}
            disabled={rerunning}
          >
            <RefreshCw className={cn("h-4 w-4", rerunning && "animate-spin")} />
            {rerunning ? `Running… ${rerunProgress}%` : "Re-run Posture Check"}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CONTROLS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveControl(c)}
              className="flex flex-col items-start gap-1.5 rounded-md border border-border-subtle bg-canvas p-3 text-left transition-shadow hover:shadow-md"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-status-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {c.status}
              </span>
              <span className="text-[13px] font-semibold text-text-primary">{c.name}</span>
              <span className="text-[11.5px] text-text-secondary">{c.evidence}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Encryption Status">
          <ul className="flex flex-col gap-2 text-[12.5px]">
            <KV label="Algorithm" value={keyRotation.algorithm} />
            <KV label="Key Source" value={keyRotation.keySource + " (tenant-specific)"} />
            <KV label="Rotation Schedule" value={`Every ${keyRotation.rotationDays} days`} />
            <KV
              label="Last Rotation"
              value={
                <span suppressHydrationWarning>
                  {formatRelativeTime(keyRotation.lastRotationAt)}
                </span>
              }
            />
            <KV
              label="Next Rotation"
              value={
                <span suppressHydrationWarning>
                  {formatRelativeTime(keyRotation.nextRotationAt)}
                </span>
              }
            />
          </ul>
          <Button
            className="mt-4 w-full gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => setRotateOpen(true)}
          >
            <KeyRound className="h-4 w-4" />
            Rotate Key Now
          </Button>
        </Panel>

        <Panel title="Immutability Status">
          <ul className="flex flex-col gap-2 text-[12.5px]">
            <KV label="Lock Type" value="Compliance Lock (HIPAA)" />
            <KV label="Lock Duration" value="90 days" />
            <KV label="Locked Restore Points" value="12,847" />
            <KV label="Earliest Unlocked" value="in 12 days" />
          </ul>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-status-warning/30 bg-status-warning-subtle px-3 py-2 text-[12px] text-status-warning">
            <Lock className="h-3.5 w-3.5" />
            Quorum approval (3 of 5 admins) required to modify.
          </div>
        </Panel>

        <Panel title="Recent Threat Activity" subtitle="Last 7 days">
          <ul className="flex flex-col">
            {threats.length === 0 ? (
              <li className="py-6 text-center text-[12.5px] text-text-tertiary">
                No threats observed in the last 7 days.
              </li>
            ) : (
              threats.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col gap-0.5 border-b border-border-subtle py-2.5 text-[12.5px] last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-text-primary">{t.detectionType}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent text-[10px] uppercase",
                        THREAT_BADGE[t.status],
                      )}
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <span className="text-text-tertiary tabular-nums" suppressHydrationWarning>
                    {formatRelativeTime(t.detectedAt)} · {t.analyst}
                  </span>
                  <span className="text-text-secondary">{t.detail}</span>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      <Sheet
        open={activeControl !== null}
        onOpenChange={(o) => {
          if (!o) setActiveControl(null);
        }}
      >
        <SheetContent className="w-full p-0 sm:max-w-[460px]">
          {activeControl ? (
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-border-subtle p-6">
                <Badge
                  variant="outline"
                  className="w-fit border-transparent bg-status-success-subtle text-[11px] uppercase text-status-success"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {activeControl.status}
                </Badge>
                <SheetTitle className="mt-2 text-[15px] font-semibold">
                  {activeControl.name}
                </SheetTitle>
                <SheetDescription className="text-[12.5px] text-text-secondary">
                  {activeControl.description}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 overflow-y-auto p-6 text-[12.5px]">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Evidence
                  </div>
                  <div className="mt-1 rounded-md border border-border-subtle bg-canvas p-3 text-text-primary">
                    {activeControl.evidence}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Last verified
                  </div>
                  <div className="mt-1 text-text-primary tabular-nums" suppressHydrationWarning>
                    {formatRelativeTime(lastAssessmentAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Remediation playbook
                  </div>
                  <div className="mt-1 rounded-md border border-status-warning/30 bg-status-warning-subtle p-3 text-text-primary">
                    {activeControl.remediation}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={rotateOpen} onOpenChange={setRotateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate tenant encryption key?</AlertDialogTitle>
            <AlertDialogDescription>
              A new AES-256 key will be generated in the HSM and existing
              backups will be re-keyed in the background. Older keys remain
              available for restore until the rotation grace window expires.
              This action is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setRotateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-status-critical text-white hover:bg-status-critical/90"
              onClick={() => {
                rotateTenantKey(tenant.id, currentOperator.name);
                toast.success("Key rotated", {
                  description: "New key minted in HSM. Re-keying backups in background.",
                });
                setRotateOpen(false);
              }}
            >
              Rotate Key
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border-subtle pb-2 last:border-0 last:pb-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-right text-text-primary tabular-nums">{value}</span>
    </li>
  );
}
