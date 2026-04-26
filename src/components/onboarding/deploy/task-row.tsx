"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProvisioningTaskState } from "@/types";

interface TaskRowProps {
  index: number;
  task: ProvisioningTaskState;
  substeps: string[];
}

const formatTimer = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${seconds}s`;
};

export function TaskRow({ index, task, substeps }: TaskRowProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (task.status === "running" || task.status === "rolling-back") {
      const id = setInterval(() => setNow(Date.now()), 250);
      return () => clearInterval(id);
    }
  }, [task.status]);

  const elapsed = task.startedAt
    ? task.endedAt
      ? task.durationMs ?? 0
      : now - task.startedAt
    : 0;

  const substep = substeps[Math.min(task.substepIndex, substeps.length - 1)];

  return (
    <li
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4",
        task.status === "running" && "border-brand-primary/40 bg-brand-primary-subtle/40",
        task.status === "complete" && "border-status-success/30 bg-status-success-subtle/40",
        task.status === "failed" && "border-status-critical/40 bg-status-critical-subtle",
        task.status === "rolling-back" && "border-status-warning/40 bg-status-warning-subtle",
        task.status === "rolled-back" && "border-text-tertiary/30 bg-canvas",
        task.status === "pending" && "border-border-subtle bg-surface",
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
        {task.status === "pending" ? (
          <span className="block h-5 w-5 rounded-full border-2 border-border-default" />
        ) : task.status === "running" ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
        ) : task.status === "complete" ? (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            <CheckCircle2 className="h-5 w-5 text-status-success" />
          </motion.span>
        ) : task.status === "failed" ? (
          <X className="h-5 w-5 text-status-critical" />
        ) : task.status === "rolling-back" ? (
          <RotateCcw className="h-5 w-5 animate-spin text-status-warning" />
        ) : (
          <RotateCcw className="h-5 w-5 text-text-tertiary" />
        )}
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-medium text-text-primary">
            <span className="mr-2 text-text-tertiary tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            {task.title}
          </span>
          <span
            className={cn(
              "text-[12px] tabular-nums",
              task.status === "complete"
                ? "text-status-success"
                : task.status === "failed"
                  ? "text-status-critical"
                  : task.status === "running" || task.status === "rolling-back"
                    ? "text-text-secondary"
                    : "text-text-tertiary",
            )}
          >
            {task.startedAt ? formatTimer(elapsed) : "—"}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={substep + task.status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-[12.5px]",
              task.status === "failed"
                ? "text-status-critical"
                : task.warning
                  ? "text-status-warning"
                  : "text-text-secondary",
            )}
          >
            {task.warning ? (
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {task.warning}
              </span>
            ) : task.errorMessage ? (
              task.errorMessage
            ) : task.status === "rolling-back" ? (
              `Rolling back: ${substep ?? task.title}`
            ) : task.status === "rolled-back" ? (
              "Rolled back"
            ) : task.status === "pending" ? (
              "Waiting on dependencies…"
            ) : (
              substep
            )}
          </motion.span>
        </AnimatePresence>
      </div>
    </li>
  );
}
