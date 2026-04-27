"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, Building2, Cpu, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useConsoleStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/formatters";
import { currentOperator } from "@/lib/mock-data";
import type { Alert, Tenant } from "@/types";
import { cn } from "@/lib/utils";

interface AlertDetailSheetProps {
  alert: Alert | null;
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEVERITY_BADGE: Record<Alert["severity"], string> = {
  critical: "bg-status-critical-subtle text-status-critical",
  warning: "bg-status-warning-subtle text-status-warning",
  info: "bg-status-info-subtle text-status-info",
};

const RECOMMENDATIONS: Record<Alert["category"], string> = {
  "Backup Failure":
    "Re-run the failed snapshot manually, then verify storage target reachability and credentials. Escalate if the next scheduled run also fails.",
  "Policy Drift":
    "Compare with baseline version on /policies, then either re-apply the baseline or promote the drift to a new policy version with sign-off.",
  Capacity:
    "Approve a tier upgrade, raise the commit, or archive cold workloads to keep the tenant under commitment.",
  Threat:
    "Engage the recovery isolation runbook on /security. Quarantine affected workloads and notify the tenant security contact.",
  Configuration:
    "Apply the recommended configuration via the policy versioning flow. Confirm with the tenant before promoting in production.",
  Compliance:
    "Generate the latest attestation report from /security and schedule the audit replay before the deadline.",
};

const WORKLOAD_HINTS = [
  "vmware/finance-app",
  "k8s/payments-service",
  "mssql/sql-prod-01",
  "m365/exchange-tenant",
];

export function AlertDetailSheet({
  alert,
  tenant,
  open,
  onOpenChange,
}: AlertDetailSheetProps) {
  const acknowledgeAlert = useConsoleStore((s) => s.acknowledgeAlert);

  const onAcknowledge = () => {
    if (!alert) return;
    acknowledgeAlert(alert.id, currentOperator.name);
    toast.success("Alert acknowledged", {
      description: `${alert.title} · acked by ${currentOperator.name}`,
    });
    onOpenChange(false);
  };

  const onDismiss = () => {
    if (!alert) return;
    toast("Alert dismissed", {
      description: "It will reappear if the underlying condition recurs.",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-[480px] overflow-y-auto p-0 sm:max-w-[480px]">
        {alert ? (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border-subtle p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit border-transparent text-[11px] font-semibold uppercase tracking-wide",
                      SEVERITY_BADGE[alert.severity],
                    )}
                  >
                    {alert.severity}
                  </Badge>
                  <SheetTitle className="text-[16px] font-semibold leading-snug text-text-primary">
                    {alert.title}
                  </SheetTitle>
                  <SheetDescription className="text-[13px] text-text-secondary">
                    {alert.description}
                  </SheetDescription>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-secondary hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 p-6">
              <DetailRow
                icon={Building2}
                label="Tenant"
                value={
                  tenant ? (
                    <Link
                      href={`/tenants/${tenant.id}`}
                      onClick={() => onOpenChange(false)}
                      className="text-text-primary underline-offset-2 hover:text-brand-primary-hover hover:underline"
                    >
                      {tenant.name}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow icon={ShieldAlert} label="Detection type" value={alert.category} />
              <DetailRow
                icon={Activity}
                label="Detected"
                value={formatRelativeTime(alert.createdAt)}
                hydrationSafe={false}
              />
              <DetailRow
                icon={Cpu}
                label="Affected workloads"
                value={WORKLOAD_HINTS.slice(0, 2).join(", ")}
              />

              <Separator />

              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Recommended action
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {RECOMMENDATIONS[alert.category]}
                </p>
              </div>

              {alert.acknowledgedBy ? (
                <div className="rounded-md bg-canvas px-3 py-2 text-[12px] text-text-secondary">
                  Acknowledged by{" "}
                  <span className="font-medium text-text-primary">
                    {alert.acknowledgedBy}
                  </span>{" "}
                  ·{" "}
                  {alert.acknowledgedAt
                    ? formatRelativeTime(alert.acknowledgedAt)
                    : "moments ago"}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border-subtle p-4">
              <Button variant="ghost" onClick={onDismiss} className="text-text-secondary">
                Dismiss
              </Button>
              <Button
                onClick={onAcknowledge}
                disabled={alert.status === "acknowledged"}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                {alert.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  hydrationSafe = true,
}: {
  icon: typeof Building2;
  label: string;
  value: ReactNode;
  hydrationSafe?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-canvas text-text-tertiary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          {label}
        </span>
        <span
          className="text-[13px] text-text-primary"
          suppressHydrationWarning={!hydrationSafe}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
