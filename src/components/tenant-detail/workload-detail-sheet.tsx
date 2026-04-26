"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkloadIcon, WORKLOAD_LABEL } from "./workload-icon";
import { useConsoleStore } from "@/lib/store";
import { mockData } from "@/lib/mock-data";
import { formatBytes, formatRelativeTime, formatDuration } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Tenant, Workload } from "@/types";

interface WorkloadDetailSheetProps {
  tenant: Tenant;
  workload: Workload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_DOT: Record<Workload["status"], string> = {
  Healthy: "text-status-success",
  Warning: "text-status-warning",
  Failed: "text-status-critical",
  Unprotected: "text-text-tertiary",
};

export function WorkloadDetailSheet({
  tenant,
  workload,
  open,
  onOpenChange,
}: WorkloadDetailSheetProps) {
  const restorePoints = useConsoleStore((s) =>
    workload ? (s.restorePoints[tenant.id] ?? []).filter((rp) => rp.workloadId === workload.id) : [],
  );
  const jobs = useConsoleStore((s) =>
    workload ? (s.jobs[tenant.id] ?? []).filter((j) => j.workloadId === workload.id).slice(0, 30) : [],
  );
  const policy = mockData.policies.find((p) => p.id === workload?.policyId);
  const policyAssignment = useConsoleStore((s) =>
    workload ? s.policyAssignments[tenant.id] : undefined,
  );

  const [tab, setTab] = useState("restore");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        {workload ? (
          <>
            <SheetHeader className="border-b border-border-subtle p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas">
                    <WorkloadIcon
                      type={workload.type}
                      className="h-4 w-4 text-text-secondary"
                    />
                  </span>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="outline"
                      className="w-fit border-transparent bg-secondary text-[11px] uppercase tracking-wide text-text-secondary"
                    >
                      {WORKLOAD_LABEL[workload.type]}
                    </Badge>
                    <SheetTitle className="text-[15px] font-semibold text-text-primary">
                      {workload.name}
                    </SheetTitle>
                    <SheetDescription className="text-[12px] text-text-tertiary">
                      {workload.host}
                    </SheetDescription>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-secondary hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </SheetHeader>

            <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col">
              <TabsList className="mx-6 mt-3 bg-canvas">
                <TabsTrigger value="restore">Restore Points</TabsTrigger>
                <TabsTrigger value="history">Backup History</TabsTrigger>
                <TabsTrigger value="policy">Policy</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
              </TabsList>

              <TabsContent value="restore" className="overflow-y-auto p-6 pt-3">
                <ul className="flex flex-col">
                  {restorePoints.slice(0, 30).map((rp) => (
                    <li
                      key={rp.id}
                      className="flex items-center justify-between border-b border-border-subtle py-2 text-[12.5px] last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {rp.immutable ? (
                          <Lock className="h-3.5 w-3.5 text-brand-primary" />
                        ) : (
                          <span className="h-3.5 w-3.5" />
                        )}
                        <span className="tabular-nums text-text-primary" suppressHydrationWarning>
                          {format(parseISO(rp.capturedAt), "MMM d, HH:mm")}
                        </span>
                        <span className="text-text-tertiary tabular-nums">
                          {formatBytes(rp.sizeBytes)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-brand-primary-hover"
                        onClick={() =>
                          toast(`Restore from ${format(parseISO(rp.capturedAt), "MMM d, HH:mm")}`, {
                            description: "Restore wizard launches in Phase 1 polish.",
                          })
                        }
                      >
                        Restore
                      </Button>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="history" className="overflow-y-auto p-6 pt-3">
                <ul className="flex flex-col">
                  {jobs.length === 0 ? (
                    <li className="py-8 text-center text-[12.5px] text-text-tertiary">
                      No history yet for this workload.
                    </li>
                  ) : (
                    jobs.map((j) => (
                      <li
                        key={j.id}
                        className="flex items-center justify-between border-b border-border-subtle py-2 text-[12.5px] last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-text-primary tabular-nums" suppressHydrationWarning>
                            {format(parseISO(j.startedAt), "MMM d, HH:mm")}
                          </span>
                          <span className="text-[11px] text-text-tertiary">
                            {j.jobType} ·{" "}
                            {j.durationSec > 0
                              ? formatDuration(j.durationSec)
                              : "—"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-transparent text-[10px] uppercase",
                              j.status === "succeeded"
                                ? "bg-status-success-subtle text-status-success"
                                : j.status === "failed"
                                  ? "bg-status-critical-subtle text-status-critical"
                                  : "bg-secondary text-text-secondary",
                            )}
                          >
                            {j.status}
                          </Badge>
                          {j.status === "failed" && j.errorMessage ? (
                            <span className="text-[11px] text-status-critical">
                              {j.errorMessage}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </TabsContent>

              <TabsContent value="policy" className="overflow-y-auto p-6 pt-3">
                <div className="rounded-md border border-border-subtle bg-canvas p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                    Applied Policy
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-text-primary">
                    {policy?.name} v{workload.policyVersion}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
                  <PolicyKV label="RPO" value="1 hour" />
                  <PolicyKV label="RTO" value="4 hours" />
                  <PolicyKV label="Retention" value="7 years" />
                  <PolicyKV label="Encryption" value="AES-256-GCM" />
                  <PolicyKV label="Immutability" value="90-day lock" />
                  <PolicyKV label="Air-gap" value="Logical (Envoy)" />
                </div>
                {policyAssignment && policyAssignment.overrides.length > 0 ? (
                  <>
                    <Separator className="my-4" />
                    <div className="rounded-md border border-status-warning/30 bg-status-warning-subtle p-3 text-[12.5px] text-text-primary">
                      <div className="font-semibold text-status-warning">
                        Override active
                      </div>
                      <div className="mt-1">
                        {policyAssignment.overrides[0].field}:{" "}
                        {policyAssignment.overrides[0].templateValue} →{" "}
                        {policyAssignment.overrides[0].overrideValue}
                      </div>
                    </div>
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="health" className="overflow-y-auto p-6 pt-3">
                <ul className="flex flex-col gap-3 text-[12.5px]">
                  <HealthRow
                    icon={
                      workload.connectivity === "online" ? (
                        <Wifi className="h-3.5 w-3.5 text-status-success" />
                      ) : (
                        <WifiOff className="h-3.5 w-3.5 text-status-critical" />
                      )
                    }
                    label="Connectivity"
                    value={workload.connectivity}
                  />
                  <HealthRow
                    icon={<ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />}
                    label="Agent version"
                    value={workload.agentVersion}
                  />
                  <HealthRow
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-status-info" />}
                    label="Last check-in"
                    value={
                      <span suppressHydrationWarning>
                        {formatRelativeTime(workload.lastCheckinAt)}
                      </span>
                    }
                  />
                  <HealthRow
                    icon={
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          workload.status === "Healthy"
                            ? "bg-status-success"
                            : workload.status === "Warning"
                              ? "bg-status-warning"
                              : workload.status === "Failed"
                                ? "bg-status-critical"
                                : "bg-text-tertiary",
                        )}
                      />
                    }
                    label="Status"
                    value={
                      <span className={STATUS_DOT[workload.status]}>{workload.status}</span>
                    }
                  />
                </ul>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PolicyKV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 text-text-primary">{value}</div>
    </div>
  );
}

function HealthRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between rounded-md border border-border-subtle bg-canvas px-3 py-2">
      <span className="flex items-center gap-2 text-text-secondary">
        {icon}
        {label}
      </span>
      <span className="text-text-primary">{value}</span>
    </li>
  );
}
