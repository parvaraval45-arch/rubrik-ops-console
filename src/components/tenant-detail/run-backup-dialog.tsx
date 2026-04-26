"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import { formatDuration } from "@/lib/formatters";
import type { JobLogLine, Tenant, Workload } from "@/types";

interface RunBackupDialogProps {
  tenant: Tenant;
  workloads: Workload[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultWorkloadId?: string;
}

const PROGRESS_STEPS = [
  { progress: 15, message: "Connecting to source via Envoy proxy" },
  { progress: 45, message: "Snapshot taken, reading changed blocks" },
  { progress: 78, message: "Transferring deduped + compressed payload" },
  { progress: 92, message: "Verifying integrity (SHA-256)" },
];

export function RunBackupDialog({
  tenant,
  workloads,
  open,
  onOpenChange,
  defaultWorkloadId,
}: RunBackupDialogProps) {
  const enqueueBackup = useConsoleStore((s) => s.enqueueBackup);
  const updateJobProgress = useConsoleStore((s) => s.updateJobProgress);
  const completeJob = useConsoleStore((s) => s.completeJob);
  const [workloadIdState, setWorkloadId] = useState<string | undefined>(undefined);
  const workloadId = workloadIdState ?? defaultWorkloadId ?? workloads[0]?.id ?? "";

  const tenantSuspended = tenant.status === "Suspended";

  const onConfirm = () => {
    if (!workloadId) return;
    if (tenantSuspended) {
      toast.error("Cannot run backup: tenant suspended.");
      return;
    }
    const workload = workloads.find((w) => w.id === workloadId);
    if (!workload) return;
    onOpenChange(false);
    const jobId = enqueueBackup(tenant.id, workloadId, currentOperator.name);
    const tid = toast.loading(`Backup queued: ${workload.name}`, {
      description: "Job will start within a few seconds…",
    });
    let cancelled = false;
    const willFail = Math.random() < 0.05;

    setTimeout(() => {
      if (cancelled) return;
      updateJobProgress(tenant.id, jobId, 5);
    }, 500);

    PROGRESS_STEPS.forEach((step, i) => {
      setTimeout(
        () => {
          if (cancelled) return;
          updateJobProgress(tenant.id, jobId, step.progress);
          toast.loading(`Running: ${workload.name}`, {
            id: tid,
            description: `${step.message} · ${step.progress}%`,
          });
        },
        1500 + i * 1100,
      );
    });

    setTimeout(
      () => {
        if (cancelled) return;
        const log: JobLogLine[] = [
          { ts: new Date().toISOString(), level: "INFO", message: `Starting on-demand backup of ${workload.name}` },
          { ts: new Date().toISOString(), level: "INFO", message: "Connecting to source via Envoy proxy" },
          { ts: new Date().toISOString(), level: "INFO", message: "Snapshot created" },
          { ts: new Date().toISOString(), level: "INFO", message: "Reading changed blocks (CBT enabled)" },
          { ts: new Date().toISOString(), level: "INFO", message: "Transferred 1.2 TB compressed (3.1 TB raw)" },
          { ts: new Date().toISOString(), level: "INFO", message: "Verifying integrity (SHA-256)" },
          willFail
            ? {
                ts: new Date().toISOString(),
                level: "ERROR",
                message: "Repository connection timeout: rsc-repo-east-04",
              }
            : {
                ts: new Date().toISOString(),
                level: "INFO",
                message: "Backup completed successfully via rsc-repo-east-05",
              },
        ];
        const finalStatus = willFail ? "failed" : "succeeded";
        completeJob(
          tenant.id,
          jobId,
          finalStatus,
          log,
          willFail ? "Repository connection timeout" : undefined,
        );
        if (willFail) {
          toast.error(`Backup failed: ${workload.name}`, {
            id: tid,
            description: "See alarm for details. Retry from Backups tab.",
          });
        } else {
          const seconds = 6 + Math.round(Math.random() * 14);
          toast.success(`Backup complete: ${workload.name}`, {
            id: tid,
            description: `${formatDuration(seconds * 60)} · ${workload.sizeTB.toFixed(1)} TB protected`,
          });
        }
      },
      1500 + PROGRESS_STEPS.length * 1100 + 800,
    );

    return () => {
      cancelled = true;
    };
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Run on-demand backup</AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed text-text-secondary">
            This will queue an immediate backup using available repository
            capacity. Scheduled jobs continue normally.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Label htmlFor="run-backup-target" className="text-[12px] font-medium text-text-primary">
            Workload
          </Label>
          <Select value={workloadId} onValueChange={setWorkloadId}>
            <SelectTrigger id="run-backup-target">
              <SelectValue placeholder="Choose a workload" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {workloads.slice(0, 30).map((wl) => (
                <SelectItem key={wl.id} value={wl.id}>
                  <span className="font-medium">{wl.name}</span>{" "}
                  <span className="text-text-tertiary">· {wl.type}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tenantSuspended ? (
            <div className="rounded-md border border-status-warning/40 bg-status-warning-subtle px-3 py-2 text-[12px] text-status-warning">
              Tenant is suspended. Resume the tenant before running backups.
            </div>
          ) : null}
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!workloadId || tenantSuspended}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Run Backup
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
