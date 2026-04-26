"use client";

import { format, parseISO } from "date-fns";
import { Download, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConsoleStore } from "@/lib/store";
import { currentOperator } from "@/lib/mock-data";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatRelativeTime,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { JobLogLevel, JobSession, Tenant } from "@/types";

interface JobDetailSheetProps {
  tenant: Tenant;
  job: JobSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_PILL: Record<JobSession["status"], string> = {
  succeeded: "bg-status-success-subtle text-status-success",
  failed: "bg-status-critical-subtle text-status-critical",
  running: "bg-status-info-subtle text-status-info",
  queued: "bg-secondary text-text-secondary",
  skipped: "bg-secondary text-text-secondary",
};

const LOG_TONE: Record<JobLogLevel, string> = {
  INFO: "text-text-secondary",
  WARN: "text-status-warning",
  ERROR: "text-status-critical",
};

export function JobDetailSheet({
  tenant,
  job,
  open,
  onOpenChange,
}: JobDetailSheetProps) {
  const retryJob = useConsoleStore((s) => s.retryJob);

  const onRetry = () => {
    if (!job) return;
    retryJob(tenant.id, job.id, currentOperator.name);
    toast.success(`Retry queued: ${job.workloadName}`, {
      description: "Original failed job preserved in history.",
    });
    onOpenChange(false);
  };

  const onExportLog = () => {
    if (!job) return;
    toast.success("Log exported", {
      description: `Saved as job-${job.id}.log`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-[600px]">
        {job ? (
          <>
            <SheetHeader className="border-b border-border-subtle p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit border-transparent text-[10px] uppercase",
                      STATUS_PILL[job.status],
                    )}
                  >
                    {job.status}
                  </Badge>
                  <SheetTitle className="text-[15px] font-semibold text-text-primary">
                    {job.workloadName}
                  </SheetTitle>
                  <SheetDescription className="text-[12px] text-text-tertiary">
                    {job.jobType} ·{" "}
                    <span className="tabular-nums" suppressHydrationWarning>
                      started {formatRelativeTime(job.startedAt)}
                    </span>
                    {job.endedAt ? (
                      <>
                        {" · "}
                        <span className="tabular-nums" suppressHydrationWarning>
                          ended {formatRelativeTime(job.endedAt)}
                        </span>
                      </>
                    ) : null}
                  </SheetDescription>
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

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Job Statistics
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                  <Stat label="Source size" value={formatBytes(job.bytesSource)} />
                  <Stat label="Transferred" value={formatBytes(job.bytesTransferred)} />
                  <Stat label="Duration" value={job.durationSec > 0 ? formatDuration(job.durationSec) : "—"} />
                  <Stat label="Throughput" value={`${formatNumber(job.throughputMBps)} MB/s`} />
                  <Stat label="Dedup ratio" value={`${job.dedupRatio.toFixed(1)}x`} />
                  <Stat label="Compression" value={`${job.compressionRatio.toFixed(1)}x`} />
                </div>
              </section>

              <Separator />

              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Job Log
                </h3>
                <div className="rounded-md border border-border-subtle bg-canvas p-3 font-mono text-[11.5px] leading-relaxed">
                  {job.log.length === 0 ? (
                    <span className="text-text-tertiary">No log entries yet.</span>
                  ) : (
                    job.log.map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="shrink-0 text-text-tertiary tabular-nums" suppressHydrationWarning>
                          [{format(parseISO(line.ts), "yyyy-MM-dd HH:mm:ss")}]
                        </span>
                        <span className={cn("shrink-0 font-semibold", LOG_TONE[line.level])}>
                          {line.level.padEnd(5)}
                        </span>
                        <span className="break-words text-text-primary">{line.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border-subtle p-4">
              <Button
                variant="ghost"
                onClick={() =>
                  toast("Marked as false positive", {
                    description: "Move alarm to closed without remediation.",
                  })
                }
              >
                Mark False Positive
              </Button>
              <Button variant="outline" className="gap-2" onClick={onExportLog}>
                <Download className="h-4 w-4" />
                Export Log
              </Button>
              {job.status === "failed" ? (
                <Button
                  onClick={onRetry}
                  className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Job
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    toast("Investigating", {
                      description: "Open job details in observability.",
                    })
                  }
                >
                  <Search className="h-4 w-4" />
                  Investigate
                </Button>
              )}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-0.5 text-text-primary tabular-nums">{value}</div>
    </div>
  );
}
